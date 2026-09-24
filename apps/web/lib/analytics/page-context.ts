/**
 * Page context for analytics (issue #279).
 *
 * Every page view carries `page_type`, `procedure` and GA4's built-in
 * `content_group`, derived from the path alone so the root layout needs no
 * page data. Blog posts live at the root (`/[slug]`), so any single segment
 * that is not a known route or surgeon is a post; the route guard in
 * `page-context.test.ts` fails when a new static route is added without a
 * type here.
 *
 * Kept free of data imports: this module ships in the root layout bundle.
 *
 * @module lib/analytics/page-context
 */

export type PageType =
    | 'home'
    | 'procedure'
    | 'procedure_index'
    | 'blog_post'
    | 'blog_index'
    | 'gallery'
    | 'lp'
    | 'landing'
    | 'specials'
    | 'financing'
    | 'consultation'
    | 'thank_you'
    | 'surgeon'
    | 'about'
    | 'reviews'
    | 'faq'
    | 'tool'
    | 'social'
    | 'legal'
    | 'other'

export type ProcedureKey =
    | 'mommy_makeover'
    | 'bbl'
    | 'tummy_tuck'
    | 'breast_reduction'
    | 'breast_lift'
    | 'breast_augmentation'
    | 'liposuction'
    | 'facelift'
    | 'blepharoplasty'
    | 'none'

export type PageContext = {
    readonly page_type: PageType
    readonly procedure: ProcedureKey
    /** GA4's built-in content grouping dimension. */
    readonly content_group: string
}

/**
 * First match wins, so the combined and more specific procedures come first:
 * "mommy-makeover-tummy-tuck" is a mommy makeover, "breast-lift-with-
 * implants" a lift.
 */
const PROCEDURE_PATTERNS: ReadonlyArray<readonly [ProcedureKey, RegExp]> = [
    ['mommy_makeover', /mommy-makeover/],
    ['bbl', /(^|[-/])bbl([-/]|$)|brazilian-butt-lift|butt-lift/],
    ['tummy_tuck', /tummy-tuck|abdominoplasty/],
    ['breast_reduction', /breast-reduction|reduction-mammaplasty/],
    ['breast_lift', /breast-lift|mastopexy/],
    [
        'breast_augmentation',
        /breast-augmentation|breast-implant|augmentation|(^|[-/])implants?([-/]|$)/,
    ],
    ['liposuction', /lipo/],
    ['facelift', /face-?lift|neck-lift/],
    ['blepharoplasty', /blepharoplasty|eyelid/],
]

/** Surgeon bios share the root `/[slug]` route with blog posts. */
const SURGEON_SLUGS = new Set(['dr-karlinsky', 'dr-rita-shats'])

/** Exact paths. Checked before the prefix rules. */
const EXACT_TYPES: Readonly<Record<string, PageType>> = {
    '/': 'home',
    '/procedures': 'procedure_index',
    '/mens-plastic-surgery-miami': 'procedure_index',
    '/blog': 'blog_index',
    '/gallery': 'gallery',
    '/miami-plastic-surgery-specials': 'specials',
    '/promotions': 'specials',
    '/plastic-surgery-financing-miami': 'financing',
    '/contact-us': 'consultation',
    '/free-consultation': 'consultation',
    '/consulta-gratis': 'consultation',
    '/fly-in-consultation': 'consultation',
    '/after-weight-loss-consultation': 'consultation',
    '/bridal-consultation': 'consultation',
    '/mommy-makeover-consultation': 'consultation',
    '/new-beginning-consultation': 'consultation',
    '/about': 'about',
    '/reviews': 'reviews',
    '/faqs': 'faq',
    '/quiz': 'tool',
    '/bmi-calculator': 'tool',
    '/links': 'social',
    '/instagram': 'social',
    '/privacy': 'legal',
    '/terms': 'legal',
    '/cookies': 'legal',
    '/html-sitemap': 'legal',
}

/** Prefix rules, most specific first. A prefix matches itself + `/…`. */
const PREFIX_TYPES: ReadonlyArray<readonly [string, PageType]> = [
    ['/procedures', 'procedure'],
    ['/blog/categories', 'blog_index'],
    ['/blog/tags', 'blog_index'],
    ['/blog/authors', 'blog_index'],
    ['/blog', 'blog_post'],
    ['/gallery', 'gallery'],
    ['/lp', 'lp'],
    ['/landing', 'landing'],
    ['/promotions', 'specials'],
    ['/free-consultation', 'consultation'],
    ['/reviews', 'reviews'],
    ['/instagram', 'social'],
]

function normalizePath(pathname: string): string {
    const path = pathname.split(/[?#]/)[0] ?? '/'
    if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
    return path || '/'
}

export function getPageType(pathname: string): PageType {
    const path = normalizePath(pathname)

    // Every thank-you page, including /lp/…/thank-you and the landing ones.
    if (path === '/thank-you' || path.endsWith('/thank-you')) {
        return 'thank_you'
    }

    const exact = EXACT_TYPES[path]
    if (exact) return exact

    for (const [prefix, type] of PREFIX_TYPES) {
        if (path === prefix || path.startsWith(`${prefix}/`)) return type
    }

    const segments = path.split('/').filter(Boolean)
    if (segments.length === 1) {
        return SURGEON_SLUGS.has(segments[0]!) ? 'surgeon' : 'blog_post'
    }

    return 'other'
}

export function getProcedure(pathname: string): ProcedureKey {
    const path = normalizePath(pathname).toLowerCase()
    for (const [key, pattern] of PROCEDURE_PATTERNS) {
        if (pattern.test(path)) return key
    }
    return 'none'
}

/**
 * The context a page view and every later event on the page carry.
 * `procedure` is always set — `'none'` rather than absent — because
 * `gtag('set')` persists across client navigations and would otherwise
 * leak the previous page's procedure.
 */
export function getPageContext(pathname: string): PageContext {
    const page_type = getPageType(pathname)
    const procedure = getProcedure(pathname)
    return {
        page_type,
        procedure,
        content_group:
            procedure === 'none' ? page_type : `${page_type}:${procedure}`,
    }
}
