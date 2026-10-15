#!/usr/bin/env python3
"""Read the live row a rewrite starts from, and record its md5 as meta.json "base_md5".

    python3 blog/tools/rewrite_base.py <slug> --db <URL|env:NAME|local> [--out FILE]
                                       [--save [--rebase [--old FILE]]]

A rewrite starts from the text that is live on production now. This reads the
post's row from --db (production, with the user's OK for the read, or a
throwaway copy filled from production today: publishing.md section 1) and
prints its md5 and the database.

--out FILE   writes the live content to FILE (the text you start from; keep it
             in the scratchpad) and, next to it, FILE.row.json: everything else
             the row holds that the rewrite must carry or decide on: title,
             meta_title, meta_description, excerpt, quick_answer, the `faqs`
             column, primary and secondary keywords, category and tag names,
             published_at and the live path, and the featured and inline images
             as meta.json "images" entries with "reuse_url" set (keep those
             that still meet the image rules). The faqs column is not in the
             content: build_sql.py replaces it with the FAQ section of
             content.md, so carry every live FAQ you keep into that section.
--save       records in blog/posts/<slug>/meta.json:
                 "base_md5":  md5 of the row's content (what build_sql.py compares)
                 "base_from": "<host:port/db> <UTC time of the read>"
             and keeps the text under blog/posts/<slug>/.base/<md5>.md
             (gitignored), so a later re-read can show what changed.
--rebase     (with --save) replace a different base_md5. Without it --save
             refuses: the live text moved since the last read, and replacing
             the base silently would let the rewrite overwrite that change.
             With it, the tool finds the previous base text (.base/<old md5>.md,
             else --old FILE, else a blog_post_revision row in --db with that
             md5), prints the unified diff from it to the live text, writes the
             diff to .base/<old>-to-<new>.diff, and saves the new base. Merge
             every hunk into content.md (and meta.json) before building again.
--old FILE   (with --rebase) the previous base text, when .base/ doesn't have
             it (an older read, another machine). Its md5 must be the old
             base_md5.

build_sql.py refuses a rewrite unless the target row's md5(content) is
base_md5 (or already the new content): a rewrite started from older text
never overwrites a newer row ("production changed since you read it"). After
the production run, run this again against production with --save: when the
live row is this post's own built content, base_md5 moves to it without
--rebase (publishing.md section 9).

--save refuses the shared dev database (alluring-autopilot-dev, which is
`--db local` in the main checkout): it is a weeks-old copy, never a rewrite
base. Without --save the tool only reads. When meta.json doesn't exist yet,
--save starts it with slug, mode "rewrite" and the base fields; Phase 3 writes
the rest.

Exit 0 on success, 1 when the post isn't there, --save is refused (the shared
dev database, or a moved base without --rebase), or the old base text can't
be found.
"""

from __future__ import annotations

import argparse
import difflib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import bloglib as bl  # noqa: E402


def read_row(db: str, slug: str) -> dict | None:
    return bl.psql_json(db, f"""
SELECT json_build_object(
  'id', b.id, 'status', b.status, 'content', coalesce(b.content, ''), 'md5', md5(coalesce(b.content, '')),
  'database', current_database(),
  'read_at', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'title', b.title, 'meta_title', b.meta_title, 'meta_description', b.meta_description, 'excerpt', b.excerpt,
  'quick_answer', b.quick_answer, 'faqs', b.faqs, 'primary_keyword', b.primary_keyword,
  'secondary_keywords', b.secondary_keywords, 'published_at', b.published_at,
  'content_updated_at', b.content_updated_at,
  'categories', (SELECT coalesce(json_agg(c.name ORDER BY c.name), '[]') FROM blog_post_category pc
                   JOIN blog_category c ON c.id = pc.category_id WHERE pc.blog_post_id = b.id),
  'tags', (SELECT coalesce(json_agg(t.name ORDER BY t.name), '[]') FROM blog_post_tag pt
             JOIN blog_tag t ON t.id = pt.tag_id WHERE pt.blog_post_id = b.id),
  'featured', (SELECT json_build_object('url', i.url, 'alt', i.alt, 'width', i.width, 'height', i.height,
                                        'prompt', i.generation_prompt)
                 FROM images i WHERE i.id = b.featured_image_id),
  'linked', (SELECT coalesce(json_agg(json_build_object('url', i.url, 'alt', i.alt, 'image_type', pi.image_type,
                                                        'width', i.width, 'height', i.height,
                                                        'prompt', coalesce(pi.prompt, i.generation_prompt))
                                      ORDER BY i.url), '[]')
               FROM blog_post_images pi JOIN images i ON i.id = pi.image_id WHERE pi.blog_post_id = b.id)
) FROM blog_post b WHERE b.slug = {bl.lit(slug)} AND b.refresh_of_post_id IS NULL""")


