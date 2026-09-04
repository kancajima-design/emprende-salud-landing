// ─────────────────────────────────────────────────────────────
// Emprende Salud · Bot REACTIVO de WhatsApp (WAHA)
// Reglas de oro (anti-baneo):
//  - NUNCA inicia conversaciones: solo responde a quien escribe primero.
//  - Delays humanos antes de responder (1.5–3.5 s).
//  - Máximo 25 respuestas automáticas por contacto por día.
//  - Si el lead pide hablar con Kervin → handoff: el bot se calla 24 h.
//  - No responde grupos, estados ni difusiones.
// v3 (04-sep): LÍNEA DEPORTIVA + catálogo completo FuXion.
//  Incluye Biopro+ Sport, Pre Sport, Post Sport, Xtra Mile, Protein Active Sport.
//  Calificación actualizada con objetivo "deporte".
// Variables de entorno requeridas (Railway, servicio landing):
//  WAHA_API_URL, WAHA_API_KEY, WAHA_SESSION (default), WAHA_NOTIFY (51964954743)
// ─────────────────────────────────────────────────────────────

const WAHA_URL = (process.env.WAHA_API_URL || '').replace(/\/$/, '')
const WAHA_KEY = process.env.WAHA_API_KEY || ''
const WAHA_SESSION = process.env.WAHA_SESSION || 'default'
const NOTIFY = process.env.WAHA_NOTIFY || '51964954743' // personal de Kervin

const TIENDA = 'http://ifuxion.com/emprendesalud'
const LANDING = 'https://www.emprendesalud.net'

const MAX_REPLIES_DAY = 25
const MENU_TTL_MS = 24 * 60 * 60 * 1000

const MENU = `¡Hola! 👋 Soy Valeria, asistente de *Emprende Salud* 💚
¿En qué te ayudo?

1️⃣ Productos y promoción (producto de regalo 🎁)
2️⃣ Asesoría personalizada GRATIS con Kervin
3️⃣ Ganar dinero como socio FuXion
4️⃣ Proteína y rendimiento deportivo 💪

Responde con el número o cuéntame tu objetivo (energía, peso, digestión, defensas, belleza, deporte…) y te oriento.`

const OPCION_1 = `🎁 *Promoción Cliente Preferente* (registro GRATIS):
• Por cada *60 puntos en autoenvío* mensual → 1 producto de regalo
• Por cada *80 puntos en compra directa* → 1 producto de regalo

Para armarte el pack que llegue a los puntos, cuéntame: ¿cuál es tu objetivo principal? 🎯
*Energía*, *peso*, *digestión*, *defensas*, *belleza* o *deporte*`

const OPCION_1_LINK = `Compra con precio preferente aquí:
${TIENDA}
(verifica que aparezca *Emprende Salud* como patrocinador) 💚`

const OPCION_2 = `¡Perfecto! 📲 Ya le avisé a *Kervin*. Te va a escribir personalmente en cuanto se desocupe (normalmente en menos de 1 hora, de 8 am a 9 pm).

Mientras tanto puedes ir viendo los productos aquí:
${TIENDA} 💚`

const OPCION_3 = `💼 Como *socio FuXion* generas ingresos recomendando productos de nutrición funcional: sin inventario, sin local — la empresa envía directo a tus clientes y tú ganas desde tu primera venta.

Kervin empezó igual que tú y te puede contar cómo funciona, sin compromiso.
¿Te paso con él? Responde *2* y te contacto 📲`

const OPCION_4 = `💪 *Línea Sport Pro Edition* — para quienes entrenan en serio:

• *Biopro+ Sport*: 25g de proteína por stick, con Actinos® (recuperación muscular más rápida). Sabor vainilla, se toma con agua fría post-entreno.
• *Pre Sport*: energía pre-entreno con citrulina, β-alanina y electrolitos.
• *Post Sport*: recuperación con BCAAs, glutamina y agua de coco.
• *Xtra Mile*: energía sostenida durante el ejercicio (Palatinose® + electrolitos).
• *Protein Active Sport*: proteína 100% vegetal, sabores vainilla-canela y chocolate-avellanas.

¿Buscas proteína, energía pre-entreno o recuperación? Te armo el stack ideal 💚`

