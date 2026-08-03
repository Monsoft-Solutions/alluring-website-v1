/**
 * Objections Component
 *
 * The questions people actually hesitate over, answered directly.
 *
 * Conversion rationale: this audience researches for months before booking.
 * The blockers are rarely "which procedure" — they're safety, whether the
 * result will look obvious, and how much life the recovery costs. Naming the
 * fear in the visitor's own words and answering it plainly does more for
 * conversion than another benefits grid.
 *
 * Replaces the previous generic "Why Us" value-prop section, whose four
 * claims are folded into the answers below.
 *
 * Server-rendered.
 */
import Link from 'next/link'
import {
    ArrowRight,
    CalendarClock,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
} from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

type Objection = {
    readonly icon: React.ReactNode
    readonly question: string
    readonly answer: string
    readonly proof: string
}

const OBJECTIONS: readonly Objection[] = [
    {
        icon: <ShieldCheck className='h-5 w-5' />,
        question: '“How do I know it’s safe?”',
        answer: 'Your surgery happens in an accredited surgical facility with a dedicated anesthesia team — not an office suite. Our surgeons are double board-certified, which means their credentials were reviewed twice by independent boards, and every patient gets pre-op lab work before we clear them.',
        proof: 'Double board-certified · Accredited facility',
    },
    {
        icon: <Sparkles className='h-5 w-5' />,
        question: '“Will it look obvious?”',
        answer: 'We plan to your frame, not to a trend. The goal is that people tell you that you look rested, fit, or happy — and can’t say why. If your goal is a look we don’t think will age well on your body, we will tell you that in consultation.',
        proof: 'Natural-result specialists',
    },
    {
        icon: <CalendarClock className='h-5 w-5' />,
        question: '“How much time do I actually lose?”',
        answer: 'Most patients are back to desk work in one to two weeks and back to the gym in four to six. You get a written week-by-week recovery plan before you book, so you can schedule around childcare, work and travel instead of guessing.',
        proof: 'Written recovery plan up front',
    },
    {
        icon: <HeartHandshake className='h-5 w-5' />,
        question: '“What if I’m not ready to commit?”',
        answer: 'Then don’t. Consultations are free and carry no obligation — you can leave with a price, a plan, and no appointment scheduled. Nobody at Alluring earns a commission for closing you, because the person you meet with is your surgeon.',
        proof: 'Free · No obligation · No commission',
    },
] as const

export function Objections() {
    return (
        <SectionContainer
            id='questions'
            variant='default'
            // White, not stone-50: the Journey section directly below is
            // stone-50, and matching it would merge the two into one flat band.
            className='bg-white'
            paddingY='py-20 md:py-28'
            ariaLabel='Common concerns, answered'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Header */}
                <div className='mb-14 max-w-2xl'>
                    <span className='text-gold-500 mb-4 block text-xs font-bold tracking-[0.25em] uppercase'>
                        The Real Questions
                    </span>
                    <h2 className='mb-5 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                        What&apos;s actually
                        <span className='text-stone-400 italic'>
                            {' '}
                            stopping you?
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        It&apos;s rarely the procedure. After 5,000+ patients,
                        we know it&apos;s usually one of these four — so
                        here&apos;s the honest answer to each.
                    </p>
                </div>

                {/* Objections */}
                <dl className='grid gap-px overflow-hidden border border-stone-200 bg-stone-200 md:grid-cols-2'>
                    {OBJECTIONS.map((item) => (
                        <div
                            key={item.question}
                            className='flex flex-col bg-white p-8 md:p-10'
                        >
                            <div className='text-gold-500 border-gold-200 bg-gold-50 mb-6 flex h-11 w-11 items-center justify-center rounded-full border'>
                                {item.icon}
                            </div>

                            <dt className='mb-4 font-serif text-2xl leading-snug text-stone-900'>
                                {item.question}
                            </dt>

                            <dd className='flex flex-1 flex-col'>
                                <p className='mb-6 leading-relaxed text-stone-600'>
                                    {item.answer}
                                </p>
                                <span className='text-gold-600 mt-auto text-xs font-bold tracking-widest uppercase'>
                                    {item.proof}
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>

                {/* Closing nudge */}
                <div className='mt-12 flex flex-col items-start gap-4 border-t border-stone-200 pt-10 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='font-serif text-xl text-stone-700 md:text-2xl'>
                        Still on the fence? That&apos;s exactly who the free
                        consultation is for.
                    </p>
                    <Link
                        href='#book-consultation'
                        className='text-gold-600 hover:text-gold-700 group inline-flex shrink-0 items-center gap-2 text-sm font-bold tracking-widest uppercase'
                    >
                        Book Yours
                        <ArrowRight
                            className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1'
                            aria-hidden='true'
                        />
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
