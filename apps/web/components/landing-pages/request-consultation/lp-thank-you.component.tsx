'use client'

/**
 * The ad funnel's confirmation page.
 *
 * Its one job beyond reassurance is the `lp_lead_submitted` dataLayer event.
 * The Google Ads conversion should trigger on that event, NOT on a path
 * containing "/thank-you" — the site has its own `/thank-you` for organic form
 * submissions, and a path trigger would fire there too and inflate paid
 * conversions with organic leads.
 */

import Image from 'next/image'
import { useEffect } from 'react'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import { LP_LOGO } from './lp-assets'
import { LP_LINKS, type LpLang } from './lp-copy'
import { PhoneIcon } from './lp-primitives.component'
import { LP_THANK_YOU_COPY } from './lp-thank-you-copy'
import { pushDataLayer, readAttribution } from './lp-tracking'
import { useLpLanguage } from './use-lp-language.hook'

interface LpThankYouProps {
    readonly initialLang: LpLang
    readonly langPinnedByUrl: boolean
    /** The ad group the lead came from, straight off the redirect's `?p=`. */
    readonly adVariant: string
    /** Which version of the landing page produced the lead (`?pv=`). */
    readonly pageVersion: string
}

export function LpThankYou({
    initialLang,
    langPinnedByUrl,
    adVariant,
    pageVersion,
}: LpThankYouProps) {
    const [lang] = useLpLanguage(initialLang, langPinnedByUrl)
    const copy = LP_THANK_YOU_COPY[lang]

    /**
     * The conversion event. Campaign identifiers only — no personal data
     * reaches Google from this page.
     */
    useEffect(() => {
        const campaign = readAttribution()
        pushDataLayer({
            event: 'lp_lead_submitted',
            pageVariant: `ads-consultation-${pageVersion}`,
            adVariant,
            lang: initialLang,
            gclid: campaign.gclid,
            utm_source: campaign.utm_source,
            utm_medium: campaign.utm_medium,
            utm_campaign: campaign.utm_campaign,
        })
    }, [adVariant, pageVersion, initialLang])

    useEffect(() => {
        const { documentElement } = document
        const previousLang = documentElement.lang
        const previousTitle = document.title
        documentElement.lang = lang
        document.title = copy.meta.title
        return () => {
            documentElement.lang = previousLang
            document.title = previousTitle
        }
    }, [lang, copy.meta.title])

    return (
        <div className='aps-ty'>
            <div className='topbar'>
                {copy.topbar.lead}
                <b>{copy.topbar.emphasis}</b>
            </div>

            <header>
                <div className='wrap header-in'>
                    <a
                        className='brand'
                        href={LP_LINKS.home}
                        aria-label={siteConfig.business.name}
                    >
                        <Image
                            src={LP_LOGO.src}
                            width={LP_LOGO.width}
                            height={LP_LOGO.height}
                            alt={siteConfig.business.name}
                            priority
                        />
                    </a>
                    <a className='tel' href={getPhoneLink()}>
                        <PhoneIcon />
                        <span>
                            <span className='tel-word'>{copy.callWord}</span>
                            {siteConfig.contact.phoneDisplay}
                        </span>
                    </a>
                </div>
            </header>

            <main>
                <div className='wrap panel'>
                    <div className='seal'>
                        <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            aria-hidden='true'
                        >
                            <path d='M20 6 9 17l-5-5' />
                        </svg>
                    </div>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h1>{copy.heading}</h1>
                    <p className='lede'>{copy.lede}</p>

                    <div className='next'>
                        {copy.steps.map((item) => (
                            <div key={item.heading}>
                                <p className='n'>{item.step}</p>
                                <h2>{item.heading}</h2>
                                <p>{item.body}</p>
                            </div>
                        ))}
                    </div>

                    <p className='eyebrow'>{copy.waitEyebrow}</p>
                    <div className='actions'>
                        <a className='btn btn-primary' href={LP_LINKS.gallery}>
                            {copy.galleryCta}
                        </a>
                        <a className='btn btn-ghost' href={LP_LINKS.surgeon}>
                            {copy.surgeonCta}
                        </a>
                    </div>
                    <p className='callnow'>
                        {copy.callNow}{' '}
                        <a href={getPhoneLink()}>
                            {siteConfig.contact.phoneDisplay}
                        </a>
                        .
                    </p>
                </div>
            </main>

            <footer className='site'>
                <div className='wrap foot-in'>
                    <span>
                        © {new Date().getFullYear()} {siteConfig.business.name}{' '}
                        · {siteConfig.contact.address},{' '}
                        {siteConfig.contact.city}, {siteConfig.contact.state}{' '}
                        {siteConfig.contact.postalCode}
                    </span>
                    <nav>
                        <a href={LP_LINKS.privacy}>{copy.privacy}</a>
                        <a href={LP_LINKS.terms}>{copy.terms}</a>
                        <a href={LP_LINKS.cookies}>{copy.cookies}</a>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
