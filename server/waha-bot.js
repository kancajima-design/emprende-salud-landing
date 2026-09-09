// ─────────────────────────────────────────────────────────────
// Emprende Salud · Bot REACTIVO de WhatsApp (WAHA)  v4.4.2
// Reglas de oro (anti-baneo):
//  - NUNCA inicia conversaciones: solo responde a quien escribe primero.
//  - Delays humanos antes de responder (1.5–3.5 s).
//  - Máximo 25 respuestas automáticas por contacto por día.
//  - Anti-flood: máximo 1 respuesta cada 8 segundos por contacto.
//  - Si el lead pide hablar con Kervin → handoff: el bot se calla 24 h.
//  - No responde grupos, estados ni difusiones.
// v3 (04-sep): LÍNEA DEPORTIVA + catálogo completo FuXion.
// v4 (08-sep): PLAYBOOK DE SEGUIMIENTO (Estrategia PRO-LEV X).
// v4.4 (09-sep): FIX bloques anidados + precio + negocio + fallback.
// v4.4.2 (09-sep): anti-flood + multimedia protegido + precio primero.
// Variables de entorno requeridas (Railway, servicio landing):
//  WAHA_API_URL, WAHA_API_KEY, WAHA_SESSION (default), WAHA_NOTIFY
// ─────────────────────────────────────────────────────────────

const WAHA_URL = (process.env.WAHA_API_URL || '').replace(/\/$/, '')
const WAHA_KEY = process.env.WAHA_API_KEY || ''
const WAHA_SESSION = process.env.WAHA_SESSION || 'default'
const NOTIFY = process.env.WAHA_NOTIFY || '51970848043' // personal de Kervin

const TIENDA = 'http://ifuxion.com/emprendesalud'
const LANDING = 'https://www.emprendesalud.net'

const MAX_REPLIES_DAY = 25
const MENU_TTL_MS = 24 * 60 * 60 * 1000
const FLOOD_MS = 8 * 1000 // anti-flood: 1 respuesta cada 8 segundos por chat

const lastReplyTs = new Map() // chatId -> timestamp última respuesta

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

const OPCION_3 = `💼 *Socio FuXion* — ganas recomendando productos de nutrición funcional que ya usas: sin inventario, sin local, la empresa envía directo a tus clientes.

1️⃣ Código propio de Emprendedor (te registro yo, 15 min)
2️⃣ Tu consumo con descuento del 20–50% desde el día 1
3️⃣ 25% de bonificación por cada socio que tú asocies
4️⃣ Bonos por duplicar tu equipo: US$50, US$200 y US$500

No empiezas de cero: te enseño el paso a paso que ya funciona en Emprende Salud.
¿Agendamos 20 min con Kervin sin compromiso? Responde *2* 📲`

const OPCION_3B = `💼 *Plan PRO-LEV X* — 10 fuentes de ingreso, sin inventario ni local:

🥇 *Bono Pack Profesional*: 25% de la 1ra compra de cada socio que patrocines.
🥈 *Venta Directa*: descuento 20–50% según tu volumen (revendes con margen).
🥉 *Cliente Preferente*: hasta US$500/ciclo por armar equipo de clientes.
🏆 *Bono Balance* (Leader X+): 5% semanal sobre tu red.
🌱 *Bono Familia X*: 2–10% por niveles de tu Familia FuXion.
🚗 *Estilo de Vida* (Elite+): S/1,260 – S/7,200 para tu auto.
✈️ *Viajes y Fondos de Liderazgo* (Diamond+): % de la venta global.

Tu inversión: un kit de inicio (desde S/99 en Perú).
¿Agendamos 20 min con Kervin para revisar números reales? Responde *2* 📲`

const OPCION_PRECIO = `💚 Para ver precios actualizados y armar tu pedido, entra directo a la tienda oficial:
${TIENDA}

Verifica que aparezca *Emprende Salud* como patrocinador ✅

Si necesitas un pack personalizado, pago con Yape/Plin o delivery, responde *2* y te paso con Kervin.`

const MSG_MULTIMEDIA = `Veo que enviaste una imagen o audio 😊 Cuéntame por *texto* qué necesitas y te oriento al toque.

1️⃣ Productos y promoción
2️⃣ Asesoría gratis con Kervin
3️⃣ Negocio FuXion
4️⃣ Proteína y deporte 💪`

