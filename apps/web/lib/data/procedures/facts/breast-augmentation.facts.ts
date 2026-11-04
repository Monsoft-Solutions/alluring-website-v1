/**
 * Breast augmentation facts: every figure the breast augmentation page is
 * allowed to publish, stated once.
 *
 * The page module reads its figures from here, and
 * `scripts/check-procedure-copy.ts --slug breast-augmentation-miami` fails
 * any copy on the built page that states a %, cc, $, hour, day, night, week,
 * month, year, age or count figure that is not declared below, or states a
 * declared figure in a sentence about something else.
 *
 * Every source was read from its own text: first on 2026-09-28 for the
 * wave-two brief, then on 2026-09-30, and each quote used here was checked
 * again on the live page on 2026-11-03 as an exact match against the fetched
 * text (the FDA pages and the FDA's labeling guidance PDF, ASPS, The Aesthetic
 * Society, Cleveland Clinic, the American Cancer Society, Sientra's patient
 * brochure, and the PubMed abstracts through NCBI's E-utilities). Each fact carries the attribution the copy must use
 * and, in `caveat`, what the source does not say. The practice's own
 * figures come from its printed price sheet of 2026-09-15
 * (`docs/pricing/practice-price-list.md`) and are stated as Alluring's,
 * never as a society's guidance.
 *
 * The manufacturers' 10-year core studies describe their own implants, and
 * each was sponsored by the manufacturer. The copy names the maker every
 * time and never presents a study's rate as Alluring's.
 *
 * Not here, because only the practice can answer them (the Gate 1 brief's
 * owner questions): which implants Dr. Karlinsky uses (maker, smooth or
 * textured), her usual placement and incision, how sizes are tried on,
 * what the price includes and whether the implants are in it, where
 * surgery is done, the age policy, fat transfer on its own, any warranty,
 * the practice's own reoperation rate and how many nights to stay in Miami.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    createFactLookups,
    formatProcedureFigure,
    type ProcedureFact,
    type ProcedureSource,
} from './procedure-facts'

export type BreastAugmentationSourceId =
    | 'fda-implant-types'
    | 'fda-things-to-consider'
    | 'fda-what-to-know'
    | 'fda-risks'
    | 'fda-implant-surgery'
    | 'fda-labeling-guidance'
    | 'fda-bia-alcl-reports'
    | 'fda-bia-alcl-questions'
    | 'fda-mammography'
    | 'asps-breast-augmentation'
    | 'asps-breast-augmentation-cost'
    | 'asps-breast-augmentation-implants'
    | 'asps-breast-augmentation-procedure'
    | 'asps-breast-augmentation-recovery'
    | 'asps-breast-augmentation-results'
    | 'asps-bia-alcl'
    | 'asps-statistics-2025'
    | 'tas-breast-augmentation-recovery'
    | 'tas-breast-augmentation-procedure'
    | 'cleveland-clinic-breast-augmentation'
    | 'acs-mammograms-with-implants'
    | 'sientra-brochure'
    | 'caplin-2021'
    | 'spear-2014'
    | 'chen-2023'
    | 'asps-breast-augmentation-candidates'
    | 'asps-breast-augmentation-safety'
    | 'asps-breast-reduction'
    | 'asps-article-drop-fluff'
    | 'asps-article-back-to-active'
    | 'asps-article-exercise'
    | 'utah-health-recovery'
    | 'uw-medicine-augmentation'
    | 'asps-article-beach-season'
    | 'medlineplus-cosmetic-breast-discharge'
    | 'alluring-practice'

export type BreastAugmentationSource =
    ProcedureSource<BreastAugmentationSourceId>

export const breastAugmentationSources: readonly BreastAugmentationSource[] = [
    {
        id: 'fda-implant-types',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Types of Breast Implants',
        date: '2019-10-23',
        url: 'https://www.fda.gov/medical-devices/breast-implants/types-breast-implants',
        attribution:
            'Content current as of 10/23/2019, read on 2026-11-03: "The FDA approved saline-filled breast implants for breast augmentation in women age 18 or older and for breast reconstruction in women of any age." "Silicone gel-filled breast implants are approved for breast augmentation in women age 22 or older and for breast reconstruction in women of any age." The FDA\'s ages, not the practice\'s policy, which is an owner question.',
    },
    {
        id: 'fda-things-to-consider',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Things to Consider Before Getting Breast Implants',
        date: '2023-03-08',
        url: 'https://www.fda.gov/medical-devices/breast-implants/things-consider-getting-breast-implants',
        attribution:
            'Content current as of 03/08/2023, read on 2026-11-03. On October 27, 2021 the FDA approved new labeling for all legally marketed breast implants with a "Boxed warning", a "Patient decision checklist, which must be reviewed with the prospective patient by the health care provider … The patient must be given the opportunity to initial and sign the patient decision checklist and it must be signed by the physician implanting the device", updated rupture screening recommendations and a "Patient device card". Also: "Breast implants are not lifetime devices"; "BIA-ALCL is not breast cancer"; "Although treatable, there is a risk of death for patients diagnosed with BIA-ALCL." It sets no waiting period between consultation and surgery.',
    },
    {
        id: 'fda-what-to-know',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'What to Know About Breast Implants',
        date: '2025-01-31',
        url: 'https://www.fda.gov/consumers/consumer-updates/what-know-about-breast-implants',
        attribution:
            'Content current as of 01/31/2025, read on 2026-11-03: "The life of breast implants varies by person and cannot be predicted." "The FDA restricts the sale and distribution of breast implants to only health care providers and facilities that provide information to patients using the patient decision checklist." The device card carries "the serial or lot number and the style and size". "Many patients have additional operations to change implant size. To achieve the best results after the first procedure, careful planning and reasonable expectations are necessary." It gives no replacement interval.',
    },
    {
        id: 'fda-risks',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Risks and Complications of Breast Implants',
        date: '2023-12-15',
        url: 'https://www.fda.gov/medical-devices/breast-implants/risks-and-complications-breast-implants',
        attribution:
            'Content current as of 12/15/2023, read on 2026-11-03: most silicone ruptures "are without symptoms, known as "silent ruptures""; "An ultrasound is an acceptable alternative imaging for screening for rupture for asymptomatic patients"; a ruptured saline implant "deflates"; "Grades III and IV capsular contracture are considered severe and may require reoperation"; causes of rupture include "Placement through a non-FDA approved incision site, for example the belly button"; "Symptoms such as fatigue, memory loss, rash, "brain fog," and joint pain may be associated with breast implants … These symptoms and what causes them are poorly understood. In some cases, removal of the breast implants without replacement is reported to reverse symptoms"; "Some women who undergo breast augmentation can successfully breastfeed and some cannot." This page gives no incidence figure for breast implant illness.',
    },
    {
        id: 'fda-implant-surgery',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Breast Implant Surgery',
        date: '2023-03-08',
        url: 'https://www.fda.gov/medical-devices/breast-implants/breast-implant-surgery',
        attribution:
            'Content current as of 03/08/2023, read on 2026-11-03: "Most women receive general anesthesia for this surgery. Breast implant surgery can last from one to several hours depending on the procedure and personal circumstances." Patients have "the right to request" the implant\'s patient labeling, and receive "a patient device card after your surgery". Its questions for a surgeon include "What is your reoperation rate?" The time covers all implant surgery, reconstruction included; how long it takes at Alluring is an owner question.',
    },
    {
        id: 'fda-labeling-guidance',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Breast Implants - Certain Labeling Recommendations to Improve Patient Communication',
        date: '2020-09-29',
        url: 'https://www.fda.gov/media/131885/download',
        attribution:
            'Guidance issued September 29, 2020, read on 2026-11-03 from the PDF. Silicone implants: "For asymptomatic patients, the first ultrasound or magnetic resonance imaging (MRI) should be performed at 5-6 years postoperatively, then every 2-3 years thereafter." "Saline-filled breast implants do not have screening recommendations as rupture is detectable without screening." The example checklist (Appendix B): "As many as 20 percent of women who receive breast implants for augmentation have to have their implants removed within 8 to 10 years, but my implants may last for a shorter or longer time." The example boxed warning (Appendix A): not lifetime devices; BIA-ALCL "occurs more commonly in patients with textured breast implants than smooth implants, although rates are not well defined. Some patients have died from BIA-ALCL"; systemic symptoms whose individual risk "has not been well established". Nonbinding example text; each maker\'s checklist carries its own figures (Sientra\'s brochure carries the same boxed warning).',
    },
    {
        id: 'fda-bia-alcl-reports',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Medical Device Reports of Breast Implant-Associated Anaplastic Large Cell Lymphoma',
        date: '2025-02-06',
        url: 'https://www.fda.gov/medical-devices/breast-implants/medical-device-reports-breast-implant-associated-anaplastic-large-cell-lymphoma',
        attribution:
            'Content current as of 02/06/2025, read on 2026-11-03. Table 2, cases reported worldwide as of June 30, 2024: implant surface textured 73%, smooth 3%, not specified 24%; of the smooth cases, one has "a history of one smooth implant and no known textured implant". Median time from the last implant to diagnosis 8 years. "The incidence, prevalence, or cause of an event cannot be determined from this reporting system alone" Reports, not a rate.',
    },
    {
        id: 'fda-bia-alcl-questions',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Questions and Answers about Breast Implant-Associated Anaplastic Large Cell Lymphoma (BIA-ALCL)',
        date: '2019-10-23',
        url: 'https://www.fda.gov/medical-devices/breast-implants/questions-and-answers-about-breast-implant-associated-anaplastic-large-cell-lymphoma-bia-alcl',
        attribution:
            'Content current as of 10/23/2019, read on 2026-11-03: BIA-ALCL "is not breast cancer - it is a type of non-Hodgkin\'s lymphoma (cancer of the immune system)"; "An individual\'s risk of developing BIA-ALCL is considered to be low"; "the type of implant fill does not appear to be a risk factor for BIA-ALCL, but this has not been evaluated in a large, well-designed, epidemiologic study"; "We are not recommending the routine removal of these or other types of breast implants in patients who have no symptoms."',
    },
    {
        id: 'fda-mammography',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Breast Implant Adverse Events during Mammography',
        date: '2018-01-18',
        url: 'https://www.fda.gov/medical-devices/breast-implants/breast-implant-adverse-events-during-mammography',
        attribution:
            'Content current as of 01/18/2018, read on 2026-11-03. Its literature review found "between 22% and 83% of mammographically visualizable breast tissue obscured by breast implants" and "a delay in breast cancer detection in women with implants, but without increased mortality". "The risk for breast cancer does not differ in women with breast implants compared to other women." An older review (the study it reports is from 2004).',
    },
    {
        id: 'asps-breast-augmentation',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast Augmentation',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation',
        attribution:
            'Read on 2026-11-03: breast augmentation, "sometimes referred to as a "breast aug" or "boob job" by patients, involves using breast implants or fat transfer to increase the size of your breasts. This procedure can also restore breast volume lost after weight reduction or pregnancy, achieve a more rounded breast shape or improve natural breast size asymmetry." "Breast augmentation does not correct severely drooping breasts. A breast lift may be required … Breast lifting can often be done at the same time as your augmentation or may require a separate operation."',
    },
    {
        id: 'asps-breast-augmentation-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does breast augmentation cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/cost',
        attribution:
            'Read on 2026-11-03: "The average cost of breast augmentation with implants is $4,875 … This average cost is only part of the total price – it does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans will not cover cosmetic breast augmentation costs, related complications or another surgery to revise the appearance of your breasts." The page gives no year, so neither does the copy.',
    },
    {
        id: 'asps-breast-augmentation-implants',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What types of breast implants are available?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/implants',
        attribution:
            'Read on 2026-11-03. Saline: "filled with sterile salt water. Should the implant shell leak, a saline implant will collapse and the saline will be absorbed and naturally expelled by the body"; they "provide a uniform shape, firmness and feel". Silicone: "The gel feels a bit more like natural breast tissue. If the implant leaks, the gel may remain within the implant shell, or may escape into the breast implant pocket. A leaking implant filled with silicone gel will not collapse." Smooth implants "may have some palpable or visible rippling"; BIA-ALCL "occurs most frequently in patients who have breast implants with textured surfaces".',
    },
    {
        id: 'asps-breast-augmentation-procedure',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What are the steps of a breast augmentation procedure?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/procedure',
        attribution:
            'Read on 2026-11-03: incisions "along the areolar edge (peri-areolar incision), the fold under the breast (inframammary fold) and in the armpit (axillary incision). A belly-button approach is associated with a higher complication rate." The implant goes "Under the pectoral muscle (a submuscular placement)" or "Directly behind the breast tissue, over the pectoral muscle (a submammary/ subglandular placement)", depending on "the type of implant, degree of enlargement desired, your body type and your surgeon\'s recommendations". "Incisions are closed with layered sutures in the breast tissue and with sutures, skin adhesive or surgical tape to close the skin."',
    },
    {
        id: 'asps-breast-augmentation-recovery',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What should I expect during my breast augmentation recovery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/recovery',
        attribution:
            'Read on 2026-11-03: "You may be permitted to go home when you are stable for discharge, typically after an hour or so." "Wear your support garment (a bra or elastic band, called a bandeau) around the clock as instructed by your plastic surgeon." "Acute pain typically subsides after one to five days, but you may experience soreness and swelling for a few weeks." No number of weeks for the garment.',
    },
    {
        id: 'asps-breast-augmentation-results',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What results should I expect after breast augmentation surgery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/results',
        attribution:
            'Read on 2026-11-03: "the final results may take a few weeks as the swelling subsides and the skin stretches." "Incision lines may take several months, even a couple of years, to fade." This page gives no figure for "drop and fluff". An article on the ASPS website (Mariotti, 2022) gives three to six months; see SOURCE-BANK.',
    },
    {
        id: 'asps-bia-alcl',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast Implant-Associated Anaplastic Large Cell Lymphoma (BIA-ALCL) Disease Summary',
        url: 'https://www.plasticsurgery.org/patient-safety/breast-implant-safety/bia-alcl-summary',
        attribution:
            'Read on 2026-11-03: symptoms typically develop "at least more than one year after receiving an implant, and on average after 8 to 10 years". "To date, there are not any confirmed BIA-ALCL cases that involve only a smooth implant." Its lifetime risk figure is for textured implants only and is stated as a ratio, which the copy does not use.',
    },
    {
        id: 'asps-statistics-2025',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: '2025 Procedural Statistics Release',
        url: 'https://www.plasticsurgery.org/documents/news/statistics/2025/plastic-surgery-statistics-report-2025.pdf',
        attribution:
            'Read on 2026-11-03 from the PDF: "The majority of respondents, ranked implants in the 300-to-400-cc range among those they used most frequently, while 200-to-300-cc implants ranked second." "36 percent of ASPS Member Surgeons indicated patients trended toward smaller implant sizes than in previous years. By comparison, just 12 percent reported a shift toward larger implants." A survey of member surgeons, not of patients, and no cup-size conversion. Procedure counts in the same report (cosmetic surgery table, 2025 vs 2024): breast augmentation, "implant placement for both primary and/or revisions", 304,234 vs 273,302; breast implant removals, augmentation patients only, 45,773 vs 45,780; breast lift 156,131 vs 144,003.',
    },
    {
        id: 'tas-breast-augmentation-recovery',
        publisher: 'The Aesthetic Society',
        title: 'Breast Augmentation - Aftercare & Recovery',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-augmentation/aftercare-recovery',
        attribution:
            'Read on 2026-11-03: "It typically takes one to two weeks to recover from a breast augmentation." "You may be able to return to work within a few days to a week, depending on the nature of your job." "Most residual swelling will resolve within a month." Sleep on your back in an inclined position "for the initial postoperative days". "If you have external sutures, your surgeon will remove them in about a week." "Avoid sexual activity for a minimum of two weeks." "be extremely gentle with your breasts for at least the next month". Its sleeping angle is in degrees, a unit the copy does not state.',
    },
    {
        id: 'tas-breast-augmentation-procedure',
        publisher: 'The Aesthetic Society',
        title: 'Breast Augmentation - Detailed Procedure Information',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-augmentation/detailed-procedure-information',
        attribution:
            'Read on 2026-11-03. Under the pectoral muscle: "This placement may interfere less with mammograms and breast-feeding. However, the implant may move when you flex your chest muscles." On top of it: "This placement may interfere with mammograms and breast-feeding. However, the implant should stay in place when you flex your chest muscles." Fat transfer: "If you don\'t have enough fat available, this may not be an option for you. Not all the fat transferred survives the grafting process, and in some cases, your surgeon may need to repeat the surgery"',
    },
    {
        id: 'cleveland-clinic-breast-augmentation',
        publisher: 'Cleveland Clinic',
        title: 'Breast Augmentation',
        date: '2021-08-24',
        url: 'https://my.clevelandclinic.org/health/treatments/11024-breast-augmentation',
        attribution:
            'The page shows "Last updated on 08/24/2021" (its metadata says modified 2026-06-29), read on 2026-11-03: "have someone stay with you the first night at least. You will need to take at least three days off from work … If you have a labor-intensive job, you will likely need to take off at least three weeks of work." "You should not do any heavy lifting for at least four weeks. If you are physically active in sports, it may take up to six weeks before you can return to those activities." "On average, full recovery takes about six to eight weeks." "Breast implants that are placed below your muscle usually affect milk production less than implants that are above your muscle." No weight limit for lifting.',
    },
    {
        id: 'acs-mammograms-with-implants',
        publisher: 'American Cancer Society',
        title: 'Mammograms with Breast Implants',
        date: '2026-07-23',
        url: 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/mammograms/mammograms-for-women-with-breast-implants.html',
        attribution:
            'Last revised July 23, 2026, read on 2026-11-03: "If you have breast implants, you should still get regular screening mammograms as recommended". Women with implants have extra "implant displacement (ID) views"; "ID views are easier if the implants were placed underneath (behind) the chest muscles." "Very rarely, the mammogram process can rupture an implant." Its count of extra pictures is not used: the copy sweep has no unit for pictures.',
    },
    {
        id: 'sientra-brochure',
        publisher: 'Sientra (patient labeling)',
        title: 'Breast Augmentation with Sientra Silicone Gel Breast Implants, patient educational brochure',
        date: '2023-01-03',
        url: 'https://sientra.com/wp-content/uploads/2025/11/MDC-0010-R6-Sientra-Patient-Educational-Brochure-Augmentation-1.pdf',
        attribution:
            'Revision date January 3, 2023 (MDC-0010 R6), read on 2026-11-03 from the PDF. Sientra\'s 10-year core study, primary augmentation: "the 10-year risk of reoperation is 24% for primary augmentation patients"; "the most common reason for implant removal was the patient requesting a different implant size or style", Style/Size Change "139 (49.1%)" of the implants removed through 10 years; "a 13% risk of experiencing Baker Grade III or IV capsular contracture". One maker\'s implants, its own study.',
    },
    {
        id: 'caplin-2021',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'MemoryGel Breast Implants: Final Safety and Efficacy Results after 10 Years of Follow-Up',
        authors: 'Caplin DA and colleagues',
        date: '2021',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33620918/',
        attribution:
            'Plast Reconstr Surg 2021;147(3):556–566, abstract read through PubMed (33620918) on 2026-11-03. Mentor\'s core study, Kaplan-Meier 10-year rates for primary augmentation: Baker grade III/IV capsular contracture "12.1 percent"; "For any reoperation … primary augmentation, 25.5 percent". Sponsored by Mentor; smooth and textured MemoryGel implants.',
    },
    {
        id: 'spear-2014',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Natrelle round silicone breast implants: Core Study results at 10 years',
        authors: 'Spear SL and Murphy DK',
        date: '2014',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24867717/',
        attribution:
            'Plast Reconstr Surg 2014;133(6):1354–1361, abstract read through PubMed (24867717) on 2026-11-03: "Among augmentation subjects, capsular contracture was significantly lower (p = 0.023) for submuscular (15.7 percent) versus subglandular (26.3 percent) placement." "By the end of the study, 81.8 percent of augmentation subjects still had an original implant in place." Allergan designed and funded it; the implants included textured ones since withdrawn. The abstract does not grade the contracture.',
    },
    {
        id: 'chen-2023',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Breastfeeding Outcome and Complications in Females With Breast Implants: A Systematic Review and Meta-Analysis',
        authors: 'Chen J and colleagues',
        date: '2023',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36752943/',
        attribution:
            'Aesthet Surg J 2023;43(7):731–740, abstract read through PubMed (36752943) on 2026-11-03: "Eleven studies … A total of 8197 out of 9965 (82.25%) patients were successfully able to breastfeed after breast implants. Of 5 studies that included a control group, 343,793 of 388,695 (88.45%) women without breast implants successfully breastfed." Observational studies; the copy rounds to "about 82%" and "about 88%".',
    },
    {
        id: 'asps-breast-augmentation-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Who is a good candidate for breast augmentation?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/candidates',
        attribution:
            'Read on 2026-11-03: "You are physically healthy and you aren\'t pregnant or breastfeeding"; "You have realistic expectations"; "Your breasts are fully developed"; "You are bothered by the feeling that your breasts are too small"; "You are dissatisfied with your breasts losing shape and volume after pregnancy, weight loss or with aging"; "Your breasts are asymmetrical". It sets no age.',
    },
    {
        id: 'asps-breast-augmentation-safety',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What are the risks of breast augmentation?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/safety',
        attribution:
            'Read on 2026-11-03, exact match against the fetched text: "FDA-approved breast implants undergo extensive testing to demonstrate reasonable assurance of safety and effectiveness." "The vast majority of people with breast implants experience no serious complications."',
    },
    {
        id: 'asps-breast-reduction',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast Reduction',
        url: 'https://www.plasticsurgery.org/reconstructive-procedures/breast-reduction',
        attribution:
            'Read on 2026-11-03, exact match against the fetched text: "Breast reduction surgery entails the removal of skin and tissue from the breast, followed by reshaping and elevating to create a smaller, more proportionate bust size." "Women almost always report that having smaller breasts significantly reduces back pain".',
    },
    {
        id: 'asps-article-drop-fluff',
        publisher: 'ASPS website, article by Eric R. Mariotti, MD',
        title: 'What does "drop and fluff" mean after breast augmentation?',
        date: '2022-07-05',
        url: 'https://www.plasticsurgery.org/news/blog/what-does-drop-and-fluff-mean-after-breast-augmentation',
        attribution:
            'Read on 2026-11-03: "The entire drop and fluff process can take three to six months to complete". A bylined article, not a society statement: write "an article on the ASPS website".',
    },
    {
        id: 'asps-article-back-to-active',
        publisher: 'ASPS website, article by Ariel Frankeny',
        title: 'Back to active: Returning to exercise after breast augmentation recovery',
        date: '2023-05-16',
        url: 'https://www.plasticsurgery.org/news/articles/back-to-active-returning-to-exercise-after-breast-augmentation-recovery',
        attribution:
            'Read on 2026-11-03: "Following the first 7-10 days of recovery, many women can safely and comfortably drive and head back to the office for work." "However, strenuous activities and upper body movements should still be avoided for at least six weeks." A freelance article: write "an article on the ASPS website".',
    },
    {
        id: 'asps-article-exercise',
        publisher: 'ASPS website, article by Catherine Huang-Begovic, MD',
        title: 'Exercise after breast augmentation',
        date: '2017-08-01',
        url: 'https://www.plasticsurgery.org/news/blog/exercise-after-breast-augmentation',
        attribution:
            'Read on 2026-11-03: "At six weeks, patients are generally completely healed and can resume all exercises." "After breast augmentation, especially with implants under the muscle, I recommend patients try to avoid strenuous chest exercise such as push ups." A bylined article: write "an article on the ASPS website".',
    },
    {
        id: 'utah-health-recovery',
        publisher: 'University of Utah Health',
        title: 'Recovering from Breast Reduction & Breast Augmentation',
        url: 'https://healthcare.utah.edu/plastic-surgery/breast/recovery',
        attribution:
            'Undated, read on 2026-11-03: "Most people are ready to drive and return to work within one week." "You will wear a surgical bra for three to four weeks after your surgery." "You will begin to notice your final results around three months after surgery. However, you may continue to have subtle changes throughout the 12 months following your surgery." "Do not soak in a bathtub, pool, or hot tub until your incisions heal or your surgeon says it\'s okay."',
    },
    {
        id: 'uw-medicine-augmentation',
        publisher: 'UW Medicine, University of Washington Medical Center',
        title: 'Breast Augmentation: What to expect and how to prepare',
        url: 'https://healthonline.washington.edu/document/health_online/pdf/Breast-Augmentation.pdf',
        attribution:
            'Clinician review 04/2017, read on 2026-11-03 from the PDF: "Sleep on your back for the first 3 to 4 weeks, whether or not you are wearing a surgical bra. After that, you may sleep on your side or stomach." "If you are given one, keep it on 24 hours a day for 3 to 4 weeks." "Do not take a bath, sit in a hot tub, or go swimming until your incisions are fully healed." Write "a UW Medicine patient handout".',
    },
    {
        id: 'asps-article-beach-season',
        publisher: 'ASPS website, article by Cindy Wu, MD',
        title: "Considering breast augmentation for beach season? Here's when you should plan your surgery",
        date: '2019-05-17',
        url: 'https://www.plasticsurgery.org/news/blog/considering-breast-augmentation-for-beach-season-heres-when-you-should-plan-your-surgery',
        attribution:
            'Read on 2026-11-03: "If you are planning to swim, make sure to plan to have your surgery at least a month in advance of your vacation, as most surgeons will want you to wait that long before immersing in a pool or ocean." A bylined article: write "an article on the ASPS website".',
    },
    {
        id: 'medlineplus-cosmetic-breast-discharge',
        publisher: 'MedlinePlus (U.S. National Library of Medicine)',
        title: 'Cosmetic breast surgery - discharge',
        date: '2025-02-17',
        url: 'https://medlineplus.gov/ency/patientinstructions/000273.htm',
        attribution:
            'Review date 2/17/2025, read on 2026-11-03: "Do not drive for at least 2 weeks." "Once you no longer need dressings, wear a soft, wireless, supportive bra night and day for 2 to 4 weeks." It covers cosmetic breast surgery in general, lifts and reductions included, so the copy says so.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own figures: breast augmentation with saline implants $3,500 and with silicone implants $4,500, the implant exchange at the same two prices, and the combination discount, from its printed price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`). List prices; whether they are before or after the sheet's handwritten \"20% off\", and whether the implants are in the price, are still open with the owner. State them as Alluring's, not as a society's guidance.",
    },
]

export type BreastAugmentationFact = ProcedureFact<BreastAugmentationSourceId>

export const breastAugmentationFacts = [
    // ── Price (the practice's price sheet of 2026-09-15) ─────────────────
    {
        id: 'price-saline',
        topic: 'price',
        concepts: ['saline', 'implants from'],
        figures: [{ value: 3500, unit: 'usd' }],
        statement:
            'At Alluring, breast augmentation with saline implants is $3,500.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Augmentation - Saline". Mirrors `pricing.options`, `priceFrom` and the title. Whether the implants are in the price is an owner question. Never a weekly figure.',
    },
    {
        id: 'price-silicone',
        topic: 'price',
        concepts: ['silicone'],
        figures: [{ value: 4500, unit: 'usd' }],
        statement:
            'At Alluring, breast augmentation with silicone implants is $4,500.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Augmentation - Silicone".',
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
        caveat: 'The sheet\'s "Combination discounts". A breast lift with implants is priced as its own procedure on the breast lift page, not here.',
    },
    {
        id: 'asps-average-fee',
        topic: 'price',
        concepts: ['average'],
        figures: [{ value: 4875, unit: 'usd' }],
        statement:
            'The American Society of Plastic Surgeons puts the average cost of breast augmentation with implants at $4,875, which it says is only part of the total price: it does not include anesthesia, operating room facilities or other related expenses.',
        sourceIds: ['asps-breast-augmentation-cost'],
        caveat: "Not a Miami price and not an all-in price: always say what it leaves out. The page does not call this figure a surgeon's fee or say it is national. No year.",
    },

    // ── What it is, and the FDA's rules ──────────────────────────────────
    {
        id: 'definition',
        topic: 'procedure',
        concepts: ['augmentation'],
        figures: [],
        statement:
            'Breast augmentation, also called a boob job, increases the size of the breasts with implants or fat transfer, ASPS says, and can restore volume lost after pregnancy or weight loss or improve uneven breasts. It does not correct severely drooping breasts; a breast lift does.',
        sourceIds: ['asps-breast-augmentation'],
    },
    {
        id: 'fda-ages',
        topic: 'procedure',
        concepts: ['age', 'older', 'saline', 'silicone'],
        figures: [
            { value: 18, unit: 'age' },
            { value: 22, unit: 'age' },
        ],
        statement:
            'The FDA approved saline implants for breast augmentation in women age 18 or older, and silicone gel implants in women age 22 or older; for reconstruction, both at any age.',
        sourceIds: ['fda-implant-types'],
        caveat: "The FDA's approval, not the practice's age policy, which is an owner question.",
    },
    {
        id: 'fda-checklist',
        topic: 'law',
        concepts: ['checklist'],
        figures: [],
        statement:
            'Before surgery, your provider must review the FDA-required patient decision checklist with you; you initial and sign it, and the surgeon who places the implants signs it too.',
        sourceIds: ['fda-things-to-consider', 'fda-what-to-know'],
        caveat: 'The FDA sets no waiting period between the consultation and surgery.',
    },
    {
        id: 'not-a-candidate',
        topic: 'procedure',
        concepts: ['pregnan', 'nursing', 'breastfeeding', 'candidate'],
        figures: [],
        statement:
            "The FDA's example patient checklist says you are not a candidate for breast implants while you have an active infection, an untreated cancer or pre-cancer of the breast, or are pregnant or nursing.",
        sourceIds: ['fda-labeling-guidance'],
        caveat: "Example text; the practice's own candidacy rules are an owner question.",
    },
    {
        id: 'fda-restricted-sale',
        topic: 'law',
        concepts: ['sale', 'sold'],
        figures: [],
        statement:
            'The FDA restricts the sale of breast implants to providers and facilities that give patients this information through the patient decision checklist.',
        sourceIds: ['fda-what-to-know'],
    },
    {
        id: 'fda-boxed-warning',
        topic: 'law',
        concepts: ['warning'],
        figures: [],
        statement:
            "Every implant's labeling carries a boxed warning: implants are not lifetime devices, and complications can mean more surgery; BIA-ALCL, a cancer of the immune system, is more common with textured implants than smooth ones, and some patients have died from it; and some patients report systemic symptoms whose individual risk is not well established.",
        sourceIds: ['fda-things-to-consider', 'fda-labeling-guidance'],
        caveat: "The wording is the FDA's example (Appendix A of its guidance); each maker's labeling carries its own, and Sientra's matches it.",
    },
    {
        id: 'fda-device-card',
        topic: 'law',
        concepts: ['card'],
        figures: [],
        statement:
            "After surgery you receive a device card with your implant's style, size and serial or lot number, and before surgery you have the right to ask for the implant's patient labeling.",
        sourceIds: ['fda-what-to-know', 'fda-implant-surgery'],
    },

    // ── The next ten years ───────────────────────────────────────────────
    {
        id: 'not-lifetime',
        topic: 'safety',
        concepts: ['lifetime', 'predict'],
        figures: [],
        statement:
            'The FDA says breast implants are not lifetime devices, and that the life of breast implants varies by person and cannot be predicted.',
        sourceIds: ['fda-things-to-consider', 'fda-what-to-know'],
    },
    {
        id: 'no-replacement-date',
        topic: 'safety',
        concepts: ['replace'],
        figures: [{ value: 10, unit: 'year' }],
        statement:
            'Implants do not have to be replaced every 10 years: the FDA gives no replacement date and says the life of an implant cannot be predicted.',
        sourceIds: ['fda-what-to-know'],
        caveat: 'The FDA gives no interval at all; the 10 years is the myth being answered, not a source figure.',
    },
    {
        id: 'removed-within-8-10-years',
        topic: 'safety',
        concepts: ['removed', 'remov'],
        figures: [
            { value: 20, unit: 'percent' },
            { min: 8, max: 10, unit: 'year' },
        ],
        statement:
            "The FDA's example patient checklist says as many as 20% of women who get implants for augmentation have them removed within 8 to 10 years, and that yours may last a shorter or longer time.",
        sourceIds: ['fda-labeling-guidance'],
        caveat: 'Example text in the FDA\'s guidance, whose rates it says "are provided for illustrative purposes only"; each maker\'s checklist has its own figure. Always say "example checklist", never "the FDA says 20%".',
    },
    {
        id: 'silicone-screening',
        topic: 'safety',
        concepts: ['scan', 'ultrasound', 'mri', 'screen'],
        figures: [
            { min: 5, max: 6, unit: 'year' },
            { min: 2, max: 3, unit: 'year' },
        ],
        statement:
            'For silicone implants with no symptoms, the FDA recommends a first ultrasound or MRI 5 to 6 years after surgery, then every 2 to 3 years, because most silicone ruptures are silent.',
        sourceIds: ['fda-labeling-guidance', 'fda-risks'],
        caveat: 'Silicone only. Saline implants have no screening recommendation, because a saline rupture shows. The FDA says the scans may not be covered by insurance.',
    },
    {
        id: 'saline-no-screening',
        topic: 'safety',
        concepts: ['saline'],
        figures: [],
        statement:
            'Saline implants have no screening recommendation, because a rupture is noticeable without one: the implant deflates and the saline is absorbed by the body.',
        sourceIds: [
            'fda-labeling-guidance',
            'asps-breast-augmentation-implants',
        ],
    },
    {
        id: 'sientra-reoperation',
        topic: 'safety',
        concepts: ['operation'],
        figures: [
            { value: 24, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, 24% of women who had a first breast augmentation had another operation within 10 years.",
        sourceIds: ['sientra-brochure'],
        caveat: "One maker's implants and its own study. Never present it as Alluring's rate; the practice's own rate is an owner question.",
    },
    {
        id: 'size-change-reason',
        topic: 'safety',
        concepts: ['size', 'style'],
        figures: [
            { value: 49.1, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, the most common reason implants were removed after a first breast augmentation was the patient asking for a different size or style: 49.1% of the implants removed within 10 years.",
        sourceIds: ['sientra-brochure'],
        caveat: 'A share of the implants removed, not of patients.',
    },
    {
        id: 'mentor-ten-year',
        topic: 'safety',
        concepts: ['contracture', 'operation'],
        figures: [
            { value: 12.1, unit: 'percent' },
            { value: 25.5, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Mentor's study of its MemoryGel implants, 12.1% of women who had a first breast augmentation developed severe capsular contracture (Baker grade III or IV) within 10 years, and 25.5% had another operation (Caplin and colleagues, Plastic and Reconstructive Surgery, 2021).",
        sourceIds: ['caplin-2021'],
        years: [2021],
        caveat: 'Sponsored by Mentor; Kaplan-Meier estimates for smooth and textured MemoryGel implants.',
    },
    {
        id: 'natrelle-original-implant',
        topic: 'safety',
        concepts: ['original'],
        figures: [
            { value: 81.8, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Allergan's study of Natrelle round silicone implants, 81.8% of women who had a breast augmentation still had an original implant after 10 years (Spear and Murphy, Plastic and Reconstructive Surgery, 2014).",
        sourceIds: ['spear-2014'],
        years: [2014],
        caveat: 'Funded by Allergan; included textured implants since withdrawn.',
    },
    {
        id: 'natrelle-placement-contracture',
        topic: 'safety',
        concepts: ['contracture', 'muscle'],
        figures: [
            { value: 15.7, unit: 'percent' },
            { value: 26.3, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In the same 10 years of Allergan's study, capsular contracture after breast augmentation was less common with the implant under the muscle, 15.7%, than over it, 26.3% (Spear and Murphy, 2014).",
        sourceIds: ['spear-2014'],
        years: [2014],
        caveat: "The abstract does not grade the contracture; one maker's implants.",
    },
    {
        id: 'bia-alcl-textured',
        topic: 'safety',
        concepts: ['textured', 'smooth', 'alcl'],
        years: [2024],
        figures: [
            { value: 73, unit: 'percent' },
            { value: 3, unit: 'percent' },
        ],
        statement:
            'Of the BIA-ALCL cases reported to the FDA worldwide through June 2024, 73% involved textured implants and 3% smooth implants; for the rest, the surface was not reported.',
        sourceIds: ['fda-bia-alcl-reports'],
        caveat: 'Reports, not a rate; the FDA says incidence cannot be determined from them. Of the 40 smooth cases, 18 had an unknown implant history, 8 had a history of at least one textured implant, 13 had prior implants of unknown texture, and 1 had one smooth implant and no known textured implant.',
    },
    {
        id: 'bia-alcl-no-smooth-only',
        topic: 'safety',
        concepts: ['smooth'],
        figures: [],
        statement:
            'ASPS says there are no confirmed BIA-ALCL cases that involve only a smooth implant.',
        sourceIds: ['asps-bia-alcl'],
        caveat: 'ASPS only, and undated. The FDA reports one case with "a history of one smooth implant and no known textured implant" and its example checklist says patients with smooth implants "have also been diagnosed". Never write that smooth implants carry no risk; on new copy prefer the FDA wording.',
    },
    {
        id: 'bia-alcl-timing',
        topic: 'safety',
        concepts: ['average', 'alcl', 'symptom'],
        figures: [{ min: 8, max: 10, unit: 'year' }],
        statement:
            'ASPS says BIA-ALCL symptoms typically appear years after an implant, on average after 8 to 10 years.',
        sourceIds: ['asps-bia-alcl'],
    },
    {
        id: 'bia-alcl-no-removal',
        topic: 'safety',
        concepts: ['remov', 'symptom'],
        figures: [],
        statement:
            'The FDA does not recommend removing implants that cause no symptoms because of BIA-ALCL, and says the fill, saline or silicone, does not appear to be a risk factor.',
        sourceIds: ['fda-bia-alcl-questions'],
    },
    {
        id: 'breast-implant-illness',
        topic: 'safety',
        concepts: ['illness', 'symptom'],
        figures: [],
        statement:
            'The FDA says symptoms such as fatigue, memory loss, rash, brain fog and joint pain may be associated with breast implants, that these symptoms and their causes are poorly understood, and that in some cases removing the implants without replacing them is reported to reverse them.',
        sourceIds: ['fda-risks'],
        caveat: 'No established incidence figure: the FDA gives none. Individual risk "has not been well established" (the boxed warning). Percentages in the FDA\'s medical device reports describe the reports, not how often it happens.',
    },
    {
        id: 'belly-button-incision',
        topic: 'safety',
        concepts: ['belly'],
        figures: [],
        statement:
            'ASPS says a belly-button approach is associated with a higher complication rate, and the FDA lists placement through an incision site it has not approved, such as the belly button, among the causes of rupture.',
        sourceIds: ['asps-breast-augmentation-procedure', 'fda-risks'],
    },

    // ── Mammograms and breastfeeding ─────────────────────────────────────
    {
        id: 'mammograms-keep-screening',
        topic: 'safety',
        concepts: ['mammogram'],
        figures: [],
        statement:
            'With breast implants you should still get regular screening mammograms, with extra implant displacement views, the American Cancer Society says, and these views are easier when the implants are under the chest muscle.',
        sourceIds: ['acs-mammograms-with-implants'],
    },
    {
        id: 'mammogram-tissue-hidden',
        topic: 'safety',
        concepts: ['tissue', 'mammogram'],
        figures: [{ min: 22, max: 83, unit: 'percent' }],
        statement:
            "The FDA's review found that implants hid between 22% and 83% of the breast tissue a mammogram can show, and that breast cancer risk is the same as for other women.",
        sourceIds: ['fda-mammography'],
        caveat: 'An older review (a 2004 study); the delay in detection it found came without increased mortality.',
    },
    {
        id: 'breastfeeding',
        topic: 'results',
        concepts: ['breastfe'],
        years: [2023],
        figures: [
            { value: 11, unit: 'study' },
            { value: 82, unit: 'percent' },
            { value: 88, unit: 'percent' },
        ],
        statement:
            'A 2023 review of 11 studies found that about 82% of women with breast implants were able to breastfeed, against about 88% of women without them (Chen and colleagues, Aesthetic Surgery Journal, 2023).',
        sourceIds: ['chen-2023'],
        caveat: 'Rounded from 82.25% and 88.45%. Observational studies. Do not read the two figures as "no difference": the review\'s meta-analysis of 5 comparative studies found a significant reduction (pooled odds ratio 0.45), and it concludes "There may be impairment in ability to breastfeed".',
    },
    {
        id: 'breastfeeding-placement',
        topic: 'results',
        concepts: ['milk', 'breastfe'],
        figures: [],
        statement:
            'Cleveland Clinic says implants placed under the muscle usually affect milk production less than implants above it, and the FDA says some women who have had breast augmentation can breastfeed and some cannot.',
        sourceIds: ['cleveland-clinic-breast-augmentation', 'fda-risks'],
    },

    // ── Size ─────────────────────────────────────────────────────────────
    {
        id: 'asps-sizes',
        topic: 'procedure',
        concepts: ['cc', 'implant', 'size', 'surgeon'],
        figures: [
            { min: 300, max: 400, unit: 'cc' },
            { min: 200, max: 300, unit: 'cc' },
        ],
        statement:
            "In ASPS's 2025 survey, most member surgeons ranked implants of 300 to 400 cc among those they used most, with 200 to 300 cc second.",
        sourceIds: ['asps-statistics-2025'],
        years: [2025],
        caveat: 'What surgeons use most, not a recommendation, and no cup-size conversion: none of the sources gives one.',
    },
    {
        id: 'asps-trend-smaller',
        topic: 'procedure',
        concepts: ['smaller', 'larger'],
        figures: [
            { value: 36, unit: 'percent' },
            { value: 12, unit: 'percent' },
        ],
        statement:
            "In the same survey, 36% of ASPS's member surgeons saw patients choosing smaller implants than in previous years, and 12% saw a shift to larger ones.",
        sourceIds: ['asps-statistics-2025'],
        years: [2025],
    },
    {
        id: 'size-planning',
        topic: 'procedure',
        concepts: ['size', 'planning'],
        figures: [],
        statement:
            'The FDA says many patients have more operations to change implant size, and that the first one needs careful planning and reasonable expectations.',
        sourceIds: ['fda-what-to-know'],
    },

    // ── Surgery day ──────────────────────────────────────────────────────
    {
        id: 'surgery-length',
        topic: 'procedure',
        concepts: ['hours', 'anesthesia'],
        figures: [],
        statement:
            'The FDA says most women receive general anesthesia for breast implant surgery, which can last from one to several hours depending on the procedure and personal circumstances.',
        sourceIds: ['fda-implant-surgery'],
        caveat: 'How long it takes at Alluring is an owner question.',
    },
    {
        id: 'home-after-an-hour',
        topic: 'recovery',
        concepts: ['home', 'stable', 'discharge', 'leave'],
        figures: [{ value: 1, unit: 'hour' }],
        statement:
            'You may go home once you are stable, typically after an hour or so, ASPS says.',
        sourceIds: ['asps-breast-augmentation-recovery'],
    },
    {
        id: 'stay-first-night',
        topic: 'recovery',
        concepts: ['stay', 'night'],
        figures: [{ value: 1, unit: 'night' }],
        statement:
            'Cleveland Clinic advises having someone drive you home and stay with you the first night at least.',
        sourceIds: ['cleveland-clinic-breast-augmentation'],
    },

    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'pain-1-5-days',
        topic: 'recovery',
        concepts: ['pain'],
        figures: [{ min: 1, max: 5, unit: 'day' }],
        statement:
            'Acute pain typically eases after 1 to 5 days, though soreness and swelling can last a few weeks, ASPS says.',
        sourceIds: ['asps-breast-augmentation-recovery'],
    },
    {
        id: 'work-few-days-to-a-week',
        topic: 'recovery',
        concepts: ['work', 'job'],
        figures: [{ value: 1, unit: 'week' }],
        statement:
            'You may be able to return to work within a few days to a week, depending on your job, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-recovery'],
    },
    {
        id: 'time-off-cleveland',
        topic: 'recovery',
        concepts: ['work', 'off', 'job'],
        figures: [
            { value: 3, unit: 'day' },
            { value: 3, unit: 'week' },
        ],
        statement:
            'Cleveland Clinic says to take at least 3 days off work, and at least 3 weeks for a physically demanding job.',
        sourceIds: ['cleveland-clinic-breast-augmentation'],
    },
    {
        id: 'stitches-a-week',
        topic: 'recovery',
        concepts: ['stitch', 'suture'],
        figures: [{ value: 1, unit: 'week' }],
        statement:
            'Stitches that need removing come out in about a week (The Aesthetic Society; Cleveland Clinic).',
        sourceIds: [
            'tas-breast-augmentation-recovery',
            'cleveland-clinic-breast-augmentation',
        ],
    },
    {
        id: 'recover-1-2-weeks',
        topic: 'recovery',
        concepts: ['recover'],
        figures: [{ min: 1, max: 2, unit: 'week' }],
        statement:
            'It typically takes 1 to 2 weeks to recover from a breast augmentation, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-recovery'],
        caveat: 'A return to your usual routine, not full healing (Cleveland Clinic: 6 to 8 weeks).',
    },
    {
        id: 'sex-2-weeks',
        topic: 'recovery',
        concepts: ['sex'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'Sexual activity waits at least 2 weeks, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-recovery'],
    },
    {
        id: 'swelling-a-month',
        topic: 'recovery',
        concepts: ['swell'],
        figures: [{ value: 1, unit: 'month' }],
        statement:
            'Most remaining swelling resolves within a month, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-recovery'],
    },
    {
        id: 'heavy-lifting-4-weeks',
        topic: 'recovery',
        concepts: ['lift'],
        figures: [{ value: 4, unit: 'week' }],
        statement:
            'Cleveland Clinic advises no heavy lifting for at least 4 weeks.',
        sourceIds: ['cleveland-clinic-breast-augmentation'],
        caveat: 'No weight limit. Whether lifting a child counts is for the surgeon to say.',
    },
    {
        id: 'sports-6-weeks',
        topic: 'recovery',
        concepts: ['sport', 'exercise', 'workout'],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'Returning to sports may take up to 6 weeks, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-augmentation'],
    },
    {
        id: 'full-recovery-6-8-weeks',
        topic: 'recovery',
        concepts: ['full recovery', 'recover'],
        figures: [{ min: 6, max: 8, unit: 'week' }],
        statement:
            'On average, full recovery takes about 6 to 8 weeks, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-augmentation'],
    },
    {
        id: 'final-result-weeks',
        topic: 'results',
        concepts: ['result', 'settle'],
        figures: [],
        statement:
            'ASPS says the final result may take a few weeks to show, as the swelling goes down and the skin stretches.',
        sourceIds: ['asps-breast-augmentation-results'],
        caveat: 'This ASPS page gives no figure for "drop and fluff"; never use it for how implants settle. The months are in `drop-fluff-3-6-months`, from a bylined article on the ASPS website, and are attributed that way.',
    },
    {
        id: 'scars-fade',
        topic: 'results',
        concepts: ['scar', 'incision'],
        figures: [],
        statement:
            'Incision lines may take several months, even a couple of years, to fade, ASPS says.',
        sourceIds: ['asps-breast-augmentation-results'],
    },
    {
        id: 'fat-transfer',
        topic: 'procedure',
        concepts: ['fat'],
        figures: [],
        statement:
            'In a fat transfer, fat removed by liposuction is processed and injected into the breasts; it needs enough fat to spare, not all of it survives, and the surgery sometimes has to be repeated, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-procedure'],
        caveat: 'Whether Alluring does fat transfer on its own, and its price, are owner questions.',
    },
    // ── Added 2026-11-03 for the blog cluster (no prices; sources above only) ──
    {
        id: 'baker-grades',
        topic: 'safety',
        concepts: ['baker', 'grade'],
        figures: [],
        statement:
            'The FDA describes four Baker grades of capsular contracture: grade I, normally soft and natural looking; grade II, a little firm but normal looking; grade III, firm and abnormal looking; grade IV, hard, painful and abnormal looking. Grades III and IV are considered severe and may require another operation.',
        sourceIds: ['fda-risks'],
    },
    {
        id: 'contracture-cause-unknown',
        topic: 'safety',
        concepts: ['contracture', 'cause'],
        figures: [],
        statement:
            'The FDA says capsular contracture may be more common after infection, hematoma and seroma, that its cause is not known, that it can come back after surgery to correct it, and that the FDA has not cleared or approved any device to treat it or reduce how often it happens.',
        sourceIds: ['fda-risks'],
    },
    {
        id: 'sientra-contracture',
        topic: 'safety',
        concepts: ['contracture'],
        figures: [
            { value: 13, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, the risk of severe capsular contracture (Baker grade III or IV) through 10 years after a first breast augmentation was 13%.",
        sourceIds: ['sientra-brochure'],
        caveat: "One maker's implants and its own study; Table 9 of the brochure prints 12.9%.",
    },
    {
        id: 'natrelle-contracture',
        topic: 'safety',
        concepts: ['contracture'],
        figures: [
            { value: 18.9, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Allergan's study of Natrelle round silicone implants, capsular contracture within 10 years of breast augmentation was 18.9% (Spear and Murphy, Plastic and Reconstructive Surgery, 2014).",
        sourceIds: ['spear-2014'],
        years: [2014],
        caveat: 'The abstract does not grade the contracture, so never compare it directly with the Baker III/IV rates from Sientra or Mentor.',
    },
    {
        id: 'sientra-removal',
        topic: 'safety',
        concepts: ['remov'],
        figures: [
            { value: 16, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, the risk of implant removal within 10 years of a first breast augmentation, including removal with replacement for a size exchange, was 16%.",
        sourceIds: ['sientra-brochure'],
        caveat: "One maker's implants and its own study.",
    },
    {
        id: 'mentor-explant',
        topic: 'safety',
        concepts: ['remov', 'explant'],
        figures: [
            { value: 11.6, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Mentor's study of its MemoryGel implants, 11.6% of women who had a first breast augmentation had an implant removed, with or without replacement, within 10 years (Caplin and colleagues, Plastic and Reconstructive Surgery, 2021).",
        sourceIds: ['caplin-2021'],
        years: [2021],
        caveat: 'Sponsored by Mentor; a Kaplan-Meier estimate.',
    },
    {
        id: 'sientra-rupture',
        topic: 'safety',
        concepts: ['ruptur'],
        figures: [
            { value: 8.5, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, the rupture rate through 10 years after a first breast augmentation was 8.5% among the women assigned to regular MRI scans.",
        sourceIds: ['sientra-brochure'],
        caveat: "One maker's implants; patients, not implants. The brochure warns that follow-up MRI compliance was incomplete and that the rate may be underestimated.",
    },
    {
        id: 'mentor-rupture',
        topic: 'safety',
        concepts: ['ruptur'],
        figures: [
            { value: 24.2, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Mentor's study of its MemoryGel implants, suspected or confirmed rupture within 10 years of a first breast augmentation was 24.2% among the women followed with MRI (Caplin and colleagues, Plastic and Reconstructive Surgery, 2021).",
        sourceIds: ['caplin-2021'],
        years: [2021],
        caveat: 'Sponsored by Mentor; suspected or confirmed, per patient. The makers measured this differently, so never rank them against each other.',
    },
    {
        id: 'sientra-rippling-malposition',
        topic: 'safety',
        concepts: ['rippl', 'wrinkl', 'malposition', 'position'],
        figures: [
            { value: 1.9, unit: 'percent' },
            { value: 2.7, unit: 'percent' },
            { value: 10, unit: 'year' },
        ],
        statement:
            "In Sientra's core study, 1.9% of women who had a first breast augmentation had wrinkling or rippling and 2.7% had implant malposition reported through 10 years.",
        sourceIds: ['sientra-brochure'],
        caveat: 'Silicone implants from one maker, and its own study. Saline labeling reports much higher wrinkling; see SOURCE-BANK. Bottoming out has no separate line in it.',
    },
    {
        id: 'bia-alcl-reports-count',
        topic: 'safety',
        concepts: ['alcl', 'death', 'report'],
        years: [2024],
        figures: [
            { value: 64, unit: 'death' },
            { value: 8, unit: 'year' },
        ],
        statement:
            'Through June 2024, reports to the FDA worldwide included 64 deaths from BIA-ALCL, and the median time from the last implant to diagnosis was 8 years.',
        sourceIds: ['fda-bia-alcl-reports'],
        caveat: 'Reports, not a rate. The FDA says incidence cannot be determined from this reporting system alone.',
    },
    {
        id: 'mri-if-symptoms',
        topic: 'safety',
        concepts: ['mri', 'symptom'],
        figures: [],
        statement:
            'If you have symptoms at any time, or an uncertain ultrasound result for rupture, the FDA recommends an MRI.',
        sourceIds: ['fda-labeling-guidance'],
    },
    {
        id: 'mammogram-tell-facility',
        topic: 'safety',
        concepts: ['mammogra', 'technologist', 'technician', 'facility'],
        figures: [],
        statement:
            'The FDA says to tell the mammography center that you have implants when you book, and to remind the technician at the exam; the American Cancer Society says to ask whether the facility has experience with implants.',
        sourceIds: ['fda-mammography', 'acs-mammograms-with-implants'],
    },
    {
        id: 'higher-risk-conditions',
        topic: 'procedure',
        concepts: ['smok', 'heal', 'candidate'],
        figures: [],
        statement:
            "The FDA's example patient checklist lists a higher risk of a poor surgical outcome for active or former smokers and for people with conditions or drugs that affect healing or blood clotting, and says autoimmune disease has not been adequately studied.",
        sourceIds: ['fda-labeling-guidance'],
        caveat: "Example text; the practice's own candidacy rules are an owner question.",
    },
    {
        id: 'removal-insurance',
        topic: 'law',
        concepts: ['insurance'],
        figures: [],
        statement:
            'The FDA says the cost of implant removal or replacement may not be covered by insurance, even if you have complications.',
        sourceIds: ['fda-things-to-consider'],
    },
    {
        id: 'after-removal-changes',
        topic: 'safety',
        concepts: ['remov', 'dimpl', 'pucker'],
        figures: [],
        statement:
            'If implants are removed and not replaced, the FDA says you may see changes such as dimpling, chest wall concavity, puckering, wrinkling, breast tissue loss or other undesirable cosmetic changes.',
        sourceIds: ['fda-things-to-consider'],
    },
    {
        id: 'most-pain-48-hours',
        topic: 'recovery',
        concepts: ['pain'],
        figures: [{ value: 48, unit: 'hour' }],
        statement:
            'You will typically have the most pain within the first 48 hours after surgery, The Aesthetic Society says, and it should ease each day; extreme or long-lasting pain is a reason to call your surgeon.',
        sourceIds: ['tas-breast-augmentation-recovery'],
    },
    {
        id: 'shower-1-7-days',
        topic: 'recovery',
        concepts: ['shower'],
        figures: [{ min: 1, max: 7, unit: 'day' }],
        statement:
            'You will be permitted to shower between 1 and 7 days after surgery, The Aesthetic Society says.',
        sourceIds: ['tas-breast-augmentation-recovery'],
    },
    // ── Added 2026-11-03 for the procedure page: the cluster's recovery marks ──
    {
        id: 'drop-fluff-3-6-months',
        topic: 'results',
        concepts: ['fluff', 'settl', 'final result'],
        figures: [
            { value: 3, unit: 'month' },
            { min: 3, max: 6, unit: 'month' },
            { value: 12, unit: 'month' },
        ],
        statement:
            'University of Utah Health says you begin to notice your final results around 3 months, with subtle changes through 12 months, and an article on the ASPS website says the whole drop and fluff process can take 3 to 6 months.',
        sourceIds: ['utah-health-recovery', 'asps-article-drop-fluff'],
        caveat: 'Never write that most of the change or settling happens by 3 months: no source says so. The 3 to 6 months is a bylined article by Dr. Eric Mariotti, never "ASPS says". No source says it is slower under the muscle.',
    },
    {
        id: 'driving-about-a-week',
        topic: 'recovery',
        concepts: ['driv'],
        figures: [
            { min: 7, max: 10, unit: 'day' },
            { value: 1, unit: 'week' },
            { value: 2, unit: 'week' },
        ],
        statement:
            'Many people can drive again after about 1 week (7 to 10 days), an article on the ASPS website says, and MedlinePlus, on a page that also covers lifts and reductions, says not to drive for at least 2 weeks. Never drive on the day of surgery or while taking opioid pain medicine.',
        sourceIds: [
            'asps-article-back-to-active',
            'utah-health-recovery',
            'medlineplus-cosmetic-breast-discharge',
        ],
        caveat: 'Sources range from within 1 week to at least 2 weeks. Only University of Utah Health says "most people".',
    },
    {
        id: 'back-sleep-3-4-weeks',
        topic: 'recovery',
        concepts: ['back', 'sleep'],
        figures: [{ min: 3, max: 4, unit: 'week' }],
        statement:
            'A UW Medicine patient handout says to sleep on your back for the first 3 to 4 weeks.',
        sourceIds: ['uw-medicine-augmentation'],
    },
    {
        id: 'support-bra-3-4-weeks',
        topic: 'recovery',
        concepts: ['bra'],
        figures: [
            { min: 3, max: 4, unit: 'week' },
            { min: 2, max: 4, unit: 'week' },
        ],
        statement:
            'Two university handouts keep a support bra on around the clock for 3 to 4 weeks, and MedlinePlus, on a page that also covers lifts and reductions, says a bra night and day for 2 to 4 weeks. Your surgeon sets the length.',
        sourceIds: [
            'uw-medicine-augmentation',
            'utah-health-recovery',
            'medlineplus-cosmetic-breast-discharge',
        ],
    },
    {
        id: 'side-sleep-after-3-4-weeks',
        topic: 'recovery',
        concepts: ['side'],
        figures: [{ min: 3, max: 4, unit: 'week' }],
        statement:
            'A UW Medicine patient handout and University of Utah Health allow side sleeping after 3 to 4 weeks, and your surgeon may ask for longer.',
        sourceIds: ['uw-medicine-augmentation', 'utah-health-recovery'],
    },
    {
        id: 'no-bra-at-night-no-date',
        topic: 'recovery',
        concepts: ['bra'],
        figures: [],
        statement:
            'No allowed source gives a date for going without a bra at night, so it waits until your surgeon clears you.',
        sourceIds: ['uw-medicine-augmentation', 'utah-health-recovery'],
        caveat: 'Never state a number of weeks for this. The sources give only the 3 to 4 weeks of round-the-clock support bra, in `support-bra-3-4-weeks`.',
    },
    {
        id: 'soak-about-a-month',
        topic: 'recovery',
        concepts: ['soak', 'swim', 'pool', 'ocean', 'bath'],
        figures: [{ value: 1, unit: 'month' }],
        statement:
            'A bath, pool, hot tub or the ocean waits at least about a month, an article on the ASPS website says, and until your incisions are fully closed and your surgeon agrees.',
        sourceIds: [
            'asps-article-beach-season',
            'uw-medicine-augmentation',
            'utah-health-recovery',
        ],
        caveat: 'Never give 4 to 6 weeks as the augmentation mark: that range is from a breast reconstruction handout, and only the swim post discloses it, as such.',
    },
    {
        id: 'chest-work-no-single-date',
        topic: 'recovery',
        concepts: ['push', 'chest', 'upper body', 'upper-body', 'strenuous'],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'No source gives a single date for push-ups: an article on the ASPS website says to avoid strenuous activity and upper-body movement for at least 6 weeks, and another says patients can resume all exercises at 6 weeks but advises avoiding strenuous chest exercise such as push-ups, especially with implants under the muscle. Your surgeon decides.',
        sourceIds: ['asps-article-back-to-active', 'asps-article-exercise'],
        caveat: 'Bylined articles, not society guidance. Never imply push-ups are fine at a date.',
    },
    {
        id: 'price-implant-exchange',
        topic: 'price',
        concepts: ['exchange'],
        figures: [
            { value: 3500, unit: 'usd' },
            { value: 4500, unit: 'usd' },
        ],
        statement:
            'At Alluring, an implant exchange is listed at $3,500 with saline implants and $4,500 with silicone.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Implant Exchange - Saline" and "Implant Exchange - Silicone". A pen tick beside the saline line is unexplained.',
    },
    {
        id: 'no-serious-complications',
        topic: 'safety',
        concepts: ['complication'],
        figures: [],
        statement:
            'ASPS says FDA-approved implants undergo extensive testing, and that the vast majority of people with breast implants experience no serious complications.',
        sourceIds: ['asps-breast-augmentation-safety'],
        caveat: 'ASPS is a society of surgeons. Always beside the complications and the boxed warning, never alone.',
    },
    {
        id: 'fda-common-complications',
        topic: 'safety',
        concepts: ['complication'],
        figures: [],
        statement:
            'The FDA lists common local complications, including capsular contracture, rupture, breast pain, infection, hematoma, seroma, changes in nipple or breast sensation, implant malposition, wrinkling or rippling, and an unsatisfactory style or size.',
        sourceIds: ['fda-risks'],
    },
    {
        id: 'candidate-asps',
        topic: 'procedure',
        concepts: ['candidate'],
        figures: [],
        statement:
            'ASPS says good candidates are physically healthy, not pregnant or breastfeeding, have fully developed breasts and have realistic expectations.',
        sourceIds: ['asps-breast-augmentation-candidates'],
        caveat: "The practice's own candidacy rules are an owner question.",
    },
    {
        id: 'reduction-opposite',
        topic: 'procedure',
        concepts: ['reduction'],
        figures: [],
        statement:
            'A breast reduction removes skin and tissue and reshapes the breast to make it smaller, and ASPS says women almost always report it reduces back pain.',
        sourceIds: ['asps-breast-reduction'],
    },
] as const satisfies readonly BreastAugmentationFact[]

export type BreastAugmentationFactId =
    (typeof breastAugmentationFacts)[number]['id']

const breastAugmentationLookups = createFactLookups(
    breastAugmentationFacts,
    'breast augmentation'
)

export const getBreastAugmentationFact: (
    id: BreastAugmentationFactId
) => BreastAugmentationFact = breastAugmentationLookups.fact

/** A figure as copy writes it: "$3,500", "5–6 years", "49.1%", "300–400 cc". */
export const formatBreastAugmentationFigure = formatProcedureFigure

/** The first (or `index`th) figure of a fact, formatted. */
export const breastAugmentationFigure: (
    id: BreastAugmentationFactId,
    index?: number
) => string = breastAugmentationLookups.figure
