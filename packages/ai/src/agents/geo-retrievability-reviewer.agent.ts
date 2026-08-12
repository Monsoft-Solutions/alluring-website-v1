/**
 * GEO Retrievability Reviewer Agent
 *
 * Scores how well a post answers the question a reader arrived with — which is
 * the same thing that determines whether an AI engine can extract a citable
 * answer from it.
 *
 * The design constraint that shapes this whole agent: **presence checks are
 * trivially gameable and therefore worthless on their own.** A writer told to
 * "include one table" will emit a two-column glossary. A writer told to "use
 * question headings" will write a question and then stall for three sentences.
 * Both satisfy a regex and neither helps anyone. So every dimension below
 * scores whether the structure carries information, and a decorative structure
 * is explicitly scored *below* its absence — it costs the reader attention and
 * returns nothing.
 *
 * Sits alongside the other review agents and returns the same `AgentReview`
 * shape, so it needs no special handling in the orchestrator. Its issues are
 * structural, which is why the orchestrator's "no new information" rule needed
 * the reformatting carve-out — see `orchestrator.agent.ts`.
 *
 * @module @workspace/ai/agents/geo-retrievability-reviewer
 */
import { z } from 'zod'

import { analyzeGeoStructure } from '@workspace/shared/content'

import { coreGenerateObject } from '../core'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for GEO retrievability review
 */
const DEFAULT_MODEL_ID = 'claude-opus-5'

/**
 * Schema for the retrievability review
 */
const geoRetrievabilityReviewSchema = z.object({
    score: z
        .number()
        .describe(
            'Overall answer-first retrievability score. Score is between 0 and 100.'
        ),
    metrics: z.object({
        headingQuestionScore: z
            .number()
            .describe(
                'How well H2 headings match the phrasing a reader would search. Score is between 0 and 100.'
            ),
        firstSentenceAnswerScore: z
            .number()
            .describe(
                'How consistently the first sentence under each heading answers that heading directly. Score is between 0 and 100.'
            ),
        chunkSelfContainmentScore: z
            .number()
            .describe(
                'How well each section reads when lifted out and read with no surrounding context. Score is between 0 and 100.'
            ),
        tableValueScore: z
            .number()
            .describe(
                'Whether a comparison table exists AND carries decision-relevant information the prose does not already line up. A decorative or glossary table scores BELOW no table at all. Score 100 when the topic genuinely has nothing to compare and no table is present. Score is between 0 and 100.'
            ),
        evidenceScore: z
            .number()
            .describe(
                'Named statistics and specific figures attributed to identifiable sources, versus vague attribution. Score is between 0 and 100.'
            ),
        negativeCaseScore: z
            .number()
            .describe(
                'Whether the post says who is NOT a good candidate, what the real risks are, or when a simpler option is better. Score 100 when this genuinely does not apply to the topic. Score is between 0 and 100.'
            ),
        ctaMarkerScore: z
            .number()
            .describe(
                'Exactly one <!-- CTA:id --> marker, placed where a reader has learned enough to act. 0 when absent, 0 when more than one. Score is between 0 and 100.'
            ),
    }),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z
                .string()
                .describe(
                    'Where in the content this applies (e.g., "H2: How long does recovery take?", "Introduction", "Section 4")'
                ),
            description: z
                .string()
                .describe(
                    'What is wrong and why it costs the reader something. Be concrete.'
                ),
            suggestedFix: z
                .string()
                .describe(
                    'A specific, applyable instruction. For a missing table, name the rows and columns and say which figures already in the draft fill them. For a heading, give the replacement wording. For a first sentence, write the sentence.'
                ),
            originalText: z
                .string()
                .nullable()
                .describe(
                    'The exact text to change. Null for structural issues with no single passage to point at, such as a missing table or a missing CTA marker.'
                ),
        })
    ),
    strengths: z
        .array(z.string())
        .describe(
            'What the post already does well on these dimensions. Complete sentences.'
        ),
    summary: z
        .string()
        .describe(
            'Summary of the retrievability review. Maximum 500 characters.'
        ),
})

/**
 * System prompt for the GEO retrievability reviewer
 */
