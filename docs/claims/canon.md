# Claims canon

What the practice can say about itself, and why. AI engines and patients repeat
what the site says, and in Florida this copy is medical advertising.

Each rule below is enforced in one or more of these places:

| Where                                       | What it does                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/shared/src/claims`                | The facts, the forbidden patterns and the prompt blocks                                             |
| AI prompts (`packages/ai`, `packages/chat`) | Every prompt that writes or reviews copy includes the rules                                         |
| Chat routes                                 | Add the rules after the prompt saved in the admin, so a saved prompt can't override them            |
| Blog pipeline                               | Reports forbidden wording on the post's Pipeline tab. It reports only and never blocks a post       |
| `blog/tools/lib/bloglib.py`                 | Fails hand-written posts on the same wording. Change a rule there and in `packages/shared` together |

Live site pages and existing posts are not all clean yet. They get fixed
separately, and existing posts are fixed as each procedure's posts are rewritten.

## The practice

- Alluring Plastic Surgery, a cosmetic surgery practice in Miami, Florida, with
  one surgeon. "Plastic surgery" is fine as the name of the service.
- Tagline: "Personal care. Honest price."
- Market: South Florida locals and patients flying in from other US states. Never
  international patients, Latin America or the Caribbean. Spanish content is for
  Spanish speakers in the US.
- No travel coordination: no flights, lodging, transport, airport pickup or
  recovery houses. The practice confirms dates in writing and says how many
  nights to stay in Miami before flying home.

## The surgeon

Dr. Victoria Karlinsky performs every procedure. Each credential was checked at
the issuing body on 2026-09-19
(`apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts`).

- **Name:** "Victoria Karlinsky, MD, FACS" once, then "Dr. Karlinsky". Florida Rule
  64B8-11.001(7) requires advertising to name the licensee as an MD.
- **Credentials sentence, word for word:** "She is board certified in general
  surgery by the American Board of Surgery and is a Fellow of the American College
  of Surgeons."
- **Never:** "board-certified plastic surgeon", "double board-certified", "triple
  board-certified", "our surgeons", "plastic surgeon" for her. She is not certified
  by the American Board of Plastic Surgery.
- **The American Board of Cosmetic Surgery and the American Board of Facial
  Cosmetic Surgery** aren't approved by the Florida Board of Medicine. Any mention
  needs the statement in Rule 64B8-11.001(2)(f) in the same type size, so AI copy
  and blog posts don't mention them.
- **Dr. Rita Shats:** existing mentions stay until the owner decides; add no new
  ones. **Dr. Andrew Lofman** must not be named.

## Claims nobody has verified

Until the owner confirms one in writing, nothing states it:

- facility accreditation (AAAASF or any other), or a board-certified
  anesthesiologist on every case;
- 24/7 surgeon access, or a named device unless the procedure's facts file has it;
- volume or tenure: "5,000+ procedures", "thousands of patients", "15+ years";
- "medically reviewed".

## Prices

- Prices are typed for now, and every figure must match
  `docs/pricing/practice-price-list.md` (2026-09-15). When that sheet changes,
  update `PRICE_RULES_PROMPT` and the `/blog-post` compliance file in the same commit.
- Wherever a price appears, say it's set after an exam and the surgeon confirms it
  at consultation.
- No facelift-alone price, no mommy makeover total, no "all-inclusive", no "20%
  off" from the handwritten note on the sheet, and no deposit amount from chat.
- A discounted fee needs the Fla. Stat. 456.062 statement, which counsel hasn't
  provided, so no discount goes out.

## Financing

Available through Cherry, CareCredit and United Credit for qualified applicants,
with terms set by the lender. Give no rate, payment, term, limit or approval speed.

## Medical figures

Every %, time, count or BMI figure needs a named, linked source that was actually
read, or must come from the procedure's facts file with its attribution. Never
present a figure as the practice's protocol.

## Regulated words

- No "best", "safest", "leading", "world-class", "top-rated", "number one",
  "cutting-edge", "state-of-the-art", "revolutionary", guarantees, "painless",
  "scarless", "luxury" or "affordable" in copy. Art direction for images may still
  use "luxury" to describe a visual mood; that wording never reaches a reader.
- "Free consultation" stays where it is. New copy doesn't add "free".
- Sofía is "our concierge", never a "virtual assistant", and the word is kept away
  from flights, hotels and travel.

## Images

Words drawn into an image can't be corrected later, so they can't state a claim: no
phone number, price, percentage, week or month timeline, dose, session count,
surgeon name or credential. A figure may appear only if it's in the post text word
for word, with its source named in the image.
