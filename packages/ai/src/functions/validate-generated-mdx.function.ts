/**
 * Generated MDX Validator
 *
 * Runs over every piece of generated or revised blog content before it is
 * persisted, and neutralises anything the blog renderer cannot survive.
 *
 * The blog renderer (`apps/web/components/blog/post-markdown.component.tsx`)
 * deliberately runs MDX without `rehype-sanitize` so custom components work.
 * That trade means a malformed construct is not a swallowed error — it is an
 * unhandled throw on a public URL. Verified against MDX 3.1.1, the compiler the
 * renderer actually uses:
 *
 * | Construct                     | Fails at | Result                        |
 * | ----------------------------- | -------- | ----------------------------- |
 * | `<!-- html comment -->`       | compile  | throws — MDX has no HTML comments |
 * | `<CalloutBox>` never closed   | compile  | throws                        |
 * | `<Callout>` (undefined)       | render   | throws "Expected component"   |
 * | `{expression}` in prose       | render   | throws — undefined identifier |
 *
 * The CTA marker is itself an HTML comment and only works because
 * `findCTAInsertionPoint` splits the body on the first one before rendering.
 * The second one is not split out and takes the page down, so exactly one is
 * allowed through.
 *
 * Sanitisation is preferred over rejection: a post is never lost, but every
 * change is recorded so the admin UI can surface a writer prompt that has
 * started producing nonsense.
 *
 * @module @workspace/ai/functions/validate-generated-mdx
 */
import {
    DEFAULT_BLOG_CTA_ID,
    isBlogCtaId,
    isRenderableComponent,
    isWriterComponent,
    type MdxComponentName,
} from '@workspace/shared/content'

/**
 * What the validator changed, and why.
 *
 * Persisted to `pipelineState` so a silently-degraded post is still visible.
 */
export type MdxSanitizationAction = {
    /** Machine-readable reason, for grouping in the UI */
    kind:
        | 'unknown-component'
        | 'renderer-owned-component'
        | 'unbalanced-component'
        | 'stray-html-comment'
        | 'duplicate-cta-marker'
        | 'invalid-cta-id'
        | 'stray-expression'
    /** Human-readable one-liner for the admin card */
    detail: string
}

export type MdxValidationResult = {
    /** Content safe to persist and render */
    content: string
    /** Empty when the content was already clean */
    actions: MdxSanitizationAction[]
    /** True when nothing had to be changed */
    clean: boolean
}

