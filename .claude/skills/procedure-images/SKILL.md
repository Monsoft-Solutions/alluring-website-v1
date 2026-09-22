---
name: procedure-images
description: Plan and regenerate the editorial images for a procedure page with GPT Image 2.5 on Higgsfield, under the rules the BBL page set in #254 — shot list, prompts, candidates, the user's picks, finals, export, Vercel Blob upload and wiring into the page module. Use when rebuilding a procedure page (the procedure-page skill calls it), when the user says "regenerate the images for the tummy tuck page", or "/procedure-images <slug>".
argument-hint: <procedure-slug>
---

# Procedure images

Editorial images for one procedure page, made the way the BBL page's were
(#254, recorded in `implementation-plans/2026-09-16-bbl-page-rebuild/images/README.md`).
The images set a mood and teach; they never prove anything. Proof is the
real before/after photos in the gallery, which this skill doesn't touch.

`$0` is the procedure slug.

## Rules

Non-negotiable, and repeated in every prompt's constraints block:

- **Editorial, not glamour.** Calm, well lit, documentary. Modest everyday
  clothing. No swimwear, lingerie, bodycon, cleavage, bare midriff, nudity.
- **No body-part framing.** Never photographed from behind for a body
  procedure, no crops on the breasts, buttocks, abdomen or eyes as objects.
  The person is whole and at ease.
- **Never the surgeon, never staff.** Anyone who could be read as a real
  person at the practice is photographed for real, not generated. A clinician
  may appear only as hands and a sleeve.
- **Never a result.** No before/after framing, no incisions, drains, markings
  on skin or post-op garments on a body.
- **No text in pixels.** No letters, numbers, logos or watermarks, including
  on screens. Figures and diagrams are HTML/SVG on the page.
- **Label every image of a person** with "Model shown. Not a patient."
  (`AI_MODEL_LABEL`) in its caption, and keep AI images visually apart from
  the results section.
- **The audience, varied.** Women 25–55 (older for facelift and eyelids),
  varied skin tones and body types across the set, real skin texture.
- **Miami daylight.** Stone, sand, warm white and brushed gold; palm shadow,
  limestone, arched windows, linen. No neon, no nightlife, no beach glamour.

## Shot list

Fewer, better images. The BBL page ended with **one** AI photograph (the
hero) on the page, because a render that carries no information costs scroll
and trust. Start from these and cut anything the page doesn't need:

| Shot                            | Aspect · use                                                          | Brief                                                                                                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 · Hero**                    | 4:5 master (hero) + 16:9 outpaint (og:image, home card, landing hero) | The woman the page is for, at ease in a bright Miami interior, three-quarter view, knees up, clothing that suggests the outcome without showing a body part (e.g. a tailored dress for body procedures, a relaxed open neckline for facial ones) |
| 2 · Recovery at home (optional) | 3:2 · recovery section                                                | Same model (reference the hero), resting in linen loungewear in a bright living room, showing a real recovery instruction (side sleeping, a pillow, walking)                                                                                     |
| 3 · Still life (optional)       | 4:5 or 3:2 · safety or recovery                                       | Objects only, no body: the instruments or the recovery essentials for this procedure on warm stone, no text                                                                                                                                      |
| 4 · Back to life (optional)     | 4:5 · timeline end                                                    | Same model weeks later, walking a shaded Coral Gables street in everyday clothes, seen from the side                                                                                                                                             |

A consultation scene (a patient with only the clinician's hands visible) was
made for BBL and then removed: a real photo of Dr. Karlinsky with a patient
replaces it when the practice provides one.

Diagrams (tissue layers, scar placement, treatment areas, timelines) are
never images; they are built in the page.

## Prompts

Four parts, in this order: **SCENE · SUBJECT · KEY DETAILS · CONSTRAINTS**.
The BBL hero, as a model:

```
SCENE: Early morning inside a bright Miami home with a tall white plaster arched window. Soft low sun throws crisp palm-frond shadows across warm stone-colored walls and a pale limestone floor. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A confident woman in her early 30s with warm light-brown skin and dark hair in a low loose bun, wearing a tailored sand-colored midi dress with a softly defined waist and cap sleeves, knee-to-ankle length. She stands at the window in a three-quarter front view, one hand resting on the window frame, looking out with a calm, private half smile.
KEY DETAILS: Framed from the knees up, with the whole figure clearly readable and generous space above her head. Natural posture, not posed like a model. Editorial documentary photography, 50mm lens, natural color, real skin texture, gentle depth of field, fine film grain.
CONSTRAINTS: Modest, elegant everyday clothing; no swimwear, lingerie, tight bodycon, cleavage or bare midriff. Not photographed from behind; no emphasis on the buttocks or hips. No text, letters, numbers, logos or watermarks. Not glamour, not a fashion ad; calm and trustworthy.
```

Change the subject (age, skin tone, clothing) per page so the site's heroes
don't all show the same woman, and write the constraints for this procedure's
body area.

## Workflow

1. **Balance.** `mcp__claude_ai_Higgsfields__balance`. BBL's two shots cost 17
   credits: 1 per 1k candidate, 3 per 2k final, 2 per outpaint. Say the
   estimate before generating.
2. **Model check.** `models_explore` for `gpt_image_2_5`: variants `flare`
   (default) and `sunburst`, quality `low`…`max`, resolution `1k`/`2k`/`4k`,
   aspect ratios including 4:5, 3:2, 16:9, and reference images.
3. **Candidates.** 3–4 per shot at `1k` / `medium`, trying both variants on
   the hero (`generate_image_batch` for different prompts, `count` for
   variants of one; `jobs_wait`, then one `show_generation_by_ids`). The
   provider's safety filter rejects some prompts (a hands-only close-up was
   rejected for BBL). Rephrase, don't push.
4. **The user picks.** Show the candidates and ask with AskUserQuestion.
   Picks are the user's; a subagent can't ask. Reject anything that breaks a
   rule, even when it looks good (BBL lost a candidate to a glamour
   neckline).
5. **Finals.** `2k` / `high` (or `xhigh`), passing the picked candidate's job
   id in `medias` as the reference, and prepending "Recreate the reference
   photograph as faithfully as possible at higher resolution: the same woman,
   face, hair, clothing, pose…". Shots 2–4 pass the hero final as the
   reference, so the model stays the same person.
6. **Wide crop.** `outpaint_image` on the hero final to 16:9 at 2752 × 1536
   (a 1376 × 768 render was too small).
7. **Export.** Download, then JPEG ≤ 500 KB with `sips` (the repo has no
   sharp): hero master about 1440 px wide (at 2000 px the grain doesn't fit
   500 KB), others about 2000 px on the long edge; quality 72–80. Work in the
   session scratchpad.
8. **Upload** with `mcp__vercel-blob__vercel-blob-put-file`,
   `addRandomSuffix: false`, to
   `procedures/<procedure-name>/<yyyy-mm>/<descriptor>-alluring-plastic-surgery-miami.jpg`
   (the BBL set is under `procedures/brazilian-butt-lift/2026-09/`). Uploads
   are public; upload only the approved finals.
9. **Record** in `implementation-plans/<date>-<procedure>-page-rebuild/images/README.md`:
   each shot's Blob path, size, quality, source job id, the candidates and
   which was picked and why, the prompts, and the credits spent.
10. **Wire in.**
    - `components/procedures/pages/<short>/<short>-page.constant.ts`: each
      image as `{ src, width, height, alt }` with the file's real dimensions.
      Alt describes the picture ("Woman in a sand linen midi dress…"), never
      keywords. `AI_MODEL_LABEL` as the caption.
    - The data file: `image` = the 16:9 wide render (og:image, home card,
      sitemap), and the `contentImages` hero entry the paid landing page
      reads.
    - Hero `<Image priority sizes=…>`; everything else lazy.
11. **Keep the old files** on Blob until every reader of the old image
    (home card, landing hero, sitemap, social shares) is deployed with the
    new one. Retire them after, never before.

## Delegation

The `procedure-image-creator` agent can run steps 2–3 (candidate batches) or
6–9 (finals, export, upload, record) from an approved shot list and picks.
The picks themselves stay in the main session with the user.
