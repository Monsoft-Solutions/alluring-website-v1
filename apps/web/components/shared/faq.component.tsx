/**
 * FAQ Component
 *
 * Displays frequently asked questions in an accordion layout.
 * Uses shadcn/ui Accordion component for smooth expand/collapse animations.
 * Automatically includes FAQ structured data (JSON-LD schema) for SEO.
 *
 * Features:
 * - Single item open at a time (collapsible behavior)
 * - Smooth expand/collapse animations
 * - Keyboard navigation support
 * - Proper accessibility attributes
 * - Mobile-first responsive design
 * - Automatic FAQ schema markup for rich results
 *
 * @example
 * ```tsx
 * <FAQ
 *   faqs={[
 *     { question: 'How long does it take?', answer: '4-6 weeks typically...' },
 *     { question: 'What is the cost?', answer: 'Pricing depends on...' }
 *   ]}
 *   title="Frequently Asked Questions"
 *   description="Common questions about our service"
 *   includeSchema={true} // Default: true - enables rich results in search
 * />
 * ```
 */
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { cn } from '@workspace/ui/lib/utils'
import { FAQSchema } from '@workspace/seo/react'

import type { FaqItem } from '@/lib/types/shared/faq.type'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'
import { SectionHeader } from './section-header.component'

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
}: FAQProps) {
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
                    <Accordion
                        type='single'
                        collapsible
                        className='w-full space-y-4'
                    >
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={`faq-${index}`}
                                value={`item-${index}`}
                                className={cn(
                                    'border-border bg-card rounded-lg border px-6',
                                    'hover:border-primary/50 transition-colors'
                                )}
                            >
                                <AccordionTrigger
                                    className={cn(
                                        'text-foreground py-4 text-left font-semibold hover:no-underline',
                                        'text-base md:text-lg'
                                    )}
                                >
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent
                                    className={cn(
                                        'text-muted-foreground pt-2 pb-4 text-sm leading-relaxed md:text-base'
                                    )}
                                >
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ContentWrapper>
            </SectionContainer>
        </>
    )
}
