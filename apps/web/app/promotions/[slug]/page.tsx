import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { ContainerLayout } from '@/components/container-layout.component'
import {
    getPromotionBySlug,
    getPromotionLink,
    formatDiscount,
    getRemainingDays,
    isExpiringSoon,
} from '@/lib/queries/promotion.query'
import { PromotionViewTracker } from '@/components/promotions'
import { siteConfig } from '@/lib/data/site-config'

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

    return {
        title: `${promotion.title} | ${siteConfig.business.name}`,
        description: promotion.excerpt ?? promotion.description.slice(0, 160),
        openGraph: {
            title: promotion.title,
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
    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)
    const expiringSoon = isExpiringSoon(promotion)

    const typeLabels = {
        discount: 'Limited Time Discount',
        seasonal: 'Seasonal Special',
        bundle: 'Package Deal',
        financing: 'Financing Offer',
    }

    return (
        <ContainerLayout>
            <div className='relative py-12 md:py-16'>
                {/* Client-side view tracking - triggers after user views promotion */}
                <PromotionViewTracker promotionId={promotion.id} />

                {/* Breadcrumb */}
                <nav className='mb-8'>
                    <Button
                        variant='ghost'
                        size='sm'
                        asChild
                        className='text-stone-600'
                    >
                        <Link href='/promotions'>
                            <ArrowLeft className='mr-2 h-4 w-4' />
                            Back to Promotions
                        </Link>
                    </Button>
                </nav>

                <div className='grid gap-12 lg:grid-cols-12'>
                    {/* Main Content */}
                    <div className='lg:col-span-8'>
                        {/* Hero Image */}
                        {promotion.imageUrl && (
                            <div className='relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl'>
                                <Image
                                    src={promotion.imageUrl}
                                    alt={promotion.imageAlt ?? promotion.title}
                                    fill
                                    className='object-cover'
                                    priority
                                />

                                {/* Discount Badge Overlay */}
                                {discount && (
                                    <div className='absolute top-6 right-6'>
                                        <span className='bg-gold-500 rounded-xl px-6 py-3 font-serif text-2xl font-bold text-stone-900 shadow-lg md:text-3xl'>
                                            {discount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video (if available) */}
                        {promotion.videoUrl && (
                            <div className='mb-8 overflow-hidden rounded-2xl'>
                                <video
                                    src={promotion.videoUrl}
                                    poster={promotion.thumbnailUrl ?? undefined}
                                    controls
                                    className='w-full'
                                >
                                    Your browser does not support the video tag.
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

                                {expiringSoon && daysRemaining !== null && (
                                    <span className='flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700'>
                                        <Clock className='h-4 w-4' />
                                        {daysRemaining === 0
                                            ? 'Ends Today!'
                                            : daysRemaining === 1
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
                        <div
                            className='prose prose-stone prose-lg max-w-none'
                            dangerouslySetInnerHTML={{
                                __html: promotion.description,
                            }}
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
                                {promotion.type === 'discount' &&
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
                                {(promotion.startsAt || promotion.endsAt) && (
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
                                        <span className='text-gold-500'>✓</span>
                                        Board-Certified Surgeons
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='text-gold-500'>✓</span>
                                        AAAASF Accredited Facility
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='text-gold-500'>✓</span>
                                        Flexible Financing Options
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='text-gold-500'>✓</span>
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
                                    Our team is here to help you learn more
                                    about this offer.
                                </p>
                                <a
                                    href={`tel:${siteConfig.contact.phone}`}
                                    className='text-gold-600 hover:text-gold-700 font-semibold'
                                >
                                    {siteConfig.contact.phoneDisplay}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ContainerLayout>
    )
}
