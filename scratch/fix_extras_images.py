"""Quita el fondo blanco de las 4 imágenes oficiales (PROBIX + Bases Madre)
y genera PNG transparentes en public/productos + hoja de vista previa."""
from PIL import Image, ImageDraw
import numpy as np
from collections import deque
import os

BASE = r"C:\Users\USER\Documents\kimi\Nueva carpeta\skill\emprende-salud-landing"
SRC = os.path.join(BASE, "scratch", "extras-oficiales")
DST = os.path.join(BASE, "public", "productos")

MAP = {
    "probix.jpg": "probix.png",
    "base-amarilla.jpg": "base-madre-amarilla.png",
    "base-roja.jpg": "base-madre-roja.png",
    "base-verde.jpg": "base-madre-verde.png",
}

BG = np.array([255, 255, 255])
TOL = 10

def quitar_fondo(src, dst, nombre):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    diff = np.abs(a - BG).sum(axis=2)
    candidato = diff <= TOL * 3
    mask = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if candidato[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if candidato[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and candidato[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True; q.append((ny, nx))
    rgba = np.dstack([a.astype(np.uint8), np.where(mask, 0, 255).astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA")
    bbox = out.getbbox()
    if bbox:
        pad = 12
        bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(w, bbox[2]+pad), min(h, bbox[3]+pad))
        out = out.crop(bbox)
    if out.height > 900:
        r = 900 / out.height
        out = out.resize((int(out.width * r), 900), Image.LANCZOS)
    out.save(dst, optimize=True)
    print(f"{nombre}: fondo {mask.mean()*100:.0f}%  {out.size}  {os.path.getsize(dst)//1024} KB")

for s, d in MAP.items():
    quitar_fondo(os.path.join(SRC, s), os.path.join(DST, d), d)

# Vista previa: arriba blanco, abajo navy
prev = Image.new("RGB", (1200, 640), (255, 255, 255))
dr = ImageDraw.Draw(prev)
x = 0
for d in MAP.values():
    im = Image.open(os.path.join(DST, d)).convert("RGBA")
    im.thumbnail((280, 290))
    prev.paste(im, (x + (290 - im.width)//2, (300 - im.height)//2), im)
    dr.text((x + 8, 312), d, fill="black")
    x += 300
dr.rectangle([0, 340, 1200, 640], fill=(0, 73, 142))
x = 0
for d in MAP.values():
    im = Image.open(os.path.join(DST, d)).convert("RGBA")
    im.thumbnail((280, 280))
    prev.paste(im, (x + (290 - im.width)//2, 345 + (280 - im.height)//2), im)
    x += 300
prev.save(os.path.join(BASE, "scratch", "preview-extras-final.jpg"), quality=80)
print("preview ok")
