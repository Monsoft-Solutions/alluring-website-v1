/**
 * ContactAlternative Component
 *
 * Alternative contact methods section with location, hours, and social links.
 * Features a two-column layout with map/image and contact details.
 *
 * Features:
 * - Location preview with address
 * - Business hours display
 * - Phone and email quick links
 * - Social media connections
 * - Elegant dark theme design
 */
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ExternalLink,
    Instagram,
    Facebook,
} from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import {
    siteConfig,
    getPhoneLink,
    getEmailLink,
    getFullAddress,
    getMapEmbedUrl,
} from '@/lib/data/site-config'

export type ContactAlternativeProps = {
    readonly id?: string
}

export function ContactAlternative({
    id = 'contact-info',
}: ContactAlternativeProps) {
    const { contact, social } = siteConfig
    const mapEmbedUrl = getMapEmbedUrl()

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-900'
            paddingY='py-24 lg:py-32'
        >
            {/* Background Decorations */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-600/10 absolute -top-[20%] right-[10%] h-[500px] w-[500px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-stone-700/30 blur-3xl' />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
                    {/* Left Column - Map/Location Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {/* Google Maps Embed */}
                        <div className='relative aspect-[4/3] overflow-hidden border border-white/10 bg-stone-800'>
                            <iframe
                                src={mapEmbedUrl}
                                width='100%'
                                height='100%'
                                style={{ border: 0 }}
                                allowFullScreen
                                loading='lazy'
                                referrerPolicy='no-referrer-when-downgrade'
                                title={`${siteConfig.business.name} Location`}
                                className='grayscale invert-[0.9] filter'
                            />

                            {/* Overlay with Address */}
                            <div className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent p-6'>
                                <div className='flex items-start gap-3'>
                                    <MapPin className='text-gold-400 mt-1 h-5 w-5 flex-shrink-0' />
                                    <div>
                                        <p className='text-sm font-bold tracking-widest text-white uppercase'>
                                            Our Location
                                        </p>
                                        <p className='mt-1 text-stone-300'>
                                            {getFullAddress()}
                                        </p>
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(getFullAddress())}`}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-gold-400 hover:text-gold-300 mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors'
                                        >
                                            Get Directions
                                            <ExternalLink className='h-3 w-3' />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Contact Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className='flex flex-col justify-center'
                    >
                        {/* Header */}
                        <div className='mb-10'>
                            <span className='bg-gold-400 mb-4 inline-block h-[2px] w-12' />
                            <h2 className='mb-4 font-serif text-3xl text-white md:text-4xl'>
                                Other Ways to Reach Us
                            </h2>
                            <p className='text-lg text-stone-400'>
                                Prefer to call or visit? We&apos;re here for
                                you.
                            </p>
                        </div>

                        {/* Contact Cards */}
                        <div className='mb-10 space-y-4'>
                            {/* Phone */}
                            <a
                                href={getPhoneLink()}
                                className='group flex items-center gap-4 border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/10'
                            >
                                <div className='bg-gold-500/20 group-hover:bg-gold-500 flex h-12 w-12 items-center justify-center transition-colors'>
                                    <Phone className='text-gold-400 h-5 w-5 group-hover:text-white' />
                                </div>
                                <div>
                                    <p className='text-xs font-bold tracking-widest text-stone-500 uppercase'>
                                        Call Us
                                    </p>
                                    <p className='text-gold-400 text-lg font-semibold'>
                                        {contact.phoneDisplay}
                                    </p>
                                </div>
                            </a>

                            {/* Email */}
                            <a
                                href={getEmailLink()}
                                className='group flex items-center gap-4 border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/10'
                            >
                                <div className='bg-gold-500/20 group-hover:bg-gold-500 flex h-12 w-12 items-center justify-center transition-colors'>
                                    <Mail className='text-gold-400 h-5 w-5 group-hover:text-white' />
                                </div>
                                <div>
                                    <p className='text-xs font-bold tracking-widest text-stone-500 uppercase'>
                                        Email Us
                                    </p>
                                    <p className='text-white'>
                                        {contact.email}
                                    </p>
                                </div>
                            </a>

                            {/* Hours */}
                            <div className='border border-white/10 bg-white/5 p-5'>
                                <div className='flex items-start gap-4'>
                                    <div className='bg-gold-500/20 flex h-12 w-12 flex-shrink-0 items-center justify-center'>
                                        <Clock className='text-gold-400 h-5 w-5' />
                                    </div>
                                    <div className='flex-1'>
                                        <p className='mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase'>
                                            Business Hours
                                        </p>
                                        <div className='space-y-2'>
                                            {contact.businessHours?.map(
                                                (hours, index) => (
                                                    <div
                                                        key={index}
                                                        className='flex justify-between text-sm'
                                                    >
                                                        <span className='text-stone-400'>
                                                            {hours.days}
                                                        </span>
                                                        <span className='text-white'>
                                                            {hours.open ===
                                                            'Closed'
                                                                ? 'Closed'
                                                                : `${hours.open} - ${hours.close}`}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <p className='mb-4 text-xs font-bold tracking-widest text-stone-500 uppercase'>
                                Follow Us
                            </p>
                            <div className='flex gap-3'>
                                {social.map((item) => {
                                    // Use Lucide icons for social platforms
                                    const IconComponent =
                                        item.platform === 'instagram'
                                            ? Instagram
                                            : item.platform === 'facebook'
                                              ? Facebook
                                              : Instagram // Default fallback

                                    return (
                                        <Link
                                            key={item.platform}
                                            href={item.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            aria-label={item.label}
                                            className='hover:bg-gold-500 flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-transparent'
                                        >
                                            <IconComponent className='h-5 w-5' />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
