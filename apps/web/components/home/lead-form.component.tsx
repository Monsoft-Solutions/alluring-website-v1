'use client'

import { Button } from '@workspace/ui/components/button'

export const LeadForm = () => {
    return (
        <section className='relative overflow-hidden bg-stone-900 py-24'>
            {/* Background Art */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full blur-3xl'></div>
                <div className='absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-stone-700/20 blur-3xl'></div>
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='mx-auto max-w-4xl rounded-sm border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg md:p-16'>
                    <div className='mb-12 text-center'>
                        <h2 className='mb-4 font-serif text-3xl text-white md:text-5xl'>
                            Request Your Consultation
                        </h2>
                        <p className='text-lg text-stone-400'>
                            Tell us a bit about your goals. Our concierge will
                            reach out to discuss availability.
                        </p>
                    </div>

                    <form
                        className='space-y-8'
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div className='grid gap-8 md:grid-cols-2'>
                            <div className='group space-y-2'>
                                <label
                                    htmlFor='fullName'
                                    className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                >
                                    Full Name
                                </label>
                                <input
                                    id='fullName'
                                    type='text'
                                    className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                    placeholder='Jane Doe'
                                />
                            </div>
                            <div className='group space-y-2'>
                                <label
                                    htmlFor='phone'
                                    className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                >
                                    Phone
                                </label>
                                <input
                                    id='phone'
                                    type='tel'
                                    className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                    placeholder='(555) 555-5555'
                                />
                            </div>
                        </div>

                        <div className='group space-y-2'>
                            <label
                                htmlFor='email'
                                className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                            >
                                Email
                            </label>
                            <input
                                id='email'
                                type='email'
                                className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                placeholder='jane@example.com'
                            />
                        </div>

                        <div className='group space-y-2'>
                            <label
                                htmlFor='interestedIn'
                                className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                            >
                                Interested In
                            </label>
                            <select
                                id='interestedIn'
                                className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white transition-colors focus:outline-none'
                            >
                                <option className='bg-stone-900 text-stone-300'>
                                    Select a procedure
                                </option>
                                <option className='bg-stone-900'>
                                    Brazilian Butt Lift (BBL)
                                </option>
                                <option className='bg-stone-900'>
                                    Mommy Makeover
                                </option>
                                <option className='bg-stone-900'>
                                    Breast Augmentation
                                </option>
                                <option className='bg-stone-900'>
                                    Facial Rejuvenation
                                </option>
                            </select>
                        </div>

                        <div className='pt-8 text-center'>
                            <Button
                                className='w-full min-w-[200px] md:w-auto'
                                size='lg'
                                variant='gold'
                            >
                                Submit Request
                            </Button>
                            <p className='mt-4 text-sm text-stone-500'>
                                Private & Confidential. No spam.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
