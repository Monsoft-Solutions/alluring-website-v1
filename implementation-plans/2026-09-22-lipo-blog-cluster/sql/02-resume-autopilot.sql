-- Lipo blog cluster, Phase 0 (optional): restart the stalled autopilot.
-- Run ONLY after 01-hold-autopilot.sql, and only if you want autopilot running.
--
-- Nothing has run since 2026-09-13. The daily refresh and content runs both
-- skip on `unacknowledged-failure`:
--   fab84be7  refresh  started 2026-09-12, reaped as stale 2026-09-13
--   e52cf68a  content  started 2026-09-12, reaped as stale 2026-09-13
-- A third run, refresh 0d352b91 (2026-09-13, the one that died on
-- how-to-sleep-after-liposuction), is still marked `running`. The next refresh
-- tick would reap it into a NEW unacknowledged failure and stall again, so it
-- is closed and acknowledged here too.
--
-- After this, the daily refresh cron (10:00 UTC) takes the top pending candidate
-- (not a lipo post once 01 has run) and the daily content run (11:00 UTC)
-- drafts from the ideation queue, up to autopilot_draft_cap.
--
-- Run:  psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f 02-resume-autopilot.sql

BEGIN;

DO $do$
DECLARE
    n integer;
BEGIN
    -- 01 must have run first.
    SELECT count(*) INTO n FROM blog_post
     WHERE id = '46f18133-c2f6-428e-b6f1-99795d97c23b';
    IF n <> 0 THEN RAISE EXCEPTION 'run 01-hold-autopilot.sql first'; END IF;

    UPDATE autopilot_run
       SET status = 'failed',
           error = 'Workflow died 2026-09-13 (how-to-sleep-after-liposuction refresh); closed by hand 2026-09-23',
           finished_at = now(),
           acknowledged_at = now()
     WHERE id = '0d352b91-fdd2-41f4-b6cb-b1ce05e32ead' AND status = 'running';
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 1 THEN RAISE EXCEPTION 'closed % orphan running runs, expected 1', n; END IF;

    UPDATE autopilot_run
       SET acknowledged_at = now()
     WHERE id IN ('fab84be7-7fee-47dd-bccf-d75552d75e9b',
                  'e52cf68a-ec9c-489b-b21e-6917798ca677')
       AND status = 'failed' AND acknowledged_at IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 2 THEN RAISE EXCEPTION 'acknowledged % failures, expected 2', n; END IF;

    SELECT count(*) INTO n FROM autopilot_run
     WHERE status = 'failed' AND acknowledged_at IS NULL;
    IF n <> 0 THEN RAISE EXCEPTION '% unacknowledged failures remain', n; END IF;

    SELECT count(*) INTO n FROM autopilot_run WHERE status = 'running';
    IF n <> 0 THEN RAISE EXCEPTION '% runs still marked running', n; END IF;
END
$do$;

COMMIT;
