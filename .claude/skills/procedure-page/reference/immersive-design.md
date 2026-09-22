# Immersive design

"Immersive" here means the page reads like one designed story: photography
that opens up, a single change of scene, diagrams that draw themselves as
she reads, and calls to action that are always at hand. It does not mean
heavy video, parallax libraries or text that fades in. Every effect below is
CSS, progressive, and leaves every word in place for crawlers, screenshots,
slow phones and reduced-motion users.

Direction: **sunlit and clinical.** Calm, well lit and precise. It should
feel like a well-run Miami clinic, not a nightclub flyer.

## Tokens

Start from `components/procedures/pages/bbl/bbl-ui.constant.ts`. Promote it to
`components/procedures/module-kit/` the first time a second page needs it
(see SKILL.md, Phase 6).

| Token            | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Container        | `mx-auto w-full max-w-[75rem] px-5 md:px-8` (1,200 px, 20 px phone gutter)         |
| Section rhythm   | `py-12 md:py-20` inside bands; `py-12 md:py-24` for standalone sections            |
| Body             | 17 px phone, 18 px from `md`, `leading-[1.6]`, **stone-700**, max 41.25rem (≈68ch) |
| H2               | `font-serif` 28 px → 38 px, `font-medium`, `text-balance` (from `AnswerBlock`)     |
| H3               | `font-serif` 20 → 22 px                                                            |
| Label            | 15 px stone-500                                                                    |
| Link             | stone-900 text, 1 px gold-500 underline, offset 4                                  |
| Primary button   | **stone-900 on gold-400** (white on gold-500 fails AA), 52 px tall, 4 px radius    |
| Secondary button | stone-900 on white, stone-400 border                                               |
| Grounds          | stone-50 and white bands, **one** stone-900 band                                   |
| Gold             | the one action and one highlight per screen, nothing else                          |
| Numbers          | `tabular-nums` wherever figures line up                                            |

Headings use the serif token (`--font-serif`, fixed in #250). Never Inter,
Roboto or Arial, and no purple gradients.

## Layout

- Phone: one column, the sticky Book · Call bar, full-bleed photo rails.
- Desktop: bands with a reading column (max 45rem) and the sticky fact rail
  (20rem) beside it; the hero in two columns with the 4:5 photograph right.
- Section order and density per [page-blueprint](page-blueprint.md). Aim for a
  page that's long because it answers things, not because of filler.

## Signature scene

Each procedure gets **one** content-shaped visual idea, built in HTML/SVG
(never text baked into an image), inside the page's one dark band. It is what
makes the page memorable and what competitors don't have. It must carry
information, with real text a crawler can read and a reader can translate.

| Procedure           | Scene (starting idea, confirm in the brief)                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| BBL (built)         | Layers of the buttock: skin → fat (the only allowed layer) → fascia "never crossed" → muscle, with the cannula drawn in "watched on ultrasound"  |
| Tummy tuck          | Abdominal wall layers: skin and fat removed, the separated muscles brought back together, and where the scar sits relative to the underwear line |
| Mommy makeover      | One plan, one surgery: the combined procedures as a body map with each area's step, and one recovery timeline                                    |
| Breast augmentation | Implant profile and placement (over or under the muscle) as a cross-section; size shown as projection, not cup letters                           |
| Breast lift         | Scar patterns (around the areola, lollipop, anchor) drawn on a simple outline, and what each lifts                                               |
| Breast reduction    | Relief first: the symptoms it addresses as a checklist, beside the reduction pattern                                                             |
| Liposuction         | A treatment-area body map (front and back) the reader can scan, with what each area involves                                                     |
| Facelift            | The deeper layer (SMAS) repositioned vs skin pulled: why a well-done facelift doesn't look "pulled"                                              |
| Blepharoplasty      | The upper-lid crease where the incision hides, and upper vs lower lid                                                                            |

Draw anatomy abstractly (layers, outlines), never realistic bodies, and
never nudity. Label it "not to scale" when it isn't.

## Motion (CSS only)

Copy the rules and keyframes from `bbl-page.css`, renamed to the page's
prefix:

1. **Text never animates in from hidden.** Only photographs, rules, diagram
   parts and the sticky bar move.
2. **Progressive.** Scroll-driven effects sit behind
   `@supports (animation-timeline: view())`; without support the finished
   state shows.
3. **Reduced motion is the absence of the rule.** Everything sits inside
   `@media (prefers-reduced-motion: no-preference)`.
4. **`both` fill** on every keyframe, so nothing flashes its end state.

The vocabulary, and where each is used:

| Effect                                                        | Use                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Hero unveil + settle (clip-path opens, image scales 1.06 → 1) | The hero photograph on load; the page's one orchestrated moment                 |
| Glass card rise                                               | The rating card over the hero photo                                             |
| Drift (hero image translates as the hero exits)               | Hero only, via `view-timeline: --<prefix>-hero`                                 |
| Scene open (inset rounded card → full width)                  | The dark band arriving; the inset is narrower than its padding so no text clips |
| Draw-x / draw-y (scale from 0)                                | Diagram lines, the recovery rule                                                |
| Dot fill                                                      | Recovery milestones filling as they cross the middle of the screen              |
| Card scale (`view(inline)`)                                   | Results rail photos sliding in                                                  |
| Bar in/out (two named timelines)                              | The mobile sticky bar: in after the hero, out over the form                     |
| Details height (`interpolate-size`, `::details-content`)      | FAQ answers opening                                                             |

`content-visibility: auto` (`<prefix>-defer`) only on sections well below the
fold (reviews, FAQ, sources). Near the top it only shifts the layout.

## Glass

Once: the rating card over the hero photograph
(`bg-white/80 backdrop-blur-xl`, white/70 border). Not on every card.

## Photography and video

- Editorial, not glamour ([procedure-images skill](../../procedure-images/SKILL.md)).
  A 4:5 hero master and a 16:9 wide crop (og:image, home card, landing
  hero), ≤ 500 KB each, `priority` only on the hero, real `sizes`.
- Real before/after photos in their own section, visually separate from any
  AI render.
- Video only when it's real and informative (the surgeon explaining,
  a patient story with consent), below the fold, `preload="none"`, a poster
  image, captions, muted, no autoplay with sound, paused under reduced
  motion. Never as the LCP, never as background decoration.

## Accessibility

- Contrast: body stone-700 on white/stone-50, labels stone-500 minimum,
  buttons stone-900 on gold-400. Check every new pairing (4.5:1, 3:1 at 24 px+).
- Targets ≥ 44 px; the phone buttons are 52 px.
- Every section `aria-labelledby` its heading; each fact rail its own
  `aria-label`; decorative marks `aria-hidden`.
- `lang="es"` on Spanish text.
- Keyboard: the results rail is reachable through its links; nothing needs
  hover.

## Performance

- Server components throughout. Client code: the consultation form, the
  before/after slider, and the rail buttons. Nothing else.
- No motion or carousel library, no framer-motion.
- `size:check` must pass (`apps/web/size-budget.json`); raising a budget needs
  a reason in the PR.
- Mobile LCP ≤ 2.5 s and CLS ≤ 0.1: the H1 is the LCP on phones, every image
  has width and height, and the hero image is ≤ 500 KB.
- The page's HTML weight is mostly copy and the RSC payload. Cut words, not
  markup. Keep other procedures' content out of the payload (pass summaries,
  never whole `Procedure` objects, to client components).
