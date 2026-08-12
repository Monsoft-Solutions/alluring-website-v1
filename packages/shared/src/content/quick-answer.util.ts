/**
 * Quick Answer Serialization
 *
 * `blog_post.quick_answer` holds both halves of the Quick Answer — the question
 * a reader typed and the answer they get — in one nullable text column, split
 * by a blank line.
 *
 * One column rather than two, or JSON, because the field has to stay editable
 * by hand in the admin post editor. A copywriter fixing a number should be
 * editing a paragraph, not a JSON blob or a pair of inputs that can drift out
 * of sync.
 *
 * The AI pipeline writes it and the blog renderer reads it, so the format lives
 * here rather than on either side.
 *
 * @module @workspace/shared/content
 */

/** The two halves of a Quick Answer. */
export type QuickAnswerParts = {
    /** The head query in the reader's words. Null on hand-written values that omit it. */
    question: string | null
    /** The standalone, number-first answer. */
    answer: string
}

/** Renders the two halves into the stored column format. */
export function serializeQuickAnswer(parts: QuickAnswerParts): string {
    const question = parts.question?.trim()
    const answer = parts.answer.trim()

    return question ? `${question}\n\n${answer}` : answer
}

/**
 * Parses a stored Quick Answer.
 *
 * Returns null for empty or missing values so callers can branch on presence
 * alone. A value with no blank-line split is treated as answer-only, which is
 * what a hand-written or backfilled row can look like.
 */
export function parseQuickAnswer(
    stored: string | null | undefined
): QuickAnswerParts | null {
    const trimmed = stored?.trim()
    if (!trimmed) return null

    const [first, ...rest] = trimmed.split(/\n\s*\n/)

    if (rest.length === 0) {
        const answer = first?.trim() ?? ''
        return answer ? { question: null, answer } : null
    }

    return {
        question: first?.trim() || null,
        answer: rest.join('\n\n').trim(),
    }
}
