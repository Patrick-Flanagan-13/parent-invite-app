'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Role, Status } from '@prisma/client'

// Helper to check if current user is admin (mock implementation for now, needs auth integration)
// In a real app, you'd get the session here.
// For now, we'll assume the caller handles auth or we'll add a basic check if we had a session lib.
// TODO: Integrate with actual auth session.

import { getSession } from '@/lib/auth'

export async function createUser(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const rawUsername = formData.get('username') as string
    const username = rawUsername?.toLowerCase()
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = (formData.get('role') as Role) || Role.USER

    if (!username || !password) {
        throw new Error('Username and password are required')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                username,
                passwordHash,
                name,
                role,
                status: Status.ACTIVE,
            },
        })
    } catch (e) {
        console.error('Failed to create user', e)
        throw new Error('Failed to create user')
    }

    revalidatePath('/admin/users')
}

export async function updateUser(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as Role

    if (!id) throw new Error('User ID required')

    await prisma.user.update({
        where: { id },
        data: {
            name,
            role,
        },
    })

    revalidatePath('/admin/users')
}

export async function toggleUserStatus(id: string, currentStatus: Status) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const newStatus = currentStatus === Status.ACTIVE ? Status.SUSPENDED : Status.ACTIVE

    await prisma.user.update({
        where: { id },
        data: { status: newStatus },
    })

    revalidatePath('/admin/users')
}

export async function resetPassword(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const id = formData.get('id') as string
    const newPassword = formData.get('newPassword') as string

    if (!id || !newPassword) throw new Error('ID and new password required')

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id },
        data: { passwordHash },
    })

    revalidatePath('/admin/users')
}

export async function approveUser(id: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await prisma.user.update({
        where: { id },
        data: { status: Status.ACTIVE },
    })

    revalidatePath('/admin/users')
}

export async function rejectUser(id: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Delete the user account
    await prisma.user.delete({
        where: { id },
    })

    revalidatePath('/admin/users')
}

