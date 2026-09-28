"""Build the #309 blog SQL from a snapshot of the two posts.

Usage: python3 build_sql.py snapshot sql/blog-prices-claims.sql

The snapshot dir holds <slug>.prod.json (row_to_json of the blog_post row).
Every replacement must match exactly once, or the build stops. The SQL
guards each UPDATE on the md5 of the snapshot's content, so it refuses to
run against a post that changed since the snapshot.

content_updated_at is left to the trigger: both edits are real revisions
(prices corrected, one post re-scoped), so lastmod should move.
"""

import hashlib
import json
import os
import sys

snap_dir, out_path = sys.argv[1], sys.argv[2]


def load(slug):
    with open(f'{snap_dir}/{slug}.prod.json') as f:
        return json.load(f)


def apply(text, pairs, label):
    for old, new in pairs:
        n = text.count(old)
        if n != 1:
            raise SystemExit(f'{label}: expected 1 match, got {n}: {old[:90]!r}')
        text = text.replace(old, new)
    return text


def faq_apply(faqs, pairs, label, drop=()):
    out = []
    for item in faqs:
        if item['question'] in drop:
            continue
        a = item['answer']
        for old, new in pairs:
            if old in a:
                a = a.replace(old, new)
        out.append({'answer': a, 'question': item['question']})
    for old, _ in pairs:
        if not any(old in i['answer'] for i in faqs):
            raise SystemExit(f'{label} faqs: no match for {old[:80]!r}')
    return out


def q(s):
    tag = '$b309$'
    assert tag not in s
    return f'{tag}{s}{tag}'


MM_PRICE = (
    'At Alluring a mommy makeover is priced from its parts: a tummy tuck '
    'from $3,000, breast augmentation from $3,500 and a breast lift from '
    '$5,000, with $500 off for two procedures and $1,000 off for three.'
)

# ── /blog/tummy-tuck-mommy-makeover-miami: re-scoped to the comparison (D3) ──
tt = load('tummy-tuck-mommy-makeover-miami')
tt_img = (
    '![Premium split-concept hero image: elegant Miami-inspired background '
    'with subtle labeled silhouettes/contour zones (abdomen-only vs full '
    'makeover: abdomen + breasts + lipo) in stone tones with gold accents]'
    '(https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/blog-images/'
    '9d6e6e5f-95ef-4104-aff0-2acb9737acd6/1768870327861-o4k6sc-0.jpg)'
)
invest_start = tt['content'].index('## Your Investment in Post-Pregnancy Transformation')
invest_end = tt['content'].index('## Why Choose Alluring Plastic Surgery in Miami?')
invest_old = tt['content'][invest_start:invest_end]
fin_img = invest_old[invest_old.index('![Luxury consultation'):]
fin_img = fin_img[: fin_img.index(')') + 1]
cost_faq_start = tt['content'].index('### How much do tummy tuck and mommy makeover cost in Miami?')
cost_faq_end = tt['content'].index('### Can a tummy tuck be part of a mommy makeover?')

