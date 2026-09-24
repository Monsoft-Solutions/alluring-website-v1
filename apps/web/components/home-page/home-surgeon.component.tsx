import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_CREDENTIALS,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    homeContainer,
    homeEyebrow,
    homeHeading,
    homeLink,
} from './home-page.constant'

const ABS_YEAR = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

/**
 * Each credential with the public record a patient can check it against.
 * The American Board of Cosmetic Surgery is not a board the Florida Board of
 * Medicine approves, so it carries Rule 64B8-11.001(2)(f)'s statement,
 * verbatim and in the same type size (karlinsky-credentials.constant.ts).
 */
const RECORDS = [
    {
        label: `Board certified in general surgery since ${ABS_YEAR}`,
        by: 'American Board of Surgery',
        href: karlinskyRecords.americanBoardOfSurgery,
    },
    {
        label: 'Fellow of the American College of Surgeons (FACS)',
        by: 'American College of Surgeons',
        href: karlinskyRecords.americanCollegeOfSurgeons,
    },
    {
        label: `Florida medical license ${KARLINSKY_FLORIDA_LICENSE}, clear and active`,
        by: 'Florida Department of Health',
        href: karlinskyRecords.floridaLicense,
    },
    {
        label: 'Certified by the American Board of Cosmetic Surgery',
        by: 'American Board of Cosmetic Surgery',
        href: karlinskyRecords.americanBoardOfCosmeticSurgery,
        statement: FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    },
] as const

/**
 * Who operates. Competitors list rosters of four to twenty-one surgeons;
 * Alluring has one, and says so. The copy names only verified credentials,
 * each linked to its issuing body, and never calls her a plastic surgeon
 * (she is not certified by the American Board of Plastic Surgery).
 */
export function HomeSurgeon() {
    return (
        <section
            id={HOME_SECTION_IDS.surgeon}
            aria-labelledby='surgeon-title'
            className='hp-defer overflow-hidden bg-white py-16 md:py-28'
        >
            <div
                className={cn(
                    homeContainer,
                    'grid items-center gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16'
                )}
            >
                <figure className='relative'>
                    <div className='hp-unveil relative mx-auto aspect-[4/5] w-[82%] max-w-[28rem] overflow-hidden rounded-[2rem] bg-stone-200 md:w-full'>
                        <Image
                            src='/images/surgeons/dr-karlinsky.webp'
                            alt={`${KARLINSKY_NAME}, the surgeon at Alluring Plastic Surgery`}
                            fill
                            sizes='(width >= 48rem) 28rem, 100vw'
                            className='hp-parallax scale-[1.12] object-cover object-top'
                        />
                    </div>
                    <figcaption className='absolute -bottom-5 left-1/2 w-[86%] max-w-[24rem] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/85 px-5 py-4 text-center shadow-[0_30px_60px_-30px_rgba(28,25,23,0.5)] backdrop-blur-xl'>
                        <span className='block font-serif text-lg text-stone-950'>
                            {KARLINSKY_NAME}
                        </span>
                        <span className='text-sm text-stone-600'>
                            The one surgeon at Alluring
                        </span>
                    </figcaption>
                </figure>

                <div className='pt-6 md:pt-0'>
                    <p className={homeEyebrow}>Your surgeon</p>
                    <h2
                        id='surgeon-title'
                        className={cn(homeHeading, 'mt-4 text-stone-950')}
                    >
                        One surgeon.{' '}
                        <em className='text-[#8a6c12] italic'>
                            Every surgery.
                        </em>
                    </h2>
                    <p className='mt-5 text-lg leading-relaxed text-stone-600'>
                        Every procedure at Alluring is performed by{' '}
                        {KARLINSKY_NAME}. {KARLINSKY_CREDENTIALS} You know whose
                        hands you’re in before you book.
                    </p>

                    <p className='mt-8 text-sm font-bold text-stone-950'>
                        Don’t take our word for it. Check each record:
                    </p>
                    <ul className='mt-4 divide-y divide-stone-200 border-y border-stone-200'>
                        {RECORDS.map((record) => (
                            <li key={record.href} className='py-4'>
                                <a
                                    href={record.href}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='group flex items-start justify-between gap-4'
                                >
                                    <span>
                                        <span className='block font-bold text-stone-950 group-hover:underline'>
                                            {record.label}
                                        </span>
                                        <span className='text-sm text-stone-500'>
                                            {record.by}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden='true'
                                        className='mt-1 text-[#8a6c12] transition-transform group-hover:translate-x-1'
                                    >
                                        ↗
                                    </span>
                                </a>
                                {'statement' in record && (
                                    <p className='mt-2 font-bold text-stone-950'>
                                        {record.statement}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className='mt-8 flex flex-wrap gap-x-6 gap-y-3'>
                        <Link
                            href='/dr-karlinsky'
                            className={cn(homeLink, 'text-stone-900')}
                        >
                            Meet {KARLINSKY_SHORT_NAME}
                        </Link>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_surgeon_consult'
                            className={cn(homeLink, 'text-stone-900')}
                        >
                            Book a free consultation
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
