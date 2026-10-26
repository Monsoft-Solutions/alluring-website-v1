#!/usr/bin/env python3
"""Check a served blog post page: JSON-LD tags, the post's own parts, and claims.

    python3 .claude/skills/blog-post/scripts/served_check.py <url | saved .html> [<slug> | <path/to/content.md>]

Always: counts the <script type="application/ld+json"> tags by @type (count
tags, not string mentions: the RSC payload repeats them) and greps the
visible text for claims: every `fail` rule of the claims canon's section 11
(docs/claims/canon.md, read from packages/shared/src/claims/patterns.data.json
after its neutralizers; CR9 only for Dr. Lofman, since Dr. Shats is flag-only
under D1), plus phone numbers. Without that file it falls back to a short
built-in list.

With the post's text (<slug> reads blog/posts/<slug>/; a content.md path
reads that file and the meta.json beside it, e.g. a scratch copy for a
review), it also checks that the page serves the quick answer, every H2,
the FAQ section and Sources, and splits each claim hit into:
  post      the words around it are in content.md: the post says it
  template  they aren't: nav, sidebar, the injected CTA block, footer

Exit 1 on a post claim, a part not served, or BreadcrumbList / MedicalWebPage /
BlogPosting not exactly once (FAQPage once when there is an FAQ section);
0 otherwise. Template hits are reported, never failed. Read-only: one GET
when given a URL.
"""

from __future__ import annotations

import html as htmllib
import json
import re
import sys
import urllib.request
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
PATTERNS = REPO / 'packages' / 'shared' / 'src' / 'claims' / 'patterns.data.json'
PHONE = r'\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b'
FALLBACK_CLAIMS = {
    'board-certified': r'board[\s-]certified(?! in general surgery by the american board of surgery)',
    '5,000': r'5,000\+?|thousands of (?:patients|procedures)',
    'ABPS': r'\babps\b|american board of plastic surgery',
    'ABCS': r'american board of cosmetic surgery',
    'AAAASF/accredited': r'aaaasf|accredit',
    'medically reviewed': r'medically reviewed',
}


