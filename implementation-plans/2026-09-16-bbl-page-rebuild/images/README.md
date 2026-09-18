# BBL page imagery (#254)

Generated with Higgsfield `gpt_image_2_5` on 2026-09-18 under the rules in #254:
editorial, not glamour; never the surgeon; every image of a person labeled
"Model shown. Not a patient."; no text or numbers in pixels.

Shots 1 and 2 are the pre-launch pair. Shot 1 moved onto the pre-launch path on
2026-09-18 because the live hero (`procedures/brazilian-butt-lift/hero.webp`) is
a rear-view swimwear shot the rules exclude. Keep the old Blob files until every
reader of `procedure.image` is deployed (home signature card, landing hero,
sitemap), then retire them.

## On Blob

| Shot                 | Path                                                                                     | Size                   | Source job                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| 1 · hero, 4:5 master | `procedures/brazilian-butt-lift/2026-09/hero-alluring-plastic-surgery-miami.jpg`         | 1440×1800, 480 KB, q72 | `0b814a3b-6faa-4e1a-858c-c47d39e8b00f` (2k/high, sunburst, referenced on candidate `7eb5e021…`) |
| 1 · hero, 16:9 wide  | `procedures/brazilian-butt-lift/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg`    | 2000×1116, 468 KB, q76 | `bd8379bd-a586-40eb-bd4a-32591b88b9ee` (outpaint of the master to 2752×1536)                    |
| 2 · consultation     | `procedures/brazilian-butt-lift/2026-09/consultation-alluring-plastic-surgery-miami.jpg` | 2000×1328, 480 KB, q80 | `2a51f988-9d2a-4ed8-a92e-1d213a35edf1` (2k/high, flare, referenced on candidate `426bb580…`)    |

Base URL: `https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/`. Exported
with `sips` (the repo has no sharp). The hero master is 1440 px wide rather
than 2000: at 2000 px the palm shadows and grain would not fit under 500 KB, and
the page never renders it wider than ~1,400 px at 2×.

Shots 5 and 6 reuse the hero model: pass job `0b814a3b-6faa-4e1a-858c-c47d39e8b00f`
as the `image_references` media.

## Picks

- **Shot 1:** four candidates at 1k/medium, both variants (`9ab4022a`, `7eb5e021`,
  `e230cf5b`, `9a2a0210`). Option 2 (`7eb5e021`, sunburst) chosen.
- **Shot 2:** four candidates at 1k/medium (`426bb580`, `e74865ac`, `a1f8c9be`,
  `83c62df3`). `a1f8c9be` (hands-only close-up) was rejected by the provider's
  safety filter; `83c62df3` was ruled out for a glamour neckline. Candidate A
  (`426bb580`, flare) chosen.

## Prompts

Four-part format: scene · subject · key details · constraints.

### Shot 1 · hero (4:5)

```
SCENE: Early morning inside a bright Miami home with a tall white plaster arched window. Soft low sun throws crisp palm-frond shadows across warm stone-colored walls and a pale limestone floor. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A confident woman in her early 30s with warm light-brown skin and dark hair in a low loose bun, wearing a tailored sand-colored midi dress with a softly defined waist and cap sleeves, knee-to-ankle length. She stands at the window in a three-quarter front view, one hand resting on the window frame, looking out with a calm, private half smile.
KEY DETAILS: Framed from the knees up, with the whole figure clearly readable and generous space above her head. Natural posture, not posed like a model. Editorial documentary photography, 50mm lens, natural color, real skin texture, gentle depth of field, fine film grain.
CONSTRAINTS: Modest, elegant everyday clothing; no swimwear, lingerie, tight bodycon, cleavage or bare midriff. Not photographed from behind; no emphasis on the buttocks or hips. No text, letters, numbers, logos or watermarks. Not glamour, not a fashion ad; calm and trustworthy.
```

The final prepends "Recreate the reference photograph as faithfully as possible
at higher resolution: the same woman, face, hair, sand belted midi dress, pose…"
and passes the chosen candidate as `image_references`.

### Shot 2 · consultation (3:2)

```
SCENE: A bright private consultation room in a Miami cosmetic surgery practice, late morning. Soft daylight through a tall arched window with palm-leaf shadows on warm stone-colored walls. A round white marble table, a small ceramic vase with a single green stem, a glass of water. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A woman in her early 40s with deep brown skin and natural curly hair, wearing a relaxed sand-colored linen blouse, seated at the table, seen over her shoulder in three-quarter view. She is looking attentively at a tablet on the table.
KEY DETAILS: The tablet screen shows only a simple, elegant single-line drawing of a standing female silhouette in soft gray, like a fashion croquis, with no labels. Across the table, only a clinician's hands and the cuff of a crisp white coat sleeve are visible, one hand holding a stylus and gently gesturing toward the drawing. Calm, trusting, professional mood. Editorial documentary photography, 35mm, natural color, real skin texture, shallow depth of field.
CONSTRAINTS: No clinician face or body beyond hands and sleeve. No text, numbers, letters, logos or watermarks anywhere, including on the screen. No swimwear, lingerie, nudity, medical markings on skin, incisions, drains or before/after framing. Not glamour, not a fashion shoot; modest everyday clothing.
```

Credits: 17 (751 → 734): seven charged 1k candidates at 1 (the filtered one was not charged), two 2k finals at 3, and two outpaints at 2, a 1376×768 one superseded by the 2752×1536 render.
