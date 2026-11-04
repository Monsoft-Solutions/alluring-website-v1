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
 * "What size implants look natural?" Her biggest fear in her own words is
 * the wrong size ("wish I went bigger", "will it look fake?"), and in the
 * makers' data a size change is the most common reason implants come out,
 * so the section treats size as a planning decision, not a cup letter. It
 * carries the "natural" searches the registry gives this page.
 *
 * Sizes in cc, the charts and the calculator belong to
 * `/blog/breast-implant-size-guide`, the cluster's biggest earner, so the
 * section links it rather than repeating it. How sizes are tried on at
 * Alluring (sizers, imaging) waits on the owner, so the copy stays at the
 * brief's agreed wording.
 */
export function BreastAugmentationSize() {
    return (
        <AnswerBlock
            id='size'
            question='What size implants look natural?'
            className={moduleSectionPad}
            answer={`The size that suits your frame and the look you want, chosen by proportion rather than a cup letter. Plan it carefully: in Sientra's core study, ${figure('size-change-reason')} of implants removed after a first augmentation came out because the patient wanted a different size or style.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                What looks natural on one frame can look large on another, so
                there is no one right number. At your consultation, your surgeon
                examines you, talks through the look you want and recommends a
                size. Bring photos of looks you like.
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
                reasonable expectations.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                <Link
                    href='/blog/breast-implant-size-guide'
                    className={cn(moduleLink, 'font-bold')}
                >
                    Breast implant size guide and calculator
                </Link>
            </p>
        </AnswerBlock>
    )
}
