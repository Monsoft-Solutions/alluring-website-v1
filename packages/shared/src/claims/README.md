# `@workspace/shared/claims`

The claims canon ([`docs/claims/canon.md`](../../../../docs/claims/canon.md),
issue #354) as data and pure functions. Every surface that says something about
the practice reads it from here: pages, structured data, `llms*.txt`, blog
posts, the chat agent, and the blog writer and reviewer prompts.

**The rule: no Alluring price is ever typed.** Not in pages, data files, blog
posts, FAQs, `llms*.txt`, JSON-LD or prompts. Code reads the pricing resolver;
DB text uses claim tokens. National averages (the three ASPS fees) are not
Alluring prices and stay typed, with their attribution.

## What lives here

Pure data and pure functions only: no env, Next, React or Node APIs. Each file
is its own subpath export, so a client island imports one small module and
never the regex list.

| Subpath               | Holds                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claims/identity`     | Name, tagline, approved descriptions, US-only market, Sofía's title, voice rules, retired brand lines, travel rules                                       |
| `claims/surgeon`      | `KARLINSKY_NAME`, `KARLINSKY_SHORT_NAME`, the credentials sentences, the Florida statement, `karlinskyRecords`, forbidden phrasings                       |
| `claims/pricing`      | `PricingSnapshot` and the price math: discount resolution, rounding, `formatUsd`, struck-through and plain-text forms, the BBL range, admin warnings      |
| `claims/prices`       | The 2026-09-15 price sheet (`PRICE_SHEET`), `CLAIM_PROCEDURES`, default starting lines, the caveats, ASPS averages, `FALLBACK_PRICING`, snapshot builders |
| `claims/financing`    | `FINANCING_PARTNERS`, `getFinancingPartnersString()`, the approved sentences, what financing copy never says                                              |
| `claims/contact`      | Phone, email, address, hours, `/contact-us`                                                                                                               |
| `claims/trust`        | `RATING_FALLBACK`, verified trust facts, the claims that were removed                                                                                     |
| `claims/tokens`       | The claim token grammar: parse, validate, resolve                                                                                                         |
| `claims/typed-prices` | Typed Alluring prices in text: `findTypedPrices` (the check every writer runs) and `convertTypedPrices` (the pipeline and the post migration)             |
| `claims/patterns`     | The §11 forbidden-claim regex list, typed, and a sweep (`findClaimHits`)                                                                                  |
| `claims/prompt`       | `buildClaimsPromptBlock(audience, pricing)`                                                                                                               |
| `claims` (barrel)     | Everything above except `patterns`. Server code, the admin and `packages/ai` only                                                                         |

`apps/web/lib/data/surgeons/karlinsky-credentials.constant.ts` and the
financing exports of `apps/web/lib/data/site-config.ts` re-export from here.

## How prices flow

```
admin Pricing page ─► price_line, procedure_pricing, pricing_settings
        │                         (packages/db/src/schema/pricing)
        └─► revalidate tag "pricing" (CACHE_TAGS.PRICING, web /api/revalidate)

getPricing()  apps/web/lib/queries/pricing.query.ts
  unstable_cache, tag "pricing"; FALLBACK_PRICING when the tables are empty
  or the query fails (caught outside the cache, so an outage is never cached)
        │
        ├─► pages and components: getStartingPrice, getLinePrice, getProcedurePrices
        ├─► posts, FAQs, quick answers, excerpts: resolveClaims(text, 'markdown')
        ├─► titles, meta, JSON-LD, llms*.txt: resolveClaims(text, 'text')
        └─► chat: buildClaimsPromptBlock('chat', pricing)
```

Migration `0060_whole_wrecking_crew` created the tables and seeded them from
`PRICE_SHEET` (59 lines), `DEFAULT_PROCEDURE_SETTINGS` and the combination
discounts. `price-sheet.test.ts` keeps `PRICE_SHEET` equal to
`docs/pricing/practice-price-list.md` line by line.

Client components never read prices themselves. A server component calls the
resolver and passes the resolved `PriceDisplay` (or plain strings) down as
props; `claims/pricing` has the formatters if a client island needs them.

### Procedures and lines

A procedure is named by its **claim key** (`bbl`, `lipo`, `tummy-tuck`,
`breast-augmentation`, `breast-lift`, `breast-reduction`, `facelift`,
`blepharoplasty`, `mommy-makeover`, `mens`, and, with no page, `otoplasty`,
`back-lift`, `arm-lift`, `thigh-lift`). `CLAIM_PROCEDURES` maps each key to the
web page slug, and the resolver and tokens accept either.

A line is `procedure:key`, e.g. `tummy-tuck:mini`. Keys are stable: posts name
them in tokens, so change a line's `label` and `usd` freely, retire it with
`is_active = false`, and never rename its key.

Each procedure has one **starting line**, chosen in the admin. The defaults
(canon §5 and the Decisions of 2026-10-25): BBL `lipo360-bbl`, lipo `lipo360`,
tummy tuck `mini`, breast augmentation `saline`, breast lift `modified` (D8),
breast reduction `small-medium`, facelift `face-neck-lift` (D2: no
facelift-alone price), blepharoplasty `upper`, men's `gynecomastia`, mommy
makeover none (D3: no total). A starting line that is missing or inactive
publishes nothing; it never falls back to another line.

BBL alone has a "most patients pay" range, from its starting price to
`procedure_pricing.typical_max_usd` (10,000). The range is typical, never a
maximum.

### Discounts

- A procedure's `discount_percent` (0–90) wins when set. `null` inherits
  `pricing_settings.default_discount_percent`; an explicit `0` switches the
  site-wide default off for that procedure.
- The discount applies to every line of the procedure, add-ons included.
- **Rounding:** the discounted price is rounded **down** to whole dollars,
  so it is never above list × (1 − percent) and the advertised percentage is
  never larger than the reduction (Fla. Stat. 456.062, FDUTPA). Sheet prices
  are whole hundreds and percentages whole numbers, so on the sheet the
  figure is exact: "$4,185 (7% off $4,500)". List prices are never rounded.
- Display: the list price struck through, then the discounted price
  (`~~$5,500~~ $4,400` in Markdown, `<del>` once rendered). Plain text gives
  `$4,400 (20% off $5,500)`.
- A discount is a discounted-fee advertisement under Fla. Stat. 456.062.
  `pricing_settings.discount_statement` holds the statement counsel confirms;
  `getDiscountStatement()` returns it while any discount is on, and
  `getPricingWarnings()` flags a discount without it. Surfaces that show a
  discounted price show the statement next to it.
- The combination discount ($ off for two and three procedures) is a fixed
  amount in `pricing_settings`, never a percentage.

## Claim tokens

DB text names a price or a canon sentence with a token, resolved when the
text is rendered:

```
[[name]]   [[name:arg]]   [[name:arg:arg]]
```

Double square brackets, lowercase, no spaces. No braces or angle brackets, so
a token is plain text to MDX: resolve tokens **before** MDX compilation, as a
string pass. `[[1]]` (a digit first) is not a token, and neither is Markdown
such as `[[Learn more](/x)]` whose brackets never close as `]]`: an unclosed
`[[` is only a token candidate when a known token name follows it.

`[[price:<procedure>]]` prints the figure only: name the variant next to it
with `[[price-label:<procedure>]]`, or name the line itself
(`[[price:tummy-tuck:mini]]`) where the sentence says which one. The facelift
has no starting price (D2): `[[price:facelift]]` is invalid, the only form is
"A face and neck lift is `[[price:facelift:face-neck-lift]]`", and every page
phrases it the same way (`quotesAsNamedLine`, `formatNamedLineText`).

A token that prints nothing on purpose (`[[discount-statement]]` with no
discount on) takes the space before it along, so data files and posts can end
a priced paragraph with it.

| Token                                          | Renders (fallback sheet, no discount)                           |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `[[price:<procedure>]]`                        | The starting price: `[[price:tummy-tuck]]` → $3,000             |
| `[[price:<procedure>:<line>]]`                 | One line: `[[price:tummy-tuck:full]]` → $4,500                  |
| `[[price-label:<procedure>]]`                  | The starting line's name: "mini tummy tuck (no muscle repair)"  |
| `[[price-label:<procedure>:<line>]]`           | A line's name                                                   |
| `[[price-span:<procedure>:add-ons]]`           | Cheapest to dearest single add-on: "$500 to $1,500"             |
| `[[price-range:bbl]]`                          | "most patients pay between $5,500 and $10,000"                  |
| `[[price-caveat]]`, `[[price-caveat:long]]`    | The required price caveat                                       |
| `[[combo-discount]]`                           | The combination discount sentence                               |
| `[[combo-discount:2]]`, `[[combo-discount:3]]` | $500, $1,000                                                    |
| `[[discount-statement]]`                       | The 456.062 statement while a discount is on; nothing otherwise |
| `[[financing]]`, `[[financing:long]]`          | The approved financing sentence (the long one links the page)   |
| `[[financing-partners]]`                       | "Cherry, CareCredit, and United Credit"                         |
| `[[surgeon:name]]`                             | "Victoria Karlinsky, MD, FACS"                                  |
| `[[surgeon:short]]`                            | "Dr. Karlinsky"                                                 |
| `[[surgeon:credentials]]`                      | The approved credentials sentence                               |
| `[[surgeon:credentials-year]]`                 | The same, "since 2008"                                          |
| `[[phone]]`                                    | "+1 (786) 305-8649" (not for post bodies)                       |

Examples, as a writer types them:

```md
A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]].
[[price-caveat:long]]

