/**
 * Contact Confirmation Email Template
 *
 * Email sent to the person who submitted the contact form.
 * Confirms receipt, sets expectations, and provides useful resources.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
 *
 * @module lib/email/templates/ContactConfirmation.template
 */
import {
    Column,
    Heading,
    Hr,
    Link,
    Row,
    Section,
    Text,
} from '@react-email/components'
import {
    FINANCING_SENTENCE_LONG,
    getFinancingPartnersString,
} from '@workspace/shared/claims/financing'
import {
    KARLINSKY_ABS_CERTIFIED_YEAR,
    KARLINSKY_NAME,
} from '@workspace/shared/claims/surgeon'
import { RATING_FALLBACK } from '@workspace/shared/claims/trust'

import { siteConfig, getPhoneLink } from '@/lib/data/site-config'
import type { ContactConfirmationProps } from '@/lib/types/email/email-service.type'

import { EmailButton } from '../components/email-button.component'
import { EmailFooter } from '../components/email-footer.component'
import { EmailHeader } from '../components/email-header.component'
import { EmailLayout } from '../components/email-layout.component'

/**
 * Useful resource links for the "While You Wait" section
 */
const resourceLinks = [
    {
        title: 'Browse Our Procedures',
        description: 'See the procedures we offer',
        path: '/procedures',
    },
    {
        title: 'Financing Options',
        description: `Financing through ${getFinancingPartnersString()} for qualified applicants`,
        path: '/plastic-surgery-financing-miami',
    },
    {
        title: 'Meet Your Surgeon',
        description: `${KARLINSKY_NAME}, board certified in general surgery by the American Board of Surgery`,
        path: '/dr-karlinsky',
    },
    {
        title: 'Read Our Blog',
        description: 'Answers to common questions about surgery and recovery',
        path: '/blog',
    },
]

/**
 * Trust facts for credibility: verified ones only. The patient count, years
 * and accreditation it showed are retired (claims canon §4, #354).
 */
const trustStats = [
    { value: 'One', label: 'Surgeon for every procedure' },
    {
        value: `Since ${KARLINSKY_ABS_CERTIFIED_YEAR}`,
        label: 'Board certified in general surgery, American Board of Surgery',
    },
    {
        value: siteConfig.trustStats?.rating || RATING_FALLBACK,
        label: 'Stars on Google',
    },
]

/**
 * Contact confirmation email template
 *
 * Sent to the form submitter confirming receipt of their message.
 * Carries useful resource links and verified trust facts.
 *
 * @example
 * ```tsx
 * const email = render(
 *   <ContactConfirmationEmail
 *     firstName="Maria"
 *     businessName="Alluring Plastic Surgery"
 *     businessEmail="info@alluringplasticsurgery.com"
 *   />
 * )
 * ```
 */
