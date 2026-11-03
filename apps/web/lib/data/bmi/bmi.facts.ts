/**
 * The BMI page's facts (/bmi-calculator, issue #346): the recommended BMI
 * range for each procedure, every figure the page may publish, and the
 * sources they rest on. Every source was opened and read on 2026-10-17;
 * `attribution` quotes the sentence the figure comes from.
 *
 * Practice stance (owner, 2026-10-17): we encourage patients to reach the
 * recommended range before surgery, we use the published range for each
 * procedure rather than a cutoff of our own, and we invite people to ask
 * what applies to them. No society publishes a hard BMI cutoff for any of
 * these procedures, so each range is where the published evidence points,
 * and the surgeon decides case by case.
 *
 * `check-procedure-copy.ts` (config `bmi-calculator`) fails any BMI, %,
 * count or time figure on the built page that a fact here does not declare.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can
 * read it. The client calculator never imports it: the page passes the
 * calculator the few fields it needs, so the statements stay out of the
 * browser bundle.
 *
 * @module
 */

import {
    createFactLookups,
    type ProcedureFact,
    type ProcedureSource,
} from '../procedures/facts/procedure-facts'

type BmiSourceId =
    | 'gupta-2016'
    | 'winocour-2015'
    | 'bruno-2026'
    | 'aesthetic-society-tummy-tuck-bmi'
    | 'asps-tummy-tuck'
    | 'asps-liposuction-candidates'
    | 'aesthetic-society-liposuction'
    | 'chow-2015'
    | 'kaoutzanis-2017'
    | 'frank-2019'
    | 'asps-mommy-makeover-candidates'
    | 'skorochod-2026'
    | 'knoedler-2026-augmentation'
    | 'asps-breast-lift-candidates'
    | 'asps-reduction-guideline-2022'
    | 'knoedler-2025-reduction'
    | 'kong-2026-reduction'
    | 'florida-rule-64b8-9-009'
    | 'asa-physical-status'
    | 'asa-glp1-guidance-2024'
    | 'aesthetic-society-butt-lift'
    | 'cdc-bmi-categories'
    | 'cdc-bmi-formula'
    | 'cdc-losing-weight'

type BmiSource = ProcedureSource<BmiSourceId>
type BmiFact = ProcedureFact<BmiSourceId>

