"""Build the Phase 1 content SQL for the liposuction blog fold.

Reads the current rows from the database you point it at, applies the edits
below (each must match exactly once), and writes:

  sql/03-merge-and-links.sql        before the deploy: merges three folded
                                    posts into their survivors and repoints
                                    inbound links in surviving posts
  sql/04-delete-folded.sql          after the deploy: deletes the 8 folded posts
  sql/04-folded-backup.json         the rows 04 deletes, and their linked rows

Build and apply against the worktree's cloned database first, then rebuild
against production right before the run and diff the two outputs:

  python3 build_sql.py "$POSTGRES_URL" sql
  python3 build_sql.py "$POSTGRES_URL_PROD" /tmp/prod-sql && diff -r sql /tmp/prod-sql

Every UPDATE is guarded by the md5 of the content it was built from, so a post
edited in between makes the transaction fail instead of overwriting the edit.
"""

import hashlib
import json
import math
import re
import subprocess
import sys
from pathlib import Path

DB_URL, OUT = sys.argv[1], Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

# Folded slug -> 308 destination (mirrors apps/web/next.config.mjs).
FOLDED = {
    'when-to-start-lymphatic-massage-after-lipo': '/how-many-massages-after-lipo-360',
    'liposuction-recovery-time-miami': '/how-to-reduce-swelling-after-liposuction',
    'what-is-the-difference-between-tummy-tuck-and-liposuction': '/blog/tummy-tuck-vs-liposuction',
    'liposuction-candidate-miami': '/procedures/liposuction-miami',
    'liposuction-miami-post-pregnancy-guide': '/procedures/liposuction-miami',
    'liposuction-miami-moms-tips': '/procedures/liposuction-miami',
    'how-to-maintain-liposuction-results': '/procedures/liposuction-miami',
    'liposuction-vs-breast-augmentation-miami': '/procedures/mommy-makeover-miami',
}
# Old aliases that already 308 to a folded post.
ALIASES = ['liposuction-candidate-checklist-miami', 'liposuction-miami-moms-faq']

SURGEON = (
    'Victoria Karlinsky, MD, FACS. She is board certified in general surgery by '
    'the American Board of Surgery and is a Fellow of the American College of Surgeons.'
)
PAGE_LINK = '[liposuction in Miami](/procedures/liposuction-miami)'

# --------------------------------------------------------------------------
# Merges: survivor slug -> content edits, FAQ answer replacements, new FAQs.
# FAQ questions are matched exactly.
# --------------------------------------------------------------------------

MASSAGE_SECTIONS = """## What Happens During a Lymphatic Massage Session?

A trained therapist uses **light, rhythmic strokes** that follow your lymph pathways toward the lymph nodes. There is no deep pressure and it shouldn't hurt: deep tissue massage is a different technique and isn't appropriate over healing tissue. Many patients find the sessions relaxing.

Your therapist may also show you simple techniques to use between sessions, if your surgeon approves them. At home, you can support drainage by:

- **Wearing your compression garment** as your surgeon directs.
- **Staying hydrated.**
- **Walking gently** every day to keep fluid moving.
- **Self-massaging only with your surgeon's approval.**

## Who Should Not Have Lymphatic Massage?

Lymphatic massage isn't right for everyone. It may not be suitable if you have **congestive heart failure, kidney disease, an active infection or a blood clot**. Tell your surgeon about any of these before your first session, and don't start until your surgeon clears you.

## How Do You Choose a Lymphatic Drainage Therapist?

- **Ask your surgeon first.** Many surgeons work with therapists they trust.
- **Look for training in manual lymphatic drainage (MLD)**, such as the Vodder or Földi method, and experience with patients after surgery.
- **Check their availability.** Your first sessions follow your surgeon's schedule, so the therapist needs to be able to see you then.
- **Read reviews** and make sure you feel comfortable before you book a series.

## Learn More About Lipo 360 Surgery in Miami"""

