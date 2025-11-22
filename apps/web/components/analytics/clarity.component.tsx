/**
 * Microsoft Clarity Component
 *
 * Loads Microsoft Clarity tracking script.
 * Only loads when NEXT_PUBLIC_CLARITY_PROJECT_ID is configured.
 *
 * @module components/analytics
 */

'use client'

import Script from 'next/script'

interface ClarityProps {
    projectId: string
}

/**
 * Microsoft Clarity Script Component
 *
 * Loads Clarity with optimal performance settings.
 * Provides session recordings and heatmaps.
 *
 * @example
 * ```tsx
 * <Clarity projectId="xxxxxxxxxx" />
 * ```
 */
export function Clarity({ projectId }: ClarityProps) {
    return (
        <Script id='microsoft-clarity-init' strategy='afterInteractive'>
            {`
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${projectId}");
            `}
        </Script>
    )
}