export const bmiSources: readonly BmiSource[] = [
    {
        id: 'cdc-bmi-categories',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        title: 'Adult BMI Categories',
        date: '2024-03-19',
        url: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html',
        attribution:
            'Read on 2026-10-17. Adults 20 and older: "Underweight: Less than 18.5", "Healthy Weight: 18.5 to less than 25", "Overweight: 25 to less than 30", "Obesity: 30 or greater", "Class 3 Obesity (Severe Obesity): 40 or greater". "BMI is a screening measure."',
    },
    {
        id: 'cdc-bmi-formula',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        title: 'Body Mass Index: Frequently Asked Questions',
        date: '2024-06-28',
        url: 'https://www.cdc.gov/bmi/faq/index.html',
        attribution:
            'Read on 2026-10-17. Metric: "weight (kg)/[height (m)]2"; U.S. customary: "weight (pounds)/[height (in)]2 x 703". "BMI is not a direct measure of body fat." The calculator and the height and weight chart use these formulas.',
    },
    {
        id: 'gupta-2016',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Safety of Aesthetic Surgery in the Overweight Patient: Analysis of 127,961 Patients',
        authors: 'Gupta V, Winocour J, Rodriguez-Feo C, et al.',
        date: '2016-06',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26895958/',
        attribution:
            'Abstract read in PubMed (26895958) on 2026-10-17. CosmetAssure, 2008–2013; major complication = ER visit, admission or reoperation within 30 days. "Complication rate steadily increased with BMI: 1.4% (BMI < 18.5); 1.6% (18.5-24.9); 2.3% (25-29.9); 3.1% (30-39.9); 4.2% (≥40)." "Infection (0.8%), venous thromboembolism (VTE, 0.4%), and pulmonary dysfunction (0.2%) were twice as common among overweight patients." "Complications following abdominoplasty (3.5%), liposuction (0.9%), lower body lift (8.8%), or combined breast and body procedures (4.2%) were significantly higher in overweight patients." Conclusion: "Overweight (BMI 25-29.9) and obesity (BMI ≥ 30) are both independent risk factors for post-operative infection and VTE in aesthetic surgery."',
    },
    {
        id: 'winocour-2015',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Abdominoplasty: Risk Factors, Complication Rates, and Safety of Combined Procedures',
        authors: 'Winocour J, Gupta V, Ramirez JR, et al.',
        date: '2015-11',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26505716/',
        attribution:
            'Abstract read in PubMed (26505716) on 2026-10-17. 25,478 abdominoplasties, CosmetAssure 2008–2013. Risk factors on multivariate analysis: "male sex (relative risk, 1.8), age 55 years or older (1.4), body mass index greater than or equal to 30 (1.3), multiple procedures (1.5)". "abdominoplasty alone, 3.1 percent; with liposuction, 3.8 percent; breast procedure, 4.3 percent; liposuction and breast procedure, 4.6 percent". "Combined procedures can significantly increase complication rates and should be considered carefully in higher risk patients."',
    },
    {
        id: 'bruno-2026',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Predictors of Complications in Abdominoplasty: A Multivariate Analysis of 150 Consecutive Cases',
        authors: 'Bruno A, Foti R',
        date: '2026-07',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42126440/',
        attribution:
            'Abstract read in PubMed (42126440) on 2026-10-17. "Multivariate analysis identified high body mass index (BMI ≥30 kg/m2) and active smoking as independent predictors of complications". "High BMI and active smoking are the dominant independent predictors of postoperative complications following abdominoplasty". One surgical team, Rome.',
    },
    {
        id: 'aesthetic-society-tummy-tuck-bmi',
        publisher: 'The Aesthetic Society',
        title: 'Is a Tummy Tuck Possible with a 36 BMI (Ask a Surgeon)',
        date: '2018-11-01',
        url: 'https://www.theaestheticsociety.org/ask-question/100476',
        attribution:
            'Read on 2026-10-17. Member surgeons answering a patient: "Typically, BMI should be closer to 30 to allow you to have a safer surgery. Complications go up dramatically with higher BMIs (above 30)." and "In general, most surgeons prefer a BMI that is closer to 30." Surgeon answers on the society\'s site, not a society guideline; the copy says so.',
    },
    {
        id: 'asps-tummy-tuck',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Tummy Tuck',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck',
        attribution:
            'Read on 2026-10-17: "A tummy tuck is not a substitute for weight loss or an appropriate exercise program." "the positive outcome can be greatly diminished by significant fluctuations in your weight. For this reason, individuals who are planning substantial weight loss or women who may be considering future pregnancies would be advised to postpone a tummy tuck." Candidates page: "You are physically healthy and at a stable weight". No BMI figure.',
    },
    {
        id: 'asps-liposuction-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Are you a good candidate for liposuction?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/liposuction/candidates',
        attribution:
            'Read on 2026-10-17: "Ideal candidates for liposuction are: Adults within 30% of their ideal weight who have firm, elastic skin and good muscle tone". The procedure page adds: "Liposuction is not a treatment for obesity or a substitute for proper diet and exercise." No BMI figure.',
    },
    {
        id: 'aesthetic-society-liposuction',
        publisher: 'The Aesthetic Society',
        title: 'Liposuction',
        url: 'https://www.theaestheticsociety.org/procedures/body/liposuction',
        attribution:
            'Read on 2026-10-17: "your weight should be stable. You may need to lose weight to be a better candidate for liposuction. If you are planning to lose a significant amount of weight, you should wait to undergo liposuction." Its "no more than 20 pounds overweight" is not used: the copy sweep has no unit for pounds.',
    },
    {
        id: 'chow-2015',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Is There a Safe Lipoaspirate Volume? A Risk Assessment Model of Liposuction Volume as a Function of Body Mass Index',
        authors: 'Chow I, Alghoul MS, Khavanin N, et al.',
        date: '2015-09',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26313819/',
        attribution:
            'Abstract read in PubMed (26313819) on 2026-10-17. TOPS database, 4,534 patients. "Liposuction volume and body mass index were significant independent risk factors for complications." "Liposuction volumes in excess of 100 ml per unit of body mass index were an independent predictor of complications". 100 ml is written as 100 cc.',
    },
    {
        id: 'kaoutzanis-2017',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Cosmetic Liposuction: Preoperative Risk Factors, Major Complication Rates, and Safety of Combined Procedures',
        authors: 'Kaoutzanis C, Gupta V, Winocour J, et al.',
        date: '2017',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28430878/',
        attribution:
            'Abstract read in PubMed (28430878) on 2026-10-17. "Independent predictors of major complications included combined procedures (Relative Risk (RR) 4.81), age (RR 1.01), BMI (RR 1.05)". "Combined procedures, especially on obese or older individuals, can significantly increase complication rates."',
    },
    {
        id: 'frank-2019',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Influence of Age, Sex, and Body Mass Index on the Thickness of the Gluteal Subcutaneous Fat: Implications for Safe Buttock Augmentation Procedures',
        authors: 'Frank K, Casabona G, Gotkin RH, et al.',
        date: '2019-07',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31246807/',
        attribution:
            'Abstract read in PubMed (31246807) on 2026-10-17. Ultrasound in 150 people: "An increase in body mass index of 1.0 kg/m corresponded to an increase of 3 mm of the total gluteal subcutaneous fat of men and a 4-mm increase of the total gluteal subcutaneous fat in women." The subcutaneous fat is "the safe space" for injection. Used only for "the layer gets thicker as BMI rises"; no millimeter figure is published.',
    },
    {
        id: 'asps-mommy-makeover-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Who is a good candidate for a mommy makeover?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/mommy-makeover/candidates',
        attribution:
            'Read on 2026-10-17: "You may be a candidate for mommy makeover surgery if: You are in good medical health You are at your ideal body weight You have a positive outlook and realistic expectations You are finished with childbearing". No BMI figure.',
    },
    {
        id: 'skorochod-2026',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Risk of Concomitant Abdominoplasty and Breast Surgery versus Isolated Procedures: A Systematic Review and Meta-analysis',
        authors: 'Skorochod R, Wolf Y',
        date: '2026-07',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42089979/',
        attribution:
            'Abstract read in PubMed (42089979) on 2026-10-17. "Eight studies encompassing 138,020 patients were included." "Concomitant abdominoplasty and breast surgery carries a complication profile comparable to abdominoplasty alone but elevated relative to breast surgery alone. These findings suggest that combined procedures are generally safe in carefully selected patients."',
    },
    {
        id: 'knoedler-2026-augmentation',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Weight a Minute: Investigating the Impact of Body Mass Index on Early Outcomes After Breast Augmentation',
        authors: 'Knoedler S, Watson JA, Klimitz FJ, et al.',
        date: '2026-06',
        url: 'https://pubmed.ncbi.nlm.nih.gov/41741917/',
        attribution:
            'Abstract read in PubMed (41741917) on 2026-10-17. ACS-NSQIP 2009–2023, 6,515 patients, elective primary aesthetic augmentation. "we identified BMI ≥25.2 kg/m2 as a statistically derived risk threshold". "Overall 30-day morbidity was markedly elevated in the higher BMI cohort (4.3% vs 1.3%, p < 0.001)". A hospital-reported database, not a society guideline.',
    },
    {
        id: 'asps-breast-lift-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Who is a good candidate for breast lift surgery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/candidates',
        attribution:
            'Read on 2026-10-17: "You may be a candidate for breast lift surgery if: You are physically healthy and maintain a stable weight You do not smoke". No BMI figure; no breast-lift-specific BMI study was found.',
    },
    {
        id: 'asps-reduction-guideline-2022',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'American Society of Plastic Surgeons Evidence-Based Clinical Practice Guideline Revision: Reduction Mammaplasty',
        authors: 'Perdikis G, Dillingham C, Boukovalas S, et al.',
        date: '2022-03',
        url: 'https://doi.org/10.1097/PRS.0000000000008860',
        attribution:
            'Full text read on 2026-10-17. Recommendation 2 (moderate): "The work group recommends that clinicians counsel postmenarche patients with symptomatic breast hypertrophy considering reduction mammaplasty that they may have a higher risk of complications if they are older than 50 yr, have a body mass index greater than 35 kg/m2, or require chronic corticosteroid use". Rationale: "patients with a body mass index greater than 35 kg/m 2 have a higher risk of complications that includes infection and wound healing." Recommendation 1: surgery is offered on symptoms, not resection weight.',
    },
    {
        id: 'knoedler-2025-reduction',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'The Impact of Body Mass Index on Breast Reduction Outcomes: A Multi-Institutional Data Analysis of 45,000 Cases over 15 Years',
        authors: 'Knoedler S, Matar DY, Kosyk M, et al.',
        date: '2025-07',
        url: 'https://pubmed.ncbi.nlm.nih.gov/40000470/',
        attribution:
            'Abstract read in PubMed (40000470) on 2026-10-17. 45,373 patients, ACS-NSQIP 2008–2022. "The risk for complications increased stepwise above the healthy BMI range." "The odds for reoperation did not increase with higher BMI classes."',
    },
    {
        id: 'kong-2026-reduction',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'The Impact of BMI on Postoperative Complications Following Reduction Mammaplasty',
        authors: 'Kong BH, Abdallah C, Kashlan R, et al.',
        date: '2026-03-31',
        url: 'https://pubmed.ncbi.nlm.nih.gov/41914952/',
        attribution:
            'Abstract read in PubMed (41914952) on 2026-10-17. 952 patients, one surgeon. "BMI independently predicts minor wound-related complications but not major complications." "These findings support individualized risk assessment and comorbidity optimization rather than rigid BMI cutoffs".',
    },
    {
        id: 'florida-rule-64b8-9-009',
        publisher: 'Florida Board of Medicine',
        title: 'Rule 64B8-9.009, Standard of Care for Office Surgery',
        date: '2024-09-16',
        url: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B8-9.009',
        attribution:
            'Read on 2026-10-17 from the official text on flrules.org (the rule document linked from that page, effective 9/16/2024); the law.cornell.edu mirror reads the same. (6)(a)1.: "Level III Office Surgery is that surgery in which the patient\'s level of sedation is that of deep sedation and analgesia or general anesthesia." (6)(a)2.: "Only patients classified under the American Society of Anesthesiologist\'s (ASA) risk classification criteria as Class I or II are appropriate candidates for Level III office surgery." 2.a.: "All Level III surgeries on patients classified as ASA III and higher are to be performed only in a hospital or ambulatory surgery center." 2.b.: "For all ASA II patients above the age of 50, the surgeon must obtain a complete workup performed prior to the performance of Level III surgery in a physician office setting." Never claim where Alluring operates or that a facility is accredited.',
    },
    {
        id: 'asa-physical-status',
        publisher: 'American Society of Anesthesiologists (ASA)',
        title: 'Statement on ASA Physical Status Classification System',
        date: '2020-12-13',
        url: 'https://www.asahq.org/standards-and-practice-parameters/statement-on-asa-physical-status-classification-system',
        attribution:
            'Read on 2026-10-17 through the Internet Archive copy of asahq.org (2024-06-01): the live URL now redirects to a 2026 journal version behind a paywall, which could not be read. "Last Amended: December 13, 2020". ASA II adult examples: "Current smoker, social alcohol drinker, pregnancy, obesity (30<BMI<40), well-controlled DM/HTN, mild lung disease". ASA III: "morbid obesity (BMI ≥40)". "The definitions and examples shown in the table below are guidelines for the clinician."',
    },
    {
        id: 'asa-glp1-guidance-2024',
        publisher: 'American Society of Anesthesiologists (ASA)',
        title: 'Most Patients Can Continue Diabetes, Weight Loss GLP-1 Drugs Before Surgery (multi-society guidance)',
        date: '2024-10-29',
        url: 'https://www.asahq.org/about-asa/newsroom/news-releases/2024/10/new-multi-society-glp-1-guidance',
        attribution:
            'Read on 2026-10-17. With the AGA, ASMBS, ISPCOP and SAGES: "Most patients should continue taking their glucagon-like peptide-1 (GLP-1) receptor agonists before elective surgery". "Patients at the highest risk for significant gastrointestinal (GI) side effects should follow a liquid diet for 24 hours before the procedure". GLP-1 drugs "delay stomach emptying". "Patients should work with their health care team, i.e., their anesthesiologist, surgeon and prescribing care team". No dosing on the page.',
    },
    {
        id: 'aesthetic-society-butt-lift',
        publisher: 'The Aesthetic Society',
        title: 'Butt Lift',
        url: 'https://www.theaestheticsociety.org/procedures/body/butt-lift',
        attribution:
            'Read on 2026-10-17: "If you recently experienced dramatic weight loss or have undergone bariatric surgery, you should be close to your ideal weight. Your weight has to be stable for at least six months, with no further weight loss expected."',
    },
    {
        id: 'cdc-losing-weight',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        title: 'Steps for Losing Weight',
        date: '2025-01-17',
        url: 'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html',
        attribution:
            'Read on 2026-10-17: "People who lose weight at a gradual, steady pace—about 1 to 2 pounds a week—are more likely to keep the weight off than people who lose weight quicker." The pace is used in the calculator only, as data; the copy sweep has no unit for pounds.',
    },
]

