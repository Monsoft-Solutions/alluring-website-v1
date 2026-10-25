/**
 * /bmi-calculator — BMI for plastic surgery, procedure by procedure (#346).
 *
 * The site's page for "do I qualify?" searches. The calculator comes first,
 * and its result shows where a BMI stands against the recommended range for
 * each procedure. One section per procedure follows, then the weight chart,
 * the way to reach a range, Florida's office-surgery rule, the consultation,
 * the FAQ and every source.
 *
 * Practice stance (owner, 2026-10-17): we encourage patients to reach the
 * recommended range before surgery, use the published range for each
 * procedure, and invite people to ask what applies to them. The ranges and
 * every figure live in `lib/data/bmi/bmi.facts.ts`;
 * `check:procedure-copy --slug bmi-calculator` checks the built page
 * against it.
 *
 * Server-rendered throughout; the calculator is the only client component
 * and the consultation thread the only other island. Motion is CSS
 * (`bmi-page.css`).
 */
import {
    BreadcrumbSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { BmiConsult } from '@/components/bmi-calculator/bmi-consult.component'
import { BmiFlorida } from '@/components/bmi-calculator/bmi-florida.component'
import { BmiGettingThere } from '@/components/bmi-calculator/bmi-getting-there.component'
import { BmiHero } from '@/components/bmi-calculator/bmi-hero.component'
import {
    BMI_ANCHORS,
    BMI_PAGE_UPDATED_ON,
} from '@/components/bmi-calculator/bmi-page.constant'
import { BmiProcedures } from '@/components/bmi-calculator/bmi-procedures.component'
import { BmiRanges } from '@/components/bmi-calculator/bmi-ranges.component'
import { BmiWeightChart } from '@/components/bmi-calculator/bmi-weight-chart.component'
import { ModuleFaq } from '@/components/procedures/module-kit/module-faq.component'
import { ModuleJumpNav } from '@/components/procedures/module-kit/module-layout.component'
import { ModuleSources } from '@/components/procedures/module-kit/module-sources.component'
import { bmiSources } from '@/lib/data/bmi/bmi.facts'
import { bmiFaqs } from '@/lib/data/faq/bmi-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

import '@/components/procedures/module-kit/module-kit.css'
import '@/components/bmi-calculator/bmi-page.css'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/bmi-calculator`

/**
 * Built around "BMI for plastic surgery" and the procedure terms people
 * search with it (Search Console, 90 days to 2026-10-14: "bmi for lipo
 * 360", "bmi for bbl", "bbl weight calculator", "max bmi for tummy tuck").
 * No surgeon name, no "free", no credential claims.
 */
const title = 'BMI for plastic surgery: BBL, lipo 360, tummy tuck calculator'
const description =
    'Check your BMI against the recommended range for a BBL, lipo 360, tummy tuck, mommy makeover and breast surgery, with sources, and how to reach your range.'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/bmi-calculator',
    title,
    description,
    keywords: [
        'bmi for plastic surgery',
        'bmi calculator for plastic surgery',
        'bmi for bbl',
        'bmi for lipo 360',
        'bmi for tummy tuck',
        'ideal weight for mommy makeover',
        'bmi for breast augmentation',
        'bmi for breast reduction',
    ],
    openGraph: {
        type: 'website',
        url: pageUrl,
        title,
        description,
        siteName: siteConfig.business.name,
        locale: 'en_US',
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name}, Miami`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
})

const JUMP_LINKS = [
    { label: 'Ranges', href: `#${BMI_ANCHORS.ranges}` },
    { label: 'BBL', href: '#bbl' },
    { label: 'Lipo 360', href: '#liposuction' },
    { label: 'Tummy tuck', href: '#tummy-tuck' },
    { label: 'Mommy makeover', href: '#mommy-makeover' },
    { label: 'Breasts', href: '#breast-augmentation' },
    { label: 'Weight chart', href: `#${BMI_ANCHORS.weightChart}` },
    { label: 'Getting there', href: `#${BMI_ANCHORS.gettingThere}` },
    { label: 'Florida', href: `#${BMI_ANCHORS.florida}` },
    { label: 'FAQ', href: `#${BMI_ANCHORS.faq}` },
] as const

export default function BmiCalculatorPage() {
    return (
        <>
            <WebPageSchema
                name='BMI for plastic surgery, procedure by procedure'
                url={pageUrl}
                description={description}
                dateModified={BMI_PAGE_UPDATED_ON}
                speakable={{ cssSelector: ['.answer-block__answer'] }}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', item: siteUrl },
                    { name: 'BMI calculator', item: pageUrl },
                ]}
            />
            <FAQSchema items={bmiFaqs} />

            <div className='bmi-page bg-stone-50'>
                <BmiHero />
                <ModuleJumpNav links={[...JUMP_LINKS]} />
                <BmiRanges />
                <BmiProcedures />
                <BmiWeightChart />
                <BmiGettingThere />
                <BmiFlorida />
                <BmiConsult />
                <ModuleFaq
                    faqs={bmiFaqs}
                    heading='BMI and plastic surgery questions'
                />
                <ModuleSources
                    sources={bmiSources}
                    updatedOn={BMI_PAGE_UPDATED_ON}
                    answer='Every range and figure on this page comes from a published source: ASPS and The Aesthetic Society, peer-reviewed studies indexed in PubMed, the CDC, the American Society of Anesthesiologists and the Florida Board of Medicine. We opened and read each one, and the list below links to every source we used.'
                />
            </div>
        </>
    )
}
