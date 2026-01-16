'use client'

import { Instagram, Facebook } from 'lucide-react'

import { siteConfig } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

/**
 * TikTok icon component (lucide doesn't have this)
 */
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox='0 0 24 24'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
        </svg>
    )
}

/**
 * Map platform names to their icons
 */
const platformIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    instagram: Instagram,
    facebook: Facebook,
    tiktok: TikTokIcon,
}

/**
 * LinksSocial Component
 *
 * Social media icon buttons that link to the business profiles
 * Displayed as a horizontal row of circular icons
 * Tracks clicks to Google Analytics
 */
export function LinksSocial() {
    const { track } = useAnalyticsEvent()
    const { social } = siteConfig

    const handleSocialClick = (platform: string, url: string) => {
        track('links_page_click', {
            link_name: `links-social-${platform}`,
            link_href: url,
            link_title: platform,
            event_category: 'links_page',
            cta_type: 'social',
        })
    }

    return (
        <div className='flex items-center justify-center gap-4'>
            {social.map((platform) => {
                const Icon = platformIcons[platform.platform]

                if (!Icon) return null

                return (
                    <a
                        key={platform.platform}
                        href={platform.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Follow us on ${platform.label}`}
                        className='hover:border-gold-500/30 hover:text-gold-400 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-400 transition-all duration-300 hover:bg-white/10 active:scale-95'
                        onClick={() =>
                            handleSocialClick(platform.platform, platform.url)
                        }
                        data-analytics={`links-social-${platform.platform}`}
                    >
                        <Icon className='h-5 w-5' />
                    </a>
                )
            })}
        </div>
    )
}
