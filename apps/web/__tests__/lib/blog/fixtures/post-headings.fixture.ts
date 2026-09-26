/**
 * The heading lines of five published posts, as stored on 26 Sep 2026.
 *
 * Heading ids depend only on the headings and their order, so these stand in
 * for the full bodies. The first three are the posts whose table of contents
 * pointed at the wrong heading under the old two-document render: each repeats
 * a heading on both sides of the split. The last two are top-15 posts, one
 * with an FAQ section.
 */
export const POST_HEADING_FIXTURES = [
    {
        slug: 'why-do-bbl-stink',
        headings: [
            '## What is BBL smell?',
            '## What causes BBL smell after surgery?',
            '## Is BBL odor normal, or a sign of infection?',
            '## How long does BBL smell last?',
            '## Do BBLs stink years later?',
            '## What does BBL smell like?',
            '## How to prevent BBL smell during recovery',
            '## Can the way a BBL is done lower the odds of odor?',
            '## When should you call your surgeon about BBL odor?',
            '## Frequently asked questions',
            '### What is BBL smell?',
            '### Is it normal for a BBL to smell?',
            '### How long does BBL smell last?',
            '### Do BBLs stink after 2 years?',
            '### What does BBL smell like?',
            '### Is BBL smell a sign of infection?',
            '### Can fat necrosis cause a bad smell after a BBL?',
            '### How do I get rid of BBL smell?',
            '### Do all BBLs smell?',
            '## Planning a BBL in Miami?',
        ],
    },
    {
        slug: 'best-age-breast-augmentation-miami',
        headings: [
            '## What Is the Best Age for Breast Augmentation?',
            '## Key Factors That Determine Your Best Age for Breast Augmentation',
            '## Breast Augmentation Miami: Local Lifestyle Factors',
            '## Am I a Candidate for Breast Augmentation? Your 8-Point Checklist',
            '## Transformations Across Ages: Real Patient Insights',
            '## Your Investment in Breast Augmentation',
            '## Frequently Asked Questions',
            '### What is the best age for breast augmentation?',
            '### What is the breast augmentation age range?',
            '### Are there specific health risks for breast augmentation over 50?',
            '### What are common reasons women in their 30s choose breast augmentation?',
            '### How does recovery differ by age for breast augmentation?',
            "### How do I know if I'm a good candidate for breast implants in Miami?",
        ],
    },
    {
        slug: 'how-to-choose-the-best-plastic-surgeon-in-miami-10-things-to-look-for',
        headings: [
            '## TL;DR: Choosing a Plastic Surgeon Checklist',
            '## 1. Verify Board Certification (The Most Important Step)',
            '### What to Look For',
            '### Red Flags to Watch',
            '### How Dr. Karlinsky Meets This Standard',
            '## 2. Look for Fellowship Credentials (FACS)',
            '### What FACS Means',
            '### Why This Matters for You',
            '## 3. Evaluate Specialization in Your Procedure',
            '### Questions to Ask',
            '### Procedure-Specific Expertise at Alluring',
            '## 4. Review Before-and-After Photos Carefully',
            '### What to Evaluate',
            '### Red Flags in Photo Galleries',
            '## 5. Confirm the Facility Is Accredited',
            '### Accreditation Standards',
            '### Questions to Ask',
            '## 6. Assess Communication During Consultation',
            '### Signs of a Good Consultation',
            "### Dr. Karlinsky's Approach",
            '## 7. Understand the Full Cost (And Financing Options)',
            '### What Should Be Included',
            '### Red Flags',
            '### Financing Options',
            '## 8. Read Patient Reviews (The Right Way)',
            '### Where to Look',
            '### What to Look For',
            '### Red Flags',
            '## 9. Evaluate Post-Operative Care',
            '### Questions to Ask',
            '### What Good Post-Op Care Looks Like',
            '## 10. Trust Your Gut',
            '### Ask Yourself',
            '## Checklist: Questions to Ask Your Plastic Surgeon',
            '## Why Patients Choose Alluring Plastic Surgery in Miami',
            '## Ready to Find Your Surgeon?',
        ],
    },
    {
        slug: 'how-many-massages-after-bbl',
        headings: [
            '## What Does the Lymphatic System Do After BBL?',
            '## When Should You Start Massages After BBL?',
            '## What Are the Benefits of BBL Lymphatic Massage?',
            '## What Safety Tips Should You Follow for BBL Massages?',
            '## What Happens If You Skip BBL Massages?',
            '## Learn More About BBL Surgery in Miami',
        ],
    },
    {
        slug: 'breast-implant-size-guide',
        headings: [
            '## Your Breast Implant Size Guide: Understanding How Sizing Works',
            '## What Factors Affect Choosing Breast Implant Size?',
            '## Breast Augmentation Implant Chart: Sizes and Cup Increases',
            '## Popular Implant Sizes in CC for Different Frames',
            '## Breast Implant Profile Types: Comparing High vs. Moderate',
            '## Consultation Tips and Miami Considerations',
            '## Your Investment in Breast Enhancement',
            '## Frequently Asked Questions',
            '### How do implant profiles affect the final breast shape?',
            '### What factors should I consider when choosing breast implant size?',
            '### How does chest width influence the choice of implant size?',
            '### What are the benefits of choosing a moderate profile implant?',
            '### Are high profile implants riskier than moderate ones?',
            '### What is the most common breast implant size?',
            '## Embrace Your Confident Silhouette',
        ],
    },
] as const

/** The slugs whose table of contents broke under the two-document render. */
export const SPLIT_DUPLICATE_SLUGS = [
    'why-do-bbl-stink',
    'best-age-breast-augmentation-miami',
    'how-to-choose-the-best-plastic-surgeon-in-miami-10-things-to-look-for',
]

/** A post body: each heading followed by a paragraph, as a post reads. */
export function toPostBody(headings: readonly string[]): string {
    return headings
        .map(
            (heading, index) =>
                `${heading}\n\nSection ${index + 1} body text, a sentence or two long.`
        )
        .join('\n\n')
}
