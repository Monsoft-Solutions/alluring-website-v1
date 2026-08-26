/**
 * Local-Only Guard
 *
 * Runs before `db:push` and `db:seed` (issue #186). Both rewrite data
 * wholesale — seeding the production database would wipe every published
 * blog post — and CLAUDE.md's prose warning against it enforces nothing.
 *
 * There is deliberately no override flag. Reaching a remote database with
 * these commands means editing the script, which is a thing you do on
 * purpose and someone reviews.
 *
 * @module @workspace/db/assert-local
 */
import { exitOnTargetError, resolveTarget } from './db-target'

try {
    const target = resolveTarget('local')
    console.log(`→ ${target.label}`)
} catch (error) {
    exitOnTargetError(error)
}
