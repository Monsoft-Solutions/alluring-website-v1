/**
 * What `check-procedure-copy.ts` needs to know about each procedure page
 * module: where its facts live and the rules that are its own.
 *
 * The site-wide rules (credentials, practice claims awaiting the owner, US
 * only and no travel coordination, superlatives, keyword bolding, FAQ and
 * answer structure) live in the sweep and apply to every page. A page adds
 * an entry here when its module is registered, in the same PR.
 *
 * @module
 */

import { bblFacts, bblSources } from '../lib/data/procedures/facts/bbl.facts'
import { lipoFacts, lipoSources } from '../lib/data/procedures/facts/lipo.facts'
import type {
    ProcedureFact,
    ProcedureSource,
} from '../lib/data/procedures/facts/procedure-facts'

export interface WordingRule {
    rule: string
    /** Tested against lowercased copy, with neutral names removed. */
    re: RegExp
    why: string
}

export interface ProcedureCopyConfig {
    slug: string
    /** How the report names the page, e.g. "BBL". */
    name: string
    /** The class on the module's root element; the sweep reads inside it. */
    rootClass: string
    /** The facts file's name, for messages. */
    factsFile: string
    facts: readonly ProcedureFact[]
    sources: readonly ProcedureSource[]
    /** Calendar years the copy may name beyond its facts' and sources'. */
    extraYears?: readonly number[]
    /**
     * Identifiers that contain digits but are not figures, e.g. a statute
     * number, as `[pattern, replacement]`. Patterns see lowercased copy and
     * need the `g` flag.
     */
    identifiers?: readonly (readonly [RegExp, string])[]
    /**
     * Names and attributions that contain claim words ("plastic surgeon",
     * "board") but are not claims. Lowercase, with the `g` flag.
     */
    neutralNames?: readonly RegExp[]
    /** Rules only this page has. */
    rules?: readonly WordingRule[]
    /** `{{PLACEHOLDER}}` → its expected length in words. */
    placeholders?: Readonly<Record<string, number>>
    /** Visible FAQ count outside this range warns. Default 10–14. */
    faqCount?: readonly [min: number, max: number]
    /** In-page anchors other pages link to. Default `pricing`. */
    requiredAnchors?: readonly string[]
}

const bbl: ProcedureCopyConfig = {
    slug: 'brazilian-butt-lift-bbl-miami',
    name: 'BBL',
    rootClass: 'bbl-page',
    factsFile: 'bbl.facts.ts',
    facts: bblFacts,
    sources: bblSources,
    identifiers: [
        [/§\s*458\.328/g, ' statute '],
        [/\b458\.328\b/g, ' statute '],
    ],
    neutralNames: [
        /by plastic surgeon kamran azad/g,
        /a plastic surgeon gives in asps/g,
    ],
    rules: [
        {
            rule: 'volume-figure',
            re: /\bcc\b|\bml\b|cubic centimet|\bbmi\b/,
            why: 'no fat volume or BMI figure is in the sourced standard (#252)',
        },
    ],
}

const lipo: ProcedureCopyConfig = {
    slug: 'liposuction-miami',
    name: 'Liposuction',
    rootClass: 'lipo-page',
    factsFile: 'lipo.facts.ts',
    facts: lipoFacts,
    sources: lipoSources,
    // The title carries the current year, as the generated procedure titles
    // do (`seoTitle` in liposuction-miami.data.ts).
    extraYears: [new Date().getFullYear()],
    identifiers: [
        [/64b8-9\.009\d?/g, ' rule '],
        [/§\s*458\.328/g, ' statute '],
        [/\b458\.328\b/g, ' statute '],
    ],
    rules: [
        {
            rule: 'bmi-figure',
            re: /\bbmi\b/,
            why: "no BMI figure is in the sourced standard: ASPS gives none, and Cleveland Clinic's is an outlier",
        },
        {
            rule: 'named-device',
            re: /power[\s-]assisted|\bpal\b|smart ?lipo|j[\s-]?plasma|renuvion|bodytite|laser[\s-]assisted|ultrasound[\s-]assisted/,
            why: 'device and technique names wait on the owner (compliance: owner claims)',
        },
    ],
}

export const procedureCopyConfigs: Readonly<
    Record<string, ProcedureCopyConfig>
> = {
    [bbl.slug]: bbl,
    [lipo.slug]: lipo,
}
