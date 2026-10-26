# Blog: write, rewrite, fold and publish posts from this repo

Blog posts are rows in Postgres (`blog_post` and its `images`,
`blog_post_images`, `blog_post_revision`, `content_refresh`,
`blog_post_category`, `blog_post_tag` rows). The admin pipeline is one way
to make them; this folder is the other: Claude writes a post as files, the
tools check it against the house standard and turn it into guarded SQL, the
SQL is rehearsed on a throwaway copy of the database, and the user runs it on
production. It generalizes the liposuction work of September 2026 (the fold
in `implementation-plans/2026-09-22-lipo-blog-cluster/`, the 17-post rewrite
in the `feat-lipo-page-module` worktree's `2026-09-23-lipo-blog-phase-2/`).

The rules the posts follow are in `.claude/skills/blog-post/reference/`:
`writing-standard.md`, `compliance.md`, `images.md`. The tools enforce them.

| Path                      | What it is                                                                                                                          | In git |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `plan.json`               | The content plan tracker: one item per post, fold or fix, with its status                                                           | yes    |
| `posts/<slug>/content.md` | The body: markdown, opens with an H2 question, FAQ section, Sources last                                                            | yes    |
| `posts/<slug>/meta.json`  | Mode, reader, cluster, title, meta, excerpt, quick answer, keywords, taxonomy, CTA, image briefs, sources with quotes, gate verdict | yes    |
| `images/manifest.json`    | What was uploaded to Blob, per post and image key                                                                                   | yes    |
| `images/picks.json`       | The chosen render per image                                                                                                         | yes    |
| `images/work/`            | Renders and JPEG exports                                                                                                            | **no** |
| `tools/`                  | The kit (below), plus `ai_panel.py` and `readout.mts` for measurement                                                               | yes    |
| `panels/`, `readouts/`    | Output of `ai_panel.py` and `readout.mts` (see their headers)                                                                       |        |

`posts/what-is-lipo-foam/` is the worked example: the live phase-2 rewrite of
that post, in the kit's format, mode `rewrite`. It passes every check (as of
2026-10-07: its sources were read on 2026-09-23, so from 2026-10-24
`--final` asks for them to be read again, which is that rule working). Its
two live images are in `images/manifest.json` and `images/picks.json`, so it
skips the image step (no renders, no uploads: `export_upload.mjs` reports
each pick as already in the manifest) and the publishing steps rehearse on
it as it is. Its `base_md5` is
the local dev copy's row on purpose (its `notes` say why): rehearse it on a
`createdb -T` copy of the local database. Against production, `build_sql.py`
reports it as already live.

## The tools

All run from the repo root. `--db` takes a postgres URL, `local` (the
`POSTGRES_URL` in `packages/db/.env.local`, the shared dev database: read it,
never write content to it) or `env:NAME`. Tools print `host:port/db`, never
credentials. Nothing here writes to a database: every write is a `.sql` file
that a person runs with `psql`.

