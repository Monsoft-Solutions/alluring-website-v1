#!/usr/bin/env python3
"""Fold (retire) blog posts into a destination: the SQL and the code checklist.

    python3 blog/tools/fold_sql.py <DATABASE_URL|local> <out_dir> --fold <slug>:<destination> [--fold ...]
                                   [--delete [--check-base URL]]

<destination> is a live path: another post (/how-long-to-recover-tummy-tuck,
/blog/tummy-tuck-vs-liposuction) or a page (/procedures/liposuction-miami#recovery).
Merging the folded post's useful content into a destination post is a
rewrite of that post (blog/posts/<destination>/, build_sql.py), done first.

Writes:
  <out_dir>/01-fold-links.sql          BEFORE the deploy. Repoints every link to a
                                       folded post in other published posts (content
                                       and FAQs; /slug, /blog/slug, absolute URLs,
                                       anchors) to its destination, unlinks it where
                                       the destination is the post itself, and
                                       restores content_updated_at on those posts (a
                                       link edit is not a revision: the trigger would
                                       call them freshly revised). Dismisses open
                                       refresh candidates on the folded posts, and
                                       inserts a dismissed one for each folded post
                                       that has none, so the 60-day refresh cooldown
                                       covers every folded post until 02 deletes it
                                       (a refresh run started in between would be
                                       cascaded away mid-run, leaving a failed
                                       autopilot run that stalls refresh).
                                       md5-guarded per post (content and FAQs).
  <out_dir>/01-fold-links-backup.json  the rows 01 edits or deletes, as they were: the
                                       inbound posts, the working copies of
                                       ready_for_review candidates (with their image,
                                       category and tag links) and the refresh rows
  <out_dir>/02-delete-folded.sql       (--delete) AFTER the deploy with the
                                       redirects is live: deletes the folded posts
                                       (cascade: links, revisions, refresh rows,
                                       working copies). Refuses while any published
                                       post still links a folded slug, while a
                                       refresh run is in_progress on a folded post,
                                       or when a folded row's md5(content) or
                                       content_updated_at is no longer the one in
                                       02-folded-backup.json (it changed after the
                                       build: rebuild, so the backup is current).
                                       --delete writes it only when /slug and
                                       /blog/slug of every folded post already
                                       answer 308 to the destination on
                                       --check-base (default production, checked
                                       with curl -sI): run it after the deploy.
  <out_dir>/02-folded-backup.json      (--delete) every row 02 deletes or cascades
                                       (analyses included), and the ids of the
                                       gsc_query_page_daily and autopilot_run rows
                                       whose post link the delete sets to NULL
  <out_dir>/fold-checklist.md          the five hand-synced code places, checked
                                       against the working tree, and the run order

--check-base URL  where --delete checks the redirects (default
                  https://www.alluringplasticsurgery.com). Only for a rehearsal
                  against a local database, e.g. a `next start` of the branch
                  carrying the redirects; a build against any other database
                  always checks production.

Build and apply 01 against a throwaway copy first (one filled from
production: publishing.md section 1); rebuild against production right
before each run (the backup must come from production) and diff. Both files
refuse to run on the shared dev database (alluring-autopilot-dev).
Exit 1 when a fold can't be built (not live, bad destination, a mention that
isn't a link, a chained fold), or when --delete finds a folded URL that does
not 308 to its destination yet (01 and the checklist are still written; 02
is not, and an older 02 in <out_dir> is removed).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import bloglib as bl  # noqa: E402

FULL_LINK_RX = re.compile(r'(?<!!)\[(?P<text>[^\]]+)\]\((?P<url>[^)\s]+)(?P<title>\s+"[^"]*")?\)')


def redirect_problems(base: str, folds: dict[str, str]) -> list[str]:
    """curl -sI both URL forms of every folded post on `base`: each must answer 308 to its destination."""
    out = []
    for slug, dest in folds.items():
        for path in (f'/{slug}', f'/blog/{slug}'):
            url = base.rstrip('/') + path
            try:
                head = subprocess.run(['curl', '-sS', '-I', '--max-time', '20', url], capture_output=True, text=True,
                                      timeout=30)
            except subprocess.TimeoutExpired:
                out.append(f'{url}: no answer in 30 s')
                continue
            status_lines = [ln for ln in head.stdout.splitlines() if ln.startswith('HTTP/')]
            code = status_lines[-1].split()[1] if status_lines and len(status_lines[-1].split()) > 1 else '?'
            loc = next((ln.split(':', 1)[1].strip() for ln in head.stdout.splitlines()
                        if ln.lower().startswith('location:')), '')
            got = urlparse(urljoin(url, loc)) if loc else None
            got_path = (got.path.rstrip('/') or '/') + (f'#{got.fragment}' if got and got.fragment else '') if got else ''
            want = dest.split('#', 1)[0].rstrip('/') + (f'#{dest.split("#", 1)[1]}' if '#' in dest else '')
            if code != '308' or got_path != want:
                out.append(f'{url}: {code}{" -> " + loc if loc else ""} (need 308 -> {dest})'
                           + (f'; curl: {head.stderr.strip()[:120]}' if head.stderr.strip() else ''))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description='Build the SQL that folds blog posts.')
    ap.add_argument('db')
    ap.add_argument('out_dir')
    ap.add_argument('--fold', action='append', required=True, metavar='SLUG:DESTINATION')
    ap.add_argument('--delete', action='store_true')
    ap.add_argument('--check-base', default=bl.SITE, metavar='URL')
    a = ap.parse_args()
    db = bl.resolve_db(a.db)
    if a.check_base.rstrip('/') != bl.SITE and not a.delete:
        ap.error('--check-base only applies with --delete')
    if a.check_base.rstrip('/') != bl.SITE and not bl.is_local_db(db):
        bl.die(f'--check-base {a.check_base} refused: {bl.describe_db(db)} is not a local database. A build against '
               'production checks the production redirects')
    out = Path(a.out_dir)
    print(f'database {bl.describe_db(db)}' + ('' if bl.is_local_db(db) else '  (REMOTE: reads only; prod reads need the user\'s OK)'))

    problems: list[str] = []
    folds: dict[str, str] = {}
    for f in a.fold:
        slug, sep, dest = f.partition(':')
        if not sep or not slug or not dest:
            bl.die(f'--fold {f}: use <slug>:<destination path>')
        ip = bl.internal_path(dest)
        if not ip:
            bl.die(f'--fold {f}: the destination must be a path on this site')
        folds[slug] = ip[0] + (f'#{ip[1]}' if ip[1] else '')

    published, _ = bl.published_posts(db)
    paths = {v['path']: k for k, v in published.items()}
    money = bl.money_pages()
    redirects = dict(x for x in bl.redirects() if ':' not in x[0])

    rows = bl.psql_json(db, (
        "SELECT coalesce(json_agg(row_to_json(p)), '[]') FROM (SELECT id, slug, status, published_at, "
        "content_updated_at FROM blog_post WHERE refresh_of_post_id IS NULL AND slug = ANY(ARRAY["
        + ','.join(bl.lit(s) for s in folds) + "]::text[])) p"))
    folded = {r['slug']: r for r in rows}
    for slug, dest in folds.items():
        r = folded.get(slug)
        if not r or r['status'] != 'published':
            problems.append(f'{slug}: no published post with this slug in {bl.describe_db(db)}')
            continue
        r['path'] = ('/blog/' if (r['published_at'] or '') >= '2026' else '/') + slug
        dpath = dest.split('#', 1)[0]
        dslug = dpath.rsplit('/', 1)[-1]
        if dslug in folds:
            problems.append(f'{slug}: destination {dest} is itself folded in this run; point both at the final page')
        elif dpath in paths:
            pass
        elif dslug in published:
            problems.append(f'{slug}: {dpath} is not the live URL of that post; use {published[dslug]["path"]}')
        elif dpath not in money:
            problems.append(f'{slug}: destination {dest} is not a live post or page')
        if dpath in redirects:
            problems.append(f'{slug}: destination {dpath} is itself a redirect source (-> {redirects[dpath]})')
    if problems:
        for x in problems:
            print('  PROBLEM ', x)
        return 1

    alt = '|'.join(re.escape(s) for s in folds)
    pattern = f'(^|[^a-z0-9-])({alt})([^a-z0-9-]|$)'
    inbound = bl.psql_json(db, (
        "SELECT coalesce(json_agg(row_to_json(p) ORDER BY p.slug), '[]') FROM (SELECT id, slug, published_at, content, "
        "faqs, md5(coalesce(content, '')) AS content_md5, md5(coalesce(faqs::text, '')) AS faqs_md5, content_updated_at "
        "FROM blog_post WHERE status = 'published' AND refresh_of_post_id IS NULL AND slug IS NOT NULL "
        f"AND NOT (slug = ANY(ARRAY[{','.join(bl.lit(s) for s in folds)}]::text[])) "
        f"AND (content ~ {bl.lit(pattern)} OR faqs::text ~ {bl.lit(pattern)})) p"))
    others = bl.psql_json(db, (
        "SELECT coalesce(json_agg(json_build_object('slug', slug, 'status', status)), '[]') FROM blog_post "
        "WHERE status <> 'published' AND slug IS NOT NULL "
        f"AND (content ~ {bl.lit(pattern)} OR faqs::text ~ {bl.lit(pattern)})"))
    refresh = bl.psql_json(db, (
        "SELECT coalesce(json_agg(json_build_object('slug', b.slug, 'status', c.status, 'working_post_id', c.working_post_id)), '[]') "
        "FROM content_refresh c JOIN blog_post b ON b.id = c.blog_post_id "
        f"WHERE b.slug = ANY(ARRAY[{','.join(bl.lit(s) for s in folds)}]::text[]) AND b.refresh_of_post_id IS NULL "
        "AND c.status IN ('pending', 'in_progress', 'ready_for_review')"))
    for c in refresh:
        if c['status'] == 'in_progress':
            problems.append(f'{c["slug"]}: a refresh run is in progress; wait or hold it (blog/tools/sql/hold_refresh.sql)')

    def repoint(text: str, self_path: str) -> tuple[str, int]:
        count = 0

        def sub(m: re.Match) -> str:
            nonlocal count
            ip = bl.internal_path(m.group('url'))
            if not ip:
                return m.group(0)
            slug = ip[0].rsplit('/', 1)[-1]
            if slug not in folds or ip[0] not in (f'/{slug}', f'/blog/{slug}'):
                return m.group(0)
            count += 1
            dest = folds[slug]
            if dest.split('#', 1)[0] == self_path:
                return m.group('text')  # the destination is this post: a link would point at itself
            return f'[{m.group("text")}]({dest}{m.group("title") or ""})'
        return FULL_LINK_RX.sub(sub, text), count

    edits = []
    for p in inbound:
        self_path = ('/blog/' if (p['published_at'] or '') >= '2026' else '/') + p['slug']
        content, n_body = repoint(p['content'] or '', self_path)
        faqs = p['faqs']
        n_faq = 0
        if faqs:
            new_faqs = []
            for f in faqs:
                f2 = dict(f)
                for k in ('question', 'answer'):
                    if isinstance(f2.get(k), str):
                        f2[k], c = repoint(f2[k], self_path)
                        n_faq += c
                new_faqs.append(f2)
            faqs = new_faqs
        rest = re.search(pattern, content) or re.search(pattern, json.dumps(faqs or [], ensure_ascii=False))
        if rest:
            src = content if re.search(pattern, content) else json.dumps(faqs, ensure_ascii=False)
            mm = re.search(pattern, src)
            ctx = src[max(0, mm.start() - 70):mm.end() + 70].replace('\n', ' ')
            problems.append(f'{p["slug"]}: mentions a folded slug outside a markdown link; edit it by hand (a rewrite): … {ctx} …')
            continue
        edits.append(dict(row=p, content=content, faqs=faqs, faqs_changed=n_faq > 0,
                          content_changed=content != (p['content'] or ''), links=n_body + n_faq, self_path=self_path))
    if problems:
        for x in problems:
            print('  PROBLEM ', x)
        return 1

    out.mkdir(parents=True, exist_ok=True)
    fold_list = ', '.join(bl.lit(s) for s in folds)
    ids = {s: folded[s]['id'] for s in folds}
    wcs = [c['working_post_id'] for c in refresh if c['status'] == 'ready_for_review' and c['working_post_id']]
    n_open = sum(1 for c in refresh if c['status'] in ('pending', 'ready_for_review'))
    # Folded posts with no open candidate get a dismissed one, so the refresh
    # cooldown also covers them until 02 deletes them (days later, after the deploy).
    no_open = [s for s in folds if not any(c['slug'] == s for c in refresh)]

    parts = [f"""-- Fold, part 1 (BEFORE the deploy): repoint links to the folded posts.
