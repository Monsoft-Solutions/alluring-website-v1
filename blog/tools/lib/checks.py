"""The writing standard and the claims sweep, as checks over one post.

Used by check_post.py (the lint) and build_sql.py (which refuses to write SQL
for a post with problems). A problem fails the post; a warning is printed and
does not. Rules: .claude/skills/blog-post/reference/writing-standard.md and
compliance.md; the phase-2 liposuction build (2026-09-23) is where most of
them were first enforced.
"""

from __future__ import annotations

import datetime as dt
import json
import re
from dataclasses import dataclass, field
from urllib.parse import urlparse

import bloglib as bl

REQUIRED_META = ['slug', 'mode', 'reader', 'cluster', 'title', 'meta_description', 'excerpt', 'quick_answer',
                 'primary_keyword', 'secondary_keywords', 'owns_queries', 'categories', 'tags', 'images',
                 'sources', 'cta']
LIST_META = ['secondary_keywords', 'owns_queries', 'categories', 'tags', 'images', 'sources']
CALLOUT_TYPES = {'info', 'warning', 'success', 'error'}
WEAK_ANCHORS = {'here', 'click here', 'this page', 'read more', 'learn more', 'this post', 'this article', 'link'}

# Where a figure may come from (writing-standard.md "Evidence"). Anything else is
# a warning: a clinic, a forum or a content farm is not a source.
SOURCE_DOMAINS = [
    'plasticsurgery.org', 'theaestheticsociety.org', 'surgery.org', 'clevelandclinic.org', 'medlineplus.gov',
    'mayoclinic.org', 'fda.gov', 'nih.gov', 'europepmc.org', 'academic.oup.com', 'journals.lww.com', 'doi.org',
    'flrules.org', 'flsenate.gov', 'leg.state.fl.us', 'floridahealth.gov', 'flboardofmedicine.gov', 'cdc.gov',
    'facs.org', 'absurgery.org', 'acog.org', 'asahq.org', 'jamanetwork.com', 'nejm.org', 'thelancet.com',
    'sciencedirect.com', 'springer.com', 'wiley.com', 'sagepub.com', 'bmj.com',
]
BANNED_DOMAINS = ['realself.com', 'healthline.com', 'lipo.com', 'lipo360.com']


def _domain(url: str) -> str:
    host = (urlparse(url).hostname or '').lower()
    return host[4:] if host.startswith('www.') else host


def _domain_in(host: str, domains: list[str]) -> bool:
    return any(host == d or host.endswith('.' + d) for d in domains)


@dataclass
class Ctx:
    db: str | None
    published: dict            # slug -> {path, id}
    published_from: str
    redirects: dict            # source -> destination
    money: set
    clusters: dict
    taxonomy: dict | None      # {categories: {name: slug}, tags: {...}, gallery: [...]} with a db
    credentials: str
    cta_ids: list
    writer_components: list
    batch: dict = field(default_factory=dict)   # slug -> mode, for posts checked or built together
    manifest: list = field(default_factory=list)

    @property
    def paths(self) -> dict:
        return {v['path']: k for k, v in self.published.items()}


def make_ctx(db: str | None, batch: dict, manifest: list) -> Ctx:
    published, source = bl.published_posts(db)
    return Ctx(
        db=db, published=published, published_from=source,
        redirects={s: d for s, d in bl.redirects() if ':' not in s},
        money=bl.money_pages(), clusters=bl.clusters(),
        taxonomy=bl.db_taxonomy(db) if db else None,
        credentials=bl.credentials_sentence(), cta_ids=bl.cta_ids(),
        writer_components=bl.writer_components(), batch=batch, manifest=manifest,
    )


@dataclass
class Result:
    slug: str
    problems: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    info: dict = field(default_factory=dict)


def _strip_code(md: str) -> str:
    md = re.sub(r'```.*?```', ' ', md, flags=re.S)
    return re.sub(r'`[^`\n]*`', ' ', md)


