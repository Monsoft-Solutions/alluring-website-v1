---
name: search-console
version: 1.0.0
description: Read live Google Search Console data for alluringplasticsurgery.com — what the site actually ranks for, which queries drive which pages, where CTR is being left on the table, and which topics have demand but no page. Use before writing or revising any page or blog post, when deciding what content to create next, when diagnosing a traffic drop, or whenever the user mentions "Search Console," "GSC," "what are we ranking for," "keyword data," "impressions," "CTR," or "cannibalization." For a structural/technical audit with no live data, see seo-audit.
---

# Google Search Console

The `search-console` MCP server exposes the site's live Search Console data as
tools. Reach for it whenever a content decision could be made from evidence
instead of intuition — the difference between "people probably search for BBL
recovery time" and knowing the exact phrasing, volume and current rank.

Everything here is **read-only**. Nothing you call can change the site or push
anything to Google.

## Ground rules

- **Data lags ~3 days.** Every window ends three days before today; the tools
  return the exact `startDate`/`endDate` they used, so quote those, not "today."
- **Never invent metrics.** If a tool returns nothing, say so. Absence of data
  for a query means Google recorded no impressions, which is itself a finding.
- **`content_gaps` returns candidates, not facts.** Verify every one with
  `pages_for_query` before saying a page doesn't exist — see below.
- **Position is an average.** "Position 4.6" means the page averaged 4.6 across
  every impression, not that it sits at #4.
- **Match strings exactly.** `query_trend`, `pages_for_query` and
  `queries_for_page` take exact values as GSC reports them. Find the real string
  with `search_queries` or `top_pages` first, then drill in.
- **`inspect_url` has a 2,000/day quota.** One URL at a time, only when index
  status is genuinely the question.

## Which tool for which job

### Writing or revising an existing page

1. `queries_for_page` — what the page is _already_ being found for. Queries here
   that the copy never addresses are the highest-value additions.
2. `page_trend` — is it gaining or slipping?
3. `pages_for_query` on its main query — if another page competes for the same
   term, fix the overlap before adding more copy.

### Deciding what to write next

1. `content_gaps` — candidate topics with demand and seemingly no page.
   **Always verify each one with `pages_for_query` before acting.**
2. `content_opportunities` — impressions with weak CTR, each with a suggested
   action and the clicks a benchmark CTR would recover.
3. `search_queries` with a topic term — the vocabulary real visitors use. Prefer
   their phrasing over industry terms.

#### Why `content_gaps` needs verifying

It flags a query when the URL of its best-ranking page contains none of the
query's words longer than three characters. A page that covers the topic using
different words therefore looks like a gap.

A real example: `bbl smell` was reported as a gap with ~10,800 impressions.
`pages_for_query` showed `/why-do-bbl-stink` already ranking for all of them at
position 10.1 — the slug says _stink_, the searchers say _smell_, so the
substring check missed it.

That flip matters. "No page exists" means write one. "A page exists at position
10 with 0.2% CTR, using different vocabulary than searchers" means fix the title
and meta on the page you already have. Recommending a new page there would have
created cannibalization instead of traffic.

So: for every gap you intend to act on, call `pages_for_query` with that exact
query first. If a page ranks, treat it as a CTR or ranking problem and reach for
`content_opportunities` and `page_trend` instead.

Improving the heuristic so this step is unnecessary is tracked in issue #204.

### Diagnosing a drop

1. `summary` then `performance_trend` — confirm the drop is real and site-wide.
2. `position_changes` — the losers list names what actually slipped.
3. `inspect_url` on affected pages — rule out an indexing problem.

### Section-level review

`search_pages` with a `term` or `pageType` filter pulls a whole section at once.
Note that page types are classified by URL shape here, so pre-2026 blog posts
living at root level (e.g. `/best-plastic-surgeon-miami`) come back as `other`.

## Turning data into copy

Query data is a source of _substance_, not of phrasing. Feed it into content by:

- Covering the intent behind a query, in the practice's own voice. Never paste a
  keyword in verbatim to hit it.
- Answering what the query implies the reader doesn't know yet — a query like
  "how long after bbl can i fly" is a question the page should answer plainly.
- Respecting the business context in `CLAUDE.md`. The US-only market scope and
  the no-travel-coordination rule hold regardless of what queries show up; if
  GSC surfaces demand the practice does not serve, say so rather than writing to
  it.

## If the tools report "not configured"

Credentials live in `apps/admin/.env` (`GOOGLE_CLIENT_EMAIL`,
`GOOGLE_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`). The server reads that
file directly — see `packages/mcp-gsc/README.md`.
