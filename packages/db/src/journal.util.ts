/**
 * Drizzle Journal Reading
 *
 * Shared between the migration runner and the baseline command (issue
 * #186). Both need to compare the on-disk journal against what a database
 * has recorded in `drizzle.__drizzle_migrations`.
 *
 * The hash and timestamp derivation mirrors drizzle-orm's own
 * `readMigrationFiles` exactly — `sha256` of the raw `.sql` file contents,
 * paired with the journal entry's `when`. Verified against a row the
 * production database already held before this module was written, so a
 * backfilled row is byte-identical to one the migrator would have inserted.
 *
 * @module @workspace/db/journal.util
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type postgres from 'postgres'

export type JournalEntry = {
    idx: number
    tag: string
    /** Milliseconds since epoch — becomes the row's `created_at`. */
    when: number
    /** sha256 of the raw .sql file. */
    hash: string
}

export type AppliedMigration = {
    id: number
    hash: string
    created_at: string | number
}

/**
 * Read every journal entry with the hash drizzle would compute for it.
 *
 * @param migrationsFolder path to the migrations directory
 */
export function readJournal(migrationsFolder: string): JournalEntry[] {
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')
    if (!fs.existsSync(journalPath)) {
        throw new Error(`No journal at ${journalPath}`)
    }

    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as {
        entries: { idx: number; tag: string; when: number }[]
    }

    return journal.entries.map((entry) => {
        const sqlPath = path.join(migrationsFolder, `${entry.tag}.sql`)
        const contents = fs.readFileSync(sqlPath, 'utf8')
        return {
            idx: entry.idx,
            tag: entry.tag,
            when: entry.when,
            hash: crypto.createHash('sha256').update(contents).digest('hex'),
        }
    })
}

/**
 * Every row the database has recorded, oldest first. Returns an empty array
 * when the bookkeeping table does not exist yet — the state a clone
 * restored from a `public`-schema-only dump is in.
 */
export async function readAppliedMigrations(
    client: postgres.Sql
): Promise<AppliedMigration[]> {
    const rows = await client<{ exists: boolean }[]>`
        select exists (
            select 1 from information_schema.tables
            where table_schema = 'drizzle' and table_name = '__drizzle_migrations'
        ) as exists
    `

    if (!rows[0]?.exists) return []

    return client<AppliedMigration[]>`
        select id, hash, created_at
        from drizzle.__drizzle_migrations
        order by created_at asc
    `
}
