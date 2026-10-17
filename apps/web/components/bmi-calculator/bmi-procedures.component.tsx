import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import type { bmiSources } from '@/lib/data/bmi/bmi.facts'
import { BMI_PROCEDURES, type BmiProcedureId } from '@/lib/data/bmi/bmi.facts'

import { BmiAnswerSection } from './bmi-answer-section.component'
import { nameInSentence } from './bmi.logic'
import {
    BMI_ANCHORS,
    BMI_CHAT_ID,
    bmiContainer,
    bmiLink,
} from './bmi-page.constant'

const procedureById = Object.fromEntries(
    BMI_PROCEDURES.map((procedure) => [procedure.id, procedure])
) as Record<BmiProcedureId, (typeof BMI_PROCEDURES)[number]>

type SourceId = (typeof bmiSources)[number]['id']

/** "Gupta 2016": how a citation chip names its source. */
const CITATION_LABELS: Partial<Record<SourceId, string>> = {
    'gupta-2016': 'Gupta, Aesthetic Surgery Journal',
    'winocour-2015': 'Winocour, Plastic and Reconstructive Surgery',
    'bruno-2026': 'Bruno, Aesthetic Plastic Surgery',
    'aesthetic-society-tummy-tuck-bmi': 'The Aesthetic Society',
    'asps-tummy-tuck': 'ASPS',
    'asps-liposuction-candidates': 'ASPS',
    'aesthetic-society-liposuction': 'The Aesthetic Society',
    'chow-2015': 'Chow, Plastic and Reconstructive Surgery',
    'kaoutzanis-2017': 'Kaoutzanis, Aesthetic Surgery Journal',
    'frank-2019': 'Frank, Plastic and Reconstructive Surgery',
    'florida-rule-64b8-9-009': 'Florida Board of Medicine',
    'asps-mommy-makeover-candidates': 'ASPS',
    'skorochod-2026': 'Skorochod, Aesthetic Plastic Surgery',
    'knoedler-2026-augmentation': 'Knoedler, Aesthetic Plastic Surgery',
    'asps-breast-lift-candidates': 'ASPS',
    'asps-reduction-guideline-2022':
        'ASPS guideline, Plastic and Reconstructive Surgery',
    'knoedler-2025-reduction': 'Knoedler, Aesthetic Plastic Surgery',
    'kong-2026-reduction': 'Kong, Plastic and Reconstructive Surgery',
}

/**
 * One procedure's answer: the range in the page's arch, the direct answer,
 * why the range exists and what to do above it, with the procedure page and
 * the consultation beside the number. Each procedure's copy is its own,
 * below; this only lays it out.
 */