// ── Calificación: objetivos y señales de compra ──────────────
const OBJETIVOS = [
  [/energ|cansanc|fatiga|agotad/i, 'energia'],
  [/peso|adelgaz|bajar|grasa|metabol|panza/i, 'peso'],
  [/digest|est[óo]mago|barriga|colon|gastritis|hinchaz/i, 'digestion'],
  [/defensa|inmun|gripe|resfr/i, 'defensas'],
  [/belleza|piel|cabello|uñas|arrugas/i, 'belleza'],
  [/negocio|dinero|ingreso|socio|emprend/i, 'negocio'],
  [/deport|gym|gimnasio|entren|músculo|musculo|proteína|proteina|rendimiento|recuperación|pre-entreno|post-entreno|crossfit|pesas|running|runner/i, 'deporte'],
]
// Palabras que indican intención de compra → lead CALIENTE
const HOT = /(precio|cu[aá]nto|cuesta|costo|comprar|c[oó]mo pago|yape|plin|oferta|descuento|promoci)/i

const SYSTEM_PROMPT_WA = `Eres Valeria, asistente de WhatsApp de Emprende Salud, distribuidor independiente oficial de FuXion en Perú. Atiendes a personas que escriben primero al WhatsApp del negocio.

ESTILO
- Español peruano, tuteo, cálida. MÁXIMO 50 palabras por mensaje. Usa *negritas* de WhatsApp con un asterisco.
- 1 emoji ocasional (💚✨). Nunca más de 2.
- No repitas el menú numerado; ese ya lo envía el sistema. Responde la duda directa.

SABES ESTO
- Catálogo FuXion: bebidas funcionales para energía, control de peso, digestión, defensas, belleza y rendimiento deportivo (NO medicamentos).
- Promo Cliente Preferente: registro gratis; por cada 60 puntos en autoenvío mensual = 1 producto de regalo; por cada 80 puntos en compra directa = 1 producto de regalo.
- Compra: ${TIENDA} (debe aparecer Emprende Salud como patrocinador).
- Web: ${LANDING} — ahí descargan gratis la Guía de Nutrición Funcional.
- Asesoría personalizada gratis con Kervin: solo para precios exactos, pago, delivery o si la persona pide hablar con un humano → dile "responde *2* y te paso con Kervin".

PACKS POR OBJETIVO (tú misma armas el pack, sin esperar a Kervin)
Cuando el lead cuente su objetivo, recomienda su pack (máx 3 productos), explica en 1 línea cómo se toma cada uno y cierra con el link de compra:
- Energía: Vita Xtra T+ en el desayuno (si es hipertenso → Vitaenergia) + batido Protein Active a media mañana.
- Peso: Pack 5/14 (reto guiado de 14 días: batidos Fit, NoCarb-T, Thermo T3 y Prunex1, con plan de comidas incluido, sin pasar hambre). Si duda, ofrece empezar con el Detox 5 días.
- Digestión: Detox 5 días como limpieza inicial + Flora Liv diario (fibra + probióticos). Prunex1 solo en noches puntuales, ciclos de 5-7 días.
- Defensas: Flora Liv en el desayuno + Vera+ antes de dormir.
- Belleza: Youth Elixir antes de dormir + Flora Liv diario.
- Deporte/Rendimiento:
  • Stack básico: Biopro+ Sport post-entreno (25g proteína, Actinos®) + Pre Sport antes de entrenar.
  • Stack completo: Pre Sport (pre) + Xtra Mile (durante) + Post Sport (recuperación) + Biopro+ Sport (post-entreno proteína).
  • Vegano: Protein Active Sport (vainilla-canela o chocolate-avellanas).
  • Todos se toman con agua fría. Biopro+ Sport y Protein Active Sport: 1 stick post-entreno. Pre Sport: 1 stick 20-30 min antes. Post Sport: 1 stick al terminar. Xtra Mile: 1 stick durante el ejercicio (después de 30-45 min).

Cierre de todo pack: "Arma tu pedido en ${TIENDA} — con 60 puntos en autoenvío mensual o 80 puntos en compra directa te llevas 1 producto de regalo 🎁. Los puntos de cada producto se ven en la tienda."

PRODUCTOS QUE CONOCES (resumen para no inventar)
Sistema Base (limpieza y nutrición diaria):
- Rexet: bebida efervescente, depurativa, protectora del hígado.
- Liquid Fiber: fibra prebiótica sabor limón.
- Flora Liv: probióticos + prebióticos + granadilla. Preparar con agua fría o tibia, NUNCA caliente.
- Prunex1: té herbal de guindón, tránsito intestinal. Noches, ciclos de 5-7 días. Medio stick primeras 2 noches.
- Alpha Balance: alcalinizante, limpieza de toxinas (alfalfa, chlorella, espirulina).
- Berry Balance: cranberry + berries, tracto urinario.
- Programa Detox 5 días: Rexet + Prunex1 + Flora Liv + Berry Balance + Alpha Balance + Liquid Fiber + Thermo T3 + Protein Active Fit + Protein Xoup + plan nutricional.

Proteínas:
- Biopro+ Tect: proteína con Colostrum®, 100% valor biológico. Pote 500g o caja 14 sticks.
- Protein Active: proteína 100% vegetal (quinua, arroz, arveja, algas). Sabores vainilla-canela y chocolate-avellanas.
- Biopro+ Fit: proteína + Prolibra® (control de peso, saciedad).
- Protein Active Fit: proteína vegetal + L-carnitina (control de peso).
- Protein Xoup: sopas proteicas vegetales (espárragos, brócoli, criolla).

Energía y Vitalidad:
- Vita Xtra T+: energizante natural (guayusa, té verde, maca, ginseng). NO para hipertensos.
- Vitaenergia: multivitamínico SIN energizantes. Para toda la familia.
- Xpeed: energético natural con guaraná, maca, teína. Pack x 4.
- Nutraday: refresco multivitamínico con moringa. Para toda la familia.

Control de Peso:
- Thermo T3: mix de 3 tés + L-carnitina + cetonas de frambuesa.
- NoCarb-T: fibras solubles + té verde + cromo. Control de glucosa post-comida.
- Chocolate Fit: cacao del Amazonas + proteína vegetal + café verde.
- Café & Café Fit / Cappuccino: café gourmet + café verde (Svetol®).
- Pack 5/14 Keto: reto 14 días con dieta cetogénica de ayuno intermitente parcial.
- Pack 5/14 Active Mito: reto 14 días con dieta mitocondrial.

Inmunológica:
- Duo Defense: Camu-C + Vera+ (defensas combinadas).
- Vera+: aloe vera + betaglucanos + Wellmune®.
- Gano+ T: té de Ganoderma lucidum + té blanco.
- Gano+ Cappuccino: cappuccino con Ganoderma.
- Café GanoMax: café premium + Ganoderma + uña de gato.

Anti-edad:
- Probal: equilibrio femenino (aguaje, dong quai, orégano).
- Passion: vigor masculino (L-arginina, maca, ginseng, jalea real).
- Youth Elixir HGH: aminoácidos + resveratrol + antioxidantes. Antes de dormir.
- Golden FLX: cúrcuma orgánica + jengibre + leche de coco. Articulaciones.
- Beauty-In: péptidos de colágeno bioactivo + coenzima Q10 + biotina. Piel, cabello, uñas.

Vigor Mental:
- ON: GABA + taurina + yerba mate. Mente activa y alerta. Contiene energizantes.
- No Stress: L-teanina + ashwagandha + magnesio. Equilibrio sin somnolencia.

LÍNEA SPORT PRO EDITION:
- Biopro+ Sport: 25g proteína por stick, Actinos® (óxido nítrico, recuperación). Sabor vainilla. Post-entreno.
- Pre Sport: citrulina + β-alanina + creatina + electrolitos. Pre-entreno.
- Post Sport: BCAAs + glutamina + agua de coco + antioxidantes. Recuperación post-entreno.
- Xtra Mile: Palatinose® + agua de coco amazónico + electrolitos. Durante el ejercicio.
- Protein Active Sport: proteína 100% vegetal + BCAAs + L-glutamina. Sabores vainilla-canela y chocolate-avellanas.

LÍMITES INNEGOCIABLES
- Nunca digas que un producto cura, trata, sana o previene enfermedades. Nada de "adelgaza" ni "quema grasa".
- Si mencionan enfermedad o síntoma: empatía + "consulta a tu médico".
- No inventes precios exactos, testimonios ni resultados. Si no sabes algo, ofrece pasar con Kervin (opción 2).
- Solo temas de bienestar y FuXion; lo demás redirige con amabilidad.`

