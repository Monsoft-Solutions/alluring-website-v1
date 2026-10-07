---
name: gbp-review-replies
description: Reply to Google reviews on the Alluring Plastic Surgery Business Profile. Reads every unanswered review in the user's Chrome (Claude in Chrome), drafts a HIPAA-safe reply to each in the reviewer's language, gets the user's approval, then posts the replies one by one and checks them. Use when the user says "reply to our Google reviews", "answer the new reviews", "any unanswered reviews?", or "/gbp-review-replies". The gbp-review-replier agent does the browser work.
argument-hint: '[read | post | verify]'
---

# Google review replies

Replies to reviews on the practice's Google Business Profile. Google and
patients both read reply rate, and before 7 Oct 2026 nobody had replied in
19 weeks. The goal is a reply to every review within 48 hours.

The browser work (reading reviews, posting replies) goes to the
`gbp-review-replier` agent. **The main session holds every decision**: it
drafts the replies, shows them to the user, and only sends the agent text the
user has approved.

## Workflow

1. **Read.** Spawn `gbp-review-replier` with job **A (read)**. It returns
   every review in the Unreplied tab with its full text, stars, age and
   language. If it returns nothing, tell the user there's nothing to answer
   and stop.
2. **Draft.** Write one reply per review under the rules below. Put the
   negative ones (1–3 stars) first, then the rest newest first.
3. **Approve.** Show the drafts to the user: each review (short excerpt for
   long ones) and its reply. More than about 8 reviews, or someone else at
   the practice has to approve: publish them as an Artifact page with Copy
   buttons, like the 7 Oct batch (claude.ai/artifact/AMUMHEoDJganE7iAWzxfbi,
   "Review replies" section). Flag anything the practice should check first,
   such as a complaint to look up in the CRM.
4. **Post.** Only after the user says to post. A request like "go ahead and
   reply to each of them" counts. Spawn `gbp-review-replier` with job
   **B (post)** and pass the approved replies **verbatim**, each keyed by the
   reviewer's display name exactly as Google shows it. Don't add or reword
   anything between approval and posting.
5. **Verify and report.** About 15 minutes after posting, spawn the agent
   with job **C (verify)** to confirm the replies are published and not
   pending or rejected. Tell the user how many were posted and published,
   which failed, and why.
   Repeat the follow-ups the practice owns, such as calling 1-star reviewers.

`$0` = `read` runs steps 1–3 only. `verify` runs job C alone. `post` assumes approved drafts already
exist in this conversation and runs step 4.

## Reply rules

These hold for every reply. They come from the 7 Oct 2026 batch.

**Privacy (HIPAA).** A public reply from a medical practice must not confirm
that someone is a patient or disclose anything about their care.

- Never name a procedure, result, body area, date, or visit, **even when the
  reviewer did**. Don't write "your surgery", "your recovery", "your
  results", "your tummy tuck", "your second procedure".
- Don't argue with or correct facts about the reviewer's care in public.
- "Thank you for your kind words", "we're glad to read this" and "thank you
  for recommending us" are fine.

**Names.** Address the reviewer by first name (or their display name if it
has no clear first name). Mention a staff member only if the reviewer named
them, spelled as the reviewer spelled them. "Dr. Karlinsky" is always fine.
Never use the surgeon's first name alone.

**Language.** Reply in the review's language. Spanish replies use "usted"
and open with "¡".

**Negative reviews (1–3 stars).**

- Acknowledge and apologise without admitting fault on clinical matters.
- Explain policy, never the case. For a price complaint: "Any figure shared
  before Dr. Karlinsky reviews a case is only an estimate."
- Move it offline: "Please call (786) 305-8649 and ask for the practice
  manager." Take the number from `siteConfig.contact.phoneDisplay` in
  `apps/web/lib/data/site-config.ts`; don't hard-code a different one.
- Add an internal note for the practice: what to check in the CRM, who should
  call, and any process problem the review exposes.

**4-star reviews.** Thank them, then invite feedback: "If there's anything we
could have done better, we'd really like to hear it."

**Tone.** Warm and short: one to three sentences for short reviews, up to
four for long ones. Pick up one specific, non-clinical detail the reviewer
mentioned (a staff name, "compliments from TSA", "té de tila") so each reply
reads as written for that person. Never reuse a sentence across replies in
the same batch. No emojis, no hashtags, no links, no keywords stuffed in for
SEO, no offers or discounts, and never ask for a review to be changed.

**Never** use the words luxury or affordable, mention prices, or make
credential claims ("board-certified plastic surgeon").

### Examples from the 7 Oct 2026 batch

> ★1, a quote that tripled: "Joann, thank you for telling us about this, and
> we're sorry it was so frustrating. Any figure shared before Dr. Karlinsky
> reviews a case is only an estimate. The price is set once she has reviewed
> it and knows the full plan. That should be explained clearly before any
> number is given, and we're reviewing how our team handles it. We'd like to
> talk this through with you directly. Please call (786) 305-8649 and ask for
> the practice manager."

> ★5, names nurse and anesthesiologist: "Stacy, thank you for such a
> thoughtful review. We'll make sure Amanda and Jose see your kind words, and
> Dr. Karlinsky was so happy to read them too. Thank you for recommending us."

> ★5, Spanish: "¡Muchas gracias, Paola! Nos alegra mucho leer esto. Ya les
> hicimos llegar sus palabras a las chicas del equipo y a la Dra. Karlinsky.
> ¡Un abrazo!"

## Spawning the agent

- One browser agent at a time. Claude in Chrome drives the user's single
  Chrome window, so don't run two jobs in parallel or use the browser from
  the main session while the agent works.
- The agent uses `model: inherit`. Don't pin a model in its frontmatter;
  several older agents here pin one that no longer exists.
- The user must be signed in to Chrome as a manager of the profile
  (adriano@monsoftsolutions.com is). If the agent reports no manager view,
  ask the user to sign in.
