import pathlib, sys
p = pathlib.Path(r'C:\Users\USER\Documents\kimi\Nueva carpeta\skill\emprende-salud-landing\server\waha-bot.js')
lines = p.read_text(encoding='utf-8').splitlines()
for i, l in enumerate(lines[98:104], start=99):
    print(f"{i}: {repr(l)}")
