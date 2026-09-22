/**
 * Patient Evaluation Page
 *
 * Hosts the Loquent "Atrium" patient intake & evaluation experience, letting
 * prospective patients complete a private, guided evaluation so our surgeons
 * can prepare a personalized plan ahead of the consultation.
 *
 * URL: /evaluation
 *
 * SEO-optimized for:
 * - "plastic surgery evaluation miami"
 * - "virtual surgical consultation intake"
 */
import { WebPageSchema } from '@workspace/seo/react'
import { Award, Clock, Lock, ShieldCheck } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { AtriumEmbed } from '@/components/evaluation/atrium-embed.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const pageUrl = `${seoConfig.siteUrl}/evaluation`
const pageTitle = 'Patient Evaluation | Miami Plastic Surgery | Alluring'
const pageDescription =
    'Complete your private, no-obligation plastic surgery evaluation online. Share your goals so our board-certified Miami surgeons can prepare a personalized plan before your consultation.'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/evaluation',
    title: pageTitle,
    description: pageDescription,

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description: pageDescription,
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Patient Evaluation - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

/** Trust signals shown beneath the hero headline. */
const trustSignals = [
    { icon: ShieldCheck, label: 'Board-certified surgeons' },
    { icon: Lock, label: 'Private & secure' },
    { icon: Clock, label: 'Takes about 5 minutes' },
    { icon: Award, label: 'No cost, no obligation' },
] as const

/** Steps shown after the evaluation to set expectations. */
const nextSteps = [
    {
        step: '01',
        title: 'Complete your evaluation',
        description:
            'Answer a few guided questions about your goals, health, and the results you have in mind — at your own pace, in English or Spanish.',
    },
    {
        step: '02',
        title: 'Our surgeons review it',
        description:
            'A board-certified surgeon reviews your responses so your consultation starts with a clear, personalized understanding of your case.',
    },
    {
        step: '03',
        title: 'Your personalized consultation',
        description:
            'We reach out to schedule a consultation and walk you through recommendations, timing, and flexible financing options.',
    },
] as const

export default function EvaluationPage() {
    return (
        <>
            <WebPageSchema
                name={`Patient Evaluation - ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={pageDescription}
            />

            <ContainerLayout as='main' noPaddingTop noPadding size='full'>
                {/* Hero */}
                <SectionContainer
                    variant='subtle'
                    paddingY='pt-32 pb-12 lg:pt-40 lg:pb-16'
                    ariaLabel='Patient evaluation introduction'
                >
                    <ContentWrapper size='md' className='text-center'>
                        <span className='border-gold-300/60 bg-gold-50/60 text-gold-700 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium tracking-wide'>
                            Virtual Evaluation
                        </span>
                        <h1 className='mt-6 font-serif text-4xl font-semibold text-stone-900 sm:text-5xl lg:text-6xl'>
                            Your Personal Surgical Evaluation
                        </h1>
                        <p className='mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600'>
                            Take a few private minutes to share your goals. Your
                            responses help our board-certified surgeons prepare
                            a personalized plan — so your consultation is
                            focused entirely on you.
                        </p>

                        {/* Trust signals */}
                        <ul className='mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3'>
                            {trustSignals.map(({ icon: Icon, label }) => (
                                <li
                                    key={label}
                                    className='flex items-center gap-2 text-sm font-medium text-stone-700'
                                >
                                    <Icon className='text-gold-600 h-4 w-4' />
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </ContentWrapper>
                </SectionContainer>

                {/* Atrium evaluation embed */}
                <SectionContainer
                    variant='default'
                    paddingY='pb-16 lg:pb-24'
                    ariaLabel='Begin your evaluation'
                >
                    <ContentWrapper size='lg'>
                        <AtriumEmbed
                            id='evaluation'
                            title='Alluring Patient Intake & Evaluation'
                        />
                    </ContentWrapper>
                </SectionContainer>

                {/* What happens next */}
                <SectionContainer variant='muted' ariaLabel='What happens next'>
                    <ContentWrapper size='lg'>
                        <SectionHeader
                            badge='What Happens Next'
                            title='A simple path to your consultation'
                            description='No pressure and no surprises — just a clear, personal process from your first answer to your surgical plan.'
                            align='center'
                        />

                        <ol className='mt-14 grid gap-8 md:grid-cols-3'>
                            {nextSteps.map(({ step, title, description }) => (
                                <li
                                    key={step}
                                    className='rounded-2xl border border-stone-200/70 bg-white/70 p-8 shadow-sm backdrop-blur-sm'
                                >
                                    <span className='text-gold-500/80 font-serif text-4xl font-semibold'>
                                        {step}
                                    </span>
                                    <h3 className='mt-4 font-serif text-xl font-semibold text-stone-900'>
                                        {title}
                                    </h3>
                                    <p className='mt-3 leading-relaxed text-stone-600'>
                                        {description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </ContentWrapper>
                </SectionContainer>

                {/* Final CTA */}
                <CTASection
                    id='evaluation-cta'
                    variant='luxury'
                    eyebrow='Prefer to talk first?'
                    heading='We are here whenever you are ready'
                    description='Have a question before you begin? Our patient concierge is happy to help — no pressure, just honest answers.'
                    primaryButton={{
                        text: 'Start My Evaluation',
                        href: '#evaluation',
                    }}
                    secondaryButton={{
                        text: 'Call Us',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    size='lg'
                />
            </ContainerLayout>
        </>
    )
}
