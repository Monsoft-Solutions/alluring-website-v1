import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleGuideLinks,
    ModuleTimeline,
    type ModuleGuide,
    type ModuleMilestone,
} from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'

/**
 * Every figure is a fact in `tummy-tuck.facts.ts`, attributed the way that
 * file says it must be. Surgeons' posts on the ASPS website are named by
 * their author, because ASPS says they are the author's views.
 */
const milestones: ModuleMilestone[] = [
    {
        when: 'Day of surgery',
        body: 'You usually go home the same day. You can walk that day, which helps keep the risk of blood clots in the legs to a minimum (Cindy Wu, MD, on the ASPS website); your surgeon tells you when to start. Someone stays with you for at least the first night, as ASPS advises, and The Aesthetic Society says to arrange help at home for at least the first 3 days.',
    },
    {
        when: 'First 7–10 days',
        body: 'You walk bent at the waist to protect the incision, then stand up straight (Cindy Wu, MD). ASPS says you should be standing tall within a week or two.',
    },
    {
        when: 'Weeks 1–2',
        body: 'Drains, if you have them, come out once the fluid slows (Cindy Wu, MD). Driving, cooking and shopping are often manageable by now (Shahram Salemy, MD). Your surgeon clears you to drive.',
    },
    {
        when: 'About 2 weeks',
        body: `Most people return to non-strenuous work (Cindy Wu, MD; Samir Rao, MD), though Shahram Salemy, MD, says most people opt to take up to a month off work. Cleveland Clinic says to plan at least ${tummyTuckFigure('work-about-2-weeks', 1)} off work. After an extended tummy tuck, most return to work at ${tummyTuckFigure('work-by-type', 1)} (Samir Rao, MD).`,
    },
    {
        when: 'First few weeks',
        body: 'No picking up children or anything heavy, so line up help with childcare before surgery (Shahram Salemy, MD).',
    },
    {
        when: 'Weeks 4–6',
        body: 'The compression garment comes off (Cindy Wu, MD), and strenuous exercise comes back once your surgeon clears you (Cleveland Clinic).',
    },
    {
        when: 'Weeks 4–8',
        body: `Heavy lifting, sex and stretching, usually, once your surgeon clears them (Cleveland Clinic). Running and lifting wait at least ${tummyTuckFigure('lifting-6-weeks')} (Cindy Wu, MD).`,
    },
    {
        when: 'Around 8 weeks',
        body: 'Most people begin to feel more normal (Shahram Salemy, MD).',
    },
    {
        when: 'About 3 months',
        body: `Swelling keeps going down until about now (Cindy Wu, MD), and Cleveland Clinic says the final result can take up to this long. A full recovery takes around this long (Samir Rao, MD). Residual swelling can linger for ${tummyTuckFigure('swelling-3-months', 1)} or longer, and the complete result can take a full year (Paul Vitenas, MD).`,
    },
    {
        when: '12–18 months',
        body: 'The scar turns thinner and lighter (Cindy Wu, MD). Until then, use sunscreen with SPF 30 on it in the sun, as Cleveland Clinic advises.',
    },
]

const guides: ModuleGuide[] = [
    {
        label: 'Pubic swelling after a tummy tuck, and what helps',
        href: '/how-to-reduce-pubic-swelling-after-tummy-tuck',
    },
    {
        label: 'Tightness and pulling after a tummy tuck',
        href: '/how-to-reduce-tightness-after-tummy-tuck',
    },
    {
        label: 'Tummy tuck drains: what they are and how long they stay',
        href: '/blog/tummy-tuck-drains-what-they-are-how-long-they-stay',
    },
    {
        label: 'When you can drive again',
        href: '/how-long-after-mommy-makeover-can-i-drive',
    },
    {
        label: 'Exercise after a tummy tuck',
        href: '/blog/exercises-after-tummy-tuck-miami',
    },
    {
        label: 'A tummy tuck after Ozempic or another GLP-1',
        href: '/blog/ozempic-tummy-tuck-myths-miami',
    },
    {
        label: 'Is a tummy tuck more painful than a BBL?',
        href: '/what-is-more-painful-bbl-or-tummy-tuck',
    },
]

