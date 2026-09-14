'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'

import { toLpLang, type LpLang } from './lp-copy'
import { LANG_STORAGE_KEY } from './lp-tracking'

/**
 * Which language the page is in, and how to change it.
 *
 * The server already resolved a language from `?hl=` and Accept-Language. Two
 * things can still override it, and neither exists until the browser does:
 *
 *   - a language the visitor chose here on an earlier visit, which loses to an
 *     explicit `?hl=` in the ad URL (`pinnedByUrl`);
 *   - a language they choose now, which beats everything.
 *
 * The remembered choice is read through `useSyncExternalStore` rather than an
 * effect. `localStorage` is exactly the "external store" that API is for, and
 * reading it this way means the value is part of the first post-hydration
 * render instead of a second render triggered from an effect.
 */

/** Nothing else writes this key while the page is open, so there is nothing to subscribe to. */
function subscribe(): () => void {
    return () => {}
}

function readRememberedLang(): LpLang | null {
    try {
        return toLpLang(window.localStorage.getItem(LANG_STORAGE_KEY))
    } catch {
        // Private mode, or storage blocked. The resolved language stands.
        return null
    }
}

/** The server has no storage to read; it always renders what it resolved. */
function noRememberedLang(): null {
    return null
}

export function useLpLanguage(
    initialLang: LpLang,
    pinnedByUrl: boolean
): readonly [LpLang, (next: LpLang) => void] {
    const [chosen, setChosen] = useState<LpLang | null>(null)
    const remembered = useSyncExternalStore(
        subscribe,
        readRememberedLang,
        noRememberedLang
    )

    const lang =
        chosen ?? (pinnedByUrl ? initialLang : (remembered ?? initialLang))

    const chooseLang = useCallback((next: LpLang) => {
        setChosen(next)
        try {
            window.localStorage.setItem(LANG_STORAGE_KEY, next)
        } catch {
            // Not remembering the choice is survivable; switching still works.
        }
    }, [])

    return [lang, chooseLang] as const
}
