# Verification

A post is rehearsed when its SQL has run on a throwaway database, a second
run has refused, and the page renders on `next start` with every check
below passing. Run the same served-page checks on production after the
user's run. Report each check with its real output; say plainly what you
didn't run.

## 1. The database after the apply

On the clone, right after `psql -f 01-<slug>.sql`:

```sql
SELECT slug, status, published_at::timestamp(0), content_updated_at::timestamp(0), md5(coalesce(content, '')) AS md5,
       reading_time, featured_image_id IS NOT NULL AS featured,
       (SELECT count(*) FROM blog_post_images i WHERE i.blog_post_id = p.id) AS image_links,
       (SELECT count(*) FROM blog_post_category c WHERE c.blog_post_id = p.id) AS categories,
       (SELECT count(*) FROM blog_post_tag t WHERE t.blog_post_id = p.id) AS tags,
       (SELECT count(*) FROM content_refresh r WHERE r.blog_post_id = p.id
           AND r.status IN ('pending', 'in_progress', 'ready_for_review')) AS open_refresh,
       (SELECT count(*) FROM blog_post_revision v WHERE v.blog_post_id = p.id AND v.reason = 'claude-blog-post') AS kit_revisions,
       jsonb_array_length(coalesce(faqs, '[]'::jsonb)) AS faqs, quick_answer IS NOT NULL AS quick_answer
  FROM blog_post p WHERE slug = '<slug>' AND refresh_of_post_id IS NULL;
```

| Column               | New post                                                                 | Rewrite                                    |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `status`             | `published`                                                              | unchanged (`published`)                    |
| `published_at`       | `meta.json` `published_at`, else the run time (UTC wall time), from 2026 | unchanged                                  |
| `content_updated_at` | equals `published_at`                                                    | the run time (the trigger stamped it)      |
| `featured`           | true                                                                     | true                                       |
| `image_links`        | the number of `images[]`                                                 | the old links plus the new ones            |
| `open_refresh`       | 0                                                                        | 0 (dismissed, or a dismissed row inserted) |
| `kit_revisions`      | 0                                                                        | one more than before                       |
| `faqs`               | the FAQ entries in `content.md`                                          | same                                       |

**The second run must refuse.** Apply the same file again. A rewrite fails
on the md5 guard ("edited since the build"); a new post fails because the
slug exists. Either way, nothing changes. A file that runs twice cleanly is
a bug: stop and report it.

## 2. Render on `next start`

Render from a worktree whose database is the clone (`--db clone`, or
`pnpm worktree:db --db reuse:<clone>` inside it). Build with production
flags: local `.env.local` sets `NEXT_PUBLIC_ALLOW_CRAWLING=false`, which
renders every page `noindex` and empties the blog sitemap. Its webhook
variables are real, so override them too.

```bash
cd apps/web
NEXT_PUBLIC_ALLOW_CRAWLING=true env -u ANTHROPIC_API_KEY npx next build
NEXT_PUBLIC_ALLOW_CRAWLING=true RESEND_API_KEY=re_invalid \
  N8N_WEBHOOK_URL=http://localhost:3999/x N8N_LEAD_UPDATE_WEBHOOK_URL=http://localhost:3999/y \
  WEB_PORT=<the worktree's WEB_PORT, from .worktree-meta> pnpm start      # in the background
```

**From the main checkout, on a throwaway copy (option B).** Run as written
above, `next build` reads `apps/web/.env.local`, which points at the shared
dev database with the old text, so `served_check.py` would fail on every H2.
Put the clone's URL in front of both commands instead
(`packages/db/src/env.ts` loads dotenv without override, so the shell value
wins):

```bash
cd apps/web
POSTGRES_URL="$CLONE_URL" NEXT_PUBLIC_ALLOW_CRAWLING=true env -u ANTHROPIC_API_KEY npx next build
POSTGRES_URL="$CLONE_URL" NEXT_PUBLIC_ALLOW_CRAWLING=true RESEND_API_KEY=re_invalid \
  N8N_WEBHOOK_URL=http://localhost:3999/x N8N_LEAD_UPDATE_WEBHOOK_URL=http://localhost:3999/y \
  WEB_PORT=<a free port> pnpm start      # in the background
```

The shared dev database is untouched this way (the app only reads the
clone). It does rebuild the main checkout's `apps/web/.next`, so say so, and
don't run it while someone else is serving that build.

- The build prerenders every published post and is heavy on the database.
  A transient pooler timeout or a Google Fonts fetch error passes on retry.
  Say so if it happens.
- Posts revalidate every 60 s at runtime. To see the v2 template on a slug
  that isn't in `BLOG_V2_SLUGS` yet, set `BLOG_V2_PREVIEW=all` for **both**
  the build and `pnpm start` (a runtime re-render without it falls back to
  the old template).
