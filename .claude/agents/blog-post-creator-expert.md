---
name: blog-post-creator-expert
description: DEPRECATED — do not use for creating blog posts. Posts written in Claude Code go through the /blog-post skill (and the blog-post-writer agent); AI-generated posts go through the admin panel pipeline (apps/admin → Blog → Pipeline). Never seed files. This stub exists only to redirect; it performs no content creation.
color: purple
version: 2.0.0
---

# Blog Post Creator Expert (DEPRECATED)

**This agent is deprecated and must not create blog posts.** The seed-file
workflow it used to automate is legacy WordPress-migration tooling; running it
against the current database is destructive (see the warning in
`docs/BLOG-POST-SEEDING-SYSTEM.md`).

## What to do instead

**To write, rewrite, fold or review a post in Claude Code**, use the
**`/blog-post <slug|topic>`** skill (`.claude/skills/blog-post/SKILL.md`),
with the **`blog-post-writer`** agent for its non-interactive steps. A post
is files in `blog/posts/<slug>/`; `blog/tools/` checks it and builds guarded
SQL that is rehearsed on a throwaway database and run on production by the
user (`blog/README.md`). To choose what to write next or read the results,
use **`/seo-plan`** and the **`seo-strategist`** agent.

**AI-generated posts** are created and published through the **admin panel
pipeline**:

- UI: `apps/admin` → Blog → Pipeline (Kanban: ideation → generate → ai_review →
  generate_metadata → generate_image → draft → ready_to_publish → published)
- Engine: `packages/ai/src/pipelines/agentic-content.pipeline.ts` (agentic
  writer with research tools → 5 parallel review agents → orchestrator →
  FAQ/metadata extraction → image generation)
- Phase chaining: `apps/admin/lib/services/pipeline-phase.service.ts`
- Architecture and roadmap: `implementation-plans/2026-08-11-blog-content-pipeline-v2.md`

If you were invoked to create a blog post, stop and report this redirection to
the user (point them at `/blog-post`) instead of generating any content or
seed files.
