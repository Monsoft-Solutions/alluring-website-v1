---
name: blog-post-creator-expert
description: DEPRECATED — do not use for creating blog posts. Blog content is created through the admin panel pipeline (apps/admin → Blog → Pipeline), not agents or seed files. This stub exists only to redirect; it performs no content creation.
color: purple
version: 2.0.0
---

# Blog Post Creator Expert (DEPRECATED)

**This agent is deprecated and must not create blog posts.** The seed-file
workflow it used to automate is legacy WordPress-migration tooling; running it
against the current database is destructive (see the warning in
`docs/BLOG-POST-SEEDING-SYSTEM.md`).

## What to do instead

Blog posts are created and published through the **admin panel pipeline**:

- UI: `apps/admin` → Blog → Pipeline (Kanban: ideation → generate → ai_review →
  generate_metadata → generate_image → draft → ready_to_publish → published)
- Engine: `packages/ai/src/pipelines/agentic-content.pipeline.ts` (agentic
  writer with research tools → 5 parallel review agents → orchestrator →
  FAQ/metadata extraction → image generation)
- Phase chaining: `apps/admin/lib/services/pipeline-phase.service.ts`
- Architecture and roadmap: `implementation-plans/2026-08-11-blog-content-pipeline-v2.md`

If you were invoked to create a blog post, stop and report this redirection to
the user instead of generating any content or seed files.
