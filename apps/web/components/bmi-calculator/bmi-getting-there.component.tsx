import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'

import { BmiAnswerSection } from './bmi-answer-section.component'
import {
    BMI_ANCHORS,
    BMI_CHAT_ID,
    bmiButtonOnDark,
    bmiContainer,
} from './bmi-page.constant'

const darkLink =
    'decoration-gold-300 text-stone-50 underline decoration-1 underline-offset-4 hover:decoration-stone-50'

function Step({
    index,
    title,
    children,
}: {
    index: string
    title: string
    children: ReactNode
}) {
    return (
        <li className='relative flex flex-col gap-3 rounded-t-[999px] rounded-b-[1.25rem] border border-[rgb(228_201_157/0.2)] bg-stone-950/40 px-6 pt-16 pb-7'>
            <span
                aria-hidden='true'
                className='text-gold-300 absolute top-6 left-1/2 -translate-x-1/2 font-serif text-[1.5rem] italic'
            >
                {index}
            </span>
            <h3 className='text-center font-serif text-[1.375rem] leading-[1.25] font-medium text-stone-50'>
                {title}
            </h3>
            <div className='flex flex-col gap-3 text-[1rem] leading-[1.65] text-stone-300'>
                {children}
            </div>
        </li>
    )
}

/**
 * The practice's stance (owner, 2026-10-17): we encourage patients to reach
 * the recommended range before surgery, and we help them get there. Four
 * steps, each sourced, then the invitation to plan it together.
 *
 * GLP-1 medicines get the neutral treatment the brief asks for: what the
 * anesthesia guidance says, no dosing, and "follow your prescriber's and
 * your surgeon's instructions".
 */
export function BmiGettingThere() {
    return (
        <div className='bmi-defer bmi-dark bmi-grain bg-stone-900 text-stone-50'>
            <BmiAnswerSection
                id={BMI_ANCHORS.gettingThere}
                tone='dark'
                eyebrow='Getting to your range'
                question={
                    <>
                        How do you reach your BMI range before <em>surgery</em>?
                    </>
                }
                answer={
                    <>
                        Lose weight at a steady pace, then hold it: after
                        dramatic weight loss, The Aesthetic Society&apos;s
                        guidance for a buttock lift is a stable weight for at
                        least six months. If a GLP-1 medicine is part of your
                        plan, follow your prescriber&apos;s and your
                        surgeon&apos;s instructions. Combined procedures can be
                        staged. Talk to us early; we&apos;ll plan with you.
                    </>
                }
                className={cn(bmiContainer, 'py-16 md:py-28')}
            >
                <ol className='mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
                    <Step index='i' title='Lose at a steady pace'>
                        <p>
                            The CDC finds that people who lose weight at a
                            gradual, steady pace are more likely to keep it off
                            than people who lose it quicker. The calculator
                            shows how far you are, and roughly how long that
                            pace would take.
                        </p>
                        <p>
                            Work with your doctor or a dietitian on a plan you
                            can keep.
                        </p>
                    </Step>
                    <Step index='ii' title='Hold a stable weight'>
                        <p>
                            A result planned at a weight you&apos;ll keep is a
                            result that lasts. ASPS advises people planning
                            substantial weight loss to postpone a tummy tuck,
                            and The Aesthetic Society says to wait on
                            liposuction if you plan to lose a significant
                            amount.
                        </p>
                        <p>
                            After dramatic weight loss or bariatric surgery, its
                            guidance for a buttock lift is a stable weight for
                            at least six months, with no further loss expected.
                        </p>
                    </Step>
                    <Step index='iii' title='If you take a GLP-1 medicine'>
                        <p>
                            Because GLP-1 medicines slow how fast the stomach
                            empties, anesthesia and surgery societies issued
                            joint guidance in 2024: most patients can keep
                            taking them before elective surgery, and those at
                            highest risk may be asked to follow a liquid diet
                            for 24 hours before.
                        </p>
                        <p>
                            Tell your surgeon and your anesthesia team that you
                            take one, and follow your prescriber&apos;s and your
                            surgeon&apos;s instructions.
                        </p>
                    </Step>
                    <Step index='iv' title='Stage what you can'>
                        <p>
                            Winocour&apos;s team, who studied 25,478 patients
                            having a tummy tuck, concluded that combined
                            procedures should be considered carefully in
                            higher-risk patients. If you&apos;re near the range
                            for one procedure but not for a combination,
                            separate operations, the most important first, are
                            an option to discuss.
                        </p>
                        <p>Your surgeon will tell you whether it fits.</p>
                    </Step>
                </ol>

                <div className='mt-12 grid items-center gap-8 border-t border-[rgb(228_201_157/0.18)] pt-10 lg:grid-cols-[minmax(0,1fr)_auto]'>
                    <blockquote className='max-w-[44rem]'>
                        <p className='bmi-display font-serif text-[1.625rem] leading-[1.3] text-stone-50 md:text-[2rem]'>
                            We encourage every patient to reach the recommended
                            range for their procedure before surgery. It
                            isn&apos;t a gate. Tell us where you are, and
                            we&apos;ll tell you exactly what applies to you and
                            help you <em>plan</em> the way there.
                        </p>
                        <footer className='mt-4 text-[0.9375rem] text-stone-400'>
                            Our stance on BMI and surgery
                        </footer>
                    </blockquote>
                    <a
                        href={`#${BMI_CHAT_ID}`}
                        data-cta='bmi_getting_there_consult'
                        className={bmiButtonOnDark}
                    >
                        Plan it with us <span aria-hidden='true'>→</span>
                    </a>
                </div>

                <p
                    data-copy-check='data'
                    className='mt-8 text-[0.875rem] text-stone-400'
                >
                    Sources:{' '}
                    <a
                        href={`#${sourceAnchorId('cdc-losing-weight')}`}
                        className={darkLink}
                    >
                        CDC
                    </a>
                    ;{' '}
                    <a
                        href={`#${sourceAnchorId('asps-tummy-tuck')}`}
                        className={darkLink}
                    >
                        ASPS
                    </a>
                    ;{' '}
                    <a
                        href={`#${sourceAnchorId('aesthetic-society-butt-lift')}`}
                        className={darkLink}
                    >
                        The Aesthetic Society
                    </a>
                    ;{' '}
                    <a
                        href={`#${sourceAnchorId('asa-glp1-guidance-2024')}`}
                        className={darkLink}
                    >
                        American Society of Anesthesiologists
                    </a>
                    ;{' '}
                    <a
                        href={`#${sourceAnchorId('winocour-2015')}`}
                        className={darkLink}
                    >
                        Winocour, Plastic and Reconstructive Surgery
                    </a>
                </p>
            </BmiAnswerSection>
        </div>
    )
}
