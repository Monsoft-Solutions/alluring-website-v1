/**
 * Atelier Close
 *
 * Second capture point, framed as low-stakes. "Ask us one question" rather
 * than "Book your transformation" — a visitor who reached the bottom
 * without filling in the hero form is hesitating, and raising the size of
 * the ask is the wrong response to hesitation.
 */
import { AtelierCloseForm } from '@/components/home-variants/atelier/atelier-close-form.component'

export function AtelierClose() {
    return (
        <section
            className='scroll-mt-24 bg-[#E5B9A6] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-close-heading'
            id='book'
        >
            <div className='mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20'>
                <div>
                    <span className='text-xs tracking-[0.3em] text-[#3D2B23]/60 uppercase'>
                        No pressure
                    </span>
                    <h2
                        id='atelier-close-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                    >
                        Ask us one question.
                        <span className='block text-[#C4674D] italic'>
                            See how it feels.
                        </span>
                    </h2>
                    <p className='mt-7 max-w-md text-lg leading-[1.75] text-[#3D2B23]/75'>
                        You do not have to be ready. Most people who contact us
                        are still deciding, and plenty never book anything —
                        that is a normal outcome, not a wasted call.
                    </p>
                </div>

                <AtelierCloseForm />
            </div>
        </section>
    )
}