/**
 * "What is tummy tuck recovery like?" The timeline gives the milestones;
 * the blog posts that rank for each recovery question (pubic swelling,
 * tightness, drains, driving) own the details and are linked, not repeated.
 * The scar and a later pregnancy, two of her top questions, get their own
 * H3s here.
 */
export function TummyTuckRecovery() {
    return (
        <AnswerBlock
            id='recovery'
            question='What is tummy tuck recovery like?'
            className={moduleSectionPad}
            answer={`Most people walk bent at the waist for ${tummyTuckFigure('bent-7-10-days')}, go back to non-strenuous work in about ${tummyTuckFigure('work-about-2-weeks')} and wear a compression garment for ${tummyTuckFigure('garment-4-6-weeks')}. Heavy lifting usually waits ${tummyTuckFigure('heavy-lifting-4-8-weeks')}, and the final result can take up to ${tummyTuckFigure('results-3-months')} to show, according to ASPS, Cleveland Clinic and surgeons writing on the ASPS website.`}
        >
            <ModuleTimeline
                label='Tummy tuck recovery timeline'
                milestones={milestones}
            />

            <h3 className={cn(moduleH3, 'mt-6')}>Where will my scar be?</h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Low on the abdomen. Jonathan Weiler, MD, on the ASPS website,
                says a skilled surgeon places it as low as possible so underwear
                or swimsuit bottoms conceal it. A full tummy tuck scar usually
                runs from hip bone to hip bone, just above the pubic area, and
                you may also have a scar around the belly button; a mini tummy
                tuck scar is about the length of a C-section scar,{' '}
                {tummyTuckFigure('mini-scar-3-6-inches')} (Cleveland Clinic). If
                you have had a C-section, ASPS says the old scar may become part
                of the new one.
            </p>
            <p className={cn(moduleBody, 'mt-4')}>
                ASPS says the scar can take several months to a year to fade as
                much as it will, and Cleveland Clinic says most people will
                still have a visible scar. In the Miami sun, keep it covered or
                use sunscreen with SPF 30 for{' '}
                {tummyTuckFigure('sunscreen-12-18-months')}, as Cleveland Clinic
                advises.
            </p>
            <p className={cn(moduleBody, 'mt-4')}>
                <Link
                    href='/blog/tummy-tuck-scars-miami'
                    className={moduleLink}
                >
                    Tummy tuck scar: where it sits and how it fades
                </Link>
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                Can I have a baby after a tummy tuck?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                You can, but ASPS advises postponing a tummy tuck if you may
                want to be pregnant again, because significant changes in weight
                can greatly diminish the result. The evidence on mothers and
                babies is limited. A 2023 review of{' '}
                {tummyTuckFigure('pregnancy-after')} and{' '}
                {tummyTuckFigure('pregnancy-after', 1)} who became pregnant
                after a tummy tuck found no deaths of mothers or newborns and
                concluded that pregnancy should not be ruled out (Karunaratne
                and colleagues, Aesthetic Plastic Surgery, 2023). Some of the
                studies also recorded problems with the abdominal wall or the
                cosmetic result. A 2024 analysis of US health records linked a
                past tummy tuck to higher odds of preterm delivery (Cheng and
                colleagues, American Journal of Obstetrics and Gynecology MFM,
                2024). Ask your surgeon and your OB what this means for you.
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                If you are flying in from another state
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Your surgeon tells you how many nights to stay in Miami before
                you fly home, and we confirm your surgery, pre-op and follow-up
                dates in writing. You arrange the travel itself.
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
            <p className={cn(moduleBody, 'mt-4')}>
                Want your surgery, pre-op and follow-up dates in writing?{' '}
                <a href='#book' className={cn(moduleLink, 'font-bold')}>
                    Book a consultation
                </a>
            </p>

            <ModuleGuideLinks
                main={{
                    label: 'Tummy tuck recovery, week by week',
                    href: '/how-long-to-recover-tummy-tuck',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}
