"""Quita el fondo gris claro (241) de las imágenes oficiales Sport vía flood fill
desde los bordes, conservando el producto. Salida: PNG transparente en public/productos."""
from PIL import Image
import numpy as np
from collections import deque
import os, sys

BASE = r"C:\Users\USER\Documents\kimi\Nueva carpeta\skill\emprende-salud-landing"
SRC = os.path.join(BASE, "scratch", "sport-oficiales")
DST = os.path.join(BASE, "public", "productos")

MAP = {
    "2997d70d97c841cf.jpg": "pre-sport.png",
    "30f9426c8c9bcb3c.jpg": "xtra-mile.png",
    "7fb6f08e28e118c3.jpg": "post-sport.png",
    "70e767f33ff3ec64.jpg": "biopro-sport.png",
    "d474b56255ce37d1.jpg": "protein-active-sport.png",
}

TOL = 16          # tolerancia de color respecto al fondo
BG = np.array([241, 241, 241])

def quitar_fondo(src, dst, nombre):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    diff = np.abs(a - BG).sum(axis=2)
    candidato = diff <= TOL * 3

    # BFS desde todos los píxeles del borde que sean "fondo"
    mask = np.zeros((h, w), dtype=bool)  # True = fondo a transparentar
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
    # Recortar al contenido con un pequeño margen
    bbox = out.getbbox()
    if bbox:
        pad = 10
        bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(w, bbox[2]+pad), min(h, bbox[3]+pad))
        out = out.crop(bbox)
    # Limitar altura para web
    if out.height > 900:
        r = 900 / out.height
        out = out.resize((int(out.width * r), 900), Image.LANCZOS)
    out.save(dst, optimize=True)
    pct = mask.mean() * 100
    print(f"{nombre}: fondo quitado {pct:.0f}%  tamaño final {out.size}  {os.path.getsize(dst)//1024} KB")

for src_name, dst_name in MAP.items():
    quitar_fondo(os.path.join(SRC, src_name), os.path.join(DST, dst_name), dst_name)

# Hoja de vista previa sobre fondo azul navy (como el modal) y blanco (como la tarjeta)
prev = Image.new("RGB", (1200, 640), (255, 255, 255))
from PIL import ImageDraw
d = ImageDraw.Draw(prev)
x = 0
for dst_name in MAP.values():
    im = Image.open(os.path.join(DST, dst_name)).convert("RGBA")
    im.thumbnail((230, 300))
    prev.paste(im, (x + (230 - im.width)//2, (300 - im.height)//2), im)
    d.text((x + 10, 310), dst_name, fill="black")
    x += 240
# mitad inferior navy
d.rectangle([0, 340, 1200, 640], fill=(0, 73, 142))
x = 0
for dst_name in MAP.values():
    im = Image.open(os.path.join(DST, dst_name)).convert("RGBA")
    im.thumbnail((230, 290))
    prev.paste(im, (x + (230 - im.width)//2, 340 + (290 - im.height)//2), im)
    x += 240
prev.save(os.path.join(BASE, "scratch", "preview-sin-fondo.jpg"), quality=80)
print("preview ok")
