# CLAUDE.md

**Alluring Plastic Surgery - Technical & Business Guide**

---

## Business Context

**Business**: Alluring Plastic Surgery — luxury cosmetic surgery clinic.

**Location**: Miami, FL. Serves South Florida locals plus patients flying in from other **US states**.

**Market scope is the United States only.** Do not describe the practice as serving Latin America, the Caribbean or "international" patients — not in copy, metadata, `areaServed` structured data, or the `llms*.txt` routes. Spanish-language content (`/consulta-gratis`, the Spanish FAQ) exists for Spanish speakers **within** the US, not for cross-border patients.

**We do not coordinate travel.** No flights, lodging, transport or airport pickup, and no affiliation with any recovery house or recovery suite. What the practice provides is clinical: confirmed surgery, pre-op and follow-up dates in writing, and how many nights a patient needs to stay in Miami before being cleared to fly home. Do not reintroduce "concierge" travel claims.

**Tagline**: "Luxury Surgeries Made Affordable"

**Industry**: Elective cosmetic procedures. High-consideration, research-heavy purchase cycle.

**Primary Audience**: Women 25-55, value quality, seek affordability, 60%+ mobile users.

**Sales Model**: Consultation-first. Every page drives to booking. No fluff.

---

## Design Philosophy

### World-Class Design — No AI Slop

We create **immersive, distinctive experiences** that feel luxurious yet accessible.

**We Are**:

- UX-first, conversion-focused
- Distinctive, not template-driven
- Immersive (sticky heroes, video backgrounds, glassmorphism)
- Mobile-optimized

**We Avoid**:

- Generic fonts (Inter, Roboto, Arial)
- Overused purple gradients
- Cookie-cutter layouts
- Bland color schemes

### Visual Identity

| Element               | Value                                          |
| --------------------- | ---------------------------------------------- |
| **Primary Palette**   | Stone (`stone-50`, `stone-900`)                |
| **Accent**            | Gold (`gold-500`, `gold-400`)                  |
| **Headings**          | Serif font (`font-serif`)                      |
| **Body**              | Sans-serif (`font-sans`)                       |
| **Signature Pattern** | Glassmorphism (`bg-white/80 backdrop-blur-xl`) |

---

## SEO & Performance (Critical)

### SSR-First Architecture

**All marketing content MUST be server-rendered.**

| Requirement       | Implementation                              |
| ----------------- | ------------------------------------------- |
| Server Components | Default — no `'use client'` for content     |
| CSS Animations    | Use `animate-fade-in-up`, `animate-delay-*` |
| Semantic HTML     | `article`, `section`, `ol`, proper headings |
| Accessibility     | `aria-labelledby`, `aria-label`, alt text   |
| Visible Content   | No `opacity: 0` initial states              |

### Client Components — Only When Needed

- Interactive forms
- Carousels with user controls
- Modals/dialogs
- Real-time booking widgets

---

## Source of Truth

**Site Config**: `apps/web/lib/data/site-config.ts`

Contains: phone, address, hours, social links, SEO defaults.

```tsx
import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'
```

**Do not hardcode business information.**

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                           |
| CSS        | Tailwind CSS v4                                   |
| UI Library | shadcn/ui (New York style)                        |
| Icons      | Lucide React                                      |
| Animations | CSS-first, Framer Motion for complex interactions |

---

## Layout Patterns

### 1. Marketing Pages (Home, Procedures, Financing)

```tsx
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
```

### 2. Content Pages (Blog, Legal)

```tsx
import { ContainerLayout } from '@/components/container-layout.component'
```

---

## Shared Components

**Always check `@/components/shared` before building new components.**

Key components: `SectionHeader`, `CTASection`, `FeatureCard`, `ImageSection`, `Gallery`, `MobileCallButton`

