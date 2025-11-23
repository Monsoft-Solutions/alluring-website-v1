'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Sparkles } from 'lucide-react'

type Category = 'General' | 'Recovery' | 'Financing' | 'Safety'

const categories: Category[] = ['General', 'Recovery', 'Financing', 'Safety']

const faqData: Record<Category, { q: string; a: string }[]> = {
    General: [
        {
            q: 'How do I schedule a consultation?',
            a: 'You can request a consultation via our online form, WhatsApp concierge, or by calling our Miami office directly. We offer both in-person appointments and virtual consultations for our out-of-town patients.',
        },
        {
            q: 'Do I need a referral from my doctor?',
            a: 'No, cosmetic procedures generally do not require a referral. However, we will conduct a thorough health history review to ensure you are a safe candidate for surgery.',
        },
        {
            q: 'Where is the surgery performed?',
            a: 'All procedures are performed in our state-of-the-art, AAAASF-accredited surgical facility located right here in Miami. We prioritize privacy, safety, and comfort.',
        },
    ],
    Recovery: [
        {
            q: 'How long will I need to take off work?',
            a: 'This varies by procedure. For a BBL or Mommy Makeover, most patients take 2 weeks off. For breast augmentation, many return to desk work within 5-7 days. We will provide a customized timeline during your consult.',
        },
        {
            q: 'Do you offer recovery houses?',
            a: 'We partner with top-tier luxury recovery suites in Miami that offer 24/7 nursing care, transportation, and meals. Our concierge can handle all booking details for you.',
        },
        {
            q: 'When can I exercise again?',
            a: 'Light walking is encouraged immediately. Cardio can usually resume at 3-4 weeks, and heavy lifting or intense workouts typically require 6 weeks of healing.',
        },
    ],
    Financing: [
        {
            q: 'Do you offer payment plans?',
            a: 'Yes. We believe luxury care should be accessible. We work with CareCredit, Alphaeon, and PatientFi to offer flexible monthly payment plans, some with 0% interest for qualified applicants.',
        },
        {
            q: 'Does insurance cover these procedures?',
            a: 'Elective cosmetic surgery is typically not covered by insurance. However, strictly medical portions (like hernia repair during a tummy tuck) might be eligible depending on your provider.',
        },
    ],
    Safety: [
        {
            q: 'Are your surgeons board-certified?',
            a: 'Absolutely. Our surgeons hold board certifications and specialize specifically in aesthetic procedures. We maintain the highest standards of training and safety protocols.',
        },
        {
            q: 'What anesthesia do you use?',
            a: 'We use general anesthesia administered by board-certified MD anesthesiologists—never nurse anesthetists without supervision. Your safety is our non-negotiable priority.',
        },
    ],
}

export const FAQ = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('General')
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className='relative overflow-hidden bg-stone-100 py-24 lg:py-32'>
            {/* Background Decoration */}
            <div className='pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden'>
                <div className='bg-gold-200/20 absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full blur-3xl'></div>
                <div className='absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-stone-200/50 blur-3xl'></div>
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='grid gap-12 lg:grid-cols-12 lg:gap-24'>
                    {/* Left Column: Header & Navigation */}
                    <div className='lg:col-span-4'>
                        <div className='lg:sticky lg:top-32'>
                            <span className='text-gold-500 mb-4 block flex items-center gap-2 text-sm font-bold tracking-widest uppercase'>
                                <Sparkles className='h-3 w-3' />
                                Clarity & Confidence
                            </span>
                            <h2 className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                                Your Questions,{' '}
                                <br className='hidden lg:block' />
                                <span className='text-stone-500 italic'>
                                    Answered.
                                </span>
                            </h2>
                            <p className='mb-12 text-lg leading-relaxed text-stone-600'>
                                We believe transparency is the ultimate luxury.
                                Here are the answers to the most common
                                questions our patients ask.
                            </p>

                            {/* Category Tabs */}
                            <div className='flex flex-wrap gap-3 lg:flex-col'>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setActiveCategory(cat)
                                            setOpenIndex(0) // Reset open index on category change
                                        }}
                                        className={`border-l-2 px-6 py-4 text-left text-base font-bold tracking-widest uppercase transition-all duration-300 ${
                                            activeCategory === cat
                                                ? 'border-gold-500 bg-white pl-8 text-stone-900 shadow-sm'
                                                : 'border-transparent text-stone-400 hover:pl-8 hover:text-stone-600'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Accordion */}
                    <div className='lg:col-span-8'>
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className='space-y-4'
                        >
                            {faqData[activeCategory].map((item, index) => (
                                <div
                                    key={index}
                                    className={`group border border-stone-200 bg-white transition-all duration-300 ${
                                        openIndex === index
                                            ? 'border-gold-400 shadow-lg'
                                            : 'hover:border-stone-300'
                                    }`}
                                >
                                    <button
                                        onClick={() =>
                                            setOpenIndex(
                                                openIndex === index
                                                    ? null
                                                    : index
                                            )
                                        }
                                        className='flex w-full items-center justify-between p-6 text-left focus:outline-none md:p-8'
                                    >
                                        <span
                                            className={`font-serif text-xl transition-colors duration-300 ${
                                                openIndex === index
                                                    ? 'text-stone-900'
                                                    : 'text-stone-600 group-hover:text-stone-900'
                                            }`}
                                        >
                                            {item.q}
                                        </span>
                                        <span
                                            className={`ml-6 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                                openIndex === index
                                                    ? 'bg-gold-500 border-gold-500 rotate-180 text-white'
                                                    : 'group-hover:border-gold-400 group-hover:text-gold-400 border-stone-200 text-stone-400'
                                            }`}
                                        >
                                            {openIndex === index ? (
                                                <Minus size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: 'auto',
                                                    opacity: 1,
                                                }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    ease: 'easeInOut',
                                                }}
                                                className='overflow-hidden'
                                            >
                                                <div className='px-6 pt-0 pb-8 md:px-8'>
                                                    <p className='border-t border-stone-100 pt-6 text-lg leading-relaxed text-stone-500'>
                                                        {item.a}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>

                        <div className='mt-12 items-center justify-between rounded-sm bg-stone-900 p-8 text-center md:flex md:text-left'>
                            <div>
                                <h4 className='mb-2 font-serif text-xl text-white'>
                                    Still have questions?
                                </h4>
                                <p className='text-base text-stone-400'>
                                    Our patient concierge is ready to help you.
                                </p>
                            </div>
                            <a
                                href='tel:7863058649'
                                className='bg-gold-500 hover:bg-gold-400 mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors md:mt-0'
                            >
                                Chat with Concierge
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
