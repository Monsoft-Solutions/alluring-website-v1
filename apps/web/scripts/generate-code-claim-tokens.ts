/**
 * Writes `packages/shared/src/claims/code-tokens.generated.ts`: the price
 * claim tokens the web app's code writes, which the admin Pricing page keeps
 * from printing nothing (issue #354). See `code-claim-tokens.lib.ts`.
 *
 * Usage: pnpm --filter web claims:code-tokens
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import {
    GENERATED_FILE,
    REPO_ROOT,
    renderCodeClaimTokensModule,
    scanCodeClaimTokens,
} from './code-claim-tokens.lib'

const tokens = scanCodeClaimTokens()
writeFileSync(GENERATED_FILE, renderCodeClaimTokensModule(tokens))
execFileSync('pnpm', ['exec', 'prettier', '--write', GENERATED_FILE], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
})
console.log(
    `${tokens.length} token(s) written to ${path.relative(REPO_ROOT, GENERATED_FILE)}.`
)
