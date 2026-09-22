/**
 * The surgeon as a structured-data node, for the procedure pages that name
 * her.
 *
 * Built only from `karlinsky-credentials.constant.ts`, the credentials checked
 * at each issuing body, so the graph says exactly what the page says:
 *
 * - `Person`, not `Physician`: schema.org's `Physician` is a medical business.
 * - No `medicalSpecialty`: "PlasticSurgery" would be a claim she can't make.
 * - No American Board of Cosmetic Surgery credential: Florida Rule
 *   64B8-11.001(2)(f) requires its statement beside every mention, and a
 *   credential node has nowhere to put it.
 *
 * Its `@id` is her profile page's, not the `#physician-dr-karlinsky` node the
 * home and profile pages publish, which still carries the site-wide
 * credential wording #248 replaces.
 *
 * @module
 */
import type { JsonLdGraphNode } from '@workspace/seo/react'

import {
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
    karlinskyRecords,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { toAbsoluteUrl } from '@/lib/seo/procedure-graph.util'

const americanCollegeOfSurgeons = {
    '@type': 'Organization',
    name: 'American College of Surgeons',
    url: 'https://www.facs.org',
}

/**
 * Dr. Karlinsky as a `Person`, working for the clinic.
 *
 * @param siteUrl - The site origin, with no trailing slash.
 */
export function karlinskyPersonNode(
    siteUrl: string
): JsonLdGraphNode & { '@id': string } {
    const profileUrl = `${siteUrl}/dr-karlinsky`
    const portrait = surgeons.find((surgeon) => surgeon.id === 'dr-karlinsky')
        ?.images.portrait

    return {
        '@type': 'Person',
        '@id': `${profileUrl}#person`,
        // With MD, as Rule 64B8-11.001(7) asks of advertising.
        name: KARLINSKY_NAME,
        givenName: 'Victoria',
        familyName: 'Karlinsky',
        honorificSuffix: 'MD, FACS',
        jobTitle: 'Surgeon',
        url: profileUrl,
        ...(portrait && { image: toAbsoluteUrl(portrait, siteUrl) }),
        worksFor: { '@id': `${siteUrl}/#organization` },
        memberOf: americanCollegeOfSurgeons,
        hasCredential: [
            {
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'Board certification',
                name: 'Board certified in general surgery',
                dateCreated: KARLINSKY_ABS_CERTIFIED_ON,
                recognizedBy: {
                    '@type': 'Organization',
                    name: 'American Board of Surgery',
                    url: 'https://www.absurgery.org',
                },
                url: karlinskyRecords.americanBoardOfSurgery,
            },
            {
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'Fellowship',
                name: 'Fellow of the American College of Surgeons (FACS)',
                recognizedBy: americanCollegeOfSurgeons,
                url: karlinskyRecords.americanCollegeOfSurgeons,
            },
            {
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'Medical license',
                name: `Florida medical license ${KARLINSKY_FLORIDA_LICENSE}`,
                recognizedBy: {
                    '@type': 'GovernmentOrganization',
                    name: 'Florida Department of Health',
                },
                url: karlinskyRecords.floridaLicense,
            },
        ],
        sameAs: [
            karlinskyRecords.americanBoardOfSurgery,
            karlinskyRecords.americanCollegeOfSurgeons,
        ],
    }
}
