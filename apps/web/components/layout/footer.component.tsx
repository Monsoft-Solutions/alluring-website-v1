/**
 * Footer Component
 *
 * Site footer with multi-column layout, navigation links, contact info, and social media
 */
import { Separator } from '@workspace/ui/components/separator'
import { Github, Linkedin, Mail, Phone, X } from 'lucide-react'
import Link from 'next/link'

import { copyrightText, footerSections } from '@/lib/data/footer'
import { contactInfo, socialLinks } from '@/lib/data/navigation'
import { businessInfo } from '@/lib/data/site-config'

const socialIcons = {
    github: Github,
    twitter: X,
    linkedin: Linkedin,
} as const

export function Footer() {
    return (
        <footer className='bg-background border-t'>
            <div className='container mx-auto max-w-7xl px-6 py-12 md:py-16'>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5'>
                    {/* Brand and Description */}
                    <div className='lg:col-span-2'>
                        <Link
                            href='/'
                            className='mb-4 inline-block text-xl font-bold'
                        >
                            {businessInfo.name}
                        </Link>
                        <p className='text-muted-foreground mb-6 max-w-sm text-sm'>
                            {businessInfo.description}
                        </p>
                        {/* Contact Information */}
                        <div className='space-y-3'>
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className='text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors'
                            >
                                <Mail className='mr-2 h-4 w-4' />
                                {contactInfo.email}
                            </a>
                            <a
                                href={`tel:${contactInfo.phone}`}
                                className='text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors'
                            >
                                <Phone className='mr-2 h-4 w-4' />
                                {contactInfo.phone}
                            </a>
                        </div>
                    </div>

                    {/* Footer Navigation Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className='mb-4 font-semibold'>
                                {section.title}
                            </h3>
                            <ul className='space-y-3'>
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
                                            target={
                                                item.external
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel={
                                                item.external
                                                    ? 'noopener noreferrer'
                                                    : undefined
                                            }
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className='my-8' />

                {/* Bottom Section */}
                <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                    {/* Copyright */}
                    <p className='text-muted-foreground text-sm'>
                        {copyrightText}
                    </p>

                    {/* Social Links */}
                    <div className='flex items-center space-x-4'>
                        {socialLinks.map((social) => {
                            const Icon =
                                socialIcons[
                                    social.platform as keyof typeof socialIcons
                                ]
                            if (!Icon) {
                                console.error(
                                    `No icon mapping for platform: ${social.platform}`
                                )
                                return null
                            }

                            return (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    aria-label={social.label || social.platform}
                                    className='text-muted-foreground hover:text-foreground transition-colors'
                                >
                                    <Icon className='h-5 w-5' />
                                </a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </footer>
    )
}
