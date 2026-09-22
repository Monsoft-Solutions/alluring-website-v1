# Page blueprint

The section order and each section's job. It follows the order of her
questions ([audience psychology](audience-psychology.md)), and puts a call to
action wherever intent peaks. Adapt the middle to the procedure; keep the
spine: **hero → real results → quick form → facts and price → the signature
scene (safety) → surgeon → options, steps, recovery → reviews → FAQ → book →
sources.**

## The BBL page, as built (the reference)

| #   | Section                                                   | Anchor                                            | Job                                                                  | Call to action                                     |
| --- | --------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | Hero                                                      | —                                                 | Answer "what is it and who does it" on the first screen              | Book · Call · virtual consultation link            |
| 2   | Jump nav                                                  | —                                                 | Let skimmers go straight to cost, safety, surgeon                    | —                                                  |
| 3   | Results                                                   | `#results`                                        | Real patients, right after the promise                               | Link to the gallery group                          |
| 4   | Quick quote                                               | `#quick-quote`                                    | Two fields at peak intent                                            | "Get my free consultation"                         |
| 5   | At a glance + cost (white band, fact rail)                | `#what-is-a-bbl`, `#pricing`                      | Definition, fact table, the price, inclusions, a sourced comparator  | "Get your exact price", financing, offers          |
| 6   | Safety (the dark scene)                                   | `#safety`                                         | The law as a diagram, the evidence, the checklist to ask any surgeon | "Ask Dr. Karlinsky every one of them": Book · Call |
| 7   | Surgeon, options, steps, recovery (white band, fact rail) | `#surgeon`, `#options`, `#procedure`, `#recovery` | Who operates; which variant fits; how it's done; life after          | "Book with Dr. Karlinsky"; virtual consultation    |
| 8   | Reviews                                                   | `#reviews`                                        | What patients of this procedure say                                  | Read every review                                  |
| 9   | FAQ                                                       | `#faq`                                            | 10–14 distinct questions, answer first                               | —                                                  |
| 10  | Book                                                      | `#book`                                           | Full form, what happens next, where and when                         | The form                                           |
| 11  | Sources                                                   | `#sources`                                        | Every source behind the figures, and the update date                 | —                                                  |
| —   | Sticky bar (mobile)                                       | —                                                 | Book · Call at any depth, hidden over the hero and the form          | —                                                  |

Measured at 390 px after #266: first real result at 1,494 px, first form
field at 3,203 px, page 25,677 px. Before, results sat at 5,102 px and the
only form at about 20,800 px. Aim for the same shape: **real results within
two screens, a form field within four.**

## First screen

On a 390 × 844 phone, above the fold:

- Breadcrumb, then the **H1** (the procedure title, unchanged) as the mobile
  LCP. It never animates.
- **Lede** that answers what it is, then names the one surgeon, with MD. It
  carries `procedure-intro` for the `speakable` selector.
- **Trust row**: her portrait (a real photo), name and "Your surgeon",
  linked to `#surgeon`; the Google rating and review count (from the synced
  profile, `data-copy-check="data"`).
- **Chips**: starting price, "Financing available", "Hablamos español"
  (`lang="es"`).
- **Buttons**: "Book a free consultation" (gold) and Call ("Call us" below
  `sm`, the number itself from `sm` up, because `tel:` does nothing on most
  desktops).
- Microline: "Live in another state? Start with a virtual consultation" →
  `/fly-in-consultation`.

Desktop adds the 4:5 editorial photograph with the "Model shown. Not a
patient." caption and one glass rating card over it.

## Results

- Straight after the hero, never below the fold of the second screen.
- Real, consented patients only: the gallery group for the procedure
  (`getGalleryMediaByProcedure`) and its before/after pairs
  (`getBeforeAfterPairsByProcedure`). Select images whose title or alt text
  names the procedure (`mentionsProcedure`), before/after first, and
  de-duplicate Instagram carousel covers (`-primary` = `-carousel-0`).
- A slider for the lead pair, then a scroll-snap rail that bleeds to the
  screen edge; each photo links to its gallery page. The rail's buttons are
  the only client island, from `lg`.
- Caption each photo honestly ("Before and after a tummy tuck"). Months
  after surgery and what was combined belong in the caption once the gallery
  records them.
