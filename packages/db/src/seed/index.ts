import { glob } from 'glob'
import _ from 'lodash'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { db } from '../client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type SeederModule = {
    run: (props: { db: typeof db }) => Promise<void>
}

async function seed() {
    console.log('🌱 Starting to seed database...')

    try {
        const seedersDir = path.resolve(__dirname)
        const files = await glob(`*.seed.{js,ts}`, {
            cwd: seedersDir,
            ignore: ['index.{js,ts}'],
        })

        const sortedSeeders = _.sortBy(files, (file) => file)

        console.log('🌱 Discovered seeders:', sortedSeeders)

        for (const file of sortedSeeders) {
            const seeder = (await import(
                path.resolve(seedersDir, file)
            )) as unknown as SeederModule
            console.log(`\n🌱 Running seeder: ${file}`)
            await seeder.run({ db })
        }

        console.log('\n✅ Database seeded successfully!')
        process.exit(0)
    } catch (error) {
        console.error('❌ An error occurred while seeding the database:', error)
        process.exit(1)
    }
}

void seed()
