-- Undo hold_refresh.sql: re-open the refresh candidates it dismissed.
--
-- Re-opens, for each named post, the latest candidate marked
-- 'held by blog/tools/sql/hold_refresh.sql', as pending. Skipped, each named
-- in a NOTICE and left as it is:
--   - a post that has another open candidate since (one active candidate per
--     post: the content_refresh_active_idx unique index);
--   - a post rewritten or refreshed after the hold: an applied or dismissed
--     content_refresh row, or a blog_post_revision with reason
--     'claude-blog-post', newer than the held row. build_sql.py dismissed its
--     candidates on purpose, to start the cooldown; re-opening the old
--     candidate would hand the fresh rewrite to autopilot, which rewrites the
--     top pending candidate without review.
-- expect counts only the candidates actually re-opened. Refuses to run on the
-- shared dev database (alluring-autopilot-dev).
--
-- Run (expect = how many candidates you expect to re-open):
--   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -v slugs=slug-a,slug-b -v expect=2 -f blog/tools/sql/resume_refresh.sql
--
-- Autopilot itself stalls on unacknowledged failed runs. To see them:
--   SELECT id, kind, status, started_at, error FROM autopilot_run
--    WHERE (status = 'failed' AND acknowledged_at IS NULL) OR status = 'running';
-- Acknowledging them is a separate, deliberate step
-- (implementation-plans/2026-09-22-lipo-blog-cluster/sql/02-resume-autopilot.sql is the worked example).

\if :{?slugs}
\else
    \echo 'pass -v slugs=slug-a,slug-b (comma-separated, no spaces)'
    \quit
\endif
\if :{?expect}
\else
    \echo 'pass -v expect=N (candidates to re-open)'
    \quit
\endif

BEGIN;

SELECT set_config('blogkit.slugs', :'slugs', true) AS slugs, set_config('blogkit.expect', :'expect', true) AS expect;

DO $do$
DECLARE
    n integer;
    blocked integer;
    rewritten integer := 0;
    r record;
    slugs constant text[] := string_to_array(current_setting('blogkit.slugs'), ',');
    expect constant integer := current_setting('blogkit.expect')::integer;
    marker constant text := 'held by blog/tools/sql/hold_refresh.sql';
BEGIN
    IF current_database() = 'alluring-autopilot-dev' THEN
        RAISE EXCEPTION 'refusing to write the shared dev database alluring-autopilot-dev: run this on a throwaway copy (createdb -T) or, by the user, on production';
    END IF;

    SELECT count(DISTINCT p.id) INTO blocked
      FROM blog_post p JOIN content_refresh c ON c.blog_post_id = p.id
     WHERE p.slug = ANY(slugs) AND c.status IN ('pending', 'in_progress', 'ready_for_review');

    -- The latest held candidate per post.
    CREATE TEMP TABLE _held ON COMMIT DROP AS
    SELECT DISTINCT ON (c.blog_post_id) c.id, c.blog_post_id, c.updated_at, p.slug
      FROM content_refresh c JOIN blog_post p ON p.id = c.blog_post_id
     WHERE p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL
       AND c.status = 'dismissed' AND c.change_summary = marker
     ORDER BY c.blog_post_id, c.updated_at DESC;

    -- Rewritten or refreshed since the hold: stays held.
    FOR r IN
        SELECT h.slug FROM _held h
         WHERE EXISTS (SELECT 1 FROM content_refresh o WHERE o.blog_post_id = h.blog_post_id AND o.id <> h.id
                          AND o.status IN ('applied', 'dismissed') AND o.updated_at > h.updated_at)
            OR EXISTS (SELECT 1 FROM blog_post_revision v WHERE v.blog_post_id = h.blog_post_id
                          AND v.reason = 'claude-blog-post' AND v.created_at > h.updated_at)
         ORDER BY h.slug
    LOOP
        rewritten := rewritten + 1;
        RAISE NOTICE '%: rewritten or refreshed after the hold; left held (not re-opened)', r.slug;
    END LOOP;

    UPDATE content_refresh cr
       SET status = 'pending', change_summary = NULL, updated_at = now()
      FROM _held h
     WHERE cr.id = h.id
       AND NOT EXISTS (SELECT 1 FROM content_refresh o WHERE o.blog_post_id = h.blog_post_id
                          AND o.status IN ('pending', 'in_progress', 'ready_for_review'))
       AND NOT EXISTS (SELECT 1 FROM content_refresh o WHERE o.blog_post_id = h.blog_post_id AND o.id <> h.id
                          AND o.status IN ('applied', 'dismissed') AND o.updated_at > h.updated_at)
       AND NOT EXISTS (SELECT 1 FROM blog_post_revision v WHERE v.blog_post_id = h.blog_post_id
                          AND v.reason = 'claude-blog-post' AND v.created_at > h.updated_at);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF blocked > 0 THEN RAISE NOTICE '% post(s) skipped: they already have an open candidate', blocked; END IF;
    IF rewritten > 0 THEN RAISE NOTICE '% post(s) skipped: rewritten or refreshed after the hold', rewritten; END IF;
    IF n <> expect THEN RAISE EXCEPTION 're-opened % candidates, expected %', n, expect; END IF;
END
$do$;

COMMIT;
