/**
 * Extract Quick Answer Function
 *
 * Produces the 40–70 word answer to a post's head query, stored on
 * `blog_post.quick_answer` and rendered above the article body.
 *
 * Deliberately separate from `extractMetadata`, which truncates the article at
 * 3,000 characters. A Quick Answer has to lead with a real number, and the
 * number is usually a cost or a timeline that appears in the middle of the
 * piece — built from the intro alone it comes out confident and vague, which is
 * the one thing it must not be.
 *
 * The format exists because a reader wants it, not because engines like it.
 * Someone who searched "how long do drains stay in" wants "7 to 14 days" before
 * they want anything else. That it also happens to be the most extractable
 * possible shape is a side effect.
 *
 * @module @workspace/ai/functions/extract-quick-answer
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Re-exported so pipeline code has one import for extraction and storage.
 * The format itself lives in `@workspace/shared/content` because the blog
 * renderer reads the same column.
 */
export {
    serializeQuickAnswer,
    parseQuickAnswer,
} from '@workspace/shared/content'

/**
 * Word bounds, per `docs/seo/geo-strategy-us-audience.md` §4.1.
 *
 * Below the floor there is no room for the qualifier that keeps a medical claim
 * honest; above the ceiling it stops being liftable as a single quote.
 */
export const QUICK_ANSWER_MIN_WORDS = 40
export const QUICK_ANSWER_MAX_WORDS = 70

/**
 * Quick Answer extraction schema
 */
export const quickAnswerSchema = z.object({
    /** The question the post actually answers, phrased the way a patient types it */
    question: z
        .string()
        .min(10)
        .max(160)
        .describe(
            'The head query in the reader\'s own words, ending in a question mark. E.g. "How long do tummy tuck drains stay in?"'
        ),
    /** The answer itself — number first, standalone, 40-70 words */
    answer: z
        .string()
        .min(120)
        .max(700)
        .describe(
            'A 40-70 word answer that opens with the specific number or timeframe and reads correctly with no surrounding context.'
        ),
})

export type QuickAnswerResult = z.infer<typeof quickAnswerSchema>

export type ExtractQuickAnswerOptions = {
    /** Full blog post content (markdown) — not truncated */
    content: string
    /** Post title for context */
    title: string
    /** Primary keyword, used to identify the head query */
    primaryKeyword?: string
    /** Model ID to use */
    modelId?: string
}

const DEFAULT_MODEL_ID = 'claude-opus-5'

const QUICK_ANSWER_SYSTEM_PROMPT = `You write the Quick Answer that sits at the top of a blog post for Alluring Plastic Surgery, a cosmetic surgery clinic in Miami.

A reader who searched a question and landed here gets about nine seconds before they leave. The Quick Answer is what they read in those nine seconds. Write it for that person.

**The question**
Phrase it the way a patient types it into a search box, not the way a brochure would title a section. "How much does a BBL cost in Miami?" — not "BBL Pricing Overview".

**The answer**
- ${QUICK_ANSWER_MIN_WORDS}-${QUICK_ANSWER_MAX_WORDS} words. Not shorter, not longer.
- Open with the number, range, or timeframe. "Most drains come out 7 to 14 days after surgery." Never open with "At Alluring, we believe" or "It depends".
- It must stand completely alone. Someone reading only these sentences, with no article around them, should get a correct and useful answer. No "as mentioned above", no "this procedure", no pronoun whose referent is in a paragraph they haven't read.
- Every number must already appear in the article. You are lifting the answer out of the piece, not writing a new one. If the article never commits to a number, say what it does commit to — a range, a typical case, a "depends on X" with X named.
- Include the honest qualifier when one exists. "Most patients" and "usually" are accurate; deleting them to sound confident makes it wrong.
- Plain sentences. No bullet points, no markdown, no headings, no bold.

**Never**
- Invent, round, or extrapolate a figure the article does not contain.
- Promise a result, guarantee an outcome, or imply the clinic is the only good option.
- Use "revolutionary", "world-class", "cutting-edge", or any adjective doing the work a number should do.`

/**
 * Count words the same way the pipeline does elsewhere.
 */
function countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Extract the Quick Answer from finished blog content.
 *
 * @param options - Extraction options
 * @returns The head question and its standalone answer
 *
 * @example
 * ```typescript
 * const quickAnswer = await extractQuickAnswer({
 *   content: finalMarkdown,
 *   title: 'Tummy Tuck Drains: What They Are and How Long They Stay In',
 *   primaryKeyword: 'tummy tuck drains',
 * })
 *
 * console.log(quickAnswer.answer)
 * // "Most tummy tuck drains come out 7 to 14 days after surgery, once..."
 * ```
 */
export async function extractQuickAnswer(
    options: ExtractQuickAnswerOptions
): Promise<QuickAnswerResult> {
    const {
        content,
        title,
        primaryKeyword,
        modelId = DEFAULT_MODEL_ID,
    } = options

    const prompt = `Write the Quick Answer for this post.

**Title:** ${title}
**Primary keyword:** ${primaryKeyword || 'Not specified'}

The reader searched something close to "${primaryKeyword || title}" and landed here. What do they need to know before anything else?

---

${content}

---

Give the question in the reader's words, and a ${QUICK_ANSWER_MIN_WORDS}-${QUICK_ANSWER_MAX_WORDS} word answer that opens with the number and stands alone. Use only figures that appear above.`

    const result = await coreGenerateObject({
        modelId,
        schema: quickAnswerSchema,
        system: QUICK_ANSWER_SYSTEM_PROMPT,
        prompt,
        temperature: 0.3,
    })

    const wordCount = countWords(result.object.answer)
    if (
        wordCount < QUICK_ANSWER_MIN_WORDS ||
        wordCount > QUICK_ANSWER_MAX_WORDS
    ) {
        // Advisory only. A 38- or 74-word answer is still far better than none,
        // and failing the phase over it would cost the whole post.
        console.warn(
            `[Quick Answer] ${wordCount} words, outside the ${QUICK_ANSWER_MIN_WORDS}-${QUICK_ANSWER_MAX_WORDS} target`
        )
    }

    return result.object
}