- Stop the server when you're done.

## 3. The served HTML

Against `http://localhost:<port>` for the rehearsal, and against
`https://www.alluringplasticsurgery.com` after the production run. The live
path depends on `published_at`: before 2026 the post lives at `/<slug>` and
`/blog/<slug>` redirects to it; from 2026 it lives at `/blog/<slug>` and
`/<slug>` redirects. Most rewrite targets are pre-2026. The worked example
(published 2025-08-18) uses `/what-is-lipo-foam`.

```bash
P=$( [ <published_at year> -ge 2026 ] && echo /blog/<slug> || echo /<slug> )
O=$( [ "$P" = /<slug> ] && echo /blog/<slug> || echo /<slug> )   # the other form
curl -sI "$BASE$P" | head -1                                      # 200
curl -sI "$BASE$O" | grep -i -E '^(HTTP|location)'                # 308 → $P
python3 .claude/skills/blog-post/scripts/served_check.py "$BASE$P" <slug>
```

`served_check.py` checks the page against `blog/posts/<slug>/`:

- **The post's parts are served**: the quick answer, every H2, the FAQ
  section and Sources.
- **JSON-LD by tag, not by string** (the RSC payload repeats every block):
  exactly one `BreadcrumbList`, `MedicalWebPage` and `BlogPosting`, plus one
  `FAQPage` when the post has FAQs. `Organization` and `WebSite` come from
  the layout. `ImageObject` tags vary: v2 emits them only for images in the
  body plus the page's own cards, and the old template adds one per
  related-post card. Compare the count with a sibling post on the same
  template, not with a fixed number.
- **Claims, split post vs template.** A hit whose surrounding words are in
  `content.md` is the post's, and it fails. A hit elsewhere is the
  template's (nav phone number, the old sidebar's "board-certified surgeons"
  and "5,000+ Happy Patients", the injected CTA block), so it is reported,
  not failed. Old-template hits are the reason for the v2 allowlist
  decision ([publishing](publishing.md#7-the-code-pr)).

It exits 1 on a post claim, a missing part, or a wrong JSON-LD count. For a
live post that isn't in `blog/posts` (review mode), pass the path of a
scratch `content.md` instead of the slug.

Then check by hand:

- `BlogPosting`: `datePublished` = `published_at`. `dateModified` =
  `content_updated_at` only when that is more than 24 hours after
  publishing. Speakable points at `.quick-answer` when the quick answer is
  set. There is no `reviewedBy`.
- The `<title>` is the post's title (≤ 60 characters); the meta
  description is `meta_description`; `robots` is `index, follow` on a build
  with crawling allowed; the canonical is the live path.
- Every inline image loads from `*.public.blob.vercel-storage.com`, and the
  hero sits under the title with the subject in the upper two thirds.
- At least two links reach the procedure page, and every internal link in
  the article body answers 200, not 308. Those are the hrefs in
  `content.md`, which `check_post.py` already resolved:
  `grep -o '](/[^)#]*' blog/posts/<slug>/content.md | cut -c3- | sort -u`,
  then `curl -sI "$BASE<path>"` each. Leave out the template's links
  (related-post cards, nav, footer). On a copy of the stale local database,
  related-post cards can point at posts that production folded after the
  copy was made, and those answer 308. That is the template and the copy,
  not the post.

## 4. In the browser

Render the post at 390 × 844 and 1440 × 900, with chrome-devtools in an
`isolatedContext` (a subagent on Playwright would take over the shared page;
the Chrome extension's viewport is about 600 px). Look for: no horizontal
scroll (`document.documentElement.scrollWidth` ≤ the viewport), tables
scroll inside their wrapper on a phone, the CTA lands where the marker (or
the 40% split) puts it, no console errors from the page, and images are
sharp and correctly cropped. Save screenshots only under `.playwright-mcp/`
and delete them after.

## 5. After the production run

- Revalidate, then repeat section 3 against production.
- `/sitemap/blog.xml` lists a new post within 3 hours, with its `lastmod`.
  A rewrite's `lastmod` moves to the run time.
- Run `inspect_url` on the URL, then the manual "Request indexing".
- For a fold: both forms of every folded URL answer 308 to the destination,
  and no published post links a folded slug (`01-fold-links.sql` asserted
  it; spot-check one post that was edited).

## 6. Code checks (the PR)

```bash
git branch --show-current
pnpm --filter admin test                  # registry integrity and the live-post count
pnpm --filter web typecheck               # when BLOG_V2_SLUGS or other web code changed
python3 blog/tools/check_post.py --all   # every post in blog/posts still passes (live posts from the sitemap)
```

A new post that is now live must have `mode: rewrite` in its `meta.json`
([publishing](publishing.md#9-record)), or the lint reports it as "already
live".
