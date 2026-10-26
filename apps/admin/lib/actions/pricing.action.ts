/**
 * Pricing Admin Actions (issue #354)
 *
 * Saves the Pricing page: each line's label, list price and active flag,
 * each procedure's starting line, discount and range, and the site-wide
 * settings (default discount, the Fla. Stat. 456.062 statement, the
 * combination discounts). Then revalidates the web app's `pricing` tag,
 * which every page that prints a price or resolves a claim token reads, so
 * the new prices reach procedure pages, posts and the chat on their next
 * request, and `llms*.txt` once its ten-minute CDN cache turns over.
 *
 * A discount without the statement saves (the page warns); a value outside
 * the rules (`validatePricingForm`) does not, and neither does a change that
 * would make a claim token print nothing (a line deactivated, a starting
 * line removed) on a live post, in the chat config, or in the web app's
 * code: its procedure data, FAQ lists and landing pages, and the components
 * that print a fixed line in a sentence (`codeClaimTokenSources`).
 *
 * @module lib/actions/pricing
 */
'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { chatConfig } from '@workspace/db/schema/chat'
import {
    priceLine,
    pricingSettings,
    procedurePricing,
} from '@workspace/db/schema/pricing'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { codeClaimTokenSources } from '@workspace/shared/claims/code-tokens'
import {
    getPricingWarnings,
    type PricingWarning,
} from '@workspace/shared/claims/pricing'

import { getPricingRows } from '@/lib/queries/pricing.query'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import {
    findClaimTokensBrokenBy,
    type ClaimTokenSource,
} from '@/lib/utils/claim-token-fields.util'
import {
    pricingFormSchema,
    toPricingFormValues,
    toPricingSnapshot,
    validatePricingForm,
    type PricingFormError,
    type PricingFormValues,
} from '@/lib/utils/pricing-form.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'

export type SavePricingResult =
    | {
          success: true
          /** Lines, procedures and settings rows that changed. */
          changed: number
          /** What the page should still flag, e.g. a discount without the statement. */
          warnings: PricingWarning[]
          /** The values as saved, for the form to reset to. */
          values: PricingFormValues
      }
    | {
          success: false
          error: string
          errors?: PricingFormError[]
      }

/** `null` for an empty or whitespace-only text field. */
function orNull(value: string): string | null {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
}

/**
 * Every text that names prices with claim tokens and that readers see: live
 * and scheduled posts (each reader-facing field), the chat config, and the
 * web app's code, whose tokens are generated into `CODE_DATA_TOKENS` (the
 * admin can't read the web sources at runtime) plus the fixed-key lookups
 * in `CODE_PRICE_LOOKUPS`.
 */
async function claimTokenSources(): Promise<ClaimTokenSource[]> {
    const [posts, chat] = await Promise.all([
        db
            .select({
                slug: blogPost.slug,
                title: blogPost.title,
                content: blogPost.content,
                metaTitle: blogPost.metaTitle,
                metaDescription: blogPost.metaDescription,
                excerpt: blogPost.excerpt,
                quickAnswer: blogPost.quickAnswer,
                faqs: blogPost.faqs,
            })
            .from(blogPost)
            .where(inArray(blogPost.status, ['published', 'scheduled'])),
        db
            .select({
                systemPrompt: chatConfig.systemPrompt,
                welcomeMessage: chatConfig.welcomeMessage,
            })
            .from(chatConfig)
            .limit(1),
    ])
    return [
        ...posts.flatMap((post) => {
            const at = `post ${post.slug ?? '(no slug)'}`
            return [
                post.title,
                post.content,
                post.metaTitle,
                post.metaDescription,
                post.excerpt,
                post.quickAnswer,
                ...(post.faqs ?? []).flatMap((faq) => [
                    faq.question,
                    faq.answer,
                ]),
            ].map((text) => ({ source: at, text }))
        }),
        ...chat.flatMap((row) => [
            { source: 'chat system prompt', text: row.systemPrompt },
            { source: 'chat welcome message', text: row.welcomeMessage },
        ]),
        ...codeClaimTokenSources(),
    ]
}

/**
 * Save the Pricing page. Only rows whose values changed are written, so
 * `updated_at` (which `llms*.txt` reports as the pricing edit date) moves
 * only for a real edit.
 */
