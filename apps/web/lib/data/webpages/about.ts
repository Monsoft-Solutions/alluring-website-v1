/**
 * About Page Data
 *
 * Data structures and content for the about page sections.
 * All content is centralized here for easy maintenance and localization.
 */
import {
    Briefcase,
    Code,
    Compass,
    Heart,
    Lightbulb,
    Target,
} from 'lucide-react'

import type { AboutHeroSectionProps } from '@/lib/types/sections/about-hero-section.type'
import type { Feature } from '@/lib/types/sections/features-section.type'
import type { MissionSectionProps } from '@/lib/types/sections/mission-section.type'
import type { TeamMember } from '@/lib/types/sections/team-section.type'
import type { TeamSectionProps } from '@/lib/types/sections/team-section.type'

/**
 * About Hero Section Content
 */
export const aboutHeroData: Omit<AboutHeroSectionProps, 'id'> = {
    badge: 'Built for Real Projects',
    headline: 'Production-Ready Code. Real-World Tested.',
    description:
        'Keel is a Next.js template for developers building client projects and business owners launching professional websites. Skip the setup. Start with production-tested code that includes blog, analytics, SEO, and contact forms. Built with Next.js 15, React 19, and TypeScript.',
    image: {
        src: '/images/about-hero.jpg',
        alt: 'Modern professional business website on multiple devices',
        width: 1200,
        height: 800,
        priority: true,
        aspectRatio: 'aspect-video',
    },
    enableAnimations: true,
}

/**
 * Mission, Vision, and Values Section Content
 * Focused on why Keel exists and what it stands for
 */
export const missionData: Omit<MissionSectionProps, 'id'> = {
    items: [
        {
            icon: Target,
            title: 'Ship in Hours',
            description:
                'Launch websites in hours, not weeks. Customize content, add branding, deploy. Skip weeks of setup work. Start with working features instead of empty folders.',
            ariaLabel: 'Learn about fast website deployment',
        },
        {
            icon: Compass,
            title: 'Stable Technology',
            description:
                'Built with Next.js 15 and React 19. Stable, supported, production-ready. No experimental features. No framework churn. Just proven tools that ship reliable websites.',
            ariaLabel: 'Learn about modern web technology',
        },
        {
            icon: Heart,
            title: 'Everything Included',
            description:
                'SEO, analytics, blog, contact forms. Everything included. No add-ons needed. No monthly subscriptions. One template, complete features.',
            ariaLabel: 'Learn about business website features',
        },
    ],
}

/**
 * Our Story - Stacking Scroll Effect
 * Visual narrative that relates to both business owners and developers
 */
export const ourStoryData: Feature[] = [
    {
        icon: Lightbulb,
        title: 'The Problem We Solved',
        description:
            'We built the same foundations repeatedly. Blog systems, analytics, SEO, contact forms. Every client paid for work done before. So we created Keel.',
        imageSrc: '/images/about-story.jpg',
        imageAlt: 'Repetitive website development process',
    },
    {
        icon: Briefcase,
        title: 'For Business Owners',
        description:
            'Professional website in days. Blog, analytics, SEO, contact forms included. One price, no recurring fees. Deploy fast, look professional.',
        imageSrc: '/images/services/web-development-workspace.jpg',
        imageAlt: 'Professional business website on multiple devices',
    },
    {
        icon: Code,
        title: 'For Developers',
        description:
            'Production-ready code. Monorepo, TypeScript, shadcn/ui, Drizzle ORM. Ship client work faster. Learn modern patterns. Start with working features, not empty repos.',
        imageSrc: '/images/about-developer.jpg',
        imageAlt: 'Modern development environment with TypeScript and React',
    },
    {
        icon: Target,
        title: 'Production Tested',
        description:
            'Used for real client projects. Next.js 15, React 19, Drizzle ORM. Updated based on production feedback. Built for shipping, not demos.',
        imageSrc: '/images/services/seo-optimization.jpg',
        imageAlt: 'Production website with analytics and performance metrics',
    },
]

/**
 * Team Members Data (preserved for future use)
 */
export const teamMembers: TeamMember[] = [
    {
        name: 'Sarah Johnson',
        role: 'Chief Executive Officer',
        bio: 'Visionary leader with 15+ years of industry experience and a passion for innovation.',
        avatar: '/images/team/sarah-johnson.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
    {
        name: 'Michael Chen',
        role: 'Chief Technology Officer',
        bio: 'Tech innovator and architect with expertise in scalable systems and AI integration.',
        avatar: '/images/team/michael-chen.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
    {
        name: 'Emily Rodriguez',
        role: 'Chief Operating Officer',
        bio: 'Operations expert focused on efficiency, quality, and sustainable growth.',
        avatar: '/images/team/emily-rodriguez.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
    {
        name: 'David Kim',
        role: 'Head of Product',
        bio: 'Product visionary committed to building solutions that solve real customer problems.',
        avatar: '/images/team/david-kim.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
    {
        name: 'Jessica Williams',
        role: 'Head of Customer Success',
        bio: 'Customer advocate ensuring every client gets maximum value from our solutions.',
        avatar: '/images/team/jessica-williams.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
    {
        name: 'Alex Martinez',
        role: 'Lead Designer',
        bio: 'Design thinker creating beautiful, intuitive experiences that users love.',
        avatar: '/images/team/alex-martinez.jpg',
        social: {
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
        },
    },
]

/**
 * Team Section Props (preserved for future use)
 */
export const teamSectionData: Omit<TeamSectionProps, 'id'> = {
    badge: 'Meet the Team',
    headline: 'Talented People Driving Innovation',
    description:
        'Our diverse team of experts brings unique perspectives and deep expertise across technology, business, and customer success.',
    members: teamMembers,
}

/**
 * Final CTA Section Content (for end of about page)
 */
export const aboutCTAData = {
    title: 'Ready to Build?',
    description:
        'Start with production-ready code. Full documentation included. Build your first site this week.',
    primaryButton: {
        text: 'Contact Us',
        href: '/contact-us',
    },
    secondaryButton: {
        text: 'Key Features',
        href: '/#key-features',
    },
    variant: 'accent' as const,
}
