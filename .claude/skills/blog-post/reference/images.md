# Blog post images

Every post gets a hero (featured image) and 0–2 inline images, rendered
with GPT Image 2.5 on Higgsfield the way the 17 liposuction posts were
(2026-09-23, 34 images). The rules come from the procedure-images skill
(`.claude/skills/procedure-images/SKILL.md`); the mechanics are the
`blog/tools/images/` kit.

## Rules (repeated in every prompt's constraints block)

- **Editorial, not glamour.** Calm, well lit, documentary. Modest everyday
  clothing or loungewear. No swimwear, lingerie, bodycon, cleavage, bare
  midriff, nudity.
- **No body-part framing.** Never from behind for a body procedure, no crops
  on breasts, buttocks, abdomen or eyes as objects. The person is whole and
  at ease.
- **Never the surgeon, never staff.** A clinician may appear only as hands
  and a sleeve.
- **Never a result.** No before/after framing, incisions, drains, skin
  markings or post-op garments shown on a body (a garment folded on a
  chair is fine).
- **No text in pixels** on photographs. Infographics are the one exception:
  their text is passed verbatim via `text_in_image` and proofread after
  rendering, word for word against the post.
- **The audience, varied.** Women 25–55 (older for facelift and eyelids),
  varied skin tones and body types across the cluster, real skin texture.
  Not the same woman in every post.
- **Miami daylight.** Stone, sand, warm white, brushed gold; palm shadow,
  limestone, arched windows, linen. No neon, nightlife or beach glamour.
- **A hero per post**, 3:2, subject in the upper two thirds (the template
  lays a dark gradient and the title over the bottom third).
- **Inline images only where they teach** something prose can't: a
  timeline, a "normal vs call your surgeon" card, a stylised clothed
  anatomy illustration, a flat lay of recovery items. 4:5 or 3:2.
- Every image of a person is labeled "Model shown. Not a patient." by the
  template's caption (`AI_MODEL_LABEL`); the alt text describes the
  picture, never keywords, and for infographics contains every figure the
  image states.

## Prompts

Four parts: **SCENE · SUBJECT · KEY DETAILS · CONSTRAINTS**. A hero for a
recovery post:

```
SCENE: Mid-morning in a bright Miami bedroom, white plaster walls, a tall window with sheer linen curtains, soft palm shadows on a pale limestone floor. Palette of stone, sand, warm white and brushed gold.
SUBJECT: A woman in her late 30s with deep brown skin and short natural hair, resting propped on pillows in loose sand-colored linen loungewear, a glass of water and a paperback on the nightstand. Three-quarter view, eyes closed, calm.
KEY DETAILS: Framed from the waist up with generous space above her head; editorial documentary photography, 50mm, natural color, real skin texture, gentle depth of field, fine film grain.
CONSTRAINTS: Modest loungewear fully covering the torso; no swimwear, lingerie, cleavage or bare midriff; no garments, bandages, drains or incisions; not photographed from behind; no text, letters, numbers, logos or watermarks; not glamour, not a fashion ad.
```

Infographics: a short SCENE describing a clean card on warm stone, then
`text_in_image` with the exact lines (title, 4–6 rows, a one-line source
footer). Keep to figures the post states; the proofread rejects any
deviation.

## Reusing a live image (rewrites)

A rewrite doesn't have to re-render. Keep the live hero, or a live
infographic, when it still meets every rule above and, for an infographic,
every word and figure in it still matches the new text word for word. Set
that image's `reuse_url` in `meta.json` to its live Blob URL (from the
post's `images` row) and keep its `alt` and `prompt`. `generate.py` and
`export_upload.mjs` skip it (no credits, no upload, no pick);
`build_sql.py` requires the URL to be an `images` row in the database it
builds for, keeps that row's size and generation prompt, and asserts the
row exists when the SQL runs. Render a new image whenever the old one breaks
a rule (glamour, a body-part crop, text on a photo, a figure the post no
longer states).

## Workflow

1. **Balance.** `mcp__claude_ai_Higgsfields__balance`. About 3 credits per
   2k/high render; a hero gets two candidates (variants `flare` and
   `sunburst`), an inline image one. Say the estimate before rendering.
2. **Render.** `python3 blog/tools/images/generate.py <slug>… --dry-run`
   lists the renders and the credits; without `--dry-run` it reads each
   `blog/posts/<slug>/meta.json` `images[]`, renders with the `higgsfield`
   CLI (`gpt_image_2_5`, 2k, high) and saves
   `blog/images/work/<slug>/<key>-<variant>.{json,png}` (gitignored;
   `--work DIR` elsewhere). Re-runs skip existing renders; `--redo slug:key`
   forces one; `--heroes-only` skips inline images.
3. **The user picks** the hero variant from a contact sheet (the main
   session shows the candidates; a subagent can't ask). Reject any render
   that breaks a rule even when it looks good. Picks go in
   `blog/images/picks.json` as `{ "<slug>": { "<key>": "flare" | "sunburst" } }`.
4. **Proofread infographics** against the post text, word for word.
5. **Export and upload.** `node blog/tools/images/export_upload.mjs <slug>… [--db D] [--id <slug>=<uuid>]`
   (`--dry-run` exports locally and uploads nothing):
   heroes 1920 px wide, inline 1600 px on the long edge, JPEG ≤ 500 KB
   (`sips`), uploaded with `@vercel/blob` (token `BLOB_READ_WRITE_TOKEN` in
   `apps/web/.env.local`, the app's own store) to
   `blog-images/<post id>/<slug>-<key>-<render job id, 8 chars>.jpg`. The
   post id comes from `--id`, else `meta.json` `id`, else the database row
   (a rewrite; pass `--id` with the production id when the local copy
   lacks the post), else, for a NEW post, a fresh uuid written into
   `meta.json` `id`, which `build_sql.py` then INSERTs. No draft row is
   ever needed. The script merges `blog/images/manifest.json` (path, url,
   size, dimensions, job id, prompt; other posts' entries are kept).
   A pick whose upload is already in the manifest (same post, key and
   variant) but whose render isn't in `images/work/` (renders are
   gitignored, so another machine's never are) is reported as "already in
   the manifest (job <id>), nothing to export" and keeps its entry.
   `build_sql.py` reads it to
   create the `images` rows (alt NOT NULL, `generated_by`
   `higgsfield/gpt_image_2_5`, `generation_prompt`) and the
   `blog_post_images` rows (`prompt` NOT NULL), and to set
   `featured_image_id`.
6. **Keep old images** on Blob until the new rows are live; the previous
   featured image stays referenced by `blog_post_images` history, so
   nothing is deleted. Uploads a re-pick superseded are listed and kept;
   `--delete-superseded --db <production, with the user's OK>` deletes them,
   and only those no `images` row uses. It refuses a local database (a
   clone, the dev copy): only production knows which files the live site
   still shows.

Uploads are public. Upload only approved picks.
