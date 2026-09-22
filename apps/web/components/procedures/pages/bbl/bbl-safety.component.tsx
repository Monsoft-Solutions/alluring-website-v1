import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import {
    bblButtonPrimary,
    bblButtonSecondary,
    bblContainer,
} from './bbl-ui.constant'

const law = [
    {
        title: 'Fat under the skin only',
        body: 'Fat goes only into the layer under the skin and never crosses the fascia, the tissue that covers the gluteal muscle.',
    },
    {
        title: 'Ultrasound guidance',
        body: 'The surgeon uses ultrasound while moving the cannula, to see where the fat is going.',
    },
    {
        title: 'One surgeon, one patient',
        body: 'Your surgeon stays with you for the whole procedure and is not operating on anyone else at the same time.',
    },
    {
        title: 'An exam before surgery day',
        body: 'The surgeon examines you in person no later than the day before surgery.',
    },
    {
        title: 'The surgeon does the transfer',
        body: 'The surgeon removes and injects the fat personally. That work cannot be handed to anyone else.',
    },
]

const evidence = [
    {
        title: 'Why the law exists',
        body: 'South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022. 92% of those patients had surgery at high-volume, budget clinics, and in every case examined at autopsy, fat had been injected into the muscle (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023).',
        sourceId: 'pazmino-garcia-2023',
    },
    {
        title: 'How often complications happen',
        body: 'A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, most often a seroma (a pocket of fluid) in 2.03%. Major complications were less common with ultrasound guidance: 0.02% versus 0.08% (Elsaftawy and colleagues, Plastic and Reconstructive Surgery, 2026).',
        sourceId: 'elsaftawy-meta-analysis-2026',
    },
]

const checklist = [
    'Where exactly will you place the fat, and how do you confirm it stays under the skin?',
    'Do you watch the cannula on ultrasound while you inject?',
    'Will you remove and inject the fat yourself, and stay with me for the whole surgery?',
    'Are you operating on anyone else while I am in surgery?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
    'Who gives the anesthesia, and where does the surgery take place?',
]

const h3Dark =
    'font-serif text-xl leading-[1.3] font-medium text-stone-50 md:text-[1.375rem]'
const bodyDark =
    'text-[1.0625rem] leading-[1.6] text-stone-300 md:leading-[1.65]'

/**
 * Where Florida law lets fat go, as the layers of the buttock. Real text, not
 * a picture of text, so it is read, translated and quoted like the rest of
 * the page. The cannula is drawn in as the diagram scrolls into view.
 */
function BblStrata() {
    return (
        <figure aria-label='Where Florida law allows fat to go: the layers of the buttock'>
            <div className='flex flex-col border border-stone-700'>
                <div className='flex h-14 items-center bg-[#2B2724] px-5'>
                    <p className='text-base font-bold text-stone-100'>Skin</p>
                </div>
                <div className='bg-gold-400/15 flex min-h-[10.5rem] flex-col justify-between gap-6 p-5 lg:min-h-[11.875rem]'>
                    <div>
                        <p className='text-gold-100 font-serif text-2xl leading-[1.2]'>
                            Fat under the skin
                        </p>
                        <p className='mt-1.5 text-[0.9375rem] leading-[1.45] text-stone-200'>
                            The only layer Florida law allows fat to go
                        </p>
                    </div>
                    <div className='flex items-center'>
                        <span
                            aria-hidden='true'
                            className='bbl-cannula bg-gold-400 relative block h-0.5 w-[40%] after:absolute after:top-1/2 after:-right-1 after:size-2 after:-translate-y-1/2 after:rounded-full after:bg-inherit lg:w-[56%]'
                        />
                        <p className='ml-4 text-[0.8125rem] leading-[1.4] text-stone-300'>
                            Cannula, watched on ultrasound
                        </p>
                    </div>
                </div>
                <div aria-hidden='true' className='bg-gold-500 h-1' />
                <div className='flex items-baseline justify-between gap-3 bg-stone-900 px-5 py-3'>
                    <p className='text-gold-100 text-base font-bold'>
                        Gluteal fascia
                    </p>
                    <p className='text-gold-400 text-[0.9375rem]'>
                        Never crossed
                    </p>
                </div>
                <div className='min-h-[7.5rem] bg-[repeating-linear-gradient(135deg,#191614_0px,#191614_10px,#221E1B_10px,#221E1B_20px)] p-5 lg:min-h-[9.375rem]'>
                    <p className='text-base font-bold text-stone-400'>
                        Gluteal muscle
                    </p>
                    <p className='mt-1 text-[0.9375rem] text-stone-400'>
                        Fat never goes here
                    </p>
                </div>
            </div>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                Layers not to scale. Florida Statutes §458.328.
            </figcaption>
        </figure>
    )
}

/**
 * "Is a BBL safe in Miami?" The page's one dark band, which opens from an
 * inset card to full width as it arrives (`bbl-scene`). The layer diagram
 * sits between the answer and the law on phones, and stays pinned beside
 * the reading column from `lg`.
 *
 * It ends where a reader has just been told to question every surgeon, so
 * the band's last word is an invitation to question ours.
 */
