/**
 * Breast lift facts: every figure the breast lift page is allowed to publish,
 * stated once.
 *
 * The page module reads its figures from here, and
 * `scripts/check-procedure-copy.ts --slug breast-lift-miami` fails any copy
 * on the built page that states a %, $, hour, day, night, week, month, year,
 * age, study or patient figure that is not declared below, or states a
 * declared figure in a sentence about something else.
 *
 * Every source was read on 2026-09-30: the ASPS, Cleveland Clinic, Aesthetic
 * Society and FDA pages from their own text, the Florida rule from its
 * official .doc on flrules.org, the studies from their PubMed abstracts.
 * Surgeon-written posts on the ASPS website are attributed to their author,
 * because ASPS says they are the author's views, not the society's; ASPS
 * news articles that quote a surgeon are attributed to that surgeon,
 * "quoted on the ASPS website". Each fact carries the attribution the copy
 * must use and, in `caveat`, what the source does not say. The practice's
 * own figures come from its printed price sheet of 2026-09-15
 * (`docs/pricing/practice-price-list.md`) and are stated as Alluring's, never
 * as a society's guidance.
 *
 * Not here, because only the practice can answer them (the #320 brief's
 * owner questions): which lift each price covers, what the modified lift
 * is, how long a lift takes at Alluring, drains, which implants, one
 * surgery or two for a lift with implants, where surgery is done, what the
 * price includes and how many nights to stay in Miami.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    createFactLookups,
    formatProcedureFigure,
    type ProcedureFact,
    type ProcedureSource,
} from './procedure-facts'

export type BreastLiftSourceId =
    | 'florida-rule-64b8-9-009'
    | 'fda-types-breast-implants'
    | 'fda-things-to-consider'
    | 'fda-labeling-guidance-2020'
    | 'asps-breast-lift'
    | 'asps-breast-lift-cost'
    | 'asps-breast-lift-candidates'
    | 'asps-breast-lift-preparation'
    | 'asps-breast-lift-procedure'
    | 'asps-breast-lift-results'
    | 'asps-breast-lift-safety'
    | 'asps-salemy-2022'
    | 'asps-salemy-2024'
    | 'asps-iteld-2023'
    | 'asps-schwartz-2015'
    | 'asps-horton-2025'
    | 'cleveland-clinic-breast-lift'
    | 'cleveland-clinic-breast-lift-center'
    | 'aesthetic-society-breast-lift-procedure'
    | 'aesthetic-society-breast-lift-recovery'
    | 'aesthetic-society-breast-lift-preparation'
    | 'aesthetic-society-breast-lift-safety'
    | 'cdc-breast-surgery-breastfeeding'
    | 'ali-2021'
    | 'di-summa-2019'
    | 'khavanin-2014'
    | 'calobrace-2013'
    | 'rinker-2010'
    | 'alluring-practice'

export type BreastLiftSource = ProcedureSource<BreastLiftSourceId>

export const breastLiftSources: readonly BreastLiftSource[] = [
    {
        id: 'florida-rule-64b8-9-009',
        publisher: 'Florida Board of Medicine',
        title: 'Rule 64B8-9.009, Standard of Care for Office Surgery',
        date: '2024-09-16',
        url: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B8-9.009',
        attribution:
            'Read on 2026-09-30 from the rule\'s official text (effective 9/16/2024). It has no provision specific to breast surgery or implants (the word "breast" does not appear), so its general office-surgery limits apply to a breast lift done in a physician\'s office. (2)(g): "the maximum planned duration of all surgical procedures combined must not exceed 8 hours" and "the patient must be discharged within 24 hours of presenting to the office for surgery". (2)(p): the surgeon gives the patient "in writing, prior to the procedure, the name and location of the hospital where the surgeon has privileges … or … a transfer agreement." All of it governs office surgery, not hospitals or licensed surgery centers. Never claim where Alluring operates until the owner confirms it.',
    },
    {
        id: 'fda-types-breast-implants',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Types of Breast Implants',
        date: '2019-10-23',
        url: 'https://www.fda.gov/medical-devices/breast-implants/types-breast-implants',
        attribution:
            'Content current as of 10/23/2019, read on 2026-09-30: "The FDA approved saline-filled breast implants for breast augmentation in women age 18 or older and for breast reconstruction in women of any age." "Silicone gel-filled breast implants are approved for breast augmentation in women age 22 or older". "Breast implants are not lifetime devices. The longer a woman has implants, the more likely it is that she will need to have surgery to remove or replace them." The FDA\'s ages, not the practice\'s policy.',
    },
    {
        id: 'fda-things-to-consider',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Things to Consider Before Getting Breast Implants',
        date: '2023-03-08',
        url: 'https://www.fda.gov/medical-devices/breast-implants/things-consider-getting-breast-implants',
        attribution:
            'Content current as of 03/08/2023, read on 2026-09-30. On October 27, 2021 the FDA approved new labeling for all breast implants with a "Boxed warning" and a "Patient decision checklist, which must be reviewed with the prospective patient by the health care provider … The patient must be given the opportunity to initial and sign the patient decision checklist and it must be signed by the physician implanting the device." Also: "Breast implants are not lifetime devices. The longer you have your implants, the more likely it will be for you to have them removed or replaced." "Even if you have complications, the cost of implant removal or implant replacement may not be covered by insurance."',
    },
    {
        id: 'fda-labeling-guidance-2020',
        publisher: 'U.S. Food and Drug Administration (FDA)',
        title: 'Breast Implants – Certain Labeling Recommendations to Improve Patient Communication',
        date: '2020-09-29',
        url: 'https://www.fda.gov/media/131885/download',
        attribution:
            'Guidance issued 2020-09-29, read on 2026-09-30. For silicone gel implants: "Even if you have no symptoms, you should have your first ultrasound or MRI at 5-6 years after your initial implant surgery and then every 2-3 years thereafter." Its checklist rates (sensation changes "up to 35%" and others) are the highest rates in any implant approval study, not breast lift rates: never publish them as lift risks.',
    },
    {
        id: 'asps-breast-lift',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast Lift (Mastopexy)',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift',
        attribution:
            'Read on 2026-09-30: a breast lift "raises the breasts by removing excess skin and tightening the surrounding tissue to reshape and support the new breast contour"; "Sometimes the areola becomes enlarged over time, and a breast lift will reduce this as well." "Breast lift surgery does not significantly change the size of your breasts or round out the upper part of your breast. If you want your breasts to look fuller, consider breast lift and breast augmentation." No date shown.',
    },
    {
        id: 'asps-breast-lift-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does a breast lift cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/cost',
        attribution:
            'Read on 2026-09-30: "The average cost of a breast lift (mastopexy) is $6,816, according to the latest statistics from the American Society of Plastic Surgeons. This average cost is only part of the total price – it does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans do not cover breast lift surgery or its complications". The page gives no year, and the 2025 ASPS statistics report has no fee table, so the copy gives none.',
    },
    {
        id: 'asps-breast-lift-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Who is a good candidate for breast lift surgery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/candidates',
        attribution:
            'Read on 2026-09-30: "You are physically healthy and maintain a stable weight", "You do not smoke", "When unsupported, your nipples fall below the breast crease", "Your nipples and areolas point downward", "You have stretched skin and enlarged areolas", "One breast is lower than the other". No BMI, age or weight-stability period.',
    },
    {
        id: 'asps-breast-lift-preparation',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How should I prepare for breast lift surgery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/preparation',
        attribution:
            'Read on 2026-09-30: arrange "for someone to drive you to and from surgery and to stay with you for at least the first night following surgery"; "Get a baseline mammogram before surgery and another one after surgery". Its sentence on where a lift may be performed is ASPS\'s general statement, never about Alluring.',
    },
    {
        id: 'asps-breast-lift-procedure',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast lift procedure steps',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/procedure',
        attribution:
            'Read on 2026-09-30: "intravenous sedation and general anesthesia"; "There are three common incision patterns:" around the areola; around the areola and vertically down to the breast crease; and also horizontally along the crease. "The nipple and areola are repositioned to a natural, more youthful height." "If necessary, enlarged areolas are reduced". "Incision lines are permanent, but in most cases will fade and significantly improve over time." No surgery time and no scar length.',
    },
    {
        id: 'asps-breast-lift-results',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast lift results',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/results',
        attribution:
            'Read on 2026-09-30: "The results of your breast lift surgery are immediately visible." "The final results of your breast lift will appear over the next few months as breast shape and position continue to settle." "The results of your breast lift surgery will be long-lasting. Over time, your breasts can continue to change due to aging and gravity." "Breast surgery should be entertained after child bearing is completed." "Changes that occur in the breasts during pregnancy can minimize or reverse the improvement a breast lift provides." "significant weight loss after breast surgery can negatively impact breast appearance." No number of months or years.',
    },
    {
        id: 'asps-breast-lift-safety',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Breast lift risks and safety',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/safety',
        attribution:
            'Read on 2026-09-30. Risks include "Changes in nipple or breast sensation, which may be temporary or permanent", "Breast asymmetry", "Poor healing of incisions", "Possibility of revisional surgery" and "Potential partial or total loss of nipple and areola". On implants: "An implant can provide improved upper breast fullness or cleavage. Implants can be placed at the same time or as a second procedure, depending on the experience of the surgeon." No rates.',
    },
    {
        id: 'asps-salemy-2022',
        publisher: 'ASPS website, a post by Shahram Salemy, MD',
        title: 'Better breasts after pregnancy and breastfeeding',
        authors: 'Shahram Salemy, MD, FACS',
        date: '2022-02-08',
        url: 'https://www.plasticsurgery.org/news/blog/better-breasts-after-pregnancy-and-breastfeeding',
        attribution:
            'Read on 2026-09-30. A surgeon\'s post; ASPS says blog posts are the author\'s views. "For most women, it is best to wait up to six months after lactation has stopped before getting any kind of cosmetic surgery done on the breasts. This gives your body time to adjust and allows your breast tissue to "settle" into its final shape." Other surgeons quoted by ASPS give three months to a year.',
    },
    {
        id: 'asps-salemy-2024',
        publisher: 'ASPS website, a post by Shahram Salemy, MD',
        title: 'Common myths about breast lifts debunked',
        authors: 'Shahram Salemy, MD, FACS',
        date: '2024-12-04',
        url: 'https://www.plasticsurgery.org/news/blog/common-myths-about-breast-lifts-debunked',
        attribution:
            'Read on 2026-09-30. A surgeon\'s post. "While it\'s true that a breast lift can potentially affect breastfeeding, many women have been able to breastfeed successfully after the procedure." No rate.',
    },
    {
        id: 'asps-iteld-2023',
        publisher: 'ASPS website, a post by Lawrence Iteld, MD',
        title: 'What are the benefits of combining breast augmentation and a breast lift?',
        authors: 'Lawrence Iteld, MD',
        date: '2023-08-10',
        url: 'https://www.plasticsurgery.org/news/blog/what-are-the-benefits-of-combining-breast-augmentation-and-a-breast-lift',
        attribution:
            "Read on 2026-09-30. A surgeon's post. \"A lift done on its own won't significantly alter the size of the breasts, but augmentation on its own isn't enough to address sagging breasts.\"",
    },
    {
        id: 'asps-schwartz-2015',
        publisher: 'ASPS website, a post by Jaime Schwartz, MD',
        title: 'Misconceptions about breast augmentation and lift',
        authors: 'Jaime Schwartz, MD',
        date: '2015-08-12',
        url: 'https://www.plasticsurgery.org/news/blog/misconceptions-about-breast-augmentation-and-lift',
        attribution:
            'Read on 2026-09-30. A surgeon\'s post. "Depending on your goals and the degree of ptosis (sagging) you have, it may be safer to stage the procedures to allow for your body to recover in between operations."',
    },
    {
        id: 'asps-horton-2025',
        publisher: 'ASPS website, an article quoting Karen Horton, MD',
        title: 'Finding comfort after breast surgery: A guide to compression bras and postsurgical garments',
        authors: 'Alia Willson, quoting Karen Horton, MD, MSc, FACS',
        date: '2025-10-30',
        url: 'https://www.plasticsurgery.org/news/articles/finding-comfort-after-breast-surgery-a-guide-to-compression-bras-and-postsurgical-garments',
        attribution:
            'Read on 2026-09-30. Horton: "No underwire for at least three months". It speaks of breast surgery generally, and another surgeon in the same article says most women return to normal bras in about one month: attribute it to her, never as a rule.',
    },
    {
        id: 'cleveland-clinic-breast-lift',
        publisher: 'Cleveland Clinic',
        title: 'Breast Lift (Mastopexy): Surgery & Recovery',
        date: '2022-06-19',
        url: 'https://my.clevelandclinic.org/health/treatments/23298-breast-lift',
        attribution:
            'Medically reviewed, last updated 06/19/2022, read on 2026-09-30: "A breast lift alone won\'t change the size of your breasts." "The procedure usually lasts an hour or two, depending on how much work is being done." Crescent: "usually only used for breast augmentation in women who have little sagging"; anchor: "often used in people with more sagging or who are also having breast reduction". "Almost all mastopexy scars are hidden in the: Borders of your areolas. Breast crease. Natural contours of your breasts. Yet you may see some scars on the surface of your breast. They\'re permanent but fade a lot over time." "Most people who have mastopexy go home the same day." "These effects get better over time and last about two weeks." "Some surgeons prefer you to sleep on your back for a few weeks." "Many women go back to desk work and gentle activities such as walking about a week afterward." "You may not be cleared for vigorous activities, such as lifting things, exercising and having sex, for up to six weeks." "Usually, women can wear a regular bra about eight weeks after surgery." Risks include "Inability to lactate (breastfeed) in the future." Results "should last for several years".',
    },
    {
        id: 'cleveland-clinic-breast-lift-center',
        publisher: 'Cleveland Clinic Cosmetic & Plastic Surgery Center',
        title: 'Breast Lift',
        url: 'https://my.clevelandclinic.org/cosmetic-plastic-surgery/procedures/breast-lift',
        attribution:
            'No date shown, read on 2026-09-30. The department describing its own practice: "You\'ll need to wear a surgical bra for the first week after surgery, followed by a support bra for several weeks after that." "You may experience some loss of sensation in your nipples and breasts following mastopexy surgery, with sensation gradually returning over a few weeks or months. However, some patients experience numbness for up to a year. On rare occasions, loss of sensation can be permanent." Scars "will fade with time (with maximum fading occurring in around one year)." Its "two-and-a-half to three hours" conflicts with the Health Library\'s "an hour or two" and is not used.',
    },
    {
        id: 'aesthetic-society-breast-lift-procedure',
        publisher: 'The Aesthetic Society',
        title: 'Breast Lift: Detailed Procedure Information',
        date: '2021-12-22',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-lift/detailed-procedure-information',
        attribution:
            'Modified 12/22/2021, read on 2026-09-30. Anchor: "If you have a severe degree of sagging or are getting a breast reduction with your breast lift, your surgeon will likely recommend this approach. This technique produces the greatest lift, but also leaves the most scars." Lollipop: "If you have a moderate degree of sagging and do not want breast implants". Donut: "If you have a mild degree of sagging or asymmetric areolas … This technique produces the least amount of scarring." Crescent: "This technique is less common." "Your nipples and areolas will remain attached to underlying mounds of tissue to preserve sensation and the ability to breastfeed." "Mastopexy is typically an outpatient procedure."',
    },
    {
        id: 'aesthetic-society-breast-lift-recovery',
        publisher: 'The Aesthetic Society',
        title: 'Breast Lift: Aftercare & Recovery',
        date: '2021-12-22',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-lift/aftercare-recovery',
        attribution:
            'Modified 12/22/2021, read on 2026-09-30: "Your chest region may feel stiff and sore for two to five days." "Rest and sleep on your back in an inclined position … for the initial postoperative days or if you have significant swelling." "You must not lift, drive, do laundry, or clean during the first two weeks." "Incisions will initially be red or pink. They will remain this way for many months following surgery." Its incline in degrees is not used (no unit for degrees).',
    },
    {
        id: 'aesthetic-society-breast-lift-preparation',
        publisher: 'The Aesthetic Society',
        title: 'Breast Lift: Preparing for your Procedure',
        date: '2021-12-22',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-lift/preparing-your-procedure',
        attribution:
            'Modified 12/22/2021, read on 2026-09-30: "If you have children less than five years of age, you must have someone to take care of them for at least a week."',
    },
    {
        id: 'aesthetic-society-breast-lift-safety',
        publisher: 'The Aesthetic Society',
        title: 'Breast Lift: Safety Considerations',
        date: '2021-12-22',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-lift/safety-considerations',
        attribution:
            'Modified 12/22/2021, read on 2026-09-30: "Fortunately, significant complications from mastopexy are infrequent." It lists numbness "usually temporary but can be permanent for some" and "Difficulty breastfeeding if you have a child after your surgery".',
    },
    {
        id: 'cdc-breast-surgery-breastfeeding',
        publisher: 'Centers for Disease Control and Prevention (CDC)',
        title: 'Breast Surgery and Breastfeeding',
        date: '2025-12-08',
        url: 'https://www.cdc.gov/breastfeeding-special-circumstances/hcp/illnesses-conditions/breast-surgery.html',
        attribution:
            'Page updated Dec. 8, 2025, read on 2026-09-30 through a fetch tool (the site refuses plain requests): "Breast augmentation, lift, and reduction procedures may affect the nerves and ducts within the breast and thus affect lactation." "Most mothers who have had breast or nipple surgery can produce some milk, but they may not produce a full milk supply." Paraphrase it; re-check the live wording before quoting it.',
    },
    {
        id: 'ali-2021',
        publisher: 'Annals of Plastic Surgery',
        title: 'Perioperative Safety of Combined Augmentation-Mastopexy: An Evaluation of National Database',
        authors: 'Ali B and colleagues',
        date: '2021',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34699429/',
        attribution:
            'Ann Plast Surg 2021;87(5):493–500, abstract read in PubMed (34699429) on 2026-09-30. ACS-NSQIP, 2005–2018: 1,508 lifts alone and 534 lifts with implants. "Rates of any complications … (0.8% vs 2.5% vs 1.5%" for augmentation, lift alone and lift with implants; reoperation "1.2% vs 1.4% vs 1.5%", not significantly different. 30-day outcomes only; NSQIP draws mostly on hospital programs.',
    },
    {
        id: 'di-summa-2019',
        publisher: 'Journal of Plastic, Reconstructive & Aesthetic Surgery',
        title: 'Systematic review of outcomes and complications in nonimplant-based mastopexy surgery',
        authors: 'di Summa PG and colleagues',
        date: '2019',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30527707/',
        attribution:
            'J Plast Reconstr Aesthet Surg 2019;72(2):243–272, abstract read in PubMed (30527707) on 2026-09-30: "Thirty-four studies … represented 1888 treated patients." "The overall complication rate was 10.4%. The most represented complications were scar-related (3% …) and nipple-areola-related problems (2.9%; including distortion, asymmetry, and reduction in sensation)." Mixed designs and techniques, 1980–2016; minor complications included.',
    },
    {
        id: 'khavanin-2014',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'A systematic review of single-stage augmentation-mastopexy',
        authors: 'Khavanin N and colleagues',
        date: '2014',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25347628/',
        attribution:
            'Plast Reconstr Surg 2014;134(5):922–931, abstract read in PubMed (25347628) on 2026-09-30: "Twenty-three studies met inclusion criteria. Average follow-up varied from 16 to 173 weeks, with a majority under 1 year. The pooled total complication rate was 13.1 percent … The most common individual complication was recurrent ptosis, with an incidence of 5.2 percent". "The reoperation rate obtained from 13 studies was 10.7 percent". High heterogeneity; mostly short follow-up.',
    },
    {
        id: 'calobrace-2013',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Simultaneous augmentation/mastopexy: a retrospective 5-year review of 332 consecutive cases',
        authors: 'Calobrace MB and colleagues',
        date: '2013',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22965238/',
        attribution:
            'Plast Reconstr Surg 2013;131(1):145–156, abstract read in PubMed (22965238) on 2026-09-30. One practice: "The overall reoperation rate was 23.2 percent"; "The mastopexy-only reoperation rate of 10.2 percent was comparable to the tissue-related reoperation rate of 13.3 percent"; "the revision rate of combining the procedures was not more than additive." About a third were secondary cases.',
    },
    {
        id: 'rinker-2010',
        publisher: 'Annals of Plastic Surgery',
        title: 'Breast ptosis: causes and cure',
        authors: 'Rinker B, Veneracion M, Walsh CP',
        date: '2010',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20354434/',
        attribution:
            'Ann Plast Surg 2010;64(5):579–584, abstract read in PubMed (20354434) on 2026-09-30. 132 consecutive patients: "age, history of significant … weight loss, higher body mass index, larger bra cup size, number of pregnancies, and smoking history were found to be significant risk factors for breast ptosis". "History of breast-feeding … [was] not found to be [a] significant risk factor". One center; its weight-loss threshold is in pounds and is not published.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            'The practice\'s own figures: the four breast lift prices and the combination discount, from its printed price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`). List prices; whether they are before or after the sheet\'s handwritten "20% off" is still open with the owner. The sheet has pen ticks beside the lift without implants and the lift with saline; nobody has explained them, so they are recorded as unexplained marks and not interpreted. "Breast Lift w/ Gynecomastia" on the sheet is a male procedure and not on this page. State the prices as Alluring\'s, not as a society\'s guidance.',
    },
]

export type BreastLiftFact = ProcedureFact<BreastLiftSourceId>

export const breastLiftFacts = [
    // ── Price (the practice's price sheet of 2026-09-15) ─────────────────
    {
        id: 'price-modified',
        topic: 'price',
        concepts: ['modified'],
        figures: [{ value: 4000, unit: 'usd' }],
        statement:
            'A modified breast lift at Alluring, which removes skin from below the areola only, is $4,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - Modified (only skin from below areola)". What it is in surgical terms, and who it suits, is an owner question: say only what the sheet says, and never tie it to a named technique.',
    },
    {
        id: 'price-lift',
        topic: 'price',
        concepts: ['lift'],
        figures: [{ value: 5000, unit: 'usd' }],
        statement: 'A breast lift at Alluring without implants is $5,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - NO IMPLANTS", with an unexplained tick beside it. Mirrors `pricing.options` and `priceFrom`. Which incision it covers is an owner question. Never the old $6,500 or a weekly figure.',
    },
    {
        id: 'price-lift-saline',
        topic: 'price',
        concepts: ['saline', 'implant'],
        figures: [{ value: 6000, unit: 'usd' }],
        statement: 'A breast lift with saline implants at Alluring is $6,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - Saline", with an unexplained tick beside it. Whether the implants are included in the price, and which brand, are owner questions.',
    },
    {
        id: 'price-lift-silicone',
        topic: 'price',
        concepts: ['silicone', 'implant'],
        figures: [{ value: 7000, unit: 'usd' }],
        statement:
            'A breast lift with silicone implants at Alluring is $7,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - Silicone".',
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
        caveat: 'The sheet\'s "Combination discounts", worded as on the tummy tuck page. A lift with implants is one line on the sheet, so the copy never applies the discount to it; whether it counts as two procedures is an owner question.',
    },
    {
        id: 'asps-average-fee',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 6816, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of a breast lift at $6,816, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-breast-lift-cost'],
        caveat: "A national surgeon-fee average, not a Miami price and not an all-in price: always say what it leaves out. No year. The Aesthetic Society's $5,324 includes facility fees, so the two are never set side by side.",
    },

    // ── Procedure ────────────────────────────────────────────────────────
    {
        id: 'surgery-time',
        topic: 'procedure',
        concepts: ['hour', 'take', 'surgery', 'last'],
        figures: [{ min: 1, max: 2, unit: 'hour' }],
        statement:
            'Cleveland Clinic says a breast lift usually takes 1–2 hours, depending on how much work is being done.',
        sourceIds: ['cleveland-clinic-breast-lift'],
        caveat: "The sources disagree: Cleveland Clinic's own surgery center says two and a half to three hours. Not Alluring's time, which is an owner question; the copy attributes the range and says the surgeon tells you yours.",
    },

    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'stay-first-night',
        topic: 'recovery',
        concepts: ['stay', 'night'],
        figures: [{ value: 1, unit: 'night' }],
        statement:
            'Someone should drive you home and stay with you for at least the first night after surgery, ASPS advises.',
        sourceIds: ['asps-breast-lift-preparation'],
        caveat: 'Not a travel statement. How many nights to stay in Miami before flying home is an owner question.',
    },
    {
        id: 'sore-2-5-days',
        topic: 'recovery',
        concepts: ['sore', 'stiff'],
        figures: [{ min: 2, max: 5, unit: 'day' }],
        statement:
            'The Aesthetic Society says your chest may feel stiff and sore for 2 to 5 days.',
        sourceIds: ['aesthetic-society-breast-lift-recovery'],
    },
    {
        id: 'work-about-1-week',
        topic: 'recovery',
        concepts: ['work', 'desk', 'job'],
        figures: [{ value: 1, unit: 'week' }],
        statement:
            'Many women go back to desk work and gentle activities, such as walking, about 1 week after a breast lift, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-lift'],
        caveat: 'Desk work only; physical jobs are not addressed.',
    },
    {
        id: 'swelling-2-weeks',
        topic: 'recovery',
        concepts: ['swell', 'bruis', 'discomfort'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'Discomfort, swelling and bruising last about 2 weeks, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-lift'],
    },
    {
        id: 'no-lifting-2-weeks',
        topic: 'recovery',
        concepts: ['lift', 'driv', 'laundry', 'clean'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'The Aesthetic Society advises no lifting, driving, laundry or cleaning for the first 2 weeks.',
        sourceIds: ['aesthetic-society-breast-lift-recovery'],
        caveat: 'No weight limit is given anywhere. The surgeon clears driving.',
    },
    {
        id: 'young-children-1-week',
        topic: 'recovery',
        concepts: ['child'],
        figures: [{ value: 1, unit: 'week' }],
        statement:
            'If you have young children, arrange for someone to care for them for at least the first week, The Aesthetic Society advises.',
        sourceIds: ['aesthetic-society-breast-lift-preparation'],
        caveat: 'The source says children "less than five years of age"; the copy says "young children" so that no bare number appears.',
    },
    {
        id: 'surgical-bra-1-week',
        topic: 'recovery',
        concepts: ['bra'],
        figures: [{ value: 1, unit: 'week' }],
        statement:
            "Cleveland Clinic's surgery center has patients wear a surgical bra for the first week, then a support bra for several weeks.",
        sourceIds: ['cleveland-clinic-breast-lift-center'],
        caveat: "One center's protocol; the surgeon sets yours.",
    },
    {
        id: 'vigorous-up-to-6-weeks',
        topic: 'recovery',
        concepts: ['lifting', 'exercis', 'sex', 'vigorous'],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'Lifting, exercise and sex may not be cleared for up to 6 weeks, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-lift'],
    },
    {
        id: 'regular-bra-8-weeks',
        topic: 'recovery',
        concepts: ['bra', 'underwire'],
        figures: [
            { value: 8, unit: 'week' },
            { value: 3, unit: 'month' },
        ],
        statement:
            'Women can usually wear a regular bra about 8 weeks after surgery (Cleveland Clinic); Karen Horton, MD, quoted on the ASPS website, advises no underwire for at least 3 months.',
        sourceIds: ['cleveland-clinic-breast-lift', 'asps-horton-2025'],
        caveat: 'Horton speaks of breast surgery generally, and surgeons differ; she is quoted by name, never as a rule.',
    },
    {
        id: 'wait-after-breastfeeding-6-months',
        topic: 'procedure',
        concepts: ['breastfeed', 'lactation', 'nursing', 'settle'],
        figures: [{ value: 6, unit: 'month' }],
        statement:
            'Shahram Salemy, MD, writing on the ASPS website, suggests waiting up to 6 months after breastfeeding stops before breast surgery, so the breasts settle into their final shape.',
        sourceIds: ['asps-salemy-2022'],
        caveat: "One surgeon's view; others quoted by ASPS say three months to a year.",
    },

    // ── Results ──────────────────────────────────────────────────────────
    {
        id: 'scar-fades-1-year',
        topic: 'results',
        concepts: ['scar', 'fade'],
        figures: [{ value: 1, unit: 'year' }],
        statement:
            'Breast lift scars are permanent but fade a lot, most of it in about 1 year, Cleveland Clinic says.',
        sourceIds: [
            'cleveland-clinic-breast-lift-center',
            'cleveland-clinic-breast-lift',
        ],
        caveat: 'Never promise invisible or scarless results.',
    },
    {
        id: 'sensation-up-to-1-year',
        topic: 'results',
        concepts: ['sensation', 'numb'],
        figures: [{ value: 1, unit: 'year' }],
        statement:
            'Numbness in the nipples and breasts usually returns over a few weeks or months; some people are numb for up to 1 year, and rarely the loss is permanent, Cleveland Clinic says.',
        sourceIds: ['cleveland-clinic-breast-lift-center'],
        caveat: 'No source gives a rate for a lift alone: a 2014 review found the data insufficient (Ducic and colleagues). The FDA checklist\'s "up to 35%" is a worst case from implant studies and is never published as a lift risk.',
    },
    {
        id: 'sagging-risk-factors',
        topic: 'results',
        concepts: ['sag', 'pregnan', 'breastfe'],
        years: [2010],
        figures: [{ value: 132, unit: 'patient' }],
        statement:
            'In a study of 132 patients, the number of pregnancies and significant weight loss were linked to sagging, but breastfeeding was not (Rinker and colleagues, Annals of Plastic Surgery, 2010).',
        sourceIds: ['rinker-2010'],
        caveat: 'One center. Age, BMI, cup size and smoking were also risk factors.',
    },

    // ── Safety ───────────────────────────────────────────────────────────
    {
        id: 'thirty-day-complications',
        topic: 'safety',
        concepts: ['complication', 'reoperation', 'database'],
        years: [2005, 2018, 2021],
        figures: [
            { value: 30, unit: 'day' },
            { value: 2.5, unit: 'percent' },
            { value: 1.5, unit: 'percent' },
            { value: 1.4, unit: 'percent' },
        ],
        statement:
            'In a national surgical database, complications within 30 days followed 2.5% of breast lifts alone and 1.5% of lifts with implants, and reoperations were similar, 1.4% for a lift alone against 1.5% with implants (Ali and colleagues, Annals of Plastic Surgery, 2021).',
        sourceIds: ['ali-2021'],
        caveat: '30 days only, 2005–2018 data, mostly hospital programs. Never "2.5% of patients have complications".',
    },
    {
        id: 'lift-alone-review',
        topic: 'safety',
        concepts: ['complication', 'review', 'without implants', 'scar'],
        years: [2019],
        figures: [
            { value: 34, unit: 'study' },
            { value: 1888, unit: 'patient' },
            { value: 10.4, unit: 'percent' },
            { value: 3, unit: 'percent' },
            { value: 2.9, unit: 'percent' },
        ],
        statement:
            'A 2019 review of 34 studies and 1,888 patients who had a lift without implants found complications in 10.4%, most often scar problems (3%) and nipple and areola problems such as asymmetry or reduced sensation (2.9%) (di Summa and colleagues, Journal of Plastic, Reconstructive & Aesthetic Surgery, 2019).',
        sourceIds: ['di-summa-2019'],
        caveat: 'Studies from 1980 to 2016 with mixed techniques; minor complications included.',
    },
    {
        id: 'lift-with-implants-review',
        topic: 'safety',
        concepts: ['implant', 'operation', 'complication', 'review', 'follow'],
        years: [2014],
        figures: [
            { value: 23, unit: 'study' },
            { value: 10.7, unit: 'percent' },
            { value: 5.2, unit: 'percent' },
            { value: 13.1, unit: 'percent' },
            { value: 1, unit: 'year' },
        ],
        statement:
            'A 2014 review of 23 studies found that 10.7% of patients had another operation after a lift with implants in one surgery, most often because the breast sagged again (5.2%); complications of any kind followed 13.1%. Most of its studies followed patients for under 1 year (Khavanin and colleagues, Plastic and Reconstructive Surgery, 2014).',
        sourceIds: ['khavanin-2014'],
        caveat: 'The reoperation rate comes from 13 of the 23 studies. High heterogeneity, short follow-up.',
    },
    {
        id: 'one-or-two-surgeries',
        topic: 'safety',
        concepts: ['operation', 'surgery', 'reoperation', 'implant'],
        years: [2013],
        figures: [
            { value: 23.2, unit: 'percent' },
            { value: 10.2, unit: 'percent' },
        ],
        statement:
            "In one practice's review, reoperations after a lift with implants in one surgery (23.2%) were no more than the two operations' risks added together; after a lift alone, 10.2% had a reoperation (Calobrace and colleagues, Plastic and Reconstructive Surgery, 2013).",
        sourceIds: ['calobrace-2013'],
        caveat: 'One practice, about a third secondary cases. ASPS: implants go in at the same time or in a second procedure, depending on the surgeon; whether Alluring stages is an owner question.',
    },
    {
        id: 'complications-infrequent',
        topic: 'safety',
        concepts: ['complication', 'serious', 'uncommon', 'infrequent'],
        figures: [],
        statement:
            'The Aesthetic Society says significant complications from a breast lift are infrequent.',
        sourceIds: ['aesthetic-society-breast-lift-safety'],
    },

    // ── Law and the FDA ──────────────────────────────────────────────────
    {
        id: 'fda-ages',
        topic: 'law',
        concepts: ['saline', 'silicone', 'fda', 'implant'],
        figures: [
            { value: 18, unit: 'age' },
            { value: 22, unit: 'age' },
        ],
        statement:
            'The FDA approves saline implants for cosmetic breast surgery from age 18 and silicone gel implants from age 22.',
        sourceIds: ['fda-types-breast-implants'],
        caveat: "The FDA's approved ages for augmentation, not the practice's own age policy, which is an owner question.",
    },
    {
        id: 'fda-checklist',
        topic: 'law',
        concepts: ['checklist', 'boxed warning', 'fda'],
        years: [2021],
        figures: [],
        statement:
            'Since 2021, breast implants carry an FDA boxed warning, and your surgeon must review the FDA patient decision checklist with you before surgery, for you both to sign.',
        sourceIds: ['fda-things-to-consider'],
        caveat: 'The labeling orders of October 27, 2021.',
    },
    {
        id: 'fda-not-lifetime',
        topic: 'safety',
        concepts: ['lifetime', 'replace', 'fda'],
        figures: [],
        statement:
            'The FDA says breast implants are not lifetime devices: the longer you have them, the more likely you are to need them removed or replaced.',
        sourceIds: ['fda-things-to-consider', 'fda-types-breast-implants'],
        caveat: 'The FDA says implant life "cannot be predicted": never give a number of years.',
    },
    {
        id: 'fda-silicone-screening',
        topic: 'safety',
        concepts: ['ultrasound', 'mri', 'screen'],
        figures: [
            { min: 5, max: 6, unit: 'year' },
            { min: 2, max: 3, unit: 'year' },
        ],
        statement:
            'With silicone gel implants, the FDA recommends a first ultrasound or MRI 5–6 years after surgery, then every 2–3 years, even without symptoms.',
        sourceIds: ['fda-labeling-guidance-2020'],
        caveat: 'Silicone only.',
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
] as const satisfies readonly BreastLiftFact[]

export type BreastLiftFactId = (typeof breastLiftFacts)[number]['id']

const breastLiftLookups = createFactLookups(breastLiftFacts, 'breast lift')

export const getBreastLiftFact: (id: BreastLiftFactId) => BreastLiftFact =
    breastLiftLookups.fact

/** A figure as copy writes it: "$5,000", "1–2 hours", "2.5%", "age 18". */
export const formatBreastLiftFigure = formatProcedureFigure

/** The first (or `index`th) figure of a fact, formatted. */
export const breastLiftFigure: (
    id: BreastLiftFactId,
    index?: number
) => string = breastLiftLookups.figure
