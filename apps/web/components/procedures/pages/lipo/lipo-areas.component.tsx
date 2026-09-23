import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

const areas: { name: string; body: string }[] = [
    {
        name: 'Abdomen',
        body: 'Upper and lower, often treated with the flanks.',
    },
    {
        name: 'Flanks and waist',
        body: 'The sides of the waist, often called love handles.',
    },
    { name: 'Back', body: 'The bra line and the lower back.' },
    {
        name: 'Arms',
        body: 'The upper arms. Where the skin is loose, an arm lift may suit you better.',
    },
    { name: 'Thighs', body: 'The inner and outer thighs.' },
    {
        name: 'Smaller areas',
        body: 'The chin, hips or underarms, added to another procedure at Alluring.',
    },
]

/**
 * "Which areas can liposuction treat?" An index of areas, not a drawing of a
 * body: competitors lean on AI "treatment area" illustrations, and a body
 * outline is hard to keep abstract. Lipo 360 gets its own line because it is
 * the practice's standalone liposuction; single areas are priced as add-ons
 * (the 2026-09-15 price sheet). Which areas Lipo 360 covers is owned by a
 * blog post, so it is linked.
 *
 * Device names stay off the page until the owner confirms which ones the
 * practice uses (compliance: owner claims).
 */
export function LipoAreas() {
    return (
        <AnswerBlock
            id='areas'
            question='Which areas can liposuction treat?'
            className={moduleSectionPad}
            answer='Liposuction can treat the abdomen, the flanks and waist, the back, the arms and the thighs. Lipo 360 treats several of those around the midsection in one surgery. At Alluring, smaller areas such as the chin are added to another procedure. Your surgeon recommends which areas fit your shape at your consultation.'
        >
            <div className='border-gold-400 mt-9 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:px-6 md:py-5'>
                <h3 className='font-serif text-xl leading-[1.3] font-medium text-stone-900'>
                    Lipo 360
                </h3>
                <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700'>
                    Several areas around the midsection in one surgery, usually
                    the abdomen, the flanks and the back, so the waist is shaped
                    from every side rather than one area at a time.
                </p>
                <Link
                    href='/what-areas-does-lipo-360-cover'
                    className={cn(moduleLink, 'mt-2 inline-flex text-base')}
                >
                    What Lipo 360 covers, area by area
                </Link>
            </div>

            <dl className='mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2'>
                {areas.map((area) => (
                    <div
                        key={area.name}
                        className='border-t border-stone-200 pt-3.5'
                    >
                        <dt className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                            {area.name}
                        </dt>
                        <dd className='mt-1 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                            {area.body}
                        </dd>
                    </div>
                ))}
            </dl>

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Does the liposuction technique matter?
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                Clinics often advertise liposuction by the name of a device.
                What shapes your result more is the plan for each area, how much
                fat is removed, and who performs the surgery. Most liposuction
                starts with the tumescent technique: a fluid that numbs the area
                and reduces bleeding. Ask your surgeon which technique she uses
                for each area, and why.
            </p>
        </AnswerBlock>
    )
}
