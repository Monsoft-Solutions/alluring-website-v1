# Admin Lead Source Trends — Design Spec

**Date:** 2026-04-22
**Feature:** A dedicated admin analytics view that visualizes lead (contact submission) trends over time, broken down by source and medium, with rich filtering and instant cross-filter interactions.
**Owner:** Adriano Flechilla

---

## 1. Goals

- Give admins a daily-use tool to answer "where are my consultation leads coming from, and how is that changing over time?"
- Support the real shape of the data: the same source appears with multiple mediums (e.g., `google/cpc` vs `google/organic`, `facebook/paid` vs `facebook/social`).
- Make filter and breakdown changes feel instant (no network spinner for in-view adjustments).
- Classify 100% of leads — never silently drop untagged traffic.
- Establish a foundation that can grow with future lead-analytics questions (conversion, procedure mix, campaign ROI).

## 2. Non-Goals

- Conversion funnel analytics (session → lead → consultation → procedure) — future work.
- Per-lead attribution editing.
- Cross-device / multi-touch attribution modeling.
- Exporting the chart as an image (CSV export of underlying data is listed as a future extension but not in scope here).

---

## 3. User Story

> As an admin of Alluring Plastic Surgery, I visit `/analytics/leads` to understand which acquisition channels are producing consultation requests. I select a date range (preset or custom), pick which sources and mediums I care about, choose how to break down the lines (by source, by medium, or by source+medium pair), and read the trend. I compare the selected period against the prior equivalent period to see if a channel is growing or fading. I click sources in the legend to isolate or hide them without waiting for the page to reload.

---

## 4. Architecture Overview

A single admin page `/analytics/leads` composed of three panels: a sticky filter bar, a four-tile summary strip, and a trend chart.

**Data flow:**

```
Admin opens page → React Query fires ONE request
  GET /api/admin/analytics/lead-trends?startDate=…&endDate=…

Server:
  1. requireAuth()
  2. Drizzle: SELECT attribution fields + created_at FROM contact_submission
     WHERE created_at BETWEEN :startDate AND :endDate
  3. Map rows through classifyLeadAttribution() → { ts, source, medium }
  4. Return JSON { leads, totalCount, rangeStart, rangeEnd }

Client:
  - React Query caches the dataset (staleTime: 60s)
  - useMemo pipeline re-runs when filters/breakdown change (no refetch):
      applyFilters → deriveGranularity → bucketLeads → groupByBreakdown
  - computeSummary runs against the filtered dataset + prior-period dataset
  - Chart + summary strip render from the memoized output
```

**Only date-range changes trigger a refetch.** Source filter, medium filter, breakdown-by picker, chart-type toggle, and legend clicks operate on the already-loaded dataset in a single render.

**Prior-period comparison** is fetched as a second React Query call to the same endpoint with a shifted window (e.g., prior 28 days for a 28-day range).

**Why this architecture:**

- Lead volumes at this business sit in the hundreds-to-low-thousands per month — well within comfortable client-aggregation territory.
- Server payload stays small (3 short fields per lead; ~50KB for 2000 leads).
- The classifier and pipeline are pure TypeScript — reusable for future CSV export, testable in isolation, extensible without schema changes.
- UX gain: filter/breakdown interactions complete in one frame.
- Scale ceiling: if lead count per range ever exceeds ~50k, server-side bucketing can be introduced without changing the API response shape meaningfully.

---

## 5. Data Model

### 5.1 Source of lead data

Single source: the `contact_submission` table (`packages/db/src/schema/contact/contact-submission.table.ts`). Relevant fields:

| Field                                                            | Type      | Notes                                         |
| ---------------------------------------------------------------- | --------- | --------------------------------------------- |
| `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm` | text?     | Standard UTM params                           |
| `gclid`, `fbclid`, `ttclid`                                      | text?     | Paid ad click IDs                             |
| `referrer`                                                       | text?     | Full referring URL                            |
| `source`                                                         | text?     | Legacy free-text field                        |
| `createdAt`                                                      | timestamp | Indexed (`contact_submission_created_at_idx`) |