A tummy tuck starts at [[price:tummy-tuck]] for a [[price-label:tummy-tuck]];
a full tummy tuck is [[price:tummy-tuck:full]]. [[price-caveat]]

[[combo-discount]] [[discount-statement]]
```

With a 20% BBL discount, the first line renders as "A BBL at Alluring starts
at ~~$5,500~~ $4,400, and most patients pay between ~~$5,500~~ $4,400 and
~~$10,000~~ $8,000." in a post, and as "… starts at $4,400 (20% off $5,500) …"
in a meta description.

**Modes.** `markdown` for anything compiled as Markdown or MDX: discounted
prices are struck through, and text that comes from the database (line labels,
the statement) is put on one line and backslash-escaped so it can never open
MDX syntax or break a table row. A token inside a JSX tag's attribute
(`<CalloutBox title="From [[price:bbl]]">`) resolves as `text`, with
typographic quotes. `text` for titles, meta descriptions, JSON-LD,
`llms*.txt` and prompts.

**Trade-off: visible FAQs and quick answers are text.** A post's (and a data
file's) FAQ answers and quick answer are repeated word for word in FAQPage and
Speakable structured data, which must match the visible text, so they resolve
in `text` mode: a discounted price reads "$4,400 (20% off $5,500)" there,
not struck through. Meta descriptions and titles carry the discounted form but
no 456.062 statement, which can't fit; the page itself always shows it.

**Validation.** `validateClaimTokens(text, { pricing })` rejects an unknown
name, a bad argument, an unknown procedure or line, a procedure with no
starting price (`[[price:mommy-makeover]]`), and malformed or unclosed tokens,
suggesting the canonical form where only case or spacing was wrong. Run it
wherever DB text is saved (the admin, the MCP `update_post`,
`validateGeneratedMdx`).

**Rendering failures.** A token that cannot be resolved renders as **nothing**
and is reported (`onIssue`; the web helper logs it with the post slug). A
reader never sees raw brackets.

`listClaimTokens(pricing)` lists every concrete token the current pricing
allows, for prompts and for insertion in the admin. `resolveClaimTokensIn`
resolves every string of an FAQ list or a JSON-LD object.

### Where tokens are resolved and checked

| Surface                                                                                                                | Where                                                                                                                                         | Mode                                     |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Post body, both templates                                                                                              | `getPublishedPostBySlug` (`resolvePostClaims`), before the TOC, CTA split and MDX compile                                                     | `markdown`                               |
| Post title, meta title and description, excerpt, quick answer, FAQs (and their FAQPage, Speakable and Article JSON-LD) | the same call                                                                                                                                 | `text`                                   |
| Cards, related, popular, adjacent, search, `llms*.txt` post lists                                                      | the blog list queries (`resolvePostListClaims`)                                                                                               | `text`                                   |
| Procedure data copy (`[[price:…]]` inside a description, FAQ, quick answer…)                                           | `resolveProcedureClaims` / `getResolvedProcedures` in the procedure routes, home cards, `/procedures`, `llms*.txt`, related procedures        | `content` as `markdown`, the rest `text` |
| Chat                                                                                                                   | `buildChatSystemPrompt` (packages/ai) resolves `chat_config.system_prompt`, then appends the canon; the chat routes resolve `welcome_message` | `text`                                   |
| FAQ data files (home, `/reviews`, `/faqs`, `/procedures`, mommy makeover LP)                                           | `resolveClaimsIn` in each page, before the list and its FAQPage schema                                                                        | `text`                                   |
| Consultation thread and ads LP prices                                                                                  | `withChatPrices`, `buildLpChat(…, pricing)`, `buildLpPrices(…, pricing)` from `getPricing()`                                                  | `PriceDisplay` / `text`                  |

A post that shows a discounted price gets the 456.062 statement once after
its body (`post.discountStatement`); one that places `[[discount-statement]]`
itself does not get a second copy. Visible prices on pages are
`<PriceTag>` (struck through while discounted) beside one
`<DiscountStatement>`; plain-text surfaces use `lib/claims/price-text.server.ts`.

Tokens are checked where text is written: `validateGeneratedMdx` (the AI
pipeline; a token with only case or spacing wrong is rewritten to its
canonical form, anything else is reported and left as written, never
deleted), the extraction phase (`normalizeClaimText` in packages/ai, the same
rules for the meta fields, excerpt, quick answer and FAQs), the admin MCP
`update_post` / `create_post`, the admin blog editor and chat config (rejected,
with the field and the fix), the web blog create API, and `blog/tools`
(`lib/claims_check.mjs`). `get_writing_guide` ends with
`buildClaimsPromptBlock('blog-writer')`.

**No typed Alluring price.** The same writers run `findTypedPrices`: a dollar
figure equal to an active line, a combination discount or the top of the BBL
range, in a sentence that doesn't attribute it to ASPS or another third party,
is a defect, reported with the token to write. The pipeline converts it
(`convertTypedPrices`) when exactly one line fits; the admin, the MCP and the
lint reject it. `pnpm --filter admin claims:convert-posts` (dry run, then
`--apply`) migrated the posts that predate the tokens, saving a revision and
dismissing their refresh candidates first.

**Pricing saves can't empty a token.** The admin Pricing page refuses a save
that would make a token on a live post or in the chat config print nothing
(a line deactivated, a starting line removed), listing where it is used.

## Patterns

The §11 rules live in `patterns.data.json`, generated from the canon by
`packages/shared/scripts/generate-claim-patterns.mjs`, so `blog/tools`
(Python) reads the same file without a JS build. Edit the canon, then
regenerate; `patterns.test.ts` fails when the two disagree. Severities: `fail`
(a defect), `paired` (a defect unless the paired check in the note passes),
`review` (a person reads it). CR9 fails Dr. Lofman and only flags Dr. Shats
(D1).

The emitted module imports the JSON without an import attribute, which suits
the bundlers and `tsx` that consume this package; plain Node ESM would need
`with { type: 'json' }`.

## Prompts

`buildClaimsPromptBlock(audience, pricing)` renders the canon for
`'chat' | 'blog-writer' | 'blog-reviewer' | 'image' | 'gallery'`. The chat
block quotes the current starting prices in plain text (with any discount and
its statement); the blog writer block lists the tokens and says "Never type an
Alluring price. Use tokens."; the reviewer block treats a typed Alluring price
as a defect and a token as correct; image and gallery blocks carry no prices.
Append it to whatever prompt the database holds, so an admin edit cannot
reintroduce a retired claim.

## Changing things

- **A price, a label, a discount, the statement:** the admin Pricing page.
  No code change.
- **A new line:** add it in the admin with a new token-safe key
  (`[a-z0-9-]`). Update `PRICE_SHEET` and the price list document only when the
  practice issues a new printed sheet.
- **A new token:** add it to `CLAIM_TOKEN_SPECS` and `resolveToken` in
  `tokens.ts`, list it in `listClaimTokens`, document it here, and add tests.
