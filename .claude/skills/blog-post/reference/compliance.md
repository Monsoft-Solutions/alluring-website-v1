# Compliance and claims (blog)

A blog post is medical advertising in Florida and YMYL content for Google
and AI engines. AI engines repeat whatever the site says verbatim, so a
wrong claim in one post becomes "Alluring says…" everywhere. The
procedure-page version of these rules is
`.claude/skills/procedure-page/reference/compliance.md`; this file is the
blog subset plus what the blog gets wrong most often.

## The surgeon's credentials

Source of truth: `apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`
(each credential checked at the issuing body on 2026-09-19). Dr. Victoria
Karlinsky is the practice's only surgeon.

- First mention "Dr. Victoria Karlinsky, MD, FACS", then "Dr. Karlinsky"
  (Rule 64B8-11.001(7) names the licensee as an MD).
- If credentials are stated, use `KARLINSKY_CREDENTIALS` verbatim: "She is
  board certified in general surgery by the American Board of Surgery and
  is a Fellow of the American College of Surgeons."
- **Never** in a post: the American Board of Cosmetic Surgery (its Florida
  statement has nowhere to go in a post), "board-certified plastic
  surgeon", "double/triple board-certified", ABPS, "board-certified" alone,
  "our surgeons" / "board-certified surgeons" (plural), "plastic surgeon"
  for her (say "surgeon"; "the American Society of Plastic Surgeons" is a
  name and fine).
- No surgeon's name in the title or meta title (a staffing change would
  break it). The meta description may name her.

## Owner claims the blog must not make

Until the owner confirms one in writing, no post states it:

- AAAASF or any facility accreditation; "accredited"
- a board-certified anesthesiologist on every case
- 24/7 surgeon access
- VASER or any named device, unless the facts file carries it (J-Plasma is
  on the price sheet as an add-on and may be named)
- "5,000+ procedures", "thousands of patients", "15+ years" or any volume
  or tenure claim
- massage counts, garment weeks, foam/board use, revision policy as _the
  practice's protocol_ (present the evidence and "as your surgeon directs")

## Prices

- Only the practice's current prices, from the facts file or
  `docs/pricing/practice-price-list.md` (2026-09-15): Lipo 360 from $4,000;
  BBL (Lipo 360 + BBL) from $5,500; tummy tuck mini $3,000, regular $4,500,
  extended $5,500; breast augmentation saline $3,500, silicone $4,500;
  breast lift $5,000 (no implants); reduction from $6,000; blepharoplasty
  $3,500 per lid pair; face and neck lift $15,000. Mommy makeover has no
  published total: it is the parts minus the combination discount
  ($500 off two procedures, $1,000 off three).
- Say that the price is set after an exam and the surgeon confirms it at
  consultation, wherever a price appears.
- **Quote no financing number** ("$34/week"). "Financing is offered" and a
  link to `/plastic-surgery-financing-miami` is the whole statement.
- Never a retired price: BBL $3,500 or $4,500, lipo "from $2,500",
  "$3,000–$5,000 per area", tummy tuck "$8,000+", "$6,500" for a lift.
- Third-party prices only when the facts file carries them (the ASPS
  surgeon-fee average, with its exclusions, no year).

## Figures and sources

- Every %, $, time, count, volume or BMI figure carries a named, linked
  source you read this session, or comes from the procedure's facts file
  with its attribution.
- No figures inside images unless they match the text word for word and
  the image footer names the source.
- Never cite competitor clinics, RealSelf, Healthline or clinic blogs.

## Wording

- No "best", "safest", "leading", "world-class", "top-rated", "number one",
  "cutting-edge", "state-of-the-art", "revolutionary", guarantees,
  "painless", "scarless", "luxury", "affordable".
- No travel coordination: no flights, hotels, recovery houses, transport,
  airport pickup, "concierge", "packages", "international", "medical
  tourism", Latin America or the Caribbean. The practice serves South
  Florida and patients from other US states; it confirms dates in writing
  and says how many nights to stay in Miami before flying home.
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
**Never** lists above; a retired price; a dollar figure that is neither in
the cluster's facts file nor in a quote verified, word for word, against
`docs/pricing/practice-price-list.md` (a quote from any other source
licenses no price); a practice price in a paragraph, list or table that
doesn't say the surgeon confirms it at consultation (for a table, the
paragraph right before or after may say it); a figure in an image that the
post's text never states; a banned source (RealSelf, Healthline, lipo.com,
lipo360.com) in the body, the Sources list or `meta.json` `sources[]`; a
phone number in the body; "medically reviewed"; a link to a folded URL; a
`<QuickAnswer>` block in the body; an H1 in the body; a title over 60
characters or a meta description over 155. The price check reads the body
and the quick answer; the title, meta description and excerpt are yours to
check by eye.
