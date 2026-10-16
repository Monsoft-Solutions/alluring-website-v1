// Run the pipeline's own MDX validator (packages/ai validateGeneratedMdx) over
// post bodies. Used by check_post.py; not a command you need to run by hand.
//
//   echo '{"<slug>": "<markdown>"}' | node blog/tools/lib/mdx_check.mjs
//
// Prints {"<slug>": {"clean": bool, "actions": [{kind, detail}]}}. A body is
// fit to publish only when clean is true: every action is something the
// renderer would have thrown on, silently dropped, or escaped.
import { readFileSync } from 'node:fs'

import { importRepo, registerTsx } from './repo.mjs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
await registerTsx()
const { validateGeneratedMdx } = await importRepo(
    'packages/ai/src/functions/validate-generated-mdx.function.ts'
)

const out = {}
for (const [slug, body] of Object.entries(input)) {
    const { clean, actions } = validateGeneratedMdx(body)
    out[slug] = { clean, actions }
}
process.stdout.write(JSON.stringify(out))
