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

    const name = formData.get('name') as string
    const startTimeStr = formData.get('startTime') as string
    const endTimeStr = formData.get('endTime') as string
    const maxCapacityStr = formData.get('maxCapacity') as string
    const templateId = formData.get('templateId') as string
    const eventPageId = formData.get('eventPageId') as string
    const donationLink = formData.get('donationLink') as string
    const hideTime = formData.get('hideTime') === 'on'
    const hideEndTime = formData.get('hideEndTime') === 'on'

    // If template is selected, copy its properties
    let templateData: any = {}
    if (templateId) {
        const template = await prisma.slotTemplate.findUnique({ where: { id: templateId } })
        if (template) {
            templateData = {
                name: template.name,
                description: template.description,
                collectContributing: template.collectContributing,
                collectDonating: template.collectDonating,
                displayNameAsTitle: template.displayNameAsTitle,
                hideTime: template.hideTime,
                hideEndTime: template.hideEndTime
            }
        }
    }

    const finalName = name || templateData.name
    const finalHideTime = hideTime || templateData.hideTime || false
    const finalHideEndTime = hideEndTime || templateData.hideEndTime || false

    const startTime = new Date(startTimeStr)
    let finalEndTime = new Date(endTimeStr)

    // If hiding end time and no valid end time provided, default to +1 hour
    if (finalHideEndTime && (!endTimeStr || isNaN(finalEndTime.getTime()))) {
        finalEndTime = new Date(startTime.getTime() + 60 * 60 * 1000)
    }

    await prisma.slot.create({
        data: {
            startTime,
            endTime: finalEndTime,
            maxCapacity: parseInt(maxCapacityStr),
            createdById: session.user.id,
            templateId: templateId || null,
            eventPageId: eventPageId || null,
            donationLink: donationLink || null,
            ...templateData,
            name: finalName,
            hideTime: finalHideTime,
            hideEndTime: finalHideEndTime
        }
    })

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function updateSlot(prevState: any, formData: FormData) {
    try {
        const session = await getSession()
        if (!session) throw new Error('Unauthorized')
        const user = session.user

        const id = formData.get('id') as string
        const name = formData.get('name') as string
        const startTimeStr = formData.get('startTime') as string
        const endTimeStr = formData.get('endTime') as string
        const maxCapacityStr = formData.get('maxCapacity') as string
        const hideTime = formData.get('hideTime') === 'on'
        const hideEndTime = formData.get('hideEndTime') === 'on'
        const eventPageId = formData.get('eventPageId') as string
        const donationLink = formData.get('donationLink') as string

        const slot = await prisma.slot.findUnique({ where: { id } })
        if (!slot) throw new Error('Slot not found')
        if (user.role !== 'ADMIN' && slot.createdById !== user.id) throw new Error('Unauthorized')

        const startTime = new Date(startTimeStr)
        let finalEndTime = new Date(endTimeStr)
        if (hideEndTime && (!endTimeStr || isNaN(finalEndTime.getTime()))) {
            finalEndTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000) // +1 hour
        }

        await prisma.slot.update({
            where: { id },
            data: {
                name: name || null,
                startTime: startTime,
                endTime: finalEndTime,
                maxCapacity: parseInt(maxCapacityStr),
                hideTime,
                hideEndTime,
                eventPageId: eventPageId || null,
                donationLink: donationLink || null
            }
        })

        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true, message: 'Changes saved successfully' }
    } catch (e) {
        return { success: false, message: 'Failed to update slot' }
    }
}

export async function deleteSlot(id: string) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const slot = await prisma.slot.findUnique({
        where: { id },
        select: { createdById: true }
    })

    if (!slot) throw new Error('Slot not found')

    if (session.user.role !== 'ADMIN' && slot.createdById !== session.user.id) {
        throw new Error('Unauthorized: You can only delete your own slots')
    }

    await prisma.slot.delete({
        where: { id },
    })

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function signupForSlot(formData: FormData) {
    const slotId = formData.get('slotId') as string
    const parentName = formData.get('parentName') as string
    const childName = formData.get('childName') as string
    const email = formData.get('email') as string
    const contribution = formData.get('contribution') as string
    const donation = formData.get('donation') as string

    const attendeeCount = parseInt(formData.get('attendeeCount') as string || '1')

    // Check capacity and get teacher info
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: {
            signups: true,
            createdBy: { select: { name: true, username: true } }
        },
    })

    if (!slot) throw new Error('Slot not found')

    const currentAttendees = slot.signups.reduce((sum, s) => sum + (s.attendeeCount || 1), 0)
    if (currentAttendees + attendeeCount > slot.maxCapacity) {
        throw new Error('Not enough spots available')
    }

    // Create signup
    // @ts-ignore
    const signup = await prisma.signup.create({
        data: {
            slotId,
            parentName,
            childName,
            email,
            contribution,
            donation,
            attendeeCount,
        } as any,
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
                    childName: signup.childName || 'Student',
                    email: signup.email,
                    cancellationToken: signup.cancellationToken,
                },
                {
                    id: slot.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    teacherName
                }
            )
        }
    } catch (error) {
        console.error('Failed to send confirmation email:', error)
        // Don't throw - signup is still successful
    }

    const teacherUsername = slot.createdBy?.username
    if (teacherUsername) {
        revalidatePath(`/teachers/${teacherUsername}`)
    }

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
}

export async function cancelSignup(signupId: string) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const signup = await prisma.signup.findUnique({
        where: { id: signupId },
        include: { slot: true }
    })

    if (!signup) throw new Error('Signup not found')

    // Check authorization: Admin or Slot Creator
    if (session.user.role !== 'ADMIN' && signup.slot.createdById !== session.user.id) {
        throw new Error('Unauthorized')
    }

    await prisma.signup.delete({
        where: { id: signupId }
    })

    revalidatePath('/admin')
    revalidatePath('/')
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

import { sendFeedbackEmail } from '@/lib/email'

export async function submitRecommendation(formData: FormData) {
    const feedback = formData.get('feedback') as string
    if (!feedback) return { success: false, message: 'Feedback cannot be empty' }

    try {
        // Fetch all admin emails
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
        })

        const adminEmails = admins.map(a => a.email)

        if (adminEmails.length > 0) {
            await sendFeedbackEmail(feedback, adminEmails)
        }

        return { success: true }
    } catch (e) {
        console.error('Failed to submit recommendation:', e)
        return { success: false, message: 'Failed to submit recommendation' }
    }
}

export async function getSlotDetails(slotId: string) {
    try {
        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
            include: {
                _count: { select: { signups: true } },
                signups: { select: { id: true, attendeeCount: true } }
            }
        })
        return { success: true, slot }
    } catch (error) {
        console.error('Failed to fetch slot details:', error)
        return { success: false, error: 'Failed to fetch slot details' }
    }
}
