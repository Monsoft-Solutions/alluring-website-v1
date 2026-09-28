# Tummy tuck page imagery

Generated with Higgsfield `gpt_image_2_5` on 2026-09-28 under the rules in the
`procedure-images` skill: editorial, not glamour; no body-part framing; never
the surgeon; every image of a person labeled "Model shown. Not a patient."; no
text or numbers in pixels.

One shot, the hero, following the BBL and liposuction pages. It carries "a
waistband that sits flat" only through well-fitting clothes on a whole,
relaxed person: a black high-neck top tucked into a pleated skirt, no hands
near the stomach, waist or hips. She is a different woman from the other two
heroes. BBL is early 30s, warm light-brown skin, low bun, sand midi dress at an
arched window. Liposuction is late 30s, olive skin, loose shoulder-length
waves, ivory linen trousers and a taupe knit in a limestone hallway. This one
is an Afro-Latina woman in her mid-to-late 30s with long loose curls, walking
through a Coral Gables-style arcade.

## Why the old hero goes

The old image is `images/procedures/tummy-tuck/hero.webp` on Blob
(`https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/images/procedures/tummy-tuck/hero.webp`,
1536×1024). It shows a woman in a cropped bandeau top with a bare midriff, one
hand resting on her waistband, posed on a terrace at sunset. That breaks three
of the skill's rules: bare midriff, a hand at the waist, and glamour styling.
`apps/web/lib/data/procedures/tummy-tuck-miami.data.ts` (`HERO_WIDE`, used by
`image` and the `contentImages` hero entry) now points at the 16:9 file below,
and the page module's hero at the 4:5 master. Keep the old file on Blob until
every reader of the data file's `image` and `contentImages` (the page's
og:image, the home cards, the paid landing page hero, the sitemap) is deployed
with the new image. Retire it after that, never before.

The quiz (`components/quiz/lib/quiz-pricing.data.ts`) reads a separate repo
file, `/images/procedures/tummy-tuck.jpg`. This work does not touch it.

## On Blob

| Shot                 | Path                                                                         | Size                                   | Source job                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1 · hero, 4:5 master | `procedures/tummy-tuck/2026-09/hero-alluring-plastic-surgery-miami.jpg`      | 1440×1800, 492,881 bytes (481 KB), q78 | crop of outpaint `fdcbf1ff-20f2-4e7e-8eaf-cbe4b1a7c664`, from final `35f4dd56-130c-409e-ae4f-5c8ddc9ae782`               |
| 1 · hero, 16:9 wide  | `procedures/tummy-tuck/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg` | 2000×1116, 495,599 bytes (484 KB), q78 | outpaint `0c560a38-30b2-4a08-ab20-959d47a6e635` of the master (uploaded as media `15995418-e1ac-4e7e-9692-c66c4a30a477`) |

URLs returned by the uploads, both checked with curl (200, `image/jpeg`, byte
counts match):

- `https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/tummy-tuck/2026-09/hero-alluring-plastic-surgery-miami.jpg`
- `https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/tummy-tuck/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg`

Exported with `sips` (the repo has no sharp), sRGB IEC61966-2.1 embedded.
Quality 80 came out at 504,114 and 505,247 bytes, just over 500,000, so both
files are quality 78.

## How the two files were made

1. **Final.** `35f4dd56` at 2k/high, sunburst, with candidate `9963a0e8` as
   the reference. It rendered at 1792×2240 and matched the candidate with no
   drift: same face, curls, hoops, bag, hand on the strap, trailing hand, and
   arches. No re-run.
2. **Headroom.** Every candidate had 3–7% space above the head, and the page
   hero sits under the site header. `outpaint_image` on the final to 2:3
   (`fdcbf1ff`, 1792×2688 requested, 1696×2528 returned) did not just add a
   strip at the top. It zoomed out on all four sides and redrew the whole
   frame. She became full length at about two-thirds of her former size. The
   pillars shifted and her face was redrawn, but she is recognizably the same
   woman in the same clothes and pose. The original pixels could not be
   pasted back over it, because the background no longer lines up.
3. **Master.** A 4:5 crop of that render: x 220–1564, y 380–2060 (1344×1680
   native), resampled to 1440×1800 (a 7% upscale). The top of her hair sits at
   11.0% of the frame height. She is framed from mid-calf up, just below the
   skirt hem. A lower crop would cut through her ankles, and a tighter one
   would lose more resolution. The new area above her (arch tops, palms, sky)
   has no people and no text, and the arches run on without a break.
4. **Wide.** The master crop was uploaded to Higgsfield (media `15995418`) and
   outpainted to 16:9 at 2752×1536 (`0c560a38`). The outpaint added:
    - on the left, more of the arcade, a wide arch opening onto a garden, and
      a dark wood ceiling;
    - on the right, palms, a bed of red and orange crotons, a hedge, a path
      and the edge of another pillar.

    The top of her hair is at about 10% of the frame. No text.

5. **Retouch (wide only).** A small out-of-focus pink-and-purple shape between
   the palm trunks on the right (about 40×50 px at 2752 wide, near x 2540,
   y 700) could read as a distant person. It was painted out with a blurred
   fill of the surrounding pixels before export. At 2000 px wide the patch
   cannot be seen.

Later shots that reuse this model: pass the final `35f4dd56-130c-409e-ae4f-5c8ddc9ae782`
as the `image_references` media. For the framing of the published master, the
master crop is Higgsfield media `15995418-e1ac-4e7e-9692-c66c4a30a477`.

## Known artifacts

- The trailing hand's fingers are slightly soft: the ring and little finger
  curl together. This is the same in the candidate, the final and both
  exports.