-- Generated by blog/tools/fold_sql.py; do not edit by hand.
--
""" + '\n'.join(f'--   {folded[s]["path"]} -> {d}' for s, d in folds.items()) + f"""
--
-- Every page this edits is live and every link it writes points at a live
-- page, so it is safe before the redirects ship. It:
--   1. repoints {sum(e['links'] for e in edits)} link(s) in {len(edits)} published post(s), md5-guarded on content
--      and FAQs, and restores their content_updated_at (a link edit is not a
--      revision; the trigger would stamp them);
--   2. dismisses {n_open} open refresh candidate(s) on the folded posts{f' and deletes {len(wcs)} working copies' if wcs else ''},
--      and inserts a dismissed one for the {len(no_open)} folded post(s) with none, so the
--      60-day refresh cooldown keeps autopilot off every folded post until 02 deletes it.
-- Backup of every row it edits or deletes (posts, working copies and their
-- links, refresh rows): 01-fold-links-backup.json.
--
-- Run:  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f 01-fold-links.sql
-- Then: bash blog/tools/revalidate.sh blog-posts sitemap-urls {' '.join('blog-post-' + e['row']['slug'] for e in edits)}

BEGIN;

CREATE TEMP TABLE _fold_link_only ON COMMIT DROP AS
SELECT id, slug, content_updated_at FROM blog_post
 WHERE id IN ({', '.join(bl.lit(e['row']['id']) for e in edits) or 'NULL'});

