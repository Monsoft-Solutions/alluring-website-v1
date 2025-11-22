/**
 * Google Tag Manager Component
 *
 * Loads Google Tag Manager (GTM) container.
 * Only loads when NEXT_PUBLIC_GTM_ID is configured.
 *
 * Optional alternative to direct GA4 integration.
 *
 * @module components/analytics
 */

'use client'

import Script from 'next/script'

interface GoogleTagManagerProps {
    containerId: string
}

/**
 * Google Tag Manager Script Component
 *
 * Loads GTM container for centralized tag management.
 * Provides alternative to direct GA4/Clarity integration.
 *
 * @example
 * ```tsx
 * <GoogleTagManager containerId="GTM-XXXXXXX" />
 * ```
 */
export function GoogleTagManager({ containerId }: GoogleTagManagerProps) {
    return (
        <>
            {/* GTM Script */}
            <Script id='google-tag-manager' strategy='afterInteractive'>
                {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${containerId}');
                `}
            </Script>

            {/* GTM noscript fallback (should be in <body>) */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
                    height='0'
                    width='0'
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
        </>
    )
}
