# Compliance and claims

A procedure page is medical advertising in Florida and a YMYL page for Google
and AI engines. Every rule here is enforced somewhere (the copy sweep, the
Florida Board of Medicine, the FTC, or the reader's trust). When in doubt,
say less and cite more.

**The claims canon governs:** `docs/claims/canon.md` (issue #354; its
"Decisions of 2026-10-25" block overrides the rest of it). This file is the
procedure-page subset; where the two differ, the canon wins. A claim that
isn't verified there is removed, never replaced with another unverified
claim. The canon as code is `@workspace/shared/claims`
(`packages/shared/src/claims/README.md`): read sentences, prices and
financing copy from it instead of typing them.

## The surgeon's credentials

Source of truth: `@workspace/shared/claims/surgeon` (canon §2;
`apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts` re-exports
it; each credential checked at the issuing body on 2026-09-19). Dr. Victoria Karlinsky is the
practice's only surgeon (the owner, 2026-09-19).

- Her name always with MD: `KARLINSKY_NAME` ("Victoria Karlinsky, MD, FACS"),
  then `KARLINSKY_SHORT_NAME` ("Dr. Karlinsky"). Rule 64B8-11.001(7).
- **American Board of Surgery** (general surgery, since 2008) and **Fellow of
  the American College of Surgeons**: state freely, name the board
  (Rule 64B8-11.001(2)(j)). `KARLINSKY_CREDENTIALS` is the sentence.
- **American Board of Cosmetic Surgery** and **American Board of Facial
  Cosmetic Surgery** are not boards the Florida Board of Medicine approves.
  Any mention carries `FLORIDA_UNAPPROVED_BOARD_STATEMENT` verbatim, in the
  same element and the same type size (Rule 64B8-11.001(2)(f)). The sweep
  fails a mention without it.
- **Never**: "board-certified plastic surgeon", "double board-certified",
  the American Board of Plastic Surgery / ABPS, or "board-certified" alone
  (one that doesn't name the American Board of Surgery in the same
  sentence), and never "board-certified" in a title. Never "plastic
  surgeon" for her ("surgeon" or "cosmetic surgeon"); "plastic surgery" as
  the practice or service term is fine.
- No other surgeon: never Dr. Andrew Lofman. Dr. Rita Shats is open (D1):
  keep her existing mentions, add none.
- Her education and fellowship lines (D9) stay on the surgeon page only.
- Link each credential to the issuing body's record (`karlinskyRecords`).
- Structured data: `karlinskyPersonNode` only (ABS, FACS, Florida license).
  No ABCS credential node and no `medicalSpecialty`.
- Copy credential wording from the shared claims module only, never from
  another page. If you find a page that still says otherwise, report it
  against #354 rather than matching it.

## Owner claims

Some statements only the practice can confirm. Until the owner confirms one
in writing, the page doesn't make it, and the sweep's `practice-claim` rule
fails it:

- AAAASF (or any) facility accreditation; where surgery happens (office,
  surgical center, hospital); "state-of-the-art", "hospital-grade"
- An anesthesiologist of any kind. "An anesthesia provider monitors you
  throughout surgery" is the generic line that may stand.
- 24/7 surgeon access, "on-call surgeon"
- Named devices (VASER, SmartLipo, BodyTite, power-assisted): never. The
  only exception is J-Plasma, named as the price-sheet add-on.
- "Ultrasound guidance on every case" as the practice's own claim (the BBL
  page says the law requires it, which is sourced)
- Drains or a drainless technique
- "5,000+ procedures", "15+ years" or any volume or tenure claim; a typed
  review count (read the synced Google figures; 4.7 is the fallback rating)
- "All-inclusive", "no hidden fees", "everything included" (D4: the BBL
  `pricing.includes` list stays on the BBL page only), a deposit amount

Per procedure, also ask: age policy, candidacy limits (BMI, health),
insurance handling (breast reduction, blepharoplasty), which variants are
offered, what the price includes, staged vs combined surgery, a real photo
of the surgeon with a patient, and a quote in her own words. (There is no
medical reviewer: never write "medically reviewed by".) Ask once, in one message; build around the gaps.

## Prices

- **No Alluring price is typed**, anywhere: not in components, data files,
  FAQs, metadata or JSON-LD (canon, Decisions of 2026-10-25). Prices live in
  the admin Pricing page (fallback: the 2026-09-15 sheet in
  `@workspace/shared/claims/prices`), with an optional discount.
    - A price that is its own UI element: `getProcedurePrices` /
      `getStartingPrice` / `getLinePrice` (`lib/queries/pricing.query.ts`)
      on the server, rendered with `<PriceTag>` or
      `<ProcedurePrice procedure line/>`, plus one `<DiscountStatement>` in
      the block. Client components get the resolved values as props.
    - A price inside data-file prose (description, FAQ, quick answer,
      `seoTitle`, `metaDescription`): a claim token (`[[price:bbl]]`,
      `[[price:tummy-tuck:full]]`, `[[price-range:bbl]]`,
      `[[price-caveat]]`), resolved by `resolveProcedureClaims` /
      `getResolvedProcedures` wherever the page, its metadata, JSON-LD and
      `llms*.txt` print it. Check every place your text is emitted resolves
      it.
    - Plain-text surfaces built in code: `lib/claims/price-text.server.ts`.
