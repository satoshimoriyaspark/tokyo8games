"""Crop the approved reference; preserve RGB, nearest-neighbor scale, RGBA output.

Usage: python games/ary/tools/extract-actions.py /path/to/CC25583D-7C63-41D2-867E-B6330F1A887E.jpeg
Requires Pillow, numpy and scipy. No generated/repainted pixels or palette conversion.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

source = Image.open(sys.argv[1]).convert('RGB')
out = Path(__file__).resolve().parents[1] / 'assets'
groups = {
    'jump': [(380,292,478,416), (486,268,580,399), (589,241,678,371), (680,265,786,400), (787,279,905,414)],
    'double_jump': [(923,293,1022,416), (1023,267,1113,401), (1115,297,1200,416)],
    'slide': [(1208,302,1318,413), (1318,328,1427,413), (1425,300,1521,413)],
    'cat': [(1252,844,1324,910), (1325,839,1395,910)],
}
for name, boxes in groups.items():
    frame_w, frame_h = (48, 48) if name == 'cat' else (72, 88)
    sheet = Image.new('RGBA', (frame_w * len(boxes), frame_h))
    for i, box in enumerate(boxes):
        rgb = np.array(source.crop(box))
        # Only remove near-white background regions. Keep enclosed white details.
        white = (rgb.min(axis=2) >= 230) & (np.ptp(rgb.astype(int), axis=2) < 30)
        labels, count = ndimage.label(white)
        border = set(np.concatenate([labels[0], labels[-1], labels[:,0], labels[:,-1]]))
        sizes = np.bincount(labels.ravel())
        remove = np.zeros_like(white)
        for label in range(1, count + 1):
            if label in border or sizes[label] > 80:
                remove |= labels == label
        parts, _ = ndimage.label(~remove)
        sizes = np.bincount(parts.ravel()); sizes[0] = 0
        alpha = (parts == sizes.argmax()).astype('uint8') * 255
        rgba = Image.fromarray(np.dstack([rgb, alpha]))
        rgba = rgba.crop(rgba.getbbox())
        rgba = rgba.resize(tuple(round(v * .59) for v in rgba.size), Image.Resampling.NEAREST)
        # Common front-wheel right edge and road baseline. No independent squash.
        x = frame_w - rgba.width - 3
        y = frame_h - rgba.height - 2
        assert x >= 0 and y >= 0, (name, i, rgba.size)
        sheet.alpha_composite(rgba, (i * frame_w + x, y))
    sheet.save(out / f'ary_{name}.png')
    print(name, sheet.size, sheet.mode)
