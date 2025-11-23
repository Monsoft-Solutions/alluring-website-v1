'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const procedures = [
    {
        title: 'Brazilian Butt Lift',
        desc: 'Sculpt your waist, lift your curves, and enhance your silhouette.',
        img: 'https://images.unsplash.com/photo-1533236161504-34e08c388670?q=80&w=1000&auto=format&fit=crop',
        stat: '2-3 Weeks Recovery',
    },
    {
        title: 'Mommy Makeover',
        desc: 'Restore your pre-baby shape with a customized combination.',
        img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1000&auto=format&fit=crop',
        stat: 'Best Seller',
    },
    {
        title: 'Breast Augmentation',
        desc: 'Subtle refinement or dramatic change — proportions that feel natural.',
        img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1000&auto=format&fit=crop',
        stat: 'Immediate Results',
    },
    {
        title: 'Lipo 360',
        desc: 'Target stubborn areas and define your waistline with advanced contouring.',
        img: 'https://www.alluringplasticsurgery.com/wp-content/uploads/2024/08/body-contouring-unrecognizable-doctor-wearing-gloves-touching-female-body-with-marked-lines-1-1024x683.jpg',
        stat: 'Minimal Downtime',
    },
]

export const Procedures = () => {
    // We use a separate ref for the horizontal scroll container
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    return (
        <section
            id='procedures'
            className='overflow-hidden bg-stone-900 py-24 text-white'
        >
            <div className='container mx-auto mb-16 flex flex-col items-end justify-between px-6 md:flex-row md:px-12'>
                <div className='max-w-xl'>
                    <span className='text-gold-400 mb-4 block text-sm font-bold tracking-widest uppercase'>
                        Expertise
                    </span>
                    <h2 className='mb-6 font-serif text-4xl text-white md:text-5xl lg:text-6xl'>
                        Signature Procedures
                    </h2>
                    <p className='text-xl font-light text-stone-400'>
                        Tailored surgical plans for your body, your lifestyle,
                        and your definition of confidence.
                    </p>
                </div>
                <button className='hover:text-gold-400 hover:border-gold-400 hidden items-center gap-2 border-b border-stone-600 pb-2 text-sm tracking-widest uppercase transition-all md:flex'>
                    View All Procedures <ArrowRight className='h-4 w-4' />
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div
                ref={scrollContainerRef}
                className='scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pr-12 pb-12 pl-6 md:gap-8 md:pl-12'
            >
                {procedures.map((proc, idx) => (
                    <ProcedureCard
                        key={idx}
                        proc={proc}
                        index={idx}
                        containerRef={scrollContainerRef}
                    />
                ))}
            </div>
        </section>
    )
}

interface ProcedureCardProps {
    proc: {
        title: string
        desc: string
        img: string
        stat: string
    }
    index: number
    containerRef: React.RefObject<HTMLDivElement>
}

const ProcedureCard = ({ proc, index, containerRef }: ProcedureCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null)

    // Track the card's horizontal position within the scroll container
    const { scrollXProgress } = useScroll({
        container: containerRef,
        target: cardRef,
        axis: 'x',
        offset: ['start end', 'end start'], // Triggers as card enters from right (0) to exits left (1)
    })

    // Parallax effect: move image horizontally as card scrolls
    // Range is -10% to 10% to create a subtle depth effect
    const x = useTransform(scrollXProgress, [0, 1], ['-10%', '10%'])

    return (
        <motion.div
            ref={cardRef}
            className='group relative h-[600px] min-w-[85vw] cursor-pointer snap-center overflow-hidden md:min-w-[450px]'
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            viewport={{
                root: containerRef,
                once: true,
                margin: '0px -10% 0px 0px',
            }}
        >
            {/* Image Wrapper with Parallax & Zoom Effect */}
            <div className='absolute inset-0 h-full w-full overflow-hidden bg-stone-800'>
                <motion.div
                    style={{ x, scale: 1.25 }}
                    whileHover={{ scale: 1.35 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className='relative h-full w-full'
                >
                    <Image
                        src={proc.img}
                        alt={proc.title}
                        fill
                        className='object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40'
                        sizes='(max-width: 768px) 85vw, 450px'
                    />
                </motion.div>
            </div>

            {/* Gradient */}
            <div className='absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent opacity-90' />

            {/* Content */}
            <div className='absolute right-0 bottom-0 left-0 translate-y-4 transform p-8 transition-transform duration-500 group-hover:translate-y-0 md:p-12'>
                <span className='border-gold-500/30 text-gold-400 mb-4 inline-block border px-3 py-1 text-xs tracking-widest uppercase backdrop-blur-sm'>
                    {proc.stat}
                </span>
                <h3 className='mb-3 font-serif text-4xl text-white'>
                    {proc.title}
                </h3>
                <p className='mb-8 max-w-xs translate-y-4 transform text-lg text-stone-300 opacity-0 transition-opacity delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100'>
                    {proc.desc}
                </p>

                <div className='group-hover:bg-gold-500 group-hover:border-gold-500 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:text-stone-900'>
                    <ArrowRight className='h-5 w-5' />
                </div>
            </div>
        </motion.div>
    )
}