export async function savePricing(input: unknown): Promise<SavePricingResult> {
    try {
        await requireAuth()

        const parsed = pricingFormSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, error: 'The form sent malformed data.' }
        }
        const values = parsed.data

        const errors = validatePricingForm(values)
        if (errors.length > 0) {
            return {
                success: false,
                error: 'Fix the highlighted fields and save again.',
                errors,
            }
        }

        const rows = await getPricingRows()
        if (rows.lines.length === 0) {
            return {
                success: false,
                error: 'The pricing tables are empty: apply migration 0060 (db:migrate) before editing prices. Until then the site shows the 2026-09-15 price sheet.',
            }
        }
        const current = toPricingFormValues(rows)

        // A line deactivated, or a starting line set to none, empties every
        // token that names it: "A mini tummy tuck is ." on a live post or a
        // procedure page. The save is refused until that text stops naming
        // it (#354).
        const broken = findClaimTokensBrokenBy(
            await claimTokenSources(),
            toPricingSnapshot(current),
            toPricingSnapshot(values)
        )
        if (broken.length > 0) {
            const shown = broken.slice(0, 12).join('; ')
            const more =
                broken.length > 12 ? ` and ${broken.length - 12} more` : ''
            return {
                success: false,
                error: `This change would make claim tokens on the site print nothing: ${shown}${more}. Edit those posts first, or for "web code" ask a developer to change those files (or keep the line active and the starting line set).`,
            }
        }
        const currentLines = new Map(
            current.procedures.flatMap((procedure) =>
                procedure.lines.map((line) => [
                    `${procedure.procedure}:${line.key}`,
                    line,
                ])
            )
        )
        const currentProcedures = new Map(
            current.procedures.map((procedure) => [
                procedure.procedure,
                procedure,
            ])
        )

        // Lines are edited, never created or renamed here: a key the
        // database doesn't have is a stale form, not a new line.
        const unknown = values.procedures.flatMap((procedure) =>
            procedure.lines
                .filter(
                    (line) =>
                        !currentLines.has(`${procedure.procedure}:${line.key}`)
                )
                .map((line) => `${procedure.procedure}:${line.key}`)
        )
        if (unknown.length > 0) {
            return {
                success: false,
                error: `Unknown price lines: ${unknown.join(', ')}. Reload the page and try again.`,
            }
        }

        let changed = 0
        await db.transaction(async (tx) => {
            for (const procedure of values.procedures) {
                for (const line of procedure.lines) {
                    const before = currentLines.get(
                        `${procedure.procedure}:${line.key}`
                    )!
                    const label = line.label.trim()
                    if (
                        before.label === label &&
                        before.usd === line.usd &&
                        before.active === line.active
                    ) {
                        continue
                    }
                    await tx
                        .update(priceLine)
                        .set({
                            label,
                            usd: line.usd,
                            isActive: line.active,
                            updatedAt: sql`now()`,
                        })
                        .where(
                            and(
                                eq(
                                    priceLine.procedureSlug,
                                    procedure.procedure
                                ),
                                eq(priceLine.lineKey, line.key)
                            )
                        )
                    changed += 1
                }

                const before = currentProcedures.get(procedure.procedure)
                const row = {
                    startingLineKey: procedure.startingLineKey,
                    discountPercent: procedure.discountPercent,
                    discountLabel: orNull(procedure.discountLabel),
                    notes: orNull(procedure.notes),
                    typicalMaxUsd: procedure.typicalMaxUsd,
                }
                if (
                    before &&
                    before.startingLineKey === row.startingLineKey &&
                    before.discountPercent === row.discountPercent &&
                    orNull(before.discountLabel) === row.discountLabel &&
                    orNull(before.notes) === row.notes &&
                    before.typicalMaxUsd === row.typicalMaxUsd
                ) {
                    continue
                }
                await tx
                    .insert(procedurePricing)
                    .values({ procedureSlug: procedure.procedure, ...row })
                    .onConflictDoUpdate({
                        target: procedurePricing.procedureSlug,
                        set: { ...row, updatedAt: sql`now()` },
                    })
                changed += 1
            }

            const settings = {
                defaultDiscountPercent: values.defaultDiscountPercent,
                discountStatement: orNull(values.discountStatement),
                comboDiscountTwoUsd: values.comboDiscountTwoUsd,
                comboDiscountThreeUsd: values.comboDiscountThreeUsd,
            }
            if (
                current.defaultDiscountPercent !==
                    settings.defaultDiscountPercent ||
                orNull(current.discountStatement) !==
                    settings.discountStatement ||
                current.comboDiscountTwoUsd !== settings.comboDiscountTwoUsd ||
                current.comboDiscountThreeUsd !== settings.comboDiscountThreeUsd
            ) {
                await tx
                    .insert(pricingSettings)
                    .values({ id: 1, ...settings })
                    .onConflictDoUpdate({
                        target: pricingSettings.id,
                        set: { ...settings, updatedAt: sql`now()` },
                    })
                changed += 1
            }
        })

        revalidatePath('/pricing')
        if (changed > 0) {
            // Every page that prints a price or resolves a claim token
            // (procedure pages, posts, llms*.txt, the chat) reads this tag.
            await revalidateWebAppCache([CACHE_TAGS.PRICING])
        }

        const saved = toPricingFormValues(await getPricingRows())
        return {
            success: true,
            changed,
            warnings: getPricingWarnings(toPricingSnapshot(saved)),
            values: saved,
        }
    } catch (error) {
        console.error('Error saving pricing:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save pricing',
        }
    }
}