const SEQ2_COMPRA = (nombre) => `¡Listo, ${nombre || 'crack'}! 🎉 Confirmo tu pedido: en pocos días llega a tu puerta.

Tip para sacarle el máximo: constancia desde el día 1 — los cambios se ven con la rutina diaria, no con días sueltos.

Cualquier duda me escribes, estoy pendiente. 💚 Te contacto en unos días para ver cómo te va.`

const SEQ3_AUTOENVIO = `Te cuento para que no se te corte la rutina justo cuando empiezas a sentir cambios 😊

Lo más cómodo es el *envío automático*: cada mes llega solo a tu casa, sin apps ni recordatorios.
✨ Precio preferente de cliente
🎁 Cada 60 puntos en autoenvío = 1 producto de regalo
🚚 Envío a domicilio siempre

¿Te lo activo igual que tu pedido anterior? Responde *sí* y lo dejamos listo.`

const SEQ3_CIERRE = `¡Hecho! ✅ Tu envío automático quedó activado.

Si algún mes quieres cambiar producto, fecha o pausar, me avisas y lo ajustamos. Tú tienes el control. 💚`

const SEQ6_REACTIVACION = `Me acordé de ti 😊 ¿cómo estás?

Cuéntame: ¿se te acabó el producto, lo pausaste por algo? Sin pena, solo quiero saber cómo sigues.

Y si quieres retomar, aquí está la tienda: ${TIENDA}`

const COMPRA_RE = /(ya compr[eé]|ya ped[ií]|hice el pedido|hice mi pedido|ya pagu[eé]|ya orden[eé]|acabo de comprar|acabo de pedir|reci[eé]n compr[eé]|ya hice la compra)/i
const REORDER_RE = /(se me acab[oó]|ya se acab[oó]|se est[aá] acabando|necesito (otro|m[aá]s)|quiero pedir|repetir pedido|nuevo pedido|cu[aá]ndo llega|cuando llega|c[uú]ando llega)/i
const AUTOENVIO_SI_RE = /^(s[ií]\b|sii+|dale|ok[kk]*|activa|perfecto|hag[aá]moslo|adelante|de una|listo)/i

const INTENT_DEPORTE_RE = /(deport|gym|gimnasio|entren|m[úu]sculo|prote[ií]na|biopro|sport|pre[- ]?entreno|post[- ]?entreno|crossfit|pesas|running|runner|whey|rendimiento|recuperaci[oó]n|muscular)/i
const INTENT_PESO_RE = /(peso|adelgaz|bajar|grasa|metabol|panza|abdomen|cintura|dieta|keto|thermo|nocarb|obesidad|sobrepeso|quema|fitness|tonificar|slim)/i
const INTENT_DIGESTION_RE = /(digest|est[óo]mago|barriga|colon|gastritis|hinchaz|hinchaz[oó]n|estreñ|diarrea|acidez|reflujo|tr[aá]nsito|intestino|prunex|flora|detox|limpieza|depur|toxinas|heces)/i
const INTENT_ENERGIA_RE = /(energ[ií]a|vitalidad|cansanc|fatiga|agotad|rendimiento|concentraci|foco|xpeed|vita xtra|vitaenergia|nutraday)/i
const INTENT_DEFENSAS_RE = /(defensa|inmun|gripe|resfr|alergia|virus|infecci|ganoderma|vera|duo defense|camu|wellmune)/i
const INTENT_BELLEZA_RE = /(belleza|piel|cabello|uñas|arrugas|rejuvenec|col[áa]geno|collagen|youth|beauty|anti-edad|articulaci|golden flx|probal|passion)/i
const PRECIO_RE = /\b(precio|precios|cu[aá]nto|cuesta|costo|costos|valor|cu[aá]nto sale|a cu[aá]nto|tarifa|tarifas)\b/i
const INTENT_NEGOCIO_RE = /\b(negocio|emprender|emprendimiento|plan de compensaci[oó]n|plan pro-lev|ingreso|ganar dinero|rentabilidad|bono|bonos|socio|distribuidor|multinivel|mlm|equipo|red|l[ií]der|diamante)\b/i

const OPCION_4 = `💪 *Línea Sport Pro Edition* — para quienes entrenan en serio:

• *Biopro+ Sport*: 25g de proteína por stick, con Actinos® (recuperación muscular más rápida). Sabor vainilla, se toma con agua fría post-entreno.
• *Pre Sport*: energía pre-entreno con citrulina, β-alanina y electrolitos.
• *Post Sport*: recuperación con BCAAs, glutamina y agua de coco.
• *Xtra Mile*: energía sostenida durante el ejercicio (Palatinose® + electrolitos).
• *Protein Active Sport*: proteína 100% vegetal, sabores vainilla-canela y chocolate-avellanas.

¿Buscas proteína, energía pre-entreno o recuperación? Te armo el stack ideal 💚`

