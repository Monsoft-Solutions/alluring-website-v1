/**
 * Copy for the BBL page module (#252), in the section order #256 builds.
 *
 * Draft status: the surgeon's name and credentials are placeholders until the
 * owner answers #247's two blocking questions. `pnpm --filter web
 * check:bbl-copy` sweeps every string here against `bbl.facts.ts`; with
 * `--launch` it also fails on any placeholder left in, which is the #256 gate.
 *
 * Rules the sweep enforces, so they are not repeated in comments below:
 * every figure is declared in `bbl.facts.ts`; no board-certification wording
 * outside `{{CREDENTIALS}}`; none of the six unconfirmed practice claims
 * (#247 item 3); no travel coordination and no market outside the US; no
 * "best", "safest" or guarantees; no keyword bolding; no pricing terms in a
 * non-price FAQ answer, or `/landing/procedure/[slug]` silently drops it.
 *
 * Not here, because other pages read them from the procedure data file and
 * they must not change in the #256 deploy: the H1 (`procedure.title`),
 * `seoTitle`, `metaDescription`, the URL and the `#pricing` anchor.
 */

import { getFinancingPartnersString } from '@/lib/data/site-config'
import {
    bblFigure,
    type BblFactId,
    type BblSourceId,
} from '@/lib/data/procedures/facts/bbl.facts'

/** Filled from #247 question 2: who performs BBLs at Alluring. */
export const BBL_SURGEON = '{{BBL_SURGEON}}'
/** Filled from #247 question 1: the exact approved credentials sentence. */
export const BBL_CREDENTIALS = '{{CREDENTIALS}}'

export const AI_MODEL_LABEL = 'Model shown. Not a patient.'

export interface BblLink {
    label: string
    href: string
}

export interface BblImageSlot {
    id: string
    /**
     * `live`: already on Blob. `pending-254`: the one new shot #254 delivers
     * before launch. `after-launch`: follows launch and never blocks it.
     */
    status: 'live' | 'pending-254' | 'after-launch'
    src?: string
    /**
     * A 16:9 version of the same picture, for the places that need a wide
     * crop: og:image, the home signature card and the paid landing hero.
     */
    wideSrc?: string
    aspect: '3:2' | '4:5' | '16:9'
    /** Describes the picture. No keyword lists. */
    alt: string
    /** Required on every AI image of a person. */
    label?: typeof AI_MODEL_LABEL
}

/** A question-phrased H2 with its 40–60 word direct answer. */
export interface BblAnswerSection {
    /** The anchor the jump links point at. */
    id: string
    heading: string
    answer: string
}

export interface BblFactRow {
    label: string
    value: string
    factIds?: readonly BblFactId[]
}

export interface BblListItem {
    title: string
    body: string
    sourceIds?: readonly BblSourceId[]
}

export interface BblMilestone {
    when: string
    body: string
    factIds: readonly BblFactId[]
}

export interface BblOption {
    name: string
    suits: string
    whatChanges: string
    link?: BblLink
}

export interface BblFaq {
    question: string
    answer: string
    /**
     * `price` answers may use pricing terms; the paid landing page drops them
     * by design. `general` answers must not.
     */
    topic: 'price' | 'general'
}

const financingPartners = getFinancingPartnersString()

