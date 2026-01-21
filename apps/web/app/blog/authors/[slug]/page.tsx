/**
 * Author Profile Page
 *
 * Displays author information with E-E-A-T signals for SEO and LLM optimization.
 * Includes Person/Physician schema for rich search results.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    BreadcrumbSchema,
    PhysicianSchema,
    WebPageSchema,
} from '@workspace/seo/react'
import { Award, BookOpen, GraduationCap, MapPin, Users } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { getAllAuthors, getAuthorBySlug } from '@/lib/data/authors.data'
import { siteConfig } from '@/lib/data/site-config'
import { env } from '@/env'

interface AuthorPageProps {
    params: Promise<{
        slug: string
    }>
}

export function generateStaticParams() {
    const authors = getAllAuthors()
    return authors.map((author) => ({
        slug: author.slug,
    }))
}

export async function generateMetadata(
    props: AuthorPageProps
): Promise<Metadata> {
    const params = await props.params
    const author = getAuthorBySlug(params.slug)

    if (!author) {
        return {
            title: 'Author Not Found',
        }
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/blog/authors/${params.slug}`

    return {
        title: `${author.name} - ${author.jobTitle}`,
        description: author.shortBio,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            type: 'profile',
            url: pageUrl,
            title: `${author.name} - ${author.jobTitle}`,
            description: author.shortBio,
            images: author.avatarUrl
                ? [{ url: author.avatarUrl, alt: author.name }]
                : undefined,
        },
    }
}

export default async function AuthorPage(props: AuthorPageProps) {
    const params = await props.params
    const author = getAuthorBySlug(params.slug)

    if (!author) {
        notFound()
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/blog/authors/${params.slug}`

    // Breadcrumb items
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Blog', item: `${siteUrl}/blog` },
        { name: 'Authors', item: `${siteUrl}/blog/authors` },
        { name: author.name, item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                name={`${author.name} - Author Profile`}
                url={pageUrl}
                description={author.shortBio}
            />

            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Physician/Person Schema for E-E-A-T */}
            {author.schemaType === 'Physician' ? (
                <PhysicianSchema
                    name={author.name}
                    url={pageUrl}
                    image={author.avatarUrl}
                    description={author.fullBio}
                    jobTitle={author.jobTitle}
                    medicalSpecialty={author.specialties}
                    award={author.awards}
                    worksFor={{
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                    memberOf={author.affiliations.map((a) => ({
                        name: a.organization,
                        url: a.url,
                    }))}
                    alumniOf={author.education?.map((e) => ({
                        name: `${e.degree}, ${e.institution}`,
                    }))}
                    address={{
                        streetAddress: siteConfig.contact.address,
                        addressLocality: siteConfig.contact.city,
                        addressRegion: siteConfig.contact.state,
                        postalCode: siteConfig.contact.postalCode,
                        addressCountry: siteConfig.contact.country,
                    }}
                    telephone={siteConfig.contact.phone}
                    sameAs={
                        author.socialLinks
                            ? Object.values(author.socialLinks).filter(Boolean)
                            : undefined
                    }
                />
            ) : null}

            {/* Hero Section */}
            <section className='bg-gradient-to-b from-stone-100 to-white py-16 lg:py-24'>
                <ContainerLayout>
                    <div className='flex flex-col items-center text-center'>
                        {/* Avatar */}
                        {author.avatarUrl && (
                            <div className='relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg'>
                                <Image
                                    src={author.avatarUrl}
                                    alt={author.name}
                                    fill
                                    className='object-cover'
                                />
                            </div>
                        )}

                        {/* Name and Title */}
                        <h1 className='mb-2 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                            {author.name}
                        </h1>
                        <p className='text-gold-600 mb-4 text-lg font-medium md:text-xl'>
                            {author.jobTitle}
                        </p>

                        {/* Short Bio */}
                        <p className='max-w-2xl text-lg leading-relaxed text-stone-600'>
                            {author.shortBio}
                        </p>

                        {/* Quick Stats */}
                        <div className='mt-8 flex flex-wrap justify-center gap-6'>
                            {author.yearsExperience && (
                                <div className='flex items-center gap-2 text-stone-600'>
                                    <BookOpen className='text-gold-500 h-5 w-5' />
                                    <span>
                                        {author.yearsExperience}+ years
                                        experience
                                    </span>
                                </div>
                            )}
                            {author.proceduresPerformed && (
                                <div className='flex items-center gap-2 text-stone-600'>
                                    <Users className='text-gold-500 h-5 w-5' />
                                    <span>
                                        {author.proceduresPerformed} procedures
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </ContainerLayout>
            </section>

            {/* Credentials Section */}
            <section className='bg-white py-16'>
                <ContainerLayout>
                    <div className='mx-auto max-w-4xl'>
                        <div className='grid gap-8 md:grid-cols-2'>
                            {/* Credentials */}
                            {author.credentials.length > 0 && (
                                <div className='rounded-xl border border-stone-200 bg-stone-50 p-6'>
                                    <h2 className='mb-4 flex items-center gap-2 font-serif text-xl text-stone-900'>
                                        <Award className='text-gold-500 h-5 w-5' />
                                        Credentials & Certifications
                                    </h2>
                                    <ul className='space-y-2'>
                                        {author.credentials.map((cred, i) => (
                                            <li
                                                key={i}
                                                className='text-stone-600'
                                            >
                                                <span className='font-medium'>
                                                    {cred.title}
                                                </span>
                                                {cred.institution && (
                                                    <span className='text-stone-400'>
                                                        {' '}
                                                        - {cred.institution}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Affiliations */}
                            {author.affiliations.length > 0 && (
                                <div className='rounded-xl border border-stone-200 bg-stone-50 p-6'>
                                    <h2 className='mb-4 flex items-center gap-2 font-serif text-xl text-stone-900'>
                                        <MapPin className='text-gold-500 h-5 w-5' />
                                        Professional Affiliations
                                    </h2>
                                    <ul className='space-y-2'>
                                        {author.affiliations.map((aff, i) => (
                                            <li
                                                key={i}
                                                className='text-stone-600'
                                            >
                                                {aff.url ? (
                                                    <Link
                                                        href={aff.url}
                                                        className='hover:text-gold-600 font-medium transition-colors'
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                    >
                                                        {aff.organization}
                                                    </Link>
                                                ) : (
                                                    <span className='font-medium'>
                                                        {aff.organization}
                                                    </span>
                                                )}
                                                {aff.role && (
                                                    <span className='text-stone-400'>
                                                        {' '}
                                                        - {aff.role}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Education */}
                            {author.education &&
                                author.education.length > 0 && (
                                    <div className='rounded-xl border border-stone-200 bg-stone-50 p-6'>
                                        <h2 className='mb-4 flex items-center gap-2 font-serif text-xl text-stone-900'>
                                            <GraduationCap className='text-gold-500 h-5 w-5' />
                                            Education
                                        </h2>
                                        <ul className='space-y-2'>
                                            {author.education.map((edu, i) => (
                                                <li
                                                    key={i}
                                                    className='text-stone-600'
                                                >
                                                    <span className='font-medium'>
                                                        {edu.degree}
                                                    </span>
                                                    <span className='text-stone-400'>
                                                        {' '}
                                                        - {edu.institution}
                                                        {edu.year &&
                                                            ` (${edu.year})`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* Specialties */}
                            {author.specialties.length > 0 && (
                                <div className='rounded-xl border border-stone-200 bg-stone-50 p-6'>
                                    <h2 className='mb-4 font-serif text-xl text-stone-900'>
                                        Areas of Expertise
                                    </h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {author.specialties.map(
                                            (specialty, i) => (
                                                <span
                                                    key={i}
                                                    className='bg-gold-100 text-gold-800 rounded-full px-3 py-1 text-sm'
                                                >
                                                    {specialty}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Full Bio */}
                        <div className='mt-12'>
                            <h2 className='mb-4 font-serif text-2xl text-stone-900'>
                                About {author.name}
                            </h2>
                            <div className='prose prose-stone prose-lg max-w-none'>
                                <p>{author.fullBio}</p>
                            </div>
                        </div>
                    </div>
                </ContainerLayout>
            </section>

            {/* Articles by Author */}
            <BlogPostsSection
                title={`Articles by ${author.name}`}
                description='Expert insights and educational content'
                badge='Latest Articles'
                variant='muted'
                limit={6}
                columns={3}
            />

            {/* CTA Section */}
            <CTASection
                heading='Have Questions?'
                description='Schedule a consultation to discuss your cosmetic surgery goals with our expert team.'
                primaryButton={{
                    text: 'Book Consultation',
                    href: '/free-consultation',
                }}
                secondaryButton={{
                    text: 'Contact Us',
                    href: '/contact-us',
                }}
            />
        </>
    )
}
