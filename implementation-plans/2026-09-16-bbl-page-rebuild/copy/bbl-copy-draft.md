# BBL page copy — draft for review (#252)

Draft of 2026-09-18 for epic #246. Source files, on branch `feat/bbl-page-copy-252`:

- `apps/web/components/procedures/pages/bbl/bbl-page.content.ts`: the copy, in the #256 section order
- `apps/web/lib/data/procedures/facts/bbl.facts.ts`: every figure the page may state, one statement each, with its source and attribution
- `apps/web/scripts/check-bbl-copy.ts`: the sweep (`pnpm --filter web check:bbl-copy`, `--launch` for #256, `--map` for the table below)

Nothing here renders yet. The live page is unchanged until #256.

**Placeholders.** `{{BBL_SURGEON}}` and `{{CREDENTIALS}}` wait on #247's two blocking answers. `{{CREDENTIALS}}` takes the exact approved sentence, e.g. _"Dr. Victoria Karlinsky is board certified by the American Board of Cosmetic Surgery."_ The sweep warns on them now and fails on them with `--launch`.

## Size

2,959 words of visible copy (alt text excluded), against ~2,800 in #252 and 4,518 today. 11 FAQs (26 today). Every question-phrased H2 opens with a 40–60 word answer; the sweep enforces it.

| Section                      |     Words |
| ---------------------------- | --------: |
| Hero                         |        69 |
| Jump links                   |         6 |
| What is a BBL? + at a glance |       184 |
| Cost                         |       310 |
| Before & after               |        85 |
| Safety                       |       374 |
| Surgeon                      |       157 |
| Which BBL                    |       238 |
| How it is performed          |       211 |
| Recovery                     |       421 |
| Reviews                      |        51 |
| FAQ                          |       697 |
| Sources                      |        54 |
| Book                         |       100 |
| Sticky bar                   |         2 |
| **Total**                    | **2,959** |

## Judgement calls to review

1. **Surgeon section is written around Florida law, not credentials.** Until #247 answers, the section says what the law requires of whoever operates (in-person exam before surgery, personally performs the transfer, one patient at a time). The profile link points at `/dr-karlinsky`; change it if the answer to question 2 is someone else.
2. **"What the price includes" drops three items** from `pricing.includes`: "Board-certified anesthesiologist", "AAAASF-accredited surgical facility" and "24/7 surgeon access" are practice claims awaiting #247 item 3. The copy lists "Anesthesia" and "The surgical facility" without the qualifiers.
3. **The six practice claims are absent**, including ultrasound "on every case" as Alluring's own claim. The copy states the law ("Ultrasound-guided, as Florida law requires") and lets the reader draw the conclusion.
4. **No fat volumes, cc, BMI, or "strictest law in the country".** The five unsupported figures from the live page are gone, and the sweep fails on any cc or BMI figure.
5. **Surgery length (3–5 hours), general anesthesia and outpatient** are the practice's own `quickStats`, not the sourced standard. They are declared as `alluring-practice` facts.
6. **FAQ set.** Removed "How long is BBL recovery?" and "When can I sit after a BBL?": their queries belong to `/how-long-to-recover-from-bbl` and `/how-long-after-bbl-can-i-sit`, and the recovery H2 already answers them with links. Added "Can I get a BBL after pregnancy?", a query the registry assigns to this page. 11 FAQs, 10 of them clear of pricing terms, so the paid landing page keeps them.
7. **Safety H2 is "Is a BBL safe in Miami?"**, not "…in Florida?". Search Console has "is it safe to get a bbl in miami?" and "safe brazilian butt lift miami"; the answer covers Florida law.
8. **Cost H2 is "How much is a BBL in Miami?"**, the page's best query (160 impressions, position 9.7, 2 clicks in 90 days); "bbl cost miami" is in the first line of the answer.
9. **Hero image.** The live hero is a 3:2 swimwear shot, rear three-quarter view, which breaks #254's editorial rules. Decided 2026-09-18: #254 shot 1 (woman in a tailored sand midi dress at an arched window) moves before launch. The slot is `pending-254`; alt text is finalised against the chosen render, with the "Model shown. Not a patient." label.
10. **Pazmiño & Garcia (2023) and Elsaftawy et al. (2026)** were verified in PubMed on 2026-09-18 (35959568; 41051287, Plast Reconstr Surg 2026;157(3):381e–393e) and now carry their titles and DOIs.

## Search Console queries behind the headings (90 days to 2026-09-15)

| Query                                                                                               |        Impr. |               Pos. | Used for                                |
| --------------------------------------------------------------------------------------------------- | -----------: | -----------------: | --------------------------------------- |
| brazilian butt lift miami                                                                           |        1,111 |               32.8 | Hero lede and definition (H1 unchanged) |
| bbl miami                                                                                           |          615 |               48.4 | Eyebrow, at-a-glance caption            |
| how much is a bbl in miami                                                                          |          160 |                9.7 | Cost H2                                 |
| bbl cost in miami / bbl cost miami                                                                  |    131 / 112 |        18.3 / 13.0 | Cost answer                             |
| bbl surgery miami / bbl surgery in miami                                                            |    139 / 125 |        28.7 / 32.7 | "How is BBL surgery performed?"         |
| bbl procedure process miami                                                                         |           28 |               22.5 | Numbered steps                          |
| bbl surgeons in miami · top-rated brazilian butt lift surgeons in miami · best bbl surgeon in miami | 25 · 25 · 17 | 45.6 · 44.0 · 31.9 | Surgeon H2 (no "best")                  |
| safe brazilian butt lift miami · is it safe to get a bbl in miami?                                  |      27 · 19 |        26.3 · 72.3 | Safety H2                               |
| ultrasound guided brazilian butt lift miami                                                         |           16 |               75.1 | Hero chip, law list                     |
| skinny bbl miami · skinny bbl cost miami                                                            |      28 · 26 |        24.8 · 10.2 | Options, cost line on skinny BBLs       |
| bbl revision cost in miami · bbl sagging miami                                                      |      32 · 24 |        30.1 · 65.8 | Revision option                         |
| natural bbl miami                                                                                   |           19 |               13.0 | Options answer                          |

## The copy

## Hero

_H1 unchanged: "Brazilian Butt Lift (BBL) Miami" (procedure.title)._ Eyebrow: BBL in Miami

A Brazilian butt lift moves your own fat from areas such as the abdomen, flanks and back to your buttocks for more shape and fullness, without implants. In Florida, the law requires that fat to stay under the skin, placed with ultrasound guidance.

Chips: Starting at $5,500 · 3–5 hour outpatient surgery · Ultrasound-guided, as Florida law requires
CTAs: Book a free consultation · Call us
Image (#254 shot 1, labeled "Model shown. Not a patient."): Woman in a tailored sand midi dress standing at an arched window in morning light

Jump links: Cost (#pricing) · Results (#results) · Safety (#safety) · Surgeon (#surgeon) · Recovery (#recovery) · FAQ (#faq)

## What is a BBL?

A Brazilian butt lift (BBL) is a fat transfer to the buttocks. A surgeon uses liposuction to remove fat from areas such as the abdomen, flanks or back, processes it, and injects it under the skin of the buttocks to add volume and shape. Because it uses your own fat, there is no implant.

**BBL at Alluring, at a glance**

|                              |                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Starting price               | Starting at $5,500                                                                    |
| Most patients                | $5,500–$10,000, set for each patient                                                  |
| Surgery time                 | 3 to 5 hours                                                                          |
| Anesthesia and setting       | General anesthesia; outpatient, so you go home the same day                           |
| Your surgeon                 | {{BBL_SURGEON}}                                                                       |
| Florida standard             | Fat under the skin only, placed with ultrasound guidance, one surgeon for one patient |
| Back to a desk job           | 10 to 14 days, sitting on a pillow                                                    |
| Sitting                      | Not on your buttocks for 2 weeks; on a BBL pillow until about week 8                  |
| Exercise                     | Walking from day 1 or 2; normal exercise at about 8 weeks                             |
| Flying in from another state | Plan on 7 to 10 days in Miami                                                         |
| Final shape                  | 3 to 6 months after surgery                                                           |

Image (#254 shot 2, labeled): Patient at a marble table reviewing a body-contour sketch on a tablet, with only the clinician's hands and white sleeve in view

## How much is a BBL in Miami? `#pricing`

A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000. Your price is set for you after an exam, because it depends on how much fat is moved, how many areas are treated and what else is done. Price ranges are estimates and may change.

### What the price includes

- Your consultations before surgery and your surgical plan
- The surgeon's fee for the complete procedure
- Anesthesia
- The surgical facility
- Your compression garment and BBL pillow
- Every follow-up appointment after surgery

Travel and your stay in Miami are not included. If you are flying in, you arrange them yourself.

### What moves your price within the range

- **Volume of fat transferred.** A larger transfer needs more liposuction and more time in surgery than a subtle one.
- **Number of donor areas.** Taking fat from the abdomen alone is a smaller job than contouring the flanks, back and thighs in the same surgery.
- **Revision work.** Correcting an earlier BBL takes more planning and more time than a first BBL.
- **Combined procedures.** Adding a tummy tuck or another procedure to the same surgery changes the scope, and the price with it.

Skinny BBLs and revisions are priced the same way, after an exam.

### Why some BBL offers cost less

Some advertised BBL prices leave out anesthesia, the facility, garments or follow-up visits, or describe a smaller procedure than the one you want. Ask every clinic, including us, for an itemized quote. Then ask whether the surgeon places the fat under ultrasound guidance and stays with one patient for the whole surgery, as Florida law requires.

Financing is available through Cherry, CareCredit, and United Credit, subject to credit approval. Insurance does not cover a BBL, because it is a cosmetic procedure.

Your surgeon confirms your exact price at your consultation, before you commit to anything.

## BBL before and after: what do real results look like?

These are photos of real Alluring patients, shared with their consent and labeled with the time since surgery. Results differ from person to person, and your final shape shows 3 to 6 months after surgery, once swelling settles and the grafted fat that will survive has taken hold.

[See more BBL before and after photos](/gallery/brazilian-butt-lift) · Photos on this page are real patients. Images elsewhere on the page that show a model are labeled as such.

## Is a BBL safe in Miami?

A BBL's most serious risk is a fat embolism: fat injected into or below the gluteal muscle can enter a blood vessel, which can be fatal. The risk is lowest when the fat stays under the skin, and Florida law now requires exactly that, along with ultrasound guidance and one surgeon for one patient.

### What Florida law requires

- **Fat under the skin only.** Fat goes only into the layer under the skin and never crosses the fascia, the tissue that covers the gluteal muscle.
- **Ultrasound guidance.** The surgeon uses ultrasound while moving the cannula, to see where the fat is going.
- **One surgeon, one patient.** Your surgeon stays with you for the whole procedure and is not operating on anyone else at the same time.
- **An exam before surgery day.** The surgeon examines you in person no later than the day before surgery.
- **The surgeon does the transfer.** The surgeon removes and injects the fat personally. That work cannot be handed to anyone else.

### What the research shows

- **Why the law exists.** South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022. 92% of those patients had surgery at high-volume, budget clinics, and in every case examined at autopsy, fat had been injected into the muscle (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023).
- **How often complications happen.** A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, most often a seroma (a pocket of fluid) in 2.03%. Major complications were less common with ultrasound guidance: 0.02% versus 0.08% (Elsaftawy and colleagues, Plastic and Reconstructive Surgery, 2026).

### Questions to ask any BBL surgeon, including us

- Where exactly will you place the fat, and how do you confirm it stays under the skin?
- Do you watch the cannula on ultrasound while you inject?
- Will you remove and inject the fat yourself, and stay with me for the whole surgery?
- Are you operating on anyone else while I am in surgery?
- Which board certifies you? Then check that certification on the board's own website, not the clinic's.
- Who gives the anesthesia, and where does the surgery take place?

A clinic that cannot answer these clearly is one to walk away from.

## BBL surgeons in Miami: who performs your procedure

At Alluring, your BBL is performed by {{BBL_SURGEON}}. {{CREDENTIALS}} Under Florida law the surgeon examines you in person before surgery, removes and injects the fat personally and stays with you throughout, so you meet the surgeon who operates on you before surgery day.

Searching for a BBL surgeon in Miami turns up a long list of names and a wide spread of prices. What separates them is where they put the fat, whether they follow Florida law on every case, how many patients they operate on at once, and whether you can check their credentials yourself.

At your consultation, {{BBL_SURGEON}} examines you, looks at where you carry fat, and tells you which type of BBL fits your body and your goals, including when a BBL is not the right choice.

[Meet {{BBL_SURGEON}}](/dr-karlinsky) · quote and portrait render only when #247 supplies them

## Which BBL is right for you: traditional, skinny, lipo 360 or revision?

The right BBL depends on how much fat you have to move and what you want to change. A traditional BBL suits most people with fat to spare, a skinny BBL suits leaner bodies, lipo 360 reshapes the whole waist, and a revision corrects an earlier BBL. Your surgeon recommends one after an exam.

- **Traditional BBL.** Suits: People with enough fat in the abdomen, flanks or back to give the buttocks the volume they want. What changes: Adds volume and shape to the buttocks and slims the areas the fat comes from.
- **Skinny BBL.** Suits: Leaner people who want a subtle, proportionate change. What changes: A smaller volume, often gathered from several donor areas. The change is modest by design, and your surgeon tells you at the exam whether you have enough fat for the result you have in mind.
- **BBL with lipo 360.** Suits: People who want a narrower waist as well as more curve. What changes: Liposuction treats the abdomen, flanks and back all the way around, which sharpens the contrast between waist and hips.
- **BBL revision.** Suits: People unhappy with an earlier BBL because of unevenness, dents, lost volume or sagging. What changes: Starts with an exam of what was done before. Some problems are corrected with more fat, and some need a different plan. [How dents after a BBL are fixed](/how-to-fix-dents-after-bbl)

[What a double BBL is](/what-is-a-double-bbl) · [BBL vs tummy tuck, liposuction and butt implants](/blog/tummy-tuck-vs-bbl-miami)

## How is BBL surgery performed?

BBL surgery takes 3 to 5 hours under general anesthesia, and you go home the same day. The surgeon removes fat with liposuction, prepares it, injects it under the skin of the buttocks with ultrasound guidance, then closes the small incisions and fits your compression garment.

Before surgery day, your surgeon examines you in person, reviews your health history and medications, and plans where fat will be taken from and where it will go.

1. **Liposuction.** Through small incisions, the surgeon fills the donor areas with a fluid that numbs the tissue and reduces bleeding, then removes fat with a thin cannula. This is also when your waist is shaped.
2. **Preparing the fat.** The fat is separated from fluid and blood, so only usable fat is transferred.
3. **Placing the fat.** The surgeon injects the fat into the layer under the skin of the buttocks, watching the cannula on ultrasound so it never passes into the muscle.
4. **Closing and compression.** The small incisions are closed and you are fitted with a compression garment, which you wear 24/7 for the first month, or as your surgeon directs.

Someone needs to drive you home and stay with you for the first days. Walking starts early, on day 1 or 2.

## What does BBL recovery look like, week by week?

Most people return to a desk job 10 to 14 days after a BBL, sit normally and exercise again at about 8 weeks, and feel recovered at 2 to 3 months, though it can take up to 6 months. The final shape shows at 3 to 6 months. Your surgeon's instructions come first.

| When       | What happens                                                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Days 1–2   | Short walks start. The Aesthetic Society says you should be able to get up and walk after the second day, which helps prevent blood clots.                                                                                                     |
| Weeks 1–2  | The strictest stretch: no sitting or lying on your buttocks for at least 2 weeks, and sleep on your stomach or side. Most people need some pain medication for the first 4 to 5 days, and Cleveland Clinic says pain eases after 1 to 2 weeks. |
| Days 10–14 | Back to a desk job and driving, sitting on a BBL pillow. Some surgeons allow work between days 7 and 10; a job that involves lifting needs longer.                                                                                             |
| Month 1    | Compression garment 24/7, except in the shower, or as your surgeon directs. No heavy lifting or strenuous exercise.                                                                                                                            |
| Month 2    | Garment at least 12 hours a day, or as your surgeon directs. Light activity such as fast walking. Sit only briefly on a pillow, about 10 minutes at a time through week 6, as a plastic surgeon interviewed by ASPS advises.                   |
| Week 8     | Most people sit without a pillow and return to normal exercise, once their surgeon clears them.                                                                                                                                                |
| Months 2–3 | Most people feel recovered, though it can take up to 6 months. The risk of losing grafted fat drops around month 3.                                                                                                                            |
| Months 3–6 | Your final shape shows. About 50% to 80% of the grafted fat survives.                                                                                                                                                                          |

### If you are flying in from another state

Plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. We confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay; you arrange the travel itself. ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days, because an infection typically shows up 3 to 5 days after surgery.

[BBL recovery week by week](/how-long-to-recover-from-bbl) · [When you can sit after a BBL](/how-long-after-bbl-can-i-sit) · [How to sleep after a BBL](/how-to-sleep-after-bbl) · [The compression garment, stage by stage](/blog/bbl-compression-garment-timeline) · [Lymphatic massage after a BBL](/how-many-massages-after-bbl) · [Which workouts come back when](/blog/exercises-after-bbl-timeline) · [Flying home after a BBL](/blog/flying-after-bbl-tips) · [Odor after a BBL, and when it matters](/why-do-bbl-stink)

## What do BBL patients say about Alluring?

These reviews come from Alluring's public Google Business Profile. Reviews that mention a BBL appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time.

## BBL questions, answered

### Who performs BBLs at Alluring?

{{BBL_SURGEON}} performs BBLs at Alluring. {{CREDENTIALS}} Florida law requires the operating surgeon to examine you in person no later than the day before surgery and to remove and inject the fat personally, so you meet your surgeon before surgery day.

### What does Florida law require for a BBL?

Florida Statutes §458.328 requires the surgeon to inject fat only into the layer under the skin, never crossing the fascia over the gluteal muscle, and to use ultrasound guidance while moving the cannula. The surgeon must also stay with one patient for the whole procedure, examine you in person no later than the day before, and do the fat removal and injection personally.

### What are the risks of a BBL?

The most serious risk is a fat embolism, which is why Florida requires the fat to stay under the skin. Common complications are minor: a 2026 meta-analysis found minor complications in 3.58% of patients, most often a seroma, a pocket of fluid, in 2.03%. Other risks include infection, loss of grafted fat, unevenness and firm lumps of hardened fat.

### How long does BBL surgery take?

A BBL takes 3 to 5 hours under general anesthesia, depending on the volume of fat moved and the number of areas treated. It is outpatient surgery, so you go home the same day, with someone to drive you and stay with you for the first days.

### Am I a good candidate for a BBL?

You may be a good candidate if you are in good general health, at a weight you can keep stable, a non-smoker or willing to stop, and carry enough fat in areas such as the abdomen, flanks or back to move. Realistic expectations matter too: a BBL reshapes your figure, but it does not change your body type.

### Can I get a BBL if I'm thin?

Often, yes. A skinny BBL moves a smaller volume of fat, usually gathered from several areas, for a subtle and proportionate change. Whether you have enough fat for the result you want is something only an exam can tell, so bring your goals, and photos of shapes you like, to your consultation.

### Can I get a BBL after pregnancy?

Yes, once you have finished breastfeeding and your weight has settled where you can keep it. At the exam your surgeon also looks at your abdomen: if pregnancy stretched the skin or separated the muscles, liposuction alone will not fix that, and a tummy tuck in the same surgery may be the better plan.

### What share of the transferred fat survives?

About 50% to 80% of grafted fat survives a BBL. Plastic surgeons interviewed by ASPS put the average "take" around 60%, and a 2020 review in Seminars in Plastic Surgery estimates that 20% to 50% is reabsorbed. Keeping pressure off your buttocks for the first 8 weeks protects the fat that is taking hold.

### When will I see my final results, and do they last?

Your final shape shows 3 to 6 months after surgery, once swelling settles. The fat that survives stays where it was placed and changes with your weight like the rest of your body fat, so the result lasts as long as your weight stays steady. Cleveland Clinic advises keeping your weight consistent to preserve it.

### How long should I stay in Miami after a BBL if I am flying in?

Plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. We confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay; you arrange your own travel. ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days.

### Does insurance cover a BBL, and can I finance it? _(price FAQ: dropped from the paid landing page by design)_

No. Insurance does not cover a BBL, because it is a cosmetic procedure. Financing is available through Cherry, CareCredit, and United Credit, subject to credit approval, and we can go through the options with you at your consultation. A BBL at Alluring starts at $5,500.

## Where do these figures come from?

Every recovery, results and safety figure on this page comes from the sources below, checked in September 2026. Where a figure is one surgeon's advice rather than a society's guidance, we say so. Your own surgeon's instructions always come first, and they may differ from these general ranges.

1. Cleveland Clinic, "Brazilian Butt Lift" — https://my.clevelandclinic.org/health/treatments/23308-brazilian-butt-lift
2. The Aesthetic Society, "Butt Lift – Aftercare & Recovery" — https://www.theaestheticsociety.org/procedures/body/butt-lift/aftercare-recovery
3. American Society of Plastic Surgeons (ASPS), "Six things you need to know about recovering from a Brazilian butt lift", 2022-08-11 — https://www.plasticsurgery.org/news/articles/six-things-you-need-to-know-about-recovering-from-a-brazilian-butt-lift
4. ASPS blog, Kamran Azad, MD, "Recovering from a Brazilian butt lift", 2016-05-12 — https://www.plasticsurgery.org/news/blog/recovering-from-a-brazilian-butt-lift
5. American Society of Plastic Surgeons (ASPS), "Boarding groups: Added complications from traveling after a Brazilian butt lift", 2023-06-09 — https://www.plasticsurgery.org/news/articles/boarding-groups-added-complications-from-traveling-after-a-brazilian-butt-lift
6. Plastic and Reconstructive Surgery Global Open, Ormseth BH et al., "Postoperative Compression Garments in Plastic Surgery", 2023 — https://doi.org/10.1097/GOX.0000000000005293
7. Seminars in Plastic Surgery, "The Role of Fat Grafting in Buttock Augmentation", 2020 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7023974/
8. Florida Statutes, "Section 458.328", 2026 — https://www.flsenate.gov/Laws/Statutes/2026/458.328
9. Aesthetic Surgery Journal, Pazmiño P, Garcia O, "Brazilian Butt Lift–Associated Mortality: The South Florida Experience", 2023 — https://doi.org/10.1093/asj/sjac224
10. Plastic and Reconstructive Surgery, Elsaftawy A, Bonczar M, Jagosz M, et al., "Gluteal Augmentation with Fat Grafting: A Systematic Review and Meta-Analysis of Complications and Procedural Factors", 2026 — https://doi.org/10.1097/PRS.0000000000012437

_Medically reviewed by: none until #247 item 4; the page shows "Last updated" only._

## How do I book a BBL consultation in Miami?

Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, recommends a type of BBL and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.

**Request your free consultation**

1. A patient coordinator contacts you to find a consultation time.
2. Your surgeon examines you, recommends a plan and confirms your price.
3. If you go ahead, your dates are confirmed in writing.

Sticky mobile bar: Book · Call

## Figure map

Every figure in the copy, the fact that licenses it and its sources. Generated by `check:bbl-copy --map`; a figure is licensed only when its sentence contains one of the fact's concept words, so "3–5 days" passes next to "infection" and fails next to "swelling".

| Where                         | Figure          | Fact                                             | Sources                                                                                |
| ----------------------------- | --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `hero.factChips[0]`           | $5,500          | price-starting-at                                | alluring-practice                                                                      |
| `hero.factChips[1]`           | 3-5 hour        | surgery-3-5-hours                                | alluring-practice                                                                      |
| `atAGlance.rows[0].value`     | $5,500          | price-starting-at                                | alluring-practice                                                                      |
| `atAGlance.rows[1].value`     | $5,500-$10,000  | price-most-patients                              | alluring-practice                                                                      |
| `atAGlance.rows[2].value`     | 3-5 hours       | surgery-3-5-hours                                | alluring-practice                                                                      |
| `atAGlance.rows[6].value`     | 10-14 days      | work-10-14-days                                  | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare                                  |
| `atAGlance.rows[7].value`     | 2 weeks         | no-sitting-2-weeks, brief-sitting-through-week-6 | cleveland-clinic-bbl; asps-bbl-recovery-2022                                           |
| `atAGlance.rows[7].value`     | week 8          | pillow-until-week-8                              | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare                                  |
| `atAGlance.rows[8].value`     | 8 weeks         | exercise-at-8-weeks                              | aesthetic-society-bbl-aftercare                                                        |
| `atAGlance.rows[8].value`     | day 1-2         | walking-from-day-2                               | aesthetic-society-bbl-aftercare                                                        |
| `atAGlance.rows[9].value`     | 7-10 days       | stay-in-miami-7-10-days                          | alluring-practice                                                                      |
| `atAGlance.rows[10].value`    | 3-6 months      | final-shape-3-6-months                           | asps-bbl-recovery-2022, aesthetic-society-bbl-aftercare, cleveland-clinic-bbl          |
| `cost.answer`                 | $5,500          | price-starting-at                                | alluring-practice                                                                      |
| `cost.answer`                 | $5,500-$10,000  | price-most-patients                              | alluring-practice                                                                      |
| `beforeAfter.answer`          | 3-6 months      | final-shape-3-6-months                           | asps-bbl-recovery-2022, aesthetic-society-bbl-aftercare, cleveland-clinic-bbl          |
| `safety.evidence[0].body`     | 25 deaths       | south-florida-deaths-2010-2022                   | pazmino-garcia-2023                                                                    |
| `safety.evidence[0].body`     | 92%             | south-florida-deaths-2010-2022                   | pazmino-garcia-2023                                                                    |
| `safety.evidence[1].body`     | 3.58%           | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `safety.evidence[1].body`     | 2.03%           | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `safety.evidence[1].body`     | 38 studies      | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `safety.evidence[1].body`     | 22,151 patients | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `safety.evidence[1].body`     | 0.02%           | major-complications-ultrasound                   | elsaftawy-meta-analysis-2026                                                           |
| `safety.evidence[1].body`     | 0.08%           | major-complications-ultrasound                   | elsaftawy-meta-analysis-2026                                                           |
| `procedure.answer`            | 3-5 hours       | surgery-3-5-hours                                | alluring-practice                                                                      |
| `procedure.steps[3].body`     | month 1         | garment-month-1                                  | asps-bbl-recovery-2022, ormseth-garments-2023                                          |
| `procedure.afterSurgery`      | day 1-2         | walking-from-day-2                               | aesthetic-society-bbl-aftercare                                                        |
| `recovery.answer`             | 10-14 days      | work-10-14-days                                  | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare                                  |
| `recovery.answer`             | 8 weeks         | pillow-until-week-8, exercise-at-8-weeks         | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare; aesthetic-society-bbl-aftercare |
| `recovery.answer`             | 2-3 months      | recovered-2-3-months                             | cleveland-clinic-bbl                                                                   |
| `recovery.answer`             | 6 months        | recovered-2-3-months                             | cleveland-clinic-bbl                                                                   |
| `recovery.answer`             | 3-6 months      | final-shape-3-6-months                           | asps-bbl-recovery-2022, aesthetic-society-bbl-aftercare, cleveland-clinic-bbl          |
| `recovery.milestones[0].when` | days 1-2        | walking-from-day-2                               | aesthetic-society-bbl-aftercare                                                        |
| `recovery.milestones[0].body` | day 2           | walking-from-day-2                               | aesthetic-society-bbl-aftercare                                                        |
| `recovery.milestones[1].when` | weeks 1-2       | pain-eases-1-2-weeks                             | cleveland-clinic-bbl                                                                   |
| `recovery.milestones[1].body` | 2 weeks         | no-sitting-2-weeks, brief-sitting-through-week-6 | cleveland-clinic-bbl; asps-bbl-recovery-2022                                           |
| `recovery.milestones[1].body` | 4-5 days        | pain-medication-4-5-days                         | asps-bbl-recovery-2022                                                                 |
| `recovery.milestones[1].body` | 1-2 weeks       | pain-eases-1-2-weeks                             | cleveland-clinic-bbl                                                                   |
| `recovery.milestones[2].when` | days 10-14      | work-10-14-days                                  | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare                                  |
| `recovery.milestones[2].body` | days 7-10       | work-asps-7-10-days                              | asps-bbl-recovery-2022                                                                 |
| `recovery.milestones[3].when` | month 1         | garment-month-1, no-heavy-lifting-month-1        | asps-bbl-recovery-2022, ormseth-garments-2023; cleveland-clinic-bbl                    |
| `recovery.milestones[4].when` | month 2         | garment-month-2                                  | asps-bbl-recovery-2022, ormseth-garments-2023                                          |
| `recovery.milestones[4].body` | 12 hours a day  | garment-month-2                                  | asps-bbl-recovery-2022, ormseth-garments-2023                                          |
| `recovery.milestones[4].body` | 10 minutes      | brief-sitting-through-week-6                     | asps-bbl-recovery-2022                                                                 |
| `recovery.milestones[4].body` | week 6          | brief-sitting-through-week-6                     | asps-bbl-recovery-2022                                                                 |
| `recovery.milestones[5].when` | week 8          | pillow-until-week-8, exercise-at-8-weeks         | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare; aesthetic-society-bbl-aftercare |
| `recovery.milestones[6].when` | months 2-3      | recovered-2-3-months                             | cleveland-clinic-bbl                                                                   |
| `recovery.milestones[6].body` | 6 months        | recovered-2-3-months                             | cleveland-clinic-bbl                                                                   |
| `recovery.milestones[6].body` | month 3         | fat-loss-risk-month-3                            | asps-bbl-recovery-2022                                                                 |
| `recovery.milestones[7].when` | months 3-6      | final-shape-3-6-months                           | asps-bbl-recovery-2022, aesthetic-society-bbl-aftercare, cleveland-clinic-bbl          |
| `recovery.milestones[7].body` | 50-80%          | fat-survival-50-80                               | semin-plast-surg-fat-grafting-2020                                                     |
| `recovery.flying`             | 7-10 days       | stay-in-miami-7-10-days                          | alluring-practice                                                                      |
| `recovery.flying`             | 4-5 days        | stay-near-surgeon-4-5-days                       | asps-bbl-travel-2023                                                                   |
| `recovery.flying`             | 3-5 days        | stay-near-surgeon-4-5-days                       | asps-bbl-travel-2023                                                                   |
| `faq.items[2].answer`         | 3.58%           | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `faq.items[2].answer`         | 2.03%           | complications-meta-analysis-2026                 | elsaftawy-meta-analysis-2026                                                           |
| `faq.items[3].answer`         | 3-5 hours       | surgery-3-5-hours                                | alluring-practice                                                                      |
| `faq.items[7].answer`         | 50-80%          | fat-survival-50-80                               | semin-plast-surg-fat-grafting-2020                                                     |
| `faq.items[7].answer`         | 60%             | fat-take-average-60                              | asps-bbl-recovery-2022                                                                 |
| `faq.items[7].answer`         | 20-50%          | fat-resorbed-20-50                               | semin-plast-surg-fat-grafting-2020                                                     |
| `faq.items[7].answer`         | 8 weeks         | pillow-until-week-8                              | cleveland-clinic-bbl, aesthetic-society-bbl-aftercare                                  |
| `faq.items[8].answer`         | 3-6 months      | final-shape-3-6-months                           | asps-bbl-recovery-2022, aesthetic-society-bbl-aftercare, cleveland-clinic-bbl          |
| `faq.items[9].answer`         | 7-10 days       | stay-in-miami-7-10-days                          | alluring-practice                                                                      |
| `faq.items[9].answer`         | 4-5 days        | stay-near-surgeon-4-5-days                       | asps-bbl-travel-2023                                                                   |
| `faq.items[10].answer`        | $5,500          | price-starting-at                                | alluring-practice                                                                      |

## Sweep output

```
$ pnpm --filter web check:bbl-copy
BBL copy sweep
209 strings · 2959 words of copy (alt text excluded) · 11 FAQs · 34 facts · 35 declared figures
words by section: hero 69 · jumpLinks 6 · atAGlance 184 · cost 310 · beforeAfter 85 · safety 374 · surgeon 157 · options 238 · procedure 211 · recovery 421 · reviews 51 · faq 697 · sources 54 · book 100 · stickyBar 2
warn  placeholder  atAGlance.rows[4].value: {{BBL_SURGEON}} still waits on #247
warn  placeholder  surgeon.answer: {{BBL_SURGEON}} still waits on #247
warn  placeholder  surgeon.answer: {{CREDENTIALS}} still waits on #247
warn  placeholder  surgeon.body[1]: {{BBL_SURGEON}} still waits on #247
warn  placeholder  surgeon.profileLink.label: {{BBL_SURGEON}} still waits on #247
warn  placeholder  faq.items[0].answer: {{BBL_SURGEON}} still waits on #247
warn  placeholder  faq.items[0].answer: {{CREDENTIALS}} still waits on #247
clean (7 warnings)
```

With `--launch` the seven placeholder warnings become failures (exit 1), which is the #256 gate.

The sweep catches planted defects. On a copy with six planted lines it reported: `figure-out-of-context` ("Swelling peaks around day 3–5"), `undeclared-figure` ("10 weeks"), `volume-figure` + `unclassified-number` ("two to three hundred cc"), `certification` ("american board of plastic surgery", "double board"), `practice-claim` ("AAAASF", "5,000+"), `travel-or-market` ("transport … hotel"), and `pricing-term-in-general-faq` ("cost" in a non-price FAQ).
