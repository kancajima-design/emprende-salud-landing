// 🧪 TEST v5.4.0 — Pruebas de integración LOCALES contra el código REAL de Valeria
// Simula los mensajes de los primeros leads + las nuevas rutas de posicionamiento Clean Label.
// Corre handleMessage() de verdad con BD en memoria y fetch interceptado (nada sale a WhatsApp).

process.env.WAHA_API_URL = 'http://waha.local'
process.env.WAHA_API_KEY = 'test-key'
process.env.GEMINI_API_KEY = 'test-gemini' // activa rutas multimedia (stubbed, sin costo real)

const { DatabaseSync } = await import('node:sqlite')

// ── 1. Acelerar delays humanos (>=500ms → 1ms) para que la prueba sea rápida ──
const realSetTimeout = globalThis.setTimeout
globalThis.setTimeout = (fn, ms, ...a) => realSetTimeout(fn, ms >= 500 ? 1 : ms, ...a)

// ── 2. Interceptar fetch: WAHA siempre responde OK, Gemini simulado según el tipo de llamada ──
const sentMessages = []
const geminiCalls = { multimodal: 0, tts: 0 }
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url)
  if (u.includes('/api/sendText')) {
    const body = JSON.parse(opts.body || '{}')
    sentMessages.push({ to: body.chatId, text: body.text })
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
  }
  if (u.includes('/api/sendImage')) {
    const body = JSON.parse(opts.body || '{}')
    sentMessages.push({ to: body.chatId, image: body.file?.url, caption: body.caption })
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
  }
  if (u.includes('/api/sendVoice')) {
    const body = JSON.parse(opts.body || '{}')
    sentMessages.push({ to: body.chatId, voice: body.file?.url })
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
  }
  if (u.includes('/api/files/')) {
    // Descarga de media desde el Media Storage de WAHA
    return { ok: true, status: 200, arrayBuffer: async () => new TextEncoder().encode('FAKE-AUDIO-OR-IMAGE-BYTES').buffer, json: async () => ({}), text: async () => '' }
  }
  if (u.includes('generativelanguage')) {
    const body = JSON.parse(opts.body || '{}')
    if (body.generationConfig?.responseModalities?.includes('AUDIO')) {
      // Llamada TTS → devuelve audio fake en base64
      geminiCalls.tts++
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/mp3', data: Buffer.from('fake-mp3').toString('base64') } }] } }] }), text: async () => '' }
    }
    if (JSON.stringify(body).includes('inlineData')) {
      // Llamada multimodal (audio/imagen entrante)
      geminiCalls.multimodal++
      const isAudio = JSON.stringify(body).includes('audio/')
      const replyText = isAudio
        ? 'cuánto cuesta el biopro sport'
        : 'Captura de la tienda FuXion mostrando el carrito con Biopro+ Sport. El cliente necesita ayuda para completar el pago.'
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: replyText }] } }] }), text: async () => '' }
    }
    // Texto simple (geminiReply): responde solo si el contexto es una imagen analizada
    const ut = String(body.contents?.[0]?.parts?.[0]?.text || '')
    if (ut.includes('imagen')) {
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Veo tu captura del carrito con Biopro+ Sport 😊 Estás a un paso: entra al link, elige tu medio de pago (tarjeta, SafetyPay o Yape) y confirma. ¿Te guío paso a paso?' }] } }] }), text: async () => '' }
    }
    return { ok: false, status: 500, json: async () => ({}), text: async () => 'no-gemini' }
  }
  return { ok: false, status: 404, json: async () => ({}), text: async () => '' }
}

// ── 3. App Express falsa que solo colecciona rutas ──
const routes = { get: {}, post: {} }
const app = {
  get: (p, fn) => { routes.get[p] = fn },
  post: (p, fn) => { routes.post[p] = fn },
  use: () => {},
}

// ── 4. BD en memoria ──
const db = new DatabaseSync(':memory:')

const { registerWahaBot } = await import('./server/waha-bot.js')
registerWahaBot(app, db)

const webhook = routes.post['/api/waha-webhook']
if (!webhook) throw new Error('No se registró /api/waha-webhook')