- Her skin renders light-to-medium brown, lighter than the "medium-brown" in
  the prompt. This was already the case in the candidate the user picked.
- Each outpaint redraws the whole frame. The face in the master and the wide
  is the outpaint's redraw, very close to the candidate but not
  pixel-identical to it.
- A pale palm trunk stands directly behind her left arm and reads a little
  like a column. It is present in the candidate too.

## Candidates and picks

### Round one: rejected by the user

A woman around 40 with deep brown skin at home. Two prompts, each on both
variants, at 1k/medium, 4:5.

- `a1131b0e-f887-4719-b6cb-9b5838a12c21` (flare, kitchen island): clean hand
  placement, but a polished catalog face, skin lighter than asked, and the
  liposuction hero's outfit with the colors swapped.
- `80304c80-32da-4b96-8aaf-f3640b29b078` (sunburst, kitchen island): good skin
  texture, but the same outfit as the liposuction hero, the trousers fit
  closely over the hips, and 3% headroom.
- `a40b29f9-46a9-4231-85e8-f9566319762f` (flare, living room with shutters):
  documentary mood, espresso top over cream trousers. Her forearms are close
  to her waist.
- `df915f2f-4882-4c76-8919-160cb62bf7c4` (sunburst, living room with shutters):
  a fuller everyday build that fits the audience, with the same forearm note
  as `a40b29f9`.

The user rejected all four and asked for beautiful Latina women aged about
36–44.

### Round two: Latina women, one prompt each

Prompts 1 and 3 ran on sunburst, 2 and 4 on flare, at 1k/medium, 4:5. Each
prompt asked for "a tenth of the frame" above her head; the model gave 3–7%.

- `e680d8ef-8d8d-48c9-8c68-fde0878a1246` (sunburst, courtyard with
  bougainvillea, terracotta knit dress): the ribbed dress clings and shows the
  outline of the stomach, and headroom is 3%.
- `5e9f1310-ab4b-4c85-995b-a1b0021fc02c` (flare, bedroom window, sage shirt
  dress, fastening an earring): the cleanest hands, but too close to the
  liposuction hero's type of woman, and the belt bow sits at her waist.
- `9963a0e8-7591-4c0d-a283-71fd1844896e` (sunburst, Coral Gables arcade, black
  high-neck top and champagne pleated skirt): no rule breaks. **Picked by the
  user.** Its weaknesses were 4% headroom and skin lighter than asked.
- `4a3e03f8-e38b-47da-bcb7-026b2f2fab7b` (flare, café terrace, navy wrap
  dress): rule break, her forearm lies across her waist to reach the table,
  and it has the most ad-like polish.

## Prompts

Four-part format: scene · subject · key details · constraints.

### Shot 1 · hero (4:5), candidate `9963a0e8` (the chosen one)

```
SCENE: Late morning under a shaded Coral Gables arcade: a row of cream coral-stone arched columns, a terracotta tile walkway, bright arcs of sunlight falling between the columns, palm fronds beyond. The arcade is quiet and empty, with no shopfronts, no signs and no other people. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A strikingly beautiful Afro-Latina woman in her mid-to-late 30s with medium-brown skin and long, loose, defined dark curls, soft natural makeup, gold hoop earrings. She wears a black high-neck sleeveless fine-knit top tucked into a flowing champagne pleated midi skirt in a soft matte fabric. She walks unhurriedly along the arcade in a three-quarter front view, one hand resting on the strap of a small plain woven shoulder bag up at her shoulder, the other arm swinging loosely a little away from her body, glancing ahead with a quiet, confident smile.
KEY DETAILS: Framed from the knees up, the whole figure clearly readable, with clear empty space above the top of her head of about one tenth of the frame height. Polished and confident yet natural, mid-stride, not posed like a model. Editorial documentary photography, 50mm lens, natural color, real skin texture with visible pores, gentle depth of field, fine film grain.
CONSTRAINTS: Modest, elegant everyday clothing; no swimwear, lingerie, bodycon or clinging fabric, no cleavage or plunging neckline, no cropped top or bare midriff. No hands on or near the stomach, waist, waistband or hips; no gesture that draws the eye to the abdomen; no measuring tape, no loose-clothing gesture, no before-and-after framing. Not photographed from behind; no crop on the abdomen; the whole person is the subject. No text, letters, numbers, logos or watermarks anywhere, including signage, shop windows, the bag and packaging. No children, partners, staff or other people in frame. Not glamour, not a fashion ad; documentary, calm and trustworthy.
```

The final used the same prompt without the headroom sentence, with this
prepended, and passed candidate `9963a0e8` as `image_references`:

```
Recreate the reference photograph as faithfully as possible at higher resolution: the same woman, face, hair, clothing, pose, arcade, light and framing. Her right hand rests on the strap of the woven shoulder bag up at her shoulder; her other arm swings loosely a little away from her body, fingers relaxed and natural. The bag hangs at her side; no hand near her waist.
```

The two outpaints take no prompt.

## Credits

10.75 in all (89.75 → 79):

- round one: four 1k/medium candidates at 0.5 each, 2;
- round two: four more, 2;
- the 2k/high final, 2.75;
- the 2:3 headroom outpaint, 2;
- the 2752×1536 wide outpaint, 2.

## Notes for the next page

- `gpt_image_2_5` ignored "a tenth of the frame above her head" in all eight
  candidates. Plan for an outpaint instead of asking in the prompt.
- `outpaint_image` zooms out and redraws rather than adding only the missing
  edge. A headroom outpaint makes the figure smaller, so crop back and budget
  for the lost resolution (1344 px native here, against 1440 wanted).
