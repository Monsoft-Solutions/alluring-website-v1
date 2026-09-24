import { describe, expect, it } from 'vitest'

import {
    createFlickDetector,
    isTextEntry,
} from '@/components/lead-popups/lead-popup.triggers'

const SCREEN = 800
const MIN_DISTANCE = SCREEN * 0.3

describe('createFlickDetector', () => {
    it('reports a quick flick back up', () => {
        const flicked = createFlickDetector(400)
        expect(flicked(2000, 0, MIN_DISTANCE)).toBe(false)
        expect(flicked(1900, 100, MIN_DISTANCE)).toBe(false)
        expect(flicked(1700, 250, MIN_DISTANCE)).toBe(true)
    })

    it('ignores the same distance covered slowly', () => {
        const flicked = createFlickDetector(400)
        let fired = false
        // 300 px up over 1.5 s: a reader going back a paragraph.
        for (let t = 0; t <= 1500; t += 100) {
            fired ||= flicked(2000 - t / 5, t, MIN_DISTANCE)
        }
        expect(fired).toBe(false)
    })

    it('never reports scrolling down', () => {
        const flicked = createFlickDetector(400)
        let fired = false
        for (let t = 0; t <= 400; t += 16) {
            fired ||= flicked(t * 5, t, MIN_DISTANCE)
        }
        expect(fired).toBe(false)
    })

    it('measures from the highest point inside the window only', () => {
        const flicked = createFlickDetector(400)
        flicked(3000, 0, MIN_DISTANCE)
        // Long after the peak, a small move up must not count against it.
        expect(flicked(2900, 1000, MIN_DISTANCE)).toBe(false)
        expect(flicked(2850, 1100, MIN_DISTANCE)).toBe(false)
    })
})

describe('isTextEntry', () => {
    const element = (tagName: string, extra: Record<string, unknown> = {}) =>
        ({ tagName, isContentEditable: false, ...extra }) as unknown as Element

    it('treats text fields as typing', () => {
        expect(isTextEntry(element('INPUT', { type: 'tel' }))).toBe(true)
        expect(isTextEntry(element('INPUT', { type: 'text' }))).toBe(true)
        expect(isTextEntry(element('TEXTAREA'))).toBe(true)
        expect(isTextEntry(element('DIV', { isContentEditable: true }))).toBe(
            true
        )
    })

    it('does not treat buttons, boxes or the page as typing', () => {
        expect(isTextEntry(element('INPUT', { type: 'checkbox' }))).toBe(false)
        expect(isTextEntry(element('BUTTON'))).toBe(false)
        expect(isTextEntry(element('BODY'))).toBe(false)
        expect(isTextEntry(null)).toBe(false)
    })
})
