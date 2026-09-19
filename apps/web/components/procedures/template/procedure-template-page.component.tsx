import { ContainerLayout } from '@/components/container-layout.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { LastUpdated } from '@/components/shared/last-updated.component'
import { QuickAnswer } from '@/components/shared/quick-answer.component'
import { ProcedureBeforeAfterSection } from '@/components/shared/procedure-before-after-section.component'
import { ProcedureMarkdown } from '@/components/procedures/procedure-markdown.component'
import { siteConfig } from '@/lib/data/site-config'
import { ProcedureDetailHero } from '@/components/procedures/procedure-detail-hero.component'
import { ProcedureStats } from '@/components/procedures/procedure-stats.component'
import { ProcedureBenefits } from '@/components/procedures/procedure-benefits.component'
import { ProcedureProcess } from '@/components/procedures/procedure-process.component'
import { ProcedureCard } from '@/components/procedures/procedure-card.component'
import { ProcedureIntro } from '@/components/procedures/procedure-intro.component'
import { ProcedureGallerySection } from '@/components/procedures/procedure-gallery-section.component'
import { ProcedureConsultationForm } from '@/components/procedures/procedure-consultation-form.component'
import { ProcedurePricing } from '@/components/procedures/procedure-pricing.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

/**
 * Maps procedure slugs to their corresponding blog category slugs
 * Procedures without a matching category will show general blog posts
 */
const procedureToBlogCategory: Record<string, string> = {
    'breast-augmentation-miami': 'breast-augmentation',
    'breast-lift-miami': 'breast-augmentation', // Related breast content
    'breast-reduction-miami': 'breast-reduction',
    'liposuction-miami': 'liposuction',
    'brazilian-butt-lift-bbl-miami': 'bbl',
    'tummy-tuck-miami': 'tummy-tuck',
    'mommy-makeover-miami': 'mommy-makeover',
    // facelift-miami and blepharoplasty-miami have no matching category
}

/**
 * The shared procedure page body: one fixed sequence of sections, driven by
 * the procedure's data file.
 *
 * Every procedure renders through this unless it registers a page module of
 * its own in `procedure-page-registry.ts`. Moved here unchanged from
 * `app/procedures/[slug]/page.tsx` (#255); the route keeps the metadata, the
 * static params and the structured-data graph.
 */
export function ProcedureTemplatePage({
    procedure,
    relatedProcedures,
}: ProcedurePageModuleProps) {
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

            {/* Intro Section */}
            <ProcedureIntro
                title={procedure.title}
                description={
                    procedure.shortDescription || procedure.description
                }
            />

            {/* Quick Answer - AI Citation Optimized */}
            {procedure.quickAnswer && (
                <section className='bg-stone-50 py-16 lg:py-20'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-2xl'>
                            <QuickAnswer
                                question={procedure.quickAnswer.question}
                                answer={procedure.quickAnswer.answer}
                                details={procedure.quickAnswer.details}
                                headingLevel='h2'
                                variant='featured'
                            />
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* Freshness signal. Only when there is a real date to show — it
                printed today's date for any procedure without one, which is a
                freshness claim the content does not support (#250). */}
            {procedure.dateModified && (
                <div className='bg-stone-50 py-4'>
                    <ContainerLayout>
                        <div className='flex justify-center'>
                            <LastUpdated
                                date={procedure.dateModified}
                                variant='badge'
                            />
                        </div>
                    </ContainerLayout>
                </div>
            )}

            {/* Pricing — cost is the highest-intent question a procedure query
                carries, so it sits above the fold-adjacent content rather than
                inside the markdown body. */}
            {procedure.pricing && (
                <ProcedurePricing
                    procedureTitle={procedure.title}
                    pricing={procedure.pricing}
                />
            )}

            {/* Benefits Section */}
            {procedure.benefits && (
                <ProcedureBenefits benefits={procedure.benefits} />
            )}

            {/* Before & After Results Section */}
            <ProcedureBeforeAfterSection
                procedureSlug={procedure.slug}
                procedureTitle={procedure.title}
            />

            {/* Gallery Section */}
            <ProcedureGallerySection
                procedureSlug={procedure.slug}
                procedureTitle={procedure.title}
            />

            {/* Google Reviews - Social Proof */}
            <GoogleReviews
                title={`What Our ${procedure.title} Patients Say`}
                subtitle='Real reviews from real patients'
                limit={3}
                featuredOnly={true}
                showGoogleLink={false}
                showViewAllButton={true}
                includeSchema={true}
            />

            {/* Process Section */}
            {procedure.process && (
                <ProcedureProcess steps={procedure.process} />
            )}

            {/* Lead Capture Form */}
            <ProcedureConsultationForm
                procedureSlug={procedure.slug}
                procedureTitle={procedure.title}
            />

            {/* Main Content Section - Markdown */}
            {procedure.content ? (
                <section className='bg-white py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <div className='prose prose-stone prose-lg prose-headings:font-serif prose-headings:font-medium prose-p:font-light prose-p:leading-relaxed prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline mx-auto'>
                                <ProcedureMarkdown
                                    content={procedure.content}
                                    contentImages={procedure.contentImages}
                                />
                            </div>
                        </div>
                    </ContainerLayout>
                </section>
            ) : (
                <section className='py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <p className='text-muted-foreground text-lg leading-relaxed'>
                                At {siteConfig.business.name}, we take pride in
                                delivering life-changing results that enhance
                                our patients&apos; natural beauty. Explore our
                                gallery of real patient transformations to see
                                the incredible outcomes from procedures like
                                Brazilian Butt Lift, Breast Augmentation,
                                Facelift, and more. Each photo reflects the
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
                    variant='muted'
                    includeSchema={false}
                />
            )}

            {/* Blog Posts Section */}
            <BlogPostsSection
                categorySlug={procedureToBlogCategory[procedure.slug]}
                title={`${procedure.title} Insights`}
                description={`Expert advice, recovery tips, and patient stories about ${procedure.title.toLowerCase()}`}
                badge='From Our Blog'
                variant='default'
                limit={3}
                columns={3}
            />

            {/* Related Procedures Section */}
            {relatedProcedures.length > 0 && (
                <section className='bg-stone-50 py-16 lg:py-24'>
                    <ContainerLayout>
                        <h2 className='mb-12 text-center font-serif text-3xl text-stone-900 sm:text-4xl'>
                            Explore Other Procedures
                        </h2>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {relatedProcedures.map((relatedProcedure) => (
                                <ProcedureCard
                                    key={relatedProcedure.slug}
                                    procedure={relatedProcedure}
                                    includeSchema={false}
                                />
                            ))}
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* CTA Section */}
            <CTASection
                heading='Ready to Transform Your Look?'
                description='Schedule a free consultation with our expert surgeons to discuss your goals and create a personalized treatment plan.'
                backgroundImage={procedure.image}
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
