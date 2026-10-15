/**
 * Dr. Karlinsky's Instagram bio-link page (#332), server-rendered.
 *
 * Her followers already know her face and her voice, so the page reads like
 * an extension of her profile. The phone hero (390 × 664, Instagram's
 * in-app Safari) is under a 50/50 test between two heroes
 * (`drk-hero-variant.ts`): `arch` shows only her message in a wide arch, her
 * words and one button, with the form right below; `pick` shows her story
 * ring, her words and the procedures as tiles ("pick one to start"), and a
 * choice opens the rest of the form in place, with "A message from me"
 * further down. On a desktop both arms show the form beside the film. Below, for the ones who
 * scroll: how it starts, financing, her results, her patients' words, about
 * her, straight answers, and the ask again.
 *
 * Every section carries `data-drk-section`, which `DrkInsights` reports as
 * it is seen, with scroll depth, CTA taps and FAQ opens.
 *
 * Client islands only where something must run in the browser: the form,
 * the video player, the results lightbox, the sticky CTA and the legal
 * dialog. One ask and no way off the page: every CTA goes to the hero form,
 * the legal documents open in a dialog, and only the phone number leaves
 * (a call is a conversion, not an exit).
 */

import Image, { getImageProps } from 'next/image'
import { preload } from 'react-dom'

