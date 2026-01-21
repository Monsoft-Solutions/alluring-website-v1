/**
 * SocialShare Component
 *
 * Floating social sharing buttons for blog posts.
 * - Desktop: Vertical floating bar on left side
 * - Mobile: Horizontal bar at bottom (uses native share API when available)
 *
 * Features:
 * - Share to Facebook, Twitter/X, Pinterest, Copy Link
 * - Uses native Web Share API on mobile when available
 * - Animated hover states with gold accent
 * - Copy link with visual feedback
 *
 * @example
 * ```tsx
 * <SocialShare
 *   title="How to Choose the Right Breast Implant Size"
 *   url="/blog/breast-implant-size-guide"
 *   description="A comprehensive guide..."
 *   imageUrl="/images/breast-implants.jpg"
 * />
 * ```
 */
'use client'

import { Check, Copy, Facebook, Share2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

type SocialShareProps = {
    /**
     * Article title for share text
     */
    title: string

    /**
     * Full URL to share (will be resolved to absolute URL)
     */
    url: string

    /**
     * Optional description for platforms that support it
     */
    description?: string

    /**
     * Optional image URL for Pinterest
     */
    imageUrl?: string

    /**
     * Additional CSS classes
     */
    className?: string
}

// X/Twitter icon as SVG (not in Lucide)
function XIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
    )
}

// Pinterest icon as SVG
function PinterestIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            className={className}
            aria-hidden='true'
        >
            <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z' />
        </svg>
    )
}

function ShareButton({
    onClick,
    label,
    children,
    className,
}: {
    onClick: () => void
    label: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label={label}
            className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                'bg-stone-100 text-stone-600',
                'transition-all duration-300',
                'hover:bg-gold-500 hover:scale-110 hover:text-white',
                'focus:ring-gold-500 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                className
            )}
        >
            {children}
        </button>
    )
}

export function SocialShare({
    title,
    url,
    description,
    imageUrl,
    className,
}: SocialShareProps) {
    const [copied, setCopied] = useState(false)
    const [absoluteUrl, setAbsoluteUrl] = useState('')
    const [canNativeShare, setCanNativeShare] = useState(false)

    useEffect(() => {
        // Build absolute URL on client
        const fullUrl = url.startsWith('http')
            ? url
            : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
        setAbsoluteUrl(fullUrl)

        // Check if native share is available
        setCanNativeShare(
            typeof navigator !== 'undefined' &&
                'share' in navigator &&
                typeof navigator.share === 'function'
        )
    }, [url])

    const shareToFacebook = useCallback(() => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`
        window.open(shareUrl, '_blank', 'width=600,height=400')
    }, [absoluteUrl])

    const shareToTwitter = useCallback(() => {
        const text = description ? `${title} - ${description}` : title
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(absoluteUrl)}`
        window.open(shareUrl, '_blank', 'width=600,height=400')
    }, [absoluteUrl, title, description])

    const shareToPinterest = useCallback(() => {
        const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(absoluteUrl)}&description=${encodeURIComponent(title)}${imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ''}`
        window.open(shareUrl, '_blank', 'width=600,height=400')
    }, [absoluteUrl, title, imageUrl])

    const copyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(absoluteUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = absoluteUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [absoluteUrl])

    const nativeShare = useCallback(async () => {
        if (!canNativeShare) return

        try {
            await navigator.share({
                title,
                text: description,
                url: absoluteUrl,
            })
        } catch {
            // User cancelled or error - ignore
        }
    }, [canNativeShare, title, description, absoluteUrl])

    // Don't render until we have the absolute URL
    if (!absoluteUrl) return null

    return (
        <>
            {/* Desktop: Floating vertical bar on left */}
            <aside
                className={cn(
                    'fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 lg:block',
                    className
                )}
                aria-label='Share this article'
            >
                <div className='flex flex-col gap-3 rounded-full border border-stone-200 bg-white p-2 shadow-lg'>
                    <ShareButton
                        onClick={shareToFacebook}
                        label='Share on Facebook'
                    >
                        <Facebook className='h-5 w-5' />
                    </ShareButton>
                    <ShareButton
                        onClick={shareToTwitter}
                        label='Share on X (Twitter)'
                    >
                        <XIcon className='h-5 w-5' />
                    </ShareButton>
                    <ShareButton
                        onClick={shareToPinterest}
                        label='Share on Pinterest'
                    >
                        <PinterestIcon className='h-5 w-5' />
                    </ShareButton>
                    <div className='mx-auto h-px w-6 bg-stone-200' />
                    <ShareButton
                        onClick={copyLink}
                        label={copied ? 'Link copied!' : 'Copy link'}
                        className={
                            copied ? 'bg-green-500 text-white' : undefined
                        }
                    >
                        {copied ? (
                            <Check className='h-5 w-5' />
                        ) : (
                            <Copy className='h-5 w-5' />
                        )}
                    </ShareButton>
                </div>
            </aside>

            {/* Mobile: Fixed bottom bar */}
            <aside
                className='fixed right-0 bottom-0 left-0 z-40 lg:hidden'
                aria-label='Share this article'
            >
                <div className='flex items-center justify-center gap-4 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm'>
                    {canNativeShare ? (
                        <ShareButton
                            onClick={nativeShare}
                            label='Share this article'
                            className='h-12 w-12'
                        >
                            <Share2 className='h-6 w-6' />
                        </ShareButton>
                    ) : (
                        <>
                            <ShareButton
                                onClick={shareToFacebook}
                                label='Share on Facebook'
                            >
                                <Facebook className='h-5 w-5' />
                            </ShareButton>
                            <ShareButton
                                onClick={shareToTwitter}
                                label='Share on X (Twitter)'
                            >
                                <XIcon className='h-5 w-5' />
                            </ShareButton>
                            <ShareButton
                                onClick={shareToPinterest}
                                label='Share on Pinterest'
                            >
                                <PinterestIcon className='h-5 w-5' />
                            </ShareButton>
                        </>
                    )}
                    <ShareButton
                        onClick={copyLink}
                        label={copied ? 'Link copied!' : 'Copy link'}
                        className={
                            copied ? 'bg-green-500 text-white' : undefined
                        }
                    >
                        {copied ? (
                            <Check className='h-5 w-5' />
                        ) : (
                            <Copy className='h-5 w-5' />
                        )}
                    </ShareButton>
                </div>
            </aside>
        </>
    )
}
