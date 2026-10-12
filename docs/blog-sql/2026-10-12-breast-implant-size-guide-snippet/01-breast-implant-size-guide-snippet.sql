-- snippet: /blog/breast-implant-size-guide  (title + meta description only; the body is untouched)
-- Written by hand on 2026-10-12 in the shape of blog/tools/build_sql.py's rewrite SQL. build_sql.py
-- only builds full rewrites (a blog/posts/<slug>/content.md that passes check_post.py), and this
-- change keeps the live body as it is, so the same guards are written out here instead.
--
-- Why: Search Console, 27 Sep - 9 Oct 2026: the post sits at position ~2.4 for "breast implant
-- size calculator" (474 impressions in 28 days, 1 click) and ~2.7 for "breast implant size chart".
-- The calculator itself ships in code (branch feat/breast-implant-size-calculator); this file
-- changes the snippet so it says the tool is there. The keyword gate (blog/tools/gate.mjs) says
-- "refresh", owner breast-implant-size-guide, no warnings, for the new title.
--
--   title / H1 / <title>   "Breast Implant Size Guide: Perfect CC Chart"
--                       -> "Breast Implant Size Calculator, CC Chart & Size Guide"   (53 chars)
--   meta_title             NULL -> the new title (as build_sql.py sets it; the page reads `title`)
--   meta_description       "Discover your ideal breast implant size with CC chart, profiles, and tips
--                           for natural augmentation. Book a Miami consult now!"
--                       -> "Estimate your implant size in cc from your band and cup with our free
--                           calculator, then read the CC chart, profiles and what your surgeon measures."
--                           (152 chars)
--
-- Guard: id + slug + status 'published', and title, meta_title and meta_description exactly as they
--   are live today (read from the public page on 2026-10-12). Any edit since, or a second run,
--   fails the whole file and changes nothing. The body is not read or written.
-- Undo log: blog_post_revision, reason 'claude-blog-post'; undo-01-breast-implant-size-guide-snippet.sql
--   puts the three fields back.
-- content_updated_at: the trigger stamps it on a title change; this file puts the old value back,
--   so the byline date and dateModified don't claim a content update for a snippet change.
-- Refresh queue: refuses while a refresh is in_progress; dismisses pending / ready_for_review
--   candidates (deleting a ready_for_review working copy), or, when none is open, inserts a
--   dismissed one so the 60-day refresh cooldown starts and autopilot does not retitle the post.
-- Refuses to run on the shared dev database (alluring-autopilot-dev).
--
-- Run:  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f 01-breast-implant-size-guide-snippet.sql
-- Then: bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-breast-implant-size-guide

BEGIN;

DO $do$
DECLARE
    n integer;
    open_count integer;
    wc_count integer;
    old_updated timestamp;
    post constant uuid := '1057cb41-fa87-4fa5-8fec-45d935fe1597';
    old_title constant text := 'Breast Implant Size Guide: Perfect CC Chart';
    old_meta constant text := 'Discover your ideal breast implant size with CC chart, profiles, and tips for natural augmentation. Book a Miami consult now!';
    new_title constant text := 'Breast Implant Size Calculator, CC Chart & Size Guide';
    new_meta constant text := 'Estimate your implant size in cc from your band and cup with our free calculator, then read the CC chart, profiles and what your surgeon measures.';
BEGIN
    IF current_database() = 'alluring-autopilot-dev' THEN
        RAISE EXCEPTION 'refusing to write the shared dev database alluring-autopilot-dev: run this file on a throwaway copy (createdb -T) or, by the user, on production';
    END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = 'breast-implant-size-guide' AND status = 'published'
       AND refresh_of_post_id IS NULL
       AND title = old_title
       AND coalesce(meta_title, '') = ''
       AND meta_description = old_meta;
    IF n <> 1 THEN
        RAISE EXCEPTION 'breast-implant-size-guide: not found, or title/meta changed since 2026-10-12, or this file already ran (snippet guard)';
    END IF;

    SELECT count(*) INTO n FROM content_refresh WHERE blog_post_id = post AND status = 'in_progress';
    IF n <> 0 THEN
        RAISE EXCEPTION 'breast-implant-size-guide: a refresh run is in progress on this post; wait for it or hold it first';
    END IF;

    SELECT content_updated_at INTO old_updated FROM blog_post WHERE id = post;

    INSERT INTO blog_post_revision (blog_post_id, reason, title, content, meta_title, meta_description,
        meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords)
    SELECT id, 'claude-blog-post', title, coalesce(content, ''), meta_title, meta_description,
           meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords
      FROM blog_post WHERE id = post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'breast-implant-size-guide: revision snapshot wrote % rows', n; END IF;

    UPDATE blog_post
       SET title = new_title,
           meta_title = new_title,
           meta_description = new_meta,
           updated_at = now()
     WHERE id = post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'breast-implant-size-guide: update touched % rows', n; END IF;

    -- Only this column changes here, so the trigger keeps the value.
    UPDATE blog_post SET content_updated_at = old_updated WHERE id = post;

    -- Refresh queue: the working copies of ready_for_review candidates go, then every open
    -- candidate is dismissed.
    DELETE FROM blog_post w
     USING content_refresh c
     WHERE c.blog_post_id = post AND c.status = 'ready_for_review'
       AND w.id = c.working_post_id AND w.refresh_of_post_id = post;
    GET DIAGNOSTICS wc_count = ROW_COUNT;

    UPDATE content_refresh SET status = 'dismissed', updated_at = now()
     WHERE blog_post_id = post AND status IN ('pending', 'ready_for_review');
    GET DIAGNOSTICS open_count = ROW_COUNT;
    IF open_count = 0 THEN
        INSERT INTO content_refresh (blog_post_id, status, sources, change_summary)
        VALUES (post, 'dismissed',
                jsonb_build_array(jsonb_build_object('source', 'manual',
                    'detectedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                    'metrics', jsonb_build_object('requestedBy', 'claude-blog-post'))),
                'Snippet changed with the blog kit (calculator title); dismissed to start the refresh cooldown.');
    END IF;
    RAISE NOTICE 'breast-implant-size-guide: % open refresh candidate(s) dismissed, % working cop(ies) deleted', open_count, wc_count;

    SELECT count(*) INTO n FROM content_refresh
     WHERE blog_post_id = post AND status IN ('pending', 'in_progress', 'ready_for_review');
    IF n <> 0 THEN RAISE EXCEPTION 'breast-implant-size-guide: % refresh candidates still open', n; END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND title = new_title AND meta_title = new_title AND meta_description = new_meta
       AND content_updated_at IS NOT DISTINCT FROM old_updated;
    IF n <> 1 THEN RAISE EXCEPTION 'breast-implant-size-guide: the new snippet did not land'; END IF;
END
$do$;

SELECT slug, title, meta_description, content_updated_at, md5(content) AS content_md5
  FROM blog_post WHERE id = '1057cb41-fa87-4fa5-8fec-45d935fe1597';

COMMIT;
