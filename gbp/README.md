# Google Business Profile: media and weekly posts

What goes on the Alluring Plastic Surgery Google profile (profile ID
`3460358991193098276`), when it goes there, and what is already up. Started
7 Oct 2026 from the GBP audit
(claude.ai/artifact/AMUMHEoDJganE7iAWzxfbi).

| Path        | What it is                                                                      | In git |
| ----------- | ------------------------------------------------------------------------------- | ------ |
| `plan.json` | The approved media, the weekly schedule, the post texts, and each item's status | yes    |
| `media/`    | The 26 files, named `NN-<id>.<ext>`                                             | **no** |

`media/` is gitignored because it holds identifiable patients and runs to
about 70 MB. If it's missing on a machine, rebuild it from
`~/monsoft/projects/alluring/instagram-review/`: `gbp-selection.json` lists
each item's source file under `work/gbp/`.

The `/gbp-media` skill runs this plan, and the `gbp-media-uploader` agent does
the browser work.

## The plan

- **Weekly post:** one Google "Update" post every Thursday, with a button and
  a tracked link (`utm_campaign=gbp-post`, plus `utm_content` per post).
- **Profile media:** two or three photos or videos added each week.
- **The schedule:** `plan.json → schedule` lists each week's post topic, the
  media to attach to it, and the profile items to add.

| Week | Thursday | Post                                       | Profile adds                                  |
| ---- | -------- | ------------------------------------------ | --------------------------------------------- |
| 1    | 8 Oct    | What happens at a consultation             | storefront, reception, portrait, walk-through |
| 2    | 15 Oct   | Flying in from another state               | surgeon-thanks, team-photo                    |
| 3    | 22 Oct   | Hablamos español                           | es-24-7                                       |
| 4    | 29 Oct   | breast surgery (topic open)                | anesthesia, int-reception-b                   |
| 5    | 5 Nov    | face (topic open)                          | ext-tummy-tuck, es-renuvion                   |
| 6    | 12 Nov   | preparing for surgery day                  | tampa-patient, driving-after                  |
| 7    | 19 Nov   | Spanish tour                               | arrival-8435, nurse-care                      |
| 8    | 26 Nov   | are you ready? (Thanksgiving: post 25 Nov) | lipo-tt-combo, renuvion-doctor                |

Item status: `todo` → `uploaded` (Google shows it as pending) → `live`, or
`failed`. Update `plan.json` after every upload so the next run knows where
it stands.

## Rules that get content approved

The last three posts before 7 Oct 2026 were rejected for "20% OFF" promos.

- **Posts:**
    - no phone number, link, percentage, "OFF", price or countdown in the
      text;
    - the link goes on the button;
    - no all-caps, no emoji.
- **Images and videos:**
    - no before/after, bare skin, surgical garments, surgery or blood;
    - little or no burned-in text;
    - videos must be 30 s or shorter and at least 720p.
- **Copy:**
    - never name the surgeon (user rule, 7 Oct 2026);
    - no "luxury" or "affordable", no board-certification claims, no result
      promises;
    - the US only, and no travel arranging (see CLAUDE.md).
- **Patients:** items with `needs_media_release: true` show an identifiable
  patient. Confirm the practice has the patient's release before uploading
  them.
- `10-travel-surgeon` breaks the US-only and no-travel rules. Don't use it.

## How to upload

### Photos (the agent can do this)

1. Sign in to Chrome as a manager of the profile
   (adriano@monsoftsolutions.com).
2. Open `https://www.google.com/local/business/3460358991193098276/promote/photos/add`
   as the top page. On the Search results page the upload dialog sits in an
   iframe that browser tools can't reach.
3. Choose the files, or with Claude in Chrome use `find` on "file input"
   and then `file_upload`. Several photos can go in one call.
4. Check `…/promote/photos/mediatool`: new photos show as **Pending** until
   Google approves them, usually within a day.

Google doesn't let you choose a category (exterior, interior, team) when you
upload. It sorts photos itself.

### Videos (by hand)

Uploading a video through Claude in Chrome stalls: the progress bar spins
and no upload request is ever sent. This happened on 7 Oct 2026, three tries,
including a file re-encoded to standard 30 fps. Drag videos in yourself:

1. Open the profile → **Photos** → **Add photos**, or the `photos/add` URL
   above.
2. Drag in `gbp/media/NN-<id>.mp4`.

### Posts

1. On the Search manager view, click **Add update**, then **Add a post**.
2. Choose **Update**, paste the text from `plan.json → posts`, and add the
   button with its link.
3. Click **Post**.
4. Google then offers to copy the post to the **Monsoft Solutions** profile.
   Always click **Skip**.
5. The posts list shows the post as published. Google can still reject it
   later, so check again the next day.