The `created_at` index supports efficient range queries without further indexing.

### 5.2 Attribution classifier

**Location:** `apps/admin/lib/analytics/classify-lead-attribution.ts`

**Signature:**

```ts
type LeadAttributionInput = Pick<
    ContactSubmission,
    | 'utmSource'
    | 'utmMedium'
    | 'source'
    | 'referrer'
    | 'gclid'
    | 'fbclid'
    | 'ttclid'
>

type LeadAttribution = {
    source: string // e.g. 'google', 'facebook', 'direct', 'referral/nytimes.com'
    medium: string // e.g. 'cpc', 'organic', 'social', 'direct', 'referral', '(none)'
    classification: 'utm' | 'click-id' | 'referrer' | 'source-field' | 'direct'
}

function classifyLeadAttribution(input: LeadAttributionInput): LeadAttribution
```

**Resolution priority** (first match wins):

1. **UTM** — `utm_source` and `utm_medium` both present and non-empty → lowercase + trim both; `classification: 'utm'`.
2. **Click ID** — in order:
    - `gclid` → `{ source: 'google', medium: 'cpc', classification: 'click-id' }`
    - `fbclid` → `{ source: 'facebook', medium: 'paid', classification: 'click-id' }`
    - `ttclid` → `{ source: 'tiktok', medium: 'paid', classification: 'click-id' }`
3. **Referrer** — parse hostname from `referrer` URL (fail-safe on invalid URLs), strip leading `www.`, lowercase, look up in `KNOWN_REFERRERS`:

    | Hosts                                                                   | Result                            |
    | ----------------------------------------------------------------------- | --------------------------------- |
    | `google.com`, `google.<tld>`, `bing.com`, `duckduckgo.com`, `yahoo.com` | `{ <engine>, organic }`           |
    | `facebook.com`, `m.facebook.com`, `fb.com`                              | `{ facebook, social }`            |
    | `instagram.com`                                                         | `{ instagram, social }`           |
    | `tiktok.com`                                                            | `{ tiktok, social }`              |
    | `linkedin.com`                                                          | `{ linkedin, social }`            |
    | `twitter.com`, `x.com`, `t.co`                                          | `{ twitter, social }`             |
    | `pinterest.com`                                                         | `{ pinterest, social }`           |
    | `youtube.com`, `youtu.be`                                               | `{ youtube, social }`             |
    | anything else with a valid hostname                                     | `{ 'referral/<host>', referral }` |

    `classification: 'referrer'`.

4. **Legacy `source` field** — non-empty free-text value → `{ source: lowercased+trimmed, medium: '(none)', classification: 'source-field' }`.
5. **Default** → `{ source: 'direct', medium: 'direct', classification: 'direct' }`.

**`KNOWN_REFERRERS`** lives in the same file as a typed const map and is extended over time. Adding a new referrer is a one-line config change, fully unit-tested.

**Invariant:** the function always returns a valid `LeadAttribution`; never null, never throws on malformed input.

---

## 6. API Endpoint

**Route:** `apps/admin/app/api/admin/analytics/lead-trends/route.ts`
**Method:** `GET`

**Query parameter schema (Zod):**

```ts
const querySchema = z
    .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
    })
    .refine(
        ({ startDate, endDate }) =>
            new Date(endDate).getTime() >= new Date(startDate).getTime(),
        'endDate must be on or after startDate'
    )
    .refine(({ startDate, endDate }) => {
        const days =
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            86_400_000
        return days <= 366
    }, 'Range may not exceed 366 days')
```

**Response shape:**

```ts
type LeadTrendsResponse = {
    leads: {
        ts: string // ISO timestamp
        source: string
        medium: string
        classification:
            | 'utm'
            | 'click-id'
            | 'referrer'
            | 'source-field'
            | 'direct'
    }[] // sorted by ts ASC
    totalCount: number
    rangeStart: string // ISO
    rangeEnd: string // ISO
}
```

