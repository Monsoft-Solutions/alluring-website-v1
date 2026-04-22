# Admin Lead Source Trends — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/analytics/leads` admin page that visualizes lead (contact submission) trends over time with filter-by-source, filter-by-medium, break-down-by dimension, custom date range, and stacked-area / line chart toggle — with instant in-view interactions.

**Architecture:** Hybrid — server classifies raw rows via a single Drizzle query + pure `classifyLeadAttribution()`, returns a compact array. Client caches via React Query (one fetch per date range), runs a pure TypeScript pipeline (filter → bucket → group) inside `useMemo`, renders with Recharts. Only date-range changes trigger refetches.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Drizzle ORM · Postgres (Supabase) · Recharts · TanStack Query v5 · shadcn/ui · Tailwind v4 · Vitest (new) · date-fns (new) · Zod.

**Design spec:** [`docs/superpowers/specs/2026-04-22-admin-lead-source-trends-design.md`](../specs/2026-04-22-admin-lead-source-trends-design.md)

---

## File Structure

### Admin app — new files

```
apps/admin/
├── app/(dashboard)/analytics/leads/
│   ├── page.tsx                                          # Route entry
│   ├── loading.tsx                                       # Route-level loading skeleton
│   └── error.tsx                                         # Route-level error boundary
├── app/api/admin/analytics/lead-trends/
│   └── route.ts                                          # GET handler
├── components/analytics/leads/
│   ├── lead-trends-page.component.tsx                    # Client shell; owns filter state + pipeline
│   ├── lead-trends-filter-bar.component.tsx              # Date range + multi-selects + breakdown picker
│   ├── lead-trends-summary-strip.component.tsx           # 4-tile summary
│   ├── lead-trends-chart.component.tsx                   # Recharts stacked-area/line + legend
│   ├── lead-trends-legend.component.tsx                  # Clickable legend (toggle/isolate)
│   ├── lead-trends-tooltip.component.tsx                 # Custom shared-cursor tooltip
│   └── custom-date-range-picker.component.tsx            # Calendar popover for "Custom…"
├── hooks/
│   └── use-lead-trends.hook.ts                           # React Query wrapper (current + prior period)
├── lib/analytics/
│   ├── classify-lead-attribution.ts                      # Classifier + KNOWN_REFERRERS
│   ├── lead-trends-pipeline.ts                           # Pure aggregation pipeline
│   └── series-colors.ts                                  # Palette + stable key→color mapping
├── lib/queries/
│   └── lead-trends.query.ts                              # Drizzle fetch used by API route
├── lib/types/analytics/
│   └── lead-trends.type.ts                               # All feature types
└── __tests__/                                            # Mirrors src layout for Vitest
    ├── lib/analytics/classify-lead-attribution.test.ts
    ├── lib/analytics/lead-trends-pipeline.test.ts
    └── lib/analytics/series-colors.test.ts
```

### Admin app — modified files

- `apps/admin/lib/types/analytics/date-range.type.ts` — add `'custom'` preset, granularity helper.
- `apps/admin/components/analytics/date-range-context.component.tsx` — add `granularity`, `setCustomRange`.
- `apps/admin/components/layout/sidebar.component.tsx` — convert Analytics entry to collapsible group.
- `apps/admin/package.json` — add `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `date-fns`.
- `apps/admin/vitest.config.ts` — new Vitest config (file-level new, listed here because it's a test-infra file).
- `apps/admin/tsconfig.json` — add `"vitest/globals"` to `types` if globals are used.

---

## Task Decomposition Overview

| #   | Task                         | Why first                                         |
| --- | ---------------------------- | ------------------------------------------------- |
| 1   | Vitest setup + date-fns      | Needed by classifier + pipeline tests             |
| 2   | Types module                 | Shared contract consumed by everything downstream |
| 3   | Classifier (TDD)             | Pure function; fully testable without DB          |
| 4   | Pipeline (TDD)               | Pure functions; independently testable            |
| 5   | Series colors (TDD)          | Pure; needed by chart                             |
| 6   | Drizzle query                | Thin DB wrapper consumed by API route             |
| 7   | API route                    | Wires query + classifier                          |
| 8   | React Query hook             | Wraps API route                                   |
| 9   | `DateRangeContext` extension | Needed by filter bar                              |
| 10  | Custom date range picker     | Needed by filter bar                              |
| 11  | Filter bar                   | Needed by page shell                              |
| 12  | Summary strip                | Needed by page shell                              |
| 13  | Tooltip + legend             | Needed by chart                                   |
| 14  | Chart                        | Needed by page shell                              |
| 15  | Page shell + route           | Wires everything                                  |
| 16  | Sidebar entry                | Navigation access                                 |
| 17  | Mobile pass + final QA       | Polish                                            |

---

## Task 1: Vitest setup + date-fns

**Files:**

- Create: `apps/admin/vitest.config.ts`
- Create: `apps/admin/__tests__/smoke.test.ts`
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/tsconfig.json`

- [ ] **Step 1.1: Install dev dependencies**

Run (from repo root):

```bash
pnpm --filter admin add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @types/node
pnpm --filter admin add date-fns
```

Expected: `package.json` updated; lockfile updated; no errors.

- [ ] **Step 1.2: Create Vitest config**

Create `apps/admin/vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    },
})
```

- [ ] **Step 1.3: Add test script to package.json**

In `apps/admin/package.json`, add under `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 1.4: Add vitest globals to tsconfig**

In `apps/admin/tsconfig.json`, ensure `"types"` (under `compilerOptions`) includes `"vitest/globals"`. If the array does not exist, add:

```json
"types": ["vitest/globals"]
```

If it exists, append `"vitest/globals"` to it.

- [ ] **Step 1.5: Write smoke test**

Create `apps/admin/__tests__/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('vitest setup', () => {
    it('runs a trivial assertion', () => {
        expect(1 + 1).toBe(2)
    })
})
```

- [ ] **Step 1.6: Run the smoke test**

Run (from repo root):

```bash
pnpm --filter admin test
```

Expected: `1 passed`, no failures.

- [ ] **Step 1.7: Commit**

```bash
git add apps/admin/package.json apps/admin/pnpm-lock.yaml pnpm-lock.yaml apps/admin/vitest.config.ts apps/admin/tsconfig.json apps/admin/__tests__/smoke.test.ts
git commit -m "chore(admin): add vitest + date-fns for analytics testing"
```

(If `pnpm-lock.yaml` is only at repo root, adjust `git add` accordingly — include whichever lockfile changed.)

---

## Task 2: Feature types module

**Files:**

- Create: `apps/admin/lib/types/analytics/lead-trends.type.ts`

- [ ] **Step 2.1: Create the types file**

Create `apps/admin/lib/types/analytics/lead-trends.type.ts`:

```ts
/**
 * Types for the admin lead-source-trends analytics feature.
 */

export type LeadClassification =
    | 'utm'
    | 'click-id'
    | 'referrer'
    | 'source-field'
    | 'direct'

/** Subset of ContactSubmission fields the classifier reads. */
export type LeadAttributionInput = {
    utmSource: string | null
    utmMedium: string | null
    source: string | null
    referrer: string | null
    gclid: string | null
    fbclid: string | null
    ttclid: string | null
}

export type LeadAttribution = {
    source: string
    medium: string
    classification: LeadClassification
}

/** One classified lead as returned by the API and consumed by the client pipeline. */
export type ClassifiedLead = {
    ts: string // ISO timestamp
    source: string
    medium: string
    classification: LeadClassification
}

export type LeadTrendsResponse = {
    leads: ClassifiedLead[]
    totalCount: number
    rangeStart: string
    rangeEnd: string
}

export type Granularity = 'hour' | 'day' | 'week'

export type BreakdownBy = 'source' | 'medium' | 'sourceMedium'

export type LeadTrendsFilters = {
    sources: string[]
    mediums: string[]
}

export type TrendBucket = {
    ts: string
    series: Record<string, number>
}

export type TrendPipelineOutput = {
    buckets: TrendBucket[]
    seriesKeys: string[]
    totals: Record<string, number>
    overallTotal: number
    topSeries: { key: string; count: number } | null
}

export type LeadTrendsSummary = {
    total: number
    topSeries: { key: string; count: number } | null
    priorDelta: {
        count: number
        percent: number | null
    }
    unclassifiedCount: number
    unclassifiedRatio: number
}

export type ChartMode = 'stacked' | 'line'
```

- [ ] **Step 2.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add apps/admin/lib/types/analytics/lead-trends.type.ts
git commit -m "feat(admin): add lead-trends feature types"
```

---

## Task 3: Attribution classifier (TDD)

**Files:**

- Create: `apps/admin/lib/analytics/classify-lead-attribution.ts`
- Create: `apps/admin/__tests__/lib/analytics/classify-lead-attribution.test.ts`

- [ ] **Step 3.1: Write failing tests first**

