import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_CREDENTIALS_LONG,
    KARLINSKY_NAME,
} from '@workspace/shared/claims/surgeon'

import type { Surgeon } from '@/lib/types/surgeon.type'

/**
 * The surgeons' profiles. Dr. Karlinsky's credentials are the claims canon's
 * approved sentences (§2, #354). Her two cosmetic boards are listed in the
 * canon's wording; the surgeon components print the Florida statement next
 * to them (`components/surgeons/florida-board-statement.ts`), and structured
 * data uses `karlinskyPersonNode`, never this list. Her education lines are
 * unverified (D9): they stay on her profile page only, never in posts,
 * `llms*.txt`, chat or structured data.
 */

export const surgeons: Surgeon[] = [
    {
        id: 'dr-karlinsky',
        name: 'Dr. Victoria Karlinsky',
        slug: 'dr-karlinsky',
        title: 'Cosmetic Surgeon',
        role: 'Medical Director',
        quote: "Cosmetic surgery is never just about a single feature. It's about how you feel when you walk into a room — and knowing we prioritized your safety at every step.",
        shortBio: `${KARLINSKY_NAME} performs every surgery at Alluring. ${KARLINSKY_CREDENTIALS}`,
        fullBio: `${KARLINSKY_CREDENTIALS_LONG} She performs every surgery at Alluring.\n\nWhether it's a delicate facial rejuvenation or a body contouring procedure, Dr. Karlinsky tailors every treatment to your natural anatomy.\n\nYou are heard, understood and supported from your first consultation to your final follow-up. With Dr. Karlinsky, you aren't just getting a surgeon; you're gaining a partner in your aesthetic journey.`,
        images: {
            featured: '/images/surgeons/dr-karlinsky.webp',
            portrait: '/images/surgeons/dr-karlinsky.webp',
        },
        education: [
            'MD, Ross University School of Medicine',
            'Residency, Dept. of Surgery, Beth Israel Medical Center, NYC',
            'Fellowship, Facial Plastic & Cosmetic Surgical Center, Abilene, Texas',
        ],
        // The AACS fellow and "Fellowship Director" lines are unverified or
        // wrong (D9) and stay off until AACS confirms them.
        certifications: [
            'Board Certified, American Board of Surgery (since 2008)',
            'Fellow, American College of Surgeons (FACS)',
            'Certified, American Board of Cosmetic Surgery (2011, recertified 2021)',
            'Listed in the directory of the American Board of Facial Cosmetic Surgery',
        ],
        certificationBadges: [
            {
                src: '/images/certifications/abcs-board-certified.svg',
                alt: 'American Board of Cosmetic Surgery',
            },
            {
                src: '/images/certifications/abfcs-board-certified.png',
                alt: 'American Board of Facial Cosmetic Surgery',
            },
            {
                src: '/images/certifications/abs-board-certified.png',
                alt: 'The American Board of Surgery',
            },
            {
                src: '/images/certifications/facs-fellow.svg',
                alt: 'Fellow of the American College of Surgeons',
            },
        ],
        specialties: [
            'Facelift (Rhytidectomy)',
            'Blepharoplasty (Eyelid Surgery)',
            'Breast Augmentation & Lift',
            'Breast Reduction',
            'Tummy Tuck (Abdominoplasty)',
            'Liposuction',
            'Brazilian Butt Lift (BBL)',
            'Mommy Makeover',
        ],
        philosophy:
            "Dr. Karlinsky believes that true beauty lies in confidence. Her philosophy is centered on three pillars: safety, personalization, and natural results. She rejects the 'one-size-fits-all' approach, instead tailoring every procedure to the individual's body and goals. She strives for results that don't just look good, but feel right—enhancing your self-esteem and letting your inner vibrancy shine through.",
        social: {
            instagram: 'https://instagram.com/alluringplasticsurgery',
            facebook: 'https://facebook.com/alluringplasticsurgery',
            tiktok: 'https://tiktok.com/@alluringplasticsurgery',
        },
        // External profile links for E-E-A-T signals
        externalProfiles: {
            healthgrades:
                'https://www.healthgrades.com/physician/dr-victoria-karlinsky-bellini-x3vmt',
            realself:
                'https://www.realself.com/dr/victoria-karlinsky-bellini-manhattan-ny',
        },
    },
    // D1 (open): Dr. Rita Shats is flagged, not removed. Her mentions stay
    // as they were, minus the canon's banned wording ("leading authority",
    // tenure, a bare "board certified"); add no new mentions. Her listed
    // certifications await verification at ABOG and the issuing bodies.
    {
        id: 'dr-shats',
        name: 'Dr. Rita Shats',
        slug: 'dr-rita-shats',
        title: 'Cosmetic Gynecologist',
        role: 'Cosmetic Gynecologist',
        quote: "True confidence comes from within, but sometimes, it needs a little help to shine. I'm here to help you reclaim your comfort and embrace your most confident self.",
        shortBio:
            'A cosmetic gynecologist known for her empathetic approach. Dr. Shats specializes in intimate wellness and rejuvenation, offering personalized care that empowers women.',
        fullBio:
            "Dr. Rita Shats practices cosmetic gynecology with a deeply empathetic approach to patient care. She is Associate Director of Gynecology at Richmond University Medical Center.\n\nDr. Shats understands that intimate aesthetic concerns can deeply affect a woman's quality of life and self-image. That's why she is dedicated to providing a safe, judgment-free space where women can openly discuss their goals. Whether performing a labiaplasty or a vaginoplasty, Dr. Shats combines technical precision with an artistic touch to deliver results that improve both function and aesthetics.\n\nHer forward-thinking approach prioritizes your comfort and unique anatomy, ensuring that every treatment plan is as individual as you are. With Dr. Shats, you are choosing a partner who champions your well-being and empowers you to feel truly at home in your body.",
        images: {
            featured: '/images/surgeons/dr-rita-shats.png',
            portrait: '/images/surgeons/dr-rita-shats.png',
        },
        education: [
            'MD, Ross University School of Medicine',
            'Cosmetic Gynecology Surgery Mini-Fellowship, ISCG',
            'Certified Console Robotic Surgeon, Intuitiv Surgical',
        ],
        certifications: [
            'Board Certified, Obstetrics and Gynecology (FACOG)',
            'Board Certified, Pediatric and Adolescent Gynecology (FACOG)',
            'Certified Cosmetic Gynecology Surgery',
            'Advanced Laparoscopic & Robotic Surgeon',
        ],
        specialties: [
            'Labiaplasty',
            'Vaginoplasty',
            'Clitoral Hood Reduction',
            'Perineoplasty',
            'Hymenoplasty',
        ],
        philosophy:
            'Dr. Shats believes that every woman deserves to feel confident and comfortable in her own skin. Her philosophy focuses on holistic empowerment—addressing both physical and emotional well-being. She advocates for open, honest communication and takes the time to educate her patients, ensuring they feel supported and informed at every stage of their journey. For Dr. Shats, the most rewarding outcome is seeing her patients walk away with renewed self-assurance and a better quality of life.',
        social: {
            instagram: 'https://instagram.com/alluringplasticsurgery',
            facebook: 'https://facebook.com/alluringplasticsurgery',
            tiktok: 'https://tiktok.com/@alluringplasticsurgery',
        },
        // External profile links for E-E-A-T signals
        externalProfiles: {
            healthgrades:
                'https://www.healthgrades.com/physician/dr-rita-shats-39hgw',
            realself: 'https://www.realself.com/dr/rita-shats-hollywood-fl',
        },
    },
]
