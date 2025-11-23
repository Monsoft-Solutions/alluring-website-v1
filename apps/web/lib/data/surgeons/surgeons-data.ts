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
            'Dr. Victoria Karlinsky is a board-certified cosmetic and general surgeon with extensive experience in the field of aesthetic surgery. Her commitment to providing personalized care has made her a trusted name in the industry.',
        fullBio:
            "A graduate of the esteemed Ross University School of Medicine, Dr. Karlinsky has undergone rigorous general and specialized cosmetic surgery training, including fellowship training at the American Academy of Cosmetic Surgery. As a Fellow of the American College of Surgeons (FACS), she upholds the highest standards of patient care, combining her technical skills with an artistic eye to deliver results that enhance her patients' natural beauty. Dr. Karlinsky specializes in procedures such as face lifts, eyelid surgery, breast augmentation, breast lifts, breast reduction, and tummy tucks (abdominoplasty). Known for delivering natural, personalized results through advanced techniques that enhance each patient’s beauty.",
        images: {
            featured:
                'https://www.alluringplasticsurgery.com/wp-content/uploads/2024/09/dr-karlinsky-featured-image.webp',
            portrait:
                'https://www.alluringplasticsurgery.com/wp-content/uploads/2024/09/dr-karlinsky-featured-image.webp', // Placeholder if no portrait exists
        },
        education: [
            'Medical Degree from Ross University School of Medicine',
            'Residency at Beth Israel Medical Center, NYC',
            'Cosmetic Surgery Fellowship at the Facial Plastic and Cosmetic Surgical Center in Abilene, Texas',
        ],
        certifications: [
            'Board Certified by the American Board of Cosmetic Surgery',
            'Board Certified by the American Board of Facial Cosmetic Surgery',
            'Board Certified by the American Board of Surgery',
            'Fellow of The American College of Surgeons',
            'Fellow of the American Academy of Cosmetic Surgery',
        ],
        specialties: [
            'Facelift (Rhytidectomy)',
            'Blepharoplasty (Eyelid Surgery)',
            'Breast Augmentation',
            'Breast Lift',
            'Breast Reduction',
            'Tummy Tuck (Abdominoplasty)',
            'Liposuction',
        ],
        philosophy:
            'Dr. Victoria Karlinsky’s philosophy is centered around helping patients look and feel their best, with a focus on natural beauty, individualized care, and lasting results. She believes that cosmetic surgery should be a transformative experience, not only in appearance but in confidence and self-esteem. Her approach prioritizes patient safety, comfort, and an unwavering dedication to achieving the best possible outcomes.',
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
            'Dr. Andrew Lofman is a highly skilled plastic surgeon dedicated to helping patients achieve their aesthetic goals through advanced surgical techniques and personalized care.',
        fullBio:
            'Dr. Andrew Lofman brings a wealth of experience and a keen artistic eye to Alluring Plastic Surgery.  With a focus on patient safety and satisfaction, Dr. Lofman works closely with each patient to understand their desires and develop a tailored treatment plan.  His expertise spans a wide range of reconstructive and cosmetic procedures, ensuring that every patient receives world-class care.',
        images: {
            featured: '/images/placeholder-doctor.jpg', // Placeholder
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
        ],
        philosophy:
            'Dr. Lofman believes in a collaborative approach to plastic surgery, where the patient and surgeon work together to achieve the best possible outcome.  He is committed to transparency, education, and providing a supportive environment for every patient.',
    },
    {
        id: 'dr-shats',
        name: 'Dr. Rita Shats',
        slug: 'dr-rita-shats',
        title: 'Board Certified Plastic Surgeon',
        role: 'Plastic Surgeon',
        quote: 'Enhancing your natural beauty is my passion. I strive to provide results that are both beautiful and harmonious.',
        shortBio:
            'Dr. Rita Shats is a board-certified plastic surgeon known for her compassionate approach and exceptional surgical skills.',
        fullBio:
            'Dr. Rita Shats is dedicated to providing the highest quality of care to her patients.  She combines her medical expertise with a woman’s touch to understand the unique needs and goals of her patients.  Dr. Shats specializes in a variety of cosmetic procedures and is committed to helping patients feel confident and beautiful.',
        images: {
            featured: '/images/placeholder-doctor.jpg', // Placeholder
            portrait: '/images/placeholder-doctor.jpg', // Placeholder
        },
        education: [
            'Board Certified Plastic Surgeon',
            'Medical Degree (MD)',
            'Residency in Plastic Surgery',
        ],
        certifications: [
            'Board Certified by the American Board of Plastic Surgery',
            'Member of the American Society of Plastic Surgeons',
        ],
        specialties: [
            'Mommy Makeover',
            'Breast Surgery',
            'Body Contouring',
            'Facial Procedures',
        ],
        philosophy:
            'Dr. Shats’ philosophy focuses on open communication and trust. She believes that a successful outcome starts with a strong doctor-patient relationship.  She takes the time to listen to her patients and explain every step of the process, ensuring they feel comfortable and informed.',
    },
]
