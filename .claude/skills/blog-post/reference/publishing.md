# Publishing runbook

From a post that passes `check_post.py --final` to a live, revalidated,
registered URL. Every write is a `.sql` file. It is proven on a throwaway
database, rebuilt against production and diffed, then run by the user.

Run everything from the repo root (or the worktree root). In the commands:

```bash
TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs | tail -1)
LOCAL="$(grep -E '^POSTGRES_URL=' packages/db/.env.local | tail -1 | cut -d= -f2- | tr -d '"')"
ADMIN="${LOCAL%/*}/postgres"                 # the maintenance database, for createdb/dropdb
CLONE_DB=alluring_blog_<topic>               # lowercase, underscores
CLONE_URL="${LOCAL%/*}/$CLONE_DB"
OUT=<session scratchpad>/blog-sql            # build folders live here, not in the repo
```

Shell state doesn't carry between tool calls, so repeat the lines you need
in each call. Never echo a URL: the tools print `host:port/db` only.

## 1. A database to rehearse on

Pick one:

**A. A worktree with its own database** (best when there is a code PR
anyway):

```bash
pnpm worktree <branch> <issue> --db clone    # copies alluring-autopilot-dev into alluring_wt_<branch>
```

Inside that worktree, `packages/db/.env.local` points at the clone, so
`--db local` **is** the clone, and writing to it is fine. The worktree's
`next start` reads it too.

**B. A throwaway copy** (a quick rehearsal, from any checkout):

```bash
psql "$ADMIN" -X -At -c "select count(*) from pg_stat_activity where datname = 'alluring-autopilot-dev'"   # must print 0
createdb --maintenance-db="$ADMIN" -T alluring-autopilot-dev "$CLONE_DB"
# … build, apply, render …
dropdb --maintenance-db="$ADMIN" "$CLONE_DB"                                                               # always, at the end
```

