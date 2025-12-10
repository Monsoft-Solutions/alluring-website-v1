import {
    getBeforeAfterPairs,
    getGalleryMediaForSelect,
} from '@/lib/queries/gallery.query'
import { BeforeAfterPageClient } from './before-after-client.component'

export const dynamic = 'force-dynamic'

export default async function BeforeAfterPage() {
    const [pairs, mediaOptions] = await Promise.all([
        getBeforeAfterPairs(),
        getGalleryMediaForSelect(),
    ])

    return <BeforeAfterPageClient pairs={pairs} mediaOptions={mediaOptions} />
}
