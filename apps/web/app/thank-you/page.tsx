/**
 * Thank You Page
 *
 * Confirmation page displayed after successful form submission.
 * Sets expectations for follow-up and guides users to explore more content.
 *
 * Features:
 * - Success confirmation with expected callback timeline
 * - Trust indicators and immediate contact options
 * - AI chat section for immediate engagement and lead qualification
 * - Links to key site sections
 * - No-indexed to prevent search engine indexing
 */

import { OrganizationSchema, WebPageSchema } from '@workspace/seo/react'

import { ThankYouHero } from '@/components/sections/thank-you/thank-you-hero.component'
import { ThankYouChatSection } from '@/components/chat/thank-you-chat-section.component'
import { ExploreSection } from '@/components/sections/thank-you/explore-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Thank You Page Metadata
 *
 * - No-indexed to prevent search engines from indexing this page
 * - Basic metadata for social sharing
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/thank-you',
    title: 'Thank You',
    description:
        "Thank you for contacting us! We've received your information and will be in touch shortly to schedule your consultation.",
    robots: {
        index: false,
        follow: false,
    },
})

export default function ThankYouPage() {
    return (
        <>
            {/* SEO Schema */}
            <WebPageSchema
                name={`Thank You - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/thank-you`}
                description="Thank you for reaching out. We'll contact you shortly to schedule your consultation."
            />

            <OrganizationSchema
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            {/* Main Content */}
            <main className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                {/* Section 1: Thank You Hero */}
                <ThankYouHero id='thank-you-hero' />

                {/* Section 2: Chat Section - Engage while waiting */}
                <ThankYouChatSection id='chat' />

                {/* Section 3: Explore More */}
                <ExploreSection id='explore' />
            </main>
        </>
    )
}