export const bmiFacts = [
    // ── The page's recommended ranges ────────────────────────────────────
    {
        // The synthesis the whole page rests on. It licenses "BMI under 30"
        // and "BMI 35 or under" wherever a sentence names a procedure or
        // the range, since those are the ranges themselves.
        id: 'recommended-ranges',
        topic: 'procedure',
        concepts: [
            'recommend',
            'range',
            'evidence',
            'procedure',
            'bbl',
            'lipo',
            'tummy tuck',
            'mommy makeover',
            'breast',
            'surgery',
        ],
        figures: [
            { value: 30, unit: 'bmi' },
            { value: 35, unit: 'bmi' },
        ],
        statement:
            'We recommend a BMI under 30 before a BBL, lipo 360, tummy tuck, mommy makeover, breast augmentation or breast lift, and BMI 35 or under before a breast reduction: where the published evidence turns for each, not a cutoff of our own.',
        sourceIds: [
            'gupta-2016',
            'winocour-2015',
            'bruno-2026',
            'aesthetic-society-tummy-tuck-bmi',
            'asps-reduction-guideline-2022',
        ],
        caveat: 'No society sets a hard cutoff for any of these procedures. Always pair the range with "your surgeon decides case by case".',
    },

    // ── What BMI is ──────────────────────────────────────────────────────
    {
        id: 'cdc-categories',
        topic: 'procedure',
        concepts: ['underweight', 'healthy', 'overweight', 'obes', 'cdc'],
        figures: [
            { value: 18.5, unit: 'bmi' },
            { min: 18.5, max: 24.9, unit: 'bmi' },
            { min: 25, max: 29.9, unit: 'bmi' },
            { value: 30, unit: 'bmi' },
            { value: 40, unit: 'bmi' },
        ],
        statement:
            'For adults the CDC calls a BMI under 18.5 underweight, BMI 18.5 to 24.9 a healthy weight, BMI 25 to 29.9 overweight, BMI 30 or more obesity and BMI 40 or more severe obesity.',
        sourceIds: ['cdc-bmi-categories'],
    },

    // ── Risk across cosmetic surgery ─────────────────────────────────────
    {
        id: 'complications-by-bmi',
        topic: 'safety',
        concepts: ['complication'],
        years: [2008, 2013],
        figures: [
            { value: 127961, unit: 'patient' },
            // "within 30 days": what counted as a major complication.
            { value: 30, unit: 'day' },
            { value: 1.6, unit: 'percent' },
            { value: 2.3, unit: 'percent' },
            { value: 3.1, unit: 'percent' },
            { value: 4.2, unit: 'percent' },
            { min: 18.5, max: 24.9, unit: 'bmi' },
            { min: 25, max: 29.9, unit: 'bmi' },
            { min: 30, max: 39.9, unit: 'bmi' },
            { value: 40, unit: 'bmi' },
        ],
        statement:
            'In 127,961 patients having cosmetic surgery, major complications rose steadily with BMI: 1.6% at BMI 18.5 to 24.9, 2.3% at BMI 25 to 29.9, 3.1% at BMI 30 to 39.9, and 4.2% at BMI 40 or more (Gupta and colleagues, Aesthetic Surgery Journal, 2016).',
        sourceIds: ['gupta-2016'],
        caveat: 'Major complications only: an emergency room visit, a hospital stay or another operation within a month.',
    },
    {
        id: 'infection-and-clots',
        topic: 'safety',
        concepts: ['infection', 'clot'],
        figures: [{ value: 25, unit: 'bmi' }],
        statement:
            'In the same study, infections and blood clots were about twice as common in patients with a BMI of 25 or more, and a higher BMI was an independent risk factor for both.',
        sourceIds: ['gupta-2016'],
    },

    // ── Tummy tuck ───────────────────────────────────────────────────────
    {
        id: 'tummy-tuck-bmi-30',
        topic: 'safety',
        concepts: ['tummy tuck', 'risk'],
        figures: [
            { value: 25478, unit: 'patient' },
            { value: 30, unit: 'bmi' },
            { value: 55, unit: 'age' },
        ],
        statement:
            'In 25,478 patients having a tummy tuck, a BMI of 30 or more was an independent risk factor for major complications, along with age 55 or older and combining procedures (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015).',
        sourceIds: ['winocour-2015'],
    },
    {
        id: 'tummy-tuck-predictor-2026',
        topic: 'safety',
        concepts: ['predict', 'complication'],
        figures: [
            { value: 150, unit: 'patient' },
            { value: 30, unit: 'bmi' },
        ],
        statement:
            'A 2026 analysis of 150 patients found that a BMI of 30 or more and smoking were the strongest independent predictors of complications after a tummy tuck.',
        sourceIds: ['bruno-2026'],
    },
    {
        id: 'tummy-tuck-closer-to-30',
        topic: 'safety',
        concepts: ['aesthetic society', 'surgeon'],
        figures: [{ value: 30, unit: 'bmi' }],
        statement:
            "Answering a patient on The Aesthetic Society's website, member surgeons wrote that a BMI closer to 30 allows a safer tummy tuck, and that complications go up sharply above it.",
        sourceIds: ['aesthetic-society-tummy-tuck-bmi'],
        caveat: 'Surgeon answers on the society site, not a society guideline. Say so.',
    },

    // ── Combined procedures ──────────────────────────────────────────────
    {
        id: 'combined-tummy-tuck-rates',
        topic: 'safety',
        concepts: ['combin', 'breast'],
        figures: [
            { value: 3.1, unit: 'percent' },
            { value: 4.3, unit: 'percent' },
            { value: 4.6, unit: 'percent' },
        ],
        statement:
            'Major complications followed 3.1% of tummy tucks done alone, 4.3% of those combined with a breast procedure and 4.6% of those combined with liposuction and a breast procedure.',
        sourceIds: ['winocour-2015'],
    },
    {
        id: 'combined-meta-analysis',
        topic: 'safety',
        concepts: ['combin', 'review'],
        years: [2026],
        figures: [
            { value: 8, unit: 'study' },
            { value: 138020, unit: 'patient' },
        ],
        statement:
            'A 2026 review of 8 studies and 138,020 patients found that a tummy tuck combined with breast surgery carried about the same complication risk as a tummy tuck alone, in carefully selected patients.',
        sourceIds: ['skorochod-2026'],
    },

    // ── Liposuction ──────────────────────────────────────────────────────
    {
        id: 'lipo-ideal-weight',
        topic: 'procedure',
        concepts: ['ideal weight', 'candidate'],
        figures: [{ value: 30, unit: 'percent' }],
        statement:
            'ASPS describes ideal liposuction candidates as adults within 30% of their ideal weight, with firm, elastic skin.',
        sourceIds: ['asps-liposuction-candidates'],
    },
    {
        id: 'lipo-volume-per-bmi',
        topic: 'safety',
        concepts: ['volume', 'fat', 'liposuction'],
        figures: [
            { value: 4534, unit: 'patient' },
            { value: 100, unit: 'cc' },
        ],
        statement:
            'A study of 4,534 patients having liposuction found that removing more than 100 cc of fat for each point of BMI raised the risk of complications (Chow and colleagues, Plastic and Reconstructive Surgery, 2015).',
        sourceIds: ['chow-2015'],
    },

    // ── Breast augmentation ──────────────────────────────────────────────
    {
        id: 'augmentation-threshold',
        topic: 'safety',
        concepts: ['augmentation', 'complication'],
        figures: [
            { value: 6515, unit: 'patient' },
            { value: 30, unit: 'day' },
            { value: 4.3, unit: 'percent' },
            { value: 1.3, unit: 'percent' },
            { value: 25.2, unit: 'bmi' },
        ],
        statement:
            'In 6,515 patients having cosmetic breast augmentation, complications in the first 30 days were 4.3% at a BMI of 25.2 or more and 1.3% below it (Knoedler and colleagues, Aesthetic Plastic Surgery, 2026).',
        sourceIds: ['knoedler-2026-augmentation'],
    },

    // ── Breast reduction ─────────────────────────────────────────────────
    {
        id: 'reduction-guideline-35',
        topic: 'safety',
        concepts: ['reduction', 'guideline', 'risk'],
        years: [2022],
        figures: [{ value: 35, unit: 'bmi' }],
        statement:
            'The 2022 ASPS guideline on breast reduction tells surgeons to counsel patients that a BMI over 35 may mean a higher risk of complications, mainly infection and wound healing problems.',
        sourceIds: ['asps-reduction-guideline-2022'],
    },
    {
        id: 'reduction-stepwise',
        topic: 'safety',
        concepts: ['reduction', 'risk'],
        figures: [{ value: 45373, unit: 'patient' }],
        statement:
            'In 45,373 patients having a breast reduction, the risk of complications rose step by step above a healthy BMI, while the odds of another operation did not.',
        sourceIds: ['knoedler-2025-reduction'],
    },
    {
        id: 'reduction-no-rigid-cutoff',
        topic: 'safety',
        concepts: ['wound', 'cutoff'],
        figures: [{ value: 952, unit: 'patient' }],
        statement:
            'A 2026 analysis of 952 patients having a breast reduction found that BMI predicted minor wound problems but not major complications, and argued for individual assessment over rigid BMI cutoffs.',
        sourceIds: ['kong-2026-reduction'],
    },

    // ── Florida and anesthesia ───────────────────────────────────────────
    {
        id: 'asa-obesity-examples',
        topic: 'law',
        concepts: ['asa', 'class'],
        figures: [
            { min: 30, max: 40, unit: 'bmi' },
            { value: 40, unit: 'bmi' },
        ],
        statement:
            "In the American Society of Anesthesiologists' published examples, obesity with a BMI between 30 and 40 is class II and a BMI of 40 or more is class III. The ASA calls its examples guidelines for the clinician.",
        sourceIds: ['asa-physical-status'],
    },
    {
        id: 'florida-asa-over-50',
        topic: 'law',
        concepts: ['workup', 'asa'],
        figures: [{ value: 50, unit: 'age' }],
        statement:
            'For ASA II patients above age 50, the surgeon must get a complete workup before office surgery under deep sedation or general anesthesia.',
        sourceIds: ['florida-rule-64b8-9-009'],
    },

    // ── Getting to your range ────────────────────────────────────────────
    {
        id: 'stable-six-months',
        topic: 'procedure',
        concepts: ['stable', 'weight'],
        figures: [{ value: 6, unit: 'month' }],
        statement:
            'After dramatic weight loss or bariatric surgery, The Aesthetic Society says your weight should be stable for at least six months, with no further loss expected, before a buttock lift.',
        sourceIds: ['aesthetic-society-butt-lift'],
    },
    {
        id: 'glp1-guidance',
        topic: 'safety',
        concepts: ['glp', 'liquid', 'stomach'],
        years: [2024],
        figures: [{ value: 24, unit: 'hour' }],
        statement:
            'Because GLP-1 medicines slow how fast the stomach empties, anesthesia and surgery societies issued joint guidance in 2024: most patients can keep taking them before elective surgery, and those at highest risk may be asked to follow a liquid diet for 24 hours before.',
        sourceIds: ['asa-glp1-guidance-2024'],
    },
] as const satisfies readonly BmiFact[]

