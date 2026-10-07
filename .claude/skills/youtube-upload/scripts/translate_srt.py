"""Build a translated SRT on the English cue timings.

    python3 -I translate_srt.py <in.en.srt> <lines.txt> <out.es.srt>

lines.txt holds one translated line per English cue, in order. The script
refuses to write if the counts differ, so a translation can never drift off
the speech.
"""
import sys
import textwrap

src, lines_path, out = sys.argv[1:4]
blocks = open(src).read().strip().split('\n\n')
lines = [l.strip() for l in open(lines_path) if l.strip()]
if len(blocks) != len(lines):
    sys.exit(f'{src}: {len(blocks)} cues but {len(lines)} lines')
result = []
for block, line in zip(blocks, lines):
    n, timing = block.split('\n')[:2]
    result.append(f'{n}\n{timing}\n' + '\n'.join(textwrap.wrap(line, 42)))
open(out, 'w').write('\n\n'.join(result) + '\n')
print(out, len(result))
