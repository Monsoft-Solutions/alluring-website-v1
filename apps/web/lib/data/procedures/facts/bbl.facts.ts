/**
 * BBL facts: every figure the BBL page is allowed to publish, stated once.
 *
 * This file is the machine-readable source for BBL recovery, results, safety,
 * law and price figures (#252). The page module, `llms-full.txt` (#257) and the
 * paid landing stats read from here, and `scripts/check-procedure-copy.ts`
 * (`check:bbl-copy`) fails any BBL copy that states a %, cc, BMI, $, minute,
 * hour, day, week, month or year figure that is not declared below.
 *
 * The recovery figures are the sourced standard approved on 2026-09-14 and
 * re-verified against the live source pages on 2026-09-15 (plan behind #243)
 * and corrected on 2026-11-04 after a full source re-read.
 * The price is the 2026-09-15 decision. Each fact carries the attribution the
 * copy must use: several figures are one surgeon's advice quoted by ASPS, not
 * ASPS guidance, and the copy has to say so.
 *
 * The shape is shared by every procedure's facts file
 * (`procedure-facts.ts`); the copy sweep's BBL config reads this one.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    createFactLookups,
    formatProcedureFigure,
    type FactTopic,
    type FigureUnit,
    type ProcedureFact,
    type ProcedureFigure,
    type ProcedureSource,
} from './procedure-facts'

export type BblSourceId =
    | 'asps-bbl-cost'
    | 'asps-bbl-procedure'
    | 'asps-bbl-recovery-2022'
    | 'asps-blog-azad-2016'
    | 'asps-bbl-travel-2023'
    | 'aesthetic-society-bbl-aftercare'
    | 'aesthetic-society-bbl-results'
    | 'cleveland-clinic-bbl'
    | 'ormseth-garments-2023'
    | 'florida-statutes-458-328'
    | 'pazmino-garcia-2023'
    | 'elsaftawy-meta-analysis-2026'
    | 'alluring-practice'

export type BblSource = ProcedureSource<BblSourceId>

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
        id: 'asps-bbl-procedure',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Buttock enhancement procedure steps',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/buttock-enhancement/procedure',
        attribution:
            'Read on 2026-11-03. "on the average patients will retain 60-80% of the transferred fat, in some cases more in others less". The page gives no date.',
    },
    {
        id: 'asps-bbl-recovery-2022',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Six things you need to know about recovering from a Brazilian butt lift',
        date: '2022-08-11',
        url: 'https://www.plasticsurgery.org/news/articles/six-things-you-need-to-know-about-recovering-from-a-brazilian-butt-lift',
        attribution:
            'The garment schedule, the 10-minute sitting limit and the ~60% average take are quotes from one surgeon, Dr. Chris Funderburk; pain medication for 4–5 days is Dr. Steven Williams; the month-3 fat-loss plateau is reported from Dr. J. Peter Rubin. Attribute these as "a plastic surgeon interviewed by ASPS", never as ASPS guidance. The "days seven and 10" return-to-work line is the article\'s own voice: "an ASPS article", not a surgeon quote.',
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
            'Work and driving after 10–14 days on a pillow; walking after the second postoperative day; no direct pressure on the buttocks for at least 8 weeks; normal activities and exercise after 8 weeks; true results more evident as swelling subsides, sometimes 3–6 months. Its "eight to ten weeks" sentence is about butt implants, not BBL.',
    },
    {
        id: 'aesthetic-society-bbl-results',
        publisher: 'The Aesthetic Society',
        title: 'Butt Lift – Results',
        url: 'https://www.theaestheticsociety.org/procedures/body/butt-lift/results',
        attribution:
            'Read on 2026-11-03. "the remaining fat will stay there for the rest of your life. Like the rest of the tissue in your body, this fat will grow and age with you." The page gives no date.',
    },
    {
        id: 'cleveland-clinic-bbl',
        publisher: 'Cleveland Clinic',
        title: 'Brazilian Butt Lift',
        url: 'https://my.clevelandclinic.org/health/treatments/23308-brazilian-butt-lift',
        attribution:
            'Recovery "between two and three months" and, on the same page, "up to six months": say both. No sitting or lying on the buttocks for at least 2 weeks; pillow for about 8 weeks; stomach or side sleeping; pain decreases after 1–2 weeks; no heavy lifting in about the first month; back to work between 10 and 14 days. It gives no driving or pillow-at-work line and no 3–6 month final-shape line. Cleveland Clinic gives no fat-survival percentage — never credit it with one.',
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
        id: 'florida-statutes-458-328',
        publisher: 'Florida Statutes',
        title: 'Section 458.328',
        date: '2026',
        url: 'https://www.flsenate.gov/Laws/Statutes/2026/458.328',
        attribution:
            '2026 text, last amended by ch. 2024-181. Subsection (2)(c) applies to "a physician performing a gluteal fat grafting procedure in an office surgery setting": fat only in the subcutaneous space, never crossing the gluteal fascia; ultrasound guidance, or other technology authorized under board rule, while placing and moving the cannula; one physician to one patient from anesthesia to extubation; an in-person exam no later than the day before; fat extraction and injection not delegated. Say "Florida\'s rule for office surgery", never an unqualified "Florida law requires". There is no per-day case cap in force (the 2022 three-a-day rule was a 90-day emergency rule) — do not claim one.',
    },
    {
        id: 'pazmino-garcia-2023',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Brazilian Butt Lift–Associated Mortality: The South Florida Experience',
        authors: 'Pazmiño P, Garcia O',
        date: '2023-02',
        url: 'https://doi.org/10.1093/asj/sjac224',
        attribution:
            '25 South Florida fat-embolism deaths 2010–2022: 14 after the 2018 ASERF guidelines, 12 since the 2019 emergency rule. The authors describe 11 gluteal dissections with fat in the muscle and print no per-case tally: say "in the 11 cases they examined at autopsy, the authors describe fat in the muscle", never "all 25". Do not repeat the budget-clinic split in copy (no implied attacks on other clinics). Aesthet Surg J 2023;43(2):162–178, verified in PubMed (35959568) on 2026-09-18.',
    },
    {
        id: 'elsaftawy-meta-analysis-2026',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Gluteal Augmentation with Fat Grafting: A Systematic Review and Meta-Analysis of Complications and Procedural Factors',
        authors: 'Elsaftawy A, Bonczar M, Jagosz M, et al.',
        date: '2026-03',
        url: 'https://doi.org/10.1097/PRS.0000000000012437',
        attribution:
            'Meta-analysis of 38 studies and 22,151 patients: minor complications 3.58%, contour irregularities 2.29%, seroma 2.03%, pulmonary embolism 0.04%; major complications 0.02% with ultrasound guidance vs 0.08% without, an association, not proof of cause. Plast Reconstr Surg 2026;157(3):381e–393e (epub 2025-10-06), verified in PubMed (41051287) on 2026-09-18.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own published figures: price (decision of 2026-09-15), surgery length, anesthesia and setting (`quickStats`), and the 7–10 day stay for patients flying in, with dates given in writing. State them as Alluring's, not as a society's guidance.",
    },
]

export type BblFigureUnit = FigureUnit
export type BblFigure = ProcedureFigure
export type BblFactTopic = FactTopic
export type BblFact = ProcedureFact<BblSourceId>

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
            'A plastic surgeon interviewed by ASPS advises keeping any sitting to about 10 minutes at a time for the first 6 weeks. Cleveland Clinic says not to sit on your buttocks at all for at least 2 weeks, so your surgeon clears you first.',
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
            'Cleveland Clinic says you should be able to go back to work between 10 and 14 days, and The Aesthetic Society says you can work and drive after 10 to 14 days if you sit on a pillow.',
        sourceIds: ['cleveland-clinic-bbl', 'aesthetic-society-bbl-aftercare'],
    },
    {
        id: 'work-asps-7-10-days',
        topic: 'recovery',
        concepts: ['work', 'job'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'Some patients go back sooner: an ASPS article says patients return to work between days 7 and 10.',
        sourceIds: ['asps-bbl-recovery-2022'],
        caveat: "The article's own voice, and the less cautious figure. Always pair it with the 10–14 days above.",
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
        caveat: 'The 8–10 week sentence on the same page is about butt implants, not BBL. Do not publish 10.',
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
        ],
        caveat: "Not from Cleveland Clinic. ASPS's procedure page says final results take a year: don't call 3–6 months final without saying results keep settling.",
    },
    {
        id: 'fat-survival-60-80',
        topic: 'results',
        concepts: ['surviv', 'retain'],
        figures: [{ min: 60, max: 80, unit: 'percent' }],
        statement:
            'ASPS says patients retain 60% to 80% of the transferred fat on average, in some cases more and in others less.',
        sourceIds: ['asps-bbl-procedure'],
        caveat: 'Replaces the 50–80% figure, whose source (Semin Plast Surg 2020) could not be opened on 2026-11-03. Never credit Cleveland Clinic with it; never invert it.',
    },
    {
        id: 'fat-take-average-60',
        topic: 'results',
        concepts: ['take', 'average'],
        figures: [{ value: 60, unit: 'percent' }],
        statement:
            'A plastic surgeon interviewed by ASPS puts the average "take" at about 60%.',
        sourceIds: ['asps-bbl-recovery-2022'],
    },
    {
        id: 'fat-absorbed-20-40',
        topic: 'results',
        concepts: ['reabsorb', 'resorb', 'absorb'],
        figures: [{ min: 20, max: 40, unit: 'percent' }],
        statement:
            'A plastic surgeon interviewed by ASPS says 20% to 40% of the injected fat is absorbed by the body during healing.',
        sourceIds: ['asps-bbl-recovery-2022'],
        caveat: 'Dr. Rubin, in ASPS\'s "Seven things you need to know about a Brazilian butt lift" (2022).',
    },
    {
        id: 'results-how-long-they-last',
        topic: 'results',
        concepts: ['last', 'semi-permanent'],
        figures: [],
        statement:
            'Cleveland Clinic calls results semi-permanent, lasting several years and possibly over a decade. The Aesthetic Society says fat that survives stays for life and ages with you.',
        sourceIds: ['cleveland-clinic-bbl', 'aesthetic-society-bbl-results'],
        caveat: 'The two differ, so say both, with attribution. No long-term volume study of BBL was found (source bank C.3).',
    },
    {
        id: 'candidate-enough-fat',
        topic: 'procedure',
        concepts: ['fat', 'implant'],
        figures: [],
        statement:
            "Cleveland Clinic says you need enough excess fat elsewhere on your body, and that if you don't have enough, you may be a good candidate for butt implants.",
        sourceIds: ['cleveland-clinic-bbl'],
        caveat: 'No source read gives a minimum amount of fat, and no society publishes a BMI cutoff for a BBL (source bank C.1, C.2). State no number.',
    },

    // ── Safety evidence ──────────────────────────────────────────────────
    {
        id: 'south-florida-deaths-2010-2022',
        topic: 'safety',
        concepts: ['death', 'embolism', 'clinic', 'autopsy'],
        figures: [
            { value: 25, unit: 'death' },
            { value: 12, unit: 'death' },
            { value: 11, unit: 'death' },
        ],
        years: [2010, 2019, 2022],
        statement:
            "South Florida recorded 25 deaths from BBL fat embolism between 2010 and 2022, 12 of them after Florida's 2019 emergency rule (Pazmiño and Garcia, Aesthetic Surgery Journal, 2023). In the 11 cases they examined at autopsy, the authors describe fat in the muscle.",
        sourceIds: ['pazmino-garcia-2023'],
        caveat: "The autopsy finding covers the 11 dissections the authors describe, not all 25. Historical figures, not today's risk. No implied attacks on budget clinics.",
    },
    {
        id: 'complications-meta-analysis-2026',
        topic: 'safety',
        concepts: ['complication', 'seroma', 'meta-analysis', 'embolism'],
        figures: [
            { value: 38, unit: 'study' },
            { value: 22151, unit: 'patient' },
            { value: 3.58, unit: 'percent' },
            { value: 2.29, unit: 'percent' },
            { value: 2.03, unit: 'percent' },
            { value: 0.04, unit: 'percent' },
        ],
        statement:
            'A 2026 meta-analysis of 38 studies and 22,151 patients found minor complications in 3.58% of BBL patients, including uneven contours in 2.29% and seroma, a pocket of fluid, in 2.03%. Pulmonary embolism, a blood clot in the lungs, was reported separately, at 0.04%.',
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
            'Under Florida Statutes §458.328, in an office surgery setting, fat may only be injected into the layer under the skin and may not cross the fascia over the gluteal muscle.',
        sourceIds: ['florida-statutes-458-328'],
    },
    {
        id: 'florida-ultrasound-guidance',
        topic: 'law',
        concepts: ['ultrasound'],
        figures: [],
        statement:
            'In an office surgery setting, Florida law requires the physician to use ultrasound guidance, or other technology authorized under board rule, while placing and moving the cannula.',
        sourceIds: ['florida-statutes-458-328'],
        caveat: 'State the law with its setting. Where Alluring performs BBLs and whether it uses ultrasound "on every case" are practice claims awaiting the owner (#247) and counsel — do not state them.',
    },
    {
        id: 'florida-one-surgeon-one-patient',
        topic: 'law',
        concepts: ['one patient', 'one surgeon'],
        figures: [],
        statement:
            'In an office surgery setting, Florida law requires a ratio of one physician to one patient from the start of anesthesia until extubation.',
        sourceIds: ['florida-statutes-458-328'],
        caveat: 'No per-day cap is in force; never claim one.',
    },
    {
        id: 'florida-exam-day-before',
        topic: 'law',
        concepts: ['exam'],
        figures: [],
        statement:
            'In an office surgery setting, Florida law requires the physician to examine you in person no later than the day before surgery.',
        sourceIds: ['florida-statutes-458-328'],
    },
    {
        id: 'florida-surgeon-performs-transfer',
        topic: 'law',
        concepts: ['personally', 'inject'],
        figures: [],
        statement:
            'In an office surgery setting, Florida law says the physician must perform the fat extraction and injection personally. Other duties can be delegated with your written consent, under direct supervision.',
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

const bblLookups = createFactLookups(bblFacts, 'BBL')

export const getBblFact: (id: BblFactId) => BblFact = bblLookups.fact

/**
 * A figure as copy writes it: "$5,500", "$5,500–$10,000", "10–14 days",
 * "50–80%", "8 weeks".
 */
export const formatBblFigure = formatProcedureFigure

/** The first figure of a fact, formatted. */
export const bblFigure: (id: BblFactId, index?: number) => string =
    bblLookups.figure
