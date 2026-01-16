import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { procedures } from '@/lib/data/procedures.data'
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
        'Explore 15+ cosmetic procedures from board-certified Miami surgeons. BBL, breast augmentation, tummy tuck, liposuction & facial surgery. See before/afters.',
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
            'Explore 15+ cosmetic procedures from board-certified Miami surgeons. BBL, breast augmentation, tummy tuck, liposuction & facial surgery. See before/afters.',
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
            'Explore 15+ cosmetic procedures from board-certified Miami surgeons. BBL, breast augmentation, tummy tuck, liposuction & facial surgery.',
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

export default function ProceduresPage() {
    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedures', item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Cosmetic Surgery Procedures | ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={`Discover our comprehensive range of cosmetic procedures at ${siteConfig.business.name} Miami. Expert surgeons, natural results, and personalized care.`}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                <ProceduresPageContent procedures={procedures} />
            </ContainerLayout>
        </>
    )
}
