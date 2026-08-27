import { ImageObjectSchema, ServiceSchema } from '@workspace/seo/react'
import type { Procedure } from '@/lib/types/procedure.type'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { siteConfig } from '@/lib/data/site-config'

interface SignatureProcedureCardProps {
    procedure: Procedure
    index: number
    includeSchema?: boolean
}

/**
 * Staggered reveal for the carousel cards. Spelled out rather than computed so
 * Tailwind's scanner can see each class, and applied modulo its length — the
 * procedures page renders a whole category, which is well past four cards.
 */
const CARD_DELAY = [
    'animate-delay-0',
    'animate-delay-100',
    'animate-delay-200',
    'animate-delay-300',
]

/**
 * Maps category values to display text for stat badges
 */
const getCategoryDisplayName = (
    category?: 'face' | 'breast' | 'body' | 'combined'
): string => {
    const categoryMap: Record<NonNullable<Procedure['category']>, string> = {
        breast: 'Breast Procedures',
        body: 'Body Contouring',
        face: 'Facial Rejuvenation',
        combined: 'Combined Procedures',
    }

    return category ? categoryMap[category] : 'Procedure'
}

export function SignatureProcedureCard({
    procedure,
    index,
    includeSchema = true,
}: SignatureProcedureCardProps) {
    const defaultAuthor = {
        '@type': 'Organization' as const,
        name: siteConfig.business.name,
    }

    const categoryDisplay = getCategoryDisplayName(procedure.category)
    const imageSrc = procedure.image || '/images/placeholder.jpg'
    const description =
        procedure.shortDescription || procedure.description || ''

    return (
        <div
            className={`group animate-fade-in-up relative h-[600px] min-w-[85vw] cursor-pointer snap-center overflow-hidden md:min-w-[450px] ${CARD_DELAY[index % CARD_DELAY.length]}`}
        >
            <Link
                href={`/procedures/${procedure.slug}`}
                className='absolute inset-0 z-10'
                aria-label={`View ${procedure.title}`}
            >
                <span className='sr-only'>{procedure.title}</span>
            </Link>

            {/* Structured Data Schemas */}
            {includeSchema && (
                <>
                    <ImageObjectSchema
                        url={imageSrc}
                        alt={procedure.title}
                        author={defaultAuthor}
                        copyrightHolder={siteConfig.business.name}
                        name={procedure.title || siteConfig.business.name}
                    />
                    <ServiceSchema
                        name={`${procedure.title} in Miami`}
                        description={description}
                        url={`/procedures/${procedure.slug}`}
                        provider={{
                            name: siteConfig.business.name,
                            type: 'MedicalBusiness',
                        }}
                        areaServed='Miami, FL'
                        serviceType='Cosmetic Surgery'
                        category={categoryDisplay}
                    />
                </>
            )}
            <div className='absolute inset-0 h-full w-full overflow-hidden bg-stone-800'>
                <div className='relative h-full w-full scale-125 transition-transform duration-700 ease-out group-hover:scale-[1.35]'>
                    <Image
                        src={imageSrc}
                        alt={procedure.title}
                        fill
                        className='object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40'
                        sizes='(max-width: 768px) 85vw, 450px'
                    />
                </div>
            </div>

            {/* Gradient */}
            <div className='absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent opacity-90' />

            {/* Content */}
            <div className='absolute right-0 bottom-0 left-0 translate-y-4 transform p-8 transition-transform duration-500 group-hover:translate-y-0 md:p-12'>
                <span className='border-gold-500/30 text-gold-400 mb-4 inline-block border px-3 py-1 text-xs tracking-widest uppercase backdrop-blur-sm'>
                    {categoryDisplay}
                </span>
                <h3 className='mb-3 font-serif text-4xl text-white'>
                    {procedure.title}
                </h3>
                <p className='mb-8 max-w-xs translate-y-4 transform text-lg text-stone-300 opacity-0 transition-opacity delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100'>
                    {description}
                </p>

                <div className='group-hover:bg-gold-500 group-hover:border-gold-500 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:text-stone-900'>
                    <ArrowRight className='h-5 w-5' />
                </div>
            </div>
        </div>
    )
}
