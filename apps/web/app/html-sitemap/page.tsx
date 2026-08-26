/**
 * HTML Sitemap Page
 *
 * Displays all site links organized by category for SEO purposes.
 * Server-rendered with semantic HTML and proper accessibility.
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import { ContainerLayout } from '@/components/container-layout.component'
import { procedures } from '@/lib/data/procedures.data'
import {
    staticSitemapCategories,
    type SitemapCategory,
} from '@/lib/data/sitemap/html-sitemap.data'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import {
    getActiveCategorySlugs,
    getActiveTagSlugs,
    getPublishedPostSlugs,
} from '@/lib/queries/blog/sitemap.query'
import { getGalleryGroupsForSitemap } from '@/lib/queries/gallery/sitemap.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

const MAX_BLOG_POSTS_DISPLAYED = 200

export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/html-sitemap',
    title: 'Sitemap | Alluring Plastic Surgery',
    description:
        'Complete sitemap of Alluring Plastic Surgery website. Find all pages including procedures, surgeons, gallery, blog articles, and more.',
    robots: { index: true, follow: true },
})

/**
 * Renders a sitemap section with title and links
 */
function SitemapSection({ title, links }: SitemapCategory) {
    return (
        <section className='mb-10' aria-labelledby={`section-${title}`}>
            <h2
                id={`section-${title}`}
                className='mb-4 font-serif text-xl font-semibold text-stone-900'
            >
                {title}
            </h2>
            <ul className='grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className='hover:text-gold-600 text-stone-700 transition-colors hover:underline'
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default async function SitemapPage() {
    // Fetch dynamic content in parallel
    const [blogPosts, blogCategories, blogTags, galleryGroups] =
        await Promise.all([
            getPublishedPostSlugs(),
            getActiveCategorySlugs(),
            getActiveTagSlugs(),
            getGalleryGroupsForSitemap(),
        ])

    // Build dynamic sections
    const surgeonsSection: SitemapCategory = {
        title: 'Our Surgeons',
        links: surgeons.map((surgeon) => ({
            label: surgeon.name,
            href: `/${surgeon.slug}`,
        })),
    }

    const proceduresSection: SitemapCategory = {
        title: 'Procedures',
        links: procedures.map((procedure) => ({
            label: procedure.title,
            href: `/procedures/${procedure.slug}`,
        })),
    }

    const gallerySection: SitemapCategory = {
        title: 'Gallery',
        links: galleryGroups.map((group) => ({
            label: group.name,
            href: `/gallery/${group.slug}`,
        })),
    }

    const blogCategoriesSection: SitemapCategory = {
        title: 'Blog Categories',
        links: blogCategories.map((category) => ({
            label: category.slug
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            href: `/blog/categories/${category.slug}`,
        })),
    }

    const blogTagsSection: SitemapCategory = {
        title: 'Blog Tags',
        links: blogTags.map((tag) => ({
            label: tag.slug
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            href: `/blog/tags/${tag.slug}`,
        })),
    }

    // Sort blog posts by publishedAt descending and limit
    const sortedBlogPosts = [...blogPosts]
        .sort(
            (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
        )
        .slice(0, MAX_BLOG_POSTS_DISPLAYED)

    const blogArticlesSection: SitemapCategory = {
        title: 'Blog Articles',
        links: sortedBlogPosts.map((post) => ({
            label: post.slug
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            href: getBlogPostUrl(post.slug, post.publishedAt),
        })),
    }

    const hasMoreBlogPosts = blogPosts.length > MAX_BLOG_POSTS_DISPLAYED

    return (
        <ContainerLayout as='main' size='lg' className='py-12'>
            <nav aria-label='Site navigation'>
                <header className='mb-12'>
                    <h1 className='mb-4 font-serif text-4xl font-bold text-stone-900'>
                        Sitemap
                    </h1>
                    <p className='text-lg text-stone-600'>
                        Navigate all pages on our website
                    </p>
                </header>

                {/* Static sections */}
                {staticSitemapCategories.map((category) => (
                    <SitemapSection key={category.title} {...category} />
                ))}

                {/* Dynamic sections */}
                <SitemapSection {...surgeonsSection} />
                <SitemapSection {...proceduresSection} />

                {galleryGroups.length > 0 && (
                    <SitemapSection {...gallerySection} />
                )}

                {blogCategories.length > 0 && (
                    <SitemapSection {...blogCategoriesSection} />
                )}

                {blogTags.length > 0 && <SitemapSection {...blogTagsSection} />}

                {sortedBlogPosts.length > 0 && (
                    <section
                        className='mb-10'
                        aria-labelledby='section-blog-articles'
                    >
                        <h2
                            id='section-blog-articles'
                            className='mb-4 font-serif text-xl font-semibold text-stone-900'
                        >
                            {blogArticlesSection.title}
                        </h2>
                        <ul className='grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                            {blogArticlesSection.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className='hover:text-gold-600 text-stone-700 transition-colors hover:underline'
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {hasMoreBlogPosts && (
                            <p className='mt-4 text-stone-600'>
                                <Link
                                    href='/blog'
                                    className='text-gold-600 hover:text-gold-700 font-medium hover:underline'
                                >
                                    View all {blogPosts.length} blog articles
                                </Link>
                            </p>
                        )}
                    </section>
                )}
            </nav>
        </ContainerLayout>
    )
}
