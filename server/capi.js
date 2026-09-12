// ─────────────────────────────────────────────────────────────
// Meta Conversions API (CAPI) — envío server-side de eventos
// Deduplica contra el pixel del navegador mediante event_id compartido.
// Requiere META_CAPI_TOKEN en Railway; sin token, hace no-op seguro.
// ─────────────────────────────────────────────────────────────
import crypto from 'node:crypto'

const PIXEL_ID = process.env.META_PIXEL_ID || '565957435925103'
const CAPI_TOKEN = process.env.META_CAPI_TOKEN || ''
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || ''
const GRAPH_VERSION = 'v21.0'

// Solo eventos que el frontend está autorizado a reenviar
const ALLOWED_EVENTS = new Set([
  'PageView',
  'Lead',
  'Contact',
  'ViewContent',
  'VslVideoPlay',
  'VslVideoProgress',
])

const sha256 = (v) => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex')

// Normaliza teléfono: dígitos y '+' inicial (Meta acepta E.164 con código de país)
function normalizePhone(phone) {
  if (!phone) return ''
  let p = String(phone).replace(/[^\d+]/g, '')
  if (!p.startsWith('+')) {
    const digits = p.replace(/\D/g, '')
    // Perú: asumimos +51 si no trae código de país (9 dígitos locales típicos)
    p = digits.length === 9 ? `+51${digits}` : `+${digits}`
  }
  return p
}

/**
 * Dispara un evento a la Conversions API de Meta.
 * @param {object} e
 * @param {string} e.event_name   nombre del evento (whitelist)
 * @param {string} e.event_id     id compartido con el pixel del navegador (deduplicación)
 * @param {object} [e.user_data]  { email, phone, first_name, last_name } en claro (se hashean aquí)
 * @param {object} [e.custom_data] parámetros del evento (content_name, value, etc.)
 * @param {string} [e.fbp]        valor de la cookie _fbp
 * @param {string} [e.fbc]        valor de la cookie _fbc (click en anuncio)
 * @param {string} [e.event_source_url]
 * @param {string} [e.client_ip]
 * @param {string} [e.user_agent]
 */
export async function sendCapiEvent(e) {
  if (!CAPI_TOKEN) {
    // Token no configurado aún: no romper nada, solo avisar una vez por minuto
    const now = Date.now()
    if (!sendCapiEvent._lastWarn || now - sendCapiEvent._lastWarn > 60_000) {
      sendCapiEvent._lastWarn = now
      console.warn('[capi] META_CAPI_TOKEN no configurado: eventos server-side desactivados')
    }
    return { sent: false, reason: 'no-token' }
  }
  if (!e?.event_name || !ALLOWED_EVENTS.has(e.event_name)) {
    return { sent: false, reason: 'evento-no-permitido' }
  }

  const user_data = {
    client_ip_address: e.client_ip || undefined,
    client_user_agent: e.user_agent || undefined,
    fbp: e.fbp || undefined,
    fbc: e.fbc || undefined,
  }
  if (e.user_data?.email) user_data.em = sha256(e.user_data.email)
  const phone = normalizePhone(e.user_data?.phone)
  if (phone) user_data.ph = sha256(phone)
  if (e.user_data?.first_name) user_data.fn = sha256(e.user_data.first_name)
  if (e.user_data?.last_name) user_data.ln = sha256(e.user_data.last_name)

  const event = {
    event_name: e.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: e.event_id,
    event_source_url: e.event_source_url || 'https://www.emprendesalud.net/',
    action_source: 'website',
    user_data,
    custom_data: e.custom_data || {},
  }

  const payload = {
    data: [event],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    )
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.warn('[capi] error de Graph API:', res.status, JSON.stringify(body).slice(0, 300))
      return { sent: false, reason: `graph-${res.status}` }
    }
    return { sent: true, fbtrace_id: body.fbtrace_id }
  } catch (err) {
    console.warn('[capi] fallo de red:', err.message)
    return { sent: false, reason: 'red' }
  } finally {
    clearTimeout(timeout)
  }
}
