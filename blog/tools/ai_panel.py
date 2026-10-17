#!/usr/bin/env python3
"""The standing AI-citation panel: does Perplexity cite and quote Alluring correctly?

    python3 blog/tools/ai_panel.py                    # full panel (24 calls, ~$0.10)
    python3 blog/tools/ai_panel.py --limit 2 --tag smoke
    python3 blog/tools/ai_panel.py --only 1,5,21
    python3 blog/tools/ai_panel.py --group SPANISH
    python3 blog/tools/ai_panel.py --dry-run          # list prompts and cost, no calls
    python3 blog/tools/ai_panel.py --from-raw DIR     # re-parse saved responses, no calls

Asks each prompt in blog/tools/ai-panel-prompts.json of Perplexity `sonar`
(chat/completions, the same request body as the 2026-10-07 baseline run) one
at a time, and writes blog/panels/<date>[-<tag>].json plus a .md summary.

Per prompt: whether alluringplasticsurgery.com is cited and at which ranks,
the other domains, whether the answer text refers to Alluring (by name or by
a [n] marker pointing at an Alluring citation), every answer line/sentence
about Alluring verbatim with the prices in it, and flags where that wording
contradicts the truths block of the prompts file (prices, one surgeon,
never ABPS / double board / 5,000+ / AAAASF). The titles and snippets
Perplexity holds for Alluring pages are checked against the same truths
(source "index"), because a stale indexed title is what answers repeat.

Tallies: by group, brand vs non-brand, by procedure and overall; the most
cited domains (by prompts and by citation slots); Alluring pages cited by
type (procedure / blog_2026 / blog_root / site); and a comparison line
against the newest earlier blog/panels/YYYY-MM-DD.json, on the prompts the
two runs share (matched by prompt text).

The API key is PERPLEXITY_API_KEY from the environment, else the LAST
matching line of apps/admin/.env (dotenv semantics). It is never printed.
On HTTP 429 the call is retried once after 10 s; other errors are recorded
on the prompt and the run continues. Exit 0 when at least one call worked
(1 = config error, 2 = every call failed, 3 = --fail-on-flags and an
error-severity flag was raised).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[2]
DEFAULT_PROMPTS = REPO / 'blog' / 'tools' / 'ai-panel-prompts.json'
DEFAULT_OUT = REPO / 'blog' / 'panels'
ENV_FILE = REPO / 'apps' / 'admin' / '.env'
COST_PER_CALL = 0.005  # usage.cost.total_cost was $0.0037-0.0045 per call on 2026-10-07
PANEL_FILE_RX = re.compile(r'^\d{4}-\d{2}-\d{2}\.json$')
SITE_DOMAIN = 'alluringplasticsurgery.com'


# ── setup ────────────────────────────────────────────────────────────────

def read_key() -> str:
    key = os.environ.get('PERPLEXITY_API_KEY', '').strip()
    if key:
        return key
    if not ENV_FILE.exists():
        sys.exit(f'config: {ENV_FILE} not found and PERPLEXITY_API_KEY not set')
    for line in ENV_FILE.read_text().splitlines():  # last match wins, like dotenv
        m = re.match(r'\s*(?:export\s+)?PERPLEXITY_API_KEY\s*=\s*(.*)$', line)
        if m:
            key = m.group(1).strip().strip('"').strip("'")
    if not key:
        sys.exit('config: PERPLEXITY_API_KEY missing from apps/admin/.env')
    return key


def load_config(path: Path) -> dict:
    cfg = json.loads(path.read_text())
    for field in ('prompts', 'truths', 'engine'):
        if field not in cfg:
            sys.exit(f'config: {path} has no "{field}"')
    seen = set()
    for p in cfg['prompts']:
        for f in ('n', 'group', 'procedure', 'prompt'):
            if f not in p:
                sys.exit(f'config: prompt {p} lacks "{f}"')
        if p['n'] in seen:
            sys.exit(f'config: duplicate prompt n={p["n"]}')
        seen.add(p['n'])
    return cfg


def blog_root_paths(cfg: dict) -> set[str] | None:
    """Root-level blog post paths (pre-2026 posts live at /slug) from the live sitemap."""
    url = cfg.get('site', {}).get('blogSitemap')
    if not url:
        return None
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            xml = r.read().decode('utf-8', 'replace')
    except Exception:
        return None
    paths = set()
    for block in re.findall(r'<url>(.*?)</url>', xml, flags=re.S):
        m = re.search(r'<loc>([^<]+)</loc>', block)
        if m:
            p = urlparse(m.group(1).strip()).path.rstrip('/') or '/'
            if not p.startswith('/blog'):
                paths.add(p)
    return paths


# ── Perplexity ───────────────────────────────────────────────────────────

def ask(key: str, engine: dict, prompt: str) -> tuple[int, dict]:
    body = json.dumps({
        'model': engine.get('model', 'sonar'),
        'messages': [{'role': 'user', 'content': prompt}],
        'return_citations': engine.get('return_citations', True),
        'return_related_questions': engine.get('return_related_questions', False),
    }).encode()
    req = urllib.request.Request(
        engine.get('endpoint', 'https://api.perplexity.ai/chat/completions'), data=body,
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {'error': e.read().decode(errors='replace')[:500]}
    except Exception as e:  # network, timeout, bad JSON
        return 0, {'error': repr(e)[:500]}


# ── parsing ──────────────────────────────────────────────────────────────

def domain_of(url: str) -> str:
    host = (urlparse(url).hostname or '').lower()
    return host[4:] if host.startswith('www.') else host


def is_alluring(url: str) -> bool:
    d = domain_of(url)
    return d == SITE_DOMAIN or d.endswith('.' + SITE_DOMAIN)


def page_type(path: str, root_posts: set[str] | None) -> str:
    if path.startswith('/procedures/'):
        return 'procedure'
    if path.startswith('/blog/') and path.count('/') == 2 and not path.startswith('/blog/page/'):
        return 'blog_2026'
    if root_posts is not None and path in root_posts:
        return 'blog_root'
    return 'site'


def units(text: str) -> list[str]:
    """Answer split into lines, and prose lines into sentences. Table rows stay whole."""
    out = []
    for line in text.splitlines():
        line = line.strip()
        if not line or re.fullmatch(r'[|\-:\s]+', line):
            continue
        if line.startswith('|'):
            out.append(line)
            continue
        for s in re.split(r'(?<=[.!?])\s+(?=[A-Z¿¡*"“(])', line):
            if s.strip():
                out.append(s.strip())
    return out


def refs(unit: str) -> set[int]:
    found = set()
    for grp in re.findall(r'\[(\d+(?:\s*[,–-]\s*\d+)*)\]', unit):
        for part in re.split(r'\s*,\s*', grp):
            if re.search(r'[–-]', part):
                a, b = re.split(r'\s*[–-]\s*', part)[:2]
                found.update(range(int(a), int(b) + 1))
            else:
                found.add(int(part))
    return found


NAME_RX = re.compile(r'alluring|karlinsk', re.I)
CONTEXT_RX = re.compile(r"^(?:[-*•]\s*|\d+\.\s*)?(?:\*\*)?(?:the practice|this practice|the clinic|its |her |she |their |they |the surgeon|la pr[aá]ctica|la cl[ií]nica|su |ella )", re.I)
MARKET_RX = re.compile(r"clinics|practices|providers|surgeons in miami|some |many |typically|average|range|varies|vary|algunas|cl[ií]nicas|promedio|suele", re.I)


def other_provider(unit: str) -> bool:
    """A bold name or a "Dr. X" that is not Alluring/Karlinsky: the unit is about someone else."""
    for b in re.findall(r'\*\*([^*]{3,80})\*\*', unit):
        if re.search(r'[A-Z]', b) and not NAME_RX.search(b) and re.search(r'surgery|surgical|aesthetic|cosmetic|clinic|plastic|md\b|dr\.?', b, re.I):
            return True
    return any(n.lower() not in ('karlinsky', 'victoria') for n in re.findall(r'\bDr\.?\s+([A-Z][A-Za-z\'-]+)', unit))


MONEY_RX = re.compile(r'\$\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*([kK]\b)?')
RECURRING_RX = re.compile(r'^\s*(?:/\s*(?:week|wk|mo|month)|per (?:week|month)|a (?:week|month)|weekly|monthly|/\s*mes|al mes|por mes|semanal)', re.I)


def amounts(unit: str) -> list[dict]:
    out = []
    for m in MONEY_RX.finditer(unit):
        val = float(m.group(1).replace(',', ''))
        if m.group(2):
            val *= 1000
        out.append({'text': m.group(0).strip(), 'value': int(round(val)), 'pos': m.start(),
                    'recurring': bool(RECURRING_RX.match(unit[m.end():m.end() + 14]))})
    return out


def check_unit(unit: str, via: set[str], prompt_proc: str, truths: dict) -> list[dict]:
    """Flags for one answer unit (or index title/snippet) attributed to Alluring."""
    flags = []
    low = unit.lower()
    named = bool(via & {'name', 'context', 'index'})
    advice = re.search(truths.get('abpsAdvicePattern', r'$^'), low)
    for c in truths['claims']:
        if not re.search(c['pattern'], low):
            continue
        if c.get('requires') and c['requires'] not in low:
            continue
        if c['code'] == 'abps' and advice:
            continue  # "verify ABPS certification" is advice, tallied as abps_in_answer
        sev = c['severity'] if named else 'warn'
        flags.append({'code': c['code'], 'severity': sev, 'why': c['why']})
    # surgeon: any other "Dr. X" in a sentence about Alluring
    allowed = {n.lower() for n in truths['surgeon'].get('allowedNames', [])}
    for nm in re.findall(r'\bDr\.?\s+([A-Z][A-Za-z\'-]+)', unit):
        if nm.lower() not in allowed:
            flags.append({'code': 'other-surgeon-name', 'severity': 'warn',
                          'why': f'Names "Dr. {nm}" in a statement about Alluring; the only surgeon is {truths["surgeon"]["name"]}.'})
    # prices
    prices = truths['prices']
    order = truths.get('procedureOrder') or [k for k in prices if not k.startswith('_')]
    hits = []
    for proc in order:
        for m in re.finditer(prices[proc]['match'], low):
            hits.append((m.start(), proc))
    hits.sort()
    mentioned = {p for _, p in hits} | ({prompt_proc} if prompt_proc in prices else set())
    for a in amounts(unit):
        if a['recurring']:
            flags.append({'code': 'financing-figure', 'severity': 'warn', 'amount': a['text'],
                          'why': 'A weekly/monthly financing figure attributed to Alluring; the site quotes none.'})
            continue
        if a['value'] < 300 or not mentioned:
            continue
        before = [p for pos, p in hits if pos <= a['pos']]
        nearest = before[-1] if before else (hits[0][1] if hits else prompt_proc)
        ok_any = any(a['value'] in prices[p]['allowed'] for p in mentioned if p in prices)
        if ok_any:
            continue
        if nearest in prices and a['value'] in prices[nearest].get('retired', []):
            flags.append({'code': 'retired-price', 'severity': 'error' if named else 'warn', 'amount': a['text'],
                          'procedure': nearest, 'why': f'{a["text"]} is a retired {nearest} price; current: '
                          + ', '.join(f'${v:,}' for v in prices[nearest]['allowed'])})
        else:
            flags.append({'code': 'price-unverified', 'severity': 'warn', 'amount': a['text'], 'procedure': nearest,
                          'why': f'{a["text"]} is not on the {nearest} price list ('
                          + ', '.join(f'${v:,}' for v in prices.get(nearest, {}).get('allowed', [])) + ')'})
    return flags


def parse(p: dict, status: int, resp: dict, ran_at: str, truths: dict, root_posts) -> dict:
    row = {k: p.get(k) for k in ('n', 'group', 'brand', 'procedure', 'lang', 'prompt')}
    row.update({'status': status, 'ran_at': ran_at})
    if status != 200 or 'choices' not in resp:
        row.update({'error': resp.get('error', f'status {status}'), 'cited': None})
        return row
    answer = resp['choices'][0]['message']['content'] or ''
    cites = resp.get('citations') or [r.get('url') for r in resp.get('search_results') or []]
    results = {r.get('url'): r for r in resp.get('search_results') or []}
    all_idx = {i for i, u in enumerate(cites, 1) if is_alluring(u)}

    alluring = []
    for i, u in enumerate(cites, 1):
        if i in all_idx:
            path = urlparse(u).path.rstrip('/') or '/'
            alluring.append({'rank': i, 'url': u, 'path': path, 'type': page_type(path, root_posts)})
    other = Counter(domain_of(u) for u in cites if not is_alluring(u))
    other_ranks = defaultdict(list)
    for i, u in enumerate(cites, 1):
        if not is_alluring(u):
            other_ranks[domain_of(u)].append(i)

    statements, flags = [], []
    bracket_hit = named = False
    context = False  # the previous unit was about Alluring, so "The practice…" / "Her…" still is
    for u in units(answer):
        via = set()
        if NAME_RX.search(u):
            via.add('name'); named = True
        if CONTEXT_RX.match(u) and (context or p.get('brand')):
            via.add('context')
        cited = refs(u)
        if cited & all_idx:
            via.add('citation'); bracket_hit = True
        context = bool(via & {'name', 'context'})
        if not via:
            continue
        # A sentence that only cites Alluring among others, or talks about the market or
        # another clinic, is not Alluring's claim: keep it as a statement, check nothing.
        exclusive = bool(cited) and cited <= all_idx and not MARKET_RX.search(u) and not other_provider(u)
        attributed = bool(via & {'name', 'context'}) or exclusive
        statements.append({'text': u, 'via': sorted(via), 'checked': attributed,
                           'prices': [a['text'] for a in amounts(u)]})
        if attributed:
            for f in check_unit(u, via if via & {'name', 'context'} else {'citation'}, p['procedure'], truths):
                flags.append({**f, 'source': 'answer', 'text': u})

    index = []
    for a in alluring:
        r = results.get(a['url']) or {}
        entry = {'rank': a['rank'], 'path': a['path'], 'title': r.get('title'),
                 'date': r.get('date'), 'last_updated': r.get('last_updated')}
        index.append(entry)
        for field in ('title', 'snippet'):
            txt = (r.get(field) or '').strip()
            if txt:
                for f in check_unit(txt, {'index'}, p['procedure'], truths):
                    flags.append({**f, 'source': f'index-{field}', 'path': a['path'], 'text': txt[:300]})

    seen, unique = set(), []
    for f in flags:
        k = (f['code'], f['source'], f.get('path'), f.get('amount'), f['text'][:160])
        if k not in seen:
            seen.add(k); unique.append(f)
    flags = unique

    row.update({
        'cited': bool(alluring),
        'best_rank': min((a['rank'] for a in alluring), default=None),
        'alluring_citations': alluring,
        'other_domains': [{'domain': d, 'count': c, 'ranks': other_ranks[d]} for d, c in other.most_common()],
        'referenced_in_text': bracket_hit or named,
        'cited_in_text': bracket_hit,
        'named_in_answer': named,
        'abps_in_answer': bool(re.search(r'\babps\b|american board of plastic surgery', answer, re.I)),
        'alluring_statements': statements,
        'flags': flags,
        'alluring_index': index,
        'answer': answer,
        'citations': cites,
        'usage': resp.get('usage'),
        'model': resp.get('model'),
    })
    return row


# ── tallies, comparison, report ──────────────────────────────────────────

def rate(rows: list[dict], key='cited') -> dict:
    ok = [r for r in rows if r.get('cited') is not None]
    n = sum(1 for r in ok if r.get(key))
    return {'hit': n, 'of': len(ok), 'pct': round(100 * n / len(ok)) if ok else None}


def fmt(r: dict) -> str:
    return f"{r['hit']}/{r['of']}" + (f" ({r['pct']}%)" if r['of'] else '')


def tally(rows: list[dict]) -> dict:
    ok = [r for r in rows if r.get('cited') is not None]
    for r in ok:
        r['rank1'] = r.get('best_rank') == 1
    groups = sorted({r['group'] for r in ok})
    procs = sorted({r['procedure'] for r in ok})
    by_prompts, by_slots = Counter(), Counter()
    for r in ok:
        doms = [domain_of(u) for u in r['citations']]
        by_slots.update(doms)
        by_prompts.update(set(doms))
    pages, types = Counter(), Counter()
    for r in ok:
        for a in r['alluring_citations']:
            pages[a['path']] += 1
            types[a['type']] += 1
    flags = [f for r in ok for f in r['flags']]
    return {
        'overall': rate(ok), 'non_brand': rate([r for r in ok if not r.get('brand')]),
        'brand': rate([r for r in ok if r.get('brand')]),
        'by_group': {g: rate([r for r in ok if r['group'] == g]) for g in groups},
        'by_group_non_brand': {g: rate([r for r in ok if r['group'] == g and not r.get('brand')]) for g in groups},
        'by_procedure_non_brand': {p: rate([r for r in ok if r['procedure'] == p and not r.get('brand')]) for p in procs},
        'referenced_in_text': rate(ok, 'referenced_in_text'),
        'named_in_answer': rate(ok, 'named_in_answer'),
        'rank1': rate(ok, 'rank1'),
        'best_rank_distribution': dict(sorted(Counter(str(r['best_rank'] or 'not_cited') for r in ok).items())),
        'abps_in_answer': rate(ok, 'abps_in_answer'),
        'most_cited_domains_by_prompts': by_prompts.most_common(15),
        'most_cited_domains_by_slots': by_slots.most_common(15),
        'alluring_citations_by_type': dict(types.most_common()),
        'alluring_pages_cited': pages.most_common(),
        'flags': {'error': sum(f['severity'] == 'error' for f in flags),
                  'warn': sum(f['severity'] == 'warn' for f in flags),
                  'by_code': dict(Counter(f['code'] for f in flags).most_common())},
        'errors': sum(1 for r in rows if r.get('cited') is None),
    }


def find_previous(out_dir: Path, date: str, exclude: Path) -> Path | None:
    cands = sorted(p for p in out_dir.glob('*.json')
                   if PANEL_FILE_RX.match(p.name) and p.stem < date and p.resolve() != exclude.resolve())
    if not cands:  # same-day rerun: compare with the same date's untagged file
        same = out_dir / f'{date}.json'
        if same.exists() and same.resolve() != exclude.resolve():
            return same
    return cands[-1] if cands else None


def compare(rows: list[dict], prev_path: Path, version: str | None) -> dict:
    prev = json.loads(prev_path.read_text())
    prev_rows = {r['prompt']: r for r in prev['rows'] if r.get('cited') is not None}
    now_rows = {r['prompt']: r for r in rows if r.get('cited') is not None}
    shared = [k for k in now_rows if k in prev_rows]
    pr = [prev_rows[k] for k in shared]
    nr = [now_rows[k] for k in shared]
    gained = [now_rows[k]['n'] for k in shared if now_rows[k]['cited'] and not prev_rows[k]['cited']]
    lost = [now_rows[k]['n'] for k in shared if prev_rows[k]['cited'] and not now_rows[k]['cited']]
    a, b = rate(pr), rate(nr)
    a_nb, b_nb = rate([r for r in pr if not r.get('brand')]), rate([r for r in nr if not r.get('brand')])
    groups = sorted({r['group'] for r in nr})
    g = {x: (rate([r for r in pr if r['group'] == x]), rate([r for r in nr if r['group'] == x])) for x in groups}
    pf = sum(f['severity'] == 'error' for r in pr for f in r.get('flags', []))
    nf = sum(f['severity'] == 'error' for r in nr for f in r.get('flags', []))
    line = (f"vs {prev_path.stem} on {len(shared)} shared prompts: cited {fmt(a)} → {fmt(b)}"
            f" ({b['hit'] - a['hit']:+d}); non-brand {fmt(a_nb)} → {fmt(b_nb)}; "
            + '; '.join(f"{x} {v[0]['hit']}/{v[0]['of']} → {v[1]['hit']}/{v[1]['of']}" for x, v in g.items())
            + f"; rank 1 {rate(pr, 'rank1')['hit']} → {rate(nr, 'rank1')['hit']}; error flags {pf} → {nf}"
            + (f"; gained #{', #'.join(map(str, gained))}" if gained else '')
            + (f"; lost #{', #'.join(map(str, lost))}" if lost else ''))
    if prev.get('run', {}).get('prompts_version') != version:
        line += ' (prompt files differ in version; compared on shared prompt text only)'
    return {'previous_file': rel(prev_path),
            'shared_prompts': len(shared), 'gained': gained, 'lost': lost, 'line': line}


def rel(p: Path) -> str:
    p = p.resolve()
    return str(p.relative_to(REPO)) if p.is_relative_to(REPO) else str(p)


def md_escape(s: str) -> str:
    return s.replace('|', '\\|').replace('\n', ' ')


def report(doc: dict) -> str:
    t, run = doc['tallies'], doc['run']
    L = [f"# AI citation panel, {run['date']}" + (f" ({run['tag']})" if run.get('tag') else ''), '',
         f"Perplexity `{run['model']}`, {run['prompts']} prompts, run {run['started']} → {run['finished']}"
         f" ({run['source']}). Errors: {t['errors']}. 429 retries: {run['retries_429']}. API cost: ${run.get('cost_usd', 0):.3f}.", '']
    if doc.get('comparison'):
        L += [f"**Comparison:** {doc['comparison']['line']}", '']
    else:
        L += ['**Comparison:** no earlier blog/panels/YYYY-MM-DD.json to compare with.', '']
    L += ['## Citation rate', '', '| Slice | Cited |', '| --- | --- |',
          f"| All | {fmt(t['overall'])} |", f"| Non-brand | {fmt(t['non_brand'])} |", f"| Brand | {fmt(t['brand'])} |"]
    L += [f"| {g} | {fmt(v)} |" for g, v in t['by_group'].items()]
    L += [f"| Referenced in answer text | {fmt(t['referenced_in_text'])} |",
          f"| Named (Alluring / Karlinsky) | {fmt(t['named_in_answer'])} |",
          f"| Alluring is citation #1 | {fmt(t['rank1'])} |",
          f"| Answer mentions ABPS | {fmt(t['abps_in_answer'])} |", '']
    L += ['Non-brand by procedure: ' + ', '.join(f"{p} {fmt(v)}" for p, v in t['by_procedure_non_brand'].items()), '']
    L += ['## Prompts', '', '| # | Group | Procedure | Prompt | Cited | Best rank | Alluring pages | In text | Flags |',
          '| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for r in doc['rows']:
        if r.get('cited') is None:
            L.append(f"| {r['n']} | {r['group']} | {r['procedure']} | {md_escape(r['prompt'])} | ERROR {r['status']} | | | | |")
            continue
        pages = ', '.join(f"{a['path']} (#{a['rank']})" for a in r['alluring_citations']) or '—'
        fl = ', '.join(sorted({f"{f['code']}:{f['severity']}" for f in r['flags']})) or '—'
        txt = 'named' if r['named_in_answer'] else ('[n]' if r['cited_in_text'] else 'no')
        L.append(f"| {r['n']} | {r['group']}{' (brand)' if r.get('brand') else ''} | {r['procedure']} | {md_escape(r['prompt'])} | "
                 f"{'yes' if r['cited'] else 'no'} | {r['best_rank'] or '—'} | {pages} | {txt} | {fl} |")
    L += ['', '## Flags', '']
    any_flag = False
    for r in doc['rows']:
        for f in r.get('flags', []):
            any_flag = True
            where = f['source'] + (f" {f['path']}" if f.get('path') else '')
            L.append(f"- **#{r['n']} {f['code']}** ({f['severity']}, {where}): {f['why']}  \n  > {md_escape(f['text'][:400])}")
    if not any_flag:
        L.append('None.')
    L += ['', '## What the answers say about Alluring', '']
    for r in doc['rows']:
        for s in r.get('alluring_statements', []):
            if s['prices'] or 'name' in s['via']:
                L.append(f"- #{r['n']} ({'/'.join(s['via'])}): {md_escape(s['text'][:400])}")
    L += ['', '## Most cited domains', '', '| Domain | Prompts | Slots |', '| --- | --- | --- |']
    slots = dict(t['most_cited_domains_by_slots'])
    for d, c in t['most_cited_domains_by_prompts']:
        L.append(f"| {d} | {c} | {slots.get(d, '')} |")
    L += ['', '## Alluring pages cited', '',
          'By type: ' + (', '.join(f"{k} {v}" for k, v in t['alluring_citations_by_type'].items()) or 'none'), '']
    L += [f"- {p} × {c}" for p, c in t['alluring_pages_cited']]
    L += ['', f"Flags: {t['flags']['error']} error, {t['flags']['warn']} warn. "
          'One sonar run per prompt is one sample: Perplexity varies run to run, so read changes as direction.', '']
    return '\n'.join(L)


# ── main ─────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--prompts', type=Path, default=DEFAULT_PROMPTS)
    ap.add_argument('--out-dir', type=Path, default=DEFAULT_OUT)
    ap.add_argument('--date', default=datetime.now().astimezone().strftime('%Y-%m-%d'))
    ap.add_argument('--tag', help='suffix for the output name: <date>-<tag>.json (tagged files are never used as the comparison baseline)')
    ap.add_argument('--limit', type=int, help='first N prompts (after --only/--group)')
    ap.add_argument('--only', help='comma-separated prompt numbers, e.g. 1,5,21')
    ap.add_argument('--group', help='BUYING, INFORMATIONAL or SPANISH')
    ap.add_argument('--sleep', type=float, default=1.5, help='seconds between calls (default 1.5)')
    ap.add_argument('--from-raw', type=Path, help='parse saved responses <dir>/<n>.json instead of calling the API')
    ap.add_argument('--compare', type=Path, help='panel JSON to compare with (default: newest earlier untagged file)')
    ap.add_argument('--dry-run', action='store_true', help='print the selected prompts and cost; no calls, no files')
    ap.add_argument('--fail-on-flags', action='store_true', help='exit 3 when an error-severity flag is raised')
    args = ap.parse_args()

    cfg = load_config(args.prompts)
    prompts = cfg['prompts']
    if args.only:
        want = {int(x) for x in args.only.split(',') if x.strip()}
        prompts = [p for p in prompts if p['n'] in want]
    if args.group:
        prompts = [p for p in prompts if p['group'].upper() == args.group.upper()]
    if args.limit:
        prompts = prompts[:args.limit]
    if not prompts:
        print('no prompts selected', file=sys.stderr)
        return 1
    if args.dry_run:
        for p in prompts:
            print(f"#{p['n']:>2} {p['group']:<13} {p['procedure']:<20} {p['prompt']}")
        print(f"{len(prompts)} calls, about ${len(prompts) * COST_PER_CALL:.2f}")
        return 0

    key = None if args.from_raw else read_key()
    root_posts = blog_root_paths(cfg)
    if root_posts is None:
        print('warn: blog sitemap unreachable; root-level posts are typed "site"', file=sys.stderr)
    stem = args.date + (f'-{args.tag}' if args.tag else '')
    args.out_dir.mkdir(parents=True, exist_ok=True)
    out_json = args.out_dir / f'{stem}.json'

    rows, retries = [], 0
    started = datetime.now().astimezone().isoformat(timespec='seconds')
    for i, p in enumerate(prompts):
        if args.from_raw:
            f = args.from_raw / f"{p['n']}.json"
            if not f.exists():
                rows.append(parse(p, 0, {'error': f'missing {f}'}, '', cfg['truths'], root_posts)); continue
            raw = json.loads(f.read_text())
            if 'response' in raw:  # wrapper {n, group, prompt, status, ran_at, response}
                status, resp, ran_at = raw.get('status', 200), raw['response'], raw.get('ran_at', '')
                saved_prompt = raw.get('prompt')
            else:
                status, resp = 200, raw
                ran_at = datetime.fromtimestamp(raw.get('created', 0)).astimezone().isoformat(timespec='seconds')
                saved_prompt = (raw.get('_panel') or {}).get('prompt')
            if saved_prompt and saved_prompt != p['prompt']:
                print(f"warn: #{p['n']} saved prompt differs: {saved_prompt!r}", file=sys.stderr)
        else:
            if i:
                time.sleep(args.sleep)
            status, resp = ask(key, cfg['engine'], p['prompt'])
            if status == 429:
                retries += 1
                print(f"#{p['n']} 429, retrying once in 10 s", flush=True)
                time.sleep(10)
                status, resp = ask(key, cfg['engine'], p['prompt'])
            ran_at = datetime.now().astimezone().isoformat(timespec='seconds')
        row = parse(p, status, resp, ran_at, cfg['truths'], root_posts)
        rows.append(row)
        if row.get('cited') is None:
            print(f"#{p['n']:>2} {p['group']:<13} ERROR {status}: {str(row.get('error'))[:160]}", flush=True)
        else:
            errs = sum(f['severity'] == 'error' for f in row['flags'])
            print(f"#{p['n']:>2} {p['group']:<13} cited={'Y' if row['cited'] else 'n'} best={row['best_rank'] or '-':<2} "
                  f"text={'Y' if row['referenced_in_text'] else 'n'} flags={len(row['flags'])} (error {errs})", flush=True)
    finished = datetime.now().astimezone().isoformat(timespec='seconds')
    if args.from_raw:  # report when the saved answers were fetched, not when they were parsed
        times = sorted(r['ran_at'] for r in rows if r.get('ran_at'))
        if times:
            started, finished = times[0], times[-1]

    doc = {
        'run': {'date': args.date, 'tag': args.tag, 'started': started, 'finished': finished,
                'source': f'from-raw {args.from_raw}' if args.from_raw else 'live API',
                'model': cfg['engine'].get('model'), 'prompts': len(rows),
                'prompts_file': rel(args.prompts), 'prompts_version': cfg.get('version'),
                'retries_429': retries,
                'cost_usd': round(sum(((r.get('usage') or {}).get('cost') or {}).get('total_cost') or 0 for r in rows), 4),
                'partial': len(rows) != len(cfg['prompts'])},
        'truths_as_of': cfg['truths'].get('asOf'),
        'tallies': tally(rows),
        'comparison': None,
        'rows': rows,
    }
    prev = args.compare or find_previous(args.out_dir, args.date, out_json)
    if prev and prev.exists():
        try:
            doc['comparison'] = compare(rows, prev, cfg.get('version'))
        except Exception as e:  # an unreadable baseline must not lose the run
            print(f'warn: comparison with {prev} failed: {e!r}', file=sys.stderr)
    out_json.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    md = report(doc)
    out_json.with_suffix('.md').write_text(md)

    t = doc['tallies']
    print(f"\ncited {fmt(t['overall'])}, non-brand {fmt(t['non_brand'])}; "
          + ', '.join(f"{g} {fmt(v)}" for g, v in t['by_group'].items())
          + f"; flags {t['flags']['error']} error / {t['flags']['warn']} warn")
    if doc['comparison']:
        print(doc['comparison']['line'])
    print(f'wrote {out_json} and {out_json.with_suffix(".md")}')
    if t['errors'] == len(rows):
        return 2
    if args.fail_on_flags and t['flags']['error']:
        return 3
    return 0


if __name__ == '__main__':
    sys.exit(main())
