import { describe, expect, it } from 'vitest'

import {
    answeredCount,
    answerStep,
    EMPTY_THREAD,
    FLOW_LAST_STEP,
    nextOpenStep,
    restoreThread,
} from '@/components/shared/consult-chat/consult-flow.logic'

const copy = {
    procedures: [
        { value: 'bbl', label: 'BBL' },
        { value: 'tummy-tuck', label: 'Tummy tuck' },
    ],
    timelines: [{ value: 'asap', label: 'As soon as possible' }],
}

describe('nextOpenStep', () => {
    it('moves to the next unanswered step', () => {
        expect(nextOpenStep(0, { procedure: 'bbl', timeline: '' })).toBe(1)
        expect(nextOpenStep(-1, { procedure: '', timeline: '' })).toBe(0)
    })

    it('skips a step already answered, straight to the last', () => {
        expect(nextOpenStep(0, { procedure: 'bbl', timeline: 'asap' })).toBe(
            FLOW_LAST_STEP
        )
    })
})

describe('answerStep', () => {
    it('answers the procedure and asks for the timeline', () => {
        const next = answerStep(EMPTY_THREAD, 0, { procedure: 'bbl' })
        expect(next.step).toBe(1)
        expect(next.answers).toEqual({ procedure: 'bbl', timeline: '' })
    })

    it('after Change, a new procedure keeps the timeline and returns to the last step', () => {
        const done = {
            ...EMPTY_THREAD,
            step: FLOW_LAST_STEP,
            answers: { procedure: 'bbl', timeline: 'asap' },
            name: 'Maria',
        }
        const changed = { ...done, step: 0 as const }
        const next = answerStep(changed, 0, { procedure: 'tummy-tuck' })
        expect(next.step).toBe(FLOW_LAST_STEP)
        expect(next.answers).toEqual({
            procedure: 'tummy-tuck',
            timeline: 'asap',
        })
        expect(next.name).toBe('Maria')
    })
})

describe('restoreThread', () => {
    it('restores saved answers and opens on the first missing step', () => {
        expect(
            restoreThread(
                { procedure: 'bbl', timeline: '', name: '', financing: false },
                copy
            )
        ).toEqual({
            step: 1,
            answers: { procedure: 'bbl', timeline: '' },
            name: '',
            financing: false,
        })
    })

    it('drops answers the options no longer offer', () => {
        expect(
            restoreThread(
                { procedure: 'facelift', timeline: 'asap', name: '' },
                copy
            )?.answers
        ).toEqual({ procedure: '', timeline: 'asap' })
    })

    it('returns null for an empty save', () => {
        expect(
            restoreThread({ procedure: '', timeline: '', name: '' }, copy)
        ).toBeNull()
        expect(restoreThread(null, copy)).toBeNull()
    })
})

describe('answeredCount', () => {
    it('counts the tap steps answered', () => {
        expect(answeredCount({ procedure: '', timeline: '' })).toBe(0)
        expect(answeredCount({ procedure: 'bbl', timeline: 'asap' })).toBe(2)
    })
})
