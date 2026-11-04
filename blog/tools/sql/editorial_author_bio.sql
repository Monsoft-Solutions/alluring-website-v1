-- The editorial author's bio, in the admin and open to the blog pipeline, still
-- claims "board-certified surgeons". The public byline reads `authors.data.ts`,
-- so this brings the row into line with it (#357). Safe to re-run: it changes
-- nothing once the old text is gone.
--
-- Run:
--   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f blog/tools/sql/editorial_author_bio.sql
UPDATE author
SET bio = 'Patient information about cosmetic procedures, from our editorial team.',
    updated_at = now()
WHERE name = 'Alluring Editorial Team'
  AND bio LIKE 'Expert insights%'
RETURNING name, bio;
