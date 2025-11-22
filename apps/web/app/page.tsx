import { Target, Zap, Shield, Rocket, Users, BarChart } from 'lucide-react'
import { Metadata } from 'next'

import { HeroSection } from '@/components/sections/home/hero-section.component'
import { FeaturesSection } from '@/components/sections/home/features-section.component'
import { ServicesPreviewSection } from '@/components/sections/home/services-preview-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Homepage Metadata
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: {
        default: siteConfig.business.name,
        template: `%s | ${siteConfig.business.name}`,
    },
    description: siteConfig.business.description,
})

/**
 * Homepage Component
 *
 * The main landing page of the website.
 * Modularized using section components for easy customization.
 */
export default function Page() {
    return (
        <div className='flex w-full flex-col'>
            {/* 
              1. HERO SECTION
              The first impression. Configure headline, subheadline, and CTAs.
            */}
            <HeroSection
                headline={siteConfig.business.tagline ?? ''}
                subheadline={siteConfig.business.description}
                badge='Welcome to Our Platform'
                primaryCTA={{
                    text: 'Get Started',
                    href: '/contact',
                }}
                secondaryCTA={{
                    text: 'Learn More',
                    href: '/about',
                }}
                image={{
                    src: '/images/hero.jpg', // Ensure this image exists or update path
                    alt: 'Hero Image',
                    priority: true,
                }}
            />

            {/* 
              2. FEATURES SECTION
              Highlight key benefits or features of your product/service.
            */}
            <FeaturesSection
                title='Why Choose Us'
                description='We deliver exceptional results through our core values and expertise.'
                columns={3}
                features={[
                    {
                        icon: Rocket,
                        title: 'High Performance',
                        description:
                            'Built for speed and efficiency to keep your business moving forward.',
                    },
                    {
                        icon: Shield,
                        title: 'Secure & Reliable',
                        description:
                            'Enterprise-grade security ensures your data is always protected.',
                    },
                    {
                        icon: Zap,
                        title: 'Instant Setup',
                        description:
                            'Get up and running in minutes with our streamlined onboarding.',
                    },
                    {
                        icon: Users,
                        title: 'Team Collaboration',
                        description:
                            'Designed to help your team work better together, anywhere.',
                    },
                    {
                        icon: BarChart,
                        title: 'Advanced Analytics',
                        description:
                            'Gain deep insights into your performance with detailed reporting.',
                    },
                    {
                        icon: Target,
                        title: 'Goal Oriented',
                        description:
                            'We help you stay focused on hitting your key performance indicators.',
                    },
                ]}
            />

            {/* 
              3. SERVICES PREVIEW
              Showcase your offerings. Content comes from /lib/data/services/
            */}
            <ServicesPreviewSection
                title='Our Services'
                description='Comprehensive solutions tailored to your needs.'
                variant='muted'
                maxServices={3}
            />

            {/* 
              4. FAQ SECTION
              Address common questions to build trust.
            */}
            <FAQComponent
                title='Frequently Asked Questions'
                description='Everything you need to know about our platform.'
                faqs={[
                    {
                        question: 'How do I get started?',
                        answer: 'Simply click the "Get Started" button and follow the onboarding process. It takes less than 5 minutes.',
                    },
                    {
                        question: 'What payment methods do you accept?',
                        answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.',
                    },
                    {
                        question: 'Can I cancel anytime?',
                        answer: 'Yes, you can cancel your subscription at any time with no hidden fees.',
                    },
                    {
                        question: 'Do you offer support?',
                        answer: 'We provide 24/7 customer support via email and chat for all plans.',
                    },
                ]}
            />

            {/* 
              5. CTA SECTION
              Final call to action to convert visitors.
            */}
            <CTASection
                heading='Ready to Transform Your Business?'
                description='Join thousands of satisfied customers who trust us with their success.'
                variant='accent'
                primaryButton={{
                    text: 'Start Your Free Trial',
                    href: '/contact',
                }}
                secondaryButton={{
                    text: 'Contact Sales',
                    href: '/contact',
                    variant: 'outline',
                }}
            />
        </div>
    )
}