```tsx
import { CTASection, SectionHeader } from '@/components/shared'
```

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm size:check   # First-load JS vs apps/web/size-budget.json (run after a build)
pnpm analyze      # Per-route module graphs -> apps/web/.next/diagnostics/analyze/
pnpm dlx shadcn@latest add <name> -c apps/web  # Add shadcn component
```

**Bundle size is a CI gate** (issue #202). `size:check` reads the prerendered
HTML and fails on a first-load JS regression past `apps/web/size-budget.json`.
Raising a budget is allowed when justified — say why in the PR.

`analyze` runs `next build --experimental-analyze`, Turbopack's own analyzer. On
Next 16.0.10 it writes machine-readable `analyze.data` per route rather than a
browsable report — there is no HTML viewer yet. Do **not** reach for
`@next/bundle-analyzer` instead: it is a webpack plugin, and on a Turbopack build
it prints a warning and generates nothing.

---

## Database & Migrations

Local is the default target; production is always an explicit, separate
command (issue #186).

```bash
pnpm db:generate       # after editing a schema file
pnpm db:migrate        # apply to the LOCAL database
pnpm db:check:prod     # is production behind?
pnpm db:migrate:prod   # apply to Supabase (confirms the host first)
```

**Migrations go through the tool.** Applying schema changes by hand with
psql is what left production seven migrations behind its journal; that
workaround is retired. `db:seed` and `db:push` are hard-blocked from any
non-localhost database. The DigitalOcean database is retired — do not
reintroduce it. See `packages/db/README.md`.

---

## Working an Issue (worktrees)

One issue, one worktree. Each worktree is a sibling directory with its own
branch, dev ports, env files, dependencies and — on request — its own database,
so several issues can be built and run side by side without touching the main
checkout.

```bash
pnpm worktree <branch-name> <issue-number>   # create (derive the branch from the issue title)
pnpm worktree:list                           # branch, issue, ports, db, dirty state, PR
pnpm worktree:remove <branch-name>           # safe removal, from the MAIN checkout
```

Then, inside the worktree: `pnpm dev` (it reads its own ports from
`.worktree-meta`) and `/tackle` to work the issue end to end — issue context,
plan, implement, verify, review, browser pass, commit + PR.

Database: `--db reuse` (default) shares the local dev database; `--db clone`
gives the worktree its own copy and points every app at it. **Use `--db clone`
for anything touching schema, migrations, seeds or destructive queries** — the
shared dev database holds real blog posts.

Skills: `worktree` (create) and `tackle` (work it). Scripts live in `scripts/`.

---

## AI Model Routing

**All inference goes through OpenRouter** (issue #195) — one API key
(`OPENROUTER_API_KEY`), one namespace, one billing surface. The direct
`@ai-sdk/anthropic` / `@ai-sdk/openai` provider paths are retired; do not
reintroduce them. `getModel` accepts any `vendor/model` id from
https://openrouter.ai/models; bare legacy ids are translated by `LEGACY_ID_MAP`
in `packages/ai/src/models/model-resolver.util.ts`.

Each blog pipeline phase has its own model **and** its own reasoning effort,
configured in the admin at **Blog → Settings** and stored in `blog_ai_config`
(epic #194). Effort uses OpenRouter's own scale —
`none · minimal · low · medium · high · xhigh`.

`none` is the default everywhere and emits **no** `providerOptions` key at all.
That is deliberate: sending `none` explicitly _disables_ reasoning on models
that think by default, so omitting it is what keeps behaviour unchanged. Raise
effort one phase at a time in production, extraction first and reviews last —
the seven review agents multiply both cost and the #191 schema-failure risk.

---

## Search Console Data

Live Google Search Console data is available to agents through the
`search-console` MCP server — what the site ranks for, which queries drive which
pages, where CTR is weak, which topics have demand but no page.

**Use it before writing or revising content.** Keyword choices should come from
what the site is actually found for, not from guesswork.
`.claude/skills/search-console/SKILL.md` maps questions to tools.

The data layer is shared: `packages/seo/src/search-console` backs both this
server (`packages/mcp-gsc`) and the admin dashboard's
`/api/admin/search-console/*` routes, so both read the same numbers. The tools
are read-only.

Requires `pnpm build` — `.mcp.json` runs the compiled output, and a stale
`dist/` keeps serving old tools.

---

## Specialized Agents

| Task        | Agent                         |
| ----------- | ----------------------------- |
| UI/Design   | `@agent-ui-ux-designer`       |
| SEO Content | `@agent-seo-content-expert`   |
| Engineering | `@agent-software-engineer`    |
| TypeScript  | `@agent-typescript`           |
| Testing     | `@agent-unit-testing-agent`   |
| Images      | `@agent-image-creator-expert` |

**Blog posts are NOT created via agents or seed files.** The blog content pipeline lives in the admin panel (`apps/admin` → Blog → Pipeline), powered by `packages/ai`. See `implementation-plans/2026-08-11-blog-content-pipeline-v2.md` for the pipeline architecture and roadmap. Never run `pnpm db:seed` against a database containing real blog posts.
