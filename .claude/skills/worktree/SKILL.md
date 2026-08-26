---
name: worktree
description: Create an isolated git worktree for a GitHub issue — its own branch, dev ports, env files, node_modules and (optionally) its own database. Use when the user says "start issue #N", "spin up a worktree", "work on #N in parallel", or before running /tackle.
argument-hint: <issue-number>
---

# Create Worktree

One worktree per issue. Each gets its own directory, ports, env files and
dependencies, so several issues can be developed — and their dev servers run —
side by side without touching the main checkout.

## 1. Derive the branch name from the issue

**Never pass the bare issue number as the branch name.** Fetch the title first:

```bash
gh issue view <issue-number> --json title,labels --jq '{title: .title, labels: [.labels[].name]}'
```

Build `<type>/<short-slug>-<issue-number>`:

| Issue kind                   | Prefix                                 |
| ---------------------------- | -------------------------------------- |
| New capability               | `feat/`                                |
| Bug / regression             | `fix/`                                 |
| Perf, SEO, refactor, cleanup | `perf/`, `seo/`, `refactor/`, `chore/` |

Example: #200 "Perf phase 3 — hero & LCP: one video, not two" →
`perf/hero-lcp-single-video-200`.

## 2. Create it

```bash
pnpm worktree <branch-name> <issue-number>
```

Options:

```bash
pnpm worktree <branch> <issue> --base master     # branch from something else
pnpm worktree <branch> <issue> --db clone        # own database (see below)
pnpm worktree <branch> <issue> --editor cursor   # cursor | code | zed
pnpm worktree <branch> <issue> --no-open         # don't launch an editor
```

The script:

1. Allocates a free port pair from 3110 (`web`, `admin`) — the main checkout keeps 3100/3105
2. Fetches `origin/<base>` and creates the branch + worktree at `../alluring-website-1-wt-<branch>`
3. Copies the gitignored local config: `apps/web/.env.local`, `apps/web/.env.production`,
   `apps/admin/.env`, `apps/admin/.env.local`, `packages/db/.env.local`, `.mcp.json`,
   `.claude/settings.local.json` — the pre-push hook runs `lint + typecheck + build`, and
   that needs every one of them
4. Copy-on-write clones `node_modules` (near-instant on APFS, near-zero extra disk), then
   reconciles with `pnpm install`
5. Provisions the database (`--db`, below)
6. Writes `.worktree-meta` — branch, issue, ports, database, ownership. `pnpm dev` reads it
7. Symlinks the Claude Code memory directory to the main repo's, so memories are shared
8. Writes `.issue.md` (number, URL, title) and assigns the issue to you on GitHub

Then, inside the worktree:

```bash
cd ../alluring-website-1-wt-<branch>
pnpm dev        # picks up the worktree's own ports automatically
```

## 3. Database

`--db reuse` (**default**) — share the local dev database. Right for the common
case: frontend, content, SEO, copy. Never dropped on removal.

`--db clone` — copy `alluring-autopilot-dev` into `alluring_wt_<branch>`, apply
pending migrations, and mark it owned so removal drops it. **Use this whenever the
issue touches `packages/db/schema`, migrations, seeds, or destructive queries** —
the shared dev database holds real blog posts and `db:seed` wipes them.

Re-provision an existing worktree from inside it:

```bash
pnpm worktree:db --db clone
```

Every path here is localhost-only. Production is never touched; `db:migrate:prod`
stays a deliberate, separate command run from the main checkout.

## 4. Then work the issue

Open the worktree and run **`/tackle`** — it reads `.issue.md`, pulls the full
issue context, plans, implements, reviews and ships.

## Listing and removing

```bash
pnpm worktree:list                  # branch, issue, ports, db, dirty state, PR state
pnpm worktree:list --prune          # also clear stale git refs
pnpm worktree:remove <branch>       # safe removal, run from the MAIN checkout
```

Removal refuses to delete a worktree with unmerged commits or uncommitted changes
unless a human types `confirm` (`--confirm-unmerged` for scripted use), and drops
a database only when the worktree owns it. Shared and reserved databases are
hard-guarded. After removal, delete the merged branch: `git branch -d <branch>`.
