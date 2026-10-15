#!/usr/bin/env python3
"""Build the SQL that publishes blog/posts/<slug> to a database.

    python3 blog/tools/build_sql.py <DATABASE_URL|local> <out_dir> (--slug S [--slug S ...] | --all)
                                    [--check] [--manifest PATH] [--create-tags] [--no-mdx]

Reads each post's current row from the database it is given, so the guards in
the SQL match that database. Build against a throwaway copy to rehearse (for a
rewrite or a fold, one filled from production: publishing.md section 1), then
rebuild against production right before the run and diff:

    python3 blog/tools/build_sql.py "$CLONE_URL" /tmp/blog-sql-clone --slug <slug>
    python3 blog/tools/build_sql.py env:POSTGRES_URL_PROD /tmp/blog-sql-prod --slug <slug>   # prod read: user's OK
    diff -r /tmp/blog-sql-clone /tmp/blog-sql-prod      # only build-info.json differs when the copy matches production

The output never contains a timestamp or a host, so two builds from databases
in the same state are byte-identical (build-info.json says which database).
Every file refuses to run on the shared dev database (alluring-autopilot-dev).

--slug names the posts to build; --all builds every post under blog/posts
(which keeps every post the kit has shipped, so --all can bundle rewrites of
other live posts: use it deliberately). One of the two is required.

Writes, per post:
  <out_dir>/NN-<slug>.sql   one transaction (BEGIN … DO $$ … COMMIT)
  <out_dir>/undo-NN-<slug>.sql  (rewrites) the undo of NN-<slug>.sql, run only
                            after it: guarded on md5(content) = the new content,
                            it snapshots the rewrite into blog_post_revision
                            ('claude-blog-post-undo'), restores the fields from the
                            run's own 'claude-blog-post' revision, featured_image_id,
                            primary_keyword and content_updated_at from backup.json,
                            removes the category, tag and image links the rewrite
                            added, and asserts the row's md5 and fingerprint are the
                            ones it had before. The refresh queue stays as the
                            rewrite left it (dismissed: the cooldown holds).
  <out_dir>/backup.json     the rows as they were, and what the SQL will delete
  <out_dir>/code-changes.md the code PR that goes with it (registry, test count, v2)
  <out_dir>/build-info.json which database, when, which posts

meta.json "mode" decides the SQL:

  rewrite  refuses to build unless the row's md5(content) is meta.json
           "base_md5", the row the rewrite was written from (or already the
           new content): a row that changed since it was read ("production
           changed since you read it") is never overwritten. The SQL asserts
           slug + status published + that md5(content) and a fingerprint of
           every other field it changes (an edit since the build, or a second
           run, fails the whole file); snapshots the row into blog_post_revision (reason
           'claude-blog-post'); updates title, meta_title (= title),
           meta_description, excerpt, quick_answer, faqs (parsed from the FAQ
           section), content, reading_time, primary_keyword,
           secondary_keywords; upserts images and links them; sets
           featured_image_id; adds missing category/tag links (never removes);
           deletes the working copy of a ready_for_review refresh, dismisses
           pending/ready_for_review refresh candidates, or, when none is open,
           inserts a dismissed one so the 60-day refresh cooldown starts. Never
           touches slug, published_at or status. Refuses while a refresh is
           in_progress. The content_updated_at trigger stamps the post.
  new      asserts the slug (and the pre-generated id) are absent; INSERTs the
           post as published with published_at (meta.json, else now(), as UTC
           wall time like the admin), author 'Alluring Editorial Team' looked up
           by name, planning_data.ideationGate from meta.json "gate" (re-run
           here against this database: anything but "new", or any warning, a
           secondary keyword or owned query another page owns, stops the build),
           images, categories (a missing one stops the build) and tags (a
           missing one stops it unless --create-tags).

A post whose content, title, meta, excerpt, quick answer, FAQs, keywords,
featured image, categories and tags already match the database is reported
and skipped ("already live").

--check        validate only: every check_post.py rule, the database state and
               the gate; images may be missing from the manifest; writes nothing
--slug S       build these posts (repeatable)
--all          build every post under blog/posts
--manifest P   image manifest (default blog/images/manifest.json)
--create-tags  allow a new post or a rewrite to create tags it names that don't exist
--no-mdx       skip validateGeneratedMdx

Exit 0 when the SQL was written (or --check passed), 1 on any problem, 2 on a
usage error (neither or both of --slug and --all).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import bloglib as bl  # noqa: E402
import checks  # noqa: E402

CONTENT_FIELDS = ('title', 'meta_description', 'excerpt', 'quick_answer', 'content', 'primary_keyword')


def slugify(name: str) -> str:
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', name.lower())).strip('-')


# Every field a rewrite changes besides the content, as one md5. The SQL
# asserts it next to md5(content), so a file whose content is unchanged (a new
# hero, a new category) still refuses a second run. Computed by the database
# both at build time and at run time, so the text forms always agree.
FINGERPRINT_SQL = (
    "md5(concat_ws(chr(31), coalesce(b.title, ''), coalesce(b.meta_title, ''), coalesce(b.meta_description, ''), "
    "coalesce(b.excerpt, ''), coalesce(b.quick_answer, ''), coalesce(b.faqs::text, ''), coalesce(b.primary_keyword, ''), "
    "coalesce(b.secondary_keywords::text, ''), coalesce(b.featured_image_id::text, ''), "
    "(SELECT coalesce(string_agg(pc.category_id::text, ',' ORDER BY pc.category_id), '') FROM blog_post_category pc WHERE pc.blog_post_id = b.id), "
    "(SELECT coalesce(string_agg(pt.tag_id::text, ',' ORDER BY pt.tag_id), '') FROM blog_post_tag pt WHERE pt.blog_post_id = b.id), "
    "(SELECT coalesce(string_agg(pi.image_id::text || ':' || pi.image_type, ',' ORDER BY pi.image_id), '') FROM blog_post_images pi WHERE pi.blog_post_id = b.id)))"
)


def fetch_rewrite_state(db: str, slug: str) -> dict | None:
    return bl.psql_json(db, f"""
