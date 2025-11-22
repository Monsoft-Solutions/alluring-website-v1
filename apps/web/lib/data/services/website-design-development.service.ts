/**
 * Website Design & Development Service Data
 *
 * Service definition for building new production websites using the Keel template.
 * Content aligned with Keel brand guidelines: clear, direct, production-focused.
 */

import type { Service } from '@/lib/types/services/service.type'

export const websiteDesignDevelopmentService: Service = {
    slug: 'website-design-development',
    title: 'Website Design & Development',
    excerpt:
        'Professional website design and development with Next.js 15. Production-ready template with blog, SEO, analytics, and contact forms. Launch in hours, not weeks.',
    description:
        'Build production websites using our Next.js template. Includes everything you need: responsive design, blog system, SEO optimization, analytics integration, contact forms, and admin dashboard. Type-safe from database to UI. Deploy to Vercel in minutes.',
    category: 'development',
    categoryLabel: 'Development',
    iconConfig: {
        cardIconPath: '/images/services/icons/code-icon.svg',
        heroImagePath: '/images/services/web-development.jpg',
        imageAlt:
            'Modern web development environment with Next.js and TypeScript code',
    },
    features: [
        {
            iconPath: '/images/services/icons/code-icon.svg',
            title: 'Modern Tech Stack',
            description:
                'Built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. PostgreSQL database with Drizzle ORM. Type-safe across the entire stack.',
            ariaLabel: 'Learn about modern tech stack',
        },
        {
            iconPath: '/images/services/icons/globe-icon.svg',
            title: 'Complete Blog System',
            description:
                'Full-featured blog with categories, tags, featured images, and rich text editor. Optimized for SEO with automatic sitemap and RSS feed generation.',
            ariaLabel: 'Learn about blog system',
        },
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'SEO Ready',
            description:
                'Meta tags, OpenGraph, Twitter Cards, Schema.org structured data. Automatic sitemap generation. Robots.txt configuration. Built-in SEO utilities.',
            ariaLabel: 'Learn about SEO features',
        },
        {
            iconPath: '/images/services/icons/target-icon.svg',
            title: 'Analytics Integration',
            description:
                'Google Analytics, Microsoft Clarity, Google Tag Manager, Facebook Pixel. Privacy-focused cookie consent banner. Track conversions and user behavior.',
            ariaLabel: 'Learn about analytics integration',
        },
        {
            iconPath: '/images/services/icons/smartphone-icon.svg',
            title: 'Contact System',
            description:
                'Working contact forms with email notifications via Resend. Form validation, spam protection, and customizable email templates included.',
            ariaLabel: 'Learn about contact system',
        },
        {
            iconPath: '/images/services/icons/shield-icon.svg',
            title: 'Production Ready',
            description:
                'Environment validation, error handling, logging, monitoring. Optimized for Vercel deployment. Documentation included for all features.',
            ariaLabel: 'Learn about production features',
        },
    ],
    benefits: [
        {
            iconPath: '/images/services/icons/zap-icon.svg',
            title: 'Launch in Hours',
            description:
                'Skip months of development. Clone, customize, deploy. Working website ready for production in hours. Full documentation guides you through setup.',
        },
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'Lower Development Costs',
            description:
                'No need to build from scratch. Save 100+ hours of development time. One-time purchase, no recurring template fees. Use for unlimited projects.',
        },
        {
            iconPath: '/images/services/icons/shield-icon.svg',
            title: 'Built-in Best Practices',
            description:
                'SEO optimization, performance tuning, accessibility standards, and security best practices built in. No need to research and implement each feature.',
        },
        {
            iconPath: '/images/services/icons/code-icon.svg',
            title: 'Type-Safe Code',
            description:
                'TypeScript everywhere. Catch errors at compile time, not runtime. Better IDE support, refactoring confidence, and maintainable codebase.',
        },
    ],
    process: [
        {
            step: 1,
            title: 'Clone & Setup',
            description:
                'Clone the repository. Install dependencies with pnpm. Configure environment variables. Database setup takes 5 minutes.',
            iconPath: '/images/services/icons/code-icon.svg',
        },
        {
            step: 2,
            title: 'Customize Content',
            description:
                'Update site-config.ts with your business information. Customize colors and branding. Add your content and images. All data is centralized.',
            iconPath: '/images/services/icons/palette-icon.svg',
        },
        {
            step: 3,
            title: 'Test Locally',
            description:
                'Run development server. Test all features: blog, contact forms, analytics. Verify SEO metadata and structured data. Use included testing tools.',
            iconPath: '/images/services/icons/target-icon.svg',
        },
        {
            step: 4,
            title: 'Deploy to Production',
            description:
                'Deploy to Vercel with one command. Configure custom domain. Set up production database. Enable monitoring and analytics.',
            iconPath: '/images/services/icons/zap-icon.svg',
        },
    ],
    gallery: [
        {
            url: '/images/services/web-development-workspace.jpg',
            alt: 'Next.js development environment with TypeScript code editor',
            caption: 'Production-ready Next.js template',
        },
        {
            url: '/images/services/web-development-team.jpg',
            alt: 'Modern web application running on multiple devices',
            caption: 'Responsive design on all screen sizes',
        },
        {
            url: '/images/services/web-development-mobile.jpg',
            alt: 'Blog system with rich text editor and content management',
            caption: 'Complete blog system with admin interface',
        },
        {
            url: '/images/services/web-development-code-quality.jpg',
            alt: 'SEO dashboard showing structured data and meta tags',
            caption: 'Built-in SEO optimization and analytics',
        },
        {
            url: '/images/services/web-development-ui-design.jpg',
            alt: 'Contact form with email notification system',
            caption: 'Working contact forms with email integration',
        },
        {
            url: '/images/services/web-development-success.jpg',
            alt: 'Vercel deployment dashboard with build status',
            caption: 'One-click deployment to production',
        },
    ],
    faqs: [
        {
            question: 'What technologies does the template use?',
            answer: 'Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, PostgreSQL with Drizzle ORM, and Vercel Blob for image storage.',
        },
        {
            question: 'Do I need to be a developer to use this?',
            answer: 'You need basic React/Next.js knowledge to customize the template. If you can read TypeScript and use Git, you can use Keel. Full documentation provided.',
        },
        {
            question: 'Can I use this for client projects?',
            answer: 'Yes. Build unlimited websites for yourself or clients. No per-site licensing fees. Attribution appreciated but not required.',
        },
        {
            question: "What's included with the template?",
            answer: 'Complete website with blog, SEO tools, analytics, contact forms, email system, dark mode, and admin features. Plus documentation and setup guides.',
        },
        {
            question: 'How long does setup take?',
            answer: 'Initial setup takes 1-2 hours. Content customization depends on your needs. Most developers have a production-ready site within a day.',
        },
    ],
    cta: {
        heading: 'Ready to build?',
        description:
            'Start with Keel and launch your production website in hours.',
        primaryButton: {
            text: 'Start building',
            href: '/contact',
        },
        secondaryButton: {
            text: 'View documentation',
            href: '/docs',
        },
    },
    seo: {
        title: 'Website Design & Development | Next.js Template',
        description:
            'Professional website design and development with Next.js 15. Production-ready template with blog, SEO, analytics, and contact forms. Launch in hours.',
        keywords: [
            'website design development',
            'Next.js website',
            'production ready website',
            'custom website development',
            'Next.js template',
            'React website template',
            'TypeScript website',
        ],
    },
    order: 1,
    isPublished: true,
}
