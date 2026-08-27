/**
 * Hero Component
 *
 * Homepage hero: full-bleed lifestyle video with the primary lead-capture
 * form rendered directly inside it.
 *
 * Conversion rationale: the previous hero linked out to /contact-us and the
 * page's only form sat below twelve sections. The form now lives here, in
 * the first viewport, because every scroll between a visitor and a form
 * field is a place they leave.
 *
 * Server-rendered — the H1, value proposition and trust signals ship in the
 * initial HTML. Only the form and the tracked phone link hydrate.
 *
 * Note on the video: this is a lifestyle brand film. The person shown is a
 * model, not a patient, and nothing in the composition implies a surgical
 * outcome. Keep it that way — see the disclosure at the foot of the section.
 */
import { ShieldCheck, Star, Phone } from 'lucide-react'
import { preload } from 'react-dom'

import { TrackedLink } from '@/components/analytics/tracked-link.component'
import { HeroConsultationForm } from '@/components/home/hero-consultation-form.component'
import { HeroVideo } from '@/components/home/hero-video.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

/**
 * Hero background footage (v5) — Seedance 2.0, 1080p native.
 *
 * Rendered with generate_audio: false, so the files carry no audio stream at
 * all rather than a muted one. Both are crossfade-looped so there is no jump
 * at the seam: each clip opens on its wide establishing shot and closes by
 * dissolving the final close-up back to that opening frame. 1.34 MB / 1.56 MB.
 * The posters carry each clip's first frame so the hero paints before the
 * video buffers.
 *
 * Exactly one cut and one poster are fetched per visit — see the video block
 * below and `hero-video.component.tsx` for why that took work.
 */
const HERO_VIDEO_DESKTOP =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-desktop.mp4'
const HERO_POSTER_DESKTOP =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-desktop-poster.jpg'
const HERO_VIDEO_MOBILE =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-mobile.mp4'
const HERO_POSTER_MOBILE =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/videos/alluring-home-hero-v5-mobile-poster.jpg'

/** Credibility markers shown directly beneath the headline. */
const HERO_TRUST_POINTS = [
    'Double Board-Certified',
    `${siteConfig.trustStats?.patients ?? '5,000+'} Patients`,
    '0% Financing Available',
] as const

