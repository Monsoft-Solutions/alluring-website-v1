/**
 * Answer-First Structure Analysis
 *
 * Counts the mechanically checkable parts of the answer-first standard:
 * question-shaped headings, real comparison tables, CTA markers, external
 * links.
 *
 * Two consumers, deliberately sharing one implementation. The
 * `geo-retrievability-reviewer` agent feeds these counts to the model so it
 * grades what is actually on the page rather than what it thinks it counted,
 * and the `geo-audit` script uses them to turn "three consecutive posts contain
 * question headings, a table and a CTA marker" from an eyeball check into a command.
 *
 * What this cannot measure is the half that matters most — whether the first
 * sentence under a heading actually answers it, and whether a table helps a
 * reader decide anything. Those need judgement, which is the reviewer agent's
 * job. Treat everything here as the floor, never the score.
 *
 * @module @workspace/shared/content
 */

/**
 * A GFM separator row, matched as a whole line.
 *
 * Line-anchored on purpose. Scanning for `| --- |` as a substring double-counts:
 * a three-column separator contains two overlapping instances of that shape, so
 * one table reports as two. It also has to require a pipe, or a plain `---`
 * horizontal rule counts as a table.
 */
const TABLE_SEPARATOR_LINE = /^[ \t]*\|[ \t|:-]*-{3,}[ \t|:-]*$/gm

/** Matches `<!-- CTA -->` and `<!-- CTA:type -->`. */
const CTA_MARKER_PATTERN = /<!--\s*CTA(?::(\w+))?\s*-->/g

/**
 * An H2 or H3 line.
 *
 * Both levels count. The standard is about the headings a reader scans on the
 * way to their answer, and an FAQ-shaped post legitimately puts its questions
 * at H3 under a few topical H2s — counting only H2s failed exactly that shape
 * while the reviewer agent, which sees the whole document, scored it 94/100.
 */
const SECTION_HEADING_PATTERN = /^(#{2,3}) (.+)$/gm

/**
 * The site's own domain, for telling our links from everyone else's.
 *
 * Posts written before August 2026 link internally with absolute URLs
 * (`https://alluringplasticsurgery.com/procedures/...`) rather than
 * root-relative paths, so a naive `](http` count reads roughly six of our own
 * links per post as third-party citations.
 */
export const BUSINESS_DOMAIN = 'alluringplasticsurgery.com'

/** Any markdown link with an href. */
const MARKDOWN_LINK_PATTERN = /\]\(([^)\s]+)/g

/**
 * Whether an href points somewhere on this site.
 *
 * Matches the classification the internal- and external-links reviewers already
 * use: a root-relative path, or an absolute URL on our own domain.
 */
function isInternalHref(href: string): boolean {
    return href.startsWith('/') || href.includes(BUSINESS_DOMAIN)
}

/** A section heading and the level it sits at. */
export type SectionHeading = {
    level: 2 | 3
    text: string
}

export type GeoStructureAnalysis = {
    /** Every H2 and H3, in document order */
    headings: SectionHeading[]
    /** The subset phrased as questions */
    questionHeadings: SectionHeading[]
    /**
     * Share of section headings that are questions, 0–1. Zero when there are
     * no headings.
     */
    questionHeadingRatio: number
    /** Count of real GFM tables */
    tableCount: number
    /** Every CTA marker found, verbatim */
    ctaMarkers: string[]
    /** The id named by the first marker, or null for a bare `<!-- CTA -->` */
    ctaId: string | null
    /**
     * Links to our own pages, whether root-relative or absolute on our domain.
     *
     * This is the path from an informational post to a procedure, cost or
     * consultation page — the reason a blog post earns its place commercially,
     * and a signal search engines read as topical structure.
     */
    internalLinkCount: number
    /** Links to third-party sites */
    externalLinkCount: number
    /** Rough word count, matching how the pipeline counts elsewhere */
    wordCount: number
}

/**
 * Analyse a post body against the mechanically checkable parts of the standard.
 */
