import { relations } from 'drizzle-orm'

import { beforeAfterPair } from './before-after-pair.table'
import { galleryGroup } from './gallery-group.table'
import { galleryMedia } from './gallery-media.table'
import { galleryMediaGroup } from './gallery-media-group.table'
import { mediaAnalysis } from './media-analysis.table'
import { mediaAnalysisItem } from './media-analysis-item.table'
import { instagramPost } from '../social-media/instagram-post.table'

// Gallery Media relations
export const galleryMediaRelations = relations(
    galleryMedia,
    ({ one, many }) => ({
        beforeAfterPair: one(beforeAfterPair, {
            fields: [galleryMedia.beforeAfterId],
            references: [beforeAfterPair.id],
        }),
        groups: many(galleryMediaGroup),
        // Self-referential relations for before/after pairs
        beforePairs: many(beforeAfterPair, { relationName: 'beforeMedia' }),
        afterPairs: many(beforeAfterPair, { relationName: 'afterMedia' }),
    })
)

// Gallery Group relations
export const galleryGroupRelations = relations(
    galleryGroup,
    ({ one, many }) => ({
        coverImage: one(galleryMedia, {
            fields: [galleryGroup.coverImageId],
            references: [galleryMedia.id],
        }),
        media: many(galleryMediaGroup),
    })
)

// Junction table relations
export const galleryMediaGroupRelations = relations(
    galleryMediaGroup,
    ({ one }) => ({
        media: one(galleryMedia, {
            fields: [galleryMediaGroup.mediaId],
            references: [galleryMedia.id],
        }),
        group: one(galleryGroup, {
            fields: [galleryMediaGroup.groupId],
            references: [galleryGroup.id],
        }),
    })
)

// Before/After Pair relations
export const beforeAfterPairRelations = relations(
    beforeAfterPair,
    ({ one }) => ({
        beforeMedia: one(galleryMedia, {
            fields: [beforeAfterPair.beforeMediaId],
            references: [galleryMedia.id],
            relationName: 'beforeMedia',
        }),
        afterMedia: one(galleryMedia, {
            fields: [beforeAfterPair.afterMediaId],
            references: [galleryMedia.id],
            relationName: 'afterMedia',
        }),
    })
)

// Media Analysis relations
export const mediaAnalysisRelations = relations(mediaAnalysis, ({ many }) => ({
    items: many(mediaAnalysisItem),
}))

// Media Analysis Item relations
export const mediaAnalysisItemRelations = relations(
    mediaAnalysisItem,
    ({ one }) => ({
        analysis: one(mediaAnalysis, {
            fields: [mediaAnalysisItem.analysisId],
            references: [mediaAnalysis.id],
        }),
        galleryMedia: one(galleryMedia, {
            fields: [mediaAnalysisItem.galleryMediaId],
            references: [galleryMedia.id],
        }),
        instagramPost: one(instagramPost, {
            fields: [mediaAnalysisItem.instagramPostId],
            references: [instagramPost.id],
        }),
    })
)
