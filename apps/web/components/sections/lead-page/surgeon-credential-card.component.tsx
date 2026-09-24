/**
 * Dr. Karlinsky, stated the way the BBL page states her (#248): the name the
 * licence carries, the one board the site may name without Florida's
 * disclaimer, and the fact that the surgeon you meet is the one who operates.
 * Every credential string comes from `karlinsky-credentials.constant.ts`.
 */

import Image from 'next/image'
import Link from 'next/link'

import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

interface SurgeonCredentialCardProps {
    /** `dark` for stone-900 sections, `light` for stone-50 ones. */
    readonly tone?: 'dark' | 'light'
    readonly headingLevel?: 'h2' | 'h3'
    readonly className?: string
}

export function SurgeonCredentialCard({
    tone = 'light',
    headingLevel: Heading = 'h2',
    className = '',
}: SurgeonCredentialCardProps) {
    const dark = tone === 'dark'

    return (
        <div
            className={`flex items-center gap-4 rounded-2xl border p-4 sm:gap-5 sm:p-5 ${
                dark
                    ? 'border-white/10 bg-white/[0.04] text-stone-100'
                    : 'border-stone-200 bg-white text-stone-900'
            } ${className}`}
        >
            <Image
                src='/images/surgeons/dr-karlinsky.webp'
                alt={`Dr. ${KARLINSKY_NAME}`}
                width={800}
                height={1000}
                sizes='96px'
                className='h-24 w-20 flex-none rounded-xl object-cover object-top'
            />
            <div className='min-w-0'>
                <p
                    className={`text-[10.5px] font-bold tracking-[0.16em] uppercase ${
                        dark ? 'text-gold-400' : 'text-gold-600'
                    }`}
                >
                    Your surgeon
                </p>
                <Heading className='mt-1 font-serif text-lg leading-snug sm:text-xl'>
                    Dr. {KARLINSKY_NAME}
                </Heading>
                <p
                    className={`mt-1.5 text-sm leading-relaxed ${
                        dark ? 'text-stone-300' : 'text-stone-600'
                    }`}
                >
                    {KARLINSKY_CREDENTIALS} The surgeon you meet at your
                    consultation is the surgeon who operates.
                </p>
                <p className='mt-2 text-xs'>
                    <Link
                        href={karlinskyRecords.americanBoardOfSurgery}
                        className={`underline underline-offset-2 ${
                            dark ? 'text-stone-400' : 'text-stone-500'
                        }`}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Verify her board certification
                    </Link>
                </p>
            </div>
        </div>
    )
}
