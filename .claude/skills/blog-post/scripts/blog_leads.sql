-- Leads from blog posts, by month. Counts only: no names, emails or phones.
--
--   psql "$D" -X -v ON_ERROR_STOP=1 [-v since=2026-06-01] -f .claude/skills/blog-post/scripts/blog_leads.sql
--
-- Production is the database that has the leads; reading it needs the user's
-- OK in the session (the local copy is days or weeks stale).
--
-- sent_from_a_post  submitted_from_path is a published post (recorded since 2026-09-23)
-- landed_on_a_post  the session's landing_page is a published post
-- blog_form         source = 'blog-lead' (the old template's post form)
-- created_at is Miami wall time: compare it with plain dates, never convert it.
-- Count leads here, never from GA4 thank-you hits (a reopened tab fires them again).

\if :{?since}
\else
    \set since 2026-06-01
\endif

WITH posts AS (
    SELECT slug FROM blog_post WHERE status = 'published' AND refresh_of_post_id IS NULL
), leads AS (
    SELECT created_at, source,
           regexp_replace(split_part(coalesce(submitted_from_path, ''), '?', 1), '^/(blog/)?|/$', '', 'g') AS sent_from,
           regexp_replace(split_part(regexp_replace(coalesce(landing_page, ''), '^https?://[^/]+', ''), '?', 1),
                          '^/(blog/)?|/$', '', 'g') AS landed_on
      FROM contact_submission
     WHERE created_at >= :'since'::date
)
SELECT to_char(created_at, 'YYYY-MM') AS month,
       count(*) FILTER (WHERE sent_from IN (SELECT slug FROM posts)) AS sent_from_a_post,
       count(*) FILTER (WHERE landed_on IN (SELECT slug FROM posts)) AS landed_on_a_post,
       count(*) FILTER (WHERE source = 'blog-lead') AS blog_form,
       count(*) AS all_leads
  FROM leads
 GROUP BY 1
 ORDER BY 1;
