-- undo of 01-breast-implant-size-guide-snippet.sql: puts the old title, meta_title and meta
-- description back. Run it ONLY to undo that file, after it ran.
-- Guard: the three fields are exactly what 01 wrote. Snapshots the current row as
-- 'claude-blog-post-undo' first, and keeps content_updated_at as it is. The refresh queue stays
-- dismissed (the cooldown holds).
--
-- Run:  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f undo-01-breast-implant-size-guide-snippet.sql
-- Then: bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-breast-implant-size-guide

BEGIN;

DO $do$
DECLARE
    n integer;
    old_updated timestamp;
    post constant uuid := '1057cb41-fa87-4fa5-8fec-45d935fe1597';
    old_title constant text := 'Breast Implant Size Guide: Perfect CC Chart';
    old_meta constant text := 'Discover your ideal breast implant size with CC chart, profiles, and tips for natural augmentation. Book a Miami consult now!';
    new_title constant text := 'Breast Implant Size Calculator, CC Chart & Size Guide';
    new_meta constant text := 'Estimate your implant size in cc from your band and cup with our free calculator, then read the CC chart, profiles and what your surgeon measures.';
BEGIN
    IF current_database() = 'alluring-autopilot-dev' THEN
        RAISE EXCEPTION 'refusing to write the shared dev database alluring-autopilot-dev';
    END IF;

    SELECT count(*) INTO n FROM blog_post
     WHERE id = post AND slug = 'breast-implant-size-guide' AND status = 'published'
       AND title = new_title AND meta_title = new_title AND meta_description = new_meta;
    IF n <> 1 THEN RAISE EXCEPTION 'breast-implant-size-guide: the live snippet is not the one 01 wrote (never ran, edited since, or already undone)'; END IF;

    SELECT content_updated_at INTO old_updated FROM blog_post WHERE id = post;

    INSERT INTO blog_post_revision (blog_post_id, reason, title, content, meta_title, meta_description,
        meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords)
    SELECT id, 'claude-blog-post-undo', title, coalesce(content, ''), meta_title, meta_description,
           meta_keywords, excerpt, faqs, quick_answer, ai_summary, reading_time, secondary_keywords
      FROM blog_post WHERE id = post;

    UPDATE blog_post SET title = old_title, meta_title = NULL, meta_description = old_meta, updated_at = now()
     WHERE id = post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'breast-implant-size-guide: restore touched % rows', n; END IF;

    UPDATE blog_post SET content_updated_at = old_updated WHERE id = post;
END
$do$;

SELECT slug, title, meta_description, content_updated_at FROM blog_post WHERE id = '1057cb41-fa87-4fa5-8fec-45d935fe1597';

COMMIT;