const sleep = (ms) => new Promise((r) => realSetTimeout(r, ms))

async function leadEscribe(chatId, body, nombre = 'Lead Prueba', extra = {}) {
  const antes = sentMessages.length
  const req = { body: { event: 'message', payload: { from: chatId, body, fromMe: false, _data: { notifyName: nombre }, ...extra } } }
  const res = { json: () => {}, status: () => ({ json: () => {} }) }
  webhook(req, res)
  // esperar a que handleMessage termine (nuevos mensajes enviados o timeout)
  for (let i = 0; i < 100; i++) {
    await sleep(25)
    if (sentMessages.length > antes) {
      // darle un momento por si manda un segundo mensaje (bloques dobles)
      await sleep(200)
      break
    }
  }
  return sentMessages.slice(antes)
}

let n = 0
const nuevoChat = () => `5199${String(900000 + (n++ * 1111)).slice(0, 6)}@c.us`

// Transcripción legible para Kervin (se guarda al final del test)
const transcripcion = []
async function leadEscribeTx(titulo, nombre, body, extra = {}) {
  const chatId = nuevoChat()
  const r = await leadEscribe(chatId, body, nombre, extra)
  transcripcion.push({ titulo, nombre, body: body || `(${extra.media?.mimetype?.includes('audio') ? 'nota de voz' : 'imagen'} adjunta)`, replies: r })
  return r
}

let passed = 0, failed = 0
function check(nombre, cond, detalle = '') {
  if (cond) { passed++; console.log(`  ✅ ${nombre}`) }
  else { failed++; console.log(`  ❌ ${nombre} ${detalle}`) }
}
function unido(lista) { return lista.map((m) => m.text || m.caption || '').join('\n---\n') }

console.log('🧪 TEST v5.4.0 — Pruebas con código real de Valeria (mensajes de los primeros leads + posicionamiento)\n')

// ── CASO A: primer lead de la campaña Biopro Sport ─────────────────────────
console.log('A. Lead de campaña: "Hola vi el anuncio del biopro sport, quiero información"')
let r = await leadEscribeTx('A. Lead campaña: vi el anuncio del biopro sport', 'Carlos', 'Hola vi el anuncio del biopro sport quiero información')
let t = unido(r)
if (r.length) console.log('   ↳ ' + t.slice(0, 200).replace(/\n/g, ' | '))
check('responde algo', r.length > 0)
check('menciona Biopro Sport', /biopro/i.test(t), `\n${t.slice(0, 300)}`)
check('aclara que paga DENTRO del link', /dentro del (mismo )?link/i.test(t), `\n${t.slice(0, 400)}`)
check('menciona garantía FuXion / pago seguro', /garant[ií]a|seguro/i.test(t))

// ── CASO B: lead que pregunta precio (el error clásico de los primeros días) ─
console.log('\nB. Lead: "cuánto cuesta el biopro sport"')
r = await leadEscribeTx('B. Pregunta de precio: biopro sport', 'Ana', 'cuánto cuesta el biopro sport')
t = unido(r)
console.log('   ↳ ' + t.slice(0, 350).replace(/\n/g, ' | '))
check('muestra AMBAS presentaciones (pote y sobres)', /Pote x 2lb/.test(t) && /14 sticks/.test(t), `\n${t.slice(0, 400)}`)
check('precio pote S/ 259.50 y sobres S/ 132.50', /259\.50/.test(t) && /132\.50/.test(t))
check('link del pote es el 3171015', /3171015/.test(t))
check('explica los QV', /QV \(puntos\)|puntos/.test(t))
check('título "Precios FuXion Perú" sin "actualizados"', /Precios FuXion Perú/i.test(t) && !/actualizados/i.test(t))
check('saltos de línea entre bullets (formato WhatsApp)', /\n•\s*\*/.test(t))

