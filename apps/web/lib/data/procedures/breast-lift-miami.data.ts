import type { Procedure } from '@/lib/types/procedure.type'
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

// The 16:9 crop of the hero (candidate 2, the Coconut Grove banyan, picked
// 2026-10-28): og:image, the home cards, procedure cards, the sitemap and the
// paid landing page hero. The old `/images/procedures/breast-lift.jpg` (a
// lingerie crop on the chest, which breaks the image rules) is no longer read
// by this file; the quiz still reads it.
const HERO_WIDE =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/breast-lift/2026-11/hero-wide-alluring-plastic-surgery-miami.jpg'

const HERO_WIDE_ALT =
    'Woman with long chestnut waves in a white short-sleeved midi dress on a shaded Coconut Grove garden path, banyan roots and crotons around her'

export const breastLiftMiami: Procedure = {
    title: 'Breast Lift Miami',
    slug: 'breast-lift-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. Prices from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`).
    description: `A breast lift (mastopexy) raises breasts that have dropped by removing loose skin, tightening the tissue and moving the nipple higher, with or without implants. At Alluring in Miami, one surgeon performs every breast lift: ${KARLINSKY_NAME}. A breast lift is ${breastLiftFigure('price-lift')} without implants, ${breastLiftFigure('price-lift-saline')} with saline implants and ${breastLiftFigure('price-lift-silicone')} with silicone implants. Your surgeon confirms your price at consultation.`,

    // Hand-written metadata (D4 of the #320 brief). The generated title ended
    // "| Board-Certified Surgeons", a certification claim naming no board,
    // which Florida Rule 64B8-11.001(2)(j) does not allow. The head term and
    // the year stay first, as on the liposuction and tummy tuck pages, so the
    // day-28 read can tell a ranking change from a click-through change.
    // After the "|": the two prices most searches compare, a lift alone and
    // a lift with implants; with implants is where no Miami competitor
    // publishes a lower price (the 2026-09-30 market sweep). No surgeon's
    // name, so a staffing change doesn't touch it.
    seoTitle: `Breast Lift Miami ${new Date().getFullYear()} | ${breastLiftFigure('price-lift')}, With Implants From ${breastLiftFigure('price-lift-saline')}`,
    //
    // Written for the cost cluster, which the page now owns (D5): all three
    // main prices and the one surgeon. Under the 160 `clampMetaDescription`
    // limit.
    metaDescription: `Breast lift in Miami: ${breastLiftFigure('price-lift')} without implants, ${breastLiftFigure('price-lift-saline')} with saline and ${breastLiftFigure('price-lift-silicone')} with silicone. Performed by ${KARLINSKY_NAME}. Free consultation.`,
    // `/llms.txt`, `/llms-full.txt` and the procedure cards read this, so it
    // says what the page says.
    shortDescription: `Breast lift in Miami: ${breastLiftFigure('price-lift')} without implants, ${breastLiftFigure('price-lift-saline')} with saline and ${breastLiftFigure('price-lift-silicone')} with silicone implants. Every breast lift at Alluring is performed by ${KARLINSKY_NAME}. Your surgeon confirms your price at consultation.`,
    heroSubtitle: 'A higher, firmer shape, with or without implants',
    category: 'breast',
    bodyLocation: 'Breast',
    image: HERO_WIDE,
    dateModified: '2026-11-04T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // Paid-LP hero pricing: a breast lift without implants. The modified lift
    // ($4,000) is a narrower option the price table lists with the sheet's
    // own description; leading with it would quote a price most patients
    // don't pay. No weekly figure: financing is offered but never quoted as
    // a number.
    priceFrom: breastLiftFigure('price-lift'),

    // Published price table, from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`): four options, each a row on
    // the page and an `Offer` of its own in the graph. The notes keep the
    // sheet's descriptions; which incision each price covers is an owner
    // question, so no note names one. What the price includes waits on the
    // owner, so `includes` stays empty and the page asks readers to get any
    // quote, ours included, itemized. "Breast Lift w/ Gynecomastia" on the
    // sheet is a male procedure and not part of this page. Every breast lift
    // price on the site — blog posts, the quiz — must match these.
    pricing: {
        startingAt: 4000,
        includes: [],
        options: [
            {
                label: 'Modified breast lift',
                startingAt: 4000,
                note: 'Removes skin from below the areola only. No implants.',
            },
            {
                label: 'Breast lift',
                startingAt: 5000,
                note: 'Without implants: your own breast, lifted and reshaped.',
            },
            {
                label: 'Breast lift with saline implants',
                startingAt: 6000,
                note: 'The lift, with saline implants for more fullness.',
            },
            {
                label: 'Breast lift with silicone implants',
                startingAt: 7000,
                note: 'The lift, with silicone gel implants for more fullness.',
            },
        ],
        factors: [
            {
                label: 'Which lift you need',
                description:
                    'How far your breasts have dropped, and how much skin there is to remove, decides the lift. Your surgeon tells you which at your exam.',
            },
            {
                label: 'Implants, and which kind',
                description: `A breast lift with saline implants is ${breastLiftFigure('price-lift-saline')}, and with silicone implants ${breastLiftFigure('price-lift-silicone')}.`,
            },
            {
                label: 'Combined procedures',
                description: `When procedures are combined in one surgery, ${breastLiftFigure('price-combination-discount')} comes off the total for two procedures and ${breastLiftFigure('price-combination-discount', 1)} for three.`,
            },
        ],
    },

    keywords: [
        'breast lift miami',
        'mastopexy miami',
        'breast lift cost miami',
        'breast lift with implants miami',
        'breast lift surgeon miami',
        'breast lift before and after miami',
    ],
    quickStats: {
        // Cleveland Clinic's two pages give 1–2 and 2.5–3 hours
        // (`breast-lift.facts.ts` surgery-time). How long a lift takes at
        // Alluring is an owner question.
        duration: 'About 1 to 3 Hours',
        anesthesia: 'General Anesthesia, Usually',
        // `breast-lift.facts.ts` work-about-1-week. Also the graph's
        // `followup`, the paid landing page's stats and `/llms-full.txt`.
        recovery: 'About 1 Week to a Desk Job',
        // ASPS: the final shape settles over a few months.
        results: 'Final Shape Over a Few Months',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Four options, four prices',
            description: `From a modified lift at ${breastLiftFigure('price-modified')} to a lift with silicone implants at ${breastLiftFigure('price-lift-silicone')}, every option is on the practice's price list, so you can compare before you book.`,
        },
        {
            title: 'One surgeon you can check',
            description: `Every breast lift at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            title: 'Your shape back, with or without implants',
            description:
                'A breast lift raises the breast and the nipple and reshapes it with your own tissue; implants add fullness when you want it.',
        },
        {
            title: 'A recovery you can plan',
            description: `Most people are back at a desk job in about a week, and lifting and exercise usually wait up to ${breastLiftFigure('vigorous-up-to-6-weeks')}, Cleveland Clinic says, so you can line up help before surgery day.`,
        },
    ],
    // The graph's `howPerformed`, and the paid landing page.
    process: [
        {
            step: 1,
            title: 'Marking the plan',
            description:
                'Before surgery, your surgeon marks the new position of the nipple and the skin to remove, so the plan follows your shape.',
        },
        {
            step: 2,
            title: 'Anesthesia and the incision',
            description:
                'You usually receive general anesthesia. The incision is the one your lift needs: around the areola, down to the breast crease, or along the crease as well.',
        },
        {
            step: 3,
            title: 'Lifting and reshaping',
            description:
                'The breast is lifted and reshaped, the nipple and areola are moved up to a natural height, and a stretched areola can be made smaller.',
        },
        {
            step: 4,
            title: 'Implants, when planned',
            description:
                'In a lift with implants, the implant is placed to add fullness. ASPS says this can be done in the same surgery or in a second one.',
        },
        {
            step: 5,
            title: 'Closing and support',
            description:
                'The loose skin is removed, the incisions are closed, and you go home in a surgical bra or dressing, with someone to drive you and stay with you for at least the first night.',
        },
    ],
    // One definition site-wide: the page's "What is a breast lift?" answer.
    quickAnswer: {
        question: 'What is a breast lift?',
        answer: 'A breast lift, or mastopexy, raises breasts that have dropped by removing loose skin and tightening the tissue around them, and moves the nipple and areola higher.',
        details:
            'It changes shape and position, not size: for more fullness, it is combined with implants. ASPS says it can make an enlarged areola smaller too.',
    },
    // The page's FAQ, the graph's FAQPage node, the paid landing page and
    // `/llms-full.txt` all read this list. Pricing words appear only in the
    // price question: the landing page drops any FAQ that mentions one.
    faqs: [
        {
            question: 'How much does a breast lift cost in Miami?',
            answer: `At Alluring, a breast lift is ${breastLiftFigure('price-lift')} without implants, ${breastLiftFigure('price-lift-saline')} with saline implants and ${breastLiftFigure('price-lift-silicone')} with silicone implants, and a modified lift, which removes skin from below the areola only, is ${breastLiftFigure('price-modified')}. These are starting prices from the practice's price list. Your price is set for you after an exam, estimates may change, and ${KARLINSKY_NAME} confirms your price at consultation. Financing is available for qualified applicants.`,
        },
        {
            question:
                "What's the difference between a breast lift and a breast augmentation?",
            answer: "A breast lift raises breasts that have dropped and reshapes them with your own tissue, and ASPS says it doesn't significantly change their size. A breast augmentation adds size with implants but, on its own, isn't enough to lift breasts that sag (Lawrence Iteld, MD, on the ASPS website). When you want both, they are combined in a lift with implants.",
        },
        {
            question: 'Can you get a breast lift without implants?',
            answer: "Yes. A lift on its own raises and reshapes your own breast tissue and moves the nipple higher, and ASPS says it doesn't significantly change your size. It suits you if you like your size and want it higher and firmer. If you also want more fullness, your surgeon can tell you at your exam whether implants make sense.",
        },
        {
            question:
                'Can I have a breast lift and implants in the same surgery?',
            answer: `Often, yes. ASPS says implants can go in during the lift or in a second surgery, depending on the surgeon, and with more sagging two surgeries can be the safer plan (Jaime Schwartz, MD, on the ASPS website). A 2014 review of ${breastLiftFigure('lift-with-implants-review')} found that ${breastLiftFigure('lift-with-implants-review', 1)} of patients had another operation after a lift with implants in one surgery (Khavanin and colleagues). Your surgeon tells you which plan is safer for you.`,
        },
        {
            question: 'Which type of breast lift do I need?',
            answer: 'It depends on how far your breasts have dropped and on the amount of loose skin. The Aesthetic Society says a ring around the areola suits mild sagging, a lollipop scar down to the breast crease moderate sagging, and an anchor scar, which adds a line along the crease, severe sagging. A crescent above the areola is less common. Your surgeon recommends one at your exam.',
        },
        {
            question:
                'Where will the breast lift scars be, and will they fade?',
            answer: `Cleveland Clinic says almost all breast lift scars sit at the border of the areola, in the breast crease or along the breast's natural contours, though some show on the surface. Which ones you have depends on your lift. The scars are permanent, but they fade a lot, most of it in about ${breastLiftFigure('scar-fades-1-year')}, Cleveland Clinic says.`,
        },
        {
            question:
                'How long is breast lift recovery, and when can I go back to work?',
            answer: `Most people go back to desk work and gentle activity, such as walking, in about a week, Cleveland Clinic says, and swelling and bruising last about ${breastLiftFigure('swelling-2-weeks')}. The Aesthetic Society advises no lifting, driving, laundry or cleaning for the first ${breastLiftFigure('no-lifting-2-weeks')}. Lifting, exercise and sex can take up to ${breastLiftFigure('vigorous-up-to-6-weeks')} to be cleared (Cleveland Clinic).`,
        },
        {
            question: 'How should I sleep after a breast lift?',
            answer: 'On your back, at first. Cleveland Clinic says some surgeons prefer you to sleep on your back for a few weeks, and The Aesthetic Society advises resting on your back, propped up, for the first days or while swelling is significant. Ask your surgeon when you can sleep on your side.',
        },
        {
            question: 'Will I lose nipple sensation after a breast lift?',
            answer: `You may, for a while. Cleveland Clinic says feeling in the nipples and breasts gradually returns over a few weeks or months, some people are numb for up to ${breastLiftFigure('sensation-up-to-1-year')}, and rarely the loss is permanent. With the usual techniques the nipple stays attached to the tissue beneath it, which helps preserve sensation (The Aesthetic Society).`,
        },
        {
            question: 'Can I breastfeed after a breast lift?',
            answer: "Often, yes, but it isn't certain. With the usual techniques the nipple and areola stay attached to the tissue beneath them, which preserves the ability to breastfeed (The Aesthetic Society), and many women have breastfed after a lift (Shahram Salemy, MD, on the ASPS website). Cleveland Clinic lists difficulty breastfeeding among the risks, and CDC notes that after breast surgery most mothers can make some milk, though not always a full supply.",
        },
        {
            question: 'How long do breast lift results last?',
            answer: 'ASPS calls the results long-lasting, but your breasts keep changing with age and gravity, and a pregnancy can undo much of the lift. Keeping your weight stable helps, and Cleveland Clinic says the results should last several years. The sources do not agree on a set number of years.',
        },
        {
            question:
                'When is the right time for a breast lift after pregnancy or weight loss?',
            answer: `When you are done having children and your weight is stable: ASPS says pregnancy can minimize or reverse a lift, and significant weight loss afterward can change the result. After breastfeeding, Shahram Salemy, MD, writing on the ASPS website, suggests waiting up to ${breastLiftFigure('wait-after-breastfeeding-6-months')} after it stops, so the breasts settle into their final shape. Tell your surgeon about any weight-loss medication you take.`,
        },
        {
            question:
                'What should I know about implants in a lift with implants?',
            answer: `The FDA says implants are not lifetime devices: the longer you have them, the more likely you are to need them removed or replaced. They carry a boxed warning, your health care provider must review the FDA patient decision checklist with you, and the doctor implanting them must sign it. With silicone implants, the FDA recommends a first ultrasound or MRI ${breastLiftFigure('fda-silicone-screening')} after surgery, then every ${breastLiftFigure('fda-silicone-screening', 1)}.`,
        },
        {
            question: 'Can you lift breasts without surgery?',
            answer: "Not the way surgery does. A surgical lift removes stretched skin and moves the nipple higher. The FDA describes non-invasive body contouring as procedures that don't remove any tissue, and says no such device is cleared or approved for the breasts. Creams and exercise haven't been shown to lift breasts either.",
        },
        {
            question: 'Does insurance cover a breast lift?',
            answer: "Usually not. ASPS says most health insurance plans don't cover a breast lift or its complications, because it is cosmetic surgery. Check with your insurer before you plan around coverage.",
        },
        {
            question:
                'How many nights should I stay in Miami after a breast lift?',
            answer: 'It depends on your surgery. Your surgeon tells you how many nights to stay in Miami before you fly home, and your surgery, pre-op and follow-up dates are confirmed in writing. You arrange the travel yourself, and you can start with a virtual consultation before you plan anything.',
        },
    ],

    // The paid landing page's hero reads the `hero` entry; nothing else here
    // is rendered since the breast lift page module retired the markdown
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