SWELLING_TIMELINE = """## How Long Does Swelling Last After Liposuction? Week by Week

Swelling after liposuction follows a predictable curve. The figures below come from [The Aesthetic Society](https://www.theaestheticsociety.org/procedures/body/liposuction/aftercare-recovery), [Cleveland Clinic](https://my.clevelandclinic.org/health/treatments/11009-liposuction), [ASPS](https://www.plasticsurgery.org/cosmetic-procedures/liposuction/recovery) and [MedlinePlus](https://medlineplus.gov/ency/article/002985.htm). Your surgeon will adjust them to the areas you had treated.

### The first 48 hours: swelling peaks

Swelling **peaks around 48 hours** after surgery. You'll be sore and tired, and you'll wear your compression garment. Walk as soon as you can: MedlinePlus advises walking early to help prevent blood clots in your legs.

### The first 10 days: bruising fades

Bruising typically **fades within 7 to 10 days**, and most people are back to most of their normal activities **within 10 days or less**.

### Weeks 2 to 3: most of the swelling is gone

Swelling **mostly goes down within 2 to 3 weeks**. When you go back to work depends on your job: The Aesthetic Society says most people return **within a few days**, and the ASPS recovery timeline puts it at **weeks 2 to 3**.

### Weeks 4 to 6: the compression garment comes off

You wear your compression garment for **4 to 6 weeks** and avoid strenuous exercise for as long. For the details, see [when you can work out after liposuction](/how-long-after-lipo-can-i-workout).

### Up to 4 months: slight swelling settles

**Slight swelling can last up to 4 months**, so your shape keeps refining after you feel recovered.

### Months 3 to 6: your final result

Cleveland Clinic says it can take **3 to 6 months** for swelling to go away completely before you see your final result.

### When to call your surgeon

Call your surgeon right away if swelling becomes excessive, gets suddenly worse or stops improving, or if you have a fever, spreading redness, pus, or severe pain your medication doesn't relieve. These can be signs of infection or a fluid collection (seroma). Shortness of breath or chest pain is an emergency: call 911.

## Learn More About Liposuction Surgery in Miami"""

