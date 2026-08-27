/**
 * Google Translate Initialization Component
 *
 * Renders the mount point Google Translate needs, and restores a stored
 * Spanish preference — but does not load the widget for anyone else. The
 * loader itself lives in `@/lib/utils/google-translate`.
 *
 * This sits in the root layout, above `ConditionalLayout`, on purpose. The
 * restore has to run on every route, and `LanguageSwitcher` — the only other
 * thing that can trigger a load — renders inside `Header`, which
 * `ConditionalLayout` skips for the standalone routes (`/links`, `/landing/*`).
 * Driving the restore from the header would leave a returning Spanish visitor
 * on an English page for every paid-ad landing page on the site.
 */
'use client'

import { useEffect } from 'react'

import { GOOGLE_TRANSLATE_MOUNT_ID } from '@/lib/utils/google-translate.util'
import { initializeLanguage } from '@/lib/utils/language.util'

export function GoogleTranslateInit() {
    useEffect(() => {
        // Resolves immediately for the vast majority of visitors, who have no
        // stored preference and so never cause the script to be fetched.
        void initializeLanguage()
    }, [])

    return (
        <div
            id={GOOGLE_TRANSLATE_MOUNT_ID}
            style={{ display: 'none' }}
            suppressHydrationWarning
        />
    )
}
