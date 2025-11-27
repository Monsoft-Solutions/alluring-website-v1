import { db } from '../client'
import { author } from '../schema/blog'

type RunProps = {
    db: typeof db
}

export async function run({ db }: RunProps) {
    console.log('Seeding authors...')

    // Note: Author cleanup happens in 02-blog.seed.ts (after blog posts are deleted)
    // due to foreign key constraints. This seed only inserts if no conflict.

    const data: (typeof author.$inferInsert)[] = [
        {
            name: 'Alluring Editorial Team',
            email: 'editorial@alluringplasticsurgery.com',
            bio: 'Expert insights from our team of board-certified surgeons and medical professionals at Alluring Plastic Surgery in Miami, FL.',
            avatarUrl: '/logo.png',
            website: 'https://alluringplasticsurgery.com',
            socialLinks: {
                instagram: 'https://instagram.com/alluringplasticsurgery',
            },
        },
    ]

    await db.insert(author).values(data).onConflictDoNothing()

    console.log('Authors seeded successfully!')
}
