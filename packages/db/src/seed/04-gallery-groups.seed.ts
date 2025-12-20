/**
 * Gallery Groups Seeder
 *
 * Seeds gallery groups for each procedure type matching the original website.
 * Groups are organized by category (Face, Breast, Body) with corresponding slugs.
 *
 * @module packages/db/src/seed/04-gallery-groups
 */
import { env } from '../env'
import { galleryGroup, type InsertGalleryGroup } from '../schema/gallery'

type Db = typeof import('../client').db

type RunProps = {
    db: Db
}

/**
 * Gallery groups organized by body area category
 * Slugs match the original website: https://www.alluringplasticsurgery.com/gallery/
 */
const GALLERY_GROUPS: InsertGalleryGroup[] = [
    // ============================================
    // FACE Procedures
    // ============================================
    {
        name: 'Blepharoplasty',
        slug: 'blepharoplasty',
        description:
            'Before and after results from eyelid surgery (blepharoplasty) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 1,
        isVisible: true,
    },
    {
        name: 'Face Lift',
        slug: 'facelift',
        description:
            'Before and after results from facelift (rhytidectomy) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 2,
        isVisible: true,
    },
    {
        name: 'Ear Pinning (Otoplasty)',
        slug: 'otoplasty',
        description:
            'Before and after results from ear pinning (otoplasty) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 3,
        isVisible: true,
    },

    // ============================================
    // BREAST Procedures
    // ============================================
    {
        name: 'Breast Augmentation',
        slug: 'breast-augmentation',
        description:
            'Before and after results from breast augmentation procedures performed at Alluring Plastic Surgery.',
        displayOrder: 4,
        isVisible: true,
    },
    {
        name: 'Breast Reduction',
        slug: 'breast-reduction',
        description:
            'Before and after results from breast reduction procedures performed at Alluring Plastic Surgery.',
        displayOrder: 5,
        isVisible: true,
    },
    {
        name: 'Breast Lift',
        slug: 'breast-lift',
        description:
            'Before and after results from breast lift (mastopexy) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 6,
        isVisible: true,
    },

    // ============================================
    // BODY Procedures
    // ============================================
    {
        name: 'Brachioplasty',
        slug: 'brachioplasty',
        description:
            'Before and after results from arm lift (brachioplasty) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 7,
        isVisible: true,
    },
    {
        name: 'Brazilian Butt Lift',
        slug: 'brazilian-butt-lift',
        description:
            'Before and after results from Brazilian Butt Lift (BBL) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 8,
        isVisible: true,
    },
    {
        name: 'Liposuction',
        slug: 'liposuction',
        description:
            'Before and after results from liposuction procedures performed at Alluring Plastic Surgery.',
        displayOrder: 9,
        isVisible: true,
    },
    {
        name: 'Tummy Tuck',
        slug: 'tummy-tuck',
        description:
            'Before and after results from tummy tuck (abdominoplasty) procedures performed at Alluring Plastic Surgery.',
        displayOrder: 10,
        isVisible: true,
    },
    {
        name: 'Mommy Makeover',
        slug: 'mommy-makeover',
        description:
            'Before and after results from mommy makeover combination procedures performed at Alluring Plastic Surgery.',
        displayOrder: 11,
        isVisible: true,
    },
]

export async function run({ db }: RunProps) {
    console.log('Seeding gallery groups...')

    const isDevelopment = env.NODE_ENV === 'development'

    // Check if gallery groups exist
    const existingGroups = await db.select().from(galleryGroup).limit(1)

    if (isDevelopment && existingGroups.length > 0) {
        console.log(
            'ℹ️  Gallery groups already exist, skipping seed (production mode)'
        )
        return
    }

    // Only insert if table is empty or we're in development
    if (isDevelopment || existingGroups.length === 0) {
        await db
            .insert(galleryGroup)
            .values(GALLERY_GROUPS)
            .onConflictDoNothing()

        console.log(`✅ Inserted ${GALLERY_GROUPS.length} gallery groups`)

        // Log groups by category
        console.log('📊 Gallery groups by category:')
        console.log('   FACE:')
        console.log('   - Blepharoplasty (blepharoplasty)')
        console.log('   - Face Lift (facelift)')
        console.log('   - Ear Pinning (otoplasty)')
        console.log('   BREAST:')
        console.log('   - Breast Augmentation (breast-augmentation)')
        console.log('   - Breast Reduction (breast-reduction)')
        console.log('   - Breast Lift (breast-lift)')
        console.log('   BODY:')
        console.log('   - Brachioplasty (brachioplasty)')
        console.log('   - Brazilian Butt Lift (brazilian-butt-lift)')
        console.log('   - Liposuction (liposuction)')
        console.log('   - Tummy Tuck (tummy-tuck)')
        console.log('   - Mommy Makeover (mommy-makeover)')
    } else {
        console.log(
            'ℹ️  Gallery groups already exist, skipping seed (production mode)'
        )
    }

    console.log('Gallery groups seeded successfully!')
}
