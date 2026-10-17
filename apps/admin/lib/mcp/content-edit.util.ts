/**
 * Content Edit Utilities
 *
 * Exact find-and-replace edits for the MCP `update_post` tool. An agent
 * fixing one sentence in a 3,000-word post should send that sentence, not
 * re-send the whole body — a full rewrite through a tool call is where
 * silent truncation and drift creep in.
 *
 * Same contract as Claude Code's own Edit tool: each `oldText` must occur
 * exactly once in the content as it stands after the previous edits, and the
 * edits apply all-or-nothing. Pure, so tests can pin it.
 *
 * @module @/lib/mcp/content-edit.util
 */

/** One exact replacement. */
export type ContentEdit = {
    /** Text copied exactly from the current content. Must occur once. */
    oldText: string
    /** Its replacement. Empty deletes `oldText`. */
    newText: string
}

export type ContentEditResult =
    | { ok: true; content: string }
    | { ok: false; error: string }

/** Count non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack: string, needle: string): number {
    let count = 0
    let from = 0
    for (;;) {
        const index = haystack.indexOf(needle, from)
        if (index === -1) return count
        count++
        from = index + needle.length
    }
}

/**
 * Apply edits in order. Fails on the first edit whose `oldText` is empty,
 * missing or ambiguous, naming it, and leaves the input untouched.
 */
export function applyContentEdits(
    content: string,
    edits: readonly ContentEdit[]
): ContentEditResult {
    let current = content

    for (const [i, edit] of edits.entries()) {
        const label = `Edit ${i + 1}`

        if (!edit.oldText) {
            return { ok: false, error: `${label}: oldText is empty` }
        }
        if (edit.oldText === edit.newText) {
            return {
                ok: false,
                error: `${label}: oldText and newText are identical`,
            }
        }

        const occurrences = countOccurrences(current, edit.oldText)
        if (occurrences === 0) {
            return {
                ok: false,
                error: `${label}: oldText not found in the content (after the edits before it). Re-read the post with get_post and copy the text exactly.`,
            }
        }
        if (occurrences > 1) {
            return {
                ok: false,
                error: `${label}: oldText occurs ${occurrences} times; include more surrounding text so it matches once.`,
            }
        }

        // Replacer function: `$&`-style patterns in newText stay literal.
        current = current.replace(edit.oldText, () => edit.newText)
    }

    return { ok: true, content: current }
}
