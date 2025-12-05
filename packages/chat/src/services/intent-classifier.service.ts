/**
 * Intent Classifier Service
 *
 * AI-powered intent classification for chat conversations.
 * Uses GPT-4o-mini to analyze conversation content and extract
 * intent, procedures mentioned, and relevant tags.
 *
 * @module @workspace/chat/services/intent-classifier
 */

/**
 * Available intent types
 */
export const INTENT_TYPES = [
    'consultation_request',
    'pricing_inquiry',
    'procedure_info',
    'post_op_question',
    'financing_inquiry',
    'general_inquiry',
    'complaint',
    'unknown',
] as const

export type IntentType = (typeof INTENT_TYPES)[number]

/**
 * Procedures that can be detected in conversations
 */
export const DETECTABLE_PROCEDURES = [
    'bbl',
    'breast_augmentation',
    'breast_lift',
    'breast_reduction',
    'tummy_tuck',
    'liposuction',
    'mommy_makeover',
    'facelift',
    'rhinoplasty',
    'blepharoplasty',
    'brow_lift',
    'chin_augmentation',
    'lip_augmentation',
    'botox',
    'fillers',
] as const

export type DetectableProcedure = (typeof DETECTABLE_PROCEDURES)[number]

/**
 * Tags that can be applied to sessions
 */
export const SESSION_TAGS = [
    'hot_lead',
    'price_sensitive',
    'ready_to_book',
    'returning_visitor',
    'multiple_procedures',
    'financing_needed',
    'urgent',
    'research_phase',
    'post_op_concern',
] as const

export type SessionTag = (typeof SESSION_TAGS)[number]

/**
 * Classification result from intent analysis
 */
export type IntentClassification = {
    primaryIntent: IntentType
    intentConfidence: number
    detectedProcedures: DetectableProcedure[]
    tags: SessionTag[]
}

/**
 * Message format for classification
 */
export type ClassificationMessage = {
    role: 'user' | 'assistant'
    content: string
}

/**
 * System prompt for intent classification
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an intent classifier for a plastic surgery clinic chat. Analyze the conversation and extract:

1. PRIMARY INTENT - One of:
   - consultation_request: User wants to schedule a consultation
   - pricing_inquiry: User asking about costs, prices, financing
   - procedure_info: User seeking information about procedures
   - post_op_question: User with post-operative questions
   - financing_inquiry: User specifically asking about payment plans
   - general_inquiry: General questions about the clinic
   - complaint: User expressing dissatisfaction
   - unknown: Cannot determine intent

2. CONFIDENCE - How confident you are (0.0 to 1.0)

3. PROCEDURES - Any procedures mentioned (use exact slugs):
   bbl, breast_augmentation, breast_lift, breast_reduction, tummy_tuck, liposuction, mommy_makeover, facelift, rhinoplasty, blepharoplasty, brow_lift, chin_augmentation, lip_augmentation, botox, fillers

4. TAGS - Relevant tags:
   - hot_lead: High interest, likely to convert
   - price_sensitive: Very focused on cost
   - ready_to_book: Explicitly wants to schedule
   - returning_visitor: Mentions previous consultation/visit
   - multiple_procedures: Interested in more than one procedure
   - financing_needed: Needs payment plan
   - urgent: Time-sensitive request
   - research_phase: Just gathering information
   - post_op_concern: Has concerns about recovery

Respond ONLY with valid JSON in this exact format:
{
  "primaryIntent": "intent_type",
  "intentConfidence": 0.85,
  "detectedProcedures": ["procedure1", "procedure2"],
  "tags": ["tag1", "tag2"]
}`

/**
 * Formats messages for classification
 */
function formatMessagesForClassification(
    messages: ClassificationMessage[]
): string {
    return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n')
}

/**
 * Classify conversation intent using OpenAI
 *
 * @param messages - The conversation messages to analyze
 * @param openaiApiKey - OpenAI API key
 * @returns Intent classification result
 */
