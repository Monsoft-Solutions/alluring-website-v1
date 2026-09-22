# Review mode

Audit a procedure page (rebuilt or still on the template), decide what to
change, and publish the review as an artifact with sketches. Model:
https://claude.ai/artifact/Q5UBQFeDqj7KTL65TRTvhp, the review of PR #265
(read it with the Artifact tool).

## Gather

The same evidence as Phase 1 of the skill, on the build under review:

- Code: every file in the page module, the data file, the route, the graph
  util, at the commit under review. Note the SHA.
- Rendering: the production build served with `next start`, at 390 × 844 and
  1440 × 900, with section offsets measured (see [verification](verification.md)).
- Search Console: 90 and 28 days, query × page, weekly trend.
- Market: the Miami competitor pages and the authorities (fetched and parsed
  the same day; use WebSearch as a ranking proxy, since Google CAPTCHAs
  automated SERP checks).
- Assets: `audit:procedure-assets --slug <slug> --prod`.
- The sweep output, and anything it had to be told to skip.

## Decide

Tag every finding with one of:

| Tag              | Meaning                                                       |
| ---------------- | ------------------------------------------------------------- |
| **Keep**         | Already better than the market; don't trade it away           |
| **Before merge** | Small, no layout change, wrong or risky if shipped as is      |
| **Fast follow**  | The next PR: conversion, order, structure, schema             |
| **Needs owner**  | A fact, a photo, a review or a sign-off only the practice has |
| **Leave**        | Considered and rejected, with the reason                      |

Each finding has: **why** (the evidence, with numbers), **change** (exact
copy or code, copy-ready), and **where** (file:line). Findings that conflict
with a rule ([compliance](compliance.md)) or a standing decision (title held
until the post-launch read, price wording, the control group) say so.

## Sketch

Draw the changes in the page's own type and palette, at phone scale:

- The first screen now vs proposed (390 × 844, with the fold marked).
- Any new block (quick form, bridge CTA, comparator, location).
- The section order now vs proposed, drawn to scale from the measured
  offsets, with where results, the first form and the full form sit.
- The search snippet now vs proposed, with character counts.

Mark new elements clearly and label placeholders that need the owner ("NEEDS
HER WORDS — DO NOT WRITE FOR HER").

## Publish

Load the `artifact-design` skill, write one HTML page, and publish it with
the Artifact tool. Sections: verdict and 3–4 KPIs, what to keep, before
merge, sketches, section order, SEO data, AEO and GEO, after merge, leave as
is, and how it was checked (code SHA, render sizes, data windows, market
date). Give the user the link and a short verdict in chat.

## Apply

When the user says go ahead: implement every before-merge item and every
fast-follow that doesn't need the owner, on the branch they name, and open a
PR against the branch under review (or `master`). Record any deviation from
the review and why (for example, fewer FAQs to stay inside the sweep's
range). Owner items go in the PR as a checklist.
