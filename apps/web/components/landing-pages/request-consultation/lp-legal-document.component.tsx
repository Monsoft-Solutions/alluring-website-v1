'use client'

/**
 * One legal document, rendered inside the landing page's legal dialog.
 *
 * Nothing here reaches a visitor who never opens one: the document's text
 * and the markdown renderer are fetched as their own chunks on first open.
 * Both load inside one promise, so a failed download on a weak connection
 * lands in this component's fallback rather than in a render error that
 * would take the whole page (and a half-finished request) down with it.
 * The fallback is a link to the document in a new tab, not a retry: the
 * bundler's chunk loader remembers a failed chunk for the rest of the
 * session and never requests it again. The landing page stays open in its
 * own tab. The markdown is the same source /privacy, /terms and /cookies
 * render, so the two can never disagree.
 *
 * Links: one to another legal document stays a plain link, which the dialog
 * catches and opens in place; one to a third party's policy opens in a new
 * tab, so the landing page stays where it is; one to any other page of the
 * site is shown as text, because that would be a way off the page.
 */

import {
    type ComponentProps,
    type ComponentType,
    useEffect,
    useState,
} from 'react'
import type { Components, Options } from 'react-markdown'

import { LP_LEGAL_NEW_TAB_ATTR, legalDocFor, type LpLegalDoc } from './lp-legal'

const LOADERS: Readonly<Record<LpLegalDoc, () => Promise<string>>> = {
    privacy: () =>
        import('@/lib/data/legal/privacy-policy.content').then(
            (module) => module.privacyPolicyContent
        ),
    terms: () =>
        import('@/lib/data/legal/terms-of-service.content').then(
            (module) => module.termsOfServiceContent
        ),
    cookies: () =>
        import('@/lib/data/legal/cookie-policy.content').then(
            (module) => module.cookiePolicyContent
        ),
}

interface Renderer {
    readonly Markdown: ComponentType<Options>
    readonly plugins: NonNullable<Options['remarkPlugins']>
}

/** The markdown renderer, fetched once and shared by every document. */
let rendererPromise: Promise<Renderer> | null = null
function loadRenderer(): Promise<Renderer> {
    rendererPromise ??= Promise.all([
        import('react-markdown'),
        import('remark-gfm'),
    ]).then(([markdown, gfm]) => ({
        Markdown: markdown.default,
        plugins: [gfm.default],
    }))
    return rendererPromise
}

interface LpLegalDocumentProps {
    readonly doc: LpLegalDoc
    /** The document's own page, for the fallback link. */
    readonly href: string
    readonly loadingLabel: string
    readonly errorLabel: string
    readonly openInTabLabel: string
}

type Loaded =
    | {
          readonly doc: LpLegalDoc
          readonly text: string
          readonly renderer: Renderer
      }
    | { readonly doc: LpLegalDoc; readonly failed: true }

function LegalLink({ href = '', children }: ComponentProps<'a'>) {
    if (legalDocFor(href)) return <a href={href}>{children}</a>
    if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) {
        return (
            <a href={href} target='_blank' rel='noopener noreferrer'>
                {children}
            </a>
        )
    }
    return <span>{children}</span>
}

const COMPONENTS: Components = { a: LegalLink }

export function LpLegalDocument({
    doc,
    href,
    loadingLabel,
    errorLabel,
    openInTabLabel,
}: LpLegalDocumentProps) {
    const [loaded, setLoaded] = useState<Loaded | null>(null)

    useEffect(() => {
        let current = true
        Promise.all([LOADERS[doc](), loadRenderer()])
            .then(([text, renderer]) => {
                if (current) setLoaded({ doc, text, renderer })
            })
            .catch(() => {
                if (current) setLoaded({ doc, failed: true })
            })
        return () => {
            current = false
        }
    }, [doc])

    if (!loaded || loaded.doc !== doc) {
        return <p className='lp-legal-status'>{loadingLabel}</p>
    }

    if ('failed' in loaded) {
        return (
            <p className='lp-legal-status'>
                {errorLabel}{' '}
                <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    {...{ [LP_LEGAL_NEW_TAB_ATTR]: '' }}
                >
                    {openInTabLabel}
                </a>
            </p>
        )
    }

    const { Markdown, plugins } = loaded.renderer
    return (
        <div className='lp-legal-doc'>
            <Markdown remarkPlugins={plugins} components={COMPONENTS}>
                {loaded.text}
            </Markdown>
        </div>
    )
}
