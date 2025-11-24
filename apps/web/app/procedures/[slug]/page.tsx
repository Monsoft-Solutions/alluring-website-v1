import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { procedures, getProcedureBySlug } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { ProcedureDetailHero } from '@/components/procedures/procedure-detail-hero.component'
import { ProcedureStats } from '@/components/procedures/procedure-stats.component'
import { ProcedureBenefits } from '@/components/procedures/procedure-benefits.component'
import { ProcedureProcess } from '@/components/procedures/procedure-process.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'

interface ProcedurePageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    return procedures.map((procedure) => ({
        slug: procedure.slug,
    }))
}

export async function generateMetadata(
    props: ProcedurePageProps
): Promise<Metadata> {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        return {
            title: 'Procedure Not Found',
        }
    }

    return {
        title: procedure.title,
        description: procedure.description,
        keywords: procedure.keywords,
    }
}

export default async function ProcedurePage(props: ProcedurePageProps) {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        notFound()
    }

    // Filter out the current procedure from related procedures
    const relatedProcedures = procedures
        .filter(
            (p) =>
                p.category === procedure.category && p.slug !== procedure.slug
        )
        .slice(0, 3)

    return (
        <>
            {/* Hero Section */}
            <ProcedureDetailHero
                title={procedure.title}
                subtitle={procedure.heroSubtitle || procedure.shortDescription}
                image={procedure.image}
            />

            {/* Stats Section - Only render if data exists */}
            {procedure.quickStats && (
                <ProcedureStats stats={procedure.quickStats} />
            )}

            {/* Intro Content (First paragraph of description if possible, or short desc) */}
            <section className='bg-white py-16 lg:py-24'>
                <ContainerLayout>
                    <div className='mx-auto max-w-3xl text-center'>
                        <h2 className='mb-6 font-serif text-3xl text-stone-900 md:text-4xl'>
                            Refine Your Beauty
                        </h2>
                        <p className='text-lg leading-relaxed font-light text-stone-600 md:text-xl'>
                            {procedure.shortDescription ||
                                procedure.description}
                        </p>
                    </div>
                </ContainerLayout>
            </section>

            {/* Benefits Section */}
            {procedure.benefits && (
                <ProcedureBenefits benefits={procedure.benefits} />
            )}

            {/* Process Section */}
            {procedure.process && (
                <ProcedureProcess steps={procedure.process} />
            )}

            {/* Main Content Section - Markdown */}
            {procedure.content ? (
                <section className='bg-stone-50 py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <div className='prose prose-stone prose-lg prose-headings:font-serif prose-headings:font-medium prose-p:font-light prose-p:leading-relaxed prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline mx-auto'>
                                <PostMarkdown content={procedure.content} />
                            </div>
                        </div>
                    </ContainerLayout>
                </section>
            ) : (
                <section className='py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <p className='text-muted-foreground text-lg leading-relaxed'>
                                At Alluring Plastic Surgery, we take pride in
                                delivering life-changing results that enhance
                                our patients&apos; natural beauty. Explore our
                                gallery of real patient transformations to see
                                the incredible outcomes from procedures like
                                Brazilian Butt Lift, Breast Augmentation,
                                Rhinoplasty, and more. Each photo reflects the
                                personalized care and attention to detail we
                                bring to every surgery.
                            </p>
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* FAQs Section */}
            {procedure.faqs && procedure.faqs.length > 0 && (
                <FAQComponent
                    faqs={procedure.faqs}
                    title='Common Questions About Your Procedure'
                    variant='default'
                />
            )}

            {/* Related Procedures Section */}
            {relatedProcedures.length > 0 && (
                <section className='bg-stone-50 py-16 lg:py-24'>
                    <ContainerLayout>
                        <h2 className='mb-12 text-center font-serif text-3xl text-stone-900 sm:text-4xl'>
                            Explore Other Procedures
                        </h2>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {relatedProcedures.map((relatedProcedure) => (
                                <Link
                                    key={relatedProcedure.slug}
                                    href={`/procedures/${relatedProcedure.slug}`}
                                    className='group hover:border-gold-400 relative overflow-hidden rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all hover:shadow-md'
                                >
                                    <div className='mb-4'>
                                        <h3 className='group-hover:text-gold-600 mb-3 font-serif text-xl font-medium text-stone-900 transition-colors'>
                                            {relatedProcedure.title}
                                        </h3>
                                        <p className='line-clamp-3 text-sm leading-relaxed text-stone-500'>
                                            {relatedProcedure.shortDescription ||
                                                relatedProcedure.description}
                                        </p>
                                    </div>
                                    <div className='text-gold-500 flex items-center gap-2 text-sm font-bold tracking-wider uppercase'>
                                        Learn More
                                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* CTA Section */}
            <CTASection
                heading='Ready to Transform Your Look?'
                description='Schedule a free consultation with our expert surgeons to discuss your goals and create a personalized treatment plan.'
                primaryButton={{
                    text: 'Schedule Consultation',
                    href: '/contact',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
            />

            <MobileCallButton />
        </>
    )
}
