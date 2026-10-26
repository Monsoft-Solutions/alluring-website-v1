import { z } from 'zod'

export interface ProcedureFAQ {
    question: string
    answer: string
}

export interface ProcedureBenefit {
    title: string
    description: string
    iconName?: string // For dynamic icon loading if needed
}

export interface ProcedureStep {
    title: string
    description: string
    step: number
}

export interface ProcedureStats {
    duration: string
    anesthesia: string
    recovery: string
    results: string
    inpatientOutpatient?: string
}

export interface ProcedureQuickAnswer {
    question: string
    answer: string
    details?: string
}

/**
 * Inline content image for procedure pages
 * Used to add visual engagement throughout the content sections
 */
export interface ProcedureContentImage {
    /** Unique identifier for the image (used for positioning) */
    id: string
    /** Image source path (relative to public folder) */
    src: string
    /** Alt text for accessibility */
    alt: string
    /** Optional caption displayed below the image */
    caption?: string
    /** Section where this image should appear */
    section:
        | 'hero'
        | 'intro'
        | 'benefits'
        | 'process'
        | 'content'
        | 'recovery'
        | 'cta'
    /** Optional display variant */
    variant?: 'full-width' | 'half' | 'float-right' | 'float-left'
}

/**
 * One driver of price variation inside a procedure's published range.
 */
export interface ProcedurePriceFactor {
    /** Short name of the factor, e.g. "Volume of fat transfer" */
    label: string
    /** Why it moves the price */
    description: string
}

/**
 * One priced variant of a procedure, e.g. a mini tummy tuck or silicone
 * implants: a row in `ModulePriceTable` and an `Offer` of its own in the
 * structured-data graph.
 *
 * The figure is not typed here (issue #354): `line` names a line of the
 * price sheet (`price_line.line_key`, e.g. `mini`), and the page reads its
 * price, with any discount, from the pricing resolver.
 */
export interface ProcedurePriceOption {
    /** The variant as the page names it, e.g. "Mini tummy tuck" */
    label: string
    /** The price-sheet line it is priced from, e.g. `mini` */
    line: string
    /** Who it suits, in one short line */
    note?: string
}

/**
 * Published pricing for a procedure page: what the price covers, what moves
 * it, and, when the procedure has several prices, its variants.
 *
 * No figure lives here (issue #354). The starting price, the BBL range and
 * every option's price come from the pricing resolver
 * (`getProcedurePrices`), which the admin Pricing page edits, so the visible
 * price table and the `Offer` in structured data read the same numbers.
 */
export interface ProcedurePricing {
    /** What the quoted price covers */
    includes: string[]
    /** What moves the price inside the range */
    factors: ProcedurePriceFactor[]
    /**
     * The procedure's priced variants, when it has more than one price (a
     * tummy tuck by type). Set, the graph publishes one `Offer` per option
     * instead of the single starting-price one.
     */
    options?: ProcedurePriceOption[]
}

export interface Procedure {
    title: string
    slug: string
    description: string
    shortDescription?: string
    heroSubtitle?: string
    image?: string
    keywords?: string[]
    category?: 'face' | 'breast' | 'body' | 'combined'
    /**
     * Where the procedure is performed, for `SurgicalProcedure.bodyLocation`.
     * Set it on anything the category cannot describe: `category: 'body'` used
     * to emit "abdomen" for everything in it, so the BBL page claimed the
     * abdomen (#250). Unset, `procedureBodyLocation` omits the field rather
     * than guessing.
     */
    bodyLocation?: string
    faqs?: ProcedureFAQ[]
    content?: string // Markdown content for the main procedure description

    // SEO overrides. Unset, the procedure page derives both from the title via
    // `generateProcedureTitle` / `generateProcedureDescription`, which is why
    // the whole directory reads identically in the SERP. Set them on any page
    // competing for a head term.
    /** Hand-written <title>, used verbatim instead of the generated pattern */
    seoTitle?: string
    /** Hand-written meta description, used instead of the generated one */
    metaDescription?: string

    /** Published price table. Renders a pricing section and an Offer in JSON-LD. */
    pricing?: ProcedurePricing

