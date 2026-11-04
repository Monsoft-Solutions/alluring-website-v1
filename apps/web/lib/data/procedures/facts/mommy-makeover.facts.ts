/**
 * Mommy makeover facts: every figure the mommy makeover page and its four
 * recovery posts are allowed to publish, stated once.
 *
 * The page module reads its figures from here, and
 * `scripts/check-procedure-copy.ts --slug mommy-makeover-miami` fails any copy
 * on the built page that states a figure not declared below, or a declared
 * figure in a sentence about something else. `blog/tools/consistency.py` reads
 * this file for the mommy makeover cluster's posts.
 *
 * Every source was read on 2026-11-03: the ASPS, Aesthetic Society, Cleveland
 * Clinic, FDA and MedlinePlus pages from their own text, the Florida rule from
 * its official .doc on flrules.org, the studies from their PubMed abstracts.
 * RealSelf blocks automated reads and is not a source here. Surgeon-written
 * posts on the ASPS website are attributed to their author, because ASPS says
 * they are the author's views, not the society's, and surgeons quoted in an
 * ASPS article are "quoted by ASPS". Each fact carries the attribution the
 * copy must use and, in `caveat`, what the source does not say.
 *
 * A source about a tummy tuck speaks for a tummy tuck, and a source about a
 * breast lift for a breast lift. Their figures are stated as that, never as a
 * mommy makeover's. Where The Aesthetic Society gives a mommy makeover figure,
 * that figure leads.
 *
 * The practice's own figures come from its printed price sheet of 2026-09-15
 * (`docs/pricing/practice-price-list.md`) and are stated as Alluring's. The
 * sheet has no mommy makeover line, so nothing here is a total: see `no-total`.
 * If the owner confirms how a plan is priced, add the examples as new
 * `price-example-*` facts and the page's empty `planExamples` list renders them.
 *
 * Not here, because only the practice can answer them (README section 12 of
 * the 2026-10-05 cluster plan): typical surgery length and when a plan is split
 * into two surgeries, an overnight stay, drains or a drainless technique, the
 * garment schedule at Alluring, nights to stay in Miami, what a price includes.
 *
 * These must not appear in any mommy makeover copy, and none is declared here
 * (README section 4): "10–15 pounds", "10 pounds" or "5 pounds" lifting limits,
 * "8–12 weeks" for exercise, a "6–8 weeks" garment total, "12–16 hours",
 * "100.4°F", "101°F", "75°F", "73%", "SPF 50+", "3–5 hours" or "4–6 hours" of
 * surgery, "$12,000–$25,000", "599,862", "1–4%" infection, and "12–18 months"
 * for complete healing.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read it.
 */

import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '../../surgeons/karlinsky-credentials.constant'
import {
    createFactLookups,
    formatProcedureFigure,
    type ProcedureFact,
    type ProcedureSource,
} from './procedure-facts'

export type MommyMakeoverSourceId =
    | 'asps-mommy-makeover'
    | 'asps-mommy-makeover-candidates'
    | 'asps-mommy-makeover-recovery'
    | 'asps-mommy-makeover-cost'
    | 'asps-postpartum-2024'
    | 'asps-campanile-2018'
    | 'asps-maman-2023'
    | 'asps-wu-2019'
    | 'asps-salemy-2019'
    | 'asps-salemy-2022'
    | 'asps-vitenas-2018'
    | 'asps-weiler-2023'
    | 'asps-horton-2025'
    | 'asps-tummy-tuck'
    | 'asps-tummy-tuck-cost'
    | 'asps-tummy-tuck-results'
    | 'asps-breast-augmentation-cost'
    | 'asps-breast-lift-cost'
    | 'aesthetic-society-mommy-makeover'
    | 'aesthetic-society-aftercare'
    | 'aesthetic-society-preparing'
    | 'aesthetic-society-breast-lift-recovery'
    | 'aesthetic-society-liposuction-recovery'
    | 'cleveland-clinic-mommy-makeovers'
    | 'cleveland-clinic-tummy-tuck-scar'
    | 'cleveland-clinic-breast-lift'
    | 'cleveland-clinic-breast-lift-center'
    | 'fda-implant-risks'
    | 'medlineplus-wound-care'
    | 'medlineplus-dvt'
    | 'winocour-2015'
    | 'winocour-2017'
    | 'hardy-2014'
    | 'skorochod-wolf-2026'
    | 'mittal-2020'
    | 'karunaratne-2023'
    | 'florida-rule-64b8-9-009'
    | 'alluring-practice'

export type MommyMakeoverSource = ProcedureSource<MommyMakeoverSourceId>