tt_content = apply(
    tt['content'],
    [
        (
            f'drawing from established medical sources\n\n{tt_img}\n\n to help you decide which suits your goals.',
            f'drawing from established medical sources to help you decide which suits your goals.\n\n{tt_img}',
        ),
        (
            '- Personalized investment details with flexible financing\n',
            "- Where to find each procedure's price\n",
        ),
        (
            'Dr. Karlinsky tailors each makeover to your unique goals, sometimes staging surgeries for safety under general anesthesia.',
            "Each plan is tailored to the patient's goals, and some plans are split into two surgeries for safety.",
        ),
        (
            invest_old,
            '## Prices and Financing\n\n'
            'Alluring publishes its prices on each procedure page. A tummy tuck is priced by type, '
            'from a mini tummy tuck to a fleur-de-lis: see the '
            '[tummy tuck prices](/procedures/tummy-tuck-miami#pricing). A mommy makeover is priced '
            'from the procedures in your plan: see '
            '[how a mommy makeover is priced](/procedures/mommy-makeover-miami#pricing).\n\n'
            f"{fin_img.replace('![Luxury consultation/financing visual', '![Consultation visual')}\n\n"
            'Financing is available through Cherry, CareCredit and United Credit, subject to credit '
            'approval. [Learn about our financing](/plastic-surgery-financing-miami).\n\n',
        ),
        (
            '[Dr. Victoria Karlinsky](https://www.americanboardcosmeticsurgery.org/doctors/victoria-karlinsky-bellini/), '
            'triple board-certified, leads our AAAASF-accredited facility with over 15 years of experience.',
            'Every tummy tuck and mommy makeover at Alluring is performed by one surgeon, '
            '[Victoria Karlinsky, MD, FACS](/dr-karlinsky). She is board certified in general surgery '
            'by the American Board of Surgery and is a Fellow of the American College of Surgeons.',
        ),
        (
            'Discuss your options with our board-certified team for personalization.',
            'Discuss your options with Dr. Karlinsky at a free consultation.',
        ),
        (' These risks are minimized by board-certified surgeons in accredited facilities.', ''),
        (tt['content'][cost_faq_start:cost_faq_end], ''),
        (
            "Dr. Victoria Karlinsky's expertise in our AAAASF-accredited facility has earned consistent 5-star patient reviews over more than 15 years.",
            'Victoria Karlinsky, MD, FACS, performs every tummy tuck and mommy makeover.',
        ),
        ('Start your journey to luxury results designed for you.', 'Start with a free consultation.'),
    ],
    'tt-mm content',
)
tt_faqs = faq_apply(
    tt['faqs'],
    [
        (
            'Discuss your options with our board-certified team for personalization.',
            'Discuss your options with Dr. Karlinsky at a free consultation.',
        ),
        (' These risks are minimized by board-certified surgeons in accredited facilities.', ''),
    ],
    'tt-mm',
)
tt_title = 'Tummy Tuck or Mommy Makeover: Which One Do You Need?'
tt_meta = (
    'Tummy tuck or mommy makeover? Compare what each one treats, who it suits '
    'and how recovery differs, to choose the one that fits the changes pregnancy left.'
)
tt_excerpt = (
    'Tummy tuck or mommy makeover? Compare what each one treats, who it suits '
    'and how the recoveries differ, then plan yours at a free consultation.'
)
assert len(tt_meta) <= 160, len(tt_meta)

