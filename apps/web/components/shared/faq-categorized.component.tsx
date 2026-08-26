/**
 * CategorizedFAQ Component
 *
 * Displays frequently asked questions organized by categories.
 * Features a two-column layout with category navigation on the left
 * and FAQ accordion on the right.
 *
 * Features:
 * - Category-based FAQ organization
 * - Two-column responsive layout
 * - Smooth category switching with animations
 * - Optional background decorations
 * - Optional CTA section
 * - Single item open at a time per category
 * - Mobile-first responsive design
 * - Automatic FAQ schema markup for SEO
 *
 * @example
 * ```tsx
 * <CategorizedFAQ
 *   categories={[
 *     { id: 'general', label: 'General' },
 *     { id: 'pricing', label: 'Pricing' }
 *   ]}
 *   faqData={{
 *     general: [{ question: 'What is...?', answer: 'It is...' }],
 *     pricing: [{ question: 'How much...?', answer: 'Starting at...' }]
 *   }}
 *   title="Your Questions,"
 *   badge="Clarity & Confidence"
 *   showBackgroundDecoration={true}
 * />
 * ```
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { FAQSchema } from '@workspace/seo/react'

import type {
    FaqItem,
    FaqCategory,
    FaqCtaConfig,
} from '@/lib/types/shared/faq.type'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'

/**
 * CategorizedFAQ Component Props
 */
export type CategorizedFAQProps = {
    /**
     * Array of categories for organizing FAQs
     */
    readonly categories: FaqCategory[]

    /**
     * FAQ data organized by category ID
     */
    readonly faqData: Record<string, FaqItem[]>

    /**
     * Optional main title
     * @default "Your Questions, Answered."
     */
    readonly title?: string

    /**
     * Optional subtitle in italic style
     */
    readonly subtitle?: string

    /**
     * Heading level for the title. Pages where this block is the main content
     * (e.g. /faqs) pass 'h1' so the page has a top-level heading.
     * @default "h2"
     */
    readonly as?: 'h1' | 'h2'

    /**
     * Optional description text
     */
    readonly description?: string

    /**
     * Optional badge text above the title
     */
    readonly badge?: string

    /**
     * Background variant for the section
     * @default "default"
     */
    readonly variant?:
        | 'default'
        | 'muted'
        | 'accent'
        | 'gradient'
        | 'gradient-reverse'
        | 'subtle'

    /**
     * Whether to show background decorations
     * @default false
     */
    readonly showBackgroundDecoration?: boolean

    /**
     * Optional CTA configuration for "Still have questions?" section
     */
    readonly ctaConfig?: FaqCtaConfig

    /**
     * Optional section ID for anchor links
     */
    readonly id?: string

    /**
     * Optional additional CSS classes
     */
    readonly className?: string

    /**
     * Whether to include FAQ structured data (JSON-LD schema)
     * Enables rich results in search engines
     * @default true
     */
    readonly includeSchema?: boolean
}

/**
 * CategorizedFAQ Component
 *
 * Renders FAQs organized by categories with a sidebar navigation.
 */
export function CategorizedFAQ({
    categories,
    faqData,
    title = 'Your Questions,',
    subtitle = 'Answered.',
    as: Heading = 'h2',
    description,
    badge = 'FAQ',
    variant = 'default',
    showBackgroundDecoration = false,
    ctaConfig,
    id = 'faq',
    className,
    includeSchema = true,
}: CategorizedFAQProps) {
    const [activeCategory, setActiveCategory] = useState<string>(
        categories[0]?.id || ''
    )
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    // Handle empty categories or FAQ data
    if (!categories || categories.length === 0 || !faqData) {
        return null
    }

    // Get all FAQs for schema
    const allFaqs = Object.values(faqData).flat()

    return (
        <>
            {/* JSON-LD Schema - Search engines will discover this anywhere in the page */}
            {includeSchema && allFaqs.length > 0 && (
                <FAQSchema
                    items={allFaqs.map((faq) => ({
                        question: faq.question,
                        answer: faq.answer,
                    }))}
                />
            )}

            <SectionContainer
                className={`relative overflow-hidden ${className || ''}`}
                paddingY='py-24 lg:py-32'
                variant={variant}
                id={id}
            >
                {/* Background Decoration */}
                {showBackgroundDecoration && (
                    <div className='pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden'>
                        <div className='bg-gold-200/20 absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full blur-3xl'></div>
                        <div className='absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-stone-200/50 blur-3xl'></div>
                    </div>
                )}

                <ContentWrapper
                    size='lg'
                    paddingX='px-6 md:px-12'
                    className='relative z-10'
                >
                    <div className='grid gap-12 lg:grid-cols-12 lg:gap-24'>
                        {/* Left Column: Header & Navigation */}
                        <div className='lg:col-span-4'>
                            <div className='lg:sticky lg:top-32'>
                                {badge && (
                                    <span className='text-gold-500 mb-4 flex items-center gap-2 text-sm font-bold tracking-widest uppercase'>
                                        <Sparkles className='h-3 w-3' />
                                        {badge}
                                    </span>
                                )}
                                <Heading className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                                    {title}{' '}
                                    {subtitle && (
                                        <>
                                            <br className='hidden lg:block' />
                                            <span className='text-stone-500 italic'>
                                                {subtitle}
                                            </span>
                                        </>
                                    )}
                                </Heading>
                                {description && (
                                    <p className='mb-12 text-lg leading-relaxed text-stone-600'>
                                        {description}
                                    </p>
                                )}

                                {/* Category Tabs */}
                                <div className='flex flex-wrap gap-3 lg:flex-col'>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setActiveCategory(cat.id)
                                                setOpenIndex(0) // Reset open index on category change
                                            }}
                                            className={`border-l-2 px-6 py-4 text-left text-base font-bold tracking-widest uppercase transition-all duration-300 ${
                                                activeCategory === cat.id
                                                    ? 'border-gold-500 bg-white pl-8 text-stone-900 shadow-sm'
                                                    : 'border-transparent text-stone-400 hover:pl-8 hover:text-stone-600'
                                            }`}
                                        >
                                            {cat.label}
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
                                {faqData[activeCategory]?.map((item, index) => (
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
                                                {item.question}
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
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: 'easeInOut',
                                                    }}
                                                    className='overflow-hidden'
                                                >
                                                    <div className='px-6 pt-0 pb-8 md:px-8'>
                                                        <p className='border-t border-stone-100 pt-6 text-lg leading-relaxed text-stone-500'>
                                                            {item.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Optional CTA Section */}
                            {ctaConfig && (
                                <div className='mt-12 items-center justify-between rounded-sm bg-stone-900 p-8 text-center md:flex md:text-left'>
                                    <div>
                                        <h4 className='mb-2 font-serif text-xl text-white'>
                                            {ctaConfig.title}
                                        </h4>
                                        <p className='text-base text-stone-400'>
                                            {ctaConfig.description}
                                        </p>
                                    </div>
                                    <Link
                                        href={`tel:${ctaConfig.phoneNumber}`}
                                        className='bg-gold-500 hover:bg-gold-400 mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors md:mt-0'
                                    >
                                        {ctaConfig.buttonText}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </ContentWrapper>
            </SectionContainer>
        </>
    )
}
