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
            <section className='from-muted/50 to-background relative bg-gradient-to-b py-20 lg:py-28'>
                <ContainerLayout>
                    <div className='mx-auto max-w-3xl text-center'>
                        <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
                            {procedure.title}
                        </h1>
                        {procedure.heroSubtitle && (
                            <p className='text-muted-foreground mb-8 text-lg sm:text-xl'>
                                {procedure.heroSubtitle}
                            </p>
                        )}
                        <Link
                            href='/contact'
                            className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors'
                        >
                            Schedule Your FREE Consultation
                            <ArrowRight className='h-5 w-5' />
                        </Link>
                    </div>
                </ContainerLayout>
            </section>

            {/* Content Section - Markdown or Fallback Introduction */}
            {procedure.content ? (
                <section className='py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='prose prose-neutral prose-lg prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-3xl prose-h1:leading-tight prose-h2:text-2xl prose-h2:leading-snug prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-10 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-muted-foreground prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:bg-muted/30 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-4 prose-pre:my-6 prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-a:text-foreground prose-a:underline prose-a:decoration-muted-foreground/50 prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-strong:text-foreground prose-strong:font-semibold mx-auto max-w-none'>
                            <PostMarkdown content={procedure.content} />
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
                <section className='py-16 lg:py-24'>
                    <ContainerLayout>
                        <h2 className='mb-12 text-center text-3xl font-bold sm:text-4xl'>
                            Explore Other Procedures to Enhance Your Beauty
                        </h2>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {relatedProcedures.map((relatedProcedure) => (
                                <Link
                                    key={relatedProcedure.slug}
                                    href={`/procedures/${relatedProcedure.slug}`}
                                    className='group border-border bg-card hover:border-primary relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-lg'
                                >
                                    <div className='mb-4'>
                                        <h3 className='group-hover:text-primary mb-3 text-xl font-semibold'>
                                            {relatedProcedure.title}
                                        </h3>
                                        <p className='text-muted-foreground text-sm'>
                                            {relatedProcedure.shortDescription ||
                                                relatedProcedure.description}
                                        </p>
                                    </div>
                                    <div className='text-primary flex items-center gap-2 text-sm font-medium'>
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
        </>
    )
}