// ── Estado por contacto (SQLite) ─────────────────────────────
let db = null
function initTables(database) {
  db = database
  db.exec(`
    CREATE TABLE IF NOT EXISTS wa_contacts (
      chat_id      TEXT PRIMARY KEY,
      nombre       TEXT DEFAULT '',
      menu_at      INTEGER DEFAULT 0,
      handoff_until INTEGER DEFAULT 0,
      replies_day  TEXT DEFAULT '',
      replies_count INTEGER DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS wa_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id    TEXT NOT NULL,
      direction  TEXT NOT NULL,
      text       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `)
  // Migración v2: columnas de calificación
  const cols = db.prepare('PRAGMA table_info(wa_contacts)').all().map((c) => c.name)
  if (!cols.includes('objetivo')) db.exec("ALTER TABLE wa_contacts ADD COLUMN objetivo TEXT DEFAULT ''")
  if (!cols.includes('etiqueta')) db.exec("ALTER TABLE wa_contacts ADD COLUMN etiqueta TEXT DEFAULT 'nuevo'")
}

function getContact(chatId) {
  let c = db.prepare('SELECT * FROM wa_contacts WHERE chat_id = ?').get(chatId)
  if (!c) {
    db.prepare('INSERT INTO wa_contacts (chat_id) VALUES (?)').run(chatId)
    c = db.prepare('SELECT * FROM wa_contacts WHERE chat_id = ?').get(chatId)
  }
  return c
}

