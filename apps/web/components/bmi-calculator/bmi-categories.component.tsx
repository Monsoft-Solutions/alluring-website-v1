/**
 * BMI Categories Component
 *
 * Displays BMI range categories with surgery candidacy information.
 * Server-rendered for SEO optimization.
 *
 * Features:
 * - Visual cards explaining each BMI range
 * - Color-coded categories
 * - Surgery candidacy information
 * - Stone palette with gold accents
 */
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { BmiCategory } from '@/lib/data/webpages/bmi-calculator.data'

type BmiCategoriesProps = {
    readonly badge: string
    readonly title: string
    readonly description: string
    readonly items: BmiCategory[]
    readonly id?: string
    readonly variant?:
        | 'default'
        | 'muted'
        | 'accent'
        | 'gradient'
        | 'gradient-reverse'
        | 'subtle'
    readonly className?: string
}

export function BmiCategories({
    badge,
    title,
    description,
    items,
    id = 'bmi-categories',
    variant = 'muted',
    className,
}: BmiCategoriesProps) {
    return (
        <SectionContainer id={id} variant={variant} className={className}>
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    badge={badge}
                    title={title}
                    description={description}
                    align='center'
                    className='mb-12'
                />

                {/* Categories Grid */}
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {items.map((category, index) => (
                        <article
                            key={category.id}
                            className={cn(
                                'group relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md',
                                category.borderColor
                            )}
                            style={{
                                animationDelay: `${index * 100}ms`,
                            }}
                        >
                            {/* Category Header */}
                            <div className='mb-4 flex items-start justify-between'>
                                <div>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-sm font-semibold',
                                            category.bgColor,
                                            category.color
                                        )}
                                    >
                                        {category.label}
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'text-right text-2xl font-bold',
                                        category.color
                                    )}
                                >
                                    {category.range}
                                </div>
                            </div>

                            {/* Description */}
                            <p className='mb-4 text-sm leading-relaxed text-stone-600'>
                                {category.description}
                            </p>

                            {/* Surgery Recommendation */}
                            <div className='border-t border-stone-100 pt-4'>
                                <h4 className='mb-2 text-xs font-bold tracking-wide text-stone-400 uppercase'>
                                    Surgery Candidacy
                                </h4>
                                <p className='text-sm leading-relaxed font-medium text-stone-700'>
                                    {category.surgeryRecommendation}
                                </p>
                            </div>

                            {/* Decorative accent */}
                            <div
                                className={cn(
                                    'absolute top-0 left-0 h-1 w-full',
                                    category.bgColor.replace('bg-', 'bg-')
                                )}
                                style={{
                                    backgroundColor: category.color.includes(
                                        'emerald'
                                    )
                                        ? '#10b981'
                                        : category.color.includes('blue')
                                          ? '#2563eb'
                                          : category.color.includes('amber')
                                            ? '#d97706'
                                            : category.color.includes('orange')
                                              ? '#ea580c'
                                              : category.color.includes('red')
                                                ? '#dc2626'
                                                : '#6b7280',
                                }}
                            />
                        </article>
                    ))}
                </div>

                {/* Important Note */}
                <div className='bg-gold-50 border-gold-200 mt-8 rounded-lg border p-6 text-center'>
                    <p className='text-sm leading-relaxed text-stone-700'>
                        <strong className='text-gold-700'>
                            Important Note:
                        </strong>{' '}
                        BMI is just one factor in determining surgical
                        candidacy. Our board-certified surgeons evaluate your
                        complete health profile, including medical history,
                        lifestyle factors, and personal goals. Every patient is
                        unique, and we encourage you to schedule a consultation
                        for a personalized assessment.
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
