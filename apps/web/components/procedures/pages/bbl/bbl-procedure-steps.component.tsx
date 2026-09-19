import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import { bblBody, bblSectionPad } from './bbl-ui.constant'

const steps = [
    {
        title: 'Liposuction',
        body: 'Through small incisions, the surgeon fills the donor areas with a fluid that numbs the tissue and reduces bleeding, then removes fat with a thin cannula. This is also when your waist is shaped.',
    },
    {
        title: 'Preparing the fat',
        body: 'The fat is separated from fluid and blood, so only usable fat is transferred.',
    },
    {
        title: 'Placing the fat',
        body: 'The surgeon injects the fat into the layer under the skin of the buttocks, watching the cannula on ultrasound so it never passes into the muscle.',
    },
    {
        title: 'Closing and compression',
        body: 'The small incisions are closed and you are fitted with a compression garment, which you wear 24/7 for the first month, or as your surgeon directs.',
    },
]

/**
 * "How is BBL surgery performed?" The surgery is a sequence, so the steps
 * are numbered.
 */
export function BblProcedureSteps() {
    return (
        <AnswerBlock
            id='procedure'
            question='How is BBL surgery performed?'
            className={bblSectionPad}
            answer='BBL surgery takes 3 to 5 hours under general anesthesia, and you go home the same day. The surgeon removes fat with liposuction, prepares it, injects it under the skin of the buttocks with ultrasound guidance, then closes the small incisions and fits your compression garment.'
        >
            <p className={cn(bblBody, 'mt-4.5')}>
                Before surgery day, your surgeon examines you in person, reviews
                your health history and medications, and plans where fat will be
                taken from and where it will go.
            </p>
            <ol className='mt-9 flex flex-col gap-6'>
                {steps.map((step, index) => (
                    <li
                        key={step.title}
                        className='grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 md:gap-x-5'
                    >
                        <span
                            aria-hidden='true'
                            className='border-gold-500 flex size-10 items-center justify-center rounded-full border font-serif text-lg text-stone-900 tabular-nums'
                        >
                            {index + 1}
                        </span>
                        <div className='pt-1.5'>
                            <h3 className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900 md:text-lg'>
                                {step.title}
                            </h3>
                            <p className='mt-1 max-w-[38rem] text-[1.0625rem] leading-[1.6] text-stone-700'>
                                {step.body}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
            <p className={cn(bblBody, 'mt-8')}>
                Someone needs to drive you home and stay with you for the first
                days. Walking starts early, on day 1 or 2.
            </p>
        </AnswerBlock>
    )
}
