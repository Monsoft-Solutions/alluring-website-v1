-- Part 3: residuals on how-to-feed-the-fat-after-bbl
--
-- Why this exists: part1 fixed ONE of four calorie claims on this post and
-- did not remove the infographic at all, so after part1 the page said
-- "about 50-80% of transplanted fat cells survive" in prose while its own
-- infographic caption still said "20-40% baseline survival". Two of these
-- were missed because the post-run check only looked for the exact string
-- "2000 nutrient-rich" and for prose, not image alt text.
--
--   ! psql "$POSTGRES_URL_PROD" -f implementation-plans/2026-09-15-bbl-figures-travel-claims/part3-feed-the-fat-residuals.sql
--
-- Same count-asserted pattern: any drift aborts and changes nothing.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.swap(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE hits int;
BEGIN
    SELECT (length(content) - length(replace(content, p_old, ''))) / length(p_old)
      INTO hits FROM blog_post WHERE slug = p_slug AND status = 'published';
    IF hits IS NULL THEN RAISE EXCEPTION 'post not found: %', p_slug; END IF;
    IF hits <> 1 THEN
        RAISE EXCEPTION '% : expected 1 occurrence, found % -- %', p_slug, hits, left(p_old, 60);
    END IF;
    UPDATE blog_post SET content = replace(content, p_old, p_new)
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

-- 1. The infographic. The 20-40% figure is baked into the image itself, so
--    the image is removed rather than re-captioned (plan §J said to do this;
--    part1 omitted it). Nothing replaces it: the surrounding prose already
--    carries the sourced figure.
SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$![Infographic: “BBL Fat Graft Survival Basics” showing 20–40% baseline survival, factors that support survival (adequate calories, protein, hydration) and a “first 3 months matter most” callout in beige/cream with gold accents.](https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/blog-images/6d76b506-115d-4aae-be08-4254a29e7fa7/1768927658860-lbdq04-0.jpg)$o$,
$n$$n$);

-- 2-4. The three surviving "2000 calories" claims. No checked source gives a
--      calorie target for graft survival.
SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$We recommend consuming at least **2000 nutrient-rich calories daily** to support healing and recovery.$o$,
$n$Eat enough to support healing rather than restricting calories while you recover.$n$);

SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$Maintaining a **balanced diet** with **adequate caloric intake** (at least **2000 calories daily**) helps preserve the transferred fat and promotes the **best results**.$o$,
$n$Maintaining a **balanced diet** with **adequate caloric intake** supports healing and the **best results**.$n$);

SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$We recommend preparing **balanced meals** that deliver at least **2000 calories daily** during initial recovery, including healthy fats like avocados, nuts, and fatty fish as part of a balanced diet.$o$,
$n$We recommend preparing **balanced meals** during initial recovery, including healthy fats like avocados, nuts, and fatty fish as part of a balanced diet.$n$);

-- Verify: expect 0 rows.
SELECT slug FROM blog_post
 WHERE status = 'published'
   AND content ~* '(20\s*[-–]\s*40\s*%|2000 calories|2,000 calories|2000 nutrient-rich|baseline survival)';

COMMIT;