MERGES = {
    'how-many-massages-after-lipo-360': {
        'folded': 'when-to-start-lymphatic-massage-after-lipo',
        'edits': [
            ('## Learn More About Lipo 360 Surgery in Miami', MASSAGE_SECTIONS),
            (
                "At **Alluring Plastic Surgery** in Miami, our **board-certified surgeons** specialize in transformative Lipo 360 procedures that contour your entire midsection with precision and artistry. Our Miami-based experts understand the unique aesthetic goals of each patient, creating **customized treatment plans** that deliver natural-looking results while prioritizing your safety and comfort. Experience renewed confidence with a beautifully sculpted silhouette from Miami's trusted name in body contouring.",
                f"At **Alluring Plastic Surgery** in Miami, every Lipo 360 is performed by one surgeon, {SURGEON} See what Lipo 360 involves, what it costs and what recovery looks like on our {PAGE_LINK} page.",
            ),
        ],
        'faq_answers': {
            'Is lymphatic drainage massage safe after Lipo 360?': (
                'When a trained therapist does it at the time your surgeon approves, lymphatic drainage '
                'is a routine part of post-op care. It may not be suitable if you have congestive heart '
                'failure, kidney disease, an active infection or a blood clot, so tell your surgeon about '
                'any of these before you start.'
            ),
        },
        'faq_new': [
            (
                'What happens during a lymphatic massage session after lipo?',
                'A trained therapist uses light, rhythmic strokes to move lymph fluid toward the lymph '
                "nodes, with no deep pressure. It shouldn't hurt, and your therapist may show you "
                'techniques to use at home if your surgeon approves them.',
            ),
            (
                'How do I choose a lymphatic drainage therapist after liposuction?',
                'Ask your surgeon for a referral first. Then look for a therapist trained in manual '
                'lymphatic drainage, such as the Vodder or Földi method, who works with patients after '
                'surgery and can see you on the schedule your surgeon sets.',
            ),
        ],
        'content_faqs': False,
    },
    'how-to-reduce-swelling-after-liposuction': {
        'folded': 'liposuction-recovery-time-miami',
        'edits': [
            (
                "Your body's **inflammatory response** peaks within 72 hours after liposuction, causing tissue swelling that gradually subsides over several weeks.",
                'Swelling **peaks around 48 hours** after liposuction and then goes down gradually, most of it within 2 to 3 weeks, according to The Aesthetic Society.',
            ),
            (
                'The inflammation **peaks within 72 hours**, then gradually **subsides over subsequent weeks**.',
                'Swelling **peaks around 48 hours** after surgery, then gradually **goes down over the following weeks**.',
            ),
            (
                'Your surgeon will provide instructions regarding how long to wear the garment—typically for **several weeks**—to support ideal healing.',
                'Your surgeon will tell you how long to wear it. The Aesthetic Society puts it at **4 to 6 weeks**.',
            ),
            # The old swelling section (72-hour peak, 6-9 months, and a graphic
            # carrying those figures) becomes the week-by-week timeline.
            (re.compile(r'## How Long Does Swelling Last After Liposuction\?\n.*?## Learn More About Liposuction Surgery in Miami', re.S), SWELLING_TIMELINE),
            (
                re.compile(r"At \*\*Alluring Plastic Surgery\*\* in Miami, our board-certified surgeons specialize.*?throughout your entire transformation journey\.", re.S),
                f'At **Alluring Plastic Surgery** in Miami, every liposuction is performed by one surgeon, {SURGEON} See how liposuction works, what Lipo 360 costs and what recovery involves on our {PAGE_LINK} page.',
            ),
        ],
        'faq_answers': {
            'How long does swelling last after liposuction?': (
                'Swelling peaks around 48 hours after surgery and mostly goes down within 2 to 3 weeks, '
                'according to The Aesthetic Society, though slight swelling can last up to 4 months. '
                'Cleveland Clinic says it can take 3 to 6 months for it to go away completely before you '
                'see your final result.'
            ),
        },
        'faq_new': [
            (
                'When can I go back to work after liposuction?',
                'It depends on your job. The Aesthetic Society says most people return to work within a '
                'few days, and the ASPS recovery timeline puts it at weeks 2 to 3. Most people are back to '
                'most of their normal activities within 10 days.',
            ),
        ],
        'content_faqs': False,
    },
    'tummy-tuck-vs-liposuction': {
        'folded': 'what-is-the-difference-between-tummy-tuck-and-liposuction',
        'edits': [
            (' See our related post on [tummy tuck vs liposuction differences](/what-is-the-difference-between-tummy-tuck-and-liposuction).', ''),
            (' in an accredited facility like ours.', '.'),
            ('Board-certified surgeons assess these factors during your consultation.', 'Your surgeon assesses these factors at your consultation.'),
            (
                re.compile(r'At Alluring, \[Dr\. Victoria Karlinsky\]\([^)]*\), a triple board-certified cosmetic surgeon.*?from virtual consults to recovery guidance\.', re.S),
                f'At Alluring, every tummy tuck and liposuction is performed by one surgeon, {SURGEON} We offer bilingual support and virtual consultations, and plan each procedure around your post-pregnancy goals.',
            ),
            (' Safety is always prioritized in accredited settings.', ''),
            ('Both have low risks (e.g., infection, seroma) when performed by board-certified surgeons.', 'Both have low risks (e.g., infection, seroma).'),
            (
                "At Alluring Plastic Surgery, Dr. Karlinsky's expertise and our AAAASF facility ensure premium, personalized care in Miami.",
                'At Alluring Plastic Surgery in Miami, Dr. Karlinsky plans and performs every procedure herself.',
            ),
        ],
        'faq_answers': {
            'Can I combine tummy tuck and liposuction?': (
                'Yes, many moms choose to combine these procedures in a mommy makeover for both fat '
                'sculpting and skin and muscle tightening. This comprehensive approach maximizes results.'
            ),
            'What are the risks of each procedure?': (
                'Both procedures have low risks, such as infection or seroma. Tummy tucks carry a slightly '
                'higher risk due to their extent, including blood clots (about 4% major risk per ASPS), but '
                'pre-op screening helps minimize potential issues.'
            ),
        },
        'faq_new': [
            (
                'What is the difference between a tummy tuck and liposuction?',
                'A tummy tuck removes excess skin and fat and can tighten separated abdominal muscles. '
                "Liposuction removes fat through small incisions, but it doesn't tighten skin, as The "
                'Aesthetic Society notes, so it suits firm skin with a pocket of stubborn fat.',
            ),
            (
                'Will a tummy tuck or liposuction leave a scar?',
                'A tummy tuck leaves a longer scar across the lower abdomen. Liposuction leaves only small '
                'scars where the thin tube used to remove fat goes in.',
            ),
            (
                'How do I know which procedure is right for me?',
                'If loose skin or separated muscles bother you, a tummy tuck treats them and liposuction '
                'does not. If your skin is firm and your concern is a pocket of fat, liposuction may be '
                'enough. Many people need both, which your surgeon can tell you at a consultation.',
            ),
        ],
        # This 2026 post repeats its FAQs in the body, before this closing line.
        'content_faqs': 'The journey to reclaiming your pre-pregnancy confidence',
    },
}