const OPCION_5 = `⚖️ *Control de Peso* — sin pasar hambre ni contar calorías:

• *Pack 5/14 Keto*: reto 14 días con plan de comidas, batidos Fit, NoCarb-T, Thermo T3 y Prunex1.
• *Thermo T3*: acelera el metabolismo con 3 tés + L-carnitina + cetonas de frambuesa.
• *NoCarb-T*: bloquea carbohidratos post-comida (fibras + té verde + cromo).
• *Chocolate Fit*: cacao amazónico + proteína vegetal + café verde.

¿Quieres el reto completo de 14 días o prefieres empezar con algo más suave? Te armo el plan 💚`

const OPCION_6 = `🍃 *Digestión Liviana* — todo empieza depurando:

• *Detox 5 días*: limpieza inicial con Rexet, Prunex1, Flora Liv, Berry Balance, Alpha Balance, Liquid Fiber, Thermo T3, Protein Active Fit + plan nutricional.
• *Flora Liv*: probióticos + prebióticos + granadilla, todos los días. Preparar con agua fría o tibia.
• *Prunex1*: té herbal de guindón para el tránsito. Solo noches, ciclos de 5-7 días.
• *Liquid Fiber*: fibra prebiótica sabor limón para saciedad y tránsito.

¿Empiezas con el Detox de 5 días o prefieres Flora Liv diario? 💚`

const OPCION_7 = `⚡ *Energía sin bajones* — natural, sin cafeína sintética:

• *Vita Xtra T+*: guayusa + té verde + maca + ginseng. En el desayuno (NO para hipertensos).
• *Vitaenergia*: multivitamínico SIN energizantes. Para toda la familia.
• *Xpeed*: guaraná + maca + teína. Pack x 4 sticks.
• *Nutraday*: refresco multivitamínico con moringa.

¿Buscas energía de inmediato o nutrición sostenida para todo el día? 💚`

const OPCION_8 = `🛡️ *Defensas e Inmunidad* — refuerza tus barreras naturales:

• *Duo Defense*: Camu-C + Vera+ (defensas combinadas).
• *Vera+*: aloe vera + betaglucanos + Wellmune®.
• *Flora Liv*: probióticos en el desayuno (70% del sistema inmune está en el intestino).
• *Gano+ T*: té de Ganoderma lucidum + té blanco (antioxidante).
• *Gano+ Cappuccino*: cappuccino con Ganoderma.

¿Te sientes bajo de defensas o quieres prevenir? Te armo el stack 💚`

const OPCION_9 = `✨ *Belleza desde adentro* — piel, cabello, uñas y articulaciones:

• *Beauty-In*: péptidos de colágeno bioactivo + coenzima Q10 + biotina.
• *Youth Elixir HGH*: aminoácidos + resveratrol + antioxidantes. Antes de dormir.
• *Golden FLX*: cúrcuma orgánica + jengibre + leche de coco. Articulaciones.
• *Flora Liv*: probióticos diarios (belleza empieza en el intestino).

¿Tu foco es piel/cabello, articulaciones o rejuvenecimiento general? 💚`

const OBJETIVOS = [
  [/energ|cansanc|fatiga|agotad/i, 'energia'],
  [/peso|adelgaz|bajar|grasa|metabol|panza/i, 'peso'],
  [/digest|est[óo]mago|barriga|colon|gastritis|hinchaz/i, 'digestion'],
  [/defensa|inmun|gripe|resfr/i, 'defensas'],
  [/belleza|piel|cabello|uñas|arrugas/i, 'belleza'],
  [/negocio|dinero|ingreso|socio|emprend/i, 'negocio'],
  [/deport|gym|gimnasio|entren|músculo|musculo|proteína|proteina|rendimiento|recuperación|pre-entreno|post-entreno|crossfit|pesas|running|runner/i, 'deporte'],
]
const HOT = /(precio|cu[aá]nto|cuesta|costo|comprar|c[oó]mo pago|yape|plin|oferta|descuento|promoci)/i

