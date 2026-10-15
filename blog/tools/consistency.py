#!/usr/bin/env python3
"""Figure consistency: every sentence that states a figure on a topic the
cluster's facts file covers, checked against the facts file.

    python3 blog/tools/consistency.py <slug> [<slug> ...] [--strict]
    python3 blog/tools/consistency.py --cluster lipo [--strict]

Generalized from the liposuction phase-2 consistency.py (2026-09-23). That
script hard-coded its topics and canonical figures; this one reads them from
the facts files (apps/web/lib/data/procedures/facts/<cluster>.facts.ts via
blog/tools/clusters.json): each fact's `concepts` (word stems) and `figures`.
A sentence is about a fact when it contains one of the fact's concepts. A
figure in such a sentence that none of those facts declare is flagged "?":
a contradiction with the facts file, a figure that needs its own source in
meta.json, or a sentence about something else that shares a word. Read each
flag; the lint (check_post.py) enforces dollar figures, this reports the rest
(hours, days, weeks, months, years, %, cc, sessions).

Reads the body, quick answer, meta description and infographic text of
blog/posts/<slug>. Exit 0 (report), or 1 with --strict when anything is flagged.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import bloglib as bl  # noqa: E402

UNITS = {'%': 'percent', 'percent': 'percent', 'hour': 'hour', 'day': 'day', 'night': 'night', 'week': 'week',
         'month': 'month', 'year': 'year', 'session': 'session', 'cc': 'cc', 'usd': 'usd', 'minute': 'minute'}
NUM = r'\d[\d,]*(?:\.\d+)?'
FIGURE = re.compile(
    rf'(?P<d1>\$)?(?P<a>{NUM})(?:\s*(?:[–-]|to)\s*(?P<d2>\$)?(?P<b>{NUM}))?\s*'
    r'(?P<u>%|percent\b|hours?\b|days?\b|nights?\b|weeks?\b|months?\b|years?\b|sessions?\b|cc\b|minutes?\b)?')


def num(s: str) -> float:
    return float(s.replace(',', ''))


def parse_facts(files: list[Path]) -> list[dict]:
    """[{id, concepts, figures: {(min, max, unit)}}] from the facts arrays."""
    facts = []
    for f in files:
        text = f.read_text(encoding='utf-8')
        for m in re.finditer(r"\{\s*id:\s*'([^']+)',\s*topic:\s*'(\w+)',(.*?)\n    \},", text, re.S):
            body = m.group(3)
            concepts = re.search(r'concepts:\s*\[(.*?)\]', body, re.S)
            figs = set()
            for v, u in re.findall(r"\{\s*value:\s*([\d.]+)\s*,\s*unit:\s*'(\w+)'\s*\}", body):
                figs.add((float(v), float(v), u))
            for a, b, u in re.findall(r"\{\s*min:\s*([\d.]+)\s*,\s*max:\s*([\d.]+)\s*,\s*unit:\s*'(\w+)'\s*\}", body):
                figs.add((float(a), float(b), u))
            facts.append({'id': m.group(1), 'topic': m.group(2), 'file': f.name, 'figures': figs,
                          'concepts': re.findall(r"'([^']+)'", concepts.group(1)) if concepts else []})
    return facts


def figures_in(sentence: str) -> list[tuple[str, tuple]]:
    out = []
    for m in FIGURE.finditer(sentence):
        dollars = bool(m.group('d1') or m.group('d2'))
        unit = 'usd' if dollars else UNITS.get((m.group('u') or '').rstrip('s').lower() if m.group('u') not in ('%',) else '%')
        if not unit:
            continue
        a = num(m.group('a'))
        b = num(m.group('b')) if m.group('b') else a
        out.append((m.group(0).strip(), (a, b, unit)))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description='Check post figures against the cluster facts file.')
    ap.add_argument('slugs', nargs='*')
    ap.add_argument('--cluster')
    ap.add_argument('--strict', action='store_true')
    a = ap.parse_args()
    posts = [bl.load_post(s) for s in (a.slugs or bl.all_slugs())]
    if a.cluster:
        posts = [p for p in posts if p.meta.get('cluster') == a.cluster]
    if not posts:
        bl.die('no posts to read')

    flagged = 0
    for cluster in sorted({p.meta.get('cluster') for p in posts}):
        files = bl.facts_files(cluster)
        facts = parse_facts(files)
        print(f'\n══ cluster {cluster}: {len(facts)} facts from {", ".join(f.name for f in files) or "no facts file"} ' + '═' * 20)
        for post in [p for p in posts if p.meta.get('cluster') == cluster]:
            m = post.meta
            text = '\n'.join([post.content.split('\n## Sources\n', 1)[0], m.get('quick_answer', ''), m.get('meta_description', ''),
                              *[i.get('text_in_image') or '' for i in m.get('images') or []]])
            text = re.sub(r'\]\([^)]*\)', ']', text)
            for sent in re.split(r'(?<=[.!?])\s+|\n+', text):
                figs = figures_in(sent)
                if not figs:
                    continue
                low = sent.lower()
                about = [f for f in facts if any(c in low for c in f['concepts'])]
                if not about:
                    if not facts:
                        print(f'    {post.slug[:34]:34} {sent.strip()[:200]}')
                    continue
                allowed = set().union(*(f['figures'] for f in about))
                odd = [raw for raw, t in figs if t not in allowed]
                if odd:
                    flagged += 1
                    print(f'  ? {post.slug[:34]:34} {", ".join(odd)} | {sent.strip()[:200]}'
                          f'\n      (facts about this: {", ".join(f["id"] for f in about)[:160]})')
    print(f'\n{flagged} sentence(s) flagged')
    return 1 if a.strict and flagged else 0


if __name__ == '__main__':
    sys.exit(main())
