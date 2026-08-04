/**
 * Sanitization Utilities
 *
 * Provides helpers to safely serialize objects for JSON-LD and to escape
 * potentially dangerous characters to reduce XSS risk when embedding
 * structured data.
 *
 * These escapes are load-bearing: `JsonLd` writes the result straight into a
 * server-rendered `<script type="application/ld+json">` via
 * `dangerouslySetInnerHTML`, so nothing else stands between the data and the
 * HTML document.
 */

/**
 * Escape characters in a JSON string that could break out of a script tag.
 *
 * - Every `<` (U+003C) becomes its JSON unicode escape, so a closing
 *   `script` tag or an HTML comment opener sitting inside the data can never
 *   terminate the enclosing tag.
 * - `>` (U+003E) and `&` (U+0026) are escaped for symmetry, keeping the
 *   payload inert in any HTML parsing context.
 * - U+2028/U+2029 are escaped because they are valid JSON but illegal raw
 *   line terminators in JavaScript source.
 *
 * The escape sequences we emit contain none of the characters being replaced,
 * so the replacements cannot cascade regardless of order.
 *
 * @param json - A JSON string, typically the output of `JSON.stringify`.
 * @returns The same JSON with HTML/JS-hazardous characters escaped.
 */
export function escapeJsonForHtml(json: string): string {
    return json
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
}

/**
 * Safely stringify and sanitize an object for embedding in JSON-LD.
 *
 * @param value - The structured-data object to serialize.
 * @returns A JSON string safe to inline inside a script tag.
 */
export function sanitizeForJsonLd<T>(value: T): string {
    const json = JSON.stringify(value)
    return escapeJsonForHtml(json)
}
