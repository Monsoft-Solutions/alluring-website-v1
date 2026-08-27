import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { OfferSchema } from '@workspace/seo/react'

import {
    formatDiscount,
    getPromotionBySlug,
    getPromotionLink,
    getRemainingDays,
    isExpiringSoon,
} from '@/lib/queries/promotion.query'
import { PromotionViewTracker } from '@/components/promotions/promotion-view-tracker.component'
import { PromotionMarkdown } from '@/components/promotions/promotion-markdown.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'

// 10 minutes, not the hour the other content routes use. Promotion *writes* fire
// revalidateTag, but a promotion expiring is not a write — nothing invalidates
// when it passes endsAt, and getPromotionBySlug filters on now(), so cached HTML
// can still be showing a getRemainingDays countdown for an offer that has ended.
// This sits on top of the query's own CACHE_TTL, so it caps what this route adds.
export const revalidate = 600

type Params = Promise<{ slug: string }>

export async function generateMetadata({
    params,
}: {
    params: Params
}): Promise<Metadata> {
    const { slug } = await params
    const promotion = await getPromotionBySlug(slug)

    if (!promotion) {
        return {
            title: 'Promotion Not Found',
        }
    }

    const pageTitle = promotion.title

    return {
        title: pageTitle,
        description: promotion.excerpt ?? promotion.description.slice(0, 160),
        openGraph: {
            title: pageTitle,
            description:
                promotion.excerpt ?? promotion.description.slice(0, 160),
            type: 'article',
            images: promotion.imageUrl
                ? [{ url: promotion.imageUrl }]
                : undefined,
        },
    }
}

