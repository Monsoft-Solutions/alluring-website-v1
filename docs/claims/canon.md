# Alluring Plastic Surgery: the claims canon (issue #354)

Drafted 2026-10-25. Everything the site says, in every format, follows this file: pages, procedure
data files, blog posts (DB and `blog/posts/`), structured data, `llms.txt` / `llms-full.txt`, the
website chat agent (DB `chat_config`, plus `packages/ai/src/prompts/chat/system-prompt.prompt.ts`),
the blog writer and reviewer prompts (`packages/ai`), gallery and promotion copy, and author bios.

**The rule behind the whole canon:** if a claim is not verified here, it is removed. It is not
replaced with a different claim that is also unverified. When a sentence loses its claim and has
nothing left to say, delete the sentence.

**Precedence when sources disagree:**

1. The user's decisions, as recorded in `seed-facts.md`.
2. The issuing body's record (the credentials constant).
3. The practice price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`).
4. The procedure facts files (`apps/web/lib/data/procedures/facts/*.facts.ts`).
5. `siteConfig`.
6. Everything else, including existing page copy, the chat prompt, AI prompts and posts.

Section 13 lists the items that still need the user. Until each is decided, its **default** applies.

## Decisions of 2026-10-25 (these override anything below)

- **D1, Dr. Rita Shats:** flag only. Keep her existing mentions, add no new ones, and don't delete her.
- **D6, weekly payments:** drop every weekly or monthly payment figure site-wide. Name the financing partners, quote no number.
- **D7, "free consultation":** keep it where it stands today. New or rewritten copy doesn't add "free".
- **Prices are DRY, and editable in the admin with a per-procedure discount.** This replaces §5's typed figures everywhere:
    - The price-sheet lines live in the database, edited on an admin Pricing page. The code fallback is the 2026-09-15 sheet in `@workspace/shared/claims`.
    - Each procedure has a "starting at" line, chosen in the admin. It defaults to the lowest standard line in the §5 table, so the breast lift defaults to $4,000 for the modified lift, with the variant named.
    - Each procedure has an optional **discount %**, with an optional site-wide default. When a discount is active, the price shows as **the list price struck through, then the discounted price**. Plain-text surfaces (meta, JSON-LD, llms, chat) give "$4,400 (20% off $5,500)".
    - A discount is a discounted-fee advertisement under Fla. Stat. 456.062. The admin holds the required statement text, shows it next to discounted prices, and warns if a discount is on without it.
    - **No dollar figure for Alluring's prices is typed anywhere any more**: not in pages, data files, blog posts, FAQs, llms files, JSON-LD or the chat prompt. Code reads the pricing resolver. Blog posts and other DB text use **claim tokens** (grammar defined in `packages/shared/src/claims/`), which the renderer resolves. National averages from the facts files (ASPS fees) are not Alluring prices and stay typed, with their attribution.
    - D2 (no facelift-alone price), D3 (no mommy makeover total), D4 (no "all-inclusive") and D5 (the handwritten "20% off" is not published) keep their defaults. A discount set in the admin is the only way a reduced price appears.
- **"Plastic surgery" stays allowed** as the practice and service term. It is the business name and the main search term ("plastic surgery miami"). Only "plastic surgeon" used for Dr. Karlinsky is banned (CR7). §1's "use 'cosmetic surgery practice', not 'plastic surgery clinic'" is relaxed: either is fine.
- **Superlatives (§10)** are banned when they describe the practice, the surgeon, results or outcomes. Generic advice wording such as "the best way to sleep after a BBL" or "best candidates" is fine.
- Other open items take the §13 defaults: D9 (hold education lines), D10 (Sofía may quote starting prices through the resolver, never a deposit amount; drop the soft-credit claim unless sourced), D11 (`/contact-us`), D12 (AggregateRating on `/reviews` only, from synced figures).

---

## 1. Identity

| Item                | Canon                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                | **Alluring Plastic Surgery** (legal and display name). In a sentence after the first mention: "Alluring".                                                                                                                                                                                                                                                               |
| What it is          | A cosmetic surgery practice in Miami, Florida, with one surgeon. Use "cosmetic surgery practice" or "practice", not "plastic surgery clinic". The name contains "Plastic Surgery", which is fine as a name, but the surgeon is not ABPS-certified, so don't use the field as a descriptor.                                                                              |
| Location            | 8435 SW 24th St, Miami, FL 33155, United States (`siteConfig.contact`, `getFullAddress()`).                                                                                                                                                                                                                                                                             |
| Market              | **United States only.** South Florida locals, plus patients who fly in from other US states. `areaServed` in structured data covers Miami, South Florida, Florida and the United States, and nothing outside the US.                                                                                                                                                    |
| Spanish             | For Spanish speakers **within** the US (`/consulta-gratis`, the Spanish FAQ). It is never framed as serving Latin America or cross-border patients.                                                                                                                                                                                                                     |
| Tagline             | **"Personal care. Honest price."** (`siteConfig.business.tagline`, #290).                                                                                                                                                                                                                                                                                               |
| Retired brand lines | Never publish "Luxury Surgeries Made Affordable", "Where luxury meets affordability", "Luxury Made Affordable", "luxury yet affordable", "luxury but accessible" or "premier plastic surgery clinic". They are still live in `siteConfig.business.description`, `siteConfig.seo.siteDescription`, the `llms.txt` intro, the chat prompt and most `packages/ai` prompts. |
| Chat agent          | **Sofía, "our concierge"**: never "virtual assistant" or "asistente virtual", and never connected to travel.                                                                                                                                                                                                                                                            |

**Approved descriptions.** These replace `business.description` and `seo.siteDescription`.

- Short: "Cosmetic surgery in Miami, Florida, with one surgeon: Victoria Karlinsky, MD, FACS."
- Long: "Alluring Plastic Surgery is a cosmetic surgery practice in Miami, Florida. One surgeon, Victoria Karlinsky, MD, FACS, performs BBL, liposuction, tummy tuck, breast augmentation, breast lift and reduction, mommy makeover, facelift and eyelid surgery. Prices start from the practice's published price list, financing is available, and your surgeon confirms your price at consultation."
- Default while D1 is open: leave "cosmetic gynecology" out of the descriptions and `seo.keywords`.

**Voice rules.**

- Plain words and short sentences, written to "you".
- No exclamation marks and no superlatives (section 10).
- Show the value; never claim it. Don't write "luxury" or "affordable"; give the price and what happens.
- Don't diagnose. Candidacy answers end with "your surgeon decides at consultation".
- No body-negative or shame language, no fake urgency and no countdowns.
- Spanish copy follows every rule here. Write it natively, not as a word-for-word translation.

---

## 2. Surgeon and team

### The single-surgeon fact

The practice has **one surgeon: Dr. Victoria Karlinsky** (the user, 2026-09-19).

- Allowed: "one surgeon performs every [procedure] at Alluring: Victoria Karlinsky, MD, FACS".
- Forbidden: plural "our surgeons", "our board-certified surgeons", "team of surgeons", "all of our surgeons", "match you with the right surgeon".
- Forbidden: any other surgeon's name. **Dr. Andrew Lofman** appears only in the chat prompt, where he is called a "board-certified plastic surgeon"; remove him.
- **Dr. Rita Shats** is OPEN (D1). Flag her mentions; don't delete them yet.

### Names (Florida Rule 64B8-11.001(7))

- First mention: **"Victoria Karlinsky, MD, FACS"** (`KARLINSKY_NAME`). "Dr. Victoria Karlinsky, MD, FACS" is also accepted in posts.
- After that: **"Dr. Karlinsky"** (`KARLINSKY_SHORT_NAME`).
- Never put her name in a `<title>` or `seoTitle`. Meta descriptions, body copy and structured data may name her.

### Approved credential sentences

- **Short** (`KARLINSKY_CREDENTIALS`, verbatim): "She is board certified in general surgery by the American Board of Surgery and is a Fellow of the American College of Surgeons."
- **With the year** (the ABS record, `KARLINSKY_ABS_CERTIFIED_ON` = 2008-10-27): "She has been board certified in general surgery by the American Board of Surgery since 2008 and is a Fellow of the American College of Surgeons."
- **Long** (surgeon page, `llms-full.txt`): "Victoria Karlinsky, MD, FACS, is board certified in general surgery by the American Board of Surgery (since 2008) and is a Fellow of the American College of Surgeons. She holds an active Florida medical license, ME130613, with no discipline on record." Link each credential to `karlinskyRecords`.
- **Long, with the cosmetic boards.** Use this only where the Florida statement can sit in the same element, at the same type size. Add: "She is also certified by the American Board of Cosmetic Surgery (2011, recertified 2021) and listed in the directory of the American Board of Facial Cosmetic Surgery." Follow it immediately with the statement below.

### The Florida statement rule (Rule 64B8-11.001(2)(f))

Any mention of the **American Board of Cosmetic Surgery** or the **American Board of Facial Cosmetic Surgery** counts. That includes names, acronyms, badge images and their alt text, and lists. Each mention carries this statement verbatim, in the same element and at the same type size (`FLORIDA_UNAPPROVED_BOARD_STATEMENT`):

> The specialty recognition identified herein has been received from a private organization not affiliated with or recognized by the Florida Board of Medicine.

- Blog posts, meta descriptions, titles, `llms.txt`, the chat agent and ads never mention ABCS or ABFCS, because the statement has nowhere to go there.
- The surgeon page and `surgeons-data.ts` badges either carry the statement next to the badges or drop the two badges.
- Structured data uses `karlinskyPersonNode` only (ABS, FACS, the Florida license). It has no ABCS credential node and no `medicalSpecialty`.

### Forbidden credential phrasings

Each phrase below is banned along with its variants: hyphenated or spaced, capitalized or not, and Spanish.

- "board-certified plastic surgeon", "board certified plastic surgeon", "plastic surgeon board certified", "certified plastic surgeon", "cirujana plástica certificada"
- "double board-certified", "dual board-certified", "triple board-certified", "two-time board-certified", "certified by two/three boards", "doble certificación"
- "American Board of Plastic Surgery", "ABPS", "ABPS-certified"
- Bare "board-certified" or "board certified" that doesn't name the board in the same sentence. This includes "Board Certified Cosmetic Surgeon" (`surgeons-data.ts` `title`), "board-certified cosmetic and general surgeon" (`shortBio`, `fullBio`, chat), "Board-Certified Surgeons" (titles, `llms.txt`) and `trustStats.accreditation` "Double Board-Certified".
- "board-certified" anywhere in a `<title>` or `seoTitle`.
- "plastic surgeon" for her. Say "surgeon" or "cosmetic surgeon". Allowed: the name "American Society of Plastic Surgeons", and "a plastic surgeon interviewed by ASPS" for a quoted third party.
- "Fellowship Director, American Board of Cosmetic Surgery". She directs an AACS-accredited fellowship, which is not an ABCS title. Its wording is part of D9.
- "Fellow, American Academy of Cosmetic Surgery" and "fellowship training at the American Academy of Cosmetic Surgery". Neither is verified (D9).
- Superiority wording: "renowned", "distinguished", "world-renowned", "leading authority", "shaped the landscape", "highest standards", "Miami's top surgeon(s)", "top surgeon", "best surgeon", "best in Miami", "#1", "premier".
- "medically reviewed by", "reviewed by Dr. …", "fact-checked by", or a medical review board. None of these exists.
- "100% certified" (`trustStats.certified`).

### Education (D9, default: hold)

These lines in `surgeons-data.ts` were not verified this session:

- MD from Ross University
- residency at Beth Israel Medical Center
- fellowship in Abilene, Texas

Default: they stay on the surgeon page as they are, but they are **not repeated** in posts, `llms*.txt`, the chat agent or structured data until they are checked against the Florida DOH practitioner profile.

---

## 3. Facility and safety

**Can be said:**

- The surgery is outpatient and you go home the same day. That is the practice's published `quickStats` setting.
- Each procedure's anesthesia type as in `quickStats` (for example, "general anesthesia").
- Generic statements about anesthesia: "an anesthesia provider monitors you throughout surgery". Don't name a credential.
- Florida law, as the facts files state it. For example, BBL: fat stays under the skin and never crosses the gluteal fascia; ultrasound guidance is required; one surgeon stays with one patient; an in-person exam happens no later than the day before; the surgeon harvests and injects personally. Liposuction in an office: 4,000 cc maximum, 1,000 cc when combined with a tummy tuck. Office surgery: an 8-hour cap and discharge within 24 hours.
- ASPS's general statement that a tummy tuck "may be performed in an accredited office-based surgical facility, licensed ambulatory surgical center or a hospital", quoted as ASPS's and never about Alluring.

**Cannot be said** (unverified, so removed and not replaced):

- Facility accreditation of any kind: AAAASF (also misspelled "AAASF"), QUAD A, AAAHC, Joint Commission or JCAHO, "accredited facility", "accredited surgical suite/center", "state-of-the-art accredited", "acreditado". The user said on 2026-09-24: "let's remove AAAASF I don't know if we are really accredited." `llms.txt` still says "AAASF-accredited surgical center".
- "Board-certified anesthesiologist(s)", "anesthesiologist on every case", "MD anesthesiologist".
- "State-of-the-art facility", "hospital-grade operating room", or any description of where surgery happens (office, ASC or hospital). Owner question.
- "24/7 surgeon access", "around-the-clock care", "on-call surgeon".
- "Ultrasound guidance on every case" as the practice's own claim. The law requiring it is sourced; the practice claim waits on #247.
- Named devices: VASER, SmartLipo, BodyTite, "power-assisted". The exception is **J-Plasma**, which may be named as the price-sheet add-on.
- Drains or a drainless technique (tummy tuck). Owner question.
- "Safest", "zero complications", "no deaths", "perfect safety record", "risk-free".
- HIPAA or "HIPAA-compliant" as a marketing claim.

---

## 4. Experience, volume, reviews

**Allowed:**

- "Board certified in general surgery by the American Board of Surgery since 2008." Always state the year; never compute a tenure ("18 years").
- "Active Florida medical license ME130613, no discipline on record."
- "One surgeon performs every [procedure] at Alluring."
- **Rating:** 4.7 stars on Google. Always read it from the synced Google figures (`google_reviews_settings`, which `/`, `/reviews` and the procedure pages use), with `siteConfig.trustStats.rating` ('4.7') as the static fallback only.
- **Review count:** never type it ("80+ reviews", "81 reviews", "100+"). Render it from the synced `totalCount`. Copy that can't read data (`lp-copy.ts`, `mj-copy.ts`) leaves the count out.
- Real Google reviews as synced and unedited, marked "Translated by Google" where Google translated them. Never paraphrase, merge or cherry-pick a review.

**Removed:**

- Volume and tenure: "5,000+ patients/procedures", "5,000+ happy patients", "thousands of patients", "countless patients", "hundreds of BBLs", "15+ years", "15+ years of experience", "decades of experience", "over two decades", "years of specialized experience".
- `siteConfig.trustStats` fields `patients`, `years`, `certified` and `accreditation`, **and the hard-coded fallbacks** `?? '5,000+'` and `?? '15+'` in consumers. The fallbacks would survive removing the config values. See section 12 for the list.
- Satisfaction claims: "consistently high patient satisfaction across review platforms", "patients trust implicitly".

---

## 5. Prices

**Source:** the practice's printed price sheet, photographed 2026-09-15 (`docs/pricing/practice-price-list.md`). These are list prices, quoted in US dollars exactly as printed.

**The required caveat.** Every published practice price sits in a paragraph, list or table whose own text, or the text right before or after it, includes the caveat. The blog sweep checks for "confirm" plus "consultation".

- Short (the existing `PRICE_VARIABLES`, keep verbatim): "Starting prices. Yours depends on the areas treated, your body and any procedures combined, and your surgeon confirms it at consultation."
- Long (FAQs, posts, `llms-full.txt`): "These are starting prices from the practice's price list. Your price is set for you after an exam, estimates may change, and Dr. Karlinsky confirms your price at consultation."

**Framing rules:**

- Every published price is "starting at" or "from". The single exception is a named line from the sheet: "a mini tummy tuck is $3,000".
- The page's "starting at" figure is the **lowest line on the sheet for that procedure, with the variant named** where it isn't the standard version (for example, "from $3,000 for a mini tummy tuck"). Never round, average or invent a range.
- No "all-inclusive", "no hidden fees" or "everything included" while D4 is open. The BBL `pricing.includes` list stays on the BBL page only (D4).
- Never a price the sheet doesn't print. Never a discounted figure, and never the handwritten "20% off" (D5).

### Starting figure per procedure

| Page (`/procedures/...` unless noted) | Approved "starting at"                                                          | Sheet lines that may be quoted                                                                                                                                                                                                                                                                                                                                                 | Currently on the site, and wrong                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `brazilian-butt-lift-bbl-miami`       | **$5,500**                                                                      | Lipo 360 + BBL $5,500. Range rule below.                                                                                                                                                                                                                                                                                                                                       | Retired: $3,500, $4,500, $6,000, $7,000, $15,000, $34/week                                                        |
| `liposuction-miami`                   | **$4,000 (Lipo 360)**                                                           | Lipo 360 $4,000. Single areas are add-ons only, on top of another procedure: chin $500, pubic $500, buffalo hump $500, banana rolls $500, axillary $600, inner thighs $800, outer thighs $800, hips $800, arms $1,000, full back/flanks $1,500, abdomen/flanks $1,500 ("$500 to $1,500, depending on the area"). J-Plasma $1,000 for the first area, $500 for each additional. | $4,500, "from $2,500", quiz "$3,000–$7,000", "$3,000–$5,000 per area". Never a standalone single-area lipo price. |
| `tummy-tuck-miami`                    | **$3,000 (mini, no muscle repair)**                                             | Mini $3,000; extended mini $4,000; regular/full $4,500; extended $5,500; fleur-de-lis $10,000; abdomen/flanks lipo add-on $1,500                                                                                                                                                                                                                                               | $3,500, "$5,500" as the starting price, "$8,000+", the writer prompt's "$6,500 mini / $9,500 full"                |
| `breast-augmentation-miami`           | **$3,500 (saline)**                                                             | Saline $3,500; silicone $4,500; fat grafting to the breasts $1,500 (add-on); implant exchange $3,500 saline / $4,500 silicone; implant removal $3,000 standalone (rare) or $500 per breast added to another breast procedure; capsulectomy $500 per breast                                                                                                                     | Saline "$4,500–$6,500", silicone "$5,500–$8,500"                                                                  |
| `breast-lift-miami`                   | **$4,000 (modified lift)**, default of D8                                       | Modified (skin below the areola only) $4,000; no implants $5,000; with saline $6,000; with silicone $7,000                                                                                                                                                                                                                                                                     | `priceFrom` "$6,500"                                                                                              |
| `breast-reduction-miami`              | **$6,000 (small to medium)**                                                    | Small–medium $6,000; large $8,000; extra large $9,000; male $6,000                                                                                                                                                                                                                                                                                                             | `priceFrom` "$6,500"                                                                                              |
| `facelift-miami`                      | **No facelift-alone price** (D2). Quote only "A face and neck lift is $15,000." | Face & neck lift $15,000; fat grafting to the face $1,500; brow lift $8,500; lip lift $1,500; TCA peel $1,000                                                                                                                                                                                                                                                                  | `priceFrom` "$11,500", `weeklyPaymentFrom` "$69/week"                                                             |
| `blepharoplasty-miami`                | **$3,500 (upper or lower eyelids)**                                             | Upper $3,500; lower $3,500; both $6,500                                                                                                                                                                                                                                                                                                                                        | `weeklyPaymentFrom` "$22/week"                                                                                    |
| `mommy-makeover-miami`                | **No total** (D3)                                                               | Priced part by part from the lines above, minus the combination discount                                                                                                                                                                                                                                                                                                       | Retired totals: $5,000, $7,000, $9,500, $12,000                                                                   |
| `/mens-plastic-surgery-miami`         | Gynecomastia **$4,500**                                                         | Gynecomastia (gland excision and chest lipo) $4,500; breast lift with gynecomastia $5,500; male breast reduction $6,000; chest lipo $1,000 (combined with another procedure only)                                                                                                                                                                                              | Check the page                                                                                                    |
| No page (quote exactly or not at all) | n/a                                                                             | Otoplasty $4,500; back lift with back lipo $8,000; arm lift without lipo $5,000 / with lipo $6,000; medial thigh lift $8,000 / with inner-thigh lipo $8,800; medial and vertical thigh lift $10,000 / with lipo $10,800; axillary skin excision $1,500 (add-on); inframammary crease repair $500 per breast (add-on); double bubble repair $500 per breast (add-on)            | n/a                                                                                                               |

**BBL range rule:**

- Write: "A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000."
- The range is **typical, not a maximum**. Never write "up to $10,000" or "$5,500–$10,000" without "most patients".
- The range is published for BBL only (`pricing.upTo`). No other procedure gets a "most patients" range.

**Combinations:**

- Write: "When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three."
- Never "save up to", and never a percentage.
- This is a discounted-fee advertisement under Fla. Stat. 456.062 (D7).
- Mommy makeover copy builds its price from the parts and this discount, and never states a total.

**National averages in posts.** Allowed only when all of these hold:

- the figure is attributed to the named source;
- the sentence says what it leaves out;
- it is never placed so it can be read as Alluring's price.

The only national figures cleared are in the facts files, all from ASPS cost pages read 2026-09-22 and 2026-09-28. Each is "a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses", and they carry **no year**, because the source pages give none.

- BBL: $7,264
- Liposuction: $4,711
- Tummy tuck: $8,174

The facts files win over the seed note, so don't write "for 2023". Never cite:

- a "2024" or "2025" ASPS fee;
- an ISAPS or Aesthetic Society price;
- "Miami average" prices;
- competitor prices;
- one surgeon's estimate (for example, the ASPS-blog "$10,000–$20,000" tummy tuck).

Any other national figure needs a named source and year that someone read in the session, and a facts-file entry before it goes live.

---

## 6. Financing

**The rule:** say that financing is offered and name the partners. **Quote no number:**

- no weekly or monthly payment;
- no APR or "0% APR";
- no term;
- no "as low as";
- no deposit (D10).

A payment amount or rate is a trigger term under Truth in Lending (Reg Z). The site's own LP rules already forbid them. Default of D6: every weekly figure is removed site-wide.

**Partners:** `FINANCING_PARTNERS` = Cherry, CareCredit, United Credit, joined by `getFinancingPartnersString()` as "Cherry, CareCredit, and United Credit".

**Approved sentences:**

- Short: "Financing is available through Cherry, CareCredit and United Credit for qualified applicants."
- Long: "Financing is available through Cherry, CareCredit and United Credit for qualified applicants. Approval and terms are set by the lender. See [financing](/plastic-surgery-financing-miami)."

**Removed** (unverified or trigger terms):

- "fast approval", "high approval rates", "instant approval", "guaranteed approval", "no credit check", "bad credit OK", "won't affect your credit score"
- "0% APR", "interest-free", "buy now, pay later"
- "make procedures more affordable"
- `WEEKLY_PAYMENT_OPTIONS`, `LOWEST_WEEKLY_PAYMENT`, `WEEKLY_PAYMENT_DISCLAIMER` (it also claims an "all-inclusive price"), and every `weeklyPaymentFrom` value ($22, $27, $34, $41, $69/week)

---

## 7. Medical figures and recovery

**Policy:**

1. **Facts files win.** For BBL, liposuction and tummy tuck, every %, $, time, count, volume, BMI, length or age figure must match a fact in `bbl.facts.ts`, `lipo.facts.ts` or `tummy-tuck.facts.ts`, with that fact's attribution and caveat.
    - A third party's advice quoted by ASPS is "a plastic surgeon interviewed by ASPS" or "(Name, MD, on the ASPS website)", never "ASPS says".
    - Anything that contradicts a facts file is wrong: rewrite it to the fact, or delete it.
2. **Other figures need a citation** to ASPS, The Aesthetic Society, Cleveland Clinic, Mayo Clinic, MedlinePlus, the FDA or a PubMed-indexed journal, read in the session. Name the source inline and list it under "## Sources".
    - Never cite RealSelf, Healthline, lipo.com, lipo360.com, competitor clinics or clinic blogs.
3. **Uncited numbers.** A plausible general range may stay without a citation only if all of these hold:
    - it is hedged ("most people", "usually", "your surgeon sets yours");
    - it is consistent with the facts files and quickStats;
    - it is not a safety, mortality, complication, survival or longevity figure.
      Wrong or alarming figures are deleted.
4. **Practice figures** (quickStats) are Alluring's and are stated as Alluring's ("at Alluring, a BBL takes 3 to 5 hours"), never as a society's guidance.
5. **Garment, massage and pillow schedules** are presented as evidence plus "or as your surgeon directs", never as the practice's protocol.
6. **Never cite:**
    - "1 in 3,000" (or any "1 in N") BBL mortality as current risk;
    - "the deadliest cosmetic surgery" without its source;
    - any 2024 or 2025 ASPS surgeon fee;
    - counts mixed across ASPS, The Aesthetic Society and ISAPS in one figure or comparison;
    - "capsular contracture affects 75% of patients within two years" (wrong), or any contracture rate without a read source;
    - "all 25" autopsied BBL deaths (11 were autopsied);
    - "at least 5 days" near the surgeon after a BBL;
    - BBL exercise at "8–10 weeks" (publish 8);
    - a Florida per-day BBL case cap (none is in force);
    - a fat-survival percentage credited to Cleveland Clinic;
    - "pain peaks on days 4–5";
    - "0.7% of patients have complications" or "3.1% of patients have complications" (those are major-complication rates per procedure).
7. **Longevity claims** with no facts-file source are removed and replaced with nothing more specific than "long-lasting": implants "10–20+ years", facelift "10–15 years", eyelid "10–15+ years", "permanent results".
    - Implants are not lifetime devices. A post may say so only with a cited FDA source.

### Canonical milestones, by procedure

**BBL** (`bbl.facts.ts`, sourced standard approved 2026-09-14):

- At Alluring, 3 to 5 hours under general anesthesia; home the same day.
- Short walks on day 1 or 2 (The Aesthetic Society).
- Pain medication for 4 to 5 days (a plastic surgeon interviewed by ASPS). Pain eases after 1 to 2 weeks (Cleveland Clinic).
- No sitting or lying on the buttocks for at least 2 weeks (Cleveland Clinic). Sleep on your stomach or side.
- After 2 weeks, brief sitting on a BBL pillow, about 10 minutes at a time, through week 6 (a surgeon interviewed by ASPS).
- Pillow for about 8 weeks (Cleveland Clinic); no direct pressure for at least 8 weeks (The Aesthetic Society).
- Garment 24/7 in month 1 and at least 12 hours a day in month 2, or as your surgeon directs.
- Desk work and driving at 10 to 14 days, on a pillow (Cleveland Clinic, The Aesthetic Society). Always pair with ASPS's days 7 to 10.
- No heavy lifting for about the first month (Cleveland Clinic). Light activity such as fast walking after month 1 (Kamran Azad, MD, ASPS blog).
- Exercise after 8 weeks, once cleared (The Aesthetic Society).
- Full recovery in 2 to 3 months, and up to 6 (Cleveland Clinic: give both).
- Final shape at 3 to 6 months. Fat-loss risk subsides around month 3.
- About 50% to 80% of grafted fat survives (2020 review, Seminars in Plastic Surgery). The average take is about 60% (surgeons interviewed by ASPS).
- Flying in: plan 7 to 10 days in Miami (practice). ASPS's travel article advises at least 4 to 5 days near your surgeon, and walking 5 to 10 minutes per hour of sitting on the flight.
- Safety figures: only Pazmiño and Garcia 2023 and Elsaftawy 2026, as worded in the facts file.

**Liposuction** (`lipo.facts.ts`):

- At Alluring, usually 1 to 3 hours, general anesthesia or local with sedation, home the same day. Practice figure; the owner should confirm it.
- Walk as soon as possible (MedlinePlus).
- Swelling peaks around 48 hours. It mostly goes down within 2 to 3 weeks, with slight swelling up to 4 months (The Aesthetic Society).
- Bruising fades in 7 to 10 days.
- Work: "within a few days, depending on your job" (The Aesthetic Society) **and** "weeks 2 to 3" (ASPS). Give both; never one as the rule.
- Most normal activities within 10 days.
- Garment for 4 to 6 weeks. No strenuous exercise for 4 to 6 weeks.
- Final result at 3 to 6 months (Cleveland Clinic).
- Not a weight-loss treatment, no skin tightening, no cellulite improvement.
- Florida office limits: 4,000 cc; 1,000 cc with a tummy tuck.

**Tummy tuck** (`tummy-tuck.facts.ts`):

- 1 to 5 hours (Cleveland Clinic, general). The time at Alluring is an owner question.
- Walk on the day of surgery. Bent at the waist for 7 to 10 days (Cindy Wu, MD); standing tall within 1 to 2 weeks (ASPS).
- Drains, _if placed_, come out in 1 to 2 weeks. Never say whether Alluring uses them.
- Work in about 2 weeks (Wu); plan at least 1 week off (Cleveland Clinic). By type (Samir Rao, MD): mini 1 to 2 weeks, full a couple of weeks, extended 4 to 6 weeks.
- Driving at 1 to 2 weeks.
- No running or lifting for 6 weeks. Heavy lifting, strenuous exercise and sex at 4 to 8 weeks, once cleared. Garment for 4 to 6 weeks.
- Feeling normal around 8 weeks. Swelling and full recovery around 3 months.
- Final result up to 3 months; the scar improves for up to 1 year and fades at 12 to 18 months.

**Procedures without a facts file.** Use their quickStats only, stated as Alluring's, and hedged. Add no other figure until a facts file exists.

| Procedure           | Surgery                                   | Recovery figure allowed (hedged) | Remove                                                                                                                                   |
| ------------------- | ----------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Breast augmentation | 1–2 hours, general, outpatient            | About 1 week to light activity   | "Long-lasting (10–20+ years)" (becomes "Long-lasting" at most)                                                                           |
| Breast lift         | 2–3 hours, general, outpatient            | 1–2 weeks to work                | n/a                                                                                                                                      |
| Breast reduction    | 2–4 hours, general, outpatient            | 1–2 weeks to work                | n/a                                                                                                                                      |
| Facelift            | 3–5 hours, general, outpatient            | 2–3 weeks                        | "10–15 Years" results                                                                                                                    |
| Blepharoplasty      | 1–2 hours, local with sedation or general | 7–10 days to work                | "10–15+ Years", "stand the test of time"; "improved vision" stated flatly (hedge it as "can help when drooping upper lids block vision") |
| Mommy makeover      | 3–5 hours, general, outpatient            | 2–3 weeks to light activity      | n/a                                                                                                                                      |

---

## 8. Travel and market

**Approved:**

- "Patients fly in from other US states."
- "If you're flying in, Alluring confirms your surgery, pre-op and follow-up dates in writing and tells you how many nights to stay in Miami before you're cleared to fly home. You arrange the travel itself."
- BBL only: "Plan on 7 to 10 days in Miami."
- Other procedures give no number of nights: the surgeon sets it.
- "We are not affiliated with any recovery house."
- "Virtual consultation" and "in person in Miami or by video".
- "Hablamos español."

**Forbidden:**

- Any mention of the practice handling travel: flights, hotels, lodging or accommodation, transport or transportation, airport pickup, chauffeurs, drivers, "travel coordination", "we arrange your stay", "packages", "all-inclusive packages", "concierge" in a travel sense, "recovery house/home/suite/retreat" (except the non-affiliation sentence), "aftercare home", nurses at a hotel.
- Any market outside the US: "international patients", "from abroad", "overseas", "worldwide", "medical tourism", "Latin America", "the Caribbean", naming foreign countries as a patient source, "pacientes internacionales", "turismo médico", "Latinoamérica", "el Caribe".
- "Fly-in consultation" as a travel service. If the `/fly-in-consultation` page stays, it frames the consultation clinically only.

---

## 9. Contact

From `siteConfig.contact`. Never typed in a new place.

| Item    | Canon                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone   | **+1 (786) 305-8649** (`phoneDisplay`), `tel:+17863058649` (`getPhoneLink()`). It does not receive texts. Show "Text us" only when `textPhone` is set.                                            |
| Email   | **info@alluringplasticsurgery.com**. The chat prompt's `info@alluringmiami.com` and its `alluringmiami.com` links are wrong; use siteConfig and canonical `www.alluringplasticsurgery.com` paths. |
| Address | 8435 SW 24th St, Miami, FL 33155 (`getFullAddress()`)                                                                                                                                             |
| Hours   | Monday–Friday 9:00 AM–5:00 PM; Saturday 9:00 AM–3:00 PM; Sunday closed, and closed on public holidays                                                                                             |

**In posts:**

- No phone number in the body. The post template supplies contact. A legacy post whose number matches +1 (786) 305-8649 is tolerated until it is rewritten; any other number is wrong.
- Replace contact links to `#contactus` with **`/contact-us`**. The anchor doesn't exist, so those links are dead.
- The post template has its own consult thread at `#post-consult` (`POST_CONSULT_ID`). Body links may use it per D11. The default is `/contact-us`, which works wherever the post body is rendered.
- Don't name response times ("we'll call you in 5 minutes"). The practice answers leads by text.

---

## 10. Superlatives and regulated words

**Forbidden** (English and Spanish, any inflection):

- **Superlatives:** "best", "the best", "el/la mejor"; "safest", "más seguro"; "top", "top-rated", "top-notch", "Miami's top"; "#1", "No. 1", "number one", "número uno"; "leading"; "industry-leading"; "world-class"; "premier"; "elite"; "renowned"; "cutting-edge"; "state-of-the-art"; "revolutionary"; "most advanced"; "unmatched"; "unparalleled".
- **Promises:** "guarantee(d)", "garantizado"; "risk-free", "no risk", "sin riesgo"; "painless", "sin dolor"; "scarless", "sin cicatrices"; "perfect results"; "permanent results"; "dream body"; "transform your body/life".
- **Brand register:** "luxury", "luxurious", "lujo"; "affordable", "affordability", "asequible", "económico" (used as a price claim).
- **Urgency:** "limited time", "act now", "spots left", "hurry", countdowns, "only X left".
- **Review claims:** "medically reviewed", "fact-checked by".

**"Free" and Fla. Stat. 456.062.** Under 456.062, an advertisement for a free, discounted or reduced-fee service, examination or treatment must carry the statute's prescribed statement: the patient's right to refuse to pay, cancel or be reimbursed for any other service performed as a result of, and within 72 hours of, responding to the ad. Counsel confirms the exact text before anyone uses it.

- **Never "free" for a medical service**, with or without the statement: free surgery, free procedure, free lipo area, free BBL, free exam or evaluation, free follow-ups, free garment, free add-on, free injections. The same applies to "complimentary", "no-cost", "gratis", "sin costo" and "de regalo".
- **"Free consultation" as it stands today** stays for now, as a separate existing decision. Where it stands: about 200 occurrences in `apps/web`, the `/free-consultation` and `/consulta-gratis` routes, the meta descriptions ending "Free consultation.", the post template's "Start my free consultation" and "Empezar mi consulta gratis", `llms.txt`, and the chat prompt's "FREE consultation".
- **New and rewritten copy doesn't add "free".** It says "consultation", "no-obligation consultation" or "virtual consultation", following the existing LP and Dr. K IG landing page rules, which hold "free" until counsel settles 456.062.
- Search Console, 90 days to 2026-10-22: queries containing "free … consultation" drew about 500 impressions and **0 clicks**, at positions 27 to 67. Dropping the word costs no measurable traffic. Whether to retire it everywhere is D7.
- **Discounts.** The combination discount, any "% off", and the handwritten "20% off" are discounted-fee advertising under the same statute. They are part of D7. Promotions and giveaways (the DB `promotion` table, for example "Win a $5,000 Surgery Credit" with a "$350 deposit … guaranteeing you a spot") are expired. They are not republished, and new ones go through counsel.

---

## 11. Forbidden-claim regex list

These patterns are concept-based and run case-insensitively (Python `re`, `re.I`). Run them over the visible text:

- Strip link and image _targets_ first, but keep their labels and alt text.
- Neutralize the source names listed under N before the run.

A hit means a human or the Opus pass reviews it, unless the rule says **fail**. Where the rule refers to the allowed set or the statement, the verifier also applies the paired check described.

**N: neutralizers.** Replace these with a space before sweeping. They extend `NEUTRAL` in `blog/tools/lib/bloglib.py`.

```
american society of plastic surgeons
plastic surgeons? (?:interviewed|quoted) by (?:asps|the american society of plastic surgeons|the aesthetic society)
plastic and reconstructive surgery(?: global open)?
journal of plastic,? reconstructive (?:and|&) aesthetic surgery
american society of anesthesiologists
she is board certified in general surgery by the american board of surgery and is a fellow of the american college of surgeons\.
the specialty recognition identified herein has been received from a private organization not affiliated with or recognized by the florida board of medicine\.
alluring plastic surgery
```

### 11.1 Credentials and team

```
CR1  board[\s-]*certifi\w*\s+(?:as\s+an?\s+)?(?:plastic|cosmetic|aesthetic|facial)\b
CR2  (?:double|dual|triple|two[\s-]time|multi)[\s-]*board|certified by (?:two|three|multiple|several) boards|doble certificaci[oó]n
CR3  \babps\b|american board of plastic surgery
CR4  board[\s-]*certifi\w*(?![^.\n]{0,120}american board of surgery)
CR5  american board of (?:facial )?cosmetic surgery|\babf?cs\b
CR6  \bour\s+(?:\w+\s+){0,2}surgeons\b|\b(?:team|panel|group|staff)\s+of\s+(?:\w+\s+){0,2}surgeons\b|\ball (?:of )?our (?:\w+ )?(?:surgeons|doctors)\b|nuestros cirujanos
CR7  \bplastic\s+surgeons?\b|cirujan[oa]s?\s+pl[aá]stic[oa]s?
CR8  fellowship director|fellow(?:,|\s+of)?\s+(?:the\s+)?american academy of cosmetic surgery|fellowship (?:training )?(?:at|with) the american academy
CR9  \blofman\b|\bshats\b
CR10 \b(?:world[\s-])?renowned\b|\bdistinguished\b|leading authority|shaped the landscape|highest (?:standards|level)|miami['’]s top|\btop (?:surgeons?|doctors?|clinic)\b
CR11 medically[\s-]reviewed|medical(?:ly)? review(?:ed|er)\b|reviewed by (?:dr\b|a doctor|our|the surgeon)|fact[\s-]checked by|medical (?:content )?review board
CR12 100\s*%\s*(?:board[\s-]*)?certified
CR13 (?:<title>|seo_?title|meta_title)[^\n]{0,200}(?:karlinsky|board[\s-]*certifi)
```

- **CR1 (fail):** "board-certified plastic/cosmetic surgeon". False positives: none.
- **CR2 (fail):** counts of boards.
- **CR3 (fail):** in Alluring copy. False positive: a post explaining what ABPS is in general. That still gets reviewed, because it invites a comparison.
- **CR4 (fail):** bare "board-certified" that doesn't name the American Board of Surgery within the sentence. False positive: a quote of a third party's credentials. Rewrite it or neutralize it.
- **CR5 (fail unless the statement is present):** the paired check passes only if the same block (paragraph, list item, alt text or element) contains the Florida statement verbatim. In posts, titles, meta, `llms*.txt`, chat and ads, it always fails. False positives: none, since `\babf?cs\b` doesn't match "FACS".
- **CR6 (fail):** plural surgeons. False positive: "surgeons at other clinics", which doesn't match.
- **CR7 (review):** run after neutralizers N. False positive: general statements about the field ("ask any plastic surgeon about…"). Allowed only when it clearly isn't her.
- **CR8 (fail until D9):** the AACS and fellowship-director titles.
- **CR9 (fail for Lofman; flag only for Shats until D1).**
- **CR10 (fail):** superiority claims about the surgeon or clinic.
- **CR11 (fail):** review claims.
- **CR12 (fail):** `trustStats.certified`.
- **CR13 (fail):** run on title fields only.

### 11.2 Facility and safety (owner claims)

```
FA1  a{2,4}sf\b|quad\s*a\b|\baaahc\b|joint commission|\bjcaho\b|accredit\w*|acreditad\w*|acreditaci[oó]n
FA2  anesthesiologists?|anestesi[oó]log\w*
FA3  24\s*/\s*7|around[\s-]the[\s-]clock|on[\s-]call (?:surgeon|doctor)|las 24 horas
FA4  ultrasound[^.\n]{0,60}\b(?:every|each|all)\s+(?:case|patient|bbl|procedure)s?|\b(?:every|each|all)\s+(?:case|bbl|procedure)s?[^.\n]{0,60}ultrasound
FA5  \bvaser\b|smart[\s-]?lipo|bodytite|power[\s-]assisted|\bpal\b liposuction
FA6  state[\s-]of[\s-]the[\s-]art|hospital[\s-]grade|surgical (?:suite|center|centre)|ambulatory surgery center|operating (?:room|suite)s? (?:at|in) (?:alluring|our)
FA7  \bdrainless\b|no[\s-]drains?\b|sin drenajes?
FA8  \bsafest\b|zero complications|no (?:deaths|complications)|perfect safety|risk[\s-]free|sin riesgos?
FA9  \bhipaa\b
```

- **FA1 (fail):** false positives are the ASPS tummy-tuck setting quote (allowed only when the sentence names ASPS and not Alluring or "we" or "our") and an "AACS-accredited fellowship" mention (not published).
- **FA2 (fail):** a false positive is the source name "American Society of Anesthesiologists", which is neutralized. Generic "an anesthesia provider" doesn't match.
- **FA3 (fail):** a false positive is "within 24 hours" (Florida discharge law), which doesn't match.
- **FA4 (fail):** "ultrasound on every case" stated as the practice's own claim.
- **FA5 (fail):** named devices. "J-Plasma" is allowed and isn't matched.
- **FA6 (review):** a false positive is "operating room facilities" in the ASPS average-cost exclusion, which doesn't match because of the "at/in alluring/our" tail.
- **FA7 (fail):** drains are an owner question.
- **FA8 (fail).**
- **FA9 (review).**

### 11.3 Experience, volume, reviews

```
EX1  (?<![\d.,$])\d{1,3}(?:,\d{3})*\s*\+?\s*(?:happy |satisfied |successful )?(?:patients|procedures|surgeries|clients|bbls|cases|transformations|pacientes|cirug[ií]as)\b
EX2  thousands of|countless|hundreds of (?:patients|women|procedures|bbls)|miles de pacientes
EX3  \b\d{1,2}\s*\+?\s*(?:years?|decades?|a[nñ]os)\s+(?:of\s+|de\s+)?(?:experience|practice|expertise|in practice|serving|experiencia)|decades of experience|over (?:a|two|three) decades|years of (?:specialized )?experience
EX4  \b(?:4\.[0-689]|5(?:\.0)?)\s*[-\s]?stars?\b|\b(?:4\.[0-689]|5\.0)\s*/\s*5\b|\b5[\s-]star\b
EX5  \b\d{2,4}\s*\+?\s+(?:google\s+|five[\s-]star\s+|5[\s-]star\s+)?reviews\b|\b\d{2,4}\s*\+?\s+rese[nñ]as
EX6  consistently high (?:patient )?satisfaction|trust (?:her )?implicitly|patients? love
```

- **EX1 (fail unless it's a study count):** false positives are facts-file study counts ("22,151 patients", "237 patients", "25,478 patients", "29,368 patients", "14,061 patients"). Allowed only when the sentence names the study or review.
- **EX2 (fail).**
- **EX3 (fail):** "since 2008" doesn't match.
- **EX4 (fail):** any rating other than 4.7, including the "5-star" register. False positive: none in copy.
- **EX5 (fail):** a typed review count. Counts come from synced data, and templates that interpolate `totalCount` render a number after the template is built, so run this on source strings, not on rendered HTML.
- **EX6 (fail).**

### 11.4 Prices and financing

```
PR1  (?:\bbbl\b|brazilian butt lift|butt lift|levantamiento de gl[uú]teos)[^.\n]{0,80}\$\s?(?:3,?500|4,?500|6,?000|7,?000|15,?000)\b
PR2  \$\s?(?:3,?500|4,?500|6,?000|7,?000|15,?000)\b[^.\n]{0,60}(?:\bbbl\b|brazilian butt lift)
PR3  (?:\blipo\w*|liposucci[oó]n)[^.\n]{0,60}(?:from|starting at|starts at|desde)\s+\$\s?(?:4,?500|2,?500)\b|\$\s?3,?000\s*(?:[–-]|to)\s*\$?\s?(?:5|7),?000
PR4  (?<!extended )(?:tummy tuck|abdominoplast\w*|abdominoplastia)[^.\n]{0,60}(?:from|starting at|starts at|desde)\s+\$\s?(?:3,?500|5,?500|6,?500|9,?500)\b|\$\s?8,?000\s*\+|tummy tuck[^.\n]{0,60}\$\s?8,?000\b
PR5  (?:breast augmentation|breast implants?|aumento de senos)[^.\n]{0,80}\$\s?(?:4,?500\s*[–-]\s*\$?6,?500|5,?500|8,?500)\b
PR6  (?:breast|thigh|arm|body|butt|face|neck|brow)[\s-]lift[^.\n]{0,60}\$\s?6,?500\b|breast reduction[^.\n]{0,60}\$\s?6,?500\b
PR7  \$\s?11,?500\b
PR8  mommy makeover\w*\s+(?:costs?|starts?|is|are|runs?|from|starting at|price[sd]?|cuesta|desde)[^.\n]{0,40}\$\s?\d|mommy makeover[^.\n]{0,40}\$\s?(?:5,?000|7,?000|9,?500|12,?000)\b
PR9  \$\s?\d[\d,]*(?:\.\d+)?\s*(?:/\s*|a\s+|per\s+|al?\s+)(?:week|wk|month|mo|semana|mes)\b|(?:weekly|monthly|semanal\w*|mensual\w*)\s+(?:payments?|pagos?)|pagos?\s+(?:semanales|mensuales)|as low as\s+\$
PR10 \b(?:0|zero)\s*%\s*(?:apr|interest|financing)|\bapr\b|interest[\s-]free|no[\s-]interest|sin intereses|buy now,? pay later
PR11 (?:fast|instant|quick|guaranteed|easy|high)\s+approv\w*|approval rates?|no credit check|won['’]?t (?:affect|hurt|impact) your (?:credit|score)|bad credit (?:ok|welcome)|everyone (?:is )?approved
PR12 all[\s-]inclusive|todo incluido|no hidden (?:fees|costs)|sin costos ocultos|everything (?:is )?included
PR13 \$\s?\d[\d,]*\s+(?:deposit|dep[oó]sito)|dep[oó]sito de \$
PR14 \b\d{1,2}\s*%\s*(?:off|de descuento)(?!\s\$[\d,]+(?:\s(?:and|to)\s\$[\d,]+)?\))|save up to|ahorra hasta
PR15 \$\s?(?:7,?264|4,?711|8,?174)\b
PR16 (?:average|national|typical|promedio)\s+(?:cost|price|fee|costo|precio)[^.\n]{0,80}\$\s?\d
PR17 \$\s?\d[\d,]*
```

- **PR1 and PR2 (fail):** retired BBL figures. False positive: a breast-lift price ($6,000 or $7,000) in a sentence that also names BBL, such as a combination; review it.
- **PR3 (fail):** retired lipo figures. False positive: the silicone augmentation price $4,500 near "lipo"; the "from/starting" anchor limits this.
- **PR4 (fail):** retired tummy tuck starting figures. "Extended tummy tuck from $5,500" is excluded by the lookbehind; check other wordings by hand.
- **PR5 (fail):** the old augmentation ranges.
- **PR6 (fail):** "$6,500" for a lift or a reduction. False positive: blepharoplasty "both $6,500" doesn't match (no "lift").
- **PR7 (fail):** the old facelift price.
- **PR8 (fail):** any mommy makeover total. False positive: a parts table row in the same sentence. Tables split by row, so check the row.
- **PR9 (fail):** a financing payment figure.
- **PR10 (fail):** APR and interest claims. False positive: a financing explainer that defines APR generically. It still gets reviewed (Reg Z).
- **PR11 (fail):** approval claims.
- **PR12 (fail until D4).**
- **PR13 (fail until D10).**
- **PR14 (fail):** the combination discount sentence in section 5 is allowed and doesn't match (no %). "20% off" fails. False positive: the resolver's own plain-text form of an admin discount, "$4,400 (20% off $5,500)" (and its range and span forms), which the lookahead exempts. That form only ever comes from a claim token, never from typed copy.
- **PR15 (paired check):** the sentence must name ASPS or the American Society of Plastic Surgeons, say what the figure excludes (anesthesia or "operating room"), and contain no year (`\b20\d\d\b`).
- **PR16 (paired check):** the figure must be one of the three ASPS averages, or come from a named source and year read in the session and recorded in a facts file.
- **PR17 (allowed-set check):** every $ figure in a sentence, list item or table row naming a procedure must be in that procedure's row of the section 5 table or the facts file. Any $ figure that names the practice ("at Alluring", "our", "we") must sit in a block with the caveat (`\bconfirm` and `\bconsultation` in the same block or the adjacent one).

### 11.5 Superlatives, brand and regulated words

```
SU1  \bbest\b|\bmejor(?:es)?\b
SU2  \bsafest\b|m[aá]s segur[oa]s?\b
SU3  guarantee\w*|garantiz\w*|garant[ií]a
SU4  #\s?1\b|\bno\.?\s?1\b|number one|n[uú]mero uno
SU5  \btop[\s-](?:rated|notch)\b|\bleading (?:surgeon|practice|clinic|provider|expert|center|centre|plastic|cosmetic)|industry[\s-]leading|world[\s-]class|cutting[\s-]edge|revolutionary|most advanced|unmatched|unparalleled|\bpremier\b|\belite\b
SU6  \bpainless\b|\bscarless\b|sin dolor|sin cicatri\w*|perfect (?:results?|body)|resultados perfectos|permanent(?:ly)? (?:results?|fix|solution)|dream body|transform your (?:body|life|look)
SU7  \bluxur(?:y|ious)\b|\blujos[oa]?\b|\blujo\b|affordab(?:le|ility)|asequible|econ[oó]mic[oa]s?\b
SU8  luxury (?:surgeries|surgery) made affordable|where luxury meets|luxury made affordable|luxury (?:yet|but) (?:affordable|accessible)|premier plastic surgery
SU9  limited[\s-]time|\bact now\b|spots? (?:left|remaining)|\bhurry\b|\bcountdown\b|only \d+ (?:spots|slots) left|por tiempo limitado
SU10 free\s+(?:surgery|procedures?|lipo\w*|bbl|treatments?|exams?|evaluations?|follow[\s-]?ups?|garments?|add[\s-]?ons?|areas?|injections?|botox|fillers?)|(?:surgery|procedure|lipo|area|garment|follow-up)s?\s+(?:for\s+)?free\b|(?:cirug[ií]a|procedimiento|lipo|[aá]rea)s?\s+gratis
SU11 free\s+(?:virtual\s+|in[\s-]person\s+|initial\s+)?consult\w*|consultas?\s+(?:virtual(?:es)?\s+)?(?:gratis|gratuitas?)|complimentary consult\w*
SU12 \bfree\b|gratis|gratuit\w*|complimentary|no[\s-]cost|sin costo|de regalo
```

- **SU1 (review):** false positives are "best candidate(s)", "at best", "as best you can", "best practice", and in Spanish "mejor candidata", "sentirte mejor". Fail when it's said of Alluring, the surgeon, results or price.
- **SU2 (fail).**
- **SU3 (fail):** false positive: quoting a source that says "no guarantee", which is allowed in a hedging context. Review it.
- **SU4 (fail).**
- **SU5 (fail).**
- **SU6 (fail):** false positive: "Liposuction permanently removes fat cells" (Cleveland Clinic, facts file) doesn't match.
- **SU7 (fail):** false positive: the Spanish "económico" in a neutral financial sense ("apoyo económico"). Review it.
- **SU8 (fail):** retired taglines.
- **SU9 (fail):** urgency.
- **SU10 (fail, 456.062):** "free" tied to a medical service.
- **SU11 (follows D7):** default: allowed where it stands today; flagged in new or rewritten copy.
- **SU12 (review):** run after SU10 and SU11. False positives: "smoke-free", "nicotine-free", "fat-free", "free fatty acids", "free radicals", "feel free", "toll-free", "free time", "hands-free", "pain-free" (fail, see SU6), "interest-free" (fail, see PR10), "free of charge" (fail when it's about a service).

### 11.6 Travel and market

```
TR1  concierge|conserje
TR2  \bairports?\b|aeropuerto|pick[\s-]?ups?\b|recogida|traslados?|chauffeur|\bdrivers?\b
TR3  \bhotels?\b|\blodging\b|accommodations?|alojamiento|hospedaje|\bairbnb\b
TR4  recovery (?:house|home|suite|retreat|villa|center|centre)s?|casas? de recuperaci[oó]n|aftercare (?:home|house)
TR5  (?:book|arrang|coordinat|organi[sz]|handl|includ|plan)\w*\s+(?:your\s+|the\s+|all\s+)?(?:flights?|travel|transport\w*|lodging|hotel|stay|accommodations?|trip)
TR6  \bpackages?\b|paquetes?\b
TR7  \binternational\b|internacional\w*|from abroad|overseas|worldwide|around the world|out[\s-]of[\s-]country|del extranjero
TR8  latin america|latinoam[eé]rica|caribbean|el caribe|medical touris\w*|turismo m[eé]dico
TR9  \b(?:colombia|venezuela|m[eé]xico|dominican republic|rep[uú]blica dominicana|brasil|brazil|argentina|per[uú]|ecuador|cuba|honduras|guatemala|el salvador|nicaragua|panam[aá]|costa rica|bahamas|jamaica|trinidad|canad[aá]|uk|europe)\b
TR10 fly[\s-]in (?:consultation|program|service)|travel(?:ing|ling)? patients? program
TR11 virtual assistant|asistente virtual
```

- **TR1 (review):** allowed only as Sofía's title in the chat UI ("our concierge"). Fail in posts and in any travel context.
- **TR2 (review):** false positives: "driver's license" and "the driver of results". Fail when it's about getting patients around.
- **TR3 (fail):** false positive: an ASPS travel-article quote about sitting on a flight, which doesn't match.
- **TR4 (fail, except):** the sentence "not affiliated with any recovery house" (check for `not affiliated`).
- **TR5 (fail):** false positive: "plan on 7 to 10 days in Miami", which doesn't match ("plan on" plus a number).
- **TR6 (review):** fail when it means a bundle of surgery and travel. "Package insert" is fine.
- **TR7 (fail):** false positives: the source name "International Society of Aesthetic Plastic Surgery" (neutralize it, and see the mixed-counts rule) and "international units".
- **TR8 (fail).**
- **TR9 (review):** false positives: "Brazilian butt lift" (`\bbrazil\b` doesn't match "brazilian"), "New Mexico" (a US state), "Puerto Rico" (US, not listed), "uk" inside words (word-bounded). Fail when a country is named as a patient source.
- **TR10 (review):** travel-service framing.
- **TR11 (fail):** Sofía is "our concierge".

### 11.7 Medical figures

```
MD1  \b1\s+(?:in|of|out of|en|de cada)\s+\d[\d,]*\b[^.\n]{0,80}(?:die|death|mortality|fatal|muert\w*|mortalidad)|(?:death|mortality|mortalidad)[^.\n]{0,80}\b1\s+(?:in|of|out of|en)\s+\d[\d,]*
MD2  deadliest|most dangerous (?:cosmetic|plastic|aesthetic) (?:surgery|procedure)|la cirug[ií]a m[aá]s peligrosa
MD3  capsular contracture[^.\n]{0,100}\b\d{1,3}(?:\.\d+)?\s*%|\b\d{1,3}\s*%[^.\n]{0,100}capsular contracture|contractura capsular[^.\n]{0,100}\d+\s*%
MD4  (?:asps|aesthetic society|isaps|american society of plastic surgeons)[^.\n]{0,120}\b(?:in\s+)?20(?:2[3-6])\b|\b20(?:2[3-6])\b[^.\n]{0,120}(?:asps|aesthetic society|isaps)
MD5  (?:asps|aesthetic society|isaps)[^.\n]{0,160}(?:asps|aesthetic society|isaps)[^.\n]{0,80}\d[\d,]{3,}
MD6  (?:results?|implants?|lasts?|lasting|duran?)[^.\n]{0,40}\b\d{1,2}\s*(?:[–-]|to|a)\s*\d{1,2}\s*\+?\s*(?:years|a[nñ]os)|\b\d{1,2}\s*\+\s*(?:years|a[nñ]os)\b
MD7  at least (?:5|five) days|8\s*(?:[–-]|to)\s*10\s+weeks|\ball\s+25\b|(?:three|3)\s+(?:bbls?|cases|surgeries)\s+(?:a|per)\s+day|per[\s-]day (?:cap|limit)|pain peaks?
MD8  cleveland clinic[^.\n]{0,120}\b\d{2}\s*%\s*(?:of\s+)?(?:the\s+)?(?:fat|graft)|(?:fat|graft)\w*[^.\n]{0,60}surviv\w*[^.\n]{0,60}cleveland clinic
MD9  \b(?:0\.7|3\.1|3\.8)\s*%\s+of\s+(?:patients|people)\s+(?:have|get|experience)
MD10 \b\d{1,3}(?:\.\d+)?\s*%
```

- **MD1 (fail):** "1 in N" mortality stated as current risk. Use the facts-file safety figures instead.
- **MD2 (fail unless sourced).**
- **MD3 (fail unless sourced):** "75%" is known wrong.
- **MD4 (review):** a society figure with a year. Fail if it's a 2024 or 2025 ASPS fee. The facts-file ASPS fees carry no year.
- **MD5 (review):** two societies' counts mixed in one sentence.
- **MD6 (fail unless sourced):** longevity claims. False positive: "board certified since 2008" doesn't match. "Be close to your goal weight for 6 to 12 months" doesn't match (months).
- **MD7 (fail):** the BBL facts-file caveats. False positive: "pain peaks" in a sourced lipo or tummy tuck context, which isn't in the facts files. Review it.
- **MD8 (fail):** Cleveland Clinic gives no fat-survival percentage.
- **MD9 (fail):** misread major-complication rates.
- **MD10 (allowed-set check):** in BBL, lipo and tummy tuck content, every % must be a facts-file figure in a sentence carrying that fact's concept words. Elsewhere it needs a cited source in the same paragraph.

### 11.8 Contact and links

```
CO1  \(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b|\btel:
CO2  [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}
CO3  alluringmiami\.com
CO4  \]\(#contactus\)|href=["']#contactus
CO5  \b\d{3,5}\s+(?:s\.?w\.?|n\.?w\.?|n\.?e\.?|s\.?e\.?)\s+\d{1,3}(?:st|nd|rd|th)?\s+(?:st|street|ave|avenue|ct|court|ter|terrace|pl|place)\b
CO6  open (?:on )?sundays?|abierto (?:los )?domingos?|open 7 days|open 24 hours
CO7  (?:call|text|reply|respond|contact)\w*\s+(?:you\s+)?(?:back\s+)?(?:within|in)\s+\d+\s+(?:minutes?|hours?)
```

- **CO1 (paired check):** strip non-digits; the number must equal 7863058649. In posts, any number is a warning (none in the body), and any other number fails. False positives: none common, since study IDs and years don't take this shape.
- **CO2 (paired check):** must equal `info@alluringplasticsurgery.com`.
- **CO3 (fail):** a wrong domain. Use siteConfig `siteUrl` paths.
- **CO4 (fail):** the dead anchor. Replace it with `/contact-us` (or `#post-consult`, per D11).
- **CO5 (paired check):** must equal "8435 SW 24th St".
- **CO6 (fail).**
- **CO7 (fail):** a promised response time.

---

## 12. Where the canon lives in code (proposal, no code written)

### One module: `@workspace/shared/claims` (`packages/shared/src/claims/`)

**Why `packages/shared`:**

- `apps/web`, `apps/admin` and `packages/ai` all depend on `@workspace/shared`. `packages/ai`'s only workspace dependency is shared.
- It already carries cross-app business data (`./seo` keyword registry, `./content` `BUSINESS_DOMAIN`, `config/site-pages.constant.ts`).
- It builds with `tsc` to `dist/` behind subpath `exports`. Add a `./claims` entry to `package.json` `exports`.
- `apps/web/lib/data/site-config.ts` can't be the home: it imports `@/lib/env/public-env`. `packages/ai` can't import from `apps/web`, and the client graph must not import `@/env`.

**Constraints:**

- **Pure data and pure functions only:** no env, Next, React or Node APIs. That keeps it client-safe and readable by `tsx` scripts.
- Split it into small files and subpath exports, so client islands don't pull in the regex list (bundle floor, `size:check`). Split: `claims/identity`, `claims/surgeon`, `claims/prices`, `claims/financing`, `claims/contact`, `claims/patterns`, `claims/prompt`.
- **Patterns and the price sheet are data in one JSON file** (`claims/canon.data.json`), typed by a TS wrapper. That way `blog/tools/` (Python) reads the same file without a JS build.
    - Check that `resolveJsonModule` is on in `packages/shared/tsconfig` and that `tsc` emits the JSON.
    - If it doesn't, generate the JSON from TS in the build, commit it, and add a CI drift check.

**Contents:**

| File           | Holds                                                                                                                                                                                                                                                                                           | Absorbs (the old location re-exports from here during migration, then goes)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity.ts`  | Name, tagline, approved short and long descriptions, market and `areaServed`, Sofía's title, voice rules, retired lines                                                                                                                                                                         | `siteConfig.business.tagline/description`, `siteConfig.seo.siteDescription`, the `llms.txt` and `llms-full.txt` intros, the business blurbs pasted into `packages/ai/src/prompts/**` (chat `system-prompt.prompt.ts`, `blog/generate-topics`, `generate-outline`, `agentic-writer`, `refresh-writer`, image prompts, `gallery/*`, `text/text-improvement`, `chat/conversation-analysis`) and `agents/*` ("luxury plastic surgery clinic")                                                                                                                     |
| `surgeon.ts`   | `KARLINSKY_NAME`, `SHORT_NAME`, `CREDENTIALS` (short, with year, long), `ABS_CERTIFIED_ON`, `FLORIDA_LICENSE`, `FLORIDA_UNAPPROVED_BOARD_STATEMENT`, `karlinskyRecords`, `SINGLE_SURGEON = true`, the forbidden-phrase list                                                                     | All of `apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`. The credential strings in `surgeons-data.ts` (`title`, `shortBio`, `fullBio`, `certifications`, badges) read from here. Also the DB `author.bio` ("team of board-certified surgeons").                                                                                                                                                                                                                                                                                                 |
| `prices.ts`    | `PRICE_SHEET` (every line on the 2026-09-15 sheet, typed: procedure, variant, usd, add-on flag), `STARTING_AT` per procedure slug, the BBL typical range, `COMBO_DISCOUNTS`, `PRICE_CAVEAT_SHORT/LONG`, `NATIONAL_AVERAGES` (the three ASPS fees and their exclusion wording), `RETIRED_PRICES` | `pricing-copy.constant.ts` `PRICE_VARIABLES`. Procedure `*.data.ts` `priceFrom` and `pricing.startingAt/upTo/options`. The `price-*` and `asps-average-*` figures in `bbl/lipo/tummy-tuck.facts.ts`, which become derived from `PRICE_SHEET`, so the facts file and the table can't drift. The price table hard-coded in `agentic-writer.prompt.ts` (wrong $6,500/$9,500). The price list in `.claude/skills/blog-post/reference/compliance.md`.                                                                                                              |
| `financing.ts` | `FINANCING_PARTNERS`, the partners-string helper, the approved sentences, "no figure" as a constant rule                                                                                                                                                                                        | `FINANCING_PARTNERS` and `getFinancingPartnersString` from `site-config.ts` (re-exported). Deletes `weekly-payments.data.ts` (`WEEKLY_PAYMENT_OPTIONS`, `LOWEST_WEEKLY_PAYMENT`, `WEEKLY_PAYMENT_DISCLAIMER`) and the `weeklyPaymentFrom` field from the `Procedure` type, if D6 is yes.                                                                                                                                                                                                                                                                      |
| `trust.ts`     | Verified trust facts only: ABS since 2008, FACS, the Florida license, one surgeon, `RATING_FALLBACK = '4.7'`, and the rule that rating and count come from synced Google data                                                                                                                   | `siteConfig.trustStats`. It loses `patients`, `years`, `certified` and `accreditation`, and the `?? '5,000+'` and `?? '15+'` fallbacks go in: `app/procedures/[slug]/page.tsx` (its generated meta "Miami's top surgeons. 5,000+ procedures"), `app/gallery/page.tsx`, `app/gallery/[slug]/page.tsx`, `app/blog/page.tsx`, `components/procedures/why-choose-section`, `procedure-consultation-form`, `procedures-page-content`, `app/links/components/links-profile.tsx`, and `llms.txt` and `llms-full.txt` (also their ABPS and "AAASF-accredited" lines). |
| `contact.ts`   | Static phone, email, address, hours, timezone, the `#contactus` → `/contact-us` rule                                                                                                                                                                                                            | The static part of `siteConfig.contact`, which spreads it. `siteUrl` stays in web because it needs env. This gives `packages/ai` (chat prompt) the real phone, email and hours.                                                                                                                                                                                                                                                                                                                                                                               |
| `patterns.ts`  | The section 11 rules as `{ id, rule, pattern, severity, catches, falsePositives, pairedCheck? }`, plus `NEUTRALIZERS`                                                                                                                                                                           | `SWEEP` and `NEUTRAL` in `blog/tools/lib/bloglib.py` (Python reads the JSON). `BANNED` in `__tests__/components/landing-pages/lp-v6-copy.test.ts`. The `practice-claim` rule in `apps/web/scripts/check-procedure-copy.ts`. The rule comments in `drk-copy.ts` and `lp-copy.ts`. The "Never" lists in both `compliance.md` references (they point here).                                                                                                                                                                                                      |
| `prompt.ts`    | `buildClaimsPromptBlock(audience)` for `'chat' \| 'blog-writer' \| 'blog-reviewer' \| 'image' \| 'gallery'`, which renders sections 1–10 as prompt text from the data above                                                                                                                     | The ad-hoc rules in every `packages/ai` prompt. The admin MCP `get_writing_guide` appends it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**Facts files.** `apps/web/lib/data/procedures/facts/*.facts.ts` stay where they are in this issue.

- They are page-specific, and `check-procedure-copy.ts` and the blog tools already read them.
- Their price facts import from `@workspace/shared/claims/prices`.
- A later issue may move them into `claims/facts/`, so the AI writer and reviewers can be handed the sourced recovery figures directly.

**DB-held copy** (not code, so it is fixed by data and kept in step at runtime):

- **Chat.** `chat_config.system_prompt` and `welcome_message` are rewritten to the canon on the `--db clone` first, then run by the user on production.
- The server also **appends `buildClaimsPromptBlock('chat')`** to whatever prompt the DB holds. An admin edit then can't reintroduce Dr. Lofman, "board-certified surgeons", "virtual assistant", `alluringmiami.com`, "0% APR", "high approval rates" or "luxury".
- **Other rows:** `author.bio`, live `promotion` rows, and blog posts (via the admin MCP `update_post` or `blog/tools` SQL, with refresh candidates dismissed).

**Enforcement:**

- A `claims:check` script runs `patterns` over:
    - the prerendered HTML (`.next`, like `size:check`);
    - `llms.txt` and `llms-full.txt`;
    - the JSON-LD;
    - the exported DB posts.
- Severity `fail` breaks CI for the code sweep.
- The blog `check_post.py` and the AI pipeline's `validateGeneratedMdx` or reviewer agents use the same rules.

---

## 13. Open decisions for the user

Each item gives the question, the default until it's answered, and a recommendation. Sections 2–10 apply the defaults.

- **D1. Dr. Rita Shats.** Is she still with the practice, performing cosmetic gynecology?
    - Default: flag her mentions; don't delete; no new mentions.
    - Recommendation: if she has left, remove her from `surgeons-data.ts`, her page (redirect it to `/about` or the procedures hub), the chat prompt, `seo.keywords` "cosmetic gynecology" and the gynecology procedures. If she stays, verify her "Board Certified Cosmetic Gynecologist" title. FACOG is ACOG membership, not a board; ABOG is the board. Also verify "leading authority" and "Associate Director of Gynecology at Richmond University Medical Center" at the issuing bodies before republishing, and replace "the only surgeon" wording with "the only plastic and cosmetic surgeon".
- **D2. Facelift price.** The site says $11,500; the sheet only has "Face & Neck Lift $15,000".
    - Default and recommendation: remove $11,500 everywhere, and publish only "A face and neck lift is $15,000" until the practice prices a facelift alone.
- **D3. Mommy makeover total.**
    - Default and recommendation: no total. Price it part by part from the sheet minus the combination discount, as the page already does. Ask the practice whether a starting total exists.
- **D4. What a price includes.** The BBL page lists consultations, the surgeon's fee, anesthesia, the facility, the garment and pillow, and every follow-up, "confirmed" per #247. Other pages leave `includes` empty. LP v5 and `WEEKLY_PAYMENT_DISCLAIMER` say "all-inclusive".
    - Recommendation: get the practice to confirm one inclusion list in writing for all procedures. Until then, keep the BBL list on the BBL page only, and remove "all-inclusive" and "no hidden fees" everywhere.
- **D5. The handwritten "20% off".**
    - Default and recommendation: never publish it or any discounted figure. Treat the sheet as list prices, which is consistent with BBL $5,500. Ask the practice.
- **D6. Weekly-payment figures site-wide** ($22, $27, $34, $41, $69 per week).
    - Recommendation: **yes, drop them all.** That means `weekly-payments.data.ts`, `weeklyPaymentFrom`, the specials and contact pages, and the home page. It matches BBL, avoids Reg Z trigger terms, and the figures aren't on the sheet.
- **D7. "Free consultation" and 456.062.** Options:
    - (a) keep as it is;
    - (b) stop adding it and rewrite it out of posts and meta only;
    - (c) retire it site-wide, keeping the `/free-consultation` and `/consulta-gratis` URLs but changing the copy to "consultation" or "no-obligation consultation";
    - (d) keep it and add counsel's 456.062 statement.
    - Recommendation: **(c)**. Search Console shows 0 clicks in 90 days on "free … consultation" queries, and the LPs already avoid "free". Ask counsel at the same time about the combination discount and any promotion.
- **D8. Breast lift "starting at".** The options are $4,000 (modified lift, the lowest line on the sheet) or $5,000 (full lift without implants, used by the mommy makeover page and the blog compliance guide).
    - Recommendation: $4,000 with the variant named, matching the tummy tuck's mini-first precedent. Update the mommy makeover description to "a breast lift from $4,000".
- **D9. Education and fellowship wording.** The MD from Ross, the residency at Beth Israel and the Abilene fellowship are unverified. So are "Fellow, American Academy of Cosmetic Surgery" and "Fellowship training at the AACS". "Fellowship Director, American Board of Cosmetic Surgery" is wrong (it's an AACS-accredited fellowship).
    - Recommendation: verify education on the Florida DOH practitioner profile, and the AACS items at AACS. Then publish "She directs a cosmetic surgery fellowship accredited by the American Academy of Cosmetic Surgery" only if confirmed. Until then, keep these lines off everything except the existing surgeon page, and drop the ABCS "Fellowship Director" badge.
- **D10. The chat agent's scope.**
    - (a) Prices: may Sofía quote published "starting at" prices with the caveat? The current prompt forbids all pricing. Recommendation: yes, the section 5 starting figures plus the long caveat, and never a range except BBL's.
    - (b) Deposit: the chat says $250 and a past promotion said $350. Recommendation: remove deposit amounts until the practice confirms one.
    - (c) Cherry's soft credit check (LP v5 says it is already published). Recommendation: allow "Cherry's application uses a soft credit check" only if the practice or Cherry's own page confirms it; otherwise drop it.
- **D11. Contact link target in posts.**
    - Recommendation: `/contact-us` for body links, which works in every renderer. The template's own CTAs keep `#post-consult`.
- **D12. AggregateRating structured data.** The home and `/reviews` pages emit it from synced Google figures, while the procedure-page compliance guide says "No Review or AggregateRating structured data".
    - Recommendation: keep it on `/reviews` only, built from synced figures, or drop it everywhere. Self-serving review markup on a LocalBusiness or MedicalBusiness doesn't earn stars, and it repeats a figure that can go stale.
