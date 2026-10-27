// ─────────────────────────────────────────────────────────────
// Emprende Salud · Asistente IA del sitio (Gemini)
// Responde dudas sobre productos FuXion, la promoción de Cliente
// Preferente y cómo comprar.
// Requiere GEMINI_API_KEY en el entorno (Railway variable).
// ─────────────────────────────────────────────────────────────
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
// Modelos de respaldo: cada modelo tiene su propia cuota (el plan gratis permite 5 mensajes/min)
// y a veces responde "alta demanda"; si uno falla se pasa al siguiente.
const MODELOS = [GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.8-flash'].filter(
  (m, i, arr) => arr.indexOf(m) === i,
)
const geminiUrl = (modelo) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

// ── Base de conocimiento: catálogo condensado ────────────────
let catalogo = []
try {
  catalogo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'catalogo-chat.json'), 'utf-8'),
  )
} catch {
  console.warn('⚠️  catalogo-chat.json no encontrado; el chat responderá sin catálogo')
}

// WhatsApp Business de Kervin (atendido a mano desde la app; el número anterior, 970, fue baneado).
// ifuxion.com/emprendesalud pregunta primero Cliente Preferente o Emprendedor: para comprar se usan los
// PowerLinks de cada producto o el catálogo de la web.
const WHATSAPP = '+51 907 793 042'
const WA_LINK = 'https://wa.me/51907793042'
const CATALOGO_WEB = 'https://www.emprendesalud.net/#catalogo'
const LANDING = 'https://www.emprendesalud.net'
// PowerLinks de los combos Sport (creados en offix.fuxion.com el 26-10-2026)
const PLANES = {
  full: 'https://tiendafuxion.com/storelt/emprendesalud/3193468',
  fondista: 'https://tiendafuxion.com/storelt/emprendesalud/3193466',
  gym: 'https://tiendafuxion.com/storelt/emprendesalud/3193467',
  arranque: 'https://tiendafuxion.com/storelt/emprendesalud/3193469',
}
const CANAL_ASESORIA = `WhatsApp ${WHATSAPP} ([Escribir por WhatsApp](${WA_LINK}))`

function catalogoTexto() {
  return catalogo
    .map((p) => {
      const precios = (p.precios || [])
        .map((x) => `${x.presentacion}: ${x.precio}${x.puntos ? ` (${x.puntos} puntos)` : ''}`)
        .join(' · ')
      const beneficios = (p.para_que_sirve || []).join('; ')
      const uso = p.uso ? ` Cómo se toma: ${p.uso}` : ''
      const compra = p.tienda ? `Compra: ${p.tienda}` : `Compra: sin enlace directo, se pide por WhatsApp (${WA_LINK})`
      return `- ${p.nombre} (línea ${p.linea}) — "${p.tagline}". Sirve para: ${beneficios}. Ingredientes: ${p.ingredientes}.${uso} Precios ref.: ${precios}. ${compra}`
    })
    .join('\n')
}

