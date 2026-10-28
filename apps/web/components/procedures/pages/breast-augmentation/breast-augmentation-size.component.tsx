import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

/**
 * "What size implants should I get?" Her biggest fear in her own words is
 * the wrong size ("wish I went bigger", "will it look fake?"), and in the
 * makers' data a size change is the most common reason implants come out,
 * so the section treats size as a planning decision, not a cup letter.
 *
 * Sizes in cc and the charts belong to `/blog/breast-implant-size-guide`,
 * which ranks for them (9,839 breast augmentation impressions in 90 days),
 * so the section links it rather than repeating it. How sizes are tried on
 * at Alluring (sizers, imaging) waits on the owner, so the copy asks rather
 * than claims.
 */
export function BreastAugmentationSize() {
    return (
        <AnswerBlock
            id='size'
            question='What size implants should I get?'
            className={moduleSectionPad}
            answer={`The size that suits your frame and the look you want, chosen by proportion rather than a cup letter. Plan it carefully: in Sientra's core study, ${figure('size-change-reason')} of implants removed after a first augmentation came out because the patient wanted a different size or style.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                At your consultation, your surgeon examines your chest and the
                breast tissue you have, asks how you want clothes to fit, and
                recommends a size and shape for your frame. Bring photos of
                looks you like, and ask how you can try sizes on before you
                decide.
            </p>
            <p className={cn(moduleBody, 'mt-4')}>
                In ASPS&apos;s 2025 survey, most member surgeons ranked implants
                of {figure('asps-sizes')} among those they used most, with{' '}
                {figure('asps-sizes', 1)} second, and{' '}
                {figure('asps-trend-smaller')} of them saw patients choosing
                smaller implants than in previous years, against{' '}
                {figure('asps-trend-smaller', 1)} who saw a shift to larger
                ones.
            </p>
            <p className={cn(moduleBody, 'mt-4')}>
                The FDA says many patients have more operations to change
                implant size, and that the first one needs careful planning and
                reasonable expectations. Give it time, too: ASPS says the final
                result can take a few weeks to show, as the swelling goes down
                and the skin stretches.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                <Link
                    href='/blog/breast-implant-size-guide'
                    className={cn(moduleLink, 'font-bold')}
                >
                    Breast implant sizes in cc, explained in our size guide
                </Link>
            </p>
        </AnswerBlock>
    )
}
