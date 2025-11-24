'use client'

import { Clock, Syringe, Activity, Sparkles, Hotel } from 'lucide-react'
import type { ProcedureStats as ProcedureStatsType } from '@/lib/types/procedure.type'
import { cn } from '@workspace/ui/lib/utils'
import { ContainerLayout } from '@/components/container-layout.component'

interface ProcedureStatsProps {
    stats: ProcedureStatsType
    className?: string
}

export function ProcedureStats({ stats, className }: ProcedureStatsProps) {
    const items = [
        {
            label: 'Duration',
            value: stats.duration,
            icon: Clock,
        },
        {
            label: 'Anesthesia',
            value: stats.anesthesia,
            icon: Syringe,
        },
        {
            label: 'Recovery',
            value: stats.recovery,
            icon: Activity,
        },
        {
            label: 'Results',
            value: stats.results,
            icon: Sparkles,
        },
    ]

    if (stats.inpatientOutpatient) {
        items.push({
            label: 'Setting',
            value: stats.inpatientOutpatient,
            icon: Hotel,
        })
    }

    return (
        <div className={cn('bg-stone-900 py-12 text-white', className)}>
            <ContainerLayout>
                <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
                    {items.map((item, index) => (
                        <div
                            key={item.label}
                            className={cn(
                                'flex flex-col items-center text-center',
                                index !== items.length - 1 &&
                                    'lg:border-r lg:border-white/10'
                            )}
                        >
                            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5'>
                                <item.icon className='text-gold-400 h-6 w-6' />
                            </div>
                            <dt className='text-muted-foreground mb-1 text-sm font-medium tracking-wider uppercase'>
                                {item.label}
                            </dt>
                            <dd className='font-serif text-xl font-medium'>
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </div>
            </ContainerLayout>
        </div>
    )
}
