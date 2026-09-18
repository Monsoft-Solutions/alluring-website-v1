/**
 * The schema.org type of the practice, everywhere `/#organization` is
 * published or referenced.
 *
 * Every JSON-LD node that carries that `@id` describes the same entity, so it
 * must carry the same type. It used to be `Organization` in the root layout,
 * `MedicalBusiness` on the home and contact pages, `LocalBusiness` on reviews
 * and `MedicalClinic` on the procedure pages (#255).
 *
 * `MedicalClinic` because it is the one type that validly holds every property
 * those nodes use: it is both a `MedicalBusiness` (a LocalBusiness: address,
 * hours, geo, price range) and a `MedicalOrganization` (`medicalSpecialty`,
 * `isAcceptingNewPatients`), and it has `availableService`, which the
 * procedure graph uses to link the clinic to each procedure. `MedicalBusiness`
 * has none of those three.
 */
export const ORGANIZATION_SCHEMA_TYPE = 'MedicalClinic' as const
