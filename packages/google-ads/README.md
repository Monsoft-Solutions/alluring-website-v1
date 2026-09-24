# @workspace/google-ads

Read-only data layer for the practice's Google Ads account. It is shared by the
`google-ads` MCP server ([`packages/mcp-google-ads`](../mcp-google-ads)) and
will be used by the admin app.

```ts
import { getCampaignPerformance, lookupClicks } from '@workspace/google-ads'

const { range, campaigns, totals } = await getCampaignPerformance({ days: 14 })
const { clicks } = await lookupClicks({
    gclids: [lead.gclid],
    date: '2026-09-21',
})
```

## What it handles for you

- **Auth.** It uses the shared service account (`GOOGLE_CLIENT_EMAIL` /
  `GOOGLE_PRIVATE_KEY`), with a JWT and the `adwords` scope. Google sunset
  developer tokens on 2026-09-09, so none is sent.
- **Env.** Variables are read per call (`src/env.ts`), not snapshotted at
  import. See the MCP README for the variables.
- **Rows.** The REST API nests fields, camelCases them, sends int64 values as
  strings, gives money in micros and omits zero values. `searchGaql` flattens
  rows to GAQL field names, converts money to dollars (including `average_cpc`
  and `cost_per_conversion`, which are micros without the suffix), and fills
  omitted metrics with 0.
- **Dates.** Windows are calendar days in the account time zone
  (America/New_York). By default they end yesterday.
- **Errors.** Failures surface the API's `GoogleAdsFailure` message and codes,
  e.g. `[queryError:UNRECOGNIZED_FIELD]`. 5xx errors and temporary quota
  pressure retry with backoff. The daily quota does not retry.
- **GAQL values.** Quote them with `gaqlString` / `gaqlLikeContains`. Never
  interpolate them by hand.

## Reports

`getAccountOverview`, `getCampaignPerformance`, `getDailyTrend`,
`getSearchTerms`, `getKeywordPerformance`, `getLandingPages`,
`getConversionActions`, `getChangeHistory`, `lookupClicks`, `runGaql`.

For anything else, use `searchGaql` (flattened) or `searchGaqlRaw` (nested, as
sent).

## Tests

```bash
pnpm --filter @workspace/google-ads test
```
