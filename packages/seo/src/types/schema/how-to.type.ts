/**
 * HowTo Schema Types
 *
 * Schema.org HowToSchema for step-by-step instructions.
 * Used for "how to" queries and voice search optimization.
 *
 * @see https://schema.org/HowTo
 */

export type HowToStep = {
    /** The name of the step */
    name: string
    /** Description of the step */
    description?: string
    /** URL with more information about this step */
    url?: string
    /** Image for this step */
    image?: string
    /** Estimated time for this step (ISO 8601 duration format) */
    performTime?: string
}

export type HowToTool = {
    /** Name of the tool */
    name: string
    /** URL with more information about the tool */
    url?: string
}

export type HowToSupply = {
    /** Name of the supply */
    name: string
    /** URL with more information about the supply */
    url?: string
}

export type HowToSchemaProps = {
    /** The name/title of the HowTo guide */
    name: string
    /** Description of what this HowTo accomplishes */
    description?: string
    /** URL of the HowTo page */
    url?: string
    /** Featured image for the HowTo */
    image?: string
    /** Total estimated time to complete (ISO 8601 duration format, e.g., "PT30M" for 30 minutes, "P8W" for 8 weeks) */
    totalTime?: string
    /** Estimated cost to complete */
    estimatedCost?: {
        currency: string
        value: number | string
    }
    /** List of tools needed */
    tools?: HowToTool[]
    /** List of supplies needed */
    supplies?: HowToSupply[]
    /** Steps to complete the HowTo */
    steps: HowToStep[]
    /** The yield of the HowTo (e.g., "1 transformed body") */
    yield?: string
}