export function ContactConfirmationEmail({
    firstName,
    businessName,
    businessEmail,
}: ContactConfirmationProps) {
    const siteUrl = siteConfig.seo.siteUrl

    return (
        <EmailLayout
            preview={`Thank you for contacting ${businessName}, ${firstName}.`}
        >
            <EmailHeader title="We've Received Your Message" />

            <Section className='px-10 py-8'>
                {/* Personal Greeting */}
                <Text
                    className='m-0 mb-4 text-xl font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Dear {firstName},
                </Text>

                <Text className='m-0 mb-4 text-base leading-relaxed text-stone-600'>
                    Thank you for reaching out to{' '}
                    <strong>{businessName}</strong>. Your inquiry is important
                    to us, and we&apos;re excited to be part of your aesthetic
                    journey.
                </Text>

                {/* Confirmation Box */}
                <Section className='my-6 rounded-lg border-2 border-[#D4AF37] bg-[#faf8f3] p-6 text-center'>
                    <Text className='m-0 mb-2 text-lg font-semibold text-stone-900'>
                        ✓ Your Message Has Been Received
                    </Text>
                    <Text className='m-0 text-base text-stone-600'>
                        A member of our patient care team will be in touch.
                    </Text>
                </Section>

                {/* What to Expect */}
                <Text className='m-0 mb-2 text-base leading-relaxed text-stone-600'>
                    During your consultation, we&apos;ll discuss your goals,
                    answer all your questions, and create a personalized
                    treatment plan tailored just for you.
                </Text>

                <Text className='m-0 mb-6 text-base leading-relaxed text-stone-600'>
                    {FINANCING_SENTENCE_LONG}
                </Text>

                <Hr className='my-8 border-stone-200' />

                {/* While You Wait Section */}
                <Heading
                    className='m-0 mb-6 text-center text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    While You Wait, Explore
                </Heading>

                <Row className='mb-6'>
                    {resourceLinks.slice(0, 2).map((link) => (
                        <Column key={link.path} className='w-1/2 px-2'>
                            <Section className='rounded-lg border border-stone-200 bg-stone-50 p-4'>
                                <Link
                                    href={`${siteUrl}${link.path}`}
                                    className='text-base font-semibold text-[#D4AF37] no-underline'
                                >
                                    {link.title} →
                                </Link>
                                <Text className='m-0 mt-2 text-sm text-stone-500'>
                                    {link.description}
                                </Text>
                            </Section>
                        </Column>
                    ))}
                </Row>

                <Row className='mb-8'>
                    {resourceLinks.slice(2, 4).map((link) => (
                        <Column key={link.path} className='w-1/2 px-2'>
                            <Section className='rounded-lg border border-stone-200 bg-stone-50 p-4'>
                                <Link
                                    href={`${siteUrl}${link.path}`}
                                    className='text-base font-semibold text-[#D4AF37] no-underline'
                                >
                                    {link.title} →
                                </Link>
                                <Text className='m-0 mt-2 text-sm text-stone-500'>
                                    {link.description}
                                </Text>
                            </Section>
                        </Column>
                    ))}
                </Row>

                <Hr className='my-8 border-stone-200' />

                {/* Trust Stats */}
                <Row className='mb-8'>
                    {trustStats.map((stat) => (
                        <Column key={stat.label} className='text-center'>
                            <Text className='m-0 text-2xl font-bold text-[#D4AF37]'>
                                {stat.value}
                            </Text>
                            <Text className='m-0 text-xs tracking-wide text-stone-500 uppercase'>
                                {stat.label}
                            </Text>
                        </Column>
                    ))}
                </Row>

                <Hr className='my-8 border-stone-200' />

                {/* Urgent Contact */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Need Immediate Assistance?
                </Heading>

                <Text className='m-0 mb-4 text-base leading-relaxed text-stone-600'>
                    If you have urgent questions or would prefer to speak with
                    us directly, we&apos;re here for you:
                </Text>

                <Text className='m-0 mb-2 text-base text-stone-600'>
                    <strong>Call us:</strong>{' '}
                    <Link
                        href={getPhoneLink()}
                        className='font-semibold text-[#D4AF37] no-underline'
                    >
                        {siteConfig.contact.phoneDisplay}
                    </Link>
                </Text>

                <Text className='m-0 mb-6 text-base text-stone-600'>
                    <strong>Email:</strong>{' '}
                    <Link
                        href={`mailto:${businessEmail}`}
                        className='font-semibold text-[#D4AF37] no-underline'
                    >
                        {businessEmail}
                    </Link>
                </Text>

                {/* CTA Button */}
                <Section className='my-8 text-center'>
                    <EmailButton href={getPhoneLink()} variant='primary'>
                        Call Us Now
                    </EmailButton>
                </Section>

                {/* Closing */}
                <Text className='m-0 mb-2 text-base leading-relaxed text-stone-600'>
                    Thank you for considering {businessName} for your aesthetic
                    goals. We look forward to meeting you.
                </Text>

                <Text className='m-0 mt-6 text-base font-medium text-stone-900'>
                    Warmly,
                </Text>
                <Text className='m-0 text-base text-stone-600'>
                    The {businessName} Team
                </Text>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
