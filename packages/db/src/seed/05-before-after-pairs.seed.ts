/**
 * Before/After Pairs Seeder
 *
 * Seeds before/after comparison pairs for the gallery.
 * This seed requires gallery media to be uploaded first.
 *
 * Procedure Types (matching gallery groups):
 * - BBL (Brazilian Butt Lift)
 * - Breast Augmentation
 * - Breast Lift
 * - Breast Reduction
 * - Tummy Tuck
 * - Liposuction
 * - Mommy Makeover
 * - Facelift
 * - Blepharoplasty
 * - Brachioplasty
 * - Otoplasty
 *
 * @module packages/db/src/seed/05-before-after-pairs
 */
import { eq } from 'drizzle-orm'

import { db } from '../client'
import { env } from '../env'
import {
    beforeAfterPair,
    galleryMedia,
    type InsertBeforeAfterPair,
} from '../schema/gallery'

type RunProps = {
    db: typeof db
}

/**
 * Procedure types that match gallery groups
 * Used for categorizing before/after pairs
 */
const PROCEDURE_TYPES = [
    'BBL (Brazilian Butt Lift)',
    'Breast Augmentation',
    'Breast Lift',
    'Breast Reduction',
    'Tummy Tuck',
    'Liposuction',
    'Mommy Makeover',
    'Facelift',
    'Blepharoplasty',
    'Brachioplasty',
    'Otoplasty',
] as const

type ProcedureType = (typeof PROCEDURE_TYPES)[number]

/**
 * Valid procedure page slugs
 * Maps to procedure pages in apps/web/lib/data/procedures/
 */
const PROCEDURE_SLUGS = [
    'brazilian-butt-lift-bbl-miami',
    'breast-augmentation-miami',
    'breast-lift-miami',
    'breast-reduction-miami',
    'tummy-tuck-miami',
    'liposuction-miami',
    'mommy-makeover-miami',
    'facelift-miami',
    'blepharoplasty-miami',
    'rhinoplasty-miami',
] as const

type ProcedureSlug = (typeof PROCEDURE_SLUGS)[number]

/**
 * Before/after pair definition for seeding
 * Pairs are defined by matching slug patterns
 */
type BeforeAfterPairSeedData = {
    beforeSlug: string // Slug of the "before" image
    afterSlug: string // Slug of the "after" image
    procedureType: ProcedureType
    procedureSlug?: ProcedureSlug // Links to procedure page for display on procedure pages
    patientInfo?: string
    timeframe?: string
    isFeatured?: boolean
    displayOrder: number
}

/**
 * Sample before/after pairs - populate this array with actual data
 * when gallery media has been uploaded.
 *
 * Example structure:
 * {
 *   beforeSlug: 'bbl-patient-001-before',
 *   afterSlug: 'bbl-patient-001-after',
 *   procedureType: 'BBL (Brazilian Butt Lift)',
 *   procedureSlug: 'brazilian-butt-lift-bbl-miami', // Links to procedure page
 *   patientInfo: 'Female, 32, 5\'4"',
 *   timeframe: '3 months post-op',
 *   isFeatured: true,
 *   displayOrder: 1,
 * }
 */
const BEFORE_AFTER_PAIRS: BeforeAfterPairSeedData[] = [
    // Add before/after pairs here once media has been uploaded
    // Each pair requires:
    // - A "before" image uploaded to gallery with a unique slug
    // - An "after" image uploaded to gallery with a unique slug
    // - Both images should be published status
]

/**
 * Lookup media ID by slug
 */
async function getMediaIdBySlug(slug: string): Promise<string | null> {
    const result = await db
        .select({ id: galleryMedia.id })
        .from(galleryMedia)
        .where(eq(galleryMedia.slug, slug))
        .limit(1)

    return result[0]?.id ?? null
}

export async function run({ db }: RunProps) {
    console.log('Seeding before/after pairs...')

    const isDevelopment = env.NODE_ENV === 'development'

    // Check if before/after pairs exist
    const existingPairs = await db.select().from(beforeAfterPair).limit(1)

    if (isDevelopment && existingPairs.length > 0) {
        console.log(
            'ℹ️  Before/after pairs already exist, skipping seed (production mode)'
        )
        return
    }

    // Skip if no pairs defined
    if (BEFORE_AFTER_PAIRS.length === 0) {
        console.log(
            'ℹ️  No before/after pairs defined. Upload gallery media first, then add pairs to this seed file.'
        )
        console.log('📋 Available procedure types:')
        PROCEDURE_TYPES.forEach((type) => {
            console.log(`   - ${type}`)
        })
        console.log(
            '\n📋 Available procedure slugs (for linking to procedure pages):'
        )
        PROCEDURE_SLUGS.forEach((slug) => {
            console.log(`   - ${slug}`)
        })
        return
    }

    // Only insert if table is empty or we're in development
    if (isDevelopment || existingPairs.length === 0) {
        let insertedCount = 0
        let skippedCount = 0

        for (const pair of BEFORE_AFTER_PAIRS) {
            const [beforeMediaId, afterMediaId] = await Promise.all([
                getMediaIdBySlug(pair.beforeSlug),
                getMediaIdBySlug(pair.afterSlug),
            ])

            if (!beforeMediaId) {
                console.warn(
                    `⚠️  Before image not found: ${pair.beforeSlug} - skipping pair`
                )
                skippedCount++
                continue
            }

            if (!afterMediaId) {
                console.warn(
                    `⚠️  After image not found: ${pair.afterSlug} - skipping pair`
                )
                skippedCount++
                continue
            }

            const pairData: InsertBeforeAfterPair = {
                beforeMediaId,
                afterMediaId,
                procedureType: pair.procedureType,
                procedureSlug: pair.procedureSlug ?? null,
                patientInfo: pair.patientInfo ?? null,
                timeframe: pair.timeframe ?? null,
                isFeatured: pair.isFeatured ?? false,
                displayOrder: pair.displayOrder,
            }

            await db
                .insert(beforeAfterPair)
                .values(pairData)
                .onConflictDoNothing()

            insertedCount++
            console.log(
                `✅ Created pair: ${pair.procedureType} (${pair.beforeSlug} → ${pair.afterSlug})`
            )
        }

        console.log(`\n📊 Before/After Pairs Summary:`)
        console.log(`   - Inserted: ${insertedCount}`)
        console.log(`   - Skipped (missing media): ${skippedCount}`)
    } else {
        console.log(
            'ℹ️  Before/after pairs already exist, skipping seed (production mode)'
        )
    }

    console.log('Before/after pairs seeding complete!')
}