| Command                                                                                        | What it does                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node blog/tools/gate.mjs "<title>" "<primary>" [secondary …] [--db D]`                        | The keyword-ownership gate, with the live overlay of posts missing from the registry. Prints the verdict JSON: `new`, `refresh` (rewrite `owningUrl` instead) or `reject`. `--from <slug> --save` reads and records it in `meta.json` "gate". `--strict` exits 2/3 on refresh/reject  |
| `node blog/tools/slug_check.mjs <slug> [--db D]`                                               | Is the slug free: database, redirect sources (`/slug`, `/blog/slug`), app routes, public files, `/blog` subroutes, surgeon pages, the registry. Exit 1 on a collision                                                                                                                 |
| `python3 blog/tools/check_post.py <slug>… \| --all [--db D] [--final]`                         | The lint: the writing standard, the claims sweep, links, images, figures, MDX. Exit 1 on any problem                                                                                                                                                                                  |
| `python3 blog/tools/consistency.py <slug>… \| --cluster C [--strict]`                          | Report: every sentence whose figure (hours, days, weeks, %, cc…) is on a topic the facts file covers but isn't one of its figures. Read each flag                                                                                                                                     |
| `python3 blog/tools/images/generate.py <slug>… [--dry-run]`                                    | Renders each post's images with GPT Image 2.5 (Higgsfield CLI) into `images/work/`                                                                                                                                                                                                    |
| `node blog/tools/images/export_upload.mjs [<slug>…] [--db D] [--id slug=uuid]`                 | JPEG export of the picks and upload to Vercel Blob; writes `images/manifest.json`. Images with `reuse_url` are skipped; a pick already uploaded (in the manifest) whose render isn't on this machine is kept as it is. `--delete-superseded` refuses a local database                 |
| `python3 blog/tools/rewrite_base.py <slug> --db D [--out F] [--save [--rebase [--old F0]]]`    | Reads the live row a rewrite starts from, writes its text to `F` and the rest of the row to `F.row.json`, and records its md5 as `meta.json` `base_md5` (refuses `--save` on the shared dev database, and replacing a different `base_md5` without `--rebase`, which prints the diff) |
| `python3 blog/tools/build_sql.py <D> <out_dir> (--slug S … \| --all) [--check] [--manifest P]` | One guarded SQL file per post, a backup, and the code changes that go with it. One of `--slug` and `--all` is required                                                                                                                                                                |
| `python3 blog/tools/fold_sql.py <D> <out_dir> --fold slug:/destination … [--delete]`           | The SQL for a fold (link repointing before the deploy, the delete after) and the five-place code checklist. `--delete` only after the deploy: it writes no `02` until every folded URL answers 308                                                                                    |
| `bash blog/tools/revalidate.sh [--dry-run] <tag>…`                                             | Clears production cache tags (`blog-posts`, `sitemap-urls`, `blog-post-<slug>`)                                                                                                                                                                                                       |
| `node $TSX blog/tools/baseline.mts <out.csv> <url\|/path\|slug>…`                              | Search Console baseline: 90 days of daily page data and the page's queries                                                                                                                                                                                                            |
| `psql … -v slugs=a,b -v expect=N -f blog/tools/sql/hold_refresh.sql`                           | Takes posts out of the refresh queue (and `resume_refresh.sql` puts them back)                                                                                                                                                                                                        |

Every tool fails on a flag it doesn't know (a typo of `--dry-run` never
uploads). On `--help`, the node tools and `revalidate.sh` print their header
comment and the python tools their argparse usage (the full text is each
file's docstring).
`$TSX` is the repo's own tsx: `TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs | tail -1)`.
`gate.mjs` and the MDX check import the TypeScript source through it, so they
need no build step. The tools need python3, node, `psql` on the PATH, `sips`
(macOS) for image export, and the `higgsfield` CLI for renders. They add no
dependencies.

`blog/tools/clusters.json` maps each cluster (`lipo`, `bbl`, `tummy-tuck`, …)
to its procedure page, that page's section anchors, its facts files and its
retired figures. Update the anchors when a procedure page is rebuilt.

## A throwaway database

Every SQL file is applied to a copy first. Two ways:

```bash
# A copy of the local dev database (connect as in POSTGRES_URL: -h/-p/-U; no other
# session may be connected to the template while it is copied):
createdb -T alluring-autopilot-dev alluring_blog_<topic>
# ... build and apply against postgres://…/alluring_blog_<topic> ...
dropdb alluring_blog_<topic>