def load_claims() -> tuple[dict[str, str], list[str]]:
    """The canon's `fail` text rules and neutralizers (claims canon section 11)."""
    try:
        data = json.loads(PATTERNS.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return {**FALLBACK_CLAIMS, 'phone': PHONE}, []
    claims = {}
    for r in data['rules']:
        if r['severity'] != 'fail' or r.get('scope', 'text') != 'text':
            continue
        # CR9 fails Dr. Lofman and only flags Dr. Shats (D1).
        claims[r['id']] = r'\blofman\b' if r['id'] == 'CR9' else r['pattern']
    # EX1 is a paired rule (study counts are allowed); the retired volume
    # claim itself is always a defect.
    claims['5,000+'] = r'\b5,000\s*\+'
    claims['phone'] = PHONE
    return claims, data.get('neutralizers', [])


CLAIMS, NEUTRALIZERS = load_claims()


def neutralize(text: str) -> str:
    for n in NEUTRALIZERS:
        text = re.sub(n, ' ', text, flags=re.I)
    return norm(text).lower()


def norm(s: str) -> str:
    return re.sub(r'\s+', ' ', htmllib.unescape(s)).strip()


def visible(fragment: str) -> str:
    fragment = re.sub(r'<script\b.*?</script>|<style\b.*?</style>', ' ', fragment, flags=re.S | re.I)
    return norm(re.sub(r'<[^>]+>', ' ', fragment))


def md_text(md: str) -> str:
    md = re.sub(r'!\[([^\]]*)\]\([^)]*\)', r' \1 ', md)
    md = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', md)
    md = re.sub(r'<[^>]+>|^#+\s*|\*\*|(?<!\w)[*_](?!\s)|\|', ' ', md, flags=re.M)
    return norm(md).lower()


def words_around(text: str, m: re.Match, n: int = 4) -> tuple[str, str]:
    before = text[:m.start()].split()[-n:]
    after = text[m.end():].split()[:n]
    return ' '.join(before + [m.group(0)]), ' '.join([m.group(0)] + after)


def load(src: str) -> str:
    if not src.startswith('http'):
        return Path(src).read_text(encoding='utf-8')
    req = urllib.request.Request(src, headers={'User-Agent': 'alluring-blog-kit/served_check'})
    with urllib.request.urlopen(req, timeout=60) as r:
        print(f'GET {src} -> {r.status} {r.geturl()}')
        return r.read().decode('utf-8', 'replace')


def main() -> int:
    if len(sys.argv) < 2:
        print('usage: served_check.py <url | saved .html> [<slug> | <path/to/content.md>]', file=sys.stderr)
        return 2
    page = load(sys.argv[1])
    problems: list[str] = []

    types: Counter = Counter()
    blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', page, re.S)
    for b in blocks:
        try:
            d = json.loads(b)
        except json.JSONDecodeError:
            problems.append('a JSON-LD tag does not parse')
            continue
        for x in d if isinstance(d, list) else d.get('@graph', [d]):
            t = x.get('@type')
            types[', '.join(t) if isinstance(t, list) else str(t)] += 1
    print(f'json-ld: {len(blocks)} tags: ' + ', '.join(f'{t} {n}' for t, n in types.most_common()))
    for t in ('BreadcrumbList', 'MedicalWebPage', 'BlogPosting'):
        if types[t] != 1:
            problems.append(f'json-ld: {types[t]} {t} (expected 1)')

    content_norm = None
    if len(sys.argv) > 2:
        arg = sys.argv[2]
        cpath = Path(arg) if arg.endswith('.md') else REPO / 'blog' / 'posts' / arg / 'content.md'
        content = cpath.read_text(encoding='utf-8')
        content_norm = neutralize(md_text(content))
        meta_path = cpath.parent / 'meta.json'
        h2s = [norm(h) for h in re.findall(r'^## (.+)$', content, re.M)]
        served = {norm(re.sub(r'<[^>]+>', '', m.group(2)))
                  for m in re.finditer(r'<h2\b([^>]*)>(.*?)</h2>', page, re.S) if 'quick-answer' not in m.group(1)}
        missing = [h for h in h2s if h not in served]
        problems += [f'H2 not served: {h}' for h in missing]
        faq = 'Frequently asked questions' in h2s
        print(f'H2s: {len(h2s) - len(missing)} of {len(h2s)} served; FAQ section {"yes" if faq else "no"}; '
              f'Sources {"yes" if "Sources" in served else "NO"}; FAQPage tags {types["FAQPage"]}')
        if faq and types['FAQPage'] != 1:
            problems.append(f'json-ld: {types["FAQPage"]} FAQPage (expected 1 with an FAQ section)')
        if meta_path.exists():
            answer = norm(json.loads(meta_path.read_text(encoding='utf-8'))['quick_answer'].split('\n\n', 1)[-1])
            ok = answer[:80] in visible(page)
            print(f'quick answer: {"served" if ok else "MISSING"}')
            if not ok:
                problems.append('quick answer not served')

    text = neutralize(visible(page))
    for label, rx in CLAIMS.items():
        post, template = [], 0
        for m in re.finditer(rx, text, re.I):
            a, b = words_around(text, m)
            if content_norm is not None and (a in content_norm or b in content_norm):
                post.append(text[max(0, m.start() - 60):m.end() + 40])
            else:
                template += 1
        if not post and not template:
            continue
        if content_norm is None:
            print(f'{label:18} page {template}')
            continue
        print(f'{label:18} post {len(post)}  template {template}')
        problems += [f'post claim {label}: … {c} …' for c in post[:3]]

    for p in problems:
        print('PROBLEM', p)
    print('ok' if not problems else f'{len(problems)} problem(s)')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
