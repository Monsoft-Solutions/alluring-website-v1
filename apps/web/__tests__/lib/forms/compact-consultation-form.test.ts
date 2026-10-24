/**
 * The short-form last-name bug (#350): from 2026-05-06 the compact
 * ConsultationForm seeded `lastName: ''`, which failed
 * `lastNameSchema.optional()` with no field on screen to say so, and no
 * compact form could send a lead. These tests send what every compact entry
 * point sends, through the client schema, the request builder and the
 * server's validation.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildConsultationRequest } from '@/components/shared/forms/consultation-request'
import { SUBMIT_CONSENT } from '@/lib/constants/lead-consent'
import {
    CONTACT_SOURCES,
    consultationFormCompactSchema,
    consultationFormSchema,
    contactFormSchema,
} from '@/lib/types/forms/contact-form.type'
import { validateBySource } from '@/lib/utils/validate-contact-by-source.util'

const ROOT = path.resolve(__dirname, '../../..')

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name)
        if (statSync(full).isDirectory()) return sourceFiles(full)
        return full.endsWith('.tsx') ? [full] : []
    })
}

/** Every `<ConsultationForm … compact …>` in the app, with its source. */
const COMPACT_ENTRY_POINTS = ['components', 'app'].flatMap((dir) =>
    sourceFiles(path.join(ROOT, dir)).flatMap((file) => {
        const text = readFileSync(file, 'utf8')
        return [...text.matchAll(/<ConsultationForm\b([\s\S]*?)\/>/g)]
            .map((match) => match[1] ?? '')
            .filter((props) => /^\s*compact\s*$/m.test(props))
            .map((props) => {
                const key = /source=\{CONTACT_SOURCES\.([A-Z_]+)\}/.exec(
                    props
                )?.[1] as keyof typeof CONTACT_SOURCES | undefined
                return {
                    file: path.relative(ROOT, file),
                    source: key ? CONTACT_SOURCES[key] : undefined,
                }
            })
    })
)

/** What the compact form holds when a visitor fills it in. */
const COMPACT_INPUT = {
    firstName: 'Adriano',
    // `compact ? undefined : ''` — the compact form never sets one.
    lastName: undefined,
    email: '',
    phone: '(305) 797-4357',
    procedure: 'bbl',
    preferredContactTime: '' as const,
    _website: '',
}

describe('compact ConsultationForm entry points (#350)', () => {
    it('finds the known compact forms', () => {
        const files = COMPACT_ENTRY_POINTS.map((entry) => entry.file)
        for (const known of [
            'module-quick-quote.component.tsx',
            'procedure-landing-hero.component.tsx',
            'dr-karlinsky-hero.component.tsx',
            'inline-cta-band.component.tsx',
            'hero-consultation-form.component.tsx',
            'atelier-hero-form.component.tsx',
        ]) {
            expect(files.some((file) => file.endsWith(known))).toBe(true)
        }
    })

    it.each(COMPACT_ENTRY_POINTS.map((entry) => [entry.file, entry]))(
        '%s sends a lead the server accepts',
        (_, entry) => {
            expect(entry.source).toBeDefined()
            const client =
                consultationFormCompactSchema.safeParse(COMPACT_INPUT)
            expect(client.success).toBe(true)

            const request = buildConsultationRequest(COMPACT_INPUT)
            expect(request.name).toBe('Adriano')
            expect(request.lastName).toBeUndefined()
            expect(request).toMatchObject(SUBMIT_CONSENT)

            const server = contactFormSchema.parse({
                ...JSON.parse(JSON.stringify(request)),
                source: entry.source,
            })
            expect(server.lastName).toBeUndefined()
            expect(server.phone).toBe('+13057974357')
            expect(server.consentGiven).toBe(true)
            expect(server.consentMethod).toBe('tap')
            expect(validateBySource(server)).toEqual({ valid: true })
        }
    )

    it('still accepts the blank last name older pages send', () => {
        expect(
            consultationFormCompactSchema.safeParse({
                ...COMPACT_INPUT,
                lastName: '',
            }).success
        ).toBe(true)
        const server = contactFormSchema.parse({
            name: 'Adriano',
            firstName: 'Adriano',
            lastName: '  ',
            phone: '3057974357',
            source: CONTACT_SOURCES.PROCEDURE_PAGE,
        })
        expect(server.lastName).toBeUndefined()
    })

    it('still rejects an empty first name or phone', () => {
        expect(
            consultationFormCompactSchema.safeParse({
                ...COMPACT_INPUT,
                firstName: '',
            }).success
        ).toBe(false)
        expect(
            consultationFormCompactSchema.safeParse({
                ...COMPACT_INPUT,
                phone: '',
            }).success
        ).toBe(false)
        expect(
            contactFormSchema.safeParse({
                name: 'Adriano',
                firstName: '',
                phone: '3057974357',
            }).success
        ).toBe(false)
        for (const source of [
            CONTACT_SOURCES.LEAD_FORM,
            CONTACT_SOURCES.DR_KARLINSKY_IG,
            CONTACT_SOURCES.PROCEDURE_PAGE,
        ]) {
            const server = contactFormSchema.parse({
                name: 'Adriano',
                firstName: 'Adriano',
                source,
            })
            expect(validateBySource(server).valid).toBe(false)
        }
    })

    it('keeps the full form’s last name required and joined without spaces to spare', () => {
        const full = {
            ...COMPACT_INPUT,
            lastName: ' Test ',
            email: 'adriano@example.com',
        }
        expect(
            consultationFormSchema.safeParse({ ...full, lastName: '' }).success
        ).toBe(false)
        expect(consultationFormSchema.safeParse(full).success).toBe(true)
        expect(buildConsultationRequest(full).name).toBe('Adriano Test')
    })

    it('no longer asks either form for a consent box', () => {
        expect(consultationFormSchema.shape).not.toHaveProperty('consentGiven')
        expect(consultationFormCompactSchema.shape).not.toHaveProperty(
            'consentGiven'
        )
    })
})
