/**
 * Contact Notification Email Template
 *
 * Email sent to site owner when a contact form is submitted.
 * Contains all submission details for follow-up.
 * Styled with Tailwind CSS for consistent design.
 *
 * @module lib/email/templates/ContactNotification.template
 */
import { Heading, Hr, Link, Section, Text } from '@react-email/components'

import type { ContactNotificationProps } from '@/lib/types/email/email-service.type'

import { EmailButton } from '../components/email-button.component'
import { EmailFooter } from '../components/email-footer.component'
import { EmailHeader } from '../components/email-header.component'
import { EmailLayout } from '../components/email-layout.component'

/**
 * Contact notification email template
 *
 * Sent to the site owner (OWNER_EMAIL) with contact form submission details.
 * Includes submitter's information and message for follow-up.
 *
 * @example
 * ```tsx
 * const email = render(
 *   <ContactNotificationEmail
 *     contactData={formData}
 *     submittedAt={new Date().toISOString()}
 *   />
 * )
 * ```
 */
export function ContactNotificationEmail({
    contactData,
    submittedAt,
}: ContactNotificationProps) {
    const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    })

    return (
        <EmailLayout preview='New contact form submission received'>
            <EmailHeader title='New Contact Form Submission' />

            <Section className='px-10 py-5'>
                <Text className='my-4 text-base leading-relaxed text-gray-600'>
                    You have received a new contact form submission from your
                    website.
                </Text>

                <Hr className='my-6 border-gray-200' />

                <Heading className='mt-6 mb-4 text-lg font-semibold text-gray-900'>
                    Contact Information
                </Heading>

                <Text className='mt-3 mb-1 text-sm font-semibold text-gray-600'>
                    Name:
                </Text>
                <Text className='mt-0 mb-3 text-base leading-relaxed text-gray-900'>
                    {contactData.name}
                </Text>

                <Text className='mt-3 mb-1 text-sm font-semibold text-gray-600'>
                    Email:
                </Text>
                <Text className='mt-0 mb-3 text-base leading-relaxed text-gray-900'>
                    <Link
                        href={`mailto:${contactData.email}`}
                        className='text-blue-500 no-underline'
                    >
                        {contactData.email}
                    </Link>
                </Text>

                {contactData.phone && (
                    <>
                        <Text className='mt-3 mb-1 text-sm font-semibold text-gray-600'>
                            Phone:
                        </Text>
                        <Text className='mt-0 mb-3 text-base leading-relaxed text-gray-900'>
                            <Link
                                href={`tel:${contactData.phone}`}
                                className='text-blue-500 no-underline'
                            >
                                {contactData.phone}
                            </Link>
                        </Text>
                    </>
                )}

                {contactData.subject && (
                    <>
                        <Text className='mt-3 mb-1 text-sm font-semibold text-gray-600'>
                            Subject:
                        </Text>
                        <Text className='mt-0 mb-3 text-base leading-relaxed text-gray-900'>
                            {contactData.subject}
                        </Text>
                    </>
                )}

                <Hr className='my-6 border-gray-200' />

                <Heading className='mt-6 mb-4 text-lg font-semibold text-gray-900'>
                    Message
                </Heading>
                <Text className='my-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-base leading-relaxed whitespace-pre-wrap text-gray-900'>
                    {contactData.message}
                </Text>

                <Hr className='my-6 border-gray-200' />

                <Text className='my-4 text-sm text-gray-400 italic'>
                    Submitted on {formattedDate}
                </Text>

                <Section className='my-8'>
                    <EmailButton
                        href={`mailto:${contactData.email}?subject=Re: ${contactData.subject || 'Your inquiry'}`}
                        variant='primary'
                    >
                        {`Reply to ${contactData.name}`}
                    </EmailButton>
                </Section>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