export default async function PromotionDetailPage({
    params,
}: {
    params: Params
}) {
    const { slug } = await params
    const promotion = await getPromotionBySlug(slug)

    if (!promotion) {
        notFound()
    }

    const link = getPromotionLink(promotion)
    const daysRemaining = getRemainingDays(promotion)
    const expiringSoon = isExpiringSoon(promotion)

    const typeLabels = {
        discount: 'Limited Time Discount',
        seasonal: 'Seasonal Special',
        bundle: 'Package Deal',
        financing: 'Financing Offer',
    }

    // Build the full URL for the promotion
    const promotionUrl = `${seoConfig.siteUrl}/promotions/${promotion.slug}`

    // Build discount description
    const discount = formatDiscount(promotion)
    const discountDescription = discount
        ? `${discount} - ${promotion.title}`
        : undefined

    return (
        <>
            {/* SEO Schema */}
            <OfferSchema
                name={promotion.title}
                description={promotion.excerpt ?? promotion.description}
                url={promotionUrl}
                validFrom={
                    promotion.startsAt
                        ? new Date(promotion.startsAt).toISOString()
                        : undefined
                }
                validThrough={
                    promotion.endsAt
                        ? new Date(promotion.endsAt).toISOString()
                        : undefined
                }
                priceValidUntil={
                    promotion.endsAt
                        ? new Date(promotion.endsAt).toISOString()
                        : undefined
                }
                availability='LimitedAvailability'
                category={promotion.type}
                image={promotion.imageUrl ?? undefined}
                discount={discount ?? undefined}
                discountDescription={discountDescription}
                offeredBy={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    type: 'MedicalBusiness',
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                }}
                itemOffered={
                    promotion.procedureSlug
                        ? {
                              type: 'MedicalProcedure',
                              name: promotion.title
                                  .replace(/\d+%?\s*(OFF|off)?\s*/g, '')
                                  .trim(),
                              url: `${seoConfig.siteUrl}/procedures/${promotion.procedureSlug}`,
                          }
                        : undefined
                }
            />

            {/* Client-side view tracking */}
            <PromotionViewTracker promotionId={promotion.id} />

            {/* Full-bleed Hero Section */}
            <section className='relative w-full'>
                {/* Sticky Image Background - taller on mobile for vertical images */}
                <div className='sticky top-0 z-0 h-[100svh] w-full overflow-hidden md:h-screen'>
                    {promotion.imageUrl ? (
                        <>
                            <Image
                                src={promotion.imageUrl}
                                alt={promotion.imageAlt ?? promotion.title}
                                fill
                                className='pointer-events-none object-cover object-top'
                                priority
                                sizes='100vw'
                            />
                        </>
                    ) : (
                        <div className='h-full w-full bg-gradient-to-br from-stone-800 to-stone-900' />
                    )}

                    {/* Scroll Indicator */}
                    <div className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-white/80 md:left-12 md:translate-x-0'>
                        <span className='text-xs tracking-widest uppercase drop-shadow-md'>
                            Scroll
                        </span>
                        <div className='h-12 w-px bg-white/50 drop-shadow-md' />
                    </div>
                </div>

                {/* Scrollable Content Wrapper */}
                <div className='relative z-10 -mt-[100svh] w-full md:-mt-[100vh]'>
                    {/* Mobile Spacer: push content down to show most of the image */}
                    <div className='h-[85svh] w-full shrink-0 md:hidden' />

                    {/* Desktop Spacer */}
                    <div className='hidden h-[50vh] w-full shrink-0 md:block' />

                    {/* Content Container */}
                    <div className='pointer-events-none container mx-auto px-4 pb-12 md:px-8 lg:px-12'>
                        {/* Glassmorphism Card */}
                        <div className='pointer-events-auto'>
                            <div className='animate-fade-in-up border border-white/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl md:bg-white/80 md:p-10 lg:p-12'>
                                {/* Back Button */}
                                <nav className='mb-6'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        asChild
                                        className='text-stone-600 hover:text-stone-900'
                                    >
                                        <Link href='/promotions'>
                                            <ArrowLeft className='mr-2 h-4 w-4' />
                                            Back to Promotions
                                        </Link>
                                    </Button>
                                </nav>

                                <div className='grid gap-8 lg:grid-cols-12 lg:gap-12'>
                                    {/* Main Content */}
                                    <div className='lg:col-span-8'>
                                        {/* Video (if available) */}
                                        {promotion.videoUrl && (
                                            <div className='mb-8 overflow-hidden rounded-xl'>
                                                <video
                                                    src={promotion.videoUrl}
                                                    poster={
                                                        promotion.thumbnailUrl ??
                                                        undefined
                                                    }
                                                    controls
                                                    className='w-full'
                                                >
                                                    Your browser does not
                                                    support the video tag.
                                                </video>
                                            </div>
                                        )}

                                        {/* Title and Badges */}
                                        <div className='mb-6'>
                                            <div className='mb-4 flex flex-wrap items-center gap-3'>
                                                <span className='border-gold-500/30 bg-gold-500/10 rounded-full border px-4 py-1.5 text-sm font-medium text-stone-700'>
                                                    <Sparkles className='text-gold-500 mr-2 inline h-4 w-4' />
                                                    {typeLabels[promotion.type]}
                                                </span>

                                                {expiringSoon &&
                                                    daysRemaining !== null && (
                                                        <span className='flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700'>
                                                            <Clock className='h-4 w-4' />
                                                            {daysRemaining === 0
                                                                ? 'Ends Today!'
                                                                : daysRemaining ===
                                                                    1
                                                                  ? '1 Day Left'
                                                                  : `${daysRemaining} Days Left`}
                                                        </span>
                                                    )}
                                            </div>

                                            <h1 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                                                {promotion.title}
                                            </h1>

                                            <div className='bg-gold-500 mb-6 h-1 w-20' />
                                        </div>

                                        {/* Description */}
                                        <PromotionMarkdown
                                            content={promotion.description}
                                            className='prose prose-stone prose-lg max-w-none'
                                        />
                                    </div>

                                    {/* Sidebar */}
                                    <div className='lg:col-span-4'>
                                        <div className='sticky top-8 space-y-6'>
                                            {/* CTA Card */}
                                            <div className='rounded-2xl border border-stone-200 bg-white p-6 shadow-sm'>
                                                <h3 className='mb-4 font-serif text-xl text-stone-900'>
                                                    Take Advantage of This Offer
                                                </h3>

                                                {/* Discount Summary */}
                                                {promotion.type ===
                                                    'discount' &&
                                                    promotion.discountValue && (
                                                        <div className='mb-6 rounded-xl bg-stone-50 p-4 text-center'>
                                                            <div className='text-gold-600 font-serif text-4xl font-bold'>
                                                                {promotion.discountTypeValue ===
                                                                'percentage'
                                                                    ? `${promotion.discountValue}%`
                                                                    : `$${promotion.discountValue}`}
                                                            </div>
                                                            <div className='text-sm font-medium text-stone-600 uppercase'>
                                                                {promotion.discountTypeValue ===
                                                                'percentage'
                                                                    ? 'Percentage Off'
                                                                    : 'Savings'}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Date Range */}
                                                {(promotion.startsAt ||
                                                    promotion.endsAt) && (
                                                    <div className='mb-6 space-y-2 text-sm text-stone-600'>
                                                        {promotion.startsAt && (
                                                            <div className='flex items-center gap-2'>
                                                                <Calendar className='h-4 w-4' />
                                                                <span>
                                                                    Starts:{' '}
                                                                    {new Date(
                                                                        promotion.startsAt
                                                                    ).toLocaleDateString(
                                                                        'en-US',
                                                                        {
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {promotion.endsAt && (
                                                            <div className='flex items-center gap-2'>
                                                                <Calendar className='h-4 w-4' />
                                                                <span>
                                                                    Ends:{' '}
                                                                    {new Date(
                                                                        promotion.endsAt
                                                                    ).toLocaleDateString(
                                                                        'en-US',
                                                                        {
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Primary CTA */}
                                                <Button
                                                    asChild
                                                    size='lg'
                                                    className='bg-gold-500 hover:bg-gold-600 group w-full border-none text-white'
                                                >
                                                    <Link href={link}>
                                                        {promotion.ctaText}
                                                        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                                    </Link>
                                                </Button>

                                                {/* Secondary CTA */}
                                                <Button
                                                    asChild
                                                    variant='outline'
                                                    size='lg'
                                                    className='mt-3 w-full'
                                                >
                                                    <Link href='/contact-us'>
                                                        Schedule Consultation
                                                    </Link>
                                                </Button>
                                            </div>

                                            {/* Trust Indicators */}
                                            <div className='rounded-2xl border border-stone-200 bg-stone-50 p-6'>
                                                <h4 className='mb-4 text-sm font-medium tracking-wide text-stone-500 uppercase'>
                                                    Why Choose Us
                                                </h4>
                                                <ul className='space-y-3 text-sm text-stone-700'>
                                                    <li className='flex items-start gap-2'>
                                                        <span className='text-gold-500'>
                                                            ✓
                                                        </span>
                                                        Board-Certified Surgeons
                                                    </li>
                                                    <li className='flex items-start gap-2'>
                                                        <span className='text-gold-500'>
                                                            ✓
                                                        </span>
                                                        Double Board-Certified
                                                        Surgeons
                                                    </li>
                                                    <li className='flex items-start gap-2'>
                                                        <span className='text-gold-500'>
                                                            ✓
                                                        </span>
                                                        Flexible Financing
                                                        Options
                                                    </li>
                                                    <li className='flex items-start gap-2'>
                                                        <span className='text-gold-500'>
                                                            ✓
                                                        </span>
                                                        5-Star Patient Reviews
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Contact Info */}
                                            <div className='rounded-2xl border border-stone-200 bg-white p-6'>
                                                <h4 className='mb-4 text-sm font-medium tracking-wide text-stone-500 uppercase'>
                                                    Questions?
                                                </h4>
                                                <p className='mb-4 text-sm text-stone-600'>
                                                    Our team is here to help you
                                                    learn more about this offer.
                                                </p>
                                                <a
                                                    href={`tel:${siteConfig.contact.phone}`}
                                                    className='text-gold-600 hover:text-gold-700 font-semibold'
                                                >
                                                    {
                                                        siteConfig.contact
                                                            .phoneDisplay
                                                    }
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
