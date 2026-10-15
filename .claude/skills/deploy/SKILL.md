---
name: deploy
description: Ship what is merged on master to production on Vercel (website and admin). Shows the commits going out, checks CI and pending database migrations, asks for the go-ahead, moves the production branch to master, then watches both builds until they are live. Also rolls production back. Use when the user says "deploy", "ship it", "push to production", "release", "roll back production", or "/deploy".
argument-hint: [rollback]
---

# Deploy

Production deploys are manual. Merging to `master` only builds a **preview**.
Both Vercel projects use **`production`** as their Production Branch, so a
deploy is a fast-forward of that branch to `master`. Vercel builds it from
GitHub; nothing is uploaded from this machine.

| Project                     | Root         | Production URL                         |
| --------------------------- | ------------ | -------------------------------------- |
| `alluring-website-v1-web`   | `apps/web`   | https://www.alluringplasticsurgery.com |
| `alluring-website-v1-admin` | `apps/admin` | https://admin.alluringmiami.com        |

Both projects build on every push to `production`. The admin's crons run only
on its production deployment.

**Never run `vercel deploy --prod`.** It uploads the local working tree,
uncommitted files included, and skips git. Never push anything to
`production` except a commit that is already on `master`.

## 1. What is going out

```bash
git fetch origin
git log --oneline --no-merges origin/production..origin/master
git diff --stat origin/production origin/master
```

Empty log → nothing to deploy; say so and stop. If `origin/production` is not
an ancestor of `origin/master` (`git merge-base --is-ancestor origin/production origin/master`
fails), production was rolled back or pushed by hand: stop and ask.

## 2. Pre-flight

- **CI on the master head is green**:
  `gh run list --branch master --workflow ci.yml --limit 1`. Red or still
  running → tell the user; don't deploy over a red build without their say-so.
- **The master preview built** in both projects:
  `vercel list alluring-website-v1-web --cwd apps/web -m githubCommitSha=$(git rev-parse origin/master)`
  (same with `alluring-website-v1-admin --cwd apps/admin`). An Error status
  means production will fail too.
- **Migrations.** If the diff touches `packages/db/migrations/`, run
  `pnpm db:check:prod`. If production is behind, the migrations must be
  applied with `pnpm db:migrate:prod` **before** the push (the new code
  expects the new schema). Ask before running it; additive migrations are
  safe to apply first, destructive ones (drops, renames) need a plan from the
  user.
- **New env vars.** Grep the diff for new `env` keys (`apps/*/env.ts`,
  `process.env.`). Any key missing from the Vercel project
  (`vercel env ls production --cwd apps/web`) must be added first.

## 3. Ask

Show the user: the commit list, CI status, migrations (none / applied /
pending), env changes, and which apps change (`apps/web`, `apps/admin`,
`packages/*` = both). Deploy only on an explicit yes for **this** set of
commits.

## 4. Push

```bash
SHA=$(git rev-parse origin/master)
git push origin "$SHA:refs/heads/production"
```

A plain push — it is a fast-forward. If git rejects it as non-fast-forward,
stop and ask; never force. The repo's pre-push hook runs `turbo lint` and the
package builds first, which takes a few minutes; let it finish.

## 5. Watch

For each project, find the production deployment of `$SHA` (it can take ~30s
to appear) and wait for it:

```bash
vercel list alluring-website-v1-web --cwd apps/web --environment production -m githubCommitSha=$SHA
vercel inspect <deployment-url> --cwd apps/web --wait --timeout 15m
```

Builds take ~2–4 minutes. If one fails, read `vercel inspect <url> --logs`,
report the error, and leave the previous deployment serving (Vercel only
switches traffic on success).

## 6. Verify

- `curl -sI https://www.alluringplasticsurgery.com` → 200, and
  `curl -sI https://admin.alluringmiami.com` → 200/307 (login redirect).
- `vercel inspect https://www.alluringplasticsurgery.com --cwd apps/web`
  shows the new deployment.
- Spot-check one page the release changed.

Report: commits shipped, deployment URLs, and anything the user should watch.

## Rollback (`/deploy rollback`)

Fastest: Vercel's instant rollback to the previous production deployment, per
affected project:

```bash
vercel list alluring-website-v1-web --cwd apps/web --environment production   # pick the previous Ready one
vercel rollback <previous-deployment-url> --cwd apps/web --yes
```

Instant rollback pauses auto-assignment of production. After the fix is merged
and deployed with this skill, re-enable it with
`vercel promote <new-deployment-url> --cwd apps/web --yes`. Leave `production`
in git as it is; the next deploy fast-forwards it past the fix. Rolling back
does not undo database migrations.
