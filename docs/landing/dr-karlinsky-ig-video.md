# Dr. Karlinsky IG landing page: video

The video on `/lp/dr-karlinsky` (issue #332) is a message from Dr. Karlinsky to
people who tapped the link in her Instagram bio. They already follow her, so
she should speak to them as followers, not as strangers.

## What is live now (stopgap cut, v1)

A 45.7 s cut stitched from two existing clips. Both already had English
captions burned in.

| Part | Source                                                                | Source time | Says                                                                                               |
| ---- | --------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| 1    | IG post `DUqc8fgjvNF` (720p)                                          | 0.00–15.86  | "18 years… thank you for your trust. I really appreciate it."                                      |
| 2    | YouTube Short v5 "What will your recovery look like" (4K 9:16 master) | 4.50–24.16  | "I do not want you to worry… 24/7… personal cell phone number… depends on your consultation."      |
| 3    | same v5                                                               | 27.23–33.08 | "We will see your pictures. We will meet you, virtually or in person, and we will determine that." |
| 4    | same v5                                                               | 54.78–59.66 | "If you would like more information, please tap below and we will be here to help you."            |

- The v5 sentence "which please remember is completely free of charge" (24.2–27.2 in the source) is **cut out**: counsel has not cleared "free". A whisper pass on the final file confirms it is gone.
- **Open claims in the stopgap (claims canon, `docs/claims/canon.md`).** Part 2 promises "24/7" access and her "personal cell phone number", which the canon lists as an unverified owner claim (§3, "24/7 surgeon access"). Part 1's "18 years" is a tenure figure the canon doesn't publish (§4: state the year, never a tenure). Spoken words are tolerated in existing clips, but these two are claims, not word choices: recut part 2 (and part 1, if the tenure line goes) for the new recording, or record the owner's written confirmation here before the stopgap keeps running. Never repeat either in page text, captions written as copy, titles or ads.
- Joins: 0.2 s video and audio crossfades (0.12 s at the last join, so "that" and "If" are not faded).
- Known rough edges: the "#2 How do I know what is the right procedure for me?" title card from the original ad stays in (it matches what she says), and the two scenes (diploma wall, then the studio chair) look different.
- Encode: 720×1280, H.264 High CRF 25 (veryslow), AAC 128k 48 kHz, loudness -16 LUFS / -1.5 dBTP, `+faststart`, 6.7 MB.
- Poster: a still from v5 at 54.78 s (seated, soft smile, no burned caption), 720×1280 WebP, 27 KB. There is also a 360×640 copy. Avatar: a 256×256 face crop from v5 at 57.2 s, 7 KB.
- Captions: English and Spanish WebVTT tracks, 17 cues each with the same timings. The Spanish track is a natural translation using "tú", not machine output. Neither track says "free" or "gratis".

All files are on Vercel Blob under `landing/dr-karlinsky-ig/` and are named `-v1`. The URLs live in `apps/web/components/landing-pages/dr-karlinsky-ig/drk-media.ts`.

Working files (scratch only, not in the repo): the cut list, mezzanine and whisper JSON from the session that built v1.

---

## The new recording (replaces the stopgap)

### Shooting notes

- **Phone, vertical 9:16**, 4K or 1080p at 30 fps. Camera at eye level, on a tripod or stand, not handheld.
- **Light:** face a window or a soft light, with no light behind her head. **Quiet room**, no music, no AC hum. Use a clip-on mic if one is available (she already wears one in the existing clips).
- **Wardrobe and set:** white coat in the office. Use the reception logo or a plain wall. **Avoid the diploma wall**, because a readable board certificate in the frame becomes a credential claim we must then qualify.
- **Framing:** head and shoulders, with her head in the **middle 4:5 band** so we can also crop 1:1 and 4:5 for ads.
- **Start talking within the first second**, with a smile and eye contact. End by holding a smile for 2 s after the last word. That gives us the poster frame and a clean end.
- Record **2–3 takes of the opening line** so we can A/B test the opening, then 2 full takes.
- Talk to one person, like a voice note to a friend. Natural pace, about 140 words a minute. Don't read the script word for word. Keep its points and her own phrasing.
- **Do not say:** "free", "complimentary" or "no cost"; any price; "board-certified" or any board name; anything about flights, hotels, transport or recovery houses; "luxury"; "affordable"; "international" or "from all over the world".
- Post (our side): burned-in English captions, English and Spanish WebVTT, -16 LUFS, 720×1280 H.264 with faststart, ≤ 7 MB.

### English (~135 words, about 50 s)

> Hi! It's Dr. Karlinsky. If you found this page through my Instagram, thank you for following along, and for trusting me with your questions.
>
> Maybe you've been watching my videos for a while, thinking, "one day." So let me tell you exactly how that day starts.
>
> You fill out the short form on this page. Sarah from my team will text you to get to know your goals.
>
> Then you and I meet for your consultation, here in Miami or virtually from home. You tell me what bothers you, and I'll tell you honestly what I'd recommend, and what I wouldn't. No pressure, and no cookie-cutter plans.
>
> And if you become my patient, my team and I are with you the whole way, before and after your surgery.
>
> I can't wait to meet you.

### Spanish (~135 words, about 52 s)

> ¡Hola! Soy la Dra. Karlinsky. Si llegaste a esta página desde mi Instagram, gracias por seguirme y por confiarme tus preguntas.
>
> Quizás llevas tiempo viendo mis videos y pensando: "algún día". Así que déjame contarte exactamente cómo empieza ese día.
>
> Llenas el formulario corto de esta página. Sarah, de mi equipo, te va a escribir por mensaje de texto para conocer tus metas.
>
> Después tú y yo nos reunimos para tu consulta, aquí en Miami o de forma virtual desde tu casa. Me cuentas qué te molesta, y yo te digo con honestidad qué te recomendaría, y qué no. Sin presión y sin planes de molde.
>
> Y si te conviertes en mi paciente, mi equipo y yo te acompañamos en todo el proceso, antes y después de tu cirugía.
>
> ¡Me encantará conocerte!

Optional extra line for either language, only if she wants it (it already appears in the stopgap): "You'll have direct access to me and my team." / "Vas a tener acceso directo a mí y a mi equipo."

If Sarah stops being the rep for this source, re-record the third paragraph or say "my team will text you" / "mi equipo te va a escribir".

**Compliance check** (the claims canon, `docs/claims/canon.md`): US only. No travel help. No prices. No "free" or "gratis". No credential claims. No tenure ("18 years") or volume figures. No "24/7" or personal-phone promise. No "luxury" or "affordable".

---

## How to swap the video

1. **Encode** the new take as 720×1280 H.264 High (CRF about 23–25), AAC 128k, loudness-normalised to -16 LUFS, with `-movflags +faststart`, ≤ 7 MB. Burn in the English captions.
2. **Captions:** run whisper on the final file, then write `.en.vtt` and a hand-written `.es.vtt` with the same cue timings (sentence cues, ≤ 2 lines, ≤ 42 characters a line).
3. **Poster:** a frame where she looks at the camera, smiling, eyes open, with no burned caption. Make it 720×1280 WebP, ≤ 60 KB. **Avatar:** a 256×256 WebP face crop, ≤ 15 KB.
4. **Upload** to Vercel Blob under `landing/dr-karlinsky-ig/` with a **new version suffix** (`-v2`). The files are cached for a year, so never overwrite a `-v1` path. Use exactly the `url` that `put()` returns. Two Blob stores exist, so don't type the host by hand. Upload the `.vtt` files with content type `text/vtt; charset=utf-8`.
5. **Check:** `curl -I` on each URL returns 200 with the right content type. The MP4 also needs `accept-ranges: bytes`.
6. **Edit one file:** `apps/web/components/landing-pages/dr-karlinsky-ig/drk-media.ts`. Update `DRK_VIDEO` (`src`, `poster`, `posterWidth`, `posterHeight`, `captionsEn`, `captionsEs`, `durationSec`) and `DRK_AVATAR` if the avatar changed. Nothing else in the page should need to change.
7. Run `pnpm --filter web typecheck` and a quick check at 390×664: poster, play, captions in EN and ES (`?hl=es`), and the end card.
8. Leave the old `-v1` blobs in place until the new deploy is live, then delete them.
