// ─────────────────────────────────────────────────────────────
// Emprende Salud · WhatsApp OFICIAL (API de la nube de Meta)
// El número 907 sigue en la app de WhatsApp Business (coexistencia):
// Valeria contesta los mensajes nuevos y Kervin puede tomar cualquier
// chat desde la app; mientras él escribe, Valeria se calla.
//
// REGLAS (innegociables):
//  - Solo RESPONDE a quien escribe (ventana de 24 h). Nunca inicia
//    conversaciones ni manda mensajes masivos.
//  - Si Kervin escribió en ese chat hace menos de WA_PAUSA_HORAS, no responde.
//  - Apagado por defecto: solo responde con WA_BOT_ENABLED=true.
//
// Variables (Railway):
//  WA_TOKEN            token del usuario del sistema (whatsapp_business_messaging)
//  WA_PHONE_NUMBER_ID  id del número 907 en la API de la nube
//  WA_VERIFY_TOKEN     texto secreto para verificar el webhook
//  WA_APP_SECRET       clave secreta de la app (firma X-Hub-Signature-256)
//  WA_BOT_ENABLED      'true' para que Valeria responda
//  WA_PAUSA_HORAS      horas de silencio después de que Kervin escribe (12)
//  WA_DRY_RUN          'true' = no envía nada, solo lo registra (pruebas)
//  WA_GRAPH_VERSION    versión de la Graph API (v24.0)
// ─────────────────────────────────────────────────────────────
import crypto from 'node:crypto'
import { responderEnWhatsapp } from './chat.js'

const WA_TOKEN = process.env.WA_TOKEN || ''
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID || ''
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || ''
const WA_APP_SECRET = process.env.WA_APP_SECRET || ''
const BOT_ACTIVO = process.env.WA_BOT_ENABLED === 'true'
const DRY_RUN = process.env.WA_DRY_RUN === 'true'
const PAUSA_MS = Number(process.env.WA_PAUSA_HORAS || 12) * 60 * 60 * 1000
const GRAPH = `https://graph.facebook.com/${process.env.WA_GRAPH_VERSION || 'v24.0'}`

const VENTANA_MS = 24 * 60 * 60 * 1000
const MAX_RESPUESTAS_HORA = 10 // por chat: evita bucles y gasto si alguien escribe sin parar

// Lo que se le dice a Kervin en el log cuando Gemini no responde: el chat queda para él.
const SIN_RESPUESTA = 'Valeria no pudo responder (Gemini). El chat queda para Kervin.'