export function BblSafety() {
    return (
        <div className='bbl-scene bg-stone-900'>
            <div className={cn(bblContainer, 'py-12 md:py-24')}>
                <section
                    id='safety'
                    aria-labelledby='safety-heading'
                    className='answer-block grid scroll-mt-32 lg:scroll-mt-40 lg:grid-cols-[minmax(0,40rem)_28.75rem] lg:grid-rows-[auto_auto_1fr] lg:justify-between lg:gap-x-16'
                >
                    <h2
                        id='safety-heading'
                        className='font-serif text-[1.75rem] leading-[1.2] font-medium text-balance text-stone-50 md:text-[2.375rem] md:leading-[1.15] lg:col-start-1 lg:row-start-1'
                    >
                        Is a BBL safe in Miami?
                    </h2>
                    <p className='answer-block__answer mt-4 text-[1.0625rem] leading-[1.6] text-stone-200 md:mt-5 md:text-lg md:leading-[1.65] lg:col-start-1 lg:row-start-2'>
                        A BBL&apos;s most serious risk is a fat embolism: fat
                        injected into or below the gluteal muscle can enter a
                        blood vessel, which can be fatal. The risk is lowest
                        when the fat stays under the skin, and Florida law now
                        requires exactly that, along with ultrasound guidance
                        and one surgeon for one patient.
                    </p>
                    <div className='mt-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-0'>
                        <div className='lg:sticky lg:top-40'>
                            <BblStrata />
                        </div>
                    </div>
                    <div className='lg:col-start-1 lg:row-start-3'>
                        <h3 className={cn(h3Dark, 'mt-10 md:mt-12')}>
                            What Florida law requires
                        </h3>
                        <p className='mt-1.5 text-sm text-stone-400'>
                            <a
                                href='#source-florida-statutes-458-328'
                                className='underline decoration-stone-600 underline-offset-4 hover:text-stone-200'
                            >
                                Florida Statutes §458.328
                            </a>
                        </p>
                        <ul className='mt-5 flex flex-col gap-4.5'>
                            {law.map((item) => (
                                <li
                                    key={item.title}
                                    className='grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3.5'
                                >
                                    <span
                                        aria-hidden='true'
                                        className='bg-gold-400 mt-2.5 size-2'
                                    />
                                    <div>
                                        <p className='text-[1.0625rem] leading-[1.55] font-bold text-stone-100'>
                                            {item.title}
                                        </p>
                                        <p className={cn(bodyDark, 'mt-0.5')}>
                                            {item.body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <h3 className={cn(h3Dark, 'mt-10 md:mt-12')}>
                            What the research shows
                        </h3>
                        <div className='mt-4.5 flex flex-col gap-6'>
                            {evidence.map((item) => (
                                <div key={item.title}>
                                    <p className='text-[1.0625rem] leading-[1.55] font-bold text-stone-100'>
                                        {item.title}
                                    </p>
                                    <p
                                        className={cn(
                                            bodyDark,
                                            'mt-1 tabular-nums'
                                        )}
                                    >
                                        {item.body}{' '}
                                        <a
                                            href={`#source-${item.sourceId}`}
                                            className='text-sm whitespace-nowrap text-stone-400 underline decoration-stone-600 underline-offset-4 hover:text-stone-200'
                                        >
                                            Source
                                        </a>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    aria-labelledby='ask-heading'
                    className='mt-12 border-t border-stone-700 pt-10 md:mt-16 md:pt-12'
                >
                    <h3 id='ask-heading' className={h3Dark}>
                        Questions to ask any BBL surgeon, including us
                    </h3>
                    <ul className='mt-5.5 grid gap-3.5 md:grid-cols-2 md:gap-x-12 md:gap-y-4.5'>
                        {checklist.map((question) => (
                            <li
                                key={question}
                                className='flex gap-3.5 text-[1.0625rem] leading-[1.6] text-stone-200'
                            >
                                <span
                                    aria-hidden='true'
                                    className='border-gold-400 mt-1 size-[1.125rem] shrink-0 rounded-[3px] border-[1.5px]'
                                />
                                <span>{question}</span>
                            </li>
                        ))}
                    </ul>
                    <p className='text-gold-100 mt-7 text-[1.0625rem] leading-[1.55] font-bold md:text-lg'>
                        A clinic that cannot answer these clearly is one to walk
                        away from.
                    </p>
                    <div className='mt-9 flex flex-col gap-6 border-t border-stone-700 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12'>
                        <div className='max-w-[37.5rem]'>
                            <p className='font-serif text-[1.375rem] leading-[1.3] text-stone-50 md:text-[1.625rem]'>
                                Ask {KARLINSKY_SHORT_NAME} every one of them.
                            </p>
                            <p className={cn(bodyDark, 'mt-2')}>
                                Bring this list to your free consultation, and
                                she answers each question before you decide
                                anything. Her credentials are below, each one
                                linked to the issuing body&apos;s own record.
                            </p>
                        </div>
                        <div className='flex flex-col gap-2.5 sm:flex-row sm:gap-3 lg:shrink-0'>
                            <a href='#book' className={bblButtonPrimary}>
                                Book a free consultation
                            </a>
                            {/* Phones have the sticky bar's call button
                                right below. */}
                            <a
                                href={getPhoneLink()}
                                data-copy-check='data'
                                className={cn(
                                    bblButtonSecondary,
                                    'hidden tabular-nums sm:inline-flex'
                                )}
                            >
                                <Phone
                                    aria-hidden='true'
                                    className='size-[1.125rem]'
                                />
                                Call {siteConfig.contact.phoneDisplay}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
