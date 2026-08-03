/**
 * Atelier Surgeons
 *
 * Arch-topped portraits, alternating side. The arch is the direction's
 * repeating form — hero, results lead, and here — which is what makes a
 * palette read as a design system rather than a colour choice.
 *
 * Server-rendered.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { surgeons } from '@/lib/data/surgeons/surgeons-data'

export function AtelierSurgeons() {
    return (
        <section
            className='scroll-mt-24 bg-[#F6EDE4] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-surgeons-heading'
            id='surgeons'
        >
            <div className='mx-auto max-w-7xl'>
                <div className='mb-16 max-w-2xl'>
                    <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                        Who operates
                    </span>
                    <h2
                        id='atelier-surgeons-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                    >
                        The person you meet is the person
                        <span className='text-[#C4674D] italic'>
                            {' '}
                            who operates.
                        </span>
                    </h2>
                </div>

                <div className='space-y-16 md:space-y-24'>
                    {surgeons.map((surgeon, index) => (
                        <article
                            key={surgeon.id}
                            className='grid items-center gap-10 lg:grid-cols-12 lg:gap-16'
                        >
                            <figure
                                className={
                                    index % 2 === 0
                                        ? 'lg:col-span-5'
                                        : 'lg:order-last lg:col-span-5'
                                }
                            >
                                <div className='relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full bg-[#E5B9A6]'>
                                    <Image
                                        src={surgeon.images.portrait}
                                        alt={`${surgeon.name}, ${surgeon.title}`}
                                        fill
                                        sizes='(max-width: 1024px) 100vw, 35vw'
                                        className='object-cover'
                                    />
                                </div>
                            </figure>

                            <div className='lg:col-span-7'>
                                <h3 className='font-[family-name:var(--font-fraunces)] text-3xl text-[#3D2B23] md:text-4xl'>
                                    {surgeon.name}
                                </h3>
                                <p className='mt-2 text-xs tracking-[0.2em] text-[#C4674D] uppercase'>
                                    {surgeon.title}
                                </p>

                                <p className='mt-7 max-w-xl text-lg leading-[1.75] text-[#3D2B23]/75'>
                                    {surgeon.shortBio}
                                </p>

                                {surgeon.quote && (
                                    <blockquote className='mt-7 max-w-xl border-l-2 border-[#C4674D] pl-6'>
                                        <p className='font-[family-name:var(--font-fraunces)] text-xl leading-snug text-[#3D2B23] italic'>
                                            &ldquo;{surgeon.quote}&rdquo;
                                        </p>
                                    </blockquote>
                                )}

                                <ul className='mt-8 flex flex-wrap gap-2'>
                                    {surgeon.specialties
                                        .slice(0, 5)
                                        .map((specialty) => (
                                            <li
                                                key={specialty}
                                                className='rounded-full bg-[#EFE3D6] px-4 py-2 text-sm text-[#3D2B23]/80'
                                            >
                                                {specialty}
                                            </li>
                                        ))}
                                </ul>

                                <Link
                                    href={`/${surgeon.slug}`}
                                    className='group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#C4674D] transition-colors hover:text-[#a8543d]'
                                >
                                    Read full profile
                                    <ArrowUpRight
                                        className='h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                                        aria-hidden='true'
                                    />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
