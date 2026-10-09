"""Remove white matte fringes without changing any RGB channel or frame geometry.

Usage: python games/ary/tools/clean-alpha.py ORIGINAL_ASSET_DIRECTORY
Input must be the pre-cleanup PNGs, not this script's output. Pillow/numpy/scipy.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

source = Path(sys.argv[1])
destination = Path(__file__).resolve().parents[1] / 'assets'
for name, width in [('ride_game',64),('jump',72),('double_jump',72),('slide',72),('cat',48)]:
    file = f'ary_{name}.png'
    original = np.array(Image.open(source / file).convert('RGBA'))
    result = original.copy()
    for x in range(0, original.shape[1], width):
        frame = original[:,x:x+width]
        rgb = frame[:,:,:3].astype(int)
        visible = frame[:,:,3] > 0
        edge = ndimage.distance_transform_edt(visible) <= 2
        white_matte = (rgb.min(2) > 125) & (np.ptp(rgb,axis=2) < 70)
        remove = visible & edge & white_matte
        # White/blue speed-streak residue behind the jacket, outside rider details.
        streak = np.zeros_like(visible)
        if name == 'ride_game' and x // width in [1,2,3]:
            streak[40:57,:19] = True
        if name == 'jump' and x == 0:
            streak[48:67,:22] = True
        remove |= visible & streak & white_matte
        alpha = frame[:,:,3].copy()
        alpha[remove] = 0
        components, _ = ndimage.label(alpha>0,structure=np.ones((3,3)))
        sizes = np.bincount(components.ravel())
        specks = sizes < 6; specks[0] = False
        alpha[specks[components]] = 0
        result[:,x:x+width,3] = alpha
    assert np.array_equal(result[:,:,:3],original[:,:,:3]), 'RGB must never change'
    assert np.all(result[:,:,3] <= original[:,:,3]), 'Never add or repaint pixels'
    assert result.shape == original.shape
    Image.fromarray(result).save(destination / file)
    print(file, 'alpha pixels cleaned:',int((result[:,:,3] != original[:,:,3]).sum()))
