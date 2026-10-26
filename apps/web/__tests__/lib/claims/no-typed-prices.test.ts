/**
 * No Alluring price is typed in the web app's copy (claims canon, Decisions
 * of 2026-10-25, #354). Data files write a price as a claim token
 * (`[[price:bbl]]`), which `resolveProcedureClaims` / `resolveClaimsIn`
 * resolve from the admin's price list when the page renders, and no copy
 * quotes a weekly or monthly payment (D6).
 *
 * The facts files are the exception: they carry the ASPS national averages
 * (not Alluring prices, typed with their attribution) and the sheet figures
 * the copy sweep checks built pages against, and they are never rendered as
 * copy. Comments are skipped: they record what the copy used to say.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { procedures } from '@/lib/data/procedures.data'
import { resolveClaimTokensIn } from '@workspace/shared/claims/tokens'
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'

const ROOT = path.resolve(__dirname, '../../..')

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name)
        if (statSync(full).isDirectory()) return sourceFiles(full)
        return /\.tsx?$/.test(name) ? [full] : []
    })
}

/** The file without its comments, so a note about an old price is fine. */
function code(file: string): string {
    return readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

function hits(files: string[], pattern: RegExp): string[] {
    return files.flatMap((file) =>
        [...code(file).matchAll(pattern)].map(
            (match) => `${path.relative(ROOT, file)}: ${match[0].trim()}`
        )
    )
}

describe('no typed Alluring prices in lib/data (#354)', () => {
    const files = sourceFiles(path.join(ROOT, 'lib/data')).filter(
        (file) => !file.includes(`${path.sep}facts${path.sep}`)
    )

    it('types no dollar figure outside the facts files', () => {
        expect(hits(files, /\$[1-9][\d,]*/g)).toEqual([])
    })

    it('resolves every claim token in the procedure data', () => {
        const issues: string[] = []
        resolveClaimTokensIn(procedures, {
            mode: 'text',
            pricing: FALLBACK_PRICING,
            onIssue: (issue) => issues.push(`${issue.raw}: ${issue.reason}`),
        })
        expect(issues).toEqual([])
    })
})

describe('no weekly or monthly payment figure in copy (D6)', () => {
    const files = ['app', 'components', 'lib'].flatMap((dir) =>
        sourceFiles(path.join(ROOT, dir))
    )

    it('quotes no payment per week or month', () => {
        expect(
            hits(
                files,
                /\$\s?\d[\d,]*(?:\.\d+)?\s*(?:\/\s*|a\s+|per\s+|al?\s+|por\s+)(?:week|wk|month|mo|semana|mes)\b/gi
            )
        ).toEqual([])
    })

    it('makes no APR or "as low as" claim', () => {
        expect(
            hits(
                files,
                /\b0\s*%\s*(?:APR|interest|de inter[eé]s)|\bas low as \$|buy now,? pay later/gi
            )
        ).toEqual([])
    })
})
