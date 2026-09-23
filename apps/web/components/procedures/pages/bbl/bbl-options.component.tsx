import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

type BblOption = {
    name: string
    suits: string
    whatChanges: string
    link?: { label: string; href: string }
}

const options: BblOption[] = [
    {
        name: 'Traditional BBL',
        suits: 'People with enough fat in the abdomen, flanks or back to give the buttocks the volume they want.',
        whatChanges:
            'Adds volume and shape to the buttocks and slims the areas the fat comes from.',
    },
    {
        name: 'Skinny BBL',
        suits: 'Leaner people who want a subtle, proportionate change.',
        whatChanges:
            'A smaller volume, often gathered from several donor areas. The change is modest by design, and your surgeon tells you at the exam whether you have enough fat for the result you have in mind.',
    },
    {
        name: 'BBL with lipo 360',
        suits: 'People who want a narrower waist as well as more curve.',
        whatChanges:
            'Liposuction treats the abdomen, flanks and back all the way around, which sharpens the contrast between waist and hips.',
    },
    {
        name: 'BBL revision',
        suits: 'People unhappy with an earlier BBL because of unevenness, dents, lost volume or sagging.',
        whatChanges:
            'Starts with an exam of what was done before. Some problems are corrected with more fat, and some need a different plan.',
        link: {
            label: 'How dents after a BBL are fixed',
            href: '/how-to-fix-dents-after-bbl',
        },
    },
]

/**
 * "Which BBL is right for you?" Four types, each with who it suits and what
 * it changes, as a definition list per type.
 */
export function BblOptions() {
    return (
        <AnswerBlock
            id='options'
            question='Which BBL is right for you: traditional, skinny, lipo 360 or revision?'
            className={moduleSectionPad}
            answer='The right BBL depends on how much fat you have to move and what you want to change. A traditional BBL suits most people with fat to spare, a skinny BBL suits leaner bodies, lipo 360 reshapes the whole waist, and a revision corrects an earlier BBL. Your surgeon recommends one after an exam.'
        >
            <div className='mt-10 grid gap-x-10 gap-y-9 md:grid-cols-2'>
                {options.map((option) => (
                    <article
                        key={option.name}
                        className='border-t-gold-400 border-t-2 pt-5'
                    >
                        <h3 className='font-serif text-[1.375rem] leading-[1.3] font-medium text-stone-900'>
                            {option.name}
                        </h3>
                        <dl className='mt-3 flex flex-col gap-3 text-base leading-[1.6] text-stone-700'>
                            <div>
                                <dt className='text-[0.9375rem] font-bold text-stone-900'>
                                    Suits
                                </dt>
                                <dd className='mt-0.5'>{option.suits}</dd>
                            </div>
                            <div>
                                <dt className='text-[0.9375rem] font-bold text-stone-900'>
                                    What changes
                                </dt>
                                <dd className='mt-0.5'>{option.whatChanges}</dd>
                            </div>
                        </dl>
                        {option.link && (
                            <Link
                                href={option.link.href}
                                className={cn(
                                    moduleLink,
                                    'mt-3 inline-block text-base'
                                )}
                            >
                                {option.link.label}
                            </Link>
                        )}
                    </article>
                ))}
            </div>
            <ul className='mt-9 flex flex-col gap-2 text-base md:flex-row md:gap-8'>
                <li>
                    <Link href='/what-is-a-double-bbl' className={moduleLink}>
                        What a double BBL is
                    </Link>
                </li>
                <li>
                    <Link
                        href='/blog/tummy-tuck-vs-bbl-miami'
                        className={moduleLink}
                    >
                        BBL vs tummy tuck, liposuction and butt implants
                    </Link>
                </li>
            </ul>
        </AnswerBlock>
    )
}