function firmaValida(req) {
  if (!WA_APP_SECRET) return false
  const firma = String(req.headers['x-hub-signature-256'] || '')
  if (!firma.startsWith('sha256=') || !req.rawBody) return false
  const esperada = 'sha256=' + crypto.createHmac('sha256', WA_APP_SECRET).update(req.rawBody).digest('hex')
  const a = Buffer.from(firma)
  const b = Buffer.from(esperada)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Markdown de la web → formato de WhatsApp, por si el modelo se olvida del canal
function aFormatoWhatsapp(texto) {
  return texto
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1: $2')
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .trim()
}

async function graph(ruta, cuerpo) {
  if (DRY_RUN) {
    console.log('WA (dry run) →', ruta, JSON.stringify(cuerpo).slice(0, 300))
    return { ok: true }
  }
  const res = await fetch(`${GRAPH}/${WA_PHONE_NUMBER_ID}/${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!res.ok) {
    const detalle = await res.text().catch(() => '')
    throw new Error(`Graph ${res.status} ${detalle.slice(0, 300)}`)
  }
  return res.json()
}

export function registerWhatsappCloud(app, db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wa_cloud_mensajes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      wa_id      TEXT    NOT NULL,
      msg_id     TEXT    NOT NULL DEFAULT '',
      role       TEXT    NOT NULL,          -- user | model | kervin | fallback
      text       TEXT    NOT NULL,
      ts         INTEGER NOT NULL,           -- milisegundos
      created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_wa_cloud_chat ON wa_cloud_mensajes(wa_id, ts);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_cloud_msg ON wa_cloud_mensajes(msg_id) WHERE msg_id <> '';
  `)
  const insertar = db.prepare(
    'INSERT OR IGNORE INTO wa_cloud_mensajes (wa_id, msg_id, role, text, ts) VALUES (?, ?, ?, ?, ?)',
  )
  const historial = db.prepare(
    "SELECT role, text FROM wa_cloud_mensajes WHERE wa_id = ? AND role IN ('user', 'model', 'kervin') AND ts >= ? ORDER BY ts DESC, id DESC LIMIT 12",
  )
  const ultimoDeKervin = db.prepare(
    "SELECT MAX(ts) AS ts FROM wa_cloud_mensajes WHERE wa_id = ? AND role = 'kervin'",
  )
  const respuestasUltimaHora = db.prepare(
    "SELECT COUNT(*) AS n FROM wa_cloud_mensajes WHERE wa_id = ? AND role = 'model' AND ts >= ?",
  )
  const leadReciente = db.prepare(
    "SELECT id FROM leads WHERE whatsapp = ? AND created_at >= datetime('now', 'localtime', '-7 day')",
  )
  const insertarLead = db.prepare(
    "INSERT INTO leads (nombre, whatsapp, correo, producto, origen, utm) VALUES (?, ?, '', ?, 'whatsapp', ?)",
  )

  // Devuelve true si el mensaje es nuevo (Meta reintenta los webhooks: el msg_id evita responder dos veces)
  const guardar = (waId, msgId, role, text, ts) =>
    insertar.run(waId, msgId, role, String(text).slice(0, 4000), ts).changes > 0

  function guardarLead(waId, nombre, texto, referral) {
    const whatsapp = `+${waId}`
    try {
      if (leadReciente.get(whatsapp)) return
      const origenAnuncio = referral?.source_id ? `ctwa:${referral.source_id}` : 'whatsapp'
      insertarLead.run((nombre || 'Contacto de WhatsApp').slice(0, 80), whatsapp, `WhatsApp: ${texto}`.slice(0, 80), origenAnuncio)
    } catch (err) {
      console.error('WA lead no guardado:', err?.message || err)
    }
  }

  async function responder(waId, msgId) {
    const ahora = Date.now()
    const kervin = ultimoDeKervin.get(waId)?.ts
    if (kervin && ahora - kervin < PAUSA_MS) return // Kervin está atendiendo este chat
    if (respuestasUltimaHora.get(waId, ahora - 60 * 60 * 1000).n >= MAX_RESPUESTAS_HORA) return

    // Kervin aparece como 'model' para Gemini: son respuestas del negocio
    const messages = historial
      .all(waId, ahora - VENTANA_MS)
      .reverse()
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))
    if (!messages.length || messages[messages.length - 1].role !== 'user') return

    // Visto + "escribiendo…" mientras Valeria piensa
    graph('messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: msgId,
      typing_indicator: { type: 'text' },
    }).catch((err) => console.error('WA visto:', err?.message || err))

    const reply = await responderEnWhatsapp(messages)
    if (!reply) {
      guardar(waId, '', 'fallback', SIN_RESPUESTA, Date.now())
      return
    }
    // Si Kervin escribió mientras Gemini pensaba, su respuesta manda
    const kervinAhora = ultimoDeKervin.get(waId)?.ts
    if (kervinAhora && kervinAhora >= ahora) return

    const texto = aFormatoWhatsapp(reply).slice(0, 4096)
    const enviado = await graph('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: waId,
      type: 'text',
      text: { body: texto, preview_url: true },
    })
    guardar(waId, enviado?.messages?.[0]?.id || '', 'model', texto, Date.now())
  }

  async function procesar(body) {
    for (const entry of body?.entry || []) {
      for (const change of entry?.changes || []) {
        const v = change?.value || {}
        if (WA_PHONE_NUMBER_ID && v.metadata?.phone_number_id && v.metadata.phone_number_id !== WA_PHONE_NUMBER_ID) continue

        // Lo que Kervin escribe desde la app (coexistencia) llega como eco: pausa a Valeria en ese chat
        if (change.field === 'smb_message_echoes') {
          for (const m of v.message_echoes || []) {
            const texto = m.text?.body || `[${m.type}]`
            guardar(String(m.to), m.id, 'kervin', texto, Number(m.timestamp) * 1000 || Date.now())
          }
          continue
        }
        if (change.field !== 'messages') continue

        const nombres = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || '']))
        for (const m of v.messages || []) {
          const waId = String(m.from)
          const ts = Number(m.timestamp) * 1000 || Date.now()
          const texto =
            m.type === 'text' ? m.text?.body
            : m.type === 'button' ? m.button?.text
            : m.type === 'interactive' ? (m.interactive?.button_reply?.title || m.interactive?.list_reply?.title)
            : ''
          // Audios, fotos, stickers…: Valeria no los entiende; quedan para Kervin
          if (!texto) {
            guardar(waId, m.id, 'user', `[${m.type}]`, ts)
            continue
          }
          if (!guardar(waId, m.id, 'user', texto, ts)) continue // reintento de Meta
          guardarLead(waId, nombres[waId], texto, m.referral)
          if (BOT_ACTIVO) {
            await responder(waId, m.id).catch((err) => console.error('WA respuesta:', err?.message || err))
          }
        }
      }
    }
  }

  // Verificación del webhook (Meta llama una vez al configurarlo)
  app.get('/api/whatsapp/webhook', (req, res) => {
    const ok =
      WA_VERIFY_TOKEN &&
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === WA_VERIFY_TOKEN
    if (!ok) return res.sendStatus(403)
    res.status(200).send(String(req.query['hub.challenge'] ?? ''))
  })

  app.post('/api/whatsapp/webhook', (req, res) => {
    if (!firmaValida(req)) return res.sendStatus(401)
    // Meta espera 200 rápido; la respuesta de Valeria va después
    res.sendStatus(200)
    procesar(req.body).catch((err) => console.error('WA webhook:', err?.message || err))
  })

  // Últimos mensajes (admin): para revisar qué respondió Valeria
  app.get('/api/whatsapp/logs', (req, res) => {
    const key = req.query.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const rows = db.prepare('SELECT * FROM wa_cloud_mensajes ORDER BY id DESC LIMIT 200').all()
    res.json({ ok: true, activo: BOT_ACTIVO, dryRun: DRY_RUN, logs: rows })
  })
}
