'use client'

/**
 * The ad funnel's confirmation page.
 *
 * Its body is the site's consultation thank-you (`ConsultationThankYou`):
 * it greets the visitor by the first name the thread left in
 * `sessionStorage`, says when the text will come, and asks five optional
 * one-tap questions (email, video or in person, financing, best time to
 * text, how she heard of us), each saved to the lead she just sent. The old
 * page offered links to the gallery and the surgeon page instead — two more
 * ways off it, and nothing learned.
 *
 * Its other job is the `lp_lead_submitted` dataLayer event. The Google Ads
 * conversion tag fires on this page's view (its path contains "thank-you");
 * the event carries the ad group, language and page version for reporting.
 */

import Image from 'next/image'
import { useEffect } from 'react'

import { ConsultationThankYou } from '@/components/sections/thank-you/consultation-thank-you.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import { LP_LOGO } from './lp-assets'
import { LP_LEAD_KEY } from './lp-config'
import { LP_COPY, type LpLang } from './lp-copy'
import { LP_LEGAL_HREFS } from './lp-legal'
import { LpLegalDialog } from './lp-legal-dialog.component'
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

const THANK_YOU_OVERRIDE = {
    en: LP_THANK_YOU_COPY.en.thankYou,
    es: LP_THANK_YOU_COPY.es.thankYou,
} as const

export function LpThankYou({
    initialLang,
    langPinnedByUrl,
    adVariant,
    pageVersion,
}: LpThankYouProps) {
    const [lang] = useLpLanguage(initialLang, langPinnedByUrl)
    const copy = LP_THANK_YOU_COPY[lang]
    const footer = LP_COPY[lang].footer

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
                    <span className='brand'>
                        <Image
                            src={LP_LOGO.src}
                            width={LP_LOGO.width}
                            height={LP_LOGO.height}
                            alt={siteConfig.business.name}
                            priority
                        />
                    </span>
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
                <ConsultationThankYou
                    leadStorageKey={LP_LEAD_KEY}
                    copyOverride={THANK_YOU_OVERRIDE}
                    lang={lang}
                    compact
                />
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
                        <a href={LP_LEGAL_HREFS.privacy}>{footer.privacy}</a>
                        <a href={LP_LEGAL_HREFS.terms}>{footer.terms}</a>
                        <a href={LP_LEGAL_HREFS.cookies}>{footer.cookies}</a>
                    </nav>
                </div>
            </footer>
            <LpLegalDialog copy={footer} />
        </div>
    )
}
