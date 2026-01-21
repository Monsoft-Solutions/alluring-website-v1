export interface ProcedureFAQ {
    question: string
    answer: string
}

export interface ProcedureBenefit {
    title: string
    description: string
    iconName?: string // For dynamic icon loading if needed
}

export interface ProcedureStep {
    title: string
    description: string
    step: number
}

export interface ProcedureStats {
    duration: string
    anesthesia: string
    recovery: string
    results: string
    inpatientOutpatient?: string
}

export interface Procedure {
    title: string
    slug: string
    description: string
    shortDescription?: string
    heroSubtitle?: string
    image?: string
    keywords?: string[]
    category?: 'face' | 'breast' | 'body' | 'combined'
    faqs?: ProcedureFAQ[]
    content?: string // Markdown content for the main procedure description

    // Structured content for redesign
    quickStats?: ProcedureStats
    benefits?: ProcedureBenefit[]
    process?: ProcedureStep[]

    // Freshness signals for SEO/LLM optimization
    /** ISO date string when the content was last modified */
    dateModified?: string
    /** ISO date string when the content was first published */
    datePublished?: string

    // Legacy/Optional details
    details?: {
        intro: string
        benefits: string[]
        candidates: string[]
        recovery: string
        results: string
    }
}