def image_entries(db: str, row: dict) -> list[dict]:
    """The row's featured and inline images as meta.json "images" entries with reuse_url set."""
    out: list[dict] = []
    seen: set[str] = set()
    content_urls = [u for _, u in bl.IMAGE_RX.findall(row['content'] or '')]
    in_content = set(content_urls)

    def aspect(w, h) -> str | None:
        if not w or not h:
            return None
        r = w / h
        return min(('3:2', 1.5), ('4:5', 0.8), ('16:9', 16 / 9), ('1:1', 1.0), ('2:3', 2 / 3),
                   key=lambda a: abs(a[1] - r))[0]

    feat = row.get('featured')
    if feat and feat.get('url'):
        seen.add(feat['url'])
        out.append({'key': 'hero', 'type': 'featured', 'aspect': aspect(feat.get('width'), feat.get('height')),
                    'alt': feat.get('alt') or '', 'prompt': feat.get('prompt') or '', 'reuse_url': feat['url'],
                    'images_row': True, 'in_content': feat['url'] in in_content})
    n = 0
    linked = {i['url']: i for i in row.get('linked') or []}
    rows = bl.reused_image_rows(db, [u for u in content_urls if u not in linked and u.startswith('http')])
    for url in [*linked, *content_urls]:
        if url in seen:
            continue
        seen.add(url)
        li = linked.get(url) or {}
        if li.get('image_type') == 'featured' and not out:
            key, typ = 'hero', 'featured'
        else:
            n += 1
            key, typ = f'inline-{n}', 'inline'
        alt = li.get('alt')
        if alt is None:
            alt = next((a for a, u in bl.IMAGE_RX.findall(row['content'] or '') if u == url), '')
        r = rows.get(url) or {}
        out.append({'key': key, 'type': typ, 'aspect': aspect(li.get('width') or r.get('width'), li.get('height') or r.get('height')),
                    'alt': alt or '', 'prompt': li.get('prompt') or r.get('generation_prompt') or '', 'reuse_url': url,
                    'images_row': bool(li) or url in rows, 'in_content': url in in_content})
    return out


