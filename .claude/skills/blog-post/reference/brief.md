# The brief

One page, approved by the user in chat before a word of the post is
written. It turns the evidence into decisions: who reads this, what she
asked, what each heading answers, and where every figure comes from. The
`blog-post-writer` agent may draft it; only the user approves it.

Keep it short. Every row cites its data (query, impressions, position,
window) or its source. A cell you can't fill is an open question: write
"open" and list it under the owner questions, never a guess.

## Template

```markdown
## Brief: <working title> (<new | rewrite>, cluster <key>)

**URL:** /blog/<slug> (new; slug_check free on <db>) | <live path> (rewrite; unchanged)
**Gate:** <verdict> (<reason>), <checkedAt>, against <registry entries + overlay, database>
**Plan item:** <blog/plan.json id> · **Registry owner:** <entry, or "new entry">
**Reader:** recovering | deciding. <One line: who she is and when she reads this.>
**Head question:** "<query in her words>": <impressions> impr, pos <x>, <window>
**The answer in one sentence:** <the number or the yes/no, with its source>
**Information gain:** <what this post has that the top results don't: a table, a sourced figure, a Florida rule, the surgeon's own practice>

### H2 map

| H2 (a question she searches) | Queries it answers (impr, pos) | Answer in one line | Source |
| ---------------------------- | ------------------------------ | ------------------ | ------ |

### The table

<Its job (timeline / normal vs call your surgeon / comparison), columns, rows, and each row's source.>

### FAQ (5–8; queries the body doesn't answer)

| Question | Query (impr) | Source |
| -------- | ------------ | ------ |

### Sources to read this session

| Figure or claim | Source URL | In the facts file? |
| --------------- | ---------- | ------------------ |

### Links

- Procedure page (at least 2): <path>#<anchor>, "<anchor text>"; <path>#<anchor>, "<anchor text>"
- Sibling posts (owners only, live paths): <path>, "<anchor text>"
- Money pages where they answer: /free-consultation, /plastic-surgery-financing-miami, /fly-in-consultation

### Images

- Hero (3:2): <scene>, <subject: age, skin tone, setting>, what fills the upper two thirds
- Inline (0–2), only if it teaches: <what>, <aspect>, `text_in_image` draft and its source

### SERP fields (drafts)

- Title (≤ 60, main phrase first, no surgeon, no year unless prices): "<…>" (<n> chars)
- Meta description (≤ 155, states the answer): "<…>" (<n> chars)
- Quick answer question: "<…>?"
- Primary keyword: <…> · Secondary (8–16, from the queries): <…>
- owns_queries: <…>
- Categories (existing names): <…> · Tags: <…> · CTA: default | consultation | bbl | breast | body | facial

### Rewrite only

- Keep from the live post: <sections, FAQs, images worth reusing>
- Cut: <claims, retired figures, phone numbers, #contactus, links to folded posts>
- Refresh queue: <open candidates, status>

### Owner questions (the post is written around them)

1. <question> → <how the post handles it until answered>

### Risks

<cannibalization (pages_for_query), the v2 allowlist, a slug the old template renders, anything the cluster plan decided>
```

## What makes a brief ready

- The head question and every H2 come from real queries, with their
  numbers.
- Every figure the post will state has a row under Sources: either the
  facts file, or a URL to read this session from the source list in
  [writing-standard](writing-standard.md#evidence).
- The FAQ questions are ones the body won't already answer.
- There are two procedure-page links with anchors from `blog/tools/clusters.json`
  (when the page has an anchor list), and sibling links point at the post
  that **owns** each topic.
- Nothing in it needs an owner fact that isn't on file, or the brief says
  how the post writes around it.
- For a cluster with a plan (`implementation-plans/2026-10-05-<cluster>-blog-cluster/posts.md`),
  the brief starts from that plan's decision and replacement copy, and says
  where it departs and why.
