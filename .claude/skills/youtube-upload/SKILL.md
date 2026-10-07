---
name: youtube-upload
description: Upload videos to the Alluring Plastic Surgery YouTube channel (@AlluringPlasticSurgery) through the user's Chrome with Claude in Chrome. Makes English and Spanish caption files from the audio, writes search-led titles and descriptions in both languages, uploads the full-size files, fills every Studio setting, then publishes or schedules them one a day once the user approves. Use when the user says "upload these videos to YouTube", "put the new Dr. K videos on the channel", "schedule the next Shorts", or "/youtube-upload". The youtube-uploader agent does the browser work.
argument-hint: '<folder of videos> | publish | verify'
---

# YouTube upload

Puts the practice's videos on YouTube with proper captions and settings. The
channel feeds three things: Google Ads (video campaigns and remarketing),
the website (embeds with VideoObject data) and brand search. The first batch,
six Dr. Karlinsky Shorts, went up on 7 Oct 2026; its IDs and dates are in the
`youtube-shorts-upload-2026-10-07` memory.

The browser work goes to the `youtube-uploader` agent. **The main session
holds every decision**: it makes the captions, writes the text, gets the
user's approval, and hands the agent a finished manifest.

Why not the YouTube API: until Google approves the API audit, every upload
made through it is locked to private. Studio in the browser has no such
limit. The automation plan is in the `youtube-automation-plan` memory.

## Workflow

1. **Pick the files.** Upload the largest vertical master (the 4K 9:16
   cut for ad videos). Anything vertical and up to 3 minutes becomes a
   Short. Check each with `ffprobe` (size, length, resolution). Watch or
   transcribe each video before writing about it: what is said on camera
   decides what the text may claim.
2. **Make a batch folder** at
   `~/monsoft/projects/alluring/youtube/<YYYY-MM-DD>-<slug>/` with
   `serve/` inside. Symlink each video into `serve/` under a short key
   (`v1.mp4`, `v2.mp4`, …). Keys keep URLs and file names simple. This folder
   is the batch's record; don't use the session scratchpad.
3. **Captions.** See "Making captions" below. The result is
   `serve/<key>.en.srt` and `serve/<key>.es.srt` for each video.
4. **Write the text** for each video under "Text rules" below: English
   title, description and tags; Spanish title and description. Save it in
   `manifest.json` (format below).
