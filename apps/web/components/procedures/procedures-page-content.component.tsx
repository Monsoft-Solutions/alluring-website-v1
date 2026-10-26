'use client'

import type { ProcedureSummary } from '@/lib/data/procedure-summary.util'
import { useState, useRef } from 'react'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SignatureProcedureCard } from '@/components/shared/signature-procedure-card.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import { CategoryNav } from './category-nav.component'
import { ProcedureCard } from './procedure-card.component'
import { ProcedureHero } from './procedure-hero.component'
import { WhyChooseSection } from './why-choose-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { formatRatingBadge, TRUST_BADGES } from '@workspace/shared/claims/trust'
import { siteConfig } from '@/lib/data/site-config'
import {
    faqCategoriesProcedures,
    type faqDataProcedures,
} from '@/lib/data/faq/procedures-faq-data'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Award, Users, Building2 } from 'lucide-react'

interface ProceduresPageContentProps {
    procedures: ProcedureSummary[]
    /** The FAQ with its claim tokens resolved on the server (#354). */
    faqData: typeof faqDataProcedures
    /**
     * The 456.062 statement while a discount is on: the cards print the
     * discounted starting prices (#354).
     */
    discountStatement: string | null
}

export function ProceduresPageContent({
    procedures,
    faqData,
    discountStatement,
}: ProceduresPageContentProps) {
    const [activeCategory, setActiveCategory] = useState('all')
    const targetRef = useRef<HTMLDivElement>(null)

    // Filter procedures based on active category
    const filteredProcedures =
        activeCategory === 'all'
            ? procedures
            : procedures.filter((p) => p.category === activeCategory)

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start start', 'end end'],
    })

    const x = useTransform(scrollYProgress, [0, 1], ['1%', '-95%'])

    return (
        <>
            <ProcedureHero />

            {/* Mobile: Cinematic full-bleed vertical layout */}
            <section id='procedures-grid' className='bg-stone-900 md:hidden'>
                {/* Header with padding */}
                <div className='px-6 pt-16 pb-10'>
                    <div className='max-w-3xl'>
                        <div className='mb-4 flex items-center gap-3'>
                            <span className='bg-gold-400 h-px w-12'></span>
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                Excellence in Aesthetics
                            </span>
                        </div>
                        <h2 className='mb-6 font-serif text-4xl text-white'>
                            Curated Procedures
                        </h2>
                        <p className='text-lg leading-relaxed font-light text-stone-400'>
                            At <strong>Alluring Plastic Surgery</strong>, we
                            believe in delivering results that help you feel
                            confident, beautiful, and empowered.
                        </p>
                    </div>
                </div>

                {/* Mobile Grid - Edge-to-edge cinematic cards */}
                <div className='flex flex-col gap-4 pb-16'>
                    {procedures.map((procedure) => (
                        <ProcedureCard
                            key={procedure.slug}
                            procedure={procedure}
                        />
                    ))}
                </div>
            </section>

            {/* Desktop: Curated Procedures Section with Horizontal Scroll */}
            <section
                ref={targetRef}
                className='relative hidden bg-stone-900 md:block'
                style={{
                    height: `${Math.max(150, filteredProcedures.length * 50)}vh`,
                }}
            >
                <div className='sticky top-0 flex h-screen flex-col overflow-hidden pt-20'>
                    <div className='relative z-40 bg-white'>
                        <CategoryNav
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                            disableSticky={true}
                        />
                    </div>

                    <div className='flex flex-1 flex-col justify-center py-12'>
                        <ContentWrapper size='lg' paddingX='px-12'>
                            <div className='mb-12 max-w-3xl'>
                                <div className='mb-4 flex items-center gap-3'>
                                    <span className='bg-gold-400 h-px w-12'></span>
                                    <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                        Excellence in Aesthetics
                                    </span>
                                </div>
                                <h2 className='mb-6 font-serif text-5xl text-white'>
                                    Curated Procedures
                                </h2>
                                <p className='text-xl leading-relaxed font-light text-stone-400'>
                                    At <strong>Alluring Plastic Surgery</strong>
                                    , we believe in delivering results that help
                                    you feel confident, beautiful, and
                                    empowered. Whether you&apos;re looking for
                                    subtle enhancements or transformative
                                    changes, our team guides you every step of
                                    the way.
                                </p>
                            </div>
                        </ContentWrapper>

                        {/* Horizontal Scroll Area */}
                        {filteredProcedures.length > 0 ? (
                            <motion.div
                                style={{ x }}
                                className='flex gap-8 px-12'
                            >
                                {filteredProcedures.map((procedure, idx) => (
                                    <SignatureProcedureCard
                                        key={procedure.slug}
                                        procedure={procedure}
                                        index={idx}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <ContentWrapper size='lg' paddingX='px-12'>
                                <div className='py-20 text-center'>
                                    <p className='text-lg text-stone-400'>
                                        No procedures found in this category.
                                    </p>
                                </div>
                            </ContentWrapper>
                        )}
                    </div>
                </div>
            </section>

            {discountStatement && (
                <div className='mx-auto max-w-7xl px-6 py-6'>
                    <DiscountStatement statement={discountStatement} />
                </div>
            )}

            {/* Why Choose Us Section */}
            <WhyChooseSection />

            {/* FAQ Section */}
            <CategorizedFAQ
                categories={faqCategoriesProcedures}
                faqData={faqData}
                title='Questions About'
                subtitle='Your Transformation'
                description='We understand that considering plastic surgery is a significant decision. Browse our comprehensive FAQ organized by topic, or call us directly for personalized guidance.'
                badge='Expert Answers'
                variant='default'
                showBackgroundDecoration={true}
                ctaConfig={{
                    title: 'Still have questions?',
                    description:
                        'Our team is ready to guide you through every step of your journey.',
                    buttonText: 'Call Now',
                    phoneNumber: siteConfig.contact.phone.replace(/\D/g, ''),
                }}
            />

            {/* CTA Section - Luxury Variant */}
            <CTASection
                variant='luxury'
                eyebrow='Your Journey Starts Here'
                heading='Your Confidence Deserves This'
                description="Taking this step takes courage. One surgeon, Victoria Karlinsky, MD, FACS, and our team guide you through a personalized consultation, completely free, with no pressure. Just clarity on your options and what's possible for you."
                primaryButton={{
                    text: 'Schedule Your Free Consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
                backgroundImage='/images/hero-beautiful-latin-woman.jpg'
                trustBadges={[
                    {
                        icon: <Award className='h-5 w-5' />,
                        label: TRUST_BADGES.surgeon,
                    },
                    {
                        icon: <Shield className='h-5 w-5' />,
                        label: TRUST_BADGES.board,
                    },
                    {
                        icon: <Users className='h-5 w-5' />,
                        label: formatRatingBadge(siteConfig.trustStats?.rating),
                    },
                    {
                        icon: <Building2 className='h-5 w-5' />,
                        label: TRUST_BADGES.spanish,
                    },
                ]}
            />
        </>
    )
}
