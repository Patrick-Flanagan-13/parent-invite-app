'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
}

export async function createTemplate(prevState: any, formData: FormData) {
    try {
        await requireAdmin()
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const collectDonationLink = formData.get('collectDonationLink') === 'on'
        const collectContributing = formData.get('collectContributing') === 'on'
        const collectDonating = formData.get('collectDonating') === 'on'
        const displayNameAsTitle = formData.get('displayNameAsTitle') === 'on'
        const hideEndTime = formData.get('hideEndTime') === 'on'
        const isDefault = formData.get('isDefault') === 'on'
        const confirmationEmailSubject = formData.get('confirmationEmailSubject') as string
        const confirmationEmailBody = formData.get('confirmationEmailBody') as string
        const reminderEmailSubject = formData.get('reminderEmailSubject') as string
        const reminderEmailBody = formData.get('reminderEmailBody') as string

        if (isDefault) {
            // Unset other defaults
            // @ts-ignore
            await prisma.slotTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            })
        }

        // @ts-ignore
        await prisma.slotTemplate.create({
            data: {
                name,
                description,
                collectDonationLink,
                collectContributing,
                collectDonating,
                displayNameAsTitle,
                hideEndTime,
                isDefault
            }
        })

        revalidatePath('/admin/templates')
        return { success: true, message: 'Template created successfully' }
    } catch (e) {
        return { success: false, message: 'Failed to create template' }
    }
}

export async function updateTemplate(prevState: any, formData: FormData) {
    try {
        await requireAdmin()
        const id = formData.get('id') as string
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const collectDonationLink = formData.get('collectDonationLink') === 'on'
        const collectContributing = formData.get('collectContributing') === 'on'
        const collectDonating = formData.get('collectDonating') === 'on'
        const displayNameAsTitle = formData.get('displayNameAsTitle') === 'on'
        const hideEndTime = formData.get('hideEndTime') === 'on'
        const isDefault = formData.get('isDefault') === 'on'
        const confirmationEmailSubject = formData.get('confirmationEmailSubject') as string
        const confirmationEmailBody = formData.get('confirmationEmailBody') as string
        const reminderEmailSubject = formData.get('reminderEmailSubject') as string
        const reminderEmailBody = formData.get('reminderEmailBody') as string

        if (isDefault) {
            // Unset other defaults
            // @ts-ignore
            await prisma.slotTemplate.updateMany({
                where: { isDefault: true, id: { not: id } },
                data: { isDefault: false }
            })
        }

        // @ts-ignore
        await prisma.slotTemplate.update({
            where: { id },
            data: {
                name,
                description,
                collectDonationLink,
                collectContributing,
                collectDonating,
                displayNameAsTitle,
                hideEndTime,
                isDefault
            }
        })

        // Propagate changes to all slots linked to this template
        // @ts-ignore
        await prisma.slot.updateMany({
            where: { templateId: id },
            data: {
                name,
                description,
                collectContributing,
                collectDonating,
                displayNameAsTitle,
                hideEndTime
            }
        })

        revalidatePath('/admin/templates')
        return { success: true, message: 'Changes saved successfully' }
    } catch (e) {
        return { success: false, message: 'Failed to update template' }
    }
}

export async function deleteTemplate(id: string) {
    await requireAdmin()
    // @ts-ignore
    await prisma.slotTemplate.delete({
        where: { id }
    })
    revalidatePath('/admin/templates')
}