# Surviving posts whose only change is a link to a folded post.
LINK_ONLY = {
    'tummy-tuck-myths-miami-moms': [
        ('](/what-is-the-difference-between-tummy-tuck-and-liposuction)', '](/blog/tummy-tuck-vs-liposuction)'),
    ],
    'liposuction-recovery-ozempic-miami': [
        (
            'Learn more in our [Am I a Candidate for Liposuction in Miami?](/blog/liposuction-candidate-miami) guide.',
            'See who is a good candidate on our [liposuction in Miami](/procedures/liposuction-miami#candidate) page.',
        ),
        (
            'Pair with our [Liposuction Miami: Ultimate FAQ for Post-Pregnancy Moms](/blog/liposuction-miami-moms-tips)',
            'Pair with our [liposuction swelling and recovery timeline](/how-to-reduce-swelling-after-liposuction)',
        ),
    ],
}


def psql_json(sql):
    out = subprocess.run(
        ['psql', DB_URL, '-X', '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    return json.loads(out) if out else None


def lit(s):
    return "'" + s.replace("'", "''") + "'"


def dollar(tag, s):
    assert f'${tag}$' not in s
    return f'${tag}${s}${tag}$'


def md5(s):
    return hashlib.md5(s.encode('utf-8')).hexdigest()


def words(content):
    prose = re.sub(r'\]\([^)]*\)', ']', content)
    prose = re.sub(r'!\[[^\]]*\]', ' ', prose)
    return len([w for w in re.split(r'\s+', prose) if re.search(r'[A-Za-z0-9]', w)])


def apply_edits(slug, content, edits):
    for old, new in edits:
        if isinstance(old, re.Pattern):
            n = len(old.findall(content))
            assert n == 1, f'{slug}: pattern {old.pattern[:60]!r} matched {n} times'
            content = old.sub(lambda _: new, content)
        else:
            n = content.count(old)
            assert n == 1, f'{slug}: {old[:60]!r} matched {n} times'
            content = content.replace(old, new)
    return content


slugs = list(MERGES) + list(LINK_ONLY)
rows = psql_json(
    "SELECT json_agg(row_to_json(t)) FROM (SELECT id, slug, status, content, faqs, "
    "content_updated_at FROM blog_post WHERE refresh_of_post_id IS NULL AND slug IN ("
    + ','.join(lit(s) for s in slugs) + ')) t'
)
posts = {r['slug']: r for r in rows}
assert set(posts) == set(slugs), set(slugs) - set(posts)
for r in rows:
    assert r['status'] == 'published', r['slug']

folded_pattern = '(' + '|'.join(re.escape(s) for s in list(FOLDED) + ALIASES) + r')([^a-z0-9-]|$)'

updates = []
for slug, spec in MERGES.items():
    p = posts[slug]
    content = apply_edits(slug, p['content'], spec['edits'])
    faqs = [dict(f) for f in p['faqs']]
    for q, a in spec['faq_answers'].items():
        hits = [f for f in faqs if f['question'] == q]
        assert len(hits) == 1, f'{slug}: FAQ {q!r} found {len(hits)} times'
        old_answer = hits[0]['answer']
        hits[0]['answer'] = a
        if spec['content_faqs']:
            # The body copy of the FAQ is worded differently; its edits are in 'edits'.
            pass
    existing = {f['question'] for f in faqs}
    for q, a in spec['faq_new']:
        assert q not in existing, f'{slug}: FAQ {q!r} already exists'
        faqs.append({'question': q, 'answer': a})
    if spec['content_faqs']:
        block = ''.join(f'### {q}\n\n{a}\n\n' for q, a in spec['faq_new'])
        content = apply_edits(slug, content, [(spec['content_faqs'], block + spec['content_faqs'])])
    assert not re.search(folded_pattern, content), f'{slug} still links a folded post'
    updates.append({'post': p, 'content': content, 'faqs': faqs, 'merge': spec['folded']})

for slug, edits in LINK_ONLY.items():
    p = posts[slug]
    content = apply_edits(slug, p['content'], edits)
    assert not re.search(folded_pattern, content), f'{slug} still links a folded post'
    updates.append({'post': p, 'content': content, 'faqs': None, 'merge': None})

# Every published survivor must be clean afterwards, not just the ones listed.
others = psql_json(
    "SELECT json_agg(slug ORDER BY slug) FROM blog_post WHERE status = 'published' "
    "AND refresh_of_post_id IS NULL AND slug NOT IN (" + ','.join(lit(s) for s in list(FOLDED) + slugs)
    + ") AND (content ~ " + lit(folded_pattern) + " OR faqs::text ~ " + lit(folded_pattern) + ')'
) or []
assert not others, f'unlisted posts link a folded post: {others}'

link_only_ids = [u['post']['id'] for u in updates if not u['merge']]
merged_ids = [u['post']['id'] for u in updates if u['merge']]

parts = [f"""-- Lipo blog cluster, Phase 1, part 1: safe BEFORE the deploy.
-- Generated by build_sql.py; do not edit by hand.
--
-- Every page this changes is live, and every page it links to is live and
-- stays live, so it can run before the redirects ship. It:
--   1. snapshots the three survivors into blog_post_revision (reason
--      'manual-lipo-fold'), the undo log;
--   2. merges each folded post's useful content into its survivor:
""" + '\n'.join(
    f"--        {u['merge']} -> {u['post']['slug']} ({words(u['post']['content'])} -> {words(u['content'])} words, "
    f"{len(u['post']['faqs'])} -> {len(u['faqs'])} FAQs)"
    for u in updates if u['merge']
) + f"""
--      figures from apps/web/lib/data/procedures/facts/lipo.facts.ts, and the
--      "board-certified surgeons" / accreditation lines replaced with the
--      one-surgeon statement (#248);
--   3. repoints the links to folded posts in {len(link_only_ids)} other surviving posts,
--      restoring their content_updated_at (link-only change; the trigger would
--      bump it and the sitemap would call them revised).
--
-- Run:  psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f 03-merge-and-links.sql
-- Then revalidate the tags the final SELECT prints, plus blog-posts and sitemap-urls.

BEGIN;

CREATE TEMP TABLE _lipo_link_only ON COMMIT DROP AS
SELECT id, slug, content_updated_at FROM blog_post
 WHERE id IN ({', '.join(lit(i) for i in link_only_ids)});

DO $do$
DECLARE
    n integer;
BEGIN
    INSERT INTO blog_post_revision (blog_post_id, reason, title, content, meta_title,
        meta_description, meta_keywords, excerpt, faqs, quick_answer, ai_summary,
        reading_time, secondary_keywords)
    SELECT id, 'manual-lipo-fold', title, coalesce(content, ''), meta_title,
           meta_description, meta_keywords, excerpt, faqs, quick_answer, ai_summary,
           reading_time, secondary_keywords
      FROM blog_post WHERE id IN ({', '.join(lit(i) for i in merged_ids)});
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(merged_ids)} THEN RAISE EXCEPTION 'revision snapshot wrote % rows', n; END IF;
"""]

for i, u in enumerate(updates):
    p = u['post']
    tag = f'c{i}'
    sets = [f"content = {dollar(tag, u['content'])}"]
    if u['faqs'] is not None:
        sets.append(f"faqs = {dollar('f' + str(i), json.dumps(u['faqs'], ensure_ascii=False))}::jsonb")
        sets.append(f"reading_time = {math.ceil(words(u['content']) / 200)}")
    sets.append('updated_at = now()')
    parts.append(f"""
    -- {p['slug']}{' (merge of ' + u['merge'] + ')' if u['merge'] else ' (links only)'}
    UPDATE blog_post
       SET {(','+chr(10)+'           ').join(sets)}
     WHERE id = {lit(p['id'])} AND status = 'published' AND md5(content) = {lit(md5(p['content']))};
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION '{p['slug']}: update touched % rows (edited since the build?)', n; END IF;
""")

parts.append(f"""
    UPDATE blog_post b SET content_updated_at = l.content_updated_at
      FROM _lipo_link_only l WHERE b.id = l.id;

    SELECT count(*) INTO n FROM blog_post b JOIN _lipo_link_only l ON l.id = b.id
     WHERE b.content_updated_at IS DISTINCT FROM l.content_updated_at;
    IF n <> 0 THEN RAISE EXCEPTION 'content_updated_at moved on % link-only posts', n; END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE status = 'published' AND refresh_of_post_id IS NULL
       AND slug NOT IN ({', '.join(lit(s) for s in FOLDED)})
       AND (content ~ {lit(folded_pattern)} OR faqs::text ~ {lit(folded_pattern)});
    IF n <> 0 THEN RAISE EXCEPTION '% surviving posts still link a folded post', n; END IF;
END
$do$;

SELECT 'blog-post-' || slug AS revalidate_tag FROM blog_post
 WHERE id IN ({', '.join(lit(u['post']['id']) for u in updates)}) ORDER BY slug;

COMMIT;
""")
(OUT / '03-merge-and-links.sql').write_text(''.join(parts), encoding='utf-8')

# --------------------------------------------------------------------------
# Part 2: after the deploy. Backup, then delete.
# --------------------------------------------------------------------------
folded_list = ', '.join(lit(s) for s in FOLDED)
backup = psql_json(f"""
SELECT json_build_object(
  'blog_post', (SELECT json_agg(row_to_json(b)) FROM blog_post b
                 WHERE b.slug IN ({folded_list}) AND b.refresh_of_post_id IS NULL),
  'working_copies', (SELECT coalesce(json_agg(row_to_json(w)), '[]') FROM blog_post w
                 WHERE w.refresh_of_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list}))),
  'blog_post_category', (SELECT coalesce(json_agg(row_to_json(c)), '[]') FROM blog_post_category c
                 WHERE c.blog_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list}))),
  'blog_post_tag', (SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM blog_post_tag t
                 WHERE t.blog_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list}))),
  'blog_post_images', (SELECT coalesce(json_agg(row_to_json(i)), '[]') FROM blog_post_images i
                 WHERE i.blog_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list}))),
  'blog_post_revision', (SELECT coalesce(json_agg(row_to_json(r)), '[]') FROM blog_post_revision r
                 WHERE r.blog_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list}))),
  'content_refresh', (SELECT coalesce(json_agg(row_to_json(cr)), '[]') FROM content_refresh cr
                 WHERE cr.blog_post_id IN (SELECT id FROM blog_post WHERE slug IN ({folded_list})))
)""")
assert len(backup['blog_post']) == len(FOLDED), len(backup['blog_post'])
(OUT / '04-folded-backup.json').write_text(json.dumps(backup, ensure_ascii=False, indent=1), encoding='utf-8')

(OUT / '04-delete-folded.sql').write_text(f"""-- Lipo blog cluster, Phase 1, part 2: run ONLY after the deploy carrying the
-- new next.config.mjs redirects is live. Check first; each must answer 308:
""" + '\n'.join(
    f"--   curl -sI https://www.alluringplasticsurgery.com/{s} | grep -i -E '^(HTTP|location)'" for s in FOLDED
) + f"""
-- Deleting before the redirects ship makes the URLs 404.
--
-- Deletes the {len(FOLDED)} folded posts rather than drafting them: drafts count against
-- autopilot_draft_cap. Cascades: category/tag/image links, analysis, revisions,
-- content_refresh rows and refresh working copies; gsc_query_page_daily keeps its
-- rows with blog_post_id set to NULL. Backup of every affected row:
-- 04-folded-backup.json (built from the same database as this file).
--
-- Run:  psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f 04-delete-folded.sql
-- Then revalidate: blog-posts, sitemap-urls and blog-post-<slug> for each slug below.

BEGIN;

DO $do$
DECLARE
    n integer;
    folded constant text[] := ARRAY[{folded_list}];
BEGIN
    SELECT count(*) INTO n FROM blog_post
     WHERE slug = ANY(folded) AND status = 'published' AND refresh_of_post_id IS NULL;
    IF n <> {len(FOLDED)} THEN RAISE EXCEPTION 'expected {len(FOLDED)} published folded posts, found %', n; END IF;

    DELETE FROM blog_post
     WHERE slug = ANY(folded) AND status = 'published' AND refresh_of_post_id IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> {len(FOLDED)} THEN RAISE EXCEPTION 'deleted % posts, expected {len(FOLDED)}', n; END IF;

    SELECT count(*) INTO n FROM blog_post WHERE refresh_of_post_id IS NOT NULL
       AND refresh_of_post_id NOT IN (SELECT id FROM blog_post);
    IF n <> 0 THEN RAISE EXCEPTION 'orphaned working copies remain: %', n; END IF;

    -- The survivors must still be live.
    SELECT count(*) INTO n FROM blog_post
     WHERE slug IN ('how-many-massages-after-lipo-360', 'how-to-reduce-swelling-after-liposuction',
                    'tummy-tuck-vs-liposuction') AND status = 'published';
    IF n <> 3 THEN RAISE EXCEPTION 'a survivor is no longer published'; END IF;
END
$do$;

COMMIT;
""", encoding='utf-8')

for u in updates:
    print(f"{u['post']['slug']:45} {'merge' if u['merge'] else 'links':6} words {words(u['post']['content'])} -> {words(u['content'])}")
print(f"backup: {len(backup['blog_post'])} posts, {len(backup['working_copies'])} working copies, "
      f"{len(backup['content_refresh'])} refresh rows, {len(backup['blog_post_images'])} image links")
