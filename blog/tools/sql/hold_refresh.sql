-- Hold the refresh loop off some posts: dismiss their open refresh candidates.
-- Generalized from implementation-plans/2026-09-22-lipo-blog-cluster/sql/01-hold-autopilot.sql.
--
-- Refresh runs in `auto` mode: the daily cron rewrites the top pending
-- candidate without review. Before a cluster review, a rewrite or a fold, take
-- the cluster's posts out of the queue. Dismissing starts refresh_cooldown_days
-- (60), so detection re-queues them after that unless someone asks for a
-- manual refresh. build_sql.py does this for each post it rewrites; this file
-- is for holding posts you are not rewriting yet.
--
-- Run (slugs comma-separated, no spaces; expect = how many pending and
-- ready_for_review candidates you expect to dismiss, as the first SELECT shows):
--   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -v slugs=slug-a,slug-b -v expect=2 -f blog/tools/sql/hold_refresh.sql
-- Report only (prints the open candidates, then stops before changing anything):
--   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -v slugs=slug-a,slug-b -v expect=-1 -f blog/tools/sql/hold_refresh.sql
-- When a ready_for_review candidate's working copy will be deleted, or with
-- drop_orphans, -v backup=<file.json> is required: every working copy of these
-- posts, with its links, and the open candidates are written there first.
-- Also delete orphaned working copies of these posts (refresh copies no open
-- candidate owns, e.g. left by a run that died):
--   ... -v drop_orphans=yes -v backup=/path/working-copies.json ...
--
-- What it does, in one transaction:
--   - refuses to run on the shared dev database (alluring-autopilot-dev);
--   - stops if a candidate is in_progress (a refresh run is writing the post);
--   - deletes the working copy of each ready_for_review candidate (the admin's
--     dismiss does the same), asserting the count matches the backup, and
--     dismisses every pending/ready_for_review candidate, marking it
--     'held by blog/tools/sql/hold_refresh.sql';
--   - asserts the counts, and that nothing is left open on these posts.
-- Undo: blog/tools/sql/resume_refresh.sql re-opens the candidates this marked
-- (the working copies are gone; the backup has them).

\if :{?slugs}
\else
    \echo 'pass -v slugs=slug-a,slug-b (comma-separated, no spaces)'
    \quit
\endif
\if :{?expect}
\else
    \echo 'pass -v expect=N (open candidates to dismiss; -1 = report only)'
    \quit
\endif
\if :{?drop_orphans}
\else
    \set drop_orphans no
\endif
\set backup_written no

\echo 'Open refresh candidates on these posts:'
SELECT p.slug, cr.status, round(cr.score::numeric, 1) AS score, cr.working_post_id, cr.created_at::date AS queued
  FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
 WHERE p.slug = ANY(string_to_array(:'slugs', ',')) AND p.refresh_of_post_id IS NULL
   AND cr.status IN ('pending', 'in_progress', 'ready_for_review')
 ORDER BY p.slug;

-- The working copies of ready_for_review candidates this deletes, and whether
-- a backup is needed (it is unless this is a report-only run).
SELECT count(*) AS rfr_copies,
       CASE WHEN :expect >= 0 AND (count(*) > 0 OR :'drop_orphans' IN ('yes', 'true', 'on', '1'))
            THEN 'yes' ELSE 'no' END AS need_backup
  FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id JOIN blog_post w ON w.id = cr.working_post_id
 WHERE p.slug = ANY(string_to_array(:'slugs', ',')) AND p.refresh_of_post_id IS NULL
   AND cr.status = 'ready_for_review' AND w.refresh_of_post_id = p.id
\gset

\if :need_backup
    \if :{?backup}
    \else
        \echo 'this run deletes working copies: pass -v backup=<file.json> (ready_for_review copies:' :rfr_copies ', drop_orphans:' :drop_orphans ')'
        SELECT 1 / 0 AS backup_required;
        \quit
    \endif
    \pset tuples_only on
    \pset format unaligned
    \o :backup
    SELECT json_build_object(
      'working_copies', (SELECT coalesce(json_agg(row_to_json(w)), '[]') FROM blog_post w JOIN blog_post p ON p.id = w.refresh_of_post_id
                          WHERE p.slug = ANY(string_to_array(:'slugs', ','))),
      'working_copy_images', (SELECT coalesce(json_agg(row_to_json(i)), '[]') FROM blog_post_images i
                               JOIN blog_post w ON w.id = i.blog_post_id JOIN blog_post p ON p.id = w.refresh_of_post_id
                              WHERE p.slug = ANY(string_to_array(:'slugs', ','))),
      'working_copy_categories', (SELECT coalesce(json_agg(row_to_json(c)), '[]') FROM blog_post_category c
                                   JOIN blog_post w ON w.id = c.blog_post_id JOIN blog_post p ON p.id = w.refresh_of_post_id
                                  WHERE p.slug = ANY(string_to_array(:'slugs', ','))),
      'working_copy_tags', (SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM blog_post_tag t
                             JOIN blog_post w ON w.id = t.blog_post_id JOIN blog_post p ON p.id = w.refresh_of_post_id
                            WHERE p.slug = ANY(string_to_array(:'slugs', ','))),
      'content_refresh', (SELECT coalesce(json_agg(row_to_json(cr)), '[]') FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
                           WHERE p.slug = ANY(string_to_array(:'slugs', ',')) AND p.refresh_of_post_id IS NULL
                             AND cr.status IN ('pending', 'in_progress', 'ready_for_review')));
    \o
    \pset tuples_only off
    \pset format aligned
    \set backup_written yes
    \echo 'working copies and open candidates backed up to' :'backup'