DO $do$
DECLARE
    n integer;
BEGIN
{bl.db_guard_sql()}
    SELECT count(*) INTO n FROM blog_post
     WHERE slug IN ({fold_list}) AND id IN ({', '.join(bl.lit(i) for i in ids.values())})
       AND status = 'published' AND refresh_of_post_id IS NULL;
    IF n <> {len(folds)} THEN RAISE EXCEPTION 'expected {len(folds)} published folded posts, found %', n; END IF;

    SELECT count(*) INTO n FROM content_refresh
     WHERE blog_post_id IN ({', '.join(bl.lit(i) for i in ids.values())}) AND status = 'in_progress';
    IF n <> 0 THEN RAISE EXCEPTION 'a refresh run is in progress on a folded post'; END IF;
"""]
    if wcs:
        parts.append(f"""
    DELETE FROM blog_post WHERE id IN ({', '.join(bl.lit(w) for w in wcs)})
       AND refresh_of_post_id IN ({', '.join(bl.lit(i) for i in ids.values())});
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(wcs)} THEN RAISE EXCEPTION 'deleted % working copies, expected {len(wcs)}', n; END IF;
""")
    parts.append(f"""
    UPDATE content_refresh SET status = 'dismissed', updated_at = now()
     WHERE blog_post_id IN ({', '.join(bl.lit(i) for i in ids.values())}) AND status IN ('pending', 'ready_for_review');
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {n_open} THEN RAISE EXCEPTION 'dismissed % refresh candidates on folded posts, expected {n_open}', n; END IF;
""")
    if no_open:
        parts.append(f"""
    -- No open candidate on these folded posts: a dismissed one starts the cooldown
    -- (once per post: a second run of this file inserts none and fails).
    INSERT INTO content_refresh (blog_post_id, status, sources, change_summary)
    SELECT b.id, 'dismissed',
           jsonb_build_array(jsonb_build_object('source', 'manual',
               'detectedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
               'metrics', jsonb_build_object('requestedBy', '{bl.REVISION_REASON}-fold'))),
           'Folded with the blog kit; dismissed to hold refresh until 02-delete-folded.sql deletes the post.'
      FROM blog_post b
     WHERE b.id IN ({', '.join(bl.lit(ids[s]) for s in no_open)})
       AND NOT EXISTS (SELECT 1 FROM content_refresh c WHERE c.blog_post_id = b.id
                        AND c.status IN ('pending', 'in_progress', 'ready_for_review'))
       AND NOT EXISTS (SELECT 1 FROM content_refresh c WHERE c.blog_post_id = b.id AND c.status = 'dismissed'
                        AND c.sources @> '[{{"metrics": {{"requestedBy": "{bl.REVISION_REASON}-fold"}}}}]'::jsonb);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(no_open)} THEN RAISE EXCEPTION 'inserted % dismissed refresh rows on folded posts, expected {len(no_open)} (already ran?)', n; END IF;
