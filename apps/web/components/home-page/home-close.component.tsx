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
    homePrimaryButton,
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
            className='hp-scene hp-defer relative isolate overflow-hidden bg-stone-950 text-stone-50'
        >
            <div aria-hidden='true' className='absolute inset-0 -z-10'>
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
                        className='h-full w-full object-cover object-[50%_70%] md:object-[70%_50%]'
                    />
                </picture>
                <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.55)_0%,rgba(12,10,9,0.25)_35%,rgba(12,10,9,0.82)_100%)] md:bg-[linear-gradient(90deg,rgba(12,10,9,0.78)_0%,rgba(12,10,9,0.45)_45%,rgba(12,10,9,0)_75%)]' />
            </div>

            <div
                className={cn(
                    homeContainer,
                    'flex min-h-[40rem] flex-col justify-end py-16 md:min-h-[44rem] md:justify-center md:py-28'
                )}
            >
                <div className='max-w-[34rem]'>
                    <h2
                        id='close-title'
                        className={cn(homeHeading, 'text-stone-50')}
                    >
                        Your after starts with{' '}
                        <em className='text-gold-300 italic'>one tap.</em>
                    </h2>
                    <p className='mt-5 text-lg leading-relaxed text-stone-200'>
                        A free consultation, a plan for your body and your price
                        in writing. Start tonight; we text you back.
                    </p>
                    <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_close_consult'
                            className={homePrimaryButton}
                        >
                            Start my free consultation
                        </a>
                        <a
                            href={getPhoneLink()}
                            className='decoration-gold-400 font-bold text-stone-50 underline underline-offset-4'
                        >
                            or call {siteConfig.contact.phoneDisplay}
                        </a>
                    </div>
                    <address className='mt-10 text-sm leading-relaxed text-stone-300 not-italic'>
                        {siteConfig.business.name} · {getFullAddress()}
                        <br />
                        {hours}
                    </address>
                </div>
            </div>

            <p className='absolute right-4 bottom-3 text-[0.6875rem] text-stone-300 md:right-8'>
                {MODEL_DISCLOSURE}
            </p>
        </section>
    )
}
