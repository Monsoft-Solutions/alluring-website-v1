/**
 * Atelier Hero
 *
 * The arch is the direction's signature form and it carries the video
 * rather than a still — the same footage as the live site, but framed
 * instead of used as wallpaper behind text. Framing it means the scrim can
 * go away entirely, so the grade reads properly for the first time.
 *
 * Copy register: second person, plain, no superlatives. The whole premise
 * of this direction is a practice that talks to you like a person, and
 * "world-class luxury transformation" would break it on the first line.
 *
 * Server-rendered apart from the form and the tracked phone link.
 */
import { Phone } from 'lucide-react'

import { TrackedLink } from '@/components/analytics/tracked-link.component'
import { AtelierHeroForm } from '@/components/home-variants/atelier/atelier-hero-form.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { LOWEST_WEEKLY_PAYMENT } from '@/lib/data/weekly-payments.data'

const HERO_VIDEO =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-mobile.mp4'
const HERO_POSTER =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-mobile-poster.jpg'

export function AtelierHero() {
    return (
        <section
            className='bg-[#F6EDE4] px-6 pt-14 pb-20 md:px-10 md:pt-20 md:pb-28'
            aria-labelledby='atelier-hero-heading'
        >
            {/* items-start, not items-center: the right column (arch +
                caption + form) is far taller than the pitch, and centring
                the left column pushed the H1 into the bottom half of the
                first viewport with a large void above it. */}
            <div className='mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-2 lg:gap-20'>
                {/* Left — the pitch */}
                <div>
                    <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                        Miami · Double board-certified
                    </span>

                    <h1
                        id='atelier-hero-heading'
                        className='mt-7 font-[family-name:var(--font-fraunces)] text-5xl leading-[1.02] text-[#3D2B23] md:text-6xl xl:text-7xl'
                        data-speakable='true'
                    >
                        It is still
                        <br />
                        your body.
                        <br />
                        <span className='text-[#C4674D] italic'>
                            Just yours.
                        </span>
                    </h1>

                    <p
                        className='mt-8 max-w-md text-lg leading-[1.75] text-[#3D2B23]/75'
                        data-speakable='true'
                    >
                        No one here will tell you what to want. We will tell you
                        what is possible for your body, what it actually costs,
                        and what the recovery really feels like — then you go
                        home and think about it.
                    </p>

                    <dl className='mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-[#3D2B23]/15 pt-8'>
                        {[
                            [
                                siteConfig.trustStats?.patients ?? '5,000+',
                                'Patients',
                            ],
                            [
                                `${siteConfig.trustStats?.rating ?? '4.7'} ★`,
                                'Google rating',
                            ],
                            [`$${LOWEST_WEEKLY_PAYMENT}`, 'From / week'],
                        ].map(([figure, label]) => (
                            <div key={label}>
                                <dd className='font-[family-name:var(--font-fraunces)] text-3xl text-[#3D2B23]'>
                                    {figure}
                                </dd>
                                <dt className='mt-1 text-xs tracking-[0.15em] text-[#3D2B23]/50 uppercase'>
                                    {label}
                                </dt>
                            </div>
                        ))}
                    </dl>

                    <TrackedLink
                        href={getPhoneLink()}
                        eventName='phone_click'
                        eventParams={{
                            cta_name: 'atelier_hero_secondary',
                            phone_number: siteConfig.contact.phoneDisplay,
                            page_section: 'hero',
                        }}
                        aria-label={`Call us at ${siteConfig.contact.phoneDisplay}`}
                        className='mt-9 inline-flex items-center gap-3 text-[#3D2B23]/70 transition-colors hover:text-[#C4674D]'
                    >
                        <span className='flex h-10 w-10 items-center justify-center rounded-full border border-[#3D2B23]/20'>
                            <Phone className='h-4 w-4' aria-hidden='true' />
                        </span>
                        <span>
                            Rather talk?{' '}
                            <span className='font-semibold text-[#3D2B23]'>
                                {siteConfig.contact.phoneDisplay}
                            </span>
                        </span>
                    </TrackedLink>
                </div>

                {/* Right — the arch, then the form beneath it */}
                <div>
                    <div className='relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-full bg-[#E5B9A6]'>
                        <video
                            src={HERO_VIDEO}
                            poster={HERO_POSTER}
                            className='pointer-events-none h-full w-full object-cover'
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload='metadata'
                            aria-label='Lifestyle brand film — Alluring Plastic Surgery, Miami'
                        />
                    </div>
                    <p className='mx-auto mt-4 max-w-md text-center text-xs text-[#3D2B23]/45'>
                        Model shown. Not a patient. Individual results vary.
                    </p>

                    <div className='mx-auto mt-10 max-w-md' id='talk'>
                        <AtelierHeroForm />
                    </div>
                </div>
            </div>
        </section>
    )
}
