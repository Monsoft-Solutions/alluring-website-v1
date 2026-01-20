/**
 * Email Service for Admin Dashboard
 *
 * Handles sending invitation emails via Resend.
 */
import { Resend } from 'resend'

import { env } from '@/env'

/**
 * Initialize Resend client with API key
 */
const resend = new Resend(env.RESEND_API_KEY)

/**
 * Invitation email data
 */
type InvitationEmailData = {
    email: string
    invitedByName: string
    invitedByEmail: string
    organizationName: string
    inviteLink: string
    role: string
}

/**
 * Send invitation email to a user
 *
 * @param data - Invitation email data
 */
export async function sendInvitationEmail(
    data: InvitationEmailData
): Promise<void> {
    const { email, invitedByName, organizationName, inviteLink, role } = data

    const subject = `You've been invited to ${organizationName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px; text-align: center; border-bottom: 1px solid #e7e5e4;">
                            <div style="display: inline-block; width: 48px; height: 48px; background-color: #1c1917; border-radius: 12px; line-height: 48px; text-align: center;">
                                <span style="color: #fafaf9; font-size: 20px; font-weight: bold;">A</span>
                            </div>
                            <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 600; color: #1c1917;">
                                You're Invited
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #44403c;">
                                Hi there,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #44403c;">
                                <strong>${invitedByName}</strong> has invited you to join <strong>${organizationName}</strong> as ${role === 'admin' ? 'an' : 'a'} <strong>${role}</strong>.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0 24px;">
                                        <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; background-color: #1c1917; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #78716c;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 22px; color: #a8a29e; word-break: break-all;">
                                ${inviteLink}
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; border-top: 1px solid #e7e5e4; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #a8a29e;">
                                This invitation will expire in 7 days.
                            </p>
                            <p style="margin: 8px 0 0; font-size: 12px; color: #a8a29e;">
                                If you didn't expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim()

    try {
        const { error } = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: email,
            subject,
            html,
        })

        if (error) {
            console.error('Failed to send invitation email:', error)
            throw new Error(error.message || 'Failed to send invitation email')
        }
    } catch (error) {
        console.error('Error sending invitation email:', error)
        throw error
    }
}