SELECT json_build_object(
  'row', (SELECT row_to_json(p) FROM (
            SELECT b.id, b.slug, b.status, b.title, b.content, b.faqs, b.excerpt, b.meta_title, b.meta_description,
                   b.meta_keywords, b.quick_answer, b.primary_keyword, b.secondary_keywords, b.reading_time,
                   b.featured_image_id, (SELECT i.url FROM images i WHERE i.id = b.featured_image_id) AS featured_url,
                   b.published_at, b.content_updated_at, b.ai_summary, {FINGERPRINT_SQL} AS fingerprint
              FROM blog_post b WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL) p),
  'refresh', (SELECT coalesce(json_agg(row_to_json(c)), '[]') FROM content_refresh c
               JOIN blog_post b ON b.id = c.blog_post_id
              WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL
                AND c.status IN ('pending', 'in_progress', 'ready_for_review')),
  'working_copies', (SELECT coalesce(json_agg(row_to_json(w)), '[]') FROM blog_post w
                      JOIN blog_post b ON b.id = w.refresh_of_post_id WHERE b.slug = {bl.lit(slug)}),
  'categories', (SELECT coalesce(json_agg(c.name ORDER BY c.name), '[]') FROM blog_post_category pc
                   JOIN blog_category c ON c.id = pc.category_id JOIN blog_post b ON b.id = pc.blog_post_id
                  WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL),
  'tags', (SELECT coalesce(json_agg(t.name ORDER BY t.name), '[]') FROM blog_post_tag pt
             JOIN blog_tag t ON t.id = pt.tag_id JOIN blog_post b ON b.id = pt.blog_post_id
            WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL),
  'category_ids', (SELECT coalesce(json_agg(pc.category_id ORDER BY pc.category_id), '[]') FROM blog_post_category pc
                     JOIN blog_post b ON b.id = pc.blog_post_id WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL),
  'tag_ids', (SELECT coalesce(json_agg(pt.tag_id ORDER BY pt.tag_id), '[]') FROM blog_post_tag pt
                JOIN blog_post b ON b.id = pt.blog_post_id WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL),
  'image_links', (SELECT coalesce(json_agg(json_build_object('image_id', pi.image_id, 'image_type', pi.image_type)
                                           ORDER BY pi.image_id), '[]') FROM blog_post_images pi
                    JOIN blog_post b ON b.id = pi.blog_post_id WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL)
)""")


def ensure_new_id(post: bl.Post, write: bool) -> str | None:
    pid = post.meta.get('id')
    if pid:
        uuid.UUID(pid)
        return pid
    if not write:
        return None
    pid = str(uuid.uuid4())
    meta = {}
    for k, v in post.meta.items():
        meta[k] = v
        if k == 'slug':
            meta['id'] = pid
    meta.setdefault('id', pid)
    (post.dir / 'meta.json').write_text(json.dumps(meta, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    post.meta = meta
    print(f'{post.slug}: pre-generated post id {pid} (written to meta.json; the Blob paths use it)')
    return pid


def gate_now(db: str, slug: str) -> tuple[dict | None, str]:
    return checks.run_gate(slug, db)


def images_sql(p: dict) -> tuple[str, str, int]:
    """DECLARE lines, statements, and how many images."""
    decl, body = [], []
    for n, i in enumerate(p['images'], 1):
        v = f'img_{n}'
        decl.append(f'    {v} uuid;')
        num = lambda x: 'NULL' if x is None else str(int(x))  # noqa: E731
        if i.get('reuse'):
            body.append(f"""
    -- image {i['key']} ({i['type']}): reused, must already be an images row
    SELECT count(*) INTO n FROM images WHERE url = {bl.lit(i['url'])};
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: reused image {i['key']} is not an images row in this database'; END IF;""")
        body.append(f"""
    -- image {i['key']} ({i['type']})
    INSERT INTO images (id, url, alt, title, width, height, file_size, mime_type, original_filename, generation_prompt, generated_by)
    VALUES ('{uuid.uuid5(uuid.NAMESPACE_URL, i['url'])}', {bl.lit(i['url'])}, {bl.lit(i['alt'])}, {bl.lit(i['file'])},
            {num(i['w'])}, {num(i['h'])}, {num(i['size'])}, 'image/jpeg', {bl.lit(i['file'])}, {bl.lit(i['prompt'])}, '{bl.GENERATED_BY}')
    ON CONFLICT (url) DO UPDATE SET alt = EXCLUDED.alt, updated_at = now()
    RETURNING id INTO {v};
    INSERT INTO blog_post_images (blog_post_id, image_id, prompt, image_type)
    SELECT post, {v}, {bl.lit(i['prompt'])}, '{i['type']}'
     WHERE NOT EXISTS (SELECT 1 FROM blog_post_images WHERE blog_post_id = post AND image_id = {v});
    UPDATE blog_post_images SET image_type = '{i['type']}'
     WHERE blog_post_id = post AND image_id = {v} AND image_type <> '{i['type']}';""")
    feat = next(n for n, i in enumerate(p['images'], 1) if i['type'] == 'featured')
    ids = ', '.join(f'img_{n}' for n in range(1, len(p['images']) + 1))
    body.append(f"""
    UPDATE blog_post SET featured_image_id = img_{feat} WHERE id = post;
    SELECT count(DISTINCT image_id) INTO n FROM blog_post_images WHERE blog_post_id = post AND image_id IN ({ids});
    IF n <> {len(p['images'])} THEN RAISE EXCEPTION '{p['slug']}: expected {len(p['images'])} image links, found %', n; END IF;
    SELECT count(*) INTO n FROM blog_post WHERE id = post AND featured_image_id = img_{feat};
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: featured image not set'; END IF;""")
    return '\n'.join(decl), ''.join(body), len(p['images'])