`classification` is carried through to the client so the summary strip can compute the unclassified ratio without duplicating the classifier's logic.

**Handler flow:**

1. `requireAuth()` (existing middleware — no additional role check; admin cookie is already required to reach `/api/admin/*`).
2. Validate query params.
3. Drizzle query against `contact_submission`:
    ```ts
    db.select({
        utmSource,
        utmMedium,
        source,
        referrer,
        gclid,
        fbclid,
        ttclid,
        createdAt,
    })
        .from(contactSubmission)
        .where(and(gte(createdAt, startDate), lte(createdAt, endDate)))
        .orderBy(asc(createdAt))
    ```
4. Map each row through `classifyLeadAttribution()`, project to `{ ts, source, medium }`.
5. Wrap with `handleApiError()` (existing pattern).

**Error modes:**

- 400 on Zod validation failure (message describes the bad field).
- 401 on missing/invalid auth cookie (handled by existing middleware).
- 500 on DB error (surfaces as standard error card in UI via React Query).

**Caching:** React Query on the client; `staleTime: 60_000`. No server-side cache — the auth check is per-request, and lead volume in the query is tiny.

---

## 7. Client Data Pipeline

**Location:** `apps/admin/lib/analytics/lead-trends-pipeline.ts` (pure, unit-tested functions)

```ts
type ClassifiedLead = {
    ts: string
    source: string
    medium: string
    classification: 'utm' | 'click-id' | 'referrer' | 'source-field' | 'direct'
}
type Granularity = 'hour' | 'day' | 'week'
type BreakdownBy = 'source' | 'medium' | 'sourceMedium'

type TrendBucket = {
    ts: string // bucket start ISO
    series: Record<string, number> // seriesKey → lead count
}

type TrendPipelineOutput = {
    buckets: TrendBucket[]
    seriesKeys: string[] // all keys across all buckets
    totals: Record<string, number> // seriesKey → total count in range
    overallTotal: number
    topSource: { key: string; count: number } | null
}
```

**Stage functions:**

1. **`applyFilters(leads, { sources, mediums })`** — keep rows whose `source` ∈ sources (if `sources.length > 0`) AND `medium` ∈ mediums (if `mediums.length > 0`). Empty array means "all". O(n).

2. **`deriveGranularity({ startDate, endDate })`**:
    - Range ≤ 2 days → `'hour'`
    - Range ≤ 31 days → `'day'`
    - Range > 31 days → `'week'` (ISO week, Monday start)

3. **`bucketLeads(leads, granularity, range)`** — for each lead, floor `ts` to bucket boundary; append to `Map<bucketTs, Lead[]>`. Pre-seed the map with empty buckets spanning the full range so the x-axis renders continuously even when some buckets are empty. DST-safe: boundaries computed via `date-fns` (already in use elsewhere) with the browser's local timezone.

4. **`groupByBreakdown(bucketMap, breakdownBy)`** — for each bucket, reduce to `{ ts, series: Record<seriesKey, count> }` where:
    - `breakdownBy === 'source'` → seriesKey = lead.source
    - `breakdownBy === 'medium'` → seriesKey = lead.medium
    - `breakdownBy === 'sourceMedium'` → seriesKey = `${lead.source} / ${lead.medium}`

5. **`computeSummary(filteredLeads, priorPeriodFilteredLeads, breakdownBy)`**:

    ```ts
    {
      total: filteredLeads.length,
      topSeries: mode of seriesKey given breakdownBy (null if total === 0),
      priorDelta: {
        count: total - priorTotal,
        percent: priorTotal > 0 ? (total - priorTotal) / priorTotal : null,
      },
      unclassifiedRatio: count of classification === 'direct' / total,
    }
    ```

    `topSeries` is the key of the largest series in the chart under the current breakdown — so when the breakdown is `source` it surfaces the top source, when `medium` it surfaces the top medium, when `sourceMedium` it surfaces the top combination. The classifier's `classification` field (not the normalized `source` value) is the unclassified signal — this lets a legacy free-text `source === 'direct'` entry stay classified-by-source-field rather than being mislabeled as unclassified.