""")
    for i, e in enumerate(edits):
        p = e['row']
        sets = []
        if e['content_changed']:
            sets.append(f"content = {bl.dollar(f'c{i}', e['content'])}")
        if e['faqs_changed']:
            sets.append(f"faqs = {bl.dollar(f'f{i}', json.dumps(e['faqs'], ensure_ascii=False))}::jsonb")
        sets.append('updated_at = now()')
        parts.append(f"""
    -- {p['slug']}: {e['links']} link(s)
    UPDATE blog_post
       SET {(',' + chr(10) + '           ').join(sets)}
     WHERE id = {bl.lit(p['id'])} AND status = 'published'
       AND md5(coalesce(content, '')) = '{p['content_md5']}' AND md5(coalesce(faqs::text, '')) = '{p['faqs_md5']}';
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: update touched % rows (edited since the build?)', n; END IF;
""")
    parts.append(f"""
    UPDATE blog_post b SET content_updated_at = l.content_updated_at
      FROM _fold_link_only l WHERE b.id = l.id;

    SELECT count(*) INTO n FROM blog_post b JOIN _fold_link_only l ON l.id = b.id
     WHERE b.content_updated_at IS DISTINCT FROM l.content_updated_at;
    IF n <> 0 THEN RAISE EXCEPTION 'content_updated_at moved on % link-only posts', n; END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE status = 'published' AND refresh_of_post_id IS NULL AND slug NOT IN ({fold_list})
       AND (content ~ {bl.lit(pattern)} OR faqs::text ~ {bl.lit(pattern)});
    IF n <> 0 THEN RAISE EXCEPTION '% published posts still link a folded post', n; END IF;
