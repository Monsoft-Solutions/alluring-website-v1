# AI citation panel — 2026-09-18

The #249 panel, widened from two engines to four at the owner's request:
ChatGPT, Google AI Mode, Gemini and Claude. One run per prompt, monthly.

**Result: Alluring was cited on the brand query and on nothing else.** Across
20 non-brand runs there is not one citation, one link, or one mention.

| Engine               |      Runs | Cited | Where                   |
| -------------------- | --------: | ----: | ----------------------- |
| ChatGPT (signed out) |       8/8 |     1 | brand query only        |
| Google AI Mode       |       8/8 |     1 | brand query only        |
| Gemini (signed in)   |       5/8 |     1 | brand query only        |
| Claude (signed in)   |       2/8 |     0 | brand query not reached |
| **Total**            | **23/32** | **3** | **brand only**          |

Gemini and Claude are short: their composer stopped accepting input part-way
through the session. The three missing Gemini prompts (5, 6, 7) and six missing
Claude prompts (2, 4, 5, 6, 7, 8) are marked below and should be run before the
next monthly cut.

## Per prompt

`—` = not cited. Competitors listed are the ones each engine named.

|   # | Prompt                                       | ChatGPT   | AI Mode   | Gemini    | Claude  |
| --: | -------------------------------------------- | --------- | --------- | --------- | ------- |
|   1 | How much does a BBL cost in Miami?           | —         | —         | —         | —       |
|   2 | Is a BBL safe in Florida?                    | —         | —         | —         | not run |
|   3 | Who performs BBLs in Miami? Best BBL surgeon | —         | —         | —         | —       |
|   4 | Skinny BBL Miami price                       | —         | —         | —         | not run |
|   5 | How long is BBL recovery?                    | —         | —         | not run   | not run |
|   6 | What is included in the price of a BBL?      | —         | —         | not run   | not run |
|   7 | Where to get a safe BBL in Miami             | —         | —         | not run   | not run |
|   8 | Alluring Plastic Surgery BBL                 | **cited** | **cited** | **cited** | not run |

## Who gets cited instead

Named on the surgeon and safety prompts, across engines: **Pure Plastic
Surgery** (Dr. S. Alexander Earle), **4 Beauty / Dr. Constantino Mendieta**,
**Miami Aesthetic / Dr. Pat Pazmiño**, **Zuri / Dr. Alexander Zuriarrain**,
**Elite / Dr. Moises Salama**, **Dr. Miami / Dr. Michael Salzhauer**,
Dr. Benjamin Liliav, Dr. Wendell Perry, Dr. Enrique Hanabergh, Dr. Ary Krau,
Dr. Bart Kachniarz.

Named on the price prompts: **Spectrum Aesthetics** ($3,900), **Avana**
($3,500–$5,500), **Mia Aesthetics** ($3,750), **Smart Plastic Surgery**
($3,499 skinny / $5,500 premium), **Svelta** ($3,700–$9,500), Boutinic
($3,500).

Non-practice sources doing the heavy lifting: ASPS, RealSelf, Cleveland Clinic,
Florida Board of Medicine, the Florida Society of Plastic Surgeons, the American
Board of Cosmetic Surgery, GoodRx, CareCredit.

Google Maps ratings shown alongside the answers: Pure 4.9, 4 Beauty 4.9, Zuri
4.9, Elite 4.9, Dr. Miami 4.9, Spectrum 4.6, Svelta 4.5, Avana 4.4, Mia 4.3,
Miami Aesthetic 4.3 — **Alluring 4.7 (87 reviews) in AI Mode, 3.7 in ChatGPT.**
Review volume is the gap, not the score: the leaders carry 700 to 3,500 reviews.

## Three findings worth acting on

### 1. Three engines quote the wrong BBL price, and #250 is the cause

Google AI Mode: _"Starting Price: **$3,500** or $5,500."_
Gemini: _"**Starts at $3,500** (ranges up to $15,000)."_
ChatGPT: _"advertises financing from $45/week, while another financing page
lists **$34/week**."_

None of those figures is the BBL's. They are the **tummy tuck's**
(`priceFrom: '$5,500'`, `weeklyPaymentFrom: '$34/week'`) and the mini tummy
tuck's `$3,500`, which reach the BBL page through the related-procedure cards —
the client components that were being handed whole `Procedure` objects,
markdown and FAQs included (#250 item 5).

Verified on the live page, 2026-09-18: 6 occurrences of `$3,500`, one of
`$34/week`, one of `$27/week`, three of `mini abdominoplasty`, ten of `Tummy
Tuck Miami`. In a local build with #250 applied: **0, 0, 0, 0** and five (the
card's own title and link).

So the card-payload fix is not only a page-weight fix. It is the reason three
AI engines currently publish a BBL price the practice does not charge.

### 2. The board-certification question is worth more than the epic assumed

Three of the four engines tell patients to verify **ABPS specifically**:

- Google AI Mode: _"confirm they are certified by the American Board of Plastic
  Surgery (ABPS), which is the only plastic surgery board recognized by the
  American Board of Medical Specialties."_
- Claude: _"Confirm certification from the American Board of Plastic Surgery
  specifically. Other 'boards' exist, but their requirements vary widely."_
- ChatGPT: _"Are you certified by the American Board of Plastic Surgery
  (ABPS)?"_ — first in its list of questions to ask.

One does not: AI Mode's safety answer accepts _"ABPS **or** the American Board
of Cosmetic Surgery (ABCS)"_, citing the ABCS itself.

This is #247 question 1 and #248. Whatever the practice answers, the page has to
state it plainly, because the assistants are actively coaching patients to ask.

### 3. "What is included" is unowned

ChatGPT answered prompt 6 entirely from ASPS. AI Mode answered it from clinic
pages — Mia, Shine, Le Contour, Frank Agullo — plus GoodRx and CareCredit. No
Miami practice owns it, every engine treats it as important, and Alluring's
`pricing.includes` array already holds a real itemized answer. It is the
cheapest citation on the board.

## Also observed

- AI Mode credits Alluring with a _"dedicated Fly-In Program with virtual
  consultations."_ The BBL page carries no such copy; it is either inferred or
  read from elsewhere on the site. CLAUDE.md forbids travel-coordination
  claims — worth tracing before it hardens into the model's answer.
- Every engine's recovery timeline matches the sourced standard the site already
  uses (6–8 weeks, no direct sitting 2–3 weeks, desk work 1–2 weeks, results
  3–6 months, 60–80% fat survival). The recovery copy is not the problem.
- ChatGPT and Gemini answer the recovery and cost prompts with **no sources at
  all** when they do not search. Citations are only winnable on the prompts that
  trigger a search — which, in this panel, were the local and surgeon ones.
- Google's Business Profile still does not list Brazilian butt lift as a
  service. Every price and surgeon prompt in AI Mode returned a map pack.

## Method

One run per prompt per engine, 2026-09-18, from Miami-adjacent IP. ChatGPT
signed out (no personalization); Gemini and Claude signed in to the
monsoftsolutions.com account; AI Mode via `google.com/search?udm=50`. "Cited"
means the answer names Alluring Plastic Surgery or links an
alluringplasticsurgery.com URL.