export function analyzeGeoStructure(content: string): GeoStructureAnalysis {
    const headings: SectionHeading[] = [
        ...content.matchAll(SECTION_HEADING_PATTERN),
    ].map((match) => ({
        level: (match[1] ?? '##').length as 2 | 3,
        text: (match[2] ?? '').trim(),
    }))
    const questionHeadings = headings.filter((heading) =>
        heading.text.endsWith('?')
    )
    const ctaMatches = [...content.matchAll(CTA_MARKER_PATTERN)]

    const hrefs = [...content.matchAll(MARKDOWN_LINK_PATTERN)].map(
        (match) => match[1] ?? ''
    )
    const internalLinkCount = hrefs.filter(isInternalHref).length

    return {
        headings,
        questionHeadings,
        questionHeadingRatio:
            headings.length === 0
                ? 0
                : questionHeadings.length / headings.length,
        tableCount: (content.match(TABLE_SEPARATOR_LINE) ?? []).length,
        ctaMarkers: ctaMatches.map((match) => match[0]),
        ctaId: ctaMatches[0]?.[1] ?? null,
        internalLinkCount,
        externalLinkCount: hrefs.length - internalLinkCount,
        wordCount: content.split(/\s+/).filter((word) => word.length > 0)
            .length,
    }
}

/**
 * The bar a generated post has to clear.
 *
 * `minQuestionHeadingRatio` is set at 0.6 — above the 0.34 the pipeline was
 * producing in August 2026, below the 0.79 the older hand-written posts hit, so
 * it is demanding without forcing a question heading onto a section that reads
 * better as a statement.
 */
export const GEO_AUDIT_THRESHOLDS = {
    minQuestionHeadingRatio: 0.6,
    /**
     * The writer prompt asks for 3–5 internal links and the corpus averages
     * around six, so this is a floor for the dead-end case rather than a
     * stretch target. A post that answers a question and offers the reader
     * nowhere to go next has done half its job.
     */
    minInternalLinks: 3,
    maxExternalLinks: 6,
} as const

export type GeoAuditGateResult = {
    /** Every gate passed */
    passed: boolean
    /** One line per failure, phrased for a terminal */
    failures: string[]
    analysis: GeoStructureAnalysis
}

/**
 * Apply the pass/fail gates to a post.
 *
 * @param content - The post body
 * @param options.expectTable - Whether the topic has something worth comparing.
 *   Defaults to true. Pass false for a post where a table would be decoration —
 *   a manufactured table is worse than none.
 * @param options.quickAnswer - The stored `quick_answer` value, checked for
 *   presence only. Its quality is the reviewer agent's call.
 */
export function runGeoAuditGate(
    content: string,
    options: { expectTable?: boolean; quickAnswer?: string | null } = {}
): GeoAuditGateResult {
    const { expectTable = true, quickAnswer } = options
    const analysis = analyzeGeoStructure(content)
    const failures: string[] = []

    if (!quickAnswer?.trim()) {
        failures.push('no Quick Answer')
    }

    if (expectTable && analysis.tableCount === 0) {
        failures.push('no comparison table')
    }

    if (
        analysis.questionHeadingRatio <
        GEO_AUDIT_THRESHOLDS.minQuestionHeadingRatio
    ) {
        failures.push(
            `${analysis.questionHeadings.length}/${analysis.headings.length} question headings (need ${Math.round(GEO_AUDIT_THRESHOLDS.minQuestionHeadingRatio * 100)}%)`
        )
    }

    if (analysis.ctaMarkers.length === 0) {
        failures.push('no CTA marker')
    } else if (analysis.ctaMarkers.length > 1) {
        failures.push(
            `${analysis.ctaMarkers.length} CTA markers (must be exactly 1)`
        )
    }

    if (analysis.internalLinkCount < GEO_AUDIT_THRESHOLDS.minInternalLinks) {
        failures.push(
            `${analysis.internalLinkCount} internal links (need ${GEO_AUDIT_THRESHOLDS.minInternalLinks})`
        )
    }

    if (analysis.externalLinkCount > GEO_AUDIT_THRESHOLDS.maxExternalLinks) {
        failures.push(
            `${analysis.externalLinkCount} external links (max ${GEO_AUDIT_THRESHOLDS.maxExternalLinks})`
        )
    }

    return { passed: failures.length === 0, failures, analysis }
}