END
$do$;

SELECT 'blog-post-' || slug AS revalidate_tag FROM blog_post
 WHERE id IN ({', '.join(bl.lit(e['row']['id']) for e in edits) or 'NULL'}) ORDER BY slug;

COMMIT;
""")
    (out / '01-fold-links.sql').write_text(''.join(parts), encoding='utf-8')
    fold_ids = ', '.join(bl.lit(i) for i in ids.values())
    wc_list = ', '.join(bl.lit(w) for w in wcs) or 'NULL'
    deleted = bl.psql_json(db, f"""
SELECT json_build_object(
  'working_copies', (SELECT coalesce(json_agg(row_to_json(w)), '[]') FROM blog_post w WHERE w.id IN ({wc_list})),
  'working_copy_images', (SELECT coalesce(json_agg(row_to_json(i)), '[]') FROM blog_post_images i WHERE i.blog_post_id IN ({wc_list})),
  'working_copy_categories', (SELECT coalesce(json_agg(row_to_json(c)), '[]') FROM blog_post_category c WHERE c.blog_post_id IN ({wc_list})),
  'working_copy_tags', (SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM blog_post_tag t WHERE t.blog_post_id IN ({wc_list})),
  'content_refresh', (SELECT coalesce(json_agg(row_to_json(cr)), '[]') FROM content_refresh cr
                       WHERE cr.blog_post_id IN ({fold_ids}) AND cr.status IN ('pending', 'ready_for_review'))
)""")
    assert len(deleted['working_copies']) == len(wcs), (len(deleted['working_copies']), len(wcs))
    (out / '01-fold-links-backup.json').write_text(json.dumps({
        'edited_posts': {e['row']['slug']: {k: e['row'][k] for k in ('id', 'slug', 'content', 'faqs', 'content_updated_at')}
                         for e in edits},
        **deleted,
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    refused_delete = []
    if a.delete:
        refused_delete = redirect_problems(a.check_base, folds)
        if refused_delete:
            for x in ('02-delete-folded.sql', '02-folded-backup.json'):
                if (out / x).exists():
                    (out / x).unlink()
                    print(f'  removed the older {out / x}')
    if a.delete and not refused_delete:
        id_list = ', '.join(bl.lit(i) for i in ids.values())
        # The folded posts and their working copies: everything the delete removes.
        all_ids = f'SELECT id FROM blog_post WHERE id IN ({id_list}) OR refresh_of_post_id IN ({id_list})'
        backup = bl.psql_json(db, f"""
