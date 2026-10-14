/**
 * Dr. Karlinsky's Instagram bio-link page (#332), server-rendered.
 *
 * Her followers already know her face and her voice, so the page reads like
 * an extension of her profile: the story ring with her message, then her
 * words and the request form, all on the first screen of a phone (390 × 664,
 * Instagram's in-app Safari). Below it, for the ones who scroll: the message
 * in an arch, how it starts, prices, her results, her patients' words, about
 * her, straight answers, and the ask again.
 *
 * Client islands only where something must run in the browser: the form,
 * the video player, the results lightbox, the sticky CTA and the legal
 * dialog. One ask and no way off the page: every CTA goes to the hero form,
 * the legal documents open in a dialog, and only the phone number leaves
 * (a call is a conversion, not an exit).
 */

import Image from 'next/image'

import { LpLegalDialog } from '@/components/landing-pages/request-consultation/lp-legal-dialog.component'
import { LP_LEGAL_HREFS } from '@/components/landing-pages/request-consultation/lp-legal'
import { Rich } from '@/components/landing-pages/request-consultation/lp-primitives.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import { DRK_FORM_ID, DRK_HERO_ID, fill, formatDuration } from './drk-config'
import { buildDrkForm, DRK_COPY, type DrkLang } from './drk-copy'
import { DrkForm } from './drk-form.component'
import {
    DRK_AVATAR,
    DRK_PORTRAIT,
    DRK_VIDEO,
    type DrkVideo,
    hasDrkVideo,
} from './drk-media'
import { DrkPlayer } from './drk-player.component'
import { DRK_PRICES } from './drk-prices'
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
}

const CLOSING_ID = 'drk-closing'

const LOGO = { src: '/logo.png', width: 400, height: 166 } as const

const faceClass = `drk-ring__face${DRK_AVATAR.faceCrop ? ' drk-ring__face--crop' : ''}`

export function DrkLanding({
    lang,
    languageLinks,
    proof,
    video = DRK_VIDEO,
}: DrkLandingProps) {
    const copy = DRK_COPY[lang]
    const form = buildDrkForm(lang)
    const playable = hasDrkVideo(video)
    const duration = formatDuration(video.durationSec)
    const phone = getPhoneLink()
    const year = new Date().getFullYear()

    return (
        <div className='drk' lang={lang}>
            <main>
                <section
                    id={DRK_HERO_ID}
                    className='drk-hero'
                    aria-labelledby='drk-title'
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
                            aria-label={copy.top.practice}
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
                            <p className='drk-hero__sub'>{copy.hero.sub}</p>
                        </div>

                        <div className='drk-hero__form'>
                            <DrkForm
                                lang={lang}
                                copy={form.copy}
                                staff={form.staff}
                                priceHint={copy.priceHint}
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
                                />
                            </div>
                        )}
                    </div>
                </section>

                {playable && (
                    <section
                        className='drk-band drk-message'
                        aria-labelledby='drk-message-title'
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
                    className='drk-band drk-prices'
                    aria-labelledby='drk-prices-title'
                >
                    <div className='drk-wrap drk-prices__in'>
                        <h2 id='drk-prices-title' className='drk-h2'>
                            <Rich parts={copy.prices.heading} />
                        </h2>
                        <div className='drk-prices__card'>
                            <dl>
                                {DRK_PRICES.map((price) => (
                                    <div
                                        key={price.procedure}
                                        className='drk-prices__row'
                                    >
                                        <dt>{price.label[lang]}</dt>
                                        <dd>
                                            <span>{copy.prices.from}</span>{' '}
                                            {price.from}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            <p className='drk-prices__personal'>
                                {copy.prices.personal}
                            </p>
                            <p className='drk-prices__financing'>
                                {copy.prices.financing}
                            </p>
                        </div>
                    </div>
                </section>

                {proof.photos.length > 0 && (
                    <section
                        className='drk-band drk-results'
                        aria-labelledby='drk-results-title'
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
                    >
                        <div className='drk-wrap'>
                            <h2 id='drk-reviews-title' className='drk-h2'>
                                <Rich parts={copy.reviews.heading} />
                            </h2>
                            <p className='drk-reviews__source'>
                                <Stars label={copy.reviews.stars} />
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
                                            <blockquote lang='en'>
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

            <DrkStickyCta label={copy.sticky.cta} hideWhile={[CLOSING_ID]} />
            <DrkPlayer
                lang={lang}
                video={video}
                copy={copy.player}
                handle={copy.story.handle}
                avatarSrc={DRK_AVATAR.src}
                avatarCrop={DRK_AVATAR.faceCrop}
            />
            <LpLegalDialog copy={copy.footer} />
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

/** The message's poster in an arch, with a play button over it. */
function MessageArch({
    video,
    playLabel,
    duration,
    placement,
}: {
    readonly video: DrkVideo
    readonly playLabel: string
    readonly duration: string
    readonly placement: string
}) {
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
                sizes='(max-width: 640px) 78vw, 340px'
                alt=''
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

function Stars({ label }: { readonly label: string }) {
    return (
        <span className='drk-stars' role='img' aria-label={label}>
            {'★★★★★'}
        </span>
    )
}
