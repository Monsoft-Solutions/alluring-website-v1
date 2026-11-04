#!/usr/bin/env python3
"""Render the images a post's meta.json asks for, with GPT Image 2.5 on fal.

    python3 blog/tools/images/generate.py <slug> [<slug> ...] [--heroes-only] [--redo slug:key ...]
                                          [--work DIR] [--dry-run]
    python3 blog/tools/images/generate.py --all [...]

Generalized from the liposuction phase-2 kit (34 images, 2026-09-23). Reads
blog/posts/<slug>/meta.json "images". Heroes (type featured) get two
candidates, variants `flare` and `sunburst`; inline images one (`flare`); all
at high quality, so a picked candidate is the final. Each render's job JSON and
PNG land in <work>/<slug>/<key>-<variant>.{json,png} (default work dir
blog/images/work/, gitignored). The JSON holds `id` (the fal request_id),
`params.prompt`, `status`, `result_url` and `model`; export_upload.mjs reads
`id` and `params.prompt`. Existing renders are skipped, so re-running only
renders what is missing; --redo slug:key forces one again.

An image with "reuse_url" (an image already live, kept) is not rendered.
An image's prompt is used as written; for infographics the exact
`text_in_image` is appended with an instruction to render it verbatim (proofread
it against the post afterwards, word for word). Aspect: the image's "aspect",
else 3:2 for heroes and 4:5 for inline images. 3:2, 4:5, 1:1 and 16:9 are
supported; any other fails before anything is rendered.

--dry-run   list the renders and the cost estimate (about $0.25 per render, an
            estimate; .claude/skills/blog-post/reference/images.md); call nothing
Calls fal's queue REST API with FAL_KEY from apps/admin/.env (last matching
line wins; the key is never printed). Runs up to 6 at once, polls each for up to
15 minutes and retries a 429 or a 5xx twice. Say the estimate before rendering.
Next: pick the variants in blog/images/picks.json, then images/export_upload.mjs.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import bloglib as bl  # noqa: E402

COST_PER_RENDER = 0.25
QUEUE = 'https://queue.fal.run'
MAX_WORKERS = 6
POLL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 15 * 60
RETRIES = 2
RETRY_WAIT_SECONDS = 5
# fal wants both sides as multiples of 16, so 16:9 is 1920x1088, not 1080.
IMAGE_SIZES = {
    '3:2': (1536, 1024),
    '4:5': (1280, 1600),
    '1:1': (1280, 1280),
    '16:9': (1920, 1088),
}


def endpoint_for(variant: str) -> str:
    return f'openai/gpt-image-2.5/{variant}/text-to-image'


def aspect_of(img: dict) -> str:
    return img.get('aspect') or ('3:2' if img.get('type') == 'featured' else '4:5')


def fal_key() -> str:
    """FAL_KEY from apps/admin/.env, last matching line. Never print it."""
    env = bl.REPO / 'apps' / 'admin' / '.env'
    value = ''
    if env.exists():
        for line in env.read_text().splitlines():
            m = re.match(r'\s*(?:export\s+)?FAL_KEY\s*=\s*(.*)$', line)
            if m:
                value = m.group(1).strip().strip('"\'')
    if not value:
        bl.die(f'FAL_KEY not found in {env}')
    return value


def request(url: str, key: str | None = None, body: dict | None = None) -> bytes:
    """GET, or POST with a JSON body. Retries a 429, a 5xx or a dropped connection."""
    headers = {'User-Agent': 'alluring-blog-kit'}
    if key:
        headers['Authorization'] = f'Key {key}'
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    for attempt in range(RETRIES + 1):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=120) as res:
                return res.read()
        except urllib.error.HTTPError as err:
            if attempt < RETRIES and (err.code == 429 or err.code >= 500):
                time.sleep(RETRY_WAIT_SECONDS * (attempt + 1))
                continue
            detail = err.read().decode('utf8', 'replace').strip()[:300]
            raise RuntimeError(f'HTTP {err.code}: {detail}') from None
        except urllib.error.URLError as err:
            if attempt < RETRIES:
                time.sleep(RETRY_WAIT_SECONDS * (attempt + 1))
                continue
            raise RuntimeError(f'network error: {err.reason}') from None
    raise AssertionError('unreachable')


def render(key: str, prompt: str, variant: str, aspect: str, out: Path) -> str:
    """One render through the queue: submit, poll, save the job JSON, then the PNG."""
    model = endpoint_for(variant)
    width, height = IMAGE_SIZES[aspect]
    params = {
        'prompt': prompt,
        'image_size': {'width': width, 'height': height},
        'quality': 'high',
        'output_format': 'png',
        'num_images': 1,
    }
    queued = json.loads(request(f'{QUEUE}/{model}', key, params))
    request_id = queued['request_id']
    # The queue hands back its own URLs; use them rather than rebuilding them.
    status_url = queued.get('status_url') or f'{QUEUE}/{model}/requests/{request_id}/status'
    response_url = queued.get('response_url') or f'{QUEUE}/{model}/requests/{request_id}'

    deadline = time.monotonic() + POLL_TIMEOUT_SECONDS
    while True:
        status = json.loads(request(status_url, key)).get('status')
        if status == 'COMPLETED':
            break
        if time.monotonic() > deadline:
            raise RuntimeError(f'still {status} after {POLL_TIMEOUT_SECONDS // 60} minutes (request {request_id})')
        time.sleep(POLL_SECONDS)

    # A rejected prompt reports COMPLETED and answers here with an error, which raises.
    images = json.loads(request(response_url, key)).get('images') or []
    if not images or not images[0].get('url'):
        raise RuntimeError(f'no image in the result (request {request_id})')
    result_url = images[0]['url']
    job = {
        'id': request_id,
        'model': model,
        'status': 'completed',
        'result_url': result_url,
        'params': params,
    }
    out.with_suffix('.json').write_text(json.dumps(job, indent=1))
    out.with_suffix('.png').write_bytes(request(result_url))
    return request_id


def prompt_for(img: dict) -> str:
    p = img['prompt'].strip()
    text = (img.get('text_in_image') or '').strip()
    if text:
        p += ('\n\nTEXT IN THE IMAGE. Render exactly these words, line by line, spelled exactly as written, '
              'and no other words, numbers or labels:\n' + text)
    return p


def main() -> int:
    ap = argparse.ArgumentParser(description='Render blog post images with GPT Image 2.5 on fal.')
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
                if aspect_of(img) not in IMAGE_SIZES:
                    bl.die(f"{slug}/{img['key']}: aspect {aspect_of(img)} is not one of {', '.join(IMAGE_SIZES)}")
                out = work / slug / f"{img['key']}-{v}"
                if out.with_suffix('.png').exists() and f"{slug}:{img['key']}" not in redo:
                    continue
                jobs.append((slug, img, v, out))

    print(f'{len(jobs)} render(s) queued, about ${len(jobs) * COST_PER_RENDER:.2f} (estimate); work dir {work}', flush=True)
    if a.dry_run:
        for slug, img, v, out in jobs:
            print(f'  {slug}/{img["key"]}-{v}  {img.get("type")} {aspect_of(img)}  -> {out.with_suffix(".png")}')
        return 0
    key = fal_key() if jobs else ''

    def run(job):
        slug, img, variant, out = job
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            render(key, prompt_for(img), variant, aspect_of(img), out)
        except (RuntimeError, ValueError, KeyError) as err:
            return f'FAIL {slug}/{img["key"]}-{variant}: {err}'
        return f'ok   {slug}/{img["key"]}-{variant}'

    failed = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        for line in pool.map(run, jobs):
            failed += line.startswith('FAIL')
            print(line, flush=True)
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
