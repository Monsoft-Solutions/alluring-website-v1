/**
 * MDX Component Contract
 *
 * The single definition of what a blog post body may contain beyond plain
 * markdown. Three consumers derive from it and must never maintain their own
 * copy:
 *
 * 1. `apps/web/components/blog/mdx-components.tsx` — builds the component map
 *    handed to MDXRemote. A component missing from that map throws at render.
 * 2. `packages/ai` — builds the writer prompt's component vocabulary and the
 *    write-time validator's allow-list.
 * 3. `apps/web/lib/data/blog-cta-content.ts` — the CTA ids the marker may name.
 *
 * Why this matters more than it looks: the blog renderer deliberately runs
 * without `rehype-sanitize` so custom components work at all, which means an
 * undefined component or a malformed construct is a 500 on a public URL rather
 * than a swallowed error. Everything the writer is allowed to emit is listed
 * here, and everything else is stripped before the content is ever persisted.
 *
 * @module @workspace/shared/content
 */

/**
 * Components the blog renderer can resolve.
 *
 * Order is the order they appear in the writer prompt.
 */
export const MDX_RENDERER_COMPONENTS = [
    'Figure',
    'CalloutBox',
    'QuickAnswer',
] as const

export type MdxComponentName = (typeof MDX_RENDERER_COMPONENTS)[number]

/**
 * The subset the content writer may emit.
 *
 * `QuickAnswer` is deliberately excluded. The Quick Answer lives in the
 * `blog_post.quick_answer` column and the renderer places it above the article
 * body, so a writer-emitted one would render a second, competing block. The
 * validator strips any that appear.
 */
export const MDX_WRITER_COMPONENTS = ['Figure', 'CalloutBox'] as const

export type MdxWriterComponentName = (typeof MDX_WRITER_COMPONENTS)[number]

/**
 * A single prop on a documented component.
 */
export type MdxPropSpec = {
    readonly name: string
    readonly type: string
    readonly required: boolean
    readonly description: string
}

/**
 * A documented component: what it is for, what it accepts, how to write it.
 */
export type MdxComponentSpec = {
    readonly name: MdxComponentName
    /** One line on when to reach for it — used verbatim in the writer prompt */
    readonly purpose: string
    readonly props: readonly MdxPropSpec[]
    /** A copyable example, used verbatim in the writer prompt */
    readonly example: string
    /** False when the component is renderer-owned rather than writer-authored */
    readonly writerMayEmit: boolean
    /** Why the writer may not emit it — kept in the prompt so the model doesn't guess */
    readonly writerNote?: string
}

export const MDX_COMPONENT_SPECS: Readonly<
    Record<MdxComponentName, MdxComponentSpec>
> = {
    Figure: {
        name: 'Figure',
        purpose:
            'A captioned image. Leave one wherever an image would genuinely help the reader understand something the prose cannot show; the inline-image phase fills in the real src later.',
        props: [
            {
                name: 'src',
                type: 'string',
                required: true,
                description:
                    'Image URL. Use the literal placeholder "PENDING" — the inline-image phase replaces it.',
            },
            {
                name: 'alt',
                type: 'string',
                required: true,
                description:
                    'Describes the image for a reader who cannot see it. Not a caption, not the prompt.',
            },
            {
                name: 'caption',
                type: 'string',
                required: false,
                description:
                    'Shown under the image. Say something the image alone does not — captions are read far more than body copy.',
            },
            {
                name: 'width',
                type: 'number',
                required: false,
                description: 'Intrinsic width in pixels.',
            },
            {
                name: 'height',
                type: 'number',
                required: false,
                description: 'Intrinsic height in pixels.',
            },
        ],
        example:
            '<Figure src="PENDING" alt="Week-by-week swelling timeline after a tummy tuck" caption="Swelling peaks around day 3 and settles over 6–8 weeks." />',
        writerMayEmit: true,
    },

    CalloutBox: {
        name: 'CalloutBox',
        purpose:
            'Pulls one genuinely important warning or practical tip out of the flow. Use it sparingly — at most twice per post — or it stops meaning anything.',
        props: [
            {
                name: 'type',
                type: "'info' | 'warning' | 'success' | 'error'",
                required: false,
                description:
                    'Defaults to "info". Use "warning" for anything that affects patient safety.',
            },
        ],
        example:
            '<CalloutBox type="warning">\nCall your surgeon the same day if drainage turns cloudy, smells foul, or output climbs after it had been falling. These are the early signs of infection.\n</CalloutBox>',
        writerMayEmit: true,
    },

    QuickAnswer: {
        name: 'QuickAnswer',
        purpose:
            "The 40–70 word answer to the post's head query, shown above the article body.",
        props: [
            {
                name: 'question',
                type: 'string',
                required: true,
                description: 'The question being answered.',
            },
            {
                name: 'answer',
                type: 'string',
                required: true,
                description: 'The direct answer, number first.',
            },
            {
                name: 'details',
                type: 'string',
                required: false,
                description: 'One or two supporting sentences.',
            },
        ],
        example:
            '<QuickAnswer question="How long do tummy tuck drains stay in?" answer="Most drains come out 7 to 14 days after a tummy tuck." />',
        writerMayEmit: false,
        writerNote:
            'Never write this yourself. The Quick Answer is generated separately and placed above your first heading; writing your own produces two competing answers on the page.',
    },
} as const

