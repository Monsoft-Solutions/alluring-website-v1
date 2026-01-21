/**
 * Category Descriptions Data
 *
 * Enhanced descriptions and content for blog category pages.
 * This helps build topical authority and provides unique content for LLMs.
 */

export type CategoryDescription = {
    /** Category slug - must match database slug */
    slug: string
    /** SEO-optimized title */
    title: string
    /** Short description for meta tags (150-160 characters) */
    shortDescription: string
    /** Full description for page content (200-300 words) */
    fullDescription: string
    /** Related category slugs for internal linking */
    relatedCategories?: string[]
    /** FAQ items specific to this category */
    faqs?: Array<{
        question: string
        answer: string
    }>
    /** Featured/pillar content slugs to highlight */
    featuredPosts?: string[]
}

/**
 * Category descriptions for enhanced SEO and LLM optimization
 */
export const categoryDescriptions: CategoryDescription[] = [
    {
        slug: 'breast-augmentation',
        title: 'Breast Augmentation Guides & Resources',
        shortDescription:
            'Expert guides on breast augmentation surgery in Miami. Learn about implant types, sizing, recovery, and what to expect from your procedure.',
        fullDescription: `Our breast augmentation resources provide comprehensive information for women considering breast implant surgery in Miami. Whether you're exploring your options for the first time or preparing for your upcoming procedure, our board-certified plastic surgeons share their expertise on every aspect of breast augmentation.

Discover detailed guides on choosing between saline and silicone implants, understanding implant profiles and sizes, and learning about incision techniques. We cover the consultation process, surgical techniques, recovery timeline, and long-term care to help you make informed decisions about your body.

Our articles address common concerns like implant safety, revision surgery, breastfeeding with implants, and how to achieve natural-looking results. Each piece is reviewed by our medical team to ensure accuracy and relevance.`,
        relatedCategories: [
            'breast-reduction',
            'mommy-makeover',
            'recovery-tips',
        ],
        faqs: [
            {
                question: 'How long does breast augmentation recovery take?',
                answer: 'Most patients return to light activities within 1-2 weeks and resume normal exercise after 4-6 weeks. Full results are visible after 3-6 months as swelling subsides.',
            },
            {
                question: 'What size breast implants should I get?',
                answer: 'Implant size depends on your body frame, current breast tissue, and aesthetic goals. During consultation, our surgeons use 3D imaging and sizing samples to help you visualize different options.',
            },
        ],
    },
    {
        slug: 'bbl',
        title: 'Brazilian Butt Lift (BBL) Guides & Resources',
        shortDescription:
            'Everything you need to know about Brazilian Butt Lift surgery in Miami. Expert guides on BBL safety, recovery, results, and fat transfer techniques.',
        fullDescription: `Our BBL resources provide essential information about Brazilian Butt Lift surgery, one of the most popular body contouring procedures in Miami. Our board-certified surgeons share their expertise on achieving beautiful, natural-looking results through advanced fat transfer techniques.

Learn about BBL candidacy requirements, the liposuction and fat transfer process, safety protocols, and what to expect during recovery. We address common questions about sitting after BBL, how much fat survives, and achieving your desired curves while maintaining safety.

Our guides cover the entire BBL journey from initial consultation through long-term results, helping you understand this transformative procedure. Each article reflects the latest safety standards and techniques used at Alluring Plastic Surgery.`,
        relatedCategories: ['liposuction', 'body-contouring', 'recovery-tips'],
        faqs: [
            {
                question: 'Is a BBL safe?',
                answer: 'When performed by a board-certified plastic surgeon following safety protocols, BBL is safe. Our surgeons use advanced techniques to minimize risks, including proper fat injection depth and volume limits.',
            },
            {
                question: 'How long do BBL results last?',
                answer: 'BBL results are long-lasting. Once the transferred fat cells establish blood supply (about 3-6 months), they behave like natural fat. Maintaining stable weight helps preserve results for years.',
            },
        ],
    },
    {
        slug: 'tummy-tuck',
        title: 'Tummy Tuck Surgery Guides & Resources',
        shortDescription:
            'Comprehensive guides on tummy tuck surgery (abdominoplasty) in Miami. Learn about techniques, recovery, combining with other procedures, and achieving a flat stomach.',
        fullDescription: `Our tummy tuck resources help you understand abdominoplasty surgery and determine if it's right for achieving your body goals. Our board-certified surgeons provide detailed information on different tummy tuck techniques and what to expect throughout your surgical journey.

Explore guides on mini tummy tuck vs. full tummy tuck, muscle repair, combining tummy tuck with liposuction, and the popular drainless technique. We cover candidacy requirements, surgical techniques, recovery timeline, and how to maintain your results long-term.

Whether you're addressing loose skin after weight loss or restoring your pre-pregnancy body, our articles provide the information you need to make confident decisions about your procedure.`,
        relatedCategories: ['mommy-makeover', 'liposuction', 'body-contouring'],
        faqs: [
            {
                question:
                    'What is the difference between a mini and full tummy tuck?',
                answer: 'A mini tummy tuck addresses the lower abdomen below the belly button, while a full tummy tuck addresses the entire abdomen including muscle repair. Your surgeon will recommend the best option based on your anatomy and goals.',
            },
            {
                question: 'Can I get pregnant after a tummy tuck?',
                answer: "Yes, you can safely get pregnant after a tummy tuck. However, pregnancy may affect your results. Many surgeons recommend waiting until you're done having children to ensure long-lasting results.",
            },
        ],
    },
    {
        slug: 'mommy-makeover',
        title: 'Mommy Makeover Guides & Resources',
        shortDescription:
            'Expert guides on mommy makeover surgery in Miami. Learn about combining procedures, recovery planning, and restoring your pre-pregnancy body.',
        fullDescription: `Our mommy makeover resources provide comprehensive information for mothers looking to restore their bodies after pregnancy and breastfeeding. A mommy makeover combines multiple procedures - typically tummy tuck, breast lift or augmentation, and liposuction - customized to address your specific concerns.

Our board-certified surgeons share their expertise on planning a mommy makeover, including which procedures to combine, recovery considerations with children at home, and achieving balanced, natural-looking results. We address practical concerns like timing surgery around childcare and what to expect during the healing process.

Whether you're still researching or preparing for your procedure, our guides help you understand every aspect of this transformative surgical journey.`,
        relatedCategories: [
            'tummy-tuck',
            'breast-augmentation',
            'recovery-tips',
        ],
        faqs: [
            {
                question: 'What procedures are included in a mommy makeover?',
                answer: 'A mommy makeover is customized to each patient but typically includes a tummy tuck, breast procedure (lift, augmentation, or reduction), and liposuction. Your surgeon will recommend procedures based on your goals and anatomy.',
            },
            {
                question:
                    'How long should I wait after pregnancy for a mommy makeover?',
                answer: 'We recommend waiting at least 6-12 months after delivery and 3-6 months after breastfeeding. This allows your body to stabilize and ensures more predictable surgical results.',
            },
        ],
    },
    {
        slug: 'liposuction',
        title: 'Liposuction Guides & Resources',
        shortDescription:
            'Expert guides on liposuction surgery in Miami. Learn about different liposuction techniques, treatment areas, recovery, and body contouring results.',
        fullDescription: `Our liposuction resources provide detailed information about this popular body contouring procedure. Liposuction removes stubborn fat deposits that resist diet and exercise, helping you achieve a more sculpted physique.

Our board-certified surgeons share their expertise on various liposuction techniques including tumescent liposuction, VASER liposuction, and power-assisted liposuction. Learn about treatable areas like the abdomen, flanks, thighs, arms, and chin, plus what realistic results look like.

We cover everything from candidacy requirements to recovery tips, helping you understand if liposuction can help you reach your body goals. Each article is reviewed for accuracy by our medical team.`,
        relatedCategories: ['bbl', 'tummy-tuck', 'body-contouring'],
        faqs: [
            {
                question: 'How much fat can be removed with liposuction?',
                answer: 'For safety, most surgeons limit fat removal to about 5 liters in a single session. The actual amount depends on your body composition and the number of areas being treated. Your surgeon will determine safe limits during consultation.',
            },
            {
                question: 'Does fat come back after liposuction?',
                answer: "Fat cells removed during liposuction don't grow back. However, remaining fat cells can expand with significant weight gain. Maintaining a stable weight through healthy habits helps preserve your results.",
            },
        ],
    },
    {
        slug: 'recovery-tips',
        title: 'Plastic Surgery Recovery Guides',
        shortDescription:
            'Expert recovery tips and guides for plastic surgery patients. Learn about healing timelines, pain management, and achieving optimal results.',
        fullDescription: `Our recovery resources help plastic surgery patients prepare for and navigate the healing process. Proper recovery is essential for achieving beautiful, long-lasting results from any cosmetic procedure.

Our board-certified surgeons and medical team share evidence-based recovery tips covering pain management, activity restrictions, nutrition, wound care, and compression garments. We provide procedure-specific guidance as well as general best practices for healing.

Whether you're preparing for upcoming surgery or currently in recovery, our guides help you understand what to expect and how to optimize your healing for the best possible results.`,
        relatedCategories: ['breast-augmentation', 'bbl', 'tummy-tuck'],
        faqs: [
            {
                question: 'When can I return to work after plastic surgery?',
                answer: 'Return-to-work timelines vary by procedure. Most patients return to desk jobs within 1-2 weeks. Physical jobs may require 4-6 weeks. Your surgeon will provide specific guidance based on your procedure and job requirements.',
            },
            {
                question: 'How can I reduce swelling after surgery?',
                answer: 'Reduce swelling by wearing compression garments as directed, staying hydrated, limiting sodium intake, keeping surgical areas elevated when possible, and avoiding strenuous activity during early recovery.',
            },
        ],
    },
]

/**
 * Get category description by slug
 */
export function getCategoryDescription(
    slug: string
): CategoryDescription | undefined {
    return categoryDescriptions.find((cat) => cat.slug === slug)
}

/**
 * Get all category descriptions
 */
export function getAllCategoryDescriptions(): CategoryDescription[] {
    return categoryDescriptions
}
