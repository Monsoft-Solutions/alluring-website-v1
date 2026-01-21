---
# Blog Area Implementation Plan

Date: 2025-10-15
Owner: Software Architect
Status: Draft
---

## Executive Summary

Implement a performant blog area in the Next.js (App Router) app with:

- Server-rendered initial page loading 12 published posts (card fields only)
- Infinite scroll pagination fetching subsequent pages via API routes
- Server-rendered blog post pages with Markdown content rendering
- Dedicated category and tag listing pages, plus filters
- Clean separation of concerns (queries, types, handlers) following repository conventions

The plan emphasizes a minimal viable path while leaving room for incremental enhancements.

## Technical Analysis

- Monorepo with `apps/web` (Next.js 15), `packages/db` (Drizzle + Postgres), `packages/ui`, `packages/seo`.
- Blog schema already exists in `@workspace/db`:
    - `blog_post` (slug, title, excerpt, content, status, published_at, author_id, featured_image_id, …)
    - `blog_category`, `blog_post_category` (many-to-many)
    - `blog_tag`, `blog_post_tag` (many-to-many)
    - `author`, `images`
- Target pages:
    - `app/blog/page.tsx` → initial 12 posts on server
    - `app/[slug]/page.tsx` → server-rendered post at root level (matches WordPress structure)
    - `app/blog/categories/page.tsx` + `app/blog/categories/[slug]/page.tsx`
    - `app/blog/tags/page.tsx` + `app/blog/tags/[slug]/page.tsx`
- Data access via `@workspace/db` Drizzle queries. Keep queries small for card payloads.
- Markdown: use `remark/rehype` based renderer (e.g., `next-mdx-remote` or `remark-parse + rehype-stringify`), start with lightweight stack.
- SEO: leverage `@workspace/seo` for metadata and JSON-LD where relevant.

## Dependencies & Prerequisites

