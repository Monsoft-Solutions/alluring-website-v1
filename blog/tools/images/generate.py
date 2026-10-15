#!/usr/bin/env python3
"""Render the images a post's meta.json asks for, with GPT Image 2.5 (Higgsfield CLI).

    python3 blog/tools/images/generate.py <slug> [<slug> ...] [--heroes-only] [--redo slug:key ...]
                                          [--work DIR] [--dry-run]
    python3 blog/tools/images/generate.py --all [...]

Generalized from the liposuction phase-2 kit (34 images, 2026-09-23). Reads
blog/posts/<slug>/meta.json "images". Heroes (type featured) get two
candidates, variants `flare` and `sunburst`; inline images one (`flare`); all
at 2k / high, so a picked candidate is the final. Each render's job JSON and
PNG land in <work>/<slug>/<key>-<variant>.{json,png} (default work dir
blog/images/work/, gitignored). Existing renders are skipped, so re-running
only renders what is missing; --redo slug:key forces one again.

An image with "reuse_url" (an image already live, kept) is not rendered.
An image's prompt is used as written; for infographics the exact
`text_in_image` is appended with an instruction to render it verbatim (proofread
it against the post afterwards, word for word). Aspect: the image's "aspect",
else 3:2 for heroes and 4:5 for inline images.

--dry-run   list the renders and the credit estimate (about 3 credits per
            2k/high render, .claude/skills/blog-post/reference/images.md); call nothing
Needs the `higgsfield` CLI on PATH and a logged-in account. Check the balance
first (the Higgsfield MCP `balance` tool) and say the estimate before rendering.
Next: pick the variants in blog/images/picks.json, then images/export_upload.mjs.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import bloglib as bl  # noqa: E402

CREDITS_PER_RENDER = 3


def prompt_for(img: dict) -> str:
    p = img['prompt'].strip()
    text = (img.get('text_in_image') or '').strip()
    if text:
        p += ('\n\nTEXT IN THE IMAGE. Render exactly these words, line by line, spelled exactly as written, '
              'and no other words, numbers or labels:\n' + text)
    return p


def main() -> int:
    ap = argparse.ArgumentParser(description='Render blog post images with GPT Image 2.5 (Higgsfield).')
    ap.add_argument('slugs', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--heroes-only', action='store_true')
    ap.add_argument('--redo', action='append', default=[], metavar='SLUG:KEY')
    ap.add_argument('--work', default=str(bl.IMAGES / 'work'))
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    slugs = bl.all_slugs() if a.all else a.slugs
    if not slugs:
        ap.print_usage(sys.stderr)
        return 2
    work = Path(a.work)
    redo = set(a.redo)

    jobs = []
    for slug in slugs:
        post = bl.load_post(slug)
        for img in post.meta.get('images') or []:
            if a.heroes_only and img.get('type') != 'featured':
                continue
            if img.get('reuse_url') is not None:
                print(f'  {slug}/{img["key"]}: reuse_url, not rendered')
                continue
            for v in (['flare', 'sunburst'] if img.get('type') == 'featured' else ['flare']):
                out = work / slug / f"{img['key']}-{v}"
                if out.with_suffix('.png').exists() and f"{slug}:{img['key']}" not in redo:
                    continue
                jobs.append((slug, img, v, out))

    print(f'{len(jobs)} render(s) queued, about {len(jobs) * CREDITS_PER_RENDER} credits; work dir {work}', flush=True)
    if a.dry_run:
        for slug, img, v, out in jobs:
            aspect = img.get('aspect') or ('3:2' if img.get('type') == 'featured' else '4:5')
            print(f'  {slug}/{img["key"]}-{v}  {img.get("type")} {aspect}  -> {out.with_suffix(".png")}')
        return 0
    if jobs and not shutil.which('higgsfield'):
        bl.die('the higgsfield CLI is not on PATH')

    def run(job):
        slug, img, variant, out = job
        out.parent.mkdir(parents=True, exist_ok=True)
        cmd = ['higgsfield', 'generate', 'create', 'gpt_image_2_5', '--prompt', prompt_for(img),
               '--aspect_ratio', img.get('aspect') or ('3:2' if img.get('type') == 'featured' else '4:5'),
               '--resolution', '2k', '--quality', 'high', '--variant', variant,
               '--wait', '--wait-timeout', '15m', '--json']
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            return f'FAIL {slug}/{img["key"]}-{variant}: {(r.stderr or r.stdout).strip()[:300]}'
        res = json.loads(r.stdout)[0]
        out.with_suffix('.json').write_text(json.dumps(res, indent=1))
        if res.get('status') != 'completed' or not res.get('result_url'):
            return f'FAIL {slug}/{img["key"]}-{variant}: status {res.get("status")}'
        urllib.request.urlretrieve(res['result_url'], out.with_suffix('.png'))
        return f'ok   {slug}/{img["key"]}-{variant}'

    failed = 0
    with ThreadPoolExecutor(max_workers=6) as pool:
        for line in pool.map(run, jobs):
            failed += line.startswith('FAIL')
            print(line, flush=True)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
