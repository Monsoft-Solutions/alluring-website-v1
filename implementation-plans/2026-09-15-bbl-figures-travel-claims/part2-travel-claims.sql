-- Part 2: Travel and non-US claims in published posts (§K)
--
-- Target: PRODUCTION. Run AFTER part1, from your own prompt:
--   ! psql "$POSTGRES_URL_PROD" -f implementation-plans/2026-09-15-bbl-figures-travel-claims/part2-travel-claims.sql
--
-- Rule (CLAUDE.md): the practice serves US patients and coordinates no
-- travel. Out-of-state patients ARE marketed to (D5) — the value is
-- clinical: surgery, pre-op and follow-up dates in writing, and how many
-- nights in Miami before clearance to fly. Bilingual support stays, but
-- names no country of origin.
--
-- Links to /fly-in-consultation are PRESERVED (D6 keeps that page).
-- Only fly-in *packages/logistics/deals/support* are service claims.
--
-- 23 published posts, one transaction, every swap count-asserted.

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

-- For phrases that legitimately recur; asserts the expected count.
CREATE OR REPLACE FUNCTION pg_temp.swap_n(p_slug text, p_old text, p_new text, p_n int)
RETURNS void AS $f$
DECLARE hits int;
BEGIN
    SELECT (length(content) - length(replace(content, p_old, ''))) / length(p_old)
      INTO hits FROM blog_post WHERE slug = p_slug AND status = 'published';
    IF hits <> p_n THEN
        RAISE EXCEPTION '% : expected % occurrences, found % -- %', p_slug, p_n, hits, left(p_old, 60);
    END IF;
    UPDATE blog_post SET content = replace(content, p_old, p_new)
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.swap_faqs(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE t text; hits int;
BEGIN
    SELECT faqs::text INTO t FROM blog_post WHERE slug = p_slug AND status = 'published';
    IF t IS NULL THEN RAISE EXCEPTION '% : no faqs', p_slug; END IF;
    hits := (length(t) - length(replace(t, p_old, ''))) / length(p_old);
    IF hits < 1 THEN RAISE EXCEPTION '% faqs : not found -- %', p_slug, left(p_old, 60); END IF;
    UPDATE blog_post SET faqs = replace(faqs::text, p_old, p_new)::jsonb
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.swap_excerpt(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE n int;
BEGIN
    SELECT count(*) INTO n FROM blog_post
     WHERE slug = p_slug AND status = 'published' AND position(p_old in excerpt) > 0;
    IF n <> 1 THEN RAISE EXCEPTION '% : excerpt did not match', p_slug; END IF;
    UPDATE blog_post SET excerpt = replace(excerpt, p_old, p_new)
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.swap_meta(p_slug text, p_old text, p_new text)
RETURNS void AS $f$
DECLARE n int;
BEGIN
    SELECT count(*) INTO n FROM blog_post
     WHERE slug = p_slug AND status = 'published' AND position(p_old in meta_description) > 0;
    IF n <> 1 THEN RAISE EXCEPTION '% : meta_description did not match', p_slug; END IF;
    UPDATE blog_post SET meta_description = replace(meta_description, p_old, p_new)
     WHERE slug = p_slug AND status = 'published';
END $f$ LANGUAGE plpgsql;

-- ===================================================================
-- 1. best-board-certified-plastic-surgeons-miami  (worst offender)
--    Offers airport transfers and hotel stays we do not provide.
-- ===================================================================
SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$For medical tourists, we offer bilingual (English/Spanish) support, virtual pre-op consults, and fly-in packages. These cover airport transfers and post-op hotel stays.$o$,
$n$For patients travelling in from other states, we offer bilingual (English/Spanish) support and virtual pre-op consults, and we confirm your surgery, pre-op and follow-up dates in writing before you book a flight. You arrange your own travel and lodging.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$For medical tourists from Latin America or the Caribbean, certification guarantees personalized protocols amid travel logistics.$o$,
$n$For patients travelling in from other states, certification is what tells you the protocols are the same wherever you happen to live.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$Prioritize ABPS status, AAAASF accreditation, bilingual support, and fly-in logistics.$o$,
$n$Prioritize ABPS status, AAAASF accreditation, bilingual support, and a practice that confirms your dates in writing before you travel.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$This is key for medical tourists seeking reliable results.$o$,
$n$This is key for patients travelling in for surgery.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$- Alluring Plastic Surgery offers double board certified expertise with medical tourist support.$o$,
$n$- Alluring Plastic Surgery offers double board certified expertise and supports patients travelling in from other states.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$Miami's vibrant cosmetic scene attracts medical tourists, but elevated risks persist.$o$,
$n$Miami's vibrant cosmetic scene attracts patients from across the country, but elevated risks persist.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$Miami's medical tourism scene amplifies dangers—25 BBL deaths occurred in South Florida alone between 2010 and 2022.$o$,
$n$Miami's high-volume cosmetic surgery market amplifies dangers—25 BBL deaths occurred in South Florida between 2010 and 2022, and 92% were at high-volume budget clinics.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$How do I choose the best plastic surgeons in Miami as a medical tourist?$o$,
$n$How do I choose the best plastic surgeons in Miami if I am travelling from another state?$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$with a small “Miami medical tourism” callout.$o$,
$n$with a small “accreditation matters” callout.$n$);

SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$## Why Does Alluring Plastic Surgery Excel for Medical Tourists Seeking Board Certified Plastic Surgeons in Miami?$o$,
$n$## Why Does Alluring Plastic Surgery Excel for Out-of-State Patients Seeking Board Certified Plastic Surgeons in Miami?$n$);

-- Capitalised variant, missed by the lowercase phrase inventory.
SELECT pg_temp.swap('best-board-certified-plastic-surgeons-miami',
$o$Medical tourists, start with a [free fly-in consultation](/fly-in-consultation) or virtual review.$o$,
$n$Travelling in from another state? Start with a [free fly-in consultation](/fly-in-consultation) or virtual review.$n$);

SELECT pg_temp.swap_faqs('best-board-certified-plastic-surgeons-miami',
$o$How do I choose the best plastic surgeons in Miami as a medical tourist?$o$,
$n$How do I choose the best plastic surgeons in Miami if I am travelling from another state?$n$);

SELECT pg_temp.swap_faqs('best-board-certified-plastic-surgeons-miami',
$o$Prioritize ABPS status, AAAASF accreditation, bilingual support, and fly-in logistics.$o$,
$n$Prioritize ABPS status, AAAASF accreditation, bilingual support, and a practice that confirms your dates in writing before you travel.$n$);

SELECT pg_temp.swap_faqs('best-board-certified-plastic-surgeons-miami',
$o$Miami's medical tourism scene amplifies dangers$o$,
$n$Miami's high-volume cosmetic surgery market amplifies dangers$n$);

SELECT pg_temp.swap_excerpt('best-board-certified-plastic-surgeons-miami',
$o$perfect for medical tourists$o$, $n$built for out-of-state patients$n$);

SELECT pg_temp.swap_meta('best-board-certified-plastic-surgeons-miami',
$o$double-certified experts for medical tourists$o$, $n$double-certified experts for out-of-state patients$n$);

-- ===================================================================
-- 2. safe-plastic-surgery-miami  (offers fly-in packages + lodging tips)
-- ===================================================================
SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$Our bilingual team supports medical tourists with comprehensive fly-in packages.$o$,
$n$Our bilingual team supports patients travelling in from other states, with your surgery and follow-up dates confirmed in writing before you book.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$Our [fly-in consultation](/fly-in-consultation) includes recovery lodging tips.$o$,
$n$Our [fly-in consultation](/fly-in-consultation) tells you how many nights you need in Miami before you are cleared to fly home. You book your own stay.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$Patients like Maria, a Latin American visitor, share their experiences.$o$,
$n$Patients who travelled in for surgery share their experiences.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$For those exploring **plastic surgery Miami** as medical tourists, these figures show why prioritizing safety matters.$o$,
$n$For those travelling to Miami for **plastic surgery**, these figures show why prioritizing safety matters.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$You'll learn about common red flags to sidestep and tailored tips for medical tourists in Miami's unique climate.$o$,
$n$You'll learn about common red flags to sidestep and tailored tips for recovering in Miami's unique climate.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$This elevates infection risks, especially for medical tourists who face follow-up challenges.$o$,
$n$This elevates infection risks, especially for patients who head home before healing is complete.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$These steps make **accredited plastic surgery Miami** a seamless path to renewal for visitors from around the world.$o$,
$n$These steps make **accredited plastic surgery Miami** a seamless path to renewal for patients travelling in from across the United States.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$For medical tourists, confirm post-op support options like virtual follow-ups.$o$,
$n$If you are travelling in, confirm post-op support options like virtual follow-ups.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$From ABPS-certified expertise and AAAASF accreditation to Miami-tailored care for medical tourists, we've built our reputation on results.$o$,
$n$From ABPS-certified expertise and AAAASF accreditation to Miami-tailored care for patients travelling in, we've built our reputation on results.$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$## What Safety Tips Should Medical Tourists Know About Miami?$o$,
$n$## What Safety Tips Should Out-of-State Patients Know About Miami?$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$### Are there specific regulations in Miami that protect medical tourists?$o$,
$n$### Are there specific regulations in Florida that protect surgical patients?$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$### How do complication rates compare for medical tourists in Miami?$o$,
$n$### How do complication rates compare for patients travelling in for surgery?$n$);

SELECT pg_temp.swap('safe-plastic-surgery-miami',
$o$“Miami Medical Tourist Recovery Checklist”$o$,
$n$“Recovery Checklist for Out-of-State Patients”$n$);

SELECT pg_temp.swap_faqs('safe-plastic-surgery-miami',
$o$Are there specific regulations in Miami that protect medical tourists?$o$,
$n$Are there specific regulations in Florida that protect surgical patients?$n$);

SELECT pg_temp.swap_faqs('safe-plastic-surgery-miami',
$o$How do complication rates compare for medical tourists in Miami?$o$,
$n$How do complication rates compare for patients travelling in for surgery?$n$);

-- ===================================================================
-- 3. flying-after-bbl-tips
--    Two whole sections promise hotels, recovery suites and rideshares.
--    Replaced with clinical-only guidance (S3 + the practice's own FAQ).
-- ===================================================================
SELECT pg_temp.swap('flying-after-bbl-tips',
$o$## Miami Medical Tourism: Local Logistics for Travel After BBL

Miami's allure draws patients worldwide for **BBL medical tourism Miami**, but logistics matter post-procedure. Planning your local stay and eventual departure reduces stress during recovery.

Our clinic at 8435 SW 24th St sits just 10-15 minutes from Miami International Airport (MIA), simplifying transfers. This proximity means less time in vehicles when you're most uncomfortable. Many patients appreciate the short distance when returning for follow-up appointments.

Schedule follow-ups on days 1, 7, and 14 before departing—virtual options extend care homeward. These appointments let your surgeon assess healing and clear you for travel. Don't skip them, even if you feel fine. Problems can develop that only a trained eye catches early.

Arrange hotel recovery suites with stomach-sleeping setups and rideshares, avoiding driving initially. Many Miami hotels near the clinic cater to medical tourists and understand recovery needs. Ask about firm mattresses and pillow arrangements that support prone sleeping.

Bilingual staff supports Spanish-speaking patients from Latin America and the Caribbean. Communication shouldn't be a barrier during your recovery, and our team ensures you understand every instruction.

Combine with our [Miami BBL recovery guide](/how-long-to-recover-from-bbl) for heat tips. Miami's climate affects swelling and comfort, so local knowledge helps. This smooth support ensures safe **BBL recovery travel**.$o$,
$n$## Staying in Miami After Your BBL

If you are travelling in for surgery, the part that matters is the schedule, not the sightseeing. You get your surgery, pre-op and follow-up dates in writing before you book anything, so you can buy tickets around a calendar that is already fixed.

Plan on 7-10 days in Miami. That is what the practice asks for so your surgeon can see you for follow-up and clear you to fly home. ASPS puts the clinical floor lower — at least four to five days near your surgeon, because an infection typically shows within three to five days — but the follow-up schedule is what sets your date.

Follow-ups fall on days 1, 7, and 14, with virtual check-ins once you are home. Do not skip them even if you feel fine; problems can develop that only a trained eye catches early.

To be clear about what we do and do not handle: we schedule your appointments and tell you how many nights you need. We do not book flights, lodging or transport, and we are not affiliated with any recovery house, so we cannot reserve one for you or vouch for one. You arrange your own stay.

Care is available in English and Spanish. Combine this with our [Miami BBL recovery guide](/how-long-to-recover-from-bbl) for tips on recovering in Miami's heat.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$For medical tourists, budgeting includes more than the procedure itself. Factor in your extended Miami stay, accommodations, transportation, and potential flight changes if recovery requires more time. Planning financially for a 10-14 day minimum stay prevents stress.$o$,
$n$If you are travelling in, budgeting includes more than the procedure itself. Factor in your stay in Miami and the possibility of changing a flight if recovery needs more time. Planning for 7-10 nights prevents stress.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$Many patients embarking on their **Brazilian Butt Lift (BBL)** journey in Miami as medical tourists face a common question: when is it safe for **travel after BBL**?$o$,
$n$Many patients who travel to Miami for a **Brazilian Butt Lift (BBL)** face a common question: when is it safe for **travel after BBL**?$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$The idea that you must stay grounded for months often creates unnecessary anxiety, especially when returning home to Latin America or the Caribbean calls.$o$,
$n$The idea that you must stay grounded for months often creates unnecessary anxiety, especially when you have a home and a job in another state waiting.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$For Miami patients or medical tourists, understanding these basics ensures your transformation endures.$o$,
$n$Whether you live in Miami or are travelling in, understanding these basics ensures your transformation endures.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$For **BBL medical tourism Miami** patients, plan to stay locally for typically 10-14 days based on surgeon protocols for initial follow-ups.$o$,
$n$If you are travelling in, plan to stay locally for 7-10 days so your surgeon can see you for follow-up and clear you to fly.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$These steps, drawn from recovery protocols, help medical tourists transition smoothly back home.$o$,
$n$These steps, drawn from recovery protocols, help you transition smoothly back home.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$For **BBL medical tourism Miami** patients, plan your return flight accordingly and get personalized advice from your surgeon.$o$,
$n$Plan your return flight accordingly and get personalized advice from your surgeon.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$Victoria Karlinsky leads our AAAASF-accredited facility with extensive experience serving medical tourists from across the Americas.$o$,
$n$Victoria Karlinsky leads our AAAASF-accredited facility with extensive experience serving patients from across the United States.$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$In this guide tailored for Miami patients and **BBL medical tourism**, you'll discover:$o$,
$n$In this guide, tailored for Miami patients and those travelling in for a **BBL**, you'll discover:$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$### Can I travel internationally within two weeks of a BBL?$o$,
$n$### How long should I wait before a long flight home?$n$);

SELECT pg_temp.swap('flying-after-bbl-tips',
$o$Typically no—most guidelines advise 2-4 weeks minimum for international trips to mitigate DVT and pressure risks. The extended flight times and potential layovers make early international travel particularly risky.$o$,
$n$Plan on 7-10 days in Miami before you fly, which is when your surgeon can see you for follow-up and clear you. Longer flights and layovers mean longer stretches of sitting, which raises both clot risk and pressure on the grafted area.$n$);

SELECT pg_temp.swap_excerpt('flying-after-bbl-tips',
$o$packing lists & Miami medical tourism advice for flawless recovery.$o$,
$n$packing lists and how long to stay in Miami before you fly home.$n$);

-- ===================================================================
-- 4-23. Single-sentence fixes across the remaining 20 posts.
-- ===================================================================
SELECT pg_temp.swap('affordable-plastic-surgery-miami',
$o$Medical tourism patients find our comprehensive approach covers every detail from arrival to recovery.$o$,
$n$Patients travelling in from other states find our approach covers the clinical detail: confirmed dates, written instructions, and follow-up before you fly home.$n$);

SELECT pg_temp.swap('blepharoplasty-questions-miami',
$o$Bilingual staff supports our diverse patient community, including medical tourists from around the world.$o$,
$n$Bilingual staff supports our diverse patient community, including patients travelling in from other states.$n$);

SELECT pg_temp.swap('board-certified-plastic-surgeon-miami',
$o$Yet in Miami, where demand for transformations like **Brazilian Butt Lifts (BBL)** and **Mommy Makeovers** draws medical tourists from around the world, risks rise with unqualified providers.$o$,
$n$Yet in Miami, where demand for transformations like **Brazilian Butt Lifts (BBL)** and **Mommy Makeovers** draws patients from across the country, risks rise with unqualified providers.$n$);

SELECT pg_temp.swap('board-certified-plastic-surgeon-miami',
$o$Miami's bustling market attracts unqualified providers, amplifying risks like those seen in medical tourism complications.$o$,
$n$Miami's bustling market attracts unqualified providers, amplifying the risks that follow from choosing on price alone.$n$);

SELECT pg_temp.swap('board-certified-plastic-surgeon-miami',
$o$Humidity and travel stress can also hinder recovery, so prioritize local follow-up care over fly-in deals that seem too good to be true.$o$,
$n$Humidity and travel stress can also hinder recovery, so prioritize proper follow-up care over deals that seem too good to be true.$n$);

SELECT pg_temp.swap('board-certified-plastic-surgeon-miami',
$o$Our practice offers bilingual consultations and comprehensive post-op support ideal for busy professionals and medical tourists alike.$o$,
$n$Our practice offers bilingual consultations and thorough post-op support, for local patients and those travelling in alike.$n$);

SELECT pg_temp.swap('breast-augmentation-before-after-miami',
$o$Bilingual staff support medical tourists, ensuring reassuring experiences from consultation through recovery.$o$,
$n$Bilingual staff support patients travelling in from other states, from consultation through recovery.$n$);

SELECT pg_temp.swap('breast-augmentation-candidate-quiz',
$o$Local perks include quick access to beaches post-recovery (around 6 weeks) and bilingual support for Latin American visitors.$o$,
$n$Local perks include quick access to beaches post-recovery (around 6 weeks) and bilingual support in English and Spanish.$n$);

SELECT pg_temp.swap('breast-augmentation-miami-post-pregnancy',
$o$In Miami's vibrant scene, our bilingual team supports medical tourists with seamless care from consultation through recovery.$o$,
$n$In Miami's vibrant scene, our bilingual team supports patients travelling in from other states, from consultation through recovery.$n$);

SELECT pg_temp.swap('breast-augmentation-recovery-miami',
$o$luxury clinic recovery suite$o$, $n$luxury clinic recovery room$n$);

SELECT pg_temp.swap('breast-augmentation-safety-miami',
$o$Her team provides bilingual support for medical tourists navigating recovery in an unfamiliar city.$o$,
$n$Her team provides bilingual support for patients navigating recovery in an unfamiliar city.$n$);

SELECT pg_temp.swap('breast-implant-illness-symptoms',
$o$Many practices offer bilingual support for international patients.$o$,
$n$Many practices offer bilingual support in English and Spanish.$n$);

SELECT pg_temp.swap('breast-lift-miami-post-pregnancy',
$o$Our facility at 8435 SW 24th St ensures luxury care, from fly-in support for out-of-town patients to thorough post-op follow-ups.$o$,
$n$Our facility at 8435 SW 24th St ensures luxury care, from virtual consultations for out-of-state patients to thorough post-op follow-ups.$n$);

SELECT pg_temp.swap('breast-lift-myths-busted',
$o$We offer bilingual support for our Latin American visitors and provide a comfortable, welcoming environment for your transformation journey.$o$,
$n$We offer care in English and Spanish, and a comfortable, welcoming environment for your transformation journey.$n$);

SELECT pg_temp.swap('choose-plastic-surgeons-miami',
$o$Bilingual support matters for Latin American visitors seeking procedures here.$o$,
$n$Bilingual support matters for Spanish-speaking patients seeking procedures here.$n$);

SELECT pg_temp.swap('choose-plastic-surgeons-miami',
$o$Bilingual support and medical tourism perks make us Miami's trusted choice for humid-climate recovery.$o$,
$n$Bilingual support and a schedule confirmed in writing make us Miami's trusted choice for humid-climate recovery.$n$);

SELECT pg_temp.swap('mini-tummy-tuck-miami-recovery',
$o$Bilingual staff supports post-pregnancy moms and medical tourists throughout their journey.$o$,
$n$Bilingual staff supports post-pregnancy moms and out-of-state patients throughout their journey.$n$);

SELECT pg_temp.swap('tummy-tuck-mommy-makeover-miami',
$o$Our bilingual staff supports Miami's diverse community, including medical tourists from across the globe.$o$,
$n$Our bilingual staff supports Miami's diverse community, including patients travelling in from other states.$n$);

SELECT pg_temp.swap('tummy-tuck-recovery-time-miami',
$o$Medical tourists visiting for their procedure should plan 2-week stays to accommodate follow-up appointments.$o$,
$n$Patients travelling in for their procedure should plan 2-week stays to accommodate follow-up appointments.$n$);

SELECT pg_temp.swap('tummy-tuck-drains-what-they-are-how-long-they-stay',
$o$That last question matters most for fly-in patients.$o$,
$n$That last question matters most if you are travelling in from another state.$n$);

-- ===================================================================
-- Verify nothing survives, then COMMIT.
-- ===================================================================
SELECT slug FROM blog_post
 WHERE status = 'published'
   AND (content || coalesce(excerpt,'') || coalesce(meta_description,'') || coalesce(faqs::text,''))
       ~* '(medical touris|fly-in package|fly-in logistics|fly-in deals|airport transfer|recovery lodging|Latin America|Caribbean|international patient|patients worldwide|from around the world|across the globe|across the Americas)';
-- Expect: 0 rows.

COMMIT;

-- After COMMIT, revalidate blog-posts, sitemap-urls, and blog-post-<slug>
-- for all 23 slugs (10 tags per call).
