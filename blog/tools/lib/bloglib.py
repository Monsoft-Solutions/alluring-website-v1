"""Shared code for the blog kit's Python tools (check_post, build_sql, fold_sql).

Not a command. Everything the tools agree on lives here: where things are,
how to reach a database without printing its credentials, how a post is
parsed, and the checks that make up the writing standard and the claims
sweep (.claude/skills/blog-post/reference/{writing-standard,compliance}.md).

Rules are read from the code they mirror wherever the code has them: the CTA
ids and writer components from packages/shared/src/content/mdx-contract.constant.ts,
the credentials sentence from packages/shared/src/claims/surgeon.ts,
redirect sources from apps/web/next.config.mjs, dollar figures from the
cluster's facts file and docs/pricing/practice-price-list.md, cluster pages
and anchors from blog/tools/clusters.json. Alluring prices are claim tokens
(#354): lib/claims_check.mjs runs packages/shared/src/claims over a post's
fields, and a typed price-sheet figure is a problem even where the sheet
licenses it.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

LIB = Path(__file__).resolve().parent
TOOLS = LIB.parent
BLOG = TOOLS.parent
REPO = BLOG.parent
POSTS = Path(os.environ['BLOG_POSTS_DIR']).resolve() if os.environ.get('BLOG_POSTS_DIR') else BLOG / 'posts'  # override: tests only
IMAGES = BLOG / 'images'
MANIFEST = IMAGES / 'manifest.json'
APP = REPO / 'apps' / 'web' / 'app'
PRICE_LIST = REPO / 'docs' / 'pricing' / 'practice-price-list.md'
# The shared local dev database (`--db local` in the main checkout). Every
# generated SQL file refuses to run on it: rehearse on a throwaway copy.
SHARED_DEV_DB = 'alluring-autopilot-dev'
SITE = 'https://www.alluringplasticsurgery.com'
SITE_HOST_RX = r'(?:https?://)?(?:www\.)?alluringplasticsurgery\.com'
AUTHOR_NAME = 'Alluring Editorial Team'
REVISION_REASON = 'claude-blog-post'
GENERATED_BY = 'higgsfield/gpt_image_2_5'
BLOG_PREFIX_CUTOFF = dt.datetime(2026, 1, 1)
FAQ_H2 = '## Frequently asked questions'


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


# ── Environment and databases ───────────────────────────────────────────────

def read_env_value(path: Path, key: str) -> str | None:
    """The value of `key` in an env file. Duplicate lines: the last one wins."""
    if not path.exists():
        return None
    value = None
    for line in path.read_text(encoding='utf-8').splitlines():
        m = re.match(rf'^\s*(?:export\s+)?{re.escape(key)}\s*=\s*(.*)$', line)
        if m:
            value = m.group(1).strip().strip('"').strip("'")
    return value or None


def resolve_db(arg: str | None) -> str | None:
    """`local` = POSTGRES_URL in packages/db/.env.local; `env:NAME` = $NAME; else a URL."""
    if not arg:
        return None
    if arg == 'local':
        url = read_env_value(REPO / 'packages' / 'db' / '.env.local', 'POSTGRES_URL')
        if not url:
            die('POSTGRES_URL not found in packages/db/.env.local')
        return url
    if arg.startswith('env:'):
        url = os.environ.get(arg[4:])
        if not url:
            die(f'${arg[4:]} is not set')
        return url
    return arg


def describe_db(url: str | None) -> str:
    """host:port/dbname, never the credentials."""
    if not url:
        return '(no database)'
    u = urlparse(url)
    return f'{u.hostname}:{u.port or 5432}{u.path}'


def is_local_db(url: str) -> bool:
    return urlparse(url).hostname in ('localhost', '127.0.0.1', '::1')


def db_name(url: str | None) -> str:
    return urlparse(url).path.lstrip('/') if url else ''


def db_guard_sql(indent: str = '    ') -> str:
    """The first statement of every generated DO block: never write the shared dev database."""
    return (f"{indent}IF current_database() = '{SHARED_DEV_DB}' THEN\n"
            f"{indent}    RAISE EXCEPTION 'refusing to write the shared dev database {SHARED_DEV_DB}: "
            f"run this file on a throwaway copy (createdb -T) or, by the user, on production';\n"
            f"{indent}END IF;\n")


def psql_json(db: str, sql: str):
    """Run one query that returns a single JSON value; None when it returns NULL."""
    if not shutil.which('psql'):
        die('psql is not on PATH')
    env = dict(os.environ, PGCONNECT_TIMEOUT='15')
    r = subprocess.run(['psql', db, '-X', '-A', '-t', '-q', '-v', 'ON_ERROR_STOP=1', '-c', sql],
                       capture_output=True, text=True, env=env)
    if r.returncode != 0:
        die(f'psql failed on {describe_db(db)}: {r.stderr.strip()[:500]}')
    out = r.stdout.strip()
    return json.loads(out) if out else None


# ── SQL text ────────────────────────────────────────────────────────────────

def lit(s: str | None) -> str:
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def dollar(tag: str, body: str) -> str:
    tag = re.sub(r'[^a-z0-9_]', '', tag.lower())[:40] or 'x'
    while f'${tag}$' in body:
        tag += 'x'
    return f'${tag}${body}${tag}$'


def md5(s: str) -> str:
    return hashlib.md5(s.encode('utf-8')).hexdigest()


# ── Repo-derived rules ──────────────────────────────────────────────────────

def _read(rel: str) -> str:
    return (REPO / rel).read_text(encoding='utf-8')


def cta_ids() -> list[str]:
    text = _read('packages/shared/src/content/mdx-contract.constant.ts')
    m = re.search(r'export const BLOG_CTA_IDS\s*=\s*\[(.*?)\]', text, re.S)
    return re.findall(r"'([a-z-]+)'", m.group(1)) if m else ['default', 'consultation', 'bbl', 'breast', 'body', 'facial']


def writer_components() -> list[str]:
    text = _read('packages/shared/src/content/mdx-contract.constant.ts')
    m = re.search(r'export const MDX_WRITER_COMPONENTS\s*=\s*\[(.*?)\]', text, re.S)
    return re.findall(r"'([A-Za-z]+)'", m.group(1)) if m else ['Figure', 'CalloutBox']


def credentials_sentence() -> str:
    text = _read('packages/shared/src/claims/surgeon.ts')
    m = re.search(r"export const KARLINSKY_CREDENTIALS\s*=\s*'([^']+)'", text, re.S)
    if not m:
        die('KARLINSKY_CREDENTIALS not found in packages/shared/src/claims/surgeon.ts')
    return m.group(1)


def redirects() -> list[tuple[str, str]]:
    """(source, destination) for every redirect in apps/web/next.config.mjs."""
    text = _read('apps/web/next.config.mjs')
    i = text.find('async redirects()')
    block = text[i:] if i >= 0 else ''
    return [(m.group(1), m.group(2)) for m in re.finditer(
        r"source:\s*'([^']+)'[^{}]*?destination:\s*'([^']+)'", block, re.S)]


def surgeon_slugs() -> set[str]:
    return set(re.findall(r"slug:\s*'([^']+)'", _read('apps/web/lib/data/surgeons/surgeons-data.ts')))


def procedure_slugs() -> set[str]:
    out = set()
    for f in (REPO / 'apps/web/lib/data/procedures').glob('*.data.ts'):
        out |= set(re.findall(r"^    slug:\s*'([a-z0-9-]+)'", f.read_text(encoding='utf-8'), re.M))
    return out


# Pages a post may link to besides posts and procedure pages. Each is kept
# only while its route exists. Ad landing pages, thank-you pages and /links
# are left out on purpose: a blog link there pollutes their tracking.
MONEY_PAGES = [
    '/', '/about', '/blog', '/bmi-calculator', '/contact-us', '/faqs', '/fly-in-consultation',
    '/free-consultation', '/gallery', '/mens-plastic-surgery-miami', '/miami-plastic-surgery-specials',
    '/plastic-surgery-financing-miami', '/procedures', '/quiz', '/reviews', '/consulta-gratis',
    '/after-weight-loss-consultation', '/bridal-consultation', '/mommy-makeover-consultation',
    '/new-beginning-consultation',
]


def money_pages() -> set[str]:
    pages = {p for p in MONEY_PAGES if p == '/' or (APP / p.lstrip('/') / 'page.tsx').exists()}
    pages |= {f'/procedures/{s}' for s in procedure_slugs()}
    if 'dr-karlinsky' in surgeon_slugs():
        pages.add('/dr-karlinsky')
    return pages


def clusters() -> dict:
    data = json.loads((TOOLS / 'clusters.json').read_text(encoding='utf-8'))
    return {k: v for k, v in data.items() if not k.startswith('_')}


def facts_files(cluster: str) -> list[Path]:
    cfg = clusters().get(cluster) or {}
    names = cfg.get('facts')
    if names is None:
        names = [f'{cluster}.facts.ts']
    base = REPO / 'apps/web/lib/data/procedures/facts'
    return [base / n for n in names if (base / n).exists()]


def _money(s: str) -> int | None:
    try:
        return int(round(float(s.replace(',', ''))))
    except ValueError:
        return None


def facts_dollars(files: list[Path]) -> set[int]:
    """Dollar figures the facts files license: usd figures and $ amounts in statements."""
    out: set[int] = set()
    for f in files:
        out |= facts_dollars_text(f.read_text(encoding='utf-8'))
    out.discard(None)
    return out


def facts_practice_dollars(files: list[Path]) -> set[int]:
    """The usd figures of facts whose sourceIds include 'alluring-practice': the practice's own prices."""
    out: set[int] = set()
    for f in files:
        text = f.read_text(encoding='utf-8')
        for block in re.split(r'\n\s*\{\s*\n\s*id:\s*', text)[1:]:
            block = block.split('\n    },', 1)[0]
            src = re.search(r'sourceIds:\s*\[([^\]]*)\]', block)
            if not src or 'alluring-practice' not in src.group(1):
                continue
            out |= facts_dollars_text(block)
    out.discard(None)
    return out


