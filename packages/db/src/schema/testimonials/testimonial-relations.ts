/**
 * Testimonial Relations
 *
 * Defines Drizzle ORM relations for testimonial tables.
 *
 * @module packages/db/src/schema/testimonials/testimonial-relations
 */
import { relations } from 'drizzle-orm'

import { galleryMedia } from '../gallery/gallery-media.table'
import { instagramPost } from '../social-media/instagram-post.table'

import { patientTestimonial } from './patient-testimonial.table'

/**
 * Patient Testimonial relations
 */
export const patientTestimonialRelations = relations(
    patientTestimonial,
    ({ one }) => ({
        // Instagram post (for instagram source type)
        instagramPost: one(instagramPost, {
            fields: [patientTestimonial.instagramPostId],
            references: [instagramPost.id],
        }),
        // Direct video/image media
        media: one(galleryMedia, {
            fields: [patientTestimonial.mediaId],
            references: [galleryMedia.id],
            relationName: 'testimonialMedia',
        }),
        // Thumbnail image
        thumbnail: one(galleryMedia, {
            fields: [patientTestimonial.thumbnailMediaId],
            references: [galleryMedia.id],
            relationName: 'testimonialThumbnail',
        }),
    })
)
