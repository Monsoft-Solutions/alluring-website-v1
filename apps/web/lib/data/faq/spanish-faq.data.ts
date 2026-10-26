/**
 * Spanish Landing Page FAQ Data
 *
 * FAQ data entirely in Spanish for the Spanish-language landing page.
 * Organized by categories addressing Spanish-speaking patients' concerns:
 * - Idioma: Language support and cultural understanding
 * - Procedimientos: Available procedures
 * - Financiamiento: Payment and financing options
 * - Viaje: Information for patients travelling in from other US states
 *
 * Note: this page is Spanish-LANGUAGE, not international. The practice
 * serves the United States; these answers exist for Spanish speakers
 * within it, whether they are local to Miami or flying in from another
 * state. Do not reintroduce cross-border framing.
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Spanish landing page FAQ categories
 */
export const spanishFaqCategories: FaqCategory[] = [
    { id: 'idioma', label: 'Idioma' },
    { id: 'procedimientos', label: 'Procedimientos' },
    { id: 'financiamiento', label: 'Financiamiento' },
    { id: 'viaje', label: 'Viajeros' },
]

/**
 * Spanish landing page FAQ items organized by category
 */
export const spanishFaqData: Record<string, FaqItem[]> = {
    idioma: [
        {
            question: '¿Hablan español?',
            answer: `Sí, hablamos español. Desde tu primera llamada hasta tu última cita de seguimiento, puedes comunicarte con nosotros en español.`,
        },
        {
            question: '¿La consulta será en español?',
            answer: `Sí. Te atendemos en español durante tu consulta, incluyendo la explicación del procedimiento, la revisión de fotos de antes y después, y la discusión de precios y financiamiento.`,
        },
        {
            question: '¿Los documentos y formularios están en español?',
            answer: `Sí, ofrecemos todos los documentos importantes en español, incluyendo formularios de consentimiento, instrucciones pre y post operatorias, e información sobre tu procedimiento. Queremos asegurarnos de que entiendas completamente cada paso.`,
        },
        {
            question: '¿Atienden pacientes de otros estados?',
            answer: `Sí. Recibimos pacientes de todo Estados Unidos, además de todo el sur de la Florida. Te atendemos en español en cada etapa, desde la consulta virtual hasta tus controles posoperatorios.`,
        },
    ],
    procedimientos: [
        {
            question: '¿Qué procedimientos ofrecen?',
            answer: `Ofrecemos BBL (levantamiento de glúteos brasileño), liposucción, abdominoplastia (tummy tuck), aumento, levantamiento y reducción de senos, mommy makeover, lifting facial y blefaroplastia. Tu cirujana te dice en la consulta qué opción te conviene.`,
        },
        {
            question: '¿Qué es el BBL y cómo funciona?',
            answer: `El Levantamiento de Glúteos Brasileño (BBL) es una cirugía que transfiere grasa de otras áreas de tu cuerpo (abdomen, espalda, muslos) a los glúteos. Así se da forma a los glúteos con tu propia grasa y se reduce grasa en las áreas tratadas.`,
        },
        {
            question: '¿Puedo combinar varios procedimientos?',
            answer: `Sí, muchos pacientes combinan procedimientos para lograr una transformación más completa. Por ejemplo, el "mommy makeover" típicamente combina abdominoplastia con cirugía de senos. Discutiremos qué combinaciones son seguras y apropiadas para ti.`,
        },
        {
            question: '¿Cuáles son las credenciales de su cirujana?',
            answer: `Victoria Karlinsky, MD, FACS, realiza todas las cirugías en Alluring. Está certificada en cirugía general por el American Board of Surgery desde 2008 y es Fellow del American College of Surgeons.`,
        },
    ],
    financiamiento: [
        {
            question: '¿Ofrecen planes de financiamiento?',
            // Las financieras, sin cifras de pago ni tasas (canon D6).
            answer: `Sí. Ofrecemos financiamiento a través de Cherry, CareCredit y United Credit para solicitantes calificados. Cada financiera fija la aprobación y los términos. Nuestro equipo te ayuda a ver las opciones.`,
        },
        {
            question:
                '¿Qué necesito para solicitar financiamiento si vivo en otro estado?',
            answer: `Lo mismo que cualquier paciente local. Cada financiera define la aprobación y los términos. Puedes completar la solicitud a distancia antes de viajar a Miami, y nuestro equipo te acompaña en español durante todo el proceso.`,
        },
        {
            question: '¿Qué incluye el precio del procedimiento?',
            answer: `Tu precio se fija después de un examen, y la Dra. Karlinsky lo confirma en tu consulta. Durante la consulta revisamos contigo qué cubre tu presupuesto.`,
        },
        {
            question: '¿La consulta tiene algún costo?',
            answer: `No, tu consulta inicial es gratuita y sin compromiso. Hablas de tus metas, ves fotos de resultados y recibes un presupuesto personalizado.`,
        },
    ],
    viaje: [
        {
            question: '¿Ayudan a coordinar el viaje?',
            answer: `No. No reservamos vuelos, alojamiento ni transporte, y no trabajamos con casas de recuperación, así que no podemos reservarte una ni recomendarte ninguna. Eso lo organizas tú. Lo que sí hacemos es darte por escrito la fecha de tu cirugía, tu cita preoperatoria y tus controles posteriores, y decirte cuántas noches necesitas quedarte en Miami antes de que tu cirujana te autorice a volar de regreso — para que compres los pasajes sobre un calendario ya confirmado. Te atendemos en español.`,
        },
        {
            question: '¿Cuánto tiempo necesito quedarme en Miami?',
            answer: `Para un BBL, planea quedarte de 7 a 10 días en Miami. Para otros procedimientos, tu cirujana te dice cuántas noches quedarte antes de volar a casa.`,
        },
        {
            question: '¿Ofrecen consultas virtuales antes de viajar?',
            answer: `Sí. Ofrecemos consultas virtuales por videollamada para pacientes que vienen de lejos. Puedes hablar de tus metas y recibir un presupuesto antes de hacer planes de viaje. Esto te da tranquilidad antes de comprometerte.`,
        },
        {
            question:
                '¿Qué pasa si necesito seguimiento después de regresar a casa?',
            answer: `Te damos instrucciones detalladas de cuidado posoperatorio por escrito y quedamos disponibles para consultas virtuales de seguimiento. Si hace falta, también podemos coordinar con un médico en tu ciudad. Tu bienestar sigue siendo nuestra prioridad después de que regreses a casa.`,
        },
    ],
}

/**
 * FAQ section configuration for Spanish landing page
 */
export const spanishFaqConfig = {
    title: 'Preguntas',
    subtitle: 'Frecuentes',
    badge: 'FAQ en Español',
    description: `Respuestas a las preguntas más comunes de nuestros pacientes hispanohablantes. ¿Tienes más preguntas? Llámanos al ${siteConfig.contact.phoneDisplay}.`,
}
