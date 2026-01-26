import type { ProfilePage, WithContext } from 'schema-dts'

import { buildProfilePageJsonLd } from '../../schemas/profile-page.schema'
import type { ProfilePageSchemaProps } from '../../types/schema/profile-page.type'
import { JsonLd } from '../json-ld.component'

/**
 * ProfilePage Schema Component
 *
 * Renders ProfilePage structured data for surgeon/expert profile pages.
 * Helps Google understand that this page is a profile about a specific person.
 *
 * @example
 * ```tsx
 * <ProfilePageSchema
 *   url="https://example.com/dr-smith"
 *   name="Dr. Smith - Board-Certified Plastic Surgeon"
 *   description="Learn about Dr. Smith's background and expertise"
 *   mainEntity={{
 *     '@type': 'Physician',
 *     '@id': 'https://example.com/#physician-dr-smith',
 *     name: 'Dr. John Smith',
 *     jobTitle: 'Board-Certified Plastic Surgeon',
 *     url: 'https://example.com/dr-smith',
 *   }}
 * />
 * ```
 */
export function ProfilePageSchema(props: ProfilePageSchemaProps) {
    const data: WithContext<ProfilePage> = buildProfilePageJsonLd(props)
    return <JsonLd data={data} />
}
