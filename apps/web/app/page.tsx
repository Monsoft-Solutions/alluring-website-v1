import { Metadata } from 'next'

import { Hero } from '@/components/home/hero.component'
import { Journey } from '@/components/home/journey.component'
import { Procedures } from '@/components/home/procedures.component'
import { BeforeAfter } from '@/components/home/before-after.component'
import { WhyUs } from '@/components/home/why-us.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { Testimonials } from '@/components/home/testimonials.component'
import { FAQ } from '@/components/home/faq.component'
import { LeadForm } from '@/components/home/lead-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Homepage Metadata
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: {
        default: siteConfig.business.name,
        template: `%s | ${siteConfig.business.name}`,
    },
    description: siteConfig.business.description,
})

/**
 * Homepage Component
 *
 * The main landing page of the website.
 * Adapted from the prototype design with all sections in order.
 */
export default function Page() {
    return (
        <div className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
            <Hero />
            <Journey />
            <Procedures />
            <BeforeAfter />
            <WhyUs />
            <Surgeons />
            <Testimonials />
            <FAQ />
            <LeadForm />
        </div>
    )
}
