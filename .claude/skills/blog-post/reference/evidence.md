# Evidence: Search Console and the keyword gate

Decide from data what to write and what each heading answers. Everything
here is read-only. The `search-console` skill explains the tools; this file
says which calls a post needs and what to record.

## Ground rules

- **The property is the www host.** Pass pages as full URLs,
  `https://www.alluringplasticsurgery.com/<path>`. Non-www URLs come back
  empty.
- **Data lags about 3 days.** Quote the `startDate`/`endDate` each tool
  returns, never "today".
- **Use the live path.** Posts published before 2026 live at `/slug`, posts
  from 2026 at `/blog/slug`. Check the live sitemap
  (`curl -s https://www.alluringplasticsurgery.com/sitemap/blog.xml`) or the
  registry entry's `url`.
- **Strings are exact.** `pages_for_query` and `queries_for_page` match
  exactly; find the real string with `search_queries` first.
- **Never invent a number.** No data for a query means Google recorded no
  impressions. Say so.

## A rewrite

| #   | Call                                                                                                                                                                                                                                                    | What it tells you                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `queries_for_page` `{page: <full URL>, days: 90, limit: 500}`                                                                                                                                                                                           | Every query that finds the post: the H2 map, the FAQ list, secondary keywords                                                                                                                                                                                                                                                                                           |
| 2   | `queries_for_page` `{page, days: 28, limit: 200}`                                                                                                                                                                                                       | What it ranks for now, against #1                                                                                                                                                                                                                                                                                                                                       |
| 3   | `page_trend` `{page, days: 180}`                                                                                                                                                                                                                        | Gaining or slipping, and since when                                                                                                                                                                                                                                                                                                                                     |
| 4   | `pages_for_query` `{query: <each of its top 3 queries>, days: 90}`                                                                                                                                                                                      | Another of our pages on the same query is cannibalization: fold or retarget first                                                                                                                                                                                                                                                                                       |
| 5   | `grep -n "slug: '<slug>'" packages/shared/src/seo/keyword-ownership-blog.constant.ts`                                                                                                                                                                   | The registry entry: `status`, `primaryKeyword`, `ownsQueries`, `notes`                                                                                                                                                                                                                                                                                                  |
| 6   | Before the brief: `node blog/tools/gate.mjs "<live title>" "<registry primaryKeyword>" --db local --json` (the `primaryKeyword` from row 5: the row's own `primary_keyword` can be empty). Once `meta.json` exists: `gate.mjs --from <slug> --db local` | Must say `refresh` with `owningSlug` = this post; anything else is a registry problem to fix first. `warnings` names keywords another page owns: drop them                                                                                                                                                                                                              |
| 7   | `node $TSX blog/tools/baseline.mts blog/baselines/<slug>-<YYYY-MM-DD>.csv <slug>`                                                                                                                                                                       | The before picture ([measurement](measurement.md)). **Before any change**                                                                                                                                                                                                                                                                                               |
| 8   | `python3 blog/tools/rewrite_base.py <slug> --db <production, or a production-filled copy> --out <scratch>/<slug>-live.md --save`                                                                                                                        | The live text you start from, its md5 recorded as `meta.json` `base_md5`, and `<slug>-live.md.row.json`: title, meta, excerpt, quick answer, the `faqs` column, keywords, categories, tags, images (as `reuse_url` entries), `published_at`. Carry the live FAQs you keep into the FAQ section: `build_sql.py` replaces the `faqs` column with the FAQs in `content.md` |

Row 8's database must be production's row (a read: ask the user first) or a
throwaway filled from production today
([publishing](publishing.md#1-a-database-to-rehearse-on)), never the local
copy, which can be weeks stale (`rewrite_base.py --save` refuses
`alluring-autopilot-dev`). `build_sql.py` refuses the rewrite when the
target row's md5 is not `base_md5`, so a rewrite written from older text is
stopped instead of overwriting newer production content.

Also check the refresh queue. A post with an open `content_refresh`
candidate can be rewritten by autopilot while you work
([publishing](publishing.md#2-hold-the-refresh-queue)):

```sql
SELECT cr.status, round(cr.score::numeric, 1) AS score, cr.created_at::date
  FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
 WHERE p.slug = '<slug>' AND cr.status IN ('pending', 'in_progress', 'ready_for_review');
```

## A new post

| #   | Call                                                                                    | What it tells you                                                                           |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | `content_gaps` `{days: 90, limit: 100}`                                                 | `coverage: none` = write. `weak` = retitle the `topPage` (that's a rewrite, not a new post) |
| 2   | `search_queries` `{term: "<topic word>", days: 90, limit: 200, orderBy: "impressions"}` | The words she uses, and how much demand each phrasing has                                   |
| 3   | `pages_for_query` `{query: "<head query>", days: 90}`                                   | Who ranks now. Any page of ours on it means `refresh`, not a new URL                        |
| 4   | `node blog/tools/gate.mjs "<title>" "<primary>" <secondary…> --db local --json`         | The verdict, before writing                                                                 |
| 5   | `node blog/tools/slug_check.mjs <slug> --db local`                                      | Exit 0 = free                                                                               |
| 6   | `content_opportunities` `{days: 90}`, `position_changes` `{days: 28}`                   | Optional: whether a retitle or a losing post is the better use of the week                  |

**`--db local` and the overlay.** The gate's live overlay is the published
posts missing from the registry. The local database stops at its last clone
(2026-08-26 as of October 2026), so it misses newer posts. Before the brief,
run the gate once more against production (a read: the user's OK) or a
fresh clone. `build_sql.py` re-runs it against the target database and stops
on anything but `new`.

## The gate

`gate.mjs` runs `evaluateTopicCandidate` (`packages/shared/src/seo/topic-gate.util.ts`)
the way the admin does before a post enters the pipeline
(`apps/admin/lib/services/ideation-gate.service.ts`): against the registry
plus the live overlay.

| Verdict   | When                                                                                                                                 | Do                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `new`     | No owner, and nothing at or above 0.7 similarity                                                                                     | Write it                                     |
| `refresh` | A live blog post owns the exact query, or a blog owner matches at or above 0.85                                                      | Rewrite `owningUrl`                          |
| `reject`  | A retired topic, a money page (procedure, cost) owns it, or another match at 0.7 or above (a blog owner under 0.85, any other owner) | Stop. Tell the user the owner and the reason |

`warnings` names the secondary keywords, and (with `--from`) the
`owns_queries` entries, that another page owns: a procedure page's head or
cost query, another post's query, a retired post's. Drop them from
`secondary_keywords` and `owns_queries`, then run the gate again. A new post
needs `new` with no warnings, and a rewrite needs `refresh` of itself with
no warnings. `check_post.py` and `build_sql.py` re-run the gate and fail
otherwise. `owns_queries` becomes the registry entry's `ownsQueries` once
the post is live, and the registry test lets a blog entry share a query
with a page, so this gate is the check.

A direct SQL insert skips the admin's gate, which is why it runs here, at
`--save` time, and again inside `build_sql.py`.

## Other sources for the brief

- **The facts file** for the cluster (`blog/tools/clusters.json` names it):
  every figure you may state, with its attribution.
- **The cluster plan**, if one exists. Each one is in the main checkout and
  gitignored, so a worktree doesn't have it:
  `implementation-plans/2026-10-05-<cluster>-blog-cluster/README.md`
  (verdict, data) and `posts.md` (per-post decisions and replacement copy),
  or `implementation-plans/2026-09-22-lipo-blog-cluster/`. The hub is
  https://claude.ai/artifact/HRhy7k68pRWxPT6UjeTeUK; read it with the
  Artifact tool, never WebFetch.
- **The AI panel**: the newest `blog/panels/YYYY-MM-DD.md`. Check whether
  answer engines cite or misquote this post or its topic.
- **The top results** for the head query (WebSearch). What they all say, and
  what none of them has: that's the information gain.

## What to record in `meta.json` `gsc`

The numbers the brief was built on, so the readout has a "before":

```json
"gsc": {
  "basis": "queries_for_page | search_queries",
  "window": "2026-07-07..2026-10-04",
  "impressions": 0,
  "clicks": 0,
  "position": 0,
  "top_queries": [{ "query": "…", "impressions": 0, "clicks": 0, "position": 0 }]
}
```

- **Rewrite:** the page's totals over the 90-day window (`baseline.mts`'s
  `total` row, or the sum of `queries_for_page`), and its top 10 queries by
  impressions.
- **New:** the summed demand of the queries it will own (`search_queries`),
  with the best current position of any URL of ours, and those queries.
- `window` is the dates the tool returned. `secondary_keywords` and
  `owns_queries` come from `top_queries`, not from imagination.
