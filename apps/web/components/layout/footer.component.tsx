'use client'

import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@/lib/data/site-config'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedures } from '@/lib/data/procedures.data'

export const Footer = () => {
    return (
        <footer className='border-t border-stone-900 bg-stone-950 pt-24 pb-12 text-white'>
            <div className='container mx-auto px-6 md:px-12'>
                <div className='mb-20 grid gap-12 lg:grid-cols-4'>
                    <div className='lg:col-span-1'>
                        <span className='mb-4 block font-serif text-2xl font-semibold tracking-tight text-white'>
                            ALLURING
                        </span>
                        <p className='mb-8 text-base leading-relaxed text-stone-500'>
                            Premier plastic surgery center in Miami, FL
                            providing world-class aesthetic results with
                            concierge care.
                        </p>
                        <div className='flex space-x-6'>
                            {siteConfig.social
                                .filter((s) => s.platform === 'instagram')
                                .map((social) => (
                                    <a
                                        key={social.platform}
                                        href={social.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        aria-label={social.label}
                                    >
                                        <Instagram className='hover:text-gold-400 h-5 w-5 cursor-pointer text-stone-500 transition-colors' />
                                    </a>
                                ))}
                            {siteConfig.social
                                .filter((s) => s.platform === 'facebook')
                                .map((social) => (
                                    <a
                                        key={social.platform}
                                        href={social.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        aria-label={social.label}
                                    >
                                        <Facebook className='hover:text-gold-400 h-5 w-5 cursor-pointer text-stone-500 transition-colors' />
                                    </a>
                                ))}
                            <Youtube className='hover:text-gold-400 h-5 w-5 cursor-pointer text-stone-500 transition-colors' />
                        </div>
                    </div>

                    <div>
                        <h4 className='text-gold-500 mb-6 text-sm font-bold tracking-widest uppercase'>
                            Procedures
                        </h4>
                        <ul className='space-y-4 text-base text-stone-400'>
                            {procedures.map((procedure) => (
                                <li key={procedure.slug}>
                                    <Link
                                        href={`/procedures/${procedure.slug}`}
                                        className='cursor-pointer transition-colors hover:text-white'
                                    >
                                        {procedure.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className='text-gold-500 mb-6 text-sm font-bold tracking-widest uppercase'>
                            Surgeons
                        </h4>
                        <ul className='space-y-4 text-base text-stone-400'>
                            {surgeons.map((surgeon) => (
                                <li key={surgeon.id}>
                                    <Link
                                        href={`/${surgeon.slug}`}
                                        className='cursor-pointer transition-colors hover:text-white'
                                    >
                                        {surgeon.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className='text-gold-500 mb-6 text-sm font-bold tracking-widest uppercase'>
                            Patients
                        </h4>
                        <ul className='space-y-4 text-base text-stone-400'>
                            <li className='cursor-pointer transition-colors hover:text-white'>
                                Financing Options
                            </li>
                            <li className='cursor-pointer transition-colors hover:text-white'>
                                Out-of-Town Guests
                            </li>
                            <li className='cursor-pointer transition-colors hover:text-white'>
                                Before & After Gallery
                            </li>
                            <li className='cursor-pointer transition-colors hover:text-white'>
                                Patient Reviews
                            </li>
                            <li className='cursor-pointer transition-colors hover:text-white'>
                                Blog & Education
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className='text-gold-500 mb-6 text-sm font-bold tracking-widest uppercase'>
                            Contact
                        </h4>
                        <div className='space-y-4 text-base text-stone-400'>
                            <div className='flex cursor-pointer items-start transition-colors hover:text-white'>
                                <MapPin className='mt-1 mr-3 h-4 w-4 flex-shrink-0 text-stone-600' />
                                <span>
                                    {siteConfig.contact.address}
                                    <br />
                                    {siteConfig.contact.city},{' '}
                                    {siteConfig.contact.state}{' '}
                                    {siteConfig.contact.postalCode}
                                </span>
                            </div>
                            <a
                                href={`tel:${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`}
                                className='flex cursor-pointer items-center transition-colors hover:text-white'
                            >
                                <Phone className='mr-3 h-4 w-4 flex-shrink-0 text-stone-600' />
                                <span>{siteConfig.contact.phoneDisplay}</span>
                            </a>
                            <a
                                href={`mailto:${siteConfig.contact.email}`}
                                className='flex cursor-pointer items-center transition-colors hover:text-white'
                            >
                                <Mail className='mr-3 h-4 w-4 flex-shrink-0 text-stone-600' />
                                <span>{siteConfig.contact.email}</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-between border-t border-stone-900 pt-8 text-sm text-stone-600 md:flex-row'>
                    <p>
                        &copy; {new Date().getFullYear()} Alluring Plastic
                        Surgery. All rights reserved.
                    </p>
                    <div className='mt-4 flex space-x-8 md:mt-0'>
                        <a
                            href='/privacy'
                            className='cursor-pointer transition-colors hover:text-white'
                        >
                            Privacy Policy
                        </a>
                        <a
                            href='/terms'
                            className='cursor-pointer transition-colors hover:text-white'
                        >
                            Terms of Service
                        </a>
                        <a
                            href='/sitemap'
                            className='cursor-pointer transition-colors hover:text-white'
                        >
                            Sitemap
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