def taxonomy_sql(p: dict, create_tags: bool) -> str:
    out = []
    for name in p['categories']:
        out.append(f"""
    cat := NULL;
    SELECT id INTO cat FROM blog_category WHERE name = {bl.lit(name)};
    IF cat IS NULL THEN RAISE EXCEPTION 'category {name.replace("'", "''")} does not exist'; END IF;
    cats := cats || cat;
    INSERT INTO blog_post_category (blog_post_id, category_id) SELECT post, cat
     WHERE NOT EXISTS (SELECT 1 FROM blog_post_category WHERE blog_post_id = post AND category_id = cat);""")
    for name in p['tags']:
        create = (f"\n    INSERT INTO blog_tag (name, slug) VALUES ({bl.lit(name)}, {bl.lit(slugify(name))}) ON CONFLICT (slug) DO NOTHING;"
                  if create_tags else '')
        out.append(f"""
    tg := NULL;{create}
    SELECT id INTO tg FROM blog_tag WHERE name = {bl.lit(name)} OR slug = {bl.lit(slugify(name))} ORDER BY (name = {bl.lit(name)}) DESC, created_at LIMIT 1;
    IF tg IS NULL THEN RAISE EXCEPTION 'tag {name.replace("'", "''")} does not exist (build with --create-tags)'; END IF;
    tags := tags || tg;
    INSERT INTO blog_post_tag (blog_post_id, tag_id) SELECT post, tg
     WHERE NOT EXISTS (SELECT 1 FROM blog_post_tag WHERE blog_post_id = post AND tag_id = tg);""")
    out.append(f"""
    SELECT count(DISTINCT category_id) INTO n FROM blog_post_category WHERE blog_post_id = post AND category_id = ANY(cats);
    IF n <> {len(set(p['categories']))} THEN RAISE EXCEPTION '{p['slug']}: % of {len(set(p['categories']))} categories linked', n; END IF;
    SELECT count(DISTINCT tag_id) INTO n FROM blog_post_tag WHERE blog_post_id = post AND tag_id = ANY(tags);
    IF n <> {len(set(p['tags']))} THEN RAISE EXCEPTION '{p['slug']}: % of {len(set(p['tags']))} tags linked', n; END IF;""")
    return ''.join(out)


def post_fields_sql(p: dict) -> dict:
    t = re.sub(r'[^a-z]', '', p['slug'])[:16]
    return dict(
        title=bl.lit(p['title']),
        meta_description=bl.lit(p['meta_description']),
        excerpt=bl.lit(p['excerpt']),
        quick_answer=bl.dollar('qa_' + t, p['quick_answer']),
        faqs=bl.dollar('faq_' + t, json.dumps(p['faqs'], ensure_ascii=False)) + '::jsonb',
        content=bl.dollar('body_' + t, p['content']),
        reading_time=str(p['reading_time']),
        primary_keyword=bl.lit(p['primary']),
        secondary_keywords=bl.lit(json.dumps(p['secondary'], ensure_ascii=False)) + '::json',
    )


def header(p: dict, lines: list[str]) -> str:
    tags = f"blog-posts sitemap-urls blog-post-{p['slug']}"
    return '\n'.join([
        f"-- {p['mode']}: {p['path']}  ({p['words']} words, {len(p['faqs'])} FAQs, {len(p['images'])} images)",
        '-- Generated by blog/tools/build_sql.py from blog/posts/' + p['slug'] + '; do not edit by hand.',
        *[f'-- {x}' for x in lines],
        '--',
        f"-- Run:  psql \"$DATABASE_URL\" -X -v ON_ERROR_STOP=1 -f {p['file']}",
        f'-- Then: bash blog/tools/revalidate.sh {tags}',
        '', ''])


