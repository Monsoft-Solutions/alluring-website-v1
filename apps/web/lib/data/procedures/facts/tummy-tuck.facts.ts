/**
 * Tummy tuck facts: every figure the tummy tuck page is allowed to publish,
 * stated once.
 *
 * The page module reads its figures from here, and
 * `scripts/check-procedure-copy.ts --slug tummy-tuck-miami` fails any copy on
 * the built page that states a %, cc, BMI, $, inch, hour, day, week, month,
 * year or age figure that is not declared below, or states a declared figure
 * in a sentence about something else.
 *
 * Every source was read on 2026-09-28: the ASPS and Cleveland Clinic pages
 * from their own text, the Florida rule from its official .doc on
 * flrules.org, the studies from their PubMed abstracts. Surgeon-written
 * posts on the ASPS website are attributed to their author, because ASPS
 * says they are the author's views, not the society's. Each fact carries the
 * attribution the copy must use and, in `caveat`, what the source does not
 * say. The practice's own figures come from its printed price sheet of
 * 2026-09-15 (`docs/pricing/practice-price-list.md`) and are stated as
 * Alluring's, never as a society's guidance.
 *
 * Not here, because only the practice can answer them (the Gate 1 brief's
 * owner questions): how long each type of tummy tuck takes at Alluring,
 * drains or a drainless technique, what the price includes, where surgery
 * is done, the blood-clot plan and how many nights to stay in Miami.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    createFactLookups,
    formatProcedureFigure,
    type ProcedureFact,
    type ProcedureSource,
} from './procedure-facts'

export type TummyTuckSourceId =
    | 'florida-rule-64b8-9-009'
    | 'asps-tummy-tuck'
    | 'asps-tummy-tuck-cost'
    | 'asps-tummy-tuck-candidates'
    | 'asps-tummy-tuck-results'
    | 'asps-tummy-tuck-preparation'
    | 'asps-wu-2019'
    | 'asps-salemy-2019'
    | 'asps-vitenas-2018'
    | 'asps-weiler-2023'
    | 'asps-rao-2024'
    | 'cleveland-clinic-tummy-tuck'
    | 'cleveland-clinic-tummy-tuck-scar'
    | 'winocour-2015'
    | 'mittal-2020'
    | 'xia-2019'
    | 'karunaratne-2023'
    | 'alluring-practice'

export type TummyTuckSource = ProcedureSource<TummyTuckSourceId>

export const tummyTuckSources: readonly TummyTuckSource[] = [
    {
        id: 'florida-rule-64b8-9-009',
        publisher: 'Florida Board of Medicine',
        title: 'Rule 64B8-9.009, Standard of Care for Office Surgery',
        date: '2024-09-16',
        url: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B8-9.009',
        attribution:
            'Read on 2026-09-28 from the rule\'s official text (effective 9/16/2024). (2)(e)1: "When combined with abdominoplasty, liposuction may not exceed 1000cc of supernatant fat." (2)(g): "the maximum planned duration of all surgical procedures combined must not exceed 8 hours" and "the patient must be discharged within 24 hours of presenting to the office for surgery". (2)(p): the surgeon gives the patient "in writing, prior to the procedure, the name and location of the hospital where the surgeon has privileges … or … a transfer agreement." All of it governs surgery in a physician\'s office, not hospitals or licensed surgery centers. Never claim where Alluring operates until the owner confirms it.',
    },
    {
        id: 'asps-tummy-tuck',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Tummy Tuck',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck',
        attribution:
            'Read on 2026-09-28: a tummy tuck "removes excess fat and skin and, in most cases, restores weakened or separated muscles"; "women who may be considering future pregnancies would be advised to postpone a tummy tuck"; "A tummy tuck cannot correct stretch marks, although these may be removed or somewhat improved if they are located on the areas of excess skin that will be excised."',
    },
    {
        id: 'asps-tummy-tuck-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does a tummy tuck cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/cost',
        attribution:
            'Read on 2026-09-28: "The average cost of a tummy tuck (abdominoplasty) is $8,174 … This average cost is only part of the total price – it does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans do not cover tummy tuck surgery or its complications." The page gives no year, so neither does the copy.',
    },
    {
        id: 'asps-tummy-tuck-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Are you a good candidate for a tummy tuck?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/candidates',
        attribution:
            'Read on 2026-09-28: "You are physically healthy and at a stable weight", "You have realistic expectations", "You are a nonsmoker", "You are bothered by the appearance of your abdomen". No BMI figure.',
    },
    {
        id: 'asps-tummy-tuck-results',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What results can I expect from a tummy tuck?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/results',
        attribution:
            'Read on 2026-09-28: "Within a week or two, you should be standing tall"; "In women who have undergone cesarean section, the existing scars may be incorporated into the new scar"; "The tummy tuck scar may take several months to a year to fade as much as it will."',
    },
    {
        id: 'asps-tummy-tuck-preparation',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How should I prepare for a tummy tuck?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/preparation',
        attribution:
            'Read on 2026-09-28: "A tummy tuck may be performed in an accredited office-based surgical facility, licensed ambulatory surgical center or a hospital." Someone should drive you home and "stay with you for at least the first night following surgery." Quote the setting sentence only as ASPS\'s general statement, never about Alluring.',
    },
    {
        id: 'asps-wu-2019',
        publisher: 'ASPS website, a post by Cindy Wu, MD',
        title: 'Answers to common tummy tuck questions',
        authors: 'Cindy Wu, MD',
        date: '2019-12-17',
        url: 'https://www.plasticsurgery.org/news/blog/answers-to-common-tummy-tuck-questions',
        attribution:
            'Read on 2026-09-28. A surgeon\'s post; ASPS says blog posts are the author\'s views. "You will be bent at the waist … for 7-10 days after surgery"; a drain "will be removed as soon as the output is low enough (usually in 1-2 weeks)"; walking "three times the day of surgery … to keep the risk of blood clots in the legs to a minimum"; "running or lifting should be avoided for six weeks"; "Patients typically return to work in approximately two weeks"; swelling diminishes "until approximately three months"; scars "thinner and lighter in color at around 12-18 months"; a compression garment "worn for 4-6 weeks".',
    },
    {
        id: 'asps-salemy-2019',
        publisher: 'ASPS website, a post by Shahram Salemy, MD',
        title: 'What you need to know about your tummy tuck recovery',
        authors: 'Shahram Salemy, MD',
        date: '2019-07-19',
        url: 'https://www.plasticsurgery.org/news/blog/what-you-need-to-know-about-your-tummy-tuck-recovery',
        attribution:
            'Read on 2026-09-28. A surgeon\'s post. "If you have young children, you will want to enlist help … as squatting or picking up children (or heavy objects for that matter) for the first few weeks is strongly advised against." "driving, cooking or shopping is often manageable after a week or two." "most patients begin feeling more normal around the eight-week mark." No weight limit for lifting.',
    },
    {
        id: 'asps-vitenas-2018',
        publisher: 'ASPS website, a post by Paul Vitenas, MD',
        title: 'Five things to consider before getting a tummy tuck',
        authors: 'Paul Vitenas, Jr., MD',
        date: '2018-02-23',
        url: 'https://www.plasticsurgery.org/news/blog/five-things-to-consider-before-getting-a-tummy-tuck',
        attribution:
            'Read on 2026-09-28. A surgeon\'s post. "It is important that you be close to your desired weight for six to twelve months before undergoing a tummy tuck." Drains: "In most cases, the drains are painlessly removed in seven to ten days, however, they may need to stay in place for two weeks or longer." Its "10-15 pounds" is not used: the copy sweep has no unit for pounds.',
    },
    {
        id: 'asps-weiler-2023',
        publisher: 'ASPS website, a post by Jonathan Weiler, MD',
        title: 'Your guide to a tummy tuck – before, during and after',
        authors: 'Jonathan Weiler, MD',
        date: '2023-06-07',
        url: 'https://www.plasticsurgery.org/news/blog/your-guide-to-a-tummy-tuck-before-during-and-after',
        attribution:
            'Read on 2026-09-28. A surgeon\'s post. "For a full tummy tuck, the scar typically extends from hip bone to hip bone and around the navel. A skilled surgeon will make the hip-to-hip incision straight and as low as possible so that underwear or swimsuit bottoms easily conceal the scar." Its "$10,000 and $20,000" cost range is one surgeon\'s estimate and is not used.',
    },
    {
        id: 'asps-rao-2024',
        publisher: 'ASPS website, a post by Samir Rao, MD',
        title: 'Understanding the different types of tummy tucks',
        authors: 'Samir S. Rao, MD',
        date: '2024-07-19',
        url: 'https://www.plasticsurgery.org/news/blog/understanding-the-different-types-of-tummy-tucks',
        attribution:
            'Read on 2026-09-28. A surgeon\'s post, and the only source found that gives time off by type. Standard: "Most patients can return to nonstrenuous work after a couple of weeks, but it takes around three months to fully recover." Mini: "Most people can return to work one to two weeks after surgery." Extended: "about four to six weeks of downtime before returning to work."',
    },
    {
        id: 'cleveland-clinic-tummy-tuck',
        publisher: 'Cleveland Clinic',
        title: 'Tummy Tuck (Abdominoplasty)',
        date: '2024-01-30',
        url: 'https://my.clevelandclinic.org/health/procedures/11017-tummy-tuck',
        attribution:
            'Last updated 01/30/2024, read on 2026-09-28: "a tummy tuck can take anywhere from one to five hours"; "A tummy tuck is usually an outpatient procedure"; "In a mini tummy tuck, there\'s generally no cut around the belly button"; "It could take up to up to three months to see the final result. In addition, the scar will continue to improve further for up to one year"; "postpone strenuous exercise for four to six weeks"; "On average, you\'ll need at least one week off work"; tobacco, as an example, "for at least one month before surgery and for at least two weeks after".',
    },
    {
        id: 'cleveland-clinic-tummy-tuck-scar',
        publisher: 'Cleveland Clinic',
        title: 'Tummy Tuck Scar',
        date: '2022-08-16',
        url: 'https://my.clevelandclinic.org/health/treatments/24004-tummy-tuck-scar',
        attribution:
            'Last updated 08/16/2022, read on 2026-09-28: a full tummy tuck scar "usually spans your abdomen, from hip bone to hip bone, just above your pubic area. You may also have a scar around your belly button"; a mini tummy tuck scar is "about the length of a C-section scar (between 3 inches and 6 inches)"; fleur-de-lis: "A second vertical scar runs from your lower breastbone to your pubic bone"; avoid heavy lifting and strenuous exercise "usually four to eight weeks after the procedure"; sunscreen with SPF 30 "For 12 to 18 months". Its "100 pounds" for fleur-de-lis is not used (no unit for pounds).',
    },
    {
        id: 'winocour-2015',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Abdominoplasty: Risk Factors, Complication Rates, and Safety of Combined Procedures',
        authors: 'Winocour J and colleagues',
        date: '2015',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26505716/',
        attribution:
            'Plast Reconstr Surg 2015;136(5):597e–606e, abstract read in PubMed (26505716) on 2026-09-28. CosmetAssure database, 2008–2013, 25,478 patients: major complications "4.0 percent overall"; "abdominoplasty alone, 3.1 percent; with liposuction, 3.8 percent; breast procedure, 4.3 percent"; of the complications, "31.5 percent were hematomas, 27.2 percent were infections and 20.2 percent were suspected or confirmed venous thromboembolism"; risk factors included "age 55 years or older", "body mass index greater than or equal to 30" and "multiple procedures". Major complications only; the abstract does not define the window.',
    },
    {
        id: 'mittal-2020',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Venous Thromboembolism (VTE) Prophylaxis After Abdominoplasty and Liposuction: A Review of the Literature',
        authors: 'Mittal P and colleagues',
        date: '2020',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31858207/',
        attribution:
            'Aesthetic Plast Surg 2020;44(2):473–482, abstract read in PubMed (31858207) on 2026-09-28: "Abdominoplasty has the highest occurrence of VTE among aesthetic procedures. A higher incidence of VTE was noted when abdominoplasty was combined with liposuction." "Preoperative risk stratification should be performed for all patients." A literature review; it gives no single rate.',
    },
    {
        id: 'xia-2019',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Comparison of Complications Between Lipoabdominoplasty and Traditional Abdominoplasty: A Systematic Review and Meta-Analysis',
        authors: 'Xia Y and colleagues',
        date: '2019',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30511162/',
        attribution:
            'Aesthetic Plast Surg 2019;43(1):167–174, abstract read in PubMed (30511162) on 2026-09-28: "17 trials enrolling 14,061 adult patients … 577 (4.1%) developed seroma". Pooled across mixed study designs.',
    },
    {
        id: 'karunaratne-2023',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Pregnancy After Abdominoplasty: A Systematic Review',
        authors: 'Karunaratne YG and colleagues',
        date: '2023',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37266593/',
        attribution:
            'Aesthetic Plast Surg 2023;47(4):1472–1479, abstract read in PubMed (37266593) on 2026-09-28: "17 studies encompassing 237 patients"; "There were no neonatal or maternal mortalities in any study"; "Pregnancy should not be contraindicated after abdominoplasty." It speaks to safety for mother and baby, not to whether the result lasts.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own figures: the five tummy tuck prices, the liposuction add-on and the combination discount, from its printed price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`). List prices; whether they are before or after the sheet's handwritten \"20% off\" is still open with the owner. State them as Alluring's, not as a society's guidance.",
    },
]

export type TummyTuckFact = ProcedureFact<TummyTuckSourceId>

export const tummyTuckFacts = [
    // ── Price (the practice's price sheet of 2026-09-15) ─────────────────
    {
        id: 'price-mini',
        topic: 'price',
        concepts: ['mini'],
        figures: [{ value: 3000, unit: 'usd' }],
        statement:
            'A mini tummy tuck at Alluring is $3,000. It does not include muscle repair.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Tummy Tuck - Mini (no muscle repair)". Mirrors `pricing.options` and `priceFrom`. Never $3,500 (the old figure) or a weekly figure.',
    },
    {
        id: 'price-extended-mini',
        topic: 'price',
        concepts: ['extended mini'],
        figures: [{ value: 4000, unit: 'usd' }],
        statement:
            'An extended mini tummy tuck at Alluring is $4,000: a hip-to-hip incision, without muscle repair.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Extended Mini (no muscle repair, hip to hip incision)".',
    },
    {
        id: 'price-full',
        topic: 'price',
        concepts: ['full', 'regular'],
        figures: [{ value: 4500, unit: 'usd' }],
        statement:
            'A full tummy tuck at Alluring, the price list\'s "regular", is $4,500, for loose skin that doesn\'t extend to the hips.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Regular (loose skin doesn\'t extend to the hips)". The sheet does not say it includes muscle repair; until the owner confirms, the copy says ASPS\'s "in most cases" and that the surgeon decides at the exam.',
    },
    {
        id: 'price-extended',
        topic: 'price',
        concepts: ['extended'],
        figures: [{ value: 5500, unit: 'usd' }],
        statement:
            'An extended tummy tuck at Alluring is $5,500, with a hip-to-hip incision.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Extended (hip to hip incision)".',
    },
    {
        id: 'price-fleur-de-lis',
        topic: 'price',
        concepts: ['fleur'],
        figures: [{ value: 10000, unit: 'usd' }],
        statement: 'A fleur-de-lis tummy tuck at Alluring is $10,000.',
        sourceIds: ['alluring-practice'],
    },
    {
        id: 'price-lipo-add-on',
        topic: 'price',
        concepts: ['liposuction', 'lipo', 'flank'],
        figures: [{ value: 1500, unit: 'usd' }],
        statement:
            'Liposuction of the abdomen and flanks, added to a tummy tuck, is $1,500.',
        sourceIds: ['alluring-practice'],
        caveat: 'An add-on on the sheet ("Lipo Abdomen/Flanks"), priced on top of another procedure. Whether the page may say most patients add it waits on the owner.',
    },
    {
        id: 'price-combination-discount',
        topic: 'price',
        concepts: ['combin', 'discount', 'procedures'],
        figures: [
            { value: 500, unit: 'usd' },
            { value: 1000, unit: 'usd' },
        ],
        statement:
            'When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet\'s "Combination discounts". Whether an add-on such as liposuction counts as a procedure is an owner question, so the copy never applies the discount to a tummy tuck with the liposuction add-on.',
    },
    {
        id: 'asps-average-fee',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 8174, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of a tummy tuck at $8,174, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-tummy-tuck-cost'],
        caveat: 'A national surgeon-fee average, not a Miami price and not an all-in price: always say what it leaves out. No year.',
    },

    // ── Procedure ────────────────────────────────────────────────────────
    {
        id: 'surgery-1-5-hours',
        topic: 'procedure',
        concepts: ['hour', 'take', 'surgery'],
        figures: [{ min: 1, max: 5, unit: 'hour' }],
        statement:
            'Cleveland Clinic says a tummy tuck can take anywhere from 1 to 5 hours, depending on the result you want.',
        sourceIds: ['cleveland-clinic-tummy-tuck'],
        caveat: "A general range, not Alluring's. How long each type takes at Alluring is an owner question; until then the copy attributes the range and says the surgeon tells you yours.",
    },
    {
        id: 'mini-scar-3-6-inches',
        topic: 'procedure',
        concepts: ['c-section', 'mini', 'scar', 'incision'],
        figures: [{ min: 3, max: 6, unit: 'inch' }],
        statement:
            'Cleveland Clinic says a mini tummy tuck scar is about the length of a C-section scar, 3 to 6 inches.',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar'],
        caveat: 'No source describes the extended mini, and none gives lengths for the other types.',
    },

    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'bent-7-10-days',
        topic: 'recovery',
        concepts: ['bent', 'stand', 'straight', 'upright'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'You walk bent at the waist for 7 to 10 days, to protect the incision, and then stand up straight (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'standing-tall-1-2-weeks',
        topic: 'recovery',
        concepts: ['stand', 'tall', 'upright', 'straight'],
        // "a week or two" reads as 1 week.
        figures: [
            { min: 1, max: 2, unit: 'week' },
            { value: 1, unit: 'week' },
        ],
        statement:
            'ASPS says that within a week or two you should be standing tall.',
        sourceIds: ['asps-tummy-tuck-results'],
    },
    {
        id: 'drains-1-2-weeks',
        topic: 'recovery',
        concepts: ['drain'],
        figures: [
            { min: 1, max: 2, unit: 'week' },
            { min: 7, max: 10, unit: 'day' },
            { value: 2, unit: 'week' },
        ],
        statement:
            'When drains are placed, they come out once the fluid slows, usually in 1 to 2 weeks (Cindy Wu, MD) or 7 to 10 days, sometimes 2 weeks or longer (Paul Vitenas, MD), both on the ASPS website.',
        sourceIds: ['asps-wu-2019', 'asps-vitenas-2018'],
        caveat: 'Whether Alluring uses drains, or a drainless technique, is an owner question. Never say which.',
    },
    {
        id: 'work-about-2-weeks',
        topic: 'recovery',
        concepts: ['work', 'job', 'desk'],
        figures: [
            { value: 2, unit: 'week' },
            { value: 1, unit: 'week' },
        ],
        statement:
            'Most people return to work in about 2 weeks (Cindy Wu, MD, on the ASPS website), and Cleveland Clinic says to plan at least 1 week off.',
        sourceIds: ['asps-wu-2019', 'cleveland-clinic-tummy-tuck'],
    },
    {
        id: 'work-by-type',
        topic: 'recovery',
        concepts: ['work', 'job', 'desk'],
        figures: [
            { min: 1, max: 2, unit: 'week' },
            { min: 4, max: 6, unit: 'week' },
        ],
        statement:
            'After a mini tummy tuck most people return to work in 1 to 2 weeks, after a full tummy tuck to non-strenuous work in a couple of weeks, and after an extended tummy tuck in 4 to 6 weeks (Samir Rao, MD, on the ASPS website).',
        sourceIds: ['asps-rao-2024'],
        caveat: "One surgeon's view, and the only source found that splits time off by type.",
    },
    {
        id: 'recover-3-months',
        topic: 'recovery',
        concepts: ['recover'],
        figures: [{ value: 3, unit: 'month' }],
        statement:
            'A full recovery from a tummy tuck takes around 3 months (Samir Rao, MD, on the ASPS website).',
        sourceIds: ['asps-rao-2024'],
    },
    {
        id: 'walk-day-of-surgery',
        topic: 'recovery',
        concepts: ['walk'],
        figures: [],
        statement:
            'You walk on the day of surgery, which keeps the risk of blood clots in the legs low (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'stay-first-night',
        topic: 'recovery',
        concepts: ['stay', 'night'],
        figures: [{ value: 1, unit: 'night' }],
        statement:
            'Someone should drive you home and stay with you for at least the first night after surgery, ASPS advises.',
        sourceIds: ['asps-tummy-tuck-preparation'],
    },
    {
        id: 'driving-1-2-weeks',
        topic: 'recovery',
        concepts: ['driv', 'cook', 'shop'],
        figures: [{ min: 1, max: 2, unit: 'week' }],
        statement:
            'Driving, cooking and shopping are often manageable after 1 to 2 weeks (Shahram Salemy, MD, on the ASPS website).',
        sourceIds: ['asps-salemy-2019'],
        caveat: 'Not tied to stopping prescription pain medicine; the surgeon clears driving.',
    },
    {
        id: 'children-first-weeks',
        topic: 'recovery',
        concepts: ['child', 'kids', 'toddler', 'baby'],
        figures: [],
        statement:
            'Picking up children is strongly advised against for the first few weeks, so line up help with childcare (Shahram Salemy, MD, on the ASPS website).',
        sourceIds: ['asps-salemy-2019'],
        caveat: 'No source gives a weight limit.',
    },
    {
        id: 'lifting-6-weeks',
        topic: 'recovery',
        concepts: ['lift', 'running', 'run '],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'Running and lifting are avoided for 6 weeks after surgery (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'heavy-lifting-4-8-weeks',
        topic: 'recovery',
        concepts: ['lift', 'exercise', 'strenuous'],
        figures: [{ min: 4, max: 8, unit: 'week' }],
        statement:
            'Cleveland Clinic says heavy lifting, strenuous exercise, sex and stretching wait until your surgeon clears them, usually 4 to 8 weeks after surgery.',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar'],
    },
    {
        id: 'garment-4-6-weeks',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'A compression garment is worn for 4 to 6 weeks after surgery (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'exercise-4-6-weeks',
        topic: 'recovery',
        concepts: ['exercise', 'workout', 'strenuous'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'Cleveland Clinic advises postponing strenuous exercise for 4 to 6 weeks.',
        sourceIds: ['cleveland-clinic-tummy-tuck'],
    },
    {
        id: 'feel-normal-8-weeks',
        topic: 'recovery',
        concepts: ['normal', 'feel'],
        figures: [{ value: 8, unit: 'week' }],
        statement:
            'Most people begin to feel more like themselves around 8 weeks (Shahram Salemy, MD, on the ASPS website).',
        sourceIds: ['asps-salemy-2019'],
    },
    {
        id: 'swelling-3-months',
        topic: 'recovery',
        concepts: ['swell'],
        figures: [{ value: 3, unit: 'month' }],
        statement:
            'Swelling keeps going down until about 3 months after surgery (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },

    // ── Results and the scar ─────────────────────────────────────────────
    {
        id: 'results-3-months',
        topic: 'results',
        concepts: ['result', 'final'],
        figures: [
            { value: 3, unit: 'month' },
            { value: 1, unit: 'year' },
        ],
        statement:
            'Cleveland Clinic says it can take up to 3 months to see the final result, and the scar keeps improving for up to 1 year.',
        sourceIds: ['cleveland-clinic-tummy-tuck'],
    },
    {
        id: 'scar-fades-12-18-months',
        topic: 'results',
        concepts: ['scar'],
        figures: [
            { min: 12, max: 18, unit: 'month' },
            { value: 1, unit: 'year' },
        ],
        statement:
            'The scar becomes thinner and lighter at around 12 to 18 months (Cindy Wu, MD, on the ASPS website); ASPS says it can take several months to a year to fade as much as it will.',
        sourceIds: ['asps-wu-2019', 'asps-tummy-tuck-results'],
    },
    {
        id: 'sunscreen-12-18-months',
        topic: 'results',
        concepts: ['sun', 'spf'],
        figures: [{ min: 12, max: 18, unit: 'month' }],
        statement:
            'Cleveland Clinic advises sunscreen with SPF 30 on the scar for 12 to 18 months if you are in the sun.',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar'],
    },
    {
        id: 'scar-placement',
        topic: 'results',
        concepts: ['scar', 'incision', 'underwear', 'hip'],
        figures: [],
        statement:
            'A full tummy tuck scar usually runs from hip bone to hip bone, just above the pubic area, often with a scar around the belly button (Cleveland Clinic); it is placed as low as possible so underwear or swimsuit bottoms cover it (Jonathan Weiler, MD, on the ASPS website).',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar', 'asps-weiler-2023'],
    },
    {
        id: 'c-section-scar',
        topic: 'results',
        concepts: ['c-section', 'cesarean'],
        figures: [],
        statement:
            'ASPS says that after a C-section, the existing scar may be incorporated into the new one.',
        sourceIds: ['asps-tummy-tuck-results'],
    },
    {
        id: 'stretch-marks',
        topic: 'results',
        concepts: ['stretch mark'],
        figures: [],
        statement:
            'A tummy tuck cannot correct stretch marks, ASPS says, though those on the skin that is removed go with it.',
        sourceIds: ['asps-tummy-tuck'],
    },

    // ── Candidacy ────────────────────────────────────────────────────────
    {
        id: 'stable-weight-6-12-months',
        topic: 'procedure',
        concepts: ['weight'],
        figures: [{ min: 6, max: 12, unit: 'month' }],
        statement:
            'Be close to your goal weight for 6 to 12 months before a tummy tuck (Paul Vitenas, MD, on the ASPS website).',
        sourceIds: ['asps-vitenas-2018', 'asps-tummy-tuck-candidates'],
    },
    {
        id: 'nonsmoker',
        topic: 'procedure',
        concepts: ['smok', 'tobacco', 'nicotine', 'vape'],
        figures: [
            { value: 1, unit: 'month' },
            { value: 2, unit: 'week' },
        ],
        statement:
            'ASPS describes candidates as nonsmokers, and Cleveland Clinic gives, as an example, stopping tobacco for at least 1 month before surgery and 2 weeks after.',
        sourceIds: [
            'asps-tummy-tuck-candidates',
            'cleveland-clinic-tummy-tuck',
        ],
        caveat: "Cleveland Clinic's is an example, not a rule; the surgeon sets yours.",
    },
    {
        id: 'postpone-pregnancy',
        topic: 'procedure',
        concepts: ['pregnan', 'children', 'baby'],
        figures: [],
        statement:
            'ASPS advises women who may want future pregnancies to postpone a tummy tuck.',
        sourceIds: ['asps-tummy-tuck'],
    },
    {
        id: 'pregnancy-after',
        topic: 'safety',
        concepts: ['pregnan', 'baby'],
        years: [2023],
        figures: [
            { value: 17, unit: 'study' },
            { value: 237, unit: 'patient' },
        ],
        statement:
            'A 2023 review of 17 studies and 237 patients who became pregnant after a tummy tuck found no deaths of mothers or babies and concluded that pregnancy should not be ruled out (Karunaratne and colleagues, Aesthetic Plastic Surgery, 2023).',
        sourceIds: ['karunaratne-2023'],
        caveat: 'Safety for mother and baby only. It does not say the result survives a pregnancy; ASPS still advises waiting.',
    },

    // ── Safety ───────────────────────────────────────────────────────────
    {
        id: 'major-complications',
        topic: 'safety',
        concepts: ['complication'],
        years: [2015],
        figures: [
            { value: 25478, unit: 'patient' },
            { value: 3.1, unit: 'percent' },
            { value: 3.8, unit: 'percent' },
        ],
        statement:
            'In an insurance database of 25,478 patients, major complications followed 3.1% of tummy tucks done alone and 3.8% of those combined with liposuction (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015).',
        sourceIds: ['winocour-2015'],
        caveat: 'Major complications only, from 2008–2013 data. Never "3.1% of patients have complications".',
    },
    {
        id: 'complication-types',
        topic: 'safety',
        concepts: ['hematoma', 'infection', 'clot'],
        years: [2015],
        figures: [
            { value: 31.5, unit: 'percent' },
            { value: 27.2, unit: 'percent' },
            { value: 20.2, unit: 'percent' },
        ],
        statement:
            'Of those major complications, 31.5% were hematomas (bleeding under the skin), 27.2% infections and 20.2% suspected or confirmed blood clots (Winocour and colleagues, 2015).',
        sourceIds: ['winocour-2015'],
        caveat: 'Shares of the complications, not of patients.',
    },
    {
        id: 'risk-factors',
        topic: 'safety',
        concepts: ['risk'],
        years: [2015],
        figures: [
            { value: 55, unit: 'age' },
            { value: 30, unit: 'bmi' },
        ],
        statement:
            'The same study found higher risk at age 55 or older, with a BMI of 30 or more, and when several procedures were combined.',
        sourceIds: ['winocour-2015'],
        caveat: "Risk factors, not cutoffs. The practice's own BMI rule is an owner question.",
    },
    {
        id: 'clots-highest-among-cosmetic',
        topic: 'safety',
        concepts: ['clot'],
        years: [2020],
        figures: [],
        statement:
            'A 2020 review found that blood clots occur more often after a tummy tuck than after any other cosmetic surgery, and more often still when liposuction is added (Mittal and colleagues, Aesthetic Plastic Surgery, 2020).',
        sourceIds: ['mittal-2020'],
    },
    {
        id: 'seroma-rate',
        topic: 'safety',
        concepts: ['seroma', 'fluid'],
        years: [2019],
        figures: [
            { value: 14061, unit: 'patient' },
            { value: 4.1, unit: 'percent' },
        ],
        statement:
            'A 2019 review of studies covering 14,061 patients found fluid collecting under the skin, a seroma, in 4.1% (Xia and colleagues, Aesthetic Plastic Surgery, 2019).',
        sourceIds: ['xia-2019'],
        caveat: 'Pooled across mixed study designs.',
    },

    // ── Law ──────────────────────────────────────────────────────────────
    {
        id: 'florida-lipo-with-tummy-tuck-1000cc',
        topic: 'law',
        concepts: ['tummy tuck', 'abdominoplasty', 'liposuction'],
        figures: [{ value: 1000, unit: 'cc' }],
        statement:
            'When liposuction is combined with a tummy tuck in the same office operation, Florida allows at most 1,000 cc of supernatant fat.',
        sourceIds: ['florida-rule-64b8-9-009'],
        caveat: 'The office setting only. Never say where Alluring operates until the owner confirms it.',
    },
    {
        id: 'florida-8-hours',
        topic: 'law',
        concepts: ['office', 'surger'],
        figures: [{ value: 8, unit: 'hour' }],
        statement:
            "In a doctor's office, Florida caps the planned length of all procedures in one cosmetic surgery at 8 hours.",
        sourceIds: ['florida-rule-64b8-9-009'],
    },
    {
        id: 'florida-discharge-24-hours',
        topic: 'law',
        concepts: ['discharge', 'home', 'overnight'],
        figures: [{ value: 24, unit: 'hour' }],
        statement:
            "After cosmetic surgery in a doctor's office, Florida requires that you be discharged within 24 hours of arriving.",
        sourceIds: ['florida-rule-64b8-9-009'],
    },
    {
        id: 'florida-hospital-in-writing',
        topic: 'law',
        concepts: ['hospital', 'writing'],
        figures: [],
        statement:
            'Before office surgery under sedation or general anesthesia, the surgeon must give you, in writing, the name and location of the hospital where they have privileges or a transfer agreement.',
        sourceIds: ['florida-rule-64b8-9-009'],
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
] as const satisfies readonly TummyTuckFact[]

export type TummyTuckFactId = (typeof tummyTuckFacts)[number]['id']

const tummyTuckLookups = createFactLookups(tummyTuckFacts, 'tummy tuck')

export const getTummyTuckFact: (id: TummyTuckFactId) => TummyTuckFact =
    tummyTuckLookups.fact

/** A figure as copy writes it: "$3,000", "7–10 days", "3.1%", "1,000 cc". */
export const formatTummyTuckFigure = formatProcedureFigure

/** The first (or `index`th) figure of a fact, formatted. */
export const tummyTuckFigure: (id: TummyTuckFactId, index?: number) => string =
    tummyTuckLookups.figure