def _numbers(text: str) -> set[str]:
    return {n.replace(',', '') for n in re.findall(r'\d+(?:[.,]\d+)*', text)}


def run_gate(slug: str, db: str | None) -> tuple[dict | None, str]:
    """gate.mjs --from <slug> (registry + the live overlay of `db`), as JSON."""
    code, out, err = bl.run_node('gate.mjs', ['--from', slug, *(['--db', db] if db else []), '--json'])
    if code != 0:
        return None, (err or out).strip()[:300]
    try:
        return json.loads(out), ''
    except json.JSONDecodeError:
        return None, out.strip()[:300]


def _confirmed_at_consultation(text: str) -> bool:
    """compliance.md "Prices": the price is set after an exam and confirmed at consultation."""
    return bool(re.search(r'\bconfirm', text, re.I) and re.search(r'\bconsultation', text, re.I))


def _has_price(text: str, prices: set[int]) -> bool:
    return any(bl._money(d.group(1)) in prices for d in bl.DOLLAR_RX.finditer(re.sub(r'\]\([^)]*\)', ']', text)))


def unconfirmed_prices(body: str, prices: set[int]) -> list[str]:
    """Paragraphs, list blocks and table rows that state a practice price without saying it is
    confirmed at consultation. A table row passes when its table, or the paragraph right
    before or after it, says so; a heading passes on the paragraph under it."""
    out = []
    blocks = [b for b in re.split(r'\n\s*\n', body) if b.strip()]
    for i, b in enumerate(blocks):
        if not prices or not _has_price(b, prices) or _confirmed_at_consultation(b):
            continue
        prev = blocks[i - 1] if i > 0 else ''
        nxt = blocks[i + 1] if i + 1 < len(blocks) else ''
        lines = [ln for ln in b.splitlines() if ln.strip()]
        if lines and all(ln.lstrip().startswith('|') for ln in lines):
            if _confirmed_at_consultation(prev) or _confirmed_at_consultation(nxt):
                continue
            for ln in lines:
                if _has_price(ln, prices):
                    out.append(ln.strip()[:90])
            continue
        if b.lstrip().startswith('#') and _confirmed_at_consultation(nxt):
            continue
        out.append(re.sub(r'\s+', ' ', b).strip()[:90])
    return out


