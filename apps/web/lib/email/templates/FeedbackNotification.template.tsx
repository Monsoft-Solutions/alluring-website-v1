/**
 * Feedback Notification Email Template
 *
 * Email sent to site owner when beta feedback is submitted.
 * Contains all feedback details organized by section.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
 *
 * @module lib/email/templates/FeedbackNotification.template
 */
import { Heading, Hr, Section, Text } from '@react-email/components'

import type { BetaFeedbackFormData } from '@/lib/types/forms/beta-feedback.type'

import { EmailFooter } from '../components/email-footer.component'
import { EmailHeader } from '../components/email-header.component'
import { EmailLayout } from '../components/email-layout.component'

type FeedbackNotificationProps = {
    readonly feedbackData: BetaFeedbackFormData
    readonly submittedAt: string
    readonly feedbackId: string
}

/**
 * Helper to render rating as visual stars
 */
function RatingDisplay({ rating, label }: { rating: number; label: string }) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
    return (
        <Text className='m-0 mb-3 text-base text-stone-700'>
            <strong>{label}:</strong>{' '}
            <span className='text-[#D4AF37]'>{stars}</span> ({rating}/5)
        </Text>
    )
}

/**
 * Feedback notification email template
 */
export function FeedbackNotificationEmail({
    feedbackData,
    submittedAt,
    feedbackId,
}: FeedbackNotificationProps) {
    const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    })

    return (
        <EmailLayout preview='New Beta Website Feedback Received'>
            <EmailHeader title='Beta Website Feedback' showTagline={false} />

            <Section className='px-10 py-8'>
                {/* Alert Banner */}
                <Section className='mb-6 rounded-lg border-2 border-[#D4AF37] bg-[#faf8f3] p-4 text-center'>
                    <Text className='m-0 text-base font-semibold text-stone-900'>
                        📋 New Beta Feedback Received
                    </Text>
                    <Text className='m-0 mt-1 text-sm text-stone-600'>
                        {formattedDate}
                    </Text>
                    <Text className='m-0 mt-1 text-xs text-stone-400'>
                        ID: {feedbackId}
                    </Text>
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Device Info */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Device Information
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <Text className='m-0 mb-2 text-base text-stone-700'>
                        <strong>Device:</strong>{' '}
                        {feedbackData.deviceType === 'other'
                            ? feedbackData.deviceTypeOther
                            : feedbackData.deviceType}
                    </Text>
                    <Text className='m-0 text-base text-stone-700'>
                        <strong>Browser:</strong>{' '}
                        {feedbackData.browserType === 'other'
                            ? feedbackData.browserTypeOther
                            : feedbackData.browserType}
                    </Text>
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Design Ratings */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Design & Aesthetics
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <RatingDisplay
                        rating={feedbackData.overallDesignRating}
                        label='Overall Design'
                    />
                    <RatingDisplay
                        rating={feedbackData.visualAestheticsRating}
                        label='Visual Aesthetics'
                    />

                    {feedbackData.designLikes && (
                        <>
                            <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                What They Liked
                            </Text>
                            <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-700'>
                                {feedbackData.designLikes}
                            </Text>
                        </>
                    )}

                    {feedbackData.designDislikes && (
                        <>
                            <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                Areas for Improvement
                            </Text>
                            <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-700'>
                                {feedbackData.designDislikes}
                            </Text>
                        </>
                    )}
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Navigation */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Navigation & Usability
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <Text className='m-0 mb-2 text-base text-stone-700'>
                        <strong>Ease of Navigation:</strong>{' '}
                        {feedbackData.navigationEase?.replace(/-/g, ' ')}
                    </Text>
                    <Text className='m-0 text-base text-stone-700'>
                        <strong>Broken Links Found:</strong>{' '}
                        {feedbackData.hasBrokenLinks ? '⚠️ Yes' : '✅ No'}
                    </Text>

                    {feedbackData.hasBrokenLinks &&
                        feedbackData.brokenLinksDescription && (
                            <>
                                <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                    Navigation Issues Reported
                                </Text>
                                <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-red-700'>
                                    {feedbackData.brokenLinksDescription}
                                </Text>
                            </>
                        )}
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Content Quality */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Content & Wording
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <RatingDisplay
                        rating={feedbackData.wordingClarityRating}
                        label='Wording Clarity'
                    />
                    <Text className='m-0 text-base text-stone-700'>
                        <strong>Typos/Grammar Issues:</strong>{' '}
                        {feedbackData.hasTypos ? '⚠️ Yes' : '✅ No'}
                    </Text>

                    {feedbackData.hasTypos && feedbackData.typosDescription && (
                        <>
                            <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                Typos/Grammar Issues Found
                            </Text>
                            <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-orange-700'>
                                {feedbackData.typosDescription}
                            </Text>
                        </>
                    )}
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Technical Issues */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Technical Issues
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <Text className='m-0 text-base text-stone-700'>
                        <strong>Technical Issues Found:</strong>{' '}
                        {feedbackData.hasTechnicalIssues ? '🐛 Yes' : '✅ No'}
                    </Text>

                    {feedbackData.hasTechnicalIssues &&
                        feedbackData.technicalIssuesDescription && (
                            <>
                                <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                    Bug Report
                                </Text>
                                <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-red-700'>
                                    {feedbackData.technicalIssuesDescription}
                                </Text>
                            </>
                        )}
                </Section>

                <Hr className='my-6 border-stone-200' />

                {/* Overall Impression */}
                <Heading
                    className='m-0 mb-4 text-lg font-semibold text-stone-900'
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Overall Impression
                </Heading>
                <Section className='mb-6 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <RatingDisplay
                        rating={feedbackData.overallSatisfactionRating}
                        label='Overall Satisfaction'
                    />

                    {feedbackData.recommendations && (
                        <>
                            <Text className='m-0 mt-4 mb-1 text-xs font-semibold tracking-wide text-stone-500 uppercase'>
                                Recommendations
                            </Text>
                            <Text className='m-0 text-base leading-relaxed whitespace-pre-wrap text-stone-700'>
                                {feedbackData.recommendations}
                            </Text>
                        </>
                    )}

                    <Text className='m-0 mt-4 text-base text-stone-700'>
                        <strong>Wants UX Testing:</strong>{' '}
                        {feedbackData.wantsUxTesting ? '✅ Yes' : 'No'}
                    </Text>

                    {feedbackData.wantsUxTesting && feedbackData.email && (
                        <Text className='m-0 mt-1 text-base text-stone-700'>
                            <strong>Contact Email:</strong> {feedbackData.email}
                        </Text>
                    )}
                </Section>

                {/* Timestamp Footer */}
                <Text className='m-0 mt-8 text-center text-sm text-stone-400 italic'>
                    Feedback submitted on {formattedDate}
                </Text>
            </Section>

            <EmailFooter />
        </EmailLayout>
    )
}
