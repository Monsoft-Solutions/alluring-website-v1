# #354 production runbook

Rehearsed 2026-10-26 on a fresh restore of the 2026-10-25 production dump: migration 0060, then steps 3 to 6. Every set applied with 0 failures. The resulting posts, featured images, chat config, gallery text, image text and author bio are byte-identical to the worktree database.

This replays, on production, exactly what the worktree database `alluring_wt_feat_site_claims_canon_354` was put through. That database is a prod clone of 2026-10-25. Each step needs the user's OK first.

C = ~/monsoft/projects/alluring/claims-354 (the edit sets and SQL; kept outside the repo because the edit files hold full post bodies)

0. **Before anything:** confirm that autopilot or refresh hasn't rewritten posts since 2026-10-25. Run the dry run in step 4: any `base_sha` mismatch names the posts that drifted.
1. **Migration 0060** (pricing tables plus the price-sheet seed). Run `pnpm db:check:prod`, then `pnpm db:migrate:prod`. Verify there are 59 `price_line` rows, 14 `procedure_pricing` rows and 1 `pricing_settings` row.
2. **Deploy** the merged PR with `/deploy`.
    - The code reads tokens and the pricing tables.
    - Posts still hold typed text at this point, so they render exactly as before.
3. **Token conversion replay** (10 posts): `cd apps/admin && POSTGRES_URL=<prod> pnpm exec tsx scripts/claims-post-edits.ts apply $C/edits0 --replay`. Do the dry run first, then `--write`.
    - It replays exactly the typed-price-to-token conversion the worktree got.
    - Don't re-run `claims:convert-posts`: its matching changed after review, and the edit sets below were checked against the replayed text.
    - Each content edit's `old` is the full production body, so any drift fails the step.
4. **Post edits**, in order. Each set runs with the dry run first, then `--write`:
    - `POSTGRES_URL=<prod> pnpm exec tsx scripts/claims-post-edits.ts apply $C/edits-final` (132 posts)
    - `... apply $C/edits2-final` (25 posts: first pass of image removals; `why-do-bbl-stink` is deliberately excluded)
    - `... apply $C/edits3-final` (31 posts: second pass of image removals)
    - Any file that FAILs on `base_sha` means that post changed in production. Re-run that post's rewrite against production text; don't force it.
5. **Featured images**: `psql "$POSTGRES_URL_PROD" -v ON_ERROR_STOP=1 -f $C/sql/featured-swaps.sql`. Each update is guarded by the old image id.
6. **Site text and chat agent**:
    - `docs/claims/sql/2026-10-25-chat-config-canon.sql`
    - `$C/sql/db-site-text.sql`
    - `$C/sql/db-gallery.sql`
    - `$C/sql/db-images.sql`

    Every statement is guarded by `old value =`, so a drifted row is a no-op. Check the row counts.

7. **Revalidate** the web app: the blog tags, `pricing`, and the gallery paths. The admin's revalidate endpoint does this, and so does one save on the Pricing page.
8. **Verify live:**
    - curl `/llms.txt` and `/llms-full.txt`.
    - Load 10 posts and grep for `[[` (expect none) and for the forbidden patterns.
    - Check the chat agent's answer to "how much is a BBL" and "who is the surgeon".
    - Search Console: request indexing for the retitled posts.
