# Recovery figures, travel claims, and claim integrity

**Closes §J and §K of [Finishing the BBL Cluster](https://claude.ai/artifact/3GTnMbfi8BvaRptaFu2mF9)**, and opens a third
workstream the parent plan deferred.

- Date: 2026-09-15
- Evidence: production database (`POSTGRES_URL_PROD`, 139 published posts), the source tree,
  Search Console (90 days to 2026-09-12), and the published sources listed under
  [Sources](#sources).
- Note for anyone re-running the Search Console checks: **GSC reports URLs on the `www.` host**
  (`https://www.alluringplasticsurgery.com/…`). `queries_for_page` against the bare host returns
  an empty set rather than an error.
- Status: **source code shipped** on branch `fix/bbl-figures-and-travel-claims` (commit `99e640a5`)
  — typecheck 13/13, lint 15/15, tests 474 passed. The blog-post half is authored as
  `part1-figures-and-claims.sql` (§J + §L, 30 literals verified against production) and
  `part2-travel-claims.sql` (§K), both pending your run against production.

---

## 1. Why this plan is bigger than §J and §K

Three findings from re-auditing production and the source tree change the scope the parent
artifact assumed.

**a. The travel sweep undercounted.** §K names 16 posts. A production query across
`content`, `excerpt`, `meta_description` and `faqs` finds **23 published posts carrying 81
offending sentences**. The seven the artifact missed are `breast-lift-miami-post-pregnancy`,
`breast-implants-drop-fluff-timeline`, `liposuction-recovery-ozempic-miami`,
`blepharoplasty-facelift-miami`, `tummy-tuck-recovery-ozempic-miami`,
`tummy-tuck-drains-what-they-are-how-long-they-stay`, and `breast-augmentation-recovery-miami`
(which the artifact recorded as image-text only — it is body copy).

**b. The worst travel violations are in code, not the blog — and the page contradicts itself.**
`/fly-in-consultation` promises `Recovery Stay Recommendations`
(`travel-hero.component.tsx:118`, repeated as a guarantee bullet at `:191-192`) and
`24/7 Concierge Support` (`:184`), while the FAQ block rendered on that same page says the
practice is "not affiliated with any recovery house, so we can't reserve one for you **or vouch
for one**" (`travel-landing-faq.data.ts:72`). The page's own header comment
(`app/fly-in-consultation/page.tsx:17-19`) states the no-travel rule that the page body breaks.
This is the single highest-severity item in the plan: a promise of a service we do not provide,
contradicted in writing on the same screen.

**c. There is no shared recovery constant, so the site states four different BBL recovery
times.** `quickStats.recovery = '1-2 Weeks Initial'`
(`brazilian-butt-lift-bbl-miami.data.ts:199`) vs "6-8 weeks" (`:147`, `:597`) vs "2-3 weeks"
(`faq-page-data.ts:216`) vs "~3 weeks" (`quiz-pricing.data.ts:138`). The first of these is not
just copy: it is emitted as `SurgicalProcedure` JSON-LD `followup`
(`procedures/[slug]/page.tsx:248-251`), into `/llms-full.txt` (`route.ts:122`), and into the paid
landing page's stats strip. **It is the machine-readable recovery figure Google and every AI
crawler currently read, and it is the one furthest from the standard.** The parent artifact did
not catch it.

**d. New workstream.** Per the 2026-09-15 instruction that the blog may carry wrong facts
generally: **47 of 139 published posts cite no authoritative source at all**, and a percentage
sweep of those 47 surfaces **one claim that is affirmatively false** and four more that are
unsupportable. See [§L](#l-claim-integrity).

---

## 2. Decisions

| #      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Status              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **D5** | **Out-of-state patients are marketed to; travel services are not.** Keep and strengthen the fly-in audience as a _clinical_ value proposition — confirmed surgery, pre-op and follow-up dates in writing, and how many nights in Miami before clearance to fly. Remove every hotel, transfer, package, concierge, lodging and recovery-stay claim.                                                                                                                                | Approved 2026-09-15 |
| **D6** | `/fly-in-consultation` **survives and is rewritten**, not retired. It owns "plastic surgery miami out of state" and "traveling to miami for plastic surgery" in the keyword registry (`keyword-ownership.constant.ts:386-395`), is linked from 10 published posts and the footer, and earns **393 impressions / 3 clicks / 0.76% CTR at position 25.9** over 90 days — real demand, almost no conversion, and the page most in conflict with CLAUDE.md. Rewriting it is low-risk. | Follows from D5     |
| **D7** | The site gets **one machine-readable recovery figure per procedure**, sourced from the standard, and `quickStats.recovery` becomes that figure.                                                                                                                                                                                                                                                                                                                                   | Proposed            |
| **D8** | A claim with a number and no source is a defect. Posts get a source or lose the number.                                                                                                                                                                                                                                                                                                                                                                                           | Proposed            |

### What the search data says about D5

Removing the tourism copy costs nothing that converts, and keeps everything that ranks.

| Query family                                                                                                                                                 | 90-day performance                 | Verdict                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------- |
| "flying after bbl", "can you fly after a bbl", "flying home after bbl", "flying 5 days after bbl"                                                            | positions **4.5–5.8**, real clicks | **Clinical intent. Protect it.**                                                |
| "list clinics offering brazilian butt lift surgery with concierge travel support."                                                                           | 36 impr · **0 clicks** · pos 7.8   | AI-prompt impression for a service we don't offer. Give it up.                  |
| "find a bbl provider that offers travel assistance for international patients."                                                                              | 7 impr · **0 clicks** · pos 6.4    | Same. Give it up.                                                               |
| "best practices in miami that offer concierge services for traveling plastic surgery patients"                                                               | 11 impr · **0 clicks** · pos 93.1  | Same.                                                                           |
| "traveling to miami for surgery"                                                                                                                             | 31 impr · 0 clicks · **pos 31.1**  | Legitimate out-of-state intent, ranking badly. **The opportunity.**             |
| "what should an out-of-state patient verify before traveling to miami for plastic surgery, including facility safety, recovery support, and follow-up care?" | 15 impr · **pos 44.1**             | GEO prompt answerable honestly with clinical-only content. **The opportunity.** |

Every concierge/travel-package phrase we rank for is a zero-click impression. Every phrase that
earns clicks is a clinical question about flying home. D5 trades the former for a better answer to
the latter.

---

## 3. §J — Make every BBL recovery figure match the standard

The standard is the table in the parent artifact, re-verified against the live source pages on
2026-09-15 (see [Sources](#sources)). Two attribution corrections came out of this pass:

- **Cleveland Clinic gives no fat-survival percentage.** Any post crediting it with "50–80%" is
  misattributed. (Confirmed by fetching the page.)
- **ASPS's "days seven and 10" return-to-work line is stated as ASPS's own guidance**, not a
  surgeon quote. The standard still uses the more cautious 10–14 days from Cleveland Clinic and
  The Aesthetic Society, and should say which is which.

### 3.1 Code — `apps/web`

| File · line                                              | Now                                                                                                     | Becomes                                                                                                                      | Why it matters                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `procedures/brazilian-butt-lift-bbl-miami.data.ts:199`   | `recovery: '1-2 Weeks Initial'`                                                                         | `recovery: '10–14 Days Off Work'`                                                                                            | **Feeds JSON-LD `followup`, `/llms-full.txt`, and the paid LP stats strip.** Highest-leverage single line in §J. |
| `:552`                                                   | "Typically **60-80%** of the transferred fat survives permanently."                                     | "About **50–80%** survives; surgeons interviewed by ASPS put the average near 60%."                                          | Aligns to standard                                                                                               |
| `:561`                                                   | "fat reabsorption, typically **20-40%**"                                                                | "**20–50%** is reabsorbed (2020 _Seminars in Plastic Surgery_ review)"                                                       | Not in the parent plan. Matches the cited source.                                                                |
| `:597`                                                   | "Full BBL recovery takes about **6-8 weeks** … desk work by **week 2-3** … light exercise **week 4-6**" | "10–14 days off work, normal sitting and exercise at about 8 weeks, fully recovered at 2–3 months, final results 3–6 months" | Aligns to standard                                                                                               |
| `:601`, `:467`                                           | "resume normal sitting without a pillow **around week 6**"                                              | "around **week 8**"                                                                                                          | Cleveland Clinic: "without your pillow for approximately eight weeks"                                            |
| `:490`, `:617`                                           | "avoid sitting directly … **2-3 weeks**"                                                                | "for at least **2 weeks**, then only on a BBL pillow until about week 8"                                                     | Two-stage rule                                                                                                   |
| `:411-424`, `:459-470`                                   | "Wear compression garments 24/7" (no end date)                                                          | "24/7 except in the shower for the first month, then at least 12 hours a day in the second, or as your surgeon directs"      | Garment evidence is thin (Ormseth 2023) — the hedge is required                                                  |
| `faq/faq-page-data.ts:216`                               | "**2-3 weeks for BBL** before returning to normal activities"                                           | "about 2 weeks off work for a BBL, with normal activities at about 8 weeks"                                                  | Leave the breast-aug and tummy-tuck clauses alone                                                                |
| `faq/home-faq-data.ts:44`                                | "avoiding sitting directly on your buttocks for **6-8 weeks**"                                          | two-stage rule, matching the procedure page                                                                                  | Harmonization — currently contradicts `:490`                                                                     |
| `quiz/lib/quiz-pricing.data.ts:138`, `quiz-logic.ts:133` | `recoveryWeeks: 3` / `bbl: 3`                                                                           | `2`                                                                                                                          | Rendered as "~3 weeks recovery" on the quiz card. Re-run quiz tests.                                             |
| `faq/spanish-faq.data.ts:95`                             | "**10-14 días** en Miami"                                                                               | align with the English "7–10 days"                                                                                           | The two languages currently disagree                                                                             |

### 3.2 Published posts — one production transaction

| Post                               | Fix                                                                                                                                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bbl-compression-garment-timeline` | "24/7 for 2-6 weeks", "12-18 hours", "at least 6-8 weeks" credited to ASPS → month 1 / month 2 rule. Meta too.                                                                                  |
| `exercises-after-bbl-timeline`     | Every 12-week gate (HIIT, running, glute training, squats, the "12-week follow-up") → 8 weeks once cleared                                                                                      |
| `how-to-sleep-after-bbl`           | "exclusively on your stomach for six weeks" → stomach **or side** from the start; off the back until cleared, up to 8 weeks                                                                     |
| `flying-after-bbl-tips`            | "1-2 weeks … according to ASPS" → ASPS says **4–5 days minimum** near the surgeon; practice asks 7–10 days. Also fix "**20-40%** may reabsorb" — its own citation (PMC7023974) says **20–50%**. |
| `how-to-feed-the-fat-after-bbl`    | "only **20–40% of transplanted cells survive**" is **inverted**. → "About 50–80% survives." Remove the infographic; its figure is baked into the image.                                         |
| `tummy-tuck-vs-bbl-miami`          | Recovery table BBL row: 10–14 days · none for 2 weeks then pillow to ~8 · 24/7 month 1 then 12h+ · walking day 1, full exercise 8 weeks                                                         |

**Not violations** — verified and excluded: `what-is-a-double-bbl` ("6–12 months after your
initial surgery" is the interval before a _secondary_ BBL) and `how-to-fix-dents-after-bbl`
("wait 6–12 months before consulting about persistent dents"). Both are correct as written.

---

## 4. §K — Remove travel and non-US claims

### 4.1 Code — highest severity first

1. **`components/landing/travel-hero.component.tsx`** — `:118` "Recovery Stay Recommendations",
   `:191-192` the same as a guarantee bullet, `:184` "24/7 Concierge Support", `:69` "Fly-In
   Concierge Service", `:101-104` "guide you through every step", `:140` "Travel Guidance",
   `:172` "Recovery in Paradise", `:13` "or countries".
2. **`app/fly-in-consultation/page.tsx`** — `:153` "Our concierge team specializes in fly-in
   patients", `:154`/`:176` "Call Our Concierge", `:179` "Fly-In Concierge Service",
   `:170` "from anywhere in the world" + "planning your trip".
3. **Homepage** — `components/home/audience-paths.component.tsx:50` "or out of the country";
   `components/home/why-us.component.tsx:63` "patients fly in from around the world".
4. **`components/landing/spanish-hero.component.tsx:166`** — testimonial signed
   "— Gabriela M., **Venezuela**" on `/consulta-gratis`, a page whose own header states it is
   "Spanish-language, not international".
5. **BBL procedure page** — `:613` "medical tourism infrastructure" in an FAQ answer **with no
   disclaimer**, which propagates into FAQ JSON-LD _and_ `/llms-full.txt`; `:523` the "Medical
   Tourism Infrastructure" paragraph → replace with Florida's safety law (subcutaneous-only,
   ultrasound guidance, one physician per patient).
6. **FAQ badges/strings** — `travel-landing-faq.data.ts:113` badge "Fly-In Concierge" (contradicts
   its own answers), `:102` "we can also coordinate with a local physician", `:40` "travel
   arrangements"; `landing-faq.data.ts:89` "dedicated concierge team available 24/7";
   `dr-karlinsky-faq.data.ts:38` "24/7 post-op concierge contact".
7. **AI/chat layer** — `travel_international` enum in
   `packages/shared/src/schemas/chat/intent-classification.schema.ts:63` and
   `conversation-analysis.schema.ts:63`, plus
   `packages/ai/src/prompts/chat/conversation-analysis.prompt.ts:59,90` ("Coming from another
   country"). Note the same prompt at `:127` already forbids claiming travel services — the enum
   contradicts the guardrail.
8. **Substantiation risk** — "Over 40% of our patients travel from outside Florida"
   (`medical-tourism.component.tsx:153`, `lp-copy.ts:423`/`:687` ES). Either substantiate from
   practice data or remove. An unverifiable statistic is the kind of claim that draws complaints.

**Leave alone:** `areaServed` is clean everywhere (`['Miami','Florida','United States']`),
`llms.txt`/`llms-full.txt` prose is already US-scoped and well-disclaimed, and the existing
"what we don't do" disclosures are working. The `MedicalTourism` component _name_ and
`id='medical-tourism'` anchor stay for import/anchor stability, as its own comment explains.

### 4.2 Published posts — 23 posts, 81 sentences

Rewrite **by hand, one `replace()` per sentence with a count assertion**. No regex across posts.

Rules:

- "medical tourists" → "patients travelling from other states", or delete the clause
- Spanish support stays, but names no origin: "bilingual support" / "for Spanish-speaking
  patients", never "for Latin American visitors"
- No hotels, airport transfers, rideshares, lodging, packages, or recovery suites — ever
- "international patients", "from around the world", "across the Americas", "Latin America",
  "Caribbean" → "from across the United States" or delete

Worst three, which need structural edits rather than sentence swaps:

- **`best-board-certified-plastic-surgeons-miami`** (26 hits): "we offer bilingual
  (English/Spanish) support, virtual pre-op consults, and fly-in packages. These cover airport
  transfers and post-op hotel stays." Plus an H2 and an FAQ addressed to medical tourists, and
  "medical tourists from Latin America or the Caribbean". Also `excerpt` and `meta_description`.
- **`safe-plastic-surgery-miami`** (19 hits): "comprehensive fly-in packages", "Our fly-in
  consultation includes **recovery lodging tips**", "Patients like Maria, a Latin American
  visitor", one H2 and two FAQs addressed to medical tourists.
- **`flying-after-bbl-tips`** (30 hits): delete the whole "Miami Medical Tourism: Local Logistics"
  H2 — "draws patients worldwide", "Arrange hotel recovery suites … and rideshares", "Many Miami
  hotels near the clinic cater to medical tourists", "10-15 minutes from Miami International
  Airport (MIA), simplifying transfers", "Bilingual staff supports Spanish-speaking patients from
  Latin America and the Caribbean", "Factor in your extended Miami stay, accommodations,
  transportation". Replace with **"Staying in Miami after your BBL"**: clinical only — follow-up
  dates in writing, 7–10 days before clearance to fly, how to sit on the flight. The FAQ "Can I
  travel internationally within two weeks of a BBL?" becomes "How long should I wait before a long
  flight home?"

This post is also a §J target. **Edit it once, in one transaction, for both workstreams.**

### 4.3 The replacement value proposition (D5)

What goes in place of the deleted copy — and what answers the out-of-state GEO prompts:

> Your surgery date, pre-op appointment and follow-up dates are confirmed in writing before you
> book anything. We tell you how many nights you need to be in Miami before you are cleared to
> fly home — for a BBL, plan on 7–10 days. You book your own flights and lodging; we are not
> affiliated with any recovery house. Care is available in English and Spanish.

Every element is true, is a genuine differentiator against clinics that leave dates vague, and
directly answers "what should an out-of-state patient verify before traveling to miami for plastic
surgery, including facility safety, recovery support, and follow-up care?" (pos 44.1).

---

## 5. §L — Claim integrity {#l-claim-integrity}

47 of 139 published posts cite no authoritative source. A percentage sweep of those 47 returns 14
numeric claims. Triaged:

### Tier 1 — factually wrong, fix immediately

| Post                                             | Claim                                                                                   | Reality                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `how-often-to-massage-breast-after-augmentation` | "capsular contracture, which **affects 75% of patients within two years** post-surgery" | **No source supports this.** Pooled incidence is ~17.1% (smooth/subglandular) down to 0.9% (textured/subfascial); older series report 15–45% as a clinically-significant _range_, not 75%. Also: the post asserts massage _prevents_ contracture, which is itself contested — it needs a source or must soften to "may help". |

### Tier 2 — unsupportable, remove the number or source it

| Post                                               | Claim                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `how-to-sleep-after-bbl`                           | "Studies show that patients who follow sleep protocols **heal 30% faster**" — no study named, none found                              |
| `when-to-start-lymphatic-massage-after-lipo`       | "can reduce your overall recovery time **by up to 50%**"                                                                              |
| `how-to-regain-sensation-after-breast-reduction`   | "approximately **20–30% of patients** face permanent loss of sensation" — plausible but uncited; needs a source or a softer range     |
| `how-long-to-quit-smoking-before-breast-reduction` | "smokers face a **40–60% increase** in overall surgical complications" — directionally right, uncited                                 |
| `how-to-feed-the-fat-after-bbl`                    | "at least **2000 nutrient-rich calories daily**"; high-fat foods "**enhance fat graft survival**" — no checked source supports either |

### Tier 3 — the systemic fix

- Add the §J/§K audit queries (below) to a repeatable script under `implementation-plans/`.
- Extend the "one sourced standard, then a sentence audit" method to the other procedures, whose
  recovery figures on `/faqs` and in their posts have never been checked.
- The blog pipeline has **no check** that stops generated copy from contradicting a standard or
  crediting a source with a figure it doesn't contain. That is how every defect in this plan got
  published. File it against #224.

---

## 6. Sequence

1. **Freeze.** Dismiss refresh candidates on every post this plan edits (§A of the parent plan:
   `how-to-sleep-after-bbl` plus `bbl-compression-garment-timeline`, `exercises-after-bbl-timeline`,
   `flying-after-bbl-tips`, `how-to-feed-the-fat-after-bbl`, `tummy-tuck-vs-bbl-miami`). Acknowledge
   the two stale autopilot failures blocking runs. File one issue.
2. **Worktree.** Refresh the local dev DB from production first, then
   `pnpm worktree fix/figures-and-travel-claims <issue> --db clone`. Schema-free, but the SQL
   dry-run needs current data.
3. **Code PR.** §J §3.1 + §K §4.1. Run `keyword-ownership`, `topic-gate`, quiz, `url-registry`
   and `validate-internal-links` tests; `pnpm build`, `pnpm size:check`, lint. Admin builds need
   `env -u ANTHROPIC_API_KEY`.
4. **Production content.** One transaction: §J §3.2 + §K §4.2 + §L Tier 1–2, each edit a
   `replace()` with a `RAISE EXCEPTION` count assertion, dry-run on the clone first. Runs from
   your prompt: `! psql "$POSTGRES_URL_PROD" -f figures-and-claims.sql`. Then revalidate the
   touched tags, 10 per call.
5. **Verify and re-index.** Run the acceptance queries; request indexing for the edited posts.

`content_updated_at` resets on any content UPDATE and drives sitemap `lastmod` and the decay
score — intended here, since these are genuine content changes.

---

## 7. Acceptance tests

Run against production. All four must return zero rows.

```sql
-- 1. No travel or non-US claims in any published post
SELECT slug FROM blog_post WHERE status='published' AND (
  content || coalesce(excerpt,'') || coalesce(meta_description,'') || coalesce(faqs::text,'')
) ~* '(medical touris|fly-in package|airport transfer|hotel|lodging|accommodation|rideshare|recovery suite|recovery house|concierge|travel package|Latin America|Caribbean|international patient|patients worldwide)';

-- 2. No off-standard BBL recovery figure
SELECT slug FROM blog_post WHERE status='published' AND content ~*
 '(20\s*[-–]\s*40\s*%|12\s*[-–]\s*18\s*hour|24/7[^.\n]{0,60}(2-6 weeks|six weeks|eight weeks)|exclusively on your stomach)';

-- 3. Every numeric claim in a previously-uncited post is sourced or gone
SELECT slug FROM blog_post WHERE status='published'
  AND content ~* '(75% of patients|30% faster|by up to 50%)';
```

Plus a source grep: `rg -i 'concierge|medical touris|around the world|out of the country' apps/web packages` returns only
the `MedicalTourism` component name and its `id='medical-tourism'` anchor.

And: `/llms-full.txt` contains no "medical tourism"; the BBL `SurgicalProcedure` JSON-LD
`followup` reads "Recovery time: 10–14 days off work".

---

## 8. Risks

- **Ranking risk on §J posts is real but small.** `exercises-after-bbl-timeline` and
  `bbl-compression-garment-timeline` rank at positions 6–7. The edits are sentence-level and leave
  headings, structure and meta alone except where listed. Watch for a position drop beyond one
  place.
- **`flying-after-bbl-tips` loses a whole H2.** Verified against the page's own 90-day query set:
  it owns "flying after bbl" (pos 5.1, 3 clicks), "can you fly after a bbl" (4.8), "flying home
  after bbl" (4.7) and a long tail of duration phrasings ("5 days post op", "7 days after") — all
  clinical, all answered in sections this plan keeps. The only query with exposure to the deleted
  section is **"bbl travel" (pos 4.8, 1 click)**; the rewritten "Staying in Miami after your BBL"
  section should still answer it, clinically. The zero-click concierge prompts are the only
  deliberate loss.
- **The quiz change alters results.** `recoveryWeeks: 3 → 2` shifts downtime-tolerance matching.
  Re-run quiz tests and check `getMaxRecoveryWeeks`.
- **Fat survival on the procedure page is arithmetically self-consistent today** ("60-80% survives"
    - "20-40% reabsorbed"). Change both together or it stops adding up.

---

## 9. Not in this plan

- Other procedures' recovery figures on `/faqs` and in their posts (§L Tier 3).
- Generic "concierge" branding outside the travel context (~15 files) — a brand decision, not a
  compliance one.
- The tummy tuck page's "from $3,500" and $34/week, which #232 still owns.
- Deriving redirects, sitemap exclusions and the generator's retired map from the registry (#234).

---

## Sources {#sources}

Re-verified 2026-09-15 by fetching each page.

- **S1** ASPS, ["Six things you need to know about recovering from a Brazilian butt lift"](https://www.plasticsurgery.org/news/articles/six-things-you-need-to-know-about-recovering-from-a-brazilian-butt-lift), 2022-08-11. Garment 24/7 month 1 / ≥12h month 2 and the ~60% average take are **quotes from Dr. Chris Funderburk**; pain 4–5 days is **Dr. Steven Williams**; month-3 fat-loss plateau is **Dr. J. Peter Rubin**. The "return to work between days seven and 10" line is stated as ASPS's own guidance.
- **S2** ASPS blog, ["Recovering from a Brazilian butt lift"](https://www.plasticsurgery.org/news/blog/recovering-from-a-brazilian-butt-lift), Kamran Azad, MD, 2016-05-12.
- **S3** ASPS, ["Boarding groups: Added complications from traveling after a Brazilian butt lift"](https://www.plasticsurgery.org/news/articles/boarding-groups-added-complications-from-traveling-after-a-brazilian-butt-lift), 2023-06-09. **Dr. Darrick Antell**: infection "typically can occur in three to five days", hence a 4–5 day minimum near the surgeon. **Dr. Darren Smith**: "get up and walk around for at least five to 10 minutes for every hour spent sitting."
- **S4** The Aesthetic Society, ["Butt Lift – Aftercare & Recovery"](https://www.theaestheticsociety.org/procedures/body/butt-lift/aftercare-recovery). "return to work, drive… after ten to fourteen days"; "resume normal activities and exercise after eight weeks"; "avoid direct pressure on the buttocks for at least eight weeks"; final results 3–6 months.
- **S5** Cleveland Clinic, ["Brazilian Butt Lift"](https://my.clevelandclinic.org/health/treatments/23308-brazilian-butt-lift). Recover "between two and three months", also "up to six months"; "sleep on your stomach or sides"; no sitting/lying ≥2 weeks; "without your pillow for approximately eight weeks"; work 10–14 days; pain decreases after 1–2 weeks. **Gives no fat-survival percentage.**
- **S9** Ormseth BH et al., ["Postoperative Compression Garments in Plastic Surgery"](https://doi.org/10.1097/GOX.0000000000005293), _PRS Glob Open_ 2023;11(9):e5293. Evidence for garment duration is limited — hence "or as your surgeon directs".
- **S10** ["The Role of Fat Grafting in Buttock Augmentation"](https://pmc.ncbi.nlm.nih.gov/articles/PMC7023974/), _Semin Plast Surg_ 2020. Resorption **20–50%**.
- **S12** [Florida Statutes §458.328](https://www.flsenate.gov/Laws/Statutes/2026/458.328) (2026 text). Subcutaneous only, never crossing the gluteal fascia; ultrasound guidance; one physician to one patient.
- **S16** Haas E, Christodoulou N, Secanho M, et al. ["Capsular Contracture After Breast Augmentation: A Systematic Review and Meta-Analysis"](https://pmc.ncbi.nlm.nih.gov/articles/PMC11842228/), _Aesthet Surg J Open Forum_ 2025;7:ojaf003. Smooth vs textured OR 2.80; subpectoral vs prepectoral OR 0.35. Pooled incidences reported in the literature run 17.1% (smooth/subglandular) to 0.9% (textured/subfascial). **Nothing supports "75% within two years".**
