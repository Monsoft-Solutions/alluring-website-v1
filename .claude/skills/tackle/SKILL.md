---
name: tackle
description: Work a GitHub issue end to end inside its worktree — read the issue, plan, implement, verify, review, test the UI, then commit and open the PR. Use after the worktree skill, or whenever the user says "tackle #N", "work this issue", or "/tackle".
argument-hint: [issue-number]
---

# Tackle Issue

The full lifecycle for one issue, run from inside its worktree.

**Run this from the worktree, not the main checkout.** Confirm first:

```bash
pwd && git branch --show-current
```

If you're in `alluring-website-1` (the main checkout) on `master`, stop and run the
`worktree` skill instead — sessions share the main tree and switching its branch
under another session is how work gets lost.

---

## Phase 1 — Bootstrap

### 1. Resolve the issue number

In priority order:

1. **Branch name** — trailing digits: `perf/hero-lcp-single-video-200` → `200`
2. **`.issue.md`** in the worktree root — line 1 number, line 2 URL, line 3 title
3. **Ask** — "I couldn't find an issue number in the branch name or `.issue.md`. Which issue are we working on?"

### 2. Print the link immediately

```
Working on [#<n>: <title>](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/<n>)
```

### 3. Pull the full context

```bash
gh issue view <n> --json title,body,comments,labels,milestone --repo Monsoft-Solutions/alluring-website-v1
```

Read the body **and every comment** — scope changes, rejected approaches and
schema decisions usually live in the comments, not the description.

Then check for a written plan:

```bash
ls implementation-plans/ | tail -20
grep -rln "#<n>\|<key phrase from the title>" implementation-plans/ docs/ 2>/dev/null
```

Epics in this repo generally have a plan doc in `implementation-plans/`. If one
exists, it — not the issue body — is the source of truth for sequencing.

### 4. Recall what's already known

Read `MEMORY.md` in the project memory directory and any linked memory that
matches the issue's area. Known traps worth confirming before you plan:

- Empty `ANTHROPIC_API_KEY` breaks admin builds → prefix build/dev commands with `env -u ANTHROPIC_API_KEY`
- Blog content lives in the admin pipeline, never in seeds or agents; `pnpm db:seed` wipes real posts
- Migrations go through `pnpm db:migrate` (local) / `pnpm db:migrate:prod` (Supabase) — never psql by hand
- Market scope is **US only**, and the practice **does not coordinate travel** (see `CLAUDE.md`)

### 5. Plan, and get approval

Enter plan mode with the issue body, comments and plan doc folded together.
State explicitly which files you expect to touch and which of the gates in
Phase 2 will run. **Wait for approval before writing code.**

---

## Phase 2 — Implement

### 6. Build it

Follow `CLAUDE.md`: server components by default, CSS animations over JS,
semantic HTML, `@/components/shared` before new components, `site-config.ts` as
the only source of business facts. Stone + gold, serif headings, glassmorphism —
never generic template layouts.

Keep it linear in this session for the ordinary case. Only decompose when the
approved plan says the slice is large (≳8 files across ≥3 layers), and then run
stages **sequentially** — types → db → services → api → components → pages —
never two writers in one tree at once.

Schema work: `pnpm db:generate` after editing a schema file, then `pnpm db:migrate`
against the worktree's own database (`--db clone`). Never `db:push` or `db:seed`
against a database holding real content.

### 7. Verify (loop until green)

This is the same gate the pre-push hook enforces, so it has to pass anyway:

```bash
env -u ANTHROPIC_API_KEY pnpm lint
env -u ANTHROPIC_API_KEY pnpm typecheck
env -u ANTHROPIC_API_KEY pnpm build
pnpm format
```

On failure, read the output, fix only what it points at, re-run. Stop and surface
the blocker if two consecutive attempts make no progress. Turbo caches, so
re-runs after a small fix are cheap.

---

## Phase 3 — Review & test (not optional)

### 8. Code review

Run `/code-review` on the diff. For a change that spans > ~8 files, or touches
auth, the contact/API routes, migrations, or anything public-facing, raise the
effort level.

Triage every finding rather than blind-applying:

- **Fix now (default)** — anything real and in scope, including cheap mechanical wins
- **Defer** — legitimate but out of this change's scope; file a follow-up issue, never drop silently
- **Dismiss** — false positive or intentional; say why in one line

Loop at most 3 rounds, gating on confirmed high-severity findings. Stop and hand
back if the count stops decreasing.

### 9. UI verification (when the diff renders anything)

```bash
git diff --name-only origin/master...HEAD | grep -E 'apps/(web|admin)/(app|components)/|packages/ui/|\.css$'
```

If it matches, run `pnpm dev` and check the affected pages in the browser at the
worktree's own port (see `.worktree-meta`), at **both** 390px and desktop width.
60%+ of this site's traffic is mobile — a desktop-only pass is not a pass. Check
the console for hydration errors on the pages you touched.

If nothing matches, say "No UI files changed — skipping the browser pass."

### 10. SEO check (when content or metadata changed)

For changes to page copy, metadata, structured data, sitemap or `llms*.txt`:
confirm titles/descriptions/canonicals are intact, headings still form one H1 +
ordered H2s, and no copy claims travel coordination or a market outside the US.

---

## Phase 4 — Ship

### 11. Summarize

```
## Summary
**Issue:** #<n> — <title>
**Files changed:** <count>
**Gates:** lint ✓  typecheck ✓  build ✓
**Review:** <n> findings — <fixed / deferred / dismissed>
**UI:** desktop ✓  mobile 390px ✓  (or: skipped, no UI files)

### Changes
- <what changed, in the verbs of the work>

### Deferred
- <finding> → follow-up issue #<n>  (omit if none)
```

### 12. Commit and open the PR

Ask before shipping: _"Ready to ship. Commit and open the PR?"_

On confirmation run the `commit-commands:commit-push-pr` skill. The PR body must
close the issue — `Closes #<n>` — and name the verification actually performed.

### 13. Clean up after the merge

Once the PR is merged, from the **main checkout**:

```bash
pnpm worktree:remove <branch>
git branch -d <branch>
```

If the issue surfaced something another session shouldn't have to rediscover —
a trap, a decision, a non-obvious constraint — write it to project memory before
you finish.
