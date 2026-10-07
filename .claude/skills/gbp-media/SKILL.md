---
name: gbp-media
description: Run the weekly Google Business Profile plan for Alluring Plastic Surgery. It publishes the Thursday post and adds the week's approved photos and videos from gbp/plan.json, then records what went live. Use when the user says "do this week's Google post", "add the next photos to Google", "what's left on the GBP plan?", "post the next Google update", or "/gbp-media". The gbp-media-uploader agent does the browser work.
argument-hint: '[status | week N | post N | photos | verify]'
---

# Google profile media and weekly posts

Works through `gbp/plan.json` a week at a time: one Thursday post and two or
three profile photos or videos. `gbp/README.md` has the rules and the manual
steps, so read it first. The media files are in `gbp/media/`, which is
gitignored.

The browser work goes to the `gbp-media-uploader` agent. **The main session
holds every decision**: it picks what's due, checks it against the rules,
gets the user's go-ahead, and gives the agent exact file paths and exact
post text.

## Workflow

1. **Status.** Read `gbp/plan.json`. Using today's date, list what's due and
   still `todo`: this week's post, its media, and the week's profile items.
   Also list anything `uploaded` more than two days ago that hasn't been
   confirmed live. If `gbp/media/` is missing, rebuild it from
   `~/monsoft/projects/alluring/instagram-review/` (README, "Path").
2. **Check before showing.** For each item:
    - its flags in `plan.json`;
    - `needs_media_release`: ask whether the practice has the release, and
      don't upload until the user confirms;
    - `10-travel-surgeon` is never used.

    For a post:
    - the text has no phone number, link, %, "OFF", price or surgeon name;
    - it's 1,500 characters or fewer;
    - the button link carries `utm_campaign=gbp-post` and its own
      `utm_content`.

    Posts with "(topic open)" have no text yet. Draft one in the same voice
    as posts 1–3 and get it approved first.

3. **Approve.** Show the user the post text, its button and link, and the
   media list, with a contact sheet or still for each video. Uploading or
   posting needs a clear yes in chat. Saying "approve all the media" on
   7 Oct approved the media list itself, not every upload; each week's
   upload still needs the user to say go.
4. **Do it.** Spawn `gbp-media-uploader`:
    - job **A (photos)** with the absolute paths of the approved photos;
    - job **B (post)** with the post text verbatim, the button type, the
      link, and an optional photo path.

    **Videos:** don't send them to the agent. Uploading a video through
    Claude in Chrome stalls (7 Oct 2026). Give the user the file paths and
    the two-step drag-in from the README.

5. **Record.** Update `gbp/plan.json`:
    - each item's `status` (`uploaded` / `failed`), `status_date` and
      `status_note`;
    - each post's `status` (`published` / `rejected`).

    Update the posts section of the GBP plan artifact too
    (claude.ai/artifact/AMUMHEoDJganE7iAWzxfbi) when a post's state changes.

6. **Verify.** About a day later, spawn the agent with job **C (verify)**.
   Mark confirmed items `live`. For anything Google rejected, tell the user
   and record why if Google says.

`$0`:

- `status`: step 1 only.
- `week N`: that week's items.
- `post N`: just that post.
- `photos`: due photos only.
- `verify`: job C.

## Spawning the agent

- One browser agent at a time. Claude in Chrome drives the user's single
  Chrome window, so don't run two jobs at once or use the browser from the
  main session while the agent works.
- The user must be signed in to Chrome as a profile manager
  (adriano@monsoftsolutions.com). If the agent reports no manager view, ask
  the user to sign in. Never enter credentials.
- `file_upload` only accepts files under paths the session can reach. Pass
  absolute paths inside this repo, under `gbp/media/`.
