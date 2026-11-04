import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleTimeline,
    type ModuleMilestone,
    type ModuleTimelineTrack,
} from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'

import { MommyMakeoverAnchor } from './mommy-makeover-anchor.component'
import { mommyMakeoverImages } from './mommy-makeover-page.constant'
import { MommyMakeoverPhoto } from './mommy-makeover-photo.component'

const TRACKS: [ModuleTimelineTrack, ModuleTimelineTrack] = [
    { key: 'you', label: 'You' },
    { key: 'home', label: 'Home and children' },
]

/**
 * Every figure is a fact in `mommy-makeover.facts.ts`, attributed the way that
 * file says it must be. The Aesthetic Society's mommy makeover figures lead; a
 * surgeon's post on the ASPS website is named by its author, and a source about
 * a tummy tuck says so.
 *
 * Each label names its stage as well as its time, because the time alone isn't
 * something she can act on, and the tracked timeline reads the label on its own.
 */
const milestones: ModuleMilestone[] = [
    {
        when: `First ${mommyMakeoverFigure('help-24-hours')}: help at home`,
        tracks: ['you'],
        body: 'You may be up and walking within hours of surgery (The Aesthetic Society). After a tummy tuck, walking on the day of surgery keeps the risk of blood clots in the legs low (Cindy Wu, MD, on the ASPS website).',
    },
    {
        when: `First ${mommyMakeoverFigure('help-24-hours')}: help at home`,
        tracks: ['home'],
        body: `The Aesthetic Society says you cannot go home alone, and to arrange for someone to help you around the house and with your medication for at least the first ${mommyMakeoverFigure('help-24-hours')}.`,
    },
    {
        when: 'First week: the hardest',
        tracks: ['you'],
        body: `The Aesthetic Society says the first week will be the worst, and you won't feel like yourself for at least ${mommyMakeoverFigure('first-week', 2)}. After a tummy tuck, you stay bent at the waist for ${mommyMakeoverFigure('bent-7-10-days')} (Cindy Wu, MD). You may shower once the dressings are off, usually within ${mommyMakeoverFigure('shower-72-hours')}, and your first follow-up is usually within ${mommyMakeoverFigure('follow-up-5-days')} (The Aesthetic Society).`,
    },
    {
        when: 'First week: the hardest',
        tracks: ['home'],
        body: 'Set up a support system for the full recovery before surgery day, as The Aesthetic Society advises: who drives, who cooks and who looks after the children.',
    },
    {
        when: `About ${mommyMakeoverFigure('work-2-weeks')}: back to work`,
        tracks: ['you'],
        body: `The Aesthetic Society says to plan about ${mommyMakeoverFigure('work-2-weeks')} off work, depending on the physical demands of your job.`,
    },
    {
        when: `About ${mommyMakeoverFigure('work-2-weeks')}: back to work`,
        tracks: ['home'],
        body: `If you have small children, The Aesthetic Society says to put someone else totally in charge of their care for at least ${mommyMakeoverFigure('children-2-weeks')}.`,
    },
    {
        when: `Weeks ${mommyMakeoverFigure('driving-2-3-weeks').replace(' weeks', '')}: driving`,
        tracks: ['you'],
        body: `You may be comfortable enough to drive in ${mommyMakeoverFigure('driving-2-3-weeks')}, or when your sutures and drains are out and you are no longer taking pain medication (The Aesthetic Society). Your surgeon clears you to drive.`,
    },
    {
        when: `Weeks ${mommyMakeoverFigure('driving-2-3-weeks').replace(' weeks', '')}: driving`,
        tracks: ['home'],
        body: 'You may be driving before you can lift your children, so someone else still lifts them into a car seat.',
    },
    {
        when: `Weeks ${mommyMakeoverFigure('lifting-children-4-6-weeks').replace(' weeks', '')}: lifting`,
        tracks: ['you'],
        body: `A compression garment is worn for ${mommyMakeoverFigure('garment-4-6-weeks')} after a tummy tuck (Cindy Wu, MD) and over liposuction areas (The Aesthetic Society). We found no published schedule for a mommy makeover as a whole, so your surgeon sets yours.`,
    },
    {
        when: `Weeks ${mommyMakeoverFigure('lifting-children-4-6-weeks').replace(' weeks', '')}: lifting`,
        tracks: ['home'],
        body: `No heavy lifting, such as picking up your children or baskets of laundry, for ${mommyMakeoverFigure('lifting-children-4-6-weeks')} (The Aesthetic Society).`,
    },
    {
        when: `About ${mommyMakeoverFigure('strenuous-6-weeks')}: exercise`,
        body: `The Aesthetic Society says you will probably need to wait ${mommyMakeoverFigure('strenuous-6-weeks')} before any strenuous activities.`,
    },
    {
        when: `About ${mommyMakeoverFigure('normal-activities-3-months')}: normal activities`,
        body: `Frank Campanile, MD, on the ASPS website, says that around ${mommyMakeoverFigure('normal-activities-3-months')} you can usually return to your normal activities. After a tummy tuck, swelling keeps going down until about ${mommyMakeoverFigure('swelling-3-months')} (Cindy Wu, MD).`,
    },
    {
        when: `${mommyMakeoverFigure('results-6-12-months', 1)} to a year: your final result`,
        body: `It can take ${mommyMakeoverFigure('results-6-12-months', 1)} to a year to see your final mommy makeover results (Frank Campanile, MD, on the ASPS website).`,
    },
    {
        when: `Up to ${mommyMakeoverFigure('scars-6m-2y', 1)}: scars`,
        body: `The Aesthetic Society says fading and flattening of scars take ${mommyMakeoverFigure('scars-6m-2y')} to ${mommyMakeoverFigure('scars-6m-2y', 1)}. A tummy tuck scar becomes thinner and lighter in color at around ${mommyMakeoverFigure('scar-12-18-months')} (Cindy Wu, MD). If you must be in the sun, Cleveland Clinic advises sunscreen with SPF 30 on the scar for ${mommyMakeoverFigure('sunscreen')}.`,
    },
]

