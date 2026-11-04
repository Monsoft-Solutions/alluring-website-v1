import type { Procedure } from '@/lib/types/procedure.type'
import { breastAugmentationFigure } from '@/lib/data/procedures/facts/breast-augmentation.facts'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

const figure = breastAugmentationFigure

const HERO_WIDE =
    'https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/procedures/breast-augmentation/2026-11/hero-wide-alluring-plastic-surgery-miami.jpg'

const HERO_WIDE_ALT =
    'Woman with dark hair in a low ponytail, in an ivory knit top and an open camel blazer, walking past a sculptural white facade with a palm on the left'

export const breastAugmentationMiami: Procedure = {
    title: 'Breast Augmentation Miami',
    slug: 'breast-augmentation-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. Prices from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`); AI engines were quoting the
    // page's old saline "$4,500–$6,500" and silicone "$5,500–$8,500" (#309).
    description: `Breast augmentation uses saline or silicone implants to add size and shape to the breasts. At Alluring in Miami, one surgeon performs every breast augmentation: ${KARLINSKY_NAME}. Breast augmentation starts at ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone implants, and your surgeon confirms your price at consultation.`,

    // Hand-written metadata (D4 of the wave-two brief). The generated title
    // ended "| Board-Certified Surgeons", a certification claim naming no
    // board, which Florida Rule 64B8-11.001(2)(j) does not allow. The head
    // term and the year stay first, as on the liposuction and tummy tuck
    // pages, so the day-28 read can tell a ranking change from a
    // click-through change. After the "|": the lower of the two prices
    // (both would run to 64 characters and truncate), named "Saline" as the
    // sheet does, not "Implants": whether the implants are in the price is
    // an open owner question. No surgeon's name, so a staffing change
    // doesn't touch it.
    seoTitle: `Breast Augmentation Miami ${new Date().getFullYear()} | Saline From ${figure('price-saline')}`,
    //
    // Written for the cost cluster, which the page now owns (D5): both
    // prices, the one surgeon, and the real photos "before and after"
    // searchers click for. 154 characters.
    metaDescription: `Breast augmentation in Miami: saline from ${figure('price-saline')}, silicone from ${figure('price-silicone')}. Every one by ${KARLINSKY_NAME}. Real patient photos. Free consultation.`,
    // `/llms.txt`, `/llms-full.txt` and the procedure cards read this, so it
    // says what the page says.
    shortDescription: `Breast augmentation in Miami starts at ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone implants. Every breast augmentation at Alluring is performed by ${KARLINSKY_NAME}.`,
    heroSubtitle: 'Implants sized to your frame, placed by one surgeon',

    category: 'breast',
    bodyLocation: 'Breast',
    // og:image, the home cards, procedure cards and the sitemap: the 16:9
    // crop of the page's hero.
    image: HERO_WIDE,
    dateModified: '2026-11-03T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // Paid-LP hero pricing: saline implants, the lower of the two
    // augmentation prices on the price sheet. No weekly figure: financing is
    // offered but never quoted as a number.
    priceFrom: figure('price-saline'),

    // Published price table, from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`): two implants, each a row on
    // the page and an `Offer` of its own in the graph. This page owns
    // augmentation only: a lift with implants is a breast lift and is
    // priced on that page. What the price includes, the implants among it,
    // waits on the owner, so `includes` stays empty and the page asks
    // readers to get any quote, ours included, itemized.
    pricing: {
        startingAt: 3500,
        includes: [],
        options: [
            {
                label: 'Breast augmentation with saline implants',
                startingAt: 3500,
                note: 'Filled with sterile salt water. A rupture shows, so no screening scans.',
            },
            {
                label: 'Breast augmentation with silicone implants',
                startingAt: 4500,
                note: 'Filled with silicone gel, which feels a bit more like breast tissue.',
            },
        ],
        factors: [
            {
                label: 'Saline or silicone',
                description: `The implant is the main difference: breast augmentation starts at ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone.`,
            },
            {
                label: 'A lift with your implants',
                description:
                    'If your breasts sag, implants with a lift are a breast lift, a different procedure with its own price. Your surgeon tells you at your exam whether you need one.',
            },
            {
                label: 'Combined procedures',
                description: `When procedures are combined in one surgery, ${figure('price-combination-discount')} comes off the total for two procedures and ${figure('price-combination-discount', 1)} for three.`,
            },
            {
                label: 'Replacing implants you already have',
                description: `An implant exchange is its own surgery, listed from ${figure('price-implant-exchange')} with saline implants and ${figure('price-implant-exchange', 1)} with silicone. Your surgeon confirms what yours involves at an exam.`,
            },
        ],
    },

    keywords: [
        'breast augmentation miami',
        'breast implants miami',
        'boob job miami',
        'breast augmentation cost miami',
        'how much is a boob job in miami',
        'breast augmentation prices miami',
        'silicone breast implants miami',
        'safe breast augmentation miami',
        'natural breast augmentation miami',
    ],
    quickStats: {
        // `breast-augmentation.facts.ts` surgery-length (the FDA). How long
        // it takes at Alluring is an owner question.
        duration: 'One to Several Hours',
        anesthesia: 'General Anesthesia for Most Women',
        // `breast-augmentation.facts.ts` work-few-days-to-a-week. Also the
        // graph's `followup`, the paid landing page's stats and
        // `/llms-full.txt`.
        recovery: 'Back to Work in a Few Days to a Week',
        // `breast-augmentation.facts.ts` drop-fluff-3-6-months: no figure here,
        // because a stat line has no room for who says it.
        results: 'Implants Settle Over Several Months',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Two options, two prices',
            description: `Breast augmentation starts at ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone, both on the practice's price list, so you can compare before you book.`,
        },
        {
            title: 'One surgeon you can check',
            description: `Every breast augmentation at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            title: 'A size planned for your frame',
            description:
                "Your surgeon plans the implant around your proportions and the look you want in clothes, not a cup letter, because in Sientra's long-term study a wish for a different size or style was the most common reason implants came out.",
        },
        {
            title: 'The years ahead, explained',
            description:
                "The FDA's patient decision checklist, its scan schedule for silicone implants and what the makers' long-term studies found, explained before you decide.",
        },
    ],
    // The graph's `howPerformed`, the page's steps and the paid landing page.
    process: [
        {
            step: 1,
            title: 'Planning your implant',
            description:
                "At your consultation, your surgeon examines you, recommends an implant, a size, a placement and an incision, and reviews the FDA's patient decision checklist with you before you decide.",
        },
        {
            step: 2,
            title: 'Anesthesia',
            description:
                'Most women receive general anesthesia for breast implant surgery, the FDA says.',
        },
        {
            step: 3,
            title: 'The incision',
            description:
                'The incision goes in the fold under the breast, along the edge of the areola or in the armpit. Your surgeon recommends which at your exam.',
        },
        {
            step: 4,
            title: 'Placing the implant',
            description:
                'The implant goes into a pocket under the chest muscle or directly behind the breast tissue, over the muscle, depending on the implant, your body and the size you want.',
        },
        {
            step: 5,
            title: 'Closing, support and home',
            description:
                'The incisions are closed in layers and a support bra or band goes on. Most people go home once they are stable, typically after about an hour, with someone to drive them.',
        },
    ],
    // One definition site-wide: the page's "What is breast augmentation?"
    // answer.
    quickAnswer: {
        question: 'What is breast augmentation?',
        answer: 'Breast augmentation, also called a boob job, is surgery that increases the size of the breasts with saline or silicone implants or, sometimes, fat transfer, ASPS says.',
        details:
            "It can restore volume lost after pregnancy or weight loss and improve uneven breasts. It doesn't correct breasts that sag a lot; that takes a breast lift, sometimes in the same surgery.",
    },
    // The page's FAQ, the graph's FAQPage node, the paid landing page and
    // `/llms-full.txt` all read this list. Pricing words appear only in the
    // price question: the landing page drops any FAQ that mentions one.
    faqs: [
        {
            question: 'How much is a boob job in Miami?',
            answer: `At Alluring, a boob job, or breast augmentation, starts at ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone implants. A lift with implants is a breast lift, a different procedure with its own price. ${KARLINSKY_NAME} confirms your price at your consultation, after an exam. Prices are estimates and may change. Financing is available for qualified applicants, and ASPS says most health insurance plans won't cover cosmetic breast augmentation.`,
        },
        {
            question: 'How long do breast implants last?',
            answer: `There's no set number, and you don't have to replace them every ${figure('no-replacement-date')}. The FDA says implants are not lifetime devices and that how long they last varies by person and cannot be predicted. In the FDA's example patient checklist, as many as ${figure('removed-within-8-10-years')} of women who get implants for augmentation have them removed within ${figure('removed-within-8-10-years', 1)}. In Allergan's study of Natrelle silicone implants, ${figure('natrelle-original-implant')} of women still had an original implant after ${figure('natrelle-original-implant', 1)}.`,
        },
        {
            question: 'How old do you have to be to get breast implants?',
            answer: `The FDA approved saline implants for breast augmentation in women ${figure('fda-ages')} or older, and silicone gel implants in women ${figure('fda-ages', 1)} or older; for reconstruction, both are approved at any age. Your surgeon reviews your health and history at your consultation and tells you which implant suits you.`,
        },
        {
            question: 'Will my breast implants look natural?',
            answer: 'That depends mostly on the size of the implant against your frame and the breast tissue you have. Silicone gel feels a bit more like natural breast tissue, ASPS says, and smooth implants may show some rippling under the skin. Your surgeon recommends a size at consultation and talks through how each would look on your body. No surgeon can promise a result, and results differ from person to person.',
        },
        {
            question: 'Can I breastfeed after breast augmentation?',
            answer: `Many women can, though implants may make it harder. A 2023 review of ${figure('breastfeeding')} found that about ${figure('breastfeeding', 1)} of women with breast implants were able to breastfeed, against about ${figure('breastfeeding', 2)} of women without them, and concluded there may be some impairment in the ability to breastfeed (Chen and colleagues, Aesthetic Surgery Journal). The FDA says some women who have had breast augmentation can breastfeed and some cannot, and Cleveland Clinic says implants placed under the muscle usually affect milk production less.`,
        },
        {
            question: 'Can I still get mammograms with breast implants?',
            answer: 'Yes, and you should keep up regular screening mammograms, the American Cancer Society says. Tell the facility you have implants when you book, so it takes extra pictures, called implant displacement views, that show more of the breast tissue; they are easier when the implants are under the muscle. The FDA says breast cancer risk is the same as for other women.',
        },
        {
            question: 'What is breast implant illness?',
            answer: 'It is the name some patients give to symptoms such as fatigue, memory loss, rash, brain fog and joint pain, which the FDA says may be associated with breast implants. The FDA says these symptoms and their causes are poorly understood, and that in some cases removing the implants without replacing them is reported to reverse them. Individual risk has not been well established.',
        },
        {
            question: 'What is BIA-ALCL, and does it affect smooth implants?',
            answer: `BIA-ALCL is a cancer of the immune system, not breast cancer, that can develop in the scar tissue and fluid around an implant; the FDA considers an individual's risk low. It occurs more often with textured implants, the FDA says, but patients with smooth implants have also been diagnosed: of the cases reported to the FDA through June 2024, ${figure('bia-alcl-textured')} involved textured implants and ${figure('bia-alcl-textured', 1)} smooth ones. Symptoms such as swelling or a lump appear on average ${figure('bia-alcl-timing')} after surgery, ASPS says, and the FDA does not recommend removing implants that cause no symptoms.`,
        },
        {
            question: 'Do I need a breast lift with my implants?',
            answer: 'You may, if your breasts sag. ASPS says breast augmentation does not correct severely drooping breasts, and that a lift can often be done at the same time or may need a separate operation. At Alluring, implants with a lift are part of a breast lift, which has its own page. Your surgeon tells you which you need at your exam.',
        },
        {
            question:
                'Breast augmentation or breast reduction: which do I need?',
            answer: 'They do opposite jobs. Breast augmentation adds size and volume with implants. A breast reduction removes skin and tissue and reshapes the breast to make it smaller, and ASPS says it can ease back pain from heavy breasts. If your breasts feel deflated, ask about augmentation; if they feel heavy, ask about a reduction. Your surgeon tells you which fits at your exam.',
        },
        {
            question:
                'When can I lift my child or work out after breast augmentation?',
            answer: `Cleveland Clinic advises no heavy lifting for at least ${figure('heavy-lifting-4-weeks')}, and says returning to sports may take up to ${figure('sports-6-weeks')}. No source gives a single date for push-ups, and an article on the ASPS website says to avoid strenuous activity and upper-body movement for at least ${figure('chest-work-no-single-date')}, so your surgeon decides. If you have small children, line up help with lifting them before surgery, and ask your surgeon when you can carry them again. Many people go back to a desk job within a few days to a week, The Aesthetic Society says.`,
        },
        {
            question: 'When do breast implants drop and fluff?',
            answer: `Implants sit high and look flat at first, then settle over months. University of Utah Health says you begin to notice your final results around ${figure('drop-fluff-3-6-months')}, with subtle changes through ${figure('drop-fluff-3-6-months', 2)}, and an article on the ASPS website says the whole drop and fluff process can take ${figure('drop-fluff-3-6-months', 1)}. It varies from person to person, and your surgeon checks how your implants are settling at your follow-up visits.`,
        },
        {
            question: 'Can I use my own fat instead of implants?',
            answer: 'Fat transfer is another way to add volume: fat removed by liposuction from another part of your body is processed and injected into the breasts. The Aesthetic Society says it needs enough fat to spare, not all of the fat survives, and the surgery sometimes has to be repeated. Whether it suits you, on its own or with implants, is a question for your consultation.',
        },
        {
            question:
                'How many nights should I stay in Miami after breast augmentation?',
            answer: `It depends on your surgery. ${KARLINSKY_SHORT_NAME} tells you, in writing, how many nights to stay in Miami before you fly home, and your surgery, pre-op and follow-up dates are confirmed in writing. You arrange the travel yourself, and you can start with a virtual consultation before you plan anything.`,
        },
    ],

    // The paid landing page's hero reads the `hero` entry; nothing else here
    // is rendered since the breast augmentation page module retired the
    // markdown body and its images.
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