# ── /blog/affordable-plastic-surgery-miami: the three procedures' prices ──
af = load('affordable-plastic-surgery-miami')
stories_start = af['content'].index('## Real Patient Transformations Through Smart Investments')
stories_end = af['content'].index('## Frequently Asked Questions')
af_content = apply(
    af['content'],
    [
        (
            "Full costs include anesthesia, facility fees, and implants. In Miami's competitive market, these typically range $6,000 to $12,000 depending on your goals. These estimates reflect local market data, so your consultation will provide an accurate quote.",
            'Full costs also include anesthesia, the facility and, for breast augmentation, the implants, so ask what any quote includes.',
        ),
        (
            'Here\'s what common procedures cost at Alluring, aligned with ASPS benchmarks and updated for **plastic surgery costs Miami 2026**:',
            "Here's what common procedures cost at Alluring, from the practice's price list for **plastic surgery costs Miami 2026**:",
        ),
        (
            '**Breast Augmentation** runs $6,000-$12,000 total, with surgeon fees around $4,875 per ASPS data. '
            'Silicone implants or combined lifts add customization options. '
            '[Learn more about breast augmentation](/procedures/breast-augmentation-miami).',
            '**Breast Augmentation** at Alluring is $3,500 with saline implants and $4,500 with silicone implants, '
            "against a national average surgeon's fee alone of $4,875 (ASPS, 2023). A breast lift with implants is "
            '$6,000 with saline and $7,000 with silicone. '
            '[See breast augmentation prices](/procedures/breast-augmentation-miami#pricing).',
        ),
        (
            "**Tummy Tuck (Abdominoplasty)** totals $8,000-$15,000. It's ideal for post-pregnancy bodies or after "
            'significant weight loss. ASPS 2024 trends show steady demand for this procedure, up 1% from the previous year.',
            '**Tummy Tuck (Abdominoplasty)** at Alluring starts at $3,000 for a mini tummy tuck and $4,500 for a full '
            "tummy tuck, up to $10,000 for a fleur-de-lis tummy tuck. It's often chosen after pregnancy or significant "
            'weight loss. [See tummy tuck prices](/procedures/tummy-tuck-miami#pricing).',
        ),
        (
            'Expect $12,000-$25,000 for this value-packed combination. '
            'Explore our [mommy makeover options](/procedures/mommy-makeover-miami).',
            'Each part is priced on the practice\'s price list, and combining procedures takes $500 off the total for '
            'two and $1,000 for three. [See how a mommy makeover is priced](/procedures/mommy-makeover-miami#pricing).',
        ),
        (
            ' Expect ranges like $8,000-$25,000 for an **affordable mommy makeover Miami**, factoring in combinations for efficiency.',
            '',
        ),
        (
            'Here\'s a realistic example: For a $10,000 investment, qualified patients may see approximately $200/month '
            'over 60 months with promotional rates (subject to approval and credit terms). No prepayment penalties apply',
            'No prepayment penalties apply',
        ),
        ('## Why Choose Alluring for Affordable Luxury Transformations?', '## Why Choose Alluring?'),
        (
            'Patients rave about their experiences, giving us a 4.9 rating. They praise the attentive follow-up care.',
            'Patients praise the attentive follow-up care.',
        ),
        (af['content'][stories_start:stories_end], ''),
        (
            'Miami mommy makeovers average $12,000-$25,000. This aligns with national combination pricing when you add '
            'breast augmentation ($4,875 surgeon fee) plus tummy tuck fees per ASPS 2023 data. Local expertise and '
            'competition keep Miami accessible. Financing options even out comparisons across regions.',
            f"{MM_PRICE} ASPS's 2023 average surgeon's fee for breast augmentation alone was $4,875, before "
            'anesthesia, the facility and the implants.',
        ),
        (
            'Muscle repair, skin removal extent, and liposuction add-ons push costs toward the $8,000-$15,000 range. '
            'Anesthesia type and facility fees factor into your total. ASPS 2024 trends show steady demand for this procedure.',
            'At Alluring a tummy tuck is $3,000 (mini) to $10,000 (fleur-de-lis), depending on the type, and '
            'liposuction of the abdomen and flanks adds $1,500.',
        ),
        (
            ' For a $12,000 mommy makeover, payments around $200/month become possible with the right plan.',
            '',
        ),
        (
            'Yes, totals range $6,000-$12,000 depending on experience and what\'s included. ASPS surgeon fees averaged $4,875 in 2023.',
            "Yes. At Alluring breast augmentation is $3,500 with saline implants and $4,500 with silicone implants; "
            "ASPS's 2023 average surgeon's fee alone was $4,875.",
        ),
        (
            'Breast augmentation runs $6,000-$12,000 versus similar national surgeon baselines.',
            "At Alluring breast augmentation is $3,500 to $4,500, against a national average surgeon's fee of $4,875 (ASPS, 2023).",
        ),
        (
            'Dr. Victoria Karlinsky and our experienced team deliver 4.9-rated care at our Miami facility.',
            'Dr. Victoria Karlinsky and our team deliver personal care at our Miami practice.',
        ),
        ('Luxury results, designed for you.', 'Results planned for you.'),
    ],
    'affordable content',
)
af_faqs = faq_apply(
    af['faqs'],
    [
        (
            'Miami mommy makeovers average $12,000-$25,000, aligning with national combination pricing when you add '
            'breast augmentation and tummy tuck fees. Local expertise and competition keep Miami accessible, and '
            'financing options help even out comparisons across regions.',
            MM_PRICE,
        ),
        (
            'Complexity is the main driver, with muscle repair, skin removal extent, and liposuction add-ons pushing '
            'costs toward $8,000-$15,000. Anesthesia type and facility fees also factor into the total, and your '
            'approach is personalized during consultation.',
            'At Alluring a tummy tuck is $3,000 (mini) to $10,000 (fleur-de-lis), depending on the type, and '
            'liposuction of the abdomen and flanks adds $1,500. Dr. Karlinsky confirms your exact price at consultation.',
        ),
        (
            'Approval depends on your credit profile, and payments around $200/month are possible for procedures '
            'like a $12,000 mommy makeover.',
            'Approval depends on your credit profile.',
        ),
        (
            'Yes, breast augmentation totals range $6,000-$12,000 depending on surgeon experience and what’s included.',
            "At Alluring breast augmentation is $3,500 with saline implants and $4,500 with silicone implants; "
            "ASPS's 2023 average surgeon's fee alone was $4,875.",
        ),
        (
            'with breast augmentation running $6,000-$12,000 versus similar national baselines.',
            "with breast augmentation at Alluring $3,500 to $4,500, against a national average surgeon's fee of $4,875 (ASPS, 2023).",
        ),
    ],
    'affordable',
)

