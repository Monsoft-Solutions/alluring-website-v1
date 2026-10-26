/**
 * Procedures Section
 *
 * The "Signature Procedures" band on the home page and the FAQ page.
 *
 * A server component on purpose. The cards are static — image, title, blurb,
 * link and their JSON-LD — so they are rendered here and handed to
 * `ProceduresCarousel` as children. Only the carousel's scroll behaviour needs
 * to run in the browser.
 *
 * Reading the catalog from a client component instead put all nine procedures'
 * full copy into the shared chunk of every route that renders this section,
 * along with the schema components the card uses (issue #210). Nothing about
 * the four cards below reaches the browser as JavaScript now.
 */
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import { getResolvedProcedures } from '@/lib/data/procedures.resolved.server'
import { getDiscountStatementText } from '@/lib/queries/pricing.query'

import { SignatureProcedureCard } from '../shared/signature-procedure-card.component'
import { toProcedureSummary } from '@/lib/data/procedure-summary.util'
import { ProceduresCarousel } from './procedures-carousel.component'

/**
 * Select signature procedures for home page.
 *
 * Kept as a filter over the catalog rather than a map over the slugs, because
 * that is what sets the display order: the cards come out in catalog order
 * (breast augmentation, liposuction, BBL, mommy makeover), not the order the
 * slugs happen to be listed in below. Rewriting it as a map would silently
 * reorder the carousel.
 */
const SIGNATURE_SLUGS = [
    'brazilian-butt-lift-bbl-miami',
    'mommy-makeover-miami',
    'breast-augmentation-miami',
    'liposuction-miami',
]

export async function Procedures() {
    // Claim tokens in the cards' copy are resolved first (#354); a card
    // that prints a discounted price needs the 456.062 statement with it.
    const [resolved, statement] = await Promise.all([
        getResolvedProcedures(),
        getDiscountStatementText(),
    ])
    const signatureProcedures = resolved.filter((proc) =>
        SIGNATURE_SLUGS.includes(proc.slug)
    )

    return (
        <>
            <ProceduresCarousel count={signatureProcedures.length}>
                {signatureProcedures.map((procedure, idx) => (
                    <SignatureProcedureCard
                        key={procedure.slug}
                        procedure={toProcedureSummary(procedure)}
                        index={idx}
                    />
                ))}
            </ProceduresCarousel>
            {statement && (
                <div className='mx-auto max-w-7xl px-6 py-4'>
                    <DiscountStatement statement={statement} />
                </div>
            )}
        </>
    )
}
