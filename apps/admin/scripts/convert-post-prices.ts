/**
 * Typed Prices → Claim Tokens in Blog Posts (issue #354)
 *
 * One-off migration for the claims canon: no Alluring price is typed in a
 * post any more. Each typed dollar figure that fits exactly one price-sheet
 * line becomes that line's token (`$3,000` next to "mini tummy tuck" →
 * `[[price:tummy-tuck:mini]]`), and the BBL range phrase and the combination
 * discount sentence become `[[price-range:bbl]]` and `[[combo-discount]]`,
 * through `convertTypedPrices` (`@workspace/shared/claims/typed-prices`),
 * the same code the AI pipeline runs. With no discount on, every post renders
 * exactly as before; once a price or discount changes in the admin, the post
 * follows it.
 *
 * Figures that fit no single line (a "$500" shared by four lipo add-ons, a
 * third party's price) are left as typed and listed, for a person to fix in
 * the admin or over the MCP, which now reject them.
 *
 * Fields: content, title, meta title and description, excerpt, quick answer
 * and every FAQ question and answer, of every post that is not a refresh
 * working copy.
 *
 * Dry run by default: prints what would change. `--apply` writes, per post in
 * one transaction, a `blog_post_revision` (reason `claims-tokens`) and then
 * the converted fields, and afterwards dismisses the post's open refresh
 * candidates, so autopilot doesn't overwrite the conversion with a stale
 * working copy. Runs against whatever database the local env points at;
 * rehearse on a `--db clone` worktree, then the user runs it on production
 * with POSTGRES_URL set explicitly.
 *
 * Usage:
 *   pnpm --filter admin claims:convert-posts            # dry run
 *   pnpm --filter admin claims:convert-posts -- --apply # write
 *   pnpm --filter admin claims:convert-posts -- --slug <slug> [--apply]
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

type Faq = { question: string; answer: string }

async function main() {
    // Imported after dotenv so @workspace/db reads the right POSTGRES_URL.
    const { and, eq, inArray, isNull } = await import('drizzle-orm')
    const { db } = await import('@workspace/db/client')
    const { blogPost, blogPostRevision, contentRefresh } = await import(
        '@workspace/db/schema/blog'
    )
    const { priceLine, pricingSettings, procedurePricing } = await import(
        '@workspace/db/schema/pricing'
    )
    const { buildPricingSnapshotFromRows } = await import(
        '@workspace/shared/claims/prices'
    )
    const { convertTypedPrices } = await import(
        '@workspace/shared/claims/typed-prices'
    )
    const { buildRevisionValues } = await import(
        '../lib/utils/refresh-merge.util'
    )

    const args = process.argv.slice(2)
    const apply = args.includes('--apply')
    const slugArg = args.indexOf('--slug')
    const onlySlug = slugArg >= 0 ? args[slugArg + 1] : undefined

    const [lines, procedures, settings] = await Promise.all([
        db.select().from(priceLine),
        db.select().from(procedurePricing),
        db.select().from(pricingSettings).limit(1),
    ])
    const pricing = buildPricingSnapshotFromRows({
        lines,
        procedures,
        settings: settings[0] ?? null,
    })
    console.log(
        `Pricing: ${pricing.source} (${pricing.lines.length} lines). ${apply ? 'APPLYING' : 'Dry run'}.`
    )

    const posts = await db
        .select()
        .from(blogPost)
        .where(
            onlySlug
                ? eq(blogPost.slug, onlySlug)
                : isNull(blogPost.refreshOfPostId)
        )

    let changedPosts = 0
    let convertedFigures = 0
    let leftFigures = 0

    for (const post of posts) {
        const report: string[] = []
        const convert = (field: string, text: string | null) => {
            if (!text || !text.includes('$')) return text
            const result = convertTypedPrices(text, { pricing })
            for (const c of result.converted) {
                report.push(`  ${field}: ${c.raw} → ${c.token}`)
            }
            for (const r of result.remaining) {
                report.push(`  ${field}: LEFT ${r.raw} (${r.reason})`)
            }
            convertedFigures += result.converted.length
            leftFigures += result.remaining.length
            return result.text
        }

        const faqs = (post.faqs as Faq[] | null)?.map((faq, index) => ({
            ...faq,
            question: convert(`faqs[${index}].question`, faq.question) ?? '',
            answer: convert(`faqs[${index}].answer`, faq.answer) ?? '',
        }))
        const next = {
            title: convert('title', post.title) ?? post.title,
            content: convert('content', post.content) ?? post.content,
            metaTitle: convert('metaTitle', post.metaTitle),
            metaDescription: convert('metaDescription', post.metaDescription),
            excerpt: convert('excerpt', post.excerpt),
            quickAnswer: convert('quickAnswer', post.quickAnswer),
            faqs: faqs ?? post.faqs,
        }

        const changed =
            next.title !== post.title ||
            next.content !== post.content ||
            next.metaTitle !== post.metaTitle ||
            next.metaDescription !== post.metaDescription ||
            next.excerpt !== post.excerpt ||
            next.quickAnswer !== post.quickAnswer ||
            JSON.stringify(next.faqs) !== JSON.stringify(post.faqs)

        if (!report.length) continue
        console.log(
            `\n${post.slug} [${post.status}]${changed ? '' : ' (nothing convertible)'}`
        )
        for (const line of report) console.log(line)
        if (!changed) continue
        changedPosts += 1
        if (!apply) continue

        await db.transaction(async (tx) => {
            await tx
                .insert(blogPostRevision)
                .values(buildRevisionValues(post, 'claims-tokens'))
            await tx.update(blogPost).set(next).where(eq(blogPost.id, post.id))
        })
        const dismissed = await db
            .update(contentRefresh)
            .set({ status: 'dismissed' })
            .where(
                and(
                    eq(contentRefresh.blogPostId, post.id),
                    inArray(contentRefresh.status, [
                        'pending',
                        'ready_for_review',
                    ])
                )
            )
            .returning({
                id: contentRefresh.id,
                workingPostId: contentRefresh.workingPostId,
            })
        for (const row of dismissed) {
            if (row.workingPostId) {
                await db
                    .delete(blogPost)
                    .where(eq(blogPost.id, row.workingPostId))
            }
        }
        if (dismissed.length) {
            console.log(`  dismissed ${dismissed.length} refresh candidate(s)`)
        }
    }

    console.log(
        `\n${changedPosts} post(s) ${apply ? 'converted' : 'to convert'}; ${convertedFigures} figure(s) ${apply ? 'written' : 'would be written'} as tokens; ${leftFigures} left for a person.`
    )
    if (apply && changedPosts) {
        console.log(
            'Revalidate the blog on the web app (the admin does it on its next save, or POST /api/revalidate with the blog tags).'
        )
    }
    process.exit(0)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
