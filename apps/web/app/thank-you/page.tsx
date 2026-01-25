/**
 * Thank You Page
 *
 * Confirmation page displayed after successful form submission.
 * Sets expectations for follow-up and guides users to explore more content.
 *
 * Features:
 * - Success confirmation with expected callback timeline
 * - Trust indicators and immediate contact options
 * - Links to key site sections
 * - No-indexed to prevent search engine indexing
 */

import { WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { ThankYouHero } from '@/components/sections/thank-you/thank-you-hero.component'
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

            {/* Main Content */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Thank You Hero */}
                <ThankYouHero id='thank-you-hero' />

                {/* Section 2: Explore More */}
                <ExploreSection id='explore' />
            </ContainerLayout>
        </>
    )
}
