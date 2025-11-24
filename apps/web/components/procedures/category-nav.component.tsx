'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const categories = [
    { id: 'all', label: 'View All' },
    { id: 'breast', label: 'Breast' },
    { id: 'body', label: 'Body' },
    { id: 'face', label: 'Face' },
    { id: 'combined', label: 'Combined' },
]

interface CategoryNavProps {
    activeCategory: string
    onSelectCategory: (category: string) => void
    disableSticky?: boolean
}

export function CategoryNav({
    activeCategory,
    onSelectCategory,
    disableSticky = false,
}: CategoryNavProps) {
    const [isSticky, setIsSticky] = useState(false)

    useEffect(() => {
        if (disableSticky) return

        const handleScroll = () => {
            // Adjust threshold based on hero height
            const offset = window.scrollY
            setIsSticky(offset > window.innerHeight - 100)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [disableSticky])

    return (
        <div
            className={cn(
                'z-40 w-full transition-all duration-500',
                !disableSticky && isSticky
                    ? 'fixed top-20 border-b border-stone-200 bg-white/80 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60'
                    : 'sticky top-0 border-b border-stone-100 bg-white py-4'
            )}
        >
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='no-scrollbar flex items-center justify-start overflow-x-auto sm:justify-center'>
                    <div className='flex items-center gap-2 p-1'>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    onSelectCategory(category.id)
                                    const grid =
                                        document.getElementById(
                                            'procedures-grid'
                                        )
                                    if (grid) {
                                        // Offset for sticky header
                                        const y =
                                            grid.getBoundingClientRect().top +
                                            window.scrollY -
                                            180
                                        window.scrollTo({
                                            top: y,
                                            behavior: 'smooth',
                                        })
                                    }
                                }}
                                className={cn(
                                    'relative rounded-full px-6 py-2 text-sm font-bold tracking-wider whitespace-nowrap uppercase transition-all',
                                    activeCategory === category.id
                                        ? 'text-white'
                                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                                )}
                            >
                                {activeCategory === category.id && (
                                    <motion.div
                                        layoutId='activeCategory'
                                        className='bg-gold-500 shadow-gold-500/20 absolute inset-0 rounded-full shadow-lg'
                                        transition={{
                                            type: 'spring',
                                            bounce: 0.2,
                                            duration: 0.6,
                                        }}
                                    />
                                )}
                                <span className='relative z-10'>
                                    {category.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