Create `apps/admin/__tests__/lib/analytics/classify-lead-attribution.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'
import type { LeadAttributionInput } from '@/lib/types/analytics/lead-trends.type'

const emptyInput: LeadAttributionInput = {
    utmSource: null,
    utmMedium: null,
    source: null,
    referrer: null,
    gclid: null,
    fbclid: null,
    ttclid: null,
}

describe('classifyLeadAttribution', () => {
    describe('UTM priority', () => {
        it('uses utm_source + utm_medium when both present', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: 'google',
                utmMedium: 'cpc',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'cpc',
                classification: 'utm',
            })
        })

        it('lowercases and trims UTM values', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: '  GOOGLE  ',
                utmMedium: '  CPC  ',
            })
            expect(result.source).toBe('google')
            expect(result.medium).toBe('cpc')
        })

        it('does not use UTM when utm_medium is missing', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: 'google',
                utmMedium: null,
                gclid: 'abc',
            })
            expect(result.classification).toBe('click-id')
        })

        it('does not use UTM when either value is empty string', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                utmSource: '',
                utmMedium: 'cpc',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Click ID priority', () => {
        it('classifies gclid as google/cpc', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                gclid: 'abc',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'cpc',
                classification: 'click-id',
            })
        })

        it('classifies fbclid as facebook/paid', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                fbclid: 'x',
            })
            expect(result).toEqual({
                source: 'facebook',
                medium: 'paid',
                classification: 'click-id',
            })
        })

        it('classifies ttclid as tiktok/paid', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                ttclid: 'x',
            })
            expect(result).toEqual({
                source: 'tiktok',
                medium: 'paid',
                classification: 'click-id',
            })
        })

        it('prefers gclid over referrer', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                gclid: 'x',
                referrer: 'https://www.facebook.com/',
            })
            expect(result.source).toBe('google')
        })
    })

    describe('Referrer priority', () => {
        it('classifies google.com as google/organic', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.google.com/search?q=foo',
            })
            expect(result).toEqual({
                source: 'google',
                medium: 'organic',
                classification: 'referrer',
            })
        })

        it('classifies google.co.uk as google/organic', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.google.co.uk/',
            })
            expect(result.source).toBe('google')
            expect(result.medium).toBe('organic')
        })

        it('classifies facebook.com as facebook/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.facebook.com/',
            })
            expect(result).toEqual({
                source: 'facebook',
                medium: 'social',
                classification: 'referrer',
            })
        })

        it('classifies x.com as twitter/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://x.com/home',
            })
            expect(result.source).toBe('twitter')
            expect(result.medium).toBe('social')
        })

        it('classifies youtu.be as youtube/social', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://youtu.be/abc',
            })
            expect(result.source).toBe('youtube')
        })

        it('maps unknown hosts to referral/<host>', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://nytimes.com/article/123',
            })
            expect(result).toEqual({
                source: 'referral/nytimes.com',
                medium: 'referral',
                classification: 'referrer',
            })
        })

        it('strips www. from unknown hosts', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'https://www.somepressblog.com/',
            })
            expect(result.source).toBe('referral/somepressblog.com')
        })

        it('falls through on malformed referrer URL', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'not a url',
            })
            expect(result.classification).toBe('direct')
        })

        it('falls through on javascript: URL', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                referrer: 'javascript:void(0)',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Source-field fallback', () => {
        it('uses legacy source field when nothing else matches', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: 'Newsletter',
            })
            expect(result).toEqual({
                source: 'newsletter',
                medium: '(none)',
                classification: 'source-field',
            })
        })

        it('trims whitespace from source field', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: '  partner  ',
            })
            expect(result.source).toBe('partner')
        })

        it('treats empty source field as direct', () => {
            const result = classifyLeadAttribution({
                ...emptyInput,
                source: '',
            })
            expect(result.classification).toBe('direct')
        })
    })

    describe('Default direct', () => {
        it('classifies empty input as direct', () => {
            expect(classifyLeadAttribution(emptyInput)).toEqual({
                source: 'direct',
                medium: 'direct',
                classification: 'direct',
            })
        })
    })
})
```

- [ ] **Step 3.2: Run tests to verify they fail**

Run:

```bash
pnpm --filter admin test classify-lead-attribution
```

Expected: FAIL with module-not-found error for `@/lib/analytics/classify-lead-attribution`.

- [ ] **Step 3.3: Implement the classifier**

Create `apps/admin/lib/analytics/classify-lead-attribution.ts`:

```ts
import type {
    LeadAttribution,
    LeadAttributionInput,
} from '@/lib/types/analytics/lead-trends.type'

/**
 * Maps a hostname to a canonical { source, medium } attribution.
 * Order does not matter; hosts are matched exactly after normalization.
 */
const KNOWN_REFERRERS: Record<string, { source: string; medium: string }> = {
    // Search engines → organic
    'google.com': { source: 'google', medium: 'organic' },
    'bing.com': { source: 'bing', medium: 'organic' },
    'duckduckgo.com': { source: 'duckduckgo', medium: 'organic' },
    'yahoo.com': { source: 'yahoo', medium: 'organic' },

    // Social
    'facebook.com': { source: 'facebook', medium: 'social' },
    'm.facebook.com': { source: 'facebook', medium: 'social' },
    'fb.com': { source: 'facebook', medium: 'social' },
    'instagram.com': { source: 'instagram', medium: 'social' },
    'tiktok.com': { source: 'tiktok', medium: 'social' },
    'linkedin.com': { source: 'linkedin', medium: 'social' },
    'twitter.com': { source: 'twitter', medium: 'social' },
    'x.com': { source: 'twitter', medium: 'social' },
    't.co': { source: 'twitter', medium: 'social' },
    'pinterest.com': { source: 'pinterest', medium: 'social' },
    'youtube.com': { source: 'youtube', medium: 'social' },
    'youtu.be': { source: 'youtube', medium: 'social' },
}

function normalizeHost(host: string): string {
    return host.toLowerCase().replace(/^www\./, '')
}

/**
 * Parse the hostname from a raw referrer string. Returns null for
 * unparseable input (empty, malformed, non-http protocols).
 */
function parseReferrerHost(referrer: string | null): string | null {
    if (!referrer) return null
    try {
        const url = new URL(referrer)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null
        }
        return normalizeHost(url.hostname)
    } catch {
        return null
    }
}

/**
 * Match a hostname against KNOWN_REFERRERS. Falls through ccTLD variants of
 * google (google.co.uk, google.es, …) by mapping any google.* host to google.com.
 */
function lookupKnownReferrer(
    host: string
): { source: string; medium: string } | null {
    if (host === 'google.com' || /^google\.[a-z.]+$/.test(host)) {
        return KNOWN_REFERRERS['google.com']!
    }
    return KNOWN_REFERRERS[host] ?? null
}

/**
 * Classify a lead into a canonical { source, medium, classification } tuple.
 * Never throws; always returns a valid value.
 */
export function classifyLeadAttribution(
    input: LeadAttributionInput
): LeadAttribution {
    const utmSource = input.utmSource?.trim().toLowerCase()
    const utmMedium = input.utmMedium?.trim().toLowerCase()
    if (utmSource && utmMedium) {
        return { source: utmSource, medium: utmMedium, classification: 'utm' }
    }

    if (input.gclid) {
        return { source: 'google', medium: 'cpc', classification: 'click-id' }
    }
    if (input.fbclid) {
        return {
            source: 'facebook',
            medium: 'paid',
            classification: 'click-id',
        }
    }
    if (input.ttclid) {
        return { source: 'tiktok', medium: 'paid', classification: 'click-id' }
    }

    const host = parseReferrerHost(input.referrer)
    if (host) {
        const known = lookupKnownReferrer(host)
        if (known) {
            return { ...known, classification: 'referrer' }
        }
        return {
            source: `referral/${host}`,
            medium: 'referral',
            classification: 'referrer',
        }
    }

    const source = input.source?.trim().toLowerCase()
    if (source) {
        return { source, medium: '(none)', classification: 'source-field' }
    }

    return { source: 'direct', medium: 'direct', classification: 'direct' }
}
```

- [ ] **Step 3.4: Run tests to verify they pass**

Run:

```bash
pnpm --filter admin test classify-lead-attribution
```

Expected: all tests PASS.

- [ ] **Step 3.5: Commit**

```bash
git add apps/admin/lib/analytics/classify-lead-attribution.ts apps/admin/__tests__/lib/analytics/classify-lead-attribution.test.ts
git commit -m "feat(admin): add lead attribution classifier"
```

---

## Task 4: Client aggregation pipeline (TDD)

**Files:**

- Create: `apps/admin/lib/analytics/lead-trends-pipeline.ts`
- Create: `apps/admin/__tests__/lib/analytics/lead-trends-pipeline.test.ts`

- [ ] **Step 4.1: Write failing tests first**