export const { fact: bmiFact, figure: bmiFigure } = createFactLookups(
    bmiFacts,
    'BMI'
)

// ─── The ranges the calculator and the procedure sections use ──────────────

/** The consultation thread's value for each procedure (`site-chat-copy.ts`). */
export type BmiProcedureChat =
    | 'bbl'
    | 'liposuction'
    | 'tummy-tuck'
    | 'mommy-makeover'
    | 'breast-augmentation'
    | 'breast-lift'
    | 'breast-reduction'

export type BmiProcedure = {
    /** The section's id on the page, e.g. `bbl` → `#bbl`. */
    id: string
    /** As the calculator row prints it. */
    name: string
    /** The procedure page. */
    href: `/procedures/${string}`
    chat: BmiProcedureChat
    /**
     * The recommended upper limit. `under` means below it (BMI under 30),
     * `atMost` means up to and including it (BMI 35 or under).
     */
    limit: number
    bound: 'under' | 'atMost'
}

/**
 * Seven procedures, in the order the page treats them (the search demand
 * order, 90 days to 2026-10-14). Every body procedure and breast
 * augmentation and lift sit under 30: that is where the evidence turns
 * (Gupta 2016, Winocour 2015, Bruno 2026), and no source sets a different
 * line for them. Breast reduction follows the ASPS guideline's 35.
 */
