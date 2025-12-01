/**
 * Bug Report Notification Email Template
 *
 * Email sent to site owner when a bug report is submitted.
 * Contains all bug details including reproduction steps.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
 *
 * @module lib/email/templates/BugReportNotification.template
 */
import { Heading, Hr, Link, Section, Text } from '@react-email/components'

import type { BugReportFormData } from '@/lib/types/forms/bug-report.type'

import { EmailFooter } from '../components/email-footer.component'
import { EmailHeader } from '../components/email-header.component'
import { EmailLayout } from '../components/email-layout.component'

type BugReportNotificationProps = {
    readonly bugData: BugReportFormData
    readonly submittedAt: string
    readonly bugId: string
}

/**
 * Get severity badge color
 */
function getSeverityStyles(severity: string) {
    switch (severity) {
        case 'critical':
            return { bg: '#dc2626', text: '#ffffff' }
        case 'high':
            return { bg: '#ea580c', text: '#ffffff' }
        case 'medium':
            return { bg: '#ca8a04', text: '#ffffff' }
        case 'low':
            return { bg: '#16a34a', text: '#ffffff' }
        default:
            return { bg: '#6b7280', text: '#ffffff' }
    }
}

/**
 * Bug report notification email template
 */
export function BugReportNotificationEmail({
    bugData,
    submittedAt,
    bugId,
}: BugReportNotificationProps) {
    const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    })

    const severityStyles = getSeverityStyles(bugData.severity || 'medium')

    return (
        <EmailLayout
            preview={`Bug Report: ${bugData.description.slice(0, 50)}...`}
        >
            <EmailHeader title='Bug Report' showTagline={false} />

            <Section className='px-10 py-8'>
                {/* Alert Banner */}
                <Section className='mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4 text-center'>
                    <Text className='m-0 text-base font-semibold text-red-900'>
                        🐛 New Bug Report
                    </Text>
                    <Text className='m-0 mt-1 text-sm text-red-700'>
                        {formattedDate}
                    </Text>
                    <Text className='m-0 mt-1 text-xs text-red-400'>
                        Bug ID: {bugId}
                    </Text>

                    {/* Severity Badge */}
                    <Text
                        className='mx-auto mt-3 inline-block rounded-full px-4 py-1 text-sm font-bold uppercase'
                        style={{
                            backgroundColor: severityStyles.bg,
                            color: severityStyles.text,
                        }}
                    >
                        {bugData.severity?.toUpperCase() || 'MEDIUM'} SEVERITY
                    </Text>
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Page URL */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Affected Page
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <Link
                        href={bugData.pageUrl}
                        className='text-base font-medium break-all text-[#D4AF37] no-underline'
                    >
                        {bugData.pageUrl}
                    </Link>
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Bug Description */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Bug Description
                </Heading>
                <Section className='mb-6 rounded-lg border border-red-200 bg-red-50 p-5'>
                    <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-900'>
                        {bugData.description}
                    </Text>
                </Section>

                {/* Steps to Reproduce */}
                {bugData.stepsToReproduce && (
                    <>
                        <Hr className='my-6 border-stone-200' />
                        <Heading
                            className='m-0 mb-4 text-lg font-semibold text-stone-900'
                            style={{
                                fontFamily:
                                    "'Playfair Display', Georgia, serif",
                            }}
                        >
                            Steps to Reproduce
                        </Heading>
                        <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                            <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-700'>
                                {bugData.stepsToReproduce}
                            </Text>
                        </Section>
                    </>
                )}

                {/* Expected vs Actual */}
                {(bugData.expectedBehavior || bugData.actualBehavior) && (
                    <>
                        <Hr className='my-6 border-stone-200' />
                        <Heading
                            className='m-0 mb-4 text-lg font-semibold text-stone-900'
                            style={{
                                fontFamily:
                                    "'Playfair Display', Georgia, serif",
                            }}
                        >
                            Expected vs Actual Behavior
                        </Heading>
                        <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                            {bugData.expectedBehavior && (
                                <>
                                    <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                        Expected
                                    </Text>
                                    <Text className='m-0 mb-4 text-base leading-relaxed whitespace-pre-wrap text-green-700'>
                                        {bugData.expectedBehavior}
                                    </Text>
                                </>
                            )}

                            {bugData.actualBehavior && (
                                <>
                                    <Text className='m-0 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                        Actual
                                    </Text>
                                    <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-red-700'>
                                        {bugData.actualBehavior}
                                    </Text>
                                </>
                            )}
                        </Section>
                    </>
                )}

                <Hr className='my-6 border-stone-200' />

                {/* Environment Details */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Environment Details
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <table className='w-full'>
                        <tbody>
                            <tr>
                                <td className='py-1 text-sm font-semibold text-stone-500'>
                                    Device:
                                </td>
                                <td className='py-1 text-sm text-stone-700'>
                                    {bugData.deviceType || 'Unknown'}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-1 text-sm font-semibold text-stone-500'>
                                    Browser:
                                </td>
                                <td className='py-1 text-sm text-stone-700'>
                                    {bugData.browserType || 'Unknown'}{' '}
                                    {bugData.browserVersion}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-1 text-sm font-semibold text-stone-500'>
                                    Screen Size:
                                </td>
                                <td className='py-1 text-sm text-stone-700'>
                                    {bugData.screenSize || 'Unknown'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Section>

                {/* Reporter Info */}
                {(bugData.reporterName || bugData.reporterEmail) && (
                    <>
                        <Hr className='my-6 border-stone-200' />
                        <Heading
                            className='m-0 mb-4 text-lg font-semibold text-stone-900'
                            style={{
                                fontFamily:
                                    "'Playfair Display', Georgia, serif",
                            }}
                        >
                            Reporter Contact
                        </Heading>
                        <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                            {bugData.reporterName && (
                                <Text className='m-0 mb-2 text-base text-stone-700'>
                                    <strong>Name:</strong>{' '}
                                    {bugData.reporterName}
                                </Text>
                            )}
                            {bugData.reporterEmail && (
                                <Text className='m-0 text-base text-stone-700'>
                                    <strong>Email:</strong>{' '}
                                    <Link
                                        href={`mailto:${bugData.reporterEmail}`}
                                        className='text-[#D4AF37] no-underline'
                                    >
                                        {bugData.reporterEmail}
                                    </Link>
                                </Text>
                            )}
                        </Section>
                    </>
                )}

                {/* Timestamp Footer */}
                <Text className='m-0 mt-8 text-center text-sm text-stone-400 italic'>
                    Bug reported on {formattedDate}
                </Text>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