Create `apps/admin/__tests__/lib/analytics/lead-trends-pipeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import {
    applyFilters,
    bucketLeads,
    computeSummary,
    deriveGranularity,
    groupByBreakdown,
} from '@/lib/analytics/lead-trends-pipeline'
import type { ClassifiedLead } from '@/lib/types/analytics/lead-trends.type'

const lead = (
    ts: string,
    source: string,
    medium: string,
    classification: ClassifiedLead['classification'] = 'utm'
): ClassifiedLead => ({ ts, source, medium, classification })

describe('deriveGranularity', () => {
    it('returns hour for ranges ≤ 2 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-22T00:00:00Z'),
                endDate: new Date('2026-04-22T23:59:59Z'),
            })
        ).toBe('hour')
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-21T00:00:00Z'),
                endDate: new Date('2026-04-22T23:59:59Z'),
            })
        ).toBe('hour')
    })

    it('returns day for ranges between 3 and 31 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-04-01T00:00:00Z'),
                endDate: new Date('2026-04-28T23:59:59Z'),
            })
        ).toBe('day')
    })

    it('returns week for ranges > 31 days', () => {
        expect(
            deriveGranularity({
                startDate: new Date('2026-01-01T00:00:00Z'),
                endDate: new Date('2026-04-01T23:59:59Z'),
            })
        ).toBe('week')
    })
})

describe('applyFilters', () => {
    const leads = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc'),
        lead('2026-04-01T00:00:00Z', 'facebook', 'paid'),
        lead('2026-04-01T00:00:00Z', 'google', 'organic'),
    ]

    it('returns all leads when both filters are empty', () => {
        expect(applyFilters(leads, { sources: [], mediums: [] })).toHaveLength(
            3
        )
    })

    it('filters by sources only', () => {
        const result = applyFilters(leads, { sources: ['google'], mediums: [] })
        expect(result).toHaveLength(2)
        expect(result.every((l) => l.source === 'google')).toBe(true)
    })

    it('filters by mediums only', () => {
        const result = applyFilters(leads, { sources: [], mediums: ['paid'] })
        expect(result).toHaveLength(1)
        expect(result[0]!.source).toBe('facebook')
    })

    it('intersects source + medium filters', () => {
        const result = applyFilters(leads, {
            sources: ['google'],
            mediums: ['cpc'],
        })
        expect(result).toHaveLength(1)
    })

    it('returns empty when nothing matches', () => {
        expect(
            applyFilters(leads, { sources: ['bing'], mediums: [] })
        ).toHaveLength(0)
    })
})

describe('bucketLeads', () => {
    it('seeds empty buckets across the full range at day granularity', () => {
        const leads = [lead('2026-04-03T12:00:00Z', 'google', 'cpc')]
        const result = bucketLeads(leads, 'day', {
            startDate: new Date('2026-04-01T00:00:00Z'),
            endDate: new Date('2026-04-05T23:59:59Z'),
        })
        expect(result.size).toBe(5)
        // Every bucket key is an ISO date at 00:00 local
        const keys = [...result.keys()]
        expect(keys[0]!.startsWith('2026-04-01')).toBe(true)
        expect(keys[4]!.startsWith('2026-04-05')).toBe(true)
        // The lead falls in the Apr 3 bucket
        const apr3Entries = result.get(keys[2]!)
        expect(apr3Entries).toHaveLength(1)
    })

    it('buckets by hour', () => {
        const leads = [
            lead('2026-04-01T10:15:00Z', 'google', 'cpc'),
            lead('2026-04-01T10:45:00Z', 'google', 'cpc'),
            lead('2026-04-01T11:00:00Z', 'facebook', 'paid'),
        ]
        const result = bucketLeads(leads, 'hour', {
            startDate: new Date('2026-04-01T10:00:00Z'),
            endDate: new Date('2026-04-01T12:00:00Z'),
        })
        // 3 one-hour buckets (10, 11, 12)
        expect(result.size).toBe(3)
        // Two leads in the first bucket, one in the second
        const keys = [...result.keys()]
        expect(result.get(keys[0]!)).toHaveLength(2)
        expect(result.get(keys[1]!)).toHaveLength(1)
    })

    it('buckets by ISO week (Monday start)', () => {
        const leads = [
            lead('2026-04-06T00:00:00Z', 'google', 'cpc'), // Mon wk15
            lead('2026-04-09T00:00:00Z', 'google', 'cpc'), // Thu wk15
            lead('2026-04-13T00:00:00Z', 'facebook', 'paid'), // Mon wk16
        ]
        const result = bucketLeads(leads, 'week', {
            startDate: new Date('2026-04-06T00:00:00Z'),
            endDate: new Date('2026-04-20T23:59:59Z'),
        })
        expect(result.size).toBe(3)
        const firstBucket = [...result.values()][0]!
        expect(firstBucket).toHaveLength(2)
    })
})

describe('groupByBreakdown', () => {
    const sample: ClassifiedLead[] = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc'),
        lead('2026-04-01T00:00:00Z', 'google', 'organic'),
        lead('2026-04-01T00:00:00Z', 'facebook', 'paid'),
    ]
    const bucketMap = new Map<string, ClassifiedLead[]>([
        ['2026-04-01', sample],
    ])

    it('groups by source', () => {
        const result = groupByBreakdown(bucketMap, 'source')
        expect(result.buckets).toHaveLength(1)
        expect(result.buckets[0]!.series).toEqual({ google: 2, facebook: 1 })
        expect(result.seriesKeys.sort()).toEqual(['facebook', 'google'])
        expect(result.totals).toEqual({ google: 2, facebook: 1 })
        expect(result.overallTotal).toBe(3)
        expect(result.topSeries).toEqual({ key: 'google', count: 2 })
    })

    it('groups by medium', () => {
        const result = groupByBreakdown(bucketMap, 'medium')
        expect(result.buckets[0]!.series).toEqual({
            cpc: 1,
            organic: 1,
            paid: 1,
        })
    })

    it('groups by sourceMedium pair', () => {
        const result = groupByBreakdown(bucketMap, 'sourceMedium')
        expect(result.buckets[0]!.series).toEqual({
            'google / cpc': 1,
            'google / organic': 1,
            'facebook / paid': 1,
        })
    })

    it('returns topSeries null for empty input', () => {
        const result = groupByBreakdown(new Map(), 'source')
        expect(result.topSeries).toBeNull()
        expect(result.overallTotal).toBe(0)
    })
})

describe('computeSummary', () => {
    const filtered: ClassifiedLead[] = [
        lead('2026-04-01T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-04-02T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-04-03T00:00:00Z', 'direct', 'direct', 'direct'),
    ]
    const prior: ClassifiedLead[] = [
        lead('2026-03-01T00:00:00Z', 'google', 'cpc', 'utm'),
        lead('2026-03-02T00:00:00Z', 'facebook', 'paid', 'click-id'),
    ]

    it('computes total and top series', () => {
        const summary = computeSummary(filtered, prior, 'source')
        expect(summary.total).toBe(3)
        expect(summary.topSeries).toEqual({ key: 'google', count: 2 })
    })

    it('computes prior-period delta percent', () => {
        const summary = computeSummary(filtered, prior, 'source')
        // 3 vs 2 => +50%
        expect(summary.priorDelta.count).toBe(1)
        expect(summary.priorDelta.percent).toBeCloseTo(0.5)
    })

    it('returns null percent when prior is empty', () => {
        const summary = computeSummary(filtered, [], 'source')
        expect(summary.priorDelta.percent).toBeNull()
    })

    it('counts unclassified by classification === direct', () => {
        const summary = computeSummary(filtered, [], 'source')
        expect(summary.unclassifiedCount).toBe(1)
        expect(summary.unclassifiedRatio).toBeCloseTo(1 / 3)
    })

    it('returns empty summary on zero leads', () => {
        const summary = computeSummary([], [], 'source')
        expect(summary.total).toBe(0)
        expect(summary.topSeries).toBeNull()
        expect(summary.unclassifiedRatio).toBe(0)
    })
})
```

- [ ] **Step 4.2: Run tests to verify they fail**

Run:

```bash
pnpm --filter admin test lead-trends-pipeline
```

Expected: FAIL — module not found.

- [ ] **Step 4.3: Implement the pipeline**

Create `apps/admin/lib/analytics/lead-trends-pipeline.ts`:

```ts
import {
    addDays,
    addHours,
    addWeeks,
    differenceInCalendarDays,
    startOfDay,
    startOfHour,
    startOfISOWeek,
} from 'date-fns'

import type {
    BreakdownBy,
    ClassifiedLead,
    Granularity,
    LeadTrendsFilters,
    LeadTrendsSummary,
    TrendBucket,
    TrendPipelineOutput,
} from '@/lib/types/analytics/lead-trends.type'

/**
 * Filter a classified-lead list by source and medium sets.
 * An empty array for a dimension means "no filter on this dimension".
 */
export function applyFilters(
    leads: ClassifiedLead[],
    filters: LeadTrendsFilters
): ClassifiedLead[] {
    const sourceSet = filters.sources.length ? new Set(filters.sources) : null
    const mediumSet = filters.mediums.length ? new Set(filters.mediums) : null
    if (!sourceSet && !mediumSet) return leads
    return leads.filter(
        (lead) =>
            (!sourceSet || sourceSet.has(lead.source)) &&
            (!mediumSet || mediumSet.has(lead.medium))
    )
}

/**
 * Pick the bucket granularity for a given date range.
 *   ≤ 2 days  → hour
 *   ≤ 31 days → day
 *   > 31 days → week
 */
export function deriveGranularity(range: {
    startDate: Date
    endDate: Date
}): Granularity {
    const days = differenceInCalendarDays(range.endDate, range.startDate)
    if (days <= 1) return 'hour'
    if (days <= 30) return 'day'
    return 'week'
}

function bucketStart(date: Date, granularity: Granularity): Date {
    switch (granularity) {
        case 'hour':
            return startOfHour(date)
        case 'day':
            return startOfDay(date)
        case 'week':
            return startOfISOWeek(date)
    }
}

function advance(date: Date, granularity: Granularity): Date {
    switch (granularity) {
        case 'hour':
            return addHours(date, 1)
        case 'day':
            return addDays(date, 1)
        case 'week':
            return addWeeks(date, 1)
    }
}

/**
 * Bucket leads into a Map<bucketStartISO, Lead[]>. Pre-seeds every bucket
 * across the range so consumers render a continuous x-axis.
 */
export function bucketLeads(
    leads: ClassifiedLead[],
    granularity: Granularity,
    range: { startDate: Date; endDate: Date }
): Map<string, ClassifiedLead[]> {
    const buckets = new Map<string, ClassifiedLead[]>()

    let cursor = bucketStart(range.startDate, granularity)
    const endBucket = bucketStart(range.endDate, granularity)
    while (cursor.getTime() <= endBucket.getTime()) {
        buckets.set(cursor.toISOString(), [])
        cursor = advance(cursor, granularity)
    }

    for (const lead of leads) {
        const leadDate = new Date(lead.ts)
        const key = bucketStart(leadDate, granularity).toISOString()
        const existing = buckets.get(key)
        if (existing) existing.push(lead)
    }

    return buckets
}

function seriesKeyFor(lead: ClassifiedLead, breakdownBy: BreakdownBy): string {
    switch (breakdownBy) {
        case 'source':
            return lead.source
        case 'medium':
            return lead.medium
        case 'sourceMedium':
            return `${lead.source} / ${lead.medium}`
    }
}

/**
 * Transform the bucket map into a per-bucket record of seriesKey → count,
 * plus global aggregates.
 */
export function groupByBreakdown(
    bucketMap: Map<string, ClassifiedLead[]>,
    breakdownBy: BreakdownBy
): TrendPipelineOutput {
    const keySet = new Set<string>()
    const totals: Record<string, number> = {}
    const buckets: TrendBucket[] = []
    let overallTotal = 0

    for (const [ts, leadsInBucket] of bucketMap) {
        const series: Record<string, number> = {}
        for (const lead of leadsInBucket) {
            const key = seriesKeyFor(lead, breakdownBy)
            series[key] = (series[key] ?? 0) + 1
            totals[key] = (totals[key] ?? 0) + 1
            keySet.add(key)
            overallTotal += 1
        }
        buckets.push({ ts, series })
    }

    const seriesKeys = [...keySet].sort(
        (a, b) => (totals[b] ?? 0) - (totals[a] ?? 0)
    )
    const topSeries =
        seriesKeys.length > 0
            ? { key: seriesKeys[0]!, count: totals[seriesKeys[0]!] ?? 0 }
            : null

    return { buckets, seriesKeys, totals, overallTotal, topSeries }
}

/**
 * Compute headline metrics for the summary strip.
 */
export function computeSummary(
    filtered: ClassifiedLead[],
    priorFiltered: ClassifiedLead[],
    breakdownBy: BreakdownBy
): LeadTrendsSummary {
    const total = filtered.length
    const priorTotal = priorFiltered.length

    const totalsByKey = new Map<string, number>()
    for (const lead of filtered) {
        const key = seriesKeyFor(lead, breakdownBy)
        totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + 1)
    }
    let topSeries: { key: string; count: number } | null = null
    for (const [key, count] of totalsByKey) {
        if (!topSeries || count > topSeries.count) {
            topSeries = { key, count }
        }
    }

    const unclassifiedCount = filtered.reduce(
        (acc, l) => acc + (l.classification === 'direct' ? 1 : 0),
        0
    )

    return {
        total,
        topSeries,
        priorDelta: {
            count: total - priorTotal,
            percent: priorTotal > 0 ? (total - priorTotal) / priorTotal : null,
        },
        unclassifiedCount,
        unclassifiedRatio: total > 0 ? unclassifiedCount / total : 0,
    }
}
```

