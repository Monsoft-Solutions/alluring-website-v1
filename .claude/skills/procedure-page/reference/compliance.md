# Compliance and claims

A procedure page is medical advertising in Florida and a YMYL page for Google
and AI engines. Every rule here is enforced somewhere (the copy sweep, the
Florida Board of Medicine, the FTC, or the reader's trust). When in doubt,
say less and cite more.

## The surgeon's credentials

Source of truth: `apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`
(checked at each issuing body on 2026-09-19). Dr. Victoria Karlinsky is the
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
  the American Board of Plastic Surgery / ABPS, or "board-certified" alone.
- Link each credential to the issuing body's record (`karlinskyRecords`).
- Structured data: `karlinskyPersonNode` only (ABS, FACS, Florida license).
  No ABCS credential node and no `medicalSpecialty`.
- The site still says otherwise in places (`llms.txt` intro, the home
  Physician node, `surgeons-data.ts`, `/fly-in-consultation`). #248 tracks
  them. Don't copy wording from those places, and link the new page's
  readers to them knowingly.

## Owner claims

Some statements only the practice can confirm. Until the owner confirms one
in writing, the page doesn't make it, and the sweep's `practice-claim` rule
fails it:

- AAAASF (or any) facility accreditation
- A board-certified anesthesiologist on every case
- 24/7 surgeon access
- VASER or any named device
- "Ultrasound guidance on every case" as the practice's own claim (the BBL
  page says the law requires it, which is sourced)
- "5,000+ procedures" or any volume claim

Per procedure, also ask: age policy, candidacy limits (BMI, health),
insurance handling (breast reduction, blepharoplasty), which variants are
offered, what the price includes, staged vs combined surgery, the medical
reviewer and review date, a real photo of the surgeon with a patient, and a
quote in her own words. Ask once, in one message; build around the gaps.

## Prices

- "Starting at $X" and "most patients pay $X–$Y", from `procedure.pricing`
  (it also feeds the `Offer` range in the graph). The range is typical, not
  a cap.
- Every price is set for the patient after an exam; ranges are estimates and
  may change; the surgeon confirms the price at consultation. Say this where
  the price appears.
- **Financing is offered; quote no financing number** (no "$34/week").
- National comparators only from the source's own page, with its exclusions,
  and no year unless the source gives one.
- Never publish a price the practice doesn't charge. Retired BBL prices
  ($3,500, $34/week) live on old Instagram posts; keep those posts off the
  site entirely.

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

- No "best", "safest", "leading", "world-class", "top-rated", "number one",
  guarantees, "painless" or "scarless".
- No travel coordination (flights, hotels, recovery houses, transport,
  concierge, packages) and no market outside the United States. What the
  practice does provide: a virtual consultation, confirmed dates in writing,
  and how many nights to stay in Miami before flying home.
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
- No Review or AggregateRating structured data.
- Asking patients for reviews is fine; incentivizing them isn't.

## Data safety

- Production database: read-only checks are fine once the user has said so
  (`POSTGRES_URL_PROD`, print the host first). Writes go through the admin,
  or SQL proven on a `--db clone` worktree that the user runs.
- Never `db:seed` or `db:push` against a database with real content.
- Business facts (phone, address, hours) come from `siteConfig`, never
  hard-coded.
