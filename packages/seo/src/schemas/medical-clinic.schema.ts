import type { MedicalBusiness, MedicalClinic, WithContext } from 'schema-dts'

import type { MedicalClinicSchemaProps } from '../types/schema/medical-clinic.type'
import { withContext } from './_internal'

/**
 * Converts a medical specialty string to a Schema.org URL if not already
 * @param specialty - Specialty name or full URL (e.g., "PlasticSurgery" or "https://schema.org/PlasticSurgery")
 * @returns Full Schema.org URL
 */
function toMedicalSpecialtyUrl(specialty: string): string {
    // If already a full URL, return as-is
    if (specialty.startsWith('https://') || specialty.startsWith('http://')) {
        return specialty
    }
    // Convert to Schema.org URL
    return `https://schema.org/${specialty}`
}

/**
 * Builds JSON-LD structured data for a MedicalBusiness or MedicalClinic
 *
 * MedicalBusiness is the default and preferred type for private medical practices.
 * MedicalClinic implies a facility associated with a hospital or medical school.
 * Both are subtypes of LocalBusiness that signal to Google this is a healthcare
 * facility, improving relevance for medical searches and enabling healthcare-specific
 * SERP features.
 *
 * @see https://schema.org/MedicalBusiness
 * @see https://schema.org/MedicalClinic
 */
export function buildMedicalClinicJsonLd(
    props: MedicalClinicSchemaProps
): WithContext<MedicalBusiness | MedicalClinic> {
    // Build the base clinic object using Record to handle properties
    // not fully typed in schema-dts
    // Default to MedicalBusiness as it's more appropriate for private practices
    const clinic: Record<string, unknown> = {
        '@type': props.schemaType ?? 'MedicalBusiness',
        name: props.name,
    }

    // Add @id for Knowledge Graph entity identification
    if (props.id) {
        clinic['@id'] = props.id
    }

    // Add optional string properties
    if (props.url) clinic.url = props.url
    if (props.telephone) clinic.telephone = props.telephone
    if (props.logo) clinic.logo = props.logo
    if (props.image) clinic.image = props.image
    if (props.priceRange) clinic.priceRange = props.priceRange

    // Handle address
    if (props.address) {
        clinic.address = {
            '@type': 'PostalAddress',
            ...(props.address.streetAddress && {
                streetAddress: props.address.streetAddress,
            }),
            ...(props.address.addressLocality && {
                addressLocality: props.address.addressLocality,
            }),
            ...(props.address.addressRegion && {
                addressRegion: props.address.addressRegion,
            }),
            ...(props.address.postalCode && {
                postalCode: props.address.postalCode,
            }),
            ...(props.address.addressCountry && {
                addressCountry: props.address.addressCountry,
            }),
        }
    }

    // Handle geo coordinates
    if (props.geo) {
        clinic.geo = {
            '@type': 'GeoCoordinates',
            latitude: props.geo.latitude,
            longitude: props.geo.longitude,
        }
    }

    // Handle opening hours
    if (props.openingHoursSpecification) {
        clinic.openingHoursSpecification = props.openingHoursSpecification.map(
            (o) => ({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: o.dayOfWeek,
                opens: o.opens,
                closes: o.closes,
            })
        )
    }

    // Handle aggregate rating
    if (props.aggregateRating) {
        clinic.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: props.aggregateRating.ratingValue,
            reviewCount: props.aggregateRating.reviewCount,
            bestRating: props.aggregateRating.bestRating ?? 5,
            worstRating: props.aggregateRating.worstRating ?? 1,
        }
    }

    // Handle medical specialty - Convert to Schema.org URLs for better semantic signals
    if (props.medicalSpecialty && props.medicalSpecialty.length > 0) {
        clinic.medicalSpecialty = props.medicalSpecialty.map(
            toMedicalSpecialtyUrl
        )
    }

    // Handle available services - MedicalClinic specific
    if (props.availableService && props.availableService.length > 0) {
        clinic.availableService = props.availableService.map((service) => ({
            '@type': 'MedicalProcedure',
            name: service.name,
            ...(service.url && { url: service.url }),
            ...(service.description && { description: service.description }),
        }))
    }

    // Handle isAcceptingNewPatients - MedicalClinic specific
    if (props.isAcceptingNewPatients !== undefined) {
        clinic.isAcceptingNewPatients = props.isAcceptingNewPatients
    }

    // Handle contact points - Enhanced for multiple contact types
    if (props.contactPoint && props.contactPoint.length > 0) {
        clinic.contactPoint = props.contactPoint.map((cp) => ({
            '@type': 'ContactPoint',
            contactType: cp.contactType,
            ...(cp.telephone && { telephone: cp.telephone }),
            ...(cp.email && { email: cp.email }),
            ...(cp.availableLanguage && {
                availableLanguage: cp.availableLanguage,
            }),
            ...(cp.areaServed && { areaServed: cp.areaServed }),
        }))
    }

    // Handle available languages
    if (props.availableLanguage && props.availableLanguage.length > 0) {
        clinic.availableLanguage = props.availableLanguage
    }

    // Handle payment methods
    if (props.paymentAccepted && props.paymentAccepted.length > 0) {
        clinic.paymentAccepted = props.paymentAccepted.join(', ')
    }

    // Handle sameAs links (social profiles, etc.)
    if (props.sameAs && props.sameAs.length > 0) {
        clinic.sameAs = props.sameAs
    }

    return withContext(clinic as unknown as MedicalBusiness | MedicalClinic)
}