def facts_dollars_text(text: str) -> set[int]:
    out: set[int] = set()
    for m in re.finditer(r"\{\s*value:\s*([\d.]+)\s*,\s*unit:\s*'usd'\s*\}", text):
        out.add(_money(m.group(1)))
    for m in re.finditer(r"\{\s*min:\s*([\d.]+)\s*,\s*max:\s*([\d.]+)\s*,\s*unit:\s*'usd'\s*\}", text):
        out |= {_money(m.group(1)), _money(m.group(2))}
    for m in re.finditer(r"statement:\s*(['\"])((?:\\.|(?!\1).)*)\1", text, re.S):
        out |= {_money(x) for x in re.findall(r'\$\s?(\d[\d,]*(?:\.\d+)?)', m.group(2))}
    return out


DOLLAR_RX = re.compile(r'\$\s?(\d[\d,]*(?:\.\d+)?)(\s?[kKmM]\b)?')


def _sheet_norm(s: str) -> str:
    return re.sub(r'\s+', ' ', s.replace('|', ' ').replace('$', '')).strip().lower()


def price_sheet_dollars(sources: list[dict]) -> tuple[set[int], list[str]]:
    """Dollar figures licensed by the practice's price sheet, and problems.

    Only sources whose url names docs/pricing/practice-price-list.md count, and
    only quotes that are verified substrings of that file (whitespace, pipes and
    $ signs ignored). Quotes from any other source license no dollar figure:
    third-party prices come from the facts file or not at all (compliance.md).
    """
    out: set[int] = set()
    problems: list[str] = []
    sheet = _sheet_norm(PRICE_LIST.read_text(encoding='utf-8')) if PRICE_LIST.exists() else ''
    for s in sources or []:
        if 'practice-price-list' not in (s.get('url') or ''):
            continue
        for q in s.get('quotes') or []:
            if not sheet or _sheet_norm(q) not in sheet:
                problems.append(f'meta.json source docs/pricing/practice-price-list.md: quote not found in the file: "{q[:80]}"')
                continue
            out |= {_money(m.group(1)) for m in DOLLAR_RX.finditer(q)}
            # the printed sheet has no $ signs
            out |= {v for v in (_money(x) for x in re.findall(r'\b\d{1,3}(?:,\d{3})+\b|\b\d{3,}\b', q)) if v and v >= 100}
    out.discard(None)
    return out, problems


