import type { Procedure } from '@/lib/types/procedure.type'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

export const brazilianButtLiftBblMiami: Procedure = {
    title: 'Brazilian Butt Lift (BBL) Miami',
    slug: 'brazilian-butt-lift-bbl-miami',
    // Also the description in the page graph, `llms-full.txt` and the paid
    // landing page. The "board-certified surgeons, 5,000+ procedures" claims
    // it carried wait on the owner (#247), so they are out until confirmed.
    description:
        'BBL Miami starting at $5,500, priced for each patient, with financing available. Fat stays under the skin, placed with ultrasound guidance as Florida law requires. Free consultation.',

    // Hand-written metadata. This page competes for "bbl miami" and the
    // generic "bbl" / "brazilian butt lift" head terms, so it cannot run on
    // the generated pattern that gives the whole procedure directory an
    // identical SERP snippet (issue #229).
    //
    // The keyword registry assigns the BBL price cluster ("bbl cost miami",
    // "how much does a bbl cost" …) to this page: the planned /bbl-cost-miami
    // was dropped because Google already ranks this page for those searches.
    // The title still leads with the procedure, with the starting price as
    // the hook. Whether it should name "cost" waits for 28 days of data on
    // the #229 title (about 2026-10-09) — which the 2026-09-15 price change
    // restarts.
    seoTitle: 'BBL Miami | Brazilian Butt Lift Starting at $5,500',
    metaDescription:
        'A BBL transfers your own fat to add lift and fullness, no implants. Board-certified Miami surgeons. Starting at $5,500, priced per patient. Financing available.',
    shortDescription:
        'Sculpt your curves with precision. Our BBL procedure enhances the natural shape of your body by redistributing fat for a fuller, more lifted look.',
    heroSubtitle: 'Enhance Your Curves with a Brazilian Butt Lift',
    category: 'body',
    bodyLocation: 'Buttocks',
    // og:image, the home signature card, procedure cards and the sitemap.
    // #254 shot 1 in its 16:9 crop; the page hero uses the 4:5 master.
    image: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg',
    dateModified: '2026-09-11T00:00:00.000Z',
    datePublished: '2024-06-15T00:00:00.000Z',

    // Paid-LP hero pricing. No weekly figure: BBL financing is offered but
    // never quoted as a number.
    priceFrom: '$5,500',

    // Published price table. Set 2026-09-15: starting at $5,500, most
    // patients $5,500–$10,000, every price personalized and subject to
    // change, financing available with no figure. This replaces the $3,500 /
    // $15,000 / $34-a-week set from #229. Every BBL price on the site — blog
    // posts, home FAQ, quiz — must match these.
    pricing: {
        startingAt: 5500,
        upTo: 10000,
        // Rendered by the BBL page's cost section. Only what the practice has
        // confirmed: the anesthesiologist, facility accreditation and 24/7
        // access claims wait on the owner (#247 item 3).
        includes: [
            'Your consultations before surgery and your surgical plan',
            "The surgeon's fee for the complete procedure",
            'Anesthesia',
            'The surgical facility',
            'Your compression garment and BBL pillow',
            'Every follow-up appointment after surgery',
        ],
        factors: [
            {
                label: 'Volume of fat transferred',
                description:
                    'A larger transfer needs more liposuction and more time in surgery than a subtle one.',
            },
            {
                label: 'Number of donor areas',
                description:
                    'Taking fat from the abdomen alone is a smaller job than contouring the flanks, back and thighs in the same surgery.',
            },
            {
                label: 'Revision work',
                description:
                    'Correcting an earlier BBL takes more planning and more time than a first BBL.',
            },
            {
                label: 'Combined procedures',
                description:
                    'Adding a tummy tuck or another procedure to the same surgery changes the scope, and the price with it.',
            },
        ],
    },

    // The paid landing page's hero reads the `hero` entry; nothing else here
    // is rendered since the BBL page module (#256) retired the markdown body.
    // #254 shot 1, the 16:9 crop, with the model label on the page itself.
    contentImages: [
        {
            id: 'hero',
            src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09/hero-wide-alluring-plastic-surgery-miami.jpg',
            alt: 'Woman in a sand linen midi dress with one hand on the window frame, looking out over the bay in morning light',
            section: 'hero',
            variant: 'full-width',
        },
    ],

    keywords: [
        'brazilian butt lift miami',
        'bbl miami',
        'miami bbl',
        'bbl in miami',
        'bbl surgery miami',
        'bbl in miami florida',
        'bbl cost miami',
        'bbl miami prices',
        'skinny bbl miami',
        'brazilian butt lift procedure',
        'fat transfer to buttocks',
        'bbl vs butt implants',
        'bbl recovery miami',
        'bbl results miami',
    ],
    quickStats: {
        duration: '3 to 5 Hours',
        anesthesia: 'General Anesthesia',
        recovery: '10-14 Days Off Work',
        results: 'Long-lasting',
        inpatientOutpatient: 'Outpatient',
    },
    benefits: [
        {
            title: 'Natural Enhancement',
            description:
                'Uses your own fat rather than synthetic implants for results that move naturally and feel authentic.',
        },
        {
            title: 'Dual Body Contouring',
            description:
                'Slims your waist, abdomen, or thighs via liposuction while simultaneously enhancing your buttocks.',
        },
        {
            title: 'Customizable Outcomes',
            description:
                'Tailored to your unique anatomy and goals, from subtle fullness to dramatic transformation.',
        },
        {
            title: 'Minimal Scarring',
            description:
                'Uses tiny incisions for liposuction and injection that heal into nearly invisible marks.',
        },
    ],
    // Also the SurgicalProcedure's `howPerformed` in the page graph, so it
    // follows the page: fat goes under the skin only, never "at various
    // depths" (Florida Statutes §458.328).
    process: [
        {
            step: 1,
            title: 'Exam and plan',
            description:
                'Before surgery day, your surgeon examines you in person, reviews your health history and medications, and plans where fat will be taken from and where it will go.',
        },
        {
            step: 2,
            title: 'Liposuction',
            description:
                'Through small incisions, the surgeon removes fat from the donor areas with a thin cannula, shaping your waist at the same time.',
        },
        {
            step: 3,
            title: 'Preparing the fat',
            description:
                'The fat is separated from fluid and blood, so only usable fat is transferred.',
        },
        {
            step: 4,
            title: 'Placing the fat',
            description:
                'The surgeon injects the fat into the layer under the skin of the buttocks, watching the cannula on ultrasound so it never passes into the muscle.',
        },
        {
            step: 5,
            title: 'Closing and compression',
            description:
                'The small incisions are closed and you are fitted with a compression garment, worn 24/7 for the first month, or as your surgeon directs.',
        },
    ],
    quickAnswer: {
        question: 'What is a Brazilian Butt Lift (BBL)?',
        answer: 'A Brazilian Butt Lift is a cosmetic procedure that uses fat transfer to enhance the size and shape of the buttocks naturally, without implants.',
        details:
            'The BBL procedure typically takes 3-5 hours under general anesthesia. Unlike butt implants, BBL uses your own tissue for natural-feeling results. Most patients see final results in 3-6 months. A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000. Every price is personalized, and financing is available.',
    },
    // The page's FAQ, its FAQPage node and the paid landing page all read
    // this list. Copy from #252; every figure is declared in `bbl.facts.ts`
    // and `check:bbl-copy` checks them in the built page. Only the last answer
    // uses pricing terms, so it is the only one the landing page drops.
    faqs: [
        {
            question: 'Who performs BBLs at Alluring?',
            answer: `Every BBL at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} Florida law requires the operating surgeon to examine you in person no later than the day before surgery and to remove and inject the fat personally.`,
        },
        {
            question: 'What does Florida law require for a BBL?',
            answer: 'Florida Statutes §458.328 requires the surgeon to inject fat only into the layer under the skin, never crossing the fascia over the gluteal muscle, and to use ultrasound guidance while moving the cannula. The surgeon must also stay with one patient for the whole procedure, examine you in person no later than the day before, and do the fat removal and injection personally.',
        },
        {
            question: 'What are the risks of a BBL?',
            answer: 'The most serious risk is a fat embolism, which is why Florida requires the fat to stay under the skin. Common complications are minor: a 2026 meta-analysis found minor complications in 3.58% of patients, most often a seroma, a pocket of fluid, in 2.03%. Other risks include infection, loss of grafted fat, unevenness and firm lumps of hardened fat.',
        },
        {
            question: 'How long does BBL surgery take?',
            answer: 'A BBL takes 3 to 5 hours under general anesthesia, depending on the volume of fat moved and the number of areas treated. It is outpatient surgery, so you go home the same day, with someone to drive you and stay with you for the first days.',
        },
        {
            question: 'Am I a good candidate for a BBL?',
            answer: 'You may be a good candidate if you are in good general health, at a weight you can keep stable, a non-smoker or willing to stop, and carry enough fat in areas such as the abdomen, flanks or back to move. Realistic expectations matter too: a BBL reshapes your figure, but it does not change your body type.',
        },
        {
            question: "Can I get a BBL if I'm thin?",
            answer: 'Often, yes. A skinny BBL moves a smaller volume of fat, usually gathered from several areas, for a subtle and proportionate change. Whether you have enough fat for the result you want is something only an exam can tell, so bring your goals, and photos of shapes you like, to your consultation.',
        },
        {
            question: 'Can I get a BBL after pregnancy?',
            answer: 'Yes, once you have finished breastfeeding and your weight has settled where you can keep it. At the exam your surgeon also looks at your abdomen: if pregnancy stretched the skin or separated the muscles, liposuction alone will not fix that, and a tummy tuck in the same surgery may be the better plan.',
        },
        {
            question: 'What share of the transferred fat survives?',
            answer: 'About 50% to 80% of grafted fat survives a BBL. Plastic surgeons interviewed by ASPS put the average "take" around 60%, and a 2020 review in Seminars in Plastic Surgery estimates that 20% to 50% is reabsorbed. Keeping pressure off your buttocks for the first 8 weeks protects the fat that is taking hold.',
        },
        {
            question: 'When will I see my final results, and do they last?',
            answer: 'Your final shape shows 3 to 6 months after surgery, once swelling settles. The fat that survives stays where it was placed and changes with your weight like the rest of your body fat, so the result lasts as long as your weight stays steady. Cleveland Clinic advises keeping your weight consistent to preserve it.',
        },
        {
            question:
                'How long should I stay in Miami after a BBL if I am flying in?',
            answer: "Plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. We confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay; you arrange your own travel. ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days.",
        },
        {
            question: 'Does insurance cover a BBL, and can I finance it?',
            answer: `No. Insurance does not cover a BBL, because it is a cosmetic procedure. Financing is available through ${getFinancingPartnersString()}, subject to credit approval, and we can go through the options with you at your consultation. A BBL at Alluring starts at ${bblFigure('price-starting-at')}.`,
        },
    ],
}