SELECT json_build_object(
  'blog_post', (SELECT json_agg(row_to_json(b)) FROM blog_post b WHERE b.id IN ({id_list})),
  'working_copies', (SELECT coalesce(json_agg(row_to_json(w)), '[]') FROM blog_post w WHERE w.refresh_of_post_id IN ({id_list})),
  'blog_post_category', (SELECT coalesce(json_agg(row_to_json(c)), '[]') FROM blog_post_category c WHERE c.blog_post_id IN ({all_ids})),
  'blog_post_tag', (SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM blog_post_tag t WHERE t.blog_post_id IN ({all_ids})),
  'blog_post_images', (SELECT coalesce(json_agg(row_to_json(i)), '[]') FROM blog_post_images i WHERE i.blog_post_id IN ({all_ids})),
  'blog_post_revision', (SELECT coalesce(json_agg(row_to_json(r)), '[]') FROM blog_post_revision r WHERE r.blog_post_id IN ({all_ids})),
  'content_refresh', (SELECT coalesce(json_agg(row_to_json(cr)), '[]') FROM content_refresh cr WHERE cr.blog_post_id IN ({all_ids})),
  'blog_post_analysis', (SELECT coalesce(json_agg(row_to_json(a)), '[]') FROM blog_post_analysis a WHERE a.blog_post_id IN ({all_ids})),
  'gsc_query_page_daily_ids', (SELECT coalesce(json_agg(g.id ORDER BY g.id), '[]') FROM gsc_query_page_daily g WHERE g.blog_post_id IN ({all_ids})),
  'autopilot_run_ids', (SELECT coalesce(json_agg(r.id ORDER BY r.id), '[]') FROM autopilot_run r WHERE r.post_id IN ({all_ids}))
)""")
        assert len(backup['blog_post']) == len(folds), len(backup['blog_post'])
        # What 02 asserts before it deletes: each folded row is still the one backed up.
        backup['guards'] = bl.psql_json(db, (
            "SELECT json_object_agg(slug, json_build_object('id', id, 'content_md5', md5(coalesce(content, '')), "
            f"'content_updated_at', content_updated_at::text)) FROM blog_post WHERE id IN ({id_list})"))
        (out / '02-folded-backup.json').write_text(json.dumps(backup, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        dest_posts = sorted({paths[d.split('#', 1)[0]] for d in folds.values() if d.split('#', 1)[0] in paths})
        counts = {k: len(v) for k, v in backup.items() if k != 'guards'}
        curls = '\n'.join(f"--   curl -sI https://www.alluringplasticsurgery.com{u} | grep -i -E '^(HTTP|location)'"
                          for s in folds for u in (f'/{s}', f'/blog/{s}'))
        (out / '02-delete-folded.sql').write_text(f"""-- Fold, part 2: run ONLY after the deploy carrying the new next.config.mjs
-- redirects is live. Each of these must answer 308 to its destination first:
{curls}
-- Deleting before the redirects ship makes the URLs 404.
--
-- Deletes {len(folds)} folded post(s) rather than drafting them: drafts count against
-- autopilot_draft_cap and feed ideation's dedupe list. Cascades: category, tag
-- and image links, revisions, content_refresh rows, analyses, refresh working
-- copies; sets gsc_query_page_daily.blog_post_id and autopilot_run.post_id to
-- NULL on the rows listed by id ({counts}). Backup of every affected row:
-- 02-folded-backup.json, built from the same database as this file; rebuild
-- both right before the run. Refuses while a refresh run is in progress on a
-- folded post, and when a folded row's md5(content) or content_updated_at is
-- not the one in 02-folded-backup.json "guards" (it changed after the build).
--
-- Run:  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f 02-delete-folded.sql
-- Then: bash blog/tools/revalidate.sh blog-posts sitemap-urls {' '.join('blog-post-' + s for s in folds)}

BEGIN;

DO $do$
DECLARE
    n integer;
    folded constant uuid[] := ARRAY[{id_list}]::uuid[];
BEGIN
{bl.db_guard_sql()}
    SELECT count(*) INTO n FROM blog_post
     WHERE id = ANY(folded) AND slug IN ({fold_list}) AND status = 'published' AND refresh_of_post_id IS NULL;
    IF n <> {len(folds)} THEN RAISE EXCEPTION 'expected {len(folds)} published folded posts, found %', n; END IF;

    SELECT count(*) INTO n FROM content_refresh WHERE blog_post_id = ANY(folded) AND status = 'in_progress';
    IF n <> 0 THEN RAISE EXCEPTION 'a refresh run is in progress on a folded post: wait for it to finish (the delete would cascade away its working copy and fail the run)'; END IF;
""" + ''.join(f"""
    SELECT count(*) INTO n FROM blog_post
     WHERE id = {bl.lit(g['id'])} AND md5(coalesce(content, '')) = {bl.lit(g['content_md5'])}
       AND content_updated_at::text IS NOT DISTINCT FROM {bl.lit(g['content_updated_at']) if g['content_updated_at'] else 'NULL'};
    IF n <> 1 THEN RAISE EXCEPTION '{s}: changed since the build (md5 or content_updated_at is not the one in 02-folded-backup.json): rebuild with --delete so the backup is current'; END IF;
