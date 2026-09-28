# Wave two: prices and claims (#309)

Decision D2 of the wave-two brief (tummy tuck, breast augmentation, mommy
makeover): fix the live prices and claims before the page rebuilds.

AI engines were asked about the three procedures through their APIs, with web
search on. Every price they attributed to Alluring (22 of 22) was a figure the
practice doesn't charge, copied from a live Alluring page. The code half of
this PR fixes the procedure data files, the paid landing pages, the quiz,
`/mommy-makeover-consultation` and the FAQs. The two blog posts below live in
the database, so they change through SQL that you run.

## Run order

Production writes go through you.

| When                 | Step                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| After the PR deploys | `psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f implementation-plans/2026-09-28-wave-two-prices-claims/sql/blog-prices-claims.sql`                                              |
| Right after          | `bash implementation-plans/2026-09-22-lipo-blog-cluster/revalidate.sh blog-posts sitemap-urls blog-post-tummy-tuck-mommy-makeover-miami blog-post-affordable-plastic-surgery-miami` |

The SQL runs in one transaction:

1. `/blog/tummy-tuck-mommy-makeover-miami` is re-scoped to the comparison it
   is (D3). The title becomes "Tummy Tuck or Mommy Makeover: Which One Do You
   Need?". The meta and excerpt drop the "$8–25K" figures, and the cost
   section is replaced by links to each procedure page's `#pricing`. The
   cost FAQ goes. So do the AAAASF, "triple board-certified" and "5-star
   reviews" claims, and an image that the pipeline had dropped mid-sentence
   is moved back after the sentence.
2. `/blog/affordable-plastic-surgery-miami` takes the price sheet's tummy tuck,
   breast augmentation and mommy makeover figures, in place of the
   $6,000–$12,000, $8,000–$15,000 and $12,000–$25,000 ranges. It also loses
   the $200/month examples, the "4.9 rating" (the Google profile is 4.7),
   "Affordable Luxury", and two patient stories that no source backs.
3. It dismisses any open autopilot refresh candidate on either post. The
   re-scoped post had one pending since 2026-09-15, and the blog writer prompt
   still teaches the old prices (#297). Dismissing starts the 60-day refresh
   cooldown.

Each post is updated only if its content still matches the snapshot (md5).
If either changed, the transaction raises and nothing is written. Running it
twice is a no-op. `content_updated_at` is left to its trigger: these are real
revisions, so the sitemap `lastmod` moves.

Tested on the worktree's clone (`alluring_wt_fix_procedure_prices_claims_309`),
with both posts first set to their production content:

- applied, then re-run (no-op);
- with one post edited after the snapshot: the run raised `expected 2 updated
posts` and neither post changed;
- the rendered posts checked on `next start`.

## Rebuilding the SQL

`build_sql.py` works from the snapshot in `snapshot/`, which was taken from
production on 2026-09-28. If either post changes before you run the SQL,
take a new snapshot and rebuild:

```bash
cd implementation-plans/2026-09-28-wave-two-prices-claims
for slug in tummy-tuck-mommy-makeover-miami affordable-plastic-surgery-miami; do
  psql "$POSTGRES_URL_PROD" -X -A -t -c "select row_to_json(t) from (select id, slug, title, meta_title, meta_description, meta_keywords, excerpt, content, faqs, quick_answer, primary_keyword, secondary_keywords, ai_summary, content_updated_at, updated_at from blog_post where slug='$slug') t" > snapshot/$slug.prod.json
done
python3 build_sql.py snapshot sql/blog-prices-claims.sql
git diff sql/
```

Every replacement must match exactly once, or the build stops. It also
refuses to write SQL if a retired figure or claim survives in either post.

## Not in this PR

These are left for later, on purpose:

- **Site-wide claims** that also show on these pages:
    - the template trust strip ("Board-Certified Surgeons · 5,000+ Happy Patients");
    - the "… | Board-Certified Surgeons" title suffix (D4: new titles ship with each rebuild);
    - the blog CTA block ("5,000+ Happy Patients");
    - the shared fear-busters block ("Double Board-Certified surgeons … 5,000+ procedures");
    - the `WeeklyPayments` table ($27–$69/week on 11 landing pages);
    - `llms.txt` and `llms-full.txt`, which still name the American Board of Plastic Surgery, "5,000+" and an accredited facility;
    - the `/faqs` answer "Is your surgical facility accredited? Yes."
- **Owner questions.** The "20% off" on the sheet is still open, so these are
  list prices, as on BBL and liposuction. The live announcement bar reads
  "20% OFF September Sign & Save", which may be what the handwritten note
  refers to. What a price includes, and whether a mommy makeover is priced as
  the sum of its parts less the combination discount, are also open. Until
  the practice answers, the mommy makeover shows only its parts' prices, with
  no total and no paid-landing "Starting at".
- The "Jennifer M., Mother of 3" testimonial on `/mommy-makeover-consultation`
  is not a synced Google review. Keep it only if the practice can source it.