- "Starting at" is the procedure's starting line (canon §5, chosen in the
  admin), with the variant named where it isn't the standard version. The
  facelift has no starting price (D2): only "A face and neck lift is
  `[[price:facelift:face-neck-lift]]`". The mommy makeover has no total (D3).
- Only BBL has a "most patients pay" range (`[[price-range:bbl]]`). It is
  typical, never "up to", and the `Offer` carries no `maxPrice`.
- Every price is set for the patient after an exam; estimates may change;
  the surgeon confirms the price at consultation. Say this where the price
  appears (`[[price-caveat]]`, `[[price-caveat:long]]`).
- **Financing is offered; quote no financing number**: no weekly or monthly
  payment, APR, "0%", term, "as low as" or approval claim. Name the
  partners with the shared sentence (`FINANCING_SENTENCE_SHORT`,
  `[[financing]]`): "Financing is available through Cherry, CareCredit and
  United Credit for qualified applicants."
- National comparators only from the facts file (the three ASPS surgeon-fee
  averages), typed, attributed, with their exclusions and no year.
- Never publish a price the practice doesn't charge, a discounted figure or
  a "% off" typed by hand. Retired prices (canon §5) live on old Instagram
  posts; keep those posts off the site entirely.

## Figures and sources

- Every %, $, time, count, volume or BMI figure on the page is declared in
  the procedure's facts file with its source and the attribution the copy
  must use. The sweep fails anything else, including a declared figure in a
  sentence about something else.
- Attribute exactly: a surgeon quoted by ASPS is "a plastic surgeon
  interviewed by ASPS", not "ASPS says". Keep what a source doesn't say in
  the fact's `caveat`.
- Read the source yourself. A figure copied from a blog post or a competitor
  is not sourced.
- No figures inside images. Diagrams are HTML/SVG.

## Wording

- No superlatives about the practice, the surgeon, results or outcomes:
  "best", "safest", "leading", "world-class", "top-rated", "number one",
  "premier", "renowned", "state-of-the-art", guarantees, "painless",
  "scarless", "permanent results", "luxury", "affordable". Generic advice
  wording ("best candidates") is fine (canon §10).
- No "free" added. "Free consultation" stays where it already stands (D7);
  new and rewritten copy says "consultation" or "no-obligation
  consultation". Never "free" or "complimentary" for a medical service.
- No travel coordination (flights, hotels, recovery houses, transport,
  concierge in a travel sense, packages) and no market outside the United
  States. What the practice does provide: a virtual consultation, confirmed
  dates in writing, and how many nights to stay in Miami before flying home
  (BBL: 7 to 10 days; other procedures give no number). Sofía is "our
  concierge", never a "virtual assistant".
- No longevity figure the facts files don't carry ("implants last 10–20
  years", "results last 10–15 years"): "long-lasting" at most (canon §7).
- Don't diagnose. "Your surgeon will tell you at consultation" is the right
  close for candidacy questions.
- No body-negative or shame language, no fake urgency.

## Photos and video

- **Before/after and results**: real patients only, shown with consent, no
  names or identifying details beyond what the patient agreed to. Nothing
  AI-generated, retouched, or borrowed.
- **AI images** (GPT Image 2.5 renders): editorial mood and education only.
  Every image of a person is labeled "Model shown. Not a patient."
  (`AI_MODEL_LABEL`), sits apart from the results section, and never depicts
  the surgeon, staff or a result. No swimwear, lingerie, nudity, incisions,
  drains or before/after framing.
- **Instagram imports** in the gallery: many are promotions with prices and
  countdowns. Publish only real results, and nothing that quotes a price.

## Reviews

- Real Google reviews as synced, unedited. Show Google's translation for
  reviews written in another language, marked "Translated by Google".
- Put the reviews that name the procedure first; the heading claims
  procedure reviews only when every review shown names the procedure.
- Never write, paraphrase, merge or cherry-pick a sentence out of a review.
  Line-clamping for layout is fine.
- No Review or AggregateRating structured data on procedure pages
  (canon D12: `/reviews` only, from synced figures).
- Asking patients for reviews is fine; incentivizing them isn't.

## Data safety

- Production database: read-only checks are fine once the user has said so
  (`POSTGRES_URL_PROD`, print the host first). Writes go through the admin,
  or SQL proven on a `--db clone` worktree that the user runs.
- Never `db:seed` or `db:push` against a database with real content.
- Business facts (phone, address, hours) come from `siteConfig` (which
  spreads `@workspace/shared/claims/contact`), never hard-coded. Contact
  links go to `/contact-us`.