const GEO_RETRIEVABILITY_SYSTEM_PROMPT = `You review blog posts for a Miami cosmetic surgery clinic on one question: **does this page answer what the reader came to ask, fast enough and clearly enough that they get it?**

That is also, not coincidentally, what determines whether ChatGPT, Perplexity, Claude or Google's AI Overviews can pull a citable answer out of it. The two goals are the same goal. Judge the reader experience and the retrievability follows.

You are scoring seven dimensions.

**1. Headings are the questions people ask (15%)**
H2s should match how a patient phrases things in a search box. "How long do tummy tuck drains stay in?" beats "Post-Operative Drainage Timeline".
Not every section is a question — a week-by-week timeline is legitimately a statement. Do not penalise a sequence heading that would be worse as a question. Do penalise brochure-speak noun phrases that are hiding a question.

**2. The first sentence answers the heading (25% — the heaviest)**
Under each question heading, the first sentence must deliver the answer. "Most drains come out 7 to 14 days after surgery" — that is an answer. "Drain duration depends on several factors and is a common patient concern" — that is a stall, and it is worse than no heading at all because it promised something and withheld it.
This is the dimension most often faked. Check every question heading individually.

**3. Sections survive being read alone (15%)**
Lift a section out mentally. Does it still make sense? Look for orphaned pronouns ("this procedure"), backward references ("as mentioned above"), and numbers that only exist three sections earlier. Some cross-section repetition is correct and should not be penalised.

**4. Tables that carry a decision (15%)**
A table earns its place when a reader is weighing options along more than one axis — cost against recovery, procedure against procedure, included against extra, week one against week six.

Scoring, and read this carefully:
- A table that helps someone decide: high score.
- **A decorative table — a glossary of terms already defined in the prose, a tabulated list, a single-column-of-substance table — scores LOWER than having no table.** It consumed the reader's attention and gave nothing back. Say so in an issue.
- Topic genuinely has nothing to compare, and there is no table: score 100. Do not manufacture a reason for one. "Comparison", "vs", cost, and candidacy topics almost always have something; a single-procedure recovery narrative often does not.

**5. Evidence (10%)**
Specific figures attributed to identifiable sources. "The ASPS reported 24,000 procedures in 2024" is evidence. "Studies show" is not. Note that citation density is usually already strong on these posts — do not pad this dimension, and do not ask for more citations where the claims are already carried.

**6. The negative case (10%)**
Does the post say who should not do this, what the risks genuinely are, or when a cheaper or simpler option is the better call? Content written so it is useful even to someone who chooses a different clinic is what a reader trusts. Score 100 where the topic truly has no negative case, but that is rarer than writers assume.

**7. CTA marker (10%)**
Exactly one \`<!-- CTA:id -->\` on its own line, at the point where a reader has learned enough to want to talk to someone.
- Zero markers: score 0. The renderer falls back to splitting the article at roughly the 40% line, which drops the CTA wherever the arithmetic lands.
- Two or more: score 0 and raise it as critical. Only the first is removed from the body; the rest break the page.

Scoring bands:
- 90-100: Answers the reader immediately and completely
- 75-89: Solid, one or two sections bury their answer
- 60-74: Real structural work needed
- 40-59: Reads as a topic essay rather than an answer
- 0-39: A reader would leave without their answer

Issue severity:
- critical: no answer to the head query, a heading that stalls, a decorative table, zero or multiple CTA markers
- warning: brochure-speak headings, sections that cannot stand alone, missing negative case where it clearly applies
- suggestion: polish

**How to write suggestedFix**
The orchestrator applies your fixes and is forbidden from inventing facts. So write fixes it can actually carry out using only what the draft already contains:
- Missing table → name the columns, name the rows, and point at the figures already in the draft that fill them. If the numbers are not in the draft, say so and ask for the table to be dropped rather than invented.
- Stalling first sentence → write the replacement sentence, using a figure already in that section.
- Brochure heading → give the exact replacement wording.
- Missing CTA marker → name the section it should go after and the id to use.

Never ask for a fact, statistic, price or claim the draft does not already contain.

**Output Requirements**
You MUST provide valid JSON matching the expected schema.
1. Every required field must have a value.
2. Only include issues where you can supply severity, location, description and suggestedFix.
3. Set "originalText" to null for structural issues (missing table, missing CTA marker) that have no single passage to point at.
4. An empty issues array is correct when there is nothing wrong.`

/**
 * Regex-derived context handed to the model.
 *
 * Cheap mechanical facts it would otherwise have to count by eye, and getting
 * them wrong is the difference between a real finding and a hallucinated one.
 */
function buildStructuralContext(content: string): string {
    const analysis = analyzeGeoStructure(content)

    return `- Section headings: ${analysis.headings.length} (${analysis.questionHeadings.length} phrased as questions)
- Markdown tables present: ${analysis.tableCount}
- CTA markers: ${analysis.ctaMarkers.length}${analysis.ctaMarkers.length > 0 ? ` (${analysis.ctaMarkers.join(', ')})` : ''}
- Internal links: ${analysis.internalLinkCount} (the internal-links reviewer owns these — do not duplicate its findings)
- External links: ${analysis.externalLinkCount}

Headings in order:
${
    analysis.headings
        .map(
            (heading) =>
                `  ${'  '.repeat(heading.level - 2)}- H${heading.level}: ${heading.text}`
        )
        .join('\n') || '  (none)'
}`
}

/**
 * Run the GEO retrievability reviewer agent
 */
export async function runGeoRetrievabilityReviewer(
    options: ReviewAgentOptions
): Promise<AgentReview> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.3,
    } = options

    const prompt = `Review this blog post for answer-first retrievability.

**Title:** ${title}
**Primary keyword:** ${primaryKeyword || 'Not specified'}

The reader searched something close to "${primaryKeyword || title}" and landed here.

**Structure (counted mechanically — trust these numbers over your own count):**
${buildStructuralContext(content)}

---

**Full Content:**
${content}

---

Score the seven dimensions. For each question heading, check its first sentence individually. Judge the table on whether it helps someone decide, not on whether it exists. Write fixes the orchestrator can apply using only facts already in this draft.`

    const result = await coreGenerateObject({
        modelId,
        schema: geoRetrievabilityReviewSchema,
        system: GEO_RETRIEVABILITY_SYSTEM_PROMPT,
        prompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    return {
        agentName: 'geo-retrievability-reviewer',
        score: result.object.score,
        issues: result.object.issues as ReviewIssue[],
        summary: result.object.summary,
        processingTimeMs,
        modelId,
    }
}
