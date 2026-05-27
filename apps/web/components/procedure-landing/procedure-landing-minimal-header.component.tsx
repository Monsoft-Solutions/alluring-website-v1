/**
 * ProcedureLandingMinimalHeader
 *
 * Stripped-down header for procedure landing pages. Logo (intentionally
 * unlinked — visitors stay on the LP) + a single Book CTA that anchors
 * to the hero form. Sticky so the action is always one tap away.
 */
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'

export type ProcedureLandingMinimalHeaderProps = {
    readonly formAnchor?: string
}

export function ProcedureLandingMinimalHeader({
    formAnchor = '#hero-form',
}: ProcedureLandingMinimalHeaderProps) {
    return (
        <header className='sticky top-0 z-40 w-full border-b border-stone-200/60 bg-white/85 backdrop-blur-xl'>
            <div className='mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] md:px-8'>
                <div className='flex items-center'>
                    <Image
                        src='/logo.png'
                        alt='Alluring Plastic Surgery'
                        width={140}
                        height={40}
                        priority
                        className='h-9 w-auto md:h-10'
                    />
                </div>

                <Button
                    asChild
                    size='sm'
                    className='bg-gold-500 hover:bg-gold-600 px-4 text-xs font-bold tracking-wide text-white uppercase shadow-md shadow-amber-500/20 transition-shadow hover:shadow-lg hover:shadow-amber-500/30 sm:px-6 sm:text-sm'
                >
                    <a href={formAnchor}>
                        <span className='hidden sm:inline'>
                            Get My Free Quote
                        </span>
                        <span className='sm:hidden'>Free Quote</span>
                    </a>
                </Button>
            </div>
        </header>
    )
}
