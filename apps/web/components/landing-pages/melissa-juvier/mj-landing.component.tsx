/**
 * Melissa Juvier's personal page — the composition.
 *
 * Server-rendered end to end; the only client code is the chat form and the
 * mobile sticky bar. Order is conversion-first for warm bio-link traffic:
 *
 *   her face + promise → the chat (the conversion) → proof strip →
 *   her note → how it works → the surgeon → results → reviews →
 *   objections → last call
 *
 * On desktop her portrait stays pinned beside the page for the whole scroll,
 * so the visitor never loses the person they came for. On a phone the
 * portrait is the first screen and the chat is the very next thing.
 */

import Image from 'next/image'

import { getFullAddress } from '@/lib/data/site-config'

import {
    LP_BADGES,
    LP_BEFORE_AFTER,
    LP_LOGO,
    LP_SURGEON_PORTRAIT,
} from '../request-consultation/lp-assets'
import { LP_COPY, LP_LINKS } from '../request-consultation/lp-copy'
import { Rich } from '../request-consultation/lp-primitives.component'
import { MjChatForm } from './mj-chat-form.component'
import { MJ_AVATAR, MJ_CHAT_ID, MJ_PORTRAIT } from './mj-config'
import { MJ_COPY, type MjLang } from './mj-copy'
import { MjStickyCta } from './mj-sticky-cta.component'

const HERO_ID = 'mj-hero'

interface MjLandingProps {
    readonly lang: MjLang
    /** This page in the other language, with the visitor's query string kept. */
    readonly switchHref: string
}

