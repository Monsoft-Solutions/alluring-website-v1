/**
 * MedicalProcedure Schema Type Definition
 *
 * Used for plastic surgery procedure pages to provide rich structured data
 * that Google can use to understand and display procedure information.
 *
 * @see https://schema.org/MedicalProcedure
 */
export type MedicalProcedureSchemaProps = {
    /** Name of the procedure (e.g., "Brazilian Butt Lift") */
    name: string

    /** Detailed description of the procedure */
    description: string

    /** Description of how the procedure is performed */
    howPerformed?: string

    /** Pre-operative preparation requirements */
    preparation?: string

    /** Post-operative follow-up care information */
    followup?: string

    /** Target body location (e.g., "buttocks", "breast", "abdomen") */
    bodyLocation?: string

    /** Image URL(s) of the procedure or results */
    image?: string | string[]

    /** Canonical URL of the procedure page */
    mainEntityOfPage?: string

    /** URL of the procedure page */
    url?: string

    /** Medical specialty associated with the procedure */
    procedureType?:
        | 'Surgical'
        | 'NoninvasiveProcedure'
        | 'PercutaneousProcedure'

    /** Status of the procedure (available, not available, etc.) */
    status?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed'

    /** ISO date string when the content was last modified (e.g., "2025-01-15") */
    dateModified?: string

    /** ISO date string when the content was first published (e.g., "2024-06-01") */
    datePublished?: string
}