export const BMI_PROCEDURES = [
    {
        id: 'bbl',
        name: 'BBL',
        href: '/procedures/brazilian-butt-lift-bbl-miami',
        chat: 'bbl',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'liposuction',
        name: 'Lipo 360',
        href: '/procedures/liposuction-miami',
        chat: 'liposuction',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'tummy-tuck',
        name: 'Tummy tuck',
        href: '/procedures/tummy-tuck-miami',
        chat: 'tummy-tuck',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'mommy-makeover',
        name: 'Mommy makeover',
        href: '/procedures/mommy-makeover-miami',
        chat: 'mommy-makeover',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'breast-augmentation',
        name: 'Breast augmentation',
        href: '/procedures/breast-augmentation-miami',
        chat: 'breast-augmentation',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'breast-lift',
        name: 'Breast lift',
        href: '/procedures/breast-lift-miami',
        chat: 'breast-lift',
        limit: 30,
        bound: 'under',
    },
    {
        id: 'breast-reduction',
        name: 'Breast reduction',
        href: '/procedures/breast-reduction-miami',
        chat: 'breast-reduction',
        limit: 35,
        bound: 'atMost',
    },
] as const satisfies readonly BmiProcedure[]

export type BmiProcedureId = (typeof BMI_PROCEDURES)[number]['id']

/** "BMI under 30", "BMI 35 or under": the range as the page prints it. */
export function bmiRangeLabel(procedure: BmiProcedure): string {
    return procedure.bound === 'under'
        ? `BMI under ${procedure.limit}`
        : `BMI ${procedure.limit} or under`
}
