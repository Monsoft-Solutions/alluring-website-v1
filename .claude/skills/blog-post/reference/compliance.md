# Compliance and claims (blog)

A blog post is medical advertising in Florida and YMYL content for Google
and AI engines. AI engines repeat whatever the site says verbatim, so a
wrong claim in one post becomes "Alluring says…" everywhere.

**The claims canon governs:** `docs/claims/canon.md` (issue #354; its
"Decisions of 2026-10-25" block overrides the rest of it). This file is the
blog subset plus what the blog gets wrong most often; where the two differ,
the canon wins. The canon's rule behind everything: a claim that isn't
verified there is removed, never replaced with another unverified claim.
The same rules as data and code live in `@workspace/shared/claims`
(`packages/shared/src/claims/README.md`), which the lint and the site read.
The procedure-page version is
`.claude/skills/procedure-page/reference/compliance.md`.

## The surgeon's credentials

Source of truth: `@workspace/shared/claims/surgeon`
(`packages/shared/src/claims/surgeon.ts`; each credential checked at the
issuing body on 2026-09-19, canon §2). Dr. Victoria Karlinsky is the
practice's only surgeon.

- First mention "Victoria Karlinsky, MD, FACS" (`[[surgeon:name]]`) or
  "Dr. Victoria Karlinsky, MD, FACS", then "Dr. Karlinsky"
  (`[[surgeon:short]]`). Rule 64B8-11.001(7) names the licensee as an MD.
- If credentials are stated, use the canon's sentence verbatim
  (`[[surgeon:credentials]]`): "She is board certified in general surgery by
  the American Board of Surgery and is a Fellow of the American College of
  Surgeons." With the year (`[[surgeon:credentials-year]]`): "…since 2008…".
  Never compute a tenure ("18 years").
- **Never** in a post: the American Board of Cosmetic Surgery (its Florida
  statement has nowhere to go in a post), "board-certified plastic
  surgeon", "double/triple board-certified", ABPS, "board-certified" alone,
  "our surgeons" / "board-certified surgeons" (plural), "plastic surgeon"
  for her (say "surgeon" or "cosmetic surgeon"; "the American Society of
  Plastic Surgeons" is a name and fine, and "plastic surgery" as the
  practice or service term is fine too).
- No other surgeon. Dr. Andrew Lofman is never named. Dr. Rita Shats is an
  open question (canon D1): a post never adds a mention of her.
- Her education and fellowship lines (Ross, Beth Israel, Abilene, anything
  about the American Academy of Cosmetic Surgery) are unverified (D9) and
  stay out of posts.
- No surgeon's name in the title or meta title (a staffing change would
  break it). The meta description may name her.

## Owner claims the blog must not make

Until the owner confirms one in writing, no post states it:

- AAAASF or any facility accreditation; "accredited"; where surgery
  happens (office, surgical center, hospital); "state-of-the-art"
- an anesthesiologist of any kind ("an anesthesia provider monitors you
  throughout surgery" is the generic line that may stand)
- 24/7 surgeon access, "on-call surgeon"
- "ultrasound guidance on every case" as the practice's own claim (the
  Florida law requiring it, from the facts file, is fine)
- named devices (VASER, SmartLipo, BodyTite, power-assisted): never. The
  only exception is J-Plasma, named as the price-sheet add-on
- drains or a drainless technique
- "5,000+ procedures", "thousands of patients", "15+ years" or any volume
  or tenure claim; a typed review count (the rating is 4.7 on Google; the
  template shows the synced count)
- "all-inclusive", "no hidden fees", "everything included", a deposit amount
- massage counts, garment weeks, foam/board use, revision policy as _the
  practice's protocol_ (present the evidence and "as your surgeon directs")

## Prices

