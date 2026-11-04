import type { Procedure } from '@/lib/types/procedure.type'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
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
    description: `A mommy makeover combines a tummy tuck with breast surgery, often with liposuction, usually in one surgery. At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}. Each part has its own price: a mini tummy tuck from ${mommyMakeoverFigure('price-mini-tummy-tuck')}, a full tummy tuck from ${mommyMakeoverFigure('price-full-tummy-tuck')}, breast augmentation from ${mommyMakeoverFigure('price-augmentation-saline')} and a breast lift from ${mommyMakeoverFigure('price-lift')}.`,
    // `/llms.txt`, `/llms-full.txt`, the /procedures index and the procedure
    // cards read this, so it says what the page says.
    shortDescription: `A tummy tuck with breast surgery, often with liposuction, usually in one surgery and priced part by part. Every mommy makeover at Alluring is performed by ${KARLINSKY_NAME}.`,
    heroSubtitle:
        'Your breasts and abdomen after pregnancy, planned together by one surgeon',

    // Hand-written metadata. The generated title ended "| Board-Certified
    // Surgeons", a certification claim naming no board, which Florida Rule
    // 64B8-11.001(2)(j) does not allow, so the title changes with the redesign
    // (the 2026-11-03 brief waives the usual rule for it). The head term and
    // the year stay first, as on the other rebuilt pages. No surgeon's name,
    // so a staffing change doesn't touch it. No total: the sheet has none.
    seoTitle: `Mommy Makeover Miami ${new Date().getFullYear()} | Priced Part by Part + Financing`,
    // The three prices the cost cluster compares, and the one surgeon. Under
    // the 160 `clampMetaDescription` limit. The 5 Oct text's "$500 off two
    // procedures" stays out of the snippet while counsel's Florida 456.062
    // statement is pending; the page states the rule as it does today.
    metaDescription: `Mommy makeover in Miami: mini tummy tuck from ${mommyMakeoverFigure('price-mini-tummy-tuck')}, breast augmentation from ${mommyMakeoverFigure('price-augmentation-saline')}, breast lift from ${mommyMakeoverFigure('price-lift')}. Performed by ${KARLINSKY_NAME}.`,

    category: 'combined',
    bodyLocation: 'Abdomen and breast',
    image: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/2026-11/hero-wide-woman-linen-dress-terrace-alluring-plastic-surgery-miami.jpg',
    dateModified: '2026-11-03T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // No paid-LP price (`priceFrom`): the price sheet has no mommy makeover
    // line, and the old "$9,500" wasn't the practice's figure. Set it once the
    // practice confirms a starting price. No weekly figure either: financing
    // is offered but never quoted as a number.

    // The parts, from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`): each a row on the page and an
    // `Offer` of its own in the graph, named for the part, so nothing reads as
    // the price of a whole plan. `startingAt` is the lowest part sold on its
    // own and is never rendered as a mommy makeover price: the module's rail
    // labels it as a tummy tuck's. What the price includes waits on the owner,
    // so `includes` stays empty and the page asks readers to get any quote
    // itemized. Every price here matches `mommy-makeover.facts.ts`.
    pricing: {
        startingAt: 3000,
        includes: [],
        options: [
            {
                label: 'Mini tummy tuck',
                startingAt: 3000,
                note: 'Loose skin below the belly button. No muscle repair.',
            },
            {
                label: 'Extended mini tummy tuck',
                startingAt: 4000,
                note: 'A hip-to-hip incision. No muscle repair.',
            },
            {
                label: 'Full tummy tuck',
                startingAt: 4500,
                note: "Loose skin that doesn't extend to the hips.",
            },
            {
                label: 'Extended tummy tuck',
                startingAt: 5500,
                note: 'A hip-to-hip incision.',
            },
            {
                label: 'Breast augmentation, saline implants',
                startingAt: 3500,
            },
            {
                label: 'Breast augmentation, silicone implants',
                startingAt: 4500,
            },
            {
                label: 'Breast lift without implants',
                startingAt: 5000,
            },
            {
                label: 'Breast lift with saline implants',
                startingAt: 6000,
            },
            {
                label: 'Breast lift with silicone implants',
                startingAt: 7000,
            },
            {
                label: 'Breast reduction',
                startingAt: 6000,
                upTo: 9000,
                note: 'By size: small to medium, large or extra large.',
            },
            {
                label: 'Lipo 360',
                startingAt: 4000,
            },
            {
                label: 'Liposuction of the abdomen and flanks, added to another procedure',
                startingAt: 1500,
            },
        ],
        factors: [
            {
                label: 'The parts in your plan',
                description:
                    'Each part has its own price, so the plan you and your surgeon settle on sets your total.',
            },
            {
                label: 'Which tummy tuck you need',
                description:
                    'A mini, extended mini, full or extended tummy tuck, depending on where your loose skin sits and whether your muscles need repair.',
            },
            {
                label: 'Your breast procedure',
                description:
                    'An augmentation, a lift, a lift with implants or a reduction, and saline or silicone if your plan has implants.',
            },
            {
                label: 'Liposuction',
                description:
                    'Lipo 360 or an added area. Florida limits liposuction with a tummy tuck in an office, which can shape what fits in one surgery.',
            },
            {
                label: 'How many procedures you combine',
                description: `Combining two procedures takes ${mommyMakeoverFigure('price-combination-discount')} off the total, and three take ${mommyMakeoverFigure('price-combination-discount', 1)} off.`,
            },
        ],
    },

    keywords: [
        'mommy makeover miami',
        'mommy makeover cost',
        'how much is a mommy makeover',
        'mommy makeover price',
        'mom makeover',
        'mini mommy makeover cost',
        'post pregnancy surgery',
        'breast augmentation tummy tuck',
        'mommy makeover financing miami',
        'tummy tuck breast lift combo miami',
    ],
    quickStats: {
        // How long a plan takes at Alluring is an owner question, and no
        // source gives a length for a mommy makeover (the old "3 to 5 Hours"
        // had none).
        duration: 'Set at Your Consultation',
        anesthesia: 'General Anesthesia',
        // `mommy-makeover.facts.ts` work-2-weeks. Also the graph's `followup`,
        // the paid landing page's stats and `/llms-full.txt`.
        recovery: 'About 2 Weeks Off Work',
        results: '6 Months to a Year for the Final Result',
        // No `inpatientOutpatient`: an overnight stay is an owner question.
    },
    // `/llms-full.txt` and the paid landing page read these. The paid page
    // shows no price, so none of them talks about one.
    benefits: [
        {
            title: 'One plan, one surgeon',
            description: `Your breasts and abdomen are planned together, by the surgeon who performs every mommy makeover at Alluring: ${KARLINSKY_NAME}.`,
        },
        {
            title: 'Only the parts you need',
            description:
                'A plan is built from a tummy tuck, a breast procedure and, when it helps, liposuction. Your surgeon may tell you that you need fewer parts than you expected.',
        },
        {
            title: 'Usually one surgery, one recovery',
            description: `ASPS says a mommy makeover is typically performed as a single-stage procedure, so the parts heal together. ${KARLINSKY_SHORT_NAME} tells you at your consultation whether your plan fits in one surgery.`,
        },
        {
            title: 'A recovery you can plan around',
            description: `The Aesthetic Society says to plan about ${mommyMakeoverFigure('work-2-weeks')} off work and someone else caring for small children for at least ${mommyMakeoverFigure('children-2-weeks')}. Your surgery, pre-op and follow-up dates are confirmed in writing.`,
        },
    ],
    // The page's steps and the graph's `howPerformed`.
    process: [
        {
            step: 1,
            title: 'Your consultation and plan',
            description: `You and ${KARLINSKY_SHORT_NAME} go through what has changed and what you want to change. She examines you, settles with you which parts your plan includes, and tells you how long your surgery will take.`,
        },
        {
            step: 2,
            title: 'Getting ready',
            description: `You stop smoking for the time your surgeon sets and line up an adult to take you home and stay with you, and someone else to care for small children for at least ${mommyMakeoverFigure('children-2-weeks')}. Your surgery, pre-op and follow-up dates are confirmed in writing.`,
        },
        {
            step: 3,
            title: 'Surgery: your breast procedure',
            description:
                'You receive general anesthesia. Depending on your plan, your surgeon performs a breast augmentation, a lift, a lift with implants or a reduction. Your surgeon sets the order of the parts.',
        },
        {
            step: 4,
            title: 'Surgery: your tummy tuck and any liposuction',
            description:
                'ASPS says a tummy tuck removes excess fat and skin and, in most cases, restores weakened or separated muscles. Liposuction, when your plan includes it, treats the areas you and your surgeon chose.',
        },
        {
            step: 5,
            title: 'Recovery',
            description: `You don't go home alone. Plan on about ${mommyMakeoverFigure('work-2-weeks')} off work. Driving, lifting your children and exercise come back over the weeks after that, as your surgeon clears them, and your final result can take ${mommyMakeoverFigure('results-6-12-months', 1)} to a year.`,
        },
    ],
    // One definition site-wide: this, the "What is…?" FAQ and the page's
    // answer use the same wording.
    quickAnswer: {
        question: 'What is a mommy makeover?',
        answer: "A mommy makeover combines procedures that restore the shape of a woman's body after childbearing, usually a tummy tuck with breast surgery and often liposuction. ASPS says it is typically performed as a single-stage procedure.",
        details: `At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}. Each part has its own price, and she confirms yours at your consultation.`,
    },
    // 14 questions. The paid landing page drops any whose question or answer
    // has a pricing term, on purpose: the three that talk about price say so in
    // their question, and the others stay free of those terms (`PRICING_TERMS`
    // in app/landing/procedure/[slug]/page.tsx). The module renders answers as
    // plain text, so links to the posts live in the page's own sections.
    faqs: [
        {
            question: 'What is a mommy makeover?',
            answer: `A mommy makeover combines procedures that restore the shape of a woman's body after childbearing, usually a tummy tuck with breast surgery and often liposuction. ASPS says it is typically performed as a single-stage procedure. At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}.`,
        },
        {
            question: 'How much does a mommy makeover cost in Miami?',
            answer: `At Alluring, a mommy makeover is priced from the parts in your plan. A tummy tuck starts at ${mommyMakeoverFigure('price-mini-tummy-tuck')} (mini) or ${mommyMakeoverFigure('price-full-tummy-tuck')} (full), breast augmentation at ${mommyMakeoverFigure('price-augmentation-saline')} (saline) or ${mommyMakeoverFigure('price-augmentation-silicone')} (silicone), a breast lift at ${mommyMakeoverFigure('price-lift')} without implants, and Lipo 360 at ${mommyMakeoverFigure('price-lipo-360')}. Combining two procedures takes ${mommyMakeoverFigure('price-combination-discount')} off the total, and three take ${mommyMakeoverFigure('price-combination-discount', 1)} off. ${KARLINSKY_NAME} confirms your price at your consultation, after an exam. Prices are estimates and may change. Financing is available, subject to credit approval.`,
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: `Usually not. ASPS says most health insurance plans do not cover tummy tuck or breast lift surgery or their complications, and will not cover cosmetic breast augmentation. Ask your insurer about your own plan. Financing is available through ${getFinancingPartnersString()}, subject to credit approval.`,
        },
        {
            question: 'What is a mini mommy makeover, and what does it cost?',
            answer: `The name has no fixed definition, so ask any clinic which parts it includes. If it means a mini tummy tuck with breast surgery, note that on our price list a mini tummy tuck doesn't include muscle repair: it starts at ${mommyMakeoverFigure('price-mini-tummy-tuck')}, against ${mommyMakeoverFigure('price-full-tummy-tuck')} for a full tummy tuck. Whether a mini fits depends on where your loose skin sits and whether your muscles have separated, which ${KARLINSKY_SHORT_NAME} tells you at your exam.`,
        },
        {
            question: 'Am I a good candidate for a mommy makeover?',
            answer: `ASPS describes candidates as women in good medical health, at their ideal body weight, finished with childbearing and with realistic expectations. Not smoking, a stable weight and enough time since your last baby and since breastfeeding matter too. ${KARLINSKY_SHORT_NAME} tells you at your consultation, including when it isn't the right choice.`,
        },
        {
            question:
                'How soon after having a baby can I have a mommy makeover?',
            answer: `Kristy Hamilton, MD, quoted by ASPS, tells patients to wait at least ${mommyMakeoverFigure('timing-delivery')} after delivery, longer if their body is still changing, and to have stopped breastfeeding for at least ${mommyMakeoverFigure('timing-breastfeeding')}, preferably ${mommyMakeoverFigure('timing-breastfeeding', 1)}. Nneamaka Nwubah, MD, also quoted by ASPS, calls ${mommyMakeoverFigure('timing-delivery', 1)} the sweet spot. There is no one rule, so ${KARLINSKY_SHORT_NAME} looks at where you are at your consultation.`,
        },
        {
            question:
                'Can I have a mommy makeover if I plan to have more children?',
            answer: 'You can, but the usual advice is to wait until you are done. ASPS advises women who may want future pregnancies to postpone a tummy tuck, and The Aesthetic Society says pregnancy or weight gain afterward may compromise your results. A 2023 review of studies on pregnancy after a tummy tuck found no deaths of mothers or babies (Karunaratne and colleagues, Aesthetic Plastic Surgery, 2023).',
        },
        {
            question: 'Is a mommy makeover safe?',
            answer: `Every surgery carries risk, and combining procedures adds some. In an insurance database of ${mommyMakeoverFigure('major-complications')}, major complications followed ${mommyMakeoverFigure('major-complications', 1)} of tummy tucks done alone, ${mommyMakeoverFigure('major-complications', 3)} of those with a breast procedure and ${mommyMakeoverFigure('major-complications', 4)} of those with liposuction and a breast procedure (Winocour and colleagues, 2015). A 2026 review of ${mommyMakeoverFigure('combined-meta-2026')} found the risk of a tummy tuck with breast surgery comparable to a tummy tuck alone and higher than breast surgery alone (Skorochod and Wolf). Blood clots followed ${mommyMakeoverFigure('vte-combined', 2)} of combined cosmetic procedures and ${mommyMakeoverFigure('vte-combined', 3)} of single ones, and the study calls the overall rate relatively low (Winocour and colleagues, 2017). ${KARLINSKY_SHORT_NAME} reviews your plan's length and your health with you.`,
        },
        {
            question: 'What is the recovery time for a mommy makeover?',
            answer: `Plan on about ${mommyMakeoverFigure('work-2-weeks')} off work and someone else caring for small children for at least ${mommyMakeoverFigure('children-2-weeks')} (The Aesthetic Society). You may be comfortable driving in ${mommyMakeoverFigure('driving-2-3-weeks')}, lifting your children waits ${mommyMakeoverFigure('lifting-children-4-6-weeks')} and strenuous activity about ${mommyMakeoverFigure('strenuous-6-weeks')}. Your surgeon's instructions come first.`,
        },
        {
            question: 'Can I drive after a mommy makeover?',
            answer: `The Aesthetic Society says you may be comfortable enough to drive in ${mommyMakeoverFigure('driving-2-3-weeks')}, or when your sutures and drains are out and you are no longer taking pain medication. Your surgeon clears you to drive.`,
        },
        {
            question: 'Does a mommy makeover leave scars?',
            answer: `Yes. The Aesthetic Society says you will likely have scars hidden in your bikini line or under your bra, and that fading and flattening take ${mommyMakeoverFigure('scars-6m-2y')} to ${mommyMakeoverFigure('scars-6m-2y', 1)}. A tummy tuck scar becomes thinner and lighter in color at around ${mommyMakeoverFigure('scar-12-18-months')} (Cindy Wu, MD, on the ASPS website).`,
        },
        {
            question:
                'When will I see my mommy makeover results, and how long do they last?',
            answer: `After a tummy tuck, swelling keeps going down until about ${mommyMakeoverFigure('swelling-3-months')} (Cindy Wu, MD), and your final mommy makeover result can take ${mommyMakeoverFigure('results-6-12-months', 1)} to a year (Frank Campanile, MD, both on the ASPS website). Results can last with a stable weight, but The Aesthetic Society says pregnancy or weight gain may compromise them, and the FDA says breast implants are not considered lifetime devices.`,
        },
        {
            question: 'What should I ask at a mommy makeover consultation?',
            answer: 'Ask who performs your surgery and what board certifies them, which procedures your plan includes and why, how long your surgery will take and when a plan is split into two surgeries, what is done to prevent blood clots, where the surgery takes place, exactly what your quote includes, and how many nights to stay in Miami before flying home.',
        },
        {
            question:
                'I live in another state. Can I have my mommy makeover at Alluring?',
            answer: `Yes. You can start with a virtual consultation. ${KARLINSKY_SHORT_NAME} sets your plan, your surgery, pre-op and follow-up dates are confirmed in writing, and she tells you how many nights to stay in Miami before you are cleared to fly home. You arrange your own travel and stay: the practice doesn't coordinate them.`,
        },
    ],
}