export const mommyMakeoverSources: readonly MommyMakeoverSource[] = [
    {
        id: 'asps-mommy-makeover',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Mommy Makeover',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/mommy-makeover',
        attribution:
            'Read on 2026-11-03: "The goal of a mommy makeover is to restore the shape and appearance of a woman\'s body after childbearing." It lists breast augmentation, breast lift, buttock augmentation, labiaplasty, liposuction and tummy tuck as possible parts. "A mommy makeover is typically performed as a single-stage procedure." No figures on the page.',
    },
    {
        id: 'asps-mommy-makeover-candidates',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Who is a good candidate for a mommy makeover?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/mommy-makeover/candidates',
        attribution:
            'Read on 2026-11-03: "You are in good medical health", "You are at your ideal body weight", "You have a positive outlook and realistic expectations", "You are finished with childbearing". No BMI figure and no months after birth.',
    },
    {
        id: 'asps-mommy-makeover-recovery',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What should I expect during my mommy makeover recovery?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/mommy-makeover/recovery',
        attribution:
            'Read on 2026-11-03: "An elastic bandage or support bra will minimize swelling and support the breasts." "A compression garment may also be used to control swelling in the abdomen, waist and buttocks." On drains it only tells readers to ask: "Will there be drains? For how long?" No number of weeks: healing continues "for several weeks".',
    },
    {
        id: 'asps-mommy-makeover-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Mommy Makeover Cost',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/mommy-makeover/cost',
        attribution:
            'Read on 2026-11-03: "The average cost for a mommy makeover will vary based on the chosen surgeries to be performed." It gives no dollar figure and no average. Costs "may include" the surgeon\'s fee, hospital or surgical facility costs, anesthesia fees, prescriptions for medication, implants, post-surgery garments, and medical tests and x-rays. It does not mention insurance.',
    },
    {
        id: 'asps-postpartum-2024',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Mommy makeovers: what women should know about postpartum surgical procedures',
        authors:
            'Alia Willson, quoting Kristy Hamilton, MD, and Nneamaka Nwubah, MD',
        date: '2024-05-10',
        url: 'https://www.plasticsurgery.org/news/articles/mommy-makeovers-what-women-should-know-about-postpartum-surgical-procedures',
        attribution:
            'Read on 2026-11-03. An ASPS article quoting two member surgeons. Hamilton: "I tell patients to give it at least six months, and if you are still changing, you\'re still losing weight and toning up, you want to push it as far as you can." "I like them not to be breastfeeding for a minimum of six weeks, preferably three months before we consider surgery." Nwubah: "there is no one steadfast rule. For me, the sweet spot is one year." "These are not weight loss surgeries. They are meant to fine-tune things." Say "quoted by ASPS", never "ASPS recommends".',
    },
    {
        id: 'asps-campanile-2018',
        publisher: 'ASPS website, a post by Frank Campanile, MD',
        title: 'What to expect during your mommy makeover recovery',
        date: '2018-10-05',
        url: 'https://www.plasticsurgery.org/news/blog/what-to-expect-during-your-mommy-makeover-recovery',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post; ASPS says blog posts are the author\'s views. "most women plan to take about two weeks away from work to rest and recover at home." "Usually, around the three-month mark, you can return to your normal activities." "it can take six months to a year before you see your final mommy makeover results." It says nothing about drains, garments or driving.',
    },
    {
        id: 'asps-maman-2023',
        publisher: 'ASPS website, a post by Daniel Maman, MD',
        title: 'The importance of compression after plastic surgery',
        date: '2023-09-25',
        url: 'https://www.plasticsurgery.org/news/blog/the-importance-of-compression-after-plastic-surgery',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post about plastic surgery in general, not mommy makeovers. "Your compression garment should be worn day and night" for "anywhere between one to three weeks", excluding showering or bathing; once the surgeon approves, "you can expect to wear the garment at night for several weeks."',
    },
    {
        id: 'asps-wu-2019',
        publisher: 'ASPS website, a post by Cindy Wu, MD',
        title: 'Answers to common tummy tuck questions',
        date: '2019-12-17',
        url: 'https://www.plasticsurgery.org/news/blog/answers-to-common-tummy-tuck-questions',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post on tummy tucks. "You will be bent at the waist while standing or lying down for 7-10 days after surgery"; a drain "will be removed as soon as the output is low enough (usually in 1-2 weeks)"; "You can walk the day of surgery", to keep the risk of blood clots low; "running or lifting should be avoided for six weeks"; "Patients typically return to work in approximately two weeks"; swelling diminishes "until approximately three months"; scars "thinner and lighter in color at around 12-18 months"; a compression garment "worn for 4-6 weeks".',
    },
    {
        id: 'asps-salemy-2019',
        publisher: 'ASPS website, a post by Shahram Salemy, MD',
        title: 'What you need to know about your tummy tuck recovery',
        date: '2019-07-19',
        url: 'https://www.plasticsurgery.org/news/blog/what-you-need-to-know-about-your-tummy-tuck-recovery',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post on tummy tucks. "squatting or picking up children (or heavy objects for that matter) for the first few weeks is strongly advised against." "driving, cooking or shopping is often manageable after a week or two." "most patients begin feeling more normal around the eight-week mark." No weight limit for lifting.',
    },
    {
        id: 'asps-salemy-2022',
        publisher: 'ASPS website, a post by Shahram Salemy, MD',
        title: 'Better breasts after pregnancy and breastfeeding',
        date: '2022-02-08',
        url: 'https://www.plasticsurgery.org/news/blog/better-breasts-after-pregnancy-and-breastfeeding',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post. "For most women, it is best to wait up to six months after lactation has stopped." One surgeon\'s view; others quoted by ASPS say six weeks to three months.',
    },
    {
        id: 'asps-vitenas-2018',
        publisher: 'ASPS website, a post by Paul Vitenas, MD',
        title: 'Five things to consider before getting a tummy tuck',
        date: '2018-02-23',
        url: 'https://www.plasticsurgery.org/news/blog/five-things-to-consider-before-getting-a-tummy-tuck',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post. "It is important that you be close to your desired weight for six to twelve months before undergoing a tummy tuck." "In most cases, the drains are painlessly removed in seven to ten days", though they may need to stay for two weeks or longer.',
    },
    {
        id: 'asps-weiler-2023',
        publisher: 'ASPS website, a post by Jonathan Weiler, MD',
        title: 'Your guide to a tummy tuck – before, during and after',
        date: '2023-06-07',
        url: 'https://www.plasticsurgery.org/news/blog/your-guide-to-a-tummy-tuck-before-during-and-after',
        attribution:
            'Read on 2026-11-03. A surgeon\'s post. "For a full tummy tuck, the scar typically extends from hip bone to hip bone and around the navel." The incision is made "straight and as low as possible" "so that underwear or swimsuit bottoms easily conceal the scar."',
    },
    {
        id: 'asps-horton-2025',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Finding comfort after breast surgery: A guide to compression bras and postsurgical garments',
        authors: 'Quoting Karen Horton, MD, and Kelly Killeen, MD',
        date: '2025-10-30',
        url: 'https://www.plasticsurgery.org/news/articles/finding-comfort-after-breast-surgery-a-guide-to-compression-bras-and-postsurgical-garments',
        attribution:
            'Read on 2026-11-03. Horton: "No underwire for at least three months." Killeen: "Most women can return to their normal bras in about one month." The two differ, so attribute each. It gives no length of time for compression bras.',
    },
    {
        id: 'asps-tummy-tuck',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'Tummy Tuck',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck',
        attribution:
            'Read on 2026-11-03: a tummy tuck "removes excess fat and skin and, in most cases, restores weakened or separated muscles"; "women who may be considering future pregnancies would be advised to postpone a tummy tuck".',
    },
    {
        id: 'asps-tummy-tuck-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does a tummy tuck cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/cost',
        attribution:
            'Read on 2026-11-03: "The average cost of a tummy tuck (abdominoplasty) is $8,174"; "This average cost is only part of the total price – it does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans do not cover tummy tuck surgery or its complications." The page gives no year, so neither does the copy.',
    },
    {
        id: 'asps-tummy-tuck-results',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'What results can I expect from a tummy tuck?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/tummy-tuck/results',
        attribution:
            'Read on 2026-11-03: "In women who have undergone cesarean section, the existing scars may be incorporated into the new scar."',
    },
    {
        id: 'asps-breast-augmentation-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does breast augmentation cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-augmentation/cost',
        attribution:
            'Read on 2026-11-03: "average cost of breast augmentation with implants is $4,875"; it "does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans will not cover cosmetic breast augmentation costs." No year.',
    },
    {
        id: 'asps-breast-lift-cost',
        publisher: 'American Society of Plastic Surgeons (ASPS)',
        title: 'How much does a breast lift cost?',
        url: 'https://www.plasticsurgery.org/cosmetic-procedures/breast-lift/cost',
        attribution:
            'Read on 2026-11-03: "average cost of a breast lift (mastopexy) is $6,816"; "it does not include anesthesia, operating room facilities or other related expenses." "Most health insurance plans do not cover breast lift surgery or its complications." No year.',
    },
    {
        id: 'aesthetic-society-mommy-makeover',
        publisher: 'The Aesthetic Society',
        title: 'Mommy Makeover',
        url: 'https://www.theaestheticsociety.org/procedures/body/mommy-makeover',
        attribution:
            'Read on 2026-11-03. No review date on the page. The combination "typically focuses on your breasts and abdomen": a tummy tuck; a breast lift, augmentation or reduction; liposuction. "You need to be in overall good health without untreated medical conditions, such as diabetes or heart disease." "Pregnancy or weight gain following these surgeries may compromise your results." "You will likely have scars following these procedures hidden in your bikini line or under your bra." "If you get breast implants, you will need to replace them over time." "The recovery time is at least two weeks but could be longer depending on your specific combination of procedures." "Smoking slows down the healing process and increases the risk of serious complications." No surgery length and no cost.',
    },
    {
        id: 'aesthetic-society-aftercare',
        publisher: 'The Aesthetic Society',
        title: 'Mommy makeover: aftercare and recovery',
        url: 'https://www.theaestheticsociety.org/procedures/body/mommy-makeover/aftercare-recovery',
        attribution:
            'Read on 2026-11-03. No review date on the page. "Arrange for someone to help you get around the house and help with your medication for at least the first 24 hours after surgery." "You will likely go for a follow-up evaluation with your surgeon within five days." "You may shower once the dressing, sponges, and gauze pads are removed. This usually occurs within 72 hours." "If you have traditional sutures, you will typically have these removed within the first week or two." "The recovery period is significant and can be intense the first few days." "The first week will be the worst, and you may still feel like you are recovering for two to three weeks." "You won\'t feel like yourself for at least seven to ten days." "Plan to take about two weeks off from work, depending on the physical demands of your job." "You may be comfortable enough to drive a car in two or three weeks or when all of your sutures and drains are removed and you are no longer taking pain medication." "you still shouldn\'t do any heavy lifting (such as picking up your children or baskets of laundry) for four to six weeks." "If you have small children, you must put someone else totally in charge of their care for at least two weeks." "You will probably need to wait six weeks after surgery before attempting any strenuous activities." "Fading and flattening of scars take six months to two years." "You will need to wear an abdominal binder after a tummy tuck." "You may be up and walking within hours of surgery". It gives no garment schedule and no weight limit.',
    },
    {
        id: 'aesthetic-society-preparing',
        publisher: 'The Aesthetic Society',
        title: 'Mommy makeover: preparing for your procedure',
        url: 'https://www.theaestheticsociety.org/procedures/body/mommy-makeover/preparing-your-procedure',
        attribution:
            'Read on 2026-11-03. For children under five, "you must have someone take care of them for at least the first two weeks". "Establish a no-fail support system for the full recovery period." "Under no circumstances will you be permitted to go home alone or stay home without another adult present." Your surgeon "will give you an estimate for how long your surgery will last": no figure. "whether you stay overnight at a recovery center depends on many variables": never a claim about Alluring.',
    },
    {
        id: 'aesthetic-society-breast-lift-recovery',
        publisher: 'The Aesthetic Society',
        title: 'Breast lift: aftercare and recovery',
        url: 'https://www.theaestheticsociety.org/procedures/breast/breast-lift/aftercare-recovery',
        attribution:
            'Read on 2026-11-03: "You must not lift, drive, do laundry, or clean during the first two weeks." About a breast lift alone. No weight limit.',
    },
    {
        id: 'aesthetic-society-liposuction-recovery',
        publisher: 'The Aesthetic Society',
        title: 'Liposuction: aftercare and recovery',
        url: 'https://www.theaestheticsociety.org/procedures/body/liposuction/aftercare-recovery',
        attribution:
            'Read on 2026-11-03: "You will wear a compression garment over the treated areas for four to six weeks". About liposuction alone.',
    },
    {
        id: 'cleveland-clinic-mommy-makeovers',
        publisher: 'Cleveland Clinic',
        title: 'Mommy Makeovers: How They Work and What To Expect',
        authors: 'Quoting J. Vicente Poblete, MD',
        date: '2025-10-01',
        url: 'https://health.clevelandclinic.org/mommy-makeovers',
        attribution:
            'Published 2025-10-01, read on 2026-11-03: "Future pregnancies can undo some of the effects of previous treatments." "Often, surgeons recommend no heavy lifting or strenuous exercise for the first four to six weeks." "You\'ll need to quit smoking for at least six weeks prior to surgery." You may need to "take a week or two off from work". "Although popular, they aren\'t right for everyone." It gives no surgery length and no wait after pregnancy.',
    },
    {
        id: 'cleveland-clinic-tummy-tuck-scar',
        publisher: 'Cleveland Clinic',
        title: 'Tummy Tuck Scar',
        date: '2022-08-16',
        url: 'https://my.clevelandclinic.org/health/treatments/24004-tummy-tuck-scar',
        attribution:
            'Last updated 08/16/2022, read on 2026-11-03: a full tummy tuck scar "usually spans your abdomen, from hip bone to hip bone, just above your pubic area"; avoid heavy lifting and strenuous exercise until cleared, "usually four to eight weeks after the procedure"; "For 12 to 18 months after your tummy tuck, wear sunscreen with an SPF" of 30 if you must be in the sun.',
    },
    {
        id: 'cleveland-clinic-breast-lift',
        publisher: 'Cleveland Clinic',
        title: 'Breast Lift (Mastopexy)',
        date: '2022-06-19',
        url: 'https://my.clevelandclinic.org/health/treatments/23298-breast-lift',
        attribution:
            'Last updated 06/19/2022, read on 2026-11-03: "Usually, women can wear a regular bra about eight weeks after surgery." About a breast lift alone.',
    },
    {
        id: 'cleveland-clinic-breast-lift-center',
        publisher: 'Cleveland Clinic',
        title: 'Breast Lift, Cosmetic and Plastic Surgery department',
        url: 'https://my.clevelandclinic.org/cosmetic-plastic-surgery/procedures/breast-lift',
        attribution:
            'Read on 2026-11-03: "You\'ll need to wear a surgical bra for the first week after surgery, followed by a support bra for several weeks after that." The department describing its own practice.',
    },
    {
        id: 'fda-implant-risks',
        publisher: 'US Food and Drug Administration (FDA)',
        title: 'Risks and Complications of Breast Implants',
        date: '2023-12-15',
        url: 'https://www.fda.gov/medical-devices/breast-implants/risks-and-complications-breast-implants',
        attribution:
            'Content current as of 12/15/2023, read on 2026-11-03: "Breast implants are not considered lifetime devices." "The longer people have them, the greater the chances are that they will develop complications." "Some complications will require more surgery."',
    },
    {
        id: 'medlineplus-wound-care',
        publisher: 'MedlinePlus (US National Library of Medicine)',
        title: 'Surgical wound care – closed',
        date: '2026-04-11',
        url: 'https://medlineplus.gov/ency/patientinstructions/000738.htm',
        attribution:
            'Review date 4/11/2026, read on 2026-11-03. Call about "More redness or pain", "Swelling or bleeding", "The wound is larger or deeper", "The wound looks dried out or dark"; drainage that increases or "becomes thick, tan, green, or yellow, or smells bad (pus)"; a temperature "above 100°F (37.7°C) for more than 4 hours". General wound care, not specific to a mommy makeover.',
    },
    {
        id: 'medlineplus-dvt',
        publisher: 'MedlinePlus (US National Library of Medicine)',
        title: 'Deep venous thrombosis',
        date: '2025-04-01',
        url: 'https://medlineplus.gov/ency/article/000156.htm',
        attribution:
            'Review date 4/1/2025, read on 2026-11-03. Symptoms: "Redness of the skin", "Skin that feels warm to the touch", "Swelling (edema) of a leg or arm", "Pain or tenderness in a leg or arm". "Go to the emergency room or call the local emergency number (such as 911)" with chest pain, coughing up blood, difficulty breathing, fainting, loss of consciousness or other severe symptoms.',
    },
    {
        id: 'winocour-2015',
        publisher: 'Plastic and Reconstructive Surgery',
        title: 'Abdominoplasty: Risk Factors, Complication Rates, and Safety of Combined Procedures',
        authors: 'Winocour J and colleagues',
        date: '2015',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26505716/',
        attribution:
            'Plast Reconstr Surg 2015;136(5):597e–606e, abstract read in PubMed (26505716) on 2026-11-03. CosmetAssure database, 2008–2013, 25,478 abdominoplasties, major complications: 4.0 percent overall; "abdominoplasty alone, 3.1 percent; with liposuction, 3.8 percent; breast procedure, 4.3 percent; liposuction and breast procedure, 4.6 percent; body-contouring procedure, 6.8 percent; liposuction and body-contouring procedure, 10.4 percent". Of the complications, "31.5 percent were hematomas, 27.2 percent were infections and 20.2 percent were suspected or confirmed venous thromboembolism". Risk factors included age 55 or older (relative risk 1.4), BMI 30 or more (1.3) and multiple procedures (1.5). It also found higher risk in a hospital or surgical center than in an office suite (1.6): not quoted, because sicker patients and bigger surgery may go there. The abstract does not define the window.',
    },
    {
        id: 'winocour-2017',
        publisher: 'Aesthetic Surgery Journal',
        title: 'Venous Thromboembolism in the Cosmetic Patient: Analysis of 129,007 Patients',
        authors: 'Winocour J and colleagues',
        date: '2017',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28207041/',
        attribution:
            'Aesthet Surg J 2017;37(3):337–349, abstract read in PubMed (28207041) on 2026-11-03. CosmetAssure, 2008–2013, clinically significant clots within 30 days: 116 of 129,007 (0.09%). "Combined procedures had a significantly higher overall rate of VTE compared to solitary procedures (0.20% vs 0.04%, P < .01)." Face 0.01%, breast 0.01%, combined face and body 0.16%, body 0.21%, combined body and breast 0.28%. "The incidence of VTE after cosmetic procedures is relatively low."',
    },
    {
        id: 'hardy-2014',
        publisher: 'Aesthetic Surgery Journal',
        title: 'The impact of operative time on complications after plastic surgery: a multivariate regression analysis of 1753 cases',
        authors: 'Hardy KL and colleagues',
        date: '2014',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24696297/',
        attribution:
            'Aesthet Surg J 2014;34(4):614–622, abstract read in PubMed (24696297) on 2026-11-03. 1,753 cases at UT Southwestern, 2008–2012, a broad mix of complex plastic surgery averaging 4.9 procedures per case. "Each hour increase in surgery duration was associated with a 21% rise in odds of morbidity." No change "until after 3.1 hours of surgery (odds ratio, 1.6)", then 3.1 times the odds after 4.5 hours and 4.7 times after 6.8 hours. Its 27.8% overall rate counts complications of every grade in that mix and is not quoted.',
    },
    {
        id: 'skorochod-wolf-2026',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Risk of Concomitant Abdominoplasty and Breast Surgery versus Isolated Procedures: A Systematic Review and Meta-analysis',
        authors: 'Skorochod R, Wolf Y',
        date: '2026',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42089979/',
        attribution:
            'Aesthetic Plast Surg 2026;50(13):5013–5022, abstract read in PubMed (42089979) on 2026-11-03; the full text is behind a paywall and was not read. "Eight studies encompassing 138,020 patients". No significant difference overall against isolated procedures (OR 1.11; 95% CI 0.63-1.96; I2 = 97.9%); against a tummy tuck alone OR 0.66 (0.37-1.16), not significant; against breast surgery alone OR 2.71 (1.74-4.23). "Certainty of evidence ranged from moderate to very low." "combined procedures are generally safe in carefully selected patients." The abstract\'s three group sizes (9,422, 11,700 and 106,898) add up to 128,020, not 138,020.',
    },
    {
        id: 'mittal-2020',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'Venous Thromboembolism (VTE) Prophylaxis After Abdominoplasty and Liposuction: A Review of the Literature',
        authors: 'Mittal P and colleagues',
        date: '2020',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31858207/',
        attribution:
            'Aesthetic Plast Surg 2020;44(2):473–482, abstract read in PubMed (31858207) on 2026-11-03: "Abdominoplasty has the highest occurrence of VTE among aesthetic procedures. A higher incidence of VTE was noted when abdominoplasty was combined with liposuction." "Preoperative risk stratification should be performed for all patients." A literature review; it gives no single rate.',
    },
    {
        id: 'karunaratne-2023',
        publisher: 'Aesthetic Plastic Surgery',
        title: 'The Safety and Effects of Pregnancy after Abdominoplasty: A Systematic Review of the Literature',
        authors: 'Karunaratne YG and colleagues',
        date: '2023',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37266593/',
        attribution:
            'Aesthetic Plast Surg 2023;47(4):1472–1479, abstract read in PubMed (37266593) on 2026-11-03: "17 studies encompassing 237 patients"; "There were no neonatal or maternal mortalities in any study"; "Pregnancy should not be contraindicated after abdominoplasty." It speaks to safety for mother and baby, not to whether the result lasts.',
    },
    {
        id: 'florida-rule-64b8-9-009',
        publisher: 'Florida Board of Medicine',
        title: 'Rule 64B8-9.009, Standard of Care for Office Surgery',
        date: '2024-09-16',
        url: 'https://www.flrules.org/gateway/ruleNo.asp?id=64B8-9.009',
        attribution:
            'Read on 2026-11-03 from the rule\'s official .doc, history ending 9-16-24. (2)(e)1: "When combined with abdominoplasty, liposuction may not exceed 1000cc of supernatant fat". (2)(g): "the maximum planned duration of all surgical procedures combined must not exceed 8 hours" and the patient must be discharged "within 24 hours of presenting to the office for surgery". (2)(p): the surgeon gives the patient, "in writing, prior to the procedure, the name and location of the hospital" where the surgeon has privileges or a transfer agreement. All of it governs surgery in a physician\'s office, not hospitals or licensed surgery centers. Never claim where Alluring operates until the owner confirms it.',
    },
    {
        id: 'alluring-practice',
        publisher: 'Alluring Plastic Surgery',
        attribution:
            "The practice's own figures: each part's price and the combination discount, from its printed price sheet of 2026-09-15 (`docs/pricing/practice-price-list.md`). List prices; whether they are before or after the sheet's handwritten \"20% off\" is still open with the owner. The sheet has no mommy makeover line. State them as Alluring's, not as a society's guidance. The surgeon statement comes from the owner (2026-09-19) and `karlinsky-credentials.constant.ts`.",
    },
]

