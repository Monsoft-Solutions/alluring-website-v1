/**
 * Keyword Ownership Registry — marketing pages
 *
 * Curated half of the registry: procedure pages, cost pages (Wave 1 of the
 * GEO strategy — 'planned' until built), financing, consultation landers,
 * surgeons and core pages. The blog half lives in
 * keyword-ownership-blog.constant.ts.
 *
 * Sources: docs/seo/keyword-map-cost-pages.md (ownership map + intent
 * split), apps/web/lib/data/procedures/*.data.ts (procedure keywords),
 * docs/seo/geo-strategy-us-audience.md.
 *
 * @module @workspace/shared/seo/keyword-ownership.constant
 */
import type { OwnedPage } from './keyword-ownership.type'

/**
 * Procedure pages — procedure intent. Their cost sections stay (they earn
 * the cost FAQ snippet), but price-intent clusters belong to cost pages.
 */
const PROCEDURE_PAGE_ENTRIES: OwnedPage[] = [
    {
        url: '/procedures/brazilian-butt-lift-bbl-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'bbl miami',
        ownsQueries: [
            'brazilian butt lift miami',
            'miami bbl',
            'bbl in miami',
            'bbl surgery miami',
            'bbl in miami florida',
            'brazilian butt lift procedure',
            'fat transfer to buttocks',
            'skinny bbl miami',
        ],
        mustNotTarget: [
            { query: 'bbl cost miami', ownedBy: '/bbl-cost-miami' },
            { query: 'how much does a bbl cost', ownedBy: '/bbl-cost-miami' },
            { query: 'bbl miami prices', ownedBy: '/bbl-cost-miami' },
        ],
    },
    {
        url: '/procedures/tummy-tuck-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'tummy tuck miami',
        ownsQueries: [
            'abdominoplasty miami',
            'tummy tuck surgery',
            'mini tummy tuck',
            'tummy tuck before and after',
            'tummy tuck belly button',
            'best tummy tuck surgeon miami',
        ],
        mustNotTarget: [
            {
                query: 'tummy tuck cost miami',
                ownedBy: '/tummy-tuck-cost-miami',
            },
            {
                query: 'how much does a tummy tuck cost',
                ownedBy: '/tummy-tuck-cost-miami',
            },
            {
                query: 'mini tummy tuck cost',
                ownedBy: '/tummy-tuck-cost-miami',
            },
        ],
    },
    {
        url: '/procedures/breast-augmentation-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'breast augmentation miami',
        ownsQueries: [
            'boob job miami',
            'breast implants miami',
            'natural looking boob job',
            'natural breast augmentation',
            'silicone implants',
            'saline implants',
            'gummy bear implants',
        ],
        mustNotTarget: [
            {
                query: 'breast augmentation cost miami',
                ownedBy: '/breast-augmentation-cost-miami',
            },
            {
                query: 'boob job cost',
                ownedBy: '/breast-augmentation-cost-miami',
            },
            {
                query: 'breast augmentation cost',
                ownedBy: '/breast-augmentation-cost-miami',
            },
        ],
    },
    {
        url: '/procedures/breast-lift-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'breast lift miami',
        ownsQueries: [
            'mastopexy',
            'breast lift surgery',
            'breast rejuvenation',
        ],
        mustNotTarget: [
            {
                query: 'breast lift cost',
                ownedBy: '/plastic-surgery-cost-miami',
            },
        ],
    },
    {
        url: '/procedures/breast-reduction-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'breast reduction miami',
        ownsQueries: [
            'reduction mammaplasty',
            'breast reduction surgery',
            'miami breast reduction',
            'breast reduction consultation',
        ],
    },
    {
        url: '/procedures/liposuction-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'liposuction miami',
        ownsQueries: [
            'miami lipo',
            'liposuction near me',
            'body contouring',
            'fat removal',
            'body sculpting',
            'lipo 360',
            'power-assisted liposuction',
        ],
        mustNotTarget: [
            {
                query: 'liposuction cost miami',
                ownedBy: '/liposuction-cost-miami',
            },
            { query: 'lipo cost', ownedBy: '/liposuction-cost-miami' },
        ],
    },
    {
        url: '/procedures/mommy-makeover-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'mommy makeover miami',
        ownsQueries: [
            'mom makeover',
            'post pregnancy surgery',
            'breast augmentation tummy tuck',
            'mommy makeover packages',
        ],
        mustNotTarget: [
            {
                query: 'mommy makeover cost',
                ownedBy: '/mommy-makeover-cost-miami',
            },
            {
                query: 'how much is a mommy makeover',
                ownedBy: '/mommy-makeover-cost-miami',
            },
            {
                query: 'mommy makeover consultation',
                ownedBy: '/mommy-makeover-consultation',
            },
        ],
    },
    {
        url: '/procedures/facelift-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'facelift miami',
        ownsQueries: [
            'rhytidectomy',
            'facial rejuvenation',
            'face lift surgery',
            'mini facelift',
            'full facelift',
        ],
    },
    {
        url: '/procedures/blepharoplasty-miami',
        kind: 'procedure',
        intent: 'procedure',
        status: 'live',
        primaryKeyword: 'blepharoplasty miami',
        ownsQueries: [
            'eyelid surgery miami',
            'upper eyelid surgery',
            'lower eyelid surgery',
            'cosmetic eyelid surgery',
            'upper blepharoplasty',
            'lower blepharoplasty',
            'eyelid lift',
        ],
    },
]