const logMsg = (chatId, dir, text) => {
  try {
    db.prepare('INSERT INTO wa_logs (chat_id, direction, text) VALUES (?, ?, ?)').run(
      chatId, dir, String(text).slice(0, 2000),
    )
  } catch { /* log no crítico */ }
}

// ── Envío por WAHA ───────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const humanDelay = () => sleep(1500 + Math.random() * 2000)

async function waSend(chatId, text) {
  const res = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_KEY },
    body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('WAHA send error', res.status, detail.slice(0, 200))
    return false
  }
  logMsg(chatId, 'out', text)
  return true
}

// ── Alerta al WhatsApp personal de Kervin ────────────────────
async function alertaKervin(titulo, chatId, nombre, body, objetivo) {
  const idLimpio = chatId.replace('@c.us', '').replace('@lid', '')
  const esLid = chatId.endsWith('@lid')
  await waSend(
    `${NOTIFY}@c.us`,
    `${titulo}\nNombre: ${nombre || 'sin nombre'}\nContacto: ${esLid ? 'ID ' + idLimpio + ' (respóndele desde el WhatsApp del 970)' : '+' + idLimpio}\nObjetivo: ${objetivo || 'aún no definido'}\nMensaje: "${body.slice(0, 150)}"${esLid ? '' : `\nEscríbele: https://wa.me/${idLimpio}`}`,
  )
}