const SYSTEM_PROMPT = `Eres Valeria, la asistente virtual de Emprende Salud, distribuidor independiente oficial de FuXion en Perú. Atiendes a los visitantes de ${LANDING}.

PERSONALIDAD Y ESTILO
- Español peruano, tuteo, cálida y cercana. Frases cortas, claras, cero tecnicismos innecesarios.
- Respuestas breves: máximo 70 palabras salvo que pidan detalle. Si recomiendas productos, menciona MÁXIMO 2, con su enlace de compra. Usa listas cortas cuando ayude.
- Puedes usar 1 emoji ocasional (💚✨), nunca más.
- FORMATO SIEMPRE CONSISTENTE (el chat lo renderiza así): listas con "- " como viñeta; nombre de cada producto en negrita con doble asterisco (**Vita Xtra T+**); y cada producto recomendado con su precio de referencia y su enlace de compra en formato [Comprar Nombre](URL del catálogo). Nunca pegues URLs sueltas ni uses otro estilo de viñeta o de negrita.

QUÉ SÍ PUEDES HACER
- Explicar qué es FuXion y la nutrición funcional.
- Recomendar productos del catálogo según el objetivo de la persona (energía, control de peso, digestión, defensas, belleza, rendimiento).
- Explicar la PROMOCIÓN DE CLIENTE PREFERENTE tal cual: registro GRATIS; con 60 puntos en autoenvío o con 80 puntos en compra directa recibe 1 producto de regalo de hasta 20 puntos, que elige de la lista de la tienda.
- AUTOENVÍO: es el pedido automático que llega cada semana, cada 2 semanas o cada 4 semanas (el cliente elige) y se cobra solo a su tarjeta; si la tarjeta es rechazada no se cobra nada. Se activa DESPUÉS de la primera compra: el cliente entra a su cuenta FuXion, sección Autoenvío, vuelve a elegir los productos, la fecha y la frecuencia, y registra su tarjeta. El enlace del plan no activa el autoenvío por sí solo. Ofrece que Kervin lo ayude a activarlo por WhatsApp.
- PLANES SPORT (combos listos en un solo carrito; recomiéndalos a quien entrena, con su enlace [Comprar Plan ...](URL)):
  - **Plan Full Sport**: PRE SPORT + XTRA MILE + POST SPORT + BIOPRO+ SPORT caja 14 · 84 puntos · S/ 548.00 · regalo en la misma compra (pasa de 80) · ${PLANES.full}
  - **Plan Fondista** (correr, ciclismo): PRE SPORT + XTRA MILE + POST SPORT · 64 puntos · S/ 415.50 · regalo solo con autoenvío · ${PLANES.fondista}
  - **Plan Gym**: PRE SPORT + POST SPORT + BIOPRO+ SPORT caja 14 · 64 puntos · S/ 418.50 · regalo solo con autoenvío · ${PLANES.gym}
  - **Plan Arranque** (para probar): PRE SPORT + POST SPORT · 44 puntos · S/ 286.00 · sin regalo · ${PLANES.arranque}
  Si alguien quiere el regalo sin autoenvío, recomienda el Plan Full Sport.
- Explicar cómo comprar: con el enlace [Comprar Producto] de cada producto (abre el carrito de la tienda oficial FuXion con Emprende Salud como patrocinador; ahí mismo se registra gratis como Cliente Preferente), desde el catálogo de la web (${CATALOGO_WEB}) o por ${CANAL_ASESORIA}. Nunca envíes el enlace ifuxion.com.
- Emprende Salud es una tienda 100 % virtual: no hay local ni recojo en tienda. Envío a domicilio a todo el Perú; desde otros países se compra en la misma tienda oficial eligiendo el país (precios distintos). Costo y plazo de envío dependen de la ciudad y se ven al pagar o se confirman por WhatsApp.
- Hablar de la Guía Sport gratis que se descarga en la página: qué comer y tomar antes, durante y después de entrenar, prueba de sudor, proteína según el peso y reto de 14 días.
- No promuevas la oportunidad de negocio, el registro como emprendedor ni planes de compensación. Si el usuario pregunta directamente por eso, responde en una frase que Kervin lo conversa por llamada telefónica y vuelve a los productos.
- Si preguntan precios: da los precios de referencia del catálogo, aclarando que pueden variar y que el precio vigente se confirma en la tienda o por WhatsApp.
- PUNTOS POR PRODUCTO: el catálogo de abajo indica los puntos (QV) oficiales de cada presentación. Úsalos con confianza para explicar la promoción y ayudar a armar packs: suma productos hasta 60 puntos (autoenvío) u 80 puntos (compra directa) y propón combinaciones concretas con su total de puntos y precio aproximado. Si un producto no indica puntos, di que se confirma en la tienda.

LÍMITES (INNEGOCIABLES)
- Los productos FuXion son alimentos y bebidas funcionales, NO medicamentos. Nunca digas que curan, tratan, previenen o eliminan enfermedades. No uses palabras como cura, sana, adelgaza, quema grasa.
- Nunca diagnostiques ni des consejo médico. Si mencionan una enfermedad, lesión, síntoma, embarazo, medicación o a un niño (cálculos, gastritis, diabetes, parásitos, fracturas, etc.): responde con empatía, recomienda consultar a su médico y NO recomiendes ningún producto para esa condición ni digas que un producto ayuda con ella. Puedes ofrecer que Kervin lo atienda por WhatsApp.
- Usa SOLO los datos del catálogo de abajo: precios, presentaciones, puntos y enlaces exactos. No existen presentaciones que no estén listadas (por ejemplo, no hay cajas de 7 sticks de la línea Sport). Si un producto no tiene enlace, ofrece pedirlo por WhatsApp.
- No inventes testimonios, cifras de clientes, resultados, tablas nutricionales, plazos de envío ni qué productos se pueden elegir como regalo (eso lo muestra la tienda al hacer el pedido).
- Si no sabes algo o piden la tabla nutricional, dilo con honestidad y ofrece el WhatsApp ${WHATSAPP} con el enlace [Escribir por WhatsApp](${WA_LINK}).
- No hables de política, religión ni temas ajenos a bienestar y FuXion; redirige con amabilidad.

CONTACTO CON KERVIN (LEADS)
- Cuando la persona muestre interés de compra (pregunta cómo comprar, pide precio de un plan, dice que lo quiere, duda entre opciones o pide ayuda con el autoenvío), ofrece UNA sola vez: "Si quieres, déjame tu nombre y tu WhatsApp y Kervin te escribe para ayudarte con tu pedido." Nunca insistas ni lo pidas como condición para responder.
- Si la persona te da su número, agradece en una frase, confirma que Kervin le escribirá a ese número dentro del horario de atención (lunes a sábado, 9:00 a 21:00) y sigue ayudándola. No repitas el número completo.

CTA FINAL
- Cierra respuestas clave con UNA invitación suave: comprar con el enlace del producto o escribir a Kervin por ${CANAL_ASESORIA} para asesoría personalizada. No repitas el CTA en cada mensaje si la conversación ya lo tiene.

CATÁLOGO FUXION PERÚ (referencia; precios ref. catálogo, confirmar vigentes):
${catalogoTexto()}
`

