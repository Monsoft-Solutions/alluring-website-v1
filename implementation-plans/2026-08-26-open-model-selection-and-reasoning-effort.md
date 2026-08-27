# Open Model Selection + Per-Phase Reasoning Effort — Implementation Plan

**Date:** 2026-08-26 (revised same day: OpenRouter-exclusive routing + AI SDK v7 prerequisite)
**Status:** Proposed (all file/line claims verified against `master` @ `bf1401a`; catalog claims verified against a live `openrouter.ai/api/v1/models` pull on 2026-08-26)
**Area:** `apps/admin` Blog AI Settings, `packages/ai` model layer, `packages/db` `blog_ai_config`
**Builds on:** epic #122 (Autopilot), epic #144 (refresh loop), the existing `blog_ai_config` singleton
**Epic:** [#194](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/194)
**Blocked by:** [#195](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/195) — AI SDK v7 upgrade + OpenRouter consolidation (§P0, split out because it is the highest-risk piece and touches customer-facing chat)
**Related open issue:** #191 (review phase parks posts on schema errors)

**North star:** the blog pipeline's model choice stops being a curated code constant. Every model call goes through OpenRouter. An admin opens Blog AI Settings, searches the **live catalog of 416 models**, picks one per phase, and picks how hard that model should think — with the reviews and the orchestrator configured independently.

---

## 0. Decisions (locked 2026-08-26)

| Decision              | Choice                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Provider routing**  | **OpenRouter exclusively.** The direct `@ai-sdk/anthropic` and `@ai-sdk/openai` provider paths are retired for all `packages/ai` inference. One API key, one namespace, one billing surface, one place to change models.           |
| **AI SDK version**    | **Upgrade to `ai@7` first.** We are a full major behind on every package (§1.1). The official `@openrouter/ai-sdk-provider@3.0.0` requires `ai@^7.0.0` — this is a hard prerequisite, not an optional cleanup.                     |
| **OpenRouter client** | **Official `@openrouter/ai-sdk-provider`**, replacing today's `createOpenAI({ baseURL })` shim. Gives typed `providerOptions.openrouter.reasoning.effort`, usage accounting (real cost per call), and `models[]` fallback routing. |
| Model catalog source  | **Live fetch of `https://openrouter.ai/api/v1/models`** (416 models, public endpoint, no key needed), normalized, cached 12 h, with a checked-in snapshot as cold-start fallback. `AVAILABLE_MODELS` stops driving the picker.     |
| Catalog filtering     | Hide `:batch` variants (60 — async semantics, wrong for a synchronous pipeline). Show `:free` variants (17) behind a rate-limit warning.                                                                                           |
| Effort vocabulary     | **OpenRouter's own scale, verbatim:** `none · minimal · low · medium · high · xhigh`. No custom vocabulary, no per-provider mapping table — OpenRouter translates effort to each vendor's native knob server-side.                 |
| Effort granularity    | **Five independent slots**: ideation, content, **reviews (shared by all 7 agents)**, **orchestrator/editor**, extraction. Reviews and the orchestrator get their _own_ model + effort pair — today they share one column.          |
| Image helper models   | In scope: `imagePromptModelId` (+ effort) for the featured-image prompt / concept / option-selection calls, and `imageAltModelId` for alt text. The **fal.ai render model stays a separate, unchanged field**.                     |
| Reach                 | Kanban pipeline **plus** Autopilot (ideation + content jobs) **plus** the refresh loop. Chat / analysis / SEO functions inherit the OpenRouter switch but keep their own model constants — no effort control in v1.                |
| Stored-id migration   | Existing bare ids are rewritten to OpenRouter ids by an **explicit mapping table**, not a prefix rule — `claude-haiku-4-5` → `anthropic/claude-haiku-4.5` (dashes become dots), while `gpt-4.1` → `openai/gpt-4.1`. See R3.        |
| Default effort        | `none` everywhere, so the config migration is behaviour-neutral. Effort is raised phase-by-phase in production after the code lands.                                                                                               |

---

## 1. What exists today (verified)

### 1.1 We are a full major version behind on every AI SDK package

| Package                       | Declared  | Latest     | Gap              |
| ----------------------------- | --------- | ---------- | ---------------- |
| `ai`                          | `^6.0.11` | **7.0.82** | major            |
| `@ai-sdk/anthropic`           | `^3.0.6`  | **4.0.44** | major (retiring) |
| `@ai-sdk/openai`              | `^3.0.4`  | **4.0.49** | major (retiring) |
| `@ai-sdk/provider-utils`      | `^4.0.3`  | **5.0.32** | major            |
| `@ai-sdk/react`               | `^3.0.11` | **4.0.85** | major            |
| `@openrouter/ai-sdk-provider` | _absent_  | **3.0.0**  | new              |

**The v6 → v7 migration surface is much smaller than the version jump suggests**, because the four `packages/ai/src/core/*.core.ts` wrappers absorb most of it. A grep for actual SDK invocations (excluding JSDoc examples) finds **11 call sites**:

`core/generate-text.core.ts:128-129`, `core/generate-object.core.ts:75`, `core/stream-text.core.ts:68`, `core/stream-object.core.ts:55`, `pipelines/generation-phase.runner.ts:250`, `pipelines/agentic-content.pipeline.ts:138`, `agents/orchestrator.agent.ts:542`, `agents/fact-source-verifier.agent.ts:282`, `functions/generate-blog-topics.function.ts:187`, `apps/admin/app/api/chat/route.ts:117`.

Breaking changes that actually touch us:

| v6                       | v7                           | Sites                                                                               |
| ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------- |
| `system:`                | `instructions:`              | 11 (our wrappers keep `system` in their _public_ API — only the inner call renames) |
| `experimental_telemetry` | `telemetry` + `@ai-sdk/otel` | 10                                                                                  |
| `onStepFinish`           | `onStepEnd`                  | 9                                                                                   |
| `onFinish`               | `onEnd`                      | 9                                                                                   |
| `stepCountIs`            | `isStepCount`                | 8                                                                                   |
| `result.fullStream`      | `result.stream`              | 2                                                                                   |
| Node 18/20               | **Node 22+**                 | repo-wide (see R1)                                                                  |
| CJS `require()`          | ESM only                     | none (already `"type": "module"`)                                                   |

Plus `@ai-sdk/react` v3 → v4 for the chat UI: `useChat` appears in 3 real components (`apps/web/components/chat/chat-interface.component.tsx`, `apps/web/components/chat/chat-widget.component.tsx`, `apps/admin/components/chat/chat-test-interface.component.tsx`) and the `apps/web/hooks/chat/*` helpers.

Also in v7: top-level result properties (`content`, `toolCalls`, `usage`) now **aggregate across all steps** rather than reporting the final step. Our pipeline metrics count tool calls via `onStepFinish` accumulators (`agentic-content.pipeline.ts:147`), so they are unaffected — but anything reading `result.usage` must be re-checked against `result.finalStep`.

### 1.2 The OpenRouter plumbing half-exists

`getModel` (`packages/ai/src/models/model-resolver.util.ts:44`) already routes any id containing `/` through a `createOpenAI({ name: 'openrouter', baseURL: 'https://openrouter.ai/api/v1' })` shim, and `isValidModelId` already accepts such ids. The UI exposes this as a free-text "Custom OpenRouter model" input (`apps/admin/components/blog/blog-ai-model-field.component.tsx`). **What is missing is discovery, exclusivity, and effort.**

The shim has a real limitation for this epic: the OpenAI chat model hardcodes `provider: "openai"` when parsing provider options (`@ai-sdk/openai@3.0.4` `dist/index.mjs:669`) and serializes `reasoningEffort` as the top-level `reasoning_effort` (`:720`). OpenRouter's docs document `reasoning: { effort }` and **do not document a `reasoning_effort` alias** — so on the current shim, effort delivery is unverified. The official provider makes it a typed, documented, first-class option. This is the concrete reason the SDK upgrade is a prerequisite rather than a nice-to-have.

### 1.3 Reasoning effort is greenfield

A repo-wide grep for `providerOptions`, `reasoningEffort`, `budgetTokens` returns no production call sites. Nothing to migrate.

Every model call funnels through `CoreBaseOptions` (`packages/ai/src/core/types.core.ts:64`) — `{ modelId?, temperature? }`. Adding one field there reaches ~28 of the 30 generate call sites. Two bypass the wrappers and need hand-patching: `agentic-content.pipeline.ts:138` and `orchestrator.agent.ts:543`.

### 1.4 OpenRouter normalizes effort per vendor — so our mapper collapses to one line

Verified against OpenRouter's reasoning-tokens docs: supported efforts are `max · xhigh · high · medium · low · minimal · none`, and for Anthropic models OpenRouter derives the thinking budget itself as `budget_tokens = max(min(max_tokens × ratio, 128000), 1024)` with ratios from 0.95 (xhigh) down to 0.1 (minimal).

**This deletes the hardest part of the original design.** The first draft of this plan carried a per-family mapper with an Anthropic `budgetTokens` ladder, a `budgetTokens < maxOutputTokens` invariant, and a `suppressesTemperature` rule to dodge Anthropic's 400 when `temperature` and `thinking` are sent together. Routing everything through OpenRouter makes all three OpenRouter's problem. Our mapper becomes:

```ts
effort === 'none'
    ? {}
    : { providerOptions: { openrouter: { reasoning: { effort } } } }
```

### 1.5 Configuration and its ripple

`packages/db/src/schema/blog/blog-ai-config.table.ts` holds `ideationModelId`, `contentModelId`, `reviewModelId`, `extractionModelId` (all `varchar(120)`, default `'claude-opus-5'`), plus `imageModelId`, `artisticStyleId`, and the Autopilot/refresh knobs. The established ripple for a new column: table → `apps/admin/lib/queries/blog-ai-config.query.ts` (type + `DEFAULT_BLOG_AI_CONFIG` + row mapping) → `apps/admin/lib/actions/blog-ai-config.action.ts` (zod + `values`) → `blog-ai-settings-form.component.tsx`.

**The orchestrator is hardwired to the review model.** `packages/ai/src/pipelines/review-phase.runner.ts:321` passes `modelId: reviewModelId` into `runOrchestrator` with the comment "Configured review model drives the orchestrator too".

**Where the configured models are consumed:**

| Phase                | Consumer                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Ideation             | `apps/admin/app/api/blog/generate-topics/route.ts:107`, `apps/admin/lib/services/autopilot.service.ts:361`              |
| Content              | `apps/admin/lib/services/pipeline-phase.service.ts:404`                                                                 |
| Review + orchestrate | `apps/admin/lib/services/pipeline-phase.service.ts:590`                                                                 |
| Extraction           | `apps/admin/lib/services/pipeline-phase.service.ts:740`, `apps/admin/app/workflows/refresh/finalize-refresh.step.ts:91` |
| Image (fal render)   | `apps/admin/lib/services/pipeline-phase.service.ts:910`                                                                 |

**The image helper calls are unconfigurable**, each pinned to a constant: `generate-featured-image-prompt.function.ts:26` → `'gpt-5.2'`; `select-image-options.function.ts:31` → `'gpt-4.1-mini'`; `generate-image-alt.function.ts:15` → `'gpt-4.1-mini'`.

**UI primitives available:** `packages/ui/src/components/` ships `command.tsx` + `popover.tsx` + `badge.tsx`. No new dependency for the combobox.

---

## 2. Architecture

```
                        ┌──────────────────────────────────────────┐
 openrouter.ai/api/v1/models ──▶ │ openrouter-catalog (12 h cache)   │
   416 models, public   │  id · name · context · $in/$out ·  │
                        │  supported_parameters[]            │
                        │  − :batch (60)   ⚠ :free (17)      │
                        └────────────────┬───────────────────┘
                                         │  GET /api/blog/models
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │  Blog AI Settings  (per-phase grid)      │
                        │  ┌──────────────┬──────────┬──────────┐  │
                        │  │ Phase        │ Model ▾  │ Effort ▾ │  │
                        │  ├──────────────┼──────────┼──────────┤  │
                        │  │ Ideation     │ combobox │ none…xhi │  │
                        │  │ Content      │ combobox │ none…xhi │  │
                        │  │ Reviews ×7   │ combobox │ none…xhi │  │
                        │  │ Orchestrator │ combobox │ none…xhi │  │
                        │  │ Extraction   │ combobox │ none…xhi │  │
                        │  │ Image prompt │ combobox │ none…xhi │  │
                        │  │ Image alt    │ combobox │    —     │  │
                        │  └──────────────┴──────────┴──────────┘  │
                        └────────────────┬─────────────────────────┘
                                         │ updateBlogAiConfig()
                                         ▼
                                 blog_ai_config  (+9 cols)
                                         │ getBlogAiConfig()
                   ┌─────────────────────┼──────────────────────┐
                   ▼                     ▼                      ▼
           pipeline-phase        autopilot.service       finalize-refresh
             .service            generate-topics              .step
                   │                     │                      │
                   └─────────────────────┴──────────────────────┘
                                         ▼
                         runXPhase({ modelId, reasoningEffort })
                                         ▼
                   packages/ai/src/core/*   (CoreBaseOptions)
                                         ▼
              effort === 'none' ? {} : { providerOptions:
                  { openrouter: { reasoning: { effort } } } }
                                         ▼
                    @openrouter/ai-sdk-provider  →  ONE provider
                                         ▼
                    OpenRouter normalizes per vendor server-side
                    (Anthropic thinking budget, OpenAI effort, …)
```

---

## 3. Work breakdown

### P0 — AI SDK v7 upgrade + OpenRouter consolidation _(prerequisite — tracked separately as **#195**)_

**Runtime.** Bump `.nvmrc` `20` → `22`, `engines.node` `>=20` → `>=22`, and set the Vercel project's Node version to 22 for both `apps/web` and `apps/admin` **before** merging. AI SDK 7 does not run on Node 20.

**Dependencies.** In `packages/ai/package.json`: `ai` → `^7.0.82`, `@ai-sdk/provider-utils` → `^5.0.32`, add `@openrouter/ai-sdk-provider@^3.0.0` and `@ai-sdk/otel`, **remove** `@ai-sdk/anthropic` and `@ai-sdk/openai`. In `apps/web` and `apps/admin`: `@ai-sdk/react` → `^4.0.85`.

**Renames** across the 11 invocation sites, per the §1.1 table. The core wrappers keep `system` in their public option types — only the inner SDK call renames to `instructions`, so no downstream caller changes.

**Telemetry.** `experimental_telemetry: telemetryConfig` → `telemetry:` with `@ai-sdk/otel` registered once. Note v7 makes telemetry opt-**out** once an integration is registered; confirm the Langfuse exporter (`packages/ai/src/telemetry/`) still receives spans and that `withPhaseSpan` trace links keep working (`LANGFUSE_PROJECT_ID`, epic #155).

**Provider swap.** `packages/ai/src/models/model-resolver.util.ts` becomes:

```ts
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
})
export function getModel(modelId: string): LanguageModel {
    return openrouter.chat(toOpenRouterId(modelId))
}
```

`toOpenRouterId` passes through anything already containing `/` and otherwise looks the id up in `LEGACY_ID_MAP` (§P2), so any bare id still in flight — stored config, a code constant not yet updated — keeps working instead of 404ing.

`supportsTemperature` / `NO_SAMPLING_PARAMS_PREFIXES` can be **deleted**: OpenRouter accepts and drops unsupported sampling params per-vendor. Verify with one live call against a Claude 5 model before removing (R4).

**Chat UI.** Migrate the 3 `useChat` components and the `apps/web/hooks/chat/*` helpers to `@ai-sdk/react@4`, and `apps/admin/app/api/chat/route.ts:117` (`streamText` + `fullStream`) to the v7 result shape.

**Acceptance for P0 on its own:** `pnpm build`, `pnpm typecheck`, `pnpm lint` pass; a manual smoke of one full Kanban pipeline run and one chat conversation succeed; Langfuse still shows spans. **No behaviour change intended.**

> P0 is **issue #195**, not a PR of this epic. It ships alone and sits on `master` for a few days before P1 lands — it touches chat, which is customer-facing. Everything from P1 onward assumes it is merged.

---

### P1 — Reasoning-effort primitives

**New:** `packages/ai/src/models/reasoning-effort.constant.ts`

```ts
export const REASONING_EFFORTS = [
    'none',
    'minimal',
    'low',
    'medium',
    'high',
    'xhigh',
] as const
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number]
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'none'
export function isReasoningEffort(v: unknown): v is ReasoningEffort
```

**New:** `packages/ai/src/models/reasoning.util.ts` — one function, no per-family branching:

```ts
export function reasoningProviderOptions(effort: ReasoningEffort | undefined) {
    return !effort || effort === 'none'
        ? {}
        : { providerOptions: { openrouter: { reasoning: { effort } } } }
}
```

**Changed:** `CoreBaseOptions` gains `reasoningEffort?: ReasoningEffort`; all four core wrappers spread `...reasoningProviderOptions(reasoningEffort)`. Same for the two bypass sites.

**Tests:** the `none`/undefined no-op, each effort's emitted shape, and a guard test asserting no `providerOptions` key is emitted at `none` (feeds acceptance criterion 5).

---

### P2 — Live OpenRouter catalog

**New:** `packages/ai/src/models/openrouter-catalog.ts`

```ts
export type OpenRouterCatalogModel = {
    id: string // 'anthropic/claude-opus-5'
    name: string
    contextLength: number
    promptPricePerM: number | null
    completionPricePerM: number | null
    supportsReasoning: boolean // supported_parameters includes 'reasoning'
    supportsTools: boolean
    supportsStructuredOutputs: boolean
    isFreeVariant: boolean // id ends ':free'
}
export async function fetchOpenRouterCatalog(): Promise<
    OpenRouterCatalogModel[]
>
```

Drops `:batch` ids. Normalizes `pricing.prompt` (a per-token decimal string) to $/1M. Sorts by vendor then name.

**New:** `packages/ai/src/models/legacy-id-map.constant.ts` — the explicit bare-id → OpenRouter-id table. A prefix rule is **wrong**: verified against the live catalog, Claude's dashed point releases become dotted (`claude-haiku-4-5` → `anthropic/claude-haiku-4.5`, `claude-opus-4-5` → `anthropic/claude-opus-4.5`) while the Claude 5 family and every OpenAI id map by plain prefix (`claude-opus-5` → `anthropic/claude-opus-5`, `gpt-4.1-mini` → `openai/gpt-4.1-mini`). A unit test asserts every value in the map is present in the live catalog.

**New:** `packages/ai/src/data/openrouter-catalog-fallback.data.ts` — a checked-in snapshot (~30 popular ids) for cold-start / fetch failure, so the picker is never empty. Refresh is a manual chore, documented in the header.

**New:** `apps/admin/lib/services/openrouter-catalog.service.ts` — `unstable_cache` (tag `openrouter-catalog`, `revalidate: 43_200`), falls back to the snapshot on throw and logs it.

**New:** `apps/admin/app/api/blog/models/route.ts` — `requireAuth`-gated `GET`. One request per settings visit; the client filters locally.

**Retired:** `AVAILABLE_MODELS` stops driving the blog picker. It stays in the codebase only for the non-blog callers that still import it (`DEFAULT_CHAT_MODEL_ID` and friends), with a header comment pointing at the catalog. Retiring it fully is out of scope.

---

### P3 — Schema + config ripple

**Migration `0051_*.sql`** — generated by `pnpm db:generate`, applied via `pnpm db:migrate` then `pnpm db:migrate:prod`. Never by hand (`CLAUDE.md`, #186/#192).

```sql
CREATE TYPE reasoning_effort AS ENUM ('none','minimal','low','medium','high','xhigh');
```

| Column                  | Type                        | Default / null semantics             |
| ----------------------- | --------------------------- | ------------------------------------ |
| `ideation_effort`       | `reasoning_effort NOT NULL` | `'none'`                             |
| `content_effort`        | `reasoning_effort NOT NULL` | `'none'`                             |
| `review_effort`         | `reasoning_effort NOT NULL` | `'none'`                             |
| `orchestrator_model_id` | `varchar(120)` nullable     | `NULL` = inherit `review_model_id`   |
| `orchestrator_effort`   | `reasoning_effort NOT NULL` | `'none'`                             |
| `extraction_effort`     | `reasoning_effort NOT NULL` | `'none'`                             |
| `image_prompt_model_id` | `varchar(120)` nullable     | `NULL` = the function's code default |
| `image_prompt_effort`   | `reasoning_effort NOT NULL` | `'none'`                             |
| `image_alt_model_id`    | `varchar(120)` nullable     | `NULL` = the function's code default |

**Data migration in the same file** — rewrite stored bare ids to OpenRouter ids using the §P2 map, and change the four existing columns' defaults from `'claude-opus-5'` to `'anthropic/claude-opus-5'`:

```sql
UPDATE blog_ai_config SET ideation_model_id = 'anthropic/claude-opus-5' WHERE ideation_model_id = 'claude-opus-5';
-- … repeat per column per mapped id, or a single CASE/JOIN against a VALUES list
```

`toOpenRouterId` in the resolver makes this belt-and-braces rather than load-bearing, but leaving stale ids in the table would make the settings picker show "not in catalog" warnings on a fresh install.

**`blog-ai-config.query.ts`** — extend `BlogAiConfig` and `DEFAULT_BLOG_AI_CONFIG`; resolve `orchestratorModelId: config.orchestratorModelId ?? config.reviewModelId`; narrow effort columns through `isReasoningEffort` with a `'none'` fallback (the same defensive pattern `resolveImageModelId` already uses).

**`blog-ai-config.action.ts`** — `effortSchema = z.enum(REASONING_EFFORTS)`, nullable model fields, extended `values`.

---

### P4 — Settings UI

**New:** `apps/admin/components/blog/model-combobox.component.tsx` — `Popover` + `Command` over the catalog. Each row: `vendor/model` in mono, badges for context window, $/1M in, `⚡ reasoning`, and `⚠ free` for `:free` variants. Typing an unlisted id offers a "Use custom id …" row, preserving the escape hatch. Footer: `Active: <id>`, plus a warning when the configured id is absent from the live catalog (R5).

**New:** `apps/admin/components/blog/effort-select.component.tsx` — six options. Disabled with _"This model has no reasoning parameter."_ when the catalog reports `supportsReasoning: false`; enabled with a softer _"Unverified — effort is sent but may be ignored."_ for custom ids.

**Rewritten:** `blog-ai-settings-form.component.tsx`. The current file carries four `useState` pairs per model field plus four `trimmed*`/`effective*` derivations — that does not scale to seven rows. Collapse to one `useState<BlogAiConfigInput>` with a typed `patch` helper, and render the grid from a declarative array:

```ts
const PHASE_FIELDS = [
    { key: 'ideation', label: 'Ideation', effort: true },
    { key: 'content', label: 'Content generation', effort: true },
    { key: 'review', label: 'Reviews (7 agents)', effort: true },
    {
        key: 'orchestrator',
        label: 'Orchestrator / editor',
        effort: true,
        inheritsFrom: 'review',
    },
    { key: 'extraction', label: 'Metadata extraction', effort: true },
    { key: 'imagePrompt', label: 'Image prompt', effort: true },
    { key: 'imageAlt', label: 'Image alt text', effort: false },
] as const
```

The orchestrator row renders an "Inherit from Reviews" toggle mapping to `null`. The fal render model, artistic style, Autopilot and refresh cards are untouched. A cost hint under the grid sums `promptPricePerM` across selections and notes that raising effort raises output tokens — and, once P0's usage accounting is live, shows the actual average cost of recent runs.

---

### P5 — Wire the phases

| File                                                                                 | Change                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ai/src/pipelines/generation-phase.runner.ts`                               | `contentEffort?` forwarded into the agentic pipeline.                                                                                                                                                                       |
| `packages/ai/src/pipelines/agentic-content.pipeline.ts:138`                          | Spread `reasoningProviderOptions(effort)`.                                                                                                                                                                                  |
| `packages/ai/src/pipelines/review-phase.runner.ts`                                   | `+ reviewEffort?`, `orchestratorModelId?`, `orchestratorEffort?`. `reviewOptions` (`:143`) carries effort to all 7 agents; `:321` stops reusing `reviewModelId` for the orchestrator; the result reports both resolved ids. |
| `packages/ai/src/agents/types.agent.ts:93`                                           | `ReviewAgentOptions` gains `reasoningEffort?`.                                                                                                                                                                              |
| `packages/ai/src/agents/*.agent.ts` (7 + orchestrator)                               | Pass it through to `coreGenerateObject` / the bypass call.                                                                                                                                                                  |
| `packages/ai/src/pipelines/extraction-phase.runner.ts:113`                           | Accept and forward `reasoningEffort?` into all three extraction functions.                                                                                                                                                  |
| `packages/ai/src/pipelines/image-generation-phase.runner.ts`                         | Accept `promptModelId?`, `promptEffort?`, `altModelId?`; the pinned constants become fallbacks.                                                                                                                             |
| `apps/admin/lib/services/pipeline-phase.service.ts` (`:404`, `:590`, `:740`, `:910`) | Pass the new config fields alongside the model ids.                                                                                                                                                                         |
| `apps/admin/app/api/blog/generate-topics/route.ts:107`                               | `+ reasoningEffort: aiConfig.ideationEffort`                                                                                                                                                                                |
| `apps/admin/lib/services/autopilot.service.ts:361`                                   | Same.                                                                                                                                                                                                                       |
| `apps/admin/app/workflows/refresh/finalize-refresh.step.ts:91`                       | `+ reasoningEffort: aiConfig.extractionEffort`                                                                                                                                                                              |

---

### P6 — Observability, docs, rollout

- Record the **resolved model id + effort per phase** into `pipeline_state` (`packages/db/src/types/blog-pipeline.type.ts`) so a run stays reproducible after a settings change; surface on the Kanban run detail.
- Add `model`, `effort` and OpenRouter's reported **cost** (now available via usage accounting) as Langfuse span attributes in `withPhaseSpan`.
- Update `packages/db/README.md`, `CLAUDE.md` (the OpenRouter-only rule), and `implementation-plans/2026-08-11-blog-content-pipeline-v2.md`.
- **Rollout:** ship with every effort at `none` — behaviour identical to today. Then raise one phase at a time, starting with extraction (cheapest, most structured, lowest blast radius) and ending with reviews (R6).

---

## 4. Files touched

**New (10):** `reasoning-effort.constant.ts`, `reasoning.util.ts`, `openrouter-catalog.ts`, `legacy-id-map.constant.ts`, `openrouter-catalog-fallback.data.ts` (all `packages/ai/src/models|data/`), `apps/admin/lib/services/openrouter-catalog.service.ts`, `apps/admin/app/api/blog/models/route.ts`, `apps/admin/components/blog/model-combobox.component.tsx`, `apps/admin/components/blog/effort-select.component.tsx`, `packages/db/migrations/0051_*.sql`.

**Modified (~30):** the four core wrappers + `types.core.ts`, `model-resolver.util.ts`, `models/index.ts`, `telemetry/`, the 4 pipeline runners, `agentic-content.pipeline.ts`, `agents/types.agent.ts` + 7 review agents + `orchestrator.agent.ts`, `fact-source-verifier.agent.ts`, `generate-blog-topics.function.ts`, the 3 image helper functions, `blog-ai-config.table.ts`, `.query.ts`, `.action.ts`, `blog-ai-settings-form.component.tsx`, `pipeline-phase.service.ts`, `autopilot.service.ts`, `generate-topics/route.ts`, `finalize-refresh.step.ts`, `apps/admin/app/api/chat/route.ts`, the 3 `useChat` components + `apps/web/hooks/chat/*`, 3 × `package.json`, `.nvmrc`.

**Deleted:** `blog-ai-model-field.component.tsx`; the `@ai-sdk/anthropic` and `@ai-sdk/openai` dependencies; `supportsTemperature` / `NO_SAMPLING_PARAMS_PREFIXES` (pending R4).

---

## 5. Acceptance criteria

1. `packages/ai` depends on `ai@^7`, `@openrouter/ai-sdk-provider@^3`, and **no** direct-provider SDK; every inference call resolves through one OpenRouter provider instance.
2. Node 22 is pinned in `.nvmrc`, `engines`, and the Vercel project settings.
3. Blog AI Settings lists every non-`:batch` model OpenRouter returns; searching "gemini flash" narrows to matching ids; an off-catalog id can still be typed.
4. A failed catalog fetch renders the fallback snapshot with a non-blocking warning — never an empty picker or a 500.
5. All seven slots are independently configurable; the orchestrator can inherit the review model.
6. Effort is disabled with an explanation for models the catalog reports as non-reasoning.
7. With every effort at `none`, request bodies carry no `providerOptions` key — asserted by unit test.
8. With effort ≥ `minimal`, the body carries `reasoning: { effort }` — asserted against a live OpenRouter call for one Anthropic-family and one OpenAI-family model.
9. Stored bare ids are rewritten to valid OpenRouter ids; a unit test asserts every entry of `LEGACY_ID_MAP` exists in the live catalog.
10. Kanban, Autopilot ideation and refresh finalize all honour the configured effort.
11. A completed run records the model id, effort and reported cost per phase; Langfuse spans still arrive.
12. `pnpm build`, `pnpm typecheck`, `pnpm lint` pass; chat works on `apps/web` and `apps/admin`.

---

## 6. Phasing / PR split

| PR  | Scope                                            | Risk     | Ships behind                                                    |
| --- | ------------------------------------------------ | -------- | --------------------------------------------------------------- |
| —   | **#195** — AI SDK v7 + Node 22 + OpenRouter-only | **High** | Separate issue. No behaviour change intended. Soak before PR 1. |
| 1   | P1 — effort primitives + core plumbing + tests   | Low      | Inert: no caller passes an effort yet                           |
| 2   | P2 — catalog service + legacy id map + route     | Low      | Inert: nothing renders it yet                                   |
| 3   | P3 — migration + query/action ripple             | Medium   | Defaults reproduce today's behaviour                            |
| 4   | P4 — settings UI rebuild                         | Low      | Visible, every effort ships `none`                              |
| 5   | P5 — phase wiring                                | Medium   | Config now takes effect                                         |
| 6   | P6 — telemetry + docs                            | Low      | —                                                               |

**#195 gates everything.** PRs 1 and 2 are then independent; PR 3 gates 4 and 5.

---

## 7. Risks

**R1 (owned by #195) — Node 22 is a hard runtime bump.** AI SDK 7 drops Node 18/20; we declare `>=20` with `.nvmrc` at `20`. If Vercel is still building on 20 when #195 merges, both apps fail to build. _Mitigation:_ change the Vercel Node setting **first**, verify a preview deploy, then merge. This is the single most likely way to break a deploy in this epic.

**R2 (owned by #195) — the upgrade touches customer-facing chat.** `@ai-sdk/react` v3 → v4 plus the v7 stream-result reshape (`fullStream` → `stream`) hits the public site's chat widget. _Mitigation:_ #195 ships alone with a manual smoke of both chat surfaces, and soaks before the feature work layers on.

**R3 — Bare-id → OpenRouter-id mapping is not a prefix rule.** Verified against the live catalog: `claude-haiku-4-5` must become `anthropic/claude-haiku-4.5` (dashes → dots) while `claude-opus-5` maps cleanly. A naive `anthropic/` + id concatenation produces 404s on exactly the legacy models. _Mitigation:_ explicit `LEGACY_ID_MAP`, a unit test validating it against the live catalog, `toOpenRouterId` in the resolver as a runtime safety net, and the data migration in 0051.

**R4 (owned by #195) — sampling-parameter handling changes shape.** Today `supportsTemperature` suppresses `temperature` for Claude 5 / Opus 4.7+ because the direct Anthropic API 400s. Through OpenRouter the same models are reached over an OpenAI-compatible endpoint that is expected to drop unsupported params silently. _Mitigation:_ confirm with one live call before deleting the helper; if OpenRouter passes it through and the vendor rejects it, keep the suppression list and extend it to strip the `vendor/` prefix.

**R5 — Catalog drift.** Model ids disappear from OpenRouter; a stored id then fails at call time. _Mitigation:_ the settings page flags a configured id absent from the live catalog. The pipeline's transient-error auto-retry does **not** cover a bad model id, so the phase fails loudly rather than silently — acceptable.

**R6 — Reviews are the riskiest phase to give thinking to.** Open issue #191 already parks posts when a review agent returns malformed structured output. Enabling reasoning changes response shape and can perturb structured-output reliability. _Mitigation:_ reviews ship at `none` and are the **last** phase raised in production; watch the #191 failure rate for a week after raising them. (The original Anthropic forced-tool-use conflict is no longer ours to solve — OpenRouter handles structured-output mode per vendor.)

**R7 — Cost.** Nothing stops a 7-agent review board on a premium model at `xhigh`; reasoning tokens bill as output tokens. _Mitigation:_ the cost hint in P4, backed by real per-call cost once usage accounting is live. No hard cap in v1.

**R8 (owned by #195) — single point of failure.** Retiring the direct providers means an OpenRouter outage stops all content generation, where today an Anthropic-only outage would too but an OpenRouter one would not. _Accepted:_ this is the explicit trade for one namespace and one key. The official provider's `models[]` fallback routing is the mitigation to reach for if it bites.

**R9 — Migration must reach Supabase** via `pnpm db:migrate` then `pnpm db:migrate:prod`. Never by hand (#186, #192).

---

## 8. Out of scope

- Effort control for chat / analysis / SEO / gallery functions (they follow the OpenRouter switch in P0 but keep their own model constants).
- The fal.ai image **render** model and artistic style — unchanged fields.
- Per-review-agent model overrides (all 7 share one setting; `PHASE_FIELDS` leaves room to add them without another schema reshuffle).
- Hard spend caps or budget enforcement.
- Fully retiring `AVAILABLE_MODELS` from the non-blog call sites.
