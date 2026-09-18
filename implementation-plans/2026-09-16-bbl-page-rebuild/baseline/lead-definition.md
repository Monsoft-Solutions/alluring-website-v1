# What counts as a BBL lead

Written for #249 so #260 counts the same thing before and after the rebuild.
Read from the production `contact_submission` table; **not** from the Google Ads
UI, where the thank-you conversion tag never fires on the SPA navigation the
forms use.

## The rule

A row in `contact_submission` is a **BBL lead** when either holds:

1. `source = 'procedure-page'` **and** `procedure = 'bbl'` — the form on the BBL
   procedure page; or
2. `landing_page` or `referrer` contains `brazilian-butt-lift-bbl-miami` — the
   visit started on, or came from, the BBL page and converted on any form.

```sql
select count(*)
from contact_submission
where created_at >= date '<start>' and created_at < date '<end>'
  and (
    (source = 'procedure-page' and procedure = 'bbl')
    or landing_page ilike '%brazilian-butt-lift-bbl-miami%'
    or referrer   ilike '%brazilian-butt-lift-bbl-miami%'
  );
```

Rule 2 is deliberately generous: the page's job is to start the conversation,
and 297 of 720 leads in the window converted on the specials page. A visitor who
lands on the BBL page and books through the exit-intent popup is a BBL lead.

`procedure = 'bbl'` **on its own is not** a BBL lead. It is a picker value on the
contact hero and the specials form, chosen by people who never saw the page.
It is tracked separately below as demand, not attribution.

## Baseline — 90 days, 2026-06-16 to 2026-09-13

| Measure                                                         | Count |
| --------------------------------------------------------------- | ----: |
| Leads, all sources                                              |   720 |
| **BBL leads by the rule above**                                 | **0** |
| — rule 1 (BBL procedure-page form)                              |     0 |
| — rule 2 (landed on / referred from the BBL page)               |     0 |
| Chose `procedure = 'bbl'` on any form (demand, not attribution) |    28 |
| Submissions from **any** procedure-page form                    |     1 |

The single procedure-page submission was liposuction, on 2026-07-24, from a
Facebook lead-form campaign. **All time, the BBL lead count by this rule is
also 0** — the page has never produced a lead.

By source, same window: specials-page 306, contact-hero 210, exit-intent 133,
promo-modal 30, quiz 26, landing-page 11, blog-lead 3, procedure-page 1.

## Consequence for the targets

The baseline is zero, so #260's targets are **absolute**, not multiples of a
baseline: ≥ 1 BBL lead per 28 days at day 56, ≥ 3 per 28 days at day 90.

Also worth reading as its own result: the mid-page procedure form has produced
one lead across all nine pages in 90 days. #253 moves it to the end behind a
sticky Book · Call bar; count rule 1 before and after so the move is measured
rather than assumed.
