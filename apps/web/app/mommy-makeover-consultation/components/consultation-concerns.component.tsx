/**
 * The questions a mother weighs before booking, answered with what the practice
 * can state: no payment figures, no volume claims, and only the surgeon's
 * verified credentials.
 *
 * This page's own copy of the shared `FearBusters` layout. `FearBusters` takes
 * no content props and still carries the weekly payment, "Double
 * Board-Certified" and "5,000+" lines on eight other pages, so it isn't rendered
 * here. Once it accepts its items as a prop, this section can pass them instead.
 */
import { CreditCard, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

const linkClassName =
    'text-gold-700 hover:text-gold-800 font-medium underline underline-offset-2'

const CONCERNS = [
    {
        icon: CreditCard,
        question: 'What will it cost?',
        highlight: 'Priced part by part',
        answer: (
            <>
                Your plan is priced from the procedures in it. See{' '}
                <Link
                    href='/procedures/mommy-makeover-miami#pricing'
                    className={linkClassName}
                >
                    the price of each part
                </Link>
                . Financing is available through {getFinancingPartnersString()}{' '}
                for qualified applicants. Approval and terms are set by the
                lender.
            </>
        ),
    },
    {
        icon: ShieldCheck,
        question: 'Is it safe?',
        highlight: 'One surgeon',
        answer: (
            <>
                Every surgery carries risk, and combining procedures adds some.{' '}
                {KARLINSKY_NAME} performs every mommy makeover at Alluring and
                reviews your health and the length of your plan with you.{' '}
                {KARLINSKY_CREDENTIALS}
            </>
        ),
    },
    {
        icon: Sparkles,
        question: 'Will I look natural?',
        highlight: 'Your plan',
        answer: (
            <>
                Tell {KARLINSKY_SHORT_NAME} what you want changed and what you
                want left alone, and she plans around that. You can look through{' '}
                <Link href='/gallery/mommy-makeover' className={linkClassName}>
                    before and after photos
                </Link>{' '}
                first.
            </>
        ),
    },
    {
        icon: Heart,
        question: "What if I'm not ready?",
        highlight: 'No pressure',
        answer: (
            <>
                No obligation. Your consultation is free, and we&apos;re here to
                answer questions, not to pressure you.
            </>
        ),
    },
] as const satisfies ReadonlyArray<{
    icon: typeof CreditCard
    question: string
    highlight: string
    answer: ReactNode
}>

export type ConsultationConcernsProps = {
    readonly id?: string
    /** Anchor of the form the closing link scrolls back to */
    readonly formAnchor: string
}

/** Server-rendered objections section for /mommy-makeover-consultation. */
export function ConsultationConcerns({
    id = 'concerns',
    formAnchor,
}: ConsultationConcernsProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/20 absolute -top-[20%] left-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute right-[5%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-stone-100 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        We Understand Your Concerns
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        Questions You Might Be{' '}
                        <span className='text-gold-600 italic'>Asking</span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Honest answers to what&apos;s probably on your mind.
                    </p>
                </div>

                <div className='grid gap-6 md:grid-cols-2'>
                    {CONCERNS.map((item) => (
                        <div
                            key={item.question}
                            className='hover:border-gold-200 group relative rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8'
                        >
                            <div className='bg-gold-100 text-gold-700 absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold'>
                                {item.highlight}
                            </div>
                            <div className='group-hover:bg-gold-500 mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 transition-colors duration-300 group-hover:text-white'>
                                <item.icon className='text-gold-600 h-6 w-6 group-hover:text-white' />
                            </div>
                            <h3 className='mb-3 font-serif text-xl font-semibold text-stone-900'>
                                &ldquo;{item.question}&rdquo;
                            </h3>
                            <p className='leading-relaxed text-stone-600'>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className='mt-12 text-center'>
                    <p className='text-stone-600'>
                        <span className='font-semibold text-stone-900'>
                            Still have questions?
                        </span>{' '}
                        Our patient concierge is happy to answer anything, with
                        no pressure.
                    </p>
                    <a
                        href={formAnchor}
                        className='text-gold-600 hover:text-gold-700 mt-3 inline-flex items-center gap-2 font-medium transition-colors'
                    >
                        Get your questions answered
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
