'use client'

import { Procedure } from '@/lib/types/procedure.type'
import { useState, useRef, useEffect } from 'react'
import { ContainerLayout } from '@/components/container-layout.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SignatureProcedureCard } from '@/components/shared/signature-procedure-card.component'
import { CategoryNav } from './category-nav.component'
import { ProcedureCard } from './procedure-card.component'
import { ProcedureHero } from './procedure-hero.component'
import { FeatureCard } from '@/components/shared/feature-card.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { Shield, UserCheck, HeartHandshake, Star } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion'

interface ProceduresPageContentProps {
    procedures: Procedure[]
}

export function ProceduresPageContent({
    procedures,
}: ProceduresPageContentProps) {
    const [activeCategory, setActiveCategory] = useState('all')
    const [isMounted, setIsMounted] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)

    // Ensure component is mounted before using scroll-based animations
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Filter procedures based on active category
    const filteredProcedures =
        activeCategory === 'all'
            ? procedures
            : procedures.filter((p) => p.category === activeCategory)

    const { scrollYProgress } = useScroll({
        target: isMounted ? targetRef : undefined,
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
                                        containerRef={
                                            targetRef as React.RefObject<HTMLDivElement>
                                        }
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

            {/* Why Choose Us Section */}
            <section className='bg-stone-50 py-24 lg:py-32'>
                <ContainerLayout>
                    <div className='mb-16 text-center'>
                        <span className='text-gold-500 mb-4 block text-sm font-bold tracking-[0.2em] uppercase'>
                            The Alluring Difference
                        </span>
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            Why Choose Alluring Plastic Surgery?
                        </h2>
                        <p className='mx-auto max-w-2xl text-xl font-light text-stone-600'>
                            Experience the difference of world-class care,
                            safety, and exceptional results in a luxury setting.
                        </p>
                    </div>

                    <div className='mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
                        <FeatureCard
                            icon={UserCheck}
                            title='Board-Certified Surgeons'
                            description='Led by Dr. Victoria Karlinsky, our team consists of highly skilled, board-certified surgeons.'
                            iconVariant='accent' // Using accent which maps to gold typically or custom
                            className='border-stone-100 bg-white'
                        />
                        <FeatureCard
                            icon={Shield}
                            title='State-of-the-Art Facility'
                            description='Our cutting-edge facilities ensure your procedure is performed with the highest level of safety.'
                            iconVariant='accent'
                            className='border-stone-100 bg-white'
                        />
                        <FeatureCard
                            icon={HeartHandshake}
                            title='Personalized Care'
                            description='Your journey is unique. We provide a tailored approach to meet your specific aesthetic goals.'
                            iconVariant='accent'
                            className='border-stone-100 bg-white'
                        />
                        <FeatureCard
                            icon={Star}
                            title='Natural Results'
                            description='We prioritize results that look and feel natural, enhancing your inherent beauty.'
                            iconVariant='accent'
                            className='border-stone-100 bg-white'
                        />
                    </div>
                </ContainerLayout>
            </section>

            {/* FAQ Section */}
            <section className='py-24 lg:py-32'>
                <ContainerLayout>
                    <div className='grid gap-16 lg:grid-cols-2'>
                        <div>
                            <span className='text-gold-500 mb-4 block text-sm font-bold tracking-[0.2em] uppercase'>
                                Common Questions
                            </span>
                            <h2 className='mb-8 font-serif text-4xl text-stone-900'>
                                Frequently Asked Questions
                            </h2>
                            <p className='mb-8 text-lg leading-relaxed font-light text-stone-600'>
                                We understand that considering plastic surgery
                                is a big decision. Here are answers to some of
                                the most common questions our patients ask. If
                                you don&apos;t see your question here, please
                                don&apos;t hesitate to contact us.
                            </p>
                        </div>

                        <Accordion type='single' collapsible className='w-full'>
                            <AccordionItem
                                value='item-1'
                                className='border-stone-200'
                            >
                                <AccordionTrigger className='hover:text-gold-600 font-serif text-lg text-stone-900'>
                                    What types of procedures do you specialize
                                    in?
                                </AccordionTrigger>
                                <AccordionContent className='leading-relaxed font-light text-stone-600'>
                                    We specialize in a comprehensive range of
                                    cosmetic procedures including Breast
                                    Augmentation, Brazilian Butt Lift (BBL),
                                    Tummy Tucks, Mommy Makeovers, Liposuction,
                                    Rhinoplasty, and Facelifts.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem
                                value='item-2'
                                className='border-stone-200'
                            >
                                <AccordionTrigger className='hover:text-gold-600 font-serif text-lg text-stone-900'>
                                    Is Dr. Karlinsky board-certified?
                                </AccordionTrigger>
                                <AccordionContent className='leading-relaxed font-light text-stone-600'>
                                    Yes, Dr. Victoria Karlinsky is a
                                    board-certified cosmetic and general surgeon
                                    and a Fellow of the American College of
                                    Surgeons (FACS). She is also a member of the
                                    American Academy of Cosmetic Surgery.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem
                                value='item-3'
                                className='border-stone-200'
                            >
                                <AccordionTrigger className='hover:text-gold-600 font-serif text-lg text-stone-900'>
                                    Do you offer financing options?
                                </AccordionTrigger>
                                <AccordionContent className='leading-relaxed font-light text-stone-600'>
                                    Yes, we believe luxury surgeries should be
                                    accessible. We offer flexible financing
                                    options to help you manage the cost of your
                                    procedure. Our team can assist you in
                                    finding a plan that fits your budget.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem
                                value='item-4'
                                className='border-stone-200'
                            >
                                <AccordionTrigger className='hover:text-gold-600 font-serif text-lg text-stone-900'>
                                    How do I book a consultation?
                                </AccordionTrigger>
                                <AccordionContent className='leading-relaxed font-light text-stone-600'>
                                    Booking a consultation is easy! You can fill
                                    out our contact form, call us directly, or
                                    request a virtual consultation. We&apos;ll
                                    discuss your goals and help you take the
                                    next step.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </ContainerLayout>
            </section>

            {/* CTA Section */}
            <CTASection
                heading='Ready to Begin Your Transformation?'
                description='Schedule a free consultation with our expert surgeons to discuss your goals and create a personalized treatment plan.'
                primaryButton={{
                    text: 'Schedule Consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
            />
        </>
    )
}