def rewrite_sql(p: dict, create_tags: bool) -> str:
    f = post_fields_sql(p)
    decl, imgs, _ = images_sql(p)
    row = p['state']['row']
    rfr = p['state']['refresh']
    pend = sum(1 for c in rfr if c['status'] in ('pending', 'ready_for_review'))
    wcs = [c['working_post_id'] for c in rfr if c['status'] == 'ready_for_review' and c.get('working_post_id')]
    lines = [
        f"Guard: slug, status 'published', md5(content) = {p['old_md5']} (meta.json base_md5, the row this rewrite was "
        f"written from) and the fingerprint of every other field it changes = {row['fingerprint']}.",
        "Undo log: blog_post_revision, reason 'claude-blog-post'. Slug, published_at and status are not touched.",
        f"Refresh queue: {pend} open candidate(s) dismissed" + (f", {len(wcs)} working cop{'y' if len(wcs) == 1 else 'ies'} deleted" if wcs else '')
        + ('' if pend else '; none open, so a dismissed row is inserted to start the cooldown') + '.',
    ]
    wc_sql = ''
    if wcs:
        wc_sql = f"""
    DELETE FROM blog_post WHERE refresh_of_post_id = post AND id IN ({', '.join(bl.lit(w) for w in wcs)});
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(wcs)} THEN RAISE EXCEPTION '{p['slug']}: deleted % working copies, expected {len(wcs)}', n; END IF;"""
    return header(p, lines) + f"""BEGIN;

DO $do$
DECLARE
    n integer;
    post constant uuid := '{row['id']}';
    cat uuid;
    tg uuid;
    cats uuid[] := '{{}}';
    tags uuid[] := '{{}}';
{decl}
BEGIN
{bl.db_guard_sql()}
    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = {bl.lit(p['slug'])} AND status = 'published' AND refresh_of_post_id IS NULL
       AND md5(coalesce(content, '')) = '{p['old_md5']}';
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: not found, or edited since the build (md5 guard)'; END IF;
    SELECT count(*) INTO n FROM blog_post b WHERE b.id = post AND {FINGERPRINT_SQL} = '{row['fingerprint']}';
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: fields, image, category or tag links changed since the build, or this file already ran (fingerprint guard)'; END IF;

    SELECT count(*) INTO n FROM content_refresh WHERE blog_post_id = post AND status = 'in_progress';
    IF n <> 0 THEN RAISE EXCEPTION '{p['slug']}: a refresh run is in progress on this post; wait for it or hold it first'; END IF;

    INSERT INTO blog_post_revision (blog_post_id, reason, title, content, meta_title, meta_description,
        meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords)
    SELECT id, '{bl.REVISION_REASON}', title, coalesce(content, ''), meta_title, meta_description,
           meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords
      FROM blog_post WHERE id = post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: revision snapshot wrote % rows', n; END IF;

    UPDATE blog_post
       SET title = {f['title']},
           meta_title = {f['title']},
           meta_description = {f['meta_description']},
           excerpt = {f['excerpt']},
           quick_answer = {f['quick_answer']},
           faqs = {f['faqs']},
           content = {f['content']},
           reading_time = {f['reading_time']},
           primary_keyword = {f['primary_keyword']},
           secondary_keywords = {f['secondary_keywords']},
           updated_at = now()
     WHERE id = post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: update touched % rows', n; END IF;
{imgs}
{taxonomy_sql(p, create_tags)}
{wc_sql}
    UPDATE content_refresh SET status = 'dismissed', updated_at = now()
     WHERE blog_post_id = post AND status IN ('pending', 'ready_for_review');
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {pend} THEN RAISE EXCEPTION '{p['slug']}: dismissed % refresh candidates, expected {pend}', n; END IF;
    IF n = 0 THEN
        INSERT INTO content_refresh (blog_post_id, status, sources, change_summary)
        VALUES (post, 'dismissed',
                jsonb_build_array(jsonb_build_object('source', 'manual',
                    'detectedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                    'metrics', jsonb_build_object('requestedBy', '{bl.REVISION_REASON}'))),
                'Rewritten with the blog kit; dismissed to start the refresh cooldown.');
    END IF;
    SELECT count(*) INTO n FROM content_refresh
     WHERE blog_post_id = post AND status IN ('pending', 'in_progress', 'ready_for_review');
    IF n <> 0 THEN RAISE EXCEPTION '{p['slug']}: % refresh candidates still open', n; END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = {bl.lit(p['slug'])} AND status = 'published'
       AND md5(content) = '{p['new_md5']}';
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: the new content did not land'; END IF;
END
$do$;

SELECT slug, left(title, 60) AS title, reading_time, published_at, content_updated_at, md5(content) AS content_md5
  FROM blog_post WHERE id = '{row['id']}';

COMMIT;
"""


