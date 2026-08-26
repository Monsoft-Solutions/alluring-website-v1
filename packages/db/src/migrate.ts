/**
 * Migration Runner
 *
 * Applies pending drizzle migrations to a named target (issue #186):
 *
 *   pnpm db:migrate                  → the local database
 *   pnpm db:migrate:prod             → Supabase, after a typed confirmation
 *   pnpm db:check / db:check:prod    → read-only; non-zero when behind
 *
 * The target is always named in the output before anything runs, and the
 * run reports *which* migrations applied. The previous version printed the
 * same success line whether it applied twelve migrations or none, which is
 * how a database drifted five migrations behind without anyone noticing.
 *
 * @module @workspace/db/migrate
 */
import { createInterface } from 'node:readline/promises'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import {
    exitOnTargetError,
    hasFlag,
    parseTargetFlag,
    resolveTarget,
    type DbTarget,
} from './db-target'
import { readJournal, readAppliedMigrations } from './journal.util'

const MIGRATIONS_FOLDER = './migrations'

/**
 * The migrator compares against the newest recorded row only, so "pending"
 * means every journal entry newer than it — not every entry missing from
 * the table.
 */
function pendingTags(
    journal: { tag: string; when: number }[],
    newestRecordedAt: number | null
): string[] {
    if (newestRecordedAt === null) return journal.map((entry) => entry.tag)
    return journal
        .filter((entry) => entry.when > newestRecordedAt)
        .map((entry) => entry.tag)
}

/** Require the operator to type the host before writing to a remote database. */
async function confirmRemote(target: DbTarget): Promise<void> {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    try {
        const answer = await rl.question(
            `\nThis will migrate ${target.name.toUpperCase()} — ${target.label}\n` +
                `Type the host (${target.host}) to continue: `
        )
        if (answer.trim() !== target.host) {
            console.error('\n✖ Host did not match. Nothing was applied.\n')
            process.exit(1)
        }
    } finally {
        rl.close()
    }
}

async function main(): Promise<void> {
    const argv = process.argv.slice(2)
    const checkOnly = hasFlag(argv, '--check')
    const skipConfirm = hasFlag(argv, '--yes')

    const target = resolveTarget(parseTargetFlag(argv))
    const journal = readJournal(MIGRATIONS_FOLDER)

    console.log(
        `\n${checkOnly ? 'Checking' : 'Migrating'} ${target.name} — ${target.label}`
    )

    // The migrator's own CREATE TABLE IF NOT EXISTS emits a notice on every
    // run; it is not a problem and should not look like one.
    const client = postgres(target.url, { max: 1, onnotice: () => {} })

    try {
        const applied = await readAppliedMigrations(client)
        const newestRecordedAt = applied.length
            ? Math.max(...applied.map((row) => Number(row.created_at)))
            : null
        const pending = pendingTags(journal, newestRecordedAt)

        if (pending.length === 0) {
            console.log(
                `✓ Up to date — ${applied.length} recorded, ${journal.length} in the journal.\n`
            )
            return
        }

        console.log(
            `\n${pending.length} migration${pending.length === 1 ? '' : 's'} pending:`
        )
        for (const tag of pending) console.log(`  · ${tag}`)

        if (checkOnly) {
            console.error(
                `\n✖ ${target.name} is behind the journal by ${pending.length}.\n`
            )
            process.exit(1)
        }

        if (!target.isLocal && !skipConfirm) {
            await confirmRemote(target)
        }

        console.log('\n⏳ Applying…')
        await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER })
        console.log(`✅ Applied ${pending.length} to ${target.label}\n`)
    } finally {
        await client.end()
    }
}

main().catch((error) => {
    if (error && (error as { name?: string }).name === 'DbTargetError') {
        exitOnTargetError(error)
    }
    console.error('\n❌ Migration failed')
    console.error(error)
    process.exit(1)
})