# Nothing the brief retired may survive in either post.
for label, text in [
    ('tt-mm', tt_content + json.dumps(tt_faqs)),
    ('affordable', af_content + json.dumps(af_faqs)),
]:
    low = text.lower()
    for bad in [
        'aaaasf', 'triple board', '$8,000', '$12,000', '$15,000', '$25,000', '$6,000-$12,000',
        '$200/month', '4.9', 'luxury', '5-star', 'board-certified team', 'accredited',
    ]:
        if bad in low:
            raise SystemExit(f'{label}: still contains {bad!r}')


def md5(s):
    return hashlib.md5(s.encode()).hexdigest()


sql = f"""-- #309: prices and claims in two blog posts. Built by build_sql.py from a
-- snapshot; each UPDATE only applies if the post's content still matches it.
\\set ON_ERROR_STOP on
BEGIN;

UPDATE blog_post SET
    title = {q(tt_title)},
    meta_description = {q(tt_meta)},
    excerpt = {q(tt_excerpt)},
    content = {q(tt_content)},
    faqs = {q(json.dumps(tt_faqs, ensure_ascii=False))}::jsonb,
    updated_at = now()
WHERE slug = 'tummy-tuck-mommy-makeover-miami'
  AND md5(content) = '{md5(tt['content'])}';

UPDATE blog_post SET
    content = {q(af_content)},
    faqs = {q(json.dumps(af_faqs, ensure_ascii=False))}::jsonb,
    updated_at = now()
WHERE slug = 'affordable-plastic-surgery-miami'
  AND md5(content) = '{md5(af['content'])}';

-- Hold autopilot off both posts. The re-scoped post had a pending refresh
-- candidate, and the writer prompt still teaches the old prices (#297).
-- Dismissing starts the 60-day refresh cooldown. The affordable post's
-- candidate was already dismissed on 2026-09-23 (lipo cluster, 01).
UPDATE content_refresh cr
   SET status = 'dismissed', updated_at = now()
  FROM blog_post p
 WHERE p.id = cr.blog_post_id
   AND p.slug IN ('tummy-tuck-mommy-makeover-miami', 'affordable-plastic-surgery-miami')
   AND p.refresh_of_post_id IS NULL
   AND cr.status = 'pending';

-- Both posts must end up with the new content (a rerun is a no-op);
-- if either changed since the snapshot, nothing is written.
DO $$
BEGIN
    IF (SELECT count(*) FROM blog_post
        WHERE (slug = 'tummy-tuck-mommy-makeover-miami' AND md5(content) = '{md5(tt_content)}')
           OR (slug = 'affordable-plastic-surgery-miami' AND md5(content) = '{md5(af_content)}')) <> 2 THEN
        RAISE EXCEPTION 'expected 2 updated posts';
    END IF;
    IF EXISTS (SELECT 1 FROM content_refresh cr JOIN blog_post p ON p.id = cr.blog_post_id
                WHERE p.slug IN ('tummy-tuck-mommy-makeover-miami', 'affordable-plastic-surgery-miami')
                  AND cr.status IN ('pending', 'in_progress', 'ready_for_review')) THEN
        RAISE EXCEPTION 'a refresh candidate is still open on one of the posts; stop and look';
    END IF;
END $$;

COMMIT;
"""
with open(out_path, 'w') as f:
    f.write(sql)

# The posts as they will read, next to the SQL, for review.
out_dir = os.path.dirname(out_path) or '.'
with open(f'{out_dir}/tummy-tuck-mommy-makeover-miami.after.md', 'w') as f:
    f.write(f'# {tt_title}\n\n{tt_content}\n')
with open(f'{out_dir}/affordable-plastic-surgery-miami.after.md', 'w') as f:
    f.write(f'# {af["title"]}\n\n{af_content}\n')
print('ok', out_path, len(sql))