export const bblImages = {
    hero: {
        id: 'hero',
        // #254 shot 1, moved before launch on 2026-09-18: the live hero is a
        // rear-view swimwear shot, which the imagery rules exclude.
        status: 'live',
        src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09/hero-alluring-plastic-surgery-miami.jpg',
        wideSrc:
            'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg',
        aspect: '4:5',
        alt: 'Woman in a sand linen midi dress with one hand on the window frame, looking out over the bay in morning light',
        label: AI_MODEL_LABEL,
    },
    consultation: {
        id: 'consultation',
        status: 'live',
        src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09/consultation-alluring-plastic-surgery-miami.jpg',
        aspect: '3:2',
        alt: "Patient reviewing a body-contour sketch on a tablet at a marble table, with only the clinician's hand and white sleeve in view",
        label: AI_MODEL_LABEL,
    },
    ultrasound: {
        id: 'ultrasound',
        status: 'after-launch',
        aspect: '3:2',
        alt: 'Ultrasound transducer, gel and a folded sterile drape on a steel tray in front of a blurred monitor',
    },
    recoveryEssentials: {
        id: 'recovery-essentials',
        status: 'after-launch',
        aspect: '4:5',
        alt: 'BBL pillow, folded compression garment, foam board, water bottle and slides laid out on warm white stone',
    },
    recoveryAtHome: {
        id: 'recovery-at-home',
        status: 'after-launch',
        aspect: '3:2',
        alt: 'Woman in linen loungewear lying on her side on a sofa, reading, with a BBL pillow beside her',
        label: AI_MODEL_LABEL,
    },
    backToLife: {
        id: 'back-to-life',
        status: 'after-launch',
        aspect: '4:5',
        alt: 'Woman in high-waisted jeans and a white tee walking along a shaded street',
        label: AI_MODEL_LABEL,
    },
} as const satisfies Record<string, BblImageSlot>

