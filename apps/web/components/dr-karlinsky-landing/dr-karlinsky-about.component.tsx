/**
 * DrKarlinskyAbout
 *
 * Magazine-style bio block. Portrait + serif body copy + education timeline.
 * Includes an inline secondary CTA back to the hero form so visitors who
 * read all the way through her story can convert without scrolling further.
 */
import { Button } from '@workspace/ui/components/button'
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

export type DrKarlinskyAboutProps = {
    readonly id?: string
    readonly formAnchor?: string
}

export function DrKarlinskyAbout({
    id = 'about-doctor',
    formAnchor = '#hero-form',
}: DrKarlinskyAboutProps) {
    const surgeon = surgeons[0]
    if (!surgeon) {
        return null
    }

    const firstName = surgeon.name.replace(/^Dr\.\s+/, '').split(' ')[0]
    const paragraphs = surgeon.fullBio.split('\n\n').filter(Boolean)

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            {/* Decorative oversize last name */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute top-12 -left-6 font-serif text-[18vw] leading-none whitespace-nowrap text-stone-100/70 select-none lg:-left-10'
            >
                Karlinsky
            </div>

            <ContentWrapper
                size='xl'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid gap-12 lg:grid-cols-12 lg:gap-16'>
                    {/* Portrait + sticky philosophy */}
                    <div className='lg:col-span-5'>
                        <div className='lg:sticky lg:top-32'>
                            <div className='relative'>
                                <div className='ring-gold-500/15 relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl ring-1 shadow-stone-300/50'>
                                    <Image
                                        src={surgeon.images.portrait}
                                        alt={`Portrait of ${surgeon.name}`}
                                        fill
                                        sizes='(min-width: 1024px) 460px, 100vw'
                                        className='object-cover object-top'
                                    />
                                </div>
                                {/* Floating credential card */}
                                <div className='ring-gold-500/15 absolute -right-3 -bottom-6 max-w-[220px] rounded-xl bg-white/90 p-4 shadow-2xl ring-1 shadow-stone-900/15 backdrop-blur-xl md:-right-6'>
                                    <div className='flex items-start gap-3'>
                                        <div className='from-gold-500 to-gold-300 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md'>
                                            <Sparkles className='h-5 w-5 text-stone-950' />
                                        </div>
                                        <div>
                                            <p className='text-gold-600 text-[10px] font-bold tracking-[0.18em] uppercase'>
                                                Recognized
                                            </p>
                                            <p className='mt-1 font-serif text-sm leading-snug font-semibold text-stone-900'>
                                                Healthgrades & RealSelf featured
                                                surgeon
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio + education + CTA */}
                    <div className='lg:col-span-7 lg:pt-6'>
                        <div className='text-gold-600 mb-4 text-xs font-bold tracking-[0.22em] uppercase'>
                            About Dr. {firstName}
                        </div>
                        <h2 className='mb-8 font-serif text-3xl leading-tight text-stone-900 md:text-4xl lg:text-5xl'>
                            A surgeon&apos;s precision.{' '}
                            <span className='text-gold-600 italic'>
                                An artist&apos;s eye.
                            </span>
                        </h2>

                        <div className='space-y-5 text-lg leading-relaxed font-light text-stone-600'>
                            {paragraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        {surgeon.philosophy && (
                            <blockquote className='border-gold-500 my-10 border-l-2 pl-6'>
                                <p className='font-serif text-xl leading-relaxed text-stone-800 italic md:text-2xl'>
                                    {surgeon.philosophy}
                                </p>
                            </blockquote>
                        )}

                        {/* Education timeline */}
                        <div className='ring-gold-500/10 mt-10 rounded-2xl bg-stone-50 p-6 ring-1 md:p-8'>
                            <div className='mb-5 flex items-center gap-3'>
                                <span className='from-gold-500 to-gold-300 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-md'>
                                    <GraduationCap className='h-5 w-5 text-stone-950' />
                                </span>
                                <h3 className='font-serif text-2xl text-stone-900'>
                                    Training & Education
                                </h3>
                            </div>
                            <ol className='relative space-y-5 border-l border-stone-200 pl-6'>
                                {surgeon.education.map((edu) => (
                                    <li
                                        key={edu}
                                        className='relative leading-relaxed text-stone-700'
                                    >
                                        <span className='ring-gold-200 bg-gold-500 absolute top-1.5 -left-[1.65rem] h-2.5 w-2.5 rounded-full ring-4' />
                                        {edu}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Inline CTA */}
                        <div className='mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                            <Button
                                asChild
                                size='lg'
                                className='bg-gold-500 hover:bg-gold-600 group h-auto px-7 py-4 text-base font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40'
                            >
                                <Link href={formAnchor}>
                                    Book With Dr. {firstName}
                                    <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                </Link>
                            </Button>
                            <p className='text-sm text-stone-500'>
                                Complimentary, confidential, no obligation.
                            </p>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
