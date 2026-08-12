/**
 * Local Pipeline Test Run
 *
 * Creates pipeline posts and drives them through generate → review → extract
 * against whatever database the local env points at, using the same
 * `pipeline-phase.service` functions the admin UI and the autopilot workflow
 * call. Nothing here is a reimplementation — the point is to exercise the real
 * path without clicking through a Kanban board for twenty minutes.
 *
 * Image generation is deliberately skipped (`chain: false` between phases): it
 * costs fal.ai credits and has nothing to do with the content template.
 *
 * The topics are chosen to pull on different parts of the answer-first
 * standard, including one that *should not* produce a table and one whose
 * sections are legitimately sequential rather than question-shaped — a run
 * where every post looks identical would tell us nothing.
 *
 * Usage:
 *   pnpm --filter admin pipeline:local -- --list
 *   pnpm --filter admin pipeline:local -- --only comparison
 *   pnpm --filter admin pipeline:local -- --all
 */
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

import { eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { runGeoAuditGate } from '@workspace/shared/content'

import { evaluateSingleTopic } from '@/lib/services/ideation-gate.service'
import { createPipelinePostInternal } from '@/lib/services/pipeline-post.service'
import {
    runExtractPhaseForPost,
    runGenerationPhaseForPost,
    runReviewPhaseForPost,
} from '@/lib/services/pipeline-phase.service'

type TestTopic = {
    key: string
    title: string
    primaryKeyword: string
    secondaryKeywords: string[]
    contentType: 'guide' | 'comparison' | 'faq' | 'tutorial' | 'case-study'
    topic: string
    uniqueAngle: string
    estimatedWordCount: number
    /** What this topic is meant to prove */
    tests: string
    /** False where a table would be manufactured rather than useful */
    expectTable: boolean
}

const TOPICS: TestTopic[] = [
    {
        key: 'comparison',
        title: 'Neck Lift vs Facelift: Which One Addresses What',
        primaryKeyword: 'neck lift vs facelift',
        secondaryKeywords: [
            'platysmaplasty',
            'jawline surgery options',
            'neck lift recovery',
        ],
        contentType: 'comparison',
        topic: 'How a neck lift and a facelift differ in what they correct, cost, recovery and longevity',
        uniqueAngle:
            'Patients usually ask for the wrong one of the two — what the mirror test actually tells you',
        estimatedWordCount: 1400,
        tests: 'decision table is mandatory for comparison type; choose-A-if / choose-B-if block',
        expectTable: true,
    },
    {
        key: 'cost',
        title: 'What Is Actually Included in a Thigh Lift Quote',
        primaryKeyword: 'thigh lift quote inclusions',
        secondaryKeywords: [
            'thighplasty price breakdown',
            'thigh lift anesthesia fee',
            'thigh lift garments',
        ],
        contentType: 'guide',
        topic: 'What a thigh lift quote covers versus what gets billed separately',
        uniqueAngle:
            'The line items that turn a quoted price into a different final number',
        estimatedWordCount: 1300,
        tests: 'number-first Quick Answer; included-vs-extra table',
        expectTable: true,
    },
    {
        key: 'candidacy',
        title: 'Renuvion Skin Tightening: Who It Works For and Who It Does Not',
        primaryKeyword: 'renuvion skin tightening candidate',
        secondaryKeywords: [
            'renuvion vs surgery',
            'skin laxity treatment limits',
            'renuvion results',
        ],
        contentType: 'guide',
        topic: 'Renuvion candidacy, realistic results, and when surgery is the better call',
        uniqueAngle:
            'Written to be useful to someone who turns out to need a lift instead',
        estimatedWordCount: 1400,
        tests: 'the negative case — who should NOT do this',
        expectTable: true,
    },
    {
        key: 'sequence',
        title: 'Arm Lift Recovery: What to Expect Week by Week',
        primaryKeyword: 'arm lift recovery',
        secondaryKeywords: [
            'brachioplasty recovery time',
            'arm lift swelling',
            'arm lift scars',
        ],
        contentType: 'guide',
        topic: 'Week-by-week recovery timeline after brachioplasty',
        uniqueAngle:
            'Day-level detail on what is normal versus what warrants a call',
        estimatedWordCount: 1300,
        tests: 'sequential sections should stay statements, not be contorted into questions',
        expectTable: true,
    },
    {
        key: 'faq',
        title: 'Gynecomastia Surgery: The Questions Men Actually Ask',
        primaryKeyword: 'gynecomastia surgery questions',
        secondaryKeywords: [
            'male breast reduction recovery',
            'gynecomastia surgery cost',
            'gynecomastia scars',
        ],
        contentType: 'faq',
        topic: 'Common patient questions about male breast reduction surgery',
        uniqueAngle:
            'The questions men are least likely to ask out loud in a consultation',
        estimatedWordCount: 1200,
        tests: 'FAQ type — every H2 should already be a question; first-sentence answers',
        expectTable: false,
    },
]

function parseArgs(argv: string[]) {
    const onlyFlag = argv.indexOf('--only')
    return {
        list: argv.includes('--list'),
        all: argv.includes('--all'),
        gateOnly: argv.includes('--gate'),
        only: onlyFlag >= 0 ? (argv[onlyFlag + 1] ?? null) : null,
    }
}

/**
 * Dry-run every topic against the keyword-ownership gate.
 *
 * Worth doing before a batch: the gate is registry logic, so it costs nothing,
 * and a topic it rejects would otherwise waste a full generation run.
 */
async function checkGates(): Promise<void> {
    for (const topic of TOPICS) {
        const verdict = await evaluateSingleTopic({
            title: topic.title,
            primaryKeyword: topic.primaryKeyword,
            secondaryKeywords: topic.secondaryKeywords,
        })
        const badge = verdict.verdict.toUpperCase().padEnd(8)
        console.log(`${badge} ${topic.key.padEnd(12)} ${topic.title}`)
        if (verdict.verdict !== 'new') {
            console.log(`${' '.repeat(9)}${verdict.reason ?? ''}`)
        }
    }
}

function elapsed(since: number): string {
    return `${Math.round((Date.now() - since) / 1000)}s`
}

async function runOne(topic: TestTopic): Promise<void> {
    const started = Date.now()
    console.log(`\n${'='.repeat(72)}`)
    console.log(`${topic.key} — ${topic.title}`)
    console.log(`tests: ${topic.tests}`)
    console.log('='.repeat(72))

    const created = await createPipelinePostInternal({
        title: topic.title,
        primaryKeyword: topic.primaryKeyword,
        secondaryKeywords: topic.secondaryKeywords,
        ideaApproval: 'approved',
        planningData: {
            topic: topic.topic,
            uniqueAngle: topic.uniqueAngle,
            contentType: topic.contentType,
            estimatedWordCount: topic.estimatedWordCount,
            targetAudience: 'Women 25-55 considering cosmetic procedures',
        },
    })

    if (!created.success) {
        // Usually the keyword-ownership gate: a topic whose cluster is already
        // owned by a money page or an existing post never enters the pipeline.
        console.error(
            `  create rejected: ${created.error}${created.gate ? ` (gate: ${created.gate.verdict})` : ''}`
        )
        return
    }

    const postId = created.id
    console.log(`  created ${postId} (gate: ${created.gate.verdict})`)

    // The board moves a post to `generate` before the phase will run.
    await db
        .update(blogPost)
        .set({ status: 'generate' })
        .where(eq(blogPost.id, postId))

    const phases: Array<
        [string, () => Promise<{ success: boolean; error?: string }>]
    > = [
        [
            'generation',
            () => runGenerationPhaseForPost(postId, { chain: false }),
        ],
        [
            'review + orchestration',
            () => runReviewPhaseForPost(postId, { chain: false }),
        ],
        // chain:false stops the run before image generation, which costs
        // fal.ai credits and is unrelated to the content template.
        ['extraction', () => runExtractPhaseForPost(postId, { chain: false })],
    ]

    for (const [name, run] of phases) {
        const phaseStart = Date.now()
        process.stdout.write(`  ${name}... `)
        const result = await run()
        if (!result.success) {
            console.log(`FAILED (${elapsed(phaseStart)}): ${result.error}`)
            return
        }
        console.log(`ok (${elapsed(phaseStart)})`)
    }

    const [post] = await db
        .select({
            content: blogPost.content,
            quickAnswer: blogPost.quickAnswer,
            slug: blogPost.slug,
            pipelineState: blogPost.pipelineState,
        })
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    if (!post?.content) {
        console.log('  no content persisted')
        return
    }

    const { passed, failures, analysis } = runGeoAuditGate(post.content, {
        quickAnswer: post.quickAnswer,
        expectTable: topic.expectTable,
    })

    const reviews = post.pipelineState?.reviewPhase?.reviews ?? []
    const geo = reviews.find(
        (r) => r.agentName === 'geo-retrievability-reviewer'
    )
    const stripped =
        post.pipelineState?.generationPhase?.sanitizationActions ?? []

    console.log(`\n  slug           ${post.slug}`)
    console.log(`  words          ${analysis.wordCount}`)
    console.log(
        `  question hdgs  ${analysis.questionHeadings.length}/${analysis.headings.length}`
    )
    console.log(`  tables         ${analysis.tableCount}`)
    console.log(
        `  CTA markers    ${analysis.ctaMarkers.length}${analysis.ctaId ? ` (${analysis.ctaId})` : ''}`
    )
    console.log(`  external links ${analysis.externalLinkCount}`)
    console.log(`  quick answer   ${post.quickAnswer ? 'yes' : 'NO'}`)
    console.log(`  review agents  ${reviews.length}`)
    console.log(
        `  geo score      ${geo ? `${geo.score}/100 (${geo.issues.length} issues)` : 'MISSING'}`
    )
    console.log(`  mdx stripped   ${stripped.length}`)
    for (const action of stripped) console.log(`    - ${action.detail}`)
    console.log(
        `  GATE           ${passed ? 'PASS' : `FAIL — ${failures.join('; ')}`}`
    )
    console.log(`  total          ${elapsed(started)}`)
}

async function main() {
    const args = parseArgs(process.argv.slice(2))

    if (args.list) {
        for (const topic of TOPICS) {
            console.log(`${topic.key.padEnd(12)} ${topic.title}`)
            console.log(`${' '.repeat(13)}${topic.tests}`)
        }
        return
    }

    if (args.gateOnly) {
        await checkGates()
        return
    }

    const selected = args.only
        ? TOPICS.filter((topic) => topic.key === args.only)
        : args.all
          ? TOPICS
          : TOPICS.slice(0, 1)

    if (selected.length === 0) {
        console.error(`No topic matched "${args.only}". Try --list.`)
        process.exitCode = 1
        return
    }

    // Sequential on purpose: each post already fans out to seven review agents,
    // and five posts in flight would be thirty-five concurrent model calls.
    for (const topic of selected) {
        await runOne(topic)
    }
}

main()
    .catch((error) => {
        console.error('pipeline run failed:', error)
        process.exitCode = 1
    })
    .finally(() => process.exit())
