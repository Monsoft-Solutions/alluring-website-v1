import type { Organization, WithContext } from 'schema-dts'

import type { OrganizationSchemaProps } from '../types/schema/organization.type'
import { withContext } from './_internal'

export function buildOrganizationJsonLd(
    props: OrganizationSchemaProps
): WithContext<Organization> {
    const organization: Organization = {
        '@type': 'Organization',
        name: props.name,
        url: props.url,
        logo: props.logo,
        legalName: props.legalName,
        foundingDate: props.foundingDate,
        founder: props.founders?.map((name) => ({ '@type': 'Person', name })),
        address: props.address && {
            '@type': 'PostalAddress',
            streetAddress: props.address.streetAddress,
            addressLocality: props.address.addressLocality,
            addressRegion: props.address.addressRegion,
            postalCode: props.address.postalCode,
            addressCountry: props.address.addressCountry,
        },
        contactPoint: props.contactPoint?.map((cp) => ({
            '@type': 'ContactPoint',
            contactType: cp.contactType,
            telephone: cp.telephone,
            email: cp.email,
            areaServed: cp.areaServed,
            availableLanguage: cp.availableLanguage,
        })),
        sameAs: props.sameAs,
    }

    return withContext(organization)
}
