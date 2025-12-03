'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireUser() {
    const session = await getSession()
    if (!session) {
        throw new Error('Unauthorized')
    }
    return session.user
}

export async function createEvent(prevState: any, formData: FormData) {
    const user = await requireUser()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    // Generate slug from title
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    // Ensure uniqueness (simple append for now)
    const existing = await prisma.eventPage.findUnique({ where: { slug } })
    if (existing) {
        slug = `${slug}-${Date.now()}`
    }

    await prisma.eventPage.create({
        data: {
            title,
            description,
            imageUrl,
            slug,
            userId: user.id
        }
    })

    revalidatePath('/admin/events')
    return { message: 'Event created successfully!' }
}

export async function updateEvent(prevState: any, formData: FormData) {
    const user = await requireUser()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    const event = await prisma.eventPage.findUnique({ where: { id } })
    if (!event) return { error: 'Event not found' }
    if (user.role !== 'ADMIN' && event.userId !== user.id) return { error: 'Unauthorized' }

    await prisma.eventPage.update({
        where: { id },
        data: {
            title,
            description,
            imageUrl
        }
    })

    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${id}`)
    return { message: 'Changes saved successfully!' }
}

export async function deleteEvent(id: string) {
    const user = await requireUser()

    const event = await prisma.eventPage.findUnique({ where: { id } })
    if (!event) throw new Error('Event not found')
    if (user.role !== 'ADMIN' && event.userId !== user.id) throw new Error('Unauthorized')

    await prisma.eventPage.delete({
        where: { id }
    })

    revalidatePath('/admin/events')
}
