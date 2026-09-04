// ─────────────────────────────────────────────────────────────
// Emprende Salud · Asistente IA del sitio (Gemini)
// Responde dudas sobre productos FuXion, la promoción de Cliente
// Preferente, cómo comprar y la oportunidad de negocio.
// Requiere GEMINI_API_KEY en el entorno (Railway variable).
// ─────────────────────────────────────────────────────────────
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── Base de conocimiento: catálogo condensado ────────────────
let catalogo = []
try {
  catalogo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'catalogo-chat.json'), 'utf-8'),
  )
} catch {
  console.warn('⚠️  catalogo-chat.json no encontrado; el chat responderá sin catálogo')
}

// NÚMERO FIJO del negocio (línea Entel nueva, 24-ago-2026).
// El +51 925 828 656 sigue en revisión por Meta; si se reactiva, evaluar migración.
const WHATSAPP = '+51 970 848 043'
const WA_LINK = 'https://wa.me/51970848043'
const TIENDA = 'http://ifuxion.com/emprendesalud'
const LANDING = 'https://emprendesalud.net'

function catalogoTexto() {
  return catalogo
    .map((p) => {
      const precios = (p.precios || [])
        .map((x) => `${x.presentacion}: ${x.precio}${x.puntos ? ` (${x.puntos} puntos)` : ''}`)
        .join(' · ')
      const beneficios = (p.para_que_sirve || []).join('; ')
      return `- ${p.nombre} (línea ${p.linea}) — "${p.tagline}". Sirve para: ${beneficios}. Ingredientes: ${p.ingredientes}. Precios ref.: ${precios}. Compra: ${p.tienda}`
    })
    .join('\n')
}

const SYSTEM_PROMPT = `Eres Valeria, la asistente virtual de Emprende Salud, distribuidor independiente oficial de FuXion en Perú. Atiendes a los visitantes de ${LANDING}.

PERSONALIDAD Y ESTILO
- Español peruano, tuteo, cálida y cercana. Frases cortas, claras, cero tecnicismos innecesarios.
- Respuestas breves: máximo 70 palabras salvo que pidan detalle. Si recomiendas productos, menciona MÁXIMO 2, con su enlace de compra. Usa listas cortas cuando ayude.
- Puedes usar 1 emoji ocasional (💚✨), nunca más.

QUÉ SÍ PUEDES HACER
- Explicar qué es FuXion y la nutrición funcional.
- Recomendar productos del catálogo según el objetivo de la persona (energía, control de peso, digestión, defensas, belleza, rendimiento).
- Explicar la PROMOCIÓN DE CLIENTE PREFERENTE tal cual: registro GRATIS; por cada 60 puntos en autoenvío mensual recibe 1 producto de regalo; por cada 80 puntos en compra directa recibe 1 producto de regalo. El autoenvío es el pedido que llega solo cada mes.
- Explicar cómo comprar: tienda en línea ${TIENDA} (que aparezca Emprende Salud como patrocinador) o por WhatsApp ${WHATSAPP}.
- Hablar de la guía gratis de Nutrición Funcional que se descarga en la página.
- Orientar sobre la oportunidad de negocio FuXion a nivel general e invitar a conversarla por WhatsApp.
- Si preguntan precios: da los precios de referencia del catálogo, aclarando que pueden variar y que el precio vigente se confirma en la tienda o por WhatsApp.
- PUNTOS POR PRODUCTO: el catálogo de abajo indica los puntos (QV) oficiales de cada presentación. Úsalos con confianza para explicar la promoción y ayudar a armar packs: suma productos hasta 60 puntos (autoenvío) u 80 puntos (compra directa) y propón combinaciones concretas con su total de puntos y precio aproximado. Si un producto no indica puntos, di que se confirma en la tienda.

LÍMITES (INNEGOCIABLES)
- Los productos FuXion son alimentos y bebidas funcionales, NO medicamentos. Nunca digas que curan, tratan, previenen o eliminan enfermedades. No uses palabras como cura, sana, adelgaza, quema grasa.
- Nunca diagnostiques ni des consejo médico. Si mencionan una enfermedad o síntoma, responde con empatía y recomienda consultar a su médico; puedes mencionar hábitos de bienestar generales.
- No inventes testimonios, cifras de clientes ni resultados.
- Si no sabes algo, dilo y ofrece el WhatsApp.
- No hables de política, religión ni temas ajenos a bienestar y FuXion; redirige con amabilidad.

CTA FINAL
- Cierra respuestas clave con UNA invitación suave: escribir por WhatsApp (${WA_LINK}) para asesoría personalizada, o comprar en la tienda (${TIENDA}). No repitas el CTA en cada mensaje si la conversación ya lo tiene.

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
      error: 'Vamos muy rápido 😅 Espera unos minutos o escríbeme directo al WhatsApp +51 970 848 043.',
    })
  }
  next()
}

const FALLBACK_REPLY =
  'Ahorita no puedo responder automáticamente, pero te ayudo al toque por WhatsApp: +51 970 848 043 💚'

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

    if (!GEMINI_API_KEY) {
      return res.json({ ok: true, reply: FALLBACK_REPLY, fallback: true })
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 55000)
      const geminiRes = await fetch(GEMINI_URL, {
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
          // maxOutputTokens amplio: este modelo usa tokens de razonamiento interno
          generationConfig: { temperature: 0.6, maxOutputTokens: 3000 },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!geminiRes.ok) {
        const detail = await geminiRes.text().catch(() => '')
        console.error('Gemini error', geminiRes.status, detail.slice(0, 300))
        return res.json({ ok: true, reply: FALLBACK_REPLY, fallback: true })
      }

      const data = await geminiRes.json()
      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || '')
          .join('')
          .trim() || FALLBACK_REPLY

      try {
        insertChat.run(sessionId, 'model', reply.slice(0, 2000))
      } catch { /* log no crítico */ }

      res.json({ ok: true, reply })
    } catch (err) {
      console.error('Chat error:', err?.message || err)
      res.json({ ok: true, reply: FALLBACK_REPLY, fallback: true })
    }
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
