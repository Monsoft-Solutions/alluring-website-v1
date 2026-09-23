import type { Procedure } from '@/lib/types/procedure.type'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

const HERO_WIDE =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/liposuction/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg'

const HERO_WIDE_ALT =
    'Woman in ivory linen trousers and a taupe knit top walking down a bright limestone hallway lined with sheer-curtained windows, a camel blazer over her arm'

export const liposuctionMiami: Procedure = {
    title: 'Liposuction Miami',
    slug: 'liposuction-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. The "board-certified surgeons", "power-assisted" and
    // "state-of-the-art facility" claims it carried are out until the owner
    // confirms them.
    description: `Liposuction removes stubborn fat that diet and exercise haven't moved, to reshape an area rather than to lose weight. At Alluring in Miami, one surgeon performs every liposuction: ${KARLINSKY_NAME}. Lipo 360 starts at ${lipoFigure('price-starting-at')}.`,

    // Hand-written metadata. The generated title ended "| Board-Certified
    // Surgeons", a certification claim naming no board, which Florida Rule
    // 64B8-11.001(2)(j) does not allow, so the rebuild had to change it.
    // Only that part changes: the head term and the year stay first, so the
    // day-28 read can tell a ranking change from a click-through change.
    seoTitle: `Liposuction Miami ${new Date().getFullYear()} | ${KARLINSKY_NAME}`,
    //
    // Written for the cost cluster, where the page ranks best (positions
    // 45–50, Search Console, 180 days to 2026-09-19): the price, the one
    // surgeon as an MD, and what she offers that a volume special doesn't.
    // Under the 160 `clampMetaDescription` limit.
    metaDescription: `Liposuction in Miami: Lipo 360 from ${lipoFigure('price-starting-at')}, performed by one surgeon, ${KARLINSKY_NAME}. Real results, sourced recovery times. Free consultation.`,
    // `/llms.txt`, `/llms-full.txt` and the procedure cards read this, so it
    // says what the page says.
    shortDescription: `Liposuction in Miami, with Lipo 360 starting at ${lipoFigure('price-starting-at')}. Every liposuction at Alluring is performed by ${KARLINSKY_NAME}.`,
    heroSubtitle: 'Stubborn fat removed and your shape refined, by one surgeon',
    category: 'body',
    bodyLocation: 'Abdomen, flanks, back, arms and thighs',
    // og:image, the home signature card, procedure cards and the sitemap: the
    // 2026-09 hero in its 16:9 crop. The page hero uses the 4:5 master.
    image: HERO_WIDE,
    dateModified: '2026-09-22T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // Paid-LP hero pricing. No weekly figure: financing is offered but never
    // quoted as a number.
    priceFrom: lipoFigure('price-starting-at'),

    // Published price table, from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`). Lipo 360 is the only
    // standalone liposuction on the sheet; single areas are add-ons to
    // another procedure. What the price includes waits on the owner, so
    // `includes` stays empty and the page asks readers to get any quote,
    // ours included, itemized. Every liposuction price on the site — blog
    // posts, the quiz — must match these.
    pricing: {
        startingAt: 4000,
        includes: [],
        factors: [
            {
                label: 'How many areas',
                description:
                    'Lipo 360 treats several areas around the midsection in one surgery. Each area added beyond that, such as the arms or thighs, adds time and cost.',
            },
            {
                label: 'Added to another procedure',
                description: `Liposuction of one area added to another procedure, such as a tummy tuck, is ${lipoFigure('price-added-area')}, depending on the area.`,
            },
            {
                label: 'Combined surgery',
                description:
                    'Pairing liposuction with a BBL or a tummy tuck changes the scope of the surgery, and the price with it.',
            },
        ],
    },

    keywords: [
        'liposuction miami',
        'lipo 360 miami',
        'liposuction cost miami',
        'lipo miami',
        'miami liposuction',
        'liposculpture miami',
        'liposuction near me',
        'body contouring miami',
    ],
    quickStats: {
        // The practice's published figures (`lipo.facts.ts`
        // surgery-1-3-hours); confirm with the owner.
        duration: '1 to 3 Hours',
        anesthesia: 'General or Local with Sedation',
        // `lipo.facts.ts` work-few-days and work-weeks-2-3-asps. Also the
        // graph's `followup`, the paid landing page's stats and
        // `/llms-full.txt`.
        recovery: 'A Few Days to 2–3 Weeks Off Work',
        // `lipo.facts.ts` results-3-6-months.
        results: 'Final Shape at 3 to 6 Months',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Fat that diet and exercise have not moved',
            description:
                'Liposuction removes fat cells from a chosen area for good, to reshape it rather than to lose weight.',
        },
        {
            title: 'One surgeon you can check',
            description: `Every liposuction at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            title: 'Home the same day',
            description: `Liposuction at Alluring usually takes ${lipoFigure('surgery-1-3-hours')}, depending on how many areas are treated, and you go home the same day.`,
        },
        {
            title: 'A result that lasts with a stable weight',
            description:
                'The fat cells removed do not come back. Keep a stable weight and general fitness, and the new shape lasts.',
        },
    ],
    // The graph's `howPerformed`, and the paid landing page.
    process: [
        {
            step: 1,
            title: 'Marking the plan',
            description:
                'Before surgery, your surgeon marks the areas to treat while you stand, so the plan follows your shape.',
        },
        {
            step: 2,
            title: 'Anesthesia and numbing fluid',
            description:
                'You receive anesthesia, and each area is filled with a fluid that numbs the tissue and reduces bleeding, known as the tumescent technique.',
        },
        {
            step: 3,
            title: 'Removing the fat',
            description:
                'Through small incisions, the surgeon moves a thin tube called a cannula under the skin to loosen and remove fat, evening out each area as it goes.',
        },
        {
            step: 4,
            title: 'Compression and home',
            description:
                'The small incisions are closed, you are fitted with a compression garment, and you go home the same day with someone to drive you.',
        },
    ],
    // One definition site-wide: the page's "What is liposuction?" answer.
    quickAnswer: {
        question: 'What is liposuction?',
        answer: 'Liposuction, sometimes called liposculpture, is surgery that removes fat from a specific area through small incisions, using a thin tube called a cannula.',
        details:
            'It reshapes areas where fat stays despite diet and exercise, such as the abdomen, flanks, back, arms or thighs. It is not a weight-loss treatment, and it does not tighten skin or improve cellulite.',
    },
    // The page's FAQ, the graph's FAQPage node, the paid landing page and
    // `/llms-full.txt` all read this list. Pricing words appear only in the
    // price question: the landing page drops any FAQ that mentions one.
    faqs: [
        {
            question: 'How much does liposuction cost in Miami?',
            answer: `At Alluring, Lipo 360 starts at ${lipoFigure('price-starting-at')}, and liposuction of one area added to another procedure is ${lipoFigure('price-added-area')}, depending on the area. Your price is set for you after an exam and confirmed at your consultation. Price ranges are estimates and may change. Financing is available, subject to credit approval.`,
        },
        {
            question: 'How long does liposuction take?',
            answer: `Liposuction at Alluring usually takes ${lipoFigure('surgery-1-3-hours')}, depending on how many areas are treated, and you go home the same day. Someone needs to drive you home.`,
        },
        {
            question: 'Will I be asleep for liposuction?',
            answer: 'Liposuction at Alluring is done under general anesthesia or under local anesthesia with sedation, depending on the areas treated. Your surgeon recommends the right one for you at your consultation and explains who will give it.',
        },
        {
            question: 'How soon can I go back to work after liposuction?',
            answer: `The Aesthetic Society says most people return to work within a few days, and ASPS's recovery timeline puts it in weeks 2 to 3, depending on your job. A desk job comes back sooner than one that involves lifting. Most people resume most of their normal activities within ${lipoFigure('normal-activities-10-days')}.`,
        },
        {
            question:
                'How long do I wear a compression garment after liposuction?',
            answer: `The Aesthetic Society says you wear a compression garment over the treated areas for ${lipoFigure('garment-4-6-weeks')}, to control swelling and help your skin settle. Your surgeon's instructions come first.`,
        },
        {
            question: 'When can I exercise after liposuction?',
            answer: `Walk as soon as you can after surgery, which helps prevent blood clots, as MedlinePlus advises. The Aesthetic Society advises avoiding strenuous exercise for ${lipoFigure('exercise-4-6-weeks')}. Your surgeon clears you for workouts at follow-up.`,
        },
        {
            question: 'When will I see my final liposuction results?',
            answer: `Swelling hides the final result at first. The Aesthetic Society says swelling mostly goes down within ${lipoFigure('swelling-2-3-weeks-4-months')}, with slight swelling for up to ${lipoFigure('swelling-2-3-weeks-4-months', 1)}, and Cleveland Clinic says the final result can take ${lipoFigure('results-3-6-months')} to show.`,
        },
        {
            question: 'Is liposuction permanent?',
            answer: 'Liposuction permanently removes fat cells from the treated area, Cleveland Clinic says. The fat cells that remain can still grow if you gain weight, so ASPS says results last as long as you keep a stable weight and general fitness.',
        },
        {
            question: 'Do I need liposuction or a tummy tuck?',
            answer: 'Liposuction removes fat but does not tighten skin, as The Aesthetic Society notes. A tummy tuck removes loose skin and tightens the abdominal muscles. If your concern is stubborn fat under firm skin, liposuction may be enough; if it is loose skin, a tummy tuck may suit you better. Your surgeon tells you which at your consultation.',
        },
        {
            question: 'Does liposuction get rid of cellulite or loose skin?',
            answer: 'No. The Aesthetic Society says liposuction removes fat without tightening skin or improving the look of cellulite, and ASPS says it is not an effective treatment for cellulite. If loose skin is the main concern, a procedure that removes skin, such as a tummy tuck or an arm lift, may suit you better.',
        },
        {
            question: 'Can liposuction help me lose weight?',
            answer: `No. ASPS says liposuction is not a treatment for obesity or a substitute for diet and exercise. It reshapes areas where fat stays despite a stable weight. ASPS describes ideal candidates as adults within ${lipoFigure('asps-within-30-percent')} of their ideal weight, with firm, elastic skin, who don't smoke or vape.`,
        },
        {
            question:
                'How many nights should I stay in Miami after liposuction?',
            answer: 'It depends on your surgery. Your surgeon tells you how many nights to stay in Miami before you fly home, and your surgery, pre-op and follow-up dates are confirmed in writing. You arrange the travel yourself, and you can start with a virtual consultation before you plan anything.',
        },
    ],

    // The paid landing page's hero reads the `hero` entry; nothing else here
    // is rendered since the liposuction page module retired the markdown
    // body. The 16:9 crop, with the model label on the page itself.
    contentImages: [
        {
            id: 'hero',
            src: HERO_WIDE,
            alt: HERO_WIDE_ALT,
            section: 'hero',
            variant: 'full-width',
        },
    ],
}
