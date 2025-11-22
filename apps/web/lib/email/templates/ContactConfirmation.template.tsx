/**
 * Contact Confirmation Email Template
 *
 * Email sent to the person who submitted the contact form.
 * Confirms receipt and provides next steps.
 * Styled with Tailwind CSS for consistent design.
 *
 * @module lib/email/templates/ContactConfirmation.template
 */
import { Heading, Hr, Link, Section, Text } from '@react-email/components'

import type { ContactConfirmationProps } from '@/lib/types/email/email-service.type'

import { EmailButton } from '../components/email-button.component'
import { EmailFooter } from '../components/email-footer.component'
import { EmailHeader } from '../components/email-header.component'
import { EmailLayout } from '../components/email-layout.component'

/**
 * Contact confirmation email template
 *
 * Sent to the form submitter confirming receipt of their message.
 * Provides assurance and sets expectations for response time.
 *
 * @example
 * ```tsx
 * const email = render(
 *   <ContactConfirmationEmail
 *     name="John Doe"
 *     businessName="ACME"
 *     businessEmail="contact@example.com"
 *     businessPhone="+1-555-123-4567"
 *   />
 * )
 * ```
 */
export function ContactConfirmationEmail({
    name,
    businessName,
    businessEmail,
    businessPhone,
}: ContactConfirmationProps) {
    return (
        <EmailLayout preview='Thank you for contacting us!'>
            <EmailHeader title='Thank You for Reaching Out!' />

            <Section className='px-10 py-5'>
                <Text className='my-4 text-lg font-semibold text-gray-900'>
                    Hi {name},
                </Text>

                <Text className='my-4 text-base leading-relaxed text-gray-600'>
                    Thank you for contacting <strong>{businessName}</strong>.
                    We&apos;ve received your message and appreciate you taking
                    the time to reach out to us.
                </Text>

                <Section className='my-6 rounded-lg border-2 border-blue-500 bg-blue-50 p-5 text-center'>
                    <Text className='my-2 text-base leading-relaxed text-blue-800'>
                        <strong>✓ Your message has been received</strong>
                    </Text>
                    <Text className='my-2 text-base leading-relaxed text-blue-800'>
                        We typically respond within 1-2 business days
                    </Text>
                </Section>

                <Text className='my-4 text-base leading-relaxed text-gray-600'>
                    One of our team members will review your inquiry and get
                    back to you as soon as possible. If your matter is urgent,
                    please don&apos;t hesitate to contact us directly.
                </Text>

                <Hr className='my-8 border-gray-200' />

                <Heading className='mt-6 mb-4 text-lg font-semibold text-gray-900'>
                    Need Immediate Help?
                </Heading>

                <Text className='my-4 text-base leading-relaxed text-gray-600'>
                    If you need urgent assistance, you can reach us directly:
                </Text>

                <Text className='my-2 text-[15px] leading-relaxed text-gray-600'>
                    <strong>Email:</strong>{' '}
                    <Link
                        href={`mailto:${businessEmail}`}
                        className='text-blue-500 no-underline'
                    >
                        {businessEmail}
                    </Link>
                </Text>

                <Text className='my-2 text-[15px] leading-relaxed text-gray-600'>
                    <strong>Phone:</strong>{' '}
                    <Link
                        href={`tel:${businessPhone}`}
                        className='text-blue-500 no-underline'
                    >
                        {businessPhone}
                    </Link>
                </Text>

                <Section className='my-8'>
                    <EmailButton
                        href={`mailto:${businessEmail}`}
                        variant='secondary'
                    >
                        Send Another Message
                    </EmailButton>
                </Section>

                <Text className='mt-6 mb-4 text-base leading-relaxed text-gray-600'>
                    Thank you for your interest in {businessName}. We look
                    forward to speaking with you soon!
                </Text>

                <Text className='my-6 text-base leading-relaxed font-medium text-gray-900'>
                    Best regards,
                    <br />
                    The {businessName} Team
                </Text>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
