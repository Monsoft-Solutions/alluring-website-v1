/**
 * Database Target Resolution
 *
 * Every database command in this package names the database it is about to
 * touch (issue #186). Before this existed, `db:migrate` read whatever
 * `POSTGRES_URL` happened to be in `.env.local` — which for months was an
 * abandoned DigitalOcean copy nothing reads.
 *
 * Two targets, both explicit:
 * - `local` (default) — `POSTGRES_URL`, which must be a localhost host.
 * - `prod`            — `POSTGRES_URL_PROD`, the Supabase session pooler.
 *
 * Both directions are validated. A `local` target pointing at a remote host
 * is the accident that motivated the issue, so it fails rather than
 * migrating production by surprise.
 *
 * @module @workspace/db/db-target
 */
import { env } from './env'

export type DbTargetName = 'local' | 'prod'

export type DbTarget = {
    name: DbTargetName
    url: string
    /** `host:port/database` — safe to print, never carries credentials. */
    label: string
    /** The bare host, for confirmation prompts. */
    host: string
    isLocal: boolean
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

/**
 * Supabase's transaction pooler. It does not support the session-level
 * behaviour postgres-js relies on, and it is already known-bad here for
 * `pg_dump` — so refuse it with the fix in the message rather than dying
 * halfway through a migration.
 */
const TRANSACTION_POOLER_PORT = '6543'
const SESSION_POOLER_PORT = '5432'

class DbTargetError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DbTargetError'
    }
}

function describe(url: string): { host: string; label: string } {
    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        throw new DbTargetError(
            'The connection string is not a valid URL. Expected ' +
                'postgresql://user:password@host:port/database'
        )
    }

    const host = parsed.hostname
    const port = parsed.port || SESSION_POOLER_PORT
    const database = parsed.pathname.replace(/^\//, '') || '(none)'

    return { host, label: `${host}:${port}/${database}` }
}

function isLocalHost(host: string): boolean {
    return LOCAL_HOSTS.has(host)
}

/**
 * Resolve a named target, validating that the URL matches what the name
 * promises. Throws `DbTargetError` with an actionable message otherwise.
 */
export function resolveTarget(name: DbTargetName): DbTarget {
    if (name === 'local') {
        const url = env.POSTGRES_URL
        const { host, label } = describe(url)

        if (!isLocalHost(host)) {
            throw new DbTargetError(
                `POSTGRES_URL points at "${host}", which is not a local host.\n` +
                    `The default target is the local database — set POSTGRES_URL to your\n` +
                    `localhost database and put the remote one in POSTGRES_URL_PROD, then\n` +
                    `use the :prod command variants to reach it.`
            )
        }

        return { name, url, label, host, isLocal: true }
    }

    const url = env.POSTGRES_URL_PROD
    if (!url) {
        throw new DbTargetError(
            'POSTGRES_URL_PROD is not set.\n' +
                'Add the Supabase connection string to packages/db/.env.local — use the\n' +
                `session pooler on port ${SESSION_POOLER_PORT}, not the transaction pooler.`
        )
    }

    const { host, label } = describe(url)
    const port = new URL(url).port

    if (port === TRANSACTION_POOLER_PORT) {
        throw new DbTargetError(
            `POSTGRES_URL_PROD uses the transaction pooler (port ${TRANSACTION_POOLER_PORT}).\n` +
                `Migrations need the session pooler — change the port to ${SESSION_POOLER_PORT}.`
        )
    }

    return { name, url, label, host, isLocal: isLocalHost(host) }
}

/** Read `--target local|prod` from argv; defaults to `local`. */
export function parseTargetFlag(argv: string[]): DbTargetName {
    const index = argv.indexOf('--target')
    if (index === -1) return 'local'

    const value = argv[index + 1]
    if (value !== 'local' && value !== 'prod') {
        throw new DbTargetError(
            `--target must be "local" or "prod"${value ? `, got "${value}"` : ''}`
        )
    }
    return value
}

/** True when the flag is present in argv. */
export function hasFlag(argv: string[], flag: string): boolean {
    return argv.includes(flag)
}

/** Read the value following `--name`, or undefined. */
export function readFlag(argv: string[], flag: string): string | undefined {
    const index = argv.indexOf(flag)
    if (index === -1) return undefined
    return argv[index + 1]
}

/**
 * Print the resolution failure the way an operator wants to read it, then
 * exit non-zero. Unexpected errors keep their stack.
 */
export function exitOnTargetError(error: unknown): never {
    if (error instanceof DbTargetError) {
        console.error(`\n✖ ${error.message}\n`)
        process.exit(1)
    }
    throw error
}

export { DbTargetError }
