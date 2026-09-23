-- Lipo blog cluster, Phase 1, part 2: run ONLY after the deploy carrying the
-- new next.config.mjs redirects is live. Check first; each must answer 308:
--   curl -sI https://www.alluringplasticsurgery.com/when-to-start-lymphatic-massage-after-lipo | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/liposuction-recovery-time-miami | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/what-is-the-difference-between-tummy-tuck-and-liposuction | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/liposuction-candidate-miami | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/liposuction-miami-post-pregnancy-guide | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/liposuction-miami-moms-tips | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/how-to-maintain-liposuction-results | grep -i -E '^(HTTP|location)'
--   curl -sI https://www.alluringplasticsurgery.com/liposuction-vs-breast-augmentation-miami | grep -i -E '^(HTTP|location)'
-- Deleting before the redirects ship makes the URLs 404.
--
-- Deletes the 8 folded posts rather than drafting them: drafts count against
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
    folded constant text[] := ARRAY['when-to-start-lymphatic-massage-after-lipo', 'liposuction-recovery-time-miami', 'what-is-the-difference-between-tummy-tuck-and-liposuction', 'liposuction-candidate-miami', 'liposuction-miami-post-pregnancy-guide', 'liposuction-miami-moms-tips', 'how-to-maintain-liposuction-results', 'liposuction-vs-breast-augmentation-miami'];
BEGIN
    SELECT count(*) INTO n FROM blog_post
     WHERE slug = ANY(folded) AND status = 'published' AND refresh_of_post_id IS NULL;
    IF n <> 8 THEN RAISE EXCEPTION 'expected 8 published folded posts, found %', n; END IF;

    DELETE FROM blog_post
     WHERE slug = ANY(folded) AND status = 'published' AND refresh_of_post_id IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 8 THEN RAISE EXCEPTION 'deleted % posts, expected 8', n; END IF;

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
