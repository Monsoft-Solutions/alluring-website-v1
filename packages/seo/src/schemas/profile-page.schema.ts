import type { ProfilePage, WithContext } from 'schema-dts'

import type {
    ProfilePageMainEntity,
    ProfilePageSchemaProps,
} from '../types/schema/profile-page.type'
import { withContext } from './_internal'

/**
 * Build the mainEntity object for ProfilePage schema
 */
function buildMainEntityObject(
    entity: ProfilePageMainEntity
): Record<string, unknown> {
    const mainEntity: Record<string, unknown> = {
        '@type': entity['@type'],
        name: entity.name,
    }

    if (entity['@id']) {
        mainEntity['@id'] = entity['@id']
    }
    if (entity.url) {
        mainEntity.url = entity.url
    }
    if (entity.image) {
        mainEntity.image = entity.image
    }
    if (entity.description) {
        mainEntity.description = entity.description
    }
    if (entity.jobTitle) {
        mainEntity.jobTitle = entity.jobTitle
    }
    if (entity.worksFor) {
        const worksForOrg: Record<string, unknown> = {
            '@type': 'Organization',
            name: entity.worksFor.name,
            ...(entity.worksFor.url && { url: entity.worksFor.url }),
        }

        // Add address to organization (recommended for rich results eligibility)
        if (entity.worksFor.address) {
            worksForOrg.address = {
                '@type': 'PostalAddress',
                ...(entity.worksFor.address.streetAddress && {
                    streetAddress: entity.worksFor.address.streetAddress,
                }),
                ...(entity.worksFor.address.addressLocality && {
                    addressLocality: entity.worksFor.address.addressLocality,
                }),
                ...(entity.worksFor.address.addressRegion && {
                    addressRegion: entity.worksFor.address.addressRegion,
                }),
                ...(entity.worksFor.address.postalCode && {
                    postalCode: entity.worksFor.address.postalCode,
                }),
                ...(entity.worksFor.address.addressCountry && {
                    addressCountry: entity.worksFor.address.addressCountry,
                }),
            }
        }

        mainEntity.worksFor = worksForOrg
    }
    if (entity.sameAs && entity.sameAs.length > 0) {
        mainEntity.sameAs = entity.sameAs
    }

    return mainEntity
}

/**
 * Build ProfilePage JSON-LD schema
 *
 * ProfilePage is used by Google for knowledge panel enrichment,
 * especially for professional/expert profiles.
 *
 * @see https://schema.org/ProfilePage
 */
export function buildProfilePageJsonLd(
    props: ProfilePageSchemaProps
): WithContext<ProfilePage> {
    const base: Record<string, unknown> = {
        '@type': 'ProfilePage',
        name: props.name,
        url: props.url,
        mainEntity: buildMainEntityObject(props.mainEntity),
    }

    // Add optional properties
    if (props.description) {
        base.description = props.description
    }
    if (props.dateCreated) {
        base.dateCreated = props.dateCreated
    }
    if (props.dateModified) {
        base.dateModified = props.dateModified
    }
    if (props.significantLinks && props.significantLinks.length > 0) {
        base.significantLink = props.significantLinks
    }
    if (props.publisher) {
        base.publisher = {
            '@type': 'Organization',
            name: props.publisher.name,
            ...(props.publisher.url && { url: props.publisher.url }),
            ...(props.publisher.logo && { logo: props.publisher.logo }),
        }
    }

    return withContext(base as unknown as ProfilePage)
}