/**
 * Cost pages — price intent. Wave 1 of the GEO strategy (Cluster B);
 * 'planned' until the pages ship, but they own their clusters NOW so no
 * blog post or other page may claim them in the meantime.
 */
const COST_PAGE_ENTRIES: OwnedPage[] = [
    {
        url: '/plastic-surgery-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'plastic surgery cost miami',
        ownsQueries: [
            'how much is plastic surgery in miami',
            'plastic surgery prices',
            'affordable plastic surgery miami',
        ],
        notes: 'Hub page. Single-procedure cost queries belong to the sub-pages it links to.',
    },
    {
        url: '/bbl-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'bbl cost miami',
        ownsQueries: [
            'how much does a bbl cost',
            'bbl price',
            'bbl miami prices',
            'average cost of bbl in florida',
        ],
        mustNotTarget: [
            {
                query: 'bbl miami',
                ownedBy: '/procedures/brazilian-butt-lift-bbl-miami',
            },
            {
                query: 'brazilian butt lift miami',
                ownedBy: '/procedures/brazilian-butt-lift-bbl-miami',
            },
        ],
    },
    {
        url: '/tummy-tuck-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'tummy tuck cost miami',
        ownsQueries: [
            'how much is a tummy tuck',
            'how much does a tummy tuck cost',
            'mini tummy tuck cost',
            'abdominoplasty cost',
            'tummy tuck cost',
        ],
        mustNotTarget: [
            {
                query: 'tummy tuck miami',
                ownedBy: '/procedures/tummy-tuck-miami',
            },
        ],
    },
    {
        url: '/breast-augmentation-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'breast augmentation cost miami',
        ownsQueries: [
            'boob job cost',
            'how much is a boob job',
            'breast augmentation cost',
            'breast implant prices',
            'silicone implants cost',
        ],
        mustNotTarget: [
            {
                query: 'breast augmentation miami',
                ownedBy: '/procedures/breast-augmentation-miami',
            },
        ],
    },
    {
        url: '/mommy-makeover-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'mommy makeover cost',
        ownsQueries: [
            'how much is a mommy makeover',
            'mommy makeover price',
            'mini mommy makeover cost',
            'mommy makeover cost miami',
            'affordable mommy makeover',
        ],
        mustNotTarget: [
            {
                query: 'mommy makeover miami',
                ownedBy: '/procedures/mommy-makeover-miami',
            },
            {
                query: 'mommy makeover consultation',
                ownedBy: '/mommy-makeover-consultation',
            },
        ],
    },
    {
        url: '/liposuction-cost-miami',
        kind: 'cost',
        intent: 'price',
        status: 'planned',
        primaryKeyword: 'liposuction cost miami',
        ownsQueries: [
            'lipo cost',
            'lipo 360 cost',
            'liposuction price per area',
        ],
        mustNotTarget: [
            {
                query: 'liposuction miami',
                ownedBy: '/procedures/liposuction-miami',
            },
        ],
        notes: 'CONFLICT to resolve before building: next.config.mjs currently 301s /liposuction-cost-miami (a retired blog slug) to the procedure page. Remove that redirect when this page ships.',
    },
]

/** Financing — payment-method intent. Absorbs "payment plans" phrasings; a separate payment-plans page was deliberately not built. */
const FINANCING_ENTRIES: OwnedPage[] = [
    {
        url: '/plastic-surgery-financing-miami',
        kind: 'financing',
        intent: 'financing',
        status: 'live',
        primaryKeyword: 'plastic surgery financing miami',
        ownsQueries: [
            'plastic surgery financing',
            'plastic surgery payment plans',
            'plastic surgery financing bad credit',
            'carecredit plastic surgery',
            'cosmetic surgery financing',
        ],
    },
]

