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

import { HomeEyebrow } from './home-eyebrow.component'
import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    HOME_SECTION_INDEX,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
    homePrimaryButton,
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
            className='hp-defer overflow-hidden bg-[var(--hp-nude)] py-16 md:py-28'
        >
            <div
                className={cn(
                    homeContainer,
                    'grid items-center gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16 lg:gap-24'
                )}
            >
                <figure>
                    <div className='hp-arch hp-arch-unveil relative mx-auto aspect-[4/5] w-[80%] max-w-[26rem] bg-[var(--hp-linen)] md:w-full'>
                        <Image
                            src='/images/surgeons/dr-karlinsky.webp'
                            alt={`${KARLINSKY_NAME}, the surgeon at Alluring Plastic Surgery`}
                            fill
                            sizes='(width >= 48rem) 26rem, 80vw'
                            className='hp-parallax scale-[1.12] object-cover object-top'
                        />
                    </div>
                    <figcaption className='mx-auto mt-5 max-w-[26rem] text-center'>
                        <span className='hp-display hp-display--small block text-[1.375rem] text-[var(--hp-ink)]'>
                            {KARLINSKY_NAME}
                        </span>
                        <span className='mt-1 block text-[0.75rem] font-semibold tracking-[0.2em] text-[var(--hp-ink-2)] uppercase'>
                            The one surgeon at Alluring
                        </span>
                    </figcaption>
                </figure>

                <div>
                    <HomeEyebrow index={HOME_SECTION_INDEX.surgeon}>
                        Your surgeon
                    </HomeEyebrow>
                    <h2 id='surgeon-title' className={cn(homeHeading, 'mt-5')}>
                        One surgeon. <em>Every surgery.</em>
                    </h2>
                    <p className={cn(homeLead, 'mt-6 text-[var(--hp-ink-2)]')}>
                        Every procedure at Alluring is performed by{' '}
                        {KARLINSKY_NAME}. {KARLINSKY_CREDENTIALS} You know whose
                        hands you’re in before you book.
                    </p>

                    <p className='mt-9 text-[0.75rem] font-semibold tracking-[0.2em] text-[var(--hp-ink-2)] uppercase'>
                        Don’t take our word for it. Check each record
                    </p>
                    <ul className='mt-4 divide-y divide-[var(--hp-line)] border-y border-[var(--hp-line)]'>
                        {RECORDS.map((record) => (
                            <li key={record.href} className='py-4'>
                                <a
                                    href={record.href}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='group flex items-start justify-between gap-4'
                                >
                                    <span>
                                        <span className='block font-semibold text-[var(--hp-ink)] group-hover:underline'>
                                            {record.label}
                                        </span>
                                        <span className='text-sm text-[var(--hp-ink-2)]'>
                                            {record.by}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden='true'
                                        className='mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-[var(--hp-line)] text-sm text-[var(--hp-bronze)] transition-colors group-hover:border-[var(--hp-ink)] group-hover:bg-[var(--hp-ink)] group-hover:text-[var(--hp-porcelain)]'
                                    >
                                        ↗
                                    </span>
                                </a>
                                {'statement' in record && (
                                    <p className='mt-2 font-semibold text-[var(--hp-ink)]'>
                                        {record.statement}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className='mt-9 flex flex-wrap items-center gap-x-6 gap-y-4'>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_surgeon_consult'
                            className={homePrimaryButton}
                        >
                            Book a free consultation
                        </a>
                        <Link href='/dr-karlinsky' className={homeLink}>
                            Meet {KARLINSKY_SHORT_NAME}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
