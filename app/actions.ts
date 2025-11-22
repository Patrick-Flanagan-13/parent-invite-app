'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'


export async function createSlot(formData: FormData) {
    const startTime = new Date(formData.get('startTime') as string)
    const endTime = new Date(formData.get('endTime') as string)
    const maxCapacity = parseInt(formData.get('maxCapacity') as string)

    await prisma.slot.create({
        data: {
            startTime,
            endTime,
            maxCapacity,
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

    // Check capacity
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { signups: true },
    })

    if (!slot) throw new Error('Slot not found')
    if (slot.signups.length >= slot.maxCapacity) {
        throw new Error('Slot is full')
    }

    await prisma.signup.create({
        data: {
            slotId,
            parentName,
            email,
        },
    })

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

        if (!user) return 'Invalid username or password'

        if (user.status === 'SUSPENDED') {
            return 'Your account has been suspended. Please contact an administrator.'
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return 'Invalid username or password'

        // Create the session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: user.id, username: user.username }, expires })

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

