/**
 * Chat Quick Replies Seeder
 *
 * Seeds default quick reply options for the chat widget.
 * Quick replies are organized by category and shown contextually
 * based on conversation stage.
 *
 * @module packages/db/src/seed/03-chat-quick-replies
 */
import { db } from '../client'
import { env } from '../env'
import {
    chatQuickReply,
    type InsertChatQuickReply,
    type QuickReplyCategory,
} from '../schema/chat'

type RunProps = {
    db: typeof db
}

/**
 * Default quick replies organized by category
 */
const QUICK_REPLIES: InsertChatQuickReply[] = [
    // ============================================
    // Initial Category - Start of conversation
    // ============================================
    {
        label: 'Learn About Procedures',
        message: "I'd like to learn about your cosmetic surgery procedures.",
        category: 'initial' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Pricing Information',
        message: 'Can you tell me about pricing and what procedures cost?',
        category: 'initial' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: 'Schedule a Consultation',
        message: "I'm interested in scheduling a consultation.",
        category: 'initial' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
    {
        label: 'Financing Options',
        message: 'What financing and payment plan options do you offer?',
        category: 'initial' satisfies QuickReplyCategory,
        sortOrder: 4,
        isActive: true,
    },

    // ============================================
    // Procedures Category - Procedure-specific questions
    // ============================================
    {
        label: 'BBL (Brazilian Butt Lift)',
        message:
            'Tell me about the Brazilian Butt Lift (BBL) procedure. What does it involve?',
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Breast Augmentation',
        message:
            "I'm interested in breast augmentation. What options do you offer?",
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: 'Tummy Tuck',
        message: 'What should I know about getting a tummy tuck?',
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
    {
        label: 'Liposuction',
        message:
            'Can you explain the liposuction procedure and what areas it covers?',
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 4,
        isActive: true,
    },
    {
        label: 'Mommy Makeover',
        message: "What's included in a mommy makeover procedure?",
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 5,
        isActive: true,
    },
    {
        label: 'Breast Lift',
        message: 'Tell me about the breast lift procedure.',
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 6,
        isActive: true,
    },
    {
        label: 'Breast Reduction',
        message:
            "I'm considering breast reduction. What does the procedure involve?",
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 7,
        isActive: true,
    },
    {
        label: 'Facial Procedures',
        message:
            'What facial procedures do you offer? (Facelift, blepharoplasty, etc.)',
        category: 'procedures' satisfies QuickReplyCategory,
        sortOrder: 8,
        isActive: true,
    },

    // ============================================
    // Pricing Category - Cost and financing questions
    // ============================================
    {
        label: 'How Much Does It Cost?',
        message: 'How much does this procedure typically cost?',
        category: 'pricing' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Payment Plans',
        message:
            'Do you offer payment plans? What are the monthly payment options?',
        category: 'pricing' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: 'Insurance Coverage',
        message: 'Is this procedure covered by insurance?',
        category: 'pricing' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
    {
        label: "What's Included?",
        message:
            "What's included in the price? (Anesthesia, facility fees, follow-ups)",
        category: 'pricing' satisfies QuickReplyCategory,
        sortOrder: 4,
        isActive: true,
    },
    {
        label: 'Current Promotions',
        message: 'Do you have any current promotions or special offers?',
        category: 'pricing' satisfies QuickReplyCategory,
        sortOrder: 5,
        isActive: true,
    },

    // ============================================
    // Scheduling Category - Consultation booking
    // ============================================
    {
        label: 'Book a Consultation',
        message: "I'm ready to book a consultation. What's the process?",
        category: 'scheduling' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Virtual Consultation',
        message: 'Do you offer virtual or online consultations?',
        category: 'scheduling' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: 'Office Location & Hours',
        message: 'What are your office hours and where are you located?',
        category: 'scheduling' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
    {
        label: 'Consultation Cost',
        message: 'Is there a fee for the consultation?',
        category: 'scheduling' satisfies QuickReplyCategory,
        sortOrder: 4,
        isActive: true,
    },

    // ============================================
    // General Category - Common questions
    // ============================================
    {
        label: 'Recovery Time',
        message: "What's the typical recovery time for this procedure?",
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Am I a Good Candidate?',
        message: 'How do I know if I am a good candidate for this procedure?',
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: 'Before & After Photos',
        message: 'Can I see before and after photos of your work?',
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
    {
        label: 'About Your Surgeons',
        message: 'Tell me about your surgeons and their qualifications.',
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 4,
        isActive: true,
    },
    {
        label: 'Risks & Complications',
        message:
            'What are the potential risks and complications I should know about?',
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 5,
        isActive: true,
    },
    {
        label: 'Talk to Someone',
        message: "I'd like to speak with someone from your team directly.",
        category: 'general' satisfies QuickReplyCategory,
        sortOrder: 6,
        isActive: true,
    },

    // ============================================
    // Closing Category - End of conversation
    // ============================================
    {
        label: 'Schedule My Consultation',
        message:
            "I'm ready to schedule my consultation. Can someone call me to book?",
        category: 'closing' satisfies QuickReplyCategory,
        sortOrder: 1,
        isActive: true,
    },
    {
        label: 'Request a Call Back',
        message: 'Can someone call me back to discuss further?',
        category: 'closing' satisfies QuickReplyCategory,
        sortOrder: 2,
        isActive: true,
    },
    {
        label: "That's All For Now",
        message: "Thanks for the information! That's all I needed for now.",
        category: 'closing' satisfies QuickReplyCategory,
        sortOrder: 3,
        isActive: true,
    },
]

export async function run({ db }: RunProps) {
    console.log('Seeding chat quick replies...')

    const isDevelopment = env.NODE_ENV === 'development'

    // Check if quick replies exist
    const existingReplies = await db.select().from(chatQuickReply).limit(1)

    if (isDevelopment && existingReplies.length > 0) {
        console.log('🗑️  Clearing existing quick replies (development mode)...')
        await db.delete(chatQuickReply)
    }

    // Only insert if table is empty or we're in development
    if (isDevelopment || existingReplies.length === 0) {
        await db
            .insert(chatQuickReply)
            .values(QUICK_REPLIES)
            .onConflictDoNothing()

        console.log(`✅ Inserted ${QUICK_REPLIES.length} chat quick replies`)

        // Log summary by category
        const categoryCounts = QUICK_REPLIES.reduce(
            (acc, reply) => {
                const cat = reply.category as string
                acc[cat] = (acc[cat] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )

        console.log('📊 Quick replies by category:')
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   - ${category}: ${count}`)
        })
    } else {
        console.log(
            'ℹ️  Quick replies already exist, skipping seed (production mode)'
        )
    }

    console.log('Chat quick replies seeded successfully!')
}
