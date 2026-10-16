---
name: blog-post
description: Write, rewrite, fold or review one Alluring blog post from this repo, through blog/ and its toolkit. It covers Search Console evidence and the keyword gate, a brief the user approves, a sourced post that passes check_post.py, GPT Image 2.5 images, and guarded SQL rehearsed on a throwaway database that the user runs on production. It ends with a day-28/56/90 readout. Use when the user says "write a post about <topic>", "rewrite the <slug> post", "fold these posts", "review the <slug> post", or "/blog-post <slug|topic>". Not for posts the admin pipeline or autopilot generate (apps/admin), and not for choosing next month's topics (/seo-plan).
argument-hint: '<slug|topic> [new|rewrite|fold|review]'
---

# Blog posts from Claude Code

One post, end to end: evidence → brief → write → check → images → publish →
measure. A post lives in the repo as files (`blog/posts/<slug>/`). The
toolkit checks it and turns it into one guarded SQL transaction. The user
runs that SQL on production.

Arguments: $ARGUMENTS. If the last word is new|rewrite|fold|review, it is the mode; the rest is a live slug or a topic in words. With no mode, a live slug means rewrite and anything else means new, if the gate agrees.

**A post has two jobs.** It answers her question better than the top results
do, and it is the page Google and AI engines quote correctly about Alluring.
It never targets a procedure page's head or cost terms.

The manual is `blog/README.md`. The worked example is
`blog/posts/what-is-lipo-foam/`, a live rewrite in the kit's format that
passes every check. Its two live images are in `blog/images/manifest.json`
and `picks.json`, so it skips Phase 5 (no renders, no uploads) and Phase 6
rehearses on it as it is.
Its `base_md5` is the local copy's row on purpose (its `notes` say why), so
rehearse it on a `createdb -T` copy of the local database; against
production it reports "already live".

## Read first

| What                                                                  | Where                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------------- |
| Readers, SEO/AEO/GEO, evidence, links, the post files                 | [reference/writing-standard.md](reference/writing-standard.md) |
| Credentials, owner claims, prices, wording                            | [reference/compliance.md](reference/compliance.md)             |
| Image rules, prompts, picks, upload                                   | [reference/images.md](reference/images.md)                     |
| Search Console and gate method, what goes in `meta.json` `gsc`        | [reference/evidence.md](reference/evidence.md)                 |
| The brief template                                                    | [reference/brief.md](reference/brief.md)                       |
| The publishing runbook: databases, SQL, production, code PR, indexing | [reference/publishing.md](reference/publishing.md)             |
| Database, render, byte and schema checks                              | [reference/verification.md](reference/verification.md)         |
| Baselines, readouts, the AI panel, leads                              | [reference/measurement.md](reference/measurement.md)           |
| `meta.json` format, every rule `check_post.py` enforces, risks        | `blog/README.md`                                               |

| Source of truth           | File                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| The surgeon's credentials | `apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`                        |
| Figures a post may state  | `apps/web/lib/data/procedures/facts/<cluster>.facts.ts` (bbl, lipo, tummy-tuck today) |
| Prices                    | the facts file, else `docs/pricing/practice-price-list.md` (2026-09-15)               |
| Clusters                  | `blog/tools/clusters.json`: procedure page, anchors, facts files, retired figures     |
| Who owns which queries    | `packages/shared/src/seo/keyword-ownership-blog.constant.ts`, `topic-gate.util.ts`    |
| The plan and its status   | `blog/plan.json` (the `seo-plan` skill keeps it)                                      |
| URL rule                  | published before 2026-01-01 → `/slug`; from 2026 → `/blog/slug` (`blog-url.util.ts`)  |

## The toolkit

Run everything from the repo root. `D` is a postgres URL, `local` (the
`POSTGRES_URL` in `packages/db/.env.local`) or `env:NAME`. In the main
checkout `local` is the shared dev database: read it, never write content to
it. Tools print `host:port/db`, never credentials. No tool writes a
database: each write is a `.sql` file that someone runs with `psql`.

