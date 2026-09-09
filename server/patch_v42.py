import pathlib, sys

p = pathlib.Path(r'C:\Users\USER\Documents\kimi\Nueva carpeta\skill\emprende-salud-landing\server\waha-bot.js')
lines = p.read_text(encoding='utf-8').splitlines()

# Insertar INTENT_DEPORTE_RE después de la línea de AUTOENVIO_SI_RE (índice 100 = línea 101)
insert1 = [
    "",
    "// Disparador de intención deporte fuerte (incluye nombres de producto campaña)",
    "const INTENT_DEPORTE_RE = /(deport|gym|gimnasio|entren|m[úu]sculo|prote[ií]na|biopro|sport|pre[- ]?entreno|post[- ]?entreno|crossfit|pesas|running|runner|whey|rendimiento|recuperaci[oó]n|muscular)/i",
]

# Buscar el índice de AUTOENVIO_SI_RE
idx_auto = None
for i, l in enumerate(lines):
    if l.startswith('const AUTOENVIO_SI_RE'):
        idx_auto = i
        break
if idx_auto is None:
    print("ERROR: no encontré AUTOENVIO_SI_RE", file=sys.stderr)
    sys.exit(1)

# Insertar después de idx_auto
for j, txt in enumerate(insert1):
    lines.insert(idx_auto + 1 + j, txt)

# Ahora insertar bloque 1d antes del menú (antes de "const menuVencido")
menu_idx = None
for i, l in enumerate(lines):
    if l.strip().startswith('const menuVencido'):
        menu_idx = i
        break
if menu_idx is None:
    print("ERROR: no encontré menuVencido", file=sys.stderr)
    sys.exit(1)

insert2 = [
    "",
    "  // 1d) Intención deporte fuerte en primer mensaje (ej. campaña Biopro+ Sport):",
    "  //     salta el menú genérico y va directo a la línea sport.",
    "  if (INTENT_DEPORTE_RE.test(lower)) {",
    "    if (!contact.objetivo) {",
    "      db.prepare(`UPDATE wa_contacts SET objetivo = 'deporte',",
    "        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END",
    "        WHERE chat_id = ?`).run(chatId)",
    "    }",
    "    await humanDelay(); if (await waSend(chatId, OPCION_4)) consume(); return",
    "  }",
    "",
]

for j, txt in enumerate(insert2):
    lines.insert(menu_idx + j, txt)

p.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print("OK: v4.2 aplicado")
