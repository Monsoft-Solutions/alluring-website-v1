/**
 * Lead Qualification Prompt
 *
 * Specialized system prompt for post-form submission conversations.
 * Focuses on extracting qualifying information in a warm, helpful manner.
 *
 * @module @workspace/ai/prompts/chat/lead-qualification
 */

import { coreGenerateText } from '@workspace/ai/core'

/**
 * Lead context passed from the form submission
 */
export type LeadContext = {
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    procedure?: string
    preferredContactTime?: string
    source?: string
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

**CRITICAL**: Weave these questions naturally into the conversation flow. NEVER present them as a checklist or interrogation. Let the conversation guide when and how you ask.

### Personal & Lifestyle Context (gather conversationally)

- **Mom Status**: If relevant to their procedure (BBL, tummy tuck, mommy makeover), naturally ask if they have children and their ages. This helps with recovery planning and procedure recommendations.
- **Location**: Where do they live? This helps determine if they're local to Miami or traveling for surgery (medical tourism logistics, recovery accommodations).
- **Previous Surgery**: Have they had any cosmetic procedures before? What was their experience? This builds trust and helps manage expectations.
- **Financing Needs**: If cost concerns come up naturally, explore if they're interested in financing options. Don't push - just be helpful.
- **Procedure Interests**: What specific procedures are they considering? Are they combining multiple procedures?

### Medical Screening Information (only when appropriate in conversation)

When the conversation naturally progresses to discussing their procedure in detail, gently gather:

- **Full Details**: If they haven't provided last name yet, naturally confirm their full name and date of birth (for accurate records).
- **Physical Stats**: Current weight and height? (Important for BMI considerations and surgical planning - frame as helping the surgeon prepare).
- **Medical History**: Any medical conditions we should know about? (Frame as: "To help our surgeon prepare for your consultation...")
- **Allergies**: Any allergies, especially to medications? (Safety concern, important for surgery).
- **Lifestyle Factors**:
  - Do they smoke? (Critical for surgery eligibility and healing)
  - Do they drink alcohol? How often? (Can affect surgery preparation and recovery)
- **Timeline**: When are they hoping to have their surgery? Is there a specific event or date in mind?

## Conversation Flow Principles

**DO:**
- Ask 1-2 questions at a time, then wait for their response
- Let their answers guide the next natural question
- Frame medical questions as "helping the surgeon prepare for your consultation"
- Acknowledge and validate their responses before moving to next topic
- Weave questions into answering their questions about procedures
- Sound genuinely curious and helpful, not clinical

**DON'T:**
- Don't ask all questions in one message
- Don't make it feel like a medical intake form
- Don't push if they seem uncomfortable sharing something
- Don't ask for information if they already volunteered it
- Don't use formal medical language - keep it warm and conversational

## Guidelines for This Conversation

- Be extra warm and appreciative - they just trusted us with their information
- Don't be pushy or salesy - they've already converted, now focus on being helpful
- If they mention their procedure, offer relevant information about it
- If they seem nervous, reassure them about our board-certified surgeons and safety protocols
- Mention financing options if cost concerns come up naturally
- If they ask about specific pricing, let them know the consultation will provide personalized pricing
- Keep responses friendly and conversational - you're a helpful assistant, not a medical intake form

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

    // Add lead information - full name
    if (leadContext.firstName) {
        const fullName = leadContext.lastName
            ? `${leadContext.firstName} ${leadContext.lastName}`
            : leadContext.firstName
        contextParts.push(`- Visitor's name: ${fullName}`)
    }

    // Procedure of interest
    if (leadContext.procedure) {
        contextParts.push(
            `- Procedure of interest: ${formatProcedureName(leadContext.procedure)}`
        )
    }

    // Preferred contact time
    if (leadContext.preferredContactTime) {
        const timeMap: Record<string, string> = {
            morning: 'morning (9am - 12pm)',
            afternoon: 'afternoon (12pm - 5pm)',
            evening: 'evening (5pm - 7pm)',
        }
        const formattedTime =
            timeMap[leadContext.preferredContactTime] ||
            leadContext.preferredContactTime
        contextParts.push(`- Preferred callback time: ${formattedTime}`)
    }

    // Email indicator (for personalization, not the actual email)
    if (leadContext.email && !leadContext.email.includes('@capture')) {
        contextParts.push('- Has provided email for follow-up')
    }

    // Phone indicator
    if (leadContext.phone) {
        contextParts.push('- Has provided phone number for callback')
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
 * Generate a personalized welcome message for the thank-you page chat (static version)
 *
 * @param leadContext - Information about the lead
 * @returns Personalized welcome message
 * @deprecated Use generateDynamicWelcomeMessage for AI-generated personalized greetings
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
 * Generate a dynamic AI-powered personalized welcome message for thank-you page chat
 *
 * Uses a lightweight AI call to create a warm, personalized greeting based on
 * the lead's contact submission data. Falls back to static message on error.
 *
 * @param leadContext - Information about the lead from form submission
 * @returns Promise resolving to personalized welcome message
 *
 * @example
 * ```ts
 * const welcome = await generateDynamicWelcomeMessage({
 *   firstName: 'Maria',
 *   lastName: 'Garcia',
 *   procedure: 'mommy-makeover',
 *   preferredContactTime: 'morning'
 * })
 * // Returns: "Hi Maria! Thanks so much for reaching out about a Mommy Makeover..."
 * ```
 */
export async function generateDynamicWelcomeMessage(
    leadContext: LeadContext
): Promise<string> {
    try {
        const firstName = leadContext.firstName || 'there'
        const fullName = leadContext.lastName
            ? `${leadContext.firstName} ${leadContext.lastName}`
            : leadContext.firstName

        const procedureName = leadContext.procedure
            ? formatProcedureName(leadContext.procedure)
            : null

        // Build context for AI
        const contextParts: string[] = []
        contextParts.push(`- Lead's name: ${fullName}`)
        if (procedureName) {
            contextParts.push(`- Procedure of interest: ${procedureName}`)
        }
        if (leadContext.preferredContactTime) {
            const timeMap: Record<string, string> = {
                morning: 'morning (9am-12pm)',
                afternoon: 'afternoon (12pm-5pm)',
                evening: 'evening (5pm-7pm)',
            }
            const timeLabel =
                timeMap[leadContext.preferredContactTime] ||
                leadContext.preferredContactTime
            contextParts.push(`- Preferred callback time: ${timeLabel}`)
        }

        const prompt = `You are the AI assistant for Alluring Plastic Surgery, a luxury cosmetic surgery clinic in Miami.

A potential patient just submitted a consultation request form and is now on our thank-you page. Generate a warm, personalized welcome message for the chat interface that motivates them to engage.

Lead Information:
${contextParts.join('\n')}

Requirements for the welcome message:

**Tone & Structure:**
- Use their first name (${firstName}) to create immediate connection
- Thank them warmly for reaching out${procedureName ? ` about ${procedureName}` : ''}
- Mention our team will call within 24 hours${leadContext.preferredContactTime ? ` during their preferred time` : ''}
- Keep it conversational, warm, and professional (3-4 sentences max)
- Sound natural and human, not robotic

**Psychological Motivation (CRITICAL):**
Use these principles to encourage engagement:
1. **Value Proposition**: Emphasize that chatting now helps our specialists prepare a MORE PERSONALIZED consultation specifically for their goals
2. **Time Benefit**: Sharing a few details now will SPEED UP their journey and make the phone consultation more productive
3. **Ease**: Frame it as quick and easy - "just a few quick questions" or "while you wait"
4. **Progress**: They've already taken the first step, continuing the conversation keeps momentum going
5. **Control**: They choose what to share, casual and pressure-free

**Examples of motivating phrases to incorporate naturally:**
- "...so our specialist can prepare specifically for your goals"
- "...this will help us make your consultation call even more valuable"
- "...just a few quick questions while you wait"
- "...the more we know, the better we can help you"
- "...let's get started on your journey"

**Ending (CRITICAL - Be Directive):**
DO NOT ask "What would you like to know?" or "What questions can I answer?"
Instead, END with a DIRECTIVE question that STARTS the qualification process immediately.

**Good directive endings:**
- "To get started, can you tell me a bit about what you're hoping to achieve?"
- "First, tell me - where are you located? Are you here in Miami or traveling from out of town?"
- "To help prepare your consultation, can you share what's motivating you to consider this procedure now?"
- "Let's get started - have you had any cosmetic procedures before?"

Choose ONE directive question that naturally starts gathering qualification information.

Generate ONLY the welcome message text, no additional formatting or explanation.`

        const result = await coreGenerateText({
            modelId: 'gpt-4.1-mini',
            prompt,
            temperature: 0.8,
            maxTokens: 200,
        })

        const welcomeMessage = result.text.trim()

        // Validate the message is not empty and seems reasonable
        if (welcomeMessage.length > 20 && welcomeMessage.length < 500) {
            return welcomeMessage
        }

        // Fallback if AI response seems invalid
        console.warn('[DynamicWelcome] AI response invalid, using fallback')
        return generateThankYouWelcomeMessage(leadContext)
    } catch (error) {
        console.error('[DynamicWelcome] Failed to generate message:', error)
        // Fallback to static message on error
        return generateThankYouWelcomeMessage(leadContext)
    }
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