// ── CASO C: lead que pide 2 productos → muestra formatos + puntos estimados ─
console.log('\nC. Lead: "precio de biopro sport y flora liv"')
r = await leadEscribeTx('C. Dos productos: biopro sport y flora liv', 'Luis', 'precio de biopro sport y flora liv')
t = unido(r)
console.log('   ↳ ' + t.slice(0, 400).replace(/\n/g, ' | '))
check('Flora Liv S/ 154.00 (24 QV)', /Flora Liv.*154\.00.*24 QV/s.test(t))
check('Biopro en pote y sobres (ambos formatos)', /Pote x 2lb.*259\.50/s.test(t) && /14 sticks.*132\.50/s.test(t))
check('puntos estimados en rango honesto (44–60: elige 1 formato)', /Puntos estimados: 44–60 QV/.test(t), `\n${t.slice(0, 400)}`)
check('promo: llega a 60 puntos = regalo en autoenvío', /Puedes llegar a 60 puntos/.test(t))

// ── CASO D: lead que pide el link de compra ────────────────────────────────
console.log('\nD. Lead: "me pasas el link de compra" (FIX v5.4.1)')
r = await leadEscribeTx('D. Pide link de compra (genérico)', 'María', 'me pasas el link de compra')
t = unido(r)
console.log('   ↳ ' + t.slice(0, 300).replace(/\n/g, ' | '))
check('envía link de tienda (no el menú de calificación)', /ifuxion\.com\/emprendesalud/.test(t), `\n${t.slice(0, 300)}`)
check('enumera medios oficiales del checkout', /SafetyPay/.test(t) && /Yape/.test(t) && /Visa/.test(t), `\n${t.slice(0, 500)}`)
check('refuerza pago dentro del link + garantía FuXion', /dentro del link/i.test(t) && /garant[ií]a directa de FuXion/i.test(t))
check('adjunta guía de registro post-link', /registr|video|awaretips/i.test(t))

// ── CASO D2: link de compra CON producto ───────────────────────────────────
console.log('\nD2. Lead: "me pasas el link del biopro sport en pote" (FIX v5.4.1)')
r = await leadEscribeTx('D2. Pide link del biopro sport en pote', 'María', 'me pasas el link del biopro sport en pote')
t = unido(r)
check('link directo del pote 3171015', /3171015/.test(t), `\n${t.slice(0, 300)}`)

// ── CASO E: NUEVO — comparativa con competidor de gym ─────────────────────
console.log('\nE. Lead: "biopro sport vs optimum nutrition" (NUEVO v5.4.0)')
r = await leadEscribeTx('E. Comparativa: biopro sport vs optimum nutrition', 'Pedro', 'biopro sport vs optimum nutrition')
t = unido(r)
check('dispara respuesta de comparativa', /etiqueta/i.test(t) && /marca/i.test(t), `\n${t.slice(0, 400)}`)
check('educa sin atacar la marca por nombre', !/optimum|gold standard|dymatize/i.test(t))
check('cierra con link del producto', /tiendafuxion\.com|ifuxion\.com/.test(t))

// ── CASO F: NUEVO — "estoy tomando herbalife, me conviene cambiar?" ─────────
console.log('\nF. Lead: "estoy tomando herbalife, me conviene cambiar?" (NUEVO v5.4.0)')
r = await leadEscribeTx('F. Usa herbalife, me conviene cambiar', 'Jorge', 'estoy tomando herbalife me conviene cambiar')
t = unido(r)
check('responde comparativa (no dispara flujo de compra)', /etiqueta/i.test(t), `\n${t.slice(0, 400)}`)
check('NO menciona "Herbalife" despectivamente', !/herbalife/i.test(t))
check('NO manda mensaje de "compra realizada" por error', !/pedido confirmado|compra registrada/i.test(t))

// ── CASO G: NUEVO — pregunta por lo natural ───────────────────────────────
console.log('\nG. Lead: "¿es 100% natural? ¿qué tiene de especial?" (NUEVO v5.4.0)')
r = await leadEscribeTx('G. Pregunta si es 100% natural', 'Rosa', 'es 100% natural que tiene de especial')
t = unido(r)
check('explica Clean Label', /Clean Label/i.test(t), `\n${t.slice(0, 400)}`)
check('menciona ingredientes naturales/patentes', /natural|patent/i.test(t))