    // Structured content for redesign
    quickStats?: ProcedureStats
    benefits?: ProcedureBenefit[]
    process?: ProcedureStep[]
    quickAnswer?: ProcedureQuickAnswer

    // Inline content images for enhanced engagement
    contentImages?: ProcedureContentImage[]

    // Freshness signals for SEO/LLM optimization
    /** ISO date string when the content was last modified */
    dateModified?: string
    /** ISO date string when the content was first published */
    datePublished?: string

    // Paid-LP copy fields — surfaced on /landing/procedure/[slug]. All
    // optional; the template falls back gracefully when unset. The hero's
    // starting price comes from the pricing resolver (#354), and no weekly
    // or monthly payment figure is published (canon D6).
    /** Outcome-focused H1 override (overrides `title` on the landing hero) */
    outcomeHeadline?: string
    /** One-line social proof for the landing hero */
    microProof?: string
    /** Optional inline scarcity line in the landing hero */
    urgencyNote?: string
    /** Reassurance shown under the landing form submit button */
    postSubmitPromise?: string

    // Legacy/Optional details
    details?: {
        intro: string
        benefits: string[]
        candidates: string[]
        recovery: string
        results: string
    }
}

/**
 * Zod schema for runtime validation of Procedure objects
 *
 * Validates core fields and optional datetime strings for SEO/LLM freshness signals.
 * Use this schema when creating/consuming Procedure objects to ensure data integrity.
 */
export const procedureSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
    description: z.string().min(1, 'Description is required'),
    shortDescription: z.string().optional(),
    heroSubtitle: z.string().optional(),
    image: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    category: z.enum(['face', 'breast', 'body', 'combined']).optional(),
    bodyLocation: z.string().min(1).optional(),
    faqs: z
        .array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        )
        .optional(),
    content: z.string().optional(),
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    pricing: z
        .object({
            includes: z.array(z.string()),
            factors: z.array(
                z.object({
                    label: z.string(),
                    description: z.string(),
                })
            ),
            options: z
                .array(
                    z.object({
                        label: z.string().min(1),
                        line: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
                        note: z.string().optional(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Structured content
    quickStats: z
        .object({
            duration: z.string(),
            anesthesia: z.string(),
            recovery: z.string(),
            results: z.string(),
            inpatientOutpatient: z.string().optional(),
        })
        .optional(),
    benefits: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                iconName: z.string().optional(),
            })
        )
        .optional(),
    process: z
        .array(
            z.object({
                title: z.string(),
                description: z.string(),
                step: z.number(),
            })
        )
        .optional(),
    quickAnswer: z
        .object({
            question: z.string(),
            answer: z.string(),
            details: z.string().optional(),
        })
        .optional(),

    // Inline content images
    contentImages: z
        .array(
            z.object({
                id: z.string(),
                src: z.string(),
                alt: z.string(),
                caption: z.string().optional(),
                section: z.enum([
                    'hero',
                    'intro',
                    'benefits',
                    'process',
                    'content',
                    'recovery',
                    'cta',
                ]),
                variant: z
                    .enum(['full-width', 'half', 'float-right', 'float-left'])
                    .optional(),
            })
        )
        .optional(),

    // Freshness signals for SEO/LLM optimization
    dateModified: z
        .string()
        .datetime({ message: 'dateModified must be a valid ISO 8601 datetime' })
        .optional(),
    datePublished: z
        .string()
        .datetime({
            message: 'datePublished must be a valid ISO 8601 datetime',
        })
        .optional(),

    // Paid-LP copy fields (all optional, hero falls back gracefully)
    outcomeHeadline: z.string().optional(),
    microProof: z.string().optional(),
    urgencyNote: z.string().optional(),
    postSubmitPromise: z.string().optional(),

    // Legacy details
    details: z
        .object({
            intro: z.string(),
            benefits: z.array(z.string()),
            candidates: z.array(z.string()),
            recovery: z.string(),
            results: z.string(),
        })
        .optional(),
})

/**
 * Inferred TypeScript type from the Zod schema
 */
export type ProcedureValidated = z.infer<typeof procedureSchema>
