import type { Procedure } from '@/lib/types/procedure.type'
import { siteConfig, getPhoneLink } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

export const mommyMakeoverMiami: Procedure = {
    title: 'Mommy Makeover Miami',
    slug: 'mommy-makeover-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. The practice's price sheet (2026-09-15) has no mommy
    // makeover line, only its parts, so no total is published until the
    // practice confirms how one is priced. The site had four different
    // "starting" prices ($5,000, $7,000, $9,500, $12,000), and AI engines
    // quoted three of them (#309).
    description: `A mommy makeover combines a tummy tuck with breast surgery, often with liposuction, in one planned surgery. At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}. Each part has its own price: a tummy tuck from $3,000, breast augmentation from $3,500 and a breast lift from $5,000.`,
    shortDescription:
        'A comprehensive combination of personalized procedures to restore your pre-pregnancy body, with flexible financing options to fit your budget.',
    heroSubtitle:
        'Your breasts and abdomen after pregnancy, planned together by one surgeon',
    // Hand-written meta description: the generated one claimed "Miami's top
    // surgeons. 5,000+ procedures" (#309). The title stays generated until
    // the page rebuild changes it.
    metaDescription: `Mommy makeover in Miami, priced part by part from the practice price list and performed by one surgeon, ${KARLINSKY_NAME}. Free consultation.`,

    category: 'combined',
    bodyLocation: 'Abdomen and breast',
    image: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/hero.webp',
    dateModified: '2026-09-28T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // No paid-LP price: the price sheet has no mommy makeover line, and the
    // old "$9,500" wasn't the practice's figure. Set it once the practice
    // confirms a starting price. No weekly figure either: financing is
    // offered but never quoted as a number.

    // Inline content images for enhanced engagement
    contentImages: [
        {
            id: 'hero',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/hero.webp',
            alt: 'Confident woman after mommy makeover transformation at Alluring Plastic Surgery Miami',
            section: 'hero',
            variant: 'full-width',
        },
        {
            id: 'breast-enhancement',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/breast-enhancement.webp',
            alt: 'Elegant woman showcasing confidence after breast enhancement procedure',
            caption:
                'Restore volume and lift with personalized breast enhancement',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'tummy-tuck',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/tummy-tuck.webp',
            alt: 'Fit woman with toned midsection after tummy tuck surgery',
            caption: 'Achieve a flat, toned midsection with abdominoplasty',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'liposuction-contouring',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/liposuction-contouring.webp',
            alt: 'Sculpted silhouette achieved through liposuction body contouring',
            caption:
                'Sculpt stubborn areas with precision liposuction contouring',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'consultation',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/consultation.webp',
            alt: 'Patient consultation with plastic surgeon at Alluring Plastic Surgery Miami',
            caption:
                'Your transformation begins with a personalized consultation',
            section: 'process',
            variant: 'full-width',
        },
        {
            id: 'recovery-lifestyle',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/recovery-lifestyle.webp',
            alt: 'Happy woman enjoying poolside lifestyle after mommy makeover recovery',
            caption: 'Embrace your new confidence and live life to the fullest',
            section: 'recovery',
            variant: 'full-width',
        },
    ],

    keywords: [
        'mommy makeover miami',
        'mommy makeover cost',
        'how much is a mommy makeover',
        'mommy makeover price',
        'mom makeover',
        'mini mommy makeover cost',
        'post pregnancy surgery',
        'breast augmentation tummy tuck',
        'mommy makeover recovery',
        'mommy makeover recovery time',
        'mommy makeover before and after',
        'mommy makeover financing miami',
        'tummy tuck breast lift combo miami',
    ],
    quickStats: {
        duration: '3 to 5 Hours',
        anesthesia: 'General Anesthesia',
        recovery: '2-3 Weeks to Light Activity',
        results: 'Long-lasting (with stable weight)',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Restored Confidence',
            description:
                "Pregnancy changes your body in ways that diet and exercise can't reverse. This post-pregnancy transformation helps you reclaim your figure, allowing you to feel like yourself again—not just as a mother, but as a woman.",
        },
        {
            title: 'Personalized for You',
            description:
                "Every woman's body responds differently to pregnancy. Your combined surgical plan is fully customized to address your specific concerns—whether that's deflated breasts, loose abdominal skin, or stubborn fat pockets.",
        },
        {
            title: 'Comprehensive Transformation',
            description:
                'This mom makeover addresses multiple areas in a single surgery, eliminating the need for separate procedures and recovery periods. One operation, one healing phase, complete results.',
        },
        {
            title: 'Single Recovery Period',
            description:
                'Instead of recovering from multiple separate surgeries, you experience one consolidated recovery. Most mothers return to light activities in 2-3 weeks and get back to their families faster.',
        },
    ],
    process: [
        {
            step: 1,
            title: 'Consultation & Customization',
            description:
                'Your surgeon evaluates your concerns, discusses your goals, and creates a personalized surgical plan combining procedures like breast enhancement, tummy tuck, and liposuction.',
        },
        {
            step: 2,
            title: 'Anesthesia & Breast Procedures',
            description:
                'General anesthesia is administered. Breast procedures (augmentation, lift, or both) are typically performed first to restore volume and firmness.',
        },
        {
            step: 3,
            title: 'Abdominoplasty',
            description:
                'A tummy tuck removes excess skin, repairs separated abdominal muscles (diastasis recti), and tightens the remaining tissue for a flatter, firmer midsection.',
        },
        {
            step: 4,
            title: 'Liposuction & Contouring',
            description:
                'Stubborn fat deposits in the abdomen, hips, thighs, or flanks are sculpted through liposuction to create smoother, more balanced proportions.',
        },
        {
            step: 5,
            title: 'Recovery & Results',
            description:
                'Most patients return to light activities within 2-3 weeks, with full recovery taking 4-6 weeks. Final results emerge over 3-6 months as swelling subsides.',
        },
    ],
    quickAnswer: {
        question: 'What is a mommy makeover?',
        answer: 'A mommy makeover is a customized combination of procedures—typically breast enhancement, tummy tuck, and liposuction—designed to restore your pre-pregnancy body.',
        details:
            'By combining multiple surgeries in one operation, you experience a single recovery period instead of multiple healing phases. The procedure typically takes 3-5 hours and results last for years with stable weight.',
    },
    content: `## Transform Your Post-Baby Body in Miami

You gave everything to bring your children into this world. Your body carried them, nurtured them, and transformed in ways you never anticipated. Now, years later, you still see those changes every time you look in the mirror—the loose skin, the separated muscles, the breasts that aren't quite where they used to be. It's not vanity to want your body back. It's honoring yourself after honoring everyone else.

A **mommy makeover** combines multiple procedures into one surgery, addressing the physical changes that diet and exercise simply can't fix. At **Alluring Plastic Surgery** in Miami, every mommy makeover is planned and performed by one surgeon, ${KARLINSKY_NAME}, and financing is available with approved credit.

## What Does a Mommy Makeover Consist Of?

A mom makeover isn't a single procedure—it's a personalized combination of surgeries performed together to address post-pregnancy changes. Here's what's typically included:

### Breast Enhancement
[Breast augmentation](/procedures/breast-augmentation-miami), lift, or both to restore volume and position. Many mothers experience deflated or sagging breasts after breastfeeding, and these procedures restore a more youthful appearance.

<ProcedureImage id="breast-enhancement" />

### Tummy Tuck (Abdominoplasty)
A [tummy tuck](/procedures/tummy-tuck-miami) removes excess skin and repairs separated abdominal muscles (diastasis recti). This addresses the loose, stretched skin and protruding belly that sit-ups and planks simply can't fix.

<ProcedureImage id="tummy-tuck" />

### Liposuction
[Liposuction](/procedures/liposuction-miami) sculpts stubborn fat deposits in the abdomen, hips, thighs, or flanks that resist even the most dedicated fitness routines.

<ProcedureImage id="liposuction-contouring" />

Some patients also add an arm lift or a thigh lift. By combining surgeries into one operation, you experience a single recovery period—meaning less time away from your family.

## Common Mommy Makeover Combinations

Every plan is built around what you want to change. Common combinations:

- **Breast surgery and a mini tummy tuck**: breast augmentation or a lift, with a tummy tuck for the lower abdomen. For mothers with moderate changes.
- **Breast surgery, a full tummy tuck and liposuction**: addresses the concerns most mothers share.
- **Breast surgery, an extended tummy tuck and liposuction of several areas**: the extended tummy tuck uses a hip-to-hip incision.

During your consultation, Dr. Karlinsky recommends the combination that best addresses your concerns.

## How Much Does a Mommy Makeover Cost?

A mommy makeover is priced from the procedures in your plan, and Dr. Karlinsky confirms your exact price at your free consultation. These are the practice's list prices for each part:

| Part of the plan | Price |
|------------------|-------|
| Mini tummy tuck | $3,000 |
| Full tummy tuck | $4,500 |
| Extended tummy tuck | $5,500 |
| Breast augmentation, saline implants | $3,500 |
| Breast augmentation, silicone implants | $4,500 |
| Breast lift without implants | $5,000 |
| Breast lift with saline implants | $6,000 |
| Breast lift with silicone implants | $7,000 |
| Lipo 360 | $4,000 |
| Liposuction of the abdomen and flanks, added to another procedure | $1,500 |

Combining procedures lowers the total: two procedures take $500 off, and three take $1,000 off. See the [tummy tuck](/procedures/tummy-tuck-miami) and [breast augmentation](/procedures/breast-augmentation-miami) pages for what each part involves.

### Does Insurance Cover a Mommy Makeover?

No. Because this is an elective cosmetic procedure, **insurance does not cover mommy makeovers**. However, if you have documented diastasis recti causing functional problems, a portion of the tummy tuck *may* qualify for coverage. Ask your insurer before your consultation.

### Mommy Makeover Financing

Financing is available through Cherry, CareCredit and United Credit, subject to credit approval.

## Mini Mommy Makeover: A Lighter Option

Not every mother needs comprehensive surgery. A **mini mommy makeover** offers targeted improvement at a lower cost:

### What's Included
- Mini tummy tuck (addresses lower abdomen only)
- Breast lift or small augmentation
- Optional: limited liposuction

### Mini Mommy Makeover Cost
A mini tummy tuck is $3,000 on the practice's price list, against $4,500 for a full tummy tuck, so a mini mommy makeover costs less than a full one.

### Who's a Good Candidate
- Mothers with changes primarily below the belly button
- Those with good skin elasticity
- Women who want improvement without extended recovery

During your consultation, we'll assess whether a mini or full procedure better serves your goals.

## Am I a Good Candidate?

The best candidates for this post-pregnancy transformation typically meet these criteria:

### You're at a Stable Weight
Significant weight fluctuations after surgery can compromise your results. Aim to be within 10-15 pounds of your goal weight.

### You've Completed Your Family
Future pregnancies can reverse improvements, particularly to the abdominal area.

### You're in Good Overall Health
Conditions like uncontrolled diabetes or blood clotting disorders may increase surgical risks.

### You Have Realistic Expectations
This procedure creates dramatic improvements, but won't erase every stretch mark or give you someone else's body. The goal is the best version of *your* figure.

### You're Done Breastfeeding
We recommend waiting at least six months after nursing ends to allow breast tissue to stabilize.

## The Procedure Experience

### Before Surgery

Your journey begins with a consultation where we discuss your concerns and goals. We'll evaluate your anatomy, review medical history, and explain which combination of procedures will achieve your desired outcome.

**Pre-operative preparation includes:**

- Stopping blood-thinning medications and supplements
- Arranging transportation home and overnight help
- Preparing your recovery space with essentials within reach
- **Planning childcare for at least two weeks**

<ProcedureImage id="consultation" />

### Surgery Day

The combined procedure is performed under general anesthesia and typically takes 3-5 hours. Your surgeon follows a strategic sequence:

1. **Breast procedures first**: Augmentation, lift, or both
2. **Abdominoplasty next**: Incision along bikini line, muscle repair, skin removal
3. **Liposuction last**: Sculpting flanks, hips, or thighs for balanced proportions

### After Surgery

You'll wake wearing compression garments, possibly with drainage tubes. Most patients go home the same day with detailed care instructions.

## Recovery: Getting Back to Your Family

We know recovery with children at home is your biggest concern. Here's what to realistically expect:

### Week 1-2: Rest Mode
- **Help required**: You cannot lift children, do laundry, or cook
- **Childcare essential**: Arrange for partner, family, or hired help
- **Pro tip**: Some moms send kids to grandparents for week one
- Light walking encouraged; pain managed with medication

### Week 2-3: Light Activity
- Back to desk work and driving
- **School pickup possible** (no lifting kids into car seats)
- Drains typically removed
- Swelling begins to subside

### Week 4-6: Gradual Return
- Resume most normal activities
- Light exercise approved
- Lifting restrictions ease (10-15 lbs)
- **Most moms feel "normal" by week 6**

### Month 3-6: Final Results
- Swelling fully resolves
- Scars fade and flatten
- All activities including exercise approved
- **Your transformation is complete**

<ProcedureImage id="recovery-lifestyle" />

## Why Miami Mothers Choose Alluring

### One Surgeon
Every mommy makeover at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}

### Personalized Approach
No cookie-cutter plans. Every surgical combination is designed for your unique anatomy and goals.

### Comprehensive Care
Your relationship with us doesn't end at surgery. Follow-up appointments, scar care guidance, and ongoing support are included.

### Proven Results
Years of experience delivering natural-looking transformations that help mothers feel like themselves again.

## Your Transformation Starts Here

You've spent years putting your family first. The midnight feedings, the endless laundry, the school runs, the meal prep—you've given everything. Now it's time to invest in yourself.

A **mommy makeover** isn't about perfection or vanity. It's about looking in the mirror and seeing a reflection that matches how vibrant you feel inside. It's about wearing a swimsuit without constantly adjusting. It's about feeling confident in your own skin for the first time since your children were born.

**Call [${siteConfig.contact.phoneDisplay}](${getPhoneLink()}) today** to schedule your free consultation. We'll discuss your goals, explain your options, and provide a detailed cost estimate—with no pressure and no obligation.

Your journey back to confidence starts with one phone call.`,
    faqs: [
        {
            question: 'What is a mommy makeover?',
            answer: 'A mommy makeover is a customized combination of procedures—typically breast enhancement, tummy tuck, and liposuction—designed to restore your pre-pregnancy body in a single surgery with one recovery period.',
        },
        {
            question: 'How much does a mommy makeover cost in Miami?',
            answer: 'At Alluring Plastic Surgery, a mommy makeover is priced from the procedures in your plan. On the practice price list a tummy tuck starts at $3,000 (mini) or $4,500 (full), breast augmentation at $3,500 (saline) or $4,500 (silicone), and a breast lift at $5,000. Combining two procedures takes $500 off the total, and three take $1,000 off. Dr. Karlinsky confirms your exact price at your free consultation.',
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: 'No, mommy makeovers are elective cosmetic procedures and not covered by insurance. Financing is available through Cherry, CareCredit and United Credit, subject to credit approval.',
        },
        {
            question: 'What is a mini mommy makeover?',
            answer: 'A mini mommy makeover includes a mini tummy tuck (lower abdomen only) combined with breast surgery. A mini tummy tuck is $3,000 on the practice price list, against $4,500 for a full one. It has a shorter recovery time and suits mothers with moderate post-pregnancy changes.',
        },
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: 'A typical mom makeover includes breast augmentation or lift (or both), tummy tuck, and liposuction. The exact combination is customized to your needs and may also include an arm lift or a thigh lift.',
        },
        {
            question: 'What is the recovery time for a mommy makeover?',
            answer: 'Most patients return to light activities within 2-3 weeks and can do school pickup by week 2-3. Full recovery, including return to exercise, typically takes 4-6 weeks. Plan for childcare help during the first two weeks.',
        },
        {
            question: 'When can I see mommy makeover before and after results?',
            answer: "You'll see dramatic improvement immediately, but final results emerge over 3-6 months as swelling resolves. Most mothers feel confident in swimwear by month 3.",
        },
        {
            question: 'Is a mommy makeover safe?',
            answer: `Like all surgeries, a mommy makeover carries risks, and combining procedures makes the surgery longer. At Alluring Plastic Surgery, ${KARLINSKY_NAME} performs every mommy makeover and reviews your health, your plan and how long your surgery will take with you at your consultation.`,
        },
        {
            question:
                'How soon can I have a mommy makeover after giving birth?',
            answer: 'We recommend waiting at least 6 months after giving birth and finishing breastfeeding. This allows your body to stabilize and your breast tissue to settle into its final shape.',
        },
        {
            question:
                'Can I have a mommy makeover if I plan to have more children?',
            answer: 'While medically safe, we recommend completing your family first. Future pregnancies can affect results, particularly the tummy tuck portion.',
        },
        {
            question: 'Does a mommy makeover leave scars?',
            answer: 'Yes, but scars are strategically placed in the bikini line and breast crease—hidden by underwear and swimwear. Scars fade significantly over 6-12 months, and we provide scar care guidance.',
        },
        {
            question: 'How long do the results of a mommy makeover last?',
            answer: 'With stable weight and no future pregnancies, results are long-lasting. Muscle repair and skin removal are permanent. Breast implants are not lifetime devices and may need to be replaced.',
        },
    ],
}