// ── CASO H: NUEVO — objeción de precio ─────────────────────────────────────
console.log('\nH. Lead: "está muy caro" (NUEVO v5.4.0)')
r = await leadEscribeTx('H. Objeción: está muy caro', 'Carmen', 'esta muy caro la verdad')
t = unido(r)
check('reencuadre de valor por día', /S\/ 5 al d/i.test(t), `\n${t.slice(0, 400)}`)

// ── CASO I: nota de voz / multimedia sin texto ─────────────────────────────
console.log('\nI. Lead envía nota de voz (body vacío)')
r = await leadEscribeTx('I. Nota de voz (sin texto)', 'Diego', '')
t = unido(r)
check('pide que escriba o atiende multimedia', r.length > 0, `\n${t.slice(0, 200)}`)

// ── CASO J: guía de registro post-link ─────────────────────────────────────
console.log('\nJ. Lead: "no puedo registrarme"')
r = await leadEscribeTx('J. Problema para registrarse', 'Sofía', 'no puedo registrarme en la pagina')
t = unido(r)
check('envía guía de registro con video', /registr|video|awaretips/i.test(t), `\n${t.slice(0, 300)}`)

// ── CASO K: NOTA DE VOZ preguntando precio (v5.5.0) ────────────────────────
console.log('\nK. Lead envía NOTA DE VOZ: "cuánto cuesta el biopro sport" (NUEVO v5.5.0)')
{
  const ttsAntes = geminiCalls.tts
  r = await leadEscribeTx('K. Nota de voz: cuánto cuesta el biopro sport', 'Marta', '', {
    hasMedia: true,
    media: { url: 'http://waha.local/api/files/nota-marta.ogg', mimetype: 'audio/ogg' },
  })
  t = unido(r)
  check('transcribe y entiende la intención (responde precios)', /Precios FuXion Perú/i.test(t), `\n${t.slice(0, 400)}`)
  check('menciona Biopro en la respuesta', /Biopro/i.test(t))
  check('responde TAMBIÉN por audio (nota de voz)', geminiCalls.tts > ttsAntes && r.concat(sentMessages).some((m) => m.voice), 'no se generó TTS')
}

// ── CASO L: IMAGEN (captura del carrito) ───────────────────────────────────
console.log('\nL. Lead envía IMAGEN: captura del carrito (NUEVO v5.5.0)')
{
  r = await leadEscribeTx('L. Imagen: captura del carrito', 'Paolo', '', {
    hasMedia: true,
    media: { url: 'http://waha.local/api/files/foto-paolo.jpg', mimetype: 'image/jpeg' },
  })
  t = unido(r)
  check('entiende la imagen y responde algo útil', r.length > 0 && !/enviaste una imagen o audio/i.test(t), `\n${t.slice(0, 300)}`)
  check('NO responde con el mensaje genérico de "escríbeme por texto"', !/Cuéntame por \*texto\*/i.test(t))
}

// ── Resumen ────────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════`)
console.log(`RESULTADO: ${passed} pasaron · ${failed} fallaron`)
console.log(`═══════════════════════════════════════`)

// ── Transcripción legible para revisar cómo responde Valeria ───────────────
const { writeFileSync } = await import('node:fs')
const { fileURLToPath } = await import('node:url')
const out = ['# 🧪 Transcripción de prueba — Valeria v5.4.1\n',
  `Fecha: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Lima)\n`,
  'Conversaciones simuladas contra el código real (entorno de prueba, nada salió a WhatsApp).\n'].join('\n')
  + transcripcion.map((c) => (
    `\n\n---\n\n## ${c.titulo}\n\n**${c.nombre}:** ${c.body || '(nota de voz / imagen)'}\n\n`
    + c.replies.map((m) => (
      m.voice
        ? `**Valeria:** 🎙️ [nota de voz] ${m.voice}\n`
        : m.image
          ? `**Valeria:** 📷 [imagen] ${m.image}\n${m.caption || ''}\n`
          : `**Valeria:** ${m.text}\n`
    )).join('\n')
  )).join('')
const outPath = fileURLToPath(new URL('../transcripcion-prueba-valeria.md', import.meta.url))
writeFileSync(outPath, out, 'utf-8')
console.log(`\n📝 Transcripción guardada en: ${outPath}`)
process.exit(failed ? 1 : 0)
