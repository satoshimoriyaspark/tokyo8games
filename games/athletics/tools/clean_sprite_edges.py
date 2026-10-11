"""Remove only exterior matte gray; leave every other RGBA pixel unchanged.

The baseline fixtures are the approved v1.5 files at commit 0638498.
Flood fill is per 48x48 cell and four-connected. White is deliberately NOT
traversable: shoes, eyes, bibs, balls and interior gray shading stay intact.
"""
from collections import deque
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tests/baseline/assets/sprites/approved_v15'
DEST = ROOT / 'assets/sprites/approved_v15'
MATTE = (184, 189, 200, 255)
WHITE = (250, 246, 239, 255)
report = {}
for path in sorted(SOURCE.glob('*.png')):
    if path.name == 'props.png':
        continue  # Equipment is a separate asset, not a character matte.
    before = Image.open(path).convert('RGBA')
    after = before.copy()
    px = before.load()
    removed = []
    for left in range(0, before.width, 48):
        seen, queue = set(), deque()
        for y in range(48):
            for x in range(left, left + 48):
                if x in (left, left + 47) or y in (0, 47):
                    if px[x, y][3] == 0 or px[x, y] == MATTE:
                        queue.append((x, y))
        while queue:
            x, y = queue.popleft()
            if (x, y) in seen:
                continue
            seen.add((x, y))
            if px[x, y] == MATTE:
                after.putpixel((x, y), (0, 0, 0, 0))
                removed.append((x, y))
            for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                if left <= nx < left+48 and 0 <= ny < 48 and (nx,ny) not in seen:
                    if px[nx,ny][3] == 0 or px[nx,ny] == MATTE:
                        queue.append((nx,ny))
    assert before.size == after.size
    assert sum(p == WHITE for p in before.get_flattened_data()) == sum(p == WHITE for p in after.get_flattened_data())
    for old, new in zip(before.get_flattened_data(), after.get_flattened_data()):
        assert old == new or (old == MATTE and new == (0,0,0,0))
    if removed:
        after.save(DEST / path.name, optimize=True)
    report[path.name] = {'removedExteriorGray': len(removed), 'pixels': removed}
(ROOT / 'tests/edge-cleanup.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({f:r['removedExteriorGray'] for f,r in report.items()}))