export async function classifyIntent(
    messages: ClassificationMessage[],
    openaiApiKey: string
): Promise<IntentClassification> {
    // Default classification for errors or empty conversations
    const defaultClassification: IntentClassification = {
        primaryIntent: 'unknown',
        intentConfidence: 0,
        detectedProcedures: [],
        tags: [],
    }

    // Need at least 2 messages to classify
    if (messages.length < 2) {
        return defaultClassification
    }

    try {
        const conversationText = formatMessagesForClassification(messages)

        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: CLASSIFICATION_SYSTEM_PROMPT,
                        },
                        {
                            role: 'user',
                            content: `Analyze this conversation:\n\n${conversationText}`,
                        },
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                }),
            }
        )

        if (!response.ok) {
            console.error(
                'Intent classification API error:',
                response.statusText
            )
            return defaultClassification
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            return defaultClassification
        }

        // Parse the JSON response
        const parsed = JSON.parse(content) as IntentClassification

        // Validate and sanitize the response
        return {
            primaryIntent: INTENT_TYPES.includes(parsed.primaryIntent)
                ? parsed.primaryIntent
                : 'unknown',
            intentConfidence: Math.max(
                0,
                Math.min(1, parsed.intentConfidence || 0)
            ),
            detectedProcedures: (parsed.detectedProcedures || []).filter(
                (p): p is DetectableProcedure =>
                    DETECTABLE_PROCEDURES.includes(p as DetectableProcedure)
            ),
            tags: (parsed.tags || []).filter((t): t is SessionTag =>
                SESSION_TAGS.includes(t as SessionTag)
            ),
        }
    } catch (error) {
        console.error('Intent classification error:', error)
        return defaultClassification
    }
}

/**
 * Quick keyword-based intent detection for real-time use
 * (Faster than AI but less accurate)
 */
export function detectIntentKeywords(
    message: string
): Partial<IntentClassification> {
    const lowerMessage = message.toLowerCase()
    const result: Partial<IntentClassification> = {
        detectedProcedures: [],
        tags: [],
    }

    // Detect intent from keywords
    if (
        lowerMessage.includes('consultation') ||
        lowerMessage.includes('appointment') ||
        lowerMessage.includes('schedule') ||
        lowerMessage.includes('book')
    ) {
        result.primaryIntent = 'consultation_request'
        result.tags?.push('ready_to_book')
    } else if (
        lowerMessage.includes('price') ||
        lowerMessage.includes('cost') ||
        lowerMessage.includes('how much') ||
        lowerMessage.includes('afford')
    ) {
        result.primaryIntent = 'pricing_inquiry'
        result.tags?.push('price_sensitive')
    } else if (
        lowerMessage.includes('financing') ||
        lowerMessage.includes('payment plan') ||
        lowerMessage.includes('monthly')
    ) {
        result.primaryIntent = 'financing_inquiry'
        result.tags?.push('financing_needed')
    } else if (
        lowerMessage.includes('recovery') ||
        lowerMessage.includes('healing') ||
        lowerMessage.includes('after surgery')
    ) {
        result.primaryIntent = 'post_op_question'
    }

    // Detect procedures
    const procedureKeywords: Record<string, DetectableProcedure> = {
        bbl: 'bbl',
        'brazilian butt': 'bbl',
        'butt lift': 'bbl',
        'breast augmentation': 'breast_augmentation',
        'breast implant': 'breast_augmentation',
        'boob job': 'breast_augmentation',
        'breast lift': 'breast_lift',
        'breast reduction': 'breast_reduction',
        'tummy tuck': 'tummy_tuck',
        abdominoplasty: 'tummy_tuck',
        liposuction: 'liposuction',
        lipo: 'liposuction',
        'mommy makeover': 'mommy_makeover',
        facelift: 'facelift',
        'face lift': 'facelift',
        rhinoplasty: 'rhinoplasty',
        'nose job': 'rhinoplasty',
        botox: 'botox',
        filler: 'fillers',
    }

    for (const [keyword, procedure] of Object.entries(procedureKeywords)) {
        if (lowerMessage.includes(keyword)) {
            if (!result.detectedProcedures?.includes(procedure)) {
                result.detectedProcedures?.push(procedure)
            }
        }
    }

    // Detect tags
    if (
        lowerMessage.includes('asap') ||
        lowerMessage.includes('soon') ||
        lowerMessage.includes('urgent')
    ) {
        result.tags?.push('urgent')
    }

    if (result.detectedProcedures && result.detectedProcedures.length > 1) {
        result.tags?.push('multiple_procedures')
    }

    return result
}