/**
 * "What is recovery like with children at home?" Deliberately not "recovery
 * timeline": the recovery post owns those terms, and this section answers what
 * she is actually asking, so it runs two tracks, her body and her household, and
 * links out for the week-by-week detail. Nights in Miami, drains and the garment
 * schedule at Alluring wait on the owner, so the section gives no number for
 * them. The old anchor stays alive above it for the live posts that link it.
 */
export function MommyMakeoverRecovery() {
    return (
        <div>
            <MommyMakeoverAnchor id='recovery-getting-back-to-your-family' />
            <AnswerBlock
                id='recovery'
                question='What is recovery like with children at home?'
                className={moduleSectionPad}
                answer={`After a mommy makeover, The Aesthetic Society says to plan on about ${mommyMakeoverFigure('work-2-weeks')} off work and someone else caring for small children for at least ${mommyMakeoverFigure('children-2-weeks')}. You may be comfortable driving in ${mommyMakeoverFigure('driving-2-3-weeks')}, lifting your children waits ${mommyMakeoverFigure('lifting-children-4-6-weeks')}, and strenuous activity about ${mommyMakeoverFigure('strenuous-6-weeks')}. Final results can take ${mommyMakeoverFigure('results-6-12-months', 1)} to a year (Frank Campanile, MD).`}
            >
                <MommyMakeoverPhoto
                    image={mommyMakeoverImages.recovery}
                    className='mt-9 md:mt-10'
                />

                <ModuleTimeline
                    label='Mommy makeover recovery, for you and at home'
                    milestones={milestones}
                    tracks={TRACKS}
                    bothLabel='You and home'
                />

                <p className={cn(moduleBody, 'mt-8')}>
                    The week-by-week detail and the warning signs are in our{' '}
                    <Link
                        href='/blog/mommy-makeover-recovery-signs'
                        className={moduleLink}
                    >
                        mommy makeover recovery guide
                    </Link>
                    . We also go through{' '}
                    <Link
                        href='/how-long-after-mommy-makeover-can-i-drive'
                        className={moduleLink}
                    >
                        how long after a mommy makeover you can drive
                    </Link>
                    ,{' '}
                    <Link
                        href='/blog/mommy-makeover-compression-garments-guide'
                        className={moduleLink}
                    >
                        compression garments
                    </Link>{' '}
                    and{' '}
                    <Link
                        href='/blog/mommy-makeover-recovery-exercises'
                        className={moduleLink}
                    >
                        exercise after a mommy makeover
                    </Link>
                    .
                </p>

                <h3 className={cn(moduleH3, 'mt-8')}>
                    When to call your surgeon
                </h3>
                <p className={cn(moduleBody, 'mt-3')}>
                    MedlinePlus says to call your surgeon about more redness,
                    pain, swelling or bleeding at the incision, drainage that
                    increases or turns thick, tan, green or yellow or smells
                    bad, or a fever that lasts more than{' '}
                    {mommyMakeoverFigure('warning-signs')}. It lists swelling,
                    pain or tenderness, warmth and redness in a leg or arm as
                    signs of a deep vein clot. With a clot, chest pain, coughing
                    up blood, difficulty breathing or fainting mean going to the
                    emergency room or calling 911.
                </p>

                <h3 className={cn(moduleH3, 'mt-8')}>
                    If you are flying in from another state
                </h3>
                <p className={cn(moduleBody, 'mt-3')}>
                    Your surgeon tells you how many nights to stay in Miami
                    before you fly home, and we confirm your surgery, pre-op and
                    follow-up dates in writing. You arrange the travel itself.
                </p>
                <p className={cn(moduleBody, 'mt-4')}>
                    You don&apos;t have to fly in to get started.{' '}
                    <Link
                        href='/fly-in-consultation'
                        className={cn(moduleLink, 'font-bold')}
                    >
                        Start with a virtual consultation
                    </Link>{' '}
                    and have your dates in writing before you book a flight.
                </p>
            </AnswerBlock>
        </div>
    )
}