// ── Respuesta libre con Gemini ───────────────────────────────
async function geminiReply(userText) {
  const key = process.env.GEMINI_API_KEY || ''
  if (!key) return null
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT_WA }] },
        contents: [{ role: 'user', parts: [{ text: userText.slice(0, 800) }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    return (
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || null
    )
  } catch {
    return null
  }
}

// ── Lógica principal del bot ─────────────────────────────────
async function handleMessage(payload) {
  if (!WAHA_URL || !WAHA_KEY) return
  const chatId = payload?.from || ''
  const body = String(payload?.body || '').trim()

  // Filtros anti-riesgo
  if (payload.fromMe) return
  // Solo chats 1-a-1: @c.us (clásico) o @lid (identificador nuevo de WhatsApp).
  // Fuera: grupos, canales, difusiones y estados.
  const esPrivado = chatId.endsWith('@c.us') || chatId.endsWith('@lid')
  if (!esPrivado) return
  if (chatId.includes('status') || chatId.includes('broadcast')) return

  const nombre = payload?._data?.notifyName || payload?.notifyName || ''
  const contact = getContact(chatId)
  if (nombre && nombre !== contact.nombre) {
    db.prepare('UPDATE wa_contacts SET nombre = ? WHERE chat_id = ?').run(nombre, chatId)
  }

  // Rate limit por contacto/día
  const today = new Date().toISOString().slice(0, 10)
  let { replies_day: day, replies_count: count } = contact
  if (day !== today) { day = today; count = 0 }
  if (count >= MAX_REPLIES_DAY) return // silencio total, sin spam

  logMsg(chatId, 'in', body || '(multimedia)')

  // Handoff activo: Kervin está atendiendo, el bot no interfiere
  if (Date.now() < Number(contact.handoff_until || 0)) return

  const consume = () => {
    db.prepare('UPDATE wa_contacts SET replies_day = ?, replies_count = ? WHERE chat_id = ?')
      .run(day, count + 1, chatId)
  }

  const lower = body.toLowerCase()

  // ── CALIFICACIÓN (antes de decidir la respuesta) ───────────
  // 1) Objetivo del lead: si aún no lo tenemos, intentamos detectarlo
  if (!contact.objetivo) {
    for (const [re, obj] of OBJETIVOS) {
      if (re.test(lower)) {
        db.prepare(`UPDATE wa_contacts SET objetivo = ?,
          etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
          WHERE chat_id = ?`).run(obj, chatId)
        contact.objetivo = obj
        if (contact.etiqueta === 'nuevo' || !contact.etiqueta) contact.etiqueta = 'tibio'
        break
      }
    }
  }
  // 2) Intención caliente (precio/compra): etiqueta + alerta inmediata a Kervin
  if (HOT.test(lower) && contact.etiqueta !== 'caliente') {
    db.prepare("UPDATE wa_contacts SET etiqueta = 'caliente' WHERE chat_id = ?").run(chatId)
    contact.etiqueta = 'caliente'
    await alertaKervin('🔥 *Lead CALIENTE* (intención de compra)', chatId, nombre, body, contact.objetivo)
  }

  const menuVencido = Date.now() - Number(contact.menu_at || 0) > MENU_TTL_MS
  const esSaludo = /^(hola|buenas|buenos días|buenas tardes|buenas noches|hi|hello|hey|👋|información|info|precio|precios)\b/i.test(lower)

  // 1) Menú de bienvenida: contacto nuevo, saludo, o menú vencido
  if (menuVencido && (esSaludo || !contact.menu_at || count === 0)) {
    await humanDelay()
    if (await waSend(chatId, MENU)) {
      db.prepare('UPDATE wa_contacts SET menu_at = ? WHERE chat_id = ?').run(Date.now(), chatId)
      consume()
    }
    return
  }

  // 2) Opciones del menú
  if (lower === '1' || lower === '1.') {
    await humanDelay()
    if (await waSend(chatId, OPCION_1)) {
      consume()
      await humanDelay()
      await waSend(chatId, OPCION_1_LINK) // link aparte: mejor preview y no ensucia la pregunta
    }
    return
  }
  if (lower === '2' || lower === '2.' || lower.includes('asesor') || lower.includes('hablar con') || lower.includes('kervin')) {
    await humanDelay()
    if (await waSend(chatId, OPCION_2)) {
      consume()
      // Handoff 24 h: el bot se retira para que atienda Kervin
      db.prepare('UPDATE wa_contacts SET handoff_until = ? WHERE chat_id = ?')
        .run(Date.now() + MENU_TTL_MS, chatId)
      // Aviso al personal de Kervin (su propio número, único mensaje proactivo permitido)
      await alertaKervin('🔥 *Lead caliente* pide ASESORÍA', chatId, nombre, body, contact.objetivo)
    }
    return
  }
  if (lower === '3' || lower === '3.' || lower.includes('negocio') || lower.includes('socio') || lower.includes('ganar dinero')) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'negocio',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_3)) consume(); return
  }
  if (lower === '4' || lower === '4.' || lower.includes('deporte') || lower.includes('gym') || lower.includes('gimnasio') || lower.includes('proteína') || lower.includes('entreno') || lower.includes('rendimiento')) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'deporte',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_4)) consume(); return
  }

  // 3) Texto libre → Gemini (con contexto de objetivo y fallback al menú)
  const contexto = contact.objetivo ? `[Objetivo conocido del lead: ${contact.objetivo}] ` : ''
  const reply = await geminiReply(contexto + (body || 'La persona envió una imagen o audio. Pídele amablemente que te cuente por texto qué necesita.'))
  await humanDelay()
  const final = reply || `Para ayudarte mejor, elige una opción:\n1️⃣ Productos y promoción\n2️⃣ Asesoría gratis con Kervin\n3️⃣ Negocio FuXion\n4️⃣ Proteína y deporte 💪`
  if (await waSend(chatId, final)) consume()
}

// ── Registro en Express ──────────────────────────────────────
export function registerWahaBot(app, database) {
  initTables(database)

  app.post('/api/waha-webhook', (req, res) => {
    res.json({ ok: true }) // responder rápido, procesar async
    const event = req.body?.event
    if (event !== 'message') return
    handleMessage(req.body?.payload || {}).catch((e) =>
      console.error('WAHA bot error:', e?.message || e),
    )
  })

  // Historial del bot (admin)
  app.get('/api/waha/logs', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db.prepare('SELECT * FROM wa_logs ORDER BY id DESC LIMIT 300').all()
    res.json({ ok: true, logs: rows })
  })

  // Contactos del bot con calificación (admin)
  app.get('/api/waha/contacts', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db.prepare('SELECT * FROM wa_contacts ORDER BY menu_at DESC LIMIT 300').all()
    res.json({ ok: true, contacts: rows })
  })
}
