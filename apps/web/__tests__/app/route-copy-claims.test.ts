/**
 * The route files under `app/` (metadata, JSON-LD, llms routes, page copy)
 * carry none of the claims the canon retired (docs/claims/canon.md, #354).
 *
 * A source scan, not a render: it reads every `.ts`/`.tsx` file under `app/`
 * and fails on retired wording, so a page can't reintroduce "board-certified
 * surgeons" or a weekly payment in its metadata without a test noticing.
 * Copy that lives in components and data files has its own checks.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const APP_DIR = path.resolve(__dirname, '../../app')

function routeFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name)
        if (statSync(full).isDirectory()) return routeFiles(full)
        return /\.tsx?$/.test(name) ? [full] : []
    })
}

/** Source without comments, so a note about a retired claim isn't a hit. */
function withoutComments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

const RETIRED: Array<[label: string, pattern: RegExp]> = [
    [
        'plural or bare board certification',
        /board[\s-]*certified (?:miami )?(?:plastic )?surgeons/i,
    ],
    ['a board count', /(?:double|dual|triple)[\s-]*board/i],
    ['ABPS', /american board of plastic surgery|\babps\b/i],
    [
        '"board-certified" in a title',
        /title:\s*['"`][^'"`]*board[\s-]*certified/i,
    ],
    ['a plastic surgeon label', /certified plastic surgeon/i],
    ['patient volume', /5,000\s*\+|\?\?\s*'5,000\+'/],
    ['tenure', /15\s*\+\s*(?:years|años)|\?\?\s*'15\+'/i],
    [
        'facility accreditation',
        /\ba{2,4}sf\b|accredited (?:facility|surgical)/i,
    ],
    ['a payment figure', /\$\s?\d[\d,]*\s*\/\s*(?:week|wk|mo|month|semana)\b/i],
    ['APR or approval speed', /0% apr|instant approval|approved in minutes/i],
    [
        'a superlative about the practice',
        /miami['’]s top|world[\s-]class|clase mundial|premier plastic/i,
    ],
    [
        'a retired brand line',
        /luxury care|affordable luxury|luxury made affordable/i,
    ],
    ['a promised response time', /within 24 hours|within a few minutes/i],
    [
        'a specialty she is not certified in',
        /medicalSpecialty=\{\['PlasticSurgery'\]\}/,
    ],
    ['an unverified team claim', /100% biling[uü]e|cirujanos certificados/i],
    ['the wrong office location', /coral gables (?:office|location)/i],
]

describe('app route copy follows the claims canon', () => {
    const files = routeFiles(APP_DIR)

    it('finds the route files', () => {
        expect(files.length).toBeGreaterThan(50)
    })

    it.each(RETIRED)('has no %s', (_label, pattern) => {
        const hits = files
            .filter((file) =>
                pattern.test(withoutComments(readFileSync(file, 'utf8')))
            )
            .map((file) => path.relative(APP_DIR, file))
        expect(hits).toEqual([])
    })

    it('lists only US areas in areaServed', () => {
        const hits = files.filter((file) =>
            /areaServed=\{\[(?!\.\.\.AREA_SERVED)/.test(
                readFileSync(file, 'utf8')
            )
        )
        expect(hits.map((file) => path.relative(APP_DIR, file))).toEqual([])
    })
})
