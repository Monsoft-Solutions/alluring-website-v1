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
        fullDescription: `Our breast augmentation resources provide comprehensive information for women considering breast implant surgery in Miami. Whether you're exploring your options for the first time or preparing for your upcoming procedure, these guides cover every aspect of breast augmentation.

Discover detailed guides on choosing between saline and silicone implants, understanding implant profiles and sizes, and learning about incision techniques. We cover the consultation process, surgical techniques, recovery timeline, and long-term care to help you make informed decisions about your body.

Our articles address common concerns like implant safety, revision surgery, breastfeeding with implants, and how to achieve natural-looking results.`,
        relatedCategories: [
            'breast-reduction',
            'mommy-makeover',
            'recovery-tips',
        ],
        faqs: [
            {
                question: 'How long does breast augmentation recovery take?',
                answer: 'Most people return to light activity in about a week. Your surgeon tells you when you can exercise again, and your result settles over the following months as swelling goes down.',
            },
            {
                question: 'What size breast implants should I get?',
                answer: 'Implant size depends on your body frame, current breast tissue, and aesthetic goals. Dr. Karlinsky helps you choose a size at consultation.',
            },
        ],
    },
    {
        slug: 'bbl',
        title: 'Brazilian Butt Lift (BBL) Guides & Resources',
        shortDescription:
            'Everything you need to know about Brazilian Butt Lift surgery in Miami. Expert guides on BBL safety, recovery, results, and fat transfer techniques.',
        fullDescription: `Our BBL resources provide essential information about Brazilian Butt Lift surgery, one of the most popular body contouring procedures in Miami. These guides explain how fat transfer shapes a natural-looking result.

Learn about BBL candidacy requirements, the liposuction and fat transfer process, safety protocols, and what to expect during recovery. We address common questions about sitting after BBL, how much fat survives, and achieving your desired curves while maintaining safety.

Our guides cover the entire BBL journey from initial consultation through long-term results, helping you understand this procedure.`,
        relatedCategories: ['liposuction', 'body-contouring', 'recovery-tips'],
        faqs: [
            {
                question: 'Is a BBL safe?',
                answer: "A BBL's most serious risk is a fat embolism: fat injected into or below the gluteal muscle can enter a blood vessel, which can be fatal. The risk is lowest when the fat stays under the skin, and Florida law requires exactly that, along with ultrasound guidance and one surgeon for one patient. Your surgeon reviews your own risks at consultation.",
            },
            {
                question: 'How long do BBL results last?',
                answer: 'BBL results are long-lasting. The risk of losing grafted fat subsides around month 3, and your final shape shows at 3 to 6 months. Keeping a stable weight helps preserve the result.',
            },
        ],
    },
    {
        slug: 'tummy-tuck',
        title: 'Tummy Tuck Surgery Guides & Resources',
        shortDescription:
            'Comprehensive guides on tummy tuck surgery (abdominoplasty) in Miami. Learn about techniques, recovery, combining with other procedures, and achieving a flat stomach.',
        fullDescription: `Our tummy tuck resources help you understand abdominoplasty surgery and determine if it's right for achieving your body goals. These guides explain the different tummy tuck techniques and what to expect throughout your surgical journey.

Explore guides on mini tummy tuck vs. full tummy tuck, muscle repair, and combining tummy tuck with liposuction. We cover candidacy requirements, surgical techniques, recovery timeline, and how to maintain your results long-term.

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
                answer: 'A 2023 review of 17 studies and 237 patients who became pregnant after a tummy tuck found no deaths of mothers or babies and concluded that pregnancy should not be ruled out (Karunaratne and colleagues, Aesthetic Plastic Surgery, 2023). A later pregnancy can change your result, and ASPS advises women who may want future pregnancies to postpone a tummy tuck.',
            },
        ],
    },
    {
        slug: 'mommy-makeover',
        title: 'Mommy Makeover Guides & Resources',
        shortDescription:
            'Expert guides on mommy makeover surgery in Miami. Learn about combining procedures, recovery planning, and restoring your pre-pregnancy body.',
        fullDescription: `Our mommy makeover resources provide comprehensive information for mothers looking to restore their bodies after pregnancy and breastfeeding. A mommy makeover combines multiple procedures - typically tummy tuck, breast lift or augmentation, and liposuction - customized to address your specific concerns.

These guides cover planning a mommy makeover, including which procedures to combine, recovery considerations with children at home, and achieving balanced, natural-looking results. We address practical concerns like timing surgery around childcare and what to expect during the healing process.

Whether you're still researching or preparing for your procedure, our guides help you understand every aspect of this surgery.`,
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
                answer: "We recommend waiting until your body has recovered from pregnancy, your weight is stable and you've finished breastfeeding. Your surgeon sets your timing at consultation.",
            },
        ],
    },
    {
        slug: 'liposuction',
        title: 'Liposuction Guides & Resources',
        shortDescription:
            'Expert guides on liposuction surgery in Miami. Learn about different liposuction techniques, treatment areas, recovery, and body contouring results.',
        fullDescription: `Our liposuction resources provide detailed information about this popular body contouring procedure. Liposuction removes stubborn fat deposits that resist diet and exercise, helping you achieve a more sculpted physique.

These guides explain how liposuction works. Learn about treatable areas like the abdomen, flanks, thighs, arms, and chin, plus what realistic results look like.

We cover everything from candidacy requirements to recovery tips, helping you understand if liposuction can help you reach your body goals.`,
        relatedCategories: ['bbl', 'tummy-tuck', 'body-contouring'],
        faqs: [
            {
                question: 'How much fat can be removed with liposuction?',
                answer: "Florida allows at most 4,000 cc of supernatant fat (the fat alone, without the fluid removed with it) to be removed by liposuction in a doctor's office, and at most 1,000 cc when liposuction is combined with a tummy tuck. How much is right for you depends on your body and the areas treated, and your surgeon sets it at consultation.",
            },
            {
                question: 'Does fat come back after liposuction?',
                answer: 'Liposuction permanently removes fat cells, Cleveland Clinic says, but the fat cells that remain can still grow if you gain weight. ASPS says results last as long as you keep a stable weight and general fitness.',
            },
        ],
    },
    {
        slug: 'recovery-tips',
        title: 'Plastic Surgery Recovery Guides',
        shortDescription:
            'Expert recovery tips and guides for plastic surgery patients. Learn about healing timelines, pain management, and achieving optimal results.',
        fullDescription: `Our recovery resources help plastic surgery patients prepare for and navigate the healing process. Proper recovery is essential for achieving beautiful, long-lasting results from any cosmetic procedure.

These guides share evidence-based recovery tips covering pain management, activity restrictions, nutrition, wound care, and compression garments. We provide procedure-specific guidance as well as general best practices for healing.

Whether you're preparing for upcoming surgery or currently in recovery, our guides help you understand what to expect and how to support your healing.`,
        relatedCategories: ['breast-augmentation', 'bbl', 'tummy-tuck'],
        faqs: [
            {
                question: 'When can I return to work after plastic surgery?',
                answer: 'It depends on the procedure. Most people go back to a desk job in about 1 to 3 weeks. Exercise and physical work take longer: about 4 to 6 weeks after liposuction (The Aesthetic Society), 4 to 8 weeks after a tummy tuck (Cleveland Clinic) and 8 weeks after a BBL (The Aesthetic Society), once your surgeon clears you. Your surgeon gives you your own timeline.',
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