**Pipeline composition in `lead-trends-page.component.tsx`:**

```tsx
const filtered = useMemo(
    () => applyFilters(fetched, { sources, mediums }),
    [fetched, sources, mediums]
)
const granularity = useMemo(
    () => deriveGranularity({ startDate, endDate }),
    [startDate, endDate]
)
const trend = useMemo(() => {
    const buckets = bucketLeads(filtered, granularity, { startDate, endDate })
    return groupByBreakdown(buckets, breakdownBy)
}, [filtered, granularity, breakdownBy, startDate, endDate])
const summary = useMemo(
    () => computeSummary(filtered, priorFiltered, breakdownBy),
    [filtered, priorFiltered, breakdownBy]
)
```

**Filter option discovery:** The source and medium multi-selects are populated from the _unfiltered_ `fetched` dataset. This ensures admins always see every source/medium that exists in the selected date range, even if currently excluded from the chart.

---

## 8. UI Composition

### 8.1 Page layout (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ Lead Source Trends                                            │
│ Where your consultation requests are coming from              │
├──────────────────────────────────────────────────────────────┤
│ [Date range ▾]  [Sources ▾]  [Mediums ▾]  Group by: [Source▾] │ ← sticky filter bar
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬──────────────┬──────────────┐ │
│ │ 184 leads   │ Google      │ +23% vs prev │ 94% classified│ │ ← summary strip
│ │ in range    │ top source  │ 28 days      │               │ │
│ └─────────────┴─────────────┴──────────────┴──────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                                              [Stacked] [Line] │ ← chart toggle
│  [═══════════════ chart ═══════════════]                    │
│  ● Google  ● Facebook  ● Direct  ● Instagram  …              │ ← legend (clickable)
└──────────────────────────────────────────────────────────────┘
```

Visual language follows the luxury admin aesthetic already in use: stone/gold palette, serif headings, generous whitespace, card surfaces, `shadcn/ui` primitives.

### 8.2 Mobile

- Filter bar collapses into a single "Filters" button that opens a bottom sheet containing the four controls stacked vertically.
- Summary strip becomes a 2×2 grid.
- Chart height drops from 400px to 280px; legend wraps below.

### 8.3 Components

| File                                                                 | Responsibility                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/(dashboard)/analytics/leads/page.tsx`                           | Route entry; renders the client page                                            |
| `components/analytics/leads/lead-trends-page.component.tsx`          | Client shell; owns filter/breakdown state; calls pipeline; wires sub-components |
| `components/analytics/leads/lead-trends-filter-bar.component.tsx`    | Date range + two multi-selects + breakdown picker                               |
| `components/analytics/leads/lead-trends-summary-strip.component.tsx` | 4-tile summary (total, top source, prior-period delta, classified %)            |
| `components/analytics/leads/lead-trends-chart.component.tsx`         | Recharts stacked-area/line; shared cursor; clickable legend                     |
| `components/analytics/leads/custom-date-range-picker.component.tsx`  | Calendar popover for the "Custom…" option                                       |
| `hooks/use-lead-trends.hook.ts`                                      | React Query wrapper; primary + prior-period calls                               |
| `lib/queries/lead-trends.query.ts`                                   | Drizzle fetch used by the API route                                             |
| `lib/analytics/classify-lead-attribution.ts`                         | Classifier + `KNOWN_REFERRERS` map                                              |
| `lib/analytics/lead-trends-pipeline.ts`                              | Pure aggregation pipeline                                                       |
| `lib/analytics/series-colors.ts`                                     | Color palette + stable key → color mapping                                      |
| `lib/types/analytics/lead-trends.type.ts`                            | All feature types                                                               |