""" for s, g in sorted(backup['guards'].items())) + f"""
    SELECT count(*) INTO n FROM blog_post
     WHERE status = 'published' AND refresh_of_post_id IS NULL AND NOT (id = ANY(folded))
       AND (content ~ {bl.lit(pattern)} OR faqs::text ~ {bl.lit(pattern)});
    IF n <> 0 THEN RAISE EXCEPTION '% published posts still link a folded post: run 01-fold-links.sql first', n; END IF;

    DELETE FROM blog_post WHERE id = ANY(folded) AND status = 'published' AND refresh_of_post_id IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(folds)} THEN RAISE EXCEPTION 'deleted % posts, expected {len(folds)}', n; END IF;

    SELECT count(*) INTO n FROM blog_post WHERE refresh_of_post_id IS NOT NULL
       AND refresh_of_post_id NOT IN (SELECT id FROM blog_post);
    IF n <> 0 THEN RAISE EXCEPTION 'orphaned working copies remain: %', n; END IF;
""" + (f"""
    SELECT count(*) INTO n FROM blog_post WHERE slug IN ({', '.join(bl.lit(s) for s in dest_posts)}) AND status = 'published';
    IF n <> {len(dest_posts)} THEN RAISE EXCEPTION 'a destination post is no longer published'; END IF;
""" if dest_posts else '') + """END
$do$;

