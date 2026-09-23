# Liposuction blog cluster: Phases 0 and 1

From the liposuction blog review of 2026-09-22 (SEO, AEO, GEO and
cannibalization across the 25 liposuction posts). Phase 0 holds autopilot off
the posts and fixes the procedure page's links. Phase 1 folds 8 posts, so 25
become 17. Phase 2 (rewriting the 17 to `lipo.facts.ts`) and Phase 3 (blog
template and pipeline) are separate work.

## Run order

Production writes go through you: `psql "$POSTGRES_URL_PROD" -X -v ON_ERROR_STOP=1 -f <file>`.
Every file was applied to a clone of production taken 2026-09-23 first, and
each refuses to run twice.

| When                     | File                          | What it does                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Now                      | `sql/01-hold-autopilot.sql`   | Dismisses the 27 pending refresh candidates on the liposuction posts (plus the affordable and feed-the-fat posts) and deletes working copy `46f18133`. The 60-day cooldown keeps them out of the queue until 2026-11-22. Backup: `sql/01-working-copy-backup.json`.                                              |
| After 01, optional       | `sql/02-resume-autopilot.sql` | Restarts autopilot: acknowledges the two failures of 2026-09-12 and closes the refresh run still marked `running` since 2026-09-13. Skip it to keep autopilot paused.                                                                                                                                            |
| Before the deploy        | `sql/03-merge-and-links.sql`  | Merges the three folded posts that carry useful content into their survivors (massage, swelling timeline, tummy tuck vs liposuction FAQs) and repoints links to folded posts in two more survivors. Guarded by the md5 of each post, so an edit made after the build fails the run instead of being overwritten. |
| Deploy                   | this branch's PR              | 16 redirects (each post at `/slug` and `/blog/slug`), 2 older aliases repointed, sitemap exclusions, registry.                                                                                                                                                                                                   |
| After the deploy is live | `sql/04-delete-folded.sql`    | Deletes the 8 folded posts. Its header lists the `curl` checks to run first. Rebuild the backup right before (below).                                                                                                                                                                                            |

After 03 and after 04, revalidate `blog-posts`, `sitemap-urls` and each post
the file names:

```bash
bash implementation-plans/2026-09-22-lipo-blog-cluster/revalidate.sh blog-posts sitemap-urls blog-post-<slug> ...
```

## Rebuilding the SQL against production

`build_sql.py` reads the rows it edits from the database it is given. Rebuild
against production right before running 03 or 04, and diff:

```bash
cd implementation-plans/2026-09-22-lipo-blog-cluster
python3 build_sql.py "$POSTGRES_URL_PROD" /tmp/lipo-prod-sql
diff sql/03-merge-and-links.sql /tmp/lipo-prod-sql/03-merge-and-links.sql
cp /tmp/lipo-prod-sql/04-folded-backup.json sql/   # the backup must come from production
```

## The fold

| Folded (308 from)                                            | To                                          | Content kept                                                 |
| ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------ |
| `/when-to-start-lymphatic-massage-after-lipo`                | `/how-many-massages-after-lipo-360`         | session, who shouldn't have it, choosing a therapist, 2 FAQs |
| `/blog/liposuction-recovery-time-miami`                      | `/how-to-reduce-swelling-after-liposuction` | the week-by-week timeline, rebuilt on sourced figures, 1 FAQ |
| `/what-is-the-difference-between-tummy-tuck-and-liposuction` | `/blog/tummy-tuck-vs-liposuction`           | 3 FAQs                                                       |
| `/blog/liposuction-candidate-miami`                          | `/procedures/liposuction-miami`             | answered by the page's candidacy section                     |
| `/blog/liposuction-miami-post-pregnancy-guide`               | `/procedures/liposuction-miami`             | none (VASER and $2,500 claims)                               |
| `/blog/liposuction-miami-moms-tips`                          | `/procedures/liposuction-miami`             | none (linked three competitor clinics)                       |
| `/how-to-maintain-liposuction-results`                       | `/procedures/liposuction-miami`             | answered by "Does the fat come back?"                        |
| `/blog/liposuction-vs-breast-augmentation-miami`             | `/procedures/mommy-makeover-miami`          | none (combination intent)                                    |

The merges are deliberately narrow. They carry over what the folded post had
that the survivor lacked, bring the survivor's timings into line with
`lipo.facts.ts` where the merge would otherwise contradict it (swelling peaks
at 48 hours, not 72), and replace the "board-certified surgeons" and
accreditation lines with the one-surgeon statement. They do not settle the
massage protocol (owner question 1). That, new titles and the full rewrite are
Phase 2.

## Baseline (`baseline/`)

For the day-28/56/90 reads. All Search Console figures come from the API on
`sc-domain:alluringplasticsurgery.com` with `dataState: all`.

- `pages-2026-09-22.csv`: the 31 pages of the cluster. Impressions, clicks and
  position for 23 Jun–20 Sep, 24 Mar–21 Jun and 20 May 2025–20 Sep 2026.
- `query-page-180d-2026-09-22.csv`: query × page rows for those pages,
  24 Mar–20 Sep. Named queries only; anonymized queries are why page totals
  are larger.
- `weekly-blog-vs-site.json`: `[week, lipo blog impressions, lipo blog clicks,
lipo blog position, site impressions]`, the chart in the review.
- `perplexity-panel-2026-09-22.json`: the 15 prompts, answers and cited URLs
  (sonar API, one run each, no location). Alluring was cited on 6 of 15, and on
  0 of the 4 buying prompts.

Targets at day 90 after Phase 1: split queries (180-day method) 83 → under 25;
the massage guide top 5 for "when to start lymphatic massage after lipo";
rewritten posts' CTR 0.88% → 1.2% at the same positions; Perplexity 10 of 15,
with at least one buying prompt; 0 conflicting figures across liposuction
pages. Read the cluster against the rest of the blog, not in absolute terms:
the site-wide decline since April keeps moving the totals.
