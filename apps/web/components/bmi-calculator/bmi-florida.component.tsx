import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'

import { BmiAnswerSection } from './bmi-answer-section.component'
import { BMI_ANCHORS, bmiContainer, bmiLink } from './bmi-page.constant'

/**
 * Florida's office-surgery rule and the ASA classes: one reason BMI matters
 * beyond the clinical evidence. The rule text is quoted from the official
 * copy on flrules.org (effective 9/16/2024), read on 2026-10-17.
 *
 * It says where such surgery may happen, never where Alluring operates, and
 * claims no facility accreditation: both wait on the owner.
 */
export function BmiFlorida() {
    return (
        <div className='bmi-defer bg-white'>
            <BmiAnswerSection
                id={BMI_ANCHORS.florida}
                eyebrow='Florida law'
                question={
                    <>
                        Why does BMI matter for office surgery in{' '}
                        <em>Florida</em>?
                    </>
                }
                answer={
                    <>
                        Florida&apos;s office surgery rule lets a doctor&apos;s
                        office do surgery under deep sedation or general
                        anesthesia only for patients classed ASA I or II under
                        the American Society of Anesthesiologists&apos; system.
                        ASA III and higher must have it in a hospital or an
                        ambulatory surgery center. In the ASA&apos;s own
                        examples, a BMI of 40 or more is class III.
                    </>
                }
                className={cn(bmiContainer, 'py-16 md:py-24')}
            >
                <div className='mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16'>
                    <figure className='bmi-range-arch self-start bg-stone-100 px-7 pt-16 pb-9 md:px-10'>
                        <blockquote className='flex flex-col gap-4 font-serif text-[1.25rem] leading-[1.45] text-stone-900 md:text-[1.375rem]'>
                            <p>
                                “Only patients classified under the American
                                Society of Anesthesiologist’s (ASA) risk
                                classification criteria as Class I or II are
                                appropriate candidates for Level III office
                                surgery.”
                            </p>
                            <p>
                                “All Level III surgeries on patients classified
                                as ASA III and higher are to be performed only
                                in a hospital or ambulatory surgery center.”
                            </p>
                        </blockquote>
                        <figcaption
                            data-copy-check='data'
                            className='mt-6 text-[0.875rem] text-stone-600'
                        >
                            Florida Administrative Code,{' '}
                            <a
                                href={`#${sourceAnchorId('florida-rule-64b8-9-009')}`}
                                className={bmiLink}
                            >
                                Rule 64B8-9.009(6)(a)2
                            </a>
                            , Standard of Care for Office Surgery
                        </figcaption>
                    </figure>

                    <dl className='flex flex-col divide-y divide-stone-200 border-y border-stone-200'>
                        <div className='py-5'>
                            <dt className='font-serif text-[1.25rem] text-stone-900'>
                                Level III office surgery
                            </dt>
                            <dd className='mt-1.5 text-[1.0625rem] leading-[1.65] text-stone-700'>
                                Surgery in a doctor&apos;s office under deep
                                sedation or general anesthesia, as the rule
                                defines it.
                            </dd>
                        </div>
                        <div className='py-5'>
                            <dt className='font-serif text-[1.25rem] text-stone-900'>
                                The ASA classes
                            </dt>
                            <dd className='mt-1.5 text-[1.0625rem] leading-[1.65] text-stone-700'>
                                ASA I is a normal healthy patient, ASA II has
                                mild systemic disease and ASA III has severe
                                systemic disease. In the American Society of
                                Anesthesiologists&apos; published examples,
                                obesity with a BMI between 30 and 40 is class II
                                and a BMI of 40 or more is class III. The ASA
                                calls its examples guidelines for the clinician.
                            </dd>
                        </div>
                        <div className='py-5'>
                            <dt className='font-serif text-[1.25rem] text-stone-900'>
                                Above age 50
                            </dt>
                            <dd className='mt-1.5 text-[1.0625rem] leading-[1.65] text-stone-700'>
                                For ASA II patients above age 50, the surgeon
                                must get a complete workup before office surgery
                                under deep sedation or general anesthesia.
                            </dd>
                        </div>
                        <div className='py-5'>
                            <dt className='font-serif text-[1.25rem] text-stone-900'>
                                What it means for you
                            </dt>
                            <dd className='mt-1.5 text-[1.0625rem] leading-[1.65] text-stone-700'>
                                Your class reflects your whole health, not BMI
                                alone. The rule decides where surgery may
                                happen, not whether you&apos;re a candidate, and
                                our recommended ranges come from the clinical
                                evidence above, not from the rule.
                            </dd>
                        </div>
                    </dl>
                </div>
                <p
                    data-copy-check='data'
                    className='mt-8 text-[0.875rem] text-stone-500'
                >
                    Sources:{' '}
                    <a
                        href={`#${sourceAnchorId('florida-rule-64b8-9-009')}`}
                        className={bmiLink}
                    >
                        Florida Board of Medicine
                    </a>
                    ;{' '}
                    <a
                        href={`#${sourceAnchorId('asa-physical-status')}`}
                        className={bmiLink}
                    >
                        American Society of Anesthesiologists
                    </a>
                </p>
            </BmiAnswerSection>
        </div>
    )
}
