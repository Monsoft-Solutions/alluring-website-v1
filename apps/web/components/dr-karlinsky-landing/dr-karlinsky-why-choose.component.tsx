/**
 * DrKarlinskyWhyChoose
 *
 * Four reasons-to-choose cards positioned right after the bio. Each card
 * answers a quiet objection ("is this the right surgeon?") with a concrete
 * differentiator drawn from her real credentials.
 */
import {
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    Stethoscope,
} from 'lucide-react'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

const REASONS = [
    {
        icon: ShieldCheck,
        title: 'Triple Board-Certified',
        body: 'Certified by the American Board of Cosmetic Surgery, American Board of Facial Cosmetic Surgery, and American Board of Surgery — a level of credentialing few cosmetic surgeons hold.',
        accent: 'Three boards. Zero shortcuts.',
    },
    {
        icon: Stethoscope,
        title: 'FACS Fellow & Fellowship Director',
        body: "Fellow of the American College of Surgeons and a Fellowship Director with the American Board of Cosmetic Surgery — meaning she trains other surgeons and meets the field's highest safety standards.",
        accent: 'Trains the next generation.',
    },
    {
        icon: Sparkles,
        title: 'Natural, Artistic Results',
        body: "Dr. Karlinsky tailors every plan to your anatomy, your goals, and your lifestyle. The aim is never “obvious work” — it's a more confident version of you.",
        accent: 'You, refined. Never overdone.',
    },
    {
        icon: HeartHandshake,
        title: 'Concierge-Level Care',
        body: 'From the very first consult through final follow-up, you have a dedicated team. Honest answers, transparent pricing, and a recovery plan that fits your real life.',
        accent: 'No pressure. Ever.',
    },
] as const

export type DrKarlinskyWhyChooseProps = {
    readonly id?: string
    readonly formAnchor?: string
}

export function DrKarlinskyWhyChoose({
    id = 'why-dr-karlinsky',
    formAnchor = '#hero-form',
}: DrKarlinskyWhyChooseProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-50'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle gold ambient */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-200/30 absolute -top-1/4 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl' />
                <div className='absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-stone-200/40 blur-3xl' />
            </div>

            <ContentWrapper
                size='xl'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-14 max-w-2xl text-center lg:mb-16'>
                    <p className='text-gold-600 mb-3 text-xs font-bold tracking-[0.22em] uppercase'>
                        Why Patients Choose Her
                    </p>
                    <h2 className='font-serif text-3xl leading-tight text-stone-900 md:text-4xl lg:text-5xl'>
                        Four reasons women fly into Miami{' '}
                        <span className='text-gold-600 italic'>
                            specifically for Dr. Karlinsky.
                        </span>
                    </h2>
                </div>

                <div className='grid gap-5 md:grid-cols-2 lg:gap-6'>
                    {REASONS.map((reason) => (
                        <article
                            key={reason.title}
                            className='hover:ring-gold-300/60 group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm ring-1 ring-stone-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-300/40 md:p-9'
                        >
                            {/* Hover gold gradient */}
                            <div className='from-gold-50/0 to-gold-50/0 group-hover:from-gold-50/0 group-hover:to-gold-100/40 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

                            <div className='relative'>
                                <div className='mb-5 flex items-start justify-between gap-4'>
                                    <span className='from-gold-500 to-gold-400 group-hover:shadow-gold-500/30 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-shadow duration-300 group-hover:shadow-lg'>
                                        <reason.icon className='h-6 w-6 text-stone-950' />
                                    </span>
                                    <span className='text-gold-600 text-[10px] font-semibold tracking-[0.18em] uppercase'>
                                        {reason.accent}
                                    </span>
                                </div>
                                <h3 className='mb-3 font-serif text-xl text-stone-900 md:text-2xl'>
                                    {reason.title}
                                </h3>
                                <p className='text-base leading-relaxed text-stone-600'>
                                    {reason.body}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom anchor CTA */}
                <div className='mt-12 text-center'>
                    <Link
                        href={formAnchor}
                        className='text-gold-700 hover:text-gold-800 hover:decoration-gold-500 inline-flex items-center gap-2 font-medium underline decoration-stone-300 underline-offset-4 transition-colors'
                    >
                        Ready to talk it through? Book your consult
                        <span aria-hidden='true'>↑</span>
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
