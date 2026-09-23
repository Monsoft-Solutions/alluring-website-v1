import { createJiti } from 'jiti'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti('./env')

const appDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        // The monorepo root, stated rather than inferred. Next finds the
        // workspace root by walking up for a lockfile, and on a machine that
        // keeps its projects under one parent a stray `package-lock.json` up
        // there wins — the build then warned about multiple lockfiles and
        // picked an unrelated directory. Next assigns the same value to
        // `outputFileTracingRoot`, so that inference also decided what the
        // serverless bundle traces. Setting it makes local, CI and Vercel agree.
        root: join(appDir, '..', '..'),
    },
    transpilePackages: ['@workspace/ui', '@workspace/db', '@workspace/seo'],
    experimental: {
        // Prerendering the 155 blog posts (issue #198) turned the build into a
        // heavy database client: every post fires its detail, related, adjacent
        // and inline-image queries, across 17 export workers each holding up to
        // 5 pooled connections (packages/db `max: 5`), all aimed at the Supabase
        // transaction pooler. That produced an intermittent `read ETIMEDOUT`
        // mid-prerender — one failed build in five, measured on this branch.
        // Next defaults to no retries, so a single transient pooler timeout
        // failed the whole deploy. Three attempts per page covers it.
        staticGenerationRetryCount: 3,
        // Next 16 ships a 75-entry default list (lucide-react and date-fns are
        // both on it) and framer-motion is not among them. The 17 components
        // that still legitimately need AnimatePresence / useScroll now sit
        // behind route-level code splitting rather than the root layout, so
        // this mostly helps the pages that still import it directly.
        optimizePackageImports: ['framer-motion'],
    },
    images: {
        // AVIF first — it was off entirely, so every optimized image was served
        // as WebP even to browsers that would take a smaller AVIF.
        formats: ['image/avif', 'image/webp'],
        // 1 day. The floor the optimizer applies to its own cache entries; the
        // default let /public-sourced images (the logo on every page) revalidate
        // constantly. Kept to a day rather than a month because /public filenames
        // are not fingerprinted — an image replaced in place has to reach people
        // within a working day, and a day already removes the per-view revalidation.
        minimumCacheTTL: 86400,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'www.alluringplasticsurgery.com',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    async headers() {
        return [
            {
                // Everything under /public. Next serves these with `max-age=0` by
                // default, so the logo revalidated on every page view and the image
                // optimizer inherited that floor as its own ceiling.
                // A day of freshness plus a week of background revalidation, rather
                // than a flat month: these filenames are NOT fingerprinted, so an
                // asset replaced in place is the realistic failure mode and it must
                // not be able to stick around for weeks.
                source: '/:path((?:images|videos|fonts)/.*|logo\\.png|logo-dark\\.png|icon\\.png|favicon\\.png|apple-touch-icon\\.png|og-image\\.jpg)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
            // No Cache-Control rule for marketing HTML. Issue #198 asked for one,
            // on the strength of production answering `max-age=0, must-revalidate`.
            // Measured against `next start`, Next already emits
            // `s-maxage=60, stale-while-revalidate=31535940` for every prerendered
            // route — a shared cache is being told exactly the right thing, and
            // production's `must-revalidate` is Vercel rewriting the browser-facing
            // copy while its own edge serves from the ISR cache. Any rule here
            // REPLACES that header, dropping `s-maxage` for anyone running behind a
            // CDN other than Vercel's, which is the opposite of the intent. The
            // browser-side win was marginal and cost up to an hour of stale HTML
            // after a publish or a copy correction.
        ]
    },
    async redirects() {
        return [
            {
                source: '/contact',
                destination: '/contact-us',
                permanent: true, // 308 permanent redirect
            },
            // Blog post URL routing is now handled by route-level logic in
            // app/[slug]/page.tsx and app/blog/[slug]/page.tsx based on publish date.
            // Influencer marketing redirects
            {
                source: '/melany',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=melany',
                permanent: true,
            },
            {
                source: '/yele',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=yele',
                permanent: true,
            },
            {
                source: '/lorena-gonzalez',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=lorena-gonzalez',
                permanent: true,
            },
            {
                source: '/melany-capote',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=melany-capote',
                permanent: true,
            },
            {
                source: '/cristina-deletto',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=cristina-deletto',
                permanent: true,
            },
            {
                source: '/angelica',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=angelica',
                permanent: true,
            },
            {
                source: '/kuki',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=kuki',
                permanent: true,
            },
            {
                source: '/dirian-garcia',
                destination:
                    '/miami-plastic-surgery-specials?utm_source=influencer&utm_medium=dirian-garcia',
                permanent: true,
            },
            {
                source: '/dr-karlinsky-ig',
                destination:
                    '/landing/dr-victoria-karlinsky?utm_source=doctor&utm_medium=dr-karlinsky',
                permanent: true,
            },
            // Melissa Juvier's bio link. Temporary, so the UTMs can change
            // without browsers holding on to the old destination.
            {
                source: '/melissa',
                destination:
                    '/landing/melissa-juvier?utm_source=melissa-juvier&utm_medium=bio-link',
                permanent: false,
            },
            {
                source: '/cosmetic-procedures-in-miami',
                destination: '/procedures',
                permanent: true,
            },
            {
                source: '/faq',
                destination: '/faqs',
                permanent: true,
            },
            // Social Media Bio Links
            {
                source: '/ig',
                destination:
                    '/links?utm_source=instagram&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },
            {
                source: '/fb',
                destination:
                    '/links?utm_source=facebook&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },
            {
                source: '/tiktok',
                destination:
                    '/links?utm_source=tiktok&utm_medium=social&utm_campaign=bio_link',
                permanent: true,
            },

            // KEyword Cannibalization Redirects
            {
                source: '/mommy-makeover-miami-guide',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/prepare-mommy-makeover-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-myths-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },

            // Duplicate blog content consolidation redirects
            // Destinations use /blog/ prefix since canonical posts are published >= Jan 2026
            // Mommy Makeover Recovery (6 posts, same topic -> 1 canonical)
            {
                source: '/mommy-makeover-recovery-timeline',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-guide',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-time-miami',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-pain-management',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-recovery-pain-guide',
                destination: '/blog/mommy-makeover-recovery-timeline-miami',
                permanent: true,
            },
            // Liposuction Cost (duplicate keyword). The post it pointed at,
            // /blog/liposuction-cost-miami, no longer exists (it returned 404
            // on 2026-09-22), so the old URL goes to the procedure page, whose
            // #pricing section owns the cost cluster.
            {
                source: '/miami-liposuction-cost',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            // Blepharoplasty Candidate (3 posts -> 1 canonical)
            {
                source: '/blepharoplasty-candidate-checklist',
                destination: '/blog/blepharoplasty-candidate-miami-checklist',
                permanent: true,
            },
            {
                source: '/blepharoplasty-miami-candidate',
                destination: '/blog/blepharoplasty-candidate-miami-checklist',
                permanent: true,
            },
            // Blepharoplasty Age (2 posts -> 1 canonical)
            {
                source: '/best-blepharoplasty-age-miami',
                destination: '/blog/best-blepharoplasty-age-miami-checklist',
                permanent: true,
            },
            // Liposuction Candidate and Liposuction Moms (2 posts -> 1 each).
            // Both canonicals were folded into the procedure page in the
            // liposuction blog consolidation below, so these go straight
            // there instead of chaining through a second 308.
            {
                source: '/liposuction-candidate-checklist-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/liposuction-miami-moms-faq',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            // Breast Reduction Candidate (2 posts -> 1 canonical)
            {
                source: '/breast-reduction-miami-recovery-candidates',
                destination: '/blog/breast-reduction-candidate-miami',
                permanent: true,
            },

            // BBL cluster consolidation (#229).
            //
            // /bbl-miami was a lead-gen landing page targeting "bbl miami",
            // "brazilian butt lift miami" and "best bbl surgeon miami" — the
            // exact terms /procedures/brazilian-butt-lift-bbl-miami is built
            // for. It took 309 impressions and 0 clicks in 28 days while
            // outranking the procedure page on "bbl consultation". It is not
            // used by paid ads (those run on the book. subdomain), so the
            // route is retired rather than noindexed.
            {
                source: '/bbl-miami',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },

            // BBL recovery consolidation (#229, finished by the recovery fold).
            //
            // Four posts answered "how long is BBL recovery" with three
            // different compression-garment schedules. They are now one page,
            // /how-long-to-recover-from-bbl: over the 90 days to 2026-09-11 it
            // had twice the impressions of /blog/miami-bbl-recovery-guide
            // (3,760 vs 1,863) and six times the page views (264 vs 45), and
            // its URL matches how people phrase the search. The guide, the
            // recovery-time post and the mistakes post fold into it, and
            // #229's two earlier folds are repointed so neither chains through
            // the guide.
            //
            // Each 2026 post is redirected at both /blog/slug and /slug. The
            // root form is served by app/[slug]/page.tsx, which 308s to
            // /blog/slug only while the post is published, so once a folded
            // post is drafted its root URL would otherwise 404.
            {
                source: '/blog/bbl-recovery-miami-moms-guide',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/bbl-recovery-miami-moms-guide',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/blog/bbl-miami-recovery-faq',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/bbl-miami-recovery-faq',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/blog/miami-bbl-recovery-guide',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/miami-bbl-recovery-guide',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/blog/bbl-recovery-time-miami',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/bbl-recovery-time-miami',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/blog/bbl-recovery-mistakes-miami',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/bbl-recovery-mistakes-miami',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            // Older recovery URLs Search Console still requests; both 404.
            {
                source: '/how-to-recover-from-bbl',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            {
                source: '/how-long-does-it-take-to-recover-from-bbl',
                destination: '/how-long-to-recover-from-bbl',
                permanent: true,
            },
            // WordPress-era path for the BBL smell post; Search Console still
            // requests it and it 404s.
            {
                source: '/alluring-plasticsurgery/blog/bbl-smell-is-it-real-causes-how-to-prevent-it',
                destination: '/why-do-bbl-stink',
                permanent: true,
            },

            // BBL January batch consolidation (#231).
            //
            // Twelve posts written in one batch over nine days in January
            // 2026 earned 10 clicks between them in the 28 days to
            // 2026-09-09; three had zero impressions. Only
            // /blog/tummy-tuck-vs-bbl-miami holds a real ranking (position 6
            // on "bbl vs tummy tuck"), so it stays as the single comparison
            // post and the other comparison posts fold into it. Combination
            // and "breast aug vs BBL" queries already resolve to it in GSC,
            // which is why those two land here rather than on the procedure
            // page. The Miami "mom" posts targeted phrases nobody searches;
            // the procedure page owns their safety and results intent.
            //
            // Each post is redirected at both /blog/slug and /slug (#241).
            // #231 shipped only the /blog/ form. The root form is served by
            // app/[slug]/page.tsx, which 308s to /blog/slug only while the
            // post is published, so every root URL 404'd from the day the
            // posts were drafted; Search Console kept requesting
            // /mommy-makeover-vs-bbl-miami.
            {
                source: '/blog/liposuction-vs-bbl-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/liposuction-vs-bbl-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-vs-butt-implants-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-vs-butt-implants-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/mommy-makeover-vs-bbl-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/mommy-makeover-vs-bbl-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/combine-bbl-tummy-tuck-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/combine-bbl-tummy-tuck-miami',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/breast-aug-vs-bbl-miami-moms',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/breast-aug-vs-bbl-miami-moms',
                destination: '/blog/tummy-tuck-vs-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-miami-results-timeline',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-miami-results-timeline',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-myths-miami-moms',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-myths-miami-moms',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-before-after-miami-mom',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-before-after-miami-mom',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-miami-post-pregnancy-guide',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-miami-post-pregnancy-guide',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-safety-miami',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-safety-miami',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/blog/bbl-miami-post-pregnancy-quiz',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            {
                source: '/bbl-miami-post-pregnancy-quiz',
                destination: '/procedures/brazilian-butt-lift-bbl-miami',
                permanent: true,
            },
            // Older slugs of the BBL exercise post that Search Console still
            // requests; both 404. They point at the /blog/ URL directly,
            // because its root form redirects too and would chain.
            {
                source: '/exercises-after-bbl-recovery-timeline',
                destination: '/blog/exercises-after-bbl-timeline',
                permanent: true,
            },
            {
                source: '/blog/exercises-after-bbl-safe-recovery-timeline',
                destination: '/blog/exercises-after-bbl-timeline',
                permanent: true,
            },

            // Anti-cannibalization redirects — blog posts → procedure pages
            {
                source: '/what-is-the-mommy-makeover-procedure',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/liposuction-cost-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/breast-reduction-cost-miami',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/miami-breast-reduction-cost-weight-loss',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/facelift-cost-miami',
                destination: '/procedures/facelift-miami',
                permanent: true,
            },
            {
                source: '/breast-reduction-surgeons-miami',
                destination: '/procedures/breast-reduction-miami',
                permanent: true,
            },
            {
                source: '/best-breast-lift-surgeons-miami',
                destination: '/procedures/breast-lift-miami',
                permanent: true,
            },

            // Pricing URL referenced from published blog copy but never built.
            // Kept as a redirect rather than a content edit so inbound links
            // from anywhere else land somewhere useful too.
            {
                source: '/plastic-surgery-cost-miami',
                destination: '/plastic-surgery-financing-miami',
                permanent: true,
            },

            // URLs Search Console still requests that 404 (#241). Checked
            // 2026-09-15: every source returned 404 and every destination
            // answered 200 without a redirect of its own. /alluringplasticsurgery
            // is also requested but has no honest destination, so it stays a 404.
            //
            // An expired promotion and deleted gallery media: the listing and
            // gallery groups they belonged to still exist.
            {
                source: '/promotions/back-to-me-body-breast-special',
                destination: '/promotions',
                permanent: true,
            },
            {
                source: '/gallery/media/breast-reduction-before-after-miami-patient-08',
                destination: '/gallery/breast-reduction',
                permanent: true,
            },
            {
                source: '/gallery/media/breast-augmentation-before-after-miami-natural-results',
                destination: '/gallery/breast-augmentation',
                permanent: true,
            },
            {
                source: '/gallery/media/breast-augmentation-before-after-miami-implant-results-2',
                destination: '/gallery/breast-augmentation',
                permanent: true,
            },
            // Old and misspelled /blog/ slugs.
            {
                source: '/blog/breast-implants-drop-implant-timeline-tips',
                destination: '/blog/breast-implants-drop-fluff-timeline',
                permanent: true,
            },
            {
                source: '/blog/breast-implants-drop-fluff-timeline-what-to-expect-month-by-month-after-breast-augmentation',
                destination: '/blog/breast-implants-drop-fluff-timeline',
                permanent: true,
            },
            {
                source: '/blog/breast-implant-drop-fluff-timeline',
                destination: '/blog/breast-implants-drop-fluff-timeline',
                permanent: true,
            },
            {
                source: '/blog/drop-and-fluff-timeline',
                destination: '/blog/breast-implants-drop-fluff-timeline',
                permanent: true,
            },
            {
                source: '/blog/swelling-and-asymmetry-after-augmentation-faq',
                destination:
                    '/blog/swelling-and-asymmetry-after-breast-augmentation-faq',
                permanent: true,
            },
            {
                source: '/blog/when-can-you-workout-after-breast-augmentation',
                destination:
                    '/blog/when-can-you-work-out-after-breast-augmentation',
                permanent: true,
            },
            {
                source: '/blog/mummy-makeover-compression-garments-guide',
                destination: '/blog/mommy-makeover-compression-garments-guide',
                permanent: true,
            },
            {
                source: '/blog/exercises-after-tummy-tuck',
                destination: '/blog/exercises-after-tummy-tuck-miami',
                permanent: true,
            },
            {
                source: '/blog/exercises-after-mommy-makeover-safe-recovery-guide',
                destination: '/blog/mommy-makeover-recovery-exercises',
                permanent: true,
            },
            // Old root slugs, and malformed paths left by the WordPress era.
            {
                source: '/how-to-reduce-tummy-tuck-tightness',
                destination: '/how-to-reduce-tightness-after-tummy-tuck',
                permanent: true,
            },
            {
                source: '/how-to-reduce-tightness-after-a-tummy-tuck',
                destination: '/how-to-reduce-tightness-after-tummy-tuck',
                permanent: true,
            },
            {
                source: '/how-to-massage-your-breast-implants',
                destination: '/how-often-to-massage-breast-after-augmentation',
                permanent: true,
            },
            {
                source: '/how-to-massage-breast-after-augmentation',
                destination: '/how-often-to-massage-breast-after-augmentation',
                permanent: true,
            },
            {
                source: '/how-long-after-breast-augmentation---drive',
                destination: '/how-long-after-breast-augmentation-can-i-drive',
                permanent: true,
            },
            {
                source: '/alluring-plastic-surgery-blog/how-many-times-can-you-get-liposuction',
                destination: '/how-many-times-can-you-get-liposuction',
                permanent: true,
            },
            {
                source: '/blog/alluringplasticsurgery.com/blog/breast-augmentation-pain-management',
                destination: '/blog/breast-augmentation-pain-management',
                permanent: true,
            },

            // A procedure page that was never built but is still requested and
            // still collecting Search Console impressions (#250). There is no
            // rhinoplasty page, so the directory is the closest live
            // destination. If the practice confirms it offers rhinoplasty,
            // build the page and drop this redirect.
            {
                source: '/procedures/rhinoplasty-miami',
                destination: '/procedures',
                permanent: true,
            },

            // The WordPress-era procedure URL. It collected 11,370 Search
            // Console impressions and 10 clicks in the 480 days to 2026-09-19,
            // and has returned 404 since the move to this app: no redirect
            // was ever added. The other eight procedures' old URLs 404 the
            // same way; they are the #260 control group, so they get their
            // redirects in a separate change.
            {
                source: '/procedures/liposuction-cosmetic-surgery-in-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },

            // Liposuction blog consolidation (2026-09-22 blog review):
            // 25 liposuction posts become 17.
            //
            // - The two lymphatic massage posts shared 46 queries and gave
            //   opposite protocols; the when-to-start post folds into the
            //   massage guide.
            // - The January week-by-week recovery post (428 impressions, 0
            //   clicks in 90 days) folds into the swelling post, which now
            //   carries the sourced timeline and already ranks 1.4 for it.
            // - The 2025 tummy tuck vs liposuction post was "crawled, not
            //   indexed"; its 2026 counterpart is the owner.
            // - Candidate, post-pregnancy, moms-tips and maintain-results
            //   posts (1 to 91 impressions each) are answered by the
            //   procedure page's candidacy, results and recovery sections.
            // - Liposuction vs breast augmentation is combination intent,
            //   which belongs to the mommy makeover page.
            //
            // Both /slug and /blog/slug are redirected for every post (#241).
            {
                source: '/blog/when-to-start-lymphatic-massage-after-lipo',
                destination: '/how-many-massages-after-lipo-360',
                permanent: true,
            },
            {
                source: '/when-to-start-lymphatic-massage-after-lipo',
                destination: '/how-many-massages-after-lipo-360',
                permanent: true,
            },
            {
                source: '/blog/liposuction-recovery-time-miami',
                destination: '/how-to-reduce-swelling-after-liposuction',
                permanent: true,
            },
            {
                source: '/liposuction-recovery-time-miami',
                destination: '/how-to-reduce-swelling-after-liposuction',
                permanent: true,
            },
            {
                source: '/blog/what-is-the-difference-between-tummy-tuck-and-liposuction',
                destination: '/blog/tummy-tuck-vs-liposuction',
                permanent: true,
            },
            {
                source: '/what-is-the-difference-between-tummy-tuck-and-liposuction',
                destination: '/blog/tummy-tuck-vs-liposuction',
                permanent: true,
            },
            {
                source: '/blog/liposuction-candidate-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/liposuction-candidate-miami',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/blog/liposuction-miami-post-pregnancy-guide',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/liposuction-miami-post-pregnancy-guide',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/blog/liposuction-miami-moms-tips',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/liposuction-miami-moms-tips',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/blog/how-to-maintain-liposuction-results',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/how-to-maintain-liposuction-results',
                destination: '/procedures/liposuction-miami',
                permanent: true,
            },
            {
                source: '/blog/liposuction-vs-breast-augmentation-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
            {
                source: '/liposuction-vs-breast-augmentation-miami',
                destination: '/procedures/mommy-makeover-miami',
                permanent: true,
            },
        ]
    },
}

export default nextConfig