def write_sidecar(path: Path, db: str, slug: str, row: dict) -> dict:
    faqs = row.get('faqs') or []
    in_content = bl.parse_faqs(row['content'] or '')
    pa = row.get('published_at') or ''
    side = {
        '_about': ('The live row a rewrite starts from (rewrite_base.py --out). Carry what you keep into meta.json and '
                   'content.md: build_sql.py replaces title, meta_title (= title), meta_description, excerpt, '
                   'quick_answer, faqs (from the FAQ section of content.md), primary and secondary keywords and the '
                   'featured image, and adds (never removes) categories and tags. A rewrite keeps primary_keyword = '
                   'the registry primaryKeyword. images[] are meta.json entries with reuse_url set: keep those that '
                   'still meet the image rules (an entry needs images_row true), drop the helper keys images_row and '
                   'in_content, and give each kept inline image an ![alt](IMAGE:key) in the body.'),
        'slug': slug,
        'read_from': bl.describe_db(db),
        'read_at': row['read_at'],
        'md5': row['md5'],
        'status': row['status'],
        'published_at': pa or None,
        'path': ('/blog/' if pa >= '2026' else '/') + slug,
        'content_updated_at': row.get('content_updated_at'),
        'title': row.get('title'),
        'meta_title': row.get('meta_title'),
        'meta_description': row.get('meta_description'),
        'excerpt': row.get('excerpt'),
        'quick_answer': row.get('quick_answer'),
        'primary_keyword': row.get('primary_keyword'),
        'secondary_keywords': row.get('secondary_keywords') or [],
        'categories': row.get('categories') or [],
        'tags': row.get('tags') or [],
        'faqs_column': len(faqs),
        'faqs_in_content': len(in_content),
        'faqs': faqs,
        'images': image_entries(db, row),
    }
    path.write_text(json.dumps(side, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return side


def built_md5(slug: str) -> str | None:
    """md5 of this post's content as build_sql.py would write it, or None when it can't be built."""
    d = bl.POSTS / slug
    if not (d / 'content.md').exists() or not (d / 'meta.json').exists():
        return None
    try:
        post = bl.load_post(slug)
        content, _, problems = bl.apply_images(post, bl.load_manifest(), placeholder_ok=False)
    except Exception:  # noqa: BLE001 - a half-written post is simply "not built"
        return None
    return None if problems else bl.md5(content)


def old_base_text(db: str, row: dict, base_dir: Path, old: str, old_file: str | None) -> tuple[str | None, str]:
    f = base_dir / f'{old}.md'
    if f.exists():
        return f.read_text(encoding='utf-8'), str(f)
    if old_file:
        text = Path(old_file).read_text(encoding='utf-8')
        if bl.md5(text) != old:
            bl.die(f'--old {old_file}: its md5 is {bl.md5(text)}, not the old base_md5 {old}')
        return text, old_file
    rev = bl.psql_json(db, (
        "SELECT json_build_object('content', content, 'reason', reason, 'created_at', created_at) "
        f"FROM blog_post_revision WHERE blog_post_id = {bl.lit(row['id'])} AND md5(coalesce(content, '')) = {bl.lit(old)} "
        "ORDER BY created_at DESC LIMIT 1"))
    if rev:
        return rev['content'] or '', f'blog_post_revision ({rev["reason"]}, {rev["created_at"]}) in {bl.describe_db(db)}'
    return None, ''


def main() -> int:
    sys.stdout.reconfigure(line_buffering=True)  # keep stdout and stderr lines in order
    ap = argparse.ArgumentParser(description='Record the live row a rewrite starts from (meta.json base_md5).')
    ap.add_argument('slug')
    ap.add_argument('--db', required=True)
    ap.add_argument('--out')
    ap.add_argument('--save', action='store_true')
    ap.add_argument('--rebase', action='store_true')
    ap.add_argument('--old')
    a = ap.parse_args()
    if a.rebase and not a.save:
        ap.error('--rebase needs --save')
    if a.old and not a.rebase:
        ap.error('--old needs --rebase')

    db = bl.resolve_db(a.db)
    row = read_row(db, a.slug)
    if not row:
        bl.die(f'{a.slug}: no row in {bl.describe_db(db)}')
    print(f'{a.slug}: {row["status"]}, md5 {row["md5"]}, {len(row["content"])} characters, read from {bl.describe_db(db)} at {row["read_at"]}')
    if row['status'] != 'published':
        print(f'  note: the row is {row["status"]}, not published; a rewrite needs a live post', file=sys.stderr)
    stale = row['database'] == bl.SHARED_DEV_DB
    if stale:
        print(f'  warning: {bl.SHARED_DEV_DB} is the weeks-old local copy, not production: never a rewrite base',
              file=sys.stderr)

    if a.out:
        out = Path(a.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(row['content'], encoding='utf-8')
        side_path = Path(str(out) + '.row.json')
        side = write_sidecar(side_path, db, a.slug, row)
        print(f'  live text written to {out}')
        print(f'  the rest of the row written to {side_path}: {side["faqs_column"]} FAQs in the faqs column '
              f'({side["faqs_in_content"]} in the content), {len(side["categories"])} categories, {len(side["tags"])} tags, '
              f'{len(side["images"])} image(s), published {side["published_at"]} at {side["path"]}')
        if side['faqs_column'] and side['faqs_column'] != side['faqs_in_content']:
            print('  note: the faqs column holds FAQs the content does not. build_sql.py replaces that column with '
                  'the FAQ section of content.md: carry every live FAQ you keep into it', file=sys.stderr)

    if a.save:
        if stale:
            bl.die(f'--save refused: read the base from production (the user\'s OK) or a production-filled copy, '
                   f'not {bl.SHARED_DEV_DB}')
        f = bl.POSTS / a.slug / 'meta.json'
        if f.exists():
            meta = json.loads(f.read_text(encoding='utf-8'))
        else:
            f.parent.mkdir(parents=True, exist_ok=True)
            meta = {'slug': a.slug, 'mode': 'rewrite'}
        base_dir = f.parent / '.base'
        old = (meta.get('base_md5') or '').strip().lower()
        new = row['md5']
        if old and old != new:
            if built_md5(a.slug) == new:
                print(f'  the live row is this post\'s own content (published): base_md5 {old} -> {new}')
            elif not a.rebase:
                print(f'  REFUSED: meta.json base_md5 is {old}, but the live row is now {new}: the live text changed '
                      'since the rewrite was started from it (an admin edit, a fold\'s link repoint, autopilot).\n'
                      '  Nothing saved. Re-run with --rebase to see the diff from the old base to the live text, merge '
                      'every hunk into content.md (and meta.json), then build again.', file=sys.stderr)
                return 1
            else:
                text, where = old_base_text(db, row, base_dir, old, a.old)
                if text is None:
                    bl.die(f'--rebase: the text of the old base {old} is not in {base_dir}/ '
                           f'nor in blog_post_revision in {bl.describe_db(db)}. Find it (the --out file of that read, or '
                           f'the database it was read from: rewrite_base.py {a.slug} --db <that database> --out <file>) and '
                           'pass --old <file>, so the diff shows what changed')
                diff = ''.join(difflib.unified_diff(
                    text.splitlines(keepends=True), row['content'].splitlines(keepends=True),
                    fromfile=f'base {old} ({where})', tofile=f'live {new} ({bl.describe_db(db)} {row["read_at"]})'))
                base_dir.mkdir(parents=True, exist_ok=True)
                (base_dir / f'{old}-to-{new}.diff').write_text(diff, encoding='utf-8')
                print(f'  --rebase: what changed since the base this rewrite started from '
                      f'(also in {base_dir / f"{old}-to-{new}.diff"}):\n')
                print(diff or '  (no line changes: only whitespace at the end of the text)')
                print('  Merge every hunk above into content.md (and meta.json), then build again.', file=sys.stderr)
        base_dir.mkdir(parents=True, exist_ok=True)
        (base_dir / f'{new}.md').write_text(row['content'], encoding='utf-8')
        meta['base_md5'] = new
        meta['base_from'] = f'{bl.describe_db(db)} {row["read_at"]}'
        f.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        print(f'  saved base_md5 {new} to blog/posts/{a.slug}/meta.json (text kept in .base/{new}.md)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
