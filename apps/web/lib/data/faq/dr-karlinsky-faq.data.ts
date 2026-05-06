/**
 * Dr. Victoria Karlinsky Landing Page FAQ Data
 *
 * Categorized FAQ items tailored to the doctor-specific landing page.
 * Categories address the four objection clusters most common when
 * choosing a surgeon: who she is, the consult itself, safety/results,
 * and cost/financing.
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

export const drKarlinskyFaqCategories: FaqCategory[] = [
    { id: 'about', label: 'About Dr. Karlinsky' },
    { id: 'consultation', label: 'Your Consultation' },
    { id: 'safety', label: 'Safety & Results' },
    { id: 'cost', label: 'Cost & Financing' },
]

export const drKarlinskyFaqData: Record<string, FaqItem[]> = {
    about: [
        {
            question: 'Is Dr. Karlinsky board certified?',
            answer: `Yes — and not by one board, but three. Dr. Victoria Karlinsky is certified by the American Board of Cosmetic Surgery, the American Board of Facial Cosmetic Surgery, and the American Board of Surgery. She is also a Fellow of the American College of Surgeons (FACS), a Fellow of the American Academy of Cosmetic Surgery, and a Fellowship Director with the American Board of Cosmetic Surgery.`,
        },
        {
            question: 'How experienced is she?',
            answer: `Dr. Karlinsky has performed thousands of cosmetic and reconstructive procedures throughout her career. She trained at Beth Israel Medical Center in NYC and completed a fellowship at the Facial Plastic & Cosmetic Surgical Center in Texas. As a Fellowship Director, she now trains other surgeons in advanced cosmetic surgery techniques.`,
        },
        {
            question: 'What is her surgical philosophy?',
            answer: `Three pillars: safety first, personalization always, and natural results. She rejects the "one-size-fits-all" approach — every plan is built around your anatomy, your goals, and your lifestyle. The aim is never "obvious work" — it's a more confident version of you.`,
        },
        {
            question: 'Where can I verify her credentials?',
            answer: `Every credential listed on this page is independently verifiable. You can find Dr. Karlinsky's verified profiles on Healthgrades and RealSelf — both linked in the credentials section above. Board certifications can also be looked up directly on each board's website.`,
        },
    ],
    consultation: [
        {
            question: 'What happens during the consultation?',
            answer: `You'll meet privately with Dr. Karlinsky to discuss your goals. She'll evaluate your anatomy, walk you through suitable options, show you before-and-after results from similar cases, and provide a detailed all-inclusive quote. There's no pressure to make a decision — many patients book a consult months before deciding.`,
        },
        {
            question: 'Is the consultation really free?',
            answer: `Yes, completely complimentary with no obligation. We don't charge for an initial consultation because we want you to feel fully informed before committing to anything.`,
        },
        {
            question: 'Can I do a virtual consultation first?',
            answer: `Absolutely. Many out-of-state and international patients start with a virtual consult. You can discuss your goals, see preliminary recommendations, and get a quote estimate before flying to Miami.`,
        },
        {
            question: 'How soon can I book?',
            answer: `Consultation appointments are typically available within 1–2 weeks. Call us at ${siteConfig.contact.phoneDisplay} or fill out the form above and our patient concierge will work around your schedule.`,
        },
    ],
    safety: [
        {
            question: 'Is plastic surgery actually safe?',
            answer: `When performed by a triple board-certified surgeon in an accredited facility, the risk profile is excellent. Dr. Karlinsky's safety standards meet — and often exceed — what's required by the boards she sits on. Hospital-grade protocols, advanced monitoring, and a dedicated anesthesiology team accompany every procedure.`,
        },
        {
            question: 'Will I look natural — or "done"?',
            answer: `Natural is the entire point. Dr. Karlinsky tailors each procedure to your existing proportions and features. The goal is always "you, refreshed" — never the obvious cookie-cutter look. Bring inspiration photos to your consultation; she'll be candid about what's achievable for your anatomy.`,
        },
        {
            question: 'Can she combine multiple procedures safely?',
            answer: `Often, yes. Many patients save recovery time by combining a Mommy Makeover (tummy tuck + breast surgery + lipo) into one session. Whether combination is safe for you depends on your health, the specific procedures, and total surgical time. Dr. Karlinsky will give you a candid recommendation in your consult.`,
        },
        {
            question: 'How long is recovery?',
            answer: `Recovery varies by procedure. Most patients return to desk work in 1–2 weeks and resume full activities in 4–6 weeks. Dr. Karlinsky will give you a procedure-specific recovery timeline at your consultation, plus a 24/7 concierge contact for the entire post-op period.`,
        },
    ],
    cost: [
        {
            question: 'How much does Dr. Karlinsky cost?',
            answer: `Pricing depends on the procedure(s), surgical complexity, and recovery support you need. Quotes are all-inclusive — surgeon's fees, anesthesia, facility, and standard follow-up — with no hidden add-ons. You'll receive your personalized quote at the end of your consult.`,
        },
        {
            question: 'What financing do you accept?',
            answer: `We partner with Cherry, CareCredit, and United Credit. Many patients qualify for 0% APR for 12–24 months, and weekly payments often start as low as $27/week depending on the procedure and approved term. You can apply for pre-approval before your consult so you know your budget walking in.`,
        },
        {
            question: 'Are there any hidden fees?',
            answer: `Never. The quote you receive includes the surgeon's fee, anesthesia, facility costs, and your standard post-op follow-up. We believe in complete transparency — what we quote is what you pay.`,
        },
        {
            question: 'Is the deposit refundable?',
            answer: `If your surgery is cancelled by us for medical reasons, your deposit is fully refunded. Patient-initiated cancellations and reschedules are handled case-by-case — we'll walk you through the policy clearly before you put anything down.`,
        },
    ],
}

export const drKarlinskyFaqConfig = {
    badge: 'Honest Answers',
    title: 'Questions Patients Ask About',
    subtitle: 'Dr. Karlinsky.',
    description:
        "If you're researching surgeons (and you should be), here are the questions we hear most. Don't see yours? Bring it to your consult.",
}
