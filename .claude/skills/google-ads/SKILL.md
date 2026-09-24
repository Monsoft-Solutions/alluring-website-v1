---
name: google-ads
version: 1.0.0
description: Read live Google Ads data for the Alluring account (447-254-7809) — spend, campaigns, search terms, keywords, landing pages, conversion actions, change history, and which campaign/keyword a lead's gclid came from. Use when evaluating ad performance or an agency's work, planning budgets or negatives, checking whether conversions are tracked, tracing a lead back to its click, or whenever the user mentions "Google Ads," "PPC," "campaigns," "search terms," "CPC," "CPA," "PMax," or "gclid." For organic search data, see search-console.
---

# Google Ads

The `google-ads` MCP server exposes the practice's Google Ads account as tools
(`mcp__google-ads__campaign_performance`, …). Use it instead of reading the Ads
UI through a browser: it is faster, exact, and covers things the UI hides
(e.g. which conversion actions are primary, who changed a budget).

Everything is **read-only**. The service account is a Read only user and the
server only calls search endpoints — nothing you call can change the account.

## Ground rules

- **Dates are Miami days.** Windows are calendar days in America/New_York and
  default to the last N complete days ending **yesterday**. Pass `endDate` =
  today for live numbers. Every result echoes the exact window — quote it.
- **Money is dollars.** `*_micros` fields are converted; `average_cpc` and
  `cost_per_conversion` too.
- **"Conversions" ≠ leads.** Google counts only _primary_ conversion actions in
  `conversions`, and those include things like "Calls from ads". Check
  `conversion_actions` before quoting a CPA, and prefer the website's own lead
  records (`contact_submission`) for lead counts.
- **Never invent metrics.** An empty result means no delivery in the window.
- **Quota:** 2,880 operations/day (Explorer access). One report ≈ one
  operation; `lookup_click` costs one per day searched. Don't loop it over
  hundreds of leads without asking.

## Which tool for which job

### "How are the ads doing?"

1. `account_overview` — totals, plus the account-level tracking template and
   final URL suffix (broken ValueTrack templates live here).
2. `campaign_performance` — per campaign, with impression share lost to budget
   vs rank for Search. Paused campaigns with no impressions are hidden unless
   `includeInactive`.
3. `daily_trend` — overspend days, pauses (zero rows), when a change landed.

### "Where is money wasted?"

1. `search_terms` — what people actually typed. `status` NONE = not yet a
   keyword or negative. Competitor names, addresses and job searches are the
   usual waste. Performance Max terms are **not** available here.
2. `keywords` — broad-match keywords with high spend and no conversions;
   quality score (null = not enough data).
3. `landing_pages` with `expanded: true` — pages Performance Max sent traffic to
   through URL expansion (blog posts, the home page).

### "Is conversion tracking right?"

`conversion_actions` — each action's origin (WEBSITE / GA4 / CALL_FROM_ADS /
GOOGLE_HOSTED), whether it is primary, and what it recorded in the window in
"Conversions" vs "All conversions". A primary action at 0 while its GA4 twin
counts is the classic broken-tag signature.

### "Who changed what?"

`change_history` (max 30 days) — user email, client (web UI, bulk upload, API),
resource and changed fields. `includeValues: true` adds old → new values;
budgets come out in dollars.

### "Which ad did this lead come from?"

Leads in `contact_submission` carry `gclid`, `gbraid`/`wbraid` (iOS) and
`gad_campaign_id`.

- `gad_campaign_id` **is** the campaign id — match it against
  `campaign_performance` directly, no lookup needed.
- `gclid` → `lookup_click` with the lead's date (Miami time; `created_at` is
  already Miami wall time) — returns campaign, ad group, keyword, match type,
  device, network. Only the last 90 days are queryable.
- `gbraid`/`wbraid` cannot be resolved to a click.

### Anything else

`gaql_search` runs any GAQL SELECT; `list_fields` finds field names. GAQL
traps:

- `WHERE` supports `AND` only — no `OR`. Run two queries.
- Zero values are omitted by the API; this server fills metrics with 0.
- `click_view` needs exactly one `segments.date = '…'`.
- `change_event` needs a `LIMIT` and a window inside the last 30 days.
- Selecting `segments.date` splits rows per day; leave it out to aggregate.
- String literals take single quotes; `LIKE '%term%'` for contains.

## Known account quirks (checked 2026-09-24)

- `{campaignname}` and `{adgroupname}` never expand in the final URL suffix, so
  `utm_campaign` on leads is empty or literal. Use `utm_id` /
  `gad_campaign_id` (numeric campaign id) instead.
- `utm_medium` arrives as `{ifvideo:video}{ifshopping:shopping}` junk on
  Performance Max clicks.
- Some served URLs carry both the account tracking template and the final URL
  suffix, so parameters appear twice.

## History beyond the API's limits: the Ads console tables

The admin's Ads console (epic #288) snapshots the account into Postgres. Query
those tables (read-only) when the API can no longer answer:

- `lead_ad_click` — one row per paid website lead with the campaign, ad group
  and keyword its click came from, kept after `click_view`'s 90 days. Join to
  `contact_submission` on `lead_id`. This is the definition of a paid lead.
- `ads_change_event` — change history kept past `change_event`'s 30 days.
- `ads_campaign_daily`, `ads_keyword_daily`, `ads_search_term_daily`,
  `ads_landing_page_daily`, `ads_conversion_daily` — 13 months of daily
  reports, refreshed for the trailing 30 days every morning.
