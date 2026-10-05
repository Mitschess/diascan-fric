"""Salin foto terpilih dari "Wound Image Dataset" ke assets/photos/ dan tulis assets/photos.js.

Untuk tiap foto luka:
  - foto dipotong (bila perlu) agar label nama pasien pada penggaris tidak ikut terlihat,
  - mask dataset dipotong dengan cara yang sama dan disimpan sebagai PNG transparan (overlay segmentasi),
  - kotak deteksi dihitung dari komponen mask (bercak kecil diabaikan), koordinat ternormalisasi 0–1.

Jalankan dari folder proyek:  python tools/build_photos.py
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'Wound Image Dataset')
OUT = os.path.join(ROOT, 'assets', 'photos')

# key: (nomor foto luka, potongan [x, y, sisi] dalam piksel asli 331×331 atau None)
# Foto dari satu pasien yang sama di dataset dipakai sebagai satu seri mingguan.
WOUNDS = {
    # Budi: luka ujung ibu jari (seri mingguan + cadangan untuk tombol rana)
    'budi-0': (212, [65, 137, 170]), 'budi-1': (222, [71, 145, 170]), 'budi-2': (250, [44, 88, 170]),
    'budi-3': (274, [76, 135, 170]), 'budi-4': (302, [83, 105, 170]), 'budi-5': (329, [74, 90, 170]),
    'budi-6': (358, [81, 118, 170]), 'budi-7': (368, [86, 118, 170]),
    # Siti: nekrosis (eskar hitam) di tumit
    'siti-0': (194, None), 'siti-1': (209, None), 'siti-2': (210, None), 'siti-3': (206, None),
    # Hendra: ulkus plantar di bawah metatarsal I dengan kalus di tepinya
    'hendra-0': (362, None), 'hendra-1': (404, None), 'hendra-2': (375, None), 'hendra-3': (395, None),
    # Agus: ulkus plantar depan
    'agus-0': (276, [28, 31, 190]), 'agus-1': (283, [0, 50, 200]), 'agus-2': (289, [80, 8, 170]),
    'agus-3': (356, [30, 30, 170]), 'agus-4': (377, [60, 40, 170]),
    # Rahmat: ulkus tumit, dua minggu pertama dengan kemerahan di sekitarnya
    'rahmat-0': (578, None), 'rahmat-1': (561, None), 'rahmat-2': (665, None), 'rahmat-3': (655, None), 'rahmat-4': (595, None),
    # Contoh laporan keluhan: ulkus jari dengan kemerahan
    'keluhan-0': (662, None),
}
NORMALS = {
    'maria-0': 43, 'maria-1': 44, 'maria-2': 45, 'maria-3': 47,
    'dewi-0': 48, 'dewi-1': 49, 'dewi-2': 51,
    'nur-0': 52, 'nur-1': 53, 'nur-2': 54, 'nur-3': 55,
}
SIZE = 360  # sisi keluaran (px)


def clean_mask(msk):
    """Mask dataset berformat JPEG (ada derau kompresi, sebagian beresolusi rendah): dihaluskan, lalu
    hanya komponen besar yang dipertahankan. Mengembalikan (mask bersih, kotak ternormalisasi)."""
    a = np.asarray(msk.resize((SIZE, SIZE), Image.BILINEAR), np.float32)
    m = ndimage.gaussian_filter(a, 3) > 127
    lab, n = ndimage.label(m)
    if not n:
        return m, []
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    keep = sorted([i + 1 for i, s in enumerate(sizes) if s >= max(sizes.max() * 0.4, m.size * 0.003)], key=lambda i: -sizes[i - 1])[:3]
    out = []
    for i in keep:
        ys, xs = np.nonzero(lab == i)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        out.append([round(x0 / SIZE, 4), round(y0 / SIZE, 4), round((x1 - x0) / SIZE, 4), round((y1 - y0) / SIZE, 4)])
    return np.isin(lab, keep), out


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    for key, (num, crop) in WOUNDS.items():
        img = Image.open(os.path.join(DATA, 'wound_main', f'wound_main-{num:04d}.jpg')).convert('RGB')
        msk = Image.open(os.path.join(DATA, 'wound_mask', f'wound_mask-{num:04d}.jpg')).convert('L').resize(img.size, Image.BILINEAR)
        if crop:
            x, y, s = crop
            img, msk = img.crop((x, y, x + s, y + s)), msk.crop((x, y, x + s, y + s))
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
        m, boxes = clean_mask(msk)
        img.save(os.path.join(OUT, key + '.jpg'), quality=86, optimize=True)
        ov = np.zeros((SIZE, SIZE, 4), np.uint8)
        ov[m] = [56, 189, 248, 120]
        edge = m & ~ndimage.binary_erosion(m, iterations=2)
        ov[edge] = [224, 242, 254, 235]
        Image.fromarray(ov).save(os.path.join(OUT, key + '-mask.png'), optimize=True)
        meta[key] = {'src': f'assets/photos/{key}.jpg', 'mask': f'assets/photos/{key}-mask.png', 'w': SIZE, 'h': SIZE,
                     'boxes': boxes, 'frac': round(float(m.mean()), 4), 'ref': f'wound_main-{num:04d}'}
    for key, num in NORMALS.items():
        img = Image.open(os.path.join(DATA, 'Nomal', f'Female_normal-{num:03d}.jpg')).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS)
        img.save(os.path.join(OUT, key + '.jpg'), quality=86, optimize=True)
        meta[key] = {'src': f'assets/photos/{key}.jpg', 'w': SIZE, 'h': SIZE, 'boxes': [], 'frac': 0, 'ref': f'Female_normal-{num:03d}'}
    with open(os.path.join(ROOT, 'assets', 'photos.js'), 'w', encoding='utf-8') as f:
        f.write('/* Dibuat oleh tools/build_photos.py: foto asli dari Wound Image Dataset + kotak dari mask anotasi. */\n')
        f.write('window.DS_PHOTOS = ' + json.dumps(meta, separators=(',', ':')).replace('},"', '},\n"') + ';\n')
    print(len(meta), 'foto ditulis ke', OUT)


if __name__ == '__main__':
    main()