- [ ] **Step 4.4: Run tests to verify they pass**

Run:

```bash
pnpm --filter admin test lead-trends-pipeline
```

Expected: all tests PASS.

- [ ] **Step 4.5: Commit**

```bash
git add apps/admin/lib/analytics/lead-trends-pipeline.ts apps/admin/__tests__/lib/analytics/lead-trends-pipeline.test.ts
git commit -m "feat(admin): add lead-trends aggregation pipeline"
```

---

## Task 5: Series color palette (TDD)

**Files:**

- Create: `apps/admin/lib/analytics/series-colors.ts`
- Create: `apps/admin/__tests__/lib/analytics/series-colors.test.ts`

- [ ] **Step 5.1: Write failing tests**

Create `apps/admin/__tests__/lib/analytics/series-colors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import {
    SERIES_PALETTE,
    SPECIAL_COLORS,
    resolveSeriesColor,
} from '@/lib/analytics/series-colors'

describe('resolveSeriesColor', () => {
    it('always maps direct to the stone recessive color', () => {
        expect(resolveSeriesColor('direct').color).toBe(SPECIAL_COLORS.direct)
    })

    it('maps referral/* to a palette color with reduced opacity', () => {
        const result = resolveSeriesColor('referral/nytimes.com')
        expect(result.opacity).toBeLessThan(1)
        expect(SERIES_PALETTE).toContain(result.color)
    })

    it('returns a stable color for the same key across calls', () => {
        expect(resolveSeriesColor('google').color).toBe(
            resolveSeriesColor('google').color
        )
    })

    it('different keys may produce different colors', () => {
        const colors = new Set(
            ['google', 'facebook', 'instagram', 'tiktok', 'bing'].map(
                (k) => resolveSeriesColor(k).color
            )
        )
        expect(colors.size).toBeGreaterThan(1)
    })

    it('always picks a color from the palette for regular keys', () => {
        const result = resolveSeriesColor('newsletter')
        expect(SERIES_PALETTE).toContain(result.color)
    })
})
```

- [ ] **Step 5.2: Run — expect failure**

Run:

```bash
pnpm --filter admin test series-colors
```

Expected: FAIL — module not found.

- [ ] **Step 5.3: Implement**

Create `apps/admin/lib/analytics/series-colors.ts`:

```ts
export const SERIES_PALETTE = [
    '#C38B6B', // terracotta
    '#B58A3A', // gold
    '#2F6F88', // ocean
    '#6B8A6B', // sage
    '#8A5A7D', // plum
    '#A85C3A', // rust
    '#3F8A88', // teal
    '#9A7D88', // mauve
    '#7D7A58', // olive
    '#4F5D6D', // slate
] as const

export const SPECIAL_COLORS = {
    direct: '#78716c', // stone-500
} as const

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

export type SeriesColor = { color: string; opacity: number }

/**
 * Deterministic seriesKey → color mapping. Stable across renders.
 *   - 'direct'           → muted stone.
 *   - 'referral/<host>'  → palette color at 0.7 opacity.
 *   - anything else      → palette color at 1.0 opacity.
 */
export function resolveSeriesColor(key: string): SeriesColor {
    if (key === 'direct') return { color: SPECIAL_COLORS.direct, opacity: 1 }
    const paletteIndex = hashString(key) % SERIES_PALETTE.length
    const color = SERIES_PALETTE[paletteIndex]!
    const opacity = key.startsWith('referral/') ? 0.7 : 1
    return { color, opacity }
}
```

- [ ] **Step 5.4: Run — expect pass**

Run:

```bash
pnpm --filter admin test series-colors
```

Expected: all tests PASS.

- [ ] **Step 5.5: Commit**

```bash
git add apps/admin/lib/analytics/series-colors.ts apps/admin/__tests__/lib/analytics/series-colors.test.ts
git commit -m "feat(admin): add deterministic series color palette"
```

---

## Task 6: Drizzle query

**Files:**

- Create: `apps/admin/lib/queries/lead-trends.query.ts`

- [ ] **Step 6.1: Implement the query**

Create `apps/admin/lib/queries/lead-trends.query.ts`:

```ts
import { db } from '@workspace/db/client'
import { contactSubmission } from '@workspace/db/schema/contact'
import { and, asc, gte, lte } from 'drizzle-orm'

import { classifyLeadAttribution } from '@/lib/analytics/classify-lead-attribution'
import type { ClassifiedLead } from '@/lib/types/analytics/lead-trends.type'

/**
 * Fetch all contact submissions in a date range, classified for the
 * lead-trends chart. Sorted ascending by createdAt.
 */
export async function getClassifiedLeadsInRange(
    startDate: Date,
    endDate: Date
): Promise<ClassifiedLead[]> {
    const rows = await db
        .select({
            utmSource: contactSubmission.utmSource,
            utmMedium: contactSubmission.utmMedium,
            source: contactSubmission.source,
            referrer: contactSubmission.referrer,
            gclid: contactSubmission.gclid,
            fbclid: contactSubmission.fbclid,
            ttclid: contactSubmission.ttclid,
            createdAt: contactSubmission.createdAt,
        })
        .from(contactSubmission)
        .where(
            and(
                gte(contactSubmission.createdAt, startDate),
                lte(contactSubmission.createdAt, endDate)
            )
        )
        .orderBy(asc(contactSubmission.createdAt))

    return rows.map((row) => {
        const attribution = classifyLeadAttribution({
            utmSource: row.utmSource,
            utmMedium: row.utmMedium,
            source: row.source,
            referrer: row.referrer,
            gclid: row.gclid,
            fbclid: row.fbclid,
            ttclid: row.ttclid,
        })
        return {
            ts: row.createdAt.toISOString(),
            source: attribution.source,
            medium: attribution.medium,
            classification: attribution.classification,
        }
    })
}
```

- [ ] **Step 6.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 6.3: Commit**

```bash
git add apps/admin/lib/queries/lead-trends.query.ts
git commit -m "feat(admin): add classified lead-range drizzle query"
```

---

## Task 7: API route

**Files:**

- Create: `apps/admin/app/api/admin/analytics/lead-trends/route.ts`

- [ ] **Step 7.1: Implement the route**

Create `apps/admin/app/api/admin/analytics/lead-trends/route.ts`:

```ts
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getClassifiedLeadsInRange } from '@/lib/queries/lead-trends.query'
import type { LeadTrendsResponse } from '@/lib/types/analytics/lead-trends.type'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { requireAuth } from '@/lib/utils/auth.util'

const MAX_RANGE_DAYS = 366
const DAY_MS = 86_400_000

const querySchema = z
    .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
    })
    .refine(
        (q) => new Date(q.endDate).getTime() >= new Date(q.startDate).getTime(),
        { message: 'endDate must be on or after startDate' }
    )
    .refine(
        (q) => {
            const days =
                (new Date(q.endDate).getTime() -
                    new Date(q.startDate).getTime()) /
                DAY_MS
            return days <= MAX_RANGE_DAYS
        },
        { message: `Range may not exceed ${MAX_RANGE_DAYS} days` }
    )

export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const url = new URL(request.url)
        const parsed = querySchema.safeParse({
            startDate: url.searchParams.get('startDate'),
            endDate: url.searchParams.get('endDate'),
        })
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: parsed.error.issues,
                },
                { status: 400 }
            )
        }

        const startDate = new Date(parsed.data.startDate)
        const endDate = new Date(parsed.data.endDate)
        const leads = await getClassifiedLeadsInRange(startDate, endDate)

        const body: LeadTrendsResponse = {
            leads,
            totalCount: leads.length,
            rangeStart: startDate.toISOString(),
            rangeEnd: endDate.toISOString(),
        }
        return NextResponse.json(body)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch lead trends',
            'Error fetching lead trends:'
        )
    }
}
```

- [ ] **Step 7.2: Manual smoke test**

Run:

```bash
pnpm --filter admin dev
```

In a separate terminal (replace `<cookie>` with a valid admin-auth cookie value):

```bash
curl -i "http://localhost:3105/api/admin/analytics/lead-trends?startDate=2026-04-15T00:00:00.000Z&endDate=2026-04-22T23:59:59.999Z" \
  -H "Cookie: admin-auth=<cookie>"
```

Expected: `200 OK` with JSON `{ leads: [...], totalCount, rangeStart, rangeEnd }`. Repeat without the cookie — expect `401`.

- [ ] **Step 7.3: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 7.4: Commit**

