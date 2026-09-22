import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FLORIDA_UNAPPROVED_BOARD_STATEMENT,
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

import {
    bblBody,
    bblButtonPrimary,
    bblH3,
    bblLink,
    bblSectionPad,
} from './bbl-ui.constant'

const portrait = surgeons.find((surgeon) => surgeon.id === 'dr-karlinsky')
    ?.images.portrait

/** The year on her American Board of Surgery record. */
const certifiedSince = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

const credential = 'text-[1.0625rem] leading-[1.6] text-stone-700'

/**
 * "BBL surgeons in Miami: who performs your procedure." Every BBL at Alluring
 * is Dr. Karlinsky's. Each credential links to the issuing body's own record,
 * which is the check the safety section tells readers to make.
 *
 * The wording follows Florida Rule 64B8-11.001: see
 * `karlinsky-credentials.constant.ts`. The American Board of Cosmetic Surgery
 * line carries the rule's statement in the same element and type size, and
 * `check:bbl-copy` fails the page if the two are ever separated.
 */
export function BblSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='BBL surgeons in Miami: who performs your procedure'
            className={bblSectionPad}
            answer={`Every BBL at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} Under Florida law she examines you in person before surgery, removes and injects the fat herself and stays with you throughout.`}
        >
            <p className={cn(bblBody, 'mt-4.5')}>
                Searching for a BBL surgeon in Miami turns up a long list of
                names and a wide spread of prices. What separates them is where
                they put the fat, whether they follow Florida law on every case,
                how many patients they operate on at once, and whether you can
                check their credentials yourself.
            </p>

            <div className='mt-9 grid gap-7 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-9 md:grid-cols-[14rem_minmax(0,1fr)]'>
                {portrait && (
                    <figure className='w-40 sm:w-auto'>
                        <div className='bbl-unveil overflow-hidden rounded-[4px] bg-stone-200'>
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
                    <h3 className={bblH3}>Check her credentials yourself</h3>
                    <p className='mt-2 text-[0.9375rem] leading-normal text-stone-600'>
                        Each link opens her record on the issuing body&apos;s
                        own site.
                    </p>
                    <ul className='mt-5 divide-y divide-stone-200 border-y border-stone-200'>
                        <li className='py-4'>
                            <p className={credential}>
                                Licensed as a medical doctor by the{' '}
                                <a
                                    href={karlinskyRecords.floridaLicense}
                                    className={bblLink}
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
                                    href={
                                        karlinskyRecords.americanBoardOfSurgery
                                    }
                                    className={bblLink}
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
                                    className={bblLink}
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
                                    className={bblLink}
                                >
                                    American Board of Cosmetic Surgery
                                </a>
                                . {FLORIDA_UNAPPROVED_BOARD_STATEMENT}
                            </p>
                        </li>
                    </ul>
                </div>
            </div>

            <p className={cn(bblBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines you, looks
                at where you carry fat, and tells you which type of BBL fits
                your body and your goals, including when a BBL is not the right
                choice.
            </p>
            <div className='mt-8 flex flex-col items-start gap-5 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:gap-8'>
                <a href='#book' className={bblButtonPrimary}>
                    Book with {KARLINSKY_SHORT_NAME}
                </a>
                <Link
                    href='/dr-karlinsky'
                    className={cn(bblLink, 'text-[1.0625rem] font-bold')}
                >
                    Meet {KARLINSKY_SHORT_NAME}
                </Link>
            </div>
        </AnswerBlock>
    )
}
