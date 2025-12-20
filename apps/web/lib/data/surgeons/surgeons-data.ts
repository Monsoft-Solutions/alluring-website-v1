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
            'MD, Ross University School of Medicine (Cosmetic & Aesthetic Surgery Concentration)',
            'Residency, Dept. of Surgery, Beth Israel Medical Center, NYC',
            'Fellowship, Facial Plastic & Cosmetic Surgical Center, Abilene, Texas',
        ],
        certifications: [
            'Board Certified, American Board of Cosmetic Surgery',
            'Board Certified, American Board of Facial Cosmetic Surgery',
            'Board Certified, American Board of Surgery',
            'Fellow, American College of Surgeons (FACS)',
            'Fellow, American Academy of Cosmetic Surgery',
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
    },
    {
        id: 'dr-lofman',
        name: 'Dr. Andrew Lofman',
        slug: 'dr-andrew-lofman',
        title: 'Board Certified Plastic Surgeon',
        role: 'Plastic Surgeon',
        quote: "Plastic surgery is where medical precision meets artistic vision. My goal is to create results that don't just look natural, but feel like they were always meant to be there.",
        shortBio:
            'A board-certified plastic surgeon with over 20 years of experience. Dr. Lofman combines seasoned expertise with a compassionate approach to deliver stunning breast and body transformations.',
        fullBio:
            'Dr. Andrew Lofman is a board-certified plastic and reconstructive surgeon who has dedicated over two decades to the art of aesthetic enhancement. Known for his warm bedside manner and meticulous surgical technique, Dr. Lofman believes that every patient deserves a transformative journey that prioritizes both safety and satisfaction.\n\nSpecializing in breast augmentation, tummy tucks, and mommy makeovers, Dr. Lofman approaches every procedure as a unique collaboration. He takes the time to listen deeply to your goals, ensuring that your surgical plan is perfectly aligned with your vision. His philosophy focuses on enhancing your natural beauty rather than altering your identity, resulting in outcomes that are harmonious, balanced, and timeless.\n\nFrom your initial consultation to your final follow-up, Dr. Lofman and his team provide a supportive, pressure-free environment where you can feel confident in your decisions. With Dr. Lofman, you are choosing a surgeon who sees the person behind the patient and is committed to helping you look and feel your absolute best.',
        images: {
            featured: '/images/surgeons/dr-andrew-lofman.jpg',
            portrait: '/images/surgeons/dr-andrew-lofman.jpg',
        },
        education: [
            'MD, Ross University School of Medicine',
            'Plastic Surgery Fellowship, Providence Hospital and Medical Center',
            'General Surgery Residency, Mercy Catholic Medical Center (Chief Resident)',
            'BA, Wayne State University',
        ],
        certifications: [
            'Board Certified, American Board of Plastic Surgery',
            'Member, American Society of Plastic Surgeons (ASPS)',
            'Fellow, American College of Surgeons (FACS)',
        ],
        specialties: [
            'Breast Augmentation',
            'Mommy Makeover',
            'Tummy Tuck (Abdominoplasty)',
            'Liposuction',
            'Body Contouring',
            'Facial Rejuvenation',
        ],
        philosophy:
            "Dr. Lofman's philosophy is simple: exceptional results start with a strong patient-surgeon relationship. He believes that plastic surgery should be an empowering experience that boosts self-esteem and improves quality of life. By combining advanced surgical techniques with a personalized, compassionate approach, he ensures that every patient feels heard, valued, and thrilled with their results. For Dr. Lofman, the ultimate measure of success is a happy, confident patient.",
        social: {
            instagram: 'https://instagram.com/alluringplasticsurgery',
            facebook: 'https://facebook.com/alluringplasticsurgery',
            tiktok: 'https://tiktok.com/@alluringplasticsurgery',
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
    },
]
