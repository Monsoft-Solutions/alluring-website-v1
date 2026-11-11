'use client'

/**
 * Before/after results, right under the hero: results are what a paid
 * visitor checks first, and the old page made her scroll past the surgeon
 * section to reach four of them.
 *
 * Since v6 (#292) the heading names the ad's procedure ("Tummy tuck
 * results"), one line says whose results they are, and there is no button:
 * the phone's sticky bar asks the form's question under it.
 *
 * A swipeable rail rather than a link to the gallery. Each view has a fixed
 * list of photographs in the page (`LP_OPEN_PHOTOS`), its own procedure
 * first. Under them, a card offers the rest of the view's before-and-afters,
 * which load only after a tap (`lp-photo-gate.component.tsx`). A view with no
 * photographs in the page shows only the card. Photographs are shown whole
 * on a dark mat: a before-and-after pair cropped to fill a frame loses half
 * of its point.
 */

import type { LpDictionary, LpLang, RichText } from './lp-copy'
import { LpBaFigure } from './lp-ba-figure.component'
import { LpPhotoGate, type LpPhotoGateEvent } from './lp-photo-gate.component'
import { Rich } from './lp-primitives.component'
import type { LpPhoto } from './lp-proof'

interface LpResultsProps {
    readonly lang: LpLang
    readonly copy: LpDictionary['results']
    readonly photos: readonly LpPhoto[]
    /** The ad view, for the photos behind the card. */
    readonly view: string
    /** True when the view shows the tap-to-view card. */
    readonly photoGate: boolean
    readonly onGateEvent: (event: LpPhotoGateEvent) => void
    /** The ad's procedure as the form labels it, or null for a general ad. */
    readonly procedureLabel: string | null
}

/** "Aumento de senos" → "aumento de senos" mid-sentence; "BBL" stays. */
function midSentence(label: string): string {
    return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(label)
        ? label.charAt(0).toLowerCase() + label.slice(1)
        : label
}

export function LpResults({
    lang,
    copy,
    photos,
    view,
    photoGate,
    onGateEvent,
    procedureLabel,
}: LpResultsProps) {
    const heading: RichText = procedureLabel
        ? copy.headingProcedure.map((part, index) => {
              const fillIn = (text: string) =>
                  text.replace(
                      '{procedure}',
                      index === 0 && text.startsWith('{procedure}')
                          ? procedureLabel
                          : midSentence(procedureLabel)
                  )
              if (typeof part === 'string') return fillIn(part)
              return 'em' in part ? { em: fillIn(part.em) } : part
          })
        : copy.heading

    return (
        <section className='band results' id='results'>
            <div className='wrap'>
                <div className='sec-head reveal'>
                    <p className='eyebrow'>{copy.eyebrow}</p>
                    <h2 className='h2'>
                        <Rich parts={heading} />
                    </h2>
                    <p>{copy.subtitle}</p>
                </div>
            </div>

            {photos.length > 0 && (
                <>
                    <ul className='rail ba-rail' aria-label={copy.railLabel}>
                        {photos.map((photo, index) => (
                            <li key={photo.id}>
                                <LpBaFigure
                                    photo={photo}
                                    copy={copy}
                                    eager={index < 2}
                                />
                            </li>
                        ))}
                    </ul>

                    {photos.length > 1 && (
                        <div className='wrap'>
                            <p className='rail-hint' aria-hidden='true'>
                                {copy.swipeHint} <span>→</span>
                            </p>
                        </div>
                    )}
                </>
            )}

            {photoGate && (
                <LpPhotoGate
                    view={view}
                    lang={lang}
                    copy={copy}
                    solo={photos.length === 0}
                    onEvent={onGateEvent}
                />
            )}
        </section>
    )
}