`-T` fails while any session is connected to the template. Wait, or use A,
whose script falls back to `pg_dump | psql`. To render a throwaway copy,
point a worktree at it (`pnpm worktree:db --db reuse:$CLONE_DB` inside the
worktree), or render from the main checkout with `POSTGRES_URL="$CLONE_URL"`
in front of the build and start commands
([verification](verification.md#2-render-on-next-start) section 2). The
kit isn't on `origin/master` until it is merged, so a new worktree may not
have `blog/tools/`: then use the main checkout.

Every generated SQL file, `hold_refresh.sql` and `resume_refresh.sql`
refuse to run on `alluring-autopilot-dev` itself, so swapping `$LOCAL` for
`$CLONE_URL` in a `psql` line fails instead of writing the shared database.

**Rewrites and folds: fill the throwaway from production.** The local dev
database is a clone from 2026-08-26. A rewrite's base (`base_md5`), a fold's
inbound links, and the gate's overlay all depend on today's production
state: on the stale copy a rewrite refuses to build ("production changed
since you read it") and a fold's backups don't match production. So for a
rewrite or a fold the default is a throwaway filled from production. That
is a production read, so it needs the user's OK; ask for it once, for the
fill, the `rewrite_base.py` read and the step-5 rebuild together. A new post
may rehearse on a `createdb -T` copy of the local database. Leave out the
tables that hold personal data, and the ones that hold production
credentials, because a blog rehearsal needs neither:

- personal data: `page_view`, `contact_submission`, `lead_ad_click`,
  `email_log`, `chat_session`, `chat_message`, `lp_form_step`,
  `beta_feedback`, `bug_report`;
- credentials: `google_reviews_settings` (`access_token` and
  `refresh_token`, the Google Business Profile OAuth tokens) and
  `social_media_settings` (`api_key`). A worktree or dev server pointed at
  the throwaway (`worktree:db --db reuse:<clone>`) would otherwise hold
  working production credentials.

```bash
PROD="$(grep -E '^POSTGRES_URL_PROD=' packages/db/.env.local | tail -1 | cut -d= -f2- | tr -d '"')"
pg_dump --schema=public --schema=drizzle --no-owner --no-privileges --no-publications --no-subscriptions \
  --exclude-table-data=public.page_view --exclude-table-data=public.contact_submission \
  --exclude-table-data=public.lead_ad_click --exclude-table-data=public.email_log \
  --exclude-table-data=public.chat_session --exclude-table-data=public.chat_message \
  --exclude-table-data=public.lp_form_step --exclude-table-data=public.beta_feedback \
  --exclude-table-data=public.bug_report \
  --exclude-table-data=public.google_reviews_settings --exclude-table-data=public.social_media_settings \
  -Fc -f <scratchpad>/prod.dump "$PROD"
createdb --maintenance-db="$ADMIN" "$CLONE_DB"
pg_restore --no-owner --no-privileges -d "$CLONE_URL" -j 4 <scratchpad>/prod.dump
# pg_restore reports 'schema "public" already exists' (harmless); check counts instead of its exit code:
psql "$CLONE_URL" -X -At -c "select count(*) from blog_post where status = 'published'"
rm <scratchpad>/prod.dump
```

Never `pnpm db:seed` or `db:push`. Never write content to the shared
`alluring-autopilot-dev`.

## 2. Hold the refresh queue

Refresh runs in `auto` mode, so the daily cron can rewrite the top
candidate without review. `build_sql.py` dismisses the post's open
candidates in the same transaction. It inserts a dismissed one when none is
open, which starts the 60-day cooldown, and it refuses while a run is
`in_progress`. That covers the publish, not the days before it: when a
rewrite or a fold will take more than a day, hold the posts at the start
(SKILL Phase 1), before the brief and the writing, and hand the user the
production line then. In Phase 6, only check that nothing re-opened. Hold
posts you'll rewrite later the same way:

```bash
psql "$D" -X -v ON_ERROR_STOP=1 -v slugs=<a>,<b> -v expect=-1 -f blog/tools/sql/hold_refresh.sql   # report only
psql "$D" -X -v ON_ERROR_STOP=1 -v slugs=<a>,<b> -v expect=<n> -f blog/tools/sql/hold_refresh.sql  # n = what the report showed
```

Rehearse it on the clone first. On production it is a write, so it is the
user's to run. When a `ready_for_review` candidate's working copy will be
deleted, `-v backup=<file.json>` is required: it writes every working copy
of the posts, with its links, and the open candidates there first, and the
file asserts the delete count. Add `-v drop_orphans=yes` (with the backup)
to also delete working copies left by a dead run. `resume_refresh.sql`
undoes the hold; it skips, and names in a NOTICE, any post rewritten or
refreshed after the hold, so a fresh rewrite is never handed back to
autopilot. Check for unacknowledged failed autopilot runs too (the query is
in `resume_refresh.sql`'s header).

## 3. Build and rehearse

```bash
python3 blog/tools/check_post.py <slug> --db "$CLONE_URL" --final
python3 blog/tools/build_sql.py "$CLONE_URL" "$OUT/<slug>-clone" --slug <slug>
psql "$CLONE_URL" -X -v ON_ERROR_STOP=1 -f "$OUT/<slug>-clone/01-<slug>.sql"
psql "$CLONE_URL" -X -v ON_ERROR_STOP=1 -f "$OUT/<slug>-clone/01-<slug>.sql"   # must FAIL: md5 guard or slug exists
```

- Add `--create-tags` only when the post names tags that don't exist yet.
  A missing **category** stops the build; never invent one.
- `--slug` (or `--all`) is required: `blog/posts` keeps every post the kit
  has shipped, so building all of them would bundle rewrites of other live
  posts.
- A rewrite needs `meta.json` `base_md5` (`rewrite_base.py`): the build
  refuses when the row's md5 differs ("production changed since you read
  it"). Run `rewrite_base.py <slug> --db <that database> --save --rebase`,
  read the diff it prints, merge it into `content.md`, rebuild (section 5).
- A post whose row already matches (content, fields, featured image,
  categories, tags) is skipped as "already live".
- The output has no timestamps and no hosts. Two builds from databases in
  the same state are byte-identical except `build-info.json`.
- Read `code-changes.md` in the build folder: it is the code PR (section 7).

Then check the database state and render the post on `next start`,
following [verification](verification.md) sections 1–3. A post isn't
rehearsed until it renders.

## 4. Undo, before you need it

- **Rewrite:** `build_sql.py` writes `undo-NN-<slug>.sql` next to
  `NN-<slug>.sql`. It runs only while `md5(content)` is the new content, and
  refuses while a refresh run is `in_progress`. It snapshots the rewrite as a
  `claude-blog-post-undo` revision, then restores the fields of the
  `claude-blog-post` revision the run wrote (title, content, meta, excerpt,
  quick answer, FAQs, reading time, secondary keywords). From
  `backup.json` "row" it restores `featured_image_id`, `primary_keyword`
  and `content_updated_at`; the revision holds none of them. It removes the
  category, tag and image links that `backup.json` doesn't list. Last, it
  asserts the md5 and the fingerprint of every other field are the old ones.
  The refresh queue stays dismissed, so the cooldown holds. Working copies
  the rewrite deleted are only in `backup.json`. Rehearse it on the clone
  after the render checks (an undone clone shows the old post, and `01`
  can't run again once it dismissed candidates): apply the undo, check the
  row is back, and run it again; the second run must fail.
- **New post:** `backup.json` records the absent slug. To undo, `DELETE`
  the row; the cascade takes its links. Never set it to draft.

## 5. Production: rebuild, diff, hand over

With the user's OK for the production **read**:

```bash
POSTGRES_URL_PROD="$(grep -E '^POSTGRES_URL_PROD=' packages/db/.env.local | tail -1 | cut -d= -f2- | tr -d '"')" \
  python3 blog/tools/build_sql.py env:POSTGRES_URL_PROD "$OUT/<slug>-prod" --slug <slug>
diff -r "$OUT/<slug>-clone" "$OUT/<slug>-prod"      # on a copy filled from production today, only build-info.json differs
```

- If more differs, production moved since the clone was made: the post was
  edited, the refresh queue changed, or an image row already exists. On a
  clone of the 2026-08-26 local copy that is expected for a rewrite or a
  fold: the md5 and fingerprint guard lines, `backup.json`, and the
  refresh-queue line (candidates dismissed, or a dismissed row inserted) all
  change. Read the diff, rehearse the production build on a fresh clone of
  production, and say what changed.
- If the production build prints `skip [<slug>] already live` and writes no
  SQL file, production already holds this exact post (it was published
  before, or the rehearsal post equals the live one): there is nothing to
  run and nothing to diff. If you expected a change, the post on disk isn't
  the one you meant to publish; check `content.md` and `meta.json`. If the
  build refuses with "production changed since you read it", the live row
  moved after your `rewrite_base.py` read (an admin fix, a fold's link
  repoint, a refresh). Run
  `rewrite_base.py <slug> --db env:POSTGRES_URL_PROD --save --rebase`: it
  prints the diff from the base you wrote from to the live text, from
  `blog/posts/<slug>/.base/`, `--old FILE` or a `blog_post_revision` row.
  Merge every hunk into `content.md`, then rebuild and diff again.
  `--save` without `--rebase` refuses to replace a different `base_md5`,
  so the guard can't be dropped by accident.
- **Before the run, the v2 line and the author page.** If `code-changes.md`
  lists the slug under "Before the production run", ask the user, then
  merge and deploy the `BLOG_V2_SLUGS` line before handing over the `psql`
  line (section 7). It also lists the claims on the editorial-team author
  page (`apps/web/lib/data/authors.data.ts`), which every post's JSON-LD
  and byline link, v2 included. Propose that fix in the same pre-run PR.
- Then give the user the line, with absolute paths:

    ```
    ! psql "$(grep -E '^POSTGRES_URL_PROD=' <repo>/packages/db/.env.local | tail -1 | cut -d= -f2- | tr -d '"')" -X -v ON_ERROR_STOP=1 -f <OUT>/<slug>-prod/01-<slug>.sql
    ```

- Run it yourself only when the user says "run it yourself" for this file.
  A general "publish it" isn't that.
- The file is one transaction. If any assertion fails, nothing changes.
  Read the error, fix, rebuild and diff again.

## 6. Revalidate

```bash
bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-<slug>
```

- `blog-posts` covers the listings and the prerender list, `blog-post-<slug>`
  the page, and `sitemap-urls` the URL lists. Each call sends at most 10 tags.
- `/sitemap/blog.xml` is route ISR with a 3-hour revalidate, and no tag
  reaches it. A new post appears there within 3 hours, or after a deploy.
- After a fold, revalidate every post that `01-fold-links.sql` edited (its
  last SELECT prints the tags). After the delete, revalidate the folded
  slugs.

## 7. The code PR

`code-changes.md` holds it, ready to paste, in two parts:

| Change                                                                                                                                                                             | When                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| The slug in `BLOG_V2_SLUGS` (`apps/web/lib/blog/blog-v2.constant.ts`)                                                                                                              | **before** the production run, after the user decides (below) |
| A live entry in `packages/shared/src/seo/keyword-ownership-blog.constant.ts` (`url`, `slug`, `kind: 'blog'`, `intent`, `status: 'live'`, `primaryKeyword`, `ownsQueries`, `notes`) | new post, **after** the run                                   |
| `apps/admin/__tests__/lib/seo/keyword-ownership.test.ts`: `toBe(N)` → `toBe(N+k)`, slugs named in the comment                                                                      | new post, after the run                                       |
| `ownsQueries` / `primaryKeyword` updated on the existing entry (`code-changes.md` compares both)                                                                                   | rewrite, if they changed                                      |
| `blog/posts/<slug>/`, `blog/images/manifest.json`, `blog/images/picks.json`, `blog/plan.json`                                                                                      | always                                                        |

The v2 line goes first because `isBlogV2` is a Set lookup: listing a slug
whose row doesn't exist yet is harmless, and the post never renders on the
old template. The registry entry and the count wait for the run, because
`slug_check.mjs` treats a registry entry as a collision.

- **The v2 allowlist.** A slug outside `BLOG_V2_SLUGS` renders the old
  template. The v2 template is the one kept to the claims canon, but its
  top-15 rollout is under review (CTR fell after 26 Sep 2026; readout
  around 17 Oct). Ask the user. Recommend adding the slug unless that
  readout says otherwise. If the user declines, run `served_check.py` on the
  old-template render and report any template claim the canon
  (`docs/claims/canon.md`) forbids.
- Run `pnpm --filter admin test` (registry integrity and the count), and
  `pnpm --filter web typecheck` if web code changed. Prefix any build with
  `env -u ANTHROPIC_API_KEY`.
- Never regenerate the registry with the generator script: it drops the
  hand-written `notes` and `ownsQueries`. If it was run, restore them from
  `git diff`.
- Commit only when told. Check the branch first. End the PR body with the
  attribution lines the session gives you. The user merges.

## 8. Live check and indexing

The live path depends on the publish year: before 2026 `/slug`, from 2026
`/blog/slug`. Most rewrite targets are pre-2026 (the worked example,
published 2025-08-18, lives at `/what-is-lipo-foam`).

```bash
BASE=https://www.alluringplasticsurgery.com
P=$( [ <published_at year> -ge 2026 ] && echo /blog/<slug> || echo /<slug> )
O=$( [ "$P" = /<slug> ] && echo /blog/<slug> || echo /<slug> )   # the other form
curl -sI "$BASE$P" | head -1                                      # 200
curl -sI "$BASE$O" | grep -i -E '^(HTTP|location)'                # 308 → $P
python3 .claude/skills/blog-post/scripts/served_check.py "$BASE$P" <slug>
```

Do the byte and schema checks against production
([verification](verification.md#3-the-served-html)). Then `inspect_url` on
the URL. "Request indexing" is a manual click in the Search Console UI:
the user does it, or claude-in-chrome on the www property. Never run
`pnpm --filter web google:index`. It sends every sitemap URL to the
Indexing API.

## 9. Record

In `blog/plan.json`: `status: live`, `liveOn: <date>`, and in `notes` the
build folder, the revision reason and the day-28/56/90 dates.

Set `meta.json` `base_md5` to the content now live (the new md5): run
`python3 blog/tools/rewrite_base.py <slug> --db env:POSTGRES_URL_PROD --save`
(a read: the user's OK), or copy the `content_md5` the SQL file's last
SELECT printed. The next change to the post then starts from what is live,
and a later edit on production (a fold's link repoint, an admin fix) makes
`build_sql.py` refuse instead of reverting it.

For a new post, once it is live, set its `meta.json` `mode` to `rewrite`
and remove `published_at`. From now on a change to it is a rewrite, and
`check_post.py` reports a live `new` post as a problem. Keep `id` and
`gate`.

Drop the throwaway database. Delete the build folder when the post is
measured.

## Risks

| Risk                         | What happens                                                                                                                           | Guard                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two databases                | Local is weeks stale; production is the truth                                                                                          | Rehearse rewrites and folds on a production-filled copy, rebuild on production, `diff -r`; `base_md5`, md5, fingerprint and absence guards; no file runs on the shared dev database |
| The refresh loop             | Auto mode rewrites a candidate post without review                                                                                     | `build_sql.py` dismisses or inserts a dismissed candidate (60-day cooldown); `hold_refresh.sql` for longer work                                                                     |
| The draft cap                | Three non-refresh drafts stop autopilot content runs                                                                                   | Insert as `published`; delete retired posts, never draft them                                                                                                                       |
| `content_updated_at` trigger | Any change to title, content, meta, excerpt, quick answer, FAQs, featured image or slug stamps it                                      | Right for a rewrite and a new post. `fold_sql.py` restores it on link-only edits and asserts it                                                                                     |
| Slug collisions              | A redirect source, route, `/blog` subroute or surgeon slug makes the post unreachable; a pre-2026 slug on a root route stops the build | `slug_check.mjs`, run again by `check_post.py` for new posts                                                                                                                        |
| `scheduled`                  | No cron publishes it                                                                                                                   | The kit inserts `published` with an explicit `published_at`, never in the future                                                                                                    |
| The v2 allowlist             | The old template's sidebar makes claims the post can't                                                                                 | Decide per post in the code PR                                                                                                                                                      |
| MDX crashes                  | A second CTA marker, another HTML comment, `{}` or an unknown component takes the page down                                            | `validateGeneratedMdx` in the lint; a `next start` render                                                                                                                           |
| Two Blob stores              | The `.mcp.json` token writes to a different store                                                                                      | `export_upload.mjs` uses `apps/web/.env.local`'s token and records `put()`'s URL                                                                                                    |
| The gate                     | A direct insert skips the admin's gate                                                                                                 | `gate.mjs --save`, re-run by `build_sql.py` against the target                                                                                                                      |
| Registry drift               | The test pins the live-post count; the generator overwrites hand edits                                                                 | Hand-edit the entry; bump the count; restore from `git diff`                                                                                                                        |
| Revalidation                 | Pages are ISR 3600 s; without tags, the old post shows for up to an hour                                                               | `revalidate.sh` right after the production run                                                                                                                                      |
| Sitemap lag                  | `/sitemap/blog.xml` refreshes on its own 3-hour clock                                                                                  | Wait for it (or a deploy), then request indexing                                                                                                                                    |
| Indexing                     | No per-URL indexing in code                                                                                                            | `inspect_url`, then the manual "Request indexing"                                                                                                                                   |
| New posts linking each other | A link to a post that isn't live yet is an unknown link                                                                                | Publish them in the same run (the lint warns), or link after                                                                                                                        |