export const Hero = () => {
    // Preload the poster this viewport will actually use, at high priority, in
    // <head> ahead of the stylesheets.
    //
    // Range syntax, on the same 48rem line as the <picture> below and as
    // Tailwind's `md:`. The `max-width: 767.98px` / `min-width: 768px` idiom
    // would be wrong twice over: it leaves a gap that fractional viewport widths
    // and non-integer zoom land in — matching neither query and preloading
    // nothing — and 768px is not where `md:` flips unless the browser default
    // font size is exactly 16px.
    //
    // Via react-dom's preload() rather than a rendered <link>: React registers a
    // rendered preload element in its own resource table AND emits the element,
    // so writing the markup by hand puts the same tag in <head> twice.
    preload(HERO_POSTER_MOBILE, {
        as: 'image',
        media: '(width < 48rem)',
        fetchPriority: 'high',
    })
    preload(HERO_POSTER_DESKTOP, {
        as: 'image',
        media: '(width >= 48rem)',
        fetchPriority: 'high',
    })

    return (
        <section
            className='relative w-full overflow-hidden bg-stone-950'
            aria-labelledby='hero-heading'
        >
            {/* ---------------------------------------------------------- */}
            {/* Video background                                            */}
            {/* ---------------------------------------------------------- */}
            {/* Height note: on mobile the hero is far taller than the 9:16
                footage, so stretching the video across the whole section makes
                object-cover crop ~60% of the width and zoom the shot into a
                face close-up. Capping the video region at one viewport keeps
                the framing near the cut it was graded for; below that the
                section's own stone-950 takes over, blended by the gradient at
                the foot of this block. */}
            <div className='absolute inset-x-0 top-0 z-0 h-screen md:h-full'>
                {/* The poster is what actually paints the hero, so it is a real
                    <img> at high priority rather than a video `poster`
                    attribute — the attribute cannot carry fetchpriority, and
                    carrying it on two elements is what fetched two posters.
                    <picture> lets the browser resolve the cut itself, in the
                    server-rendered HTML, with no JavaScript. */}
                <picture>
                    <source
                        media='(width >= 48rem)'
                        srcSet={HERO_POSTER_DESKTOP}
                    />
                    <img
                        src={HERO_POSTER_MOBILE}
                        alt=''
                        fetchPriority='high'
                        decoding='async'
                        className='pointer-events-none h-full w-full object-cover'
                    />
                </picture>

                {/* The film itself — one element, attached after paint. */}
                <HeroVideo
                    desktopSrc={HERO_VIDEO_DESKTOP}
                    mobileSrc={HERO_VIDEO_MOBILE}
                    label='Lifestyle brand video — Alluring Plastic Surgery, Miami'
                />

                {/* Legibility scrims. Heavier on mobile, where copy and form
                    both sit over the footage; directional on desktop, so the
                    left column stays readable without flattening the image. */}
                <div
                    className='absolute inset-0 bg-stone-950/70 md:hidden'
                    aria-hidden='true'
                />
                <div
                    className='absolute inset-0 hidden bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-stone-950/30 md:block'
                    aria-hidden='true'
                />
                <div
                    className='absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent md:h-40 md:via-transparent'
                    aria-hidden='true'
                />
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Content                                                     */}
            {/* ---------------------------------------------------------- */}
            <div className='relative z-10 container mx-auto px-6 pt-28 pb-16 md:px-12 md:pt-36 md:pb-24 lg:min-h-screen lg:pt-40'>
                <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* ------------------------------------------------ */}
                    {/* Left — the pitch                                  */}
                    {/* ------------------------------------------------ */}
                    <div className='max-w-xl'>
                        <div className='mb-7 flex items-center gap-3'>
                            <span
                                className='bg-gold-400 h-px w-8'
                                aria-hidden='true'
                            />
                            <span className='text-gold-400 text-xs font-bold tracking-[0.25em] uppercase'>
                                Miami • Board-Certified
                            </span>
                        </div>

                        <h1
                            id='hero-heading'
                            className='mb-6 font-serif text-[2.75rem] leading-[1.05] text-white md:text-6xl xl:text-7xl'
                            data-speakable='true'
                        >
                            You&apos;ve Waited
                            <br />
                            Long Enough.
                            <span className='mt-3 block text-2xl leading-snug font-light text-stone-300 italic md:text-3xl xl:text-4xl'>
                                Miami plastic surgery, from $27 a week.
                            </span>
                        </h1>

                        <p
                            className='mb-8 max-w-lg text-lg leading-relaxed font-light text-stone-300 md:text-xl'
                            data-speakable='true'
                        >
                            BBL, mommy makeover, breast augmentation and body
                            contouring by double board-certified surgeons. Real
                            prices, honest answers, and a plan built around your
                            body — never a sales script.
                        </p>

                        {/* Trust points */}
                        <ul className='mb-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
                            {HERO_TRUST_POINTS.map((point) => (
                                <li
                                    key={point}
                                    className='flex items-center gap-2 text-sm font-medium text-stone-200'
                                >
                                    <ShieldCheck
                                        className='text-gold-500 h-4 w-4 shrink-0'
                                        aria-hidden='true'
                                    />
                                    {point}
                                </li>
                            ))}
                            <li className='flex items-center gap-2 text-sm font-medium text-stone-200'>
                                <Star
                                    className='text-gold-500 h-4 w-4 shrink-0 fill-current'
                                    aria-hidden='true'
                                />
                                {siteConfig.trustStats?.rating ?? '4.7'} Google
                                Rating
                            </li>
                        </ul>

                        {/* Phone fallback — for visitors who would rather
                            talk than type. Deliberately secondary to the form. */}
                        <TrackedLink
                            href={getPhoneLink()}
                            eventName='phone_click'
                            eventParams={{
                                cta_name: 'hero_secondary',
                                phone_number: siteConfig.contact.phoneDisplay,
                                page_section: 'hero',
                            }}
                            aria-label={`Call us at ${siteConfig.contact.phoneDisplay}`}
                            className='hover:text-gold-400 group inline-flex items-center gap-3 text-base text-stone-300 transition-colors'
                        >
                            <span className='group-hover:border-gold-400/60 group-hover:bg-gold-400/10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors'>
                                <Phone className='h-4 w-4' aria-hidden='true' />
                            </span>
                            <span>
                                Prefer to talk?{' '}
                                <span className='group-hover:text-gold-400 font-semibold text-white'>
                                    {siteConfig.contact.phoneDisplay}
                                </span>
                            </span>
                        </TrackedLink>
                    </div>

                    {/* ------------------------------------------------ */}
                    {/* Right — the form                                  */}
                    {/* ------------------------------------------------ */}
                    <div className='lg:pl-6'>
                        <HeroConsultationForm />
                    </div>
                </div>

                {/* Advertising disclosure. Required reading whenever a person
                    appears in cosmetic-surgery marketing — the model is not a
                    patient and no outcome is being represented. */}
                <p className='mt-10 text-[11px] tracking-wide text-stone-500 md:mt-14'>
                    Model shown. Not a patient. Individual results vary.
                </p>
            </div>
        </section>
    )
}
