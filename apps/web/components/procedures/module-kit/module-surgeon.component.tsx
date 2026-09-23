import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

import { moduleButtonPrimary, moduleH3, moduleLink } from './module-ui.constant'

const portrait = surgeons.find((surgeon) => surgeon.id === 'dr-karlinsky')
    ?.images.portrait

/** The year on her American Board of Surgery record. */
const certifiedSince = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

const credential = 'text-[1.0625rem] leading-[1.6] text-stone-700'

/**
 * Dr. Karlinsky's real portrait and her credentials exactly as held, each one
 * linked to the issuing body's own record, which is the check every page's
 * safety section tells readers to make. She is the practice's only surgeon
 * (the owner, 2026-09-19).
 *
 * The wording follows Florida Rule 64B8-11.001: see
 * `karlinsky-credentials.constant.ts`. The American Board of Cosmetic Surgery
 * line carries the rule's statement in the same element and type size, and
 * the copy sweep fails a page if the two are ever separated.
 */
export function ModuleSurgeonCredentials() {
    return (
        <div className='mt-9 grid gap-7 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-9 md:grid-cols-[14rem_minmax(0,1fr)]'>
            {portrait && (
                <figure className='w-40 sm:w-auto'>
                    <div className='pm-unveil overflow-hidden rounded-[4px] bg-stone-200'>
                        <Image
                            src={portrait}
                            alt={`Portrait of ${KARLINSKY_NAME}`}
                            width={800}
                            height={1000}
                            sizes='(min-width: 768px) 224px, (min-width: 640px) 192px, 160px'
                            className='aspect-[4/5] w-full object-cover'
                        />
                    </div>
                    <figcaption className='mt-3 text-[0.9375rem] leading-normal text-stone-600'>
                        {KARLINSKY_NAME}
                    </figcaption>
                </figure>
            )}

            <div>
                <h3 className={moduleH3}>Check her credentials yourself</h3>
                <p className='mt-2 text-[0.9375rem] leading-normal text-stone-600'>
                    Each link opens her record on the issuing body&apos;s own
                    site.
                </p>
                <ul className='mt-5 divide-y divide-stone-200 border-y border-stone-200'>
                    <li className='py-4'>
                        <p className={credential}>
                            Licensed as a medical doctor by the{' '}
                            <a
                                href={karlinskyRecords.floridaLicense}
                                className={moduleLink}
                            >
                                Florida Department of Health
                            </a>
                            .
                        </p>
                    </li>
                    <li className='py-4'>
                        <p className={credential}>
                            Board certified in general surgery by the{' '}
                            <a
                                href={karlinskyRecords.americanBoardOfSurgery}
                                className={moduleLink}
                            >
                                American Board of Surgery
                            </a>{' '}
                            since {certifiedSince}.
                        </p>
                    </li>
                    <li className='py-4'>
                        <p className={credential}>
                            Fellow of the{' '}
                            <a
                                href={
                                    karlinskyRecords.americanCollegeOfSurgeons
                                }
                                className={moduleLink}
                            >
                                American College of Surgeons
                            </a>{' '}
                            (FACS).
                        </p>
                    </li>
                    <li className='py-4'>
                        <p className={credential}>
                            Certified in cosmetic surgery by the{' '}
                            <a
                                href={
                                    karlinskyRecords.americanBoardOfCosmeticSurgery
                                }
                                className={moduleLink}
                            >
                                American Board of Cosmetic Surgery
                            </a>
                            . {FLORIDA_UNAPPROVED_BOARD_STATEMENT}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    )
}

/** "Book with Dr. Karlinsky" and "Meet Dr. Karlinsky", closing the section. */
export function ModuleSurgeonActions() {
    return (
        <div className='mt-8 flex flex-col items-start gap-5 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:gap-8'>
            <a href='#book' className={moduleButtonPrimary}>
                Book with {KARLINSKY_SHORT_NAME}
            </a>
            <Link
                href='/dr-karlinsky'
                className={cn(moduleLink, 'text-[1.0625rem] font-bold')}
            >
                Meet {KARLINSKY_SHORT_NAME}
            </Link>
        </div>
    )
}