def undo_sql(p: dict) -> str:
    """The undo of a rewrite's SQL file: back to the row backup.json holds, guarded and asserted."""
    st = p['state']
    row = st['row']
    uuids = lambda ids: (f"ARRAY[{', '.join(bl.lit(i) for i in ids)}]::uuid[]" if ids else "'{}'::uuid[]")  # noqa: E731
    feat = f"{bl.lit(row['featured_image_id'])}::uuid" if row.get('featured_image_id') else 'NULL'
    pk = bl.lit(row['primary_keyword']) if row.get('primary_keyword') is not None else 'NULL'
    cua = f"{bl.lit(row['content_updated_at'])}::timestamp" if row.get('content_updated_at') else 'NULL'
    links = st.get('image_links') or []
    link_ids = [x['image_id'] for x in links]
    types = ''.join(f"""
    UPDATE blog_post_images SET image_type = {bl.lit(x['image_type'])}
     WHERE blog_post_id = post AND image_id = {bl.lit(x['image_id'])} AND image_type::text <> {bl.lit(x['image_type'])};"""
                    for x in links)
    return '\n'.join([
        f"-- undo of {p['file']}: {p['path']} back to the row in backup.json (md5 {p['old_md5']}).",
        '-- Generated by blog/tools/build_sql.py; do not edit by hand. Run it ONLY to undo that file, after it ran.',
        f"-- Guard: md5(content) = {p['new_md5']} (the rewrite, unchanged since), and the 'claude-blog-post' revision",
        f"-- that file wrote (md5 {p['old_md5']}). Snapshots the rewrite as 'claude-blog-post-undo' first.",
        '-- Restores the revision fields (title, content, meta, excerpt, quick answer, FAQs, reading time, keywords),',
        '-- featured_image_id, primary_keyword and content_updated_at, removes the category, tag and image links the',
        '-- rewrite added, and asserts md5(content) and the fingerprint of every other field are the old ones.',
        '-- Not undone: the refresh queue (dismissed, so the cooldown holds) and any working copy the rewrite deleted',
        '-- (backup.json "working_copies"). Uploaded images stay on Blob and as images rows.',
        '--',
        f"-- Run:  psql \"$DATABASE_URL\" -X -v ON_ERROR_STOP=1 -f undo-{p['file']}",
        f"-- Then: bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-{p['slug']}",
        '', '']) + f"""BEGIN;

DO $do$
DECLARE
    n integer;
    rev uuid;
    post constant uuid := '{row['id']}';
BEGIN
{bl.db_guard_sql()}
    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = {bl.lit(p['slug'])} AND status = 'published' AND refresh_of_post_id IS NULL
       AND md5(coalesce(content, '')) = '{p['new_md5']}';
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: the live row is not the rewrite (never ran, edited since, or already undone)'; END IF;

    SELECT count(*) INTO n FROM content_refresh WHERE blog_post_id = post AND status = 'in_progress';
    IF n <> 0 THEN RAISE EXCEPTION '{p['slug']}: a refresh run is in progress on this post; wait for it first'; END IF;

    SELECT id INTO rev FROM blog_post_revision
     WHERE blog_post_id = post AND reason = '{bl.REVISION_REASON}' AND md5(content) = '{p['old_md5']}'
     ORDER BY created_at DESC LIMIT 1;
    IF rev IS NULL THEN RAISE EXCEPTION '{p['slug']}: no {bl.REVISION_REASON} revision with md5 {p['old_md5']}'; END IF;

    INSERT INTO blog_post_revision (blog_post_id, reason, title, content, meta_title, meta_description,
        meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords)
    SELECT id, '{bl.REVISION_REASON}-undo', title, coalesce(content, ''), meta_title, meta_description,
           meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords
      FROM blog_post WHERE id = post;

    UPDATE blog_post b
       SET title = r.title, content = r.content, meta_title = r.meta_title, meta_description = r.meta_description,
           meta_keywords = r.meta_keywords, excerpt = r.excerpt, faqs = r.faqs, quick_answer = r.quick_answer,
           ai_summary = r.ai_summary, reading_time = r.reading_time, secondary_keywords = r.secondary_keywords,
           primary_keyword = {pk}, featured_image_id = {feat}, updated_at = now()
      FROM blog_post_revision r
     WHERE b.id = post AND r.id = rev;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: restore touched % rows', n; END IF;

    DELETE FROM blog_post_category WHERE blog_post_id = post AND NOT (category_id = ANY({uuids(st.get('category_ids') or [])}));
    DELETE FROM blog_post_tag WHERE blog_post_id = post AND NOT (tag_id = ANY({uuids(st.get('tag_ids') or [])}));
    DELETE FROM blog_post_images WHERE blog_post_id = post AND NOT (image_id = ANY({uuids(link_ids)}));{types}

    -- The restore stamped content_updated_at; put back the one the post had (only this column
    -- changes, so the trigger keeps the value).
    UPDATE blog_post SET content_updated_at = {cua} WHERE id = post;

    SELECT count(*) INTO n FROM blog_post b
     WHERE b.id = post AND md5(coalesce(b.content, '')) = '{p['old_md5']}' AND {FINGERPRINT_SQL} = '{row['fingerprint']}'
       AND b.content_updated_at IS NOT DISTINCT FROM {cua};
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: the row is not back to backup.json (md5, fingerprint or content_updated_at)'; END IF;
END
$do$;

SELECT slug, left(title, 60) AS title, reading_time, published_at, content_updated_at, md5(content) AS content_md5
  FROM blog_post WHERE id = '{row['id']}';

COMMIT;
"""


def new_sql(p: dict, create_tags: bool) -> str:
    f = post_fields_sql(p)
    decl, imgs, _ = images_sql(p)
    pa = (f"({bl.lit(p['published_at'])}::timestamptz AT TIME ZONE 'UTC')" if p['published_at']
          else "(now() AT TIME ZONE 'UTC')")
    planning = json.dumps(p['planning'], ensure_ascii=False, sort_keys=True)
    lines = [
        f"Guard: slug {p['slug']} and id {p['id']} must not exist yet; a second run fails.",
        "Inserts the post as 'published' (never 'scheduled': nothing publishes those), author 'Alluring Editorial Team',",
        f"published_at {p['published_at'] or 'now()'} as UTC wall time (the admin's convention), so it lives at /blog/{p['slug']}.",
        f"Gate verdict recorded in planning_data.ideationGate: {p['planning']['ideationGate']['verdict']}.",
    ]
    return header(p, lines) + f"""BEGIN;

DO $do$
DECLARE
    n integer;
    post constant uuid := '{p['id']}';
    v_author uuid;
    cat uuid;
    tg uuid;
    cats uuid[] := '{{}}';
    tags uuid[] := '{{}}';
{decl}
BEGIN
{bl.db_guard_sql()}
    SELECT count(*) INTO n FROM blog_post WHERE slug = {bl.lit(p['slug'])} OR id = post;
    IF n <> 0 THEN RAISE EXCEPTION '{p['slug']}: slug or id already exists (already published, or a collision)'; END IF;

    SELECT count(*) INTO n FROM author WHERE name = '{bl.AUTHOR_NAME}';
    IF n <> 1 THEN RAISE EXCEPTION 'expected one author named {bl.AUTHOR_NAME}, found %', n; END IF;
    SELECT id INTO v_author FROM author WHERE name = '{bl.AUTHOR_NAME}';

    INSERT INTO blog_post (id, slug, title, meta_title, meta_description, excerpt, quick_answer, faqs, content,
        reading_time, primary_keyword, secondary_keywords, status, published_at, content_updated_at, author_id,
        priority, processing_status, idea_approval, planning_data, updated_at)
    VALUES (post, {bl.lit(p['slug'])}, {f['title']}, {f['title']}, {f['meta_description']}, {f['excerpt']},
        {f['quick_answer']},
        {f['faqs']},
        {f['content']},
        {f['reading_time']}, {f['primary_keyword']}, {f['secondary_keywords']},
        'published', {pa}, {pa}, v_author,
        'medium', 'idle', 'approved', {bl.lit(planning)}::jsonb, now());
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: insert wrote % rows', n; END IF;
{imgs}
{taxonomy_sql(p, create_tags)}

    -- Setting the featured image stamped content_updated_at with now(); a new
    -- post was last changed when it was published. (Only this column changes,
    -- so the trigger keeps the value.)
    UPDATE blog_post SET content_updated_at = published_at WHERE id = post;

    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = {bl.lit(p['slug'])} AND status = 'published' AND published_at >= '2026-01-01'
       AND content_updated_at = published_at
       AND author_id IS NOT NULL AND md5(content) = '{p['new_md5']}';
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: the new post did not land as a published 2026 post'; END IF;
END
$do$;

SELECT slug, '/blog/' || slug AS url, left(title, 60) AS title, reading_time, published_at, content_updated_at
  FROM blog_post WHERE id = '{p['id']}';

COMMIT;
"""