export function MjLanding({ lang, switchHref }: MjLandingProps) {
    const copy = MJ_COPY[lang]
    const staff = MJ_COPY.en.chat
    const shared = LP_COPY[lang]

    return (
        <div className='mj' lang={lang}>
            <header className='mj-top'>
                <Image
                    className='mj-top__logo'
                    src={LP_LOGO.src}
                    width={LP_LOGO.width}
                    height={LP_LOGO.height}
                    sizes='132px'
                    alt={copy.header.practice}
                    priority
                />
                <a
                    className='mj-top__lang'
                    href={switchHref}
                    hrefLang={lang === 'en' ? 'es' : 'en'}
                    aria-label={copy.header.switchAria}
                >
                    <GlobeIcon />
                    {copy.header.switchLabel}
                </a>
            </header>

            <div className='mj-shell'>
                {/* The portrait: first screen on a phone, pinned on desktop */}
                <div className='mj-stage'>
                    <Image
                        className='mj-stage__img'
                        src={MJ_PORTRAIT.src}
                        width={MJ_PORTRAIT.width}
                        height={MJ_PORTRAIT.height}
                        sizes='(min-width: 1024px) 46vw, 100vw'
                        alt={copy.hero.portraitAlt}
                        priority
                        fetchPriority='high'
                    />
                    <span className='mj-stage__shade' aria-hidden='true' />
                    <span className='mj-bokeh' aria-hidden='true'>
                        <i />
                        <i />
                        <i />
                        <i />
                    </span>
                    <p className='mj-stage__caption' aria-hidden='true'>
                        {copy.hero.caption}
                    </p>
                </div>

                <main className='mj-main'>
                    <section
                        id={HERO_ID}
                        className='mj-hero'
                        aria-labelledby='mj-hero-title'
                    >
                        <p className='mj-eyebrow mj-eyebrow--light'>
                            <span className='mj-dot' aria-hidden='true' />
                            {copy.hero.eyebrow}
                        </p>
                        <h1 id='mj-hero-title' className='mj-hero__title'>
                            <span className='mj-hero__hello'>
                                {copy.hero.hello}
                            </span>{' '}
                            <em>{copy.hero.name}</em>
                        </h1>
                        <p className='mj-hero__lead'>{copy.hero.lead}</p>
                        <a className='mj-btn' href={`#${MJ_CHAT_ID}`}>
                            {copy.hero.cta}
                            <span aria-hidden='true'>→</span>
                        </a>
                        <p className='mj-hero__note'>{copy.hero.ctaNote}</p>
                    </section>

                    <MjChatForm
                        lang={lang}
                        copy={copy.chat}
                        staff={{
                            procedures: staff.procedures,
                            timelines: staff.timelines,
                        }}
                    />

                    <div className='mj-marquee'>
                        <ul className='mj-marquee__track'>
                            {copy.trust.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <ul className='mj-marquee__track' aria-hidden='true'>
                            {copy.trust.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Her note */}
                    <section
                        className='mj-sec mj-sec--paper'
                        aria-labelledby='mj-letter-title'
                    >
                        <div className='mj-letter mj-rise'>
                            <p className='mj-eyebrow'>{copy.letter.eyebrow}</p>
                            <h2 id='mj-letter-title' className='mj-h2'>
                                <Rich parts={copy.letter.heading} />
                            </h2>
                            {copy.letter.paragraphs.map((paragraph) => (
                                <p key={paragraph} className='mj-letter__p'>
                                    {paragraph}
                                </p>
                            ))}
                            <div className='mj-letter__sign'>
                                <span className='mj-letter__avatar'>
                                    <Image
                                        src={MJ_AVATAR.src}
                                        width={MJ_AVATAR.width}
                                        height={MJ_AVATAR.height}
                                        sizes='64px'
                                        alt=''
                                    />
                                </span>
                                <span>
                                    <span className='mj-letter__signoff'>
                                        {copy.letter.signoff}
                                    </span>
                                    <span className='mj-letter__name'>
                                        Melissa
                                    </span>
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* How it works */}
                    <section
                        className='mj-sec mj-sec--night'
                        aria-labelledby='mj-steps-title'
                    >
                        <p className='mj-eyebrow mj-eyebrow--light'>
                            {copy.steps.eyebrow}
                        </p>
                        <h2 id='mj-steps-title' className='mj-h2 mj-h2--light'>
                            <Rich parts={copy.steps.heading} />
                        </h2>
                        <ol className='mj-steps'>
                            {copy.steps.items.map((item, index) => (
                                <li
                                    key={item.title}
                                    className='mj-step mj-rise'
                                >
                                    <span
                                        className='mj-step__n'
                                        aria-hidden='true'
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className='mj-step__title'>
                                        {item.title}
                                    </h3>
                                    <p className='mj-step__body'>{item.body}</p>
                                </li>
                            ))}
                        </ol>
                        <p className='mj-steps__after mj-rise'>
                            {copy.steps.after}
                        </p>
                        <a className='mj-btn' href={`#${MJ_CHAT_ID}`}>
                            {copy.steps.cta}
                            <span aria-hidden='true'>→</span>
                        </a>
                    </section>

                    {/* The surgeon */}
                    <section
                        className='mj-sec mj-sec--paper'
                        aria-labelledby='mj-surgeon-title'
                    >
                        <div className='mj-surgeon'>
                            <figure className='mj-surgeon__photo mj-rise'>
                                <Image
                                    src={LP_SURGEON_PORTRAIT.src}
                                    width={LP_SURGEON_PORTRAIT.width}
                                    height={LP_SURGEON_PORTRAIT.height}
                                    sizes='(min-width: 1024px) 220px, 40vw'
                                    alt={copy.surgeon.portraitAlt}
                                    loading='lazy'
                                />
                            </figure>
                            <div className='mj-surgeon__text'>
                                <p className='mj-eyebrow'>
                                    {copy.surgeon.eyebrow}
                                </p>
                                <h2 id='mj-surgeon-title' className='mj-h2'>
                                    <Rich parts={copy.surgeon.heading} />
                                </h2>
                                <p className='mj-surgeon__role'>
                                    {copy.surgeon.role}
                                </p>
                            </div>
                        </div>
                        <p className='mj-surgeon__body mj-rise'>
                            {copy.surgeon.body}
                        </p>
                        <dl className='mj-stats mj-rise'>
                            {copy.surgeon.stats.map((stat) => (
                                <div key={stat.label}>
                                    <dt>{stat.label}</dt>
                                    <dd>{stat.value}</dd>
                                </div>
                            ))}
                        </dl>
                        <ul className='mj-creds'>
                            {copy.surgeon.credentials.map((credential) => (
                                <li key={credential}>{credential}</li>
                            ))}
                        </ul>
                        <ul
                            className='mj-badges'
                            aria-label={shared.hero.badgesLabel}
                        >
                            {LP_BADGES.map((badge) => (
                                <li key={badge.src}>
                                    <Image
                                        src={badge.src}
                                        width={badge.width}
                                        height={badge.height}
                                        sizes='96px'
                                        alt={badge.alt}
                                        loading='lazy'
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Results */}
                    <section
                        className='mj-sec mj-sec--night mj-sec--bleed'
                        aria-labelledby='mj-results-title'
                    >
                        <div className='mj-sec__head'>
                            <p className='mj-eyebrow mj-eyebrow--light'>
                                {copy.results.eyebrow}
                            </p>
                            <h2
                                id='mj-results-title'
                                className='mj-h2 mj-h2--light'
                            >
                                <Rich parts={copy.results.heading} />
                            </h2>
                        </div>
                        <ul
                            className='mj-results'
                            tabIndex={0}
                            aria-label={copy.results.eyebrow}
                        >
                            {LP_BEFORE_AFTER.map((item) => {
                                const caption =
                                    copy.results.captions[item.procedure]
                                return (
                                    <li
                                        key={item.procedure}
                                        className='mj-result'
                                    >
                                        <Image
                                            src={item.src}
                                            width={1000}
                                            height={1250}
                                            sizes='(min-width: 1024px) 300px, 74vw'
                                            alt={caption?.alt ?? ''}
                                            loading='lazy'
                                        />
                                        <p>
                                            <span>{caption?.caption}</span>
                                            <small>{copy.results.tag}</small>
                                        </p>
                                    </li>
                                )
                            })}
                        </ul>
                        <p className='mj-results__note'>
                            <span>{copy.results.note}</span>
                            <span
                                className='mj-results__swipe'
                                aria-hidden='true'
                            >
                                {copy.results.swipe} →
                            </span>
                        </p>
                    </section>

                    {/* Reviews */}
                    <section
                        className='mj-sec mj-sec--paper'
                        aria-labelledby='mj-reviews-title'
                    >
                        <p className='mj-eyebrow'>{copy.reviews.eyebrow}</p>
                        <h2 id='mj-reviews-title' className='mj-h2'>
                            <Rich parts={copy.reviews.heading} />
                        </h2>
                        <p className='mj-reviews__source'>
                            <span className='mj-stars' aria-hidden='true'>
                                ★★★★★
                            </span>
                            {copy.reviews.source}
                        </p>
                        <ul className='mj-reviews'>
                            {copy.reviews.items.map((review) => (
                                <li
                                    key={review.by}
                                    className='mj-review mj-rise'
                                >
                                    <blockquote>
                                        <p>{review.quote}</p>
                                    </blockquote>
                                    <p className='mj-review__by'>{review.by}</p>
                                </li>
                            ))}
                        </ul>
                        <a
                            className='mj-link'
                            href={LP_LINKS.reviews}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {shared.reviews.link} →
                        </a>
                    </section>

                    {/* Objections */}
                    <section
                        className='mj-sec mj-sec--night'
                        aria-labelledby='mj-faq-title'
                    >
                        <p className='mj-eyebrow mj-eyebrow--light'>
                            {copy.faq.eyebrow}
                        </p>
                        <h2 id='mj-faq-title' className='mj-h2 mj-h2--light'>
                            <Rich parts={copy.faq.heading} />
                        </h2>
                        <div className='mj-faq'>
                            {copy.faq.items.map((item, index) => (
                                <details
                                    key={item.question}
                                    className='mj-faq__item'
                                    open={index === 0}
                                >
                                    <summary>
                                        {item.question}
                                        <span
                                            className='mj-faq__icon'
                                            aria-hidden='true'
                                        />
                                    </summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Last call */}
                    <section
                        className='mj-sec mj-closing'
                        aria-labelledby='mj-closing-title'
                    >
                        <span className='mj-closing__avatar'>
                            <Image
                                src={MJ_AVATAR.src}
                                width={MJ_AVATAR.width}
                                height={MJ_AVATAR.height}
                                sizes='96px'
                                alt=''
                            />
                        </span>
                        <h2
                            id='mj-closing-title'
                            className='mj-h2 mj-h2--light'
                        >
                            <Rich parts={copy.closing.heading} />
                        </h2>
                        <p className='mj-closing__body'>{copy.closing.body}</p>
                        <a
                            className='mj-btn mj-btn--lg'
                            href={`#${MJ_CHAT_ID}`}
                        >
                            {copy.closing.cta}
                            <span aria-hidden='true'>→</span>
                        </a>
                    </section>

                    <footer className='mj-foot'>
                        <p>
                            {copy.header.practice} · {getFullAddress()}
                        </p>
                        <p className='mj-foot__links'>
                            <a href={LP_LINKS.privacy}>{copy.footer.privacy}</a>
                            <a href={LP_LINKS.terms}>{copy.footer.terms}</a>
                        </p>
                        <p className='mj-foot__legal'>
                            {copy.footer.disclaimer}
                        </p>
                    </footer>
                </main>
            </div>

            <MjStickyCta
                cta={copy.sticky.cta}
                note={copy.sticky.note}
                heroId={HERO_ID}
            />
        </div>
    )
}

function GlobeIcon() {
    return (
        <svg
            viewBox='0 0 24 24'
            width='14'
            height='14'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            aria-hidden='true'
        >
            <circle cx='12' cy='12' r='9' />
            <path d='M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z' />
        </svg>
    )
}
