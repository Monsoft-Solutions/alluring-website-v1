/**
 * Testimonial card for display on website
 */
export interface TestimonialCard {
    id: string
    patientName: string
    procedure: string
    procedureSlug: string | null
    timeframe: string | null
    quote: string
    rating: number
    slug: string
    // Media info - can come from direct upload or Instagram
    mediaUrl: string | null
    thumbnailUrl: string | null
    mediaType: 'image' | 'video' | null
    // Instagram permalink for attribution
    instagramPermalink: string | null
}

/**
 * Featured testimonial with all display info
 */
export interface FeaturedTestimonial extends TestimonialCard {
    displayOrder: number
}

/**
 * Full testimonial detail for detail page
 */
export interface TestimonialDetail extends TestimonialCard {
    createdAt: Date
    publishedAt: Date | null
}
