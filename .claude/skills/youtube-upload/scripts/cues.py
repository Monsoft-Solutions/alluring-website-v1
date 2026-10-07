"""Turn a Whisper word-timestamp JSON into an SRT cut at sentence breaks.

Whisper's own SRT cuts by length, mid-clause. This re-cuts the words so each
cue ends at a sentence or clause, stays under ~72 characters and ~5.5 s, and
wraps at 42 characters per line.

    python3 -I cues.py <whisper.json> <out.en.srt>

The JSON comes from `whisper ... --word_timestamps True --output_format all`.
Prints the cue count; the Spanish track must have exactly that many lines.
"""
import json
import re
import sys
import textwrap

# Fixes Whisper gets wrong for this practice. Extend as new ones turn up.
FIXES = {'24-7': '24/7', 'Karlinski': 'Karlinsky', 'lipo 360': 'Lipo 360'}


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'


def join(ws):
    return ''.join(w['word'] for w in ws).strip()


src, out = sys.argv[1], sys.argv[2]
words = [w for s in json.load(open(src))['segments'] for w in s['words']]
cues, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    text = join(cur)
    nxt = words[i + 1] if i + 1 < len(words) else None
    word = w['word'].strip()
    end_sentence = re.search(r'[.?!]$', word) and len(text) > 12
    long_clause = word.endswith(',') and len(text) > 40
    pause = nxt and nxt['start'] - w['end'] > 0.6
    if not nxt or end_sentence or long_clause or pause:
        cues.append((cur[0]['start'], w['end'], text))
        cur = []
    elif len(text) >= 72 or w['end'] - cur[0]['start'] > 5.5:
        # Back up to the last clause boundary, or to just before a conjunction.
        cut = None
        for j in range(len(cur) - 1, 0, -1):
            wj = cur[j]['word'].strip()
            if re.search(r'[,.?!]$', wj) and len(join(cur[: j + 1])) > 20:
                cut = j + 1
                break
            if wj.lower() in ('and', 'but', 'which', 'that', 'so', 'because', 'to') and len(join(cur[:j])) > 25:
                cut = j
                break
        cut = cut or len(cur)
        head = cur[:cut]
        cues.append((head[0]['start'], head[-1]['end'], join(head)))
        cur = cur[cut:]

with open(out, 'w') as f:
    for n, (a, b, t) in enumerate(cues, 1):
        for bad, good in FIXES.items():
            t = t.replace(bad, good)
        f.write(f'{n}\n{ts(a)} --> {ts(b)}\n' + '\n'.join(textwrap.wrap(t, 42)) + '\n\n')
print(out, len(cues))
