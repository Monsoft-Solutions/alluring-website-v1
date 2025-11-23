export interface ProcedureFAQ {
    question: string
    answer: string
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
    // We can add more detailed fields later for the content sections
    details?: {
        intro: string
        benefits: string[]
        candidates: string[]
        recovery: string
        results: string
    }
}
