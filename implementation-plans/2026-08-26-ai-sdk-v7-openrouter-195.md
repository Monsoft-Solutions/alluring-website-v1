# AI SDK v7 Upgrade + OpenRouter Consolidation — Implementation Plan

**Date:** 2026-08-26
**Issue:** [#195](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/195)
**Epic:** [#194](https://github.com/Monsoft-Solutions/alluring-website-v1/issues/194) §P0 (`implementation-plans/2026-08-26-open-model-selection-and-reasoning-effort.md`)
**Branch:** `chore/ai-sdk-v7-openrouter-195` · worktree ports web `3118` / admin `3119` · own DB `alluring_wt_chore_ai_sdk_v7_openrouter_195`
**Status:** Implemented and verified on `chore/ai-sdk-v7-openrouter-195`. — every claim below verified against `master` @ `5406135`, against `ai@7.0.83` type definitions installed locally, and against live OpenRouter calls on 2026-08-26. §8 records what implementation changed versus this plan.

**No behaviour change is intended.** Same models, same prompts, same outputs, same traces.

---

## 0. What the pre-work established

Six things were verified before writing this plan. Three of them change the shape of the work versus the issue body.

### 0.1 The v6 → v7 renames are deprecations, not breaks

Every v6 name we use is still accepted by `ai@7.0.83`, marked `@deprecated`:

| v6 name                  | Status in `ai@7.0.83`                          | Evidence                     |
| ------------------------ | ---------------------------------------------- | ---------------------------- |
| `system:`                | kept, `@deprecated Use 'instructions' instead` | `index.d.ts:684-686`         |
| `experimental_telemetry` | kept, `@deprecated Use 'telemetry' instead`    | `index.d.ts:3459-3461`       |
| `onStepFinish`           | kept alongside `onStepEnd`                     | `index.d.ts:3436`, `4769`    |
| `onFinish`               | kept, `@deprecated Use 'onEnd' instead`        | `index.d.ts:2559`, `3584`, … |
| `stepCountIs`            | still exported alongside `isStepCount`         | export list                  |
| `result.fullStream`      | kept, `@deprecated Use 'stream' instead`       | `index.d.ts:2782-2784`       |
| `result.finishReason`    | still top-level (not moved to `finalStep`)     | `index.d.ts:4463`            |
| `result.usage`           | still top-level; `totalUsage` added            | `index.d.ts:4472`, `4479`    |

A live probe (`ai@7` + `@openrouter/ai-sdk-provider@3`) ran `generateText` with both `system:` and `experimental_telemetry:` and returned normally.

**Consequence:** the rename table is _hygiene_, not a blocker. We still do all of it — `--max-warnings 0` plus deprecation drift is how the next major becomes painful — but it is mechanical, `@ai-sdk/codemod@4.0.1` automates most of it, and it carries no runtime risk. The risk lives entirely in §0.2–§0.4.

### 0.2 The real telemetry break is silent, and it is total

`registerTelemetry` pushes onto `globalThis.AI_SDK_TELEMETRY_INTEGRATIONS`, and `getGlobalTelemetryIntegrations()` returns `[]` when nothing was registered (`ai/dist/index.js:4317-4326`). In v7, `isEnabled` no longer turns telemetry _on_ — it only lets you opt _out_ of an integration that is already registered.

So: **upgrade to v7, change nothing else, and every Langfuse span silently stops.** No error, no type error, no failed build. `experimental_telemetry: { isEnabled: true }` keeps compiling and does nothing.

Which integration to register matters just as much:

| Attribute convention                                              | `@langfuse/otel@4.5.1` (installed) | `@langfuse/otel@5.10.1` (latest) |
| ----------------------------------------------------------------- | ---------------------------------- | -------------------------------- |
| `ai.prompt`, `ai.prompt.messages` (legacy AI SDK)                 | ✅ parses                          | ✅ parses                        |
| `gen_ai.input.messages`, `gen_ai.output.messages` (GenAI SemConv) | ❌ absent                          | ✅ parses                        |

`@ai-sdk/otel` ships two integrations: `OpenTelemetry` (GenAI SemConv) and `LegacyOpenTelemetry` (the `ai.*` shape). Registering the _new_ `OpenTelemetry` against Langfuse 4.5.1 would keep spans flowing but drop prompt/response bodies from them — an observability regression that no gate would catch.

**Decision: register `LegacyOpenTelemetry`, keep `@langfuse/otel` at 4.5.1.** That is the behaviour-neutral path. Langfuse v4 → v5 + GenAI SemConv is a separate, deliberate change; §6 files it as a follow-up.

### 0.3 Consolidating on OpenRouter breaks the chat API-key gates

This is the most likely way to take customer-facing chat down, and the issue body does not mention it.

Four routes gate on `OPENAI_API_KEY` and then run inference that, after this change, goes to OpenRouter:

| Site                                               | Gate                                             | What it actually calls after the swap  |
| -------------------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| `apps/web/app/api/chat/route.ts:72`                | `!env.OPENAI_API_KEY`                            | `coreStreamText` → OpenRouter          |
| `apps/admin/app/api/chat/route.ts:60`              | `!env.OPENAI_API_KEY`                            | `openai(...)` — the import itself dies |
| `apps/admin/app/api/ai/improve-text/route.ts:43`   | `!env.OPENAI_API_KEY`                            | `streamImproveText` → OpenRouter       |
| `apps/admin/app/(dashboard)/chat/test/page.tsx:21` | `Boolean(env.OPENAI_API_KEY)` → `hasApiKey` prop | gates the test UI                      |

And the key that will actually be needed is **not declared or set on the web app at all**:

- `apps/web/env.ts` declares `OPENAI_API_KEY` — there is no `OPENROUTER_API_KEY` entry.
- `apps/web/.env.local` has no `OPENROUTER_API_KEY` (admin's `.env` does).
- `packages/ai/src/models/model-resolver.util.ts:22` reads `process.env.OPENROUTER_API_KEY ?? ''` — an empty key means every web chat turn 401s at OpenRouter.

Net effect if unhandled: web chat would keep passing its `OPENAI_API_KEY` gate and then fail on every message.

**Downgraded after checking with the user.** `apps/web/app/layout.tsx:87` disables the built-in widget — the live site serves chat through the **Loquent** widget (`NEXT_PUBLIC_LOQUENT_CHAT_ENABLED`, default on), so `apps/web/app/api/chat/route.ts` is dead code in production. The gates are still corrected here and `OPENROUTER_API_KEY` is still declared in `apps/web/env.ts`, but the web Vercel env var is only needed **if the built-in widget is ever re-enabled** — not a merge blocker. The admin surfaces are the ones that matter, and they are covered by §4.

### 0.4 R4 is resolved — `supportsTemperature` can go

The issue asked for a live check before deleting the sampling-param suppression. Done, three live calls through OpenRouter with `temperature: 0.7`:

| Model                       | `temperature` in `supported_parameters`? | Live result    |
| --------------------------- | ---------------------------------------- | -------------- |
| `anthropic/claude-sonnet-5` | ❌ no                                    | `200` → `"OK"` |
| `anthropic/claude-opus-5`   | ✅ yes                                   | `200` → `"OK"` |
| `openai/gpt-5.2`            | ❌ no                                    | `200` → `"OK"` |

OpenRouter drops unsupported sampling params per-vendor rather than forwarding them. `supportsTemperature`, `NO_SAMPLING_PARAMS_PREFIXES` and `temperatureParam` are all deletable. **They were deleted — and then temperature itself was removed from the pipeline entirely; see §8.7.**

Worth noting in passing: the current list is already wrong in both directions — it suppresses `temperature` on `claude-opus-5` (which accepts it) and misses `gpt-5.2` (which does not). Deleting it is a correctness win, not just a cleanup.

### 0.5 `generateObject` works through OpenRouter

The seven review agents all use `generateObject`, and #191 already tracks schema failures there. A live `generateObject` with a Zod schema against `anthropic/claude-haiku-4.5` through the official provider returned a valid, schema-matching object. Structured output is not a blocker. (#191's wrapper-key bug is orthogonal and stays out of scope.)

### 0.6 The catalog id map, verified against the live catalog

Pulled `https://openrouter.ai/api/v1/models` — 417 models. All ten bare ids in flight map cleanly, and the dash-to-dot irregularity the issue called out is real:

| Bare id (stored config / code constant) | OpenRouter id                 | Rule           |
| --------------------------------------- | ----------------------------- | -------------- |
| `claude-opus-5`                         | `anthropic/claude-opus-5`     | prefix         |
| `claude-sonnet-5`                       | `anthropic/claude-sonnet-5`   | prefix         |
| `claude-haiku-4-5`                      | `anthropic/claude-haiku-4.5`  | **dash → dot** |
| `claude-opus-4-5`                       | `anthropic/claude-opus-4.5`   | **dash → dot** |
| `claude-sonnet-4-5`                     | `anthropic/claude-sonnet-4.5` | **dash → dot** |
| `gpt-4.1`                               | `openai/gpt-4.1`              | prefix         |
| `gpt-4.1-mini`                          | `openai/gpt-4.1-mini`         | prefix         |
| `gpt-4.1-nano`                          | `openai/gpt-4.1-nano`         | prefix         |
| `gpt-4-turbo`                           | `openai/gpt-4-turbo`          | prefix         |
| `gpt-5.2`                               | `openai/gpt-5.2`              | prefix         |

`gpt-4-turbo` comes from the `chat_config` model enum (`packages/db/src/schema/chat/chat-config.table.ts:22`) and is easy to miss — it is not in `AVAILABLE_MODELS`.

**`gpt-image-2` / `gpt-image-1.5` are fal.ai render ids, not LLM ids.** They never reach `getModel`; they go to `fal-image-generation.service.ts`. Out of scope, and they must not be added to the map.

---

## 1. Sequencing — Node 22 first, and it is not optional

AI SDK 7 declares `engines.node: ">=22"`, as does `@openrouter/ai-sdk-provider@3`. We currently pin Node 20 in **three** places, not two:

| Location                      | Now                          | Target |
| ----------------------------- | ---------------------------- | ------ |
| `.nvmrc`                      | `20`                         | `22`   |
| root `package.json` `engines` | `>=20`                       | `>=22` |
| `.github/workflows/ci.yml`    | `'20'` ×3 (lines 41, 68, 95) | `'22'` |
| Vercel project — `apps/web`   | 20                           | 22     |
| Vercel project — `apps/admin` | 20                           | 22     |

The Vercel setting is **dashboard state, not repo state** — neither app has a `vercel.json` `nodeVersion` (admin's only holds crons; web has none). So it cannot be changed by this PR, and it must be changed _before_ this PR merges.

**Order of operations:**

1. Raise Node to 22 on both Vercel projects (manual, dashboard) — _user action, blocks the merge_
2. Confirm a preview deploy builds green on 22 with the current `master` code
3. Only then merge this PR

Doing 3 before 1 fails both production builds. Everything in §2–§4 can be built and verified locally in the meantime — the local toolchain is already on Node v25.5.0.

---

## 2. Work breakdown

### Stage A — Runtime + dependencies

- `.nvmrc` → `22`; root `package.json` `engines.node` → `>=22`; `.github/workflows/ci.yml` `node-version: '22'` ×3.
- `packages/ai/package.json`: `ai` → `^7.0.83`, `@ai-sdk/provider-utils` → `^5.0.32`; **add** `@openrouter/ai-sdk-provider@^3.0.0`, `@ai-sdk/otel@^1.0.83`; **remove** `@ai-sdk/anthropic`, `@ai-sdk/openai`.
- `apps/web/package.json`, `apps/admin/package.json`: `@ai-sdk/react` → `^4.0.86`.
- `pnpm install`, confirm the lockfile resolves with no leftover direct-provider entry.

### Stage B — Provider consolidation (`packages/ai/src/models/model-resolver.util.ts`)

Rewrite to a single OpenRouter instance:

```ts
const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
})

export function getModel(modelId: string): LanguageModel {
    return openrouter.chat(toOpenRouterId(modelId))
}
```

`toOpenRouterId` passes through anything containing `/`, otherwise looks the id up in an explicit `LEGACY_ID_MAP` (§0.6). **Not a prefix rule** — naive concatenation 404s on exactly the point-release ids we have stored.

Unmapped bare ids: fall back to returning the id unchanged and log a warning, so an id we did not anticipate surfaces as an OpenRouter 404 with a breadcrumb rather than a silent mis-route.

Delete `supportsTemperature`, `NO_SAMPLING_PARAMS_PREFIXES`, `temperatureParam` (§0.4) and every `...temperatureParam(...)` spread — replace with a plain `temperature` pass-through at the 8 call sites that use it.

### Stage C — Kill the `openai` re-export chain

Removing `@ai-sdk/openai` breaks four re-exports and one real consumer:

| File                                                   | Change                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `packages/ai/src/client.ts:30`                         | drop `export { openai } from '@ai-sdk/openai'`              |
| `packages/ai/src/functions/stream-chat.function.ts:96` | drop the same re-export                                     |
| `packages/ai/src/functions/index.ts:18`                | drop `openai` from the barrel                               |
| `packages/ai/src/index.ts:54`                          | drop `openai` from the barrel + its JSDoc example (`:12`)   |
| `apps/admin/app/api/chat/route.ts:9,118`               | `openai(config.modelId)` → `coreStreamText({ modelId, … })` |

The admin chat route is the only consumer. Rewriting it onto `coreStreamText` also folds it into the shared telemetry/model path instead of bypassing it — which is where it should have been.

`packages/ai/src/env.ts`: `ANTHROPIC_API_KEY` (`:43`, `:54`) and `isAnthropicConfigured()` (`:83`) have **zero consumers** repo-wide. Delete them with the provider.

### Stage D — API-key gates (§0.3)

- `apps/web/env.ts`: add `OPENROUTER_API_KEY: z.string().min(1).optional()`.
- `apps/web/.env.local` (worktree + the user's main checkout): add `OPENROUTER_API_KEY`.
- Swap the four `OPENAI_API_KEY` gates to `OPENROUTER_API_KEY` (`apps/web/app/api/chat/route.ts:72`, `apps/admin/app/api/chat/route.ts:60`, `apps/admin/app/api/ai/improve-text/route.ts:43`, `apps/admin/app/(dashboard)/chat/test/page.tsx:21`) and update the two user-facing strings in `chat-test-interface.component.tsx:149,152`.
- Keep `OPENAI_API_KEY` declared-but-unused in both env schemas for now (both are `.optional()`, so nothing fails); removing it is a deploy-config change that belongs with the Vercel env cleanup, not here.

### Stage E — Telemetry (§0.2)

- `apps/web/instrumentation.ts` and `apps/admin/instrumentation.ts`: after `tracerProvider.register()`, add

    ```ts
    registerTelemetry(new LegacyOpenTelemetry())
    ```

- `packages/ai/src/telemetry/telemetry.config.ts`: keep exporting `telemetryConfig`, drop the stale `isEnabled` comment, update the JSDoc example to `telemetry:`.
- Rename `experimental_telemetry:` → `telemetry:` at all 10 call sites.

`withPhaseSpan` (`apps/admin/lib/services/pipeline-phase.service.ts:244`) uses plain OTel `startActiveSpan` and is provider-agnostic — AI SDK spans nest under it via ambient context, unchanged.

### Stage F — Renames across the 11 invocation sites

`system:` → `instructions:` (inner SDK call only — the wrappers keep `system` in their _public_ option types, so no downstream caller changes), `onStepFinish` → `onStepEnd`, `onFinish` → `onEnd`, `stepCountIs` → `isStepCount`, `result.fullStream` → `result.stream`.

Sites: `core/generate-text.core.ts`, `core/generate-object.core.ts`, `core/stream-text.core.ts`, `core/stream-object.core.ts`, `pipelines/generation-phase.runner.ts:250`, `pipelines/agentic-content.pipeline.ts:138`, `agents/orchestrator.agent.ts:542`, `agents/fact-source-verifier.agent.ts:282`, `functions/generate-blog-topics.function.ts:187`, `apps/web/app/api/chat/route.ts:171`, `apps/admin/app/api/chat/route.ts`.

Try `npx @ai-sdk/codemod@4 v7` first, then review its diff by hand — it will not know about our wrappers' public API.

Two aggregate-semantics reads to sanity-check (both log-only, both fine): `orchestrator.agent.ts:581` `result.usage?.totalTokens`, and `result.finishReason` at `agentic-content.pipeline.ts:213` / `generation-phase.runner.ts:332`. Pipeline tool-call metrics accumulate in `onStepFinish` closures, so they are unaffected.

One thing to check while in `generate-object.core.ts`: v7 excludes request/response bodies by default (`include: { responseBody: true }` opts back in). The `NoObjectGeneratedError` handler at `:88-95` logs `error.response` — if that now comes back empty it degrades #191's diagnostics. Add `include` there if so.

### Stage G — Chat UI (`@ai-sdk/react` v3 → v4)

`useChat` is imported in **two** files, not three:

- `apps/web/hooks/chat/useChatMessages.hook.ts:23` — `useChat({ transport: new DefaultChatTransport(...), messages })`
- `apps/admin/components/chat/chat-test-interface.component.tsx:12` — `useChat({ transport: new TextStreamChatTransport(...) | undefined, messages })`

(`chat-interface.component.tsx` consumes our `useChatMessages` wrapper; `chat-widget.component.tsx` uses a local `useChatSession`. Neither touches the SDK.)

v4's `UseChatOptions` still accepts `transport` + `messages` and still returns `messages / sendMessage / status / error / setMessages`, and `UIMessage` is still re-exported from `@ai-sdk/react`. Expect this to be a version bump with type-level fixes only — but it is customer-facing, so it gets a real browser pass (§4).

### Stage H — The catalog test (AC #4)

`packages/ai` has no vitest setup; `apps/admin` does (`apps/admin/vitest.config.ts`, `apps/admin/__tests__/`).

**Two-part test, because a live-network assertion in CI is a flake generator:**

1. **Offline, always runs:** assert every `LEGACY_ID_MAP` value appears in a checked-in catalog snapshot (`packages/ai/src/models/openrouter-catalog.snapshot.json`, pulled today), and that every bare id reachable from `AVAILABLE_MODELS` + the `chat_config` enum has a map entry.
2. **Live, opt-in:** a `describe.skipIf(!process.env.OPENROUTER_LIVE)` block that fetches the real catalog and asserts the same thing. Run locally and in the smoke pass; never gates CI.

Placed in `apps/admin/__tests__/lib/ai/openrouter-id-map.test.ts`.

---

## 3. Files expected to change

**Config / runtime (5)**
`.nvmrc` · `package.json` · `.github/workflows/ci.yml` · `apps/web/package.json` · `apps/admin/package.json`

**`packages/ai` (16)**
`package.json` · `src/env.ts` · `src/index.ts` · `src/client.ts` · `src/models/model-resolver.util.ts` · `src/models/openrouter-catalog.snapshot.json` _(new)_ · `src/telemetry/telemetry.config.ts` · `src/core/{generate-text,generate-object,stream-text,stream-object}.core.ts` · `src/functions/{index,stream-chat.function,generate-blog-topics.function}.ts` · `src/agents/{orchestrator,fact-source-verifier}.agent.ts` · `src/pipelines/{generation-phase.runner,agentic-content.pipeline}.ts`

**`apps/web` (4)**
`env.ts` · `.env.local` _(gitignored)_ · `instrumentation.ts` · `app/api/chat/route.ts` · `hooks/chat/useChatMessages.hook.ts`

**`apps/admin` (6)**
`instrumentation.ts` · `app/api/chat/route.ts` · `app/api/ai/improve-text/route.ts` · `app/(dashboard)/chat/test/page.tsx` · `components/chat/chat-test-interface.component.tsx` · `__tests__/lib/ai/openrouter-id-map.test.ts` _(new)_

Plus `pnpm-lock.yaml`. **~32 files, no database work** — stored bare ids are translated at runtime by `toOpenRouterId`; rewriting them in the config row is epic #194's P2.

---

## 4. Verification

**Gates (all must pass, all prefixed `env -u ANTHROPIC_API_KEY` — the harness exports an empty key that shadows `apps/admin/.env`):**

```bash
env -u ANTHROPIC_API_KEY pnpm lint
env -u ANTHROPIC_API_KEY pnpm typecheck
env -u ANTHROPIC_API_KEY pnpm build
env -u ANTHROPIC_API_KEY pnpm test
pnpm format
```

**Smoke (against the worktree's own cloned DB, ports 3118/3119):**

| #   | Check                                                                                                                    | Guards          |
| --- | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
| 1   | One full Kanban run: generate → review → extract → image                                                                 | AC #6, §0.5     |
| 2   | Web chat conversation at `localhost:3118`, desktop + 390px                                                               | AC #6, §0.3, §G |
| 3   | Admin chat test at `localhost:3119`                                                                                      | AC #6, §0.3, §G |
| 4   | Langfuse shows spans for the run **with prompt/response bodies**, and the admin's "open in Langfuse" trace link resolves | AC #7, §0.2     |
| 5   | `OPENROUTER_LIVE=1 pnpm test` — live catalog assertion green                                                             | AC #4           |
| 6   | Spot-check one generated post against a pre-upgrade run                                                                  | AC #8           |

Check #4 is the one that needs eyes, not a green checkmark — a v7 upgrade that loses telemetry loses it silently.

**Code review:** `/code-review` at raised effort — >8 files, touches the contact-adjacent API routes and customer-facing chat.

---

## 5. Risks

| Risk                                                                       | Mitigation                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Node 22 not set on Vercel before merge** → both prod builds fail         | §1 ordering; the merge is gated on a green preview deploy               |
| **`OPENROUTER_API_KEY` missing on web Vercel** → every prod chat turn 401s | §0.3; add the env var with the Node bump, in the same sitting           |
| **Telemetry silently dies** → Langfuse goes dark with every gate green     | `LegacyOpenTelemetry` + smoke check #4 inspects span _contents_         |
| **`LegacyOpenTelemetry` is itself deprecated** upstream                    | Accepted for P0. Follow-up issue: Langfuse v5 + GenAI SemConv           |
| Customer-facing chat in the blast radius                                   | Ships alone; both surfaces smoked at 390px + desktop; soaks on `master` |
| Single point of failure — an OpenRouter outage stops all generation        | Accepted trade (issue). `models[]` fallback routing is the lever        |
| Structured output through OpenRouter                                       | Verified live (§0.5). #191's wrapper-key bug stays out of scope         |

---

## 6. Deferred — follow-up issues to file

1. **Langfuse v4 → v5 + GenAI SemConv telemetry.** Move off `LegacyOpenTelemetry` to `OpenTelemetry`, bump `@langfuse/otel`/`@langfuse/tracing` to `^5.10.1`. Needs its own trace-fidelity comparison.
2. **Retire `OPENAI_API_KEY` from both env schemas** once the Vercel env vars are cleaned up.
3. **Per-phase capability filtering in the model picker (§8.8).** Review and Extraction must not offer
   models that cannot do `response_format` structured output — today a user can pick `claude-opus-5`
   there and the phase silently returns prose. Natural fit for #194's live-catalog picker, which has
   `supported_parameters` per model.
4. **Tool-mode shim in `coreGenerateObject` for Anthropic ids.** Would make _every_ model work rather
   than steering users away from half the catalog. `fact-source-verifier` and `generate-blog-topics`
   already demonstrate the pattern (`generateText` + `Output.object`).
5. **`AVAILABLE_MODELS` still carries a `provider: 'openai' | 'anthropic' | 'openrouter'` discriminator** that means nothing once everything routes through OpenRouter — epic #194's P2 replaces the whole constant with the live catalog, so it is left alone here deliberately.

---

## 7. Out of scope

Reasoning effort (#194 P1+), the live catalog picker UI, `blog_ai_config` columns and their migration, rewriting stored bare ids in the database, image helper model configurability, and #191's `generateObject` wrapper-key repair.

---

## 8. What implementation changed versus this plan

Three things the plan did not anticipate, plus the evidence that the §0.2 telemetry risk was real.

### 8.1 Removing the provider SDKs broke type portability (4 × TS2742)

`@ai-sdk/anthropic` / `@ai-sdk/openai` were transitively supplying `@ai-sdk/provider`, whose types the
`tool()` return signatures reference. Dropping them made four tool factories un-nameable:

```
src/tools/{google-search,perplexity-search,research-tools,think}.tool.ts
  error TS2742: The inferred type of 'createXTool' cannot be named without a
  reference to '.pnpm/@ai-sdk+provider@4.0.8/...'. A type annotation is necessary.
```

Fixed by declaring `@ai-sdk/provider@^4.0.8` explicitly in `packages/ai` — restoring exactly the
resolution path the direct providers had been providing, rather than papering over it with annotations.

### 8.2 `@ai-sdk/otel` split `drizzle-orm` in two, breaking admin's typecheck

`@ai-sdk/otel` pins `@opentelemetry/api@1.9.1`; the rest of the repo was on `1.9.0`. `drizzle-orm` has a
peer on it, so pnpm produced **two** drizzle instances:

```
drizzle-orm@0.44.7_@opentelemetry+api@1.9.0_gel@2.1.1_postgres@3.4.7
drizzle-orm@0.44.7_@opentelemetry+api@1.9.1_gel@2.1.1_postgres@3.4.7
```

which surfaced as ~25 nominal-type errors in admin scripts (`SQL<unknown>` not assignable to
`SQL<unknown>`). Fixed with a `pnpm.overrides` pin on `@opentelemetry/api` — `1.9.1` satisfies both
`@ai-sdk/otel`'s exact pin and `@langfuse/otel`'s `^1.9.0`. This sits next to the existing `drizzle-orm`
override for the same reason.

**Worth remembering:** adding any OTel-adjacent dependency to this repo can re-split drizzle. The symptom
is always a type that is not assignable to itself.

### 8.3 The catalog test needs the node environment

`apps/admin/vitest.config.ts` sets `environment: 'jsdom'` globally, and the live-catalog `fetch` hangs
indefinitely under it. The test file carries `// @vitest-environment node`, which it wants anyway — it is
pure logic with no DOM.

### 8.4 The §0.2 telemetry risk, demonstrated

Run through the real `packages/ai` path with a span collector attached:

| Setup                          | AI call                  | Spans emitted                                                                                                                  | `ai.prompt.messages` |
| ------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `registerAiTelemetry()` called | succeeds                 | **8** across `ai.generateObject` / `ai.generateText` / `ai.streamText` (+ `.doGenerate` / `.doStream`), 32 legacy `ai.*` attrs | ✅                   |
| registration commented out     | **succeeds identically** | **0**                                                                                                                          | ❌                   |

The upgrade would have shipped green — lint, typecheck, build, tests all passing — with Langfuse silently
dark. `registerAiTelemetry()` is load-bearing, which is why it lives in one helper with the reasoning
attached rather than as two lines copy-pasted into each app.

### 8.5 Admin AI operations verified end to end

Every distinct SDK call shape in the admin, exercised against live OpenRouter:

| Call shape                                                  | Function                      | Result      |
| ----------------------------------------------------------- | ----------------------------- | ----------- |
| `generateObject` — all 7 review agents                      | `extractMetadata`             | ✅          |
| `generateText` + `Output.object` — Autopilot ideation       | `generateBlogTopics`          | ✅ 8 topics |
| `streamText` — the improve-text route                       | `streamImproveText`           | ✅          |
| `generateObject` via image helper (was pinned to `gpt-5.2`) | `generateFeaturedImagePrompt` | ✅          |

Models resolved on the wire: `anthropic/claude-opus-5`, `openai/gpt-4.1-mini`, `openai/gpt-5.2` — every
bare id translated correctly. `ai.model.provider` is `openrouter` on **every** span.

### 8.7 Temperature removed from the pipeline (resolved 2026-08-27)

Deleting `supportsTemperature` (§0.4) had a side effect: the 7 review agents each pass a deliberate low
temperature (0.2–0.4), and because they all ran on `claude-opus-5` — which was in
`NO_SAMPLING_PARAMS_PREFIXES` — **those values had been silently discarded for their entire life**. With
the suppression gone they would have started reaching the model for the first time.

Rather than reason per-vendor about which values are honoured, **temperature is no longer sent from
`packages/ai` at all**. Vendors disagree on support, reasoning models ignore or reject it, and OpenRouter
drops it per-vendor anyway — so the parameter was never doing reliable work here.

**What changed** — 39 files, 90 lines removed:

- Every `temperature` option, default (`0.2`–`0.8`, `DEFAULTS.TEMPERATURE`) and call-site argument removed
  from all agents, pipelines and functions.
- The four `core/*.core.ts` wrappers **keep** `temperature` as plumbing but dropped their `= 0.7` default
  and now forward it only when a caller explicitly supplies one:
  `...(temperature !== undefined && { temperature })`.
- `apps/admin/app/api/blog/generate-content/route.ts` lost its now-dead `temperature` request field.

**What deliberately did not change:** `chat_config.temperature` is a real DB column with a user-facing
slider in admin Chat settings. Both chat routes still pass `config.temperature` through, so the slider
keeps working. Retiring the column and control is a separate change (it needs a migration) and is not
worth bundling into a PR meant to ship alone and soak.

Verified on the wire with a fetch interceptor:

| Path                                           | Outbound `temperature` |
| ---------------------------------------------- | ---------------------- |
| `analyzeBlogPost` (pipeline)                   | **absent**             |
| `coreStreamText({ temperature: 0.42 })` (chat) | `0.42`                 |

Net effect: the §0.4 delta is gone — the pipeline now uses each model's own default, which is what it was
effectively doing before, and no longer depends on a per-vendor suppression list being correct.

### 8.8 🚨 BLOCKER — structured output breaks for Anthropic models through OpenRouter

The issue's own risk list said: _"Structured output through OpenRouter — the 7 review agents all use
`generateObject` … re-verify structured output works for the configured models before calling this done."_
**That risk has materialized.** It was invisible to every gate — lint, typecheck, build and 341 tests all
pass — and only surfaced by clicking "Run Analysis" in the admin.

#### What breaks

`POST /api/blog/analyze` → `500 in 63s`. The model returns a **markdown report**
(`# SEO & Content Quality Assessment …`) instead of JSON, and `generateObject` throws
`AI_NoObjectGeneratedError`.

#### Root cause: the object-generation strategy changed underneath us

|                                           | Object generation strategy                                              | Complex-schema result                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Before** — `@ai-sdk/anthropic`          | **tool-mode**: a synthetic tool whose `input_schema` is the JSON schema | works (this is also why #191 sees "payload wrapped under a junk key" — a _tool-mode_ artefact) |
| **After** — `@openrouter/ai-sdk-provider` | `response_format: { type: 'json_schema' }`                              | Anthropic **silently ignores it** and free-forms prose                                         |

AI SDK 7 removed `generateObject`'s `mode` option, so the strategy is now entirely the provider's choice.
The outbound request is verifiably correct — `response_format.json_schema` is present and identical for
both a small and a large schema — the small one succeeds and the large one comes back as prose.

#### Two distinct failures, one fixed

| Model                                   | `strict: true` (provider default) | `strict: false` |
| --------------------------------------- | --------------------------------- | --------------- |
| `x-ai/grok-4.6`                         | ✅                                | ✅              |
| `openai/gpt-4.1-mini`, `openai/gpt-5.2` | ❌ HTTP 400 `invalid_json_schema` | ✅              |
| `anthropic/claude-opus-5`               | ❌ prose                          | ❌ prose        |

**Fixed in this branch:** `getModel` now passes `structuredOutputs: { strict: false }`. `strict: true`
demands every property appear in `required`, and our Zod schemas use optional fields — hence
`"'required' is required to be supplied and to be an array including every key in properties. Missing
'wordCount'"`. This repaired the entire OpenAI family (hard 400 → working).

**Not fixed:** Anthropic models. No provider setting reaches it — `strict: false` and
`provider: { require_parameters: true }` were both tried and both still return prose.

#### Blast radius

Every `generateObject` call whose configured model is a `claude-*` id **and** whose schema is large:
`analyzeBlogPost` and all 7 review agents default to `claude-opus-5`. Small schemas are unaffected —
`extractMetadata` on `claude-opus-5` works fine — so this is a schema-complexity threshold, not a
blanket break.

Note a pre-existing mislabel found on the way: `analyze/route.ts:202` records
`modelUsed: requestedModelId ?? 'gpt-5.2'`, but when the UI sends no `modelId` the call actually runs on
`analyzeBlogPost`'s own `DEFAULT_MODEL_ID = 'claude-opus-5'`. The stored `modelUsed` has been wrong.

#### Verified working after the fix

| Path                          | Model                                                    | Result       |
| ----------------------------- | -------------------------------------------------------- | ------------ |
| `analyzeBlogPost`             | `x-ai/grok-4.6`, `openai/gpt-4.1-mini`, `openai/gpt-5.2` | ✅ all three |
| `writing-quality` reviewer    | `x-ai/grok-4.6`                                          | ✅ score 54  |
| `geo-retrievability` reviewer | `x-ai/grok-4.6`                                          | ✅ score 67  |
| `ai-slop-detector`            | `x-ai/grok-4.6`                                          | ✅ score 51  |
| `internal-links` reviewer     | `x-ai/grok-4.6`                                          | ✅ score 62  |

`writing-quality` and `geo-retrievability` are two of the three agents #191 reports as stuck on Claude —
both pass on grok. Moving off Anthropic may resolve #191 as a side effect.

#### Resolution (chosen 2026-08-27)

Two fixes, because the models are set in **two** places — hardcoded defaults _and_ the admin UI.

**1. `structuredOutputs: { strict: false }` in `getModel`.** Repairs the whole OpenAI family.

**2. Repointed the Claude defaults that actually break.** Not a blanket replace — the split matters:

| Path                                                                                             | Object generation                        | Action                          |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------- |
| 15 files + `review-phase.runner` `REVIEW_MODEL`                                                  | `coreGenerateObject` → `response_format` | → `x-ai/grok-4.6`               |
| `orchestrator`, `generation-phase.runner`, `agentic-content.pipeline`, `extraction-phase.runner` | `generateText`                           | **left on Claude** — works fine |
| `fact-source-verifier`, `generate-blog-topics`                                                   | `Output.object` → **tool-mode**          | **left on Claude** — works fine |

Those last two are the proof that tool-mode is the difference: same models, same schema complexity, and they
succeed where `coreGenerateObject` fails.

**3. `DEFAULT_BLOG_AI_CONFIG` repointed** to `x-ai/grok-4.6` for all four phases, and `x-ai/grok-4.6` added
to `AVAILABLE_MODELS` so the picker offers it.

**Verified in the browser:** `POST /api/blog/analyze` went from `500 in 63s` to **`200 in 89s`**, and the
Quality Analysis panel renders **78/100, grade B** with populated per-category findings.

#### ⚠️ Still open: the admin UI can still select a broken combination

Models are user-settable per phase in Blog AI Settings, and `AVAILABLE_MODELS` still offers five
`claude-*` entries. Picking one for **Review** or **Extraction** will silently produce prose instead of
JSON — no error, just a failed phase. Ideation and Content are `generateText` and stay safe on Claude, so
a blanket removal of Claude from the picker would be wrong.

The current stored config is unaffected — all four phases already point at non-Claude OpenRouter models
(`deepseek/deepseek-v4-flash-0731`, `google/gemini-3.6-flash`, `openai/gpt-5.6-terra`).

The proper fix is per-phase capability filtering in the picker, which belongs to epic #194 (it replaces
`AVAILABLE_MODELS` with the live catalog and already has `supported_parameters` per model). A
`structured_outputs`-aware filter on the Review/Extraction pickers would close it. **Filed as a follow-up
in §6.** The alternative that would fix it at the root — a tool-mode shim in `coreGenerateObject` for
Anthropic ids — is recorded there too.

#### The options considered

1. **Repoint the Claude defaults at grok/OpenAI** — verified working, and likely fixes #191. But it is a
   model change, which is epic #194's remit, and it will shift generated output.
2. **Keep `@ai-sdk/anthropic` solely for `claude-*` object generation** — preserves output exactly, but
   contradicts the OpenRouter-only preference this issue exists to implement.
3. **Add a tool-mode shim** — route Anthropic ids through `generateText` + `Output.object` + a synthetic
   tool (the pattern `fact-source-verifier` already uses). Keeps both the consolidation and the models,
   at the cost of a branch in `coreGenerateObject`.
4. **Ship with the limitation documented** and repoint models in #194.

**This must be settled before merge** — option 1 or 3 are the only ones that leave the blog pipeline
working on `claude-*` defaults.

### 8.6 Local Langfuse keys live only in the web app

`apps/admin/.env` has no `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY`, so the admin dev server logs
`No exporter configured … Span exports will fail`. Pre-existing, unrelated to this change: the spans are
produced correctly (§8.4), they just have nowhere to go locally. Production reads the keys from Vercel.
Worth fixing separately if local Langfuse debugging is ever wanted.
