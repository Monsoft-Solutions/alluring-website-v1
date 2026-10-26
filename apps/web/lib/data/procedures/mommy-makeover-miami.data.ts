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
    description: `A mommy makeover combines a tummy tuck with breast surgery, often with liposuction, in one planned surgery. At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}. Each part has its own price: breast augmentation from [[price:breast-augmentation:saline]] (saline), a breast lift from [[price:breast-lift:modified]] (modified lift) and a tummy tuck from [[price:tummy-tuck:mini]] (mini), and your surgeon confirms your price at consultation.`,
    shortDescription:
        'A mommy makeover combines procedures to address changes to your breasts and abdomen after pregnancy. Financing is available for qualified applicants.',
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
            alt: 'Smiling woman in an off-shoulder dress seated in an armchair, with the Miami skyline behind her',
            section: 'hero',
            variant: 'full-width',
        },
        {
            id: 'breast-enhancement',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/breast-enhancement.webp',
            alt: 'Woman in a champagne satin robe in a softly lit room',
            caption:
                'Restore volume and lift with personalized breast enhancement',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'tummy-tuck',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/tummy-tuck.webp',
            alt: 'Woman in a sports top and leggings standing in a bright studio',
            caption: 'A tummy tuck flattens and firms the abdomen',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'liposuction-contouring',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/liposuction-contouring.webp',
            alt: 'Woman in a white swimsuit seated by a candlelit pool',
            caption:
                'Sculpt stubborn areas with precision liposuction contouring',
            section: 'content',
            variant: 'full-width',
        },
        {
            id: 'consultation',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/consultation.webp',
            alt: 'Patient consultation with the surgeon at Alluring Plastic Surgery Miami',
            caption:
                'Your transformation begins with a personalized consultation',
            section: 'process',
            variant: 'full-width',
        },
        {
            id: 'recovery-lifestyle',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/recovery-lifestyle.webp',
            alt: 'Smiling woman in a sun hat sitting at the edge of a pool with palm trees behind her',
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
                'Pregnancy can change your body in ways that diet and exercise may not reverse, such as loose skin and separated abdominal muscles. A mommy makeover can help you feel like yourself again.',
        },
        {
            title: 'Personalized for You',
            description:
                "Every woman's body responds differently to pregnancy. Your combined surgical plan is fully customized to address your specific concerns—whether that's deflated breasts, loose abdominal skin, or stubborn fat pockets.",
        },
        {
            title: 'Comprehensive Transformation',
            description:
                'This mom makeover addresses multiple areas in a single surgery, eliminating the need for separate procedures and recovery periods. One operation and one recovery.',
        },
        {
            title: 'Single Recovery Period',
            description:
                'Instead of recovering from multiple separate surgeries, you experience one consolidated recovery. At Alluring, most patients return to light activity in 2 to 3 weeks; your surgeon sets your timeline.',
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
                'General anesthesia is administered. Breast procedures (augmentation, lift, or both) restore volume and position.',
        },
        {
            step: 3,
            title: 'Abdominoplasty',
            description:
                "A tummy tuck removes loose skin and fat and, in a full or extended tummy tuck, repairs separated abdominal muscles (diastasis recti). The mini and extended mini at Alluring don't include muscle repair.",
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
                'At Alluring, most patients return to light activity in 2 to 3 weeks. A mommy makeover usually includes a tummy tuck, and after a tummy tuck running and lifting wait about 6 weeks (Cindy Wu, MD, on the ASPS website) and a full recovery takes around 3 months (Samir Rao, MD, on the ASPS website). Your surgeon sets your timeline.',
        },
    ],
    quickAnswer: {
        question: 'What is a mommy makeover?',
        answer: 'A mommy makeover is a customized combination of procedures—typically breast enhancement, tummy tuck, and liposuction—designed to address changes to your breasts and abdomen after pregnancy.',
        details:
            'By combining multiple surgeries in one operation, you experience a single recovery period instead of multiple healing phases. At Alluring, the surgery usually takes 3 to 5 hours, and results are long-lasting with a stable weight.',
    },
    content: `## Mommy Makeover in Miami: Your Body After Pregnancy

You gave everything to bring your children into this world. Your body carried them, nurtured them, and transformed in ways you never anticipated. Now, years later, you still see those changes every time you look in the mirror—the loose skin, the separated muscles, the breasts that aren't quite where they used to be. It's not vanity to want your body back. It's honoring yourself after honoring everyone else.

A **mommy makeover** combines multiple procedures into one surgery, addressing physical changes that diet and exercise may not fix. At **Alluring Plastic Surgery** in Miami, every mommy makeover is planned and performed by one surgeon, ${KARLINSKY_NAME}, and financing is available with approved credit.

## What Does a Mommy Makeover Consist Of?

A mom makeover isn't a single procedure—it's a personalized combination of surgeries performed together to address post-pregnancy changes. Here's what's typically included:

### Breast Enhancement
[Breast augmentation](/procedures/breast-augmentation-miami), lift, or both to restore volume and position. Many mothers experience deflated or sagging breasts after breastfeeding, and these procedures can restore a more youthful appearance.

<ProcedureImage id="breast-enhancement" />

### Tummy Tuck (Abdominoplasty)
A [tummy tuck](/procedures/tummy-tuck-miami) removes loose skin and fat and, in a full or extended tummy tuck, repairs separated abdominal muscles (diastasis recti). The mini and extended mini at Alluring don't include muscle repair. This addresses the loose, stretched skin and protruding belly that sit-ups and planks simply can't fix.

<ProcedureImage id="tummy-tuck" />

### Liposuction
[Liposuction](/procedures/liposuction-miami) sculpts stubborn fat deposits in the abdomen, hips, thighs, or flanks that resist even the most dedicated fitness routines.

<ProcedureImage id="liposuction-contouring" />

Some patients also add an arm lift or a thigh lift. By combining surgeries into one operation, you experience a single recovery period—meaning less time away from your family.

## Common Mommy Makeover Combinations

Every plan is built around what you want to change. Common combinations:

- **Breast surgery and a mini tummy tuck**: breast augmentation or a lift, with a tummy tuck for the lower abdomen. For mothers with moderate changes.
- **Breast surgery, a full tummy tuck and liposuction**: for loose skin, separated muscles and stubborn fat together.
- **Breast surgery, an extended tummy tuck and liposuction of several areas**: the extended tummy tuck uses a hip-to-hip incision.

During your consultation, Dr. Karlinsky recommends the combination that best addresses your concerns.

## How Much Does a Mommy Makeover Cost?

A mommy makeover is priced from the procedures in your plan, and Dr. Karlinsky confirms your exact price at your free consultation. These are the practice's list prices for each part:

| Part of the plan | Price |
|------------------|-------|
| Mini tummy tuck | [[price:tummy-tuck:mini]] |
| Full tummy tuck | [[price:tummy-tuck:full]] |
| Extended tummy tuck | [[price:tummy-tuck:extended]] |
| Breast augmentation, saline implants | [[price:breast-augmentation:saline]] |
| Breast augmentation, silicone implants | [[price:breast-augmentation:silicone]] |
| Modified breast lift (skin below the areola only) | [[price:breast-lift:modified]] |
| Breast lift without implants | [[price:breast-lift:no-implants]] |
| Breast lift with saline implants | [[price:breast-lift:saline]] |
| Breast lift with silicone implants | [[price:breast-lift:silicone]] |
| Lipo 360 | [[price:lipo:lipo360]] |
| Liposuction of the abdomen and flanks, added to another procedure | [[price:lipo:abdomen-flanks]] |

[[combo-discount]] [[discount-statement]] See the [tummy tuck](/procedures/tummy-tuck-miami) and [breast augmentation](/procedures/breast-augmentation-miami) pages for what each part involves.

### Does Insurance Cover a Mommy Makeover?

Usually not. A mommy makeover is elective cosmetic surgery, and ASPS says **most health insurance plans don't cover a tummy tuck** or its complications. Check with your insurer before you plan around coverage.

### Mommy Makeover Financing

[[financing:long]]

## Mini Mommy Makeover: A Lighter Option

Not every mother needs comprehensive surgery. A **mini mommy makeover** offers targeted improvement at a lower cost:

### What's Included
- Mini tummy tuck (addresses lower abdomen only)
- Breast lift or small augmentation
- Optional: limited liposuction

### Mini Mommy Makeover Cost
A mini tummy tuck is [[price:tummy-tuck:mini]] on the practice's price list, against [[price:tummy-tuck:full]] for a full tummy tuck, so a mini mommy makeover costs less than a full one. [[price-caveat]] [[discount-statement]]

### Who's a Good Candidate
- Mothers with changes primarily below the belly button
- Those with good skin elasticity
- Women who want improvement without extended recovery

During your consultation, we'll assess whether a mini or full procedure better serves your goals.

## Am I a Good Candidate?

The best candidates for this post-pregnancy transformation typically meet these criteria:

### You're at a Stable Weight
Significant weight fluctuations after surgery can compromise your results. Be at a stable weight you can maintain; your surgeon decides at consultation.

### You've Completed Your Family
Future pregnancies can reverse improvements, particularly to the abdominal area.

### You're in Good Overall Health
Conditions like uncontrolled diabetes or blood clotting disorders may increase surgical risks.

### You Have Realistic Expectations
This procedure can make significant improvements, but won't erase every stretch mark or give you someone else's body. The goal is *your* figure, refined.

### You're Done Breastfeeding
We recommend waiting until you've finished breastfeeding and your breasts have settled; your surgeon tells you when.

## The Procedure Experience

### Before Surgery

Your journey begins with a consultation where we discuss your concerns and goals. We'll evaluate your anatomy, review medical history, and explain which combination of procedures fits your goals.

**Pre-operative preparation includes:**

- Stopping blood-thinning medications and supplements
- Arranging a ride home and someone to stay with you for at least the first night
- Preparing your recovery space with essentials within reach
- **Planning childcare for the first few weeks**

<ProcedureImage id="consultation" />

### Surgery Day

At Alluring, the combined procedure is performed under general anesthesia and typically takes 3-5 hours. Your surgeon sets the order of the procedures, which may include:

- **Breast procedures**: Augmentation, lift, or both
- **Abdominoplasty**: An incision low on the abdomen, muscle repair in a full or extended tummy tuck, and skin removal
- **Liposuction**: Sculpting flanks, hips, or thighs for balanced proportions

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
- If drains were placed, they usually come out in 1 to 2 weeks (Cindy Wu, MD, on the ASPS website)
- Swelling begins to subside

### Week 4-6: Gradual Return
- Resume most normal activities
- Light exercise approved
- Heavier lifting waits until your surgeon clears you, usually 4 to 8 weeks after surgery (Cleveland Clinic)
- **Most people begin to feel more like themselves around 8 weeks** (Shahram Salemy, MD, on the ASPS website)

### Month 3 and Beyond
- Swelling keeps going down until about 3 months after a tummy tuck (Cindy Wu, MD, on the ASPS website)
- Scars keep fading and flattening for a year or more
- All activities, including exercise, once your surgeon clears you

<ProcedureImage id="recovery-lifestyle" />

## Why Miami Mothers Choose Alluring

### One Surgeon
Every mommy makeover at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}

### Personalized Approach
No cookie-cutter plans. Every surgical combination is designed for your unique anatomy and goals.

### Comprehensive Care
Your relationship with us doesn't end at surgery.

## Your Transformation Starts Here

You've spent years putting your family first. The midnight feedings, the endless laundry, the school runs, the meal prep—you've given everything. Now it's time to invest in yourself.

A **mommy makeover** isn't about perfection or vanity. It's about looking in the mirror and seeing a reflection that matches how vibrant you feel inside. It's about wearing a swimsuit without constantly adjusting. It's about feeling confident in your own skin for the first time since your children were born.

**Call [${siteConfig.contact.phoneDisplay}](${getPhoneLink()}) today** to schedule your free consultation. We'll discuss your goals, explain your options, and provide a detailed cost estimate—with no pressure and no obligation.

Your journey back to confidence starts with one phone call.`,
    faqs: [
        {
            question: 'What is a mommy makeover?',
            answer: 'A mommy makeover is a customized combination of procedures—typically breast enhancement, tummy tuck, and liposuction—designed to address changes to your breasts and abdomen after pregnancy in a single surgery with one recovery period.',
        },
        {
            question: 'How much does a mommy makeover cost in Miami?',
            answer: 'At Alluring Plastic Surgery, a mommy makeover is priced from the procedures in your plan. On the practice price list a tummy tuck starts at [[price:tummy-tuck:mini]] (mini) or [[price:tummy-tuck:full]] (full), breast augmentation at [[price:breast-augmentation:saline]] (saline) or [[price:breast-augmentation:silicone]] (silicone), and a breast lift at [[price:breast-lift:modified]] (modified lift) or [[price:breast-lift:no-implants]] (full lift without implants). [[combo-discount]] Dr. Karlinsky confirms your exact price at your free consultation. [[discount-statement]]',
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: "Usually not. A mommy makeover is elective cosmetic surgery, and ASPS says most health insurance plans don't cover a tummy tuck or its complications. Check with your insurer before you plan around coverage. [[financing]]",
        },
        {
            question: 'What is a mini mommy makeover?',
            answer: 'A mini mommy makeover includes a mini tummy tuck (lower abdomen only) combined with breast surgery. A mini tummy tuck is [[price:tummy-tuck:mini]] on the practice price list, against [[price:tummy-tuck:full]] for a full one, and your surgeon confirms your price at consultation. It has a shorter recovery time and suits mothers with moderate post-pregnancy changes. [[discount-statement]]',
        },
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: 'A typical mom makeover includes breast augmentation or lift (or both), tummy tuck, and liposuction. The exact combination is customized to your needs and may also include an arm lift or a thigh lift.',
        },
        {
            question: 'What is the recovery time for a mommy makeover?',
            answer: "At Alluring, most patients return to light activity in 2 to 3 weeks, and school pickup is usually possible then if you don't lift children. Because a mommy makeover usually includes a tummy tuck, running and lifting wait about 6 weeks (Cindy Wu, MD, on the ASPS website), and a full recovery takes around 3 months (Samir Rao, MD, on the ASPS website). Plan for childcare help during the first few weeks.",
        },
        {
            question: 'When can I see mommy makeover before and after results?',
            answer: "You'll see a change right away, and your result keeps settling as swelling goes down; after a tummy tuck, swelling keeps going down until about 3 months (Cindy Wu, MD, on the ASPS website). Our gallery shows before-and-after photos of Dr. Karlinsky's patients.",
        },
        {
            question: 'Is a mommy makeover safe?',
            answer: `Like all surgeries, a mommy makeover carries risks, and combining procedures makes the surgery longer. At Alluring Plastic Surgery, ${KARLINSKY_NAME} performs every mommy makeover and reviews your health, your plan and how long your surgery will take with you at your consultation.`,
        },
        {
            question:
                'How soon can I have a mommy makeover after giving birth?',
            answer: "We recommend waiting until your body has recovered from pregnancy, your weight is stable and you've finished breastfeeding, so your breasts have settled. Your surgeon tells you when.",
        },
        {
            question:
                'Can I have a mommy makeover if I plan to have more children?',
            answer: 'A 2023 review found no deaths of mothers or babies in pregnancies after a tummy tuck (Karunaratne and colleagues, Aesthetic Plastic Surgery), but ASPS advises women who may want future pregnancies to postpone one, and a pregnancy can affect your results, especially the tummy tuck portion.',
        },
        {
            question: 'Does a mommy makeover leave scars?',
            answer: 'Yes, but scars are strategically placed in the bikini line and breast crease—hidden by underwear and swimwear. Scars keep improving for up to a year, and a tummy tuck scar usually turns thinner and lighter at around 12 to 18 months (Cindy Wu, MD, on the ASPS website). We give you scar care guidance.',
        },
        {
            question: 'How long do the results of a mommy makeover last?',
            answer: 'With stable weight and no future pregnancies, results are long-lasting. The FDA says breast implants are not lifetime devices, and they may need to be replaced.',
        },
    ],
}
