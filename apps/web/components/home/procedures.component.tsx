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
import { procedures } from '@/lib/data/procedures.data'

import { SignatureProcedureCard } from '../shared/signature-procedure-card.component'
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
const signatureProcedures = procedures.filter((proc) =>
    [
        'brazilian-butt-lift-bbl-miami',
        'mommy-makeover-miami',
        'breast-augmentation-miami',
        'liposuction-miami',
    ].includes(proc.slug)
)

export const Procedures = () => (
    <ProceduresCarousel count={signatureProcedures.length}>
        {signatureProcedures.map((procedure, idx) => (
            <SignatureProcedureCard
                key={procedure.slug}
                procedure={procedure}
                index={idx}
            />
        ))}
    </ProceduresCarousel>
)
