// Shared helpers for the blog kit's node tools. Not a command.
//
// - REPO: the repository root, from this file's location (any cwd works).
// - registerTsx(): loads the repo's own tsx so a tool can import TypeScript
//   source directly (packages/shared/src/...), with no build step and no
//   stale dist/. tsx is a devDependency already in node_modules/.pnpm.
// - resolveDb(): "local" = POSTGRES_URL from packages/db/.env.local,
//   "env:NAME" = $NAME, anything else is taken as a URL. describeDb() prints
//   host:port/db only, never credentials.
// - psqlJson(): one query through psql that returns one JSON value.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..')
export const BLOG = join(REPO, 'blog')
export const POSTS = process.env.BLOG_POSTS_DIR
    ? resolve(process.env.BLOG_POSTS_DIR)
    : join(BLOG, 'posts') // override: tests only

export function fail(message, code = 1) {
    console.error(message)
    process.exit(code)
}

/** The value of `key` in an env file; duplicate lines resolve last-wins. */
export function readEnvValue(file, key) {
    if (!existsSync(file)) return undefined
    let value
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(
            new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=\\s*(.*)$`)
        )
        if (m) value = m[1].trim().replace(/^["']|["']$/g, '')
    }
    return value || undefined
}

export function resolveDb(arg) {
    if (!arg) return undefined
    if (arg === 'local') {
        const url = readEnvValue(
            join(REPO, 'packages/db/.env.local'),
            'POSTGRES_URL'
        )
        if (!url) fail('POSTGRES_URL not found in packages/db/.env.local')
        return url
    }
    if (arg.startsWith('env:')) {
        const url = process.env[arg.slice(4)]
        if (!url) fail(`$${arg.slice(4)} is not set`)
        return url
    }
    return arg
}

export function describeDb(url) {
    if (!url) return '(no database)'
    const u = new URL(url)
    return `${u.hostname}:${u.port || 5432}${u.pathname}`
}

/** True for a database on this machine (a throwaway copy or the shared dev database), never production. */
export function isLocalDb(url) {
    if (!url) return false
    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(
        new URL(url).hostname
    )
}

export function psqlJson(db, sql) {
    let out
    try {
        out = execFileSync(
            'psql',
            [db, '-X', '-A', '-t', '-q', '-v', 'ON_ERROR_STOP=1', '-c', sql],
            {
                env: { ...process.env, PGCONNECT_TIMEOUT: '15' },
                stdio: ['ignore', 'pipe', 'pipe'],
            }
        )
            .toString()
            .trim()
    } catch (error) {
        fail(
            `psql failed on ${describeDb(db)}: ${String(
                error.stderr || error.message
            )
                .trim()
                .slice(0, 400)}`
        )
    }
    return out ? JSON.parse(out) : null
}

/** Register the repo's tsx ESM loader, so `await import('<file>.ts')` works. */
export async function registerTsx() {
    const pnpm = join(REPO, 'node_modules/.pnpm')
    const dir = existsSync(pnpm)
        ? readdirSync(pnpm)
              .filter((name) => /^tsx@\d/.test(name))
              .sort()
              .pop()
        : undefined
    if (!dir)
        fail(
            'tsx not found in node_modules/.pnpm: run pnpm install at the repo root'
        )
    const api = join(pnpm, dir, 'node_modules/tsx/dist/esm/api/index.mjs')
    const { register } = await import(pathToFileURL(api).href)
    register()
}

export async function importRepo(relative) {
    return import(pathToFileURL(join(REPO, relative)).href)
}

/** Print the leading // comment of a tool (its usage header), without the shebang. */
export function printHeader(fileUrl) {
    const lines = readFileSync(fileURLToPath(fileUrl), 'utf8').split('\n')
    const out = []
    for (const line of lines.slice(lines[0]?.startsWith('#!') ? 1 : 0)) {
        if (!line.startsWith('//')) break
        out.push(line.replace(/^\/\/ ?/, ''))
    }
    console.log(out.join('\n').trim())
}

/**
 * Parse argv into positionals and --flags. Every flag must be declared:
 * `booleans` take no value, `values` take one (`--db local` or `--db=local`;
 * a repeated value flag becomes an array). An undeclared flag, a boolean
 * given a value, or a value flag followed by another flag fails, so a typo
 * (`--dryrun`) never turns into a value, a positional or a silent no-op.
 * `--help` / `-h` prints the header comment of `help` (the caller's
 * import.meta.url) and exits 0. `--` ends the flags. A usage error exits
 * `usageExit` (default 1; slug_check.mjs documents 2).
 */
export function parseArgs(
    argv,
    { booleans = [], values = [], help, usageExit = 1 } = {}
) {
    const positional = []
    const flags = {}
    const known = [...booleans, ...values].map((k) => `--${k}`).join(' ')
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i]
        if (a === '--') {
            positional.push(...argv.slice(i + 1))
            break
        }
        if (a === '--help' || a === '-h') {
            if (help) printHeader(help)
            else console.log(`flags: ${known} --help`)
            process.exit(0)
        }
        if (a.startsWith('--')) {
            const eq = a.indexOf('=')
            const key = eq > 0 ? a.slice(2, eq) : a.slice(2)
            const inline = eq > 0 ? a.slice(eq + 1) : undefined
            if (booleans.includes(key)) {
                if (inline !== undefined)
                    fail(
                        `--${key} takes no value (got --${key}=${inline})`,
                        usageExit
                    )
                flags[key] = true
            } else if (values.includes(key)) {
                const value = inline ?? argv[++i]
                if (
                    value === undefined ||
                    (inline === undefined && value.startsWith('--'))
                ) {
                    fail(
                        `--${key} needs a value${value === undefined ? '' : ` (got ${value})`}`,
                        usageExit
                    )
                }
                flags[key] =
                    flags[key] === undefined
                        ? value
                        : [].concat(flags[key], value)
            } else {
                fail(`unknown flag --${key}. Flags: ${known} --help`, usageExit)
            }
        } else if (/^-[a-zA-Z]/.test(a)) {
            fail(`unknown flag ${a}. Flags: ${known} --help`, usageExit)
        } else positional.push(a)
    }
    return { positional, flags }
}

export function readMeta(slug) {
    const file = join(POSTS, slug, 'meta.json')
    if (!existsSync(file)) fail(`blog/posts/${slug}/meta.json not found`)
    return JSON.parse(readFileSync(file, 'utf8'))
}
