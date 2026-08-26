/**
 * Journal Baseline
 *
 * Records migrations that are *physically applied* but missing from
 * `drizzle.__drizzle_migrations` (issue #186). Two databases needed this:
 * production, where five — then seven — migrations were applied by hand
 * while `db:migrate` pointed elsewhere, and every local clone restored from
 * a `public`-schema-only dump, which carries the schema and none of the
 * bookkeeping.
 *
 *   pnpm db:baseline -- --through 0050_plain_toro            (dry run)
 *   pnpm db:baseline -- --through 0050_plain_toro --apply
 *
 * `--through` is mandatory: the operator asserts how far the schema is
 * actually applied, and the command refuses when anything past that bound
 * is already recorded — that combination means the assertion is wrong, and
 * inserting under a wrong assertion is how a real schema gap gets buried.
 *
 * Idempotent: rows already present are skipped, so re-running is a no-op.
 *
 * @module @workspace/db/baseline
 */
import { createInterface } from 'node:readline/promises'
import postgres from 'postgres'

import {
    exitOnTargetError,
    hasFlag,
    parseTargetFlag,
    readFlag,
    resolveTarget,
    type DbTarget,
} from './db-target'
import {
    readJournal,
    readAppliedMigrations,
    type JournalEntry,
} from './journal.util'

const MIGRATIONS_FOLDER = './migrations'

function fail(message: string): never {
    console.error(`\n✖ ${message}\n`)
    process.exit(1)
}

async function confirmRemote(target: DbTarget, count: number): Promise<void> {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    try {
        const answer = await rl.question(
            `\nThis will insert ${count} bookkeeping row${count === 1 ? '' : 's'} into ` +
                `${target.name.toUpperCase()} — ${target.label}\n` +
                `Type the host (${target.host}) to continue: `
        )
        if (answer.trim() !== target.host) {
            fail('Host did not match. Nothing was inserted.')
        }
    } finally {
        rl.close()
    }
}

async function main(): Promise<void> {
    const argv = process.argv.slice(2)
    const apply = hasFlag(argv, '--apply')
    const skipConfirm = hasFlag(argv, '--yes')
    const through = readFlag(argv, '--through')

    if (!through) {
        fail(
            'Pass --through <tag> naming the last migration you have verified as applied.\n' +
                'Example: pnpm db:baseline -- --through 0050_plain_toro'
        )
    }

    const target = resolveTarget(parseTargetFlag(argv))
    const journal = readJournal(MIGRATIONS_FOLDER)

    const boundary = journal.findIndex((entry) => entry.tag === through)
    if (boundary === -1) {
        fail(`"${through}" is not in the journal.`)
    }

    const inScope = journal.slice(0, boundary + 1)
    const beyond = journal.slice(boundary + 1)

    console.log(`\nBaselining ${target.name} — ${target.label}`)
    console.log(
        `Through ${through} (${inScope.length} of ${journal.length} entries)`
    )

    // Suppress the CREATE ... IF NOT EXISTS notices — they are expected.
    const client = postgres(target.url, { max: 1, onnotice: () => {} })

    try {
        const applied = await readAppliedMigrations(client)
        const recordedHashes = new Set(applied.map((row) => row.hash))

        // A recorded migration past the boundary means the operator's
        // assertion contradicts the database. Stop rather than guess.
        const contradictions = beyond.filter((entry) =>
            recordedHashes.has(entry.hash)
        )
        if (contradictions.length > 0) {
            fail(
                `${contradictions.length} migration(s) past --through are already recorded ` +
                    `(${contradictions.map((c) => c.tag).join(', ')}).\n` +
                    'The --through bound looks wrong — re-check what is actually applied.'
            )
        }

        const missing = inScope.filter(
            (entry) => !recordedHashes.has(entry.hash)
        )

        if (missing.length === 0) {
            console.log(
                `\n✓ Nothing to record — all ${inScope.length} already in the journal table.\n`
            )
            return
        }

        console.log(
            `\n${missing.length} migration${missing.length === 1 ? '' : 's'} to record:\n`
        )
        console.log(
            '  idx  tag                             when            sha256'
        )
        for (const entry of missing) {
            console.log(
                `  ${String(entry.idx).padStart(3)}  ${entry.tag.padEnd(30)}  ` +
                    `${entry.when}  ${entry.hash.slice(0, 16)}…`
            )
        }

        if (!apply) {
            console.log('\nDry run — pass --apply to write these rows.\n')
            return
        }

        if (!target.isLocal && !skipConfirm) {
            await confirmRemote(target, missing.length)
        }

        // Create the schema and table exactly as the migrator would, so a
        // database with no bookkeeping at all can be baselined.
        await client.unsafe(`CREATE SCHEMA IF NOT EXISTS "drizzle"`)
        await client.unsafe(`
            CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
                id SERIAL PRIMARY KEY,
                hash text NOT NULL,
                created_at bigint
            )
        `)

        await client.begin(async (tx) => {
            for (const entry of missing) {
                await tx`
                    insert into drizzle.__drizzle_migrations (hash, created_at)
                    values (${entry.hash}, ${entry.when})
                `
            }
        })

        console.log(`\n✅ Recorded ${missing.length} on ${target.label}\n`)
    } finally {
        await client.end()
    }
}

main().catch((error) => {
    if (error && (error as { name?: string }).name === 'DbTargetError') {
        exitOnTargetError(error)
    }
    console.error('\n❌ Baseline failed')
    console.error(error)
    process.exit(1)
})

export type { JournalEntry }