import { LpLegalDialog } from '@/components/landing-pages/request-consultation/lp-legal-dialog.component'
import { LP_LEGAL_HREFS } from '@/components/landing-pages/request-consultation/lp-legal'
import { Rich } from '@/components/landing-pages/request-consultation/lp-primitives.component'
import {
    FINANCING_PARTNERS,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'

import {
    DRK_FORM_ID,
    DRK_HERO_ID,
    drkPageVariant,
    fill,
    formatDuration,
} from './drk-config'
import { buildDrkForm, DRK_COPY, type DrkLang } from './drk-copy'
import { DrkForm } from './drk-form.component'
import { DRK_HERO_FALLBACK, type DrkHeroArm } from './drk-hero-variant'
import { DrkInsights } from './drk-insights.component'
import {
    DRK_AVATAR,
    DRK_PORTRAIT,
    DRK_VIDEO,
    type DrkVideo,
    hasDrkVideo,
} from './drk-media'
import { DrkPlayer } from './drk-player.component'
import type { DrkProof } from './drk-proof'
import { DrkResults } from './drk-results.component'
import { DrkStickyCta } from './drk-sticky-cta.component'

export interface DrkLanguageLinks {
    readonly en: string
    readonly es: string
}

interface DrkLandingProps {
    readonly lang: DrkLang
    readonly languageLinks: DrkLanguageLinks
    readonly proof: DrkProof
    /** Defaults to `DRK_VIDEO`; tests pass their own. */
    readonly video?: DrkVideo
    /** The visitor's arm of the hero test, from the middleware. */
    readonly heroArm?: DrkHeroArm
}

const CLOSING_ID = 'drk-closing'

/** The phone hero's button; the sticky CTA stays away while it shows. */
const HERO_GO_ID = 'drk-hero-go'

/** Where the hero shows the film beside the form (drk.css). */
const DESKTOP_HERO_MEDIA = '(min-width: 1024px)'

const POSTER_SIZES = '(max-width: 640px) 78vw, 340px'

const LOGO = { src: '/logo.png', width: 400, height: 166 } as const

const faceClass = `drk-ring__face${DRK_AVATAR.faceCrop ? ' drk-ring__face--crop' : ''}`

export function DrkLanding({
    lang,
    languageLinks,
    proof,
    video = DRK_VIDEO,
    heroArm = DRK_HERO_FALLBACK,
}: DrkLandingProps) {
    const copy = DRK_COPY[lang]
    const form = buildDrkForm(lang)
    const playable = hasDrkVideo(video)
    const duration = formatDuration(video.durationSec)
    const phone = getPhoneLink()
    const year = new Date().getFullYear()
    const arch = playable && heroArm === 'arch'
    const pick = heroArm === 'pick'

    return (
        <div
            className='drk'
            lang={lang}
            data-hero-arm={heroArm}
            data-page-variant={drkPageVariant(heroArm)}
        >
            <main>
                <section
                    id={DRK_HERO_ID}
                    className={`drk-hero${arch ? ' drk-hero--arch' : ''}${pick ? ' drk-hero--pick' : ''}`}
                    aria-labelledby='drk-title'
                    data-drk-section='hero'
                >
                    <header className='drk-top'>
                        <Image
                            className='drk-top__logo'
                            src={LOGO.src}
                            width={LOGO.width}
                            height={LOGO.height}
                            sizes='96px'
                            alt={copy.top.practice}
                            priority
                        />
                        <nav
                            className='drk-top__end'
                            aria-label={copy.top.navAria}
                        >
                            <span className='drk-lang'>
                                <a
                                    href={languageLinks.en}
                                    hrefLang='en'
                                    lang='en'
                                    aria-current={
                                        lang === 'en' ? 'true' : undefined
                                    }
                                    aria-label={
                                        lang === 'es'
                                            ? DRK_COPY.es.top.langAria
                                            : undefined
                                    }
                                >
                                    EN
                                </a>
                                <a
                                    href={languageLinks.es}
                                    hrefLang='es'
                                    lang='es'
                                    aria-current={
                                        lang === 'es' ? 'true' : undefined
                                    }
                                    aria-label={
                                        lang === 'en'
                                            ? DRK_COPY.en.top.langAria
                                            : undefined
                                    }
                                >
                                    ES
                                </a>
                            </span>
                            <a
                                className='drk-top__call'
                                href={phone}
                                aria-label={`${copy.top.callAria}, ${siteConfig.contact.phoneDisplay}`}
                                data-cta='drk_call_top'
                            >
                                <PhoneIcon />
                                {copy.top.call}
                            </a>
                        </nav>
                    </header>

                    <div className='drk-hero__grid'>
                        <div className='drk-hero__intro'>
                            {arch && (
                                <HeroCover
                                    video={video}
                                    handle={copy.story.handle}
                                    label={copy.story.label}
                                    duration={duration}
                                    playAria={fill(copy.story.playAria, {
                                        duration,
                                    })}
                                />
                            )}
                            <StoryRow
                                playable={playable}
                                handle={copy.story.handle}
                                label={
                                    playable
                                        ? copy.story.label
                                        : copy.story.fallback
                                }
                                duration={duration}
                                playAria={fill(copy.story.playAria, {
                                    duration,
                                })}
                            />
                            <h1 id='drk-title' className='drk-h1'>
                                <Rich parts={copy.hero.heading} />
                            </h1>
                            {arch && (
                                <div id={HERO_GO_ID} className='drk-hero__go'>
                                    <a
                                        href={`#${DRK_FORM_ID}`}
                                        className='drk-btn drk-btn--gold'
                                        data-drk-focus=''
                                        data-cta='drk_hero'
                                    >
                                        {copy.sticky.cta}
                                        <ArrowIcon />
                                    </a>
                                    <p className='drk-hero__note'>
                                        <LockIcon />
                                        {copy.hero.note}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className='drk-hero__form'>
                            <p className='drk-hero__sub'>{copy.hero.sub}</p>
                            <DrkForm
                                lang={lang}
                                copy={form.copy}
                                staff={form.staff}
                                hint={copy.formHint}
                                tilesNote={copy.tilesNote}
                                heroArm={heroArm}
                            />
                            <p className='drk-hero__call'>
                                {copy.hero.callPrompt}{' '}
                                <a href={phone} data-cta='drk_call_hero'>
                                    {siteConfig.contact.phoneDisplay}
                                </a>
                            </p>
                        </div>

                        {playable && (
                            <div className='drk-hero__film'>
                                <MessageArch
                                    video={video}
                                    playLabel={copy.message.play}
                                    duration={duration}
                                    placement='hero-desktop'
                                    preloadMedia={DESKTOP_HERO_MEDIA}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {playable && !arch && (
                    <section
                        className='drk-band drk-message'
                        aria-labelledby='drk-message-title'
                        data-drk-section='message'
                    >
                        <div className='drk-wrap drk-message__in'>
                            <MessageArch
                                video={video}
                                playLabel={copy.message.play}
                                duration={duration}
                                placement='inline'
                            />
                            <div className='drk-message__text'>
                                <h2 id='drk-message-title' className='drk-h2'>
                                    <Rich parts={copy.message.heading} />
                                </h2>
                                <p>{fill(copy.message.body, { duration })}</p>
                                <p className='drk-quiet'>
                                    {copy.message.captions}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <section
                    className='drk-band drk-steps'
                    aria-labelledby='drk-steps-title'
                    data-drk-section='steps'
                >
                    <div className='drk-wrap'>
                        <h2 id='drk-steps-title' className='drk-h2'>
                            <Rich parts={copy.steps.heading} />
                        </h2>
                        <ol className='drk-steps__list'>
                            {copy.steps.items.map((step, index) => (
                                <li key={step.title}>
                                    <span
                                        className='drk-steps__n'
                                        aria-hidden='true'
                                    >
                                        {index + 1}
                                    </span>
                                    <h3>{step.title}</h3>
                                    <p>{step.body}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section
                    className='drk-band drk-financing'
                    aria-labelledby='drk-financing-title'
                    data-drk-section='financing'
                >
                    <div className='drk-wrap drk-financing__in'>
                        <div>
                            <h2 id='drk-financing-title' className='drk-h2'>
                                <Rich parts={copy.financing.heading} />
                            </h2>
                            <p className='drk-lede'>{copy.financing.body}</p>
                        </div>
                        <div className='drk-financing__card'>
                            <p className='drk-financing__label'>
                                {copy.financing.partnersLabel}
                            </p>
                            <ul className='drk-financing__partners'>
                                {FINANCING_PARTNERS.map((partner) => (
                                    <li key={partner}>{partner}</li>
                                ))}
                            </ul>
                            <a
                                href={`#${DRK_FORM_ID}`}
                                className='drk-btn drk-btn--ink'
                                data-drk-focus=''
                                data-cta='drk_financing'
                            >
                                {copy.financing.cta}
                            </a>
                            <p className='drk-financing__fine'>
                                {copy.financing.fine}
                            </p>
                        </div>
                    </div>
                </section>

                {proof.photos.length > 0 && (
                    <section
                        className='drk-band drk-results'
                        aria-labelledby='drk-results-title'
                        data-drk-section='results'
                    >
                        <div className='drk-wrap'>
                            <h2 id='drk-results-title' className='drk-h2'>
                                <Rich parts={copy.results.heading} />
                            </h2>
                            <p className='drk-lede'>{copy.results.body}</p>
                        </div>
                        <DrkResults copy={copy.results} photos={proof.photos} />
                        <div className='drk-wrap'>
                            <p className='drk-quiet'>
                                {copy.results.disclaimer}
                            </p>
                        </div>
                    </section>
                )}

                {proof.reviews.length > 0 && (
                    <section
                        className='drk-band drk-reviews'
                        aria-labelledby='drk-reviews-title'
                        data-drk-section='reviews'
                    >
                        <div className='drk-wrap'>
                            <h2 id='drk-reviews-title' className='drk-h2'>
                                <Rich parts={copy.reviews.heading} />
                            </h2>
                            <p className='drk-reviews__source'>
                                <Stars />
                                <span className='sr-only'>
                                    {copy.reviews.stars}:{' '}
                                </span>
                                {proof.rating && proof.reviewCount
                                    ? fill(copy.reviews.source, {
                                          rating: proof.rating,
                                          count: String(proof.reviewCount),
                                      })
                                    : copy.reviews.sourceNoCount}
                            </p>
                            <ul className='drk-reviews__list'>
                                {proof.reviews.map((review) => (
                                    <li key={review.id}>
                                        <figure>
                                            <blockquote lang={review.lang}>
                                                <p>{review.text}</p>
                                            </blockquote>
                                            <figcaption>
                                                <strong>{review.name}</strong>
                                                <span>{review.date}</span>
                                            </figcaption>
                                        </figure>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                <section
                    className='drk-band drk-about'
                    aria-labelledby='drk-about-title'
                    data-drk-section='about'
                >
                    <div className='drk-wrap drk-about__in'>
                        <div className='drk-arch drk-about__portrait'>
                            <Image
                                src={DRK_PORTRAIT.src}
                                width={DRK_PORTRAIT.width}
                                height={DRK_PORTRAIT.height}
                                sizes='(max-width: 640px) 70vw, 360px'
                                alt={copy.about.portraitAlt}
                            />
                        </div>
                        <div className='drk-about__text'>
                            <h2 id='drk-about-title' className='drk-h2'>
                                <Rich parts={copy.about.heading} />
                            </h2>
                            {copy.about.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                            <p className='drk-about__name'>{copy.about.name}</p>
                            <ul
                                className='drk-about__creds'
                                aria-label={copy.about.credentialsLabel}
                            >
                                {copy.about.credentials.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section
                    className='drk-band drk-faq'
                    aria-labelledby='drk-faq-title'
                    data-drk-section='faq'
                >
                    <div className='drk-wrap drk-faq__in'>
                        <h2 id='drk-faq-title' className='drk-h2'>
                            <Rich parts={copy.faq.heading} />
                        </h2>
                        <div className='drk-faq__list'>
                            {copy.faq.items.map((item) => (
                                <details key={item.question}>
                                    <summary>
                                        {item.question}
                                        <span
                                            className='drk-faq__icon'
                                            aria-hidden='true'
                                        />
                                    </summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id={CLOSING_ID}
                    className='drk-closing'
                    data-drk-section='closing'
                    aria-labelledby='drk-closing-title'
                >
                    <div className='drk-wrap drk-closing__in'>
                        <span
                            className='drk-ring drk-ring--still drk-closing__ring'
                            aria-hidden='true'
                        >
                            <span className={faceClass}>
                                <Image
                                    src={DRK_AVATAR.src}
                                    width={DRK_AVATAR.width}
                                    height={DRK_AVATAR.height}
                                    sizes='72px'
                                    alt=''
                                />
                            </span>
                        </span>
                        <h2
                            id='drk-closing-title'
                            className='drk-h2 drk-h2--light'
                        >
                            <Rich parts={copy.closing.heading} />
                        </h2>
                        <a
                            href={`#${DRK_FORM_ID}`}
                            className='drk-btn drk-btn--gold'
                            data-drk-focus=''
                            data-cta='drk_closing'
                        >
                            {copy.closing.cta}
                        </a>
                        <p className='drk-closing__call'>
                            {copy.closing.callPrompt}{' '}
                            <a href={phone} data-cta='drk_call_closing'>
                                {siteConfig.contact.phoneDisplay}
                            </a>
                        </p>
                    </div>
                </section>
            </main>

            <footer className='drk-footer'>
                <div className='drk-wrap'>
                    <p>
                        {siteConfig.business.name} ·{' '}
                        {siteConfig.contact.address}, {siteConfig.contact.city},{' '}
                        {siteConfig.contact.state}{' '}
                        {siteConfig.contact.postalCode} ·{' '}
                        <a href={phone} data-cta='drk_call_footer'>
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </p>
                    <p className='drk-footer__legal'>
                        <a href={LP_LEGAL_HREFS.privacy}>
                            {copy.footer.privacy}
                        </a>
                        <a href={LP_LEGAL_HREFS.terms}>{copy.footer.terms}</a>
                        <a href={LP_LEGAL_HREFS.cookies}>
                            {copy.footer.cookies}
                        </a>
                    </p>
                    <p className='drk-footer__fine'>{copy.footer.disclaimer}</p>
                    <p className='drk-footer__fine'>
                        © {year} {siteConfig.business.name}.{' '}
                        {copy.footer.rights}
                    </p>
                </div>
            </footer>

            <DrkStickyCta
                label={copy.sticky.cta}
                hideWhile={[HERO_GO_ID, CLOSING_ID]}
            />
            <DrkPlayer
                lang={lang}
                video={video}
                copy={copy.player}
                handle={copy.story.handle}
                avatarSrc={DRK_AVATAR.src}
                avatarCrop={DRK_AVATAR.faceCrop}
            />
            <LpLegalDialog copy={copy.footer} />
            <DrkInsights lang={lang} />
        </div>
    )
}

/**
 * Her avatar in a story ring, the way her followers see it on Instagram,
 * with her handle and the message. A button when there is a video to play.
 */
function StoryRow({
    playable,
    handle,
    label,
    duration,
    playAria,
}: {
    readonly playable: boolean
    readonly handle: string
    readonly label: string
    readonly duration: string
    readonly playAria: string
}) {
    const inner = (
        <>
            <span
                className={`drk-ring${playable ? '' : ' drk-ring--still'}`}
                aria-hidden='true'
            >
                <span className={faceClass}>
                    <Image
                        src={DRK_AVATAR.src}
                        width={DRK_AVATAR.width}
                        height={DRK_AVATAR.height}
                        sizes='60px'
                        alt=''
                        priority
                    />
                </span>
            </span>
            <span className='drk-story__text'>
                <span className='drk-story__handle'>{handle}</span>
                <span className='drk-story__label'>
                    {label}
                    {playable && (
                        <>
                            <span
                                className='drk-story__dot'
                                aria-hidden='true'
                            />
                            <span className='drk-story__time'>{duration}</span>
                            <PlayIcon className='drk-story__play' />
                        </>
                    )}
                </span>
            </span>
        </>
    )

    return playable ? (
        <button
            type='button'
            className='drk-story'
            data-drk-play='story'
            aria-label={playAria}
        >
            {inner}
        </button>
    ) : (
        <div className='drk-story'>{inner}</div>
    )
}

/**
 * The phone hero: her message's poster in a wide arch, with the play button
 * and what it is along the bottom edge. Phones only (drk.css); it is their
 * largest image, so it loads first. Same `sizes` as the desktop film, so
 * both resolve to one file.
 */
function HeroCover({
    video,
    handle,
    label,
    duration,
    playAria,
}: {
    readonly video: DrkVideo
    readonly handle: string
    readonly label: string
    readonly duration: string
    readonly playAria: string
}) {
    return (
        <button
            type='button'
            className='drk-arch drk-cover'
            data-drk-play='hero-cover'
            aria-label={playAria}
        >
            <Image
                src={video.poster}
                width={video.posterWidth}
                height={video.posterHeight}
                sizes={POSTER_SIZES}
                alt=''
                priority
            />
            <span className='drk-cover__bar' aria-hidden='true'>
                <span className='drk-cover__play'>
                    <PlayIcon />
                </span>
                <span className='drk-cover__text'>
                    <span className='drk-cover__label'>{label}</span>
                    <span className='drk-cover__meta'>
                        {handle} · {duration}
                    </span>
                </span>
            </span>
        </button>
    )
}

/** The message's poster in an arch, with a play button over it. */
function MessageArch({
    video,
    playLabel,
    duration,
    placement,
    preloadMedia,
}: {
    readonly video: DrkVideo
    readonly playLabel: string
    readonly duration: string
    readonly placement: string
    /**
     * Preload the poster at high priority where this media query matches.
     * The desktop hero's arch is above the fold there (likely the LCP), but
     * `display: none` on phones, which must not fetch it: so a media-scoped
     * preload, not `priority` (whose preload has no media) or eager loading
     * (which fetches hidden images too).
     */
    readonly preloadMedia?: string
}) {
    if (preloadMedia) {
        const { props } = getImageProps({
            src: video.poster,
            width: video.posterWidth,
            height: video.posterHeight,
            sizes: POSTER_SIZES,
            alt: '',
        })
        preload(props.src, {
            as: 'image',
            imageSrcSet: props.srcSet,
            imageSizes: props.sizes,
            fetchPriority: 'high',
            media: preloadMedia,
        })
    }
    return (
        <button
            type='button'
            className='drk-arch drk-film'
            data-drk-play={placement}
            aria-label={`${playLabel}, ${duration}`}
        >
            <Image
                src={video.poster}
                width={video.posterWidth}
                height={video.posterHeight}
                sizes={POSTER_SIZES}
                alt=''
                fetchPriority={preloadMedia ? 'high' : undefined}
            />
            <span className='drk-film__play' aria-hidden='true'>
                <PlayIcon />
            </span>
            <span className='drk-film__time' aria-hidden='true'>
                {duration}
            </span>
        </button>
    )
}

function PlayIcon({ className }: { readonly className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            width='14'
            height='14'
            fill='currentColor'
            aria-hidden='true'
        >
            <path d='M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1a.8.8 0 0 0-1.2.7Z' />
        </svg>
    )
}

function ArrowIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M5 12h14M13 6l6 6-6 6' />
        </svg>
    )
}

function LockIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='13'
            height='13'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <rect x='5' y='11' width='14' height='10' rx='2' />
            <path d='M8 11V7a4 4 0 0 1 8 0v4' />
        </svg>
    )
}

function PhoneIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='15'
            height='15'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
        >
            <path d='M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z' />
        </svg>
    )
}

/**
 * Decoration only: the line beside it gives the real rating, and five stars
 * read aloud would claim a 5/5 the page doesn't.
 */
function Stars() {
    return (
        <span className='drk-stars' aria-hidden='true'>
            {'★★★★★'}
        </span>
    )
}
