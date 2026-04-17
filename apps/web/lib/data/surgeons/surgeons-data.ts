import type { Surgeon } from '@/lib/types/surgeon.type'

export const surgeons: Surgeon[] = [
    {
        id: 'dr-karlinsky',
        name: 'Dr. Victoria Karlinsky',
        slug: 'dr-karlinsky',
        title: 'Board Certified Cosmetic Surgeon',
        role: 'Medical Director',
        quote: "Cosmetic surgery is never just about a single feature. It's about how you feel when you walk into a room — and knowing we prioritized your safety at every step.",
        shortBio:
            'A board-certified cosmetic and general surgeon who combines technical precision with an artistic eye. Dr. Karlinsky is renowned for delivering natural, transformative results that enhance your unique beauty.',
        fullBio:
            "Dr. Victoria Karlinsky is a distinguished board-certified cosmetic and general surgeon who has shaped the landscape of aesthetic surgery in Miami. With a rigorous medical background from the esteemed Ross University School of Medicine and specialized fellowship training at the American Academy of Cosmetic Surgery, Dr. Karlinsky offers a level of expertise that patients trust implicitly.\n\nAs a Fellow of the American College of Surgeons (FACS), she upholds the highest standards of safety and care, but it is her artistic vision that truly sets her apart. She doesn't just perform procedures; she sculpts confidence. Whether it's a delicate facial rejuvenation or a comprehensive body contouring transformation, Dr. Karlinsky customizes every treatment to harmonize with your natural anatomy.\n\nHer patient-centric approach ensures that you are heard, understood, and supported from your very first consultation to your final reveal. With Dr. Karlinsky, you aren't just getting a surgeon; you're gaining a partner in your aesthetic journey.",
        images: {
            featured: '/images/surgeons/dr-karlinsky.webp',
            portrait: '/images/surgeons/dr-karlinsky.webp',
        },
        education: [
            'MD, Ross University School of Medicine',
            'Residency, Dept. of Surgery, Beth Israel Medical Center, NYC',
            'Fellowship, Facial Plastic & Cosmetic Surgical Center, Abilene, Texas',
        ],
        certifications: [
            'Board Certified, American Board of Cosmetic Surgery',
            'Board Certified, American Board of Facial Cosmetic Surgery',
            'Board Certified, American Board of Surgery',
            'Fellow, American College of Surgeons (FACS)',
            'Fellow, American Academy of Cosmetic Surgery',
            'Fellowship Director, American Board of Cosmetic Surgery',
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
            {
                src: '/images/certifications/aacs-fellow.png',
                alt: 'American Academy of Cosmetic Surgery',
            },
            {
                src: '/images/certifications/abcs-fellowship-director.png',
                alt: 'American Board of Cosmetic Surgery - Fellowship Director',
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
            "Dr. Karlinsky believes that true beauty lies in confidence. Her philosophy is centered on three pillars: safety, personalization, and natural results. She rejects the 'one-size-fits-all' approach, instead tailoring every procedure to the individual's body and goals. By using state-of-the-art techniques and prioritizing patient comfort, she ensures that your transformation is as safe as it is stunning. She strives for results that don't just look good, but feel right—enhancing your self-esteem and letting your inner vibrancy shine through.",
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
    {
        id: 'dr-shats',
        name: 'Dr. Rita Shats',
        slug: 'dr-rita-shats',
        title: 'Board Certified Cosmetic Gynecologist',
        role: 'Cosmetic Gynecologist',
        quote: "True confidence comes from within, but sometimes, it needs a little help to shine. I'm here to help you reclaim your comfort and embrace your most confident self.",
        shortBio:
            'A board-certified cosmetic gynecologist known for her empathetic approach and advanced surgical skill. Dr. Shats specializes in intimate wellness and rejuvenation, offering personalized care that empowers women.',
        fullBio:
            "Dr. Rita Shats is a leading authority in cosmetic gynecology, blending exceptional medical expertise with a deeply empathetic approach to patient care. As a Board Certified Cosmetic Gynecologist and Associate Director of Gynecology at Richmond University Medical Center, she brings years of specialized experience to Alluring Plastic Surgery.\n\nDr. Shats understands that intimate aesthetic concerns can deeply affect a woman's quality of life and self-image. That's why she is dedicated to providing a safe, judgment-free space where women can openly discuss their goals. Whether performing a labiaplasty, vaginoplasty, or a comprehensive mommy makeover, Dr. Shats combines technical precision with an artistic touch to deliver results that improve both function and aesthetics.\n\nHer forward-thinking approach prioritizes your comfort and unique anatomy, ensuring that every treatment plan is as individual as you are. With Dr. Shats, you are choosing a partner who champions your well-being and empowers you to feel truly at home in your body.",
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
            'Mommy Makeover',
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
