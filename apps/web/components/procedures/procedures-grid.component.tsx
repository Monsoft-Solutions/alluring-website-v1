'use client'

import { Procedure } from '@/lib/types/procedure.type'
import { AnimatePresence, motion } from 'framer-motion'
import { ProcedureCard } from './procedure-card.component'

interface ProceduresGridProps {
    procedures: Procedure[]
    activeCategory: string
}

export function ProceduresGrid({
    procedures,
    activeCategory,
}: ProceduresGridProps) {
    const filteredProcedures =
        activeCategory === 'all'
            ? procedures
            : procedures.filter((p) => p.category === activeCategory)

    return (
        <div id='procedures-grid' className='min-h-[50vh] scroll-mt-32'>
            <motion.div
                layout
                className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
            >
                <AnimatePresence mode='popLayout'>
                    {filteredProcedures.map((procedure, index) => (
                        <ProcedureCard
                            key={procedure.slug}
                            procedure={procedure}
                            index={index}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredProcedures.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='py-20 text-center'
                >
                    <p className='text-muted-foreground text-lg'>
                        No procedures found in this category.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
