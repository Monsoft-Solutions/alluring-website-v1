/**
 * Liposuction facts: every figure the liposuction page is allowed to publish,
 * stated once.
 *
 * The page module reads its figures from here, and
 * `scripts/check-procedure-copy.ts --slug liposuction-miami` fails any copy on
 * the built page that states a %, cc, BMI, $, minute, hour, day, week, month
 * or year figure that is not declared below, or states a declared figure in a
 * sentence about something else.
 *
 * Every source was read on 2026-09-22 (the Florida rule from its official
 * .doc on flrules.org, the two studies from their PubMed abstracts). Each fact
 * carries the attribution the copy must use and, in `caveat`, what the source
 * does not say. The practice's own figures come from its printed price sheet
 * of 2026-09-15 (`docs/pricing/practice-price-list.md`) and its existing
 * published surgery details, and are stated as Alluring's, never as a
 * society's guidance.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    createFactLookups,
    formatProcedureFigure,
    type ProcedureFact,
    type ProcedureSource,
} from './procedure-facts'

export type LipoSourceId =
    | 'florida-rule-64b8-9-009'
    | 'florida-statutes-458-328'
    | 'asps-liposuction'
    | 'asps-liposuction-candidates'
    | 'asps-liposuction-recovery'
    | 'asps-liposuction-cost'
    | 'aesthetic-society-liposuction'
    | 'aesthetic-society-liposuction-recovery'
    | 'cleveland-clinic-liposuction'
    | 'medlineplus-liposuction'
    | 'kaoutzanis-2017'
    | 'comerci-2024'
    | 'alluring-practice'

export type LipoSource = ProcedureSource<LipoSourceId>

export const lipoSources: readonly LipoSource[] = [
    {
        id: 'florida-rule-64b8-9-009',
        publisher: 'Florida Board of Medicine',
        title: 'Rule 64B8-9.009, Standard of Care for Office Surgery',
        date: '2024-09-16',
        url: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B8-9.009',
        attribution:
            'Read on 2026-09-22 from the rule\'s official text (effective 9/16/2024). (2)(d): "A maximum of 4000cc supernatant fat may be removed by liposuction in the office setting." (2)(e)1: "When combined with abdominoplasty, liposuction may not exceed 1000cc of supernatant fat." (2)(c): a log of every liposuction removing more than 1,000 cc. The limits apply to a physician\'s office, not to hospitals or licensed surgery centers, and count supernatant fat, not total aspirate. Say "Florida allows at most…in a doctor\'s office"; never claim where Alluring operates until the owner confirms it.',
    },
    {
        id: 'florida-statutes-458-328',
        publisher: 'Florida Statutes',
        title: 'Section 458.328',
        date: '2026',
        url: 'https://www.flsenate.gov/Laws/Statutes/2026/458.328',
        attribution:
            '(1)(a)1., read on 2026-09-22: "An office in which a physician performs a liposuction procedure in which more than 1,000 cubic centimeters of supernatant fat is temporarily or permanently removed … must register with the department."',
    },
    {
        id: 'asps-liposuction',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Liposuction',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/liposuction',
        attribution:
            '"Liposuction is not a treatment for obesity or a substitute for proper diet and exercise. It is also not an effective treatment for cellulite." Results page: long lasting "provided that you maintain a stable weight and general fitness".',
    },
    {
        id: 'asps-liposuction-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Are you a good candidate for liposuction?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/liposuction/candidates',
        attribution:
            'Read on 2026-09-22: "Adults within 30% of their ideal weight who have firm, elastic skin and good muscle tone"; "Nonsmokers/non-vapers". No BMI figure.',
    },
    {
        id: 'asps-liposuction-recovery',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What should I expect during my liposuction recovery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/liposuction/recovery',
        attribution:
            'Timeline: "Weeks 2-3: Return to work (depending on your job)". Other sources say a few days; state both, never one as the rule.',
    },
    {
        id: 'asps-liposuction-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does liposuction cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/liposuction/cost',
        attribution:
            'Read on 2026-09-22: "The average cost of liposuction is $4,711" and "This average surgeon\'s fee is only part of the total price – it does not include anesthesia, operating room facilities or other related expenses." The page gives no year, so neither does the copy.',
    },
    {
        id: 'aesthetic-society-liposuction',
        publisher: 'The Aesthetic Society',
        title: 'Liposuction',
        url: 'https://www.theaestheticsociety.org/procedures/body/liposuction',
        attribution:
            'Read on 2026-09-22: weight "should be stable"; "If you are planning to lose a significant amount of weight, you should wait"; "Liposuction removes fat but does not tighten skin, and it does not improve the look of cellulite"; "You can\'t smoke". Its "no more than 20 pounds overweight" is not used: the copy sweep has no unit for pounds.',
    },
    {
        id: 'aesthetic-society-liposuction-recovery',
        publisher: 'The Aesthetic Society',
        title: 'Liposuction aftercare and recovery',
        url: 'https://www.theaestheticsociety.org/procedures/body/liposuction/aftercare-recovery',
        attribution:
            'Read on 2026-09-22: work "within a few days … depending on the nature of your job"; "most of your normal activities within ten days or less"; compression garment "for four to six weeks"; "avoid strenuous exercise for four to six weeks"; swelling "will peak around 48 hours" and "will mostly disappear within two to three weeks, but there may be slight residual swelling for up to four months"; bruising "typically disappears within seven to ten days".',
    },
    {
        id: 'cleveland-clinic-liposuction',
        publisher: 'Cleveland Clinic',
        title: 'Liposuction',
        date: '2022-10-01',
        url: 'https://my.clevelandclinic.org/health/treatments/11009-liposuction',
        attribution:
            'Last reviewed 10/01/2022, read on 2026-09-22: "It may take between three to six months for the swelling to go away completely before you see results." "Liposuction permanently removes fat cells." Its "BMI over 25" candidacy line is an outlier against ASPS and is not used.',
    },
    {
        id: 'medlineplus-liposuction',
        publisher: 'MedlinePlus (US National Library of Medicine)',
        title: 'Liposuction',
        date: '2025-05-06',
        url: 'https://medlineplus.gov/ency/article/002985.htm',
        attribution:
            'Reviewed 5/6/2025, read on 2026-09-22: "Walk as soon as possible after surgery to help prevent blood clots from forming in your legs."',
    },
    {
        id: 'kaoutzanis-2017',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Cosmetic Liposuction: Preoperative Risk Factors, Major Complication Rates, and Safety of Combined Procedures',
        authors: 'Kaoutzanis C and colleagues',
        date: '2017',
        url: 'https://doi.org/10.1093/asj/sjw243',
        attribution:
            'Aesthet Surg J 2017;37(6):680–694, abstract read in PubMed (28430878) on 2026-09-22. CosmetAssure database, 2008–2013: "Liposuction alone had a major complication rate of 0.7%"; major = an emergency room visit, hospital admission or reoperation within 30 days. Conclusion: "Combined procedures, especially on obese or older individuals, can significantly increase complication rates." Minor complications were not captured.',
    },
    {
        id: 'comerci-2024',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Risks and Complications Rate in Liposuction: A Systematic Review and Meta-Analysis',
        authors: 'Comerci AJ and colleagues',
        date: '2024',
        url: 'https://doi.org/10.1093/asj/sjae074',
        attribution:
            'Aesthet Surg J 2024;44(7):NP454–NP463, abstract read in PubMed (38563572) on 2026-09-22. 39 studies, 29,368 patients: "The most common complication was contour deformity, with a prevalence of 2.35%." The overall rate is printed without a unit in the abstract and is not used.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own figures: the Lipo 360 price and the add-on area prices from its printed price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`), and the surgery length, anesthesia and setting it already publishes (`quickStats`). State them as Alluring's, not as a society's guidance.",
    },
]

export type LipoFact = ProcedureFact<LipoSourceId>

export const lipoFacts = [
    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'walk-right-away',
        topic: 'recovery',
        concepts: ['walk'],
        figures: [],
        statement:
            'Walk as soon as possible after surgery to help prevent blood clots, as MedlinePlus advises.',
        sourceIds: ['medlineplus-liposuction'],
    },
    {
        id: 'swelling-peaks-48-hours',
        topic: 'recovery',
        concepts: ['swelling', 'swollen'],
        figures: [{ value: 48, unit: 'hour' }],
        statement:
            'Swelling peaks around 48 hours after surgery, according to The Aesthetic Society.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'work-few-days',
        topic: 'recovery',
        concepts: ['work', 'job'],
        figures: [],
        statement:
            'The Aesthetic Society says most people return to work within a few days, depending on their job.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'work-weeks-2-3-asps',
        topic: 'recovery',
        concepts: ['work', 'job'],
        figures: [{ min: 2, max: 3, unit: 'week' }],
        statement:
            "ASPS's recovery timeline puts a return to work, depending on your job, in weeks 2 to 3.",
        sourceIds: ['asps-liposuction-recovery'],
        caveat: 'Sources disagree on when people go back to work. Give both, never one as the rule.',
    },
    {
        id: 'normal-activities-10-days',
        topic: 'recovery',
        concepts: ['activities'],
        figures: [{ value: 10, unit: 'day' }],
        statement:
            'Most people resume most of their normal activities within 10 days or less, according to The Aesthetic Society.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'bruising-7-10-days',
        topic: 'recovery',
        concepts: ['bruis'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'Bruising typically fades within 7 to 10 days, according to The Aesthetic Society.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'swelling-2-3-weeks-4-months',
        topic: 'recovery',
        concepts: ['swelling'],
        figures: [
            { min: 2, max: 3, unit: 'week' },
            { value: 4, unit: 'month' },
        ],
        statement:
            'Swelling mostly goes down within 2 to 3 weeks, and slight swelling can last up to 4 months, according to The Aesthetic Society.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'garment-4-6-weeks',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'The Aesthetic Society says you wear a compression garment over the treated areas for 4 to 6 weeks, to control swelling and help the skin settle.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'exercise-4-6-weeks',
        topic: 'recovery',
        concepts: ['exercise', 'workout'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'The Aesthetic Society advises avoiding strenuous exercise for 4 to 6 weeks.',
        sourceIds: ['aesthetic-society-liposuction-recovery'],
    },
    {
        id: 'results-3-6-months',
        topic: 'results',
        concepts: ['result', 'swelling', 'final', 'shape'],
        figures: [{ min: 3, max: 6, unit: 'month' }],
        statement:
            'Cleveland Clinic says it can take 3 to 6 months for swelling to go away completely before you see the final result.',
        sourceIds: ['cleveland-clinic-liposuction'],
    },
    {
        id: 'fat-cells-removed-permanently',
        topic: 'results',
        concepts: ['permanent', 'fat cells', 'weight'],
        figures: [],
        statement:
            'Liposuction permanently removes fat cells, Cleveland Clinic says, and ASPS says results last as long as you keep a stable weight and general fitness; the fat cells that remain can still grow if you gain weight.',
        sourceIds: ['cleveland-clinic-liposuction', 'asps-liposuction'],
    },

    // ── Candidacy ────────────────────────────────────────────────────────
    {
        id: 'asps-within-30-percent',
        topic: 'procedure',
        concepts: ['ideal weight', 'candidate'],
        figures: [{ value: 30, unit: 'percent' }],
        statement:
            "ASPS describes ideal candidates as adults within 30% of their ideal weight, with firm, elastic skin and good muscle tone, who don't smoke or vape.",
        sourceIds: ['asps-liposuction-candidates'],
        caveat: 'A description of ideal candidates, not a cutoff. The surgeon decides at consultation.',
    },
    {
        id: 'not-weight-loss',
        topic: 'procedure',
        concepts: ['obesity', 'weight loss', 'cellulite', 'skin'],
        figures: [],
        statement:
            'Liposuction is not a treatment for obesity or a substitute for diet and exercise (ASPS), and it removes fat without tightening skin or improving cellulite (The Aesthetic Society).',
        sourceIds: ['asps-liposuction', 'aesthetic-society-liposuction'],
    },

    // ── Safety ───────────────────────────────────────────────────────────
    {
        id: 'major-complications-0-7-percent',
        topic: 'safety',
        concepts: ['complication'],
        years: [2017],
        figures: [
            { value: 0.7, unit: 'percent' },
            { value: 30, unit: 'day' },
        ],
        statement:
            'A study of an insurance database of cosmetic surgery found major complications, meaning an emergency visit, a hospital stay or another operation within 30 days, after 0.7% of liposuction-only procedures (Kaoutzanis and colleagues, Aesthetic Surgery Journal, 2017).',
        sourceIds: ['kaoutzanis-2017'],
        caveat: 'Data from 2008–2013; major complications only, minor ones were not captured. Never "0.7% of patients have complications".',
    },
    {
        id: 'combined-procedures-raise-risk',
        topic: 'safety',
        concepts: ['combin'],
        figures: [],
        statement:
            'The same study concluded that combining liposuction with other procedures, especially in older patients or patients with obesity, can significantly increase complication rates.',
        sourceIds: ['kaoutzanis-2017'],
    },
    {
        id: 'contour-irregularity-most-common',
        topic: 'safety',
        concepts: ['contour', 'uneven'],
        years: [2024],
        figures: [
            { value: 2.35, unit: 'percent' },
            { value: 39, unit: 'study' },
            { value: 29368, unit: 'patient' },
        ],
        statement:
            'A 2024 review of 39 studies and 29,368 patients found that an uneven contour was the most common complication of liposuction, in 2.35% of patients (Comerci and colleagues, Aesthetic Surgery Journal, 2024).',
        sourceIds: ['comerci-2024'],
    },

    // ── Law ──────────────────────────────────────────────────────────────
    {
        id: 'florida-office-limit-4000cc',
        topic: 'law',
        concepts: ['office'],
        figures: [{ value: 4000, unit: 'cc' }],
        statement:
            "Florida allows at most 4,000 cc of supernatant fat to be removed by liposuction in a doctor's office.",
        sourceIds: ['florida-rule-64b8-9-009'],
        caveat: 'The office setting only. Never say it applies to hospitals, and never say where Alluring operates until the owner confirms it.',
    },
    {
        id: 'florida-with-tummy-tuck-1000cc',
        topic: 'law',
        concepts: ['tummy tuck', 'abdominoplasty'],
        figures: [{ value: 1000, unit: 'cc' }],
        statement:
            'When liposuction is combined with a tummy tuck in the same office operation, Florida allows at most 1,000 cc of supernatant fat.',
        sourceIds: ['florida-rule-64b8-9-009'],
    },
    {
        id: 'florida-registration-1000cc',
        topic: 'law',
        concepts: ['register', 'log'],
        figures: [{ value: 1000, unit: 'cc' }],
        statement:
            'An office where liposuction removes more than 1,000 cc of supernatant fat must register with the Florida Department of Health, and the surgeon must keep a log of those procedures.',
        sourceIds: ['florida-statutes-458-328', 'florida-rule-64b8-9-009'],
    },
    {
        id: 'supernatant-fat',
        topic: 'law',
        concepts: ['supernatant'],
        figures: [],
        statement:
            'Supernatant fat is the fat alone, measured once the fluid removed with it has separated out.',
        sourceIds: ['florida-rule-64b8-9-009'],
    },

    // ── Procedure (the practice's own figures) ───────────────────────────
    {
        id: 'surgery-1-3-hours',
        topic: 'procedure',
        concepts: ['surgery', 'take', 'hour'],
        figures: [{ min: 1, max: 3, unit: 'hour' }],
        statement:
            'Liposuction at Alluring usually takes 1 to 3 hours, depending on how many areas are treated, and you go home the same day.',
        sourceIds: ['alluring-practice'],
        caveat: 'Mirrors `quickStats` in liposuction-miami.data.ts, which the practice already published; confirm with the owner.',
    },

    // ── Price (the practice's price sheet of 2026-09-15) ─────────────────
    {
        id: 'asps-average-fee',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 4711, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of liposuction at $4,711, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-liposuction-cost'],
        caveat: 'A national surgeon-fee average, not a Miami price and not an all-in price: always say what it leaves out. No year.',
    },
    {
        id: 'price-starting-at',
        topic: 'price',
        concepts: ['start', 'price', 'lipo 360'],
        figures: [{ value: 4000, unit: 'usd' }],
        statement: 'Lipo 360 at Alluring starts at $4,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'From the 2026-09-15 price sheet. Never $4,500 (the old figure) or a weekly figure. Mirrors `pricing.startingAt`. Whether the sheet is before or after its handwritten "20% off" is still open with the owner.',
    },
    {
        id: 'price-added-area',
        topic: 'price',
        concepts: ['add', 'area'],
        figures: [{ min: 500, max: 1500, unit: 'usd' }],
        statement:
            'Liposuction of one area added to another procedure is $500 to $1,500, depending on the area.',
        sourceIds: ['alluring-practice'],
        caveat: 'Add-on prices from the price sheet: chin $500 up to abdomen and flanks or back and flanks $1,500. Not a standalone surgery price.',
    },
] as const satisfies readonly LipoFact[]

export type LipoFactId = (typeof lipoFacts)[number]['id']

const lipoLookups = createFactLookups(lipoFacts, 'liposuction')

export const getLipoFact: (id: LipoFactId) => LipoFact = lipoLookups.fact

/** A figure as copy writes it: "$4,000", "4–6 weeks", "0.7%", "4,000 cc". */
export const formatLipoFigure = formatProcedureFigure

/** The first (or `index`th) figure of a fact, formatted. */
export const lipoFigure: (id: LipoFactId, index?: number) => string =
    lipoLookups.figure