```bash
git add apps/admin/app/api/admin/analytics/lead-trends/route.ts
git commit -m "feat(admin): add lead-trends API route"
```

---

## Task 8: React Query hook

**Files:**

- Create: `apps/admin/hooks/use-lead-trends.hook.ts`

- [ ] **Step 8.1: Implement hook**

Create `apps/admin/hooks/use-lead-trends.hook.ts`:

```ts
import { useQuery } from '@tanstack/react-query'

import type { LeadTrendsResponse } from '@/lib/types/analytics/lead-trends.type'
import { buildUrl, fetchApi } from '@/lib/utils/api-client.util'

export const leadTrendsKeys = {
    all: ['admin', 'lead-trends'] as const,
    range: (startIso: string, endIso: string) =>
        [...leadTrendsKeys.all, startIso, endIso] as const,
} as const

/**
 * Compute the prior-period window, same length as the provided range,
 * ending 1 ms before startDate. Returns ISO strings so the result can be
 * used directly as a React Query key.
 */
export function computePriorRange(startDate: Date, endDate: Date) {
    const duration = endDate.getTime() - startDate.getTime()
    const priorEnd = new Date(startDate.getTime() - 1)
    const priorStart = new Date(priorEnd.getTime() - duration)
    return { priorStart, priorEnd }
}

function useLeadTrendsRange(startDate: Date, endDate: Date) {
    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()
    return useQuery({
        queryKey: leadTrendsKeys.range(startIso, endIso),
        queryFn: () =>
            fetchApi<LeadTrendsResponse>(
                buildUrl('/api/admin/analytics/lead-trends', {
                    startDate: startIso,
                    endDate: endIso,
                })
            ),
        staleTime: 60_000,
    })
}

/**
 * Fetch lead trends for the selected range plus the equivalent prior period.
 * Two independent React Query calls — React Query de-dupes if the same
 * window is used elsewhere.
 */
export function useLeadTrends(startDate: Date, endDate: Date) {
    const current = useLeadTrendsRange(startDate, endDate)
    const { priorStart, priorEnd } = computePriorRange(startDate, endDate)
    const prior = useLeadTrendsRange(priorStart, priorEnd)
    return { current, prior }
}
```

- [ ] **Step 8.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add apps/admin/hooks/use-lead-trends.hook.ts
git commit -m "feat(admin): add useLeadTrends react-query hook"
```

---

## Task 9: Extend DateRangeContext with granularity + custom range

**Files:**

- Modify: `apps/admin/lib/types/analytics/date-range.type.ts`
- Modify: `apps/admin/components/analytics/date-range-context.component.tsx`

- [ ] **Step 9.1: Add `'custom'` preset and granularity helper**

Open `apps/admin/lib/types/analytics/date-range.type.ts`.

Change the `DateRangePreset` type:

```ts
export type DateRangePreset =
    | 'today'
    | 'yesterday'
    | '7d'
    | '28d'
    | '90d'
    | 'custom'
```

Add a `custom` entry to `DATE_RANGE_OPTIONS`:

```ts
export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
    { value: 'today', label: 'Today', days: 0 },
    { value: 'yesterday', label: 'Yesterday', days: 1 },
    { value: '7d', label: 'Last 7 days', days: 7 },
    { value: '28d', label: 'Last 28 days', days: 28 },
    { value: '90d', label: 'Last 3 months', days: 90 },
    { value: 'custom', label: 'Custom…', days: 0 },
]
```

Add a granularity helper at the bottom of the file:

```ts
import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

/**
 * Pick a chart granularity from a date range.
 *   - 0–1 day inclusive  → 'hour'
 *   - 2–30 days          → 'day'
 *   - > 30 days          → 'week'
 */
export function deriveGranularityFromRange(
    startDate: Date,
    endDate: Date
): Granularity {
    const diffDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 1) return 'hour'
    if (diffDays <= 30) return 'day'
    return 'week'
}
```

- [ ] **Step 9.2: Extend the provider**

Open `apps/admin/components/analytics/date-range-context.component.tsx`.

Replace the file contents with:

```tsx
'use client'

import {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'

import {
    DATE_RANGE_OPTIONS,
    DEFAULT_DATE_RANGE,
    type DateRangePreset,
    deriveGranularityFromRange,
    getDateRangeFromPreset,
    getDaysFromPreset,
    getLabelFromPreset,
} from '@/lib/types/analytics/date-range.type'
import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

type DateRangeContextValue = {
    dateRange: DateRangePreset
    setDateRange: (preset: DateRangePreset) => void
    days: number
    label: string
    startDate: Date
    endDate: Date
    granularity: Granularity
    setCustomRange: (startDate: Date, endDate: Date) => void
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null)

type DateRangeProviderProps = {
    children: ReactNode
    defaultValue?: DateRangePreset
}

export function DateRangeProvider({
    children,
    defaultValue = DEFAULT_DATE_RANGE,
}: DateRangeProviderProps) {
    const [dateRange, setDateRangeState] =
        useState<DateRangePreset>(defaultValue)
    const [customStart, setCustomStart] = useState<Date | null>(null)
    const [customEnd, setCustomEnd] = useState<Date | null>(null)

    const setDateRange = useCallback((preset: DateRangePreset) => {
        setDateRangeState(preset)
    }, [])

    const setCustomRange = useCallback((startDate: Date, endDate: Date) => {
        setCustomStart(startDate)
        setCustomEnd(endDate)
        setDateRangeState('custom')
    }, [])

    const value = useMemo<DateRangeContextValue>(() => {
        let startDate: Date
        let endDate: Date

        if (dateRange === 'custom' && customStart && customEnd) {
            startDate = customStart
            endDate = customEnd
        } else {
            const presetForRange =
                dateRange === 'custom' ? DEFAULT_DATE_RANGE : dateRange
            const range = getDateRangeFromPreset(presetForRange)
            startDate = range.startDate
            endDate = range.endDate
        }

        const days = getDaysFromPreset(
            dateRange === 'custom' ? DEFAULT_DATE_RANGE : dateRange
        )
        const label =
            dateRange === 'custom'
                ? formatCustomLabel(startDate, endDate)
                : getLabelFromPreset(dateRange)
        const granularity = deriveGranularityFromRange(startDate, endDate)

        return {
            dateRange,
            setDateRange,
            days,
            label,
            startDate,
            endDate,
            granularity,
            setCustomRange,
        }
    }, [dateRange, customStart, customEnd, setDateRange, setCustomRange])

    return (
        <DateRangeContext.Provider value={value}>
            {children}
        </DateRangeContext.Provider>
    )
}

function formatCustomLabel(start: Date, end: Date): string {
    const fmt = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    })
    return `${fmt.format(start)} – ${fmt.format(end)}`
}

export function useDateRange(): DateRangeContextValue {
    const context = useContext(DateRangeContext)
    if (!context) {
        throw new Error('useDateRange must be used within a DateRangeProvider')
    }
    return context
}

export { DATE_RANGE_OPTIONS }
```

- [ ] **Step 9.3: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors. Existing consumers of `days`, `label`, `startDate`, `endDate`, `dateRange`, `setDateRange` remain unaffected.

- [ ] **Step 9.4: Commit**

```bash
git add apps/admin/lib/types/analytics/date-range.type.ts apps/admin/components/analytics/date-range-context.component.tsx
git commit -m "feat(admin): add custom range + granularity to DateRangeContext"
```

---

## Task 10: Custom date range picker

**Files:**

- Create: `apps/admin/components/analytics/leads/custom-date-range-picker.component.tsx`

This task also requires the shadcn `calendar` component. The admin package does not yet include it.

- [ ] **Step 10.1: Add shadcn calendar (and popover if missing)**

Run from the repo root:

```bash
pnpm dlx shadcn@latest add calendar -c apps/admin
```

Expected: new file `packages/ui/src/components/calendar.tsx` (or `apps/admin/components/ui/calendar.tsx` — whichever the shadcn config resolves to); no errors. If the command prompts for package choice, select the admin package.

Verify `popover` already exists (`packages/ui/src/components/popover.tsx`). If not, also run:

```bash
pnpm dlx shadcn@latest add popover -c apps/admin
```

- [ ] **Step 10.2: Implement the picker**

Create `apps/admin/components/analytics/leads/custom-date-range-picker.component.tsx`:

```tsx
'use client'

import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'

type Props = {
    startDate: Date
    endDate: Date
    onChange: (start: Date, end: Date) => void
}

/**
 * Popover calendar for picking an arbitrary start/end date pair.
 * Commits only when both endpoints are selected.
 */
