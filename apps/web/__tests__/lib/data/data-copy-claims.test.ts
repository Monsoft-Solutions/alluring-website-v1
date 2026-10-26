/**
 * The site's shared copy data (FAQ files, page data, surgeon profiles, blog
 * CTAs, category pages, site config) says only what the claims canon
 * verifies (#354): no plural or "board-certified plastic" surgeons, no
 * accreditation, anesthesiologist, volume or tenure claims, no payment
 * figures, no superlatives about the practice, no promised response times.
 *
 * Every string in each export is swept with the canon's `fail` rules. The
 * travel rules are left out on purpose: these files state what the practice
 * does NOT do ("we don't book flights, hotels or transport"), which the
 * travel patterns match by design.
 */
import { describe, expect, it } from 'vitest'

import {
    findClaimHits,
    type ClaimPatternHit,
} from '@workspace/shared/claims/patterns'

import { authors } from '@/lib/data/authors.data'
import { blogCTAContents, footerCTAConfig } from '@/lib/data/blog-cta-content'
import { categoryDescriptions } from '@/lib/data/category-descriptions.data'
import { bmiFaqData } from '@/lib/data/faq/bmi-faq.data'
import { bridalFaqData } from '@/lib/data/faq/bridal-faq.data'
import { faqDataContact } from '@/lib/data/faq/contact-faq-data'
import { drKarlinskyFaqData } from '@/lib/data/faq/dr-karlinsky-faq.data'
import {
    faqFinalCtaData,
    faqPageConfig,
    faqPageCtaConfig,
    faqPageData,
    faqPageSeoData,
    featuredFaqs,
} from '@/lib/data/faq/faq-page-data'
import { financingFaqData } from '@/lib/data/faq/financing-faq-data'
import { faqDataHome } from '@/lib/data/faq/home-faq-data'
import { homePageFaqs } from '@/lib/data/faq/home-page-faqs.data'
import { landingFaqData } from '@/lib/data/faq/landing-faq.data'
import { mensFaqData } from '@/lib/data/faq/mens-faq.data'
import {
    miamiLandingFaqConfig,
    miamiLandingFaqData,
} from '@/lib/data/faq/miami-landing-faq.data'
import { mommyMakeoverFaqData } from '@/lib/data/faq/mommy-makeover-faq.data'
import { newBeginningFaqData } from '@/lib/data/faq/new-beginning-faq.data'
import { faqDataProcedures } from '@/lib/data/faq/procedures-faq-data'
import { spanishFaqData } from '@/lib/data/faq/spanish-faq.data'
import { specialsFaqData } from '@/lib/data/faq/specials-faq.data'
import { travelLandingFaqData } from '@/lib/data/faq/travel-landing-faq.data'
import { weightLossFaqData } from '@/lib/data/faq/weight-loss-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { aboutCTAData } from '@/lib/data/webpages/about.data'
import { blogPageData } from '@/lib/data/webpages/blog'
import {
    bmiPageData,
    bmiSeoData,
} from '@/lib/data/webpages/bmi-calculator.data'
import { contactFormData, contactHeroData } from '@/lib/data/webpages/contact'
import {
    financingPageData,
    financingSeoData,
} from '@/lib/data/webpages/financing'

/** Every string leaf of a data value, minus paths and URLs (not copy). */
function strings(value: unknown): string[] {
    if (typeof value === 'string') {
        return /^(?:\/|https?:|tel:|mailto:)/.test(value) ? [] : [value]
    }
    if (Array.isArray(value)) return value.flatMap(strings)
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(strings)
    }
    return []
}

/** Rules about travel framing match the files' own "we don't" sentences. */
const TRAVEL_NEGATION_RULES = new Set(['TR3', 'TR5'])

const SOURCES: Record<string, unknown> = {
    authors,
    blogCTAContents,
    footerCTAConfig,
    categoryDescriptions,
    bmiFaqData,
    bridalFaqData,
    faqDataContact,
    drKarlinskyFaqData,
    faqPageData,
    featuredFaqs,
    faqPageConfig,
    faqPageCtaConfig,
    faqFinalCtaData,
    faqPageSeoData,
    financingFaqData,
    faqDataHome,
    homePageFaqs,
    landingFaqData,
    mensFaqData,
    miamiLandingFaqData,
    miamiLandingFaqConfig,
    mommyMakeoverFaqData,
    newBeginningFaqData,
    faqDataProcedures,
    spanishFaqData,
    specialsFaqData,
    travelLandingFaqData,
    weightLossFaqData,
    siteConfig: {
        business: siteConfig.business,
        seo: siteConfig.seo,
        trustStats: siteConfig.trustStats,
    },
    // Dr. Shats (D1) is flagged, not rewritten: only Dr. Karlinsky's profile
    // is held to the sweep here.
    karlinsky: surgeons.filter((surgeon) => surgeon.id === 'dr-karlinsky'),
    aboutCTAData,
    blogPageData,
    bmiPageData,
    bmiSeoData,
    contactHeroData,
    contactFormData,
    financingPageData,
    financingSeoData,
}

/**
 * A study the facts files cite by name may carry its patient count and its
 * "no deaths" finding (canon §11.3 EX1, the Karunaratne 2023 review).
 */
function isCitedStudy(text: string, hit: ClaimPatternHit): boolean {
    return (
        ['EX1', 'FA8'].includes(hit.id) &&
        /\(Karunaratne and colleagues|\(Winocour and colleagues/.test(text)
    )
}

describe('shared copy data follows the claims canon', () => {
    for (const [name, value] of Object.entries(SOURCES)) {
        it(`${name} has no forbidden claim`, () => {
            const fails = strings(value).flatMap((text) =>
                findClaimHits(text)
                    .filter((hit) => hit.severity === 'fail')
                    .filter((hit) => !TRAVEL_NEGATION_RULES.has(hit.id))
                    .filter((hit) => !isCitedStudy(text, hit))
                    .map((hit) => `${hit.id} "${hit.match}" in: ${text}`)
            )
            expect(fails).toEqual([])
        })
    }

    it('keeps only the verified trust stat', () => {
        expect(Object.keys(siteConfig.trustStats ?? {})).toEqual(['rating'])
    })

    it('names the cosmetic boards only in the canon wording', () => {
        const karlinsky = surgeons.find((s) => s.id === 'dr-karlinsky')!
        expect(karlinsky.certifications).toEqual([
            'Board Certified, American Board of Surgery (since 2008)',
            'Fellow, American College of Surgeons (FACS)',
            'Certified, American Board of Cosmetic Surgery (2011, recertified 2021)',
            'Listed in the directory of the American Board of Facial Cosmetic Surgery',
        ])
        expect(
            karlinsky.certificationBadges?.map((badge) => badge.alt)
        ).not.toContain(
            'American Board of Cosmetic Surgery - Fellowship Director'
        )
    })
})
