/**
 * What happens after the visitor sends the thread — three real steps, in
 * order, so the ask feels small. Shared by the contact and specials pages.
 */

import { SurgeonCredentialCard } from './surgeon-credential-card.component'

const STEPS = [
    {
        title: 'You send four answers',
        body: 'Procedure, timing, your name and your mobile number. It takes under a minute.',
    },
    {
        title: 'A coordinator reaches out within 24 hours',
        body: 'By text or by call, whichever you picked, to answer your first questions and book your free consultation — in person in Miami, or by video from anywhere in the U.S.',
    },
    {
        title: 'You get your plan in writing',
        body: 'Your consultation is with the surgeon who operates. You leave with a personalized quote and your dates in writing, with no obligation.',
    },
] as const

export function LeadSteps({ id = 'how-it-works' }: { readonly id?: string }) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            className='bg-white px-4 py-14 sm:py-20'
        >
            <div className='mx-auto max-w-5xl'>
                <p className='text-gold-600 text-[11px] font-bold tracking-[0.18em] uppercase'>
                    How it works
                </p>
                <h2
                    id={`${id}-title`}
                    className='mt-3 font-serif text-3xl text-balance text-stone-900 sm:text-4xl'
                >
                    From your first message to your plan
                </h2>
                <ol className='mt-8 grid gap-4 md:grid-cols-3'>
                    {STEPS.map((step, index) => (
                        <li
                            key={step.title}
                            className='rounded-2xl border border-stone-200 bg-stone-50 p-5'
                        >
                            <span className='text-gold-600 font-serif text-2xl'>
                                {index + 1}
                            </span>
                            <h3 className='mt-2 text-base font-bold text-stone-900'>
                                {step.title}
                            </h3>
                            <p className='mt-2 text-sm leading-relaxed text-stone-600'>
                                {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
                <SurgeonCredentialCard headingLevel='h3' className='mt-6' />
            </div>
        </section>
    )
}