export function CustomDateRangePicker({ startDate, endDate, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [range, setRange] = useState<{ from?: Date; to?: Date }>({
        from: startDate,
        to: endDate,
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    Pick dates
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-auto p-0'>
                <Calendar
                    mode='range'
                    selected={range}
                    onSelect={(next) => {
                        setRange(next ?? {})
                        if (next?.from && next?.to) {
                            const start = new Date(next.from)
                            start.setHours(0, 0, 0, 0)
                            const end = new Date(next.to)
                            end.setHours(23, 59, 59, 999)
                            onChange(start, end)
                            setOpen(false)
                        }
                    }}
                    numberOfMonths={2}
                    defaultMonth={startDate}
                />
            </PopoverContent>
        </Popover>
    )
}
```

- [ ] **Step 10.3: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 10.4: Commit**

```bash
git add packages/ui/src/components/calendar.tsx apps/admin/components/analytics/leads/custom-date-range-picker.component.tsx
# Include any new popover files too; use `git status` to verify what to add.
git commit -m "feat(admin): add custom date-range picker for lead trends"
```

---

## Task 11: Filter bar

**Files:**

- Create: `apps/admin/components/analytics/leads/lead-trends-filter-bar.component.tsx`

- [ ] **Step 11.1: Implement**

Create `apps/admin/components/analytics/leads/lead-trends-filter-bar.component.tsx`:

```tsx
'use client'

import { MultiSelect } from '@workspace/ui/components/multi-select'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { useMemo } from 'react'

import { useDateRange } from '@/components/analytics/date-range-context.component'
import { CustomDateRangePicker } from '@/components/analytics/leads/custom-date-range-picker.component'
import {
    DATE_RANGE_OPTIONS,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'
import type {
    BreakdownBy,
    ClassifiedLead,
} from '@/lib/types/analytics/lead-trends.type'

type Props = {
    allLeads: ClassifiedLead[] // unfiltered dataset — drives option lists
    sources: string[]
    onSourcesChange: (next: string[]) => void
    mediums: string[]
    onMediumsChange: (next: string[]) => void
    breakdownBy: BreakdownBy
    onBreakdownChange: (next: BreakdownBy) => void
}

const BREAKDOWN_OPTIONS: { value: BreakdownBy; label: string }[] = [
    { value: 'source', label: 'Source' },
    { value: 'medium', label: 'Medium' },
    { value: 'sourceMedium', label: 'Source + Medium' },
]

export function LeadTrendsFilterBar({
    allLeads,
    sources,
    onSourcesChange,
    mediums,
    onMediumsChange,
    breakdownBy,
    onBreakdownChange,
}: Props) {
    const { dateRange, setDateRange, startDate, endDate, setCustomRange } =
        useDateRange()

    const sourceOptions = useMemo(
        () =>
            uniqueSorted(allLeads.map((l) => l.source)).map((v) => ({
                label: v,
                value: v,
            })),
        [allLeads]
    )
    const mediumOptions = useMemo(
        () =>
            uniqueSorted(allLeads.map((l) => l.medium)).map((v) => ({
                label: v,
                value: v,
            })),
        [allLeads]
    )

    return (
        <div className='bg-card sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b px-4 py-3'>
            <Select
                value={dateRange}
                onValueChange={(v) => setDateRange(v as DateRangePreset)}
            >
                <SelectTrigger className='w-[170px]'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {DATE_RANGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {dateRange === 'custom' && (
                <CustomDateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={setCustomRange}
                />
            )}

            <MultiSelect
                options={sourceOptions}
                value={sources}
                onValueChange={onSourcesChange}
                placeholder='All sources'
                searchable
                className='min-w-[200px]'
            />

            <MultiSelect
                options={mediumOptions}
                value={mediums}
                onValueChange={onMediumsChange}
                placeholder='All mediums'
                searchable
                className='min-w-[200px]'
            />

            <div className='text-muted-foreground ml-auto flex items-center gap-2 text-sm'>
                <span>Group by</span>
                <Select
                    value={breakdownBy}
                    onValueChange={(v) => onBreakdownChange(v as BreakdownBy)}
                >
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BREAKDOWN_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function uniqueSorted(values: string[]): string[] {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
```

- [ ] **Step 11.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors. If MultiSelect does not accept `className`, remove it.

- [ ] **Step 11.3: Commit**

```bash
git add apps/admin/components/analytics/leads/lead-trends-filter-bar.component.tsx
git commit -m "feat(admin): add lead-trends filter bar"
```

---

## Task 12: Summary strip

**Files:**

- Create: `apps/admin/components/analytics/leads/lead-trends-summary-strip.component.tsx`

- [ ] **Step 12.1: Implement**

Create `apps/admin/components/analytics/leads/lead-trends-summary-strip.component.tsx`:

```tsx
'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import type {
    BreakdownBy,
    LeadTrendsSummary,
} from '@/lib/types/analytics/lead-trends.type'

const BREAKDOWN_LABEL: Record<BreakdownBy, string> = {
    source: 'Top source',
    medium: 'Top medium',
    sourceMedium: 'Top source / medium',
}

type Props = {
    summary: LeadTrendsSummary
    breakdownBy: BreakdownBy
    priorWindowLabel: string // e.g. "previous 28 days"
}

export function LeadTrendsSummaryStrip({
    summary,
    breakdownBy,
    priorWindowLabel,
}: Props) {
    return (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <SummaryTile
                label='Total leads'
                value={summary.total.toLocaleString()}
                subline='in selected range'
            />
            <SummaryTile
                label={BREAKDOWN_LABEL[breakdownBy]}
                value={summary.topSeries?.key ?? '—'}
                subline={
                    summary.topSeries
                        ? `${summary.topSeries.count.toLocaleString()} leads (${Math.round(
                              (summary.topSeries.count /
                                  Math.max(summary.total, 1)) *
                                  100
                          )}%)`
                        : 'no data'
                }
            />
            <DeltaTile
                percent={summary.priorDelta.percent}
                subline={`vs ${priorWindowLabel}`}
            />
            <SummaryTile
                label='Classified'
                value={
                    summary.total > 0
                        ? `${Math.round(
                              (1 - summary.unclassifiedRatio) * 100
                          )}%`
                        : '—'
                }
                subline={`${summary.unclassifiedCount.toLocaleString()} direct (unclassified)`}
            />
        </div>
    )
}

function SummaryTile({
    label,
    value,
    subline,
}: {
    label: string
    value: string
    subline: string
}) {
    return (
        <Card>
            <CardContent className='p-4'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {label}
                </p>
                <p className='mt-1 font-serif text-2xl leading-tight'>
                    {value}
                </p>
                <p className='text-muted-foreground mt-1 text-xs'>{subline}</p>
            </CardContent>
        </Card>
    )
}

function DeltaTile({
    percent,
    subline,
}: {
    percent: number | null
    subline: string
}) {
    if (percent === null) {
        return <SummaryTile label='vs prior' value='—' subline={subline} />
    }
    const Icon =
        percent > 0 ? ArrowUpRight : percent < 0 ? ArrowDownRight : Minus
    const colorClass =
        percent > 0
            ? 'text-emerald-600'
            : percent < 0
              ? 'text-rose-600'
              : 'text-muted-foreground'
    const label = `${percent > 0 ? '+' : ''}${Math.round(percent * 100)}%`
    return (
        <Card>
            <CardContent className='p-4'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Change
                </p>
                <p
                    className={`mt-1 flex items-center gap-1 font-serif text-2xl leading-tight ${colorClass}`}
                >
                    <Icon className='h-5 w-5' />
                    {label}
                </p>
                <p className='text-muted-foreground mt-1 text-xs'>{subline}</p>
            </CardContent>
        </Card>
    )
}
```

- [ ] **Step 12.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 12.3: Commit**

```bash
git add apps/admin/components/analytics/leads/lead-trends-summary-strip.component.tsx
git commit -m "feat(admin): add lead-trends summary strip"
```

---

## Task 13: Chart tooltip + legend

**Files:**

- Create: `apps/admin/components/analytics/leads/lead-trends-tooltip.component.tsx`
- Create: `apps/admin/components/analytics/leads/lead-trends-legend.component.tsx`

- [ ] **Step 13.1: Implement tooltip**

Create `apps/admin/components/analytics/leads/lead-trends-tooltip.component.tsx`:

```tsx
'use client'

import { format } from 'date-fns'

import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

type TooltipPayloadItem = {
    name: string
    value: number
    color: string
}

type Props = {
    active?: boolean
    payload?: TooltipPayloadItem[]
    label?: string | number
    granularity: Granularity
}

export function LeadTrendsTooltip({
    active,
    payload,
    label,
    granularity,
}: Props) {
    if (!active || !payload || payload.length === 0 || label == null)
        return null

    const items = [...payload]
        .filter((p) => p.value > 0)
        .sort((a, b) => b.value - a.value)
    const total = items.reduce((sum, p) => sum + p.value, 0)
    const formatted = formatBucketLabel(new Date(label), granularity)

    return (
        <div className='rounded-lg border bg-white px-3 py-2 shadow-md'>
            <p className='text-muted-foreground text-xs'>{formatted}</p>
            <p className='mt-0.5 font-medium'>{total.toLocaleString()} leads</p>
            <ul className='mt-2 space-y-0.5 text-sm'>
                {items.map((p, idx) => (
                    <li
                        key={p.name}
                        className={`flex items-center gap-2 ${
                            idx === 0 ? 'font-semibold' : ''
                        }`}
                    >
                        <span
                            className='inline-block h-2 w-2 rounded-full'
                            style={{ backgroundColor: p.color }}
                        />
                        <span>{p.name}</span>
                        <span className='text-muted-foreground ml-auto'>
                            {p.value}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function formatBucketLabel(date: Date, granularity: Granularity): string {
    switch (granularity) {
        case 'hour':
            return format(date, 'MMM d · h:mm a')
        case 'day':
            return format(date, 'MMM d, yyyy')
        case 'week': {
            const end = new Date(date)
            end.setDate(end.getDate() + 6)
            return `${format(date, 'MMM d')} – ${format(end, 'MMM d')}`
        }
    }
}
```

- [ ] **Step 13.2: Implement legend**

Create `apps/admin/components/analytics/leads/lead-trends-legend.component.tsx`:

```tsx
'use client'

import { resolveSeriesColor } from '@/lib/analytics/series-colors'

type Props = {
    seriesKeys: string[]
    hiddenKeys: Set<string>
    onToggle: (key: string, shiftKey: boolean) => void
}

export function LeadTrendsLegend({ seriesKeys, hiddenKeys, onToggle }: Props) {
    if (seriesKeys.length === 0) return null
    return (
        <ul className='mt-3 flex flex-wrap gap-2'>
            {seriesKeys.map((key) => {
                const hidden = hiddenKeys.has(key)
                const { color, opacity } = resolveSeriesColor(key)
                return (
                    <li key={key}>
                        <button
                            type='button'
                            onClick={(e) => onToggle(key, e.shiftKey)}
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                                hidden ? 'opacity-40' : 'hover:bg-muted/50'
                            }`}
                            aria-pressed={!hidden}
                            title='Click to toggle; shift-click to isolate'
                        >
                            <span
                                className='inline-block h-2.5 w-2.5 rounded-full'
                                style={{
                                    backgroundColor: color,
                                    opacity,
                                }}
                            />
                            <span>{key}</span>
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}
```

- [ ] **Step 13.3: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 13.4: Commit**

```bash
git add apps/admin/components/analytics/leads/lead-trends-tooltip.component.tsx apps/admin/components/analytics/leads/lead-trends-legend.component.tsx
git commit -m "feat(admin): add lead-trends tooltip + legend"
```

---

## Task 14: Chart

**Files:**

- Create: `apps/admin/components/analytics/leads/lead-trends-chart.component.tsx`

- [ ] **Step 14.1: Implement**

Create `apps/admin/components/analytics/leads/lead-trends-chart.component.tsx`:

```tsx
'use client'

import { Button } from '@workspace/ui/components/button'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { resolveSeriesColor } from '@/lib/analytics/series-colors'
import type {
    ChartMode,
    Granularity,
    TrendPipelineOutput,
} from '@/lib/types/analytics/lead-trends.type'

import { LeadTrendsLegend } from './lead-trends-legend.component'
import { LeadTrendsTooltip } from './lead-trends-tooltip.component'

type Props = {
    trend: TrendPipelineOutput
    granularity: Granularity
}

export function LeadTrendsChart({ trend, granularity }: Props) {
    const [mode, setMode] = useState<ChartMode>('stacked')
    const [hidden, setHidden] = useState<Set<string>>(new Set())

    const data = useMemo(
        () =>
            trend.buckets.map((b) => {
                const row: Record<string, number | string> = { ts: b.ts }
                for (const key of trend.seriesKeys) {
                    row[key] = b.series[key] ?? 0
                }
                return row
            }),
        [trend]
    )

    const visibleKeys = useMemo(
        () => trend.seriesKeys.filter((k) => !hidden.has(k)),
        [trend.seriesKeys, hidden]
    )

    const handleToggle = (key: string, shiftKey: boolean) => {
        setHidden((prev) => {
            const next = new Set(prev)
            if (shiftKey) {
                // Shift-click: isolate this key. If only this key is visible,
                // restore all.
                const onlyThisVisible =
                    visibleKeys.length === 1 && visibleKeys[0] === key
                if (onlyThisVisible) return new Set()
                for (const k of trend.seriesKeys) {
                    if (k !== key) next.add(k)
                    else next.delete(k)
                }
                return next
            }
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const xTickFormatter = (value: string) => {
        const d = new Date(value)
        switch (granularity) {
            case 'hour':
                return format(d, 'ha')
            case 'day':
                return format(d, 'MMM d')
            case 'week':
                return format(d, 'MMM d')
        }
    }

    return (
        <div>
            <div className='flex items-center justify-end gap-1 pb-2'>
                <Button
                    size='sm'
                    variant={mode === 'stacked' ? 'default' : 'outline'}
                    onClick={() => setMode('stacked')}
                >
                    Stacked
                </Button>
                <Button
                    size='sm'
                    variant={mode === 'line' ? 'default' : 'outline'}
                    onClick={() => setMode('line')}
                >
                    Line
                </Button>
            </div>

            <ResponsiveContainer width='100%' height={400}>
                {mode === 'stacked' ? (
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            stroke='#e7e5e4'
                        />
                        <XAxis
                            dataKey='ts'
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={xTickFormatter}
                            interval='preserveStartEnd'
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={(props) => (
                                <LeadTrendsTooltip
                                    {...props}
                                    granularity={granularity}
                                />
                            )}
                        />
                        {visibleKeys.map((key) => {
                            const { color, opacity } = resolveSeriesColor(key)
                            return (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    stackId='1'
                                    type='monotone'
                                    stroke={color}
                                    fill={color}
                                    fillOpacity={opacity * 0.45}
                                    strokeWidth={1.5}
                                />
                            )
                        })}
                    </AreaChart>
                ) : (
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            stroke='#e7e5e4'
                        />
                        <XAxis
                            dataKey='ts'
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={xTickFormatter}
                            interval='preserveStartEnd'
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={(props) => (
                                <LeadTrendsTooltip
                                    {...props}
                                    granularity={granularity}
                                />
                            )}
                        />
                        {visibleKeys.map((key) => {
                            const { color, opacity } = resolveSeriesColor(key)
                            return (
                                <Line
                                    key={key}
                                    dataKey={key}
                                    type='monotone'
                                    stroke={color}
                                    strokeOpacity={opacity}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            )
                        })}
                    </LineChart>
                )}
            </ResponsiveContainer>

            <LeadTrendsLegend
                seriesKeys={trend.seriesKeys}
                hiddenKeys={hidden}
                onToggle={handleToggle}
            />
        </div>
    )
}
```

- [ ] **Step 14.2: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 14.3: Commit**

```bash
git add apps/admin/components/analytics/leads/lead-trends-chart.component.tsx
git commit -m "feat(admin): add lead-trends stacked area / line chart"
```

---

## Task 15: Page shell + route

**Files:**

- Create: `apps/admin/components/analytics/leads/lead-trends-page.component.tsx`
- Create: `apps/admin/app/(dashboard)/analytics/leads/page.tsx`
- Create: `apps/admin/app/(dashboard)/analytics/leads/loading.tsx`
- Create: `apps/admin/app/(dashboard)/analytics/leads/error.tsx`

- [ ] **Step 15.1: Implement the page shell**

Create `apps/admin/components/analytics/leads/lead-trends-page.component.tsx`:

```tsx
'use client'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
    DateRangeProvider,
    useDateRange,
} from '@/components/analytics/date-range-context.component'
import { LeadTrendsChart } from '@/components/analytics/leads/lead-trends-chart.component'
import { LeadTrendsFilterBar } from '@/components/analytics/leads/lead-trends-filter-bar.component'
import { LeadTrendsSummaryStrip } from '@/components/analytics/leads/lead-trends-summary-strip.component'
import { useLeadTrends } from '@/hooks/use-lead-trends.hook'
import {
    applyFilters,
    bucketLeads,
    computeSummary,
    groupByBreakdown,
} from '@/lib/analytics/lead-trends-pipeline'
import type {
    BreakdownBy,
    ClassifiedLead,
} from '@/lib/types/analytics/lead-trends.type'

export function LeadTrendsPage() {
    return (
        <DateRangeProvider defaultValue='28d'>
            <LeadTrendsView />
        </DateRangeProvider>
    )
}

function LeadTrendsView() {
    const { startDate, endDate, granularity, label } = useDateRange()
    const { current, prior } = useLeadTrends(startDate, endDate)

    const [sources, setSources] = useState<string[]>([])
    const [mediums, setMediums] = useState<string[]>([])
    const [breakdownBy, setBreakdownBy] = useState<BreakdownBy>('source')

    const allLeads: ClassifiedLead[] = current.data?.leads ?? []
    const priorLeads: ClassifiedLead[] = prior.data?.leads ?? []

    const filtered = useMemo(
        () => applyFilters(allLeads, { sources, mediums }),
        [allLeads, sources, mediums]
    )
    const priorFiltered = useMemo(
        () => applyFilters(priorLeads, { sources, mediums }),
        [priorLeads, sources, mediums]
    )
    const trend = useMemo(() => {
        const bucketMap = bucketLeads(filtered, granularity, {
            startDate,
            endDate,
        })
        return groupByBreakdown(bucketMap, breakdownBy)
    }, [filtered, granularity, breakdownBy, startDate, endDate])
    const summary = useMemo(
        () => computeSummary(filtered, priorFiltered, breakdownBy),
        [filtered, priorFiltered, breakdownBy]
    )

    return (
        <div className='space-y-6'>
            <header>
                <h1 className='font-serif text-3xl'>Lead Source Trends</h1>
                <p className='text-muted-foreground'>
                    Where your consultation requests are coming from.
                </p>
            </header>

            <LeadTrendsFilterBar
                allLeads={allLeads}
                sources={sources}
                onSourcesChange={setSources}
                mediums={mediums}
                onMediumsChange={setMediums}
                breakdownBy={breakdownBy}
                onBreakdownChange={setBreakdownBy}
            />

            <ChartBody
                isLoading={current.isLoading}
                isError={Boolean(current.error)}
                onRetry={() => {
                    current.refetch()
                    prior.refetch()
                }}
                hasData={allLeads.length > 0}
                filteredCount={filtered.length}
            >
                <LeadTrendsSummaryStrip
                    summary={summary}
                    breakdownBy={breakdownBy}
                    priorWindowLabel={`previous ${label.toLowerCase()}`}
                />
                {filtered.length === 0 ? (
                    <EmptyState
                        title='No leads match the current filters'
                        description='Try removing a source or medium filter, or widening the date range.'
                    />
                ) : (
                    <Card>
                        <CardContent className='pt-6'>
                            <LeadTrendsChart
                                trend={trend}
                                granularity={granularity}
                            />
                        </CardContent>
                    </Card>
                )}
            </ChartBody>
        </div>
    )
}

type ChartBodyProps = {
    children: React.ReactNode
    isLoading: boolean
    isError: boolean
    hasData: boolean
    filteredCount: number
    onRetry: () => void
}

function ChartBody({
    children,
    isLoading,
    isError,
    hasData,
    onRetry,
}: ChartBodyProps) {
    if (isLoading) {
        return (
            <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='h-[88px] w-full' />
                    ))}
                </div>
                <Skeleton className='h-[420px] w-full' />
            </div>
        )
    }
    if (isError) {
        return (
            <Card>
                <CardContent className='flex flex-col items-center justify-center gap-3 py-12'>
                    <AlertCircle className='h-5 w-5 text-rose-500' />
                    <p className='text-muted-foreground text-sm'>
                        Failed to load lead trends.
                    </p>
                    <Button variant='outline' size='sm' onClick={onRetry}>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }
    if (!hasData) {
        return (
            <EmptyState
                title='No leads in this range yet'
                description='Try a wider date range, or check back once contact form submissions arrive.'
            />
        )
    }
    return <>{children}</>
}

function EmptyState({
    title,
    description,
}: {
    title: string
    description: string
}) {
    return (
        <Card>
            <CardContent className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
                <p className='font-serif text-lg'>{title}</p>
                <p className='text-muted-foreground max-w-sm text-sm'>
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
```

- [ ] **Step 15.2: Create the route entry**

Create `apps/admin/app/(dashboard)/analytics/leads/page.tsx`:

```tsx
import { LeadTrendsPage } from '@/components/analytics/leads/lead-trends-page.component'

export const metadata = {
    title: 'Lead Source Trends | Admin',
    description:
        'Lead analytics: source and medium trends over time for consultation requests.',
}

export default function LeadAnalyticsRoute() {
    return <LeadTrendsPage />
}
```

- [ ] **Step 15.3: Create route loading state**

Create `apps/admin/app/(dashboard)/analytics/leads/loading.tsx`:

```tsx
import { Skeleton } from '@workspace/ui/components/skeleton'

export default function LoadingLeadTrends() {
    return (
        <div className='space-y-6'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-14 w-full' />
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-[88px] w-full' />
                ))}
            </div>
            <Skeleton className='h-[420px] w-full' />
        </div>
    )
}
```

- [ ] **Step 15.4: Create route error boundary**

Create `apps/admin/app/(dashboard)/analytics/leads/error.tsx`:

```tsx
'use client'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function LeadTrendsError({
    reset,
}: {
    error: Error
    reset: () => void
}) {
    return (
        <Card>
            <CardContent className='flex flex-col items-center justify-center gap-3 py-12'>
                <AlertCircle className='h-5 w-5 text-rose-500' />
                <p className='text-muted-foreground text-sm'>
                    Something went wrong loading lead trends.
                </p>
                <Button variant='outline' size='sm' onClick={reset}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Try again
                </Button>
            </CardContent>
        </Card>
    )
}
```

- [ ] **Step 15.5: Manual smoke test**

Run:

```bash
pnpm --filter admin dev
```

In a browser logged in as admin, visit `http://localhost:3105/analytics/leads`. Verify:

- Page renders with header.
- Filter bar shows date range, empty multi-selects, breakdown picker.
- Summary strip shows 4 tiles.
- Chart renders with sample data (or empty state if the DB has no recent leads).
- Switching "Last 7 days" → "Last 3 months" triggers a refetch.
- Picking a source in the multi-select filters the chart without a spinner.
- Clicking the "Stacked" / "Line" toggle switches modes.
- Clicking a legend badge hides that series; shift-clicking isolates it.

- [ ] **Step 15.6: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 15.7: Commit**

```bash
git add apps/admin/components/analytics/leads/lead-trends-page.component.tsx apps/admin/app/\(dashboard\)/analytics/leads/
git commit -m "feat(admin): add /analytics/leads page with filters, summary, and chart"
```

---

## Task 16: Sidebar entry

**Files:**

- Modify: `apps/admin/components/layout/sidebar.component.tsx`

- [ ] **Step 16.1: Convert Analytics entry to a collapsible group**

Open `apps/admin/components/layout/sidebar.component.tsx`.

Locate the `navItems` array and find the existing Analytics entry:

```tsx
{ title: 'Analytics', href: '/analytics', icon: BarChart3 },
```

Replace it with:

```tsx
{
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
        { title: 'Website', href: '/analytics' },
        { title: 'Leads', href: '/analytics/leads' },
    ],
},
```

- [ ] **Step 16.2: Manual smoke test**

Run the dev server, confirm the sidebar now shows Analytics as an expandable group with "Website" and "Leads" children, and that clicking "Leads" navigates to `/analytics/leads`.

- [ ] **Step 16.3: Typecheck**

Run:

```bash
pnpm --filter admin typecheck
```

Expected: no errors.

- [ ] **Step 16.4: Commit**

```bash
git add apps/admin/components/layout/sidebar.component.tsx
git commit -m "feat(admin): add Leads entry under Analytics sidebar group"
```

---

## Task 17: Mobile pass + final QA

**Files:** (no new files; may modify any component)

- [ ] **Step 17.1: Mobile responsive review**

Run the dev server. With browser devtools set to iPhone / 375px width, visit `/analytics/leads`. Verify:

- Filter bar wraps cleanly (multi-selects stack; breakdown control sits below).
- Summary strip is 2×2 at mobile widths (`grid-cols-2`).
- Chart responsive container adapts; legend wraps.
- Horizontal overflow is absent.

If any of these fail, adjust the affected component's Tailwind classes (expected edits: `lead-trends-filter-bar.component.tsx`, `lead-trends-summary-strip.component.tsx`). Keep changes minimal and Tailwind-class-only where possible.

- [ ] **Step 17.2: Full test run**

Run:

```bash
pnpm --filter admin test
pnpm --filter admin typecheck
pnpm --filter admin lint
```

Expected: all green. Fix any regressions surfaced.

- [ ] **Step 17.3: Manual QA checklist**

Using a dev-server session:

- [ ] Date presets switch correctly (Today → Yesterday → 7d → 28d → 90d).
- [ ] Selecting `Custom…` opens the calendar popover; picking a range applies it and the label reflects it.
- [ ] Source multi-select filters the chart + summary.
- [ ] Medium multi-select filters the chart + summary.
- [ ] Combined filters intersect correctly.
- [ ] Breakdown picker: Source shows source lines; Medium shows medium lines; Source + Medium shows combined lines.
- [ ] Stacked ↔ Line toggle works and preserves hidden-legend state.
- [ ] Legend click hides a series; clicking again restores it.
- [ ] Legend shift-click isolates one series; shift-clicking again restores all.
- [ ] Prior-period delta tile shows a number and an up/down arrow (or `—` when the prior window is empty).
- [ ] Empty states render when the range has no leads or when filters exclude everything.
- [ ] Error state renders if the API is disconnected (can simulate by blocking the request in devtools).
- [ ] Mobile layout is usable at 375px.

- [ ] **Step 17.4: Commit any polish**

If any polish changes were made:

```bash
git add apps/admin/components/analytics/leads/
git commit -m "feat(admin): mobile + QA polish for lead trends"
```

- [ ] **Step 17.5: Done**

Feature complete.

---

## Self-Review

**Spec coverage check:**

| Spec Section                                                                                 | Implemented by                                                 |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| §4 Architecture                                                                              | Task 6 (query), 7 (route), 8 (hook), 15 (page `useMemo` chain) |
| §5.1 Data source                                                                             | Task 6                                                         |
| §5.2 Classifier + KNOWN_REFERRERS                                                            | Task 3                                                         |
| §6 API endpoint + Zod                                                                        | Task 7                                                         |
| §7 Pipeline (applyFilters, deriveGranularity, bucketLeads, groupByBreakdown, computeSummary) | Task 4                                                         |
| §8.1 Page layout                                                                             | Task 15                                                        |
| §8.2 Mobile                                                                                  | Task 17                                                        |
| §8.3 Components (all 11 files)                                                               | Tasks 3, 4, 5, 6, 8, 10, 11, 12, 13, 14, 15                    |
| §8.4 Filter bar details (including "Custom…")                                                | Tasks 9, 10, 11                                                |
| §8.5 Summary strip (adaptive label, delta tile, classified %)                                | Task 12                                                        |
| §8.6 Chart (stacked default, Line toggle, shared cursor, clickable legend)                   | Tasks 13, 14                                                   |
| §8.7 Color palette (+ direct/referral special cases)                                         | Task 5                                                         |
| §8.8 States (loading / error / empty / partial)                                              | Tasks 15 (route + page)                                        |
| §9 DateRangeContext extension                                                                | Task 9                                                         |
| §10 Navigation                                                                               | Task 16                                                        |
| §11.1 Classifier unit tests                                                                  | Task 3                                                         |
| §11.1 Pipeline unit tests                                                                    | Task 4                                                         |
| §11.1 Series colors tests                                                                    | Task 5                                                         |
| §11.2 API integration tests                                                                  | **Not covered** — see note below.                              |
| §11.3 Component smoke tests                                                                  | **Not covered** — see note below.                              |
| §11.4 Manual QA checklist                                                                    | Task 17                                                        |

**Two deliberate scope deferrals** (noted for reviewer visibility, not placeholders):

1. **API integration tests (§11.2):** The admin app has no existing test harness for route handlers and no Supabase test-database setup. Adding one is out-of-scope for this feature; the API route is thin (auth → Zod → query → map → respond) and its logic is exercised by Task 7's manual smoke test. If the user wants this added later, it's a self-contained follow-up (provision a test database or a mock Drizzle `db`, then add a `__tests__/api/lead-trends.test.ts`).
2. **Component smoke tests (§11.3):** Testing Recharts components cleanly in jsdom requires additional setup (`ResizeObserver` polyfill, dimensions mocking). Manual verification in Task 15.5 + Task 17.3 covers the described behavior. If desired later, add `@testing-library/react` tests focused on non-chart components (summary strip, legend, filter bar) where the payoff is clearer.

**Placeholder scan:** No TBDs, TODOs, or vague "add error handling" / "write tests for the above" directives. Every code step contains the actual code.

**Type consistency spot check:**

- `ClassifiedLead` defined in Task 2 → used identically in Tasks 4, 6, 7, 11, 15.
- `LeadTrendsSummary` fields `total`, `topSeries`, `priorDelta`, `unclassifiedCount`, `unclassifiedRatio` in Task 2 → consumed by Tasks 4 (computeSummary) and 12 (summary strip).
- `BreakdownBy` `'source' | 'medium' | 'sourceMedium'` consistent across Tasks 2, 4, 11, 12, 15.
- `Granularity` `'hour' | 'day' | 'week'` consistent across Tasks 2, 4, 9, 13, 14.
- `useLeadTrends` returns `{ current, prior }` in Task 8 → consumed with that shape in Task 15.
- `computePriorRange` defined and exported in Task 8; not consumed externally (used internally). Fine.
- `resolveSeriesColor` returns `{ color, opacity }` in Task 5 → consumed with that shape in Tasks 13 (legend), 14 (chart).

No inconsistencies found.