- **No Alluring price is typed.** Every practice price is a claim token,
  which the site fills in from the live price list (admin → Pricing) when
  the post renders, so a price change or a discount reaches the post with no
  edit (#354; grammar in `packages/shared/src/claims/README.md`). A typed
  figure that equals a price-sheet line fails the lint and the admin save.
  Name the line, so an admin's change of starting line can't change what the
  sentence claims:
    - BBL: "A BBL at Alluring starts at `[[price:bbl]]`, and
      `[[price-range:bbl]]`." The range is typical, never "up to".
    - Lipo 360 `[[price:lipo:lipo360]]`; one area added to another
      procedure `[[price-span:lipo:add-ons]]`, "depending on the area".
    - Tummy tuck: mini `[[price:tummy-tuck:mini]]`, full
      `[[price:tummy-tuck:full]]`, extended `[[price:tummy-tuck:extended]]`.
    - Breast augmentation: saline `[[price:breast-augmentation:saline]]`,
      silicone `[[price:breast-augmentation:silicone]]`.
    - Breast lift: from `[[price:breast-lift:modified]]` for a modified lift
      (skin below the areola only; the canon default, D8); no implants
      `[[price:breast-lift:no-implants]]`.
    - Breast reduction: from `[[price:breast-reduction:small-medium]]`
      (small to medium).
    - Eyelid surgery: `[[price:blepharoplasty:upper]]` for upper or lower
      eyelids, `[[price:blepharoplasty:both]]` for both.
    - Face: only "A face and neck lift is
      `[[price:facelift:face-neck-lift]]`". There is no facelift-alone price,
      and `[[price:facelift]]` is invalid (D2).
    - Mommy makeover: no total. The parts, then `[[combo-discount]]`.
- Put `[[price-caveat]]` or `[[price-caveat:long]]` (or your own "your
  surgeon confirms it at consultation") in the same paragraph, list or
  table as any price token.
- A discount set in the admin shows by itself: the token prints the list
  price struck through and the reduced one, and the template adds the Fla.
  Stat. 456.062 statement. Never type a discounted figure or a "% off".
- **Quote no financing number**: no weekly or monthly payment, APR, "0%",
  term or "as low as". `[[financing]]` ("Financing is available through
  Cherry, CareCredit and United Credit for qualified applicants.") or
  `[[financing:long]]`, with a link to `/plastic-surgery-financing-miami`,
  is the whole statement. No approval claims ("fast", "instant", "no credit
  check").
- Never a retired price (canon §5 lists them; the lint knows them). A
  typed figure is wrong even when it is a current one.
- Third-party prices only when the facts file carries them (the ASPS
  surgeon-fee average, with its exclusions, no year). These are typed, since
  they are not Alluring's.

## Figures and sources

- Every %, $, time, count, volume or BMI figure carries a named, linked
  source you read this session, or comes from the procedure's facts file
  with its attribution (canon §7: facts files win; anything that
  contradicts one is rewritten to the fact or deleted).
- Never a "1 in N" BBL mortality as current risk, a contracture rate without
  a read source, a 2024 or 2025 ASPS fee, or a longevity figure ("implants
  last 10–20 years") the facts files don't carry. Canon §7 lists the rest.
- No figures inside images unless they match the text word for word and
  the image footer names the source.
- Never cite competitor clinics, RealSelf, Healthline or clinic blogs.

## Wording

- No superlatives about the practice, the surgeon, results or outcomes:
  "best", "safest", "leading", "world-class", "top-rated", "number one",
  "premier", "renowned", "cutting-edge", "state-of-the-art",
  "revolutionary", guarantees, "painless", "scarless", "permanent results",
  "luxury", "affordable". Generic advice wording ("the best way to sleep
  after a BBL", "best candidates") is fine (canon §10).
- No "free" added anywhere. "Free consultation" stays only where it already
  stands (D7); new and rewritten copy says "consultation". Never "free" (or
  "complimentary") tied to a medical service.
- No travel coordination: no flights, hotels, recovery houses, transport,
  airport pickup, "concierge", "packages", "international", "medical
  tourism", Latin America or the Caribbean. The practice serves South
  Florida and patients from other US states; it confirms dates in writing
  and says how many nights to stay in Miami before flying home (BBL: "plan
  on 7 to 10 days in Miami"; other procedures give no number). Sofía, the
  chat agent, is "our concierge", never a "virtual assistant", and never in
  a travel sense.
- Contact links go to `/contact-us`, never `#contactus` (dead). No phone
  number and no promised response time in the body.
- Don't diagnose. Candidacy questions close with "your surgeon decides at
  consultation".
- No body-negative or shame language, no fake urgency, no countdowns.
- Spanish content is for Spanish speakers in the US, written natively, not
  translated word for word; it follows every rule here.

## Photos

- AI renders are editorial only, never a result, never the surgeon or
  staff, never before/after framing. No swimwear, lingerie, nudity,
  incisions or drains. Illustrations of the body are clothed or stylised.
- Real patient photos only from the gallery with consent; a post never
  embeds an Instagram promotion that quotes a price.

## What the sweep flags

`python3 blog/tools/check_post.py` (and `build_sql.py`, which runs it
again) fails a post on: any phrase in the
**Never** lists above (the canon §11 patterns); a retired price; a typed
Alluring price in any field (it names the token to write); a claim token that
would render as nothing (unknown name, line or procedure, malformed); a dollar
figure that is neither in the cluster's facts file nor in a quote verified,
word for word, against `docs/pricing/practice-price-list.md` (a quote from
any other source licenses no price); a practice price (typed or a price
token) in a paragraph, list or table that doesn't say the surgeon confirms
it at consultation (for a table, the paragraph right before or after may
say it); a figure in an image that the
post's text never states; a banned source (RealSelf, Healthline, lipo.com,
lipo360.com) in the body, the Sources list or `meta.json` `sources[]`; a
phone number in the body; "medically reviewed"; a link to a folded URL; a
`<QuickAnswer>` block in the body; an H1 in the body; a title over 60
characters or a meta description over 155. The caveat check reads the body
and the quick answer; the token and typed-price checks read every field.
The title, meta description and excerpt are still yours to read by eye.
