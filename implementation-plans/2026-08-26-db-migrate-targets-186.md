# Migration targets: local by default, Supabase on purpose (closes #186)

**Date:** 2026-08-26
**Status:** Proposed (every claim below re-verified against `master` @ `5442097` and the live databases on 2026-08-26)
**Issue:** [#186 `db:migrate` targets an abandoned database, and the live journal is 5 migrations behind](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/186) — `high-priority`. Supersedes #168 (closed as duplicate 2026-08-26).

**Goal:** make `pnpm db:migrate` a tool you can trust. It runs against the **local** database by default; a separate, explicit `pnpm db:migrate:prod` runs against Supabase. The DigitalOcean database is dead and every reference to it leaves the repo. Both live databases get their drizzle journals reconciled with reality, so the next additive column ships through the tool instead of through psql.

---

## 0. Current state (verified 2026-08-26)

### Where the tooling points versus where the data lives

| Env file                                 | Target                                           | Who actually reads it                            | State                                          |
| ---------------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
| `packages/db/.env.local`                 | DigitalOcean `db-postgresql-nyc3-85766…`         | **nothing** — but this is what `db:migrate` uses | **dead**, per the user's call this session     |
| `apps/admin/.env`, `apps/web/.env.local` | Supabase `vnaasoiomrhqnhlsohpf` (pooler `:6543`) | both deployed apps                               | **live production** — 167 posts, 155 published |
| `apps/admin/.env.local`                  | `localhost:5432/alluring-autopilot-dev`          | admin in `pnpm dev` (`.env.local` beats `.env`)  | **the real local dev DB** — 170 posts          |

`packages/db/.env.local` already carries all three URLs, two commented out. Switching targets today means editing the comment markers — the folk knowledge #186 objects to. Its commented "local" line points at `allruing-website-v2` (51 posts, journal stalled at 2026-01-27), which is _not_ the database the admin app reads locally — a second trap sitting inside the first.

### Journal state on each database

The migrator's rule (verified in `drizzle-orm/pg-core/dialect.js:57-67`): it reads **only the single newest row** of `drizzle.__drizzle_migrations`, then applies every journal entry whose `when` is greater than that row's `created_at`, wrapping each in a transaction and inserting a row after.

| Database                             | Journal rows | Newest `created_at`          | Local journal                      | Gap                              |
| ------------------------------------ | ------------ | ---------------------------- | ---------------------------------- | -------------------------------- |
| Supabase (prod)                      | 44           | `1769538429749` ≈ 2026-01-27 | 51 entries, newest `1786575821279` | **7 unrecorded** — `0044`–`0050` |
| `alluring-autopilot-dev` (local)     | —            | —                            | same                               | **no `drizzle` schema at all**   |
| `allruing-website-v2` (local, stale) | 47           | 2026-01-27                   | same                               | abandoned                        |

The local dev DB was restored from a `public`-schema-only dump, so it carries the full current schema and none of the bookkeeping. Running `db:migrate` against it today would try to replay `0000` onward against a populated database and die on the first `CREATE TABLE`.

On Supabase the failure is the one in the issue: the newest recorded row predates `0044`, so the migrator starts there and hits

```
PostgresError: relation "blog_ai_config" already exists
```

`#186` documented **five** unrecorded migrations. It is now **seven** — `0049` and `0050` (the entire schema for epic #144) were applied by hand since the issue was filed. The issue's own prediction, that the next person to add a column would hit the same wall, has come true twice.

### Both databases are genuinely current

Verified by column presence, not by assumption — this is what makes the backfill bookkeeping rather than a cover-up:

| Check                                                                       | Supabase | local dev |
| --------------------------------------------------------------------------- | -------- | --------- |
| `blog_ai_config` table (`0044`)                                             | present  | present   |
| `blog_ai_config.extraction_model_id` / `.ideation_model_id` (`0045`/`0046`) | present  | present   |
| `autopilot_run` + `blog_post.idea_approval` (`0047`)                        | present  | present   |
| `blog_post.quick_answer` (`0048`)                                           | present  | present   |
| `content_refresh.workflow_run_id` / `.outcome` (`0049`)                     | present  | present   |
| `blog_post_revision.secondary_keywords` (`0050`)                            | present  | present   |

### The hash algorithm is confirmed, not guessed

`drizzle-orm/migrator.js:16-24`: `hash = sha256(raw .sql file contents)`, `created_at = journal entry's when`. Validated end-to-end against a row Supabase already holds:

```
0043_flat_bill_hollister
  computed  c2f5e8e506d941a988c7500361eff9d4583bc03b98b0c7fe3768ccd08aebaf42
  recorded  c2f5e8e506d941a988c7500361eff9d4583bc03b98b0c7fe3768ccd08aebaf42   when=1769538429749
```

The five hashes recorded in #186 for `0044`–`0048` still match their files byte for byte, so nothing has been edited since. `0049` and `0050` hash to `de55564f842fa67f…` and `9b17e7333e8cae06…`.

### Other relevant facts

- `packages/db/src/env.ts` loads dotenv **without** `override`, so a shell `POSTGRES_URL` already wins. That is today's undocumented workaround.
- `src/migrate.ts` redundantly calls `dotenv.config()` twice on top of what `env.ts` already did.
- `.gitignore:41-42` already reserves `packages/db/.env.development` and `packages/db/.env.production` — a convention nobody has used yet.
- `turbo.json` `db:*` tasks are all `cache: false`, so env declarations there affect nothing but tidiness.
- Nothing applies migrations on deploy. Vercel runs `next build`; `apps/admin/vercel.json` holds crons only.
- `CLAUDE.md` warns "Never run `pnpm db:seed` against a database containing real blog posts" — in prose, with nothing enforcing it.

---

## 1. Decisions

1. **DigitalOcean leaves the repo.** Its URL comes out of `packages/db/.env.local` and every doc reference. _Deleting the DigitalOcean instance itself is an infra action outside this PR_ — flagged in §6 as a follow-up for the user.
2. **`db:migrate` defaults to local, and "local" means `alluring-autopilot-dev`** — the same database `apps/admin/.env.local` uses. Local dev and local migrations must not disagree about which database is "local"; the stale `allruing-website-v2` reference is dropped.
3. **Production is a separate, named command.** `pnpm db:migrate:prod`, never a flag on the default one, never an ambient env var. Explicitness is the entire point of the issue.
4. **One env file, two keys.** `packages/db/.env.local` keeps `POSTGRES_URL` (local) and gains `POSTGRES_URL_PROD` (Supabase). Rejected the `.env.production` file variant: a second gitignored file is a second thing to forget on a fresh clone, and the failure mode — prod creds silently missing — is worse than one file with two clearly-named keys.
5. **The prod URL uses the session pooler (`:5432`), not the transaction pooler (`:6543`).** Transaction pooling breaks postgres-js prepared statements and is already known-bad here for `pg_dump`. The target resolver **refuses** a prod URL on `:6543` with a message naming the fix rather than failing obscurely mid-migration.
6. **Prod runs require a typed confirmation** of the target host, with `--yes` for non-interactive use. A prod migration is not something you should be able to trigger by arrow-up.
7. **`db:push` and `db:seed` get a hard localhost guard with no override flag.** Both rewrite data wholesale; `db:seed` against Supabase would wipe 155 published posts. A policy in CLAUDE.md that nothing enforces is not a control.
8. **Journal reconciliation is bookkeeping and is scripted, not hand-typed.** A `db:baseline` command derives hashes from the files themselves — a hardcoded hash table in a doc is a thing that drifts. It requires an explicit `--through <tag>` so the operator asserts what is applied, and it is dry-run by default.
9. **The baseline script stays in the repo** rather than being deleted after use. Every future local clone restored from a prod dump lands in exactly the state `alluring-autopilot-dev` is in now — schema without journal — and will need it.
10. **No automatic migration on deploy.** Vercel builds run in parallel and would race; auto-migrating on every preview build against prod is worse than the problem. Instead §2.7 adds a read-only drift check you run before deploying, and §6 leaves CI wiring as a separate decision.

---

## 2. Work breakdown

All changes are confined to `packages/db`, the two root manifests, and docs. **No app code, no schema change, no generated migration.**

### 2.1 Target resolution — `packages/db/src/db-target.ts` (new)

```ts
export type DbTargetName = 'local' | 'prod'

export type DbTarget = {
    name: DbTargetName
    url: string
    /** host:port/database, for printing — never the credentials */
    label: string
    isLocal: boolean
}

export function resolveTarget(name: DbTargetName): DbTarget
export function parseTargetFlag(argv: string[]): DbTargetName // --target, default 'local'
```

Behaviour:

- `local` → `env.POSTGRES_URL`. Throws if the host is not `localhost`/`127.0.0.1`, naming the configured host — a misconfigured "local" pointing at Supabase is the exact accident this issue exists to prevent.
- `prod` → `env.POSTGRES_URL_PROD`. Throws a setup message if unset. Throws if the port is `6543`, telling the operator to use `5432`.
- `label` is parsed out of the URL with `new URL()` and never includes the password.

### 2.2 `packages/db/src/env.ts`

Add `POSTGRES_URL_PROD: z.url().optional()` to the server schema. Leave the dotenv loading as-is — a fresh clone with no prod credentials must still be able to run everything local.

### 2.3 `packages/db/src/migrate.ts` — rewrite

- Resolve the target from `--target` (default `local`); print `→ migrating <label>` before touching anything.
- For `prod` without `--yes`: read the target's database host from stdin and require an exact match before proceeding.
- Read the newest journal row before and after, and report **which** migrations ran (tag list), not just "completed". Today's script says `✅ Migrations completed` whether it applied twelve migrations or none.
- Exit `0` with `nothing to apply` when the journal is current — this is the acceptance condition, so it needs its own unambiguous output.
- Drop the two redundant `dotenv.config()` calls; `env.ts` has already loaded by import time.

### 2.4 `packages/db/src/baseline.ts` (new) — journal reconciliation

`pnpm db:baseline --through <tag> [--target local|prod] [--apply]`

1. Read `migrations/meta/_journal.json`; hash each entry's `.sql` with sha256.
2. Read every existing row from `drizzle.__drizzle_migrations` (creating neither schema nor table — if the schema is absent, say so and let `--apply` create it exactly as the migrator would).
3. **Refuse** if any journal entry _newer_ than `--through` is already recorded — that means the operator's mental model is wrong, and inserting under it would be worse than stopping.
4. Print the insert set as a table: idx, tag, `when`, short hash, and whether it is already recorded.
5. Without `--apply`, stop there. With `--apply`, insert the missing rows in journal order inside one transaction.

Idempotent by construction: rows already present are skipped, so a second run is a no-op.

### 2.5 Local-only guard — `packages/db/src/assert-local.ts` (new)

Resolves the default target and exits non-zero with a plain-language message when the host is not local. Wired as a prefix, so the guard cannot be bypassed by calling the underlying tool through the package script:

```jsonc
"db:push": "tsx src/assert-local.ts && drizzle-kit push",
"db:seed": "tsx src/assert-local.ts && tsx src/seed/index.ts",
```

`db:studio` stays ungated — reading prod through Studio is legitimate — but gains a printed target label so nobody edits production believing it is local.

### 2.6 Script and task wiring

`packages/db/package.json`:

| Script                       | Command                                      | Target                 |
| ---------------------------- | -------------------------------------------- | ---------------------- |
| `db:generate`                | `drizzle-kit generate`                       | none (diffs files)     |
| `db:migrate`                 | `tsx src/migrate.ts`                         | **local**              |
| `db:migrate:prod`            | `tsx src/migrate.ts --target prod`           | Supabase, confirmed    |
| `db:baseline`                | `tsx src/baseline.ts`                        | local                  |
| `db:baseline:prod`           | `tsx src/baseline.ts --target prod`          | Supabase               |
| `db:check` / `db:check:prod` | `tsx src/migrate.ts --check [--target prod]` | read-only drift report |
| `db:push`                    | guarded                                      | local only             |
| `db:seed`                    | guarded                                      | local only             |
| `db:studio`                  | `drizzle-kit studio`                         | local, labelled        |

Root `package.json` gains matching `turbo … --filter=@workspace/db` passthroughs for `db:migrate:prod`, `db:baseline`, `db:baseline:prod`, `db:check`, `db:check:prod`. `turbo.json` gains those tasks with `"cache": false, "outputs": []`, and `POSTGRES_URL_PROD` joins `POSTGRES_URL` in the `build`/`dev` env lists for consistency.

### 2.7 `--check` mode (drift detection)

`migrate.ts --check` resolves the target, compares the newest recorded `created_at` against the newest journal entry, and exits non-zero when the database is behind, printing the pending tags. No writes, no confirmation prompt. This is what you run before a deploy, and what a future CI job would call.

### 2.8 Documentation

- **`packages/db/README.md`** — replace the Setup and Scripts sections. Both env keys with the `:5432` note and why; the two migrate commands; the baseline procedure for a freshly restored clone; the local-only guard on push/seed; an explicit "DigitalOcean is retired" line so a returning reader does not resurrect it.
- **`packages/db/.env.example`** — both keys, prod commented, with the session-pooler note inline.
- **`CLAUDE.md`** — a short **Database & migrations** section: local is the default, prod is a named command, generated migrations go through `db:migrate` and no longer through psql. This replaces the standing psql workaround.

Historical plan documents (`2026-08-11-autopilot-epic-122.md`, `2026-08-12-refresh-loop-epic-144.md`) keep their "#168 unresolved, apply by hand" notes — they are records of what was true then, not instructions.

---

## 3. The one-time reconciliation

Run **after** the PR merges, in this order. Each step is verified before the next.

### 3.1 Local `alluring-autopilot-dev` — full baseline

No `drizzle` schema exists, so all 51 entries are recorded at once. Safe because §0 verified the schema is current through `0050`.

```bash
pnpm --filter @workspace/db db:baseline -- --through 0050_plain_toro          # dry run
pnpm --filter @workspace/db db:baseline -- --through 0050_plain_toro --apply
pnpm db:migrate        # expect: nothing to apply
```

### 3.2 Production Supabase — 7 rows

```bash
pnpm --filter @workspace/db db:baseline:prod -- --through 0050_plain_toro     # expect exactly 7 inserts
pnpm --filter @workspace/db db:baseline:prod -- --through 0050_plain_toro --apply
pnpm --filter @workspace/db db:check:prod    # expect: up to date
```

Expected insert set — the script derives these itself; the table is here so the output can be eyeballed against it:

| idx | tag                        | `when`        | sha256 (first 16)  |
| --- | -------------------------- | ------------- | ------------------ |
| 44  | `0044_premium_falcon`      | 1786469089636 | `dc114bb66c6a4ee7` |
| 45  | `0045_huge_impossible_man` | 1786472463790 | `700115bc6fb2261e` |
| 46  | `0046_mixed_nick_fury`     | 1786479022806 | `fd766fef59d832cc` |
| 47  | `0047_sturdy_taskmaster`   | 1786485046744 | `4971f5ca2cd5665c` |
| 48  | `0048_gifted_purifiers`    | 1786553683782 | `a389c6ab72114b54` |
| 49  | `0049_gifted_junta`        | 1786571115891 | `de55564f842fa67f` |
| 50  | `0050_plain_toro`          | 1786575821279 | `9b17e7333e8cae06` |

Inserting rows into `drizzle.__drizzle_migrations` touches no application data, but it is a write to production: take the usual pre-write dump first, consistent with the `0049` procedure.

**Executed 2026-08-26.** Both dumps taken (`supabase-drizzle-pre-baseline-20260826.dump`, `supabase-public-pre-baseline-20260826.dump`), all nine schema objects re-verified present, 7 rows recorded, `db:check:prod` reports `51 recorded, 51 in the journal`, 0 duplicate timestamps.

The dry run earned its keep: it first proposed **9** rows, not 7. `0018_early_red_shift` and `0025_square_sentinel` were already recorded at their correct timestamps but under _different hashes_ — both `.sql` files were edited after they ran, in December 2025. Matching recorded rows by hash read them as unrecorded and would have inserted duplicates. A migration's identity is its timestamp (that is what the migrator's own resume rule compares), so `baseline.ts` now matches on `when` and reports hash drift as a warning instead of trying to "fix" it. The two drifted files are left exactly as they are: the database records what actually ran.

### 3.3 Retire the strays

- Remove the DigitalOcean URL from every developer's `packages/db/.env.local` (the repo copy is gitignored, so this is a per-machine edit the README now documents).
- Leave `allruing-website-v2` alone; it is simply no longer referenced.

---

## 4. Acceptance

The issue's own bar, made concrete:

1. `pnpm db:migrate` with no arguments reports the **local** target by name and applies nothing (both databases current).
2. `pnpm db:migrate:prod` refuses to run without confirmation, then reports up-to-date.
3. A newly generated migration applies **through the tool**: add a throwaway nullable column to a schema file → `pnpm db:generate` → `pnpm db:migrate` → column exists locally, one new journal row → revert the schema change, drop the column and the row.
4. `pnpm db:seed` and `pnpm db:push` exit non-zero when `POSTGRES_URL` is pointed at a non-local host.
5. `pnpm db:migrate:prod` with `POSTGRES_URL_PROD` on `:6543` fails immediately with the port message, not mid-migration.
6. `pnpm db:check:prod` exits non-zero against a deliberately un-baselined copy.

Gate: `pnpm lint`, `pnpm typecheck`, `pnpm build` (prefix with `env -u ANTHROPIC_API_KEY`).

---

## 5. Risks

| Risk                                                                                                                                                | Mitigation                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baselining a database that is **not** actually current marks real DDL as applied; the gap resurfaces later as a runtime `column "x" does not exist` | `--through` forces the operator to assert a bound; dry-run is the default; §0's column-presence checks are the evidence, re-run before applying; the script refuses when anything past `--through` is already recorded |
| A developer's stale `.env.local` still points `POSTGRES_URL` at DigitalOcean or Supabase, so "local" commands hit a remote database                 | `resolveTarget('local')` throws on a non-local host — the default command fails loudly instead of migrating the wrong database                                                                                         |
| Prod URL on the transaction pooler fails obscurely mid-run                                                                                          | Resolver refuses `:6543` up front with the fix in the message                                                                                                                                                          |
| The confirmation prompt makes prod migrations annoying enough that someone reaches for psql again                                                   | `--yes` exists for scripted use, and the README documents it — the friction is one line, not a workflow                                                                                                                |
| `db:seed`'s new guard blocks a legitimate seed of a remote scratch database                                                                         | Accepted. Seeding is local-only by policy (CLAUDE.md); a remote scratch DB can be seeded by pointing `POSTGRES_URL` at a local proxy or by lifting the guard in a deliberate one-off commit                            |
| Nothing still applies migrations on deploy — a shipped schema change can lag its code                                                               | Out of scope by decision §10; `db:check:prod` gives a pre-deploy answer, and §6 raises the CI question separately                                                                                                      |

---

## 6. Delivery and open questions

One PR, branch `fix/db-migrate-targets-186`, title `fix(db): default migrations to local, add explicit prod target (closes #186)`.

**Files touched:** `packages/db/src/{db-target,migrate,baseline,assert-local,env}.ts`, `packages/db/package.json`, `packages/db/README.md`, `packages/db/.env.example`, root `package.json`, `turbo.json`, `CLAUDE.md`. No migration generated; no app code.

**Two things that are yours to call, not the PR's:**

1. **Delete the DigitalOcean instance?** The repo stops referencing it either way. Destroying it is an infra action and needs your confirmation — and a final dump if the 49-post legacy copy has any archival value.
2. **Should CI check prod schema drift?** `db:check:prod` makes it a one-line job, but it means putting the Supabase URL in GitHub secrets. Worth doing, worth deciding separately.
