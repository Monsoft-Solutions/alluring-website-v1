---
name: seo-plan
description: Run the blog and search plan for alluringplasticsurgery.com over blog/plan.json. It covers what is due this week, the monthly readout (Search Console, leads from the database, GA4, the AI citation panel), running the AI panel, and proposing next month's calendar from Search Console gaps, the cluster plans and the keyword registry, with every candidate through the gate. Use when the user says "what's due on the blog plan", "monthly SEO readout", "how did the posts do", "run the AI panel", "plan next month's posts", "show the content calendar", or "/seo-plan". The blog-post skill writes the posts; this skill chooses them and reads the results.
argument-hint: '[status | readout | month | panel | calendar]'
---

# The search plan

The strategist's loop: plan → write (`/blog-post`) → measure → plan again.
`blog/plan.json` holds every item and its status. This skill keeps it
honest and proposes what comes next. It writes posts through `/blog-post`,
never itself.

`$0` picks the job: `status` (the default), `readout`, `month`, `panel` or
`calendar`.

**The strategy artifact is the source of the plan.** It holds the phases,
the reasoning and the KPIs. `plan.json` mirrors its items with their
status, for the tools and for `status`. When they disagree, the artifact
wins: fix `plan.json`, and tell the user. Find the artifact through
`plan.json` `strategyArtifact` if set. Otherwise use the Artifact tool's
`list` (title "Alluring Search Plan"). If neither finds it, ask the user for
the link. When `month` changes the plan, update both: read the artifact,
merge, and republish it to the same URL.

## Read first

| What                                                   | Where                                                                                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The plan and its items                                 | `blog/plan.json` (`_about` has the item shape)                                                                                                                                                     |
| Measurement method, scripts, controls, leads           | `.claude/skills/blog-post/reference/measurement.md`                                                                                                                                                |
| Search Console method and the gate                     | `.claude/skills/blog-post/reference/evidence.md`, the `search-console` skill                                                                                                                       |
| What a post must be, and how one ships                 | the `blog-post` skill                                                                                                                                                                              |
| Who owns which queries                                 | `packages/shared/src/seo/keyword-ownership-blog.constant.ts`, `keyword-ownership.constant.ts`                                                                                                      |
| Cluster reviews (KEEP/FOLD per post, replacement copy) | `implementation-plans/2026-10-05-<cluster>-blog-cluster/` (main checkout, gitignored), `implementation-plans/2026-09-22-lipo-blog-cluster/`; hub https://claude.ai/artifact/HRhy7k68pRWxPT6UjeTeUK |
| Readouts and panels so far                             | `blog/readouts/`, `blog/panels/`                                                                                                                                                                   |

Memories: `procedure-rank-blocker-is-miami-posts-not-links`,
`keyword-ownership-registry-gates-ideation`,
`updated-pages-perf-check-2026-10`, `conversion-readout-2026-10-07`,
`blog-post-conversion-revamp`, `thank-you-reopen-ghost-conversions`,
`gsc-cannibalization-sweep-technique`, `ga4-data-api-access`.

## The plan file

```json
{
    "updated": "…",
    "planName": "…",
    "week1": "2026-10-12",
    "phases": [],
    "kpis": [],
    "items": [
        {
            "id": "w1-rewrite-post-how-long-to-recover-tummy-tuck-0",
            "week": 1,
            "type": "rewrite-post",
            "cluster": "tummy-tuck",
            "url": "/how-long-to-recover-tummy-tuck",
            "title": "…",
            "targetQueries": ["…"],
            "readerStage": "recovering",
            "owner": "…",
            "effort": "…",
            "dependsOn": null,
            "metric": "…",
            "rationale": "…",
            "status": "todo",
            "notes": "",
            "liveOn": null
        }
    ]
}
```

- `week` is a number counted from `week1` (week N starts on `week1` + 7 × (N−1)
  days) or an ISO week string (`2026-W42`). Read both.
- `type`: `new-post`, `rewrite-post`, `fold-post`, `page-fix`, `technical`,
  `compliance`, `local`, `geo`, `measurement` or `decision`.