- Ensure database has published sample data (`packages/db/src/seed`).
- Add content rendering deps to `apps/web`:
    - `remark`, `remark-parse`, `remark-gfm`, `rehype`, `rehype-raw`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight` (or shiki if preferred later).
- Optional later: `next-mdx-remote` if MDX is needed; for now, pure Markdown → HTML.

## Architecture Overview

- Data layers
    - `packages/db`: Drizzle tables already defined.
    - `apps/web/app/api/blog/*`: API routes for pagination JSON responses.
    - `apps/web/lib/blog/*.query.ts`: server-side query utilities (card list, post by slug, categories, tags).
    - `apps/web/types/blog/*.type.ts`: exported narrow types for UI consumption.
- UI layers
    - `apps/web/app/blog/*`: route segments and pages.
    - `apps/web/components/blog/*`: `PostCard.component.tsx`, `PostList.component.tsx`, `PostMarkdown.component.tsx`, `Filters`.
- Pagination strategy
    - Server renders first 12 (SSR). Client fetches `/api/blog/posts?cursor=...&pageSize=12`.
    - Use cursor based on `(published_at DESC, id DESC)` to ensure stable ordering.

## Implementation Phases

### Phase 1 — Query utilities and types (DONE)

- Objective: Minimal, efficient queries that return only necessary fields.
- Deliverables:
    - `apps/web/lib/queries/blog/post-list.query.ts`
    - `apps/web/lib/queries/blog/post-detail.query.ts`
    - `apps/web/lib/queries/blog/taxonomy.query.ts`
    - `apps/web/lib/types/blog/post-card.type.ts`, `post-detail.type.ts`, `taxonomy.type.ts`
- Notes:
    - Card fields: id, slug, title, excerpt, publishedAt, readingTime, featured image minimal (url, alt), primary author name.
    - Only include `content` in detail query.

### Phase 2 — Blog index page (SSR initial 12) (DONE)

- Objective: `/blog` server page that renders 12 posts from server queries.
- Deliverables:
    - `apps/web/app/blog/page.tsx` (server component)
    - `apps/web/components/blog/PostCard.component.tsx`
    - `apps/web/components/blog/PostList.component.tsx`
- Validation:
    - Renders 12 posts, stable order by publishedAt DESC then id DESC.

### Phase 3 — Infinite pagination via API (DONE)

- Objective: Client-side pagination fetching JSON.
- Deliverables:
    - `apps/web/app/api/blog/posts/route.ts` (GET) with `pageSize` and `cursor` params
    - Simple client hook: `apps/web/hooks/useInfiniteBlogPosts.hook.ts`
    - Integrate intersection observer in `/blog` page to auto-load more
- Criteria:
    - Returns next slice and nextCursor; no duplicates; handles end-of-list.

### Phase 4 — Post detail page with Markdown (SSR) (DONE)

- Objective: `/{slug}` renders server-side with Markdown content (root-level URL matches WordPress structure).
- Deliverables:
    - `apps/web/app/[slug]/page.tsx` (handles blog posts at root level)
    - `apps/web/components/blog/PostMarkdown.component.tsx` with remark/rehype pipeline
    - Optional `TableOfContents` later
- Criteria:
    - Fast render; only Markdown for `content`.

### Phase 5 — Categories & Tags pages (DONE)

- Objective: Index and detail pages for taxonomies.
- Deliverables:
    - `apps/web/app/blog/categories/page.tsx` + `[slug]/page.tsx`
    - `apps/web/app/blog/tags/page.tsx` + `[slug]/page.tsx`
- Criteria:
    - Index lists all active categories/tags with counts.
    - Detail filters posts by category/tag using the same card query + pagination API (with filter param).

### Phase 6 — SEO metadata & structured data

- Objective: Basic SEO integration.
- Deliverables:
    - Use `@workspace/seo` to set `metadata` for blog index and posts
    - Add WebPage/Article JSON-LD in detail pages
    - Use cache for the DB queries, so we don't duplicate the db requests

### Phase 7 — Performance, accessibility, and DX polish (initial)

- Objective: Ensure good UX without overcomplication.
- Deliverables:
    - Image components with `next/image` and blurDataURL when available
    - Skeleton/loading states for infinite list
    - Keyboard focus and headings hierarchy

## Folder Structure (proposed)

```
apps/web/
  app/
    blog/
      page.tsx
      [slug]/page.tsx
      categories/
        page.tsx
        [slug]/page.tsx
      tags/
        page.tsx
        [slug]/page.tsx
    api/
      blog/
        posts/route.ts
  components/
    blog/
      PostCard.component.tsx
      PostList.component.tsx
      PostMarkdown.component.tsx
  hooks/
    useInfiniteBlogPosts.hook.ts
  lib/
    blog/
      post-list.query.ts
      post-detail.query.ts
      taxonomy.query.ts
  types/
    blog/
      post-card.type.ts
      post-detail.type.ts
      taxonomy.type.ts
```

## Configuration Changes

- `apps/web/package.json`: add markdown-related dependencies.
- Consider adding route segment `generateMetadata` for blog index and post detail.

## Risk Assessment

- Markdown XSS risk: sanitize output (rehype-sanitize) or restrict raw HTML.
- Pagination consistency: use composite cursor (publishedAt, id) to avoid duplicates.
- N+1 queries for taxonomies: prefer joins and select minimal columns.
- Large content rendering: defer heavy transformers; cache if needed later.

## Success Metrics

- Blog index initial render < 200ms TTFB on server (local dev target).
- Smooth infinite scroll with no jank and zero duplicates.
- Post page Lighthouse (Performance ≥ 90, Accessibility ≥ 95).
- Unit test coverage ≥ 80% for new libs and handlers.

## Implementation Details (concise)

- Query: filter `status = 'published'` and `published_at IS NOT NULL`, order by `published_at DESC, id DESC`.
- Card select: `id, slug, title, excerpt, published_at, reading_time, featured_image(url, alt), author(name)`.
- Detail select: card select + `content`, categories, tags.
- API contract `/api/blog/posts`:
    - Input: `cursor` (base64 of `{publishedAt, id}`), `pageSize` (default 12), optional `categorySlug`, `tagSlug`.
    - Output: `{ items: PostCard[], nextCursor?: string }`.

## Unit Testing Phase

- Framework: Vitest in `apps/web` for lib and API.
- Tests:
    - Query utils: ordering, filters, limits, cursors
    - API route: pagination behavior, filter handling, edge cases
    - Markdown renderer: safe rendering with sample content
- Coverage: ≥ 80% for new code; include CI step.
- File org: `*.test.ts` alongside query files and API route tests under `__tests__`.

## Documentation Phase

- Add `/docs/blog/` with:
    - Overview of routes, data flow, and APIs
    - Usage examples for hooks and components
    - SEO configuration notes
    - Troubleshooting pagination
- Update navigation and index.

## References

- Next.js App Router docs
- Drizzle ORM docs
- Remark/Rehype ecosystem
- Cursor project rules: `software-arquitect`, `typescript`