# ── The live site ───────────────────────────────────────────────────────────

def published_posts(db: str | None) -> tuple[dict[str, dict], str]:
    """slug -> {path, id} for every live post, from the database or the live sitemap."""
    if db:
        rows = psql_json(db, (
            "SELECT coalesce(json_agg(json_build_object('slug', slug, 'id', id, "
            "'blog', published_at >= '2026-01-01')), '[]') FROM blog_post "
            "WHERE status = 'published' AND published_at IS NOT NULL AND slug IS NOT NULL "
            "AND refresh_of_post_id IS NULL"))
        return ({r['slug']: {'path': ('/blog/' if r['blog'] else '/') + r['slug'], 'id': r['id']} for r in rows},
                f'database {describe_db(db)}')
    url = f'{SITE}/sitemap/blog.xml'
    req = urllib.request.Request(url, headers={'User-Agent': 'alluring-blog-kit'})
    try:
        xml = urllib.request.urlopen(req, timeout=30).read().decode('utf-8')
    except OSError as e:
        die(f'could not read {url} ({e}); pass --db local (or a URL) instead')
    out = {}
    for loc in re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml):
        path = urlparse(loc).path.rstrip('/') or '/'
        if re.search(r'\.(?:jpe?g|png|webp|gif|avif)$', path):
            continue
        slug = path.rsplit('/', 1)[-1]
        out[slug] = {'path': path, 'id': None}
    return out, f'live sitemap {url}'


def db_taxonomy(db: str) -> dict:
    return psql_json(db, (
        "SELECT json_build_object("
        "'categories', (SELECT coalesce(json_object_agg(name, slug), '{}') FROM blog_category), "
        "'tags', (SELECT coalesce(json_object_agg(name, slug), '{}') FROM blog_tag), "
        "'gallery', (SELECT coalesce(json_agg(slug), '[]') FROM gallery_group WHERE is_visible))"))


# ── Posts ───────────────────────────────────────────────────────────────────

