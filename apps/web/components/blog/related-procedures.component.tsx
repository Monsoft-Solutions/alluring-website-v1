/**
 * Related Procedures Component
 *
 * Displays procedures related to a blog post for cross-linking
 * and improved E-E-A-T signals.
 */
import { ProcedureCard } from '@/components/procedures/procedure-card.component'
import type { Procedure } from '@/lib/types/procedure.type'

type RelatedProceduresProps = {
    readonly procedures: Procedure[]
    readonly title?: string
    readonly description?: string
}

export function RelatedProcedures({
    procedures,
    title = 'Related Procedures',
    description = 'Explore the procedures mentioned in this article',
}: RelatedProceduresProps) {
    if (procedures.length === 0) return null

    return (
        <section className='border-border/30 mt-20 border-t pt-16'>
            <div className='mb-12'>
                <h2 className='text-foreground mb-3 font-serif text-2xl font-medium tracking-tight sm:text-3xl'>
                    {title}
                </h2>
                <p className='text-muted-foreground text-base font-light'>
                    {description}
                </p>
            </div>

            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                {procedures.map((procedure, index) => (
                    <ProcedureCard
                        key={procedure.slug}
                        procedure={procedure}
                        index={index}
                    />
                ))}
            </div>
        </section>
    )
}
