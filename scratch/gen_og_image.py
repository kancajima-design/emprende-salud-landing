"""Genera public/og-image.png (1200x630) para vista previa al compartir el link."""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = r"C:\Users\USER\Documents\kimi\Nueva carpeta\skill\emprende-salud-landing"
OUT = os.path.join(BASE, "public", "og-image.png")
W, H = 1200, 630
NAVY, CELESTE, LIMA, NARANJA = (0, 73, 142), (0, 148, 222), (181, 215, 15), (255, 122, 26)

# Fondo: degradado navy -> celeste
img = Image.new("RGB", (W, H))
px = img.load()
for x in range(W):
    t = x / W
    px_col = tuple(int(NAVY[i] + (CELESTE[i] - NAVY[i]) * t) for i in range(3))
    for y in range(H):
        px[x, y] = px_col

d = ImageDraw.Draw(img)

def font(sz, bold=True):
    for p in [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]:
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

# Badge
badge_txt = "GUÍA GRATIS + ASESORÍA PERSONALIZADA"
f_badge = font(26)
bb = d.textbbox((0, 0), badge_txt, font=f_badge)
bw, bh = bb[2] - bb[0], bb[3] - bb[1]
bx, by = 70, 70
d.rounded_rectangle([bx, by, bx + bw + 56, by + bh + 32], radius=(bh + 32) // 2, fill=LIMA)
d.text((bx + 28, by + 14), badge_txt, font=f_badge, fill=(11, 32, 51))

# Título
f_title = font(56)
d.text((70, 170), "Energía real,", font=f_title, fill="white")
d.text((70, 236), "digestión liviana", font=f_title, fill="white")
d.text((70, 302), "y bienestar", font=f_title, fill="white")
d.text((70, 368), "todos los días", font=f_title, fill=LIMA)

# Subtítulo
f_sub = font(30, bold=False)
d.text((70, 470), "Descarga la Guía de Nutrición Funcional y encuentra", font=f_sub, fill=(220, 235, 245))
d.text((70, 510), "tu producto FuXion ideal · Asesoría por WhatsApp", font=f_sub, fill=(220, 235, 245))

# Marca
f_brand = font(28)
d.text((70, 570), "Emprende Salud · FuXion Perú", font=f_brand, fill=(160, 200, 225))

# Producto a la derecha
prod_path = os.path.join(BASE, "public", "productos", "pack-5-14-keto.png")
if os.path.exists(prod_path):
    prod = Image.open(prod_path).convert("RGBA")
    prod.thumbnail((420, 560))
    # tarjeta translúcida detrás
    card = Image.new("RGBA", (prod.width + 60, prod.height + 60), (255, 255, 255, 28))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle([0, 0, card.width - 1, card.height - 1], radius=40, fill=(255, 255, 255, 30))
    cx, cy = W - prod.width - 130, (H - prod.height) // 2
    img.paste(card, (cx - 30, cy - 30), card)
    img.paste(prod, (cx, cy), prod)

img.save(OUT, optimize=True)
print("ok", os.path.getsize(OUT) // 1024, "KB")