- `status`: `todo` → `in-progress` → `rehearsed` (applied on a clone and
  rendered) → `live` (the user ran it on production and it was revalidated;
  `liveOn` set) → `measured` (the day-28 read is in). `dropped` needs a
  reason in `notes`.
- Keep `id`s stable: the artifact matches items by `id`. A new item's id is
  `w<week>-<type>-<slug>-<n>`.
- Set `updated` to today whenever you write the file. Write it only in
  `month` (after approval) and `readout`, or when a `/blog-post` step
  changes an item's status.

## status (the default)

Read-only. From `plan.json` and today's date (America/New_York):

1. **Due this week:** items whose week has started and whose status is
   `todo` or `in-progress`. Mark overdue weeks.
2. **Readouts due:** `live` items whose `liveOn` + 28, 56 or 90 days falls
   this week or has passed with no read in `notes`.
3. **Stuck:** `in-progress` for more than 14 days, `rehearsed` for more than
   7 (waiting on the user's production run), or `dependsOn` an item that
   isn't live.
4. **Waiting on the owner or the user:** `decision` items, owner questions
   in `notes`.

Print one table per group: id, week, type, url, status, and the next
action with its command (`/blog-post <slug> rewrite`, `/seo-plan readout`,
…). End with the KPI table's latest row.

## readout (monthly)

1. **Since when.** `<since>` is the date of the last readout (the newest
   `blog/readouts/*.json`, its `run.date`). With none, use `week1`.
2. **Search Console:**

    ```bash
    TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs | tail -1)
    node $TSX blog/tools/readout.mts <since> --all
    node $TSX blog/tools/readout.mts <since> --cluster <c>         # each cluster with live items this month
    node $TSX blog/tools/readout.mts <liveOn> --urls blog/readouts/<slug>.urls --window 28 --name <date>-<slug>-d28   # each item due a read
    ```

3. **Leads from the database**, as aggregates. Production needs the user's
   OK in the session:
   `psql "$D" -X -v ON_ERROR_STOP=1 -v since=<month start> -f .claude/skills/blog-post/scripts/blog_leads.sql`.
4. **GA4 rate**, for the readout's before and after windows:
   `node .claude/skills/blog-post/scripts/ga4_landing_leads.mjs <start> <end> blog`.
5. **The AI panel**: this month's `blog/panels/<date>.md`; if there is none,
   run `panel` first.
6. **Write** `blog/readouts/<today>-summary.md`. Include the KPI table with a
   new "Latest" column, what moved and why (against the controls), the
   items read this month with their verdicts, and what should go into next
   month (push candidates, snippet problems, losers, panel error flags).
   Update each item read: `measured`, and in `notes` the readout file and
   the numbers. Then update the artifact's KPI and status sections.
7. Give the user the headline in chat: three to five lines, numbers with
   their windows.

## panel

```bash
python3 blog/tools/ai_panel.py --dry-run    # prompts and cost; say it
python3 blog/tools/ai_panel.py              # 24 calls, about $0.10, 2–3 minutes
```

Read `blog/panels/<date>.md`: the citation rate against the previous run
(its comparison line), which Alluring pages are cited, and every flag. Each
`error` flag is a wrong claim an answer engine repeats. Trace it to the
page it came from, and propose a `page-fix` or `compliance` item with that
path. Prices and claims change in `blog/tools/ai-panel-prompts.json`
`truths`, never in the code. Keep prompt text byte-identical, or bump
`version`.

## month (propose next month's calendar)

1. **Gather.** Use the `search-console` MCP over 90 days unless noted:
    - `content_gaps` `{days: 90, limit: 100}`: `coverage: none` → a new-post
      candidate; `weak` → a retitle or rewrite of the `topPage`.
    - `content_opportunities` `{days: 90, limit: 50}`: retitles and meta
      rewrites.
    - `position_changes` `{days: 28, limit: 50}`: the losers.
    - `search_queries` per cluster term: demand by phrasing.

    Then the last readout's push candidates and snippet problems, the
    panel's flags, the cluster plans' open KEEP+REWRITE and FOLD items, the
    registry (owners, and `planned` pages that hold a cluster while they
    404), and `plan.json` (what's already planned, live, or dropped).

2. **Gate every new-post candidate**:
   `node blog/tools/gate.mjs "<title>" "<primary>" <secondary…> --db D --json`,
   against production (read, with the user's OK) or a fresh clone, since
   the local copy misses recent posts. `new` stays a new post. `refresh`
   becomes a `rewrite-post` of `owningUrl`. `reject` is dropped, and the
   reason goes in the proposal. Never propose a post on a procedure page's
   head or cost terms.
3. **Order.** Work that unblocks the procedure pages comes first: folding
   the "-miami" posts that outrank them for their own head terms. Then
   rewrites of owners that are losing position on real demand. Then new
   posts on `coverage: none` gaps. Compliance fixes from the panel go in
   whenever they come up. Each item gets one metric to judge it by.
4. **Propose** a table: week, type, cluster, url, title, target queries
   (impressions, position, window), reader stage, why, metric, depends on.
   Ask the user how many items a week the practice can review. Until they
   say, propose 2–4.
5. **After the user approves** (with their edits): append the items to
   `plan.json` with `status: todo`, set `updated`, and update the strategy
   artifact. Nothing is appended before approval.

## calendar

Read-only. Print `plan.json` by week: id, type, url, status, `liveOn`, and
the next readout date for live items. Add one line per phase from `phases`
when it's set.

## Standing KPIs

The strategy artifact's KPIs (`plan.json` `kpis`, once the plan is
converted) supersede this table; keep the same rows. Fill the baselines from
the first readout, and set targets with the user. Never invent one.

| KPI                                                         | How                                                              | Baseline                | Target     | Latest |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- | ---------- | ------ |
| Blog clicks per day (all posts)                             | `readout.mts --all`, selected after window                       | _first readout_         | _the user_ |        |
| Blog impressions per day                                    | same                                                             | _first readout_         | _the user_ |        |
| Blog CTR                                                    | same                                                             | _first readout_         | _the user_ |        |
| Procedure pages: position on "<procedure> miami" head terms | `readout.mts --cluster <c>`, the procedure page's row            | _first readout_         | _the user_ |        |
| Queries split between two of our URLs                       | query × page pull (memory `gsc-cannibalization-sweep-technique`) | _first readout_         | _the user_ |        |
| AI panel: non-brand prompts citing Alluring                 | `ai_panel.py`                                                    | 15/22 (68%), 2026-10-07 | _the user_ |        |
| AI panel: Alluring is citation #1                           | `ai_panel.py`                                                    | 10/24 (42%), 2026-10-07 | _the user_ |        |
| AI panel: error flags                                       | `ai_panel.py`                                                    | 10, 2026-10-07          | 0          |        |
| Leads from blog posts per month (database)                  | `blog_leads.sql`: sent from or landed on a post                  | _first readout_         | _the user_ |        |
| Blog `generate_lead` per 100 non-direct sessions (GA4)      | `ga4_landing_leads.mjs <start> <end> blog`                       | 0.15, 2026-09-27..10-03 | _the user_ |        |
| Plan items live this month                                  | `plan.json`                                                      | 0, 2026-10-07           | _the plan_ |        |

## Delegation

- **`seo-strategist`** agent: the research and readout pulls (`month`
  gathering and gating, `readout` steps 2–5, `panel`, review of a
  cluster). It can't ask the user anything, so the main session keeps the
  approvals: the calendar, production reads, spending, and anything
  appended to the plan.
- **`blog-post-writer`** agent: writing and rehearsing posts, through
  `/blog-post`.

## Never

- Append to `plan.json`, or change the artifact's plan, without the user's
  approval.
- Invent a metric, a baseline or a target. A tool that returns nothing is a
  finding.
- Propose a post the gate rejected, a post on a procedure page's head or
  cost terms, or content for markets outside the US or about travel
  arrangements.
- Read production without the user's OK in the session. Export lead rows
  (aggregates only). Write production.
- Run `pnpm --filter web google:index`.