def check(post: bl.Post, ctx: Ctx, final: bool = False) -> Result:
    r = Result(post.slug)
    P, W = r.problems, r.warnings
    m = post.meta

    # ── meta.json shape ────────────────────────────────────────────────
    for k in REQUIRED_META:
        if k not in m:
            P.append(f'meta.json: "{k}" is missing')
    for k in LIST_META:
        if k in m and not isinstance(m[k], list):
            P.append(f'meta.json: "{k}" must be a list')
    if m.get('slug') != post.slug:
        P.append(f'meta.json slug "{m.get("slug")}" is not the folder name')
    if m.get('mode') not in ('new', 'rewrite'):
        P.append('meta.json: "mode" must be "new" or "rewrite"')
    if m.get('reader') not in ('recovering', 'deciding'):
        P.append('meta.json: "reader" must be "recovering" or "deciding"')
    cluster = m.get('cluster')
    ccfg = ctx.clusters.get(cluster)
    if not ccfg:
        P.append(f'meta.json: cluster "{cluster}" is not in blog/tools/clusters.json ({", ".join(ctx.clusters)})')
        ccfg = {'page': None, 'anchors': None, 'old_figures': []}
    if m.get('cta') not in ctx.cta_ids:
        P.append(f'meta.json: cta "{m.get("cta")}" is not one of {ctx.cta_ids}')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', post.slug):
        P.append('slug must be lowercase words joined by single hyphens')
    if P:
        return r  # the rest reads these fields

    title = m['title'].strip()
    meta_d = m['meta_description'].strip()
    excerpt = m['excerpt'].strip()
    qa = m['quick_answer'].strip()
    content = post.content

    # ── Lengths and SERP fields ───────────────────────────────────────
    if len(title) > 60: P.append(f'title is {len(title)} characters (max 60)')
    if len(meta_d) > 155: P.append(f'meta description is {len(meta_d)} characters (max 155)')
    if len(excerpt) > 320: P.append(f'excerpt is {len(excerpt)} characters (max 320)')
    if re.search(r'karlinsky|\bdr\.? ', title, re.I): P.append('title names the surgeon (compliance.md: never in the title)')
    if 'miami' in title.lower() and 'miami' not in post.slug: W.append('title says "Miami" but the post is not about Miami')
    if re.search(r'\b20\d\d\b', title): W.append('title has a year; keep it only for year-specific content (prices)')
    if re.search(r'\blearn (?:about|more)\b', meta_d, re.I): W.append('meta description says "Learn about…"; state the answer instead')

    qa_parts = qa.split('\n\n')
    if len(qa_parts) != 2 or not qa_parts[0].strip().endswith('?'):
        P.append('quick answer must be "Question?\\n\\nAnswer" (one blank line, question ends with ?)')
    else:
        qa_words = len(qa_parts[1].split())
        if not 40 <= qa_words <= 65: P.append(f'quick answer is {qa_words} words (40–65)')
        elif qa_words > 60: W.append(f'quick answer is {qa_words} words; the standard aims for 40–60')
        if qa_parts[1].strip() in content: W.append('the body repeats the quick answer word for word')
        if '<QuickAnswer' in content: P.append('body has a <QuickAnswer> block (the renderer owns it)')

    pk = m['primary_keyword'].strip()
    if not pk: P.append('primary keyword is empty')
    if len(pk) > 100: P.append(f'primary keyword is {len(pk)} characters (max 100)')
    sk = [s.strip() for s in m['secondary_keywords'] if isinstance(s, str) and s.strip()]
    if not 8 <= len(sk) <= 16: P.append(f'{len(sk)} secondary keywords (8–16)')
    if len({s.lower() for s in sk}) != len(sk): W.append('secondary keywords repeat')
    if pk.lower() in {s.lower() for s in sk}: W.append('the primary keyword is repeated in the secondary keywords')
    if not m['owns_queries']: W.append('owns_queries is empty: the registry entry needs the queries this post owns')

    # ── Body structure ────────────────────────────────────────────────
    if re.search(r'^# ', content, re.M): P.append('content has an H1 (the page renders the title)')
    first = next((ln for ln in content.splitlines() if ln.strip()), '')
    if not (first.startswith('## ') and first.rstrip().endswith('?')):
        P.append(f'content must open with an H2 question, found: {first[:80]!r}')
    sections = bl.h2_sections(content)
    h2s = [h for h, _ in sections if h]
    if 'Frequently asked questions' not in h2s: P.append(f'no "{bl.FAQ_H2}" section')
    if not h2s or h2s[-1] != 'Sources': P.append('"## Sources" must be the last section')
    elif len(h2s) >= 2 and h2s[-2] != 'Frequently asked questions': W.append('the FAQ section should come right before Sources')

    faqs = bl.parse_faqs(content)
    if 'Frequently asked questions' in h2s:
        if not 4 <= len(faqs) <= 9: P.append(f'{len(faqs)} FAQ entries parsed (4–9; "### Question?" then one paragraph)')
        elif not 5 <= len(faqs) <= 8: W.append(f'{len(faqs)} FAQ entries; the standard aims for 5–8')
        faq_section = content.split(bl.FAQ_H2, 1)[1].split('\n## ', 1)[0]
        if len(re.findall(r'^### ', faq_section, re.M)) != len(faqs):
            P.append('an FAQ entry does not parse: "### Question?", a blank line, then the answer')
        for f in faqs:
            n = len(f['answer'].split())
            if not f['question'].endswith('?'): P.append(f'FAQ "{f["question"][:60]}" does not end with ?')
            if not 30 <= n <= 80: P.append(f'FAQ "{f["question"][:60]}" answer is {n} words (30–80)')
            if '\n\n' in f['raw'] or re.search(r'^\s*(?:[-*]|\d+\.)\s|^\|', f['raw'], re.M):
                P.append(f'FAQ "{f["question"][:60]}" answer must be one paragraph (no lists or tables)')

    bold = [b for b in re.findall(r'^.*\*\*[^*]+\*\*.*$', content, re.M)
            if not re.match(r'^\s*(?:[-*]|\d+\.)\s+\*\*', b)]
    if bold: P.append(f'bold outside list lead-ins: {bold[0].strip()[:90]}')

    prose = _strip_code(content)
    if re.search(r'[{}]', prose): P.append('"{" or "}" in the body (MDX reads them as code and the page throws)')

    comments = re.findall(r'<!--(.*?)-->', content, re.S)
    markers = [re.fullmatch(r'\s*CTA:([a-z-]+)\s*', c) for c in comments]
    if any(x is None for x in markers): P.append('an HTML comment other than <!-- CTA:id --> (it breaks the MDX compile)')
    ids = [x.group(1) for x in markers if x]
    if len(ids) > 1: P.append(f'{len(ids)} CTA markers (at most one; a second takes the page down)')
    for i in ids:
        if i not in ctx.cta_ids: P.append(f'CTA marker id "{i}" is not one of {ctx.cta_ids}')
    if ids and ids[0] != m['cta']: P.append(f'CTA marker says "{ids[0]}" but meta.json cta is "{m["cta"]}"')
    if not ids and m['cta'] != 'default':
        P.append(f'meta.json cta is "{m["cta"]}" but the body has no <!-- CTA:{m["cta"]} --> marker')

    components = re.findall(r'</?([A-Z][A-Za-z0-9]*)\b', content)
    for c in sorted(set(components)):
        if c not in ctx.writer_components:
            P.append(f'<{c}> is not a writer component (only {", ".join(ctx.writer_components)})')
    opened = len(re.findall(r'<CalloutBox\b(?![^>]*/>)', content))
    closed = content.count('</CalloutBox>')
    if opened != closed: P.append(f'<CalloutBox> opened {opened} times, closed {closed}')
    for t in re.findall(r'<CalloutBox\b([^>]*)>', content):
        tm = re.search(r'type=["\'](\w+)["\']', t)
        if not tm: W.append('<CalloutBox> without a type')
        elif tm.group(1) not in CALLOUT_TYPES: P.append(f'<CalloutBox type="{tm.group(1)}"> (use {sorted(CALLOUT_TYPES)})')
    if opened > 2: W.append(f'{opened} CalloutBoxes (about two at most)')
    for src in re.findall(r'<Figure\b[^>]*\bsrc=["\']([^"\']+)["\']', content):
        if not (src.startswith(('http://', 'https://', '/')) or src.startswith('IMAGE:')):
            P.append(f'<Figure src="{src}"> must be absolute, root-relative or IMAGE:key')
    raw_html = sorted(set(re.findall(r'<(?!!--)([a-z][a-z0-9]*)\b[^>]*>', prose)))
    if raw_html: W.append(f'raw HTML tags in the body: {raw_html}')

    tables = len(re.findall(r'^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$', content, re.M))
    comparison = bool(re.search(r'\bvs\.?\b|\bversus\b|difference between|compared?\b', title + ' ' + post.slug, re.I))
    if (m['reader'] == 'recovering' or comparison) and tables < 1:
        P.append('a recovery or comparison post needs at least one table')

    words = bl.word_count(content)
    if not 1200 <= words <= 2200: W.append(f'{words} words; the standard says usually 1,200–2,200')

    mentions = len(re.findall(r'\balluring\b', re.sub(r'\]\([^)]*\)', ']', content), re.I))
    if mentions > 3: W.append(f'"Alluring" appears {mentions} times (2–3 at most)')
    opening = sections[0][1] if sections and sections[0][0] else ''
    if re.search(r'\balluring\b', re.sub(r'\]\([^)]*\)', ']', opening), re.I):
        P.append('the opening answer mentions Alluring (never in the opening answer)')

    # ── Images ────────────────────────────────────────────────────────
    imgs = m['images']
    keys = [i.get('key') for i in imgs]
    if len(set(keys)) != len(keys): P.append('image keys repeat')
    featured = [i for i in imgs if i.get('type') == 'featured']
    if len(featured) != 1: P.append(f'{len(featured)} featured images (exactly one)')
    for i in imgs:
        k = i.get('key')
        if i.get('type') not in ('featured', 'inline'): P.append(f'image {k}: type must be featured or inline')
        if not (i.get('alt') or '').strip(): P.append(f'image {k}: alt text is empty (images.alt is NOT NULL)')
        if not (i.get('prompt') or '').strip(): P.append(f'image {k}: prompt is empty (blog_post_images.prompt is NOT NULL)')
        if i.get('type') == 'inline' and f'IMAGE:{k}' not in content:
            P.append(f'inline image {k} is not placed in content.md as ![alt](IMAGE:{k})')
        if i.get('type') == 'featured' and f'IMAGE:{k}' in content:
            W.append(f'featured image {k} is also placed in the body')
        text = i.get('text_in_image') or ''
        if text:
            missing = sorted(n for n in _numbers(text) if n not in _numbers(i.get('alt') or ''))
            if missing: P.append(f'image {k}: alt text lacks figures the image states: {missing}')
            absent = sorted(n for n in _numbers(text) if n not in _numbers(content + ' ' + qa))
            if absent: P.append(f'image {k}: figures in the image that the post never states: {absent} '
                                '(compliance.md: an image figure must match the text word for word)')
        if i.get('type') == 'inline':
            a = re.search(r'!\[([^\]]*)\]\(IMAGE:' + re.escape(str(k)) + r'\)', content)
            if a and a.group(1).strip() != (i.get('alt') or '').strip():
                W.append(f'image {k}: the alt in content.md differs from meta.json (content.md wins)')
    for k in sorted(set(bl.PLACEHOLDER_RX.findall(content))):
        if k not in keys: P.append(f'IMAGE:{k} in content.md has no entry in meta.json images')
    have = {(x['slug'], x['key']) for x in ctx.manifest}
    uploaded = [k for k in keys if (post.slug, k) in have]
    reused = [i.get('key') for i in imgs if i.get('reuse_url') is not None]
    r.info['images'] = f'{len(uploaded)}/{len(keys)} in the manifest' + (f', {len(reused)} reused' if reused else '')
    if final:
        _, _, img_problems = bl.apply_images(post, ctx.manifest, placeholder_ok=False, db=ctx.db)
        P.extend(img_problems)

    # ── Links ─────────────────────────────────────────────────────────
    src_section = content.split('\n## Sources\n', 1)[1] if '\n## Sources\n' in content else ''
    body = content.split('\n## Sources\n', 1)[0]
    page = ccfg.get('page')
    anchors = ccfg.get('anchors')
    proc_links = 0
    own = {f'/{post.slug}', f'/blog/{post.slug}'}
    paths = ctx.paths
    tax = ctx.taxonomy or {}
    page_anchors = {c['page']: c.get('anchors') for c in ctx.clusters.values() if c.get('page')}
    for anchor, href in bl.LINK_RX.findall(body):
        if href.startswith('mailto:') or href.startswith('tel:'):
            P.append(f'{href.split(":")[0]} link "{anchor}" (the template carries the contact CTAs)')
            continue
        if '#contactus' in href:
            P.append(f'link to #contactus ("{anchor}")')
            continue
        ip = bl.internal_path(href)
        if ip is None:
            if href.startswith('#'):
                continue
            host = _domain(href)
            if _domain_in(host, BANNED_DOMAINS): P.append(f'link to a banned source {host} ("{anchor}")')
            elif not _domain_in(host, SOURCE_DOMAINS): W.append(f'external link to {host}: not a listed source domain')
            continue
        path, frag = ip
        if href.startswith('http'): W.append(f'absolute link to our own site {href}: use the root-relative path')
        if path in own: P.append(f'links to itself ({href})')
        if path in ctx.redirects:
            P.append(f'links to a redirected (folded) URL {path} -> {ctx.redirects[path]} ("{anchor}")')
        elif path in paths:
            if frag: W.append(f'anchor #{frag} into a post is not verified ({path})')
        elif path.rsplit('/', 1)[-1] in ctx.published:
            P.append(f'{path} is not the live URL: the post lives at {ctx.published[path.rsplit("/", 1)[-1]]["path"]}')
        elif path in ctx.money:
            a = page_anchors.get(path, 'unknown')
            if frag and isinstance(a, list) and frag not in a:
                P.append(f'unknown anchor {path}#{frag} (known: {", ".join(a)})')
            elif frag and a is None:
                W.append(f'anchor {path}#{frag} not verified (no anchor list for that page)')
        elif path.startswith('/blog/categories/') and ctx.taxonomy is not None:
            if path.rsplit('/', 1)[-1] not in tax.get('categories', {}).values():
                P.append(f'unknown category page {path}')
        elif path.startswith('/gallery/') and path.count('/') == 2:
            if ctx.taxonomy is None: W.append(f'{path} not verified (no database)')
            elif path.rsplit('/', 1)[-1] not in tax.get('gallery', []): P.append(f'unknown gallery page {path}')
        elif path.rsplit('/', 1)[-1] in ctx.batch and ctx.batch[path.rsplit('/', 1)[-1]] == 'new' and path.startswith('/blog/'):
            W.append(f'{path} is a new post in this batch: it must go live in the same run')
        else:
            P.append(f'unknown internal link {href} ("{anchor}")')
        if page and path == page:
            proc_links += 1
            if anchor.strip().lower() in WEAK_ANCHORS or anchor.strip().lower() == ccfg.get('label', '').lower():
                P.append(f'weak anchor "{anchor}" on a procedure-page link')
    if page and proc_links < 2:
        P.append(f'{proc_links} links to the procedure page {page} (at least 2)')
    r.info['procedure_links'] = proc_links

    body_domains = {_domain(h) for _, h in bl.LINK_RX.findall(body) if bl.internal_path(h) is None and h.startswith('http')}
    source_links = bl.LINK_RX.findall(src_section)
    source_domains = {_domain(h) for _, h in source_links}
    for d in sorted(body_domains - source_domains):
        P.append(f'{d} is cited in the body but not listed under Sources')
    for ln in [x for x in src_section.splitlines() if x.strip()]:
        if not re.match(r'^- \[[^\]]+: [^\]]+\]\(https?://[^)]+\)\s*$', ln):
            W.append(f'Sources line is not "- [Publisher: Title](url)": {ln.strip()[:80]}')
    for _, h in source_links:
        if _domain_in(_domain(h), BANNED_DOMAINS): P.append(f'Sources lists a banned source {_domain(h)} ({h[:80]})')
    source_urls = {h for _, h in source_links}
    today = dt.date.today()
    for s in m['sources']:
        for k in ('url', 'publisher', 'title', 'read_on', 'quotes'):
            if k not in s: P.append(f'meta.json source {s.get("url", "?")[:60]} lacks "{k}"')
        url = s.get('url', '')
        if url.startswith('http') and _domain_in(_domain(url), BANNED_DOMAINS):
            P.append(f'meta.json source {url[:60]}: {_domain(url)} is a banned source')
        if url.startswith('http') and url not in source_urls and url.rstrip('/') not in {u.rstrip('/') for u in source_urls}:
            W.append(f'meta.json source not listed under Sources: {url[:90]}')
        if 'read_on' in s:
            try:
                read = dt.date.fromisoformat(str(s['read_on']))
            except ValueError:
                read = None
            stale = None
            if read is None:
                stale = f'read_on "{s["read_on"]}" is not an ISO date (YYYY-MM-DD)'
            elif read > today:
                stale = f'read_on {read} is in the future'
            elif (today - read).days > 30:
                stale = (f'read_on {read} is {(today - read).days} days ago: open it again with WebFetch this session, '
                         'check the quotes and set read_on to today')
            if stale:
                (P if final else W).append(f'meta.json source {url[:60]}: {stale}')

    # ── Taxonomy ──────────────────────────────────────────────────────
    if not m['categories']: W.append('no categories (related posts and the old template use them)')
    if ctx.taxonomy is not None:
        for c in m['categories']:
            if c not in tax.get('categories', {}): P.append(f'category "{c}" does not exist (blog_category.name)')
        for t in m['tags']:
            if t not in tax.get('tags', {}): W.append(f'tag "{t}" does not exist: build_sql.py needs --create-tags')

    # ── Mode ──────────────────────────────────────────────────────────
    if m['mode'] == 'rewrite':
        if post.slug not in ctx.published:
            P.append(f'rewrite: {post.slug} is not a live post ({ctx.published_from})')
        if m.get('published_at'): W.append('rewrite: published_at is ignored (a rewrite never moves the URL or the date)')
        if not m.get('base_md5'):
            W.append('rewrite: meta.json has no base_md5 (python3 blog/tools/rewrite_base.py <slug> --db <production, '
                     'or a production-filled copy> --save); build_sql.py refuses a rewrite without it')
        gate, err = run_gate(post.slug, ctx.db)
        if gate is None:
            P.append(f'rewrite: gate.mjs failed: {err}')
        elif gate.get('verdict') == 'refresh' and gate.get('owningSlug') == post.slug:
            for w in gate.get('warnings') or []:
                P.append(f'rewrite: gate: {w}')
        elif gate.get('verdict') == 'new' and not ctx.db:
            W.append('rewrite: the gate ran on the registry alone (no --db) and does not know this post; pass --db')
        else:
            P.append(f'rewrite: the gate says {gate.get("verdict")} (owner {gate.get("owningUrl") or "none"}), not refresh '
                     f'of this post: {gate.get("reason")}. Fix the registry entry or the keywords first')
    else:
        if post.slug in ctx.published: P.append(f'new: {post.slug} is already live; use mode "rewrite"')
        if ctx.db:
            row = bl.psql_json(ctx.db, f"SELECT json_build_object('status', status) FROM blog_post WHERE slug = {bl.lit(post.slug)}")
            if row: P.append(f'new: slug exists in the database with status {row["status"]}')
        if m.get('published_at'):
            try:
                pa = bl.parse_iso(m['published_at'])
                if pa < bl.BLOG_PREFIX_CUTOFF: P.append('new: published_at before 2026-01-01 (new posts live at /blog/slug)')
                if pa > bl.utc_now(): P.append('new: published_at is in the future ("scheduled" never publishes)')
                elif (bl.utc_now() - pa).days > 7: W.append('new: published_at is more than a week ago (do not backdate)')
            except ValueError:
                P.append(f'new: published_at "{m["published_at"]}" is not ISO 8601')
        gate = m.get('gate') or {}
        if gate.get('verdict') != 'new':
            P.append(f'new: meta.json gate verdict is {gate.get("verdict")!r}; run blog/tools/gate.mjs --from {post.slug} --save')
        # The saved verdict is only what the gate said when it was saved: run it
        # again now (registry + the live overlay of --db), with the keywords and
        # owns_queries meta.json holds today. A warning is a query another page
        # owns (a procedure page's head or cost term, another post's query), and
        # owns_queries becomes the registry entry, so it fails here like a rewrite's.
        live, err = run_gate(post.slug, ctx.db)
        if live is None:
            P.append(f'new: gate.mjs failed: {err}')
        else:
            if live.get('verdict') != 'new':
                P.append(f'new: the gate says {live.get("verdict")} (owner {live.get("owningUrl") or "none"}) against '
                         f'{"the registry alone" if not ctx.db else "this database"}: {live.get("reason")}')
            for w in live.get('warnings') or []:
                P.append(f'new: gate: {w}')
        code, out, err = bl.run_node('slug_check.mjs', [post.slug, '--quiet', *(['--db', ctx.db] if ctx.db else [])])
        if code == 1: P.append('new: slug collision: ' + ' | '.join(x.strip() for x in out.splitlines() if 'COLLISION' in x))
        elif code != 0: W.append(f'new: slug_check.mjs did not run: {(err or out).strip()[:200]}')

    # ── Claims sweep and figures ──────────────────────────────────────
    facts = bl.facts_files(cluster)
    facts_text = ' '.join(f.read_text(encoding='utf-8').lower() for f in facts)
    allow_vaser = 'vaser' in facts_text
    old = {'old-figure': ccfg.get('old_figures') or []}
    alts = ' '.join((i.get('alt') or '') for i in imgs)
    texts = [('content', body), ('title', title), ('meta', meta_d), ('excerpt', excerpt), ('quick_answer', qa),
             ('image alt', alts), ('image text', ' '.join(i.get('text_in_image') or '' for i in imgs))]
    for where, text in texts:
        P.extend(bl.sweep(where, text, ctx.credentials, old, allow_vaser=allow_vaser))
    P.extend(bl.sweep('sources list', src_section, ctx.credentials, only=bl.SOURCES_RULES, allow_vaser=allow_vaser))

    sheet, sheet_problems = bl.price_sheet_dollars(m['sources'])
    P.extend(sheet_problems)
    licensed = bl.facts_dollars(facts) | sheet
    for where, text in texts:
        t = re.sub(r'\]\([^)]*\)', ']', text)
        for d in bl.DOLLAR_RX.finditer(t):
            v = bl._money(d.group(1))
            if d.group(2) or v is None:
                P.append(f'{where}: "{d.group(0).strip()}" (write dollar figures in full, e.g. $4,000)')
            elif v not in licensed:
                where_from = ', '.join(f.name for f in facts) or 'no facts file for this cluster'
                P.append(f'{where}: "{d.group(0).strip()}" is in neither the facts file ({where_from}) nor a verified '
                         'quote from docs/pricing/practice-price-list.md (other sources license no price)')
    practice = bl.facts_practice_dollars(facts) | sheet
    for x in unconfirmed_prices(body, practice):
        P.append(f'content: a practice price without "confirmed at consultation" (compliance.md "Prices"): {x}')
    if len(qa_parts) == 2 and _has_price(qa_parts[1], practice) and not _confirmed_at_consultation(qa_parts[1]):
        P.append('quick answer states a practice price without saying the surgeon confirms it at consultation')

    r.info.update(words=words, reading_time=bl.reading_time(words), faqs=len(faqs), tables=tables,
                  title_chars=len(title), meta_chars=len(meta_d))
    return r


def mdx_validate(posts: dict[str, str]) -> dict[str, dict] | None:
    """validateGeneratedMdx (packages/ai) over each body; None when node/tsx can't run."""
    code, out, err = bl.run_node('lib/mdx_check.mjs', [], stdin=json.dumps(posts))
    if code != 0:
        return None
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return None
