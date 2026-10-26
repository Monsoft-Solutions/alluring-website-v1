#!/usr/bin/env python3
"""Lint blog posts against the writing standard and the claims sweep.

    python3 blog/tools/check_post.py <slug> [<slug> ...] [--db URL|local] [--final]
                                     [--manifest PATH] [--no-mdx] [--json]
    python3 blog/tools/check_post.py --all [--db URL|local]

Reads blog/posts/<slug>/{content.md,meta.json}. Exit 0 when every post passes,
1 when any post has a problem (warnings never fail), 2 on a usage error.

--db       Where live posts, categories and tags come from: a postgres URL,
           `local` (POSTGRES_URL in packages/db/.env.local) or `env:NAME`.
           Without it, live post URLs come from the live blog sitemap and
           categories/tags/gallery pages are not checked.
--final    Images must be uploaded: every IMAGE:key resolves through the
           manifest and none is left. Without it, placeholders are fine.
--manifest The image manifest (default blog/images/manifest.json).
--no-mdx   Skip packages/ai validateGeneratedMdx (it runs through tsx).
--json     Machine-readable output.

What fails a post (writing-standard.md, compliance.md):
  title > 60, meta description > 155, excerpt > 320; quick answer not
  "Question?\\n\\nAnswer" or outside 40–65 words; primary keyword > 100 or
  empty; secondary keywords outside 8–16; an H1; no opening H2 question; no
  "## Frequently asked questions" with 4–9 "### Q?" entries of 30–80 words in
  one paragraph; "## Sources" not last, or a body domain missing from it; bold
  outside list lead-ins; { } in prose; any HTML comment but one valid
  <!-- CTA:id --> (and it must match meta.json cta); a component other than
  Figure/CalloutBox; unbalanced CalloutBox; an unknown, folded (redirect
  source), self or wrong-form internal link; an unknown procedure-page anchor;
  fewer than two links to the cluster's procedure page; a banned source
  domain, in the body, the Sources list or meta.json sources[]; no table in a
  recovery or comparison post; image rules (one featured, alt and prompt set,
  inline images placed, infographic figures in the alt and stated in the
  post; with --final, every image uploaded or reused); Alluring named in the
  opening answer; the claims sweep (credential, owner claim, "medically
  reviewed", superlative, luxury/affordable, travel or market, retired price,
  financing figure, urgency, phone, filler, the cluster's old figures) over the
  body, title, meta, excerpt, quick answer, image alt and image text, plus a
  lighter sweep of the Sources list; a hit on a `fail` rule of the claims
  canon (docs/claims/canon.md §11, read from
  packages/shared/src/claims/patterns.data.json) that the sweep doesn't already
  report, with its review rules as warnings; a claim token that would render as
  nothing (lib/claims_check.mjs, or the token grammar of
  packages/shared/src/claims/tokens.ts when node can't run) or an Alluring
  price typed instead of a token; a $ figure in neither the cluster's facts
  file nor a quote verified against docs/pricing/practice-price-list.md; a
  practice price whose paragraph, list or table doesn't say the surgeon
  confirms it at consultation; with --final, a source whose read_on is not a
  date, is in the future or is more than 30 days old (a warning without
  --final); for "new" posts, a slug collision, a slug already in the
  database, a gate verdict other than "new", or a bad published_at; for
  "rewrite" posts, a slug that is not live, or a gate (gate.mjs --from) that
  doesn't say refresh with this post as the owner, or names a secondary
  keyword or owned query another page owns; and any change
  validateGeneratedMdx would make.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'lib'))
import bloglib as bl  # noqa: E402
import checks  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description='Lint blog posts (blog/posts/<slug>).')
    ap.add_argument('slugs', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--db')
    ap.add_argument('--final', action='store_true')
    ap.add_argument('--manifest')
    ap.add_argument('--no-mdx', action='store_true')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()

    slugs = bl.all_slugs() if a.all else a.slugs
    if not slugs:
        ap.print_usage(sys.stderr)
        return 2
    db = bl.resolve_db(a.db)
    if db and not bl.is_local_db(db):
        print(f'note: reading a remote database ({bl.describe_db(db)}); reads only', file=sys.stderr)
    posts = [bl.load_post(s) for s in slugs]
    manifest = bl.load_manifest(Path(a.manifest) if a.manifest else None)
    ctx = checks.make_ctx(db, {p.slug: p.mode for p in posts}, manifest)

    results = [checks.check(p, ctx, final=a.final) for p in posts]

    mdx = None
    if not a.no_mdx:
        bodies = {}
        for p in posts:
            body, _, _ = bl.apply_images(p, [], placeholder_ok=True)
            bodies[p.slug] = bl.PLACEHOLDER_RX.sub('https://example.public.blob.vercel-storage.com/x.jpg', body)
        mdx = checks.mdx_validate(bodies)
        for r in results:
            if mdx is None:
                r.warnings.append('validateGeneratedMdx did not run (node + tsx); rerun or pass --no-mdx')
            elif not mdx[r.slug]['clean']:
                r.problems.extend(f'MDX: {x["kind"]}: {x["detail"]}' for x in mdx[r.slug]['actions'])
            else:
                r.info['mdx'] = 'clean'

    # validateGeneratedMdx checks the body's claim tokens. When it didn't run,
    # check at least their grammar (packages/shared/src/claims/tokens.ts).
    if mdx is None:
        for p, r in zip(posts, results):
            body, _, _ = bl.apply_images(p, [], placeholder_ok=True)
            r.problems.extend(bl.token_shape_problems('content', body))

    if a.json:
        print(json.dumps({'source': ctx.published_from, 'posts': [r.__dict__ for r in results]}, indent=1))
    else:
        print(f'live posts from {ctx.published_from}; {len(ctx.published)} live posts, '
              f'{len(ctx.redirects)} redirect sources, manifest {len(manifest)} images')
        for r in results:
            status = 'FAIL' if r.problems else 'ok'
            facts = ', '.join(f'{k}={v}' for k, v in r.info.items())
            print(f'\n[{status}] {r.slug}  {facts}')
            for x in r.problems:
                print(f'  PROBLEM  {x}')
            for x in r.warnings:
                print(f'  warning  {x}')
        bad = sum(1 for r in results if r.problems)
        print(f'\n{len(results) - bad} of {len(results)} post(s) pass' + (f'; {bad} fail' if bad else ''))
    return 1 if any(r.problems for r in results) else 0


if __name__ == '__main__':
    sys.exit(main())
