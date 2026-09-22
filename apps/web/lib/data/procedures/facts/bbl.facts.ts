/**
 * BBL facts: every figure the BBL page is allowed to publish, stated once.
 *
 * This file is the machine-readable source for BBL recovery, results, safety,
 * law and price figures (#252). The page module, `llms-full.txt` (#257) and the
 * paid landing stats read from here, and `scripts/check-bbl-copy.ts` fails any
 * BBL copy that states a %, cc, BMI, $, minute, hour, day, week, month or year
 * figure that is not declared below.
 *
 * The recovery figures are the sourced standard approved on 2026-09-14 and
 * re-verified against the live source pages on 2026-09-15 (plan behind #243).
 * The price is the 2026-09-15 decision. Each fact carries the attribution the
 * copy must use: several figures are one surgeon's advice quoted by ASPS, not
 * ASPS guidance, and the copy has to say so.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

export type BblSourceId =
    | 'asps-bbl-cost'
    | 'asps-bbl-recovery-2022'
    | 'asps-blog-azad-2016'
    | 'asps-bbl-travel-2023'
    | 'aesthetic-society-bbl-aftercare'
    | 'cleveland-clinic-bbl'
    | 'ormseth-garments-2023'
    | 'semin-plast-surg-fat-grafting-2020'
    | 'florida-statutes-458-328'
    | 'pazmino-garcia-2023'
    | 'elsaftawy-meta-analysis-2026'
    | 'alluring-practice'

export interface BblSource {
    id: BblSourceId
    /** Who published it, as the page names it inline. */
    publisher: string
    /** Title of the page or article, when verified. */
    title?: string
    /** Authors, for journal articles. */
    authors?: string
    /** Publication or review date (ISO, or a year when that is all we have). */
    date?: string
    url?: string
    /** How the copy must attribute figures from this source. */
    attribution: string
}