const SYSTEM_PROMPT_WA = `Eres Valeria, asistente de WhatsApp de Emprende Salud, distribuidor independiente oficial de FuXion en Perú. Atiendes a personas que escriben primero al WhatsApp del negocio.

ESTILO
- Español peruano, tuteo, cálida. MÁXIMO 50 palabras por mensaje. Usa *negritas* de WhatsApp con un asterisco.
- 1 emoji ocasional (💚✨). Nunca más de 2.
- No repitas el menú numerado; ese ya lo envía el sistema. Responde la duda directa.
- SI preguntan precio exacto: NO lo inventes. Diles "Entra a la tienda para ver precios actualizados" o ofrece pasar con Kervin (opción 2).

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
  const cols = db.prepare('PRAGMA table_info(wa_contacts)').all().map((c) => c.name)
  if (!cols.includes('objetivo')) db.exec("ALTER TABLE wa_contacts ADD COLUMN objetivo TEXT DEFAULT ''")
  if (!cols.includes('etiqueta')) db.exec("ALTER TABLE wa_contacts ADD COLUMN etiqueta TEXT DEFAULT 'nuevo'")
  if (!cols.includes('etapa')) db.exec("ALTER TABLE wa_contacts ADD COLUMN etapa TEXT DEFAULT 'lead'")
  if (!cols.includes('compra_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN compra_at INTEGER DEFAULT 0')
  if (!cols.includes('alerta_2528_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN alerta_2528_at INTEGER DEFAULT 0')
  if (!cols.includes('alerta_react_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN alerta_react_at INTEGER DEFAULT 0')
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

async function alertaKervin(titulo, chatId, nombre, body, objetivo) {
  const idLimpio = chatId.replace('@c.us', '').replace('@lid', '')
  const esLid = chatId.endsWith('@lid')
  await waSend(
    `${NOTIFY}@c.us`,
    `${titulo}\nNombre: ${nombre || 'sin nombre'}\nContacto: ${esLid ? 'ID ' + idLimpio + ' (respóndele desde el WhatsApp del 970)' : '+' + idLimpio}\nObjetivo: ${objetivo || 'aún no definido'}\nMensaje: "${body.slice(0, 150)}"${esLid ? '' : `\nEscríbele: https://wa.me/${idLimpio}`}`,
  )
}

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

async function handleMessage(payload) {
  if (!WAHA_URL || !WAHA_KEY) return
  const chatId = payload?.from || ''
  const body = String(payload?.body || '').trim()

  if (payload.fromMe) return
  const esPrivado = chatId.endsWith('@c.us') || chatId.endsWith('@lid')
  if (!esPrivado) return
  if (chatId.includes('status') || chatId.includes('broadcast')) return

  // Anti-flood in-memory: si ya respondimos hace menos de FLOOD_MS, ignorar
  const lastTs = lastReplyTs.get(chatId) || 0
  if (Date.now() - lastTs < FLOOD_MS) {
    console.log('[anti-flood] Ignorado para', chatId)
    return
  }

  const nombre = payload?._data?.notifyName || payload?.notifyName || ''
  const contact = getContact(chatId)
  if (nombre && nombre !== contact.nombre) {
    db.prepare('UPDATE wa_contacts SET nombre = ? WHERE chat_id = ?').run(nombre, chatId)
  }

  const today = new Date().toISOString().slice(0, 10)
  let { replies_day: day, replies_count: count } = contact
  if (day !== today) { day = today; count = 0 }
  if (count >= MAX_REPLIES_DAY) return

  logMsg(chatId, 'in', body || '(multimedia)')

  if (Date.now() < Number(contact.handoff_until || 0)) return

  const consume = () => {
    db.prepare('UPDATE wa_contacts SET replies_day = ?, replies_count = ? WHERE chat_id = ?')
      .run(day, count + 1, chatId)
    lastReplyTs.set(chatId, Date.now())
  }

  const lower = body.toLowerCase()

  // ── CALIFICACIÓN ────────────────────────────────────────────
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
  if (HOT.test(lower) && contact.etiqueta !== 'caliente') {
    db.prepare("UPDATE wa_contacts SET etiqueta = 'caliente' WHERE chat_id = ?").run(chatId)
    contact.etiqueta = 'caliente'
    await alertaKervin('🔥 *Lead CALIENTE* (intención de compra)', chatId, nombre, body, contact.objetivo)
  }

  // ── SECUENCIAS PLAYBOOK (reactivas) ─────────────────────────
  if (COMPRA_RE.test(lower) && contact.etapa !== 'ef') {
    db.prepare(`UPDATE wa_contacts SET compra_at = ?, etapa = 'cliente',
      alerta_2528_at = 0, alerta_react_at = 0 WHERE chat_id = ?`)
      .run(Date.now(), chatId)
    await humanDelay()
    if (await waSend(chatId, SEQ2_COMPRA(nombre))) consume()
    return
  }
  if (REORDER_RE.test(lower) && ['cliente', 'autoenvio'].includes(contact.etapa)) {
    db.prepare("UPDATE wa_contacts SET etapa = 'autoenvio_pendiente' WHERE chat_id = ?").run(chatId)
    await humanDelay()
    if (await waSend(chatId, SEQ3_AUTOENVIO)) consume()
    return
  }
  if (AUTOENVIO_SI_RE.test(lower) && contact.etapa === 'autoenvio_pendiente') {
    db.prepare("UPDATE wa_contacts SET etapa = 'autoenvio', compra_at = ? WHERE chat_id = ?")
      .run(Date.now(), chatId)
    await humanDelay()
    if (await waSend(chatId, SEQ3_CIERRE)) consume()
    return
  }

  // ── MULTIMEDIA: respuesta única, NO va a Gemini ─────────────
  if (!body) {
    await humanDelay()
    if (await waSend(chatId, MSG_MULTIMEDIA)) consume()
    return
  }

  // ── RUTAS DIRECTAS POR INTENCIÓN (v4.4.2) ──────────────────
  // Precio — máxima prioridad
  if (PRECIO_RE.test(lower)) {
    await humanDelay(); if (await waSend(chatId, OPCION_PRECIO)) consume(); return
  }
  // Deporte
  if (INTENT_DEPORTE_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'deporte',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_4)) consume(); return
  }
  // Negocio fuerte (Plan PRO-LEV X)
  if (INTENT_NEGOCIO_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'negocio',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_3B)) consume(); return
  }
  // Peso
  if (INTENT_PESO_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'peso',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_5)) consume(); return
  }
  // Digestión
  if (INTENT_DIGESTION_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'digestion',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_6)) consume(); return
  }
  // Energía
  if (INTENT_ENERGIA_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'energia',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_7)) consume(); return
  }
  // Defensas
  if (INTENT_DEFENSAS_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'defensas',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_8)) consume(); return
  }
  // Belleza
  if (INTENT_BELLEZA_RE.test(lower)) {
    if (!contact.objetivo) {
      db.prepare(`UPDATE wa_contacts SET objetivo = 'belleza',
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END
        WHERE chat_id = ?`).run(chatId)
    }
    await humanDelay(); if (await waSend(chatId, OPCION_9)) consume(); return
  }

  // ── MENÚ Y OPCIONES NUMERADAS ───────────────────────────────
  const menuVencido = Date.now() - Number(contact.menu_at || 0) > MENU_TTL_MS
  const esSaludo = /^(hola|buenas|buenos días|buenas tardes|buenas noches|hi|hello|hey|👋|información|info)\b/i.test(lower)

  if (menuVencido && (esSaludo || !contact.menu_at || count === 0)) {
    await humanDelay()
    if (await waSend(chatId, MENU)) {
      db.prepare('UPDATE wa_contacts SET menu_at = ? WHERE chat_id = ?').run(Date.now(), chatId)
      consume()
    }
    return
  }

  if (lower === '1' || lower === '1.') {
    await humanDelay()
    if (await waSend(chatId, OPCION_1)) {
      consume()
      await humanDelay()
      await waSend(chatId, OPCION_1_LINK)
    }
    return
  }
  if (lower === '2' || lower === '2.' || lower.includes('asesor') || lower.includes('hablar con') || lower.includes('kervin')) {
    await humanDelay()
    if (await waSend(chatId, OPCION_2)) {
      consume()
      db.prepare('UPDATE wa_contacts SET handoff_until = ? WHERE chat_id = ?')
        .run(Date.now() + MENU_TTL_MS, chatId)
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

  // ── FALLBACK GEMINI ─────────────────────────────────────────
  const contexto =
    (contact.objetivo ? `[Objetivo conocido del lead: ${contact.objetivo}] ` : '') +
    (contact.etapa && contact.etapa !== 'lead' ? `[Etapa en el embudo: ${contact.etapa}] ` : '') +
    `[REGLA: si pregunta precio exacto, redirige a tienda o opción 2 con Kervin; nunca inventes precios.]`
  const reply = await geminiReply(contexto + body)
  await humanDelay()
  const final = reply || `Para ayudarte mejor, elige una opción:\n1️⃣ Productos y promoción\n2️⃣ Asesoría gratis con Kervin\n3️⃣ Negocio FuXion\n4️⃣ Proteína y deporte 💪`
  if (await waSend(chatId, final)) consume()
}

const DIA_MS = 24 * 60 * 60 * 1000
async function sweepSeguimiento() {
  if (!WAHA_URL || !WAHA_KEY || !db) return
  const now = Date.now()
  const rows = db.prepare(
    `SELECT chat_id, nombre, etapa, compra_at, alerta_2528_at, alerta_react_at
     FROM wa_contacts WHERE compra_at > 0 AND etapa != 'ef'`,
  ).all()
  for (const r of rows) {
    const dias = (now - Number(r.compra_at || 0)) / DIA_MS
    try {
      if (dias >= 25 && dias <= 32 && !Number(r.alerta_2528_at)) {
        db.prepare('UPDATE wa_contacts SET alerta_2528_at = ? WHERE chat_id = ?').run(now, r.chat_id)
        await alertaKervin(
          '📦 *DÍA 25–28: toca autoenvío* (Secuencia 3 del playbook)',
          r.chat_id, r.nombre,
          `Última compra hace ${Math.round(dias)} días. Envíale el mensaje de invitación a autoenvío (whatsapp-playbook-valeria.md → Secuencia 3).`,
          '',
        )
      } else if (dias > 35 && !Number(r.alerta_react_at)) {
        db.prepare('UPDATE wa_contacts SET alerta_react_at = ? WHERE chat_id = ?').run(now, r.chat_id)
        await alertaKervin(
          '🔁 *REACTIVACIÓN: 35+ días sin compra* (Secuencia 6 del playbook)',
          r.chat_id, r.nombre,
          `Sin recompra hace ${Math.round(dias)} días. Envíale el mensaje de reactivación (whatsapp-playbook-valeria.md → Secuencia 6).`,
          '',
        )
      }
    } catch (e) {
      console.error('sweep error', e?.message || e)
    }
  }
}

export function registerWahaBot(app, database) {
  initTables(database)

  app.post('/api/waha-webhook', (req, res) => {
    try {
      res.json({ ok: true })
      const event = req.body?.event
      if (event !== 'message') return
      handleMessage(req.body?.payload || {}).catch((e) =>
        console.error('WAHA bot error:', e?.message || e),
      )
    } catch (e) {
      console.error('WAHA webhook error:', e?.message || e)
      res.status(200).json({ ok: true })
    }
  })

  app.get('/api/waha/logs', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db.prepare('SELECT * FROM wa_logs ORDER BY id DESC LIMIT 300').all()
    res.json({ ok: true, logs: rows })
  })

  app.get('/api/waha/contacts', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db.prepare('SELECT * FROM wa_contacts ORDER BY menu_at DESC LIMIT 300').all()
    res.json({ ok: true, contacts: rows })
  })

  app.post('/api/waha/estado', (req, res) => {
    const key = req.body?.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const chatId = String(req.body?.chat_id || '')
    if (!chatId) return res.status(400).json({ ok: false, error: 'Falta chat_id' })
    const ETAPAS = ['lead', 'cliente', 'autoenvio_pendiente', 'autoenvio', 'ef']
    if (req.body?.etapa && ETAPAS.includes(req.body.etapa)) {
      db.prepare('UPDATE wa_contacts SET etapa = ? WHERE chat_id = ?').run(req.body.etapa, chatId)
    }
    if (req.body?.compra) {
      db.prepare(`UPDATE wa_contacts SET etapa = 'cliente', compra_at = ?,
        alerta_2528_at = 0, alerta_react_at = 0 WHERE chat_id = ?`)
        .run(Date.now(), chatId)
    }
    res.json({ ok: true, contact: db.prepare('SELECT chat_id, nombre, etapa, compra_at FROM wa_contacts WHERE chat_id = ?').get(chatId) })
  })

  sweepSeguimiento()
  setInterval(sweepSeguimiento, 60 * 60 * 1000)

  app.get('/api/waha/ping', (_req, res) => res.json({ ok: true, v: '4.4.2', ts: Date.now() }))
  console.log('✅ Valeria v4.4.2 registrada (anti-flood + multimedia + precio primero)')
}