// =============================================================================
// CTA MARKERS
// =============================================================================

/**
 * CTA ids the renderer can resolve.
 *
 * `BlogCTA` renders nothing at all when handed an id outside this set, so an
 * invented id is a silently missing mid-article conversion point. The validator
 * clamps anything unrecognised to {@link DEFAULT_BLOG_CTA_ID}.
 */
export const BLOG_CTA_IDS = [
    'default',
    'consultation',
    'bbl',
    'breast',
    'body',
    'facial',
] as const

export type BlogCtaId = (typeof BLOG_CTA_IDS)[number]

/** Where an unrecognised or missing CTA id lands. */
export const DEFAULT_BLOG_CTA_ID: BlogCtaId = 'consultation'

/**
 * Matches `<!-- CTA -->` and `<!-- CTA:type -->`.
 *
 * Kept in sync with `findCTAInsertionPoint` in
 * `apps/web/lib/utils/inject-cta-marker.util.ts`, which splits the body on the
 * first match. Note the marker is an HTML comment, which **MDX 3 cannot
 * compile** — it only works because the split removes it before rendering.
 * A second marker survives into the post-CTA half and crashes the page, so the
 * validator enforces exactly one.
 */
export const BLOG_CTA_MARKER_PATTERN = /<!--\s*CTA(?::(\w+))?\s*-->/g

/** Builds the canonical marker text for a CTA id. */
export function buildCtaMarker(id: BlogCtaId): string {
    return `<!-- CTA:${id} -->`
}

/** Narrows an arbitrary string to a known CTA id. */
export function isBlogCtaId(value: string): value is BlogCtaId {
    return (BLOG_CTA_IDS as readonly string[]).includes(value)
}

// =============================================================================
// DERIVED HELPERS
// =============================================================================

/** Narrows an arbitrary tag name to a component the renderer can resolve. */
export function isRenderableComponent(name: string): name is MdxComponentName {
    return (MDX_RENDERER_COMPONENTS as readonly string[]).includes(name)
}

/** Narrows an arbitrary tag name to one the writer is allowed to emit. */
export function isWriterComponent(
    name: string
): name is MdxWriterComponentName {
    return (MDX_WRITER_COMPONENTS as readonly string[]).includes(name)
}

/**
 * Renders the writer-facing component documentation.
 *
 * Lives here rather than in the prompt file so the prompt cannot describe a
 * component the renderer does not have, or miss one it does.
 */
export function buildMdxComponentReference(): string {
    const sections = MDX_WRITER_COMPONENTS.map((name) => {
        const spec = MDX_COMPONENT_SPECS[name]
        const props = spec.props
            .map(
                (prop) =>
                    `  - \`${prop.name}\` (${prop.type}${prop.required ? ', required' : ''}) — ${prop.description}`
            )
            .join('\n')

        return `**\`<${spec.name}>\`** — ${spec.purpose}\n${props}\n\n\`\`\`\n${spec.example}\n\`\`\``
    })

    const forbidden = MDX_RENDERER_COMPONENTS.filter(
        (name) => !MDX_COMPONENT_SPECS[name].writerMayEmit
    )
        .map(
            (name) =>
                `- \`<${name}>\` — ${MDX_COMPONENT_SPECS[name].writerNote ?? 'Renderer-owned.'}`
        )
        .join('\n')

    return `${sections.join('\n\n')}

**Do not write these:**
${forbidden}

Anything outside this list is deleted before publication — an invented component is not rendered, it is removed along with its tags.`
}
