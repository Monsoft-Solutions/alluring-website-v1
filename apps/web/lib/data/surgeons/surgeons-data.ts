import { Surgeon } from '@/lib/types/surgeon.type'

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
        quote: 'Precision, artistry, and a deep understanding of anatomy allow me to create results that look and feel natural.',
        shortBio:
            'A board-certified plastic and reconstructive surgeon with over 20 years of experience. Dr. Lofman specializes in Breast Augmentation, Tummy Tucks, and Mommy Makeovers, prioritizing exceptional patient care.',
        fullBio:
            'Dr. Andrew Lofman is a board-certified plastic and reconstructive surgeon with over two decades of experience helping patients achieve their aesthetic goals. He brings a wealth of expertise and a keen artistic eye to Alluring Plastic Surgery, specializing in transformative procedures like Breast Augmentation, Tummy Tucks, and Mommy Makeovers.\n\nDr. Lofman is dedicated to a patient-first approach, believing that the best results come from a collaborative relationship built on trust and transparency. He takes the time to understand each patient’s unique desires and anatomy, developing tailored treatment plans that ensure natural-looking and harmonious outcomes. His commitment to safety and education creates a supportive environment where patients feel confident and informed throughout their journey.',
        images: {
            featured: '/images/placeholder-doctor.jpg', // Placeholder - Image not found on source site
            portrait: '/images/placeholder-doctor.jpg', // Placeholder
        },
        education: [
            'Board Certified Plastic Surgeon',
            'Medical Degree (MD)',
            'General Surgery Residency',
            'Plastic Surgery Fellowship',
        ],
        certifications: [
            'Board Certified by the American Board of Plastic Surgery',
            'Member of the American Society of Plastic Surgeons',
        ],
        specialties: [
            'Breast Augmentation',
            'Body Contouring',
            'Liposuction',
            'Facial Rejuvenation',
            'Mommy Makeover',
            'Tummy Tuck',
        ],
        philosophy:
            'Dr. Lofman believes in a collaborative approach to plastic surgery, where the patient and surgeon work together to achieve the best possible outcome. He is committed to transparency, education, and providing a supportive environment for every patient.',
    },
    {
        id: 'dr-shats',
        name: 'Dr. Rita Shats',
        slug: 'dr-rita-shats',
        title: 'Board Certified Cosmetic Gynecologist',
        role: 'Cosmetic Gynecologist',
        quote: 'Enhancing your natural beauty is my passion. I strive to provide results that are both beautiful and harmonious.',
        shortBio:
            'A highly respected board-certified cosmetic gynecologist recognized for her medical expertise and empathetic patient care. Dr. Shats specializes in personalized treatment plans tailored to your unique needs.',
        fullBio:
            'Dr. Rita Shats is a highly respected obstetrician and gynecologist recognized for her medical expertise, empathetic patient care, and forward-thinking approach. As a Board Certified Cosmetic Gynecologist, she brings a unique perspective to aesthetic wellness, prioritizing personalized treatment plans that empower her patients.\n\nServing as an Attending Physician and Associate Director of Gynecology at Richmond University Medical Center, Dr. Shats combines extensive clinical experience with advanced surgical skill. She is known for crafting comprehensive strategies tailored to each patient’s unique needs and goals, ensuring results that are not only beautiful but also enhance overall well-being. Her compassionate demeanor makes her a trusted partner for women seeking to rejuvenate and restore their confidence.',
        images: {
            featured: '/images/placeholder-doctor.jpg', // Placeholder - Image not found on source site
            portrait: '/images/placeholder-doctor.jpg', // Placeholder
        },
        education: [
            'Medical Degree (MD)',
            'Residency in Obstetrics and Gynecology',
        ],
        certifications: [
            'Board Certified Cosmetic Gynecologist',
            'Attending Physician, Richmond University Medical Center',
            'Associate Director of Gynecology, Richmond University Medical Center',
        ],
        specialties: [
            'Cosmetic Gynecology',
            'Vaginal Rejuvenation',
            'Labiaplasty',
            'Mommy Makeover',
            'Body Contouring',
        ],
        philosophy:
            'Dr. Shats’ philosophy focuses on open communication and trust. She believes that a successful outcome starts with a strong doctor-patient relationship. She takes the time to listen to her patients and explain every step of the process, ensuring they feel comfortable and informed.',
    },
]