\endif

BEGIN;

SELECT set_config('blogkit.slugs', :'slugs', true) AS slugs,
       set_config('blogkit.expect', :'expect', true) AS expect,
       set_config('blogkit.drop_orphans', :'drop_orphans', true) AS drop_orphans,
       set_config('blogkit.rfr_copies', :'rfr_copies', true) AS rfr_copies,
       set_config('blogkit.backup_written', :'backup_written', true) AS backup_written;

DO $do$
DECLARE
    n integer;
    slugs constant text[] := string_to_array(current_setting('blogkit.slugs'), ',');
    expect constant integer := current_setting('blogkit.expect')::integer;
    drop_orphans constant boolean := current_setting('blogkit.drop_orphans') IN ('yes', 'true', 'on', '1');
    rfr_copies constant integer := current_setting('blogkit.rfr_copies')::integer;
    backup_written constant boolean := current_setting('blogkit.backup_written') = 'yes';
    marker constant text := 'held by blog/tools/sql/hold_refresh.sql';
BEGIN
    IF current_database() = 'alluring-autopilot-dev' AND expect >= 0 THEN
        RAISE EXCEPTION 'refusing to write the shared dev database alluring-autopilot-dev: run this on a throwaway copy (createdb -T) or, by the user, on production';
    END IF;

    SELECT count(*) INTO n FROM blog_post WHERE slug = ANY(slugs) AND refresh_of_post_id IS NULL;
    IF n <> cardinality(slugs) THEN
        RAISE EXCEPTION 'found % of % posts: check the slugs', n, cardinality(slugs);
    END IF;

    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL AND cr.status = 'in_progress';
    IF n <> 0 THEN
        RAISE EXCEPTION '% candidate(s) in_progress: a refresh run is writing; stop and look at autopilot_run', n;
    END IF;

    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL AND cr.status IN ('pending', 'ready_for_review');
    IF expect < 0 THEN
        RAISE EXCEPTION 'report only: % open candidate(s) would be dismissed; rerun with -v expect=%', n, n;
    END IF;
    IF n <> expect THEN RAISE EXCEPTION 'expected % open candidates, found %', expect, n; END IF;

    IF (rfr_copies > 0 OR drop_orphans) AND NOT backup_written THEN
        RAISE EXCEPTION 'working copies would be deleted without a backup: pass -v backup=<file.json>';
    END IF;

    DELETE FROM blog_post w
     USING content_refresh cr, blog_post p
     WHERE cr.blog_post_id = p.id AND p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL
       AND cr.status = 'ready_for_review' AND w.id = cr.working_post_id AND w.refresh_of_post_id = p.id;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> rfr_copies THEN
        RAISE EXCEPTION 'deleted % ready_for_review working copies, the backup holds %', n, rfr_copies;
    END IF;

    UPDATE content_refresh cr
       SET status = 'dismissed', change_summary = marker, updated_at = now()
      FROM blog_post p
     WHERE p.id = cr.blog_post_id AND p.slug = ANY(slugs) AND p.refresh_of_post_id IS NULL
       AND cr.status IN ('pending', 'ready_for_review');
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> expect THEN RAISE EXCEPTION 'dismissed % candidates, expected %', n, expect; END IF;

    SELECT count(*) INTO n FROM blog_post w JOIN blog_post p ON p.id = w.refresh_of_post_id
     WHERE p.slug = ANY(slugs)
       AND NOT EXISTS (SELECT 1 FROM content_refresh c WHERE c.working_post_id = w.id
                          AND c.status IN ('pending', 'in_progress', 'ready_for_review'));
    IF n > 0 AND drop_orphans THEN
        DELETE FROM blog_post w USING blog_post p
         WHERE p.id = w.refresh_of_post_id AND p.slug = ANY(slugs)
           AND NOT EXISTS (SELECT 1 FROM content_refresh c WHERE c.working_post_id = w.id
                              AND c.status IN ('pending', 'in_progress', 'ready_for_review'));
        RAISE NOTICE 'deleted % orphan working cop(ies)', n;
    ELSIF n > 0 THEN
        RAISE NOTICE '% orphan working cop(ies) left; rerun with -v drop_orphans=yes -v backup=<file> to delete them', n;
    END IF;

    SELECT count(*) INTO n
      FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
     WHERE p.slug = ANY(slugs) AND cr.status IN ('pending', 'in_progress', 'ready_for_review');
    IF n <> 0 THEN RAISE EXCEPTION '% candidates still open on these posts', n; END IF;
END
$do$;

COMMIT;

\echo 'What the refresh cron would take next:'
SELECT p.slug, round(cr.score::numeric, 1) AS score
  FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
 WHERE cr.status = 'pending'
 ORDER BY cr.score DESC, cr.created_at
 LIMIT 5;
