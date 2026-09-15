-- Part 1: BBL recovery figures (§J) and claim integrity (§L)
--
-- Target: PRODUCTION.  Run from your own prompt:
--     ! psql "$POSTGRES_URL_PROD" -f implementation-plans/2026-09-15-bbl-figures-travel-claims/part1-figures-and-claims.sql
--
-- Safety: one transaction.  Every swap asserts its old string occurs
-- exactly once first, so a single drifted sentence aborts the whole run
-- and changes nothing.  All 30 literals below were verified against
-- production on 2026-09-15 (each matched exactly once).
--
-- NOTE: updating `content` fires the trigger that resets
-- content_updated_at to now().  That is intended here — these are real
-- content changes, and they should drive sitemap lastmod and decay.
--
-- Sources for every replacement figure: see plan.md §Sources.
--   S1 ASPS "Six things…" (2022) · S2 ASPS blog (2016) · S3 ASPS
--   "Boarding groups" (2023) · S4 The Aesthetic Society · S5 Cleveland
--   Clinic · S10 Semin Plast Surg 2020 · S16 ASJ Open Forum 2025

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.swap(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE hits int;
BEGIN
    SELECT (length(content) - length(replace(content, p_old, ''))) / length(p_old)
      INTO hits
      FROM blog_post WHERE slug = p_slug AND status = 'published';
    IF hits IS NULL THEN
        RAISE EXCEPTION 'post not found or not published: %', p_slug;
    END IF;
    IF hits <> 1 THEN
        RAISE EXCEPTION '% : expected old string exactly once, found %', p_slug, hits;
    END IF;
    UPDATE blog_post SET content = replace(content, p_old, p_new)
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.swap_meta(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE n int;
BEGIN
    SELECT count(*) INTO n FROM blog_post
     WHERE slug = p_slug AND status = 'published' AND meta_description = p_old;
    IF n <> 1 THEN
        RAISE EXCEPTION '% : meta_description did not match (got % rows)', p_slug, n;
    END IF;
    UPDATE blog_post SET meta_description = p_new
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

-- ===================================================================
-- §J  bbl-compression-garment-timeline
-- Standard: 24/7 except showering month 1, >= 12 h/day month 2, or as
-- your surgeon directs (S1; garment-duration evidence is thin, S9).
-- ===================================================================
SELECT pg_temp.swap('bbl-compression-garment-timeline',
$o$Typically 24/7 for 2-6 weeks post-op, then tapering to 12-18 hours daily through week 8, and nightly up to 12 weeks.$o$,
$n$Typically 24/7, except in the shower, for the first month, then at least 12 hours a day through week 8, or as your surgeon directs.$n$);

SELECT pg_temp.swap('bbl-compression-garment-timeline',
$o$note that most patients need consistent compression for at least 6-8 weeks.$o$,
$n$describe wearing compression for about eight weeks.$n$);

SELECT pg_temp.swap('bbl-compression-garment-timeline',
$o$From the initial 24/7 phase to tapered nightly support$o$,
$n$From the initial 24/7 month to at least 12 hours a day in the second month$n$);

SELECT pg_temp.swap_meta('bbl-compression-garment-timeline',
$o$Discover compression garment after BBL timeline: Weeks 1-2 24/7, 3-6 12-18hrs. Reduce swelling, Miami humidity tips. Book consult now!$o$,
$n$How long to wear a compression garment after a BBL: 24/7 for the first month, then at least 12 hours a day through week 8. Plus tips for Miami heat.$n$);

-- ===================================================================
-- §J  exercises-after-bbl-timeline
-- Standard: nothing strenuous month 1, light activity after ~1 month,
-- normal exercise at 8 weeks once cleared (S4 "after eight weeks", S2, S5).
-- Ranks at position ~6.6 — sentence-level edits only, headings untouched.
-- ===================================================================
SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$Plan on waiting about 12 weeks for HIIT or running, once swelling resolves and fat stabilizes.$o$,
$n$Plan on returning to HIIT or running at about 8 weeks, once your surgeon clears you.$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$helps most return to normal activities by 12 weeks.$o$,
$n$helps most return to normal activities by about 8 weeks.$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$until full clearance, typically 8-12 weeks post-procedure.$o$,
$n$until full clearance, typically around 8 weeks post-procedure.$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$should be delayed until 12 weeks or later.$o$,
$n$should be delayed until your surgeon clears you, usually around 8 weeks.$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$Avoid squats, lunges, crunches, and high-impact moves for 8-12 weeks$o$,
$n$Avoid squats, lunges, crunches, and high-impact moves for about 8 weeks$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$Add glute-focused strength training after 12 weeks$o$,
$n$Add glute-focused strength training once your surgeon clears you, usually around 8 weeks$n$);

SELECT pg_temp.swap('exercises-after-bbl-timeline',
$o$explicit surgeon approval at your 12-week follow-up$o$,
$n$explicit surgeon approval at the visit where your surgeon clears you$n$);

-- ===================================================================
-- §J  how-to-sleep-after-bbl
-- Standard: stomach OR side from the start; off the back until cleared,
-- up to 8 weeks (S5 "sleep on your stomach or sides", S1, S2).
-- The "exclusively on your stomach for six weeks" instruction is
-- stricter than any checked source.
-- ===================================================================
SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$you'll need to sleep exclusively on your stomach for six weeks$o$,
$n$you'll need to sleep on your stomach or your side, and stay off your back until your surgeon clears it$n$);

SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$Some patients consider **side sleeping** after four weeks, though this risks pressure on surgical sites and **compromised results**.$o$,
$n$**Side sleeping** is fine from the start, as long as you keep direct pressure off your buttocks.$n$);

SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$We recommend maintaining this position for six weeks following your Brazilian Butt Lift$o$,
$n$Stay off your back until your surgeon clears it, which can take up to eight weeks$n$);

SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$you must **sleep on your stomach exclusively**$o$,
$n$sleep on your stomach or your side$n$);

SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$sleeping on your back or buttocks during the first six weeks$o$,
$n$sleeping on your back or buttocks before your surgeon clears it, which can take up to eight weeks$n$);

-- §L Tier 2: no study supports "30% faster". Note the curly apostrophe.
SELECT pg_temp.swap('how-to-sleep-after-bbl',
$o$Studies show that patients who follow sleep protocols heal **30% faster** than those who don’t maintain proper positioning.$o$,
$n$Keeping pressure off the grafted area is one of the few parts of recovery you control directly, which is why surgeons are strict about sleeping position.$n$);

-- ===================================================================
-- §J  flying-after-bbl-tips
-- S3: stay near the surgeon at least 4-5 days (infection typically
-- shows in 3-5). The practice's own FAQ asks for 7-10 days in Miami.
-- The post currently credits ASPS with "1-2 weeks", which ASPS does not say.
-- ===================================================================
SELECT pg_temp.swap('flying-after-bbl-tips',
$o$Most surgeons recommend avoiding flights for the first 1-2 weeks post-surgery$o$,
$n$ASPS advises staying near your surgeon for at least four to five days, because an infection typically shows within three to five days$n$);

-- Cited source (PMC7023974) says 20-50% reabsorbed, not 20-40%.
SELECT pg_temp.swap('flying-after-bbl-tips',
$o$shows 20-40% of transferred fat may naturally reabsorb in the early weeks$o$,
$n$shows 20-50% of transferred fat may naturally reabsorb in the early weeks$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$Short flights (under 3 hours) may suit weeks 3-4 with proper aids and precautions. Long-haul flights need 4-6 weeks minimum due to extended immobility risks.$o$,
$n$We ask you to stay in Miami for 7-10 days so your surgeon can see you for follow-up and clear you to fly. Longer flights mean longer stretches of sitting, so they carry more clot risk.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$avoiding buttocks pressure for at least 2-3 weeks helps maximize results$o$,
$n$avoiding direct pressure on the buttocks for at least 2 weeks, then using a BBL pillow until about week 8, helps maximize results$n$);

-- ===================================================================
-- §J  how-to-feed-the-fat-after-bbl
-- The survival figure is INVERTED here: the post says only 20-40%
-- survives. About 50-80% survives; 20-50% is reabsorbed (S1, S10).
-- ===================================================================
SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$During **fat transfer procedures**, only **20–40% of transplanted cells survive**$o$,
$n$During **fat transfer procedures**, about **50–80% of transplanted fat cells survive**$n$);

-- §L Tier 2: no checked source gives a calorie target or says high-fat
-- foods improve graft survival.
SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$We recommend consuming at least **2000 nutrient-rich calories daily** to maximize **fat graft survival**, though individual needs may vary.$o$,
$n$Eat enough to support healing rather than dieting through recovery. Your surgeon or a dietitian can set a target that fits your body size and needs.$n$);

