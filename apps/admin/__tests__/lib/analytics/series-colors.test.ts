import { describe, it, expect } from 'vitest'
import {
    resolveSeriesColor,
    SERIES_PALETTE,
    SPECIAL_COLORS,
} from '@/lib/analytics/series-colors'

describe('resolveSeriesColor', () => {
    it('always maps direct to the stone recessive color', () => {
        expect(resolveSeriesColor('direct').color).toBe(SPECIAL_COLORS.direct)
    })

    it('maps referral/* to a palette color with reduced opacity', () => {
        const result = resolveSeriesColor('referral/nytimes.com')
        expect(result.opacity).toBeLessThan(1)
        expect(SERIES_PALETTE).toContain(result.color)
    })

    it('returns a stable color for the same key across calls', () => {
        expect(resolveSeriesColor('google').color).toBe(
            resolveSeriesColor('google').color
        )
    })

    it('different keys may produce different colors', () => {
        const colors = new Set(
            ['google', 'facebook', 'instagram', 'tiktok', 'bing'].map(
                (k) => resolveSeriesColor(k).color
            )
        )
        expect(colors.size).toBeGreaterThan(1)
    })

    it('always picks a color from the palette for regular keys', () => {
        const result = resolveSeriesColor('newsletter')
        expect(SERIES_PALETTE).toContain(result.color)
    })
})
