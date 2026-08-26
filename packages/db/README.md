# @workspace/db

Shared database package using Drizzle ORM with PostgreSQL.

## Setup

Create `packages/db/.env.local` with two connection strings (see
`.env.example`):

```bash
# The default target for every db:* command. Must be a localhost database.
POSTGRES_URL="postgresql://user:password@localhost:5432/alluring-autopilot-dev"

# Optional — reached only by the :prod command variants.
POSTGRES_URL_PROD="postgresql://...@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

Two rules the commands enforce for you (issue #186):

- **`POSTGRES_URL` must be localhost.** Every default command refuses a
  remote host, so `db:seed` and `db:push` cannot reach production by
  misconfiguration.
- **`POSTGRES_URL_PROD` must use the session pooler (`:5432`).** Migrations
  cannot run over Supabase's transaction pooler (`:6543`); the command
  refuses it up front rather than failing mid-run.

The DigitalOcean database this package used to point at is **retired**. Do
not reintroduce it.

## Usage

Import the database client and types in your app:

```typescript
import { type NewUser, type User, db } from '@workspace/db/client'
import { users } from '@workspace/db/schema'

// Query users
const allUsers = await db.select().from(users)

// Insert a user
const newUser: NewUser = {
    name: 'John Doe',
    email: 'john@example.com',
}
await db.insert(users).values(newUser)
```

## Scripts

Local is the default; production is always a separate, named command.

| Command                                 | Target     | Notes                                                 |
| --------------------------------------- | ---------- | ----------------------------------------------------- |
| `pnpm db:generate`                      | none       | Diffs the schema against `migrations/`                |
| `pnpm db:migrate`                       | local      | Applies pending migrations                            |
| `pnpm db:migrate:prod`                  | Supabase   | Requires typing the host to confirm; `--yes` to skip  |
| `pnpm db:check` / `db:check:prod`       | either     | Read-only; exits non-zero when the database is behind |
| `pnpm db:baseline` / `db:baseline:prod` | either     | Records already-applied migrations — see below        |
| `pnpm db:push`                          | local only | Guarded; dev convenience, bypasses migrations         |
| `pnpm db:seed`                          | local only | Guarded — seeding a real database destroys content    |
| `pnpm db:studio`                        | local      | Prints the target before opening                      |

### Normal workflow

```bash
pnpm db:generate          # after editing a schema file
pnpm db:migrate           # apply locally, verify
pnpm db:check:prod        # is production behind?
pnpm db:migrate:prod      # ship it (confirms the host first)
```

Nothing applies migrations automatically on deploy, so run
`db:check:prod` before shipping a schema change.

### Baselining a database

`db:baseline` records migrations that are **already physically applied** but
missing from `drizzle.__drizzle_migrations`. You need it in two situations:

- A local clone restored from a `public`-schema-only dump — it has the full
  schema and no bookkeeping at all.
- A database where migrations were applied by hand (how production drifted
  seven migrations behind before #186 was fixed).

```bash
# Dry run first — --through names the last migration you have VERIFIED applied
pnpm db:baseline -- --through 0050_plain_toro
pnpm db:baseline -- --through 0050_plain_toro --apply
```

Verify before you assert. Check that the columns those migrations add
actually exist; recording a migration that never ran hides a real schema gap
and turns it into a runtime `column "x" does not exist` later. The command
refuses when anything past `--through` is already recorded, and is
idempotent, so re-running is a no-op.
