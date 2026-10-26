# Measurement

Did the post move search, AI answers and leads? Measure each change against
its own "before" and against posts nobody touched. Everything here is
read-only.

```bash
TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs | tail -1)
```

## 1. Baseline, before the change

```bash
node $TSX blog/tools/baseline.mts blog/baselines/<slug>-<YYYY-MM-DD>.csv <slug> [<control slug> …]
```

- For each URL: 90 days of daily `page_trend` rows, every query with
  impressions in that window (`queries_for_page`), and a `total` row. CSV
  columns: `kind,url,window_start,window_end,date,query,clicks,impressions,ctr,position`.
- The window ends 3 days ago and uses `dataState: final`, on the www host.
  A bare slug resolves through the live blog sitemap.
- **Rewrite:** the post, plus the 3–5 control posts (below).
- **New post:** there is no page yet. Baseline the cluster's procedure page
  and any post of ours that ranks for the target queries
  (`pages_for_query`). A new post can take queries from them.
- **Fold:** the destination and every folded URL.
- Record the baseline file and the control set in the `plan.json` item's
  `notes` the same day, so the control set doesn't drift.

## 2. The control set

Posts nobody touched during the window: the same cluster or reader stage,
similar traffic, not rewritten, folded or moved to the v2 template between
the baseline and the read. Three to five is enough. A change counts when the
post moves and the controls don't. Site-wide swings (seasonality, a core
update, the procedure pages' fall in February 2026) move the controls too.

## 3. Readouts at day 28, 56 and 90

Put the post and its controls in a URL file, one per line (a full URL,
`/path` or a bare slug; `#` comments are fine), in `blog/readouts/`
(`mkdir -p blog/readouts` the first time):

```bash
node $TSX blog/tools/readout.mts <liveOn YYYY-MM-DD> --urls blog/readouts/<slug>.urls --window 28 --name <YYYY-MM-DD>-<slug>-d28
```

- It writes `blog/readouts/<name>.md` and `.json` and prints the markdown.
  `--no-write` prints only.
- Windows: `--window N` days each side of `<since>`. The default is every
  day from `<since>` to the last data day, capped at 90, with a before
  window of the same length. Under 14 days it adds a note: too early to
  judge.
- It uses `dataState: all`, so the newest days are partial. Compare
  readout with readout, and keep the baseline CSV as the frozen record.
- `--cluster <name>` reads a whole cluster plus its procedure page; `--all`
  reads every post in the live blog sitemap. `/seo-plan readout` runs those
  monthly.

**What to read, in order:**

| Measure                           | Where in the readout                    | Reading                                                                           |
| --------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| Position (impression-weighted)    | `urls[].before/after`, `delta.position` | The ranking moved, or didn't                                                      |
| Impressions per day               | `delta.imprPerDay`                      | Reach: new queries picked up or lost                                              |
| Clicks per day, CTR               | `delta.clicksPerDay`, `delta.ctrPoints` | Flat position with falling CTR = a snippet problem (title, meta, FAQ rich result) |
| Query movers                      | `queryGainers`, `queryLosers`           | Did the H2 map's queries move? Did a sibling take any?                            |
| Snippet problems, push candidates | `snippetProblems`, `pushCandidates`     | Next fixes: a retitle, or a section for a query at position 4–12                  |
| The controls                      | the same rows for the control URLs      | Subtract their move before crediting the post                                     |

Judge nothing before day 28. Day 28 is a first read, day 56 a trend, and day
90 the verdict that goes in `plan.json`.

For a quick look between reads, `page_trend` `{page, days: 56}` from the
`search-console` MCP is enough.

## 4. AI answers: the citation panel

```bash
python3 blog/tools/ai_panel.py --dry-run     # the prompts and the cost (24 calls, about $0.10)
python3 blog/tools/ai_panel.py               # writes blog/panels/<date>.json and .md
python3 blog/tools/ai_panel.py --only <n,n> --tag <slug>  # an ad-hoc check of the prompts on this topic; tagged runs never become the baseline
```

- It asks Perplexity `sonar` each prompt in `blog/tools/ai-panel-prompts.json`.
  It records whether Alluring is cited, at which rank, what the answer says
  about Alluring (verbatim), and flags any wording that contradicts the
  `truths` block (prices, one surgeon, no ABPS / double board / 5,000+ /
  AAAASF), which follows the claims canon (`docs/claims/canon.md`).
- The comparison line is against the newest earlier untagged panel.
  Baseline 2026-10-07: cited 17/24 (71%), non-brand 15/22 (68%), Alluring
  is citation #1 on 10/24, 10 error flags.
- An error flag is a wrong claim an answer engine repeats. Fix the page it
  came from (`source: index-title` means a stale indexed title), not the
  panel.
- Change prices and claims in `truths`, never in the code. Keep prompt text
  byte-identical, or bump `version`.
- The key is `PERPLEXITY_API_KEY`, else the last matching line of
  `apps/admin/.env`. It is never printed. Exit 3 with `--fail-on-flags`
  when an error flag is raised.

## 5. Leads

**Count leads from the database, never from GA4 thank-you hits.** A
reopened thank-you tab fires `thank_you_page_view` and `generate_lead`
again with no new lead.

```bash
psql "$D" -X -v ON_ERROR_STOP=1 -v since=2026-06-01 -f .claude/skills/blog-post/scripts/blog_leads.sql
```

- Counts only, by month: leads sent from a post (`submitted_from_path`,
  recorded since 2026-09-23), leads whose session landed on a post
  (`landing_page`), the old post form (`source = 'blog-lead'`), and all
  leads.
- Production has the leads. Reading it needs the user's OK in the session.
  Never export lead rows (names, emails, phones): aggregates only.
- `created_at` is Miami wall time: compare it with plain dates, never
  convert it.

**GA4, as a rate and a cross-check:**

```bash
node .claude/skills/blog-post/scripts/ga4_landing_leads.mjs <start> <end> blog            # every post in the blog sitemap
node .claude/skills/blog-post/scripts/ga4_landing_leads.mjs <start> <end> '^/blog/<slug>$' # one post
```

- It returns non-direct sessions and `generate_lead` **eventCount** by
  landing page, for property 457152980. `keyEvents:generate_lead` reads 0
  before late September 2026, so don't use it.
- It runs as the Search Console service account (a GA4 Editor). It only
  reads; never call the GA4 Admin API from a measurement.
- Blog conversion is low: 0.15 per 100 non-direct sessions,
  27 Sep–3 Oct 2026. Read it over weeks, not days.

## 6. Record

In the `plan.json` item: `status: measured` once the day-28 read is in, and
in `notes` the readout file, the post's change against the controls
(position, impressions/day, clicks/day, CTR), leads, and the panel line if
the post is in a panel prompt. The day-90 verdict goes in `notes` too: keep,
retitle, extend, or fold.