export const bblPageContent = {
    hero: {
        eyebrow: 'BBL in Miami',
        lede: 'A Brazilian butt lift moves your own fat from areas such as the abdomen, flanks and back to your buttocks for more shape and fullness, without implants. In Florida, the law requires that fat to stay under the skin, placed with ultrasound guidance.',
        factChips: [
            `Starting at ${bblFigure('price-starting-at')}`,
            '3–5 hour outpatient surgery',
            'Ultrasound-guided, as Florida law requires',
        ],
        primaryCta: { label: 'Book a free consultation', href: '#book' },
        secondaryCta: { label: 'Call us' },
        image: bblImages.hero,
    },

    jumpLinks: [
        { label: 'Cost', href: '#pricing' },
        { label: 'Results', href: '#results' },
        { label: 'Safety', href: '#safety' },
        { label: 'Surgeon', href: '#surgeon' },
        { label: 'Recovery', href: '#recovery' },
        { label: 'FAQ', href: '#faq' },
    ] satisfies readonly BblLink[],

    atAGlance: {
        id: 'what-is-a-bbl',
        heading: 'What is a BBL?',
        answer: 'A Brazilian butt lift (BBL) is a fat transfer to the buttocks. A surgeon uses liposuction to remove fat from areas such as the abdomen, flanks or back, processes it, and injects it under the skin of the buttocks to add volume and shape. Because it uses your own fat, there is no implant.',
        tableCaption: 'BBL at Alluring, at a glance',
        rows: [
            {
                label: 'Starting price',
                value: `Starting at ${bblFigure('price-starting-at')}`,
                factIds: ['price-starting-at'],
            },
            {
                label: 'Most patients',
                value: `${bblFigure('price-most-patients')}, set for each patient`,
                factIds: ['price-most-patients'],
            },
            {
                label: 'Surgery time',
                value: '3 to 5 hours',
                factIds: ['surgery-3-5-hours'],
            },
            {
                label: 'Anesthesia and setting',
                value: 'General anesthesia; outpatient, so you go home the same day',
                factIds: ['surgery-3-5-hours'],
            },
            { label: 'Your surgeon', value: BBL_SURGEON },
            {
                label: 'Florida standard',
                value: 'Fat under the skin only, placed with ultrasound guidance, one surgeon for one patient',
                factIds: [
                    'florida-fat-above-fascia',
                    'florida-ultrasound-guidance',
                    'florida-one-surgeon-one-patient',
                ],
            },
            {
                label: 'Back to a desk job',
                value: '10 to 14 days, sitting on a pillow',
                factIds: ['work-10-14-days'],
            },
            {
                label: 'Sitting',
                value: 'Not on your buttocks for 2 weeks; on a BBL pillow until about week 8',
                factIds: ['no-sitting-2-weeks', 'pillow-until-week-8'],
            },
            {
                label: 'Exercise',
                value: 'Walking from day 1 or 2; normal exercise at about 8 weeks',
                factIds: ['walking-from-day-2', 'exercise-at-8-weeks'],
            },
            {
                label: 'Flying in from another state',
                value: 'Plan on 7 to 10 days in Miami',
                factIds: ['stay-in-miami-7-10-days'],
            },
            {
                label: 'Final shape',
                value: '3 to 6 months after surgery',
                factIds: ['final-shape-3-6-months'],
            },
        ] satisfies readonly BblFactRow[],
        image: bblImages.consultation,
    },

    cost: {
        // Keep this id: body copy, blog posts and the price table link to it.
        id: 'pricing',
        heading: 'How much is a BBL in Miami?',
        answer: `A BBL at Alluring starts at ${bblFigure('price-starting-at')}, and most patients pay between $5,500 and $10,000. Your price is set for you after an exam, because it depends on how much fat is moved, how many areas are treated and what else is done. Price ranges are estimates and may change.`,
        includesHeading: 'What the price includes',
        includes: [
            'Your consultations before surgery and your surgical plan',
            "The surgeon's fee for the complete procedure",
            'Anesthesia',
            'The surgical facility',
            'Your compression garment and BBL pillow',
            'Every follow-up appointment after surgery',
        ],
        notIncluded:
            'Travel and your stay in Miami are not included. If you are flying in, you arrange them yourself.',
        factorsHeading: 'What moves your price within the range',
        factors: [
            {
                title: 'Volume of fat transferred',
                body: 'A larger transfer needs more liposuction and more time in surgery than a subtle one.',
            },
            {
                title: 'Number of donor areas',
                body: 'Taking fat from the abdomen alone is a smaller job than contouring the flanks, back and thighs in the same surgery.',
            },
            {
                title: 'Revision work',
                body: 'Correcting an earlier BBL takes more planning and more time than a first BBL.',
            },
            {
                title: 'Combined procedures',
                body: 'Adding a tummy tuck or another procedure to the same surgery changes the scope, and the price with it.',
            },
        ] satisfies readonly BblListItem[],
        skinnyAndRevision:
            'Skinny BBLs and revisions are priced the same way, after an exam.',
        lowerOffersHeading: 'Why some BBL offers cost less',
        lowerOffers:
            'Some advertised BBL prices leave out anesthesia, the facility, garments or follow-up visits, or describe a smaller procedure than the one you want. Ask every clinic, including us, for an itemized quote. Then ask whether the surgeon places the fat under ultrasound guidance and stays with one patient for the whole surgery, as Florida law requires.',
        financing: `Financing is available through ${financingPartners}, subject to credit approval. Insurance does not cover a BBL, because it is a cosmetic procedure.`,
        confirmation:
            'Your surgeon confirms your exact price at your consultation, before you commit to anything.',
    },

    beforeAfter: {
        id: 'results',
        heading: 'BBL before and after: what do real results look like?',
        answer: 'These are photos of real Alluring patients, shared with their consent and labeled with the time since surgery. Results differ from person to person, and your final shape shows 3 to 6 months after surgery, once swelling settles and the grafted fat that will survive has taken hold.',
        galleryLink: {
            label: 'See more BBL before and after photos',
            href: '/gallery/brazilian-butt-lift',
        },
        note: 'Photos on this page are real patients. Images elsewhere on the page that show a model are labeled as such.',
    },

    safety: {
        id: 'safety',
        heading: 'Is a BBL safe in Miami?',
        answer: "A BBL's most serious risk is a fat embolism: fat injected into or below the gluteal muscle can enter a blood vessel, which can be fatal. The risk is lowest when the fat stays under the skin, and Florida law now requires exactly that, along with ultrasound guidance and one surgeon for one patient.",
        lawHeading: 'What Florida law requires',
        lawSourceId: 'florida-statutes-458-328' satisfies BblSourceId,
        law: [
            {
                title: 'Fat under the skin only',
                body: 'Fat goes only into the layer under the skin and never crosses the fascia, the tissue that covers the gluteal muscle.',
            },
            {
                title: 'Ultrasound guidance',
                body: 'The surgeon uses ultrasound while moving the cannula, to see where the fat is going.',
            },
            {
                title: 'One surgeon, one patient',
                body: 'Your surgeon stays with you for the whole procedure and is not operating on anyone else at the same time.',
            },
            {
                title: 'An exam before surgery day',
                body: 'The surgeon examines you in person no later than the day before surgery.',
            },
            {
                title: 'The surgeon does the transfer',
                body: 'The surgeon removes and injects the fat personally. That work cannot be handed to anyone else.',
            },
        ] satisfies readonly BblListItem[],
        evidenceHeading: 'What the research shows',
        evidence: [
            {
                title: 'Why the law exists',
                body: 'South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022. 92% of those patients had surgery at high-volume, budget clinics, and in every case examined at autopsy, fat had been injected into the muscle (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023).',
                sourceIds: ['pazmino-garcia-2023'],
            },
            {
                title: 'How often complications happen',
                body: 'A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, most often a seroma (a pocket of fluid) in 2.03%. Major complications were less common with ultrasound guidance: 0.02% versus 0.08% (Elsaftawy and colleagues, Plastic and Reconstructive Surgery, 2026).',
                sourceIds: ['elsaftawy-meta-analysis-2026'],
            },
        ] satisfies readonly BblListItem[],
        checklistHeading: 'Questions to ask any BBL surgeon, including us',
        checklist: [
            'Where exactly will you place the fat, and how do you confirm it stays under the skin?',
            'Do you watch the cannula on ultrasound while you inject?',
            'Will you remove and inject the fat yourself, and stay with me for the whole surgery?',
            'Are you operating on anyone else while I am in surgery?',
            "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
            'Who gives the anesthesia, and where does the surgery take place?',
        ],
        closing:
            'A clinic that cannot answer these clearly is one to walk away from.',
        image: bblImages.ultrasound,
    },

    surgeon: {
        id: 'surgeon',
        heading: 'BBL surgeons in Miami: who performs your procedure',
        answer: `At Alluring, your BBL is performed by ${BBL_SURGEON}. ${BBL_CREDENTIALS} Under Florida law the surgeon examines you in person before surgery, removes and injects the fat personally and stays with you throughout, so you meet the surgeon who operates on you before surgery day.`,
        body: [
            'Searching for a BBL surgeon in Miami turns up a long list of names and a wide spread of prices. What separates them is where they put the fat, whether they follow Florida law on every case, how many patients they operate on at once, and whether you can check their credentials yourself.',
            `At your consultation, ${BBL_SURGEON} examines you, looks at where you carry fat, and tells you which type of BBL fits your body and your goals, including when a BBL is not the right choice.`,
        ],
        profileLink: { label: `Meet ${BBL_SURGEON}`, href: '/dr-karlinsky' },
        // #247 item 6 and item 5: an approved quote and a real portrait.
        // Rendered only when they exist; AI imagery never depicts the surgeon.
        quote: null,
        portrait: null,
    },

    options: {
        id: 'options',
        heading:
            'Which BBL is right for you: traditional, skinny, lipo 360 or revision?',
        answer: 'The right BBL depends on how much fat you have to move and what you want to change. A traditional BBL suits most people with fat to spare, a skinny BBL suits leaner bodies, lipo 360 reshapes the whole waist, and a revision corrects an earlier BBL. Your surgeon recommends one after an exam.',
        items: [
            {
                name: 'Traditional BBL',
                suits: 'People with enough fat in the abdomen, flanks or back to give the buttocks the volume they want.',
                whatChanges:
                    'Adds volume and shape to the buttocks and slims the areas the fat comes from.',
            },
            {
                name: 'Skinny BBL',
                suits: 'Leaner people who want a subtle, proportionate change.',
                whatChanges:
                    'A smaller volume, often gathered from several donor areas. The change is modest by design, and your surgeon tells you at the exam whether you have enough fat for the result you have in mind.',
            },
            {
                name: 'BBL with lipo 360',
                suits: 'People who want a narrower waist as well as more curve.',
                whatChanges:
                    'Liposuction treats the abdomen, flanks and back all the way around, which sharpens the contrast between waist and hips.',
            },
            {
                name: 'BBL revision',
                suits: 'People unhappy with an earlier BBL because of unevenness, dents, lost volume or sagging.',
                whatChanges:
                    'Starts with an exam of what was done before. Some problems are corrected with more fat, and some need a different plan.',
                link: {
                    label: 'How dents after a BBL are fixed',
                    href: '/how-to-fix-dents-after-bbl',
                },
            },
        ] satisfies readonly BblOption[],
        secondTransferLink: {
            label: 'What a double BBL is',
            href: '/what-is-a-double-bbl',
        },
        comparisonLink: {
            label: 'BBL vs tummy tuck, liposuction and butt implants',
            href: '/blog/tummy-tuck-vs-bbl-miami',
        },
    },

    procedure: {
        id: 'procedure',
        heading: 'How is BBL surgery performed?',
        answer: 'BBL surgery takes 3 to 5 hours under general anesthesia, and you go home the same day. The surgeon removes fat with liposuction, prepares it, injects it under the skin of the buttocks with ultrasound guidance, then closes the small incisions and fits your compression garment.',
        beforeSurgery:
            'Before surgery day, your surgeon examines you in person, reviews your health history and medications, and plans where fat will be taken from and where it will go.',
        steps: [
            {
                title: 'Liposuction',
                body: 'Through small incisions, the surgeon fills the donor areas with a fluid that numbs the tissue and reduces bleeding, then removes fat with a thin cannula. This is also when your waist is shaped.',
            },
            {
                title: 'Preparing the fat',
                body: 'The fat is separated from fluid and blood, so only usable fat is transferred.',
            },
            {
                title: 'Placing the fat',
                body: 'The surgeon injects the fat into the layer under the skin of the buttocks, watching the cannula on ultrasound so it never passes into the muscle.',
            },
            {
                title: 'Closing and compression',
                body: 'The small incisions are closed and you are fitted with a compression garment, which you wear 24/7 for the first month, or as your surgeon directs.',
            },
        ] satisfies readonly BblListItem[],
        afterSurgery:
            'Someone needs to drive you home and stay with you for the first days. Walking starts early, on day 1 or 2.',
    },

    recovery: {
        id: 'recovery',
        heading: 'What does BBL recovery look like, week by week?',
        answer: "Most people return to a desk job 10 to 14 days after a BBL, sit normally and exercise again at about 8 weeks, and feel recovered at 2 to 3 months, though it can take up to 6 months. The final shape shows at 3 to 6 months. Your surgeon's instructions come first.",
        milestones: [
            {
                when: 'Days 1–2',
                body: 'Short walks start. The Aesthetic Society says you should be able to get up and walk after the second day, which helps prevent blood clots.',
                factIds: ['walking-from-day-2'],
            },
            {
                when: 'Weeks 1–2',
                body: 'The strictest stretch: no sitting or lying on your buttocks for at least 2 weeks, and sleep on your stomach or side. Most people need some pain medication for the first 4 to 5 days, and Cleveland Clinic says pain eases after 1 to 2 weeks.',
                factIds: [
                    'no-sitting-2-weeks',
                    'sleep-stomach-or-side',
                    'pain-medication-4-5-days',
                    'pain-eases-1-2-weeks',
                ],
            },
            {
                when: 'Days 10–14',
                body: 'Back to a desk job and driving, sitting on a BBL pillow. Some surgeons allow work between days 7 and 10; a job that involves lifting needs longer.',
                factIds: ['work-10-14-days', 'work-asps-7-10-days'],
            },
            {
                when: 'Month 1',
                body: 'Compression garment 24/7, except in the shower, or as your surgeon directs. No heavy lifting or strenuous exercise.',
                factIds: ['garment-month-1', 'no-heavy-lifting-month-1'],
            },
            {
                when: 'Month 2',
                body: 'Garment at least 12 hours a day, or as your surgeon directs. Light activity such as fast walking. Sit only briefly on a pillow, about 10 minutes at a time through week 6, as a plastic surgeon interviewed by ASPS advises.',
                factIds: [
                    'garment-month-2',
                    'light-activity-after-month-1',
                    'brief-sitting-through-week-6',
                ],
            },
            {
                when: 'Week 8',
                body: 'Most people sit without a pillow and return to normal exercise, once their surgeon clears them.',
                factIds: ['pillow-until-week-8', 'exercise-at-8-weeks'],
            },
            {
                when: 'Months 2–3',
                body: 'Most people feel recovered, though it can take up to 6 months. The risk of losing grafted fat drops around month 3.',
                factIds: ['recovered-2-3-months', 'fat-loss-risk-month-3'],
            },
            {
                when: 'Months 3–6',
                body: 'Your final shape shows. About 50% to 80% of the grafted fat survives.',
                factIds: ['final-shape-3-6-months', 'fat-survival-50-80'],
            },
        ] satisfies readonly BblMilestone[],
        flyingHeading: 'If you are flying in from another state',
        flying: "Plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. We confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay; you arrange the travel itself. ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days, because an infection typically shows up 3 to 5 days after surgery.",
        guideLink: {
            label: 'BBL recovery week by week',
            href: '/how-long-to-recover-from-bbl',
        },
        links: [
            {
                label: 'When you can sit after a BBL',
                href: '/how-long-after-bbl-can-i-sit',
            },
            {
                label: 'How to sleep after a BBL',
                href: '/how-to-sleep-after-bbl',
            },
            {
                label: 'The compression garment, stage by stage',
                href: '/blog/bbl-compression-garment-timeline',
            },
            {
                label: 'Lymphatic massage after a BBL',
                href: '/how-many-massages-after-bbl',
            },
            {
                label: 'Which workouts come back when',
                href: '/blog/exercises-after-bbl-timeline',
            },
            {
                label: 'Flying home after a BBL',
                href: '/blog/flying-after-bbl-tips',
            },
            {
                label: 'Odor after a BBL, and when it matters',
                href: '/why-do-bbl-stink',
            },
        ] satisfies readonly BblLink[],
        images: [bblImages.recoveryEssentials, bblImages.recoveryAtHome],
    },

    reviews: {
        id: 'reviews',
        heading: 'What do BBL patients say about Alluring?',
        answer: "These reviews come from Alluring's public Google Business Profile. Reviews that mention a BBL appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time.",
    },

    faq: {
        id: 'faq',
        heading: 'BBL questions, answered',
        items: [
            {
                topic: 'general',
                question: 'Who performs BBLs at Alluring?',
                answer: `${BBL_SURGEON} performs BBLs at Alluring. ${BBL_CREDENTIALS} Florida law requires the operating surgeon to examine you in person no later than the day before surgery and to remove and inject the fat personally, so you meet your surgeon before surgery day.`,
            },
            {
                topic: 'general',
                question: 'What does Florida law require for a BBL?',
                answer: 'Florida Statutes §458.328 requires the surgeon to inject fat only into the layer under the skin, never crossing the fascia over the gluteal muscle, and to use ultrasound guidance while moving the cannula. The surgeon must also stay with one patient for the whole procedure, examine you in person no later than the day before, and do the fat removal and injection personally.',
            },
            {
                topic: 'general',
                question: 'What are the risks of a BBL?',
                answer: 'The most serious risk is a fat embolism, which is why Florida requires the fat to stay under the skin. Common complications are minor: a 2026 meta-analysis found minor complications in 3.58% of patients, most often a seroma, a pocket of fluid, in 2.03%. Other risks include infection, loss of grafted fat, unevenness and firm lumps of hardened fat.',
            },
            {
                topic: 'general',
                question: 'How long does BBL surgery take?',
                answer: 'A BBL takes 3 to 5 hours under general anesthesia, depending on the volume of fat moved and the number of areas treated. It is outpatient surgery, so you go home the same day, with someone to drive you and stay with you for the first days.',
            },
            {
                topic: 'general',
                question: 'Am I a good candidate for a BBL?',
                answer: 'You may be a good candidate if you are in good general health, at a weight you can keep stable, a non-smoker or willing to stop, and carry enough fat in areas such as the abdomen, flanks or back to move. Realistic expectations matter too: a BBL reshapes your figure, but it does not change your body type.',
            },
            {
                topic: 'general',
                question: "Can I get a BBL if I'm thin?",
                answer: 'Often, yes. A skinny BBL moves a smaller volume of fat, usually gathered from several areas, for a subtle and proportionate change. Whether you have enough fat for the result you want is something only an exam can tell, so bring your goals, and photos of shapes you like, to your consultation.',
            },
            {
                topic: 'general',
                question: 'Can I get a BBL after pregnancy?',
                answer: 'Yes, once you have finished breastfeeding and your weight has settled where you can keep it. At the exam your surgeon also looks at your abdomen: if pregnancy stretched the skin or separated the muscles, liposuction alone will not fix that, and a tummy tuck in the same surgery may be the better plan.',
            },
            {
                topic: 'general',
                question: 'What share of the transferred fat survives?',
                answer: 'About 50% to 80% of grafted fat survives a BBL. Plastic surgeons interviewed by ASPS put the average "take" around 60%, and a 2020 review in Seminars in Plastic Surgery estimates that 20% to 50% is reabsorbed. Keeping pressure off your buttocks for the first 8 weeks protects the fat that is taking hold.',
            },
            {
                topic: 'general',
                question: 'When will I see my final results, and do they last?',
                answer: 'Your final shape shows 3 to 6 months after surgery, once swelling settles. The fat that survives stays where it was placed and changes with your weight like the rest of your body fat, so the result lasts as long as your weight stays steady. Cleveland Clinic advises keeping your weight consistent to preserve it.',
            },
            {
                topic: 'general',
                question:
                    'How long should I stay in Miami after a BBL if I am flying in?',
                answer: "Plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. We confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay; you arrange your own travel. ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days.",
            },
            {
                topic: 'price',
                question: 'Does insurance cover a BBL, and can I finance it?',
                answer: `No. Insurance does not cover a BBL, because it is a cosmetic procedure. Financing is available through ${financingPartners}, subject to credit approval, and we can go through the options with you at your consultation. A BBL at Alluring starts at ${bblFigure('price-starting-at')}.`,
            },
        ] satisfies readonly BblFaq[],
    },

    sources: {
        id: 'sources',
        heading: 'Where do these figures come from?',
        answer: "Every recovery, results and safety figure on this page comes from the sources below, checked in September 2026. Where a figure is one surgeon's advice rather than a society's guidance, we say so. Your own surgeon's instructions always come first, and they may differ from these general ranges.",
        // Rendered from `bblSources` in this order. `alluring-practice` is
        // not listed: the practice's own figures are stated as ours in the
        // copy, not cited.
        sourceIds: [
            'cleveland-clinic-bbl',
            'aesthetic-society-bbl-aftercare',
            'asps-bbl-recovery-2022',
            'asps-blog-azad-2016',
            'asps-bbl-travel-2023',
            'ormseth-garments-2023',
            'semin-plast-surg-fat-grafting-2020',
            'florida-statutes-458-328',
            'pazmino-garcia-2023',
            'elsaftawy-meta-analysis-2026',
        ] satisfies readonly BblSourceId[],
        // #247 item 4. Until a named reviewer is confirmed the page shows
        // "Last updated" only and emits no `reviewedBy`.
        reviewedBy: null,
    },

    book: {
        id: 'book',
        heading: 'How do I book a BBL consultation in Miami?',
        answer: 'Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, recommends a type of BBL and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.',
        formHeading: 'Request your free consultation',
        nextSteps: [
            'A patient coordinator contacts you to find a consultation time.',
            'Your surgeon examines you, recommends a plan and confirms your price.',
            'If you go ahead, your dates are confirmed in writing.',
        ],
        image: bblImages.backToLife,
    },

    stickyBar: { book: 'Book', call: 'Call' },
} as const

/** Every question-phrased H2 on the page, in render order. */
export const bblAnswerSections: readonly BblAnswerSection[] = [
    bblPageContent.atAGlance,
    bblPageContent.cost,
    bblPageContent.beforeAfter,
    bblPageContent.safety,
    bblPageContent.surgeon,
    bblPageContent.options,
    bblPageContent.procedure,
    bblPageContent.recovery,
    bblPageContent.reviews,
    bblPageContent.sources,
    bblPageContent.book,
]