function ProcedureBlock({
    id,
    question,
    answer,
    why,
    above,
    sources,
    dark = false,
}: {
    id: BmiProcedureId
    question: ReactNode
    answer: ReactNode
    why: ReactNode
    above: ReactNode
    sources: readonly SourceId[]
    dark?: boolean
}) {
    const procedure = procedureById[id]
    const [first, second] =
        procedure.bound === 'under'
            ? ['under', String(procedure.limit)]
            : [String(procedure.limit), 'or under']

    return (
        <div
            className={cn(
                'bmi-defer',
                dark
                    ? 'bmi-dark bmi-grain bg-stone-900 text-stone-50'
                    : 'bg-white'
            )}
        >
            <div
                className={cn(
                    bmiContainer,
                    'grid gap-10 py-16 md:py-24 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16'
                )}
            >
                <aside
                    aria-label={`Recommended BMI for ${procedure.name}`}
                    className='flex flex-col items-start gap-5 lg:sticky lg:top-36 lg:self-start'
                >
                    <div
                        className={cn(
                            'bmi-range-arch flex w-full max-w-[17rem] flex-col items-center px-6 pt-14 pb-8 text-center',
                            dark
                                ? 'bg-stone-800 text-stone-50'
                                : 'bg-stone-100 text-stone-900'
                        )}
                    >
                        <p className='flex flex-col items-center'>
                            <span
                                className={cn(
                                    'text-[0.75rem] font-semibold tracking-[0.18em] uppercase',
                                    dark ? 'text-gold-300' : 'text-gold-700'
                                )}
                            >
                                Recommended
                            </span>{' '}
                            <span className='mt-3 text-[1rem] font-semibold tracking-[0.12em]'>
                                BMI
                            </span>{' '}
                            <span className='bmi-num mt-1 font-serif text-[1.375rem] italic'>
                                {first}
                            </span>{' '}
                            <span className='bmi-num font-serif text-[4.5rem] leading-[0.95] font-normal tracking-[-0.03em]'>
                                {second}
                            </span>
                        </p>
                    </div>
                    <div className='flex w-full max-w-[17rem] flex-col gap-2.5'>
                        <a
                            href={`#${BMI_CHAT_ID}`}
                            data-consult-procedure={procedure.chat}
                            data-cta='bmi_section_consult'
                            className={cn(
                                'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.9375rem] font-semibold transition-colors',
                                dark
                                    ? 'bg-gold-300 hover:bg-gold-200 text-stone-950'
                                    : 'bg-stone-900 text-stone-50 hover:bg-stone-700'
                            )}
                        >
                            Ask what applies to you
                        </a>
                        <a
                            href={procedure.href}
                            data-cta='bmi_section_procedure_page'
                            className={cn(
                                'inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-[0.9375rem] font-semibold transition-colors',
                                dark
                                    ? 'border-stone-600 text-stone-50 hover:border-stone-50'
                                    : 'border-stone-300 bg-white text-stone-900 hover:border-stone-900'
                            )}
                        >
                            The {nameInSentence(procedure.name)} page
                        </a>
                    </div>
                </aside>

                <BmiAnswerSection
                    id={id}
                    question={question}
                    answer={answer}
                    tone={dark ? 'dark' : 'light'}
                >
                    <div className='mt-10 grid gap-8 md:grid-cols-2 md:gap-10'>
                        <div>
                            <h3
                                className={cn(
                                    'font-serif text-[1.375rem] leading-[1.3] font-medium',
                                    dark ? 'text-stone-50' : 'text-stone-900'
                                )}
                            >
                                Why the range exists
                            </h3>
                            <div
                                className={cn(
                                    'mt-3 flex flex-col gap-4 text-[1.0625rem] leading-[1.65]',
                                    dark ? 'text-stone-300' : 'text-stone-700'
                                )}
                            >
                                {why}
                            </div>
                        </div>
                        <div
                            className={cn(
                                'border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10',
                                dark ? 'border-stone-700' : 'border-stone-200'
                            )}
                        >
                            <h3
                                className={cn(
                                    'font-serif text-[1.375rem] leading-[1.3] font-medium',
                                    dark ? 'text-stone-50' : 'text-stone-900'
                                )}
                            >
                                If you&apos;re above it
                            </h3>
                            <div
                                className={cn(
                                    'mt-3 flex flex-col gap-4 text-[1.0625rem] leading-[1.65]',
                                    dark ? 'text-stone-300' : 'text-stone-700'
                                )}
                            >
                                {above}
                            </div>
                        </div>
                    </div>
                    <p
                        data-copy-check='data'
                        className={cn(
                            'mt-10 flex flex-wrap gap-x-2 gap-y-1 border-t pt-5 text-[0.875rem]',
                            dark
                                ? 'border-stone-700 text-stone-400'
                                : 'border-stone-200 text-stone-500'
                        )}
                    >
                        <span>Sources:</span>
                        {sources.map((sourceId, index) => (
                            <span key={sourceId}>
                                <a
                                    href={`#${sourceAnchorId(sourceId)}`}
                                    className={cn(
                                        'underline underline-offset-4',
                                        dark
                                            ? 'decoration-stone-600 hover:text-stone-50'
                                            : 'decoration-stone-300 hover:text-stone-900'
                                    )}
                                >
                                    {CITATION_LABELS[sourceId] ?? sourceId}
                                </a>
                                {index < sources.length - 1 ? ';' : ''}
                            </span>
                        ))}
                    </p>
                </BmiAnswerSection>
            </div>
        </div>
    )
}