- If there are no results, render nothing and drop the jump link. Never fill
  the space with AI images.
- Say it once: "Photos in this section are real patients. Images elsewhere on
  the page that show a model are labeled as such."

## Forms

- **Quick quote** after results: `ConsultationForm` in `compact` mode (first
  name, phone, consent), `showProcedureBadge={false}`,
  `defaultProcedure={getProcedureFormValue(slug)}`, its own
  `analyticsFormName` (`procedure_<slug>_results_form`), `redirectOnSuccess`
  `/thank-you`. One sentence on what happens next, and "Complimentary and
  confidential. Hablamos español."
- **Book** at the end: the full form with `showPreferredContactTime={false}`,
  three steps of what happens after submitting, then "Where you'll be seen":
  address and hours from `siteConfig` (never hard-coded), a Maps directions
  link, and the virtual consultation link. In the DOM the location comes
  after the form so phones reach the fields first.
- Both go to `/api/contact` like every other form. Wrap them in
  `data-copy-check="data"`.

## Fact rail and bands

From `lg`, the white bands run a sticky fact rail beside the reading column:
starting price, typical range, both buttons, the surgeon, "Last updated".
Each rail is a landmark with its own `aria-label`. Phones get the sticky bar
instead.

## Surgeon

A real portrait, her name with MD, and each credential exactly as held,
linked to the issuing body's record, with the Florida statement beside the
cosmetic-surgery board ([compliance](compliance.md)). Then the buttons:
"Book with Dr. Karlinsky" and "Meet Dr. Karlinsky" (`/dr-karlinsky`). A quote
only in her own words, once she has written or approved it.

## Cost

`PriceRange` from `procedure.pricing` (the same numbers feed the `Offer` in
the graph). Then:

- What the price includes, as a list.
- What moves the price.
- Why some offers cost less (what they leave out), without naming anyone.
- A sourced national comparator when one exists (BBL used ASPS's average
  surgeon's fee, which excludes anesthesia and facility; its page gives no
  year, so the copy gives none).
- Links: "See financing options" (`/plastic-surgery-financing-miami`),
  "Current offers" (`/miami-plastic-surgery-specials`).
- "Get your exact price" → `#book`.
- The `#pricing` anchor stays: posts and other pages link to it.

## Safety (the signature scene)

One dark stone-900 band per page, and only one. It holds the procedure's
signature visual: for BBL, the layers of the buttock with the fascia "never
crossed" and the cannula "watched on ultrasound". It includes:

- The standard as numbered points (law where there is law, technique where
  there isn't).
- Evidence with inline attribution and a link to the source.
- "Questions to ask any surgeon" as a checklist.
- A bridge: "Ask Dr. Karlinsky every one of them", then Book and Call.

## Recovery

A timeline of milestones from the facts file (days, weeks, months), each
sourced, rendered as a list whose rule draws as it scrolls. Link the posts
that own the details (sleeping, sitting, garments, massages) instead of
repeating them. Add "You don't have to fly in to get started" with the
virtual consultation link.

## Reviews

- Read every published review, not a short pool: the ones naming the
  procedure can sit far down the featured-first order (BBL's were at
  positions 58–69 of 75).
- Procedure reviews first; heading claims "What do [procedure] patients say"
  only when every review shown names it, otherwise "What Alluring patients
  say on Google".
- Show Google's translation for reviews written in another language, marked
  "Translated by Google".
- No Review or AggregateRating JSON-LD.

## FAQ

10–14 distinct questions, answer first, `<details>` disclosure. Include the
price question (the paid landing page drops it on purpose) and the questions
her queries ask that the page body doesn't. No pricing terms ("cost", "how
much", "$", "financing", "afford"…) in the answer of a question that isn't
about price. The FAQPage node must equal the visible FAQ.

## Sources

A numbered list of every source behind the figures, each with its own
anchor (`#source-<id>`), and the real last-updated date. The answer
paragraph says what the sources cover.

## Mobile sticky bar

`StickyCtaBar` (Book · Call), animated by scroll timeline: hidden while the
hero's buttons are visible, in once the hero leaves, out again over the
booking form. Give the page bottom padding on mobile, keep it clear of the
chat launcher (right padding), and hide the root layout's floating call
button on this page.
