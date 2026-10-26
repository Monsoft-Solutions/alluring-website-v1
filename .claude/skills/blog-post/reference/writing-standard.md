# The post writing standard

Every post written or rewritten through this skill meets this standard. It
generalizes the liposuction phase-2 standard (17 posts, 2026-09-23) and the
BBL and tummy tuck cluster reviews to every cluster. The posts keep their
URLs; a rewrite never changes a slug.

## Who reads these posts, and what they need

Two readers, and the post must know which one it is written for (the brief
names the reader stage: `deciding` or `recovering`).

- **Recovering** (about 75% of blog sessions): she had the surgery, often in
  the first weeks, reading on a phone at night, 93% of the time outside
  Florida. She wants to know whether what she feels is normal, what to do
  today, and when to call the surgeon.
- **Deciding**: she is comparing procedures, weighing timing (after
  pregnancy, after weight loss, after a GLP-1), or asking what something
  covers and costs. She is researching for months before she books.

A post is worth reading when it:

1. **Answers the question in the first sentence**, in plain words, with the
   number or the yes/no she came for.
2. **Says what is normal and what isn't**, with the signs that mean "call
   your surgeon" stated clearly, never buried.
3. **Gives practical steps** she can take today, in order, and says which
   ones evidence supports and which are common practice.
4. **Is honest about uncertainty.** Where sources disagree or the evidence
   is thin, say so and say what to ask the surgeon.
5. **Is calm and warm, not salesy.** No hype, no fear, no "transform your
   body". Write like a knowledgeable nurse explaining things to a friend.

Information gain is the bar: a post exists to add something the top results
don't already say (a table they don't have, a figure with its source, the
surgeon's own practice stated plainly, a Florida-specific fact). A post
that paraphrases RealSelf is not written.

## SEO, AEO and GEO rules

- **Title** ≤ 60 characters, the post's main search phrase first, in the
  words searchers use (`search-console` queries, never industry terms).
  Promise the answer where it helps ("…: When to Start and How Many"). No
  "Miami" unless the post is about Miami. No surgeon's name. No year unless
  the content is year-specific (prices). The meta title equals the title.
- **Meta description** ≤ 155 characters. It states the answer or what the
  reader gets, not "Learn about…".
- **Excerpt**: 2–3 sentences, ≤ 320 characters.
- **Quick answer** (`quick_answer`, rendered above the body and used for
  Speakable): the head question, a blank line, then a 40–60 word answer.
  Self-contained, with the figures and their sources named. Never a
  `<QuickAnswer>` block in the body (the renderer owns it).
- **Body opens with an H2 question** (the head query) and a direct 2–4
  sentence answer under it that does not repeat the quick answer word for
  word.
- **Headings are the questions people search.** Use the phrases from the
  post's own GSC queries (`queries_for_page`) and the registry's
  `ownsQueries`. Each H2 is followed by a direct answer, then detail.
- **One intent per post.** The post owns one query cluster in the registry
  and never targets a procedure page's head or cost terms ("<procedure>
  miami", "<procedure> cost miami"). Those belong to `/procedures/*`.
- **Primary keyword** (≤ 100 chars) and **8–16 secondary keywords**, taken
  from the post's GSC queries, not invented.
- **FAQ section** at the end, before Sources: `## Frequently asked questions`,
  then 5–8 `### Question?` entries, each answered in one paragraph of 30–80
  words (no lists, no tables inside an answer). These become the FAQPage
  schema. Pick questions from GSC queries the body doesn't already answer.
- **Sources section** last: `## Sources`, a bullet list of every source
  cited, as `- [Publisher: Title](url)`.
- **Tables** where they help people scan: timelines, "normal vs call your
  surgeon", comparisons. GFM tables with short cells. At least one real
  table in a recovery or comparison post.
- **Length**: what the question needs, usually 1,200–2,200 words. No
  padding, no history lessons, no "In today's world".
- **No H1** in the content (the page renders the title). No `**bold**`
  keywords in prose. Bold only as the lead-in of a list item.
- **No "medically reviewed by"**: the blog has no medical reviewer.
- **Freshness is real**: `content_updated_at` moves only when the content
  changed (the trigger does it); never fake a date.

## Evidence

