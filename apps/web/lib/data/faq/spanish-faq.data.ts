/**
 * Spanish Landing Page FAQ Data
 *
 * FAQ data entirely in Spanish for the Spanish-language landing page.
 * Organized by categories addressing Spanish-speaking patients' concerns:
 * - Idioma: Language support and cultural understanding
 * - Procedimientos: Available procedures
 * - Financiamiento: Payment and financing options
 * - Viaje: Information for patients traveling from Latin America
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
            question: '¿Todo el personal habla español?',
            answer: `Sí, todo nuestro equipo es completamente bilingüe. Desde tu primera llamada telefónica hasta tu última cita de seguimiento, puedes comunicarte en español. Nuestros cirujanos, coordinadores de pacientes y personal de enfermería hablan español con fluidez.`,
        },
        {
            question: '¿La consulta será en español?',
            answer: `Absolutamente. Tu consulta completa será en español, incluyendo la evaluación con el cirujano, la explicación del procedimiento, la revisión de fotos de antes y después, y la discusión de precios y financiamiento. No necesitarás traductor.`,
        },
        {
            question: '¿Los documentos y formularios están en español?',
            answer: `Sí, ofrecemos todos los documentos importantes en español, incluyendo formularios de consentimiento, instrucciones pre y post operatorias, e información sobre tu procedimiento. Queremos asegurarnos de que entiendas completamente cada paso.`,
        },
        {
            question: '¿Atienden pacientes de otros países?',
            answer: `¡Por supuesto! Recibimos pacientes de toda Latinoamérica y el Caribe: Venezuela, Colombia, Argentina, México, Brasil, República Dominicana, Puerto Rico, y muchos más. Entendemos las necesidades específicas de los pacientes internacionales.`,
        },
    ],
    procedimientos: [
        {
            question: '¿Qué procedimientos ofrecen?',
            answer: `Ofrecemos una gama completa de cirugías estéticas: Levantamiento de Glúteos Brasileño (BBL), aumento de senos, levantamiento de senos, liposucción, abdominoplastia (tummy tuck), mommy makeover, lifting facial, blefaroplastia, y más. Tu cirujano te recomendará las mejores opciones para tus metas.`,
        },
        {
            question: '¿Qué es el BBL y cómo funciona?',
            answer: `El Levantamiento de Glúteos Brasileño (BBL) es una cirugía que transfiere grasa de otras áreas de tu cuerpo (abdomen, espalda, muslos) a los glúteos. Esto te da curvas naturales mientras reduce grasa de áreas no deseadas. Miami es reconocido mundialmente por resultados de BBL de alta calidad.`,
        },
        {
            question: '¿Puedo combinar varios procedimientos?',
            answer: `Sí, muchos pacientes combinan procedimientos para lograr una transformación más completa. Por ejemplo, el "mommy makeover" típicamente combina abdominoplastia con cirugía de senos. Discutiremos qué combinaciones son seguras y apropiadas para ti.`,
        },
        {
            question: '¿Los cirujanos están certificados?',
            answer: `Sí, todos nuestros cirujanos están certificados por la junta americana de cirugía plástica y tienen más de 15 años de experiencia. Nuestra clínica está acreditada y cumple con los más altos estándares de seguridad.`,
        },
    ],
    financiamiento: [
        {
            question: '¿Ofrecen planes de financiamiento?',
            answer: `Sí, ofrecemos múltiples opciones de financiamiento con pagos desde $27 por semana. Trabajamos con varias compañías de financiamiento y ofrecemos planes con 0% de interés para pacientes calificados. Nuestro equipo te ayudará a encontrar la mejor opción.`,
        },
        {
            question:
                '¿Puedo obtener financiamiento si vivo fuera de Estados Unidos?',
            answer: `Las opciones de financiamiento tradicionales generalmente requieren residencia en EE.UU. Sin embargo, ofrecemos planes de pago flexibles para pacientes internacionales. Podemos discutir opciones como depósitos y pagos programados.`,
        },
        {
            question: '¿Qué incluye el precio del procedimiento?',
            answer: `Nuestros precios son transparentes e incluyen: honorarios del cirujano, uso de instalaciones quirúrgicas, anestesia, consultas de seguimiento, y fajas de compresión inicial. Te daremos un desglose completo durante tu consulta.`,
        },
        {
            question: '¿La consulta tiene algún costo?',
            answer: `No, tu consulta inicial es completamente gratuita y sin compromiso. Tendrás la oportunidad de conocer al cirujano, discutir tus metas, ver fotos de resultados, y recibir un presupuesto personalizado—todo sin ningún costo.`,
        },
    ],
    viaje: [
        {
            question: '¿Ayudan a coordinar el viaje desde mi país?',
            answer: `No. No reservamos vuelos, alojamiento ni transporte, y no trabajamos con casas de recuperación, así que no podemos reservarte una ni recomendarte ninguna. Eso lo organizas tú. Lo que sí hacemos es darte por escrito la fecha de tu cirugía, tu cita preoperatoria y tus controles posteriores, y decirte cuántas noches necesitas quedarte en Miami antes de que tu cirujano te autorice a volar de regreso — para que compres los pasajes sobre un calendario ya confirmado. Te atendemos en español.`,
        },
        {
            question: '¿Cuánto tiempo necesito quedarme en Miami?',
            answer: `El tiempo recomendado varía según el procedimiento. Para un BBL, recomendamos 10-14 días en Miami. Para procedimientos más pequeños como aumento de senos, 5-7 días puede ser suficiente. Te daremos recomendaciones específicas durante tu consulta.`,
        },
        {
            question: '¿Ofrecen consultas virtuales antes de viajar?',
            answer: `¡Sí! Ofrecemos consultas virtuales por videollamada para pacientes que vienen de lejos. Puedes conocer a tu cirujano, discutir tus metas, y recibir un presupuesto antes de hacer planes de viaje. Esto te da tranquilidad antes de comprometerte.`,
        },
        {
            question:
                '¿Qué pasa si necesito seguimiento después de regresar a mi país?',
            answer: `Proporcionamos instrucciones detalladas de cuidado post-operatorio y estamos disponibles para consultas virtuales de seguimiento. También podemos coordinar con médicos en tu país si es necesario. Tu bienestar continúa siendo nuestra prioridad después de que regreses a casa.`,
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
