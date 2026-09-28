import type { Procedure } from '@/lib/types/procedure.type'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

const HERO_WIDE =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/images/procedures/tummy-tuck/hero.webp'

const HERO_WIDE_ALT =
    'Woman in a white top and cream wide-leg trousers standing on a terrace at sunset'

export const tummyTuckMiami: Procedure = {
    title: 'Tummy Tuck Miami',
    slug: 'tummy-tuck-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. Prices from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`); AI engines were quoting the
    // "$3,500" and "5,000+ procedures" this used to carry (#309).
    description: `A tummy tuck (abdominoplasty) removes loose skin and fat from the abdomen and can repair separated abdominal muscles. At Alluring in Miami, one surgeon performs every tummy tuck: ${KARLINSKY_NAME}. A mini tummy tuck is ${tummyTuckFigure('price-mini')} and a full tummy tuck ${tummyTuckFigure('price-full')}.`,

    // Hand-written metadata (D4 of the wave-two brief). The generated title
    // ended "| Board-Certified Surgeons", a certification claim naming no
    // board, which Florida Rule 64B8-11.001(2)(j) does not allow. The head
    // term and the year stay first, as on the liposuction page, so the
    // day-28 read can tell a ranking change from a click-through change.
    // After the "|": the two prices most searches compare, mini and full.
    // No surgeon's name, so a staffing change doesn't touch it.
    seoTitle: `Tummy Tuck Miami ${new Date().getFullYear()} | Mini From ${tummyTuckFigure('price-mini')}, Full From ${tummyTuckFigure('price-full')}`,
    //
    // Written for the cost cluster, which the page now owns (D5): the whole
    // price range, which no Miami competitor publishes, and the one surgeon.
    // Under the 160 `clampMetaDescription` limit.
    metaDescription: `Five tummy tucks, five prices: a mini at ${tummyTuckFigure('price-mini')} to a fleur-de-lis at ${tummyTuckFigure('price-fleur-de-lis')}. Every one performed by ${KARLINSKY_NAME}. Free consultation.`,
    // `/llms.txt`, `/llms-full.txt` and the procedure cards read this, so it
    // says what the page says.
    shortDescription: `Tummy tuck in Miami, from a mini at ${tummyTuckFigure('price-mini')} to a full tummy tuck at ${tummyTuckFigure('price-full')}. Every tummy tuck at Alluring is performed by ${KARLINSKY_NAME}.`,
    heroSubtitle:
        'Loose skin removed and your abdomen tightened, by one surgeon',
    category: 'body',
    bodyLocation: 'Abdomen',
    // og:image, the home cards, procedure cards and the sitemap. Replaced by
    // the 2026-09 hero's 16:9 crop once it is picked (Gate 4).
    image: HERO_WIDE,
    dateModified: '2026-09-28T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // Paid-LP hero pricing: the mini tummy tuck, the lowest tummy tuck price
    // on the price sheet. No weekly figure: financing is offered but never
    // quoted as a number.
    priceFrom: tummyTuckFigure('price-mini'),

    // Published price table, from the practice's price sheet of 2026-09-15
    // (`docs/pricing/practice-price-list.md`): five kinds of tummy tuck, each
    // a row on the page and an `Offer` of its own in the graph. The notes
    // keep the sheet's descriptions. What the price includes waits on the
    // owner, so `includes` stays empty and the page asks readers to get any
    // quote, ours included, itemized. Every tummy tuck price on the site —
    // blog posts, the quiz — must match these.
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
                note: 'A hip-to-hip incision, when loose skin reaches the hips.',
            },
            {
                label: 'Fleur-de-lis tummy tuck',
                startingAt: 10000,
                note: 'Adds a vertical scar, usually after major weight loss.',
            },
        ],
        factors: [
            {
                label: 'Which tummy tuck you need',
                description:
                    'Where your loose skin sits, and whether your muscles need repair, decides between a mini, a full and an extended tummy tuck. Your surgeon tells you which at your exam.',
            },
            {
                label: 'Liposuction added',
                description: `Liposuction of the abdomen and flanks, added to a tummy tuck to shape the waist, is ${tummyTuckFigure('price-lipo-add-on')}.`,
            },
            {
                label: 'Combined procedures',
                description: `When procedures are combined in one surgery, ${tummyTuckFigure('price-combination-discount')} comes off the total for two procedures and ${tummyTuckFigure('price-combination-discount', 1)} for three.`,
            },
        ],
    },

    keywords: [
        'tummy tuck miami',
        'abdominoplasty miami',
        'tummy tuck cost miami',
        'mini tummy tuck miami',
        'extended tummy tuck',
        'fleur de lis tummy tuck',
        'tummy tuck and liposuction',
        'tummy tuck recovery',
        'tummy tuck scar',
    ],
    quickStats: {
        // Cleveland Clinic's range (`tummy-tuck.facts.ts` surgery-1-5-hours).
        // How long each type takes at Alluring is an owner question.
        duration: '1 to 5 Hours, Depending on Type',
        anesthesia: 'General Anesthesia',
        // `tummy-tuck.facts.ts` work-about-2-weeks. Also the graph's
        // `followup`, the paid landing page's stats and `/llms-full.txt`.
        recovery: 'About 2 Weeks to a Desk Job',
        // `tummy-tuck.facts.ts` results-3-months.
        results: 'Final Result at About 3 Months',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Five types, five prices',
            description: `From a mini tummy tuck at ${tummyTuckFigure('price-mini')} to a fleur-de-lis at ${tummyTuckFigure('price-fleur-de-lis')}, every type is on the practice's price list, so you can compare before you book.`,
        },
        {
            title: 'One surgeon you can check',
            description: `Every tummy tuck at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            title: 'Loose skin removed, muscles repaired when needed',
            description:
                'A tummy tuck removes loose skin and fat from the abdomen and, in most cases, ASPS says, repairs weakened or separated muscles.',
        },
        {
            title: 'A recovery you can plan',
            description: `Most people are back at a desk job in about ${tummyTuckFigure('work-about-2-weeks')} and feel more like themselves around ${tummyTuckFigure('feel-normal-8-weeks')}, so you can line up help before surgery day.`,
        },
    ],
    // The graph's `howPerformed`, and the paid landing page.
    process: [
        {
            step: 1,
            title: 'Marking the plan',
            description:
                'Before surgery, your surgeon marks the incision and the skin to remove while you stand, so the plan follows your shape.',
        },
        {
            step: 2,
            title: 'Anesthesia and the incision',
            description:
                'You receive general anesthesia. The incision runs low across the abdomen, between the pubic hairline and the belly button, where underwear covers it. Its length depends on the type of tummy tuck.',
        },
        {
            step: 3,
            title: 'Muscle repair, when needed',
            description:
                "In a full or extended tummy tuck, separated abdominal muscles are stitched back together. The mini and extended mini on our price list don't include this step.",
        },
        {
            step: 4,
            title: 'Removing the loose skin',
            description:
                'The skin above is drawn down and the extra skin and fat are removed. In most full tummy tucks, a second incision sets the belly button in its natural place.',
        },
        {
            step: 5,
            title: 'Closing, garment and home',
            description:
                'The incisions are closed, small drains may be placed to carry off fluid, and a compression garment goes on. Someone drives you home and stays with you for at least the first night.',
        },
    ],
    // One definition site-wide: the page's "What is a tummy tuck?" answer.
    quickAnswer: {
        question: 'What is a tummy tuck?',
        answer: 'A tummy tuck, or abdominoplasty, is surgery that removes loose skin and fat from the abdomen and, in most cases, ASPS says, repairs weakened or separated abdominal muscles.',
        details:
            "It flattens and firms the abdomen after pregnancy or weight loss. It is not a weight-loss treatment, and it can't correct stretch marks, except those on the skin it removes.",
    },
    // The page's FAQ, the graph's FAQPage node, the paid landing page and
    // `/llms-full.txt` all read this list. Pricing words appear only in the
    // price question: the landing page drops any FAQ that mentions one.
    faqs: [
        {
            question: 'How much does a tummy tuck cost in Miami?',
            answer: `At Alluring, a mini tummy tuck is ${tummyTuckFigure('price-mini')}, an extended mini ${tummyTuckFigure('price-extended-mini')}, a full tummy tuck ${tummyTuckFigure('price-full')}, an extended tummy tuck ${tummyTuckFigure('price-extended')} and a fleur-de-lis ${tummyTuckFigure('price-fleur-de-lis')}. Liposuction of the abdomen and flanks, added to a tummy tuck, is ${tummyTuckFigure('price-lipo-add-on')}. ${KARLINSKY_NAME} confirms your price at your consultation, after an exam. Price ranges are estimates and may change. Financing is available, subject to credit approval.`,
        },
        {
            question:
                "What's the difference between a mini and a full tummy tuck?",
            answer: `A mini tummy tuck treats loose skin below the belly button through a shorter incision, about the length of a C-section scar (${tummyTuckFigure('mini-scar-3-6-inches')}, Cleveland Clinic), and generally leaves the belly button alone. At Alluring it doesn't include muscle repair. A full tummy tuck treats the whole abdomen, usually with a scar from hip bone to hip bone and one around the belly button, and in most cases repairs separated muscles, ASPS says.`,
        },
        {
            question: 'Does a tummy tuck repair separated abdominal muscles?',
            answer: "A full or extended tummy tuck usually can: ASPS says a tummy tuck restores weakened or separated muscles in most cases. The mini and extended mini tummy tucks at Alluring don't include muscle repair. Your surgeon examines your abdomen and tells you whether your muscles need it, and which tummy tuck does it.",
        },
        {
            question:
                'How long is tummy tuck recovery, and when can I go back to work?',
            answer: `Most people return to a desk job in about ${tummyTuckFigure('work-about-2-weeks')} (Cindy Wu, MD, on the ASPS website), and Cleveland Clinic says to plan at least ${tummyTuckFigure('work-about-2-weeks', 1)} off work. By type, most go back to work ${tummyTuckFigure('work-by-type')} after a mini and ${tummyTuckFigure('work-by-type', 1)} after an extended tummy tuck (Samir Rao, MD). You walk bent at the waist for the first ${tummyTuckFigure('bent-7-10-days')}, and a full recovery takes around ${tummyTuckFigure('recover-3-months')}.`,
        },
        {
            question: 'When can I lift my children after a tummy tuck?',
            answer: `Not for the first few weeks: picking up children, or anything heavy, is strongly advised against, so line up help with childcare before surgery (Shahram Salemy, MD, on the ASPS website). Running and lifting wait ${tummyTuckFigure('lifting-6-weeks')} (Cindy Wu, MD), and Cleveland Clinic puts heavy lifting at usually ${tummyTuckFigure('heavy-lifting-4-8-weeks')}, once your surgeon clears you.`,
        },
        {
            question: 'Will I have drains after a tummy tuck?',
            answer: `You may. ASPS says small tubes may be placed under the skin to drain excess fluid, and when drains are used they come out once the fluid slows, usually in ${tummyTuckFigure('drains-1-2-weeks')} (Cindy Wu, MD, on the ASPS website). Whether you'll have them depends on the technique, and your surgeon tells you at your consultation.`,
        },
        {
            question: 'Where will the tummy tuck scar be, and will it fade?',
            answer: `Low on the abdomen, placed so underwear or swimsuit bottoms cover it (Jonathan Weiler, MD, on the ASPS website). A full tummy tuck scar usually runs from hip bone to hip bone, just above the pubic area, often with a scar around the belly button; a mini's is about the length of a C-section scar (Cleveland Clinic). After a C-section, ASPS says, the old scar may become part of the new one. The scar turns thinner and lighter at around ${tummyTuckFigure('scar-fades-12-18-months')}.`,
        },
        {
            question: 'Can I combine a tummy tuck with liposuction or a BBL?',
            answer: `Liposuction of the abdomen and flanks can be added to shape the waist. In a doctor's office, Florida allows at most ${tummyTuckFigure('florida-lipo-with-tummy-tuck-1000cc')} of fat to be removed by liposuction in the same operation as a tummy tuck, and a BBL takes its fat from liposuction, so your surgeon tells you whether to do both in one surgery or plan two. Combining adds some risk: in one large study, major complications followed ${tummyTuckFigure('major-complications', 1)} of tummy tucks done alone and ${tummyTuckFigure('major-complications', 2)} of those with liposuction.`,
        },
        {
            question: 'Can I get pregnant after a tummy tuck?',
            answer: `Yes, but ASPS advises postponing a tummy tuck if you may want to be pregnant again, because weight changes can undo much of the result. For safety, a 2023 review of ${tummyTuckFigure('pregnancy-after')} and ${tummyTuckFigure('pregnancy-after', 1)} who became pregnant after a tummy tuck found no deaths of mothers or babies and concluded that pregnancy should not be ruled out (Karunaratne and colleagues).`,
        },
        {
            question: 'Does insurance cover a tummy tuck?',
            answer: "Usually not. ASPS says most health insurance plans don't cover a tummy tuck or its complications, because it is cosmetic surgery. Check with your insurer before you plan around coverage.",
        },
        {
            question: 'Will a tummy tuck remove stretch marks?',
            answer: 'Only the ones on the skin it removes. ASPS says a tummy tuck cannot correct stretch marks, although those on the excess skin that is cut away go with it, and others may look somewhat better.',
        },
        {
            question:
                'Can I have a tummy tuck after weight loss or GLP-1 medication?',
            answer: `Yes, once your weight has settled. Paul Vitenas, MD, writing on the ASPS website, advises being close to your goal weight for ${tummyTuckFigure('stable-weight-6-12-months')} first, and ASPS describes candidates as being at a stable weight. After major weight loss, loose skin can reach the hips, and an extended or fleur-de-lis tummy tuck may suit you better. Tell your surgeon about any weight-loss medication you take.`,
        },
        {
            question:
                'How many nights should I stay in Miami after a tummy tuck?',
            answer: 'It depends on your surgery. Your surgeon tells you how many nights to stay in Miami before you fly home, and your surgery, pre-op and follow-up dates are confirmed in writing. You arrange the travel yourself, and you can start with a virtual consultation before you plan anything.',
        },
    ],

    // The paid landing page's hero reads the `hero` entry; nothing else here
    // is rendered since the tummy tuck page module retired the markdown
    // body and its images.
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
