import type { InsertImage } from '../../schema/blog/image.table'

/**
 * Featured Image for: BBL Smell Explained: Why Do BBL Stink and How to Prevent It
 *
 * Migrated from old website
 */

export const image: Omit<InsertImage, 'id' | 'createdAt' | 'updatedAt'> = {
    url: 'https://lcqnjgugr2aws94e.public.blob.vercel-storage.com/posts/why-do-bbl-stink/featured-image.jpg',
    alt: 'Alluring Plastic Surgery - Brazilian Butt LIft (BBL) Procedure',
    title: 'Alluring Plastic Surgery - Brazilian Butt LIft (BBL) Procedure',
    description:
        'Featured image for BBL Smell Explained: Why Do BBL Stink and How to Prevent It',
    width: 1392,
    height: 752,
    fileSize: 173096,
    mimeType: 'image/jpeg',
    originalFilename: '02-why-do-bbl-stink.jpg',
}