### 8.4 Filter bar details

- **Date range control** — extends the existing `DateRangeSelector` pattern. Presets: Today, Yesterday, Last 7 days, Last 28 days, Last 3 months, **Custom…** (new). Picking "Custom…" opens a calendar popover for explicit start/end selection.
- **Sources multi-select** — uses existing `@workspace/ui/multi-select`. Options derived from the unfiltered dataset. "Select all" and "Clear" shortcuts.
- **Mediums multi-select** — same pattern as sources.
- **Group by** — `Select` with three options: `Source` (default), `Medium`, `Source + Medium`.

### 8.5 Summary strip

Four tiles, each a `Card` with a large numeric value, a label, and a subdued subline:

1. **Total leads** — count; subline: "in selected range".
2. **Top [dimension]** — label adapts to the breakdown picker: "Top source", "Top medium", or "Top source / medium". Value is the largest seriesKey; subline: "N leads (X%)".
3. **Prior-period delta** — `+X%` / `-X%` with up/down arrow in semantic colors (emerald/rose); subline: "vs previous N days". Shows "—" when prior period has zero leads.
4. **Classified** — percent of leads with `classification !== 'direct'`; subline: "N direct (unclassified)".

### 8.6 Chart

- **Library:** Recharts (already installed and in use for `PageViewsChart`, `TrafficSourcesChart`).
- **Default:** `AreaChart` with stacked series; each series is a separate `<Area>` with `stackId='1'` and a distinct fill color.
- **Toggle:** `LineChart` with unstacked `<Line>` series on a shared Y axis. State in local component; persists within the session (not URL).
- **X axis:** `ts` field, formatted per granularity (`Apr 15` for day, `Apr 15 · 2pm` for hour, `Apr 12 – Apr 18` for week).
- **Y axis:** count; integer ticks; min 0.
- **Shared cursor tooltip:** custom component. Format: header = formatted bucket label; body = one row per visible series, sorted descending, top row bolded; format `<seriesKey> — <count>`.
- **Legend:** custom clickable legend below the chart.
    - Click a swatch → toggle that series' visibility (Area/Line removed from render; swatch dims).
    - Shift-click → isolate to just that series (hide all others).
    - Click again on a lone isolated series → restore all.
    - State persists for the session.

### 8.7 Color palette

Tuned to complement stone/gold admin chrome. Each color has a stable assignment derived from the seriesKey (string hash → palette index mod 10), ensuring the same source keeps the same color across renders and date ranges.

Palette: `['#C38B6B', '#B58A3A', '#2F6F88', '#6B8A6B', '#8A5A7D', '#A85C3A', '#3F8A88', '#9A7D88', '#7D7A58', '#4F5D6D']` (terracotta, gold, ocean, sage, plum, rust, teal, mauve, olive, slate).

Special-case overrides:

- `direct` → stone-500 (muted, visually recessive).
- Keys starting with `referral/` → same palette but at 70% opacity.

### 8.8 States

- **Loading** — skeleton matching chart height (`h-[400px] w-full`) with subtle filter-bar skeleton.
- **Empty** — illustration + "No leads in this range yet." + subline suggesting a wider range.
- **Error** — error card with `AlertCircle` icon + "Retry" button mirroring `TrafficSourcesCard`.
- **Partial data** — if the range has leads but all fall outside the current filter selection, chart shows empty state with "All leads filtered out — adjust your source/medium selection."

---

## 9. `DateRangeContext` Extension

The existing `DateRangeContext` currently exposes `{ dateRange: DateRangePreset, days: number, label: string, setDateRange }`. We extend it to also expose `{ startDate: Date, endDate: Date, granularity: Granularity }` derived from the preset (or explicit custom selection).

