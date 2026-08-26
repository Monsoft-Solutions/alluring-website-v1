/**
 * MDX Source Normalisation
 *
 * Blog content is MDX, not plain markdown, so every `<` in the source is a
 * potential JSX tag. A `<` followed by anything that cannot start a tag name
 * is a hard compile error, and because posts render in a server component that
 * error takes the whole page down with a 500 — not a degraded block.
 *
 * That is not hypothetical: `BMI <30` and `(<0.5%)` inside image alt text took
 * /blog/combine-bbl-tummy-tuck-miami and /blog/safe-plastic-surgery-miami off
 * the site while both stayed listed in the sitemap. Comparison operators are
 * exactly the shape medical copy keeps producing ("under 0.5%", "BMI <30"), so
 * this normalises the source instead of relying on authors to escape by hand.
 *
 * @module lib/utils/mdx-source
 */

/**
 * Segments that MDX never parses as JSX: fenced blocks and inline code spans.
 * A `<` inside these is already literal, and escaping it there would leak a
 * visible `&lt;` into the rendered code.
 */
const CODE_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g

/**
 * A `<` that cannot open a tag or a closing tag.
 *
 * Anything starting with a letter is left alone so real markup keeps working —
 * both the registered components (`<Figure />`, `<CalloutBox>`, `<QuickAnswer />`)
 * and plain HTML (`<div>`, `<sup>`). Everything else — digits, punctuation,
 * whitespace, `!`, end of input — is prose and gets escaped.
 */
const STRAY_ANGLE_BRACKET = /<(?![A-Za-z/])/g

/**
 * Escapes `<` characters that would otherwise be parsed as the start of a JSX
 * tag, leaving code spans and genuine markup untouched.
 *
 * @param source - Raw MDX/markdown content as authored
 * @returns Source safe to hand to the MDX compiler
 */
export function normalizeMdxSource(source: string): string {
    return source
        .split(CODE_SEGMENT)
        .map((segment, index) =>
            // split() with a capturing group yields code segments at odd
            // indices — those pass through verbatim.
            index % 2 === 1
                ? segment
                : segment.replace(STRAY_ANGLE_BRACKET, '&lt;')
        )
        .join('')
}
