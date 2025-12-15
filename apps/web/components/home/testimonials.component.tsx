import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

export const Testimonials = () => {
    return (
        <SectionContainer
            variant='default'
            className='overflow-hidden bg-white'
            paddingY='py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='grid gap-20 lg:grid-cols-2'>
                    <div className='flex flex-col justify-center'>
                        <Quote className='text-gold-200 mb-8 h-16 w-16 fill-current' />
                        <h2 className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                            &quot;I wish I had <br /> done this sooner.&quot;
                        </h2>
                        <p className='mb-8 max-w-md text-lg leading-relaxed text-stone-500'>
                            See why our patients consistently rate Alluring
                            Plastic Surgery 5 stars.
                        </p>
                        <div className='flex items-center gap-4'>
                            <div className='flex -space-x-2'>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className='relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-stone-200'
                                    >
                                        <Image
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt='Satisfied patient'
                                            fill
                                            className='object-cover'
                                            sizes='40px'
                                        />
                                    </div>
                                ))}
                            </div>
                            <span className='border-b border-stone-300 pb-1 text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                Read Patient Reviews
                            </span>
                        </div>
                    </div>

                    <div className='relative'>
                        <div className='absolute inset-0 z-10 bg-linear-to-r from-white via-transparent to-transparent lg:hidden'></div>
                        <div className='scrollbar-hide flex snap-x gap-6 overflow-x-auto pb-8'>
                            {/* Card 1 */}
                            <div className='min-w-[300px] snap-center border border-stone-100 bg-stone-50 p-8 transition-transform duration-300 hover:-translate-y-1 md:min-w-[350px] md:p-10'>
                                <div className='text-gold-400 mb-6 flex gap-1'>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className='h-4 w-4 fill-current'
                                        />
                                    ))}
                                </div>
                                <p className='mb-6 font-serif text-xl leading-relaxed text-stone-700 italic'>
                                    &quot;From my first call, I never felt
                                    rushed or pushed. They explained every
                                    option, every risk. Three months
                                    post-surgery, I finally feel like my body
                                    matches the way I see myself.&quot;
                                </p>
                                <div>
                                    <span className='mb-1 block text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                        Jennifer S.
                                    </span>
                                    <span className='text-sm text-stone-400'>
                                        Mommy Makeover
                                    </span>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className='min-w-[300px] snap-center border border-stone-100 bg-stone-50 p-8 transition-transform duration-300 hover:-translate-y-1 md:min-w-[350px] md:p-10'>
                                <div className='text-gold-400 mb-6 flex gap-1'>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className='h-4 w-4 fill-current'
                                        />
                                    ))}
                                </div>
                                <p className='mb-6 font-serif text-xl leading-relaxed text-stone-700 italic'>
                                    &quot;My BBL looks natural, not exaggerated.
                                    The team checked on me constantly after
                                    surgery and answered every late-night
                                    question I had.&quot;
                                </p>
                                <div>
                                    <span className='mb-1 block text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                        Maria G.
                                    </span>
                                    <span className='text-sm text-stone-400'>
                                        BBL Patient
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