COMMIT;
""", encoding='utf-8')

    checklist = build_checklist(folds, folded, edits, others, a.delete and not refused_delete)
    (out / 'fold-checklist.md').write_text(checklist, encoding='utf-8')
    print(checklist)
    for e in edits:
        print(f"  links  {e['row']['slug']:60} {e['links']} link(s)")
    print(f'wrote {out}')
    if refused_delete:
        print(f'\n--delete refused: 02-delete-folded.sql not written. Every folded URL must answer 308 to its '
              f'destination on {a.check_base} first (deploy the code PR, then rebuild with --delete):')
        for x in refused_delete:
            print('  PROBLEM ', x)
        return 1
    return 0


def build_checklist(folds: dict, folded: dict, edits: list, others: list, delete: bool) -> str:
    cfg = (bl.REPO / 'apps/web/next.config.mjs').read_text(encoding='utf-8')
    redirects = bl.redirects()
    sitemap = (bl.REPO / 'apps/web/app/sitemap/blog.xml/route.ts').read_text(encoding='utf-8')
    excluded = re.search(r'SITEMAP_EXCLUDED_SLUGS\s*=\s*new Set\(\[(.*?)\]\)', sitemap, re.S)
    excluded = set(re.findall(r"'([^']+)'", excluded.group(1))) if excluded else set()
    reg = (bl.REPO / 'packages/shared/src/seo/keyword-ownership-blog.constant.ts').read_text(encoding='utf-8')
    gen = (bl.REPO / 'packages/shared/scripts/generate-blog-keyword-ownership.mjs').read_text(encoding='utf-8')
    retired_block = re.search(r'const RETIRED\s*=\s*\{(.*?)\n\}', gen, re.S)
    dup_block = re.search(r'const DUPLICATE_OF\s*=\s*\{(.*?)\n\}', gen, re.S)
    test = (bl.REPO / 'apps/admin/__tests__/lib/seo/keyword-ownership.test.ts').read_text(encoding='utf-8')
    count = re.search(r'expect\(liveBlog\.length\)\.toBe\((\d+)\)', test)

    def entry(slug: str) -> dict:
        m = re.search(r"\{\s*url:\s*'([^']+)',\s*slug:\s*'" + re.escape(slug) + r"'(.*?)\n    \}", reg, re.S)
        if not m:
            return {}
        body = m.group(2)
        st = re.search(r"status:\s*'(\w+)'", body)
        rd = re.search(r"redirectsTo:\s*'([^']+)'", body)
        oq = re.search(r'ownsQueries:\s*\[(.*?)\]', body, re.S)
        return {'url': m.group(1), 'status': st.group(1) if st else None, 'redirectsTo': rd.group(1) if rd else None,
                'ownsQueries': re.findall(r"'([^']+)'", oq.group(1)) if oq else []}

    ok = lambda b: '[x]' if b else '[ ]'  # noqa: E731
    lines = ['# Fold checklist', '', f'Generated {dt.date.today().isoformat()} by blog/tools/fold_sql.py. '
             '[x] = already true in this working tree.', '']
    for s, d in folds.items():
        lines.append(f'- `{folded[s]["path"]}` -> `{d}`')
    lines += ['', '## The five hand-synced code places (one PR)', '',
              '### 1. apps/web/next.config.mjs `redirects()`: both URL forms, permanent (308)', '']
    for s, d in folds.items():
        for src in (f'/{s}', f'/blog/{s}'):
            have = [dd for ss, dd in redirects if ss == src]
            lines.append(f"- {ok(have and have[0] == d)} `{{ source: '{src}', destination: '{d}', permanent: true }}`"
                         + (f' (now -> {have[0]})' if have and have[0] != d else ''))
        aliases = [(ss, dd) for ss, dd in redirects if dd.split('#', 1)[0] in (f'/{s}', f'/blog/{s}')]
        for ss, dd in aliases:
            lines.append(f"- [ ] repoint the older alias `{ss}` (now -> `{dd}`) straight to `{d}` (no double hop)")
    lines += ['', '### 2. apps/web/app/sitemap/blog.xml/route.ts `SITEMAP_EXCLUDED_SLUGS`', '']
    lines += [f"- {ok(s in excluded)} `'{s}'`" for s in folds]
    lines += ['', '### 3. packages/shared/src/seo/keyword-ownership-blog.constant.ts', '']
    live_now = 0
    for s, d in folds.items():
        e = entry(s)
        if e.get('status') == 'live':
            live_now += 1
        done = e.get('status') == 'retired' and e.get('redirectsTo') == d and not e.get('ownsQueries')
        lines.append(f"- {ok(done)} `{s}`: `status: 'retired'`, `ownsQueries: []`, `redirectsTo: '{d}'`, `notes` (why, when)"
                     + (f" (now: status {e.get('status')}, {len(e.get('ownsQueries') or [])} ownsQueries)" if e else ' (NO ENTRY FOUND)'))
        if e.get('ownsQueries'):
            dslug = d.split('#', 1)[0].rsplit('/', 1)[-1]
            de = entry(dslug)
            move = [q for q in e['ownsQueries'] if q not in (de.get('ownsQueries') or [])]
            if move:
                lines.append(f"  - [ ] move the queries worth keeping to the destination's ownsQueries"
                             f"{' (' + dslug + ')' if de else ' (a page in keyword-ownership.constant.ts)'}, or the gate"
                             f" flips them to \"new\" and autopilot recreates the post: {', '.join(move)}")
    lines += ['', '### 4. packages/shared/scripts/generate-blog-keyword-ownership.mjs', '']
    for s, d in folds.items():
        path = folded[s]['path']
        in_ret = bool(retired_block and re.search(r"'" + re.escape(path) + r"'\s*:", retired_block.group(1)))
        lines.append(f"- {ok(in_ret)} `RETIRED`: `'{path}': '{d}',` (keyed by the URL path as served)")
        if dup_block and re.search(r"(?:'" + re.escape(s) + r"'\s*:|/" + re.escape(s) + r"')", dup_block.group(1)):
            lines.append(f"- [ ] `DUPLICATE_OF` mentions `{s}`: remove it or repoint it to `{d}`")
    lines += ['', '### 5. apps/admin/__tests__/lib/seo/keyword-ownership.test.ts', '']
    if count:
        n = int(count.group(1))
        lines.append(f"- [ ] `expect(liveBlog.length).toBe({n})` -> `toBe({n - live_now})`, and name the folded posts in the comment"
                     f" ({live_now} of {len(folds)} registry entries are live today)")
    else:
        lines.append('- [ ] the live-post count (pattern not found; check the test by hand)')
    lines += ['', 'Then `pnpm --filter admin test` (registry integrity and the count).', '',
              '## Run order', '',
              '1. If a destination post absorbs content from a folded one, rewrite it first: blog/posts/<destination slug>, then '
              '`python3 blog/tools/build_sql.py "$D" <dir> --slug <destination slug>` (publishing.md).',
              '2. Rehearse 01 on a throwaway clone; rebuild against production (user OK) and diff; the user runs '
              '`01-fold-links.sql` on production; revalidate the tags its last SELECT prints plus `blog-posts sitemap-urls`.',
              '3. Merge and deploy the code PR (the five places above).',
              '4. Check every folded URL answers 308 (`curl -sI`, both forms): `--delete` checks it itself and writes no 02 until it does.',
              f"5. {'Rebuild with --delete against production right before, so the backup is current; the user runs `02-delete-folded.sql`.' if delete else 'After the deploy, rebuild with --delete against production for the delete SQL and its backup; the user runs it.'}",
              '6. `bash blog/tools/revalidate.sh blog-posts sitemap-urls ' + ' '.join(f'blog-post-{s}' for s in folds) + '`.',
              '7. Note the fold in blog/plan.json (type fold-post) and re-read GSC for the destination at day 28.', '']
    if others:
        lines += ['## Not live, still linking a folded post (not edited)', '',
                  *[f"- `{o['slug']}` ({o['status']})" for o in others], '']
    return '\n'.join(lines)


if __name__ == '__main__':
    sys.exit(main())
