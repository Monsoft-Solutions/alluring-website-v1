import type { Physician, WithContext } from 'schema-dts'

import type { PhysicianSchemaProps } from '../types/schema/physician.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for a Physician
 *
 * Used for surgeon/doctor pages to enhance E-E-A-T signals
 * and enable rich results for medical professionals.
 *
 * Note: Some schema.org properties are valid but not in schema-dts types.
 * We build the object dynamically and cast to work around this.
 *
 * @see https://schema.org/Physician
 */
export function buildPhysicianJsonLd(
    props: PhysicianSchemaProps
): WithContext<Physician> {
    // Build the physician object with all properties
    // Use type assertion at the end to handle schema-dts limitations
    const physician: Record<string, unknown> = {
        '@type': 'Physician',
        name: props.name,
    }

    // Add optional string properties
    if (props.url) physician.url = props.url
    if (props.image) physician.image = props.image
    if (props.description) physician.description = props.description
    if (props.jobTitle) physician.jobTitle = props.jobTitle
    if (props.telephone) physician.telephone = props.telephone
    if (props.email) physician.email = props.email

    // Handle medical specialty
    if (props.medicalSpecialty) {
        physician.medicalSpecialty = Array.isArray(props.medicalSpecialty)
            ? props.medicalSpecialty.join(', ')
            : props.medicalSpecialty
    }

    // Map available services to MedicalProcedure references
    if (props.availableService && props.availableService.length > 0) {
        physician.availableService = props.availableService.map((service) => ({
            '@type': 'MedicalProcedure',
            name: service.name,
            ...(service.url && { url: service.url }),
            ...(service.description && { description: service.description }),
        }))
    }

    // Map memberships to Organization references
    if (props.memberOf && props.memberOf.length > 0) {
        physician.memberOf = props.memberOf.map((org) => ({
            '@type': 'Organization',
            name: org.name,
            ...(org.url && { url: org.url }),
        }))
    }

    // Map alumni to EducationalOrganization references
    if (props.alumniOf && props.alumniOf.length > 0) {
        physician.alumniOf = props.alumniOf.map((edu) => ({
            '@type': 'EducationalOrganization',
            name: edu.name,
            ...(edu.url && { url: edu.url }),
        }))
    }

    // Handle awards/certifications
    if (props.award && props.award.length > 0) {
        physician.award = props.award.join(', ')
    }

    // Handle worksFor organization
    if (props.worksFor) {
        physician.worksFor = {
            '@type': 'Organization',
            name: props.worksFor.name,
            ...(props.worksFor.url && { url: props.worksFor.url }),
        }
    }

    // Handle address
    if (props.address) {
        physician.address = {
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

    // Handle sameAs links (social profiles, medical board pages)
    if (props.sameAs && props.sameAs.length > 0) {
        physician.sameAs = props.sameAs
    }

    // Handle credentials (board certifications, licenses, degrees) - E-E-A-T enhancement
    if (props.hasCredential && props.hasCredential.length > 0) {
        physician.hasCredential = props.hasCredential.map((cred) => ({
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: cred.credentialCategory,
            name: cred.name,
            ...(cred.recognizedBy && {
                recognizedBy: {
                    '@type': 'Organization',
                    name: cred.recognizedBy.name,
                    ...(cred.recognizedBy.url && {
                        url: cred.recognizedBy.url,
                    }),
                },
            }),
            ...(cred.validIn && { validIn: cred.validIn }),
            ...(cred.dateCreated && { dateCreated: cred.dateCreated }),
        }))
    }

    // Handle knowsAbout - expertise areas for E-E-A-T signals
    if (props.knowsAbout && props.knowsAbout.length > 0) {
        physician.knowsAbout = props.knowsAbout
    }

    return withContext(physician as unknown as Physician)
}