@dataclass
class Post:
    slug: str
    dir: Path
    meta: dict
    content: str  # as written, IMAGE:key placeholders intact

    @property
    def mode(self) -> str:
        return self.meta.get('mode', '')


def all_slugs() -> list[str]:
    return sorted(p.parent.name for p in POSTS.glob('*/meta.json'))


def load_post(slug: str) -> Post:
    d = POSTS / slug
    if not (d / 'meta.json').exists() or not (d / 'content.md').exists():
        die(f'{slug}: blog/posts/{slug}/meta.json and content.md are both required')
    try:
        meta = json.loads((d / 'meta.json').read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        die(f'{slug}: meta.json is not valid JSON: {e}')
    content = (d / 'content.md').read_text(encoding='utf-8').strip() + '\n'
    return Post(slug=slug, dir=d, meta=meta, content=content)


def load_manifest(path: Path | None = None) -> list[dict]:
    p = path or MANIFEST
    if not p.exists():
        return []
    data = json.loads(p.read_text(encoding='utf-8'))
    return data if isinstance(data, list) else data.get('images', [])


def word_count(md: str) -> int:
    prose = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' ', md)
    prose = re.sub(r'\]\([^)]*\)', ']', prose)
    prose = re.sub(r'<!--.*?-->|</?CalloutBox[^>]*>|<Figure[^>]*/>|\|\s*-+\s*', ' ', prose)
    return len([w for w in re.split(r'\s+', prose) if re.search(r'[A-Za-z0-9]', w)])


def h2_sections(content: str) -> list[tuple[str, str]]:
    """[(heading, body)] for each H2, in order. Text before the first H2 has heading ''."""
    parts = re.split(r'^## (.+)$', content, flags=re.M)
    out = [('', parts[0])] if parts[0].strip() else []
    for i in range(1, len(parts), 2):
        out.append((parts[i].strip(), parts[i + 1]))
    return out


def parse_faqs(content: str) -> list[dict]:
    if FAQ_H2 not in content:
        return []
    section = content.split(FAQ_H2, 1)[1].split('\n## ', 1)[0].strip()
    return [
        {'question': m.group(1).strip(), 'answer': re.sub(r'\s+', ' ', m.group(2)).strip(), 'raw': m.group(2).strip()}
        for m in re.finditer(r'^### (.+?)\n\n(.+?)(?=\n\n### |\Z)', section, re.S | re.M)
    ]


def faqs_for_db(content: str) -> list[dict]:
    return [{'question': f['question'], 'answer': f['answer']} for f in parse_faqs(content)]


