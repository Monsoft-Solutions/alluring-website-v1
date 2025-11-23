export interface Surgeon {
    id: string
    name: string
    slug: string
    title: string
    shortBio: string
    fullBio: string
    quote?: string
    role: string
    images: {
        featured: string
        portrait: string
    }
    social?: {
        instagram?: string
        facebook?: string
        tiktok?: string
        linkedin?: string
    }
    education: string[]
    certifications: string[]
    specialties: string[]
    philosophy?: string
}
