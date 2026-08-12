import { describe, expect, it } from 'vitest'

import {
    STUCK_THRESHOLD_MINUTES,
    isStuckProcessing,
    stuckCutoff,
} from '@/lib/utils/stuck-post.util'

const NOW = new Date('2026-08-12T12:00:00.000Z')

function minutesAgo(minutes: number): Date {
    return new Date(NOW.getTime() - minutes * 60_000)
}

describe('stuckCutoff', () => {
    it('is the threshold before now by default', () => {
        expect(stuckCutoff(NOW)).toEqual(minutesAgo(STUCK_THRESHOLD_MINUTES))
    })

    it('honors a custom threshold', () => {
        expect(stuckCutoff(NOW, 30)).toEqual(minutesAgo(30))
    })
})

describe('isStuckProcessing', () => {
    it('ignores posts that are not processing', () => {
        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'idle',
                    processingStartedAt: minutesAgo(60),
                },
                NOW
            )
        ).toBe(false)

        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'error',
                    processingStartedAt: minutesAgo(60),
                },
                NOW
            )
        ).toBe(false)
    })

    it('leaves a live phase alone', () => {
        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'processing',
                    processingStartedAt: minutesAgo(5),
                },
                NOW
            )
        ).toBe(false)
    })

    it('flags a phase running past the threshold', () => {
        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'processing',
                    processingStartedAt: minutesAgo(
                        STUCK_THRESHOLD_MINUTES + 1
                    ),
                },
                NOW
            )
        ).toBe(true)
    })

    it('does not flag a phase exactly at the threshold', () => {
        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'processing',
                    processingStartedAt: minutesAgo(STUCK_THRESHOLD_MINUTES),
                },
                NOW
            )
        ).toBe(false)
    })

    it('treats a processing row without a start timestamp as stuck', () => {
        expect(
            isStuckProcessing(
                {
                    pipelineProcessingStatus: 'processing',
                    processingStartedAt: null,
                },
                NOW
            )
        ).toBe(true)
    })

    it('honors a custom threshold', () => {
        const post = {
            pipelineProcessingStatus: 'processing',
            processingStartedAt: minutesAgo(20),
        }
        expect(isStuckProcessing(post, NOW, 30)).toBe(false)
        expect(isStuckProcessing(post, NOW, 15)).toBe(true)
    })
})
