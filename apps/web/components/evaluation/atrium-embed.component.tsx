/**
 * Atrium Embed Component
 *
 * Embeds the Loquent "Atrium" patient intake & evaluation experience via a
 * responsive iframe. Server-rendered — the iframe itself is static markup, so
 * no client boundary is required.
 *
 * The iframe is framed in a glassmorphism card consistent with the site's
 * luxury visual identity.
 *
 * @module components/evaluation/atrium-embed
 */

/** Loquent Atrium identifier for the Alluring Patient Intake & Evaluation flow. */
const ATRIUM_SRC =
    'https://app.loquent.io/atrium/atr_162a30df9c69407f9b3ce24a81249d69'

type AtriumEmbedProps = {
    /** Optional id for anchor links / skip targets. */
    readonly id?: string
    /** Accessible title for the embedded evaluation. */
    readonly title?: string
}

/**
 * Renders the Loquent Atrium evaluation inside a premium framed container.
 */
export function AtriumEmbed({
    id,
    title = 'Alluring Patient Intake & Evaluation',
}: AtriumEmbedProps) {
    return (
        <div id={id} className='relative mx-auto w-full max-w-4xl scroll-mt-32'>
            {/* Soft gold glow behind the card for depth */}
            <div
                aria-hidden='true'
                className='from-gold-200/40 pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br to-transparent blur-2xl'
            />

            {/* Glassmorphism frame */}
            <div className='rounded-3xl border border-stone-200/60 bg-white/80 p-2 shadow-2xl shadow-stone-900/10 backdrop-blur-xl sm:p-3'>
                <iframe
                    src={ATRIUM_SRC}
                    title={title}
                    loading='lazy'
                    allow='clipboard-write'
                    referrerPolicy='strict-origin-when-cross-origin'
                    className='h-[640px] w-full rounded-2xl border-0 bg-white'
                />
            </div>
        </div>
    )
}