/** Consultation and conversion landers */
const LANDING_ENTRIES: OwnedPage[] = [
    {
        url: '/free-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'free plastic surgery consultation miami',
        ownsQueries: ['free cosmetic surgery consultation'],
    },
    {
        url: '/mommy-makeover-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'mommy makeover consultation',
        ownsQueries: ['mommy makeover consultation miami'],
    },
    {
        url: '/fly-in-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'fly in plastic surgery miami',
        ownsQueries: [
            'plastic surgery miami out of state',
            'traveling to miami for plastic surgery',
        ],
    },
    {
        url: '/after-weight-loss-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'plastic surgery after weight loss',
        ownsQueries: ['skin removal surgery after weight loss miami'],
    },
    {
        url: '/bridal-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'bridal plastic surgery',
        ownsQueries: ['plastic surgery before wedding'],
    },
    {
        url: '/new-beginning-consultation',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'new beginning plastic surgery consultation',
        ownsQueries: [],
    },
    {
        url: '/bbl-miami',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'bbl specials miami',
        ownsQueries: ['bbl deals miami'],
        notes: 'Conversion lander. The "bbl miami" head term belongs to the procedure page.',
        mustNotTarget: [
            {
                query: 'bbl miami',
                ownedBy: '/procedures/brazilian-butt-lift-bbl-miami',
            },
        ],
    },
    {
        url: '/mens-plastic-surgery-miami',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'male plastic surgery miami',
        ownsQueries: ['plastic surgery for men miami', 'mens plastic surgery'],
    },
    {
        url: '/consulta-gratis',
        kind: 'landing',
        intent: 'consultation',
        status: 'live',
        primaryKeyword: 'cirugia plastica miami',
        ownsQueries: [
            'consulta gratis cirugia plastica',
            'cirujano plastico miami',
        ],
        notes: 'Spanish-language page for US Spanish speakers (not international patients).',
    },
]

/** Surgeon profiles */
const SURGEON_ENTRIES: OwnedPage[] = [
    {
        url: '/dr-karlinsky',
        kind: 'surgeon',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'dr victoria karlinsky',
        ownsQueries: ['dr karlinsky miami', 'victoria karlinsky md'],
    },
    {
        url: '/dr-rita-shats',
        kind: 'surgeon',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'dr rita shats',
        ownsQueries: ['rita shats md'],
    },
]

/** Core site pages */
const CORE_PAGE_ENTRIES: OwnedPage[] = [
    {
        url: '/',
        kind: 'page',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'plastic surgery miami',
        ownsQueries: [
            'alluring plastic surgery',
            'miami plastic surgery',
            'plastic surgery clinic miami',
        ],
    },
    {
        url: '/about',
        kind: 'page',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'about alluring plastic surgery',
        ownsQueries: [],
    },
    {
        url: '/contact-us',
        kind: 'page',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'alluring plastic surgery contact',
        ownsQueries: ['plastic surgery near me miami'],
    },
    {
        url: '/faqs',
        kind: 'page',
        intent: 'informational',
        status: 'live',
        primaryKeyword: 'plastic surgery faq',
        ownsQueries: [],
    },
    {
        url: '/reviews',
        kind: 'page',
        intent: 'navigational',
        status: 'live',
        primaryKeyword: 'alluring plastic surgery reviews',
        ownsQueries: [],
    },
    {
        url: '/gallery',
        kind: 'page',
        intent: 'informational',
        status: 'live',
        primaryKeyword: 'plastic surgery before and after miami',
        ownsQueries: [
            'bbl before and after',
            'tummy tuck before and after miami',
        ],
    },
    {
        url: '/bmi-calculator',
        kind: 'page',
        intent: 'informational',
        status: 'live',
        primaryKeyword: 'bmi calculator for plastic surgery',
        ownsQueries: ['bmi requirements for plastic surgery'],
    },
    {
        url: '/miami-plastic-surgery-specials',
        kind: 'page',
        intent: 'price',
        status: 'live',
        primaryKeyword: 'plastic surgery specials miami',
        ownsQueries: ['miami plastic surgery deals'],
    },
]

/** All marketing (non-blog) registry entries */
export const MARKETING_PAGE_ENTRIES: OwnedPage[] = [
    ...PROCEDURE_PAGE_ENTRIES,
    ...COST_PAGE_ENTRIES,
    ...FINANCING_ENTRIES,
    ...LANDING_ENTRIES,
    ...SURGEON_ENTRIES,
    ...CORE_PAGE_ENTRIES,
]