export const bblSources: readonly BblSource[] = [
    {
        id: 'asps-bbl-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does buttock enhancement cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/buttock-enhancement/cost',
        attribution:
            'Read on 2026-09-22. "The average cost of buttock augmentation with fat grafting (Brazilian butt lift) is $7,264" and "it does not include anesthesia, operating room facilities or other related expenses." The page gives no year, so neither does the copy: never "in 2024" or "2025".',
    },
    {
        id: 'asps-bbl-recovery-2022',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Six things you need to know about recovering from a Brazilian butt lift',
        date: '2022-08-11',
        url: 'https://www.plasticsurgery.org/news/articles/six-things-you-need-to-know-about-recovering-from-a-brazilian-butt-lift',
        attribution:
            'The garment schedule and the ~60% average take are quotes from Dr. Chris Funderburk; pain medication for 4–5 days is Dr. Steven Williams; the month-3 fat-loss plateau is Dr. J. Peter Rubin. Attribute these as "a plastic surgeon interviewed by ASPS", never as ASPS guidance. Only the "days seven and 10" return-to-work line is ASPS\'s own guidance.',
    },
    {
        id: 'asps-blog-azad-2016',
        publisher: 'ASPS blog',
        title: 'Recovering from a Brazilian butt lift',
        authors: 'Kamran Azad, MD',
        date: '2016-05-12',
        url: 'https://www.plasticsurgery.org/news/blog/recovering-from-a-brazilian-butt-lift',
        attribution:
            'Attribute to "an ASPS article by plastic surgeon Kamran Azad, MD".',
    },
    {
        id: 'asps-bbl-travel-2023',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Boarding groups: Added complications from traveling after a Brazilian butt lift',
        date: '2023-06-09',
        url: 'https://www.plasticsurgery.org/news/articles/boarding-groups-added-complications-from-traveling-after-a-brazilian-butt-lift',
        attribution:
            'Infection "typically can occur in three to five days" is Dr. Darrick Antell, hence "at least four to five days, or as long as possible" near the surgeon — not "at least 5". Walking 5–10 minutes per hour of sitting is Dr. Darren Smith. Attribute to "ASPS\'s article on traveling after a BBL".',
    },
    {
        id: 'aesthetic-society-bbl-aftercare',
        publisher: 'The Aesthetic Society',
        title: 'Butt Lift – Aftercare & Recovery',
        url: 'https://www.theaestheticsociety.org/procedures/body/butt-lift/aftercare-recovery',
        attribution:
            'Work and driving after 10–14 days on a pillow; walking after the second postoperative day; no direct pressure on the buttocks for at least 8 weeks; normal activities and exercise after 8 weeks; final results at 3–6 months.',
    },
    {
        id: 'cleveland-clinic-bbl',
        publisher: 'Cleveland Clinic',
        title: 'Brazilian Butt Lift',
        url: 'https://my.clevelandclinic.org/health/treatments/23308-brazilian-butt-lift',
        attribution:
            'Recovery "between two and three months" and, on the same page, "up to six months": say both. No sitting or lying on the buttocks for at least 2 weeks; pillow for about 8 weeks; stomach or side sleeping; pain decreases after 1–2 weeks; no heavy lifting in about the first month. Cleveland Clinic gives no fat-survival percentage — never credit it with one.',
    },
    {
        id: 'ormseth-garments-2023',
        publisher: 'Plastic and Reconstructive Surgery Global Open',
        title: 'Postoperative Compression Garments in Plastic Surgery',
        authors: 'Ormseth BH et al.',
        date: '2023',
        url: 'https://doi.org/10.1097/GOX.0000000000005293',
        attribution:
            'Evidence for any exact garment duration is limited, which is why every garment figure ends with "or as your surgeon directs".',
    },
    {
        id: 'semin-plast-surg-fat-grafting-2020',
        publisher: 'Seminars in Plastic Surgery',
        title: 'The Role of Fat Grafting in Buttock Augmentation',
        date: '2020',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7023974/',
        attribution:
            'Estimates that 20–50% of grafted fat is reabsorbed; "about 50–80% survives" is the complement of that estimate. Attribute to "a 2020 review in Seminars in Plastic Surgery".',
    },
    {
        id: 'florida-statutes-458-328',
        publisher: 'Florida Statutes',
        title: 'Section 458.328',
        date: '2026',
        url: 'https://www.flsenate.gov/Laws/Statutes/2026/458.328',
        attribution:
            '2026 text, last amended by ch. 2024-181. Fat only in the subcutaneous space, never crossing the gluteal fascia; ultrasound guidance while moving the cannula; one physician to one patient from anesthesia to extubation; an in-person exam no later than the day before; harvest and injection not delegated. There is no per-day case cap in force (the 2022 three-a-day rule was a 90-day emergency rule) — do not claim one.',
    },
    {
        id: 'pazmino-garcia-2023',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Brazilian Butt Lift–Associated Mortality: The South Florida Experience',
        authors: 'Pazmiño P, Garcia O',
        date: '2023-02',
        url: 'https://doi.org/10.1093/asj/sjac224',
        attribution:
            '25 South Florida fat-embolism deaths 2010–2022, 14 after the 2019 rule, 92% at high-volume budget clinics. Intramuscular fat was found in every autopsied case — 11 of them — so say "in every case examined at autopsy", never "all 25". Aesthet Surg J 2023;43(2):162–178, verified in PubMed (35959568) on 2026-09-18.',
    },
    {
        id: 'elsaftawy-meta-analysis-2026',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Gluteal Augmentation with Fat Grafting: A Systematic Review and Meta-Analysis of Complications and Procedural Factors',
        authors: 'Elsaftawy A, Bonczar M, Jagosz M, et al.',
        date: '2026-03',
        url: 'https://doi.org/10.1097/PRS.0000000000012437',
        attribution:
            'Meta-analysis of 38 studies and 22,151 patients: minor complications 3.58%, seroma 2.03%, pulmonary embolism 0.04%; major complications 0.02% with ultrasound guidance vs 0.08% without. Plast Reconstr Surg 2026;157(3):381e–393e (epub 2025-10-06), verified in PubMed (41051287) on 2026-09-18.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own published figures: price (decision of 2026-09-15), surgery length, anesthesia and setting (`quickStats`), and the 7–10 day stay for patients flying in, with dates given in writing. State them as Alluring's, not as a society's guidance.",
    },
]

