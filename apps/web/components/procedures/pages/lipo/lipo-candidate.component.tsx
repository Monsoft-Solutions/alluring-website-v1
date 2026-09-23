import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

const suits = [
    'Fat stays in one or a few areas despite diet and exercise',
    'Your weight has been stable for a while',
    'Your skin is firm and elastic',
    "You don't smoke or vape",
    'You want a change in shape, not on the scale',
]

const elsewhere: {
    concern: string
    body: string
    link?: { label: string; href: string }
}[] = [
    {
        concern: 'Loose skin is the main concern',
        body: 'Liposuction removes fat but does not tighten skin. A tummy tuck or an arm lift removes the skin itself.',
        link: {
            label: 'Tummy tuck in Miami',
            href: '/procedures/tummy-tuck-miami',
        },
    },
    {
        concern: 'You plan to lose a lot of weight',
        body: 'The Aesthetic Society advises waiting until you have, so the result is planned around your settled shape.',
    },
    {
        concern: 'Cellulite is the main concern',
        body: 'ASPS says liposuction is not an effective treatment for cellulite.',
    },
    {
        concern: 'Your abdomen changed after pregnancy',
        body: 'Loose skin and separated muscles need more than liposuction. A tummy tuck or a mommy makeover may suit you better.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
]

/**
 * "Am I a good candidate for liposuction?" Answers the question that decides
 * whether she books a liposuction consultation at all, including when
 * another procedure suits her better. The blog post that owns the full
 * checklist, and the tummy-tuck comparison, are linked, not repeated.
 */
export function LipoCandidate() {
    return (
        <AnswerBlock
            id='candidate'
            question='Am I a good candidate for liposuction?'
            className={moduleSectionPad}
            answer={`You may be, if you are close to a stable, healthy weight, have firm, elastic skin and don't smoke. ASPS describes ideal candidates as adults within ${lipoFigure('asps-within-30-percent')} of their ideal weight. Liposuction is not a treatment for obesity, and it removes fat without tightening loose skin. Your surgeon confirms it at an exam.`}
        >
            <div className='mt-9 grid gap-9 md:grid-cols-2 md:gap-10'>
                <div>
                    <h3 className={moduleH3}>Liposuction may suit you if</h3>
                    <ul className='mt-4 flex flex-col gap-3'>
                        {suits.map((item) => (
                            <li
                                key={item}
                                className='grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3.5 text-[1.0625rem] leading-[1.55] text-stone-800'
                            >
                                <span
                                    aria-hidden='true'
                                    className='bg-gold-500 mt-2.5 size-2 rounded-full'
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className={moduleH3}>
                        Another option may suit you better if
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
                                <dd className='mt-1 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
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
                </div>
            </div>
            <ul className='mt-8 flex flex-col gap-1 border-t border-stone-200 pt-6'>
                <li>
                    <Link
                        href='/blog/liposuction-candidate-miami'
                        className={cn(
                            moduleLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        The full liposuction candidate checklist
                    </Link>
                </li>
                <li>
                    <Link
                        href='/blog/tummy-tuck-vs-liposuction'
                        className={cn(
                            moduleLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        Tummy tuck or liposuction: how to tell which you need
                    </Link>
                </li>
            </ul>
        </AnswerBlock>
    )
}
