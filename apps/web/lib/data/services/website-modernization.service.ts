/**
 * Website Modernization Service Data
 *
 * Service definition for updating existing websites by migrating to Keel template.
 * Content aligned with Keel brand guidelines: clear, direct, production-focused.
 */

import type { Service } from '@/lib/types/services/service.type'

export const websiteModernizationService: Service = {
    slug: 'website-modernization',
    title: 'Website Modernization',
    excerpt:
        'Modernize your outdated website with our Next.js template. Migrate your content to a fast, SEO-optimized, mobile-responsive platform. Keep your domain and branding.',
    description:
        'Transform your outdated website using Keel. We help you migrate existing content, preserve SEO rankings, and modernize your tech stack. Move from WordPress, static HTML, or old frameworks to Next.js. Keep your domain, improve your speed, enhance your SEO.',
    category: 'development',
    categoryLabel: 'Development',
    iconConfig: {
        cardIconPath: '/images/services/icons/shield-icon.svg',
        heroImagePath: '/images/services/ui-ux-design.jpg',
        imageAlt:
            'Website transformation from old design to modern Next.js interface',
    },
    features: [
        {
            iconPath: '/images/services/icons/globe-icon.svg',
            title: 'Content Migration',
            description:
                'Transfer all your existing content: pages, blog posts, images, and files. Preserve URLs to maintain SEO rankings. Structured data migration from any CMS.',
            ariaLabel: 'Learn about content migration',
        },
        {
            iconPath: '/images/services/icons/zap-icon.svg',
            title: 'Modern Performance',
            description:
                'Next.js 15 App Router with server-side rendering. Automatic image optimization. 90+ Lighthouse scores. Faster page loads improve conversions and SEO.',
            ariaLabel: 'Learn about modern performance',
        },
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'SEO Preservation',
            description:
                'Maintain existing rankings with proper redirects. Improved structured data and meta tags. Better mobile experience boosts search visibility.',
            ariaLabel: 'Learn about SEO preservation',
        },
        {
            iconPath: '/images/services/icons/smartphone-icon.svg',
            title: 'Responsive Design',
            description:
                'Mobile-first responsive design works on all devices. Tailwind CSS v4 styling. Dark mode support. Accessible components meet WCAG standards.',
            ariaLabel: 'Learn about responsive design',
        },
        {
            iconPath: '/images/services/icons/code-icon.svg',
            title: 'Easy Content Management',
            description:
                'Type-safe content management in TypeScript files. No database bloat. Version controlled with Git. Easy to update and maintain.',
            ariaLabel: 'Learn about content management',
        },
    ],
    benefits: [
        {
            iconPath: '/images/services/icons/zap-icon.svg',
            title: 'Better Performance',
            description:
                'Modern Next.js performance beats WordPress and old frameworks. Faster loading improves user experience, conversions, and search rankings. See results immediately.',
        },
        {
            iconPath: '/images/services/icons/chart-icon.svg',
            title: 'Improved SEO',
            description:
                'Better Core Web Vitals, structured data, and mobile experience. Automatic sitemap generation. Built-in blog system helps content marketing. Rank higher on Google.',
        },
        {
            iconPath: '/images/services/icons/shield-icon.svg',
            title: 'Lower Maintenance',
            description:
                'No WordPress updates, plugin conflicts, or security patches. Simpler tech stack means less can break. Static generation reduces server costs.',
        },
        {
            iconPath: '/images/services/icons/globe-icon.svg',
            title: 'Keep Your Content',
            description:
                'All existing content migrates over. URLs preserved with redirects. SEO authority maintained. Your domain stays the same.',
        },
    ],
    process: [
        {
            step: 1,
            title: 'Content Audit',
            description:
                'We analyze your current site. Identify all pages, posts, and assets. Map URL structure for redirect planning. Assess SEO rankings to preserve.',
            iconPath: '/images/services/icons/target-icon.svg',
        },
        {
            step: 2,
            title: 'Migration Planning',
            description:
                'Create migration strategy. Plan URL redirects. Map old content to new template structure. Identify customization needs.',
            iconPath: '/images/services/icons/palette-icon.svg',
        },
        {
            step: 3,
            title: 'Content Transfer',
            description:
                'Migrate all content to Keel template. Transfer images and files to Vercel Blob. Implement redirects for SEO preservation. Test all internal links.',
            iconPath: '/images/services/icons/code-icon.svg',
        },
        {
            step: 4,
            title: 'Customization',
            description:
                'Apply your branding: colors, fonts, logo. Customize template sections to match your needs. Add any additional features required.',
            iconPath: '/images/services/icons/palette-icon.svg',
        },
        {
            step: 5,
            title: 'Launch & Redirect',
            description:
                'Deploy new site. Configure domain DNS. Enable redirect rules. Monitor for issues. Verify SEO rankings maintained.',
            iconPath: '/images/services/icons/zap-icon.svg',
        },
    ],
    gallery: [
        {
            url: '/images/services/web-development-workspace.jpg',
            alt: 'Content migration process from WordPress to Next.js',
            caption: 'Complete content migration process',
        },
        {
            url: '/images/services/web-development-team.jpg',
            alt: 'Performance comparison showing faster load times',
            caption: 'Improved performance and Core Web Vitals',
        },
        {
            url: '/images/services/web-development-mobile.jpg',
            alt: 'Before and after comparison of website design',
            caption: 'Modern, responsive design transformation',
        },
        {
            url: '/images/services/web-development-code-quality.jpg',
            alt: 'SEO preservation with redirect mapping',
            caption: 'Maintain rankings with proper redirects',
        },
        {
            url: '/images/services/web-development-ui-design.jpg',
            alt: 'Mobile-first responsive design on multiple devices',
            caption: 'Works perfectly on all screen sizes',
        },
        {
            url: '/images/services/web-development-success.jpg',
            alt: 'Successful website launch with improved metrics',
            caption: 'Better performance, better results',
        },
    ],
    faqs: [
        {
            question: 'Will I lose my search engine rankings?',
            answer: 'No. We implement proper 301 redirects from old URLs to new ones. This preserves your SEO authority and rankings. Google recognizes the redirects.',
        },
        {
            question: 'How long does migration take?',
            answer: 'Depends on site size. A 10-20 page site with blog takes 1-2 weeks. Larger sites take longer. We provide timeline after content audit.',
        },
        {
            question: 'Can you migrate from WordPress?',
            answer: 'Yes. We can migrate from WordPress, Wix, Squarespace, static HTML sites, or custom platforms. We export your content and rebuild in Keel.',
        },
        {
            question: 'What happens to my domain?',
            answer: 'Your domain stays the same. We update DNS settings to point to the new site. No disruption to email or other services on your domain.',
        },
        {
            question: 'Do you provide migration support?',
            answer: 'Yes. We offer migration consulting and implementation. We can do the full migration or guide your team through the process. Support options available.',
        },
    ],
    cta: {
        heading: 'Ready to modernize?',
        description:
            "Let's transform your website into a fast, modern platform.",
        primaryButton: {
            text: 'Start migration',
            href: '/contact',
        },
        secondaryButton: {
            text: 'View migration guide',
            href: '/docs',
        },
    },
    seo: {
        title: 'Website Modernization | Migrate to Next.js',
        description:
            'Modernize your outdated website with our Next.js template. Migrate content, preserve SEO rankings, and improve performance. WordPress migration available.',
        keywords: [
            'website modernization',
            'website redesign',
            'update old website',
            'website migration',
            'website refresh',
            'WordPress migration',
            'website transformation',
        ],
    },
    order: 2,
    isPublished: true,
}