| Command                                                                              | Job                                                                                                                                    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `node blog/tools/gate.mjs "<title>" "<primary>" [secondary…] --db D [--json]`        | Keyword gate: `new`, `refresh` (rewrite `owningUrl`) or `reject`                                                                       |
| `node blog/tools/gate.mjs --from <slug> --db D --save`                               | Same, from `meta.json`; records it in `meta.json` `gate`                                                                               |
| `node blog/tools/slug_check.mjs <slug> --db D`                                       | Is the slug free (database, redirects, routes, public files, registry). Exit 1 = no                                                    |
| `python3 blog/tools/check_post.py <slug> --db D [--final]`                           | The lint. Exit 1 on any problem; warnings never fail                                                                                   |
| `python3 blog/tools/consistency.py <slug>`                                           | Figures on fact topics that the facts file doesn't declare (`?` lines)                                                                 |
| `python3 blog/tools/images/generate.py <slug> [--dry-run]`                           | Renders on Higgsfield, about 3 credits each                                                                                            |
| `node blog/tools/images/export_upload.mjs <slug> --db D [--dry-run]`                 | JPEG export of the picks, public upload to Blob, `blog/images/manifest.json`; skips images with `reuse_url`                            |
| `python3 blog/tools/rewrite_base.py <slug> --db D [--out F] --save [--rebase]`       | Reads the live row a rewrite starts from (`F` + `F.row.json`); records its md5 as `meta.json` `base_md5`; `--rebase` diffs a moved row |
| `python3 blog/tools/build_sql.py D <out_dir> --slug <slug> [--check] [--manifest P]` | Guarded SQL, backup, `code-changes.md`. `--slug` (or `--all`) is required. Exit 1 = nothing written                                    |
| `python3 blog/tools/fold_sql.py D <out_dir> --fold <slug>:<dest> [--delete]`         | Fold SQL and `fold-checklist.md`; `--delete` only after the deploy (it checks the 308s)                                                |
| `bash blog/tools/revalidate.sh [--dry-run] <tag>…`                                   | Clears production cache tags                                                                                                           |
| `node $TSX blog/tools/baseline.mts <out.csv> <slug…>`                                | Search Console baseline (90 days, daily, plus queries)                                                                                 |
| `node $TSX blog/tools/readout.mts <since> --urls F \| --cluster C \| --all`          | The day-28/56/90 readout                                                                                                               |
| `python3 blog/tools/ai_panel.py`                                                     | The AI citation panel (Perplexity, 24 prompts, about 10 cents)                                                                         |
| `psql "$D" … -v slugs=a,b -v expect=N -f blog/tools/sql/hold_refresh.sql`            | Takes posts out of the refresh queue (`resume_refresh.sql` undoes it)                                                                  |

`TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs | tail -1)`.
Every flag and exit code is in `blog/README.md` and each tool's header
(`--help` on the node tools and `revalidate.sh` prints it). An unknown flag
is an error, never ignored.

This skill's own `scripts/` adds three read-only helpers:
`served_check.py` (a served page's parts, JSON-LD tags and claims, see
[verification](reference/verification.md)), and `blog_leads.sql` and
`ga4_landing_leads.mjs` (leads, see [measurement](reference/measurement.md)).

## Phase 0 — Preflight

