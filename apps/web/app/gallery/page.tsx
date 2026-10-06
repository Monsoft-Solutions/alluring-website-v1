import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import { Award, Users, Building2 } from 'lucide-react'

import { GalleryMediaGrid } from '@/components/gallery/gallery-media-grid.component'
import { GalleryIndexHero } from '@/components/gallery-page/gallery-index-hero.component'
import { GalleryProcedureCards } from '@/components/gallery-page/gallery-procedure-nav.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { getGalleryOverview } from '@/lib/queries/gallery/gallery-overview.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/gallery`

// Leads with the query the page is found for ("alluring plastic surgery
// photos", GSC Jul–Oct 2026). The old title's "500+ Real Results" was not
// true of the gallery's count.
const pageTitle = 'Alluring Plastic Surgery Photos | Before & After Miami'
const pageDescription =
    'Before-and-after photos and videos of real Alluring Plastic Surgery patients in Miami: BBL, tummy tuck, mommy makeover, breast and arm lift, liposuction and more.'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/gallery',
    title: pageTitle,
    description: pageDescription,
    keywords: [
        'alluring plastic surgery photos',
        'plastic surgery before after photos Miami',
        'BBL before after',
        'tummy tuck before after',
        'mommy makeover before after',
        'breast augmentation before after',
        'liposuction before after',
        'arm lift before after',
    ],
    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description: pageDescription,
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Before and after gallery at ${siteConfig.business.name} Miami`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [`${siteUrl}/og-image.jpg`],
    },
    robots: { index: true, follow: true },
})

const container = 'mx-auto w-full max-w-[78rem] px-5 md:px-8'
const heading =
    'gp-display text-[2.25rem] leading-[1.02] tracking-[-0.015em] text-balance md:text-[3.25rem]'
const lead = 'text-[1.0625rem] leading-[1.65] text-pretty md:text-[1.125rem]'

export default async function GalleryPage() {
    const overview = await getGalleryOverview()
    const { procedures, latest, videos } = overview

    return (
        <>
            <WebPageSchema
                name={`Before & After Gallery | ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={pageDescription}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', item: siteUrl },
                    { name: 'Gallery', item: pageUrl },
                ]}
            />

            <GalleryIndexHero overview={overview} />

            {/* Procedures */}
            <section
                id='procedures'
                aria-labelledby='procedures-title'
                className='bg-[var(--gp-linen)] py-16 md:py-24'
            >
                <div className={container}>
                    <div className='max-w-[42rem]'>
                        <p className='gp-eyebrow'>Browse by procedure</p>
                        <h2 id='procedures-title' className={`${heading} mt-5`}>
                            Results for <em>your</em> procedure
                        </h2>
                        <p className={`${lead} mt-5 text-[var(--gp-ink-2)]`}>
                            Each collection holds every published result for
                            that procedure, newest first. Combination surgeries
                            appear in each procedure they include.
                        </p>
                    </div>
                    <GalleryProcedureCards
                        procedures={procedures}
                        className='mt-12'
                    />
                </div>
            </section>

            {/* Newest results */}
            {latest.length > 0 && (
                <section
                    aria-labelledby='latest-title'
                    className='py-16 md:py-24'
                >
                    <div className={container}>
                        <div className='max-w-[42rem]'>
                            <p className='gp-eyebrow'>Newest</p>
                            <h2 id='latest-title' className={`${heading} mt-5`}>
                                Recently added <em>results</em>
                            </h2>
                            <p
                                className={`${lead} mt-5 text-[var(--gp-ink-2)]`}
                            >
                                The latest before-and-afters from every
                                procedure. Tap one to see it full size.
                            </p>
                        </div>
                        <GalleryMediaGrid
                            media={latest}
                            linkToDetail={false}
                            className='mt-12'
                        />
                    </div>
                </section>
            )}

            {/* Videos */}
            {videos.length > 0 && (
                <section
                    aria-labelledby='videos-title'
                    className='gp-dark bg-[var(--gp-cocoa)] py-16 text-[var(--gp-porcelain)] md:py-24'
                >
                    <div className={container}>
                        <div className='max-w-[42rem]'>
                            <p className='gp-eyebrow'>Videos</p>
                            <h2 id='videos-title' className={`${heading} mt-5`}>
                                Watch the <em>change</em>
                            </h2>
                            <p className={`${lead} mt-5 text-stone-300`}>
                                Short clips that go from before to after, some
                                from the operating room and some months later.
                                Each one says how long after surgery it was
                                taken.
                            </p>
                        </div>
                        <GalleryMediaGrid
                            media={videos}
                            linkToDetail={false}
                            tone='dark'
                            className='mt-12'
                        />
                    </div>
                </section>
            )}

            <CTASection
                variant='luxury'
                eyebrow='Your result starts with a conversation'
                heading='Ready to see what is possible for you?'
                description='Every result in this gallery started with a free consultation. Bring your questions and your goals, and leave with a plan made for your body.'
                primaryButton={{
                    text: 'Book a free consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call us',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
                backgroundImage='/images/hero-beautiful-latin-woman.jpg'
                trustBadges={[
                    {
                        icon: <Award className='h-5 w-5' />,
                        label: 'Board-certified surgeons',
                    },
                    {
                        icon: <Users className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.patients ?? '5,000+'} patients`,
                    },
                    {
                        icon: <Building2 className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.years ?? '15+'} years of experience`,
                    },
                ]}
            />
        </>
    )
}
