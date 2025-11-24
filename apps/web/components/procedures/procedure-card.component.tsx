'use client'

import { Procedure } from '@/lib/types/procedure.type'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProcedureCardProps {
    procedure: Procedure
    index: number
}

export function ProcedureCard({ procedure, index }: ProcedureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link
                href={`/procedures/${procedure.slug}`}
                className='group block h-full'
            >
                <div className='hover:border-gold-500/50 hover:shadow-gold-500/10 relative h-full overflow-hidden border border-stone-200 bg-white transition-all duration-500 hover:shadow-2xl'>
                    {/* Image Container */}
                    <div className='relative aspect-[4/3] overflow-hidden bg-stone-100'>
                        {procedure.image ? (
                            <Image
                                src={procedure.image}
                                alt={procedure.title}
                                fill
                                className='object-cover transition-transform duration-700 group-hover:scale-105'
                            />
                        ) : (
                            <div className='flex h-full items-center justify-center text-stone-400'>
                                No Image
                            </div>
                        )}
                        <div className='absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

                        {/* Badge */}
                        {procedure.category && (
                            <span className='absolute top-6 left-6 bg-white/90 px-3 py-1 text-xs font-bold tracking-widest text-stone-900 uppercase backdrop-blur-sm'>
                                {procedure.category}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className='flex flex-col p-8'>
                        <h3 className='group-hover:text-gold-600 mb-3 font-serif text-2xl text-stone-900 transition-colors'>
                            {procedure.title}
                        </h3>
                        <div className='bg-gold-400/50 mb-4 h-[1px] w-12 transition-all duration-500 group-hover:w-full' />
                        <p className='mb-6 line-clamp-3 text-base leading-relaxed font-light text-stone-600'>
                            {procedure.shortDescription ||
                                procedure.description}
                        </p>

                        <div className='text-gold-600 mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase'>
                            Discover
                            <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-2' />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
