---
name: instagram-live-ad
description: Set up, run and report a Meta "live video ad" that sends people into an Alluring Instagram live. Use when the user says "we're doing a live", "set an ad for the live", "boost the live", "we are live now", "how did the live do?", or "/instagram-live-ad". Covers the prep days before, building the ad in Ads Manager with Claude in Chrome, the late-start rescue, and the results afterwards.
argument-hint: '[plan | build | live-now | results]'
---

# Instagram live video ad

Meta's "Live video ad" uses the live itself as the creative. Its button is
"Watch live video" and it only delivers while the account is live, inside the
ad set's schedule. First run: 13 Oct 2026, $76.01, 8,001 impressions, 285
taps into the live ($0.27 each), about 260 viewers.

Before anything else, read `~/monsoft/projects/alluring/ads/agents-notes/INDEX.yaml`
and `patterns/instagram-live-video-ad.md` there. After each live, add what was
learned to that note.

## Accounts

- Ad account "Alluring Ad Account - New": `3789317384702021`.
- Instagram **@alluringplasticsurgery** and Facebook Page **Alluring Plastic
  Surgery**. Ads Manager often defaults to the wrong ones
  (`@alluringplasticsurgerymiami`, "Alluring Of Kendall"); always fix them.
- Meta Ads MCP: read-only checks such as `ads_get_ad_entities` and
  `ads_get_errors`. Build the ad in the browser; the MCP can't make live
  video ads.

## Hard rules

- **Publishing spends money, so get the user's explicit yes** before pressing
  Publish, every time.
- Never press "Discard drafts" in Ads Manager. It discards every draft in the
  account.
- Copy: no "luxury" or "affordable", no surgeon name in the title, no
  before/after body images.
- **Don't report delivery during the live.** The API showed "preparing" with
  the full budget left while both ads were delivering. Results arrive 15–30
  minutes late.

## 1. Plan (2+ days before)

Ask for the date, start time, length (45–60 minutes is the default), topic,
budget ($100 per live is proposed) and any guest account (e.g. @drkarlinsky).
Then tell the team:

- Schedule the live in the Instagram **phone app** (1 hour to 90 days ahead).
  Followers get a reminder.
- Post a Reel announcing the topic, then a countdown Story the day before and
  one an hour before.
- Pinned comment: "Want your own plan and price? Send us a DM with the word
  LIVE and we will set up your free consultation. 🤍"
- **Start on the minute.** If the live starts after the scheduled time, Meta
  kills the scheduled ad ("You didn't go live at your scheduled start
  time…", error #3843094).

## 2. Build (the day before; Meta wants at least 3 hours)

1. instagram.com → profile → banner "Get more viewers for your next live
   video" → **Schedule ad**. This opens an Ads Manager draft (Sales campaign,
   "Live video ad" on, `destination=INSTAGRAM_LIVE`).
2. Fix every default in the ad set:
    - Instagram → @alluringplasticsurgery; the Page then switches by itself.
    - Performance goal → **Maximize number of link clicks** (it defaults to
      Purchase conversions).
    - Choose **Upcoming live video**; only then do Budget and Schedule appear.
    - Lifetime budget: it defaults to $350, so set the agreed amount.
      Schedule: it defaults to 4–6 pm, so set the live's start to its end plus
      15 minutes.
    - Audience: US. Under "Further limit the reach of your ads" → Switch setup,
      turn off "Choose an audience for each ad creative". Set women, minimum
      age 21; these are suggestions, not limits.
3. Ad: it must read "Live video: Going live at <date, time>". Primary text
   (max 125 characters), e.g. "We're live now. Ask our plastic surgery team
   your questions and get straight answers. Tap to join."
4. Name the campaign `APS | IG Live | <YYYY-MM-DD>`. Read the full setup back
   to the user and publish only on their yes. Approval took about 3 minutes.

**Browser quirks (claude-in-chrome):** screenshots are blocked on
adsmanager.facebook.com, so use `get_page_text`, `find` and `read_page` and
re-read after every edit. The start-hour spinbutton only moves with
ArrowDown, then Tab and type the minutes. Set the start before the end. For
the budget: triple-click, cmd+a, type, Tab. The age lists are virtualised:
minimum 21 is the 4th option, and the maximum may stay at 65+.

## 3. Rescue (late start, or no banner)

Once the account is live: Ads Manager **Create → Sales → "Live video ad" on →
Instagram → Current live video**. Use the same fixes as above, with the
schedule running from now until the planned end. The account defaults were
already correct in this flow. Get the user's yes, then publish.

If the scheduled ad was also edited to run, two ads will spend; the 13 Oct
total was $76 against a $50 plan. Check both before saying what was spent.

## 4. Results (30+ minutes after the live)

- Ads: `ads_get_ad_entities` with spend, impressions, reach, link clicks, CPM
  and cost per click for each ad set.
- The live's own numbers are only in the phone app: the end screen's **View
  insights**, or later Insights → Content you shared → Live, or Archive → Live
  archive. They are not on instagram.com. Ask the team for a screenshot of
  accounts reached, peak viewers, comments, shares and new followers.
- Ask how many "LIVE" DMs and consult requests came in.
- Log one row per live in the ads note: date, time, minutes late, guest,
  budget, spend, impressions, taps, $/tap, peak viewers and LIVE DMs. Test one
  change per live: Live 2 is the prepared baseline, Live 3 adds a guest, and
  Live 4 tests the evening slot.

## Still unknown

Whether a scheduled ad recovers by itself after a late start; whether an ad
attaches to an unscheduled live; whether the in-app Boost button exists on
this account; how long the Live archive keeps insights.