// ── Rate limit del chat: 20 mensajes / 10 min / IP ───────────
const chatHits = new Map()
function chatRateLimit(req, res, next) {
  const ip = req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const entry = chatHits.get(ip) || { count: 0, reset: now + windowMs }
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs }
  entry.count += 1
  chatHits.set(ip, entry)
  if (entry.count > 20) {
    return res.status(429).json({
      ok: false,
      error: `Vamos muy rápido 😅 Espera unos minutos o escríbele a Kervin: [Escribir por WhatsApp](${WA_LINK})`,
    })
  }
  next()
}

const FALLBACK_REPLY =
  `Uy, se me cortó la conexión 🙈 Para no hacerte esperar, escríbele a Kervin por WhatsApp (${WHATSAPP}) y te responde personalmente: [Escribir por WhatsApp](${WA_LINK}). También puedes ver los productos en el [catálogo](${CATALOGO_WEB}) 💚`

const LEAD_FALLBACK_REPLY =
  `¡Gracias! 🙌 Ya le pasé tu número a Kervin y te escribe por WhatsApp dentro del horario de atención (lunes a sábado, 9:00 a 21:00). Si prefieres, también puedes escribirle tú: [Escribir por WhatsApp](${WA_LINK}) 💚`

// ── Leads desde el chat: si el visitante deja su WhatsApp, se guarda en la tabla leads ──
// Celular peruano (9 dígitos que empiezan en 9, con o sin +51) o número internacional con +.
const RE_CELULAR = /(?:\+?51[\s-]?)?\b9\d{2}[\s-]?\d{3}[\s-]?\d{3}\b|\+\d{1,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/
const RE_NOMBRE = /\b(?:me llamo|mi nombre es|soy)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)?)/i
const NO_SON_NOMBRES = /^(de|del|el|la|un|una|muy|nuevo|nueva|corredor|corredora|deportista|ciclista|cliente)$/i

function extraerWhatsapp(texto) {
  const m = texto.match(RE_CELULAR)
  if (!m) return ''
  const digitos = m[0].replace(/\D/g, '')
  if (digitos.length === 9) return `+51${digitos}`
  return `+${digitos}`
}

function extraerNombre(mensajesUsuario) {
  for (const t of mensajesUsuario) {
    const m = t.match(RE_NOMBRE)
    if (!m) continue
    const [primero, segundo] = m[1].split(/\s+/)
    if (NO_SON_NOMBRES.test(primero)) continue
    // El segundo nombre solo si viene con mayúscula ("soy Rosa Pérez", no "soy Rosa mi número")
    return segundo && /^[A-ZÁÉÍÓÚÑ]/.test(segundo) ? `${primero} ${segundo}` : primero
  }
  return 'Visitante del chat'
}

// Qué le interesa: planes o productos del catálogo mencionados en la conversación
function extraerInteres(messages) {
  const texto = messages.map((m) => m.text).join(' ').toLowerCase()
  const nombres = ['Plan Full Sport', 'Plan Fondista', 'Plan Gym', 'Plan Arranque', ...catalogo.map((p) => p.nombre)]
  const escapar = (n) => n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const vistos = nombres.filter((n) => new RegExp(`(^|[^a-záéíóúñ0-9])${escapar(n)}($|[^a-záéíóúñ0-9])`).test(texto))
  const interes = vistos.length
    ? vistos.slice(0, 3).join(', ')
    : messages.find((m) => m.role === 'user')?.text || ''
  return `Chat Valeria: ${interes}`.slice(0, 80)
}

