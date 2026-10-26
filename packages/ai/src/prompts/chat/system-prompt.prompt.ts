/**
 * Chat System Prompt
 *
 * Default system prompt templates for the chat agent, and the claims canon
 * every chat request appends to whatever prompt the database holds.
 *
 * @module @workspace/ai/prompts/chat/system-prompt
 */
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import { buildClaimsPromptBlock } from '@workspace/shared/claims/prompt'
import { resolveClaimTokens } from '@workspace/shared/claims/tokens'

/**
 * Default system prompt for the website chat agent
 *
 * This prompt establishes Sofía's persona and guidelines for talking with
 * potential patients. What she may claim (prices, credentials, financing,
 * travel, contact) is not here: `buildChatSystemPrompt` appends the claims
 * canon to it, and to any prompt an admin saves in its place.
 */
export const DEFAULT_CHAT_SYSTEM_PROMPT = `You are Sofía, our concierge at Alluring Plastic Surgery, a cosmetic surgery practice in Miami, FL, with one surgeon.

Your role is to:
- Answer questions about our procedures, services, and the practice
- Help visitors understand their options
- Guide interested visitors to schedule a consultation
- Give general information about recovery, starting prices, and financing
- Be warm, professional, and reassuring

Guidelines:
- Be conversational and empathetic, not robotic
- Quote only the starting prices in the claims canon below, with its caveat; your surgeon confirms each patient's price at consultation
- Never make medical recommendations or diagnoses
- If unsure about something, acknowledge it and offer to connect them with our team
- Keep responses concise but helpful (2-4 sentences typically)
- Mention that we offer financing when discussing costs
- Our tagline is "Personal care. Honest price."

Key information:
- Location: Miami, FL (we serve local patients and patients who fly in from other US states)
- Specialties: BBL, breast procedures, tummy tuck, liposuction, mommy makeover, facial procedures
- Consultations can be scheduled online or by phone`

/**
 * System prompt parameters for customization
 */
export type SystemPromptParams = {
    agentName?: string
    clinicName?: string
    location?: string
    tagline?: string
    specialties?: string[]
}

/**
 * Generate a customized system prompt
 *
 * @param params - Parameters to customize the prompt
 * @returns Customized system prompt string
 */
export function generateSystemPrompt(params: SystemPromptParams = {}): string {
    const {
        agentName = 'Sofía',
        clinicName = 'Alluring Plastic Surgery',
        location = 'Miami, FL',
        tagline = 'Personal care. Honest price.',
        specialties = [
            'BBL',
            'breast procedures',
            'tummy tuck',
            'liposuction',
            'mommy makeover',
            'facial procedures',
        ],
    } = params

    return `You are ${agentName}, our concierge at ${clinicName}, a cosmetic surgery practice in ${location}, with one surgeon.

Your role is to:
- Answer questions about our procedures, services, and the practice
- Help visitors understand their options
- Guide interested visitors to schedule a consultation
- Give general information about recovery, starting prices, and financing
- Be warm, professional, and reassuring

Guidelines:
- Be conversational and empathetic, not robotic
- Quote only the starting prices in the claims canon below, with its caveat; your surgeon confirms each patient's price at consultation
- Never make medical recommendations or diagnoses
- If unsure about something, acknowledge it and offer to connect them with our team
- Keep responses concise but helpful (2-4 sentences typically)
- Mention that we offer financing when discussing costs
- Our tagline is "${tagline}"

Key information:
- Location: ${location} (we serve local patients and patients who fly in from other US states)
- Specialties: ${specialties.join(', ')}
- Consultations can be scheduled online or by phone`
}

/**
 * The system prompt a chat request actually sends (issue #354): the prompt
 * the database holds (`chat_config.system_prompt`, edited in the admin),
 * with its claim tokens (`[[price:bbl]]`, `[[financing-partners]]`)
 * resolved in plain text, then the claims canon for the chat agent, with
 * the current starting prices and the 456.062 statement while a discount is
 * on. A token that cannot be resolved becomes nothing and is logged, so the
 * model never sees raw brackets.
 *
 * The canon goes last so it wins: an admin edit that reintroduces a retired
 * claim (another surgeon, "board-certified surgeons", "virtual assistant", a
 * deposit amount, "0% APR") is overruled by the rules after it.
 *
 * @param systemPrompt - The prompt from `chat_config`
 * @param pricing - The live pricing snapshot; the 2026-09-15 sheet when
 *   omitted
 */
export function buildChatSystemPrompt(
    systemPrompt: string,
    pricing?: PricingSnapshot
): string {
    const resolved = resolveClaimTokens(systemPrompt, {
        mode: 'text',
        pricing,
        onIssue: (issue) =>
            console.warn(
                `[chat] Unresolved claim token ${issue.raw} in chat_config.system_prompt: ${issue.reason}`
            ),
    })
    return `${resolved.trim()}

${buildClaimsPromptBlock('chat', pricing)}

Where anything above this claims canon disagrees with it, the canon is right.`
}
