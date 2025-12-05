'use server'

import { Resend } from 'resend'
import { formatSlotDateTimeForEmail } from './date-utils'

const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com'

interface SlotDetails {
    id: string
    startTime: Date
    endTime: Date
    teacherName: string
    name?: string | null
    hideEndTime?: boolean
}

interface SignupDetails {
    id: string
    parentName: string
    childName: string
    email: string
    cancellationToken: string
}

export async function sendConfirmationEmail(
    signup: SignupDetails,
    slot: SlotDetails
): Promise<{ success: boolean; error?: string }> {
    // Check for API key at runtime
    const apiKey = process.env.RESEND_API_KEY

    // If Resend not configured, log and return success (development mode)
    if (!apiKey) {
        console.log('Email not configured. Would have sent confirmation to:', signup.email)
        return { success: true }
    }

    const resend = new Resend(apiKey)

    try {
        // Always use production domain for email links
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://quailrun.app'
        const cancellationUrl = `${baseUrl}/cancel/${signup.cancellationToken}`

        const subject = 'Slot Confirmed - Quail Run Elementary'

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
                                ${subject}
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
                                Your slot for <strong>${signup.childName}</strong> has been confirmed! Here are the details:
                            </p>
                            
                            <!-- Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-weight: bold;">
                                            📅 DATE & TIME
                                        </p>
                                        <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937; font-weight: bold;">
                                            ${formatSlotDateTimeForEmail(slot.startTime, slot.endTime, slot.hideEndTime)}
                                        </p>
                                        
                                        ${slot.name ? `
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280; font-weight: bold;">
                                            📝 SLOT NAME
                                        </p>
                                        <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937; font-weight: bold;">
                                            ${slot.name}
                                        </p>
                                        ` : ''}

                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="33%" valign="top">
                                                    <p style="margin: 0 0 5px; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">
                                                        👨‍🏫 Teacher/Room Parent
                                                    </p>
                                                    <p style="margin: 0; font-size: 14px; color: #1f2937; font-weight: 600;">
                                                        ${slot.teacherName}
                                                    </p>
                                                </td>
                                                <td width="33%" valign="top">
                                                    <p style="margin: 0 0 5px; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">
                                                        👤 Parent
                                                    </p>
                                                    <p style="margin: 0; font-size: 14px; color: #1f2937; font-weight: 600;">
                                                        ${signup.parentName}
                                                    </p>
                                                </td>
                                                <td width="33%" valign="top">
                                                    <p style="margin: 0 0 5px; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">
                                                        🎓 Student
                                                    </p>
                                                    <p style="margin: 0; font-size: 14px; color: #1f2937; font-weight: 600;">
                                                        ${signup.childName}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
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
                                Parent-Teacher System
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
            subject: subject,
            html: emailHtml,
        })

        console.log('✅ Email sent successfully to:', signup.email)
        return { success: true }
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return { success: false, error: 'Failed to send email' }
    }
}

export async function sendCancellationEmail(
    email: string,
    parentName: string,
    slotTime: Date
): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.log('Email not configured. Would have sent cancellation to:', email)
        return
    }

    const resend = new Resend(apiKey)

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
                                Your slot is scheduled for <strong>${formatSlotDateTimeForEmail(slotTime, slotTime).replace('<br>', ' ')}</strong> has been cancelled.
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

export async function sendPasswordResetEmail(
    email: string,
    token: string
): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.log('Email not configured. Would have sent password reset to:', email)
        console.log('Reset Token:', token)
        return
    }

    const resend = new Resend(apiKey)

    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://quailrun.app'
        const resetUrl = `${baseUrl}/reset-password?token=${token}`

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                    <tr>
                        <td>
                            <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                                Reset Your Password
                            </h1>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                We received a request to reset your password. Click the button below to choose a new password.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; font-size: 14px; color: #6b7280;">
                                If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.
                            </p>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                                Or copy this link:<br>
                                <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
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
            subject: 'Reset Your Password - Quail Run Elementary',
            html: emailHtml,
        })
    } catch (error) {
        console.error('Failed to send password reset email:', error)
    }
}
export async function sendReminderEmail(
    email: string,
    parentName: string,
    childName: string,
    slotTime: Date,
    teacherName: string,
    cancellationToken: string,
    slotName?: string | null,
    hideEndTime?: boolean
): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.log('Email not configured. Would have sent reminder to:', email)
        return
    }

    const resend = new Resend(apiKey)

    try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://quailrun.app'
        const cancellationUrl = `${baseUrl}/cancel/${cancellationToken}`

        const subject = 'Conference Reminder - Quail Run Elementary'

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                    <tr>
                        <td>
                            <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                                ${subject}
                            </h1>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                Hi ${parentName},
                            </p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                This is a reminder that you have an upcoming slot for <strong>${childName}</strong> coming up tomorrow.
                            </p>

                            <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937; font-weight: bold;">
                                ${formatSlotDateTimeForEmail(slotTime, slotTime, hideEndTime).replace('<br>', ' ')}
                            </p>
                            
                            ${slotName ? `
                            <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937;">
                                <strong>Slot:</strong> ${slotName}
                            </p>
                            ` : ''}
                            
                            <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                                If you need to cancel, please use the link below.
                            </p>

                            <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                <a href="${cancellationUrl}" style="color: #2563eb; word-break: break-all;">Cancel Registration</a>
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
            subject: subject,
            html: emailHtml,
        })
    } catch (error) {
        console.error('Failed to send reminder email:', error)
    }
}
export async function sendFeedbackEmail(
    feedback: string,
    recipients: string[]
): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        console.log('Email not configured. Would have sent feedback to:', recipients)
        console.log('Feedback:', feedback)
        return
    }

    const resend = new Resend(apiKey)

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Feedback Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                    <tr>
                        <td>
                            <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                                New Feedback Received
                            </h1>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                                A user has submitted a recommendation for the Parent Invite App:
                            </p>
                            
                            <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 16px; color: #1f2937; white-space: pre-wrap;">${feedback}</p>
                            </div>
                            
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                This email was sent to all administrators.
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
            to: recipients,
            subject: 'New App Feedback / Recommendation',
            html: emailHtml,
        })
    } catch (error) {
        console.error('Failed to send feedback email:', error)
    }
}
