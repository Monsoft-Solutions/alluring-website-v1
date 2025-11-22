/**
 * Home Page Data
 *
 * Data structures and content for the home page sections.
 * All content is centralized here for easy maintenance and localization.
 */
import { Blocks, LineChart, Palette, Search, Shield, Zap } from 'lucide-react'

import type { Feature } from '@/lib/types/sections'

/**
 * Key Features Section Content
 *
 * Highlights template capabilities and features
 */
export const keyFeaturesData: Feature[] = [
    {
        icon: Zap,
        title: 'Fast Development',
        description:
            'Pre-built components and layouts. Start building immediately. No boilerplate setup.',
        ariaLabel: 'Learn more about fast development features',
        imageSrc: '/images/services/web-development-workspace.jpg',
        imageAlt: 'Modern development workspace with code editor and tools',
    },
    {
        icon: Blocks,
        title: 'Complete Blog System',
        description:
            'Full-featured blog with PostgreSQL, categories, tags, and markdown. Vercel Blob image storage. Production-ready.',
        ariaLabel: 'Learn more about the blog system',
        imageSrc: '/images/services/web-development-success.jpg',
        imageAlt: 'Successful blog implementation with content management',
    },
    {
        icon: Shield,
        title: 'Type-Safe Code',
        description:
            '100% TypeScript with strict typing. Zod validation and error handling. Built for maintainability.',
        ariaLabel: 'Learn more about code quality',
        imageSrc: '/images/services/web-development-code-quality.jpg',
        imageAlt: 'High-quality TypeScript code on screen',
    },
    {
        icon: LineChart,
        title: 'Analytics Built-In',
        description:
            'Google Analytics, Clarity, GTM, and Facebook Pixel. Type-safe event tracking hooks. Pre-integrated.',
        ariaLabel: 'Learn more about analytics integration',
        imageSrc: '/images/services/digital-marketing/analytics-reporting.jpg',
        imageAlt: 'Analytics dashboard showing user metrics and reports',
    },
    {
        icon: Search,
        title: 'SEO Optimized',
        description:
            'Metadata generation, schema.org data, dynamic sitemaps, and Open Graph tags. SEO package included.',
        ariaLabel: 'Learn more about SEO optimization',
        imageSrc: '/images/services/digital-marketing/seo-optimization.jpg',
        imageAlt: 'SEO optimization tools and search rankings',
    },
    {
        icon: Palette,
        title: 'Beautiful UI Components',
        description:
            '13+ shadcn/ui components with Tailwind CSS 4. Dark mode support. Notion-inspired design.',
        ariaLabel: 'Learn more about UI components',
        imageSrc: '/images/services/web-development-ui-design.jpg',
        imageAlt: 'Beautiful UI component design with modern aesthetics',
    },
]

/**
 * Features/Services Section Content (Legacy - REMOVED)
 *
 * This legacy section contained prohibited brand voice terms and has been removed.
 * Use keyFeaturesData instead for brand-compliant feature content.
 */
