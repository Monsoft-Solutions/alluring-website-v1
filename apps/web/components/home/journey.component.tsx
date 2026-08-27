import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Staggered reveal for the three steps. Written out rather than computed so
 * Tailwind's scanner can see each class; `animate-delay-*` utilities live in
 * `packages/ui/src/styles/globals.css`.
 */
const STEP_DELAY = ['animate-delay-0', 'animate-delay-100', 'animate-delay-200']

export const Journey = () => {
    const steps = [
        {
            num: '01',
            title: 'The Conversation',
            desc: "Whether you're considering a BBL, mommy makeover, breast augmentation, or liposuction—share your goals over a private consult with a surgeon, not a salesperson.",
        },
        {
            num: '02',
            title: 'The Custom Plan',
            desc: 'From body contouring to facial rejuvenation, we map out your anatomy, recovery timeline, and all-inclusive financing options together.',
        },
        {
            num: '03',
            title: 'The Transformation',
            desc: 'From surgery day to your final follow-up, your dedicated concierge team is by your side—ensuring your results exceed expectations.',
        },
    ]

    return (
        <SectionContainer
            id='experience'
            variant='default'
            className='relative z-20 overflow-hidden bg-stone-50'
            paddingY='py-24 lg:py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='grid items-start gap-16 lg:grid-cols-2 lg:gap-24'>
                    {/* Left: Sticky Content */}
                    <div className='lg:sticky lg:top-32'>
                        <span className='text-gold-500 animate-fade-in mb-4 block text-sm font-bold tracking-widest uppercase'>
                            Your Journey
                        </span>
                        <h2 className='animate-fade-in-up mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl lg:text-6xl'>
                            Designed for Women Who Are Done{' '}
                            <span className='text-stone-400 italic'>
                                &quot;Just Dealing With It.&quot;
                            </span>
                        </h2>
                        <p className='max-w-md text-xl leading-relaxed text-stone-600'>
                            At Alluring Plastic Surgery, we don&apos;t just
                            change how you look. We protect your health, respect
                            your time, and guide you through every decision with
                            full transparency.
                        </p>
                    </div>

                    {/* Right: Steps */}
                    <div className='relative border-l border-stone-200 pl-8 lg:border-none lg:pl-0'>
                        <div className='space-y-16'>
                            {steps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`group animate-fade-in-up relative ${STEP_DELAY[idx] ?? ''}`}
                                >
                                    {/* Number for Desktop */}
                                    <span className='group-hover:text-gold-300 absolute top-0 -left-24 hidden font-serif text-6xl text-stone-200 transition-colors duration-500 lg:block'>
                                        {step.num}
                                    </span>

                                    {/* Line connector for mobile visual */}
                                    <div className='border-gold-400 absolute top-2 -left-[33px] h-4 w-4 rounded-full border-2 bg-stone-100 lg:hidden'></div>

                                    <h3 className='mb-4 font-serif text-2xl text-stone-900 md:text-3xl'>
                                        {step.title}
                                    </h3>
                                    <p className='max-w-md text-lg leading-relaxed text-stone-500'>
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
