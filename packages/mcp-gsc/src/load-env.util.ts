/**
 * Environment bootstrap
 *
 * The server runs as a bare Node process spawned by an MCP client, so nothing
 * has loaded the monorepo's .env files for it. Credentials are read from the
 * admin app's env files rather than from the MCP client config, so the service
 * account private key stays out of the (committed) .mcp.json.
 *
 * Must run before anything imports `@workspace/seo`, whose env module snapshots
 * process.env at evaluation time.
 *
 * @module @workspace/mcp-gsc/load-env
 */
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

/**
 * Repository root, resolved from this module's own location so the server works
 * regardless of the working directory the MCP client spawns it with.
 *
 * Both `src/` and `dist/` sit one level below the package root, so the same
 * relative hop is correct for the TypeScript source and the compiled output.
 */
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** Env files searched, in precedence order — the first to define a key wins. */
const ENV_FILES = [
    'apps/admin/.env.local',
    'apps/admin/.env',
    '.env.local',
    '.env',
]

/**
 * Load credentials into process.env.
 *
 * Variables already present in the environment take precedence, so an MCP
 * client that passes credentials explicitly still overrides the files.
 */
export function loadEnv(): void {
    config({
        path: ENV_FILES.map((file) => `${REPO_ROOT}${file}`),
        quiet: true,
    })
}
