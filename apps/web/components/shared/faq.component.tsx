/**
 * FAQ Component
 *
 * Displays frequently asked questions in an accordion layout.
 * Uses framer-motion for smooth expand/collapse animations.
 * Automatically includes FAQ structured data (JSON-LD schema) for SEO.
 *
 * Features:
 * - Single item open at a time (collapsible behavior)
 * - Smooth expand/collapse animations
 * - Modern styling with stone color palette
 * - Optional CTA section
 * - Mobile-first responsive design
 * - Automatic FAQ schema markup for rich results
 *
 * @example
 * ```tsx
 * <FAQComponent
 *   faqs={[
 *     { question: 'How long does it take?', answer: '4-6 weeks typically...' },
 *     { question: 'What is the cost?', answer: 'Pricing depends on...' }
 *   ]}
 *   title="Frequently Asked Questions"
 *   description="Common questions about our service"
 *   ctaConfig={{
 *     title: "Still have questions?",
 *     description: "Our team is ready to help you.",
 *     buttonText: "Contact Us",
 *     phoneNumber: "7863058649"
 *   }}
 * />
 * ```
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { FAQSchema } from '@workspace/seo/react'

import type { FaqItem, FaqCtaConfig } from '@/lib/types/shared/faq.type'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'
import { SectionHeader } from './section-header.component'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

/**
 * FAQ Component Props
 */
export type FAQProps = {
    /**
     * Array of FAQ items to display
     */
    readonly faqs: FaqItem[]

    /**
     * Optional section title
     * @default "Frequently Asked Questions"
     */
    readonly title?: string

    /**
     * Optional section description
     */
    readonly description?: string

    /**
     * Background variant for the section
     * @default "muted"
     */
    readonly variant?:
        | 'default'
        | 'muted'
        | 'accent'
        | 'gradient'
        | 'gradient-reverse'
        | 'subtle'

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

    /**
     * Optional CTA configuration for "Still have questions?" section
     */
    readonly ctaConfig?: FaqCtaConfig
}

/**
 * FAQ Component
 *
 * Renders an accordion of frequently asked questions.
 * Only one FAQ item can be open at a time.
 */
export function FAQComponent({
    faqs,
    title = 'Frequently Asked Questions',
    description,
    variant = 'muted',
    id = 'faq',
    className,
    includeSchema = true,
    ctaConfig,
}: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const { track } = useAnalyticsEvent()

    const handleToggle = (index: number, question: string) => {
        const willOpen = openIndex !== index

        if (willOpen) {
            track('faq_expand', {
                question_text: question,
                question_index: index,
                section_id: id,
            })
        } else {
            track('faq_collapse', {
                question_text: question,
                question_index: index,
                section_id: id,
            })
        }

        setOpenIndex(willOpen ? index : null)
    }

    // Handle empty FAQs array
    if (!faqs || faqs.length === 0) {
        return null
    }

    return (
        <>
            {/* JSON-LD Schema - Search engines will discover this anywhere in the page */}
            {includeSchema && (
                <FAQSchema
                    items={faqs.map((faq) => ({
                        question: faq.question,
                        answer: faq.answer,
                    }))}
                />
            )}

            <SectionContainer variant={variant} id={id} className={className}>
                <ContentWrapper size='md'>
                    {/* Section Header */}
                    <SectionHeader
                        title={title}
                        description={description}
                        align='center'
                        className='mb-12'
                    />

                    {/* FAQ Accordion */}
                    <div className='space-y-4'>
                        {faqs.map((faq, index) => (
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
                                        handleToggle(index, faq.question)
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
                                        {faq.question}
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
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

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
                </ContentWrapper>
            </SectionContainer>
        </>
    )
}
