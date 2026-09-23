-- Lipo blog cluster, Phase 0: hold autopilot off the liposuction posts.
-- Safe to run any time; it changes no page.
--
-- Every liposuction post has a pending refresh candidate, and the top two on the
-- whole site are liposuction posts (how-to-sleep 41.5, how-to-reduce-swelling
-- 25.6). Refresh runs in `auto` mode, so the cron would rewrite them without
-- lipo.facts.ts the day the stalled queue is unblocked.
--
--   1. Dismiss the 27 pending candidates: the 25 liposuction posts plus
--      affordable-plastic-surgery-miami and how-to-feed-the-fat-after-bbl.
--      Dismissing starts refresh_cooldown_days (60), so detection re-queues
--      them after 2026-11-22 unless a manual refresh is requested.
--   2. Delete the working copy 46f18133, the partial rewrite of
--      how-to-sleep-after-liposuction left in ai_review when the 2026-09-13
--      refresh run died. Its candidate (793601db) stays `failed`; the FK sets its
--      working_post_id to NULL. Backup: 01-working-copy-backup.json.
--
-- Run:  psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f 01-hold-autopilot.sql
-- Undo step 1:
--   UPDATE content_refresh SET status = 'pending', updated_at = now()
--    WHERE status = 'dismissed' AND updated_at >= '<time you ran this>';

BEGIN;

DO $do$
DECLARE
    n integer;
    slugs constant text[] := ARRAY[
        'affordable-plastic-surgery-miami',
        'how-long-after-lipo-can-i-workout',
        'how-long-does-it-take-to-recover-from-chin-lipo',
        'how-many-massages-after-lipo-360',
        'how-many-times-can-you-get-liposuction',
        'how-old-do-you-have-to-be-to-get-liposuction',
        'how-to-feed-the-fat-after-bbl',
        'how-to-fix-uneven-liposuction',
        'how-to-get-rid-of-bruising-after-liposuction',
        'how-to-get-rid-of-fibrosis-after-lipo',
        'how-to-maintain-liposuction-results',
        'how-to-reduce-itching-after-lipo',
        'how-to-reduce-swelling-after-liposuction',
        'how-to-sleep-after-liposuction',
        'liposuction-candidate-miami',
        'liposuction-miami-moms-tips',
        'liposuction-miami-post-pregnancy-guide',
        'liposuction-recovery-ozempic-miami',
        'liposuction-recovery-time-miami',
        'liposuction-vs-breast-augmentation-miami',
        'tummy-tuck-vs-liposuction',
        'what-areas-does-lipo-360-cover',
        'what-is-j-plasma-lipo',
        'what-is-lipo-foam',
        'what-is-the-difference-between-tummy-tuck-and-liposuction',
        'what-to-eat-after-liposuction',
        'when-to-start-lymphatic-massage-after-lipo'
    ];
    working_copy constant uuid := '46f18133-c2f6-428e-b6f1-99795d97c23b';
    sleep_post constant uuid := '3a2254b5-f2db-4434-8d93-5beb8b5fb00f';
BEGIN
    -- 1. Refresh candidates
    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL
       AND cr.status = 'pending';
    IF n <> 27 THEN
        RAISE EXCEPTION 'expected 27 pending candidates on the lipo posts, found %', n;
    END IF;

    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND cr.status IN ('in_progress', 'ready_for_review');
    IF n <> 0 THEN
        RAISE EXCEPTION '% lipo candidates are in progress or awaiting review; stop and look', n;
    END IF;

    UPDATE content_refresh cr
       SET status = 'dismissed', updated_at = now()
      FROM blog_post p
     WHERE p.id = cr.blog_post_id
       AND p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL
       AND cr.status = 'pending';
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 27 THEN RAISE EXCEPTION 'dismissed % candidates, expected 27', n; END IF;

    -- 2. The stale working copy
    SELECT count(*) INTO n FROM blog_post
     WHERE id = working_copy AND refresh_of_post_id = sleep_post
       AND status = 'ai_review';
    IF n <> 1 THEN
        RAISE EXCEPTION 'working copy 46f18133 not found as the sleep post''s ai_review copy';
    END IF;

    DELETE FROM blog_post WHERE id = working_copy AND refresh_of_post_id = sleep_post;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'deleted % working copies, expected 1', n; END IF;

    -- The sleep post itself must be untouched.
    SELECT count(*) INTO n FROM blog_post
     WHERE id = sleep_post AND slug = 'how-to-sleep-after-liposuction'
       AND status = 'published';
    IF n <> 1 THEN RAISE EXCEPTION 'how-to-sleep-after-liposuction is no longer published'; END IF;

    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND cr.status = 'pending';
    IF n <> 0 THEN RAISE EXCEPTION '% pending candidates remain on the lipo posts', n; END IF;
END
$do$;

COMMIT;

-- What the refresh cron would take next, once 02-resume-autopilot.sql runs.
SELECT p.slug, round(cr.score::numeric, 1) AS score
  FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
 WHERE cr.status = 'pending'
 ORDER BY cr.score DESC, cr.created_at
 LIMIT 5;
