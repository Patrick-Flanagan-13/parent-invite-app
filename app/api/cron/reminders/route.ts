import { prisma } from '@/lib/db'
import { sendReminderEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const now = new Date()
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000)

        // Find signups for slots starting between 24 and 25 hours from now
        // This ensures we catch them in the hourly cron job window
        const upcomingSignups = await prisma.signup.findMany({
            where: {
                slot: {
                    startTime: {
                        gte: twentyFourHoursFromNow,
                        lt: twentyFiveHoursFromNow,
                    },
                },
                reminderSent: false,
            },
            include: {
                slot: {
                    include: {
                        createdBy: true,
                    },
                },
            },
        })

        console.log(`Found ${upcomingSignups.length} signups needing reminders`)

        const results = await Promise.allSettled(
            upcomingSignups.map(async (signup) => {
                if (!signup.slot.createdBy?.name && !signup.slot.createdBy?.username) {
                    console.error(`No teacher name found for signup ${signup.id}`)
                    return
                }

                await sendReminderEmail(
                    signup.email,
                    signup.parentName,
                    signup.childName || 'Student',
                    signup.slot.startTime,
                    signup.slot.createdBy.name || signup.slot.createdBy.username,
                    signup.cancellationToken || ''
                )

                await prisma.signup.update({
                    where: { id: signup.id },
                    data: { reminderSent: true },
                })
            })
        )

        const successCount = results.filter((r) => r.status === 'fulfilled').length
        const failureCount = results.filter((r) => r.status === 'rejected').length

        return NextResponse.json({
            success: true,
            processed: upcomingSignups.length,
            sent: successCount,
            failed: failureCount,
        })
    } catch (error) {
        console.error('Reminder cron failed:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
