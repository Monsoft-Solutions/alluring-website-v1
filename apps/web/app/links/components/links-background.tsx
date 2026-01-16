/**
 * LinksBackground Component
 *
 * Fixed dark gradient background with ambient gold glow orbs
 * Creates an immersive, luxurious atmosphere for the links page
 */
export function LinksBackground() {
    return (
        <div className='fixed inset-0 -z-10'>
            {/* Base gradient */}
            <div className='absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900' />

            {/* Gold ambient glow orbs */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-[10%] left-[20%] h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-[120px]' />
            <div className='bg-gold-400/8 pointer-events-none absolute top-[60%] right-[10%] h-[250px] w-[250px] rounded-full blur-[100px]' />
            <div className='bg-gold-500/5 pointer-events-none absolute bottom-[5%] left-[40%] h-[200px] w-[200px] rounded-full blur-[80px]' />

            {/* Subtle overlay for depth */}
            <div className='absolute inset-0 bg-stone-900/20' />
        </div>
    )
}
