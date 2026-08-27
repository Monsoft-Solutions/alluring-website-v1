/**
 * Google Translate Loader
 *
 * Injects the Google Translate widget on demand.
 *
 * The widget used to load on every page view, which pulled in four third-party
 * origins (`translate.google.com`, `translate.googleapis.com`,
 * `www.gstatic.com`, `fonts.gstatic.com`) for every visitor, the overwhelming
 * majority of whom never touch the language switcher. It now loads only when
 * someone asks for Spanish, or when a stored preference says they already did.
 *
 * Lives in its own module rather than beside the component that renders the
 * mount point, so `language.util` can import the loader and the component can
 * import `language.util` without a cycle.
 *
 * @module lib/utils/google-translate
 */

// Type definitions for Google Translate API
declare global {
    interface Window {
        google?: {
            translate: {
                TranslateElement: {
                    new (
                        config: {
                            pageLanguage: string
                            includedLanguages: string
                            layout: number
                            autoDisplay: boolean
                        },
                        elementId: string
                    ): void
                    InlineLayout: {
                        SIMPLE: number
                    }
                }
            }
        }
        googleTranslateElementInit?: () => void
    }
}

/** DOM id Google Translate renders its (hidden) control into. */
export const GOOGLE_TRANSLATE_MOUNT_ID = 'google_translate_element'

/** id of the injected `<script>`, so a retry can find and replace it. */
const SCRIPT_ID = 'google-translate-script'

const SCRIPT_SRC =
    'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'

/** How long to wait for the widget before giving up, in milliseconds. */
const LOAD_TIMEOUT_MS = 10_000

/** In-flight or settled load, so concurrent callers share one script tag. */
let loadPromise: Promise<void> | null = null

/**
 * Load the Google Translate widget, injecting its script on first call.
 *
 * Idempotent: repeated calls share one script tag and one promise.
 *
 * Resolves when the widget's init callback has constructed its
 * `TranslateElement`. That construction is the point at which the widget reads
 * the `googtrans` cookie and translates the document, so callers should write
 * the cookie *before* calling this and need do nothing afterwards.
 *
 * Note it does **not** wait for `.goog-te-combo`. The current widget never
 * renders that `<select>` in this hidden-mount configuration — verified in
 * Chrome, where the page translates (`<html lang="es" class="translated-ltr">`)
 * while the element stays absent. Waiting on it hangs for the full timeout and
 * then rejects a load that in fact succeeded.
 *
 * Rejects on network failure, on a widget-side throw, or after
 * {@link LOAD_TIMEOUT_MS} — never leaves the caller pending, so a control can
 * always come back out of its loading state.
 */
export function loadGoogleTranslate(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(
            new Error('Google Translate can only load in the browser')
        )
    }

    if (loadPromise) return loadPromise

    loadPromise = new Promise<void>((resolve, reject) => {
        let settled = false

        const fail = (message: string) => {
            if (settled) return
            settled = true
            clearTimeout(timeoutId)
            // Drop the memo so a later attempt can retry from scratch.
            loadPromise = null
            reject(new Error(message))
        }

        const succeed = () => {
            if (settled) return
            settled = true
            clearTimeout(timeoutId)
            resolve()
        }

        const timeoutId = setTimeout(
            () => fail('Google Translate timed out'),
            LOAD_TIMEOUT_MS
        )

        window.googleTranslateElementInit = () => {
            if (!window.google?.translate?.TranslateElement) {
                fail('Google Translate loaded without its element API')
                return
            }

            // Construction is third-party code touching a DOM node this app
            // owns. If it throws, the promise has to reject — settling only on
            // the line after would leave every caller pending forever, and the
            // timeout has to stay armed until we know construction survived.
            try {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,es',
                        layout: window.google.translate.TranslateElement
                            .InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    GOOGLE_TRANSLATE_MOUNT_ID
                )
            } catch (error) {
                fail(
                    `Google Translate failed to initialise: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                )
                return
            }

            succeed()
        }

        // Only reachable after a failed attempt cleared `loadPromise`: a script
        // element already in the document will not re-run the callback, so the
        // stale one has to go before the retry can succeed.
        document.getElementById(SCRIPT_ID)?.remove()

        const script = document.createElement('script')
        script.id = SCRIPT_ID
        script.src = SCRIPT_SRC
        script.async = true
        script.onerror = () => fail('Google Translate failed to load')

        document.head.appendChild(script)
    })

    return loadPromise
}
