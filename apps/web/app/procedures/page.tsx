import {
    BreadcrumbSchema,
    ItemListSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { getResolvedProcedures } from '@/lib/data/procedures.resolved.server'
import { faqDataProcedures } from '@/lib/data/faq/procedures-faq-data'
import { getDiscountStatementText } from '@/lib/queries/pricing.query'
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
import { toProcedureSummary } from '@/lib/data/procedure-summary.util'
import { toAbsoluteUrl } from '@/lib/seo/procedure-graph.util'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { ProceduresPageContent } from '@/components/procedures/procedures-page-content.component'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/procedures`

const pageTitle = 'Cosmetic Surgery Procedures Miami | BBL, Breast, Body & Face'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/procedures',
    title: pageTitle,
    description:
        'Explore cosmetic procedures from one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, tummy tuck, liposuction & facial surgery. See before/afters.',
    keywords: [
        'plastic surgery miami',
        'cosmetic surgery miami',
        'breast augmentation',
        'brazilian butt lift',
        'tummy tuck',
        'mommy makeover',
        'liposuction miami',
        'facelift miami',
    ],

    // Open Graph tags for social sharing
    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description:
            'Explore cosmetic procedures from one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, tummy tuck, liposuction & facial surgery. See before/afters.',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Cosmetic Surgery Procedures at ${siteConfig.business.name} Miami`,
            },
        ],
    },

    // Twitter Card tags
    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            'Explore cosmetic procedures from one Miami surgeon, Victoria Karlinsky, MD, FACS. BBL, breast augmentation, tummy tuck, liposuction & facial surgery.',
        images: [`${siteUrl}/og-image.jpg`],
    },

    // Robots directives
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

export default async function ProceduresPage() {
    // Claim tokens in the procedures' copy are resolved first (#354).
    const [procedures, faqData, discountStatement] = await Promise.all([
        getResolvedProcedures(),
        resolveClaimsIn(faqDataProcedures, 'text', 'faq /procedures'),
        getDiscountStatementText(),
    ])

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedures', item: pageUrl },
    ]

    // ItemList elements for procedure listing schema
    const itemListElements = procedures.map((procedure, index) => ({
        position: index + 1,
        name: procedure.title,
        url: `${siteUrl}/procedures/${procedure.slug}`,
        image: toAbsoluteUrl(procedure.image, siteUrl),
        description: procedure.shortDescription || procedure.description,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Cosmetic Surgery Procedures | ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={`Discover our comprehensive range of cosmetic procedures at ${siteConfig.business.name} Miami. One surgeon, natural-looking results and personal care.`}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - ItemList Schema for procedure listing */}
            <ItemListSchema
                name='Cosmetic Surgery Procedures'
                description={`Comprehensive list of plastic surgery procedures offered at ${siteConfig.business.name} Miami`}
                url={pageUrl}
                itemListElement={itemListElements}
                mainEntityType='MedicalProcedure'
                itemListOrder='Unordered'
            />

            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                <ProceduresPageContent
                    procedures={procedures.map(toProcedureSummary)}
                    faqData={faqData}
                    discountStatement={discountStatement}
                />
            </ContainerLayout>
        </>
    )
}
