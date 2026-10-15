/**
 * Every CTA on the page leads to the one form in the hero: it scrolls there
 * and puts the visitor on its first field, so the next tap is an answer.
 * The page never renders a second form instance.
 */

import { prefersReducedMotion } from '@/components/shared/consult-chat/consult-chat.util'

import { DRK_FORM_ID } from './drk-config'

export function focusDrkForm(): void {
    const form = document.getElementById(DRK_FORM_ID)
    if (!form) return
    form.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
    // Focus only, without a second scroll fighting the first. The `pick`
    // arm's tiles, while none is chosen: the group itself, so a screen
    // reader hears the question and no single tile wears the focus ring
    // like a preselection (the other fields are still folded).
    const tiles = [
        ...form.querySelectorAll<HTMLInputElement>('input[type=radio]'),
    ]
    if (tiles.length && !tiles.some((tile) => tile.checked)) {
        const group = tiles[0]?.closest('fieldset')
        group?.focus({ preventScroll: true })
        return
    }
    // Else the first field still empty: the procedure, else the name, else
    // the number.
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        'select, input:not([type=checkbox]):not([type=radio]):not([tabindex="-1"])'
    )
    const target =
        [...fields].find((field) => !field.value) ?? fields[0] ?? null
    target?.focus({ preventScroll: true })
}
