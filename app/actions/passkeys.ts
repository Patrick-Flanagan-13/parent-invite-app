'use server'

import { prisma } from '@/lib/db'
import { getSession, loginUser } from '@/lib/auth'
import {
    getRegistrationOptions,
    verifyRegistration,
    getAuthenticationOptions,
    verifyAuthentication
} from '@/lib/passkeys'
import { cookies } from 'next/headers'

// Store challenges temporarily in cookies or DB. Cookies are easier for stateless.
// For security, these should be signed/encrypted, but for this demo we'll use a simple cookie.

export async function generateRegistrationOptionsAction() {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { authenticators: true }
    })

    if (!user) throw new Error('User not found')

    const options = await getRegistrationOptions(user.username, user.authenticators)

    // Store challenge in cookie
    const cookieStore = await cookies()
    cookieStore.set('reg-challenge', options.challenge, { httpOnly: true, secure: true, maxAge: 60 * 5 }) // 5 mins

    return options
}

export async function verifyRegistrationAction(response: any) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const cookieStore = await cookies()
    const expectedChallenge = cookieStore.get('reg-challenge')?.value

    if (!expectedChallenge) throw new Error('Challenge expired')

    const verification = await verifyRegistration(response, expectedChallenge)

    if (verification.verified && verification.registrationInfo) {
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

        await prisma.authenticator.create({
            data: {
                userId: session.user.id,
                credentialID: credential.id,
                credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
                counter: credential.counter,
                credentialDeviceType,
                credentialBackedUp,
                transports: response.response.transports ? JSON.stringify(response.response.transports) : null,
                providerAccountId: credential.id,
            }
        })

        cookieStore.delete('reg-challenge')
        return { success: true }
    }

    return { success: false }
}

export async function generateAuthenticationOptionsAction(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: { authenticators: true }
    })

    if (!user) throw new Error('User not found')

    const options = await getAuthenticationOptions(user.authenticators)

    const cookieStore = await cookies()
    cookieStore.set('auth-challenge', options.challenge, { httpOnly: true, secure: true, maxAge: 60 * 5 })
    cookieStore.set('auth-username', username, { httpOnly: true, secure: true, maxAge: 60 * 5 })

    return options
}

export async function verifyAuthenticationAction(response: any) {
    const cookieStore = await cookies()
    const expectedChallenge = cookieStore.get('auth-challenge')?.value
    const username = cookieStore.get('auth-username')?.value

    if (!expectedChallenge || !username) throw new Error('Challenge expired')

    const user = await prisma.user.findUnique({
        where: { username },
        include: { authenticators: true }
    })

    if (!user) throw new Error('User not found')

    const authenticator = user.authenticators.find(auth => auth.credentialID === response.id)

    if (!authenticator) throw new Error('Authenticator not found')

    const verification = await verifyAuthentication(response, expectedChallenge, authenticator)

    if (verification.verified && verification.authenticationInfo) {
        // Update counter
        await prisma.authenticator.update({
            where: { credentialID: authenticator.credentialID },
            data: {
                counter: verification.authenticationInfo.newCounter
            }
        })

        // Log the user in
        await loginUser(user)

        cookieStore.delete('auth-challenge')
        cookieStore.delete('auth-username')

        return { success: true }
    }

    return { success: false }
}
