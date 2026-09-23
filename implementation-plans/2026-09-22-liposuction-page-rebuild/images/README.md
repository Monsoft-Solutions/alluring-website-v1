# Liposuction page imagery

Generated with Higgsfield `gpt_image_2_5` on 2026-09-22 under the rules in the
`procedure-images` skill: editorial, not glamour; no body-part framing; never
the surgeon; every image of a person labeled "Model shown. Not a patient."; no
text or numbers in pixels.

One shot, the hero, following the BBL page's one-AI-photograph precedent. The
promise it carries is "your clothes fit the way you want", shown through
tailored clothing on a whole, at-ease person: no hands on the waist, stomach,
hips or thighs, no loose-jeans gesture, no measuring tape. She is a different
woman from the BBL hero (late 30s, olive skin, loose shoulder-length waves,
ivory linen trousers and a taupe knit, walking a limestone hallway; BBL is early
30s, warm light-brown skin, low bun, sand midi dress at an arched window).

The previous image is the repo file `/images/procedures/liposuction.jpg`.
`liposuction-miami.data.ts` (`image`, `contentImages`) now points at the wide
render below; `components/quiz/lib/quiz-pricing.data.ts` still reads the old
file. Keep it until every reader (home signature card, landing hero, sitemap,
quiz) is deployed with the new image, then retire it.

## On Blob

| Shot                 | Path                                                                          | Size                   | Source job                                                                                      |
| -------------------- | ----------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| 1 · hero, 4:5 master | `procedures/liposuction/2026-09/hero-alluring-plastic-surgery-miami.jpg`      | 1440×1800, 455 KB, q80 | `27839d6e-9527-4cc0-a5a9-c3f4bf2bc0a3` (2k/high, sunburst, referenced on candidate `87b0e18a…`) |
| 1 · hero, 16:9 wide  | `procedures/liposuction/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg` | 2000×1116, 389 KB, q80 | `329012aa-3e4d-4b55-8a60-67b38254fcd4` (outpaint of the master to 2752×1536)                    |

Base URL: `https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/`. Exported
with `sips` (the repo has no sharp), sRGB. Exact bytes: master 465,758, wide
397,925. Both fit under 500 KB at quality 80, so neither needed a lower
setting. The 2k final rendered at 1792×2240; the master is 1440 px wide, as for
BBL.

The outpaint added a brass lantern and ceiling above, a garden view through the
windows on the left, and a near wall pier with a brass sconce on the right. No
people and no text in the new areas. Known minor artifact: the middle of the
three gold cuff buttons on the blazer is slightly misshapen (visible only when
zoomed).

Later shots that reuse the hero model: pass job
`27839d6e-9527-4cc0-a5a9-c3f4bf2bc0a3` as the `image_references` media.

## Picks

- **Shot 1:** four candidates at 1k/medium, two prompts × both variants.
    - `3bc92add` (flare, curtains): borderline, a hand grips the blazer at the
      trouser waistband and pulls the eye to the waist.
    - `120dc213` (sunburst, curtains): two rule breaks, faux lettering on the
      coffee-table book spines and both hands at the waistband.
    - `e06ce5f9` (flare, hallway): borderline, the blazer hand rests its knuckles
      against her hip.
    - `87b0e18a` (sunburst, hallway): no rule breaks, the blazer hand stays at
      her side and off the body, free hand relaxed, no text. **Chosen by the
      user.** Its weakness was the most polished face of the set.

    None of the four rendered "deep olive" skin; all read medium to light olive.

The final (`27839d6e`) matched the candidate without drift on the first run:
same hand placement, no text, correct anatomy. No re-run.

## Prompts

Four-part format: scene · subject · key details · constraints.

### Shot 1 · hero (4:5), Prompt B (hallway, the chosen one)

```
SCENE: Late morning in a sunlit limestone hallway of a bright Miami home, tall windows with sheer linen curtains running along one side. Soft daylight and faint palm-frond shadows fall across warm white plaster walls and a pale limestone floor. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A self-assured woman in her late 30s with deep olive skin and shoulder-length dark wavy hair, wearing high-waisted wide-leg ivory linen trousers with a fitted short-sleeved knit top in soft taupe tucked in, and thin gold earrings. She walks unhurriedly along the hallway in a three-quarter front view, a camel blazer folded over one forearm and the other arm relaxed at her side, glancing toward the windows with a relaxed, private smile.
KEY DETAILS: Framed from the knees up, the whole figure clearly readable, generous space above her head. Natural mid-stride posture, not posed like a model. Editorial documentary photography, 50mm lens, natural color, real skin texture, gentle depth of field, fine film grain.
CONSTRAINTS: Modest, elegant everyday clothing; no swimwear, lingerie, bodycon, cleavage or bare midriff. No hands on the waist, stomach, hips or thighs; no pinching skin, no measuring tape, no loose or oversized jeans gesture, no before-and-after framing. Not photographed from behind; no emphasis on the waist, abdomen, hips or thighs. No text, letters, numbers, logos or watermarks. Not glamour, not a fashion ad; calm and trustworthy.
```

The final prepends "Recreate the reference photograph as faithfully as possible
at higher resolution: the same woman, face, hair, clothing, pose, hallway, light
and framing. The hand holding the folded camel blazer stays at her side, not
resting on her body; her other arm hangs relaxed." and passes candidate
`87b0e18a-7fc7-4656-9c41-689c721a5151` as `image_references`.

### Prompt A (linen curtains, candidates `3bc92add` and `120dc213`)

```
SCENE: Late morning inside a bright Miami apartment with tall windows and sheer linen curtains. Soft daylight and faint palm-frond shadows fall across warm white plaster walls and a pale limestone floor. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A self-assured woman in her late 30s with deep olive skin and shoulder-length dark wavy hair, wearing high-waisted wide-leg ivory linen trousers with a fitted short-sleeved knit top in soft taupe tucked in, and thin gold earrings. She stands in a three-quarter front view near the window, one hand lightly adjusting the cuff of a camel blazer draped over her forearm, glancing toward the light with a relaxed, private smile.
KEY DETAILS: Framed from the knees up, the whole figure clearly readable, generous space above her head. Natural posture, not posed like a model. Editorial documentary photography, 50mm lens, natural color, real skin texture, gentle depth of field, fine film grain.
CONSTRAINTS: Modest, elegant everyday clothing; no swimwear, lingerie, bodycon, cleavage or bare midriff. No hands on the waist, stomach, hips or thighs; no pinching skin, no measuring tape, no loose or oversized jeans gesture, no before-and-after framing. Not photographed from behind; no emphasis on the waist, abdomen, hips or thighs. No text, letters, numbers, logos or watermarks. Not glamour, not a fashion ad; calm and trustworthy.
```

Credits: 6.75 (656 → 649.25): four 1k/medium candidates at 0.5 each, one
2k/high final at 2.75, and one 2752×1536 outpaint at 2. The skill's "1 credit
per 1k candidate" figure is out of date; 1k/medium is 0.5.
