import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { siteConfig } from '@/lib/data/site-config'
import { SurgeonHero } from '@/components/surgeons/surgeon-hero.component'
import { SurgeonBio } from '@/components/surgeons/surgeon-bio.component'
import { SurgeonCredentials } from '@/components/surgeons/surgeon-credentials.component'
import { SurgeonSpecialties } from '@/components/surgeons/surgeon-specialties.component'
import { SurgeonCTA } from '@/components/surgeons/surgeon-cta.component'
import { env } from '@/env'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return surgeons.map((surgeon) => ({
        slug: surgeon.slug,
    }))
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const surgeon = surgeons.find((s) => s.slug === slug)

    if (!surgeon) {
        return {
            title: 'Surgeon Not Found',
        }
    }

    const ogImage = surgeon.images.featured.startsWith('http')
        ? surgeon.images.featured
        : `${env.NEXT_PUBLIC_SITE_URL}${surgeon.images.featured}`

    return {
        title: `${surgeon.name} | Alluring Plastic Surgery`,
        description: surgeon.shortBio,
        alternates: {
            canonical: `${env.NEXT_PUBLIC_SITE_URL}/${slug}`,
        },
        openGraph: {
            title: `${surgeon.name} | Alluring Plastic Surgery`,
            description: surgeon.shortBio,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: surgeon.name,
                },
            ],
        },
    }
}

export default async function SurgeonPage({ params }: PageProps) {
    const { slug } = await params
    const surgeon = surgeons.find((s) => s.slug === slug)

    if (!surgeon) {
        notFound()
    }

    return (
        <main className='min-h-screen bg-stone-950'>
            <SurgeonHero surgeon={surgeon} />
            <SurgeonBio surgeon={surgeon} />
            <SurgeonCredentials surgeon={surgeon} />
            <SurgeonSpecialties surgeon={surgeon} />
            <SurgeonCTA />
        </main>
    )
}
