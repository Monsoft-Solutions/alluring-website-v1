-- Part 4: the same §J/§L figures, in the `faqs` column
--
--   ! psql "$POSTGRES_URL_PROD" -f implementation-plans/2026-09-15-bbl-figures-travel-claims/part4-faqs-jsonld.sql
--
-- WHY THIS EXISTS
-- Parts 1-3 edited `content` only, and their verification queries read
-- `content` only. They reported clean while the identical claims were
-- still live in `faqs`, which renders as FAQPage JSON-LD — the copy
-- Google and AI crawlers actually consume. After part1, four posts
-- contradicted themselves: corrected prose, uncorrected structured data.
-- e.g. how-to-sleep-after-bbl prose said "stomach or side, off your back
-- until cleared" while its FAQ still said "exclusively on your stomach
-- for at least six weeks".
--
-- Checked and clean, so not touched here: travel/non-US claims in `faqs`
-- (0 rows), and `quick_answer` / `ai_summary` (0 rows).
--
-- NOT IN SCOPE: ten non-BBL posts carry generic "8-12 weeks" exercise
-- figures in their faqs. They were never part of §J and there is no
-- sourced standard for those procedures yet. See plan §L Tier 3.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.swap_faqs(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE t text; hits int;
BEGIN
    SELECT faqs::text INTO t FROM blog_post WHERE slug = p_slug AND status = 'published';
    IF t IS NULL THEN RAISE EXCEPTION '% : no faqs', p_slug; END IF;
    hits := (length(t) - length(replace(t, p_old, ''))) / length(p_old);
    IF hits <> 1 THEN
        RAISE EXCEPTION '% faqs : expected 1, found % -- %', p_slug, hits, left(p_old, 60);
    END IF;
    UPDATE blog_post SET faqs = replace(faqs::text, p_old, p_new)::jsonb
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

-- 1. Garment schedule — mirrors the part1 prose fix exactly.
SELECT pg_temp.swap_faqs('bbl-compression-garment-timeline',
$o$Typically, you should wear it 24/7 for 2-6 weeks post-op, then taper to 12-18 hours daily through week 8, and nightly up to 12 weeks.$o$,
$n$Typically, you should wear it 24/7, except in the shower, for the first month, then at least 12 hours a day through week 8, or as your surgeon directs.$n$);

-- 2. Sleeping position — prose already says stomach or side, off the back.
SELECT pg_temp.swap_faqs('how-to-sleep-after-bbl',
$o$After a BBL, you should sleep exclusively on your stomach for at least six weeks.$o$,
$n$After a BBL, sleep on your stomach or your side, and stay off your back until your surgeon clears it, which can take up to eight weeks.$n$);

-- 3. Exercise gate — 8 weeks once cleared, per The Aesthetic Society.
SELECT pg_temp.swap_faqs('exercises-after-bbl-timeline',
$o$Yes, avoid squats, lunges, crunches, and high-impact moves for 8-12 weeks to prevent pressure on your grafts.$o$,
$n$Yes, avoid squats, lunges, crunches, and high-impact moves for about 8 weeks, until your surgeon clears you, to prevent pressure on your grafts.$n$);

-- 4-5. Calorie targets — no checked source gives one for graft survival.
SELECT pg_temp.swap_faqs('how-to-feed-the-fat-after-bbl',
$o$Focus on consuming at least 2000 nutrient-rich calories daily, prioritizing high-protein foods$o$,
$n$Focus on eating enough to support healing rather than restricting calories, prioritizing high-protein foods$n$);

SELECT pg_temp.swap_faqs('how-to-feed-the-fat-after-bbl',
$o$A strategic meal plan with smaller, frequent meals that provide at least 2000 calories daily is ideal.$o$,
$n$A strategic meal plan with smaller, frequent balanced meals is ideal.$n$);

-- Verify across EVERY rendered text column, not just content. Expect 0 rows.
SELECT slug FROM blog_post
 WHERE status = 'published'
   AND (content || coalesce(excerpt,'') || coalesce(meta_description,'')
        || coalesce(faqs::text,'') || coalesce(quick_answer,'') || coalesce(ai_summary,''))
       ~* '(2,?000 (nutrient-rich )?calor|20\s*[-–]\s*40\s*%|baseline survival|12\s*[-–]\s*18\s*hour|exclusively on your stomach|24/7 for 2-6 weeks|75% of patients|30% faster|by up to 50%)';

COMMIT;
