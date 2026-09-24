/**
 * /thank-you/consultation — where the consultation thread on /contact-us and
 * the specials page lands (#274).
 *
 * A full page load (the thread uses `window.location.assign`), and the path
 * contains "thank-you", so the tag container's conversion tags fire as they
 * do on /thank-you. Everything personal on it is read in the browser.
 */

import { ContainerLayout } from '@/components/container-layout.component'
import { ConsultationThankYou } from '@/components/sections/thank-you/consultation-thank-you.component'
import { ExploreSection } from '@/components/sections/thank-you/explore-section.component'
import { SITE_CHAT_LEAD_KEY } from '@/components/shared/consult-chat/site-chat.constants'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/thank-you/consultation',
    title: 'Request Received',
    description:
        'We received your consultation request and will text you within 24 hours to book your free consultation.',
    robots: {
        index: false,
        follow: false,
    },
})

export default function ConsultationThankYouPage() {
    return (
        <ContainerLayout as='div' noPaddingTop noPadding size='full'>
            <ConsultationThankYou leadStorageKey={SITE_CHAT_LEAD_KEY} />
            <ExploreSection id='explore' />
        </ContainerLayout>
    )
}