# Or a worktree with its own database, refreshed from production when the
# rehearsal must match production (prod reads need the user's OK):
pnpm worktree <branch> <issue> --db clone
```

The local dev database is stale (its newest post is from 2026-08-26), so for
anything that depends on today's production state (a rewrite's base, a fold's
inbound links) rehearse on a throwaway filled from production (the user's OK
for the read; `.claude/skills/blog-post/reference/publishing.md` section 1
has the `pg_dump` recipe), and rebuild against production before the run and
diff. Every generated SQL file, `hold_refresh.sql` and `resume_refresh.sql`
refuse to run on `alluring-autopilot-dev` itself.
Never `pnpm db:seed` or `db:push`; never write content to the shared dev
database; never run a production write yourself: the user runs it with
`! psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f <file>`.

## Runbook

### 0. Choose the work

Start from Search Console, not guesses: the `search-console` MCP
(`content_gaps`, `queries_for_page`, `page_trend`) for demand, and
`plan.json` for what is already planned. Each item gets a `plan.json` entry.

### 1. A new post

1. **Gate the topic.** `node blog/tools/gate.mjs "<title>" "<primary keyword>" <secondary…> --db local`.
   Write it only on `new`. On `refresh`, rewrite the owner instead (section 2);
   on `reject`, drop it. Remove any secondary keyword the gate warns about,
   and keep `owns_queries` to queries no other page owns: `gate.mjs --from`
   checks both, and `check_post.py` and `build_sql.py` fail a new post on any
   gate warning.
2. **Clear the slug.** `node blog/tools/slug_check.mjs <slug> --db local`.
3. **Write** `posts/<slug>/content.md` and `meta.json` (format below), mode
   `new`. Read the cluster's facts file first; read every other source this
   session and put its exact supporting sentence in `sources[].quotes`.
4. **Record the gate:** `node blog/tools/gate.mjs --from <slug> --db local --save`.
5. **Lint:** `python3 blog/tools/check_post.py <slug> --db local` until it passes, and
   read `python3 blog/tools/consistency.py <slug>`: every flagged figure either
   matches the facts file, or has its own source in `meta.json`, or goes.
6. **Images:** `python3 blog/tools/images/generate.py <slug> --dry-run` (say the
   credit estimate), then without `--dry-run`. The user picks hero variants;
   write them to `images/picks.json`; proofread infographic text word for word.
   `node blog/tools/images/export_upload.mjs <slug>` uploads them. A new post
   has no row yet, so the upload pre-generates its id into `meta.json` "id"
   (or pass `--id <slug>=<uuid>`); `build_sql.py` INSERTs that id, so the Blob
   path and the row agree.
7. **Final lint:** `python3 blog/tools/check_post.py <slug> --db local --final`.
8. **Rehearse.** Make a throwaway database, then
   `python3 blog/tools/build_sql.py "$CLONE_URL" /tmp/blog-sql --slug <slug>`
   and `psql "$CLONE_URL" -X -v ON_ERROR_STOP=1 -f /tmp/blog-sql/01-<slug>.sql`.
   Render it on the clone with production flags: in a worktree pointed at the
   clone, or from the main checkout with `POSTGRES_URL="$CLONE_URL"` in front of
   both `NEXT_PUBLIC_ALLOW_CRAWLING=true npx next build` (in `apps/web`) and
   `pnpm start`, with the `N8N_*` and `RESEND*` variables overridden, since the
   local `.env.local` holds the real webhook (the exact lines are in the
   skill's `reference/verification.md` section 2). Do the byte checks
   (section 4).
9. **The v2 line, before the run.** If the slug isn't in `BLOG_V2_SLUGS`
   (`apps/web/lib/blog/blog-v2.constant.ts`), the user decides; merge and
   deploy that one line before the production run (listing a slug whose row
   doesn't exist yet is harmless). Declining v2 publishes the post in the old
   template (its sidebar follows the claims canon since #354). In the same
   pre-run PR, propose the fix for the
   editorial-team author page every post links, v2 included
   (`apps/web/lib/data/authors.data.ts`; `code-changes.md` lists its claims).
10. **Production.** With the user's OK, rebuild against production into a new
    folder and diff it with the rehearsal. On a copy filled from production
    today, only `build-info.json` differs; on an older copy the md5 and
    fingerprint guard lines, `backup.json` and the refresh-queue line differ
    too. If anything besides `build-info.json` differs, rehearse the
    production build on a fresh production clone first. The user runs the
    file. Then `bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-<slug>`.
11. **Code PR, after the run** (`code-changes.md` in the build folder has it
    ready): the registry entry in `packages/shared/src/seo/keyword-ownership-blog.constant.ts`
    and the live-post count in `apps/admin/__tests__/lib/seo/keyword-ownership.test.ts`
    (`pnpm --filter admin test`); they wait for the run because
    `slug_check.mjs` treats a registry entry as a collision. Plus the post
    files, `images/*.json` and `plan.json`. Prefix builds with
    `env -u ANTHROPIC_API_KEY`.
12. **Index and record.** `inspect_url` (MCP) on the new URL; "Request
    indexing" in the Search Console UI is manual (the user, or claude-in-chrome).
    Never `pnpm --filter web google:index` (it submits the whole sitemap).
    Set the `plan.json` item to `live` with `liveOn`.

### 2. A rewrite

1. **Baseline first:** `node $TSX blog/tools/baseline.mts blog/baselines/<slug>-<date>.csv <slug>`.
2. **Hold the refresh queue now** if the rewrite will take more than a day,
   before the gate, the brief and the writing:
   `psql … -v slugs=<slug> -v expect=<n> -f blog/tools/sql/hold_refresh.sql` (a
   rehearsal on the clone first; `expect=-1` only reports), and hand the
   user the production line. `build_sql.py` dismisses the post's candidates
   itself when it runs, but a refresh that lands during the work is only
   caught by the `base_md5` refusal, after the work is done.
3. **Gate it.** `node blog/tools/gate.mjs "<live title>" "<registry primaryKeyword>" --db local --json`
   must say `refresh` with `owningSlug` = the slug (the registry's
   `primaryKeyword`: the row's own can be empty). Once `meta.json` exists,
   `gate.mjs --from <slug>` does the same, and `check_post.py` and
   `build_sql.py` re-run it and fail on any other owner, or on a secondary
   keyword or owned query that another page owns.
4. **Start from the live text, production's.** The rewrite base must be
   production's row (a read: the user's OK) or a throwaway filled from
   production today, never the stale local copy:
   `python3 blog/tools/rewrite_base.py <slug> --db <that database> --out <scratch>/<slug>-live.md --save`
   writes the text you start from and records its md5 as `meta.json`
   `base_md5`. Next to it, `<slug>-live.md.row.json` holds the rest of the
   row: title, meta, excerpt, quick answer, the `faqs` column, keywords,
   categories, tags, images as `reuse_url` entries and `published_at`.
   Write `posts/<slug>/` with mode `rewrite`, from that text, that row and
   its GSC queries. Carry the live FAQs you keep into the FAQ section:
   `build_sql.py` replaces the `faqs` column with the FAQs in `content.md`.
   `primary_keyword` stays the registry's `primaryKeyword`. The URL, slug
   and publish date never change.
5. Lint, images, final lint, rehearse, production, revalidate, as for a new
   post (steps 5–10). `build_sql.py` refuses to build a rewrite unless the
   target row's md5 is `base_md5` (or already the new content): if the row
   moved since you read it (an admin edit, a fold's link repoint, autopilot),
   it says "production changed since you read it". Run
   `rewrite_base.py <slug> --db <that database> --save --rebase`, which
   prints the diff from your base to the live text, merge it into
   `content.md`, and rebuild (`--save` alone refuses to replace a different
   `base_md5`). The SQL is guarded by that md5 and by a fingerprint of every
   other field it changes, so an edit between the build and the run, or a
   second run, fails and changes nothing. It snapshots the old row into
   `blog_post_revision` (reason `claude-blog-post`), and the build writes
   `undo-NN-<slug>.sql`. That file puts back the revision's fields, the
   featured image, the primary keyword and `content_updated_at`, removes the
   links the rewrite added, and asserts the old md5 and fingerprint. After
   the run, set `base_md5` to the live content
   (`rewrite_base.py <slug> --db <production> --save`: a live row that is
   this post's own content needs no `--rebase`).
6. Code PR: always the post files, `images/*.json` and `plan.json`; plus the
   registry change or the v2 allowlist when `code-changes.md` lists them (the
   v2 line before the production run, step 9 of section 1).

### 3. A fold (retire a post into another page)

1. **Decide the destination** from the cannibalization data: the post that
   owns the cluster, or the procedure page.
2. **Merge what's worth keeping** into the destination post as a rewrite
   (section 2). Until the fold's registry change retires the folded posts,
   leave their `primaryKeyword` and `ownsQueries` out of the destination's
   `secondary_keywords` and `owns_queries` (the gate reports them as theirs);
   add them to the destination's `ownsQueries` in the step-5 PR.
3. **Build the fold:** `python3 blog/tools/fold_sql.py "$D" /tmp/fold --fold <slug>:<destination> [--fold …]`
   (no `--delete` yet: that is step 6, after the deploy).
   It refuses a slug that's not live, a destination that isn't, a chained fold,
   and a plain-text mention it can't repoint (fix that post by hand first).
   `01` dismisses the folded posts' open refresh candidates and inserts a
   dismissed one where none is open, so the cooldown covers them until `02`.
4. **Before the deploy:** rehearse, rebuild against production, the user runs
   `01-fold-links.sql`; revalidate the tags its last SELECT prints plus
   `blog-posts sitemap-urls`.
5. **Code PR, the five hand-synced places** (`fold-checklist.md` lists them,
   ticked against the working tree): `next.config.mjs` redirects for both
   `/slug` and `/blog/slug` (and older aliases repointed), the blog sitemap's
   `SITEMAP_EXCLUDED_SLUGS`, the registry entry (`retired`, `ownsQueries: []`,
   `redirectsTo`, notes; move kept queries to the destination), the generator's
   `RETIRED` and `DUPLICATE_OF`, and the live-post count in the test.
6. **After the deploy is live:** `curl -sI` every folded URL (both forms) for a
   308; rebuild with `--delete` against production so the backup is current
   (`--delete` runs the same `curl -sI` checks and writes no `02` until each
   folded URL answers 308 to its destination); the user runs
   `02-delete-folded.sql`, which refuses while a refresh run is
   `in_progress` on a folded post or when a folded row changed since the
   build; revalidate the folded slugs. Delete, never draft: drafts count
   against the autopilot draft cap.

### 4. Verify

- `curl -sI` the live path: 200. A post published before 2026 lives at
  `/slug` and `/blog/slug` 308s to it; a 2026 post lives at `/blog/slug`
  and `/slug` 308s to it. Folded URLs 308. Only the links in the article
  body must answer 200: on a stale local copy, related-post cards can point
  at posts folded since.
- The served HTML has the quick answer, every H2, the FAQ section and Sources,
  and no "board-certified", "5,000", ABPS, AAAASF or phone digits in the body.
- Count `<script type="application/ld+json">` tags, not mentions (the RSC
  payload repeats them): BreadcrumbList, MedicalWebPage, BlogPosting, FAQPage
  when there are FAQs, ImageObject only for images in the body.
- `/sitemap/blog.xml` refreshes on its own within 3 hours; no tag reaches it.

### 5. Measure

- `baseline.mts` before the change (www host; data lags about 3 days).
- `readout.mts <since>` at day 28, 56 and 90, against untouched posts as a
  control; record the result in `plan.json` (`measured`).
- `ai_panel.py` for whether answer engines cite and quote the posts correctly.
- Leads from the database (`contact_submission`, `lead_ad_click`), never GA4
  thank-you hits; for GA4 `generate_lead`, use `eventCount`.

## Post files

`posts/<slug>/content.md` is the body. `posts/<slug>/meta.json`:

```json
{
    "slug": "the-folder-name",
    "id": "uuid, new posts only (written by export_upload.mjs or build_sql.py)",
    "mode": "new | rewrite",
    "reader": "recovering | deciding",
    "cluster": "lipo (a key of blog/tools/clusters.json)",
    "title": "≤ 60 characters",
    "meta_description": "≤ 155 characters",
    "excerpt": "≤ 320 characters",
    "quick_answer": "Question?\n\n40–65 word answer",
    "primary_keyword": "≤ 100 characters",
    "secondary_keywords": ["8 to 16, from the post's GSC queries"],
    "owns_queries": ["the queries the registry entry should own"],
    "categories": ["existing blog_category names"],
    "tags": ["blog_tag names; new ones need build_sql.py --create-tags"],
    "published_at": "new posts only, ISO 8601, optional (default: now)",
    "base_md5": "rewrites: md5 of the live row the rewrite was written from (rewrite_base.py --save)",
    "base_from": "written with base_md5: which database, when",
    "cta": "default | consultation | bbl | breast | body | facial",
    "images": [
        {
            "key": "hero",
            "type": "featured",
            "aspect": "3:2",
            "alt": "…",
            "prompt": "SCENE: … SUBJECT: … KEY DETAILS: … CONSTRAINTS: …"
        },
        {
            "key": "timeline",
            "type": "inline",
            "aspect": "4:5",
            "alt": "…",
            "prompt": "…",
            "text_in_image": "exact text"
        },
        {
            "key": "hero",
            "…": "…",
            "reuse_url": "a rewrite keeping a live image: its Blob URL (an images row already)"
        }
    ],
    "sources": [
        {
            "url": "…",
            "publisher": "…",
            "title": "…",
            "read_on": "2026-10-07",
            "quotes": ["the exact supporting sentence"]
        }
    ],
    "gate": "written by gate.mjs --save; new posts need verdict new",
    "gsc": { "window": "…", "impressions": 0, "clicks": 0, "position": 0 },
    "notes": "what changed and why; anything left open"
}
```

Inline images go in the body as `![alt](IMAGE:key)`; the build swaps in the
Blob URL from the manifest, or the image's `reuse_url`. A `cta` other than
`default` needs the matching `<!-- CTA:id -->` marker in the body (at most
one). A dollar figure must be in the cluster's facts file, or, for a price
from the practice's printed sheet, in a quote that is a verified substring of
`docs/pricing/practice-price-list.md` (add a source with that url and quote
the sheet's line). Quotes from any other source license no price.

**Reusing a live image.** A rewrite may keep its live hero or infographic
when it still meets the image rules (`.claude/skills/blog-post/reference/images.md`)
and, for an infographic, every word and figure still matches the new text.
Set that image's `reuse_url` to the live Blob URL: it is not rendered or
uploaded and needs no pick; `build_sql.py` requires it to be an `images` row
in the target database, keeps its size and generation prompt, and asserts the
row exists when the SQL runs.

## What check_post.py enforces

A problem fails the post; a warning doesn't.

- **Fields:** title ≤ 60 and no surgeon name; meta ≤ 155; excerpt ≤ 320;
  quick answer "Question?\n\nAnswer", 40–65 words, not a `<QuickAnswer>` in the
  body; primary keyword ≤ 100; 8–16 secondary keywords.
- **Structure:** no H1; opens with an H2 question; `## Frequently asked
questions` with 4–9 `### Question?` entries of 30–80 words, one paragraph
  each; `## Sources` last, listing every domain the body cites; bold only as a
  list lead-in; no `{` `}`; no HTML comment but one valid CTA marker; only
  `Figure` and `CalloutBox`, balanced; a table in every recovery or comparison
  post; Alluring never named in the opening answer.
- **Links:** every internal link resolves to a live post (database, or the
  live sitemap without one), a money page or a known category/gallery page, in
  its live form (`/slug` before 2026, `/blog/slug` after); none to a redirect
  source (a folded URL), to itself, to `#contactus`, `mailto:` or `tel:`;
  procedure-page anchors exist; at least two links to the cluster's procedure
  page with descriptive anchors; no banned source (RealSelf, Healthline,
  lipo.com, lipo360.com).
- **Images:** one featured image; alt and prompt on each; inline images placed;
  infographic figures repeated in the alt and stated in the post; with
  `--final`, every image uploaded (or reused, with `reuse_url`) and no
  `IMAGE:` placeholder left.
- **The claims sweep** (body, title, meta, excerpt, quick answer, image alt
  and image text; a lighter pass over the Sources list): "board-certified" in
  any form except the verbatim credentials sentence, ABPS, the American Board
  of Cosmetic Surgery, double/triple board, "plastic surgeon(s)" outside a
  society's name, "our surgeons"; AAAASF, "accredited", anesthesiologist,
  VASER, 24/7, "5,000+", "thousands of patients", tenure claims, HIPAA;
  "medically reviewed"; safest, guarantee, number one, world-class,
  top-rated, leading, cutting-edge, state-of-the-art, revolutionary, painless,
  scarless; luxury, affordable; concierge, hotels, lodging, recovery houses,
  airport, packages, international, Latin America, the Caribbean, medical
  tourism, travel arrangements; retired prices (BBL $3,500 or $4,500, lipo
  from $2,500, $3,000–$5,000 per area, tummy tuck $8,000+, $6,500 for a lift);
  financing figures; fake urgency; phone numbers; filler words; and the
  cluster's retired figures (`clusters.json`).
- **The claims canon** (`docs/claims/canon.md` §11, read from
  `packages/shared/src/claims/patterns.data.json`, over the same fields): each
  `fail` rule the sweep above doesn't already report is a problem. That adds,
  among others, every retired price in canon §5 (PR1–PR8: BBL $3,000–$15,000
  figures, the old augmentation ranges, $11,500, mommy makeover totals),
  "1 in N" mortality, wrong contracture and complication rates, longevity
  claims without a source, ratings other than 4.7 and typed review counts.
  Dr. Lofman fails; Dr. Shats is a warning (D1). `review` rules are warnings:
  "best" said of the practice, surgeon, results or price is a problem, generic
  advice ("the best way to sleep", "best candidates") passes, and any other
  "best" is a warning.
- **Claim tokens** (#354): every Alluring price is a token (`[[price:bbl]]`),
  never a typed figure. `lib/claims_check.mjs` runs the site's own validator
  over the title, meta, excerpt, quick answer and image text, and
  `validateGeneratedMdx` over the body: a token that would render as nothing
  (unknown name, bad argument, unknown line, malformed, unclosed) or a typed
  Alluring price is a problem. When node or tsx can't run (or with
  `--no-mdx`), the token grammar of `packages/shared/src/claims/tokens.ts` is
  still checked in Python.
- **Figures:** every `$` amount is in the cluster's facts file or in a quote
  verified against `docs/pricing/practice-price-list.md`. A paragraph, list
  or table that states a practice price says the surgeon confirms it at
  consultation (a table may say it in the paragraph right before or after).
- **Sources:** no banned domain in `meta.json` `sources[]` or the Sources
  list; `read_on` an ISO date, not in the future and at most 30 days old (a
  warning, and with `--final` a problem: read it again).
- **Mode:** a new post needs a free slug, a saved gate verdict `new`, the
  gate re-run now saying `new` with no warnings (no secondary keyword or
  owned query that another page owns), and a `published_at` (if set) from
  2026 that isn't in the future; a rewrite needs a live post and the gate
  saying `refresh` with this post as the owner, with no secondary keyword or
  owned query that another page owns. A rewrite without `base_md5` is a
  warning here; `build_sql.py` refuses it.
- **MDX:** `validateGeneratedMdx` (packages/ai) must find nothing to change.

## Risks

- **Slug collisions.** A slug that is already a post, a redirect source, a
  static route, a `/blog` listing or a surgeon page makes the post unreachable,
  and a pre-2026 post whose slug is a root route stops the production build.
  `slug_check.mjs` checks all of them.
- **The draft cap.** Autopilot stops writing when three non-refresh drafts
  wait for review. Never leave a Claude post or a retired post as a draft:
  publish it, or delete it after a backup.
- **The refresh loop overwriting a rewrite.** Refresh runs in `auto` mode and
  rewrites the top candidate without review. `build_sql.py` dismisses the
  post's open candidates in the same transaction (which starts the 60-day
  cooldown), inserts a dismissed one when none is open, and refuses while a
  refresh run is writing the post. Check for unacknowledged failed autopilot
  runs too.
- **content_updated_at.** A database trigger stamps it on any change to the
  title, content, meta, excerpt, quick answer, FAQs, featured image or slug.
  That is right for a rewrite. For link-only edits (a fold), `fold_sql.py`
  restores the old value from a temp table and checks nothing moved;
  otherwise the sitemap and the schema would call those posts revised.
- **Two databases.** Local and production differ. Build and apply on a
  throwaway copy, rebuild against production and diff, and keep the md5
  guards: a file built from one state refuses to run on another. A rewrite
  also carries `base_md5`, the row it was written from, so a rewrite started
  from stale text can't overwrite newer production content. Production
  writes are the user's; no generated file runs on the shared dev database.
- **Two Blob stores.** The `.mcp.json` Blob token points at a different store.
  `export_upload.mjs` uses the apps' own token and records the URL `put()`
  returns; superseded uploads are listed, and deleted only when no `images`
  row still uses them.
- **NOT NULL image columns.** `images.alt` and `blog_post_images.prompt` must
  be set: they come from `meta.json` and the manifest; a reused image
  (`reuse_url`) keeps the `images` row, and the generation prompt, it was
  made with.
- **The old template.** A post outside `BLOG_V2_SLUGS` renders the old
  template. Its sidebar follows the claims canon since #354; merge the slug's
  v2 line before the production run when the user wants the v2 template.
- **MDX crashes.** A second CTA marker, any other HTML comment, `{}` in prose
  or an unknown component takes the page down. The lint runs the pipeline's
  own validator, and a render on `next start` is the final check.
- **The keyword gate.** A direct insert skips the admin's gate, so `gate.mjs`
  runs it by hand and `build_sql.py` runs it again against the target
  database.
- **Registry drift.** The registry is hand-edited for new and folded posts,
  and the test pins the live-post count. Regenerating it drops hand-written
  notes and ownsQueries: restore them from the git diff.
- **"scheduled" never publishes.** No cron publishes scheduled posts. The kit
  inserts posts as `published` with an explicit `published_at`.
- **Sitemap lag.** `/sitemap/blog.xml` is cached for up to 3 hours and no
  revalidation tag reaches it; wait, or redeploy.
- **Author page claims.** Every post's schema and byline link the
  editorial-team author page (`apps/web/lib/data/authors.data.ts`). Issue #354
  cleared its claims; if one comes back, `build_sql.py` lists the line in
  `code-changes.md` under "Before the production run".
