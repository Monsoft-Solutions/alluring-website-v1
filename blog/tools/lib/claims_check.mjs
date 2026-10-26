// Claim tokens and typed Alluring prices in a post's fields (issue #354),
// with the same code the site and the admin use (packages/shared/src/claims).
// Used by check_post.py; not a command you need to run by hand.
//
//   echo '{"<slug>|<field>": "<text>"}' | node blog/tools/lib/claims_check.mjs
//
// Prints {"<key>": {"tokens": [...], "typed": [...]}}: each entry a one-line
// problem. `tokens` are tokens that would render as nothing (unknown name,
// bad argument, unknown line, malformed or unclosed); `typed` are Alluring
// prices typed as dollar figures, which never follow an admin price edit, with
// the token to write instead. Checked against the 2026-09-15 fallback sheet:
// a line added only in the admin is unknown here, so validate such a post in
// the admin or over the MCP.
import { readFileSync } from 'node:fs'

import { importRepo, registerTsx } from './repo.mjs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
await registerTsx()
const { validateClaimTokens } = await importRepo(
    'packages/shared/src/claims/tokens.ts'
)
const { findTypedPrices } = await importRepo(
    'packages/shared/src/claims/typed-prices.ts'
)

const out = {}
for (const [key, text] of Object.entries(input)) {
    const { errors } = validateClaimTokens(text ?? '')
    out[key] = {
        tokens: errors.map(
            (error) =>
                `${error.raw} — ${error.reason}${error.suggestion ? ` Did you mean ${error.suggestion}?` : ''}`
        ),
        typed: findTypedPrices(text ?? '').map(
            (issue) => `${issue.raw} — ${issue.reason}`
        ),
    }
}
process.stdout.write(JSON.stringify(out))
