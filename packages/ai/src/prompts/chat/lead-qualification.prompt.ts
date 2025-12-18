/**
 * Lead Qualification Prompt
 *
 * Specialized system prompt for post-form submission conversations.
 * Focuses on extracting qualifying information in a warm, helpful manner.
 *
 * @module @workspace/ai/prompts/chat/lead-qualification
 */

/**
 * Lead context passed from the form submission
 */
export type LeadContext = {
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    procedure?: string
    submittedAt?: string
}

/**
 * Lead qualification system prompt
 *
 * This prompt is appended to the base system prompt when a lead
 * has already submitted their contact information. It focuses on:
 * - Thanking them for their submission
 * - Answering questions about their procedure of interest
 * - Gently extracting qualifying information
 * - Building trust and rapport
 */
export const LEAD_QUALIFICATION_CONTEXT_PROMPT = `
## Lead Context

This visitor has just submitted a consultation request form. They are now on the thank-you page waiting for a callback from our team.

Your goal in this conversation is to:
1. Thank them warmly and acknowledge their interest
2. Answer any questions they have about the procedure or our clinic
3. Gently learn more about them to help our team prepare for the consultation call
4. Build trust and reduce any anxiety they might have

## Qualifying Information to Extract (naturally, not as an interrogation)

If the conversation allows, try to understand:
- **Timeline**: When are they hoping to have the procedure? Is there a specific date or event?
- **Concerns**: What questions or worries do they have about the procedure?
- **Motivation**: What made them decide to reach out now?
- **Research Stage**: Have they had consultations elsewhere? What did they think?
- **Decision Makers**: Are they making this decision alone or with a partner/family?

## Guidelines for This Conversation

- Be extra warm and appreciative - they just trusted us with their information
- Don't be pushy or salesy - they've already converted, now focus on being helpful
- If they mention their procedure, offer relevant information about it
- If they seem nervous, reassure them about our board-certified surgeons and safety protocols
- Mention financing options if cost concerns come up naturally
- If they ask about specific pricing, let them know the consultation will provide personalized pricing
- Keep responses friendly and conversational

## Opening Approach

Start by acknowledging their form submission and offering to help while they wait for the callback. Reference their procedure of interest if known.
`

/**
 * Build a lead-qualified system prompt by combining the base prompt with lead context
 *
 * @param baseSystemPrompt - The default system prompt from config
 * @param leadContext - Information about the lead from form submission
 * @returns Enhanced system prompt with lead qualification focus
 */
export function buildLeadQualificationPrompt(
    baseSystemPrompt: string,
    leadContext: LeadContext
): string {
    const contextParts: string[] = []

    // Add lead information
    if (leadContext.firstName) {
        contextParts.push(`- Visitor's name: ${leadContext.firstName}`)
    }

    if (leadContext.procedure) {
        contextParts.push(
            `- Procedure of interest: ${formatProcedureName(leadContext.procedure)}`
        )
    }

    const leadInfoSection =
        contextParts.length > 0
            ? `\n## About This Lead\n\n${contextParts.join('\n')}\n`
            : ''

    return `${baseSystemPrompt}

${LEAD_QUALIFICATION_CONTEXT_PROMPT}
${leadInfoSection}`
}

/**
 * Generate a personalized welcome message for the thank-you page chat
 *
 * @param leadContext - Information about the lead
 * @returns Personalized welcome message
 */
export function generateThankYouWelcomeMessage(
    leadContext: LeadContext
): string {
    const firstName = leadContext.firstName || 'there'
    const procedureName = leadContext.procedure
        ? formatProcedureName(leadContext.procedure)
        : null

    if (procedureName) {
        return `Hi ${firstName}! Thank you so much for reaching out about ${procedureName}. Our team will be calling you within 24 hours to discuss your goals. In the meantime, I'm here if you have any questions about the procedure, our surgeons, financing options, or anything else. What would you like to know?`
    }

    return `Hi ${firstName}! Thank you for reaching out to us. Our team will be calling you within 24 hours to discuss your consultation. While you wait, I'm happy to answer any questions you might have about our procedures, our surgeons, or what to expect. How can I help?`
}

/**
 * Format procedure slug/value into a readable name
 *
 * @param procedure - Procedure identifier from form
 * @returns Human-readable procedure name
 */
function formatProcedureName(procedure: string): string {
    const procedureMap: Record<string, string> = {
        bbl: 'Brazilian Butt Lift (BBL)',
        'brazilian-butt-lift': 'Brazilian Butt Lift (BBL)',
        'breast-augmentation': 'Breast Augmentation',
        'breast-lift': 'Breast Lift',
        'breast-reduction': 'Breast Reduction',
        'tummy-tuck': 'Tummy Tuck',
        liposuction: 'Liposuction',
        'mommy-makeover': 'Mommy Makeover',
        facelift: 'Facelift',
        rhinoplasty: 'Rhinoplasty',
        'body-contouring': 'Body Contouring',
        other: 'your procedure of interest',
        'not-sure': 'cosmetic surgery',
    }

    return (
        procedureMap[procedure.toLowerCase()] ||
        procedure.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    )
}
