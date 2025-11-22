/**
 * SEO Optimization Service Data
 *
 * Service definition for highlighting built-in SEO features and blog system.
 * Content aligned with Keel brand guidelines: clear, direct, production-focused.
 */

import type { Service } from '@/lib/types/services/service.type'

export const seoOptimizationService: Service = {
    slug: 'seo-optimization',
    title: 'SEO Optimization',
    excerpt:
        'Complete SEO optimization built into every Keel website. Technical SEO, structured data, blog system, analytics. Rank higher on Google.',
    description:
        'Keel includes enterprise-level SEO features out of the box. Technical SEO best practices, Schema.org structured data, automatic sitemaps, and a complete blog system for content marketing. Analytics integration tracks your success. No plugins or add-ons needed.',
    category: 'marketing',
    categoryLabel: 'Marketing',
    iconConfig: {
        cardIconPath: '/images/services/icons/chart-icon.svg',
        heroImagePath: '/images/services/digital-marketing.jpg',
        imageAlt: 'SEO dashboard showing analytics and search rankings',
    },
    features: [
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'Technical SEO Built-In',
            description:
                'Meta tags, OpenGraph, Twitter Cards, canonical URLs. Automatic sitemap.xml and robots.txt. Fast page loads and Core Web Vitals optimization. Mobile-first responsive design.',
            ariaLabel: 'Learn about technical SEO',
        },
        {
            iconPath: '/images/services/icons/code-icon.svg',
            title: 'Schema.org Structured Data',
            description:
                'JSON-LD structured data for Organization, WebSite, WebPage, BlogPosting, and BreadcrumbList. Helps search engines understand your content. Rich results in search.',
            ariaLabel: 'Learn about structured data',
        },
        {
            iconPath: '/images/services/icons/globe-icon.svg',
            title: 'Complete Blog System',
            description:
                'Full-featured blog with categories, tags, and featured images. SEO-optimized post pages with automatic meta tags. RSS feed generation. Author information and publish dates.',
            ariaLabel: 'Learn about blog system',
        },
        {
            iconPath: '/images/services/icons/target-icon.svg',
            title: 'Content Management',
            description:
                'Type-safe content system with Drizzle ORM and PostgreSQL. Blog admin interface for creating and editing posts. Rich text editor with markdown support.',
            ariaLabel: 'Learn about content management',
        },
        {
            iconPath: '/images/services/icons/zap-icon.svg',
            title: 'Analytics Integration',
            description:
                'Google Analytics 4, Microsoft Clarity, Google Tag Manager, and Facebook Pixel ready. Track page views, conversions, and user behavior. Privacy-focused cookie consent.',
            ariaLabel: 'Learn about analytics',
        },
        {
            iconPath: '/images/services/icons/shield-icon.svg',
            title: 'SEO Utilities',
            description:
                'Built-in SEO utility functions for meta tags, OpenGraph images, structured data generation. Centralized SEO configuration. Easy to customize per page.',
            ariaLabel: 'Learn about SEO utilities',
        },
    ],
    benefits: [
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'Rank Higher on Google',
            description:
                'Technical SEO best practices improve your search rankings. Structured data helps Google understand your site. Fast performance boosts Core Web Vitals scores.',
        },
        {
            iconPath: '/images/services/icons/globe-icon.svg',
            title: 'Content Marketing Ready',
            description:
                'Built-in blog system supports your content strategy. Categories and tags organize content. RSS feed for subscribers. Social sharing optimized with OpenGraph.',
        },
        {
            iconPath: '/images/services/icons/target-icon.svg',
            title: 'Track Your Success',
            description:
                'Multiple analytics platforms track traffic and conversions. See which content performs best. Understand user behavior. Make data-driven improvements.',
        },
        {
            iconPath: '/images/services/icons/zap-icon.svg',
            title: 'No SEO Plugins Needed',
            description:
                'Everything built into the template. No WordPress SEO plugins. No third-party dependencies. Full control over your SEO implementation.',
        },
    ],
    process: [
        {
            step: 1,
            title: 'SEO Configuration',
            description:
                'Configure site-wide SEO settings in site-config.ts. Set site name, description, social media handles. Add Google Analytics and other tracking IDs.',
            iconPath: '/images/services/icons/target-icon.svg',
        },
        {
            step: 2,
            title: 'Content Optimization',
            description:
                'Write SEO-friendly content using built-in guidelines. Optimize page titles and meta descriptions. Use heading hierarchy. Add alt text to images.',
            iconPath: '/images/services/icons/palette-icon.svg',
        },
        {
            step: 3,
            title: 'Blog Publishing',
            description:
                'Create blog posts through admin interface. Add categories and tags. Upload featured images. Schedule or publish immediately. Automatic sitemap updates.',
            iconPath: '/images/services/icons/code-icon.svg',
        },
        {
            step: 4,
            title: 'Monitor & Improve',
            description:
                'Track performance with Google Analytics and Search Console. Monitor rankings. Analyze user behavior. Refine content strategy based on data.',
            iconPath: '/images/services/icons/chart-icon.svg',
        },
    ],
    gallery: [
        {
            url: '/images/services/web-development-workspace.jpg',
            alt: 'SEO configuration dashboard with meta tags and structured data',
            caption: 'Comprehensive SEO configuration',
        },
        {
            url: '/images/services/web-development-team.jpg',
            alt: 'Blog system with category and tag management',
            caption: 'Full-featured blog for content marketing',
        },
        {
            url: '/images/services/web-development-mobile.jpg',
            alt: 'Google Analytics dashboard showing traffic growth',
            caption: 'Track performance with multiple analytics tools',
        },
        {
            url: '/images/services/web-development-code-quality.jpg',
            alt: 'Schema.org structured data implementation',
            caption: 'Rich results with structured data',
        },
        {
            url: '/images/services/web-development-ui-design.jpg',
            alt: 'Mobile-responsive SEO-optimized pages',
            caption: 'Mobile-first design boosts rankings',
        },
        {
            url: '/images/services/web-development-success.jpg',
            alt: 'Search engine results showing improved rankings',
            caption: 'Better rankings, more organic traffic',
        },
    ],
    faqs: [
        {
            question: 'What SEO features are included?',
            answer: 'Meta tags, OpenGraph, Twitter Cards, Schema.org structured data, automatic sitemaps, robots.txt, RSS feeds, fast page loads, mobile optimization, and analytics integration.',
        },
        {
            question: 'Do I need SEO plugins?',
            answer: 'No. All SEO features are built into the template code. No WordPress-style plugins needed. You have full control over all SEO elements.',
        },
        {
            question: 'How does the blog system help SEO?',
            answer: 'Regular blog content helps you rank for more keywords. Categories and tags create topic clusters. Internal linking improves site architecture. Fresh content signals active site.',
        },
        {
            question: 'Can I customize SEO for each page?',
            answer: 'Yes. Each page can have unique title, description, OpenGraph image, and structured data. Centralized defaults with per-page overrides available.',
        },
        {
            question: 'What analytics tools are supported?',
            answer: 'Google Analytics 4, Microsoft Clarity, Google Tag Manager, and Facebook Pixel. Easy setup via environment variables. Privacy-focused cookie consent included.',
        },
    ],
    cta: {
        heading: 'Ready to rank higher?',
        description:
            'Start with Keel and get enterprise-level SEO out of the box.',
        primaryButton: {
            text: 'Start building',
            href: '/contact',
        },
        secondaryButton: {
            text: 'View SEO features',
            href: '/docs',
        },
    },
    seo: {
        title: 'SEO Optimization | Built-in Technical SEO',
        description:
            'Complete SEO optimization built into every Keel website. Technical SEO, structured data, blog system, and analytics. Rank higher on Google.',
        keywords: [
            'SEO optimization',
            'website SEO',
            'technical SEO',
            'blog system',
            'content marketing',
            'structured data',
            'schema.org',
        ],
    },
    order: 3,
    isPublished: true,
}