/** Matches an opening, closing, or self-closing JSX-style tag. */
const TAG_PATTERN =
    /<(\/?)([A-Za-z][A-Za-z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g

/** Matches an HTML comment, including the CTA markers. */
const HTML_COMMENT_PATTERN = /<!--([\s\S]*?)-->/g

/** Matches a CTA marker's payload inside an HTML comment. */
const CTA_COMMENT_PATTERN = /^\s*CTA(?::(\w+))?\s*$/

/**
 * Strips a component's opening/closing tags while keeping its text children.
 *
 * Used for unknown components: the writer put words there, and the words are
 * usually fine — it is the tag the renderer cannot resolve.
 */
function stripTagsPreservingChildren(content: string, name: string): string {
    const paired = new RegExp(
        `<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}\\s*>`,
        'g'
    )
    const selfClosing = new RegExp(`<${name}(?:\\s[^>]*)?\\/>`, 'g')
    const orphanTag = new RegExp(`<\\/?${name}(?:\\s[^>]*)?\\/?>`, 'g')

    return content
        .replace(paired, (_match, children: string) => children.trim())
        .replace(selfClosing, '')
        .replace(orphanTag, '')
}

/**
 * Removes a component and everything inside it.
 *
 * Used for renderer-owned components: the children are a duplicate of content
 * that belongs elsewhere, so keeping them would leave the duplicate behind.
 */
function stripTagsAndChildren(content: string, name: string): string {
    const paired = new RegExp(
        `<${name}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${name}\\s*>`,
        'g'
    )
    const selfClosing = new RegExp(`<${name}(?:\\s[^>]*)?\\/>`, 'g')
    const orphanTag = new RegExp(`<\\/?${name}(?:\\s[^>]*)?\\/?>`, 'g')

    return content
        .replace(paired, '')
        .replace(selfClosing, '')
        .replace(orphanTag, '')
}

/**
 * Collects every capitalised tag name in the content, with open/close counts.
 *
 * Lowercase tags are left alone — MDX renders them as plain HTML elements and
 * they compile fine.
 */
function collectComponentUsage(
    content: string
): Map<string, { opened: number; closed: number; selfClosed: number }> {
    const usage = new Map<
        string,
        { opened: number; closed: number; selfClosed: number }
    >()

    for (const match of content.matchAll(TAG_PATTERN)) {
        const [, closing, name, , selfClose] = match
        if (!name || !/^[A-Z]/.test(name)) continue

        const entry = usage.get(name) ?? { opened: 0, closed: 0, selfClosed: 0 }
        if (selfClose === '/') entry.selfClosed += 1
        else if (closing === '/') entry.closed += 1
        else entry.opened += 1
        usage.set(name, entry)
    }

    return usage
}

/**
 * Escapes `{` and `}` that sit outside a component tag.
 *
 * MDX reads them as JavaScript expressions and throws on the undefined
 * identifier at render time. Braces inside a tag are legitimate props
 * (`width={1200}`) and are left alone.
 */
function escapeStrayExpressions(content: string): {
    content: string
    changed: boolean
} {
    if (!content.includes('{') && !content.includes('}')) {
        return { content, changed: false }
    }

    // Walk the content, copying tag spans verbatim and escaping the text between.
    let result = ''
    let cursor = 0
    let changed = false

    for (const match of content.matchAll(TAG_PATTERN)) {
        const start = match.index ?? 0
        const text = content.slice(cursor, start)
        const escaped = text.replace(/[{}]/g, (brace) =>
            brace === '{' ? '&#123;' : '&#125;'
        )
        if (escaped !== text) changed = true
        result += escaped + match[0]
        cursor = start + match[0].length
    }

    const tail = content.slice(cursor)
    const escapedTail = tail.replace(/[{}]/g, (brace) =>
        brace === '{' ? '&#123;' : '&#125;'
    )
    if (escapedTail !== tail) changed = true

    return { content: result + escapedTail, changed }
}

/**
 * Reduces HTML comments to at most one valid CTA marker.
 *
 * Everything else is removed: MDX cannot compile HTML comments at all, and a
 * marker that survives past the body split takes the page down.
 */
function normalizeHtmlComments(
    content: string,
    actions: MdxSanitizationAction[]
): string {
    let markerKept = false

    return content.replace(HTML_COMMENT_PATTERN, (whole, body: string) => {
        const ctaMatch = body.match(CTA_COMMENT_PATTERN)

        if (!ctaMatch) {
            actions.push({
                kind: 'stray-html-comment',
                detail: `Removed an HTML comment MDX cannot compile: ${whole.slice(0, 60)}`,
            })
            return ''
        }

        if (markerKept) {
            actions.push({
                kind: 'duplicate-cta-marker',
                detail: `Removed a second CTA marker (${whole.trim()}); only the first is split out of the body, the rest crash the page.`,
            })
            return ''
        }

        markerKept = true

        const id = ctaMatch[1]
        if (id && !isBlogCtaId(id)) {
            actions.push({
                kind: 'invalid-cta-id',
                detail: `CTA id "${id}" is not one the renderer knows, which would have rendered no CTA at all — changed to "${DEFAULT_BLOG_CTA_ID}".`,
            })
            return `<!-- CTA:${DEFAULT_BLOG_CTA_ID} -->`
        }

        return id ? `<!-- CTA:${id} -->` : `<!-- CTA:${DEFAULT_BLOG_CTA_ID} -->`
    })
}

/**
 * Makes generated content safe to persist and render.
 *
 * Idempotent: running it over already-validated content returns the content
 * unchanged with no actions.
 *
 * @param rawContent - Markdown/MDX straight out of a model
 * @returns Sanitised content plus a record of every change made
 *
 * @example
 * ```typescript
 * const { content, actions, clean } = validateGeneratedMdx(result.text)
 * if (!clean) {
 *   console.warn(`[Generation] sanitised ${actions.length} MDX hazard(s)`)
 * }
 * ```
 */
export function validateGeneratedMdx(rawContent: string): MdxValidationResult {
    const actions: MdxSanitizationAction[] = []
    let content = rawContent

    // 1. Components. Unknown ones lose their tags; renderer-owned ones and
    //    unbalanced ones lose the whole block.
    for (const [name, counts] of collectComponentUsage(content)) {
        if (!isRenderableComponent(name)) {
            content = stripTagsPreservingChildren(content, name)
            actions.push({
                kind: 'unknown-component',
                detail: `Removed <${name}> — not a component the renderer can resolve. Its text was kept.`,
            })
            continue
        }

        if (!isWriterComponent(name)) {
            content = stripTagsAndChildren(content, name)
            actions.push({
                kind: 'renderer-owned-component',
                detail: `Removed a writer-authored <${name}> block — this component is placed by the renderer, so keeping it would show two.`,
            })
            continue
        }

        if (counts.opened !== counts.closed) {
            // Every instance goes, not just the unbalanced one — with tags this
            // mismatched there is no reliable way to tell which opener lost its
            // closer. Losing a valid callout costs a styled box; leaving it
            // costs the whole page.
            content = stripTagsAndChildren(
                content,
                name satisfies MdxComponentName
            )
            actions.push({
                kind: 'unbalanced-component',
                detail: `Removed all <${name}> blocks — ${counts.opened} opening tag(s) against ${counts.closed} closing, which fails to compile.`,
            })
        }
    }

    // 2. HTML comments, including the CTA marker.
    content = normalizeHtmlComments(content, actions)

    // 3. Stray braces MDX would read as JavaScript.
    const expressions = escapeStrayExpressions(content)
    content = expressions.content
    if (expressions.changed) {
        actions.push({
            kind: 'stray-expression',
            detail: 'Escaped { } in body text — MDX reads them as JavaScript and throws on the undefined name.',
        })
    }

    // Collapse the blank-line runs that stripping can leave behind.
    content = content.replace(/\n{3,}/g, '\n\n').trim()

    return { content, actions, clean: actions.length === 0 }
}
