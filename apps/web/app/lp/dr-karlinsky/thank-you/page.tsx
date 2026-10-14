/**
 * /lp/dr-karlinsky/thank-you — where a request from Dr. Karlinsky's page
 * lands (#332).
 *
 * Reached by a full page load from the form (`useConsultFlow`), so the tag
 * container records a real page view: GTM's lead conversions fire on paths
 * containing "thank-you". `?hl=` carries the language over. Never indexed.
 */

import type { Metadata, Viewport } from 'next'
import Image from 'next/image'

import { LpLegalDialog } from '@/components/landing-pages/request-consultation/lp-legal-dialog.component'
import { LP_LEGAL_HREFS } from '@/components/landing-pages/request-consultation/lp-legal'
import { DRK_COPY } from '@/components/landing-pages/dr-karlinsky-ig/drk-copy'
import { DRK_AVATAR } from '@/components/landing-pages/dr-karlinsky-ig/drk-media'
import { DrkThankYou } from '@/components/landing-pages/dr-karlinsky-ig/drk-thank-you.component'
import { resolveLpLanguage } from '@/components/landing-pages/request-consultation/lp-language'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import '../drk.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

function langOf(params: SearchParams) {
    const requested = Array.isArray(params.hl) ? params.hl[0] : params.hl
    // The form always sends `?hl=`; no Accept-Language fallback needed.
    return resolveLpLanguage(requested, null).lang
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const lang = langOf(await searchParams)
    return {
        title: { absolute: DRK_COPY[lang].thankYou.metaTitle },
        robots: { index: false, follow: false },
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#221813',
}

export default async function DrKarlinskyThankYouPage({
    searchParams,
}: PageProps) {
    const lang = langOf(await searchParams)
    const copy = DRK_COPY[lang]
    const phone = getPhoneLink()

    return (
        <div className='drk drk--ty' lang={lang}>
            <header className='drk-top drk-top--ty'>
                <span className='drk-ty__who'>
                    <span
                        className='drk-ring drk-ring--still drk-ring--sm'
                        aria-hidden='true'
                    >
                        <span
                            className={`drk-ring__face${DRK_AVATAR.faceCrop ? ' drk-ring__face--crop' : ''}`}
                        >
                            <Image
                                src={DRK_AVATAR.src}
                                width={DRK_AVATAR.width}
                                height={DRK_AVATAR.height}
                                sizes='40px'
                                alt=''
                                priority
                            />
                        </span>
                    </span>
                    <span className='drk-story__text'>
                        <span className='drk-story__handle'>
                            {copy.story.handle}
                        </span>
                        <span className='drk-story__label'>
                            {copy.about.name}
                        </span>
                    </span>
                </span>
                <a
                    className='drk-top__call'
                    href={phone}
                    aria-label={`${copy.top.callAria}, ${siteConfig.contact.phoneDisplay}`}
                    data-cta='drk_call_thank_you'
                >
                    {copy.top.call}
                </a>
            </header>

            <main>
                <DrkThankYou lang={lang} override={copy.thankYou.override} />
                <p className='drk-ty__sign'>
                    <span>{copy.thankYou.signoff}</span>
                    <span className='drk-ty__name'>
                        {copy.thankYou.signName}
                    </span>
                </p>
            </main>

            <footer className='drk-footer'>
                <div className='drk-wrap'>
                    <p className='drk-footer__legal'>
                        <a href={LP_LEGAL_HREFS.privacy}>
                            {copy.footer.privacy}
                        </a>
                        <a href={LP_LEGAL_HREFS.terms}>{copy.footer.terms}</a>
                        <a href={LP_LEGAL_HREFS.cookies}>
                            {copy.footer.cookies}
                        </a>
                    </p>
                    <p className='drk-footer__fine'>
                        © {new Date().getFullYear()} {siteConfig.business.name}
                        . {copy.footer.rights}
                    </p>
                </div>
            </footer>
            <LpLegalDialog copy={copy.footer} />
        </div>
    )
}
