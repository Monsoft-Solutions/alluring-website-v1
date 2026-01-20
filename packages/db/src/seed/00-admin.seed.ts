/**
 * Admin User Seed
 *
 * Creates the initial admin user, organization, and membership for the admin dashboard.
 * This seed should run first (00-) to ensure auth infrastructure is in place.
 *
 * Environment variables required:
 * - ADMIN_EMAIL: Email for the first admin user
 * - ADMIN_PASSWORD: Password for the first admin user
 * - ADMIN_NAME: Name for the first admin user (optional, defaults to "Admin")
 */
import * as bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { env } from '../env'
import { account, member, organization, user } from '../schema/auth'

type Db = typeof import('../client').db

type RunProps = {
    db: Db
}

const SALT_ROUNDS = 10
const ORG_NAME = 'Alluring Plastic Surgery'
const ORG_SLUG = 'alluring-plastic-surgery'

export async function run({ db }: RunProps) {
    console.log('Seeding admin user and organization...')

    const adminEmail = env.ADMIN_EMAIL
    const adminPassword = env.ADMIN_PASSWORD
    const adminName = env.ADMIN_NAME ?? 'Admin'

    if (!adminEmail || !adminPassword) {
        console.log(
            '⚠️  Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD env vars not set'
        )
        console.log(
            '   To seed admin user, set ADMIN_EMAIL and ADMIN_PASSWORD environment variables'
        )
        return
    }

    // Check if organization already exists
    const existingOrg = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, ORG_SLUG))
        .limit(1)

    let orgId: string

    if (existingOrg.length > 0 && existingOrg[0]) {
        console.log('Organization already exists, using existing...')
        orgId = existingOrg[0].id
    } else {
        // Create organization
        const [newOrg] = await db
            .insert(organization)
            .values({
                id: crypto.randomUUID(),
                name: ORG_NAME,
                slug: ORG_SLUG,
            })
            .returning()

        if (!newOrg) {
            throw new Error('Failed to create organization')
        }

        orgId = newOrg.id
        console.log(`Created organization: ${ORG_NAME}`)
    }

    // Check if admin user already exists
    const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, adminEmail))
        .limit(1)

    let userId: string

    if (existingUser.length > 0 && existingUser[0]) {
        console.log('Admin user already exists, using existing...')
        userId = existingUser[0].id
    } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS)

        // Create user
        const [newUser] = await db
            .insert(user)
            .values({
                id: crypto.randomUUID(),
                name: adminName,
                email: adminEmail,
                emailVerified: true,
                role: 'admin',
            })
            .returning()

        if (!newUser) {
            throw new Error('Failed to create admin user')
        }

        userId = newUser.id

        // Create account (credential provider)
        await db.insert(account).values({
            id: crypto.randomUUID(),
            userId,
            accountId: userId,
            providerId: 'credential',
            password: hashedPassword,
        })

        console.log(`Created admin user: ${adminEmail}`)
    }

    // Check if membership exists
    const existingMembership = await db
        .select()
        .from(member)
        .where(eq(member.userId, userId))
        .limit(1)

    if (existingMembership.length === 0) {
        // Create membership
        await db.insert(member).values({
            id: crypto.randomUUID(),
            userId,
            organizationId: orgId,
            role: 'owner',
        })
        console.log('Created organization membership')
    }

    console.log('Admin seeding completed successfully!')
}