- **Backward compatible:** existing consumers (`TrafficSourcesCard`, `PageViewsChartCard`, etc.) keep using `days` / `label` unchanged.
- **New consumers:** read `startDate` / `endDate` directly.
- **Custom range:** `setCustomRange(start, end)` sets `dateRange = 'custom'` and stores the explicit dates; `getDateRangeFromPreset` returns them verbatim for the `'custom'` case.

This change is scoped to the context file only — no existing call sites need modification.

---

## 10. Navigation

Current admin sidebar has a single "Analytics" entry pointing to `/analytics`. Convert this into a collapsible group:

- **Analytics** (parent)
    - **Website** — `/analytics` (current page)
    - **Leads** — `/analytics/leads` (new)

If the existing sidebar does not support collapsible groups, add a flat sibling entry "Lead Analytics" pointing to `/analytics/leads`. The exact sidebar structure will be confirmed during implementation; the page itself is the primary deliverable.

---

## 11. Testing

### 11.1 Unit tests

- **`classify-lead-attribution.test.ts`**
    - Each priority branch (UTM, gclid, fbclid, ttclid, known referrer per category, unknown referrer → referral/, source-field fallback, direct default).
    - Malformed referrer URL (bare string, `javascript:`, empty, null) falls through safely.
    - Case normalization (uppercase UTM values → lowercase output).
    - Whitespace trimming.
    - `KNOWN_REFERRERS` coverage: one representative test per category plus an unmapped-but-valid host to hit the `referral/` branch.

- **`lead-trends-pipeline.test.ts`**
    - `deriveGranularity` at range boundaries (2 days → hour, 3 days → day, 31 days → day, 32 days → week).
    - `bucketLeads` produces empty buckets for gaps; DST spring-forward and fall-back days produce correct bucket counts.
    - `applyFilters` with empty arrays = pass-through; single-value filters; multi-value; no matches returns empty.
    - `groupByBreakdown` for each `BreakdownBy` value.
    - `computeSummary` with zero prior leads (percent → null), equal counts (percent → 0), single-source dataset.

- **`series-colors.test.ts`** — stable assignment across calls for the same key; `direct` always maps to stone; `referral/*` maps to palette index + opacity modifier.

### 11.2 Integration tests

- **API route** — auth required (401 without cookie); Zod rejects bad dates; returns expected shape; range > 366 days rejected.

### 11.3 Component smoke tests

- Chart renders with sample data (stacked area mode).
- Toggle switches to line mode.
- Legend click hides a series; click again restores it.
- Breakdown toggle from Source → Medium changes the number of series rendered.

### 11.4 Manual QA checklist (documented in the implementation plan, not here)

- Desktop + mobile layouts.
- Empty/error/loading states visible.
- Prior-period badge renders with and without prior data.
- Custom date range persists when other filters change.

---

## 12. Open Questions / Future Extensions

Not in scope, flagged for later consideration:

- **CSV export** of the filtered/aggregated series — the classifier is reusable for this.
- **Per-procedure breakdown** — add a `procedure` filter alongside sources/mediums.
- **Campaign drill-down** — clicking a source could expand to show its campaigns (`utm_campaign`) as sub-series.
- **Stacked-100% mode** — composition over time as percentage rather than absolute.
- **Saved views** — persist filter combinations per admin user.
- **Goal overlay** — draw a horizontal target line ("we need 200 leads this month").

---

## 13. Implementation Sequencing Hint

The writing-plans skill will expand this into a detailed task plan. High-level order:

1. Classifier + `KNOWN_REFERRERS` + unit tests.
2. Pipeline pure functions + unit tests.
3. `DateRangeContext` extension (startDate/endDate/granularity).
4. API route + Drizzle query + integration test.
5. `use-lead-trends` hook.
6. Filter bar + custom date range picker.
7. Summary strip.
8. Chart + legend + color palette.
9. Page wiring + states (loading/error/empty).
10. Sidebar navigation entry.
11. Mobile responsive pass.
12. Manual QA + polish.