5. **Approve.** Show the user each video's title, description and the
   publishing plan (which goes public when). Flag anything said on camera
   that clashes with the rules in CLAUDE.md, quoting it with the timestamp.
   The user decides; captions must match the speech, so the only fixes are a
   new cut or not posting it. On 7 Oct the user ruled on one ("we welcome
   patients from all over the world"): her own words are fine, our copy still
   targets the US.
6. **Upload.** Start the file server (below), then spawn `youtube-uploader`
   with job **A (upload + set up)** and the manifest path. It uploads all
   files, fills every setting, adds both caption tracks and the Spanish
   translation, and saves everything as **Private**. It returns the video
   IDs; write them into the manifest.
7. **Publish.** Only after the user approves the plan. Making a video public
   or scheduled is publishing. Spawn the agent with job **B (publish)**
   and the exact plan: which key goes public now, and the date for each
   scheduled one.
8. **Verify and close out.** Job **C (verify)** reads the content list back.
   Stop the file server. Update the memory (IDs, dates, rulings) and tell the
   user what's live, what's scheduled and the Shorts links.

`$0` = a folder runs steps 1–6. `publish` runs step 7 on a manifest that
already has IDs. `verify` runs job C alone.

## Publishing plan

- **One a day, 6:00 PM New York time**, starting the day after the first
  public one. Spacing gives each Short its own test audience; there's no
  penalty for batches, so don't delay anything for this.
- Publish **today** anything needed this week in Google Ads or on the
  website. A scheduled video stays private until its time and can't be used
  in either.
- Lead with the proven winner (the best Meta ad by cost per lead).
- Keep the queue going: the user wants the channel posting daily. When a
  batch is scheduled, say on what date the queue runs out.

## Making captions

YouTube indexes uploaded captions for search and can't read burned-in
text. Its auto captions misspell "Karlinsky" and procedure names. Always
upload an English file and a Spanish file.

```bash
B=~/monsoft/projects/alluring/youtube/<batch>; K=.claude/skills/youtube-upload/scripts
mkdir -p $B/audio $B/whisper
ffmpeg -v error -y -i $B/serve/v1.mp4 -vn -ac 1 -ar 16000 $B/audio/v1.wav   # each video
whisper $B/audio/*.wav --model turbo --language en --output_format all \
  --output_dir $B/whisper --word_timestamps True \
  --initial_prompt "Dr. Karlinsky, Alluring Plastic Surgery, Miami, Lipo 360, BBL, tummy tuck, mommy makeover."
python3 -I $K/cues.py $B/whisper/v1.json $B/serve/v1.en.srt              # prints the cue count
```

Run Whisper in the background (about a minute per video on this Mac). Use
`--language es` for a video spoken in Spanish, and make the English track
the translation.

**Proofread every English SRT against the audio** and fix it by hand:
punctuation, hyphenation ("cookie-cutter", "patient-by-patient"), terms
Whisper hears wrong. Add repeat offenders to `FIXES` in `cues.py`.

**Spanish:** write `serve/v1.es.txt` with one line per English cue, in
order. Then run `python3 -I $K/translate_srt.py $B/serve/v1.en.srt
$B/serve/v1.es.txt $B/serve/v1.es.srt`. It refuses mismatched counts.
Translate the meaning, not word for word. Keep "mommy makeover", BBL and
"Lipo 360" as patients search them. Use "tú" in captions, which matches the
doctor's direct tone. Write "consulta gratis" and "24/7".

## Text rules

**Titles** (≤ 60 characters, ≤ 100 hard limit):

- Lead with what people search: "Loose skin after weight loss: what are your
  options?", "What is a mommy makeover? It's more than one procedure".
- **No surgeon name in titles** (user rule). Put "Dr. Karlinsky" in the
  description.
- Questions work well for Q&A clips. No clickbait, no all caps, no emojis.

**Description:**

1. Line one: the search phrase in a full sentence, then what the video
   answers. Name "Dr. Karlinsky of Alluring Plastic Surgery in Miami".
2. A call to action and the matching page with UTM tags:
   `https://www.alluringplasticsurgery.com/<path>?utm_source=youtube&utm_medium=video&utm_campaign=<batch-campaign>&utm_content=<slug>`.
   Check that the path exists in `apps/web/app` before using it. Pages used
   so far: `/after-weight-loss-consultation`, `/free-consultation`,
   `/procedures/mommy-makeover-miami`, `/about`, `/fly-in-consultation`.
   Spanish descriptions link to `/consulta-gratis`.
3. `Call or text: (786) 305-8649` from `siteConfig.contact.phoneDisplay`,
   then "Alluring Plastic Surgery, Miami, FL".
4. Two or three hashtags at the end (the first three show above the title).

**Tags:** 5–10 phrases people search, English only. Example:
"loose skin after weight loss, skin removal surgery, Miami plastic surgery".

**Spanish title and description:** same structure, written for Spanish
speakers in the US. Use "tú", like the captions, and "la Dra. Karlinsky".
Example opening: "¿Bajaste mucho de peso y ahora tienes piel flácida en los
brazos, el abdomen, los muslos o la espalda?"

**Never:** describe the practice as serving Latin America or international
patients; offer travel help (flights, lodging, pickup, recovery houses);
write "luxury" or "affordable"; quote prices; claim board certification
beyond what the `surgeon-board-certification-conflict` memory allows.
What the practice offers out-of-town patients: dates confirmed in writing
and how many nights to stay in Miami.

## Manifest

`manifest.json` in the batch folder. The agent works only from this file.

```json
{
    "campaign": "shorts-2026-10",
    "server": "http://127.0.0.1:8765",
    "videos": [
        {
            "key": "v1",
            "file_title": "Extra skin after weight loss",
            "title": "Loose skin after weight loss: what are your options?",
            "description": "Lost a lot of weight and now have loose skin…\n\nBook a free consultation…\nhttps://…",
            "tags": ["loose skin after weight loss", "skin removal surgery"],
            "es_title": "Piel flácida después de bajar de peso: ¿qué opciones hay?",
            "es_description": "…",
            "id": null,
            "publish": null
        }
    ]
}
```

`id` is filled in after job A. `publish` is `"now"` or an ISO date such as
`"2026-10-08"` (6:00 PM ET), and is set only once the user approves.

## Settings the agent applies to every video

| Setting                                | Value                                                      |
| -------------------------------------- | ---------------------------------------------------------- |
| Made for kids                          | No                                                         |
| Paid promotion                         | No                                                         |
| Altered or synthetic content           | No                                                         |
| Video language / caption certification | English (United States) / never aired on US TV             |
| Location                               | Miami, Florida (not Miami Shores or Miami Beach)           |
| Category                               | Howto & Style                                              |
| Comments                               | On, moderation **Strict** (hold potentially inappropriate) |
| Remixing                               | Allow only audio remixing                                  |
| Automatic concepts / chapters          | Off                                                        |
| Embedding                              | On (the website needs it)                                  |
| Subtitles                              | English and Spanish SRT, "With timing"                     |
| Translation                            | Spanish title + description, then the Spanish SRT          |

## File server

```bash
python3 -I .claude/skills/youtube-upload/scripts/serve.py ~/monsoft/projects/alluring/youtube/<batch>/serve
```

Run it in the background. The first fetch from Studio triggers Chrome's
"access other apps and services on this device" prompt; ask the user to
click **Allow**. Stop it (`pkill -f serve.py`) when the batch is done.

## Spawning the agent

- One browser agent at a time. Claude in Chrome drives the user's single
  Chrome window. Don't use the browser from the main session while it works.
- Six videos took about 70 minutes of browser time on 7 Oct, much of it
  spent redoing fields after dialogs re-rendered. For long batches, spawn job A once per two or three
  videos so a failure doesn't lose the whole run.
- The user must be signed in to Chrome with access to the channel
  (adriano@monsoftsolutions.com has it). If Studio asks to pick a channel,
  pick "Alluring Plastic Surgery".
