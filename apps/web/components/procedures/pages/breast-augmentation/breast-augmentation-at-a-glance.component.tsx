import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import type { ModuleGuide } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/** When another procedure, or waiting, may suit her better. */
const elsewhere: {
    concern: string
    body: string
    link?: ModuleGuide
}[] = [
    {
        concern: 'Your breasts sag, and you want them higher',
        body: "ASPS says implants don't correct severely drooping breasts. Implants with a lift are a breast lift, sometimes done in the same surgery.",
        link: {
            label: 'Breast lift in Miami',
            href: '/procedures/breast-lift-miami',
        },
    },
    {
        concern: 'After children, your abdomen changed too',
        body: 'Breast surgery and a tummy tuck planned together are a mommy makeover.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
    {
        concern: 'You are pregnant or breastfeeding',
        body: "The FDA's example patient checklist says you are not a candidate for implants while pregnant or nursing, so plan surgery for after.",
    },
]

const guides: ModuleGuide[] = [
    {
        label: 'Am I a candidate for breast augmentation? A short quiz',
        href: '/blog/breast-augmentation-candidate-quiz',
    },
    {
        label: 'Breast augmentation or a breast lift after pregnancy',
        href: '/blog/breast-augmentation-vs-breast-lift',
    },
]

/**
 * "What is breast augmentation?" and the at-a-glance table: every figure a
 * reader scans for, as label → value rows. Each figure is declared in
 * `breast-augmentation.facts.ts`; the copy sweep fails the build output if
 * one drifts.
 *
 * The answer is the site's one definition of breast augmentation:
 * `quickAnswer` in the data file says the same thing. It follows the price
 * on this page, because the hero has already said what it does and the
 * price is what she came to find. It closes with when a breast lift, a
 * mommy makeover or waiting suits her better, each linked to its page:
 * the candidacy details belong to the posts linked under it.
 */
export function BreastAugmentationAtAGlance() {
    const facts: Fact[] = [
        {
            label: 'Prices',
            value: `Saline implants ${figure('price-saline')}; silicone implants ${figure('price-silicone')}`,
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Anesthesia and length',
            value: 'General anesthesia for most women; one to several hours, the FDA says',
        },
        {
            label: 'Going home',
            value: 'The same day, once you are stable, typically after about an hour (ASPS)',
        },
        {
            label: 'Back to work',
            value: 'A few days to a week, depending on your job (The Aesthetic Society)',
        },
        {
            label: 'Heavy lifting',
            value: `After at least ${figure('heavy-lifting-4-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Full recovery',
            value: `About ${figure('full-recovery-6-8-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'FDA minimum age',
            value: `For augmentation, ${figure('fda-ages')} or older for saline and ${figure('fda-ages', 1)} or older for silicone`,
        },
        {
            label: 'Screening scans',
            value: `Silicone only: an ultrasound or MRI at ${figure('silicone-screening')}, then every ${figure('silicone-screening', 1)} (FDA)`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-breast-augmentation'
            question='What is breast augmentation?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer="Breast augmentation, also called a boob job, is surgery that increases the size of the breasts with saline or silicone implants or, sometimes, fat transfer, ASPS says. It can restore volume lost after pregnancy or weight loss and improve uneven breasts. It doesn't correct breasts that sag a lot; that takes a breast lift, sometimes in the same surgery."
        >
            <FactTable
                caption='Breast augmentation at Alluring, at a glance'
                facts={facts}
                className='mt-10 md:mt-11'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                When another option may suit you better
            </h3>
            <dl className='mt-4 flex flex-col gap-4'>
                {elsewhere.map((item) => (
                    <div
                        key={item.concern}
                        className='border-t border-stone-200 pt-3'
                    >
                        <dt className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                            {item.concern}
                        </dt>
                        <dd className='mt-1 max-w-[41.25rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                            {item.body}
                            {item.link && (
                                <>
                                    {' '}
                                    <Link
                                        href={item.link.href}
                                        className={moduleLink}
                                    >
                                        {item.link.label}
                                    </Link>
                                </>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
            <ul className='mt-7 flex flex-col gap-1 border-t border-stone-200 pt-5'>
                {guides.map((guide) => (
                    <li key={guide.href}>
                        <Link
                            href={guide.href}
                            className={cn(
                                moduleLink,
                                'inline-flex min-h-11 items-center text-base font-bold'
                            )}
                        >
                            {guide.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </AnswerBlock>
    )
}