const gettingThere = (label: string) => (
    <a
        href={`#${BMI_ANCHORS.gettingThere}`}
        data-cta='bmi_section_getting_there'
        className={bmiLink}
    >
        {label}
    </a>
)

const gettingThereDark = (label: string) => (
    <a
        href={`#${BMI_ANCHORS.gettingThere}`}
        data-cta='bmi_section_getting_there'
        className='decoration-gold-300 text-stone-50 underline decoration-1 underline-offset-4 hover:decoration-stone-50'
    >
        {label}
    </a>
)

/**
 * One section per procedure, in search-demand order, each with its range,
 * the reasons behind it and the way there. Headings are phrased as people
 * search them (Search Console, 90 days to 2026-10-14).
 */
export function BmiProcedures() {
    return (
        <>
            <ProcedureBlock
                id='bbl'
                question={
                    <>
                        What BMI do you need for a <em>BBL</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before a BBL. No society
                        publishes a BBL-specific cutoff, so that range comes
                        from the wider evidence: across cosmetic surgery,
                        complications, infections and blood clots climb with
                        BMI. Very lean patients raise the opposite question,
                        whether there is enough fat to move. Your surgeon
                        decides case by case.
                    </>
                }
                why={
                    <>
                        <p>
                            A BBL moves your own fat, so it starts with
                            liposuction. Florida allows that fat to be placed
                            only in the layer under the skin, never in the
                            muscle, and an ultrasound study found that this
                            layer gets thicker as BMI rises (Frank and
                            colleagues, Plastic and Reconstructive Surgery,
                            2019). A very low BMI can leave little room and
                            little fat to work with.
                        </p>
                        <p>
                            A higher BMI raises a different set of risks. Across
                            cosmetic surgery, infections and blood clots were
                            about twice as common in patients with a BMI of 25
                            or more (Gupta and colleagues, Aesthetic Surgery
                            Journal, 2016), and combining liposuction with other
                            surgery raises complication rates most in patients
                            with obesity (Kaoutzanis and colleagues, Aesthetic
                            Surgery Journal, 2017).
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            Losing weight before a BBL means less fat overall,
                            and the goal isn&apos;t the lowest number: it&apos;s
                            a stable weight with enough fat left where we
                            harvest it. Get close to your range, hold it, and
                            we&apos;ll look at where your fat sits.
                        </p>
                        <p>{gettingThere('How to get to your range')}</p>
                    </>
                }
                sources={[
                    'gupta-2016',
                    'frank-2019',
                    'kaoutzanis-2017',
                    'florida-rule-64b8-9-009',
                ]}
            />

            <ProcedureBlock
                id='liposuction'
                dark
                question={
                    <>
                        What BMI do you need for lipo <em>360</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before lipo 360 or any
                        liposuction. ASPS describes ideal candidates as adults
                        within 30% of their ideal weight, and studies tie a
                        higher BMI to more complications. Liposuction shapes the
                        body; it isn&apos;t a weight-loss treatment, so plan it
                        at a weight you can keep.
                    </>
                }
                why={
                    <>
                        <p>
                            How much fat can be removed safely depends partly on
                            BMI. A study of 4,534 patients having liposuction
                            found that removing more than 100 cc of fat for each
                            point of BMI raised the risk of complications (Chow
                            and colleagues, Plastic and Reconstructive Surgery,
                            2015).
                        </p>
                        <p>
                            Lipo 360 treats the whole midsection in one
                            operation, and it is often paired with other
                            procedures. Combining liposuction with other surgery
                            raised complication rates, especially in patients
                            with obesity or older patients (Kaoutzanis and
                            colleagues, Aesthetic Surgery Journal, 2017).
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            The Aesthetic Society says your weight should be
                            stable before liposuction, that you may need to lose
                            weight to be a better candidate, and that if you
                            plan to lose a significant amount, you should wait.
                            Lose first, hold it, then shape what diet and
                            exercise don&apos;t reach.
                        </p>
                        <p>{gettingThereDark('How to get to your range')}</p>
                    </>
                }
                sources={[
                    'asps-liposuction-candidates',
                    'aesthetic-society-liposuction',
                    'chow-2015',
                    'kaoutzanis-2017',
                ]}
            />

            <ProcedureBlock
                id='tummy-tuck'
                question={
                    <>
                        What is the maximum BMI for a tummy <em>tuck</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before a tummy tuck. In
                        25,478 patients having a tummy tuck, a BMI of 30 or more
                        was an independent risk factor for major complications.
                        Surgeons answering on The Aesthetic Society&apos;s
                        website say a BMI closer to 30 allows a safer operation.
                        Above it, your surgeon weighs your whole health case by
                        case.
                    </>
                }
                why={
                    <>
                        <p>
                            A tummy tuck lifts a wide flap of skin and fat and
                            tightens the muscle beneath, so it leans on wound
                            healing. A 2026 analysis of 150 patients found that
                            a BMI of 30 or more and smoking were the strongest
                            independent predictors of complications after a
                            tummy tuck.
                        </p>
                        <p>
                            In the larger study, age 55 or older and combining
                            procedures were risk factors too (Winocour and
                            colleagues, Plastic and Reconstructive Surgery,
                            2015), which is why a tummy tuck with lipo 360 asks
                            more of your health than either alone.
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            ASPS advises people planning substantial weight loss
                            to postpone a tummy tuck, because big swings in
                            weight can undo the result. Reach your range and
                            hold it. Loose skin left after weight loss is what a
                            tummy tuck treats, and it&apos;s easier to plan once
                            your weight has settled.
                        </p>
                        <p>{gettingThere('How to get to your range')}</p>
                    </>
                }
                sources={[
                    'winocour-2015',
                    'bruno-2026',
                    'aesthetic-society-tummy-tuck-bmi',
                    'asps-tummy-tuck',
                ]}
            />

            <ProcedureBlock
                id='mommy-makeover'
                dark
                question={
                    <>
                        What should you weigh for a mommy <em>makeover</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before a mommy makeover, and
                        ASPS lists being at your ideal body weight among the
                        signs you&apos;re ready. A mommy makeover pairs a tummy
                        tuck with breast surgery, and combining procedures adds
                        risk, so reaching your range matters all the more. The
                        chart below shows your weight target by height.
                    </>
                }
                why={
                    <>
                        <p>
                            Major complications followed 3.1% of tummy tucks
                            done alone, 4.3% of those combined with a breast
                            procedure and 4.6% of those combined with
                            liposuction and a breast procedure (Winocour and
                            colleagues, Plastic and Reconstructive Surgery,
                            2015).
                        </p>
                        <p>
                            A 2026 review of 8 studies and 138,020 patients
                            found that a tummy tuck combined with breast surgery
                            carried about the same complication risk as a tummy
                            tuck alone, in carefully selected patients. Careful
                            selection is the point, and BMI is part of it.
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            Two good options: reach your range first, or stage
                            it, with the tummy tuck and the breast surgery as
                            separate operations. Staging means two recoveries,
                            but a shorter operation each time. We&apos;ll talk
                            through which suits you.
                        </p>
                        <p>{gettingThereDark('How to get to your range')}</p>
                    </>
                }
                sources={[
                    'asps-mommy-makeover-candidates',
                    'winocour-2015',
                    'skorochod-2026',
                ]}
            />

            <ProcedureBlock
                id='breast-augmentation'
                question={
                    <>
                        What BMI do you need for breast <em>augmentation</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before breast augmentation.
                        Lower is better still: in 6,515 patients having cosmetic
                        breast augmentation, complications in the first 30 days
                        were 4.3% at a BMI of 25.2 or more and 1.3% below it.
                        Your surgeon weighs that with your health and your
                        goals.
                    </>
                }
                why={
                    <>
                        <p>
                            The pattern across cosmetic surgery holds for breast
                            surgery too: infections and blood clots were about
                            twice as common in patients with a BMI of 25 or more
                            (Gupta and colleagues, Aesthetic Surgery Journal,
                            2016).
                        </p>
                        <p>
                            The augmentation study drew on hospital-reported
                            outcomes, and it is one study. That&apos;s why we
                            recommend the broader line and treat the lower one
                            as a reason to get as close to a healthy weight as
                            you comfortably can.
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            Your breasts change with your weight, so choose your
                            implant at the weight you&apos;ll keep: reach your
                            range, hold it, then pick your size with your
                            surgeon.
                        </p>
                        <p>{gettingThere('How to get to your range')}</p>
                    </>
                }
                sources={['knoedler-2026-augmentation', 'gupta-2016']}
            />

            <ProcedureBlock
                id='breast-lift'
                dark
                question={
                    <>
                        What BMI do you need for a breast <em>lift</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI under 30 before a breast lift, the
                        same line as breast augmentation, because no study we
                        found sets one for lifts alone. ASPS lists keeping a
                        stable weight among the signs you&apos;re ready: losing
                        or gaining a lot after a lift can stretch the skin
                        again. Your surgeon decides case by case.
                    </>
                }
                why={
                    <>
                        <p>
                            A lift removes skin and reshapes the breast, so it
                            depends on healing. Across cosmetic surgery,
                            infections and blood clots were about twice as
                            common in patients with a BMI of 25 or more (Gupta
                            and colleagues, Aesthetic Surgery Journal, 2016).
                        </p>
                        <p>
                            ASPS names weight swings, with pregnancy and age,
                            among the causes of sagging in the first place.
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            Reach your range and give your weight time to settle
                            before you book. If you lose breast volume as you
                            lose weight, a lift with an implant may suit you
                            better; your surgeon will tell you.
                        </p>
                        <p>{gettingThereDark('How to get to your range')}</p>
                    </>
                }
                sources={['asps-breast-lift-candidates', 'gupta-2016']}
            />

            <ProcedureBlock
                id='breast-reduction'
                question={
                    <>
                        What BMI do you need for a breast <em>reduction</em>?
                    </>
                }
                answer={
                    <>
                        We recommend a BMI of 35 or under before a breast
                        reduction. The 2022 ASPS guideline on breast reduction
                        tells surgeons to counsel patients that a BMI over 35
                        may mean a higher risk of complications, mainly
                        infection and wound healing problems. It sets no cutoff:
                        the guideline bases surgery on symptoms.
                    </>
                }
                why={
                    <>
                        <p>
                            In 45,373 patients having a breast reduction, the
                            risk of complications rose step by step above a
                            healthy BMI, while the odds of another operation did
                            not (Knoedler and colleagues, Aesthetic Plastic
                            Surgery, 2025).
                        </p>
                        <p>
                            A 2026 analysis of 952 patients having a breast
                            reduction found that BMI predicted minor wound
                            problems but not major complications, and argued for
                            individual assessment over rigid BMI cutoffs.
                        </p>
                    </>
                }
                above={
                    <>
                        <p>
                            Large breasts can make exercise hard, so we
                            won&apos;t ask you to wait without a plan. Tell us
                            your BMI and your symptoms, and we&apos;ll tell you
                            what applies to you, including whether to lose some
                            weight first.
                        </p>
                        <p>{gettingThere('How to get to your range')}</p>
                    </>
                }
                sources={[
                    'asps-reduction-guideline-2022',
                    'knoedler-2025-reduction',
                    'kong-2026-reduction',
                ]}
            />
        </>
    )
}
