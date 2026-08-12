/**
 * Tests for the MDX component contract.
 *
 * The contract is the only thing keeping three consumers in agreement: the
 * renderer's component map, the writer prompt's vocabulary, and the validator's
 * allow-list. Most of the drift protection is structural — the renderer map is
 * typed as a total record over `MDX_RENDERER_COMPONENTS`, and the CTA content
 * file carries a compile-time coverage assertion — so what is left to test here
 * is the contract's own internal consistency and the prompt text it generates.
 */
import { describe, expect, it } from 'vitest'

import {
    BLOG_CTA_IDS,
    DEFAULT_BLOG_CTA_ID,
    MDX_COMPONENT_SPECS,
    MDX_RENDERER_COMPONENTS,
    MDX_WRITER_COMPONENTS,
    buildCtaMarker,
    buildMdxComponentReference,
    isBlogCtaId,
    isRenderableComponent,
    isWriterComponent,
} from '@workspace/shared/content'

describe('MDX contract', () => {
    it('specs every renderable component', () => {
        for (const name of MDX_RENDERER_COMPONENTS) {
            expect(MDX_COMPONENT_SPECS[name]).toBeDefined()
            expect(MDX_COMPONENT_SPECS[name].name).toBe(name)
        }
    })

    it('keeps the writer set a subset of what the renderer can resolve', () => {
        for (const name of MDX_WRITER_COMPONENTS) {
            expect(isRenderableComponent(name)).toBe(true)
        }
    })

    it('agrees with each spec about who may emit it', () => {
        for (const name of MDX_RENDERER_COMPONENTS) {
            expect(MDX_COMPONENT_SPECS[name].writerMayEmit).toBe(
                isWriterComponent(name)
            )
        }
    })

    it('explains every component the writer may not emit', () => {
        const forbidden = MDX_RENDERER_COMPONENTS.filter(
            (name) => !MDX_COMPONENT_SPECS[name].writerMayEmit
        )

        expect(forbidden.length).toBeGreaterThan(0)
        for (const name of forbidden) {
            expect(MDX_COMPONENT_SPECS[name].writerNote).toBeTruthy()
        }
    })

    it('keeps QuickAnswer renderer-owned', () => {
        // The Quick Answer comes from blog_post.quick_answer and is placed above
        // the body. A writer-emitted one would render a second, competing block.
        expect(isRenderableComponent('QuickAnswer')).toBe(true)
        expect(isWriterComponent('QuickAnswer')).toBe(false)
    })

    describe('writer reference text', () => {
        const reference = buildMdxComponentReference()

        it('documents every writer component with its example', () => {
            for (const name of MDX_WRITER_COMPONENTS) {
                expect(reference).toContain(`<${name}>`)
                expect(reference).toContain(MDX_COMPONENT_SPECS[name].example)
            }
        })

        it('names the components the writer must not use', () => {
            expect(reference).toContain('Do not write these')
            expect(reference).toContain('<QuickAnswer>')
        })

        it('never shows a QuickAnswer example the writer could copy', () => {
            expect(reference).not.toContain(
                MDX_COMPONENT_SPECS.QuickAnswer.example
            )
        })
    })

    describe('CTA ids', () => {
        it('treats the default as a real id', () => {
            expect(isBlogCtaId(DEFAULT_BLOG_CTA_ID)).toBe(true)
        })

        it('rejects ids the renderer cannot resolve', () => {
            expect(isBlogCtaId('freeconsult')).toBe(false)
            expect(isBlogCtaId('')).toBe(false)
        })

        it('builds markers the split utility can find', () => {
            // Mirrors findCTAInsertionPoint in apps/web.
            const pattern = /<!--\s*CTA(?::(\w+))?\s*-->/
            for (const id of BLOG_CTA_IDS) {
                const match = buildCtaMarker(id).match(pattern)
                expect(match?.[1]).toBe(id)
            }
        })
    })
})