- **Every figure carries its source**, named in the sentence ("according to
  The Aesthetic Society") and linked on first use. A figure is a number of
  days, weeks, months, hours, sessions, percent, cc, dollars, years or
  pounds.
- **Figures the procedure's facts file covers must match it exactly**, with
  its attribution: `apps/web/lib/data/procedures/facts/<slug>.facts.ts`
  (BBL, lipo, tummy tuck today; others as their pages are rebuilt). Read
  the facts file before writing.
- **Figures it doesn't cover** must come from a source you **read in this
  session** with WebFetch: ASPS (plasticsurgery.org), The Aesthetic
  Society, Cleveland Clinic, MedlinePlus, Mayo Clinic, FDA, NIH/PubMed/PMC,
  Aesthetic Surgery Journal, Plastic and Reconstructive Surgery, Florida
  statutes and rules. Record the exact supporting quote in `meta.json`
  `sources[]`. No source, no figure.
- **Attribute exactly**: a surgeon quoted by ASPS is "a plastic surgeon
  interviewed by ASPS", not "ASPS says".
- **Never cite** competitor clinics, RealSelf, Healthline, lipo.com or any
  clinic blog. No third-party prices except a society average the facts
  file already carries (typed, attributed to ASPS, with what it excludes and
  no year).
- **Don't invent practice protocols.** If the owner hasn't confirmed a
  practice detail (massage count, garment weeks, revision policy), present
  what the evidence says and tell readers to follow their surgeon's
  schedule.

## The practice and the surgeon

See [compliance.md](compliance.md), which follows the claims canon
(`docs/claims/canon.md`). In short: one surgeon, named as
"Victoria Karlinsky, MD, FACS" (`[[surgeon:name]]`) then "Dr. Karlinsky";
the only credentials sentence is the canon's (`[[surgeon:credentials]]`,
from `@workspace/shared/claims/surgeon`); no "board-certified surgeons", no
ABPS, no accreditation, no "5,000+", no travel arrangements, no
superlatives. Every Alluring price is a claim token (`[[price:bbl]]`), never
a typed figure. Mention Alluring at most 2–3 times per post, never in the
opening answer. Close with one short paragraph that points to the procedure
page or the consultation page (`/free-consultation`; the anchor says
"consultation", since new copy never adds "free"). No hard sell, no phone
numbers in the content (the template carries the CTAs).

## Links

- **At least two in-text links to the procedure page**, with descriptive,
  varied anchors, pointing at the section that answers (`#candidate`,
  `#recovery`, `#pricing`, `#safety`, `#surgeon`, …). Never "click here" or
  a bare procedure name.
- **At least two links to sibling posts** in the cluster where they
  genuinely help, with descriptive anchors; link the post that _owns_ a
  topic, never a competing one.
- Post URLs: posts first published before 2026 live at `/{slug}`; 2026 posts
  at `/blog/{slug}`. Use the exact live path (check the blog sitemap).
- No links to competitor sites, no links to folded (308) URLs, no `#contactus`.
- Money questions link to `/plastic-surgery-financing-miami`; out-of-state
  readers to `/fly-in-consultation`.

## Images

Every post gets a hero (featured image) and 0–2 inline images, made with
GPT Image 2.5 on Higgsfield (see [images.md](images.md)). In `meta.json`,
describe them; in `content.md`, place inline images as
`![alt text](IMAGE:key)`. The build script swaps in the Blob URL.

- **Hero**: an editorial photograph of the reader's situation or the calm
  outcome. 3:2, subject in the upper two thirds (the template puts the
  title over the bottom third). Modest clothing, no swimwear or glamour, no
  text, no logos, varied women (age 25–55, skin tone, setting).
- **Inline**: only where it teaches something text can't: a timeline, a
  "normal vs call your surgeon" card, a stylised anatomy illustration, a
  flat lay. Text in an infographic matches the post's figures word for
  word and credits the source in a footer. No practice name or phone.
- **Alt text** describes what the image shows; for infographics, it
  contains every figure the image states.

## Files per post

`posts/<slug>/content.md` and `posts/<slug>/meta.json`:

```json
{
    "slug": "…",
    "mode": "new | rewrite",
    "reader": "recovering | deciding",
    "cluster": "tummy-tuck",
    "title": "…",
    "meta_description": "…",
    "excerpt": "…",
    "quick_answer": "Question?\n\nAnswer…",
    "primary_keyword": "…",
    "secondary_keywords": ["…"],
    "owns_queries": ["…"],
    "categories": ["existing blog_category names"],
    "tags": ["blog_tag names"],
    "cta": "default",
    "images": [
        {
            "key": "hero",
            "type": "featured",
            "aspect": "3:2",
            "alt": "…",
            "prompt": "SCENE: … SUBJECT: … KEY DETAILS: … CONSTRAINTS: …"
        },
        {
            "key": "timeline",
            "type": "inline",
            "aspect": "4:5",
            "alt": "…",
            "prompt": "…",
            "text_in_image": "exact text, if any"
        }
    ],
    "sources": [
        {
            "url": "…",
            "publisher": "…",
            "title": "…",
            "read_on": "2026-10-07",
            "quotes": ["exact sentence that supports a figure"]
        }
    ],
    "gsc": {
        "window": "2026-07-07..2026-10-04",
        "impressions": 0,
        "clicks": 0,
        "position": 0
    },
    "notes": "what changed and why; anything left open"
}
```

FAQs are parsed from the content's FAQ section by the build script.
`categories`, `tags` and `cta` are required by `blog/tools/check_post.py`;
`id` and `gate` are written by the tools; `published_at` is optional for a
new post (default: the run time). The full format is in `blog/README.md`
("Post files").