1. `pwd && git branch --show-current`. Work in a worktree on its own branch
   (`pnpm worktree <branch> <issue> --db clone`), never on `master`. The
   post files, the code changes (registry, test count, v2 allowlist,
   redirects) and the rehearsal database all live there
   ([publishing](reference/publishing.md#1-a-database-to-rehearse-on)).
   `implementation-plans/` is gitignored, so it exists only in the main
   checkout: read cluster plans there by absolute path. Check the branch
   again before every commit, because other sessions switch it.
   If `blog/tools/` is missing in the worktree, the kit is not merged yet:
   stop and tell the user, or rehearse from the main checkout with option B
   ([publishing](reference/publishing.md#1-a-database-to-rehearse-on)).
2. Read the memories in `MEMORY.md` for this area:
   `blog-retirement-four-hand-synced-places`,
   `keyword-ownership-registry-gates-ideation`,
   `blog-post-content-updated-at-trigger`, `slug-collision-breaks-build`,
   `surgeon-board-certification-conflict`, `no-surgeon-name-in-seo-titles`,
   `practice-price-sheet-2026-09-15`, `bbl-price-starting-at-5500`,
   `bbl-recovery-sourced-standard`, `facility-accreditation-unverified`,
   `two-blob-stores-and-hero-nav-overlap`, `local-env-has-real-n8n-webhook`,
   `local-crawling-disabled-noindexes-everything`, `prod-db-reads-on-request`,
   `count-jsonld-script-tags-not-mentions`,
   `procedure-rank-blocker-is-miami-posts-not-links`.
3. Find the item in `blog/plan.json`. If it has none, add one (the user's
   request is its approval); the item shape is in the file's `_about` and
   the `seo-plan` skill. Set its `status` to `in-progress`.
4. List what only the owner can answer (a practice protocol, a price the
   sheet lacks, a claim). Ask all of it in one message, early. Write around
   what is missing; never invent the answer.

## Phase 1 — Evidence · Gate 1: the gate verdict

Method and exact calls: [evidence](reference/evidence.md).

- **Rewrite:** `queries_for_page` (90 and 28 days), `page_trend`,
  `pages_for_query` on its top queries, the registry entry, the live row,
  and `baseline.mts` **before** anything changes. The gate, before the
  brief: `node blog/tools/gate.mjs "<live title>" "<registry primaryKeyword>" --db local --json`
  must return `refresh` with `owningSlug` = the slug (take the primary
  keyword from the registry: the row's `primary_keyword` can be empty).
  `gate.mjs --from <slug>` works only once `meta.json` exists. The live row
  you start from is production's (the user's OK for the read) or a fresh
  production-filled copy, never the local copy:
  `python3 blog/tools/rewrite_base.py <slug> --db <that database> --out <scratch>/<slug>-live.md --save`.
  It also writes `<scratch>/<slug>-live.md.row.json`: the rest of the row
  (title, meta, excerpt, quick answer, the `faqs` column, keywords,
  categories, tags, images as `reuse_url` entries, `published_at`).
- **Rewrite or fold: hold the refresh queue now** if the work will take
  more than a day. Refresh runs in `auto` mode, and these days of brief,
  writing and fact check are what the hold protects. Rehearse
  `hold_refresh.sql` on the clone and hand the user the production line now
  ([publishing section 2](reference/publishing.md#2-hold-the-refresh-queue)).
  A refresh that lands anyway is caught by `build_sql.py`'s `base_md5`
  refusal, but only after the work is done.
- **New:** `content_gaps` (act on `coverage: none` only), `search_queries`
  on the topic, `pages_for_query` on the head query, then `gate.mjs` and
  `slug_check.mjs`.
- **Both:** the cluster's facts file, and the cluster plan if one exists
  (`implementation-plans/2026-10-05-<cluster>-blog-cluster/README.md` and
  `posts.md` in the main checkout, or `2026-09-22-lipo-blog-cluster/`). A
  plan's KEEP/FOLD decision and its replacement copy are the starting point,
  so don't reverse them without new data.

**Gate.** Only a `new` verdict with no `warnings` and a free slug start a
new post. `refresh`
means rewriting `owningUrl` instead, and `reject` means stop and tell the
user why. A rewrite needs the post live and the gate naming it as the
owner (`refresh`, `owningSlug` = this post).

## Phase 2 — Brief · Gate 2: the user approves

Fill [the brief](reference/brief.md): reader stage, the head question, the
H2 map from real queries, the table, the FAQ list, the sources to read,
images, links, SERP drafts, and what the owner must answer. Show it in chat,
or as an artifact when it is long (load `artifact-design` first). **Write
nothing until the user approves it.**

## Phase 3 — Write

1. Follow [writing-standard](reference/writing-standard.md) and
   [compliance](reference/compliance.md). For a rewrite, start from the live
   text `rewrite_base.py` saved, its `.row.json` and its queries; keep the
   `base_md5` it wrote. The live FAQs are in the row's `faqs` column, often
   not in the content: carry every one you keep into the FAQ section, because
   `build_sql.py` replaces that column with the FAQs parsed from
   `content.md`. Take title, meta, excerpt, categories and tags from the
   `.row.json`, and keep a live image that still meets the rules by copying
   its entry (with `reuse_url`) into `meta.json` `images`.
   `build_sql.py` refuses the rewrite when the row has moved since
   ("production changed since you read it"). When it does, run
   `rewrite_base.py <slug> --db <that database> --out <scratch>/<slug>-live.md --save --rebase`:
   it prints the diff from the base you wrote from to the live text. Merge
   every hunk into `content.md` (and `meta.json`), then rebuild. Without
   `--rebase`, `--save` refuses to replace a different `base_md5`.
   The slug, URL and publish date never change.
2. Read every source with WebFetch **in this session**. Put the exact
   supporting sentence in `meta.json` `sources[].quotes`, with `read_on` set
   to today. No source, no figure.
3. Write `blog/posts/<slug>/content.md` and `meta.json`. Every key that
   `check_post.py` requires is in the README's "Post files": `slug`, `mode`,
   `reader`, `cluster`, `title`, `meta_description`, `excerpt`,
   `quick_answer`, `primary_keyword`, `secondary_keywords`, `owns_queries`,
   `categories`, `tags`, `images`, `sources`, `cta`.
   A rewrite keeps `primary_keyword` = the registry entry's
   `primaryKeyword`, even when a cluster plan's new title leads with another
   phrase: the gate resolves the post as owner through that keyword. For a
   fold destination, leave the folded posts' `primaryKeyword` and
   `ownsQueries` out of `secondary_keywords` and `owns_queries` while those
   posts are live: the gate reports them as another page's queries and
   `check_post.py` and `build_sql.py` fail. They join the destination's
   `ownsQueries` in the fold's registry PR (Fold mode step 5), which retires
   the folded entries.
4. New post: `node blog/tools/gate.mjs --from <slug> --db local --save`.
   The verdict must be `new` with no `warnings`: a warning is a secondary
   keyword or an `owns_queries` entry that another page owns (a procedure
   page's head or cost query, another post's). Drop it and run the gate
   again. `check_post.py` and `build_sql.py` re-run the gate and fail on any
   warning.

## Phase 4 — Check · Gate 3: clean, fact-checked, shown

1. `python3 blog/tools/check_post.py <slug> --db local` until it prints
   `1 of 1 post(s) pass`. Fix the post, not the tool. If the tool is wrong,
   fix it for every post and say why. `--db` also checks categories and
   tags, but a stale copy doesn't know newer posts: if a link to a recent
   post shows as unknown, check it without `--db` (the live sitemap).
   `build_sql.py` runs every rule again against the database it builds for.
2. `python3 blog/tools/consistency.py <slug>`. Resolve each `?` line: the
   figure matches the facts file, or it has its own source in `meta.json`,
   or it goes.
3. **Second-model fact check.** Spawn a fresh general-purpose subagent on a
   different model from the writer (pass `model: 'sonnet'` when the writer
   is Opus). Give it WebFetch only, plus `content.md` and `meta.json`. It
   opens every source and returns one row per figure, attribution and safety
   instruction: claim | source | verdict (supported / misattributed /
   unsupported / wrong) | the quote. Phase 2 of the lipo rewrite found
   misattributions ("ASPS says" for a quoted surgeon) and two unsafe
   emergency instructions this way. Fix every row that isn't "supported",
   then re-run steps 1–2.
4. Show the user the post and the fact-check table. Move on when they're
   happy.

## Phase 5 — Images · Gate 4: the user picks

**Worked example: skip renders and uploads.** Its picks are in `picks.json`
and its uploads in `manifest.json`, so go straight to
`check_post.py what-is-lipo-foam --db local --final`. (Its renders aren't
on this machine; `export_upload.mjs` reports each pick as "already in the
manifest (job <id>), nothing to export". Spend no credits on it.)

Follow [images](reference/images.md). A rewrite whose live hero (or
infographic) still meets the image rules can keep it: set that image's
`reuse_url` in `meta.json` and skip its render and upload. Check the
Higgsfield balance and run `generate.py <slug> --dry-run`. Tell the user the credit estimate, then
render. Show the candidates, and the user picks. Picks go in
`blog/images/picks.json`. Proofread every infographic word for word against
the post. Then run `export_upload.mjs <slug> --db local` (uploads are public,
so approved picks only) and `check_post.py <slug> --db local --final`.

## Phase 6 — Publish · Gate 5: the user runs production

The runbook, with commands and risks, is in
[publishing](reference/publishing.md). In short:

1. Check that nothing re-opened since the Phase 1 hold: run the
   refresh-queue query in [evidence](reference/evidence.md#a-rewrite).
   `build_sql.py` dismisses `pending` and `ready_for_review` candidates in
   the same transaction, but an `in_progress` run blocks the build and the
   SQL: wait for it to finish.
2. Build on a throwaway database (`build_sql.py "$CLONE_URL" <dir> --slug <slug>`)
   and apply it there. Run it a second time: the second run must fail. For a
   rewrite or a fold, get the production-read OK first and fill the
   throwaway from production
   ([publishing section 1](reference/publishing.md#1-a-database-to-rehearse-on),
   the `pg_dump` recipe), so the step-4 diff can match. On the stale local
   copy a rewrite refuses to build (its `base_md5` is production's row) or
   the diff differs; redo the rehearsal on a production clone. A new post
   may rehearse on a `createdb -T` copy of the local database.
3. Render it with `next start` against the clone, with production flags, and
   do every check in [verification](reference/verification.md). For a
   rewrite, rehearse the undo last: apply `undo-01-<slug>.sql` on the clone,
   check the row is back, and run it again (it must fail).
4. With the user's OK for a production read, rebuild against production into
   a new folder and `diff -r` it with the rehearsal. On a production-filled
   copy made today, only `build-info.json` differs. On an older copy expect
   the rewrite's md5 and fingerprint guard lines, `backup.json`, and the
   refresh-queue line (open candidates dismissed, or a dismissed row
   inserted) to differ too. The rule: if anything besides `build-info.json`
   differs, rehearse the production build on a fresh production clone
   before the run. A production build that says "already live" wrote
   nothing: the row already holds this post (publishing section 5).
5. Before the production run, two decisions for the user, in one pre-run
   PR (`code-changes.md` lists both under "Before the production run"):
    - **v2**: if the slug isn't in `BLOG_V2_SLUGS`, ask the user, and merge
      and deploy that one line first. Declining v2 publishes the post beside
      the old sidebar's "board-certified surgeons" and "5,000+ Happy
      Patients", which compliance.md forbids.
    - **The author page.** Every post, v2 included, names
      `/blog/authors/editorial-team` as its author (JSON-LD `author.url` and
      the byline link). That page renders the editorial-team entry of
      `apps/web/lib/data/authors.data.ts` (lines 80–85 today), which claims
      "board-certified plastic surgeons", "All content is reviewed by our
      surgeons for medical accuracy", a "Medical Content Review Board" and
      "HIPAA Compliance Certified". compliance.md forbids those, and the blog
      has no medical reviewer. Propose a neutral rewrite of that entry in the
      same PR, so the user decides both together.
6. Hand the user the `! psql …` line. Run it yourself only when the user
   says "run it yourself" for that file.
7. `bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-<slug>`.
8. Code PR from `code-changes.md`, after the run: the registry entry and the
   live-post count (+N) for a new post (`slug_check.mjs` treats a registry
   entry as a collision, so it can't go first), the registry changes for a
   rewrite, and always the post files, `blog/images/*.json` and
   `blog/plan.json`. Run `pnpm --filter admin test`. The user merges.
9. Check the live URL. `inspect_url`, then "Request indexing" in the Search
   Console UI (the user, or claude-in-chrome). Never `google:index`.
10. In `blog/plan.json`, set `status: live` and `liveOn`, with the readout
    dates in `notes`. In `meta.json`, set `base_md5` to the new content's md5
    (`rewrite_base.py <slug> --db <production> --save`, or the `content_md5`
    the SQL file's last SELECT printed).

## Phase 7 — Measure

Follow [measurement](reference/measurement.md). Take the baseline before the
change. Read at day 28, 56 and 90 with `readout.mts --urls`, against a
control set of untouched posts in the same cluster. Count leads from the
database, never from GA4 thank-you hits. Set `measured` in `plan.json` when
the day-28 read is in. Session crons die with the session, so the dates live
in `plan.json` and `/seo-plan status` surfaces them.

## Fold mode

`/blog-post <slug> fold`, or "fold these posts": retire posts into a
destination that already owns the topic.

1. **Destination from data.** Use `pages_for_query` on the folded post's
   queries, and the cluster plan. Each folded slug gets one live destination:
   another post or a procedure page section. Never fold into a post that is
   itself being folded.
2. **Merge first.** If the destination absorbs content, rewrite it first
   (Phases 1–6 on the destination). Move the folded post's useful FAQs and
   sections there. The destination keeps its registry `primaryKeyword` as
   `primary_keyword`. Leave the folded posts' `primaryKeyword` and
   `ownsQueries` out of its `secondary_keywords` and `owns_queries` until
   step 5's registry change retires them: while the folded posts are live,
   the gate reports those queries as theirs and the rewrite fails its
   checks. In that step-5 PR, add them to the destination's `ownsQueries`.
3. **Build.** `python3 blog/tools/fold_sql.py "$CLONE_URL" <dir> --fold <slug>:<destination> [--fold …]`
   (no `--delete`: that comes in step 6, after the deploy), on a throwaway
   filled from production (the user's OK), so the inbound links and the
   backups match production.
   It refuses a slug that isn't live, a bad or chained destination, a
   plain-text mention it can't repoint (fix that post by hand first), and an
   `in_progress` refresh. `01` also dismisses the folded posts' open refresh
   candidates and inserts a dismissed one where none is open, so the refresh
   cooldown covers every folded post until `02` deletes it.
4. **Before the deploy.** Rehearse `01-fold-links.sql` on the clone, rebuild
   against production (user's OK), diff, and the user runs `01`. Revalidate
   the tags its last SELECT prints, plus `blog-posts sitemap-urls`.
5. **The five hand-synced places**, in one PR. `fold-checklist.md` lists
   them and ticks each one against the working tree. Re-run `fold_sql.py`
   until every box is `[x]`:

    | #   | File                                                          | Change                                                                                               |
    | --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
    | 1   | `apps/web/next.config.mjs` `redirects()`                      | `/slug` **and** `/blog/slug` → destination, `permanent: true`; repoint older aliases                 |
    | 2   | `apps/web/app/sitemap/blog.xml/route.ts`                      | the slug in `SITEMAP_EXCLUDED_SLUGS`                                                                 |
    | 3   | `packages/shared/src/seo/keyword-ownership-blog.constant.ts`  | `status: 'retired'`, `ownsQueries: []`, `redirectsTo`, `notes`; move kept queries to the destination |
    | 4   | `packages/shared/scripts/generate-blog-keyword-ownership.mjs` | `RETIRED` (keyed by the served path) and `DUPLICATE_OF`                                              |
    | 5   | `apps/admin/__tests__/lib/seo/keyword-ownership.test.ts`      | live-post count N → N−k, with the slugs named in the comment                                         |

6. **After the deploy is live.** `curl -sI` every folded URL in both forms
   and expect 308. Rebuild with `--delete` against production, so the backup
   is current: `--delete` checks both forms itself and writes no `02` until
   each answers 308 to its destination. `02` refuses while a refresh run is
   `in_progress` on a folded post, and when a folded row's md5 or
   `content_updated_at` is no longer the one in `02-folded-backup.json`
   (rebuild). The user runs `02-delete-folded.sql`. Revalidate the folded
   slugs' tags. **Delete, never draft**: drafts count against the autopilot
   draft cap.
7. In `plan.json`, record the fold (`type: fold-post`) and the destination's
   day-28 read.

## Review mode

`/blog-post <slug> review` audits a live post, or one in `blog/posts/`,
against the standard and the data. It changes nothing.

1. **Evidence.** `queries_for_page` (90 and 28 days), `page_trend` (180
   days), `pages_for_query` on its top three queries, the registry entry,
   the gate (`gate.mjs --from` for a post in `blog/posts`).
2. **The text.** For a post in `blog/posts`, run `check_post.py` and
   `consistency.py`. For a live post that isn't, read the row (local, or
   production with the user's OK) and lint a copy in the scratchpad:
   `<scratch>/posts/<slug>/content.md`, plus a `meta.json` built from the
   row with every required key (`mode: rewrite`; leave a key empty where the
   row has nothing, since that gap is a finding). Then run
   `BLOG_POSTS_DIR=<scratch>/posts python3 blog/tools/check_post.py <slug>`.
   Never write it into `blog/posts`.
3. **The page.** `curl` the live URL and run
   `python3 .claude/skills/blog-post/scripts/served_check.py <url> <slug or scratch content.md>`.
   It reports the claims, split between post and template, and the JSON-LD
   tag counts ([verification](reference/verification.md#3-the-served-html)).
   Note the template: v2 if the slug is in `BLOG_V2_SLUGS`, else the old one
   with its sidebar claims.
4. **Findings.** Tag each one:

    | Tag              | Meaning                                                             |
    | ---------------- | ------------------------------------------------------------------- |
    | **Keep**         | Already better than the results above it; don't trade it away       |
    | **Before merge** | Wrong, risky or non-compliant as published: fix in the next rewrite |
    | **Needs owner**  | A fact, a price, a protocol or a sign-off only the practice has     |

    Each finding gets **why** (the evidence, with numbers and its window),
    **change** (copy-ready text or the exact field), and **where** (section,
    field or line).

5. Give the verdict and the findings in chat. When they are long, publish
   an artifact (load `artifact-design` first). "Go ahead" then starts a
   rewrite at Phase 2, with the findings as the brief's starting point.

## Who does what

The `blog-post-writer` agent does the non-interactive work. It can't ask the
user anything, so **every gate stays in the main session**.

| Step                         | `blog-post-writer`                                 | Main session and the user                                     |
| ---------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Evidence and brief           | Pulls the data, runs the gate, drafts the brief    | **The user approves the brief**                               |
| Write and check              | Writes, reads sources, lints, runs consistency     | Runs the second-model fact check, shows the post              |
| Image candidates             | Renders, after the main session gets the credit OK | **The user picks**; the main session writes `picks.json`      |
| Export and upload            | Uploads the given picks                            | Gives the picks                                               |
| Build and rehearse           | Throwaway database, SQL, apply, render, checks     | Reads the report                                              |
| Production rebuild and diff  | Only when its prompt carries the user's OK         | Gets the OK for the production read                           |
| v2 line (before the run)     | Prepares it                                        | **The user decides**; merged and deployed before the run      |
| Production run               | Never                                              | **The user runs it**, or says "run it yourself" for that file |
| Revalidate, indexing request | Never                                              | After the production run                                      |
| Code PR                      | Prepares the changes; commits only when told       | **The user merges**                                           |
| Review                       | Returns tagged findings                            | Publishes the review, decides                                 |

The `seo-strategist` agent and the `seo-plan` skill choose what to write and
read the results; this skill writes it.

## Never

- Write production yourself unless the user said "run it yourself" for that
  file. Never `db:seed` or `db:push`. Never write content to the shared dev
  database (`alluring-autopilot-dev`).
- Leave a post as `draft` or `scheduled`. Drafts block autopilot, and
  nothing publishes `scheduled`.
- Change a live post's slug, `published_at` or status, or edit generated SQL
  by hand. Change the post and rebuild.
- State a figure without a source read this session, or invent a practice
  protocol, a price or a quote from the surgeon.
- Name the surgeon in a title. Say "board-certified plastic surgeon", ABPS,
  AAAASF, "5,000+", "best", "luxury" or "affordable". Mention travel
  arrangements or any market outside the US.
- Run `pnpm --filter web google:index`. It submits the whole sitemap.
- Commit, push or merge without being told.