LINK_RX = re.compile(r'(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
IMAGE_RX = re.compile(r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
PLACEHOLDER_RX = re.compile(r'IMAGE:([A-Za-z0-9_-]+)')


def internal_path(href: str) -> tuple[str, str] | None:
    """('/path', 'fragment') for a link to this site, else None."""
    m = re.match(SITE_HOST_RX + r'(/[^\s]*)?$', href)
    if m:
        href = m.group(1) or '/'
    elif not href.startswith('/'):
        return None
    path, _, frag = href.partition('#')
    path = path.split('?', 1)[0]
    path = path.rstrip('/') or '/'
    return path, frag


REUSE_HOST_RX = re.compile(r'^https://[a-z0-9]+\.public\.blob\.vercel-storage\.com/\S+$')


def reused_image_rows(db: str, urls: list[str]) -> dict[str, dict]:
    """url -> the images row (width, height, file_size, generation_prompt) for urls that exist in db."""
    if not urls:
        return {}
    rows = psql_json(db, (
        "SELECT coalesce(json_object_agg(url, json_build_object('width', width, 'height', height, "
        "'file_size', file_size, 'generation_prompt', generation_prompt)), '{}') FROM images "
        f"WHERE url IN ({', '.join(lit(u) for u in urls)})"))
    return rows or {}


def apply_images(post: Post, manifest: list[dict], placeholder_ok: bool,
                 db: str | None = None) -> tuple[str, list[dict], list[str]]:
    """Content with IMAGE:key swapped for Blob URLs, the image rows, and problems.

    An image resolves through the manifest (a render export_upload.mjs uploaded)
    or through meta.json "reuse_url" (an image already on Blob and already an
    `images` row, kept without a new render). With `db`, a reused url must be an
    `images` row there; its width, height, size and generation prompt are kept.
    """
    problems = []
    by_key = {(m['slug'], m['key']): m for m in manifest}
    content = post.content
    images = []
    reuse_urls = [i['reuse_url'] for i in post.meta.get('images') or [] if isinstance(i.get('reuse_url'), str)]
    existing = reused_image_rows(db, reuse_urls) if db else {}
    for img in post.meta.get('images') or []:
        m = by_key.get((post.slug, img.get('key')))
        reuse = img.get('reuse_url')
        if reuse is not None:
            if m:
                problems.append(f'image {img.get("key")}: both "reuse_url" and a manifest entry; keep one')
                continue
            if not isinstance(reuse, str) or not REUSE_HOST_RX.match(reuse):
                problems.append(f'image {img.get("key")}: reuse_url must be an https://<store>.public.blob.vercel-storage.com/ URL')
                continue
            row = existing.get(reuse)
            if db and row is None:
                problems.append(f'image {img.get("key")}: reuse_url is not an images row in {describe_db(db)}; '
                                'a reused image must already be live there (render a new one otherwise)')
                continue
            row = row or {}
            m = {'url': reuse, 'width': row.get('width'), 'height': row.get('height'), 'size': row.get('file_size'),
                 'prompt': row.get('generation_prompt'), 'reuse': True}
        if not m:
            if placeholder_ok:
                continue
            problems.append(f'image {img.get("key")}: no uploaded file in the manifest (run images/export_upload.mjs) and no reuse_url')
            continue
        url = m['url']
        for ph in (f'(IMAGE:{img["key"]})', f'"IMAGE:{img["key"]}"'):
            content = content.replace(ph, ph[0] + url + ph[-1])
        alt = img.get('alt') or ''
        if img.get('type') == 'inline':
            a = re.search(r'!\[([^\]]+)\]\(' + re.escape(url) + r'\)', content)
            alt = a.group(1) if a else alt
        images.append(dict(url=url, alt=alt, file=url.rsplit('/', 1)[1], w=m.get('width'), h=m.get('height'),
                           size=m.get('size'), prompt=m.get('prompt') or img.get('prompt') or alt,
                           type=img.get('type'), key=img.get('key'), reuse=bool(m.get('reuse'))))
    if not placeholder_ok and PLACEHOLDER_RX.search(content):
        problems.append(f'leftover placeholders: {sorted(set(PLACEHOLDER_RX.findall(content)))}')
    return content, images, problems


# ── The claims sweep ────────────────────────────────────────────────────────

# Names that contain a banned word but are not a claim about the practice.
NEUTRAL = [
    r'american society of plastic surgeons',
    r'plastic surgeons? (?:interviewed|quoted) by (?:asps|the american society of plastic surgeons|the aesthetic society)',
    r'plastic and reconstructive surgery(?: global open)?',
    r'journal of plastic,? reconstructive (?:and|&) aesthetic surgery',
    r'aesthetic surgery journal',
    r'clinics in plastic surgery',
    r'seminars in plastic surgery',
    r'american society of anesthesiologists',
    r'fly[\s-]in consultation',
    r'international society of aesthetic plastic surgery',
    r'international (?:journal|federation|society|confederation) of',
]

SWEEP = {
    # compliance.md "The surgeon's credentials": board-certified in any form
    # (only KARLINSKY_CREDENTIALS verbatim survives), ABPS, ABCS, plural surgeons.
    'credential': [
        r'board[\s-]*certifi\w*', r'\babps\b', r'american board of plastic surgery',
        r'american board of (?:facial )?cosmetic surgery', r'\babcs\b', r'(?:double|triple|dual)[\s-]board',
        r'\bplastic surgeons?\b', r'\bour (?:\w+ )?surgeons\b',
    ],
    # compliance.md "Owner claims the blog must not make"
    'owner-claim': [
        r'aaaasf', r'accredit\w*', r'\bjcaho\b', r'joint commission', r'\banesthesiologists?\b',
        r'\bvaser\b', r'\bsmartlipo\b', r'\bbodytite\b', r'24\s*/\s*7',
        r'around[\s-]the[\s-]clock (?:support|care|access|availability)',
        r'(?<!\$)\b5,?000\s*\+', r'\b5,?000\+?\s+(?:happy |satisfied )?(?:patients|procedures|surgeries|clients)',
        r'thousands of (?:happy |satisfied )?(?:patients|procedures|surgeries|women|clients)',
        r'\b\d{1,2}\+\s*years\b', r'\b\d{1,2}\+?\s+years of (?:experience|practice|expertise)',
        r'hipaa', r'medical content review board',
    ],
    'medically-reviewed': [
        r'medically[\s-]reviewed', r'medical(?:ly)? review(?:ed|er)\b', r'reviewed by (?:dr\b|a doctor|our|the surgeon)',
        r'fact[\s-]checked by',
    ],
    'superlative': [
        # No bare r'\bbest\b': generic advice ("the best way to sleep") is
        # fine (claims canon, Decisions of 2026-10-25); the canon sweep's SU1
        # flags every "best" for review instead.
        r'\bsafest\b', r'guarantee\w*', r'\bnumber one\b', r'\bno\.? ?1\b', r'#1\b', r'world[\s-]class',
        r'top[\s-]rated', r'\bleading (?:surgeon|practice|clinic|provider|expert|center|centre|plastic|cosmetic)',
        r'industry[\s-]leading', r'cutting[\s-]edge', r'state[\s-]of[\s-]the[\s-]art', r'revolutionary',
        r'\bpainless\b', r'\bscarless\b',
    ],
    'luxury-affordable': [r'\bluxur(?:y|ious)\b', r'\baffordab(?:le|ility)\b'],
    # CLAUDE.md market scope + compliance.md "No travel coordination"
    'travel-or-market': [
        r'concierge', r'\bairport\b', r'pick[\s-]?up service', r'\bhotels?\b', r'\blodging\b',
        r'recovery (?:house|home|suite|retreat|villa)s?', r'chauffeur', r'\bpackages?\b', r'\binternational\b',
        r'latin america', r'caribbean', r'medical touris\w*', r'\bfly[\s-]in\b', r'\btransportation\b',
        r'(?:book|arrang|coordinat)\w*\s+(?:your\s+|the\s+)?(?:flights?|travel|transport\w*|stay)',
    ],
    # compliance.md "Prices": retired figures, in the context that makes them retired
    'retired-price': [
        r'(?:\bbbl\b|brazilian butt lift)[^.\n]{0,60}\$(?:3,500|4,500)\b',
        r'\$(?:3,500|4,500)\b[^.\n]{0,60}(?:\bbbl\b|brazilian butt lift)',
        r'\$2,?500\b', r'\$3,000\s*(?:[–-]|to)\s*\$5,000', r'\$8,000\s*\+', r'tummy tuck[^.\n]{0,60}\$8,000\b',
        r'(?:breast|thigh|arm|body|butt|face|neck|brow)[\s-]lift[^.\n]{0,60}\$6,500\b',
    ],
    'financing-figure': [
        r'\$\s?\d[\d,]*(?:\.\d+)?\s*(?:/\s*|a |per )(?:week|wk|month|mo)\b',
        r'(?:monthly|weekly) payments? (?:of|from|as low as)',
    ],
    'urgency': [r'limited[\s-]time', r'\bact now\b', r'spots? (?:left|remaining)', r'\bhurry\b', r'\bcountdown\b'],
    'phone': [r'\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b', r'\btel:'],
    'slop': [r'\bdelve\b', r'\bjourney\b', r"in today['’]?s world", r"it['’]?s important to note", r'\bempower\w*',
             r'transform your (?:body|life|look)'],
}
# The Sources list quotes other people's titles: only these rules apply to it.
SOURCES_RULES = ('credential', 'owner-claim', 'phone', 'travel-or-market')


def sweep_text(text: str, credentials: str) -> str:
    t = re.sub(r'\]\([^)]*\)', ']', text)          # link and image targets are not copy
    t = re.sub(r'https?://\S+', ' ', t)
    t = t.lower().replace(credentials.lower(), ' ')
    for n in NEUTRAL:
        t = re.sub(n, ' ', t)
    return t


def sweep(where: str, text: str, credentials: str, extra_rules: dict | None = None,
          only: tuple[str, ...] | None = None, allow_vaser: bool = False) -> list[str]:
    t = sweep_text(text, credentials)
    rules = dict(SWEEP)
    if extra_rules:
        rules.update(extra_rules)
    out = []
    for rule, patterns in rules.items():
        if only and rule not in only:
            continue
        spans: list[tuple[int, int]] = []
        for rx in patterns:
            if allow_vaser and rx == r'\bvaser\b':
                continue
            for m in re.finditer(rx, t):
                if any(m.start() < e and s < m.end() for s, e in spans):
                    continue  # one report per spot, however many patterns match it
                spans.append((m.start(), m.end()))
                ctx = t[max(0, m.start() - 45):m.end() + 45].replace('\n', ' ').strip()
                out.append(f'{where}: {rule} "{m.group(0)}" … {ctx} …')
    return out



# ── The claims canon (#354) ─────────────────────────────────────────────────
#
# docs/claims/canon.md §11 as data: packages/shared/src/claims/patterns.data.json
# (generated from the canon; the site's own findClaimHits reads the same file).
# It runs after SWEEP above and reports only what SWEEP did not already report,
# so the two never print the same spot twice.

# Rules that are allowed-set checks the figure checks in checks.py already run
# against the facts files and the price sheet (PR16, PR17, MD10), or that
# SWEEP's `phone` rule covers for posts (CO1).
CANON_SKIP = frozenset({'PR16', 'PR17', 'MD10', 'CO1'})

# A sentence that names one of these carries a source (canon §7).
_SOURCE_RX = re.compile(
    r'\b(?:asps|american society of plastic surgeons|aesthetic society|cleveland clinic|mayo clinic|medlineplus'
    r'|fda|food and drug administration|pubmed|journal|review|study|studies|meta-analysis|trial|et al)\b', re.I)
_STUDY_RX = re.compile(r'\b(?:study|studies|review|analysis|meta-analysis|trial|survey|registry|cohort|et al|journal'
                       r'|data|researchers?)\b', re.I)
_YEAR_RX = re.compile(r'\b20\d\d\b')
# What follows a "best" that makes it a claim about Alluring (canon SU1 fails it).
_BEST_OF_PRACTICE_RX = re.compile(
    r'(?:\s+[\w-]+){0,2}?\s+(?:surgeons?|doctors?|clinics?|practices?|results?|outcomes?|prices?|value|care|choice'
    r'|in (?:miami|florida|south florida|the (?:us|country|state)))\b', re.I)

_CLAIM_PATTERNS: dict | None = None


def claim_patterns() -> dict:
    """The canon's §11 rules and neutralizers, compiled (case-insensitive, as the canon says)."""
    global _CLAIM_PATTERNS
    if _CLAIM_PATTERNS is None:
        data = json.loads(_read('packages/shared/src/claims/patterns.data.json'))
        flags = re.I if 'i' in (data.get('flags') or 'i') else 0
        rules = []
        for rule in data['rules']:
            try:
                rules.append({**rule, 'rx': re.compile(rule['pattern'], flags)})
            except re.error as e:  # the canon promises Python re; say so if it ever breaks
                die(f'patterns.data.json rule {rule["id"]} does not compile in Python: {e}')
        neutral = [re.compile(n, flags) for n in [*data['neutralizers'], *NEUTRAL]]
        _CLAIM_PATTERNS = {'rules': rules, 'neutralizers': neutral}
    return _CLAIM_PATTERNS


def _blank(m: re.Match) -> str:
    return ' ' * len(m.group(0))


def _span_of(t: str, start: int, end: int, seps: str) -> str:
    """The sentence (seps '.\n') or block (seps '\n') around a match."""
    i = max(t.rfind(c, 0, start) for c in seps) + 1
    js = [j for j in (t.find(c, end) for c in seps) if j != -1]
    return t[i:min(js) if js else len(t)]


def _canon_verdict(rule: dict, m: re.Match, plain: str) -> str | None:
    """'problem', 'warning' or None (passes) for one canon hit, applying the paired checks posts can run."""
    rid, hit = rule['id'], m.group(0).lower()
    sentence = _span_of(plain, m.start(), m.end(), '.\n')
    if rid == 'CR9':
        return 'warning' if 'shats' in hit else 'problem'      # D1: flag Dr. Shats, fail Dr. Lofman
    if rid == 'SU1' and _BEST_OF_PRACTICE_RX.match(plain[m.end():]):
        return 'problem'                                        # "best" said of the practice, surgeon, results or price
    if rid == 'SU1' and (re.match(r'\s+(?:candidates?|practices?|ways?|time|to\b|for you\b)', plain[m.end():])
                         or re.search(r'\b(?:at|as|your)\s+$', plain[max(0, m.start() - 6):m.start()])):
        return None                                             # the canon's listed false positives: generic advice
    if rid == 'CR5':
        return 'problem'                                        # never in posts: the statement has no place
    if rid == 'EX1':
        return 'warning' if _STUDY_RX.search(sentence) else 'problem'
    if rid == 'TR4':
        return None if 'not affiliated' in sentence else 'problem'
    if rid in ('MD2', 'MD3', 'MD6'):
        if rid == 'MD6' and re.match(r'\s*old\b', plain[m.end():]):
            return None                                         # "18+ years old" is an age, not longevity
        return 'warning' if _SOURCE_RX.search(sentence) else 'problem'
    if rid == 'PR15':
        ok = (re.search(r'\basps\b|american society of plastic surgeons', sentence)
              and re.search(r'anesthesia|operating room', sentence) and not _YEAR_RX.search(sentence))
        return None if ok else 'problem'
    if rid == 'CO2':
        return None if hit == 'info@alluringplasticsurgery.com' else 'problem'
    if rid == 'CO5':
        return None if re.sub(r'\W', '', hit).startswith('8435sw24th') else 'problem'
    if rule['severity'] == 'fail':
        return 'problem'
    return 'warning'                                            # review, and paired rules with no check here


def canon_sweep(where: str, text: str, credentials: str, allow_vaser: bool = False,
                extra_rules: dict | None = None) -> tuple[list[str], list[str]]:
    """The canon's §11 rules over one field, as (problems, warnings).

    Link and image targets are stripped (labels and alt text stay) and the
    neutralizers blanked out, as §11 says. Spots SWEEP already reports are
    skipped. `fail` rules are problems; `review` rules are warnings; the paired
    rules apply the check a post can run (see _canon_verdict).
    """
    if not text:
        return [], []
    plain = re.sub(r'\]\([^)]*\)', ']', text)
    plain = re.sub(r'https?://\S+', _blank, plain).lower()
    t = plain
    if credentials:
        t = re.sub(re.escape(credentials.lower()), _blank, t)
    cp = claim_patterns()
    for n in cp['neutralizers']:
        t = n.sub(_blank, t)

    taken: list[tuple[int, int]] = []
    for patterns in {**SWEEP, **(extra_rules or {})}.values():
        for rx in patterns:
            taken.extend((m.start(), m.end()) for m in re.finditer(rx, t))

    order = {'fail': 0, 'paired': 1, 'review': 2}
    problems, warnings = [], []
    for rule in sorted(cp['rules'], key=lambda r: order.get(r['severity'], 3)):
        if rule['id'] in CANON_SKIP:
            continue
        if rule['scope'] == 'title':
            # CR13 reads a <title>/seo_title line in source; in a post it is the title field itself.
            if where == 'title':
                hit = re.search(r'karlinsky|board[\s-]*certifi', t)
                if hit:
                    problems.append(f'{where}: canon CR13 "{hit.group(0)}" (no surgeon name or board claim in a title)')
            continue
        for m in rule['rx'].finditer(t):
            if m.end() == m.start() or any(m.start() < e and s < m.end() for s, e in taken):
                continue
            if allow_vaser and rule['id'] == 'FA5' and 'vaser' in m.group(0):
                continue
            verdict = _canon_verdict(rule, m, plain)
            taken.append((m.start(), m.end()))
            if not verdict:
                continue
            ctx = t[max(0, m.start() - 45):m.end() + 45].replace('\n', ' ')
            line = f'{where}: canon {rule["id"]} ({rule["group"]}) "{m.group(0).strip()}" … {" ".join(ctx.split())} …'
            (problems if verdict == 'problem' else warnings).append(line)
    return problems, warnings


# ── Claim token grammar (#354) ──────────────────────────────────────────────
#
# The shape rules of packages/shared/src/claims/tokens.ts (TOKEN_SCAN,
# TOKEN_BODY) in Python, with the token names read from CLAIM_TOKEN_SPECS.
# lib/claims_check.mjs runs the real validator (arguments, procedures, price
# lines); this is what still runs when node or tsx cannot, and for the body
# when validateGeneratedMdx is skipped (--no-mdx) or fails to run.

_TOKEN_NAMES: list[str] | None = None
_TOKEN_BODY = re.compile(r'^([a-z][a-z-]*)((?::[a-z0-9][a-z0-9-]*)*)$')


def claim_token_names() -> list[str]:
    global _TOKEN_NAMES
    if _TOKEN_NAMES is None:
        text = _read('packages/shared/src/claims/tokens.ts')
        m = re.search(r'export const CLAIM_TOKEN_SPECS\s*=\s*\[(.*?)\]\s*as const', text, re.S)
        if not m:
            die('CLAIM_TOKEN_SPECS not found in packages/shared/src/claims/tokens.ts')
        _TOKEN_NAMES = re.findall(r"^\s*name:\s*'([a-z-]+)'", m.group(1), re.M)
    return _TOKEN_NAMES


def token_shape_problems(where: str, text: str) -> list[str]:
    """Claim tokens that would render as nothing: unknown name, wrong case or spacing, unclosed."""
    if not text:
        return []
    names = claim_token_names()
    alternation = '|'.join(sorted(names, key=len, reverse=True))
    scan = re.compile(r'\[\[(\s*[A-Za-z][^\[\]\n]*)\]\]|\[\[\s*(?:' + alternation + r')(?![A-Za-z-])[A-Za-z0-9:-]*\]?', re.I)
    out = []
    for m in scan.finditer(text):
        raw = m.group(0)
        if m.group(1) is None:
            out.append(f'{where}: claim token {raw} is not closed with "]]"')
            continue
        inner = m.group(1)
        canonical = re.sub(r'\s+', '', inner).lower()
        body = _TOKEN_BODY.match(inner)
        name = (body or _TOKEN_BODY.match(canonical) or [None, canonical.split(':')[0]])[1]
        if name not in names:
            out.append(f'{where}: claim token {raw} has an unknown name; valid names: {", ".join(names)}')
        elif not body:
            fix = f' Did you mean [[{canonical}]]?' if _TOKEN_BODY.match(canonical) else ''
            out.append(f'{where}: claim token {raw} is malformed (lowercase, no spaces).{fix}')
    return out

# ── Dates ───────────────────────────────────────────────────────────────────

def parse_iso(s: str) -> dt.datetime:
    """An ISO date or datetime as naive UTC."""
    d = dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
    if d.tzinfo:
        d = d.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return d


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)


# ── Running the kit's node tools ────────────────────────────────────────────

def run_node(script: str, args: list[str], stdin: str | None = None) -> tuple[int, str, str]:
    if not shutil.which('node'):
        return 127, '', 'node is not on PATH'
    r = subprocess.run(['node', str(TOOLS / script), *args], capture_output=True, text=True, cwd=REPO, input=stdin)
    return r.returncode, r.stdout, r.stderr


def reading_time(words: int) -> int:
    return max(1, math.ceil(words / 200))
