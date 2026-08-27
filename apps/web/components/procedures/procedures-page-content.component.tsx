'use client'

import type { Procedure } from '@/lib/types/procedure.type'
import { useState, useRef } from 'react'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SignatureProcedureCard } from '@/components/shared/signature-procedure-card.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CategoryNav } from './category-nav.component'
import { ProcedureCard } from './procedure-card.component'
import { ProcedureHero } from './procedure-hero.component'
import { WhyChooseSection } from './why-choose-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    faqCategoriesProcedures,
    faqDataProcedures,
} from '@/lib/data/faq/procedures-faq-data'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Award, Users, Building2 } from 'lucide-react'

interface ProceduresPageContentProps {
    procedures: Procedure[]
}

export function ProceduresPageContent({
    procedures,
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
                    {procedures.map((procedure, idx) => (
                        <ProcedureCard
                            key={procedure.slug}
                            procedure={procedure}
                            index={idx}
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
                                    changes, our expert team guides you every
                                    step of the way.
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

            {/* Why Choose Us Section */}
            <WhyChooseSection />

            {/* FAQ Section */}
            <CategorizedFAQ
                categories={faqCategoriesProcedures}
                faqData={faqDataProcedures}
                title='Questions About'
                subtitle='Your Transformation'
                description='We understand that considering plastic surgery is a significant decision. Browse our comprehensive FAQ organized by topic, or call us directly for personalized guidance.'
                badge='Expert Answers'
                variant='default'
                showBackgroundDecoration={true}
                ctaConfig={{
                    title: 'Still have questions?',
                    description:
                        'Our Specialists are ready to guide you through every step of your journey.',
                    buttonText: 'Call Now',
                    phoneNumber: siteConfig.contact.phone.replace(/\D/g, ''),
                }}
            />

            {/* CTA Section - Luxury Variant */}
            <CTASection
                variant='luxury'
                eyebrow='Your Journey Starts Here'
                heading='Your Confidence Deserves This'
                description="Taking this step takes courage. Our board-certified surgeons and dedicated specialists are here to guide you through a personalized consultation — completely free, with no pressure. Just clarity on your options and what's possible for you."
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
                        label: 'Board-Certified Surgeons',
                    },
                    {
                        icon: <Shield className='h-5 w-5' />,
                        label: 'Accredited Facility',
                    },
                    {
                        icon: <Users className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.patients ?? '5,000+'} Happy Patients`,
                    },
                    {
                        icon: <Building2 className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.years ?? '15+'} Years Experience`,
                    },
                ]}
            />
        </>
    )
}