export type BblFigureUnit =
    | 'percent'
    | 'usd'
    | 'minute'
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'year'
    | 'death'
    | 'study'
    | 'patient'

/** One figure: a single value or an inclusive range, in one unit. */
export type BblFigure =
    | { value: number; unit: BblFigureUnit }
    | { min: number; max: number; unit: BblFigureUnit }

export type BblFactTopic =
    | 'recovery'
    | 'results'
    | 'safety'
    | 'law'
    | 'procedure'
    | 'price'

export interface BblFact {
    id: string
    topic: BblFactTopic
    /**
     * Every figure the fact licenses the copy to state, in every form the copy
     * uses. "Day 2" and "days 1–2" are different figures, so both are listed.
     */
    figures: readonly BblFigure[]
    /**
     * Words a sentence must contain for one of these figures to be read as
     * this fact. "3–5 days" is licensed next to "infection", not next to
     * "swelling". Lowercase stems, matched as substrings.
     */
    concepts: readonly string[]
    /** Calendar years the statement names (study windows, report years). */
    years?: readonly number[]
    /** The sentence as it may be published, with its attribution. */
    statement: string
    sourceIds: readonly BblSourceId[]
    /** What the copy must not say, or the caveat it must carry. */
    caveat?: string
}

export const bblFacts = [
    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'walking-from-day-2',
        topic: 'recovery',
        concepts: ['walk'],
        figures: [
            { min: 1, max: 2, unit: 'day' },
            { value: 2, unit: 'day' },
        ],
        statement:
            'Short walks start on day 1 or 2; The Aesthetic Society says you should be able to get up and walk after the second day, which helps prevent blood clots.',
        sourceIds: ['aesthetic-society-bbl-aftercare'],
    },
    {
        id: 'pain-medication-4-5-days',
        topic: 'recovery',
        concepts: ['pain'],
        figures: [{ min: 4, max: 5, unit: 'day' }],
        statement:
            'Most people need some pain medication for the first 4 to 5 days, according to a plastic surgeon interviewed by ASPS.',
        sourceIds: ['asps-bbl-recovery-2022'],
        caveat: 'A surgeon quote, not ASPS guidance. Never "pain peaks on days 4–5".',
    },
    {
        id: 'pain-eases-1-2-weeks',
        topic: 'recovery',
        concepts: ['pain'],
        figures: [{ min: 1, max: 2, unit: 'week' }],
        statement: 'Cleveland Clinic says pain eases after 1 to 2 weeks.',
        sourceIds: ['cleveland-clinic-bbl'],
    },
    {
        id: 'no-sitting-2-weeks',
        topic: 'recovery',
        concepts: ['sit', 'lying', 'buttocks'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'No sitting or lying on your buttocks for at least 2 weeks, according to Cleveland Clinic.',
        sourceIds: ['cleveland-clinic-bbl'],
    },
    {
        id: 'sleep-stomach-or-side',
        topic: 'recovery',
        concepts: ['sleep'],
        figures: [],
        statement:
            'Sleep on your stomach or side, as Cleveland Clinic advises, and stay off your back until your surgeon clears it.',
        sourceIds: ['cleveland-clinic-bbl'],
    },
    {
        id: 'brief-sitting-through-week-6',
        topic: 'recovery',
        concepts: ['sit', 'pillow'],
        figures: [
            { value: 2, unit: 'week' },
            { value: 10, unit: 'minute' },
            { value: 6, unit: 'week' },
        ],
        statement:
            'After 2 weeks, sit only on a BBL pillow and only briefly: about 10 minutes at a time through week 6, as a plastic surgeon interviewed by ASPS advises.',
        sourceIds: ['asps-bbl-recovery-2022'],
        caveat: "One surgeon's rule, quoted by ASPS.",
    },
    {
        id: 'pillow-until-week-8',
        topic: 'recovery',
        concepts: ['pillow', 'sit', 'pressure'],
        figures: [{ value: 8, unit: 'week' }],
        statement:
            'Cleveland Clinic says most people cannot sit without a BBL pillow for about 8 weeks, and The Aesthetic Society says to avoid direct pressure on the buttocks for at least 8 weeks.',
        sourceIds: ['cleveland-clinic-bbl', 'aesthetic-society-bbl-aftercare'],
    },
    {
        id: 'garment-month-1',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [{ value: 1, unit: 'month' }],
        statement:
            'Wear the compression garment 24/7, except in the shower, for the first month, or as your surgeon directs.',
        sourceIds: ['asps-bbl-recovery-2022', 'ormseth-garments-2023'],
        caveat: 'Dr. Funderburk\'s schedule, quoted by ASPS. Evidence for exact durations is thin, so always add "or as your surgeon directs".',
    },
    {
        id: 'garment-month-2',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [
            { value: 2, unit: 'month' },
            { value: 12, unit: 'hour' },
        ],
        statement:
            'Wear the garment at least 12 hours a day in the second month, or as your surgeon directs.',
        sourceIds: ['asps-bbl-recovery-2022', 'ormseth-garments-2023'],
        caveat: 'Same attribution and hedge as month 1.',
    },
    {
        id: 'work-10-14-days',
        topic: 'recovery',
        concepts: ['work', 'desk', 'job', 'driv'],
        figures: [{ min: 10, max: 14, unit: 'day' }],
        statement:
            'Most people return to desk work and driving 10 to 14 days after a BBL, sitting on a pillow, according to Cleveland Clinic and The Aesthetic Society.',
        sourceIds: ['cleveland-clinic-bbl', 'aesthetic-society-bbl-aftercare'],
    },
    {
        id: 'work-asps-7-10-days',
        topic: 'recovery',
        concepts: ['work', 'job'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'Some surgeons allow work sooner: ASPS says patients go back between days 7 and 10.',
        sourceIds: ['asps-bbl-recovery-2022'],
        caveat: "ASPS's own guidance, and the less cautious figure. Always pair it with the 10–14 days above.",
    },
    {
        id: 'no-heavy-lifting-month-1',
        topic: 'recovery',
        concepts: ['lifting', 'strenuous'],
        figures: [{ value: 1, unit: 'month' }],
        statement:
            'No heavy lifting or strenuous activity for about the first month, per Cleveland Clinic.',
        sourceIds: ['cleveland-clinic-bbl'],
    },
    {
        id: 'light-activity-after-month-1',
        topic: 'recovery',
        concepts: ['light activity', 'fast walking', 'fast-paced'],
        figures: [{ value: 1, unit: 'month' }],
        statement:
            'Light activity such as fast-paced walking is fine after the first month, according to an ASPS article by plastic surgeon Kamran Azad, MD.',
        sourceIds: ['asps-blog-azad-2016'],
    },
    {
        id: 'exercise-at-8-weeks',
        topic: 'recovery',
        concepts: ['exercise', 'workout'],
        figures: [{ value: 8, unit: 'week' }],
        statement:
            'The Aesthetic Society says normal activities and exercise can resume after 8 weeks, once your surgeon clears you.',
        sourceIds: ['aesthetic-society-bbl-aftercare'],
        caveat: 'Another paragraph on the same page says 8–10 weeks; do not publish 10.',
    },
    {
        id: 'recovered-2-3-months',
        topic: 'recovery',
        concepts: ['recover'],
        figures: [
            { min: 2, max: 3, unit: 'month' },
            { value: 6, unit: 'month' },
        ],
        statement:
            'Cleveland Clinic puts full recovery at 2 to 3 months and notes that it can take up to 6 months.',
        sourceIds: ['cleveland-clinic-bbl'],
        caveat: 'Say both figures; the same page gives both.',
    },
    {
        id: 'stay-near-surgeon-4-5-days',
        topic: 'recovery',
        concepts: ['near your surgeon', 'infection'],
        figures: [
            { min: 4, max: 5, unit: 'day' },
            { min: 3, max: 5, unit: 'day' },
        ],
        statement:
            "ASPS's article on traveling after a BBL advises staying near your surgeon for at least 4 to 5 days, and longer if you can, because an infection typically shows up 3 to 5 days after surgery.",
        sourceIds: ['asps-bbl-travel-2023'],
        caveat: 'Never "at least 5 days".',
    },
    {
        id: 'stay-in-miami-7-10-days',
        topic: 'recovery',
        concepts: ['miami', 'flying', 'fly'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'If you are flying in from another state, plan on 7 to 10 days in Miami, so you can be seen at follow-up and cleared before you fly. Alluring confirms your surgery, pre-op and follow-up dates in writing and tells you how many nights to stay; you arrange the travel itself.',
        sourceIds: ['alluring-practice'],
        caveat: 'The practice does not coordinate travel (CLAUDE.md): no flights, lodging, transport or recovery houses.',
    },
    {
        id: 'walk-during-flights',
        topic: 'recovery',
        concepts: ['flight', 'fly', 'walk'],
        figures: [
            { min: 5, max: 10, unit: 'minute' },
            { value: 1, unit: 'hour' },
        ],
        statement:
            "On the flight home, get up and walk for 5 to 10 minutes for every hour you sit, the advice a plastic surgeon gives in ASPS's article on traveling after a BBL.",
        sourceIds: ['asps-bbl-travel-2023'],
    },

    // ── Results ──────────────────────────────────────────────────────────
    {
        id: 'fat-loss-risk-month-3',
        topic: 'results',
        concepts: ['losing', 'fat loss', 'grafted fat'],
        figures: [{ value: 3, unit: 'month' }],
        statement:
            'The acute risk of losing grafted fat subsides around month 3, according to a plastic surgeon interviewed by ASPS.',
        sourceIds: ['asps-bbl-recovery-2022'],
    },
    {
        id: 'final-shape-3-6-months',
        topic: 'results',
        concepts: ['final', 'shape'],
        figures: [{ min: 3, max: 6, unit: 'month' }],
        statement:
            'Your final shape shows 3 to 6 months after surgery, once swelling has settled.',
        sourceIds: [
            'asps-bbl-recovery-2022',
            'aesthetic-society-bbl-aftercare',
            'cleveland-clinic-bbl',
        ],
    },
    {
        id: 'fat-survival-50-80',
        topic: 'results',
        concepts: ['surviv'],
        figures: [{ min: 50, max: 80, unit: 'percent' }],
        statement: 'About 50% to 80% of grafted fat survives a BBL.',
        sourceIds: ['semin-plast-surg-fat-grafting-2020'],
        caveat: "The complement of the review's 20–50% resorption estimate. Never credit Cleveland Clinic with it; never invert it.",
    },
    {
        id: 'fat-take-average-60',
        topic: 'results',
        concepts: ['take', 'average'],
        figures: [{ value: 60, unit: 'percent' }],
        statement:
            'Plastic surgeons interviewed by ASPS put the average "take" around 60%.',
        sourceIds: ['asps-bbl-recovery-2022'],
    },
    {
        id: 'fat-resorbed-20-50',
        topic: 'results',
        concepts: ['reabsorb', 'resorb'],
        figures: [{ min: 20, max: 50, unit: 'percent' }],
        statement:
            'A 2020 review in Seminars in Plastic Surgery estimates that 20% to 50% of grafted fat is reabsorbed.',
        sourceIds: ['semin-plast-surg-fat-grafting-2020'],
    },

    // ── Safety evidence ──────────────────────────────────────────────────
    {
        id: 'south-florida-deaths-2010-2022',
        topic: 'safety',
        concepts: ['death', 'embolism', 'clinic'],
        figures: [
            { value: 25, unit: 'death' },
            { value: 92, unit: 'percent' },
        ],
        years: [2010, 2022],
        statement:
            'South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022. 92% of those patients had surgery at high-volume, budget clinics, and in every case examined at autopsy, fat had been injected into the muscle (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023).',
        sourceIds: ['pazmino-garcia-2023'],
        caveat: 'Autopsy finding covers the 11 autopsied cases, not all 25.',
    },
    {
        id: 'complications-meta-analysis-2026',
        topic: 'safety',
        concepts: ['complication', 'seroma', 'meta-analysis', 'embolism'],
        figures: [
            { value: 38, unit: 'study' },
            { value: 22151, unit: 'patient' },
            { value: 3.58, unit: 'percent' },
            { value: 2.03, unit: 'percent' },
            { value: 0.04, unit: 'percent' },
        ],
        statement:
            'A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, most often a seroma (a pocket of fluid) in 2.03%, and pulmonary embolism in 0.04%.',
        sourceIds: ['elsaftawy-meta-analysis-2026'],
    },
    {
        id: 'major-complications-ultrasound',
        topic: 'safety',
        concepts: ['complication'],
        figures: [
            { value: 0.02, unit: 'percent' },
            { value: 0.08, unit: 'percent' },
        ],
        statement:
            'Major complications were less common with ultrasound guidance: 0.02% versus 0.08% (Elsaftawy and colleagues, Plastic and Reconstructive Surgery, 2026).',
        sourceIds: ['elsaftawy-meta-analysis-2026'],
    },

    // ── Florida law ──────────────────────────────────────────────────────
    {
        id: 'florida-fat-above-fascia',
        topic: 'law',
        concepts: ['fascia', 'under the skin'],
        figures: [],
        statement:
            'Under Florida Statutes §458.328, fat may only be injected into the layer under the skin and may not cross the fascia over the gluteal muscle.',
        sourceIds: ['florida-statutes-458-328'],
    },
    {
        id: 'florida-ultrasound-guidance',
        topic: 'law',
        concepts: ['ultrasound'],
        figures: [],
        statement:
            'Florida law requires the surgeon to use ultrasound guidance while moving the cannula.',
        sourceIds: ['florida-statutes-458-328'],
        caveat: 'State the law. That Alluring uses ultrasound "on every case" is a practice claim awaiting the owner (#247) — do not state it separately.',
    },
    {
        id: 'florida-one-surgeon-one-patient',
        topic: 'law',
        concepts: ['one patient', 'one surgeon'],
        figures: [],
        statement:
            'Florida law requires one surgeon to stay with one patient for the whole procedure.',
        sourceIds: ['florida-statutes-458-328'],
        caveat: 'No per-day cap is in force; never claim one.',
    },
    {
        id: 'florida-exam-day-before',
        topic: 'law',
        concepts: ['exam'],
        figures: [],
        statement:
            'Florida law requires the surgeon to examine you in person no later than the day before surgery.',
        sourceIds: ['florida-statutes-458-328'],
    },
    {
        id: 'florida-surgeon-performs-transfer',
        topic: 'law',
        concepts: ['personally', 'inject'],
        figures: [],
        statement:
            'Florida law requires the surgeon to remove and inject the fat personally; it cannot be delegated.',
        sourceIds: ['florida-statutes-458-328'],
    },

    // ── Procedure (the practice's own figures) ───────────────────────────
    {
        id: 'surgery-3-5-hours',
        topic: 'procedure',
        concepts: ['surgery', 'anesthesia', 'outpatient'],
        figures: [{ min: 3, max: 5, unit: 'hour' }],
        statement:
            'A BBL at Alluring takes 3 to 5 hours under general anesthesia, and you go home the same day.',
        sourceIds: ['alluring-practice'],
        caveat: 'Mirrors `quickStats` in brazilian-butt-lift-bbl-miami.data.ts.',
    },

    // ── Price (decision of 2026-09-15) ───────────────────────────────────
    {
        id: 'asps-average-cost',
        topic: 'price',
        concepts: ['average'],
        figures: [{ value: 7264, unit: 'usd' }],
        statement:
            'The American Society of Plastic Surgeons puts the average cost of a BBL at $7,264, a figure that does not include anesthesia, operating room facilities or other related expenses.',
        sourceIds: ['asps-bbl-cost'],
        caveat: 'A national surgeon-fee average, not a Miami price and not an all-in price: always say what it leaves out. No year.',
    },
    {
        id: 'price-starting-at',
        topic: 'price',
        concepts: ['start', 'price', 'pay'],
        figures: [{ value: 5500, unit: 'usd' }],
        statement: 'A BBL at Alluring starts at $5,500.',
        sourceIds: ['alluring-practice'],
        caveat: 'Never $3,500, $15,000 or a weekly figure. Mirrors `pricing.startingAt`.',
    },
    {
        id: 'price-most-patients',
        topic: 'price',
        concepts: ['patient', 'pay', 'price'],
        figures: [{ min: 5500, max: 10000, unit: 'usd' }],
        statement:
            'Most patients pay between $5,500 and $10,000. Every price is set for the patient, price ranges are estimates and may change, and your surgeon confirms your price at consultation. Financing is available; we quote no financing figure.',
        sourceIds: ['alluring-practice'],
        caveat: '"Most patients", not a hard maximum. Mirrors `pricing.upTo`. No financing number.',
    },
] as const satisfies readonly BblFact[]

export type BblFactId = (typeof bblFacts)[number]['id']

export function getBblFact(id: BblFactId): BblFact {
    const fact = bblFacts.find((candidate) => candidate.id === id)
    if (!fact) throw new Error(`Unknown BBL fact: ${id}`)
    return fact
}

const UNIT_LABELS: Record<BblFigureUnit, [singular: string, plural: string]> = {
    percent: ['%', '%'],
    usd: ['', ''],
    minute: ['minute', 'minutes'],
    hour: ['hour', 'hours'],
    day: ['day', 'days'],
    week: ['week', 'weeks'],
    month: ['month', 'months'],
    year: ['year', 'years'],
    death: ['death', 'deaths'],
    study: ['study', 'studies'],
    patient: ['patient', 'patients'],
}

function formatNumber(value: number, unit: BblFigureUnit): string {
    const text = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    return unit === 'usd' ? `$${text}` : text
}

/**
 * A figure as copy writes it: "$5,500", "$5,500–$10,000", "10–14 days",
 * "50–80%", "8 weeks".
 */
export function formatBblFigure(figure: BblFigure): string {
    const [singular, plural] = UNIT_LABELS[figure.unit]
    if (figure.unit === 'percent') {
        return 'value' in figure
            ? `${formatNumber(figure.value, 'percent')}%`
            : `${formatNumber(figure.min, 'percent')}–${formatNumber(figure.max, 'percent')}%`
    }
    if (figure.unit === 'usd') {
        return 'value' in figure
            ? formatNumber(figure.value, 'usd')
            : `${formatNumber(figure.min, 'usd')}–${formatNumber(figure.max, 'usd')}`
    }
    if ('value' in figure) {
        return `${formatNumber(figure.value, figure.unit)} ${figure.value === 1 ? singular : plural}`
    }
    return `${formatNumber(figure.min, figure.unit)}–${formatNumber(figure.max, figure.unit)} ${plural}`
}

/** The first figure of a fact, formatted. */
export function bblFigure(id: BblFactId, index = 0): string {
    const figure = getBblFact(id).figures[index]
    if (!figure) throw new Error(`BBL fact ${id} has no figure ${index}`)
    return formatBblFigure(figure)
}
