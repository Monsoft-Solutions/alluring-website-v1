import { NextResponse } from 'next/server'

import { getCategories } from '@/lib/queries/categories.query'
import { isAuthenticated } from '@/lib/utils/auth.util'

export async function GET() {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const categories = await getCategories()
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