// Gemini con razonamiento bajo (responde en segundos); si un modelo falla o se demora, prueba el siguiente.
async function pedirAGemini(messages) {
  for (const modelo of MODELOS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    try {
      const geminiRes = await fetch(geminiUrl(modelo), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2000,
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
        signal: controller.signal,
      })
      if (!geminiRes.ok) {
        const detail = await geminiRes.text().catch(() => '')
        throw new Error(`Gemini ${geminiRes.status} ${detail.slice(0, 200)}`)
      }
      const data = await geminiRes.json()
      const reply = data?.candidates?.[0]?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text || '')
        .join('')
        .trim()
      if (reply) return reply
      throw new Error(`Gemini sin texto (${data?.candidates?.[0]?.finishReason || 'sin candidato'})`)
    } catch (err) {
      console.error(`Chat ${modelo}:`, err?.message || err)
    } finally {
      clearTimeout(timeout)
    }
  }
  return null
}

export function registerChat(app, db) {
  // Log de conversaciones (para saber qué pregunta la gente)
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT    NOT NULL DEFAULT '',
      role       TEXT    NOT NULL,
      text       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_logs(created_at);
  `)
  const insertChat = db.prepare(
    'INSERT INTO chat_logs (session_id, role, text) VALUES (?, ?, ?)',
  )
  // La tabla leads la crea server/index.js; los leads del chat van con origen 'chat-valeria'
  const insertLeadChat = db.prepare(
    "INSERT INTO leads (nombre, whatsapp, correo, producto, origen, utm) VALUES (?, ?, '', ?, 'chat-valeria', ?)",
  )
  const leadReciente = db.prepare(
    "SELECT id FROM leads WHERE whatsapp = ? AND created_at >= datetime('now', 'localtime', '-1 day')",
  )

  // Devuelve true si guardó un lead nuevo con el WhatsApp que el visitante escribió
  function guardarLeadDelChat(messages, userText, sessionId) {
    const whatsapp = extraerWhatsapp(userText)
    if (!whatsapp) return false
    try {
      if (leadReciente.get(whatsapp)) return false
      const usuario = messages.filter((m) => m.role === 'user').map((m) => m.text)
      insertLeadChat.run(extraerNombre(usuario), whatsapp, extraerInteres(messages), `chat:${sessionId}`.slice(0, 200))
      return true
    } catch (err) {
      console.error('Lead del chat no guardado:', err?.message || err)
      return false
    }
  }

  app.post('/api/chat', chatRateLimit, async (req, res) => {
    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : []
    const sessionId = String(req.body?.sessionId ?? '').slice(0, 60)

    const messages = rawMessages
      .slice(-12)
      .map((m) => ({
        role: m?.role === 'model' ? 'model' : 'user',
        text: String(m?.text ?? '').trim().slice(0, 600),
      }))
      .filter((m) => m.text.length > 0)

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ ok: false, error: 'Mensaje inválido' })
    }

    const userText = messages[messages.length - 1].text
    try {
      insertChat.run(sessionId, 'user', userText)
    } catch { /* log no crítico */ }

    // El lead se guarda aunque Gemini falle: el número no se pierde
    const leadGuardado = guardarLeadDelChat(messages, userText, sessionId)

    const reply = GEMINI_API_KEY ? await pedirAGemini(messages) : null
    const respaldo = leadGuardado ? LEAD_FALLBACK_REPLY : FALLBACK_REPLY

    // Se guarda también el fallback (role 'fallback') para ver cuántas veces falla
    try {
      insertChat.run(sessionId, reply ? 'model' : 'fallback', (reply || respaldo).slice(0, 2000))
    } catch { /* log no crítico */ }

    res.json({ ok: true, reply: reply || respaldo, fallback: !reply, lead: leadGuardado })
  })

  // Preguntas frecuentes del chat (admin) — útil para mejorar el sitio
  app.get('/api/chat/logs', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db
      .prepare('SELECT * FROM chat_logs ORDER BY id DESC LIMIT 200')
      .all()
    res.json({ ok: true, logs: rows })
  })
}
