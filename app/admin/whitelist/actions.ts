'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function addWhitelistedEmail(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== Role.ADMIN) {
        return { error: 'Unauthorized' }
    }

    const email = formData.get('email') as string
    if (!email) {
        return { error: 'Email is required' }
    }

    try {
        await (prisma as any).whitelistedEmail.create({
            data: {
                email: email.toLowerCase().trim(),
                addedById: session.user.id,
            },
        })
        revalidatePath('/admin/whitelist')
        return { success: true }
    } catch (error) {
        console.error('Failed to whitelist email:', error)
        return { error: 'Failed to whitelist email. It might already be in the list.' }
    }
}

export async function removeWhitelistedEmail(id: string) {
    const session = await getSession()
    if (!session || session.user.role !== Role.ADMIN) {
        return { error: 'Unauthorized' }
    }

    try {
        await (prisma as any).whitelistedEmail.delete({
            where: { id },
        })
        revalidatePath('/admin/whitelist')
        return { success: true }
    } catch (error) {
        console.error('Failed to remove whitelisted email:', error)
        return { error: 'Failed to remove email' }
    }
}
