'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { encrypt, getSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sendConfirmationEmail } from '@/lib/email'


export async function createSlot(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const startTime = new Date(formData.get('startTime') as string)
    const endTime = new Date(formData.get('endTime') as string)
    const maxCapacity = parseInt(formData.get('maxCapacity') as string)

    await prisma.slot.create({
        data: {
            startTime,
            endTime,
            maxCapacity,
            createdById: session.user.id,
        },
    })

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deleteSlot(id: string) {
    await prisma.slot.delete({
        where: { id },
    })

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function signupForSlot(formData: FormData) {
    const slotId = formData.get('slotId') as string
    const parentName = formData.get('parentName') as string
    const email = formData.get('email') as string

    // Check capacity and get teacher info
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: {
            signups: true,
            createdBy: { select: { name: true, username: true } }
        },
    })

    if (!slot) throw new Error('Slot not found')
    if (slot.signups.length >= slot.maxCapacity) {
        throw new Error('Slot is full')
    }

    // Create signup
    const signup = await prisma.signup.create({
        data: {
            slotId,
            parentName,
            email,
        },
    })

    // Send confirmation email (don't fail if email errors)
    try {
        // Only send email if we have a cancellation token
        if (signup.cancellationToken) {
            const teacherName = slot.createdBy?.name || slot.createdBy?.username || 'Unknown Teacher'
            await sendConfirmationEmail(
                {
                    id: signup.id,
                    parentName: signup.parentName,
                    email: signup.email,
                    cancellationToken: signup.cancellationToken,
                },
                {
                    id: slot.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    teacherName,
                }
            )
        }
    } catch (error) {
        console.error('Failed to send confirmation email:', error)
        // Don't throw - signup is still successful
    }

    revalidatePath('/')
    revalidatePath('/admin')
}

export async function login(prevState: any, formData: FormData) {
    try {
        const rawUsername = formData.get('username') as string
        const username = rawUsername.toLowerCase()
        const password = formData.get('password') as string

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) return 'Debug: User not found in database'

        if (user.status === 'SUSPENDED') {
            return 'Your account has been suspended. Please contact an administrator.'
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return 'Debug: Invalid password'

        // Create the session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: user.id, username: user.username, role: user.role }, expires })

        // Save the session in a cookie
        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true })

        return { success: true }
    } catch (e: any) {
        console.error('Login error:', e)
        return 'An error occurred during login'
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.set('session', '', { expires: new Date(0) })
}