export type MommyMakeoverFact = ProcedureFact<MommyMakeoverSourceId>

export const mommyMakeoverFacts = [
    // ── Price: the parts (the practice's price sheet of 2026-09-15) ──────
    {
        id: 'no-total',
        topic: 'price',
        concepts: ['total', 'part'],
        figures: [],
        statement:
            "Alluring publishes each part's price and no mommy makeover total: the total depends on the parts in your plan, and your surgeon confirms your price at your consultation.",
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet has no mommy makeover line. Never write a total, a "from" price for the whole plan, a range for the whole plan or a worked example until the owner answers how a plan is priced (README section 12, question 1). Never add part prices together in copy.',
    },
    {
        id: 'price-mini-tummy-tuck',
        topic: 'price',
        concepts: ['mini', 'tummy tuck', 'abdominoplastia'],
        figures: [{ value: 3000, unit: 'usd' }],
        statement:
            'A mini tummy tuck at Alluring is $3,000. It does not include muscle repair.',
        sourceIds: ['alluring-practice'],
        caveat: 'Matches `tummy-tuck.facts.ts` price-mini. The sheet: "Tummy Tuck - Mini (no muscle repair)". Never state it as the price of a mommy makeover.',
    },
    {
        id: 'price-extended-mini-tummy-tuck',
        topic: 'price',
        concepts: ['extended mini', 'tummy tuck'],
        figures: [{ value: 4000, unit: 'usd' }],
        statement:
            'An extended mini tummy tuck at Alluring is $4,000: a hip-to-hip incision, without muscle repair.',
        sourceIds: ['alluring-practice'],
        caveat: 'Matches `tummy-tuck.facts.ts` price-extended-mini.',
    },
    {
        id: 'price-full-tummy-tuck',
        topic: 'price',
        concepts: ['full', 'regular', 'tummy tuck', 'completa'],
        figures: [{ value: 4500, unit: 'usd' }],
        statement:
            'A full tummy tuck at Alluring, the price list\'s "regular", is $4,500, for loose skin that doesn\'t extend to the hips.',
        sourceIds: ['alluring-practice'],
        caveat: 'Matches `tummy-tuck.facts.ts` price-full. The sheet does not say it includes muscle repair; the copy says ASPS\'s "in most cases" and that the surgeon decides at the exam.',
    },
    {
        id: 'price-extended-tummy-tuck',
        topic: 'price',
        concepts: ['extended', 'tummy tuck'],
        figures: [{ value: 5500, unit: 'usd' }],
        statement:
            'An extended tummy tuck at Alluring is $5,500, with a hip-to-hip incision.',
        sourceIds: ['alluring-practice'],
        caveat: 'Matches `tummy-tuck.facts.ts` price-extended.',
    },
    {
        id: 'price-augmentation-saline',
        topic: 'price',
        concepts: ['saline', 'augmentation', 'implant', 'aumento'],
        figures: [{ value: 3500, unit: 'usd' }],
        statement:
            'Breast augmentation at Alluring is $3,500 with saline implants.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Augmentation - Saline". Whether the implants are in the price is an owner question.',
    },
    {
        id: 'price-augmentation-silicone',
        topic: 'price',
        concepts: ['silicone', 'augmentation', 'implant', 'aumento'],
        figures: [{ value: 4500, unit: 'usd' }],
        statement:
            'Breast augmentation at Alluring is $4,500 with silicone implants.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Augmentation - Silicone".',
    },
    {
        id: 'price-lift',
        topic: 'price',
        concepts: ['breast lift', 'levantamiento'],
        figures: [{ value: 5000, unit: 'usd' }],
        statement: 'A breast lift without implants at Alluring is $5,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - NO IMPLANTS". The sheet\'s $4,000 modified lift is left to the breast lift page. The sweep\'s "5,000+" rule also matches this price, so the page\'s config must clear "$5,000" as a neutral name.',
    },
    {
        id: 'price-lift-saline',
        topic: 'price',
        concepts: ['saline', 'breast lift'],
        figures: [{ value: 6000, unit: 'usd' }],
        statement: 'A breast lift with saline implants at Alluring is $6,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - Saline". Whether a lift with implants counts as one procedure or two for the combination discount is an owner question.',
    },
    {
        id: 'price-lift-silicone',
        topic: 'price',
        concepts: ['silicone', 'breast lift'],
        figures: [{ value: 7000, unit: 'usd' }],
        statement:
            'A breast lift with silicone implants at Alluring is $7,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Breast Lift - Silicone". Same owner question as the saline lift.',
    },
    {
        id: 'price-reduction',
        topic: 'price',
        concepts: ['reduction', 'reducci'],
        figures: [
            { min: 6000, max: 9000, unit: 'usd' },
            { value: 6000, unit: 'usd' },
            { value: 8000, unit: 'usd' },
            { value: 9000, unit: 'usd' },
        ],
        statement:
            'A breast reduction at Alluring is $6,000 for small to medium, $8,000 for large and $9,000 for extra large.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet: "Reduction - SM-MED", "LG", "Ex LG". The Aesthetic Society lists a reduction among the breast options, and the gallery holds mommy makeovers with one. The breast reduction page still publishes $6,500 in `priceFrom` (#232).',
    },
    {
        id: 'price-lipo-360',
        topic: 'price',
        concepts: ['lipo 360', 'lipo', 'liposuc'],
        figures: [{ value: 4000, unit: 'usd' }],
        statement: 'Lipo 360 at Alluring is $4,000.',
        sourceIds: ['alluring-practice'],
        caveat: 'Matches `lipo.facts.ts` price-starting-at. Florida limits liposuction with a tummy tuck in an office (florida-1000cc), so never imply Lipo 360 always fits in the same surgery.',
    },
    {
        id: 'price-lipo-add-on',
        topic: 'price',
        concepts: ['liposuction', 'lipo', 'flank'],
        figures: [{ value: 1500, unit: 'usd' }],
        statement:
            'Liposuction of the abdomen and flanks, added to another procedure, is $1,500.',
        sourceIds: ['alluring-practice'],
        caveat: 'An add-on on the sheet ("Lipo Abdomen/Flanks"), priced on top of another procedure. Whether an add-on counts as a procedure for the combination discount is an owner question.',
    },
    {
        id: 'price-combination-discount',
        topic: 'price',
        concepts: ['combin', 'discount', 'procedures', 'procedimientos'],
        figures: [
            { value: 500, unit: 'usd' },
            { value: 1000, unit: 'usd' },
        ],
        statement:
            'When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three.',
        sourceIds: ['alluring-practice'],
        caveat: 'The sheet\'s "Combination discounts". State it as it is live today: no percentage, no "20% off", no struck-through price, and never applied to a named combination. Counsel\'s statement under Florida 456.062 is still pending, and the owner has not said which combinations count.',
    },
    {
        id: 'asps-no-average',
        topic: 'price',
        concepts: ['average', 'may include'],
        figures: [],
        statement:
            "ASPS publishes no average for a mommy makeover: it says the average varies with the surgeries chosen, and that costs may include the surgeon's fee, the facility, anesthesia, medication, implants, garments and medical tests.",
        sourceIds: ['asps-mommy-makeover-cost'],
        caveat: "Competitor pages and AI answers quote totals as if a national figure existed. CareCredit publishes its own survey figure ($34,189): not a society's, and not used.",
    },
    {
        id: 'asps-average-fee-tummy-tuck',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 8174, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of a tummy tuck at $8,174, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-tummy-tuck-cost'],
        caveat: 'A national surgeon-fee average for that part alone, not a Miami price and not an all-in price: always say what it leaves out. No year. Never add the three averages together.',
    },
    {
        id: 'asps-average-fee-augmentation',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 4875, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of breast augmentation with implants at $4,875, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-breast-augmentation-cost'],
        caveat: 'Same limits as asps-average-fee-tummy-tuck.',
    },
    {
        id: 'asps-average-fee-lift',
        topic: 'price',
        concepts: ['average', 'surgeon'],
        figures: [{ value: 6816, unit: 'usd' }],
        statement:
            "The American Society of Plastic Surgeons puts the average cost of a breast lift at $6,816, a surgeon's fee that does not include anesthesia, operating room facilities or other related expenses.",
        sourceIds: ['asps-breast-lift-cost'],
        caveat: 'Same limits as asps-average-fee-tummy-tuck.',
    },
    {
        id: 'insurance',
        topic: 'price',
        concepts: ['insurance', 'seguro'],
        figures: [],
        statement:
            'ASPS says most health insurance plans do not cover tummy tuck or breast lift surgery or their complications, and will not cover cosmetic breast augmentation.',
        sourceIds: [
            'asps-tummy-tuck-cost',
            'asps-breast-lift-cost',
            'asps-breast-augmentation-cost',
        ],
        caveat: 'ASPS\'s mommy makeover cost page does not mention insurance, so this is stated part by part. The old line that diastasis recti "may qualify" has no source and is gone.',
    },

    // ── What it is, and who performs it ──────────────────────────────────
    {
        id: 'definition',
        topic: 'procedure',
        concepts: ['mommy makeover', 'childbearing', 'single-stage'],
        figures: [],
        statement:
            "ASPS says the goal of a mommy makeover is to restore the shape and appearance of a woman's body after childbearing. It can include a breast augmentation, a breast lift, liposuction and a tummy tuck, and is typically performed as a single-stage procedure.",
        sourceIds: ['asps-mommy-makeover'],
        caveat: 'ASPS also lists buttock augmentation and labiaplasty. "Typically" is ASPS\'s word: whether a given plan fits in one surgery at Alluring is an owner question, so never promise it.',
    },
    {
        id: 'definition-breasts-abdomen',
        topic: 'procedure',
        concepts: ['breasts and abdomen', 'reduction', 'liposuction'],
        figures: [],
        statement:
            'The Aesthetic Society says the combination typically focuses on the breasts and abdomen: a tummy tuck; a breast lift, augmentation or reduction; and liposuction.',
        sourceIds: ['aesthetic-society-mommy-makeover'],
    },
    {
        id: 'what-a-tummy-tuck-does',
        topic: 'procedure',
        concepts: ['tummy tuck', 'muscle'],
        figures: [],
        statement:
            'ASPS says a tummy tuck removes excess fat and skin and, in most cases, restores weakened or separated muscles.',
        sourceIds: ['asps-tummy-tuck'],
    },
    {
        id: 'alluring-surgeon',
        topic: 'procedure',
        concepts: ['surgeon', 'performs', 'board certified'],
        figures: [],
        statement: `${KARLINSKY_NAME} performs every mommy makeover at Alluring. ${KARLINSKY_CREDENTIALS}`,
        sourceIds: ['alluring-practice'],
        caveat: 'Credentials only from `karlinsky-credentials.constant.ts`. Never "board-certified plastic surgeon", ABPS or "double board". Any mention of the American Board of Cosmetic Surgery carries the Florida statement in the same element and type size.',
    },

    // ── Candidacy and timing ─────────────────────────────────────────────
    {
        id: 'candidates',
        topic: 'procedure',
        concepts: ['candidate', 'childbearing', 'ideal body weight'],
        figures: [],
        statement:
            'ASPS describes mommy makeover candidates as women in good medical health, at their ideal body weight, finished with childbearing, and with a positive outlook and realistic expectations.',
        sourceIds: ['asps-mommy-makeover-candidates'],
        caveat: 'No BMI figure and no months after birth on the ASPS page.',
    },
    {
        id: 'health-conditions',
        topic: 'procedure',
        concepts: ['health', 'diabetes', 'heart'],
        figures: [],
        statement:
            'The Aesthetic Society says you need to be in overall good health, without untreated conditions such as diabetes or heart disease.',
        sourceIds: ['aesthetic-society-mommy-makeover'],
    },
    {
        id: 'timing-delivery',
        topic: 'procedure',
        concepts: ['delivery', 'baby', 'birth', 'sweet spot', 'wait'],
        figures: [
            { value: 6, unit: 'month' },
            { value: 1, unit: 'year' },
        ],
        statement:
            'Kristy Hamilton, MD, quoted by ASPS, tells patients to wait at least 6 months after delivery, longer if their body is still changing. Nneamaka Nwubah, MD, also quoted by ASPS, calls 1 year the sweet spot.',
        sourceIds: ['asps-postpartum-2024'],
        caveat: 'Two surgeons\' views: the article says there is "no one steadfast rule". Never "ASPS recommends". The old "6 months after giving birth and finishing breastfeeding" merged two different things.',
    },
    {
        id: 'timing-breastfeeding',
        topic: 'procedure',
        concepts: ['breastfeed', 'lactation', 'nursing', 'lactancia'],
        figures: [
            { value: 6, unit: 'week' },
            { value: 3, unit: 'month' },
            { value: 6, unit: 'month' },
        ],
        statement:
            'Kristy Hamilton, MD, quoted by ASPS, likes patients to have stopped breastfeeding for at least 6 weeks, preferably 3 months. Shahram Salemy, MD, writing on the ASPS website, suggests waiting up to 6 months after lactation stops.',
        sourceIds: ['asps-postpartum-2024', 'asps-salemy-2022'],
        caveat: 'One surgeon\'s view each. Salemy\'s sentence uses the word "best", so the copy never quotes it word for word.',
    },
    {
        id: 'not-weight-loss',
        topic: 'procedure',
        concepts: ['weight loss'],
        figures: [],
        statement:
            '"These are not weight loss surgeries," says Nneamaka Nwubah, MD, quoted by ASPS.',
        sourceIds: ['asps-postpartum-2024'],
    },
    {
        id: 'stable-weight-6-12-months',
        topic: 'procedure',
        concepts: ['weight'],
        figures: [{ min: 6, max: 12, unit: 'month' }],
        statement:
            'Be close to your goal weight for 6 to 12 months before a tummy tuck (Paul Vitenas, MD, on the ASPS website).',
        sourceIds: ['asps-vitenas-2018'],
        caveat: 'About a tummy tuck. The old "within 10–15 pounds" is on the must-not list.',
    },
    {
        id: 'bmi-recommended-range',
        topic: 'procedure',
        concepts: ['bmi'],
        figures: [{ value: 30, unit: 'bmi' }],
        statement:
            'We recommend a BMI under 30 before a mommy makeover: where the published evidence turns, not a cutoff of our own. Your surgeon decides case by case.',
        sourceIds: ['winocour-2015'],
        caveat: 'Matches `bmi.facts.ts` recommended-ranges and links to /bmi-calculator, which holds its full sourcing. No society sets a hard cutoff, and the practice\'s own BMI rule is an owner question, so never "we require".',
    },
    {
        id: 'nonsmoker',
        topic: 'procedure',
        concepts: ['smok', 'nicotine', 'vape', 'tobacco'],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'Cleveland Clinic says you will need to quit smoking for at least 6 weeks before surgery, and The Aesthetic Society says smoking slows healing and raises the risk of serious complications.',
        sourceIds: [
            'cleveland-clinic-mommy-makeovers',
            'aesthetic-society-mommy-makeover',
        ],
        caveat: "The tummy tuck page's example from another Cleveland Clinic page is shorter (1 month before). Your surgeon sets yours.",
    },
    {
        id: 'pregnancy-later',
        topic: 'procedure',
        concepts: ['pregnan', 'more children'],
        figures: [],
        statement:
            'ASPS advises women who may want future pregnancies to postpone a tummy tuck. The Aesthetic Society says pregnancy or weight gain after these surgeries may compromise your results, and Cleveland Clinic says future pregnancies can undo some of the effects.',
        sourceIds: [
            'asps-tummy-tuck',
            'aesthetic-society-mommy-makeover',
            'cleveland-clinic-mommy-makeovers',
        ],
    },
    {
        id: 'pregnancy-after-review',
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
        caveat: 'Matches `tummy-tuck.facts.ts` pregnancy-after. Safety for mother and baby only. It does not say the result survives a pregnancy.',
    },

    // ── Recovery ─────────────────────────────────────────────────────────
    {
        id: 'recovery-at-least-2-weeks',
        topic: 'recovery',
        concepts: ['recover'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'The Aesthetic Society says recovery takes at least 2 weeks and can be longer, depending on your combination of procedures.',
        sourceIds: ['aesthetic-society-mommy-makeover'],
    },
    {
        id: 'help-24-hours',
        topic: 'recovery',
        concepts: ['help', 'someone', 'at home'],
        figures: [{ value: 24, unit: 'hour' }],
        statement:
            'The Aesthetic Society says to arrange for someone to help you around the house and with your medication for at least the first 24 hours after surgery.',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'not-home-alone',
        topic: 'recovery',
        concepts: ['home alone', 'another adult', 'support system'],
        figures: [],
        statement:
            'The Aesthetic Society says you cannot go home alone or stay home without another adult present, and to set up a support system for the full recovery.',
        sourceIds: ['aesthetic-society-preparing'],
    },
    {
        id: 'children-2-weeks',
        topic: 'recovery',
        concepts: ['child', 'kids', 'toddler', 'baby'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'If you have small children, The Aesthetic Society says to put someone else totally in charge of their care for at least 2 weeks.',
        sourceIds: [
            'aesthetic-society-aftercare',
            'aesthetic-society-preparing',
        ],
        caveat: 'Its preparation page says children under five. The copy says "young children" or "small children".',
    },
    {
        id: 'first-week',
        topic: 'recovery',
        concepts: ['worst', 'hardest', 'feel like', 'recovering', 'yourself'],
        figures: [
            { value: 1, unit: 'week' },
            { min: 2, max: 3, unit: 'week' },
            { min: 7, max: 10, unit: 'day' },
        ],
        statement:
            'The Aesthetic Society says the first week will be the worst, you may still feel like you are recovering for 2 to 3 weeks, and you will not feel like yourself for at least 7 to 10 days.',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'pain-first-days',
        topic: 'recovery',
        concepts: ['intense', 'pain', 'first few days'],
        figures: [],
        statement:
            'The Aesthetic Society says the recovery period is significant and can be intense the first few days.',
        sourceIds: ['aesthetic-society-aftercare'],
        caveat: 'No source gives a pain score or a number of days. Never "painless".',
    },
    {
        id: 'walk-day-of-surgery',
        topic: 'recovery',
        concepts: ['walk'],
        figures: [],
        statement:
            'You may be up and walking within hours of surgery (The Aesthetic Society). After a tummy tuck, walking on the day of surgery keeps the risk of blood clots in the legs low (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['aesthetic-society-aftercare', 'asps-wu-2019'],
    },
    {
        id: 'bent-7-10-days',
        topic: 'recovery',
        concepts: ['bent', 'stand', 'straight', 'upright'],
        figures: [{ min: 7, max: 10, unit: 'day' }],
        statement:
            'After a tummy tuck, you stay bent at the waist for 7 to 10 days (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'shower-72-hours',
        topic: 'recovery',
        concepts: ['shower', 'dressing'],
        figures: [{ value: 72, unit: 'hour' }],
        statement:
            'You may shower once the dressings are off, usually within 72 hours (The Aesthetic Society).',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'follow-up-5-days',
        topic: 'recovery',
        concepts: ['follow-up', 'follow up'],
        figures: [{ value: 5, unit: 'day' }],
        statement:
            'Your first follow-up with your surgeon is usually within 5 days (The Aesthetic Society).',
        sourceIds: ['aesthetic-society-aftercare'],
        caveat: "A general statement, not Alluring's schedule.",
    },
    {
        id: 'sutures-1-2-weeks',
        topic: 'recovery',
        concepts: ['suture', 'stitch'],
        // "the first week or two" reads as week 1.
        figures: [
            { min: 1, max: 2, unit: 'week' },
            { value: 1, unit: 'week' },
        ],
        statement:
            'Traditional sutures usually come out within 1 to 2 weeks, and absorbable ones need no removal (The Aesthetic Society).',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'work-2-weeks',
        topic: 'recovery',
        concepts: ['work', 'job', 'trabajo'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'The Aesthetic Society says to plan about 2 weeks off work, depending on the physical demands of your job, and Frank Campanile, MD, on the ASPS website, says most women plan about 2 weeks.',
        sourceIds: ['aesthetic-society-aftercare', 'asps-campanile-2018'],
        caveat: 'Cleveland Clinic\'s article says "a week or two". The copy leads with 2 weeks, the mommy makeover figure from two sources.',
    },
    {
        id: 'driving-2-3-weeks',
        topic: 'recovery',
        concepts: ['driv', 'manej', 'conduc'],
        figures: [{ min: 2, max: 3, unit: 'week' }],
        statement:
            'The Aesthetic Society says you may be comfortable enough to drive in 2 or 3 weeks, or when your sutures and drains are out and you are no longer taking pain medication.',
        sourceIds: ['aesthetic-society-aftercare'],
        caveat: 'The mommy makeover figure. Never "1–2 weeks" for a mommy makeover: AI engines repeat that from our old post. Your surgeon clears driving.',
    },
    {
        id: 'driving-tummy-tuck',
        topic: 'recovery',
        concepts: ['driv', 'cook', 'shop'],
        // "a week or two" reads as 1 week.
        figures: [
            { min: 1, max: 2, unit: 'week' },
            { value: 1, unit: 'week' },
        ],
        statement:
            'After a tummy tuck alone, driving, cooking and shopping are often manageable after 1 to 2 weeks (Shahram Salemy, MD, on the ASPS website).',
        sourceIds: ['asps-salemy-2019'],
        caveat: 'Matches `tummy-tuck.facts.ts` driving-1-2-weeks. About a tummy tuck alone, not a mommy makeover.',
    },
    {
        id: 'driving-breast-lift',
        topic: 'recovery',
        concepts: ['driv', 'laundry', 'clean'],
        figures: [{ value: 2, unit: 'week' }],
        statement:
            'After a breast lift, The Aesthetic Society says no lifting, driving, laundry or cleaning for the first 2 weeks.',
        sourceIds: ['aesthetic-society-breast-lift-recovery'],
        caveat: 'About a breast lift alone. No figure for driving after breast augmentation alone is declared here.',
    },
    {
        id: 'lifting-children-4-6-weeks',
        topic: 'recovery',
        concepts: ['lift', 'picking up', 'carry', 'laundry'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'The Aesthetic Society says no heavy lifting, such as picking up your children or baskets of laundry, for 4 to 6 weeks.',
        sourceIds: ['aesthetic-society-aftercare'],
        caveat: 'No source gives a weight limit. "10 pounds" and "5 pounds" are on the must-not list.',
    },
    {
        id: 'no-heavy-lifting-or-exercise-4-6-weeks',
        topic: 'recovery',
        concepts: ['lift', 'exercise', 'strenuous', 'workout'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'Cleveland Clinic says surgeons often recommend no heavy lifting or strenuous exercise for the first 4 to 6 weeks.',
        sourceIds: ['cleveland-clinic-mommy-makeovers'],
    },
    {
        id: 'heavy-lifting-4-8-weeks',
        topic: 'recovery',
        concepts: ['lift', 'exercise', 'strenuous'],
        figures: [{ min: 4, max: 8, unit: 'week' }],
        statement:
            'After a tummy tuck, Cleveland Clinic says heavy lifting and strenuous exercise wait until your provider clears them, usually 4 to 8 weeks.',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar'],
        caveat: 'Matches `tummy-tuck.facts.ts` heavy-lifting-4-8-weeks. About a tummy tuck.',
    },
    {
        id: 'strenuous-6-weeks',
        topic: 'recovery',
        concepts: ['strenuous', 'running', 'exercise', 'workout', 'lift'],
        figures: [{ value: 6, unit: 'week' }],
        statement:
            'The Aesthetic Society says you will probably need to wait 6 weeks before any strenuous activities. After a tummy tuck, running and lifting are avoided for 6 weeks (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['aesthetic-society-aftercare', 'asps-wu-2019'],
        caveat: 'No source gives a week for core exercise after muscle repair. "8–12 weeks" for exercise is on the must-not list.',
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
        caveat: 'Matches `tummy-tuck.facts.ts` drains-1-2-weeks. Whether Alluring uses drains is an owner question. Never say which.',
    },
    {
        id: 'asps-garments',
        topic: 'recovery',
        concepts: ['garment', 'compression', 'support bra', 'elastic'],
        figures: [],
        statement:
            'ASPS says an elastic bandage or support bra will minimize swelling and support the breasts, and a compression garment may also be used to control swelling in the abdomen, waist and buttocks.',
        sourceIds: ['asps-mommy-makeover-recovery'],
        caveat: 'ASPS gives no length of time. The practice\'s own schedule is an owner question: "as your surgeon directs".',
    },
    {
        id: 'abdominal-binder',
        topic: 'recovery',
        concepts: ['binder'],
        figures: [],
        statement:
            'The Aesthetic Society says you will need to wear an abdominal binder after a tummy tuck.',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'garment-day-night-1-3-weeks',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [{ min: 1, max: 3, unit: 'week' }],
        statement:
            'Daniel Maman, MD, on the ASPS website, says a compression garment is worn day and night for 1 to 3 weeks, except when bathing, then at night for several weeks once your surgeon approves.',
        sourceIds: ['asps-maman-2023'],
        caveat: 'About plastic surgery in general. A "6–8 weeks" garment total and "12–16 hours" a day are on the must-not list.',
    },
    {
        id: 'garment-4-6-weeks',
        topic: 'recovery',
        concepts: ['garment', 'compression'],
        figures: [{ min: 4, max: 6, unit: 'week' }],
        statement:
            'A compression garment is worn for 4 to 6 weeks after a tummy tuck (Cindy Wu, MD, on the ASPS website) and for 4 to 6 weeks over liposuction areas (The Aesthetic Society).',
        sourceIds: ['asps-wu-2019', 'aesthetic-society-liposuction-recovery'],
        caveat: "Each part's figure, attributed. No source gives a schedule for a mommy makeover as a whole.",
    },
    {
        id: 'bra',
        topic: 'recovery',
        concepts: ['bra', 'underwire'],
        figures: [
            { value: 1, unit: 'week' },
            { value: 8, unit: 'week' },
            { value: 3, unit: 'month' },
            { value: 1, unit: 'month' },
        ],
        statement:
            "Cleveland Clinic's surgery department has patients wear a surgical bra for the first week, then a support bra for several weeks, and Cleveland Clinic says women can usually wear a regular bra about 8 weeks after a breast lift. In an ASPS article, Karen Horton, MD, advises no underwire for at least 3 months, and Kelly Killeen, MD, says most women return to normal bras in about 1 month.",
        sourceIds: [
            'cleveland-clinic-breast-lift-center',
            'cleveland-clinic-breast-lift',
            'asps-horton-2025',
        ],
        caveat: 'They differ, so attribute each. About breast surgery, not a mommy makeover as a whole. Your surgeon sets yours.',
    },
    {
        id: 'swelling-3-months',
        topic: 'recovery',
        concepts: ['swell', 'hinchaz'],
        figures: [{ value: 3, unit: 'month' }],
        statement:
            'After a tummy tuck, swelling keeps going down until about 3 months (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
    },
    {
        id: 'normal-activities-3-months',
        topic: 'recovery',
        concepts: ['normal activit', 'return to'],
        figures: [{ value: 3, unit: 'month' }],
        statement:
            'Frank Campanile, MD, on the ASPS website, says that around 3 months you can usually return to your normal activities.',
        sourceIds: ['asps-campanile-2018'],
    },

    // ── Results and scars ────────────────────────────────────────────────
    {
        id: 'results-6-12-months',
        topic: 'results',
        concepts: ['result', 'resultado'],
        figures: [
            { min: 6, max: 12, unit: 'month' },
            { value: 6, unit: 'month' },
            { value: 1, unit: 'year' },
        ],
        statement:
            'It can take 6 months to a year to see your final mommy makeover results (Frank Campanile, MD, on the ASPS website).',
        sourceIds: ['asps-campanile-2018'],
    },
    {
        id: 'implants-not-lifetime',
        topic: 'results',
        concepts: ['implant'],
        figures: [],
        statement:
            'The FDA says breast implants are not considered lifetime devices and some complications will require more surgery, and The Aesthetic Society says you will need to replace them over time.',
        sourceIds: ['fda-implant-risks', 'aesthetic-society-mommy-makeover'],
    },
    {
        id: 'scar-placement',
        topic: 'results',
        concepts: ['scar', 'incision', 'bikini'],
        figures: [],
        statement:
            'The Aesthetic Society says you will likely have scars hidden in your bikini line or under your bra. A full tummy tuck scar usually runs from hip bone to hip bone, just above the pubic area (Cleveland Clinic), placed as low as possible so underwear or swimsuit bottoms cover it (Jonathan Weiler, MD, on the ASPS website).',
        sourceIds: [
            'aesthetic-society-mommy-makeover',
            'cleveland-clinic-tummy-tuck-scar',
            'asps-weiler-2023',
        ],
        caveat: 'Never "scarless" or "invisible". The Aesthetic Society\'s word is "likely".',
    },
    {
        id: 'scars-6m-2y',
        topic: 'results',
        concepts: ['scar'],
        figures: [
            { value: 6, unit: 'month' },
            { value: 2, unit: 'year' },
        ],
        statement:
            'The Aesthetic Society says fading and flattening of scars take 6 months to 2 years.',
        sourceIds: ['aesthetic-society-aftercare'],
    },
    {
        id: 'scar-12-18-months',
        topic: 'results',
        concepts: ['scar'],
        figures: [{ min: 12, max: 18, unit: 'month' }],
        statement:
            'A tummy tuck scar becomes thinner and lighter in color at around 12 to 18 months (Cindy Wu, MD, on the ASPS website).',
        sourceIds: ['asps-wu-2019'],
        caveat: 'The scar only. "12–18 months" for complete healing is on the must-not list.',
    },
    {
        id: 'sunscreen',
        topic: 'results',
        concepts: ['sun', 'spf'],
        figures: [{ min: 12, max: 18, unit: 'month' }],
        statement:
            'Cleveland Clinic advises sunscreen with SPF 30 on the scar for 12 to 18 months after a tummy tuck if you must be in the sun.',
        sourceIds: ['cleveland-clinic-tummy-tuck-scar'],
        caveat: '"SPF 50+" is on the must-not list. The page\'s sweep config lists "spf 30" as an identifier.',
    },
    {
        id: 'c-section-scar',
        topic: 'results',
        concepts: ['c-section', 'cesarean', 'cesárea'],
        figures: [],
        statement:
            'ASPS says that after a C-section, the existing scar may be incorporated into the new tummy tuck scar.',
        sourceIds: ['asps-tummy-tuck-results'],
    },

    // ── Safety: how the parts add up ─────────────────────────────────────
    {
        id: 'major-complications',
        topic: 'safety',
        concepts: ['complication'],
        // The study's window (2008–2013) and its year.
        years: [2008, 2013, 2015],
        figures: [
            { value: 25478, unit: 'patient' },
            { value: 3.1, unit: 'percent' },
            { value: 3.8, unit: 'percent' },
            { value: 4.3, unit: 'percent' },
            { value: 4.6, unit: 'percent' },
        ],
        statement:
            'In an insurance database of 25,478 patients, major complications followed 3.1% of tummy tucks done alone, 3.8% of those with liposuction, 4.3% of those with a breast procedure and 4.6% of those with liposuction and a breast procedure (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015).',
        sourceIds: ['winocour-2015'],
        caveat: 'Major complications only, from 2008–2013 data. Never "4.6% of patients have complications" or a rate for Alluring. The 3.1% and 3.8% match `tummy-tuck.facts.ts`. The 4.6% is the line closest to a full mommy makeover, and it is new to the 2026-10-05 table.',
    },
    {
        id: 'major-complications-body-contouring',
        topic: 'safety',
        concepts: ['complication', 'body-contouring', 'body contouring'],
        years: [2015],
        figures: [
            { value: 6.8, unit: 'percent' },
            { value: 10.4, unit: 'percent' },
        ],
        statement:
            'The same study found major complications after 6.8% of tummy tucks with another body-contouring procedure and 10.4% of those with liposuction and another body-contouring procedure (Winocour and colleagues, 2015).',
        sourceIds: ['winocour-2015'],
        caveat: 'The abstract does not list which body-contouring procedures. Say "another body-contouring procedure", and don\'t name an arm or thigh lift as if the study had.',
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
        caveat: 'Shares of the complications, not of patients. "1–4%" infection is on the must-not list.',
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
        id: 'vte-combined',
        topic: 'safety',
        concepts: ['clot', 'thrombo', 'embol'],
        years: [2017],
        figures: [
            { value: 129007, unit: 'patient' },
            { value: 30, unit: 'day' },
            { value: 0.2, unit: 'percent' },
            { value: 0.04, unit: 'percent' },
            { value: 0.28, unit: 'percent' },
        ],
        statement:
            'In 129,007 patients having cosmetic surgery, blood clots within 30 days followed 0.20% of combined procedures and 0.04% of single ones, and 0.28% of combined body and breast procedures, the highest rate the study lists (Winocour and colleagues, Aesthetic Surgery Journal, 2017).',
        sourceIds: ['winocour-2017'],
        caveat: 'The study calls the overall rate "relatively low" (0.09%). Keep that sense in the sentence around these figures.',
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
        caveat: "Matches `tummy-tuck.facts.ts`. It advises assessing every patient's risk before surgery; what Alluring does is an owner question.",
    },
    {
        id: 'operative-time',
        topic: 'safety',
        concepts: [
            'hour of surgery',
            'length',
            'longer surger',
            'operative',
            'each extra hour',
        ],
        years: [2014],
        figures: [
            { value: 21, unit: 'percent' },
            { value: 3.1, unit: 'hour' },
        ],
        statement:
            'In a study of complex plastic surgery at one US medical center, each extra hour of surgery raised the odds of a complication by 21%, and risk rose once surgery passed 3.1 hours (Hardy and colleagues, Aesthetic Surgery Journal, 2014).',
        sourceIds: ['hardy-2014'],
        caveat: 'Complications of every grade in a broad mix of plastic surgery, not mommy makeovers alone. It says nothing about how long a plan takes at Alluring: never set it beside "3–5 hours" or "4–6 hours", which are on the must-not list. The count "1,753 cases" has no unit the sweep can read, so it stays out of the statement.',
    },
    {
        id: 'combined-meta-2026',
        topic: 'safety',
        concepts: ['review', 'combin', 'comparable'],
        years: [2026],
        figures: [
            { value: 8, unit: 'study' },
            { value: 138020, unit: 'patient' },
        ],
        statement:
            'A 2026 review of 8 studies and 138,020 patients found that a tummy tuck combined with breast surgery carries a complication profile comparable to a tummy tuck alone and higher than breast surgery alone, and concluded that it is generally safe in carefully selected patients (Skorochod and Wolf, Aesthetic Plastic Surgery, 2026).',
        sourceIds: ['skorochod-wolf-2026'],
        caveat: 'Never a claim about Alluring. The review rates its own evidence "moderate to very low" certainty, so keep "carefully selected patients". The abstract\'s three group sizes add up to 128,020, not its stated 138,020, and the full text was not read: prefer "a review of 8 studies" in copy, and treat 138,020 only as the abstract\'s stated total.',
    },

    // ── Warning signs ────────────────────────────────────────────────────
    {
        id: 'warning-signs',
        topic: 'safety',
        concepts: ['fever', 'temperature', 'drainage', 'redness', 'wound'],
        figures: [{ value: 4, unit: 'hour' }],
        statement:
            'MedlinePlus says to call your surgeon about more redness, pain, swelling or bleeding at the incision, drainage that increases or turns thick, tan, green or yellow or smells bad, or a fever that lasts more than 4 hours.',
        sourceIds: ['medlineplus-wound-care'],
        caveat: 'MedlinePlus\'s fever line is a temperature "above 100°F (37.7°C) for more than 4 hours". Posts may state that, attributed. The page\'s facts have no temperature unit, so the page says "a fever" and links the recovery post. "100.4°F" and "101°F" are on the must-not list.',
    },
    {
        id: 'dvt-signs',
        topic: 'safety',
        concepts: ['clot', 'emergency', 'chest pain', 'swelling'],
        figures: [],
        statement:
            'MedlinePlus lists swelling, pain or tenderness, warmth and redness in a leg or arm as signs of a deep vein clot. With a clot, chest pain, coughing up blood, difficulty breathing or fainting mean going to the emergency room or calling 911.',
        sourceIds: ['medlineplus-dvt'],
        caveat: 'The page\'s sweep config lists "911" as an identifier.',
    },

    // ── Law: office surgery in Florida ───────────────────────────────────
    {
        id: 'florida-1000cc',
        topic: 'law',
        concepts: ['tummy tuck', 'abdominoplasty', 'liposuction'],
        figures: [{ value: 1000, unit: 'cc' }],
        statement:
            'When liposuction is combined with a tummy tuck in the same office operation, Florida allows at most 1,000 cc of supernatant fat.',
        sourceIds: ['florida-rule-64b8-9-009'],
        caveat: 'Matches `tummy-tuck.facts.ts` florida-lipo-with-tummy-tuck-1000cc. The office setting only. Never say where Alluring operates until the owner confirms it.',
    },
    {
        id: 'florida-8-hours',
        topic: 'law',
        concepts: ['office', 'surger'],
        figures: [{ value: 8, unit: 'hour' }],
        statement:
            "In a doctor's office, Florida caps the planned length of all procedures in one cosmetic surgery at 8 hours.",
        sourceIds: ['florida-rule-64b8-9-009'],
        caveat: 'Matches `tummy-tuck.facts.ts`. A legal ceiling, not how long a plan takes.',
    },
    {
        id: 'florida-discharge-24-hours',
        topic: 'law',
        concepts: ['discharge', 'overnight'],
        figures: [{ value: 24, unit: 'hour' }],
        statement:
            "After cosmetic surgery in a doctor's office, Florida requires that you be discharged within 24 hours of arriving.",
        sourceIds: ['florida-rule-64b8-9-009'],
        caveat: 'Whether a patient stays overnight at Alluring is an owner question.',
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
] as const satisfies readonly MommyMakeoverFact[]

export type MommyMakeoverFactId = (typeof mommyMakeoverFacts)[number]['id']

const mommyMakeoverLookups = createFactLookups(
    mommyMakeoverFacts,
    'mommy makeover'
)

export const getMommyMakeoverFact: (
    id: MommyMakeoverFactId
) => MommyMakeoverFact = mommyMakeoverLookups.fact

/** A figure as copy writes it: "$3,000", "2–3 weeks", "4.6%", "1,000 cc". */
export const formatMommyMakeoverFigure = formatProcedureFigure

/** The first (or `index`th) figure of a fact, formatted. */
export const mommyMakeoverFigure: (
    id: MommyMakeoverFactId,
    index?: number
) => string = mommyMakeoverLookups.figure
