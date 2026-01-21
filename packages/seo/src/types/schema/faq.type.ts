export type FAQItem = {
    question: string
    answer: string
}

export type FAQSchemaProps = {
    items: FAQItem[]
    /** URL of the page containing the FAQ (helps Google associate FAQs with the article) */
    mainEntityOfPage?: string
}
