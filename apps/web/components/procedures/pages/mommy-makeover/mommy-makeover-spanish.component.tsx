import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleContainer,
    moduleLink,
} from '@/components/procedures/module-kit/module-ui.constant'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * A short, real answer for Spanish speakers in the United States who search
 * "mommy makeover en Miami" or "cuánto cuesta". The rest of the page stays in
 * English, and `/consulta-gratis` is the Spanish path into a consultation.
 *
 * A `section` written out here rather than `AnswerBlock`, because `lang` has to
 * sit on the element the anchor points at. It keeps `answer-block` and
 * `answer-block__answer`, so the copy sweep and `speakable` read it the same way.
 */
export function MommyMakeoverSpanish() {
    return (
        <div className='pm-defer bg-stone-50'>
            <section
                id='en-espanol'
                lang='es'
                aria-labelledby='en-espanol-heading'
                className={cn(
                    moduleContainer,
                    'answer-block scroll-mt-32 py-12 md:py-20 lg:scroll-mt-40'
                )}
            >
                <h2
                    id='en-espanol-heading'
                    className='font-serif text-[1.75rem] leading-[1.2] font-medium text-balance text-stone-900 md:text-[2.375rem] md:leading-[1.15]'
                >
                    ¿Cuánto cuesta un mommy makeover en Miami?
                </h2>
                <p className='answer-block__answer mt-4 max-w-[41.25rem] text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:mt-5 md:text-lg md:leading-[1.65]'>
                    En Alluring, el precio de un mommy makeover depende de los
                    procedimientos de su plan: una abdominoplastia mini desde{' '}
                    {mommyMakeoverFigure('price-mini-tummy-tuck')} o completa
                    desde {mommyMakeoverFigure('price-full-tummy-tuck')}, un
                    aumento de senos desde{' '}
                    {mommyMakeoverFigure('price-augmentation-saline')} y un
                    levantamiento de senos desde{' '}
                    {mommyMakeoverFigure('price-lift')}. Combinar dos
                    procedimientos resta{' '}
                    {mommyMakeoverFigure('price-combination-discount')} del
                    total, y tres restan{' '}
                    {mommyMakeoverFigure('price-combination-discount', 1)}. Su
                    cirujana confirma su precio en la consulta.
                </p>
                <p className={cn(moduleBody, 'mt-4')}>
                    Una sola cirujana realiza cada mommy makeover en Alluring:{' '}
                    {KARLINSKY_NAME}. Hay financiamiento disponible, sujeto a
                    aprobación de crédito.
                </p>
                <p className='mt-5'>
                    <Link
                        href='/consulta-gratis'
                        className={cn(moduleLink, 'text-base font-bold')}
                    >
                        Solicite su consulta en español
                    </Link>
                </p>
            </section>
        </div>
    )
}
