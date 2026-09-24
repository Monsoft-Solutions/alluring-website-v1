import { cn } from '@workspace/ui/lib/utils'

import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'

import {
    HOME_CHAT_ID,
    HOME_MEDIA,
    HOME_SECTION_IDS,
    MODEL_DISCLOSURE,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
    homePrimaryButtonOnDark,
} from './home-page.constant'

/**
 * The closing scene: sunrise on Miami Beach, one line and one button back to
 * the consultation thread, for the visitor who read everything. The phone
 * number, address and hours sit under it for the ones who came for those.
 */
export function HomeClose() {
    const hours = (siteConfig.contact.businessHours ?? [])
        .filter((row) => row.open !== 'Closed')
        .map((row) => `${row.days} ${row.open}–${row.close}`)
        .join(' · ')

    return (
        <section
            id={HOME_SECTION_IDS.close}
            aria-labelledby='close-title'
            className='hp-dark hp-grain hp-scene hp-defer relative isolate overflow-hidden'
        >
            {/* On phones the sunrise is a window, an arch above the words, so
                nothing is read over the photograph. From `md` it fills the
                band behind them, darkened on the text's side. */}
            <div
                aria-hidden='true'
                className='hp-arch hp-arch-unveil hp-close-media relative mx-auto mt-14 aspect-[4/5] w-[calc(100%-2.5rem)] max-w-[24rem] md:absolute md:inset-0 md:-z-10 md:mt-0 md:aspect-auto md:w-auto md:max-w-none md:rounded-none'
            >
                <picture>
                    <source
                        media='(width >= 48rem)'
                        srcSet={HOME_MEDIA.closeDesktop}
                    />
                    <img
                        src={HOME_MEDIA.closeMobile}
                        alt=''
                        loading='lazy'
                        decoding='async'
                        className='h-full w-full object-cover object-[50%_55%] md:object-[70%_50%]'
                    />
                </picture>
                <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(20,13,10,0)_65%,rgba(20,13,10,0.3)_100%)] md:bg-[linear-gradient(90deg,rgba(20,13,10,0.8)_0%,rgba(20,13,10,0.45)_45%,rgba(20,13,10,0)_75%)]' />
            </div>

            <div
                className={cn(
                    homeContainer,
                    'flex flex-col pt-10 pb-20 md:min-h-[44rem] md:justify-center md:py-28'
                )}
            >
                <div className='max-w-[36rem]'>
                    <h2 id='close-title' className={homeHeading}>
                        Your after starts with <em>one tap.</em>
                    </h2>
                    <p className={cn(homeLead, 'mt-6 text-[var(--hp-fg-2)]')}>
                        A free consultation, a plan for your body and your price
                        in writing. Start tonight; we text you back.
                    </p>
                    <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_close_consult'
                            className={homePrimaryButtonOnDark}
                        >
                            Start my free consultation
                        </a>
                        <a href={getPhoneLink()} className={homeLink}>
                            or call {siteConfig.contact.phoneDisplay}
                        </a>
                    </div>
                    <address className='mt-10 border-t border-[var(--hp-rule)] pt-5 text-sm leading-relaxed text-[var(--hp-fg-2)] not-italic'>
                        {siteConfig.business.name} · {getFullAddress()}
                        <br />
                        {hours}
                    </address>
                </div>
            </div>

            <p className='absolute right-4 bottom-3 text-[0.6875rem] text-[var(--hp-fg-2)] md:right-8'>
                {MODEL_DISCLOSURE}
            </p>
        </section>
    )
}
