'use server'

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com'

interface SlotDetails {
    id: string
    startTime: Date
    endTime: Date
    teacherName: string
}

interface SignupDetails {
    id: string
    parentName: string
    email: string
    cancellationToken: string
}

export async function sendConfirmationEmail(
    signup: SignupDetails,
    slot: SlotDetails
): Promise<{ success: boolean; error?: string }> {
    // If Resend not configured, log and return success (development mode)
    if (!resend) {
        console.log('Email not configured. Would have sent confirmation to:', signup.email)
        console.log('Cancellation link:', `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/cancel/${signup.cancellationToken}`)
        return { success: true }
    }

    try {
        // Use Vercel's automatic URL or fallback to production domain
        const baseUrl = process.env.NEXT_PUBLIC_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://parent-invite-app.vercel.app')
        const cancellationUrl = `${baseUrl}/cancel/${signup.cancellationToken}`

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conference Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                Conference Confirmed!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                Hi ${signup.parentName},
                            </p>
                            
                            <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                                Your parent-teacher conference has been confirmed! Here are the details:
                            </p>
                            
                            <!-- Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-weight: bold;">
                                            📅 DATE & TIME
                                        </p>
                                        <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937; font-weight: bold;">
                                            ${new Date(slot.startTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}<br>
                                            ${new Date(slot.startTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })} - ${new Date(slot.endTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })}
                                        </p>
                                        
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-weight: bold;">
                                            👨‍🏫 TEACHER
                                        </p>
                                        <p style="margin: 0; font-size: 16px; color: #1f2937;">
                                            ${slot.teacherName}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                                We look forward to seeing you! If you need to cancel, please use the button below.
                            </p>
                            
                            <!-- Cancel Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${cancellationUrl}" style="display: inline-block; padding: 16px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                            Cancel Registration
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                                Or copy this link:<br>
                                <a href="${cancellationUrl}" style="color: #2563eb; word-break: break-all;">${cancellationUrl}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                Quail Run Elementary School<br>
                                Parent-Teacher Conference System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `

        await resend.emails.send({
            from: fromEmail,
            to: signup.email,
            subject: 'Conference Confirmed - Quail Run Elementary',
            html: emailHtml,
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to send confirmation email:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

export async function sendCancellationEmail(
    email: string,
    parentName: string,
    slotTime: Date
): Promise<void> {
    if (!resend) {
        console.log('Email not configured. Would have sent cancellation to:', email)
        return
    }

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Conference Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                    <tr>
                        <td>
                            <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                                Conference Cancelled
                            </h1>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                Hi ${parentName},
                            </p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                Your parent-teacher conference scheduled for <strong>${new Date(slotTime).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })}</strong> has been cancelled.
                            </p>
                            
                            <p style="margin: 0; font-size: 16px; color: #374151;">
                                You can sign up for a different time slot at any time by visiting our website.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `

        await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Conference Cancelled - Quail Run Elementary',
            html: emailHtml,
        })
    } catch (error) {
        console.error('Failed to send cancellation email:', error)
    }
}