def ts_str(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def registry_entry(p: dict) -> str:
    owns = ''.join(f"\n            {ts_str(q)}," for q in p['owns'])
    return f"""    {{
        url: '/blog/{p['slug']}',
        slug: '{p['slug']}',
        kind: 'blog',
        intent: 'informational',
        status: 'live',
        primaryKeyword: {ts_str(p['primary'].lower())},
        ownsQueries: [{owns}
        ],
        notes: 'Written with the blog kit (blog/posts/{p['slug']}).',
    }},"""


AUTHORS_FILE = 'apps/web/lib/data/authors.data.ts'
AUTHOR_CLAIM_RX = re.compile(r'board[- ]certified|reviewed by our surgeons|review board|hipaa|medically reviewed', re.I)


def author_page_claims() -> list[str]:
    """Lines of the editorial-team entry in authors.data.ts that make claims compliance.md forbids.

    Every post, on either template, names /blog/authors/editorial-team as its author (the JSON-LD
    author url and the byline link), and that page renders this entry."""
    lines = (bl.REPO / AUTHORS_FILE).read_text(encoding='utf-8').splitlines()
    start = next((i for i, ln in enumerate(lines) if re.search(r"slug:\s*'editorial-team'", ln)), None)
    if start is None:
        return []
    out = []
    for i in range(start, len(lines)):
        if i > start and re.search(r"^\s*slug:\s*'", lines[i]):
            break
        if AUTHOR_CLAIM_RX.search(lines[i]):
            out.append(f'{AUTHORS_FILE}:{i + 1}: {lines[i].strip()[:320]}')
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description='Build the SQL for blog/posts/<slug>.')
    ap.add_argument('db')
    ap.add_argument('out_dir')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--slug', action='append')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--manifest')
    ap.add_argument('--create-tags', action='store_true')
    ap.add_argument('--no-mdx', action='store_true')
    a = ap.parse_args()

    if bool(a.slug) == a.all:
        ap.error('pass --slug <slug> (repeatable) for the posts to build, or --all for every post under blog/posts')
    db = bl.resolve_db(a.db)
    out = Path(a.out_dir)
    slugs = a.slug or bl.all_slugs()
    if not slugs:
        bl.die('no posts under blog/posts')
    print(f'database {bl.describe_db(db)}' + ('' if bl.is_local_db(db) else '  (REMOTE: reads only; prod reads need the user\'s OK)'))
    posts = [bl.load_post(s) for s in slugs]
    manifest = bl.load_manifest(Path(a.manifest) if a.manifest else None)
    ctx = checks.make_ctx(db, {p.slug: p.mode for p in posts}, manifest)

    problems: dict[str, list[str]] = {}
    built: list[dict] = []
    skipped: list[str] = []
    for post in posts:
        r = checks.check(post, ctx, final=not a.check)
        probs = problems.setdefault(post.slug, list(r.problems))
        for w in r.warnings:
            print(f'  warning  [{post.slug}] {w}')
        if r.problems and any(x.startswith('meta.json') for x in r.problems):
            continue
        m = post.meta
        content, images, img_problems = bl.apply_images(post, manifest, placeholder_ok=a.check, db=db)
        probs.extend(x for x in img_problems if x not in probs)
        words = bl.word_count(content)
        p = dict(
            slug=post.slug, mode=m['mode'], title=m['title'].strip(), meta_description=m['meta_description'].strip(),
            excerpt=m['excerpt'].strip(), quick_answer=m['quick_answer'].strip(), content=content,
            faqs=bl.faqs_for_db(content), words=words, reading_time=bl.reading_time(words),
            primary=m['primary_keyword'].strip(), secondary=[s.strip() for s in m['secondary_keywords']],
            images=images, categories=m.get('categories') or [], tags=m.get('tags') or [],
            owns=m.get('owns_queries') or [], new_md5=bl.md5(content),
        )
        if m['mode'] == 'rewrite':
            state = fetch_rewrite_state(db, post.slug)
            row = state['row'] if state else None
            if not row or row['status'] != 'published':
                probs.append(f'rewrite: no published row with slug {post.slug} in {bl.describe_db(db)}')
                continue
            if m.get('id') and m['id'] != row['id']:
                probs.append(f'rewrite: meta.json id {m["id"]} is not the database id {row["id"]}')
            if any(c['status'] == 'in_progress' for c in state['refresh']):
                probs.append('rewrite: a refresh run is in progress on this post (hold it: blog/tools/sql/hold_refresh.sql)')
            cur_md5 = bl.md5(row['content'] or '')
            p.update(state=state, id=row['id'], old_md5=cur_md5,
                     path=('/blog/' if (row['published_at'] or '') >= '2026' else '/') + post.slug)
            # The rewrite must start from the row that is there now. base_md5 is the
            # md5 of the row it was written from (rewrite_base.py); a row that moved
            # since (an admin edit, a fold's link repoint, autopilot) is refused, so
            # a stale start never overwrites newer content.
            base = (m.get('base_md5') or '').strip().lower()
            if cur_md5 != p['new_md5']:
                if not base:
                    probs.append('rewrite: meta.json has no base_md5. Read the live row with '
                                 f'python3 blog/tools/rewrite_base.py {post.slug} --db <production, or a production-filled '
                                 'copy> --save, merge it into the post, and build again')
                elif cur_md5 != base:
                    probs.append(f'rewrite: production changed since you read it: the row in {bl.describe_db(db)} has '
                                 f'md5 {cur_md5}, but this rewrite was written from {base} (meta.json base_md5). Re-read it '
                                 '(rewrite_base.py), merge what changed, save the new base_md5 and build again. A stale '
                                 'local copy fires this too: rehearse on a production-filled copy')
            featured = next((i['url'] for i in images if i['type'] == 'featured'), None)
            same = (row['content'] == content and row['title'] == p['title'] and row['meta_description'] == p['meta_description']
                    and row['excerpt'] == p['excerpt'] and row['quick_answer'] == p['quick_answer']
                    and (row['faqs'] or []) == p['faqs'] and row['primary_keyword'] == p['primary']
                    and (row['secondary_keywords'] or []) == p['secondary']
                    and (featured is None or row.get('featured_url') == featured)
                    and set(p['categories']) <= set(state['categories'] or [])
                    and set(p['tags']) <= set(state['tags'] or []))
            if same and not probs:
                skipped.append(post.slug)
                continue
        else:
            pid = ensure_new_id(post, write=not a.check)
            p.update(id=pid or '00000000-0000-0000-0000-000000000000', path=f'/blog/{post.slug}',
                     published_at=m.get('published_at'), state=None)
            gate, err = gate_now(db, post.slug)
            if gate is None:
                probs.append(f'new: gate.mjs failed: {err}')
            elif gate['verdict'] != 'new' and gate.get('owningSlug') != post.slug:  # its own registry entry is fine
                probs.append(f'new: the gate says {gate["verdict"]} against {bl.describe_db(db)}: {gate["reason"]}')
            # A warning is a secondary keyword or owned query another page owns:
            # publishing it would claim that page's query (and code-changes.md
            # would paste it into the registry). checks.check() reports the same
            # lines; this keeps the build's own gate run authoritative.
            for w in (gate or {}).get('warnings', []):
                x = f'new: gate: {w}'
                if x not in probs:
                    probs.append(x)
            saved = m.get('gate') or {}
            p['planning'] = {
                'topic': p['title'], 'targetAudience': m.get('reader'), 'contentType': 'claude-blog-post',
                'createdBy': bl.REVISION_REASON, 'cluster': m.get('cluster'), 'ownsQueries': p['owns'],
                'ideationGate': {k: saved.get(k) for k in ('verdict', 'reason', 'owningUrl', 'claimedQueries', 'checkedAt')},
            }
        built.append(p)

    if not a.no_mdx and built:
        mdx = checks.mdx_validate({p['slug']: bl.PLACEHOLDER_RX.sub('https://example.public.blob.vercel-storage.com/x.jpg', p['content']) for p in built})
        for p in built:
            if mdx is None:
                problems[p['slug']].append('validateGeneratedMdx did not run (node + tsx); pass --no-mdx to skip')
            elif not mdx[p['slug']]['clean']:
                problems[p['slug']].extend(f'MDX: {x["kind"]}: {x["detail"]}' for x in mdx[p['slug']]['actions'])

    bad = {s: x for s, x in problems.items() if x}
    for s in skipped:
        print(f'  skip     [{s}] already live: the database row matches the post')
    if bad:
        for s, xs in bad.items():
            print(f'\n[FAIL] {s}')
            for x in xs:
                print(f'  PROBLEM  {x}')
        print(f'\n{len(bad)} post(s) fail; nothing written')
        return 1
    if a.check:
        print(f'--check: {len(built)} post(s) pass every check against {bl.describe_db(db)}; nothing written')
        return 0
    if not built:
        print('nothing to build')
        return 0

    out.mkdir(parents=True, exist_ok=True)
    names = []
    for n, p in enumerate(built, 1):
        p['file'] = f'{n:02d}-{p["slug"]}.sql'
        sql = rewrite_sql(p, a.create_tags) if p['mode'] == 'rewrite' else new_sql(p, a.create_tags)
        (out / p['file']).write_text(sql, encoding='utf-8')
        names.append(p['file'])
        if p['mode'] == 'rewrite':
            (out / f'undo-{p["file"]}').write_text(undo_sql(p), encoding='utf-8')
            names.append(f'undo-{p["file"]}')
    stale = sorted(x.name for x in [*out.glob('[0-9][0-9]-*.sql'), *out.glob('undo-[0-9][0-9]-*.sql')] if x.name not in names)

    backup = {p['slug']: ({'mode': 'rewrite', **{k: p['state'][k] for k in ('row', 'refresh', 'working_copies', 'categories', 'tags',
                                                                           'category_ids', 'tag_ids', 'image_links')}}
                          if p['mode'] == 'rewrite' else {'mode': 'new', 'id': p['id'], 'row': None})
              for p in built}
    (out / 'backup.json').write_text(json.dumps(backup, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (out / 'build-info.json').write_text(json.dumps({
        'database': bl.describe_db(db), 'built_at': dt.datetime.now().isoformat(timespec='seconds'),
        'manifest': str(Path(a.manifest) if a.manifest else bl.MANIFEST), 'files': names,
    }, indent=1) + '\n', encoding='utf-8')

    # The code PR that goes with the SQL.
    v2 = set(re.findall(r"'([a-z0-9-]+)'", (bl.REPO / 'apps/web/lib/blog/blog-v2.constant.ts').read_text().split('BLOG_V2_SLUGS', 1)[1].split('])', 1)[0]))
    test = (bl.REPO / 'apps/admin/__tests__/lib/seo/keyword-ownership.test.ts').read_text()
    count = re.search(r'expect\(liveBlog\.length\)\.toBe\((\d+)\)', test)
    news = [p for p in built if p['mode'] == 'new']
    md = ['# Code changes for this build', '',
          'Two parts: the v2 line goes in BEFORE the production run; the registry and the count go in AFTER it '
          '(slug_check.mjs treats a registry entry as a collision, so a registry entry for a post that is not live '
          'yet would fail its own build). The post files, blog/images/*.json and blog/plan.json go in the PR always.', '']
    not_v2 = [p['slug'] for p in built if p['slug'] not in v2]
    author_claims = author_page_claims()
    if author_claims:
        md += ['## Before the production run: the author page every post links (the user decides)', '',
               'Every post, v2 included, names `/blog/authors/editorial-team` as its author: the BlogPosting JSON-LD '
               '`author.url` and the byline link. That page renders the editorial-team entry, which says what '
               'compliance.md forbids and the blog does not have (no surgeon writes or reviews the posts; there is no '
               'medical reviewer):', '',
               *[f'- `{x}`' for x in author_claims], '',
               'Propose a neutral rewrite of that entry (who writes the posts and from which sources, no credentials, '
               'no review board, no HIPAA certificate) in the same pre-run PR as the v2 line below, so the user '
               'decides both together. Leaving it publishes the post with an author page that contradicts it.', '']
    if not_v2:
        md += ['## Before the production run: the v2 template (the user decides)', '',
               'These posts render the old template, whose sidebar says "board-certified surgeons" and "5,000+ Happy '
               'Patients", unless their slugs join BLOG_V2_SLUGS in apps/web/lib/blog/blog-v2.constant.ts:', '',
               *[f'- `{s}`' for s in not_v2], '',
               'Merge and deploy that line before the SQL runs: isBlogV2 is a Set lookup, so listing a slug before its '
               'row exists is harmless. Declining v2 publishes the post next to claims compliance.md forbids.', '']
    if news:
        md += ['## After the production run: keyword registry, one live entry per new post', '',
               'packages/shared/src/seo/keyword-ownership-blog.constant.ts, in BLOG_POST_ENTRIES:', '', '```ts',
               *[registry_entry(p) for p in news], '```', '',
               '## After the production run: the live-post count', '',
               f'apps/admin/__tests__/lib/seo/keyword-ownership.test.ts: `toBe({count.group(1) if count else "?"})` -> '
               f'`toBe({int(count.group(1)) + len(news) if count else "?"})`, and add the new slugs to the comment. '
               'Run `pnpm --filter admin test`.', '']
    reg = (bl.REPO / 'packages/shared/src/seo/keyword-ownership-blog.constant.ts').read_text()
    for p in built:
        if p['mode'] == 'rewrite':
            mm = re.search(r"slug:\s*'" + re.escape(p['slug']) + r"'(.*?)\n    \}", reg, re.S)
            body = mm.group(1) if mm else ''
            oq = re.search(r'ownsQueries:\s*\[(.*?)\]', body, re.S)
            have = set(re.findall(r"'([^']+)'", oq.group(1))) if oq else set()
            pk = re.search(r"primaryKeyword:\s*'((?:\\.|[^'])*)'", body)
            reg_pk = pk.group(1).replace("\\'", "'") if pk else None
            add = [q for q in p['owns'] if q not in have]
            want_pk = p['primary'].lower()
            if not mm:
                md += [f'## Registry entry for {p["slug"]}', '', 'No entry in keyword-ownership-blog.constant.ts: add one '
                       '(the shape is in publishing.md section 7), with:', '',
                       f'- primaryKeyword: "{want_pk}"', *[f'- ownsQueries: "{q}"' for q in p['owns']], '']
                continue
            if add or reg_pk != want_pk:
                md += [f'## Registry entry for {p["slug"]}', '']
                if reg_pk != want_pk:
                    md += [f'- primaryKeyword: "{reg_pk}" -> "{want_pk}" (meta.json primary_keyword, lowercased)']
                if add:
                    md += ['- ownsQueries the entry lacks (from meta.json owns_queries):', *[f'  - "{q}"' for q in add]]
                md += ['']
    md += ['## After each SQL file', '', '```bash',
           *[f'bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-{p["slug"]}' for p in built], '```', '']
    (out / 'code-changes.md').write_text('\n'.join(md), encoding='utf-8')

    for p in built:
        print(f"{p['file']:52} {p['mode']:7} words={p['words']:5} rt={p['reading_time']:2} faqs={len(p['faqs'])} "
              f"imgs={len(p['images'])} cats={len(p['categories'])} tags={len(p['tags'])}")
    if stale:
        print(f'note: {out} also holds SQL from an earlier build, not rewritten now: {stale}')
    print(f'wrote {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
