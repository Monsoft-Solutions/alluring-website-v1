/**
 * Contact Notification Email Template
 *
 * Email sent to site owner when a contact form is submitted.
 * Contains all submission details for follow-up.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
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
 * Features clear layout for quick review and easy response.
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
        <EmailLayout preview={`New inquiry from ${contactData.name}`}>
            <EmailHeader
                title='New Contact Form Submission'
                showTagline={false}
            />

            <Section className='px-10 py-8'>
                {/* Alert Banner */}
                <Section className='mb-6 rounded-lg border-2 border-[#D4AF37] bg-[#faf8f3] p-4 text-center'>
                    <Text className='m-0 text-base font-semibold text-stone-900'>
                        🔔 New Lead from Website
                    </Text>
                    <Text className='m-0 mt-1 text-sm text-stone-600'>
                        {formattedDate}
                    </Text>
                </Section>

                <Text className='m-0 mb-6 text-base leading-relaxed text-stone-600'>
                    You have received a new contact form submission from your
                    website. Please respond promptly to maintain our excellent
                    patient care standards.
                </Text>

                <Hr className='my-6 border-stone-200' />

                {/* Contact Information Section */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Contact Information
                </Heading>

                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    {/* Name */}
                    <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                        Name
                    </Text>
                    <Text className='m-0 mb-4 text-base font-medium text-stone-900'>
                        {contactData.name}
                    </Text>

                    {/* Email */}
                    <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                        Email
                    </Text>
                    <Text className='m-0 mb-4 text-base text-stone-900'>
                        <Link
                            href={`mailto:${contactData.email}`}
                            className='font-medium text-[#D4AF37] no-underline'
                        >
                            {contactData.email}
                        </Link>
                    </Text>

                    {/* Phone */}
                    {contactData.phone && (
                        <>
                            <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                Phone
                            </Text>
                            <Text className='m-0 mb-4 text-base text-stone-900'>
                                <Link
                                    href={`tel:${contactData.phone}`}
                                    className='font-medium text-[#D4AF37] no-underline'
                                >
                                    {contactData.phone}
                                </Link>
                            </Text>
                        </>
                    )}

                    {/* Subject */}
                    {contactData.subject && (
                        <>
                            <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                Subject
                            </Text>
                            <Text className='m-0 text-base font-medium text-stone-900'>
                                {contactData.subject}
                            </Text>
                        </>
                    )}
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Message Section */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Message
                </Heading>

                <Section className='mb-6 rounded-lg border border-stone-200 bg-white p-5'>
                    <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-700'>
                        {contactData.message}
                    </Text>
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Quick Actions */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Quick Actions
                </Heading>

                <Section className='mb-4'>
                    <EmailButton
                        href={`mailto:${contactData.email}?subject=Re: ${contactData.subject || 'Your inquiry to Alluring Plastic Surgery'}`}
                        variant='primary'
                    >
                        {`Reply to ${contactData.name}`}
                    </EmailButton>
                </Section>

                {contactData.phone && (
                    <Section className='mb-4'>
                        <EmailButton
                            href={`tel:${contactData.phone}`}
                            variant='secondary'
                        >
                            {`Call ${contactData.name}`}
                        </EmailButton>
                    </Section>
                )}

                {/* Timestamp Footer */}
                <Text className='m-0 mt-8 text-center text-sm text-stone-400 italic'>
                    This lead was submitted on {formattedDate}
                </Text>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
