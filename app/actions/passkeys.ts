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

    if (!user) return { error: 'User not found' }

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
        console.log('Registration Info:', JSON.stringify(verification.registrationInfo, null, 2))

        const { registrationInfo } = verification
        const info = registrationInfo as any
        const credentialID = info.credentialID || info.credential?.id
        const credentialPublicKey = info.credentialPublicKey || info.credential?.publicKey
        const counter = info.counter || info.credential?.counter
        const credentialDeviceType = info.credentialDeviceType
        const credentialBackedUp = info.credentialBackedUp

        if (!credentialID || !credentialPublicKey) {
            console.error('Missing credential data in registration info', registrationInfo)
            throw new Error('Registration failed: Missing credential data')
        }

        await prisma.authenticator.create({
            data: {
                userId: session.user.id,
                credentialID: credentialID,
                credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
                counter: counter || 0,
                credentialDeviceType,
                credentialBackedUp,
                transports: response.response.transports ? JSON.stringify(response.response.transports) : null,
                providerAccountId: credentialID,
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

    if (!user) return { error: 'User not found' }

    const options = await getAuthenticationOptions(user.authenticators)

    const cookieStore = await cookies()
    cookieStore.set('auth-challenge', options.challenge, { httpOnly: true, secure: true, maxAge: 60 * 5 })
    cookieStore.set('auth-username', username, { httpOnly: true, secure: true, maxAge: 60 * 5 })

    return options
}

export async function verifyAuthenticationAction(response: any) {
    console.log('verifyAuthenticationAction started', JSON.stringify(response, null, 2))
    const session = await getSession()
    // Allow login without session (obviously)

    const cookieStore = await cookies()
    const expectedChallenge = cookieStore.get('auth-challenge')?.value

    if (!expectedChallenge) {
        console.error('No authentication challenge found in cookies')
        throw new Error('Challenge expired')
    }

    if (!response.id) {
        console.error('Response missing id', response)
        throw new Error('Invalid response: missing id')
    }

    const authenticator = await prisma.authenticator.findUnique({
        where: { credentialID: response.id }
    })

    if (!authenticator) {
        console.warn('Authenticator not found for credentialID:', response.id)
        throw new Error('Authenticator not found. Please try registering again or use your password.')
    }

    console.log('Found authenticator:', JSON.stringify(authenticator, null, 2))

    try {
        const verification = await verifyAuthentication(response, expectedChallenge, authenticator)
        console.log('Verification result:', JSON.stringify(verification, null, 2))

        if (verification.verified) {
            const { authenticationInfo } = verification
            console.log('Authentication info:', JSON.stringify(authenticationInfo, null, 2))

            await prisma.authenticator.update({
                where: { credentialID: response.id },
                data: {
                    counter: authenticationInfo.newCounter,
                },
            })

            const user = await prisma.user.findUnique({
                where: { id: authenticator.userId },
            })

            if (user) {
                await loginUser(user)
                cookieStore.delete('auth-challenge')
                return { success: true }
            }
        }
    } catch (error) {
        console.error('Verification failed:', error)
        throw error
    }

    return { success: false }
}