SELECT pg_temp.swap('how-to-feed-the-fat-after-bbl',
$o$focusing on **high-fat foods** like avocados, nuts, and fatty fish that enhance fat graft survival.$o$,
$n$including healthy fats like avocados, nuts, and fatty fish as part of a balanced diet.$n$);

-- ===================================================================
-- §J  tummy-tuck-vs-bbl-miami  (comparison tables)
-- ===================================================================
SELECT pg_temp.swap('tummy-tuck-vs-bbl-miami',
$o$| **BBL** | 1 to 2 weeks | 2 to 6 weeks, BBL pillow after | 6 to 8 weeks on donor areas | Walking from day 1, full exercise at 6 to 8 weeks | 3 to 6 months |$o$,
$n$| **BBL** | 10 to 14 days | None for 2 weeks, pillow until about 8 | 24/7 for a month, 12+ hours a day in month 2 | Walking from day 1, full exercise at 8 weeks | 3 to 6 months |$n$);

SELECT pg_temp.swap('tummy-tuck-vs-bbl-miami',
$o$| **Time off work** | About 2 weeks | 1 to 2 weeks, but no sitting on the buttocks for 2 to 6 weeks |$o$,
$n$| **Time off work** | About 2 weeks | 10 to 14 days, with no direct sitting for 2 weeks and a pillow until about week 8 |$n$);

SELECT pg_temp.swap('tummy-tuck-vs-bbl-miami',
$o$| **BBL + tummy tuck** | 2 to 3 weeks | 2 to 6 weeks, plus tummy tuck positioning |$o$,
$n$| **BBL + tummy tuck** | 2 to 3 weeks | None for 2 weeks, pillow until about 8, plus tummy tuck positioning |$n$);

-- ===================================================================
-- §L TIER 1 — affirmatively false, live on production today.
-- No source supports "75% of patients within two years". Reported
-- rates run ~0.9%-17.1% pooled by implant surface and placement, with
-- older series quoting 15-45% as a clinically-significant range (S16).
-- Whether massage prevents contracture is itself unsettled.
-- ===================================================================
SELECT pg_temp.swap('how-often-to-massage-breast-after-augmentation',
$o$This regular massage routine helps prevent **capsular contracture**, which affects 75% of patients within two years post-surgery.$o$,
$n$**Capsular contracture** is the most common reason for revision after augmentation, though reported rates vary widely with implant surface and placement. A 2025 meta-analysis in *Aesthetic Surgery Journal Open Forum* found smooth implants carried roughly 2.8 times the odds of textured ones, and subpectoral placement markedly lower odds than prepectoral. Whether massage prevents it is not settled, so follow your surgeon's instructions.$n$);

-- ===================================================================
-- §L TIER 2 — unsupportable numbers removed.
-- ===================================================================
SELECT pg_temp.swap('when-to-start-lymphatic-massage-after-lipo',
$o$can reduce your **overall recovery time** by up to 50%$o$,
$n$may help you feel more comfortable while swelling settles$n$);

SELECT pg_temp.swap('how-to-regain-sensation-after-breast-reduction',
$o$approximately **20–30% of patients** face **permanent loss of sensation**$o$,
$n$some patients are left with **permanent changes in sensation**$n$);

SELECT pg_temp.swap('how-long-to-quit-smoking-before-breast-reduction',
$o$Research shows that smokers face a **40–60% increase** in overall surgical complications.$o$,
$n$Smoking restricts blood flow to healing tissue, and surgeons consistently report higher rates of wound-healing problems and infection in patients who smoke.$n$);

-- ===================================================================
-- Report what changed, then COMMIT.
-- ===================================================================
SELECT slug, content_updated_at
  FROM blog_post
 WHERE slug IN (
    'bbl-compression-garment-timeline','exercises-after-bbl-timeline',
    'how-to-sleep-after-bbl','flying-after-bbl-tips',
    'how-to-feed-the-fat-after-bbl','tummy-tuck-vs-bbl-miami',
    'how-often-to-massage-breast-after-augmentation',
    'when-to-start-lymphatic-massage-after-lipo',
    'how-to-regain-sensation-after-breast-reduction',
    'how-long-to-quit-smoking-before-breast-reduction')
 ORDER BY slug;

COMMIT;

-- After COMMIT, revalidate (10 tags per call):
--   blog-posts, sitemap-urls, and blog-post-<slug> for each of the 10 slugs above.
