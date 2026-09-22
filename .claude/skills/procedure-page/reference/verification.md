# Verification

All of it runs before the PR, and the PR lists each check with its result.
Report failures as failures, with the output.

## 1. Build and static checks

```bash
git branch --show-current                     # right branch? other sessions switch it
env -u ANTHROPIC_API_KEY pnpm --filter web build
pnpm --filter web typecheck
pnpm --filter web lint
npx prettier --check <changed files>
pnpm size:check                               # first-load JS vs apps/web/size-budget.json
```

An empty `ANTHROPIC_API_KEY` in the environment breaks builds; the `env -u`
prefix is required. A transient Google Fonts fetch error in Turbopack
("next/font/google … Can't resolve") passes on retry. Say so if it happens.

The local build reads the local database (`apps/web/.env.local`, a copy that
goes stale), so gallery and review content can differ from production.
`NEXT_PUBLIC_ALLOW_CRAWLING=false` locally makes every robots tag `noindex`
and empties sitemaps. For robots or sitemap checks, build with
`NEXT_PUBLIC_ALLOW_CRAWLING=true` in the process environment.

## 2. The copy sweep

```bash
pnpm --filter web check:procedure-copy --slug <slug>            # must be clean
pnpm --filter web check:procedure-copy --slug <slug> --launch   # clean: no placeholders
pnpm --filter web check:procedure-copy --slug <slug> --map      # figure → fact → source table, for the PR
```

It reads `.next/server/app/procedures/<slug>.html` (or `--url` against a
running server): body, alt text, head and the page's own JSON-LD nodes. Fix the copy or the facts file,
never the sweep, unless the sweep is wrong; then fix it for every page and
say why. The expected warning is the landing page dropping the price FAQs.

## 3. Other surfaces

Serve the build: `cd apps/web && npx next start -p <port>` (the worktree's
port is in `.worktree-meta`), in the background.

- `/landing/procedure/<slug>`: 200; FAQ count = page FAQs minus the ones the
  sweep says it drops; hero image and stats read the new data.
- `/llms.txt`, `/llms-full.txt`: the new summary, benefits, stats and FAQs;
  no retired copy; no credential wording the page wouldn't use.
- JSON-LD: exactly one `<script type="application/ld+json">` with the
  page's `@graph` (count tags, not strings: the RSC payload repeats them).
  Check the `Person` node, `bodyLocation`, `howPerformed` (no `..`), the
  `Service` name (no "Miami in Miami"), the `Offer` range, and a real
  `dateModified`.
- Served HTML **including the RSC payload**: grep for other procedures'
  prices and figures; none may appear.
- One template page (for example `/procedures/facelift-miami`) still renders
  and is unchanged apart from intended shared fixes. When the PR touches
  shared code (graph util, section primitives, registry, procedure types),
  save that page's prerendered HTML from a base build first and `diff` it.

## 4. Browser pass

Render in **chrome-devtools with an `isolatedContext`** (a subagent using
Playwright would share and hijack the page). The Chrome extension's viewport
is ~600 px, too narrow for desktop checks. Screenshots save only inside the
worktree: use `.playwright-mcp/` (gitignored) and delete them after.

At **390 × 844** and **1440 × 900** (and one pass at 1024):

- First screen matches the blueprint (H1, lede naming the surgeon, trust row,
  chips, both buttons, virtual consultation link).
- No horizontal scroll (`document.documentElement.scrollWidth` ≤ viewport).
- Sticky bar hidden over the hero, visible mid-page, hidden over the form.
- Console: no hydration errors or 404s from the page.
- `prefers-reduced-motion: reduce` (emulate): everything visible, nothing
  moves.
- The signature scene reads correctly with and without scroll timelines.

Measure, and put the numbers in the PR next to the old page's:

```js
;() => {
    const top = (selector) => {
        const el = document.querySelector(selector)
        return el
            ? Math.round(el.getBoundingClientRect().top + window.scrollY)
            : null
    }
    return {
        firstResult: top('#results'),
        firstFormField: top('#quick-quote input, #book input'),
        bookForm: top('#book'),
        pageHeight: document.documentElement.scrollHeight,
        pageWidth: document.documentElement.scrollWidth,
    }
}
```

(`window.scrollTo` needs `behavior: 'instant'` in chrome-devtools, or it
reports 0.)

## 5. Performance and accessibility

`lighthouse_audit` (mobile) on the served build: LCP ≤ 2.5 s, CLS ≤ 0.1,
accessibility ≥ 95. Check the HTML size of the page (raw and gzip) against
the old page's; most of it is copy and the RSC payload.

## 6. Self-review

Run [review mode](review-mode.md) on your own build before asking for the
PR, and `/code-review` on the diff. Fix every before-merge item.

## 7. Clean up

Stop `next start`, delete screenshots, and close the pages you opened.
Leave `apps/web/next-env.d.ts` alone if the build touched it.
