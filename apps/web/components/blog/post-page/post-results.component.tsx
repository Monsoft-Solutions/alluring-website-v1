import {
    BEFORE_AND_AFTER,
    ModuleResults,
    selectResultPhotos,
} from '@/components/procedures/module-kit/module-results.component'
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import type { ProcedureGalleryData } from '@/lib/queries/gallery/procedure-galleries.query'

import { resultsCopy } from './post-page.copy'

import '@/components/procedures/module-kit/module-kit.css'

type PostResultsProps = {
    procedure: PostProcedure
    gallery: ProcedureGalleryData
}

/** Photos the rail shows. */
const RESULT_PHOTOS = 6

/**
 * Real results for the post's procedure: up to six of the gallery's photos,
 * before-and-after first, in the procedure pages' rail. Renders nothing when
 * the gallery has no photo that names the procedure.
 */
export function PostResults({ procedure, gallery }: PostResultsProps) {
    const photos = selectResultPhotos(gallery.media, procedure.slug).slice(
        0,
        RESULT_PHOTOS
    )
    if (photos.length === 0) return null

    const copy = resultsCopy(procedure)

    return (
        <ModuleResults
            photos={photos}
            gallerySlug={gallery.groupSlug}
            question={copy.question}
            answer={copy.answer}
            railId='post-results'
            railLabel={copy.railLabel}
            galleryLinkLabel={copy.galleryLinkLabel}
            realPatientsNote={copy.realPatientsNote}
            captionOf={(photo) =>
                copy.caption(BEFORE_AND_AFTER.test(photo.alt))
            }
        />
    )
}
