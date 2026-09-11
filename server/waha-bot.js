// ─────────────────────────────────────────────────────────────
// Emprende Salud · Bot REACTIVO de WhatsApp (WAHA)  v5.1.0
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
// v4.4.3 (09-sep): GUÍA_REGISTRO + INTENT_REGISTRO_RE (ayuda post-link).
// v4.4.4 (09-sep): VIDEO_REGISTRO agregado a GUÍA_REGISTRO.
// v4.5.0 (09-sep): CATÁLOGO DE PRECIOS + QV — Valeria entrega precios exactos.
// v5.1.0 (10-sep): CEREBRO v5 (Alex Dey+Klaric+Columbus) + links directos + imágenes + leads ads + alertas 24h.
// v5.1.1 (10-sep): 106 imágenes oficiales desde Ofifuxion + explicación QV + multi-compra + países + tono humano.
// Variables de entorno requeridas (Railway, servicio landing):
//  WAHA_API_URL, WAHA_API_KEY, WAHA_SESSION (default), WAHA_NOTIFY
// ─────────────────────────────────────────────────────────────

const WAHA_URL = (process.env.WAHA_API_URL || '').replace(/\/$/, '')
const WAHA_KEY = process.env.WAHA_API_KEY || ''
const WAHA_SESSION = process.env.WAHA_SESSION || 'default'
const NOTIFY = process.env.WAHA_NOTIFY || '51970848043' // personal de Kervin

// ── Transporte WhatsApp (v5.1.9): 'waha' (no oficial) | 'cloud' (API oficial Meta) ──
// MIGRACIÓN ANTI-BANEO: con 'cloud' los mensajes salen por la API oficial de Meta —
// automatización 100% legal, sin riesgo de baneo. El cerebro de Valeria es idéntico.
const TRANSPORT = process.env.WA_TRANSPORT || 'waha'
const CLOUD_TOKEN = process.env.WA_CLOUD_TOKEN || ''       // token permanente de Meta (Graph API)
const CLOUD_PHONE_ID = process.env.WA_CLOUD_PHONE_ID || '' // ID del número (phone_number_id)
const CLOUD_WABA_ID = process.env.WA_CLOUD_WABA_ID || ''   // ID de la cuenta WhatsApp Business (WABA)
const CLOUD_VERIFY = process.env.WA_CLOUD_VERIFY_TOKEN || 'emprende-salud-2026'
const GRAPH = 'https://graph.facebook.com/v21.0'
const cloudReady = () => TRANSPORT === 'cloud' && Boolean(CLOUD_TOKEN && CLOUD_PHONE_ID)

const TIENDA = 'http://ifuxion.com/emprendesalud'
const LANDING = 'https://www.emprendesalud.net'

// MODO ANTI-BANEO (v5.1.8): límites conservadores tras el baneo del 10/09/2026
const MAX_REPLIES_DAY = 12
const MENU_TTL_MS = 24 * 60 * 60 * 1000
const FLOOD_MS = 30 * 1000 // anti-flood: 1 respuesta cada 30 segundos por chat
const REACTIVAR_MAX = 8 // máximo contactos reactivados por día
const REACTIVAR_MIN_MS = 90 * 1000 // mínimo 90 seg entre mensajes de reactivación
const REACTIVAR_MAX_MS = 180 * 1000 // máximo 180 seg

// Horario humano de atención (Lima, Perú): 8:00 - 21:00
// Fuera de ese rango Valeria NO responde — responder de madrugada es señal clara de bot
const horarioAtencion = () => {
  try {
    const h = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Lima' }).format(new Date()))
    return h >= 8 && h < 21
  } catch { return true }
}

const lastReplyTs = new Map() // chatId -> timestamp última respuesta

// ═════════════════════════════════════════════════════════════
//  CATÁLOGO DE PRECIOS Y QV — FUXIÓN PERÚ SETIEMBRE 2026
// ═════════════════════════════════════════════════════════════

const CATALOGO = [
  // BEBIDAS FUNCIONALES & TÉS
  { nombre: 'Alpha Balance', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['alpha balance','alpha'] },
  { nombre: 'Beauty-In', presentacion: '28 sticks x 5gr', precio: 163.00, qv: 25, keywords: ['beauty in','beauty-in','beauty'] },
  { nombre: 'Berry Balance', presentacion: '28 sticks x 5gr', precio: 169.00, qv: 26, keywords: ['berry balance','berry'] },
  { nombre: 'Flora Liv', presentacion: '28 sticks x 5gr', precio: 154.00, qv: 24, keywords: ['flora liv','flora'] },
  { nombre: 'Golden FLX', presentacion: '28 sticks x 5gr', precio: 143.00, qv: 22, keywords: ['golden flx','golden','flx'] },
  { nombre: 'Liquid Fiber', presentacion: '28 sticks x 5gr', precio: 105.00, qv: 16, keywords: ['liquid fiber','fiber','fibra'] },
  { nombre: 'No Stress', presentacion: '28 sticks x 5gr', precio: 142.50, qv: 22, keywords: ['no stress','nostress'] },
  { nombre: 'No Stress', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['no stress 7','nostress 7'] },
  { nombre: 'NoCarb-T', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['nocarb','nocarb-t','nocarb t','no carb'] },
  { nombre: 'Nutraday', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['nutraday'] },
  { nombre: 'ON', presentacion: '28 sticks x 5gr', precio: 105.00, qv: 16, keywords: ['on 28','on energia','on energía'] },
  { nombre: 'ON', presentacion: '7 sticks x 5gr', precio: 29.00, qv: 4, keywords: ['on 7'] },
  { nombre: 'Passion', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['passion'] },
  { nombre: 'Prunex1', presentacion: '7 sticks x 5gr', precio: 21.00, qv: 2, keywords: ['prunex1 7','prunex 7','prunex'] },
  { nombre: 'Prunex1', presentacion: '28 sticks x 5gr', precio: 76.00, qv: 10, keywords: ['prunex1','prunex'] },
  { nombre: 'Prunex1', presentacion: '28 sticks x 5gr', precio: 76.00, qv: 10, keywords: ['prunex1','prunex','prunex1 28'] },
  { nombre: 'Thermo T3', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['thermo t3','thermo','t3'] },
  { nombre: 'Thermo T3', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['thermo t3 7','thermo 7'] },
  { nombre: 'Vera+', presentacion: '28 sticks x 5gr', precio: 169.00, qv: 26, keywords: ['vera+','vera plus','vera'] },
  { nombre: 'Vita Xtra T+', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['vita xtra','vita xtra t+','vitaxtra','vita extra'] },
  { nombre: 'Vita Xtra T+', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['vita xtra 7','vitaxtra 7'] },
  { nombre: 'Vita Xtra T+', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['vita xtra 7','vitaxtra 7'] },
  { nombre: 'Rexet', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['rexet 7'] },
  { nombre: 'Rexet', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['rexet'] },
  { nombre: 'Youth Elixir', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['youth elixir','youth'] },
  // CAFÉS
  { nombre: 'Café & Café Fit Cappuccino', presentacion: '28 sticks x 15gr', precio: 159.50, qv: 24, keywords: ['cafe fit cappuccino','cappuccino cafe','cafe cappuccino','cafe'] },
  { nombre: 'Café & Café Fit', presentacion: '28 sticks x 4gr', precio: 159.50, qv: 24, keywords: ['cafe fit','café fit','cafe & cafe fit','cafe'] },
  { nombre: 'Café & Café Fit', presentacion: '28 sticks x 4gr', precio: 159.50, qv: 24, keywords: ['cafe fit','café fit','cafe & cafe fit'] },
  { nombre: 'Café GanoMax', presentacion: '28 sticks x 5gr', precio: 146.00, qv: 22, keywords: ['ganomax','cafe ganomax','café ganomax'] },
  { nombre: 'Chocolate Fit', presentacion: '14 sticks x 15gr', precio: 92.50, qv: 12, keywords: ['chocolate fit'] },
  { nombre: 'Gano+ Cappuccino', presentacion: '28 sticks x 7.5gr', precio: 92.50, qv: 12, keywords: ['gano+ cappuccino','gano cappuccino','gano+','gano'] },
  { nombre: 'Gano+ T', presentacion: '28 sticks x 5gr', precio: 92.50, qv: 12, keywords: ['gano+ t','gano t','gano+','gano'] },
  { nombre: 'Gano+ T', presentacion: '28 sticks x 5gr', precio: 92.50, qv: 12, keywords: ['gano+ t','gano t','gano+','gano tea'] },
  // PROTEÍNAS & SPORT
  { nombre: 'Biopro+ Sport', presentacion: 'Pote x 2lb', precio: 259.50, qv: 36, keywords: ['biopro sport pote','biopro+ sport pote','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport','biopro'] },
  { nombre: 'Biopro+ Tect', presentacion: 'Pote x 500gr', precio: 163.00, qv: 23, keywords: ['biopro tect pote','biopro+ tect pote','biopro'] },
  { nombre: 'Biopro+ Tect', presentacion: '14 sticks x 25gr', precio: 119.50, qv: 18, keywords: ['biopro tect','biopro+ tect','biopro'] },
  { nombre: 'Biopro+ Fit', presentacion: '14 sticks x 25gr', precio: 108.00, qv: 16, keywords: ['biopro fit','biopro+ fit','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport'] },
  { nombre: 'Biopro+ Tect', presentacion: 'Pote x 500gr', precio: 163.00, qv: 23, keywords: ['biopro tect pote','biopro+ tect pote'] },
  { nombre: 'Biopro+ Tect', presentacion: '14 sticks x 25gr', precio: 119.50, qv: 18, keywords: ['biopro tect','biopro+ tect'] },
  { nombre: 'Biopro+ Fit', presentacion: '14 sticks x 25gr', precio: 108.00, qv: 16, keywords: ['biopro fit','biopro+ fit'] },
  { nombre: 'Protein Active (Chocolate)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active chocolate','proteina active chocolate','protein active'] },
  { nombre: 'Protein Active (Vainilla)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active vainilla','proteina active vainilla','protein active'] },
  { nombre: 'Protein Active Fit (Chocolate)', presentacion: '14 sticks x 25gr', precio: 149.50, qv: 21, keywords: ['protein active fit chocolate','proteina active fit chocolate','protein active fit'] },
  { nombre: 'Protein Active Fit (Vainilla)', presentacion: '14 sticks x 25gr', precio: 149.00, qv: 21, keywords: ['protein active fit vainilla','proteina active fit vainilla','protein active fit'] },
  { nombre: 'Protein Active Sport (Chocolate)', presentacion: '14 sticks x 25gr', precio: 156.50, qv: 22, keywords: ['protein active sport chocolate','proteina active sport chocolate','protein active sport'] },
  { nombre: 'Protein Active Sport (Vainilla)', presentacion: '14 sticks x 25gr', precio: 156.00, qv: 22, keywords: ['protein active sport vainilla','proteina active sport vainilla','protein active sport'] },
  { nombre: 'Protein Xoup (Crema Criolla)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup criolla','protein xoup criolla','xoup'] },
  { nombre: 'Protein Xoup (Brócoli)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup brocoli','protein xoup brocoli','xoup'] },
  { nombre: 'Protein Xoup (Espárragos)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup esparragos','protein xoup esparragos','xoup'] },
  { nombre: 'Protein Active (Vainilla)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active vainilla','proteina active vainilla'] },
  { nombre: 'Protein Active Fit (Chocolate)', presentacion: '14 sticks x 25gr', precio: 149.50, qv: 21, keywords: ['protein active fit chocolate','proteina active fit chocolate'] },
  { nombre: 'Protein Active Fit (Vainilla)', presentacion: '14 sticks x 25gr', precio: 149.00, qv: 21, keywords: ['protein active fit vainilla','proteina active fit vainilla'] },
  { nombre: 'Protein Active Sport (Chocolate)', presentacion: '14 sticks x 25gr', precio: 156.50, qv: 22, keywords: ['protein active sport chocolate','proteina active sport chocolate'] },
  { nombre: 'Protein Active Sport (Vainilla)', presentacion: '14 sticks x 25gr', precio: 156.00, qv: 22, keywords: ['protein active sport vainilla','proteina active sport vainilla'] },
  { nombre: 'Protein Xoup (Crema Criolla)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup criolla','protein xoup criolla'] },
  { nombre: 'Protein Xoup (Brócoli)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup brocoli','protein xoup brocoli'] },
  { nombre: 'Protein Xoup (Espárragos)', presentacion: '7 sticks x 25gr', precio: 68.00, qv: 10, keywords: ['xoup esparragos','protein xoup esparragos'] },
  { nombre: 'Pre Sport', presentacion: '28 sticks x 5gr', precio: 143.00, qv: 22, keywords: ['pre sport'] },
  { nombre: 'Post Sport', presentacion: '28 sticks x 5gr', precio: 143.00, qv: 22, keywords: ['post sport'] },
  { nombre: 'Xpeed', presentacion: 'Pack x 4', precio: 39.50, qv: 2, keywords: ['xpeed'] },
  // COCINA
  { nombre: 'Base Madre Amarilla', presentacion: 'Sobre x 50gr', precio: 24.00, qv: 2, keywords: ['base madre amarilla','base madre'] },
  { nombre: 'Base Madre Roja', presentacion: 'Sobre x 50gr', precio: 24.00, qv: 2, keywords: ['base madre roja','base madre'] },
  { nombre: 'Base Madre Verde', presentacion: 'Sobre x 50gr', precio: 24.00, qv: 2, keywords: ['base madre verde','base madre'] },
  { nombre: 'Base Madre Roja', presentacion: 'Sobre x 50gr', precio: 24.00, qv: 2, keywords: ['base madre roja'] },
  { nombre: 'Base Madre Verde', presentacion: 'Sobre x 50gr', precio: 24.00, qv: 2, keywords: ['base madre verde'] },
  { nombre: 'Probix', presentacion: '28 x 0.5gr', precio: 129.50, qv: 20, keywords: ['probix'] },
  // PACKS
  { nombre: 'Combo Ponte en Forma', presentacion: 'Combo', precio: 676.50, qv: 100, keywords: ['combo ponte en forma','ponte en forma'] },
  { nombre: 'Pack 5/14 Active Mito', presentacion: 'Caja Pack', precio: 435.00, qv: 64, keywords: ['pack 5/14 mito','pack mito','active mito'] },
  { nombre: 'Pack 5/14 Keto', presentacion: 'Caja Pack', precio: 399.00, qv: 60, keywords: ['pack 5/14 keto','pack keto','keto'] },
  { nombre: 'Programa Detox 5 Días', presentacion: 'Caja Pack', precio: 175.00, qv: 24, keywords: ['detox 5 dias','detox','programa detox'] },
  // OTROS
  { nombre: 'Probal', presentacion: '28 sticks x 5gr', precio: 162.50, qv: 25, keywords: ['probal'] },
  { nombre: 'Xtra Mile', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['xtra mile'] },
  { nombre: 'Vitaenergía', presentacion: '30 sticks x 7.5gr', precio: 129.50, qv: 20, keywords: ['vitaenergia','vita energia','vitaenergía'] },
]

// ── Helpers de matching ──
const normalize = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim()

function buscarProductos(texto) {
  const n = normalize(texto)
  const encontrados = []
  const usados = new Set()
  
  // PASO 1: Matches específicos (keywords largas >= 8 chars)
  // Evita que "biopro" matchee cuando el usuario dijo "biopro sport"
  // v5: también acepta match por tokens (palabras en cualquier orden): "no stress de 7" → No Stress 7
  for (const prod of CATALOGO) {
    for (const kw of prod.keywords) {
      if (kw.length < 8) continue
      const nk = normalize(kw)
      let match = n.includes(nk)
      if (!match && nk.includes(' ')) {
        const tokens = nk.split(' ').filter((t) => t.length > 2 || /^\d+$/.test(t))
        if (tokens.length >= 2) match = tokens.every((t) => n.split(' ').includes(t))
      }
      if (match) {
        const key = prod.nombre + '|' + prod.presentacion
        if (!usados.has(key)) {
          encontrados.push(prod)
          usados.add(key)
        }
        break
      }
    }
  }
  
  // Si encontramos matches específicos, no buscar genéricos
  if (encontrados.length > 0) return encontrados

  // PASO 2: Matches genéricos (keywords cortas < 8 chars)
  for (const prod of CATALOGO) {
    for (const kw of prod.keywords) {
      if (kw.length >= 8) continue
      const nk = normalize(kw)
      if (nk.length <= 3 && !n.split(' ').includes(nk)) continue
      if (n.includes(nk)) {
        const key = prod.nombre + '|' + prod.presentacion
        if (!usados.has(key)) {
          encontrados.push(prod)
          usados.add(key)
        }
        break
      }
    }
  }

  // v5: si el cliente menciona un formato (pote / 7 / 14 / 28 / 30), refinar a esa presentación
  const mencionaPote = /\bpote\b/.test(n)
  const numMatch = n.match(/\b(7|14|28|30)\b/)
  if ((mencionaPote || numMatch) && encontrados.length > 0) {
    const filtrados = encontrados.filter((p) => {
      const pres = normalize(p.presentacion)
      if (mencionaPote) return pres.includes('pote')
      if (numMatch) return pres.includes(numMatch[1])
      return true
    })
    if (filtrados.length > 0) return filtrados
  }

  return encontrados
}

// ═════════════════════════════════════════════════════════════
//  LINKS DIRECTOS DE PRODUCTOS — tiendafuxion.com (docx sep-2026)
// ═════════════════════════════════════════════════════════════
const LINKS_PRODUCTO = {
  'flora liv': 'https://tiendafuxion.com/storelt/emprendesalud/2085880',
  'rexet': 'https://tiendafuxion.com/storelt/emprendesalud/2085882',
  'golden flx': 'https://tiendafuxion.com/storelt/emprendesalud/2085884',
  'alpha balance': 'https://tiendafuxion.com/storelt/emprendesalud/2085951',
  'beauty in': 'https://tiendafuxion.com/storelt/emprendesalud/2085953',
  'base madre amarilla': 'https://tiendafuxion.com/storelt/emprendesalud/2085955',
  'base madre roja': 'https://tiendafuxion.com/storelt/emprendesalud/2085957',
  'base madre verde': 'https://tiendafuxion.com/storelt/emprendesalud/2085958',
  'berry balance': 'https://tiendafuxion.com/storelt/emprendesalud/2085959',
  'biopro fit': 'https://tiendafuxion.com/storelt/emprendesalud/2085961',
  'biopro sport pote': 'https://tiendafuxion.com/storelt/emprendesalud/2085963',
  'biopro sport sobres': 'https://tiendafuxion.com/storelt/emprendesalud/2085965',
  'biopro tect pote': 'https://tiendafuxion.com/storelt/emprendesalud/2085966',
  'biopro tect sobres': 'https://tiendafuxion.com/storelt/emprendesalud/2085967',
  'cafe y cafe fit cappuccino': 'https://tiendafuxion.com/storelt/emprendesalud/2085968',
  'cafe ganomax': 'https://tiendafuxion.com/storelt/emprendesalud/2085974',
  'chocolate fit': 'https://tiendafuxion.com/storelt/emprendesalud/2085976',
  'gano cappuccino': 'https://tiendafuxion.com/storelt/emprendesalud/2085977',
  'liquid fiber': 'https://tiendafuxion.com/storelt/emprendesalud/2085983',
  'no stress': 'https://tiendafuxion.com/storelt/emprendesalud/2085984',
  'nutraday': 'https://tiendafuxion.com/storelt/emprendesalud/2085989',
  'on': 'https://tiendafuxion.com/storelt/emprendesalud/2085990',
  'pack 5 14 keto': 'https://tiendafuxion.com/storelt/emprendesalud/2085993',
  'pack 5 14 active mito': 'https://tiendafuxion.com/storelt/emprendesalud/2085994',
  'passion': 'https://tiendafuxion.com/storelt/emprendesalud/3144145',
  'post sport': 'https://tiendafuxion.com/storelt/emprendesalud/2085996',
  'pre sport': 'https://tiendafuxion.com/storelt/emprendesalud/2085997',
  'probal': 'https://tiendafuxion.com/storelt/emprendesalud/3144149',
  'probix': 'https://tiendafuxion.com/storelt/emprendesalud/2085999',
  'programa detox 5 dias': 'https://tiendafuxion.com/storelt/emprendesalud/2086001',
  'protein active chocolate': 'https://tiendafuxion.com/storelt/emprendesalud/2086003',
  'protein active vainilla': 'https://tiendafuxion.com/storelt/emprendesalud/2086005',
  'protein active fit chocolate': 'https://tiendafuxion.com/storelt/emprendesalud/2086006',
  'protein active fit vainilla': 'https://tiendafuxion.com/storelt/emprendesalud/2086008',
  'protein active sport chocolate': 'https://tiendafuxion.com/storelt/emprendesalud/2086011',
  'protein active sport vainilla': 'https://tiendafuxion.com/storelt/emprendesalud/2086012',
  'protein xoup criolla': 'https://tiendafuxion.com/storelt/emprendesalud/2086013',
  'protein xoup esparragos': 'https://tiendafuxion.com/storelt/emprendesalud/2086015',
  'prunex1': 'https://tiendafuxion.com/storelt/emprendesalud/2086017',
  'thermo t3': 'https://tiendafuxion.com/storelt/emprendesalud/2086019',
  'vera': 'https://tiendafuxion.com/storelt/emprendesalud/2086021',
  'vita xtra t': 'https://tiendafuxion.com/storelt/emprendesalud/2086022',
  'vitaenergia': 'https://tiendafuxion.com/storelt/emprendesalud/2086023',
  'xtra mile': 'https://tiendafuxion.com/storelt/emprendesalud/2086024',
  'youth elixir': 'https://tiendafuxion.com/storelt/emprendesalud/2086026',
}

// v5.1: link directo de un producto del catálogo según su presentación/sabor
function linkDeProducto(p) {
  const k = normalize(p.nombre)
  const pres = normalize(p.presentacion)
  if (k.includes('biopro sport')) return LINKS_PRODUCTO[pres.includes('pote') ? 'biopro sport pote' : 'biopro sport sobres']
  if (k.includes('biopro tect')) return LINKS_PRODUCTO[pres.includes('pote') ? 'biopro tect pote' : 'biopro tect sobres']
  if (k.startsWith('protein active')) {
    const sabor = k.includes('chocolate') ? 'chocolate' : k.includes('vainilla') ? 'vainilla' : null
    if (k.includes('fit') && sabor) return LINKS_PRODUCTO[`protein active fit ${sabor}`]
    if (k.includes('sport') && sabor) return LINKS_PRODUCTO[`protein active sport ${sabor}`]
    if (sabor) return LINKS_PRODUCTO[`protein active ${sabor}`]
  }
  return LINKS_PRODUCTO[k] || null
}

// v5.1: links de productos mencionados en un texto (para contexto de Gemini)
function linksParaTexto(texto) {
  const n = normalize(texto)
  const hits = []
  for (const [k, url] of Object.entries(LINKS_PRODUCTO)) {
    const tokens = k.split(' ').filter((t) => t.length > 2)
    if (tokens.length >= 1 && tokens.every((t) => n.includes(t))) hits.push(`${k} → ${url}`)
  }
  return hits
}

// v5.1.3: info oficial (beneficios + uso) de productos mencionados en un texto
function infoParaTexto(texto) {
  const n = normalize(texto)
  const hits = []
  for (const [k, v] of Object.entries(PRODUCT_INFO)) {
    const nombre = k.split('|')[0]
    const tokens = nombre.replace(/[()]/g, ' ').split(' ').filter((t) => t.length > 2)
    if (!tokens.length || !tokens.every((t) => n.includes(t))) continue
    const b = v.b.length > 380 ? v.b.slice(0, 380) + '…' : v.b
    const u = v.u.length > 220 ? v.u.slice(0, 220) + '…' : v.u
    const ing = PRODUCT_INGREDIENTES[nombre]
    const vid = videoDe(nombre)
    hits.push(`${nombre}: beneficios: ${b}${ing ? ` Contiene: ${ing.slice(0, 220)}` : ''}${vid ? ` Video oficial: ${vid}` : ''} Cómo se toma: ${u}`)
    if (hits.length >= 3) break
  }
  return hits
}

function mensajePrecios(productos) {
  if (!productos.length) return null

  // v5: agrupar variantes del mismo producto (ej. 7 vs 28 sticks, sticks vs pote)
  const grupos = new Map()
  for (const p of productos) {
    if (!grupos.has(p.nombre)) grupos.set(p.nombre, [])
    grupos.get(p.nombre).push(p)
  }

  let totalQv = 0
  let sumable = true
  const lineas = []
  for (const [nombre, variants] of grupos) {
    if (variants.length === 1) {
      const p = variants[0]
      totalQv += p.qv
      const lk = linkDeProducto(p)
      lineas.push(`• *${p.nombre}* (${p.presentacion}): S/ ${p.precio.toFixed(2)} — ${p.qv} QV${lk ? `\
  👉 ${lk}` : ''}`)
    } else {
      sumable = false
      const sub = variants.map((p) => {
        const lk = linkDeProducto(p)
        return `  - ${p.presentacion}: S/ ${p.precio.toFixed(2)} — ${p.qv} QV${lk ? ` 👉 ${lk}` : ''}`
      }).join('\
')
      lineas.push(`• *${nombre}* (elige tu formato):\
${sub}`)
    }
  }

  let promo = ''
  if (totalQv >= 80) {
    promo = `🎁 *¡Llegas a ${totalQv} puntos!* Te llevas *1 producto de regalo* en compra directa (80 QV). Con autoenvío mensual (60 QV) también. ✅`
  } else if (totalQv >= 60) {
    promo = `🎁 *¡Llegas a ${totalQv} puntos!* Con autoenvío mensual te llevas *1 producto de regalo* (60 QV). Te faltan ${80 - totalQv} QV para regalo en compra directa.`
  } else {
    const falta60 = 60 - totalQv
    const falta80 = 80 - totalQv
    promo = `🎁 Te faltan ${falta60} QV para 1 producto de regalo en autoenvío (60 QV), o ${falta80} QV en compra directa (80 QV).`
  }
  if (!sumable) promo += `\
ℹ️ Los QV varían por formato: elige primero y te confirmo el total exacto.`

  const totalLine = sumable
    ? `*Total: S/ ${productos.reduce((s, p) => s + p.precio, 0).toFixed(2)} — ${totalQv} QV* 💰`
    : `*Puntos estimados: ${totalQv} QV* 💰`

  return `💚 *Precios FuXion Perú:*

${lineas.join('\
')}

${totalLine}

🎁 Junto a cada precio ves los *QV (puntos)*: con ellos obtienes *cajas de producto de regalo*.

${promo}

🛒 ¿Vas a llevar más de uno? Entra a *cualquiera de los links* de arriba y desde ahí añade los demás productos al carrito.

Compra aquí: ${TIENDA}
Verifica que aparezca *Emprende Salud* como patrocinador ✅

¿Te armo el pedido o tienes alguna duda? 💚`
}

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

const VIDEO_REGISTRO = 'https://awaretips.com/presentation?link=https%3A%2F%2Faware-cursos.s3.amazonaws.com%2FTutoriales%20para%20Clientes%2FComprar%20con%20Power%20Link.mp4'

const GUÍA_REGISTRO = `📝 *Cómo registrarte y comprar* (es rápido, 3 min):

1️⃣ Abre el link: ${TIENDA}
2️⃣ Verifica que arriba diga *Emprende Salud* como patrocinador ✅
3️⃣ Toca *"Registrarme como Cliente Preferente"* (es GRATIS)
4️⃣ Llena tus datos: nombre, DNI, celular, correo y dirección de envío
5️⃣ Elige tus productos y agrégalos al carrito
6️⃣ En *pago* puedes usar tarjeta de crédito/débito, Yape o Plin (según disponibilidad en tu país)
7️⃣ Confirma y ¡listo! Te llega confirmación al correo 💚

📹 *Si prefieres verlo en video*, aquí está el tutorial paso a paso:
${VIDEO_REGISTRO}

¿Te quedó claro o quieres que te guíe con algún paso en particular? Responde con el número del paso.`

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

const OPCION_PRECIO_FALLBACK = `💚 Para ver precios actualizados y armar tu pedido, entra directo a la tienda oficial:
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
const INTENT_PRODUCTO_RE = /para qu[eé] sirve|qu[eé] contiene|qu[eé] tiene|beneficios?|me sirve|me servir[ií]a|es bueno|es buena|es efectivo|recomiend|conviene|vale la pena|para (bajar|adelgazar|ganar|aumentar|quemar|la energ[ií]a|dormir|el colon|limpiar|desintoxicar)|me ayuda/i

const INTENT_DEPORTE_RE = /(deport|gym|gimnasio|entren|m[úu]sculo|prote[ií]na|biopro|sport|pre[- ]?entreno|post[- ]?entreno|crossfit|pesas|running|runner|whey|rendimiento|recuperaci[oó]n|muscular)/i
const INTENT_PESO_RE = /(peso|adelgaz|bajar|grasa|metabol|panza|abdomen|cintura|dieta|keto|thermo|nocarb|obesidad|sobrepeso|quema|fitness|tonificar|slim)/i
const INTENT_DIGESTION_RE = /(digest|est[óo]mago|barriga|colon|gastritis|hinchaz|hinchaz[oó]n|estreñ|diarrea|acidez|reflujo|tr[aá]nsito|intestino|prunex|flora|detox|limpieza|depur|toxinas|heces)/i
const INTENT_ENERGIA_RE = /(energ[ií]a|vitalidad|cansanc|fatiga|agotad|rendimiento|concentraci|foco|xpeed|vita xtra|vitaenergia|nutraday)/i
const INTENT_DEFENSAS_RE = /(defensa|inmun|gripe|resfr|alergia|virus|infecci|ganoderma|vera|duo defense|camu|wellmune)/i
const INTENT_BELLEZA_RE = /(belleza|piel|cabello|uñas|arrugas|rejuvenec|col[áa]geno|collagen|youth|beauty|anti-edad|articulaci|golden flx|probal|passion)/i
const PRECIO_RE = /\b(precio|precios|cu[aá]nto|cuesta|costo|costos|valor|cu[aá]nto sale|a cu[aá]nto|tarifa|tarifas)\b/i
const INTENT_NEGOCIO_RE = /\b(negocio|emprender|emprendimiento|plan de compensaci[oó]n|plan pro-lev|ingreso|ganar dinero|rentabilidad|bono|bonos|socio|distribuidor|multinivel|mlm|equipo|red|l[ií]der|diamante)\b/i
const INTENT_REGISTRO_RE = /(registr|no s[eé] registr|no me deja|no puedo pagar|c[oó]mo compro|c[oó]mo pago|qu[eé] hago despu[eé]s del link|ya abr[ií] el link|no me carga|error en la p[aá]gina|tutorial|paso a paso|c[oó]mo me inscribo|c[oó]mo hago la compra|no encuentro el producto|d[oó]nde agrego al carrito|no me llega confirmaci[oó]n)/i

// ── v5.1.0: cerebro comercial ────────────────────────────────────────
const INTENT_ADS_RE = /(info|informaci|precio|cu[aá]nto|valor|me interesa|quiero|dato|link|oferta|promo|descuento|anuncio|publicaci|fb|facebook|instagram)/i
const INTENT_FOTO_RE = /(foto|imagen|picture|m[aá]ndame|mandame|muestrame|mu[eé]strame|ver el producto|c[oó]mo se ve)/i
const INTENT_NUTRI_RE = /tabla nutricional|informaci[oó]n nutricional|valor(es)? nutricional|composici[oó]n|qu[eé] contiene|etiqueta nutricional/i
const INTENT_CIERRE_RE = /(quiero comprar|lo quiero|lo compro|lo llevo|me lo llevo|d[oó]nde pago|precio final|precio total|p[aá]same el link|p[aá]samelo|hag[aá]moslo|te lo compro|cerramos|cierro|lo reservo|reservado|cu[aá]l es tu yape|tienes yape)/i
const INTENT_QUiero_RE = /quiero|necesito|me llevo|pido|lo encargo|me apunto/i
const INTENT_CALORIAS_RE = /calor[ií]as|kcal|cu[aá]nta (az[uú]car|prote[ií]na|grasa|sodio)|valores? nutricional|az[uú]car tiene|composici[oó]n nutricional/i
const INTENT_VIDEO_RE = /v[ií]deo|muestrame|muéstrame|c[oó]mo funciona|d[oó]nde lo veo|demo|ver m[aá]s/i

// Ingredientes patentados que potencian cada producto (cerebro Dr. Columbus)
const PRODUCT_PATENTES = {
  'Biopro+ Sport': 'Actinos® — péptidos patentados que estimulan el óxido nítrico: más rendimiento y recuperación muscular más rápida',
  'Biopro+ Tect': 'BioFerrín® (hierro orgánico de alto valor biológico) + Colostrum® (factores inmunes del calostro)',
  'Biopro+ Fit': 'Prolibra® + Colostrum® — proteína láctea patentada que conserva la masa muscular magra en el control de peso',
  'Protein Active (Chocolate)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Protein Active (Vainilla)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Protein Active Fit (Chocolate)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Protein Active Fit (Vainilla)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Protein Active Sport (Chocolate)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Protein Active Sport (Vainilla)': 'Proteína vegetal ACTIVE® (chía, arroz y chícharo) — absorción completa, sin lactosa',
  'Youth Elixir': 'Optiberry® — mezcla patentada de berries antioxidantes + precursores naturales que apoyan la producción de HGH',
  'Liquid Fiber': 'Synergy1® — fibras prebióticas patentadas de cadena corta y larga (inulina + oligofructuosa)',
  'Vera+': 'Wellmune WGP® — beta-glucanos patentados que activan tus defensas naturales',
  'Café GanoMax': 'Wellmune WGP® — beta-glucanos patentados que activan tus defensas naturales',
}

// Videos oficiales por producto (material de venta — autoridad y prueba)
// v5.1.7: biblioteca completa de videos de Kervin (Vimeo oficiales FuXion)
const PRODUCT_VIDEOS = {
  // Línea deportiva
  'Biopro+ Sport': 'https://player.vimeo.com/video/310883791',
  'Post Sport': 'https://player.vimeo.com/video/310883977',
  'Xtra Mile': 'https://player.vimeo.com/video/310884835',
  'Pre Sport': 'https://player.vimeo.com/video/310884769',
  // Bebidas funcionales & tés
  'Rexet': 'https://vimeo.com/530903645/f86420d893',
  'Flora Liv': 'https://player.vimeo.com/video/250346688',
  'Prunex1': 'https://vimeo.com/530535912/5463d57132',
  'Alpha Balance': 'https://vimeo.com/332545658/77c12da716',
  'Berry Balance': 'https://player.vimeo.com/video/316830773',
  'Nutraday': 'https://vimeo.com/530911770/2019a9a43b',
  'Vita Xtra T+': 'https://player.vimeo.com/video/310883816',
  'Thermo T3': 'https://player.vimeo.com/video/310884797',
  'NoCarb-T': 'https://vimeo.com/546096164/2517ee1d22',
  'Youth Elixir': 'https://vimeo.com/763552282/2e8b80ce3a',
  'Golden FLX': 'https://player.vimeo.com/video/258003021',
  'Beauty-In': 'https://player.vimeo.com/video/280813242',
  'ON': 'https://player.vimeo.com/video/395314808',
  'No Stress': 'https://player.vimeo.com/video/258004322',
  'Vera+': 'https://player.vimeo.com/video/435791107',
  'Xpeed': 'https://player.vimeo.com/video/1066590719?h=96a598b46a',
  // Cafés & chocolates
  'Gano+ Cappuccino': 'https://vimeo.com/716948037/5f44a85009',
  'Café GanoMax': 'https://player.vimeo.com/video/352985774',
  'Chocolate Fit': 'https://player.vimeo.com/video/395541190',
  'Café & Café Fit': 'https://player.vimeo.com/video/250346390',
  'Café & Café Fit Cappuccino': 'https://player.vimeo.com/video/250346603',
  // Proteínas
  'Protein Active': 'https://player.vimeo.com/video/295236666',
  'Protein Active Fit': 'https://player.vimeo.com/video/295236666',
  'Protein Xoup': 'https://player.vimeo.com/video/294844304',
  'Biopro+ Tect': 'https://player.vimeo.com/video/310883858',
  'Biopro+ Fit': 'https://player.vimeo.com/video/310883858',
  // Packs
  'Pack 5/14 Keto': 'https://player.vimeo.com/video/302932781',
}

// Resuelve el video de un producto: nombre exacto o nombre base (sin sabor/presentación entre paréntesis)
const videoDe = (nombre) => {
  if (!nombre) return null
  if (PRODUCT_VIDEOS[nombre]) return PRODUCT_VIDEOS[nombre]
  const base = nombre.replace(/\s*\([^)]*\)\s*/g, '').trim()
  return PRODUCT_VIDEOS[base] || null
}

// Cross-sell de la línea deportiva (se recomienda el set completo al cliente sport)
const SPORT_LINE = ['Pre Sport', 'Xtra Mile', 'Biopro+ Sport', 'Post Sport']
const SPORT_CROSS_SELL = `💪 *Tip de la línea deportiva:* los atletas FuXion lo usan en secuencia: *Pre Sport* (energía antes) + *Xtra Mile* (rendimiento durante) + *Biopro+ Sport* (recuperación después) + *Post Sport* (reparación muscular).
¿Quieres el protocolo completo o empezamos con el que más necesitas?`

const MSG_CALIFICACION_ADS = `¡Hola! 💚 Soy *Valeria*, asesora oficial FuXion de *Emprende Salud*.

Veo que te interesa nuestra nutrición funcional. Para armarte el protocolo ideal, dime: ¿buscas *energía*, *control de peso*, *digestión*, *defensas*, *belleza* o *rendimiento deportivo*?`

const MSG_CIERRE_COMPRA = (nombre) => `¡Genial, ${nombre || 'crack'}! 🎉 Vamos a cerrarlo:

👉 Tienda oficial: ${TIENDA}
(verifica que aparezca *Emprende Salud* como patrocinador)

💳 *Formas de pago en la tienda:* tarjeta crédito/débito, Yape, Plin y otras opciones que aparecen al finalizar la compra.

¿Te guío paso a paso con la compra o prefieres el link directo de tu producto? 💚`

// Imágenes de productos (URL pública). Para agregar: tiendafuxion.com → foto del producto →
// clic derecho → "copiar dirección de imagen" → pegar entre comillas. Clave: 'Nombre|Presentación'
const PRODUCT_IMAGES = {
  "Alpha Balance": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145879_GRA_13092021_155007_MAIN.jpeg",
  "Alpha Balance|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145879_GRA_13092021_155007_MAIN.jpeg",
  "Base Madre Amarilla": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147147_GRA_04032024_172936_MAIN.jpg",
  "Base Madre Amarilla|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147147_GRA_04032024_172936_MAIN.jpg",
  "Base Madre Roja": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147148_GRA_04032024_173420_MAIN.jpg",
  "Base Madre Roja|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147148_GRA_04032024_173420_MAIN.jpg",
  "Base Madre Verde": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147146_GRA_28022024_232357_MAIN.jpg",
  "Base Madre Verde|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147146_GRA_28022024_232357_MAIN.jpg",
  "Beauty-In": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143065_GRA_17092020_225455_MAIN.jpg",
  "Beauty-In|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143065_GRA_17092020_225455_MAIN.jpg",
  "Berry Balance": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146065_GRA_08032021_181007_MAIN.jpg",
  "Berry Balance|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146065_GRA_08032021_181007_MAIN.jpg",
  "Biopro+ Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142167_GRA_17092020_213519_MAIN.jpg",
  "Biopro+ Fit|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142167_GRA_17092020_213519_MAIN.jpg",
  "Biopro+ Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141502_GRA_29092020_204153_MAIN.jpg",
  "Biopro+ Sport|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143288_GRA_17092020_232625_MAIN.jpg",
  "Biopro+ Sport|Pote x 2lb": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141502_GRA_29092020_204153_MAIN.jpg",
  "Biopro+ Tect": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141503_GRA_29092020_204010_MAIN.jpg",
  "Biopro+ Tect|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142169_GRA_17092020_212244_MAIN.jpg",
  "Biopro+ Tect|Pote x 500gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141503_GRA_29092020_204010_MAIN.jpg",
  "Café & Café Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141448_GRA_16102024_152908_MAIN.jpg",
  "Café & Café Fit Cappuccino": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141448_GRA_16102024_152908_MAIN.jpg",
  "Café & Café Fit Cappuccino|28 sticks x 15gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141448_GRA_16102024_152908_MAIN.jpg",
  "Café & Café Fit|28 sticks x 4gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141448_GRA_16102024_152908_MAIN.jpg",
  "Café GanoMax": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141293_GRA_18032021_155202_MAIN.jpg",
  "Café GanoMax|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_141293_GRA_18032021_155202_MAIN.jpg",
  "Chocolate Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142478_GRA_17092020_213940_MAIN.jpg",
  "Chocolate Fit|14 sticks x 15gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142478_GRA_17092020_213940_MAIN.jpg",
  "Combo Ponte en Forma": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146772_GRA_06092023_163114_MAIN.jpg",
  "Combo Ponte en Forma|Combo": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146772_GRA_06092023_163114_MAIN.jpg",
  "Flora Liv": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142953_GRA_17092020_210524_MAIN.jpg",
  "Flora Liv|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142953_GRA_17092020_210524_MAIN.jpg",
  "Gano+ Cappuccino": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142627_GRA_19112020_194441_MAIN.jpg",
  "Gano+ Cappuccino|28 sticks x 7.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142627_GRA_19112020_194441_MAIN.jpg",
  "Gano+ T": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144291_GRA_17092020_212939_MAIN.jpg",
  "Gano+ T|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144291_GRA_17092020_212939_MAIN.jpg",
  "Golden FLX": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143142_GRA_04112020_175822_MAIN.jpg",
  "Golden FLX|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143142_GRA_04112020_175822_MAIN.jpg",
  "Liquid Fiber": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144289_GRA_17092020_210738_MAIN.jpg",
  "Liquid Fiber|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144289_GRA_17092020_210738_MAIN.jpg",
  "No Stress": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143070_GRA_17092020_230030_MAIN.jpg",
  "No Stress|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143070_GRA_17092020_230030_MAIN.jpg",
  "No Stress|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144135_GRA_29092020_184254_MAIN.jpg",
  "NoCarb-T": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142624_GRA_17092020_213227_MAIN.jpg",
  "NoCarb-T|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142624_GRA_17092020_213227_MAIN.jpg",
  "Nutraday": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145716_GRA_04112020_195742_MAIN.jpg",
  "Nutraday|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145716_GRA_04112020_195742_MAIN.jpg",
  "ON": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143066_GRA_17092020_232011_MAIN.jpg",
  "ON|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143066_GRA_17092020_232011_MAIN.jpg",
  "ON|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144134_GRA_29092020_184440_MAIN.jpg",
  "Pack 5/14 Active Mito": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144915_GRA_08012021_160843_MAIN.jpg",
  "Pack 5/14 Active Mito|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144915_GRA_08012021_160843_MAIN.jpg",
  "Pack 5/14 Keto": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145259_GRA_17092020_224200_MAIN.jpg",
  "Pack 5/14 Keto|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145259_GRA_17092020_224200_MAIN.jpg",
  "Passion": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143067_GRA_08042026_164237_MAIN.jpg",
  "Passion|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143067_GRA_08042026_164237_MAIN.jpg",
  "Post Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143285_GRA_16022021_222533_MAIN.jpg",
  "Post Sport|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143285_GRA_16022021_222533_MAIN.jpg",
  "Pre Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143284_GRA_15042021_152445_MAIN.jpg",
  "Pre Sport|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143284_GRA_15042021_152445_MAIN.jpg",
  "Probal": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143068_GRA_30042026_164834_MAIN.jpg",
  "Probal|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143068_GRA_30042026_164834_MAIN.jpg",
  "Probix": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147232_GRA_08032024_184725_MAIN.jpg",
  "Probix|28 x 0.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_147232_GRA_08032024_184725_MAIN.jpg",
  "Programa Detox 5 Días": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144404_GRA_17092020_224113_MAIN.jpg",
  "Programa Detox 5 Días|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144404_GRA_17092020_224113_MAIN.jpg",
  "Protein Active (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143206_GRA_17092020_212141_MAIN.jpg",
  "Protein Active (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143206_GRA_17092020_212141_MAIN.jpg",
  "Protein Active (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143205_GRA_17092020_212015_MAIN.jpg",
  "Protein Active (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143205_GRA_17092020_212015_MAIN.jpg",
  "Protein Active Fit (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143208_GRA_17092020_213426_MAIN.jpg",
  "Protein Active Fit (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143208_GRA_17092020_213426_MAIN.jpg",
  "Protein Active Fit (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143207_GRA_20082020_220951_MAIN.jpg",
  "Protein Active Fit (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143207_GRA_20082020_220951_MAIN.jpg",
  "Protein Active Sport (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143287_GRA_17092020_232246_MAIN.jpg",
  "Protein Active Sport (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143287_GRA_17092020_232246_MAIN.jpg",
  "Protein Active Sport (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143286_GRA_23022021_214036_MAIN.jpg",
  "Protein Active Sport (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143286_GRA_23022021_214036_MAIN.jpg",
  "Protein Xoup (Brócoli)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142455_GRA_23092020_173058_MAIN.jpg",
  "Protein Xoup (Brócoli)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142455_GRA_23092020_173058_MAIN.jpg",
  "Protein Xoup (Crema Criolla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142456_GRA_03092020_152834_MAIN.jpg",
  "Protein Xoup (Crema Criolla)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142456_GRA_03092020_152834_MAIN.jpg",
  "Protein Xoup (Espárragos)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142457_GRA_20012021_213902_MAIN.jpg",
  "Protein Xoup (Espárragos)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142457_GRA_20012021_213902_MAIN.jpg",
  "Prunex1": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142626_GRA_26102020_142206_MAIN.jpg",
  "Prunex1|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142626_GRA_26102020_142206_MAIN.jpg",
  "Prunex1|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_149138_GRA_21072025_220955_MAIN.jpg",
  "Rexet": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145993_GRA_27012021_200316_MAIN.jpg",
  "Rexet|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145993_GRA_27012021_200316_MAIN.jpg",
  "Rexet|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144175_GRA_13092021_154951_MAIN.jpeg",
  "Thermo T3": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142623_GRA_17092020_213145_MAIN.jpg",
  "Thermo T3|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142623_GRA_17092020_213145_MAIN.jpg",
  "Thermo T3|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144136_GRA_13092021_161239_MAIN.jpeg",
  "Vera+": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143069_GRA_17092020_213013_MAIN.jpg",
  "Vera+|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143069_GRA_17092020_213013_MAIN.jpg",
  "Vita Xtra T+": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142625_GRA_13092021_155851_MAIN.jpeg",
  "Vita Xtra T+|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_142625_GRA_13092021_155851_MAIN.jpeg",
  "Vita Xtra T+|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_144133_GRA_29092020_183455_MAIN.jpg",
  "Vitaenergía": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_10105_GRA_29092020_153719_MAIN.jpg",
  "Vitaenergía|30 sticks x 7.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_10105_GRA_29092020_153719_MAIN.jpg",
  "Xpeed": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146291_GRA_14012022_005507_MAIN.jpg",
  "Xpeed|Pack x 4": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_146291_GRA_14012022_005507_MAIN.jpg",
  "Xtra Mile": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143283_GRA_17092020_232916_MAIN.jpg",
  "Xtra Mile|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_143283_GRA_17092020_232916_MAIN.jpg",
  "Youth Elixir": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145082_GRA_17092020_225522_MAIN.jpg",
  "Youth Elixir|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/imageProducts/PE/PE_145082_GRA_17092020_225522_MAIN.jpg",
}

const NUTRI_IMAGES = {
  "Alpha Balance": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57454_ES_18012024_231255.jpg",
  "Alpha Balance|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57454_ES_18012024_231255.jpg",
  "Base Madre Amarilla": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58718_ES_04032024_173022.jpg",
  "Base Madre Amarilla|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58718_ES_04032024_173022.jpg",
  "Base Madre Roja": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58719_ES_04032024_173609.jpg",
  "Base Madre Roja|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58719_ES_04032024_173609.jpg",
  "Base Madre Verde": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58717_ES_28022024_232610.jpg",
  "Base Madre Verde|Sobre x 50gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58717_ES_28022024_232610.jpg",
  "Beauty-In": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55752_ES_01022024_161836.jpg",
  "Beauty-In|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55752_ES_01022024_161836.jpg",
  "Berry Balance": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57565_ES_18012024_231459.jpg",
  "Berry Balance|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57565_ES_18012024_231459.jpg",
  "Biopro+ Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6036_ES_01022024_155450.jpg",
  "Biopro+ Fit|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6036_ES_01022024_155450.jpg",
  "Biopro+ Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5395_ES_01022024_173103.jpg",
  "Biopro+ Sport|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43594_ES_01022024_172850.jpg",
  "Biopro+ Sport|Pote x 2lb": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5395_ES_01022024_173103.jpg",
  "Biopro+ Tect": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5396_ES_18012024_232254.jpg",
  "Biopro+ Tect|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6038_ES_18012024_231901.jpg",
  "Biopro+ Tect|Pote x 500gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5396_ES_18012024_232254.jpg",
  "Café & Café Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5343_ES_16102024_155131.jpg",
  "Café & Café Fit Cappuccino": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5343_ES_16102024_155131.jpg",
  "Café & Café Fit Cappuccino|28 sticks x 15gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5343_ES_16102024_155131.jpg",
  "Café & Café Fit|28 sticks x 4gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5343_ES_16102024_155131.jpg",
  "Café GanoMax": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5196_ES_02022021_175647.jpg",
  "Café GanoMax|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_5196_ES_02022021_175647.jpg",
  "Chocolate Fit": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6316_ES_16122022_002603.png",
  "Chocolate Fit|14 sticks x 15gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6316_ES_16122022_002603.png",
  "Flora Liv": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6778_ES_16012024_181154.jpg",
  "Flora Liv|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6778_ES_16012024_181154.jpg",
  "Gano+ Cappuccino": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57395_ES_19012024_002009.jpg",
  "Gano+ Cappuccino|28 sticks x 7.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57395_ES_19012024_002009.jpg",
  "Gano+ T": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55599_ES_02022021_175603.jpg",
  "Gano+ T|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55599_ES_02022021_175603.jpg",
  "Golden FLX": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55753_ES_01022024_162928.jpg",
  "Golden FLX|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55753_ES_01022024_162928.jpg",
  "Liquid Fiber": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55602_ES_02022021_173859.jpg",
  "Liquid Fiber|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55602_ES_02022021_173859.jpg",
  "No Stress": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55754_ES_01022024_172411.jpg",
  "No Stress|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55754_ES_01022024_172411.jpg",
  "No Stress|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55328_ES_01022024_172559.png",
  "NoCarb-T": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55751_ES_01022024_154932.jpg",
  "NoCarb-T|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55751_ES_01022024_154932.jpg",
  "Nutraday": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57320_ES_18012024_235309.jpg",
  "Nutraday|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57320_ES_18012024_235309.jpg",
  "ON": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55750_ES_01022024_170110.jpg",
  "ON|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55750_ES_01022024_170110.jpg",
  "ON|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55327_ES_01022024_170255.png",
  "Pack 5/14 Active Mito": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56978_ES_02022021_190903.jpg",
  "Pack 5/14 Active Mito|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56978_ES_02022021_190903.jpg",
  "Pack 5/14 Keto": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56787_ES_02022021_190809.jpg",
  "Pack 5/14 Keto|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56787_ES_02022021_190809.jpg",
  "Passion": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_62051_ES_08042026_164317.jpg",
  "Passion|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_62051_ES_08042026_164317.jpg",
  "Post Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43595_ES_01022024_174651.jpg",
  "Post Sport|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43595_ES_01022024_174651.jpg",
  "Pre Sport": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43597_ES_01022024_173803.jpg",
  "Pre Sport|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43597_ES_01022024_173803.jpg",
  "Probix": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58831_ES_08032024_185003.png",
  "Probix|28 x 0.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_58831_ES_08032024_185003.png",
  "Programa Detox 5 Días": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55603_ES_02022021_190716.jpg",
  "Programa Detox 5 Días|Caja Pack": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55603_ES_02022021_190716.jpg",
  "Protein Active (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55178_ES_18012024_232614.jpg",
  "Protein Active (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55178_ES_18012024_232614.jpg",
  "Protein Active (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55177_ES_18012024_232939.jpg",
  "Protein Active (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55177_ES_18012024_232939.jpg",
  "Protein Active Fit (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55180_ES_01022024_160029.jpg",
  "Protein Active Fit (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55180_ES_01022024_160029.jpg",
  "Protein Active Fit (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55179_ES_01022024_160235.jpg",
  "Protein Active Fit (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55179_ES_01022024_160235.jpg",
  "Protein Active Sport (Chocolate)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43593_ES_01022024_173305.jpg",
  "Protein Active Sport (Chocolate)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43593_ES_01022024_173305.jpg",
  "Protein Active Sport (Vainilla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43598_ES_01022024_173513.jpg",
  "Protein Active Sport (Vainilla)|14 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43598_ES_01022024_173513.jpg",
  "Protein Xoup (Brócoli)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6293_ES_02022021_180907.jpg",
  "Protein Xoup (Brócoli)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6293_ES_02022021_180907.jpg",
  "Protein Xoup (Crema Criolla)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6294_ES_02022021_180807.jpg",
  "Protein Xoup (Crema Criolla)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6294_ES_02022021_180807.jpg",
  "Protein Xoup (Espárragos)": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6295_ES_02022021_180949.jpg",
  "Protein Xoup (Espárragos)|7 sticks x 25gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6295_ES_02022021_180949.jpg",
  "Prunex1": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6458_ES_16012024_180308.jpg",
  "Prunex1|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6458_ES_16012024_180308.jpg",
  "Prunex1|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_61053_ES_21072025_221036.jpg",
  "Rexet": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57507_ES_16012024_214504.jpg",
  "Rexet|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_57507_ES_16012024_214504.jpg",
  "Rexet|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55370_ES_18012024_222903.png",
  "Thermo T3": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6455_ES_01022024_153947.jpg",
  "Thermo T3|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6455_ES_01022024_153947.jpg",
  "Thermo T3|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55329_ES_01022024_154150.png",
  "Vera+": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55933_ES_18012024_235653.jpg",
  "Vera+|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55933_ES_18012024_235653.jpg",
  "Vita Xtra T+": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6457_ES_02022021_175201.jpg",
  "Vita Xtra T+|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_6457_ES_02022021_175201.jpg",
  "Vita Xtra T+|7 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_55326_ES_18012024_235031.png",
  "Vitaenergía": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_4838_ES_02022021_175019.jpg",
  "Vitaenergía|30 sticks x 7.5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_4838_ES_02022021_175019.jpg",
  "Xpeed": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_146291_ES_10012022_152122.jpg",
  "Xpeed|Pack x 4": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_146291_ES_10012022_152122.jpg",
  "Xtra Mile": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43596_ES_01022024_174042.jpg",
  "Xtra Mile|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_43596_ES_01022024_174042.jpg",
  "Youth Elixir": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56639_ES_01022024_162622.jpg",
  "Youth Elixir|28 sticks x 5gr": "https://fuxionstorage.blob.core.windows.net/vhdfuxionoffix/newOffix/nutritionalInformation/PE/IN_PE_56639_ES_01022024_162622.jpg",
}

const PRODUCT_INFO = {
  "Alpha Balance": { b: "Sus extractos de vegetales verdes, ricos en clorofila y energía natural te ayudan a: - Mantener tu organismo balanceado, limpio y purificado. - Liberarte de residuos y toxinas perjudiciales para tu organismo. - Tener más energía para que tu cuerpo funcione correctamente.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día a la hora que lo desees. De preferencia al levantarte o con tu jugo del desayuno." },
  "Alpha Balance|28 sticks x 5gr": { b: "Sus extractos de vegetales verdes, ricos en clorofila y energía natural te ayudan a: - Mantener tu organismo balanceado, limpio y purificado. - Liberarte de residuos y toxinas perjudiciales para tu organismo. - Tener más energía para que tu cuerpo funcione correctamente.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día a la hora que lo desees. De preferencia al levantarte o con tu jugo del desayuno." },
  "Base Madre Amarilla": { b: "La Base Madre Amarilla Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Base Madre Amarilla|Sobre x 50gr": { b: "La Base Madre Amarilla Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Base Madre Roja": { b: "La Base Madre Roja Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Base Madre Roja|Sobre x 50gr": { b: "La Base Madre Roja Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Base Madre Verde": { b: "La Base Madre Verde Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Base Madre Verde|Sobre x 50gr": { b: "La Base Madre Verde Q'ocina en Casa te ayuda a cocinar rico, fácil y sano: - Rico: desarrollada por Gastón y su equipo de Chefs, siguiendo todos los procesos y secretos que garantizan un sabor inigualable. - Fácil: ahorrarás tiempo en la cocina, ya que el equipo de Chefs: pican, fríen, procesan por ti para que puedas utilizar directamente el producto, añadiendo sólo los vegetales que hagan falta según la receta. - Sano: Gracias al proceso de liofilización de Fuxion, los vegetales se preservan, manteniendo intacto sus sabores y aromas, por eso son libres de preservantes, colorantes y saborizantes artificiales.", u: "Rehidrata la base con agua de acuerdo a la receta de tu elección. Puedes usar todo el contenido como base para platos de 4 porciones o agregarla a tu gusto para darle un toque especial a tus preparaciones caseras." },
  "Beauty-In": { b: "Su consumo diario ayuda a: - Mejorar la estructura de la dermis; para tener una piel con mayor elasticidad, más firme y uniforme (sin arrugas). - Nutrir, proteger y reparar la piel dañada. - Prevenir la aparición de los signos del envejecimiento prematuro causado por los radicales libres. - Fortalecer también cabello y uñas.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Un stick al día, de preferencia antes de acostarse." },
  "Beauty-In|28 sticks x 5gr": { b: "Su consumo diario ayuda a: - Mejorar la estructura de la dermis; para tener una piel con mayor elasticidad, más firme y uniforme (sin arrugas). - Nutrir, proteger y reparar la piel dañada. - Prevenir la aparición de los signos del envejecimiento prematuro causado por los radicales libres. - Fortalecer también cabello y uñas.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Un stick al día, de preferencia antes de acostarse." },
  "Berry Balance": { b: "Los ingredientes de Berry Balance te ayudarán a: - Prevenir las molestias del tracto urinario. - Prevenir la retención de líquidos. - Promover el equilibrio del pH de la flora que protege el tracto urinario.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, a cualquier hora. Para mejores resultádos tómalo entre comidas, con el estómago vacío." },
  "Berry Balance|28 sticks x 5gr": { b: "Los ingredientes de Berry Balance te ayudarán a: - Prevenir las molestias del tracto urinario. - Prevenir la retención de líquidos. - Promover el equilibrio del pH de la flora que protege el tracto urinario.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, a cualquier hora. Para mejores resultádos tómalo entre comidas, con el estómago vacío." },
  "Biopro+ Fit": { b: "Su consumo diario te ayudará a: - Mejorar la nutrición a nivel celular, especialmente las fibras musculares si haces ejercicio; lo que contribuye a tonificar la masa muscular. - Acelerar el metabolismo; lo que permite consumir más energía (calorías), eliminando grasa del cuerpo (*). - Reducir la sensación de apetito gracias a la proteína, sumada a la acción de Prolibra®. - Apoyar un programa de control de peso y reducir riesgos en tu salud (**). Prolibra® es un ingrediente derivado del suero lácteo. Está clínicamente comprobado que disminuye significativamente la grasa corporal mientras se mantiene la masa magra, logrando una pérdida de peso saludable. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Biopro+ Fit|14 sticks x 25gr": { b: "Su consumo diario te ayudará a: - Mejorar la nutrición a nivel celular, especialmente las fibras musculares si haces ejercicio; lo que contribuye a tonificar la masa muscular. - Acelerar el metabolismo; lo que permite consumir más energía (calorías), eliminando grasa del cuerpo (*). - Reducir la sensación de apetito gracias a la proteína, sumada a la acción de Prolibra®. - Apoyar un programa de control de peso y reducir riesgos en tu salud (**). Prolibra® es un ingrediente derivado del suero lácteo. Está clínicamente comprobado que disminuye significativamente la grasa corporal mientras se mantiene la masa magra, logrando una pérdida de peso saludable. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Biopro+ Sport": { b: "Sus ingredientes te ayudarán a: - Incrementar el flujo sanguíneo y el rendimiento físico, gracias a Actinos®, formulación de péptidos patentada. - Generar masa muscular magra y marcada menos tiempo (*). - Mejorar la recuperación y aporte de oxígeno al músculo. Actinos® es un péptido natural que favorece la producción de óxido nítrico en el organismo, acortando el tiempo de recuperación muscular, incrementando la capacidad arterial y mejorando el desempeño físico del deportista. (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos batidos al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)" },
  "Biopro+ Sport|14 sticks x 25gr": { b: "Sus ingredientes te ayudarán a: - Incrementar el flujo sanguíneo y el rendimiento físico, gracias a Actinos®, formulación de péptidos patentada. - Generar masa muscular magra y marcada menos tiempo (*). - Mejorar la recuperación y aporte de oxígeno al músculo. Actinos® es un péptido natural que favorece la producción de óxido nítrico en el organismo, acortando el tiempo de recuperación muscular, incrementando la capacidad arterial y mejorando el desempeño físico del deportista. (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos batidos al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)" },
  "Biopro+ Sport|Pote x 2lb": { b: "Sus ingredientes te ayudarán a: - Incrementar el flujo sanguíneo y el rendimiento físico, gracias a Actinos®, formulación de péptidos patentada. - Generar masa muscular magra y marcada menos tiempo (*). - Mejorar la recuperación y aporte de oxígeno al músculo. Actinos® es un péptido natural que favorece la producción de óxido nítrico en el organismo, acortando el tiempo de recuperación muscular, incrementando la capacidad arterial y mejorando el desempeño físico del deportista. (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos batidos al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)" },
  "Biopro+ Tect": { b: "Su formulación aporta Lactoferrina, aminoácidos esenciales y micronutrientes que te permitirán: - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria. - Mejorar los procesos de regeneración celular. - Mantener saludable el sistema de defensas del organismo. - Fortalecer los huesos.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Biopro+ Tect|14 sticks x 25gr": { b: "Su formulación aporta Lactoferrina, aminoácidos esenciales y micronutrientes que te permitirán: - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria. - Mejorar los procesos de regeneración celular. - Mantener saludable el sistema de defensas del organismo. - Fortalecer los huesos.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Biopro+ Tect|Pote x 500gr": { b: "Su formulación aporta Lactoferrina, aminoácidos esenciales y micronutrientes que te permitirán: - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria. - Mejorar los procesos de regeneración celular. - Mantener saludable el sistema de defensas del organismo. - Fortalecer los huesos.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Café & Café Fit": { b: "Sus componentes te ayudarán a: - Reducir la sensación de cansancio y fatiga. - Reducir la sensación de apetito. - Apoyar un programa de control de peso y medidas (*). - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento. De preferencia entre comidas, para controlar el apetito." },
  "Café & Café Fit Cappuccino": { b: "Sus componentes te ayudarán a: - Reducir la sensación de cansancio y fatiga. - Reducir la sensación de apetito. - Apoyar un programa de control de peso y medidas (*). - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento. De preferencia entre comidas, para controlar el apetito." },
  "Café & Café Fit Cappuccino|28 sticks x 15gr": { b: "Sus componentes te ayudarán a: - Reducir la sensación de cansancio y fatiga. - Reducir la sensación de apetito. - Apoyar un programa de control de peso y medidas (*). - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento. De preferencia entre comidas, para controlar el apetito." },
  "Café & Café Fit|28 sticks x 4gr": { b: "Sus componentes te ayudarán a: - Reducir la sensación de cansancio y fatiga. - Reducir la sensación de apetito. - Apoyar un programa de control de peso y medidas (*). - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento. De preferencia entre comidas, para controlar el apetito." },
  "Café GanoMax": { b: "Sus propiedades te permitirán: - Reforzar y regular el funcionamiento del sistema inmunológico. - Reducir el daño oxidativo. - Mantener tu actividad, mientras tu organismo se defiende.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Café GanoMax|28 sticks x 5gr": { b: "Sus propiedades te permitirán: - Reforzar y regular el funcionamiento del sistema inmunológico. - Reducir el daño oxidativo. - Mantener tu actividad, mientras tu organismo se defiende.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Chocolate Fit": { b: "El consumo de 2 tazas diarias de esta bebida ayuda a: - Reducir medidas corporales, al acelerar el metabolismo de las grasas (*). - Incrementar la masa magra sobre la masa grasa, para que tengas una vida más saludable (**). - Incrementar la satisfacción y reducir la ansiedad. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Tomar dos sticks al día, en cualquier momento." },
  "Chocolate Fit|14 sticks x 15gr": { b: "El consumo de 2 tazas diarias de esta bebida ayuda a: - Reducir medidas corporales, al acelerar el metabolismo de las grasas (*). - Incrementar la masa magra sobre la masa grasa, para que tengas una vida más saludable (**). - Incrementar la satisfacción y reducir la ansiedad. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Tomar dos sticks al día, en cualquier momento." },
  "Flora Liv": { b: "Su consumo diario te ayuda a: - Regenerar y equilibrar la flora intestinal, necesaria para la correcta asimilación de los nutrientes. - Mantener activo tu sistema de defensa. - Prevenir trastornos digestivos. - Recuperar la flora intestinal luego de tratamientos, que alteran el ecosistema intestinal.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, de preferencia por la mañana en ayunas o por la noche antes de dormir." },
  "Flora Liv|28 sticks x 5gr": { b: "Su consumo diario te ayuda a: - Regenerar y equilibrar la flora intestinal, necesaria para la correcta asimilación de los nutrientes. - Mantener activo tu sistema de defensa. - Prevenir trastornos digestivos. - Recuperar la flora intestinal luego de tratamientos, que alteran el ecosistema intestinal.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, de preferencia por la mañana en ayunas o por la noche antes de dormir." },
  "Gano+ Cappuccino": { b: "Sus antioxidantes y micronutrientes te ayudarán a: - Reducir el daño oxidativo que afecta tu sistema natural de protección. - Modular un funcionamiento normal de tus defensas naturales.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Gano+ Cappuccino|28 sticks x 7.5gr": { b: "Sus antioxidantes y micronutrientes te ayudarán a: - Reducir el daño oxidativo que afecta tu sistema natural de protección. - Modular un funcionamiento normal de tus defensas naturales.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Gano+ T": { b: "Esta combinación de ingredientes te ayudará a: - Mantener activas tus defensas naturales. - Reducir el daño oxidativo que ocasiona deterioro celular. - Modular tu sistema inmunológico para que disfrutes de una vida plena.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Gano+ T|28 sticks x 5gr": { b: "Esta combinación de ingredientes te ayudará a: - Mantener activas tus defensas naturales. - Reducir el daño oxidativo que ocasiona deterioro celular. - Modular tu sistema inmunológico para que disfrutes de una vida plena.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Dos sticks al día, en cualquier momento." },
  "Golden FLX": { b: "Los ingredientes de Golden Flx trabajan en sinergia para: - Contribuir a prevenir las molestias articulares ocasionados por la edad, el sobrepeso y el ejercicio. - Contribuir a mejorar la flexibilidad y movilidad de articulaciones. - Ayudar a controlar los procesos oxidativos.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Toma uno o dos sticks al día, en cualquier momento." },
  "Golden FLX|28 sticks x 5gr": { b: "Los ingredientes de Golden Flx trabajan en sinergia para: - Contribuir a prevenir las molestias articulares ocasionados por la edad, el sobrepeso y el ejercicio. - Contribuir a mejorar la flexibilidad y movilidad de articulaciones. - Ayudar a controlar los procesos oxidativos.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Toma uno o dos sticks al día, en cualquier momento." },
  "Liquid Fiber": { b: "Su consumo diario te ayudará a: - Mejorar la nutrición y el balance de la flora intestinal. - Mejorar la frecuencia de las evacuaciones intestinales de manera natural. - Promover la salud digestiva.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia antes de acostarse." },
  "Liquid Fiber|28 sticks x 5gr": { b: "Su consumo diario te ayudará a: - Mejorar la nutrición y el balance de la flora intestinal. - Mejorar la frecuencia de las evacuaciones intestinales de manera natural. - Promover la salud digestiva.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia antes de acostarse." },
  "No Stress": { b: "Los ingredientes de No Stress contribuyen a: - Mantener la sensación de equilibrio frente al estrés y la ansiedad. - Mantener la concentración y enfoque en momentos de gran tensión. - Mejorar la capacidad de relajación.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, en cualquier momento. Si se quiere mejorar la calidad de sueño, puedo tomarse antes de dormir." },
  "No Stress|28 sticks x 5gr": { b: "Los ingredientes de No Stress contribuyen a: - Mantener la sensación de equilibrio frente al estrés y la ansiedad. - Mantener la concentración y enfoque en momentos de gran tensión. - Mejorar la capacidad de relajación.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, en cualquier momento. Si se quiere mejorar la calidad de sueño, puedo tomarse antes de dormir." },
  "No Stress|7 sticks x 5gr": { b: "Los ingredientes de No Stress contribuyen a: - Mantener la sensación de equilibrio frente al estrés y la ansiedad. - Mantener la concentración y enfoque en momentos de gran tensión. - Mejorar la capacidad de relajación.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, en cualquier momento. Si se quiere mejorar la calidad de sueño, puedo tomarse antes de dormir." },
  "NoCarb-T": { b: "Su consumo diario te ayuda a: - Controlar los carbohidratos de tu dieta. - Reducir la acumulación de grasa en el organismo. - Mantener normales los niveles de glucosa (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Tomar uno o dos sticks al día, antes o durante las comidas." },
  "NoCarb-T|28 sticks x 5gr": { b: "Su consumo diario te ayuda a: - Controlar los carbohidratos de tu dieta. - Reducir la acumulación de grasa en el organismo. - Mantener normales los niveles de glucosa (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Tomar uno o dos sticks al día, antes o durante las comidas." },
  "Nutraday": { b: "Su consumo diario ayudará a: - Complementar tu nutrición con la dosis adecuada de antioxidantes, vitaminas y minerales. - Mantener en estado óptimo tu sistema inmunológico. - Tener un óptimo desarrollo físico y mental.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, de preferencia por las mañanas y por las tardes." },
  "Nutraday|28 sticks x 5gr": { b: "Su consumo diario ayudará a: - Complementar tu nutrición con la dosis adecuada de antioxidantes, vitaminas y minerales. - Mantener en estado óptimo tu sistema inmunológico. - Tener un óptimo desarrollo físico y mental.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, de preferencia por las mañanas y por las tardes." },
  "ON": { b: "La acción de los ingredientes de On te ayudan a: - Mantener tu mente activa y alerta. - Nutrir tu cerebro y mejorar tu función neuronal. - Reforzar tu función cognitiva.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, en cualquier momento." },
  "ON|28 sticks x 5gr": { b: "La acción de los ingredientes de On te ayudan a: - Mantener tu mente activa y alerta. - Nutrir tu cerebro y mejorar tu función neuronal. - Reforzar tu función cognitiva.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, en cualquier momento." },
  "ON|7 sticks x 5gr": { b: "La acción de los ingredientes de On te ayudan a: - Mantener tu mente activa y alerta. - Nutrir tu cerebro y mejorar tu función neuronal. - Reforzar tu función cognitiva.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, en cualquier momento." },
  "Pack 5/14 Active Mito": { b: "Siguiendo las estrategias del Programa 5/14 contribuyes a reducir tu peso corporal: - Alimentándote 5 veces al día. - Llevando tu metabolismo hacia un ritmo sano y natural. - Reduciendo grasa corporal y tonificando tus músculos (lo que evita la flacidez). - Elevando tu nivel de energía y sensación de bienestar. ¡El Programa 5/14 Active incluye ahora la dieta 5/14 MITO, de ayuno Intermitente parcial, ¡acompañada de deliciosas recetas! Una dieta Mito o Mitocondrial promueve la óptima función del metabolismo, usando la grasa almacenada en el cuerpo como fuente de energía.", u: "" },
  "Pack 5/14 Active Mito|Caja Pack": { b: "Siguiendo las estrategias del Programa 5/14 contribuyes a reducir tu peso corporal: - Alimentándote 5 veces al día. - Llevando tu metabolismo hacia un ritmo sano y natural. - Reduciendo grasa corporal y tonificando tus músculos (lo que evita la flacidez). - Elevando tu nivel de energía y sensación de bienestar. ¡El Programa 5/14 Active incluye ahora la dieta 5/14 MITO, de ayuno Intermitente parcial, ¡acompañada de deliciosas recetas! Una dieta Mito o Mitocondrial promueve la óptima función del metabolismo, usando la grasa almacenada en el cuerpo como fuente de energía.", u: "" },
  "Pack 5/14 Keto": { b: "Siguiendo las estrategias del Programa 5/14 contribuyes a reducir tu peso corporal: - Alimentándote 5 veces al día. - Llevando tu metabolismo hacia un ritmo sano y natural. - Reduciendo grasa corporal y tonificando tus músculos (lo que evita la flacidez). - Elevando tu nivel de energía y sensación de bienestar. ¡El Programa 5/14 incluye ahora la dieta 5/14 KETO, de ayuno Intermitente parcial, acompañada de deliciosas recetas! Una dieta Keto o Cetogénica se centra en el consumo mínimo de carbohidratos, cantidades moderadas de proteína y un consumo elevado de grasas saludables.", u: "" },
  "Pack 5/14 Keto|Caja Pack": { b: "Siguiendo las estrategias del Programa 5/14 contribuyes a reducir tu peso corporal: - Alimentándote 5 veces al día. - Llevando tu metabolismo hacia un ritmo sano y natural. - Reduciendo grasa corporal y tonificando tus músculos (lo que evita la flacidez). - Elevando tu nivel de energía y sensación de bienestar. ¡El Programa 5/14 incluye ahora la dieta 5/14 KETO, de ayuno Intermitente parcial, acompañada de deliciosas recetas! Una dieta Keto o Cetogénica se centra en el consumo mínimo de carbohidratos, cantidades moderadas de proteína y un consumo elevado de grasas saludables.", u: "" },
  "Passion": { b: "Los ingredientes de Passion te ayudarán a: - Mejorar la vitalidad gracias a la L-arginina, isoleucina y glutamina, potentes aminoácidos. - Incrementar la energía por su contenido de maca, ginseng y teína del té negro. - Vigorizar el cuerpo gracias a su contenido de jalea real y zinc orgánico.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Un stick al día, en cualquier momento." },
  "Passion|28 sticks x 5gr": { b: "Los ingredientes de Passion te ayudarán a: - Mejorar la vitalidad gracias a la L-arginina, isoleucina y glutamina, potentes aminoácidos. - Incrementar la energía por su contenido de maca, ginseng y teína del té negro. - Vigorizar el cuerpo gracias a su contenido de jalea real y zinc orgánico.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Un stick al día, en cualquier momento." },
  "Post Sport": { b: "Además, te ayuda a: - Reparar, incrementar y fortalecer las fibras musculares. - Neutralizar el efecto catabólico producido durante el ejercicio intenso, gracias a los antioxidantes contenidos en la granada, acerola, romero y antocianinas.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, después del entrenamiento." },
  "Post Sport|28 sticks x 5gr": { b: "Además, te ayuda a: - Reparar, incrementar y fortalecer las fibras musculares. - Neutralizar el efecto catabólico producido durante el ejercicio intenso, gracias a los antioxidantes contenidos en la granada, acerola, romero y antocianinas.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, después del entrenamiento." },
  "Pre Sport": { b: "Su consumo antes de la actividad física te ayuda a: - Mantener la hidratación corporal gracias a su aporte de electrolitos. - Aumentar la resistencia, al promover la vasodilatación (mejora la nutrición y la oxigenación muscular). - Reducir la fatiga y mejorar el desempeño deportivo gracias a la energía extra que brinda a tu cuerpo.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, antes del entrenamiento." },
  "Pre Sport|28 sticks x 5gr": { b: "Su consumo antes de la actividad física te ayuda a: - Mantener la hidratación corporal gracias a su aporte de electrolitos. - Aumentar la resistencia, al promover la vasodilatación (mejora la nutrición y la oxigenación muscular). - Reducir la fatiga y mejorar el desempeño deportivo gracias a la energía extra que brinda a tu cuerpo.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, antes del entrenamiento." },
  "Probix": { b: "Gracias a los probióticos lisados que contiene ayuda a: - Reducir significativamente la grasa visceral. - Regular el metabolismo. - Reducir la circunferencia de la cintura.", u: "Espolvorea un sobre diario en tus comidas. Recomendación de Consumo Tomar uno o dos sticks al día, antes o durante las comidas." },
  "Probix|28 x 0.5gr": { b: "Gracias a los probióticos lisados que contiene ayuda a: - Reducir significativamente la grasa visceral. - Regular el metabolismo. - Reducir la circunferencia de la cintura.", u: "Espolvorea un sobre diario en tus comidas. Recomendación de Consumo Tomar uno o dos sticks al día, antes o durante las comidas." },
  "Programa Detox 5 Días": { b: "Para ayudarte a: - Promover la eliminación de toxinas. - Afinar tu metabolismo (alistar tu cuerpo para iniciar alguna dieta o algún deporte). - Revitalizar tu cuerpo y mejorar tu estado de ánimo. - Crear hábitos positivos en tu estilo de vida para promover la limpieza y renovación constante de tu cuerpo y mente. ¡Todo esto te ayudará a nutrir tus células adecuadamente y hará que el proceso de desintoxicación sea más completo!", u: "Sigue las indicaciones del Plan Nutricional Detox 5 días de la cartilla incluida con tu compra para poder combinar adecuadamente los alimentos y recetas recomendadas con nuestros productos. Recomendación de Consumo Es importante que sigas el programa en el orden indicado para lograr el máximo resultado." },
  "Programa Detox 5 Días|Caja Pack": { b: "Para ayudarte a: - Promover la eliminación de toxinas. - Afinar tu metabolismo (alistar tu cuerpo para iniciar alguna dieta o algún deporte). - Revitalizar tu cuerpo y mejorar tu estado de ánimo. - Crear hábitos positivos en tu estilo de vida para promover la limpieza y renovación constante de tu cuerpo y mente. ¡Todo esto te ayudará a nutrir tus células adecuadamente y hará que el proceso de desintoxicación sea más completo!", u: "Sigue las indicaciones del Plan Nutricional Detox 5 días de la cartilla incluida con tu compra para poder combinar adecuadamente los alimentos y recetas recomendadas con nuestros productos. Recomendación de Consumo Es importante que sigas el programa en el orden indicado para lograr el máximo resultado." },
  "Protein Active (Chocolate)": { b: "Su consumo diario te ayudará a: - Una asimilación óptima de aminoácidos esenciales, lo que le permitirá a tu cuerpo regenerar sus tejidos en menor tiempo. - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria de forma más eficaz. - Reducir el daño oxidativo que afecta tu sistema natural de defensa y tu desempeño mental.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active (Chocolate)|14 sticks x 25gr": { b: "Su consumo diario te ayudará a: - Una asimilación óptima de aminoácidos esenciales, lo que le permitirá a tu cuerpo regenerar sus tejidos en menor tiempo. - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria de forma más eficaz. - Reducir el daño oxidativo que afecta tu sistema natural de defensa y tu desempeño mental.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active (Vainilla)": { b: "Su consumo diario te ayudará a: - Una asimilación óptima de aminoácidos esenciales, lo que le permitirá a tu cuerpo regenerar sus tejidos en menor tiempo. - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria de forma más eficaz. - Reducir el daño oxidativo que afecta tu sistema natural de defensa y tu desempeño mental.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active (Vainilla)|14 sticks x 25gr": { b: "Su consumo diario te ayudará a: - Una asimilación óptima de aminoácidos esenciales, lo que le permitirá a tu cuerpo regenerar sus tejidos en menor tiempo. - Elevar cualitativa y cuantitativamente el perfil proteico de la dieta diaria de forma más eficaz. - Reducir el daño oxidativo que afecta tu sistema natural de defensa y tu desempeño mental.", u: "Con la ayuda de un shaker o batidora, mezcla el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Toma uno o dos sticks al día, como snack o merienda entre comidas. También puedes tomarlo como complemento del desayuno o la cena, como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active Fit (Chocolate)": { b: "Sus proteínas, aminoácidos, oligoelementos y extractos vegetales te ayudarán a: - Controlar tu peso y reducir medidas, mientras tonificas músculos (*). - Asimilar de manera óptima aminoácidos esenciales, lo que le permitirá a tu cuerpo lograr una mejor tonicidad. - Reducir la sensación de apetito gracias a la proteína vegetal, la cual asimilarás de manera más rápida y efectiva. - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active Fit (Chocolate)|14 sticks x 25gr": { b: "Sus proteínas, aminoácidos, oligoelementos y extractos vegetales te ayudarán a: - Controlar tu peso y reducir medidas, mientras tonificas músculos (*). - Asimilar de manera óptima aminoácidos esenciales, lo que le permitirá a tu cuerpo lograr una mejor tonicidad. - Reducir la sensación de apetito gracias a la proteína vegetal, la cual asimilarás de manera más rápida y efectiva. - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active Fit (Vainilla)": { b: "Sus proteínas, aminoácidos, oligoelementos y extractos vegetales te ayudarán a: - Controlar tu peso y reducir medidas, mientras tonificas músculos (*). - Asimilar de manera óptima aminoácidos esenciales, lo que le permitirá a tu cuerpo lograr una mejor tonicidad. - Reducir la sensación de apetito gracias a la proteína vegetal, la cual asimilarás de manera más rápida y efectiva. - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active Fit (Vainilla)|14 sticks x 25gr": { b: "Sus proteínas, aminoácidos, oligoelementos y extractos vegetales te ayudarán a: - Controlar tu peso y reducir medidas, mientras tonificas músculos (*). - Asimilar de manera óptima aminoácidos esenciales, lo que le permitirá a tu cuerpo lograr una mejor tonicidad. - Reducir la sensación de apetito gracias a la proteína vegetal, la cual asimilarás de manera más rápida y efectiva. - Reducir riesgos en tu salud (**). (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Dos sticks al día, como snack o merienda entre comidas (para completar cinco comidas diarias). Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)." },
  "Protein Active Sport (Chocolate)": { b: "Además, te ayudará a: - Mantener el perfil proteico adecuado para la dieta de un deportista. - Mejorar la recuperación y aporte de oxígeno al músculo. - Generar masa muscular magra y marcada en menos tiempo (*). (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Tomar dos sticks al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada como plátanos/ bananas)." },
  "Protein Active Sport (Chocolate)|14 sticks x 25gr": { b: "Además, te ayudará a: - Mantener el perfil proteico adecuado para la dieta de un deportista. - Mejorar la recuperación y aporte de oxígeno al músculo. - Generar masa muscular magra y marcada en menos tiempo (*). (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Tomar dos sticks al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada como plátanos/ bananas)." },
  "Protein Active Sport (Vainilla)": { b: "Además, te ayudará a: - Mantener el perfil proteico adecuado para la dieta de un deportista. - Mejorar la recuperación y aporte de oxígeno al músculo. - Generar masa muscular magra y marcada en menos tiempo (*). (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Tomar dos sticks al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)" },
  "Protein Active Sport (Vainilla)|14 sticks x 25gr": { b: "Además, te ayudará a: - Mantener el perfil proteico adecuado para la dieta de un deportista. - Mejorar la recuperación y aporte de oxígeno al músculo. - Generar masa muscular magra y marcada en menos tiempo (*). (*) Junto a una dieta balanceada y ejercicio.", u: "Con la ayuda de un shaker o batidora, mezclar el contenido de un stick en un vaso con 250 ml de agua fría. Recomendación de Consumo Tomar dos sticks al día, entre comidas o después del entrenamiento. Tómalo como batido (solo con agua y hielo) o como smoothie (combinado con jugos y fruta congelada)" },
  "Protein Xoup (Brócoli)": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Protein Xoup (Brócoli)|7 sticks x 25gr": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Protein Xoup (Crema Criolla)": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Protein Xoup (Crema Criolla)|7 sticks x 25gr": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Protein Xoup (Espárragos)": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Protein Xoup (Espárragos)|7 sticks x 25gr": { b: "Los ingredientes de Protein Xoup te ayudan a: - Acompañar nuevos momentos, con una nutrición más saludable que ayuda a controlar el hambre. - Reducir medidas, promover la tonificación muscular y definir tu figura. - Mantener el funcionamiento de tu sistema de defensa (**). (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "En un jarro o mug de capacidad de 200 ml, verter agua caliente hasta la mitad, y con la ayuda de un tenedor (de preferencia) o cucharita, disolver el contenido del stick hasta disolver los grumos. ¡Luego rellenar la otra mitad con agua caliente, remover y consumir! Recomendación de Consumo Toma uno o dos sticks al día, una hora antes del almuerzo y una hora antes de la cena, o en cualquier momento que se tenga hambre." },
  "Prunex1": { b: "La formulación de PRUNEX1 te ayuda a: . Tener un adecuado tránsito intestinal. . Sentirte más liviano sin las molestias de la hinchazón abdominal. . Liberarte de desechos perjudiciales para tu organismo.", u: "Disuelve el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Toma medio stick o un stick al día, por la noche antes de dormir." },
  "Prunex1|28 sticks x 5gr": { b: "La formulación de PRUNEX1 te ayuda a: . Tener un adecuado tránsito intestinal. . Sentirte más liviano sin las molestias de la hinchazón abdominal. . Liberarte de desechos perjudiciales para tu organismo.", u: "Disuelve el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Toma medio stick o un stick al día, por la noche antes de dormir." },
  "Prunex1|7 sticks x 5gr": { b: "La formulación de PRUNEX1 te ayuda a: . Tener un adecuado tránsito intestinal. . Sentirte más liviano sin las molestias de la hinchazón abdominal. . Liberarte de desechos perjudiciales para tu organismo.", u: "Disuelve el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Toma medio stick o un stick al día, por la noche antes de dormir." },
  "Rexet": { b: "Sus componentes te ayudan a: - Mantener optimas las funciones metabólicas del hígado. - Promover la función depurativa desde el sistema digestivo. - Mantener el cuerpo en equilibrio, limpio de toxinas.", u: "Disuelve el contenido de un stick en un vaso de agua (360 ml) espera a que reaccione el polvo efervescente y tómalo inmediatamente para aprovechar su frescura. Recomendación de Consumo Tómalo en las mañanas en ayunas. También si tienes algún festejo, toma un sobre antes y otro al regresar, así podrás sentirte renovado al día siguiente." },
  "Rexet|28 sticks x 5gr": { b: "Sus componentes te ayudan a: - Mantener optimas las funciones metabólicas del hígado. - Promover la función depurativa desde el sistema digestivo. - Mantener el cuerpo en equilibrio, limpio de toxinas.", u: "Disuelve el contenido de un stick en un vaso de agua (360 ml) espera a que reaccione el polvo efervescente y tómalo inmediatamente para aprovechar su frescura. Recomendación de Consumo Tómalo en las mañanas en ayunas. También si tienes algún festejo, toma un sobre antes y otro al regresar, así podrás sentirte renovado al día siguiente." },
  "Rexet|7 sticks x 5gr": { b: "Sus componentes te ayudan a: - Mantener optimas las funciones metabólicas del hígado. - Promover la función depurativa desde el sistema digestivo. - Mantener el cuerpo en equilibrio, limpio de toxinas.", u: "Disuelve el contenido de un stick en un vaso de agua (360 ml) espera a que reaccione el polvo efervescente y tómalo inmediatamente para aprovechar su frescura. Recomendación de Consumo Tómalo en las mañanas en ayunas. También si tienes algún festejo, toma un sobre antes y otro al regresar, así podrás sentirte renovado al día siguiente." },
  "Thermo T3": { b: "Esta combinación de ingredientes te permitirá: - Reducir medidas, al reducir la acumulación de grasa en el organismo (*). - Reducir riesgos en tu salud (**). - Aumentar tu resistencia, por lo que es recomendable que lo consumas antes de una rutina de ejercicio. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Uno o dos sticks al día, después de las comidas. Si haces ejercicio, tómalo antes de entrenar." },
  "Thermo T3|28 sticks x 5gr": { b: "Esta combinación de ingredientes te permitirá: - Reducir medidas, al reducir la acumulación de grasa en el organismo (*). - Reducir riesgos en tu salud (**). - Aumentar tu resistencia, por lo que es recomendable que lo consumas antes de una rutina de ejercicio. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Uno o dos sticks al día, después de las comidas. Si haces ejercicio, tómalo antes de entrenar." },
  "Thermo T3|7 sticks x 5gr": { b: "Esta combinación de ingredientes te permitirá: - Reducir medidas, al reducir la acumulación de grasa en el organismo (*). - Reducir riesgos en tu salud (**). - Aumentar tu resistencia, por lo que es recomendable que lo consumas antes de una rutina de ejercicio. (*) Junto a una dieta balanceada y ejercicio. (**) Se considera al sobrepeso como un factor de riesgo para diversas enfermedades.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Uno o dos sticks al día, después de las comidas. Si haces ejercicio, tómalo antes de entrenar." },
  "Vera+": { b: "Esta combinación de ingredientes te ayudará a: -Mantener activas tus defensas naturales. -Reducir el daño oxidativo que ocasiona deterioro celular.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Uno o dos sticks al día, en cualquier momento." },
  "Vera+|28 sticks x 5gr": { b: "Esta combinación de ingredientes te ayudará a: -Mantener activas tus defensas naturales. -Reducir el daño oxidativo que ocasiona deterioro celular.", u: "Disolver el contenido de un stick en una taza con 180 ml de agua caliente. Recomendación de Consumo Uno o dos sticks al día, en cualquier momento." },
  "Vita Xtra T+": { b: "Sus componentes energizantes y antioxidantes te ayudan a: - Mantenerte alerta y de buen ánimo. - Mejorar tu rendimiento físico y desempeño diario en general. - Reducir la oxidación de las células y la proliferación de radicales libres que pueden afectar tu metabolismo y tu sistema inmune.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos stick al día, de preferencia al levantarte, para que empieces tu día con energía y despues del almuerzo para arrancar la tarde con energia." },
  "Vita Xtra T+|28 sticks x 5gr": { b: "Sus componentes energizantes y antioxidantes te ayudan a: - Mantenerte alerta y de buen ánimo. - Mejorar tu rendimiento físico y desempeño diario en general. - Reducir la oxidación de las células y la proliferación de radicales libres que pueden afectar tu metabolismo y tu sistema inmune.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos stick al día, de preferencia al levantarte, para que empieces tu día con energía y despues del almuerzo para arrancar la tarde con energia." },
  "Vita Xtra T+|7 sticks x 5gr": { b: "Sus componentes energizantes y antioxidantes te ayudan a: - Mantenerte alerta y de buen ánimo. - Mejorar tu rendimiento físico y desempeño diario en general. - Reducir la oxidación de las células y la proliferación de radicales libres que pueden afectar tu metabolismo y tu sistema inmune.", u: "Disuelve el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Toma uno o dos stick al día, de preferencia al levantarte, para que empieces tu día con energía y despues del almuerzo para arrancar la tarde con energia." },
  "Vitaenergía": { b: "Sus componentes antioxidantes y mix de micronutrientes te ayudan a: - Disipar la sensación de fatiga gracias a sus componentes energéticos. - Mejorar la asimilación de proteínas, así como los procesos de regeneración celular y a reforzar el sistema inmunológico. - Reducir la oxidación de las células y la proliferación de radicales libres.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia al levantarse." },
  "Vitaenergía|30 sticks x 7.5gr": { b: "Sus componentes antioxidantes y mix de micronutrientes te ayudan a: - Disipar la sensación de fatiga gracias a sus componentes energéticos. - Mejorar la asimilación de proteínas, así como los procesos de regeneración celular y a reforzar el sistema inmunológico. - Reducir la oxidación de las células y la proliferación de radicales libres.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia al levantarse." },
  "Xpeed": { b: "TODAS ESTAS PROPIEDADES TE AYUDARÁN A: - Obtener energía balanceada con poder antioxidante. - Protege el sistema metabólico y contribuye al buen funcionamiento del sistema productor de energía. - Combatir la fatiga. - Refrescarte, gracias a su Sparkling Effect.", u: "Es un producto listo para tomar, solo tiene que abrir la lata tirando de la anilla y disfrutar su delicioso sabor. Evite agitar la lata antes de abrirlo. Recomendación de Consumo TÓMALO BIEN FRÍO Apto para veganos. Sin gas carbónico (Co2) Sin preservantes. Sin azúcar, ni aspartame. No contiene gluten. No contiene caseina, ni lactosa. No GMO (Sin organismos genéticamente modificados) Se recomienda no mezclar con bebidas alcohólicas. En caso de hipertensión consulte con su médico antes de tomarlo. No apto para alérgicos a la cafeína." },
  "Xpeed|Pack x 4": { b: "TODAS ESTAS PROPIEDADES TE AYUDARÁN A: - Obtener energía balanceada con poder antioxidante. - Protege el sistema metabólico y contribuye al buen funcionamiento del sistema productor de energía. - Combatir la fatiga. - Refrescarte, gracias a su Sparkling Effect.", u: "Es un producto listo para tomar, solo tiene que abrir la lata tirando de la anilla y disfrutar su delicioso sabor. Evite agitar la lata antes de abrirlo. Recomendación de Consumo TÓMALO BIEN FRÍO Apto para veganos. Sin gas carbónico (Co2) Sin preservantes. Sin azúcar, ni aspartame. No contiene gluten. No contiene caseina, ni lactosa. No GMO (Sin organismos genéticamente modificados) Se recomienda no mezclar con bebidas alcohólicas. En caso de hipertensión consulte con su médico antes de tomarlo. No apto para alérgicos a la cafeína." },
  "Xtra Mile": { b: "Su consumo durante el ejercicio te ayuda a: - Mantener adecuados niveles de glucosa. - Mantener la energía de manera sostenida. - Reducir la fatiga durante el ejercicio.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, antes o durante del entrenamiento." },
  "Xtra Mile|28 sticks x 5gr": { b: "Su consumo durante el ejercicio te ayuda a: - Mantener adecuados niveles de glucosa. - Mantener la energía de manera sostenida. - Reducir la fatiga durante el ejercicio.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Tomar un stick al día, antes o durante del entrenamiento." },
  "Youth Elixir": { b: "Los componentes de Youth Elixir HGH te ayudarán a: - Aumentar la vitalidad, la elasticidad de la piel y mejorar la calidad del sueño. - Prevenir los efectos del envejecimiento prematuro, producido por los radicales libres.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia antes de acostarse." },
  "Youth Elixir|28 sticks x 5gr": { b: "Los componentes de Youth Elixir HGH te ayudarán a: - Aumentar la vitalidad, la elasticidad de la piel y mejorar la calidad del sueño. - Prevenir los efectos del envejecimiento prematuro, producido por los radicales libres.", u: "Disolver el contenido de un stick en un vaso con 180 ml de agua fría. Recomendación de Consumo Uno o dos sticks al día, de preferencia antes de acostarse." },
}

const PRODUCT_INGREDIENTES = {
  "Beauty-In": "PÉPTIDOS DE COLÁGENO BIOACTIVO OPTIMIZADO + COENZIMA Q10 + SESBANIA (BIOTINA NATURAL) + CONCENTRADO DE SÚPER FRUTAS EXÓTICAS (VITAMINAS C Y E) + ZINC",
  "Berry Balance": "CRANBERRY + CONCENTRADO DE BERRIES Y FRUTAS TROPICALES + INFUSIÓN DE PIÑA + BACTERIAS PROBIÓTICAS + ANTOCIANINA + CALCIO ORGÁNICO + VITAMINAS C Y E",
  "Biopro+ Fit": "BIOPROTEIN + CON COLOSTRUM® + PROLIBRA® + AMINOÁCIDOS + TAMARINDO MALABAR + VITAMINAS + DHA Y ARA",
  "Biopro+ Tect": "BIOPROTEIN + CON COLOSTRUM® + BIOFERRÍN® + AMINOÁCIDOS + CALCIO LÁCTEO + DHA Y ARA",
  "Café & Café Fit": "CAFÉ TOSTADO LIOFILIZADO + EXTRACTO DE CAFÉ VERDE",
  "Chocolate Fit": "CACAO PURO DEL AMAZONAS + PROTEÍNA VEGETAL + CAFÉ VERDE + CLA + CROMO ORGÁNICO",
  "Flora Liv": "CULTIVOS PROBIÓTICOS + FIBRA PREBIÓTICA + PULPA DE GRANADILLA + AGUAYMANTO",
  "Gano+ Cappuccino": "EXTRACTO DE GANODERMA LUCIDUM + QUILLAY + MICRONUTRIENTES",
  "Gano+ T": "GANODERMA LUCIDUM + EXTRACTO DE TÉ BLANCO + VITAMINA C Y D",
  "Golden FLX": "XTRACTO DE CÚRCUMA + JENGIBRE + CARDAMOMO + LECHE DE COCO + PIMIENTA NEGRA + CANELA",
  "No Stress": "AMINOÁCIDOS (L- TEANINA, GLICINA, TRIPTÓFANO) + EXTRACTO DE SÚPER FRUTAS (ASHWAGANDHA, AMALAKI Y LIMÓN) + MAGNESIO EN MOLÉCULA ORGÁNICA + VITAMINAS DEL COMPLEJO B",
  "NoCarb-T": "FIBRAS SOLUBLES (FIBRA DE YACÓN + FIBRA DE ACACIA + INULINA DE ACHICORIA + PECTINA DE MANZANA) + VERDOLAGA + CANELA + TÉ VERDE + CROMO",
  "Nutraday": "EXTRACTO DE MORINGA + GUAYABA + LIMÓN + ALBAHACA + CAMU CAMU + ACAI BERRY + ACEROLA + QUINUA GERMINADA (FUENTES NATURALES DE ANTIOXIDANTES, 12 VITAMINAS Y 5 MINERALES ORGÁNICOS)",
  "Passion": "AMINOÁCIDOS + EXTRACTO DE JALEA REAL + MACA + GINSENG + ZINC ORGÁNICO",
  "Probal": "EXTRACTO DE AGUAJE + EXTRACTO DE DONG QUAI + EXTRACTO DE ORÉGANO + TRIPTÓFANO + MAGNESIO + EXTRACTO DE CAMU-CAMU + EXTRACTO DE MARIGOLD (LUTEÍNA)",
  "Protein Active (Chocolate)": "DISFRÚTALA EN SUS SABORES DE VAINILLA Y CANELA Y CHOCOLATE CON AVELLANAS. BIOPROTEIN ACTIVE® (PROTEÍNA DE QUINUA GERMINADA, DE ARROZ INTEGRAL GERMINADO, DE ARVEJA, DE ALGAS) + AMINOÁCIDOS + VITAMINAS + DHA Y ARA + ACEITE DE COCO",
  "Protein Active (Vainilla)": "DISFRÚTALA EN SUS SABORES DE VAINILLA Y CANELA Y CHOCOLATE CON AVELLANAS. BIOPROTEIN ACTIVE® (PROTEÍNA DE QUINUA GERMINADA, DE ARROZ INTEGRAL GERMINADO, DE ARVEJA, DE ALGAS) + AMINOÁCIDOS + VITAMINAS + DHA Y ARA + ACEITE DE COCO",
  "Protein Active Fit (Chocolate)": "DISFRÚTALA EN SUS SABORES DE VAINILLA Y CANELA Y CHOCOLATE CON AVELLANAS. BIOPROTEIN ACTIVE® (PROTEÍNA DE QUINUA GERMINADA, DE ARVEJA, DE ARROZ INTEGRAL GERMINADO Y DE ALGAS) + AMINOÁCIDOS ESENCIALES + L-CARNITINA + TAMARINDO MALABAR + VITAMINAS + CALCIO, CROMO Y ZINC EN MOLÉCULA ORGÁNICA",
  "Protein Active Fit (Vainilla)": "DISFRÚTALA EN SUS SABORES DE VAINILLA Y CANELA Y CHOCOLATE CON AVELLANAS. BIOPROTEIN ACTIVE® (PROTEÍNA DE QUINUA GERMINADA, DE ARVEJA, DE ARROZ INTEGRAL GERMINADO Y DE ALGAS) + AMINOÁCIDOS ESENCIALES + L-CARNITINA + TAMARINDO MALABAR + VITAMINAS + CALCIO, CROMO Y ZINC EN MOLÉCULA ORGÁNICA",
  "Prunex1": "MIX DE FIBRAS (PSYLLIUM, INULINA DE ACHICORIA, MUCÍLAGO DE LINAZA) + EXTRACTO DE GUINDÓN + KELP + ANÍS ESTRELLA",
  "Rexet": "MIX DE EXTRACTOS VEGETALES (TUNA ROJA, ALCACHOFA, HIERBA LUISA, PEREJIL, ACEROLA, CLOROFILA) + BICARBONATO DE SODIO + MIX DE MINERALES (ZINC, MAGNESIO) + TAURINA + VITAMINAS DEL COMPLEJO B, VITAMINA C Y D + ACETILCISTEÍNA",
  "Thermo T3": "MIX DE TÉS (VERDE, NEGRO Y ROJO) + CETONAS DE FRAMBUESA + GARCINIA CAMBOGIA + L-CARNITINA + CAFÉ VERDE + ÁCIDO ALFA LIPOICO + VITAMINA B6 + CROMO",
  "Vera+": "EXTRACTO DE ALOE VERA + BETA GLUCANOS + MIX DE AMINOÁCIDOS (N-ACETILCISTEÍNA + GLICINA + L-GLUTAMINA) + EXTRACTO DE HOJA DE OLIVA + AMALAKI (VITAMINA C)",
  "Vita Xtra T+": "GUAYUSA + TÉ VERDE + ACAI BERRY + GOJI BERRY + MICELIO DE CORDYCEPS + MACA + GINSENG + ANTOCIANINA DE MAÍZ MORADO",
  "Vitaenergía": "GUAYUSA + TÉ VERDE + ACAI BERRY + GOJI BERRY + MICELIO DE CORDYCEPS + MACA + GINSENG + ANTOCIANINA DE MAÍZ MORADO",
  "Youth Elixir": "AMINOÁCIDOS + ANTIOXIDANTES + RESVERATROL + OPTIBERRY®",
}

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

const SYSTEM_PROMPT_WA = `Eres "Valeria", asesora de élite de FUXION Perú para Emprende Salud (distribuidor independiente oficial). Integras 3 maestrías en una sola voz:
- ALEX DEY (cierre asumido): seguridad absoluta, cazadora de objeciones. Nunca preguntas "¿quieres comprar?": asumes el sí y preguntas "¿Te lo envío por Yape o tarjeta?".
- JÜRGEN KLARIC (neuromarketing): conectas con emociones. Storytelling de clientes, anclaje de precios (primero la opción completa), gatillos de autoridad y reciprocidad.
- DR. IVÁN COLUMBUS (ciencia Fuxion): respaldo técnico. Dominas la Fusión Nutracéutica® y los ingredientes patentados. Solo afirmas lo que la ciencia de Fuxion respalda.

IDENTIDAD Y ESTILO
- Español peruano, tuteo, cercana pero autoritaria. MÁXIMO 3 líneas cortas por mensaje.
- Humana, no robot: reconoce lo que acaba de decir el cliente ("¡Buena elección!", "Te entiendo", "Me cuentas que..."), varía tus frases y usa expresiones naturales ("al toque", "crack", "¿me cuentas?"). Nunca suenes a plantilla.
- 1-2 emojis (💚💪✨). Cada mensaje termina en pregunta de avance o cierre.
- Nunca repitas menús numerados; el sistema los envía. Responde la duda directa.

MISIÓN
- Cerrar la venta en el primer contacto o dejar el lead calificado para seguimiento.
- Prioriza packs (mejor valor) cuando encaje; si el cliente pide algo puntual, respétalo.
- Ticket ideal: packs 5/14 y línea Sport.

FORMAS DE PAGO (tienda oficial tiendafuxion.com)
- La tienda acepta múltiples formas de pago: tarjeta de crédito o débito, Yape, Plin y otras opciones que aparecen al finalizar la compra.
- Cuando el cliente esté listo para pagar, menciónalo: "Puedes pagar con tarjeta, Yape, Plin u otras formas directo en la tienda".
- Si quiere pagar por una vía fuera de la tienda (transferencia a cuenta personal, efectivo) → ofrece pasar con Kervin (opción 2).

LINKS
- Tienda general: ${TIENDA} (debe aparecer Emprende Salud como patrocinador).
- Biopro+ Sport Pote 2lb directo: https://tiendafuxion.com/storelt/emprendesalud/3171015
- Web: ${LANDING} — Guía de Nutrición Funcional gratis.
- Si te pasan links directos en el mensaje del sistema, úsalos para el producto que mencione el cliente.
- ¿"Por qué Perú?" / "¿solo en Perú?": FuXion está en 16 países — Alemania, Argentina, Bolivia, Brasil, Chile, Colombia, Costa Rica, Ecuador, España, Estados Unidos, Guatemala, Honduras, México, Panamá y Perú. Tu asesora (Valeria) opera desde Perú.

ARSENAL DE VENTAS (natural, nunca robótico)
- Cierre asumido: "¿Te lo envío en sobre o en caja?"
- Pre-cierre: "Si resolvemos el tema del precio, ¿te lo llevas?"
- Reducción a lo ridículo: divide el precio entre 30 días ("son S/ X al día, menos que un café"). SOLO con precios que el sistema te haya dado.
- Cierre por alternativa: "¿Prefieres el pack para resultados rápidos o el mensual para mantenimiento?"
- Anclaje: presenta primero la opción completa (pack); la individual parece accesible.
- Autoridad: "La Fusión Nutracéutica® de Fuxion garantiza absorción hasta 6 veces superior".
- Reciprocidad: regala un tip de bienestar antes de vender.
- Escasez SOLO si el sistema la indica. Nunca inventes unidades ni fechas límite.

LEADS DESDE ANUNCIOS
- Mensajes genéricos ("info", "precio", "me interesa") = vienen de Facebook/Instagram. Abre con calificación: qué busca (energía, peso, digestión, defensas, belleza o deporte).
- Etapa diagnóstico: 1-2 preguntas (horario de comidas, frecuencia de entrenamiento, molestia principal).
- Luego recomienda 2 opciones (A premium pack / B essential), 1 línea de cómo tomar cada producto, y cierra con link.

CIERRE INMINENTE
- Si dice "quiero comprar", "dónde pago", "precio final", "pásame el link" → cierra YA: link + formas de pago + "¿Te lo reservo?".

MANEJO DE OBJECIONES
- "Está caro": empatía + reducción a lo ridículo (precio/30 días) + cierre por alternativa.
- "Lo pensaré": pre-cierre ("¿te preocupa más el precio o si funcionará?") + ofrece testimonio o tip científico.
- "No tengo tiempo": "son sticks listos, 30 segundos de preparación" + cierre asumido.
- "No confío / es MLM": empatía + autoridad (Fuxion es peruana, ciencia propia, más de 20 años) + ofrece Kervin (opción 2).

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
- Nunca digas cura/trata/sana/previene enfermedades. Usa "apoya", "contribuye a", "optimiza". Nada de "adelgaza" ni "quema grasa".
- NUNCA inventes precios ni ofertas: el sistema entrega precios exactos del catálogo. Si no hay precio disponible, redirige a la tienda u opción 2 con Kervin.
- No inventes testimonios con nombres ni datos; habla en general ("nuestros clientes nos cuentan...").
- No prometas resultados específicos (kg, días) como garantía.
- Enfermedad o síntoma → empatía + "consulta a tu médico".
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
  if (!cols.includes('last_in_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN last_in_at INTEGER DEFAULT 0')
  if (!cols.includes('alerta_seguimiento_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN alerta_seguimiento_at INTEGER DEFAULT 0')
  if (!cols.includes('reactivacion_at')) db.exec('ALTER TABLE wa_contacts ADD COLUMN reactivacion_at INTEGER DEFAULT 0')
  if (!cols.includes('last_product')) db.exec("ALTER TABLE wa_contacts ADD COLUMN last_product TEXT DEFAULT ''")
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
// Modo anti-baneo (v5.1.8): 20-40 segundos antes de responder, como una persona que lee y escribe
const humanDelay = () => sleep(20000 + Math.random() * 20000)

// ── Núcleo de envío por la API oficial de Meta (Cloud API) ──
// chatId puede venir como 5199...@c.us (WAHA) o 5199... (Cloud) — lo normalizamos
const toE164 = (chatId) => String(chatId).replace(/@(c\.us|lid)$/, '')

async function cloudSendRaw(to, payload) {
  try {
    const res = await fetch(`${GRAPH}/${CLOUD_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${CLOUD_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: toE164(to), ...payload }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('Cloud send error', res.status, detail.slice(0, 300))
      return false
    }
    return true
  } catch (e) {
    console.error('Cloud send ex', e?.message || e)
    return false
  }
}

// Plantilla aprobada por Meta — necesaria para escribir a alguien después de 24h sin respuesta
async function waSendTemplate(chatId, templateName, components = [], lang = 'es_PE') {
  if (!cloudReady()) return false
  const ok = await cloudSendRaw(chatId, {
    type: 'template',
    template: { name: templateName, language: { code: lang }, ...(components.length ? { components } : {}) },
  })
  if (ok) logMsg(chatId, 'out', `[plantilla] ${templateName}`)
  return ok
}

async function waSend(chatId, text) {
  if (cloudReady()) {
    const ok = await cloudSendRaw(chatId, { type: 'text', text: { body: text, preview_url: true } })
    if (ok) logMsg(chatId, 'out', text)
    return ok
  }
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


// v5: envío de imagen por URL pública (WAHA sendImage / Cloud image link)
async function waSendImage(chatId, url, caption = '') {
  try {
    if (cloudReady()) {
      const ok = await cloudSendRaw(chatId, { type: 'image', image: { link: url, caption } })
      if (ok) logMsg(chatId, 'out', `[imagen] ${url} ${caption}`.slice(0, 2000))
      return ok
    }
    const res = await fetch(`${WAHA_URL}/api/sendImage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_KEY },
      body: JSON.stringify({ session: WAHA_SESSION, chatId, file: { url }, caption }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('WAHA sendImage error', res.status, detail.slice(0, 200))
      return false
    }
    logMsg(chatId, 'out', `[imagen] ${url} ${caption}`.slice(0, 2000))
    return true
  } catch (e) {
    console.error('WAHA sendImage ex', e?.message || e)
    return false
  }
}

// v5: envío de nota de voz por URL pública (WAHA sendVoice / Cloud audio link)
async function waSendVoice(chatId, url) {
  try {
    if (cloudReady()) {
      const ok = await cloudSendRaw(chatId, { type: 'audio', audio: { link: url } })
      if (ok) logMsg(chatId, 'out', `[audio] ${url}`.slice(0, 2000))
      return ok
    }
    const res = await fetch(`${WAHA_URL}/api/sendVoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_KEY },
      body: JSON.stringify({ session: WAHA_SESSION, chatId, file: { url } }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('WAHA sendVoice error', res.status, detail.slice(0, 200))
      return false
    }
    logMsg(chatId, 'out', `[audio] ${url}`.slice(0, 2000))
    return true
  } catch (e) {
    console.error('WAHA sendVoice ex', e?.message || e)
    return false
  }
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
  if (!cloudReady() && (!WAHA_URL || !WAHA_KEY)) return
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
  try { db.prepare('UPDATE wa_contacts SET last_in_at = ? WHERE chat_id = ?').run(Date.now(), chatId) } catch { /* no crítico */ }

  const consume = () => {
    db.prepare('UPDATE wa_contacts SET replies_day = ?, replies_count = ? WHERE chat_id = ?')
      .run(day, count + 1, chatId)
    lastReplyTs.set(chatId, Date.now())
  }

  const lower = body.toLowerCase()

  // Modo anti-baneo (v5.1.8): fuera del horario de atención (8am-9pm Lima) NO se responde.
  // El mensaje queda registrado y se atiende cuando abre el horario — como una tienda real.
  if (!horarioAtencion()) {
    console.log('[horario] Fuera de atención, mensaje guardado para', chatId)
    return
  }

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

  // ── RUTAS DIRECTAS POR INTENCIÓN (v4.5.0) ──────────────────
  // Registro / problemas post-link — máxima prioridad (evita abandonos)
  if (INTENT_REGISTRO_RE.test(lower)) {
    await humanDelay(); if (await waSend(chatId, GUÍA_REGISTRO)) consume(); return
  }
  
  // Foto de producto (v5) — antes del matching de precios
  if (INTENT_FOTO_RE.test(lower)) {
    const prodsFoto = buscarProductos(body)
    if (prodsFoto.length > 0) {
      const p = prodsFoto[0]
      const imgUrl = PRODUCT_IMAGES[p.nombre + '|' + p.presentacion] || PRODUCT_IMAGES[p.nombre]
      await humanDelay()
      if (imgUrl) {
        if (await waSendImage(chatId, imgUrl, `${p.nombre} (${p.presentacion}) — S/ ${p.precio.toFixed(2)}. Más info: ${linkDeProducto(p) || p.link || TIENDA}`)) consume()
      } else {
        if (await waSend(chatId, `📸 Te paso el link directo de *${p.nombre}* (${p.presentacion}) — ahí ves la foto oficial y toda la ficha del producto:
${linkDeProducto(p) || p.link || TIENDA}

¿Te ayudo con algo más? 💚`)) consume()
      }
      return
    }
  }

  // Tabla nutricional (v5.1.2) + calorías/valores (v5.1.5) — etiqueta oficial, con contexto del producto
  if (INTENT_NUTRI_RE.test(lower) || INTENT_CALORIAS_RE.test(lower)) {
    const prodsNutri = buscarProductos(body)
    const pNutri = prodsNutri[0] || (contact.last_product ? buscarProductos(contact.last_product)[0] : null)
    if (pNutri) {
      const nutriUrl = NUTRI_IMAGES[pNutri.nombre + '|' + pNutri.presentacion] || NUTRI_IMAGES[pNutri.nombre]
      await humanDelay()
      if (nutriUrl) {
        if (await waSendImage(chatId, nutriUrl, `📋 Etiqueta oficial de *${pNutri.nombre}*: calorías, azúcar, proteína y valores completos. Cualquier duda, me dices 💚`)) consume()
      } else {
        if (await waSend(chatId, `📋 La tabla nutricional completa de *${pNutri.nombre}* está en su ficha oficial:
${pNutri.link || TIENDA}

Si quieres te explico los ingredientes principales por aquí. ¿Te ayudo? 💚`)) consume()
      }
      return
    }
  }

  // Video oficial del producto (v5.1.6) — prueba de autoridad para cerrar indecisos
  if (INTENT_VIDEO_RE.test(lower)) {
    const prodsVid = buscarProductos(body)
    const pVid = prodsVid[0] || (contact.last_product ? buscarProductos(contact.last_product)[0] : null)
    const linkVid = pVid ? videoDe(pVid.nombre) : null
    if (linkVid) {
      await humanDelay()
      if (await waSend(chatId, `🎬 *Video oficial de ${pVid.nombre}:*\n${linkVid}\n\nMíralo y me dices si te armo tu pedido 💪`)) consume()
      return
    }
  }

  // "Quiero X" (v5.1.5): señal de compra con producto detectado → respuesta con valor + patente + cierre
  if (INTENT_QUiero_RE.test(lower)) {
    const prodsQuiero = buscarProductos(body)
    if (prodsQuiero.length > 0) {
      const p = prodsQuiero[0]
      db.prepare('UPDATE wa_contacts SET last_product = ?, etiqueta = ? WHERE chat_id = ?')
        .run(p.nombre, 'caliente', chatId)
      const info = PRODUCT_INFO[p.nombre + '|' + p.presentacion] || PRODUCT_INFO[p.nombre]
      const patente = PRODUCT_PATENTES[p.nombre]
      const ingredientes = PRODUCT_INGREDIENTES[p.nombre]
      const b = info ? info.b : ''
      const msg = `💚 *${p.nombre}* — buena elección 😊

*Para qué sirve:*
${b || 'Te lo cuento en detalle:'}
${patente ? `⭐ *Tecnología patentada:* ${patente}` : ingredientes ? `⭐ *Contiene:* ${ingredientes}` : ''}

*Precio:* S/ ${p.precio.toFixed(2)} (${p.qv} QV)

🛒 Link directo: ${linkDeProducto(p) || p.link || TIENDA}
Formas de pago: tarjeta (hasta 3 cuotas), Yape o Plin ✅

¿Te lo envío por *Yape* o prefieres el *link de tarjeta*? 😊`
      await humanDelay()
      if (await waSend(chatId, msg)) consume()
      if (SPORT_LINE.includes(p.nombre)) {
        await humanDelay()
        if (await waSend(chatId, SPORT_CROSS_SELL)) consume()
      }
      return
    }
  }

  // Pregunta por producto (v5.1.3): para qué sirve / qué contiene / beneficios
  // Respuesta directa con info oficial + precio + CTA (sin depender de Gemini)
  if (INTENT_PRODUCTO_RE.test(lower)) {
    const prodsInfo = buscarProductos(body)
    if (prodsInfo.length > 0) {
      const p = prodsInfo[0]
      db.prepare(`UPDATE wa_contacts SET last_product = ?,
        etiqueta = CASE WHEN etiqueta IN ('nuevo','') THEN 'tibio' ELSE etiqueta END WHERE chat_id = ?`)
        .run(p.nombre, chatId)
      const info = PRODUCT_INFO[p.nombre + '|' + p.presentacion] || PRODUCT_INFO[p.nombre]
      const patente = PRODUCT_PATENTES[p.nombre]
      const ingredientes = PRODUCT_INGREDIENTES[p.nombre]
      await humanDelay()
      if (info) {
        const msg = `💚 *${p.nombre}* — te cuento al toque:

*Para qué sirve:*
${info.b}
${patente ? `⭐ *Tecnología patentada:* ${patente}` : ingredientes ? `*Qué contiene:* ${ingredientes}\n` : ''}*Cómo se toma:*
${info.u}

*Precio:* S/ ${p.precio.toFixed(2)} (${p.qv} QV)

¿Quieres que te pase el link para pedirlo? 😊`
        await humanDelay()
        if (await waSend(chatId, msg)) consume()
        if (SPORT_LINE.includes(p.nombre)) {
          await humanDelay()
          if (await waSend(chatId, SPORT_CROSS_SELL)) consume()
        }
      } else {
        if (await waSend(chatId, `💚 *${p.nombre}* (${p.presentacion}) — S/ ${p.precio.toFixed(2)} (${p.qv} QV)

Toda la info oficial, beneficios y tabla nutricional está aquí:
${linkDeProducto(p) || p.link || TIENDA}

¿Te paso el link de compra directo? 😊`)) consume()
      }
      return
    }
  }

  // Cierre inminente (v5): el cliente ya quiere comprar
  if (INTENT_CIERRE_RE.test(lower)) {
    await humanDelay()
    if (await waSend(chatId, MSG_CIERRE_COMPRA(nombre))) consume()
    return
  }

  // Precio con productos específicos — intentar matching de catálogo
  const productosEncontrados = buscarProductos(body)
  if (productosEncontrados.length > 0) {
    db.prepare('UPDATE wa_contacts SET last_product = ?, etiqueta = ? WHERE chat_id = ?')
      .run(productosEncontrados[0].nombre, 'caliente', chatId)
    await humanDelay()
    if (await waSend(chatId, mensajePrecios(productosEncontrados))) consume()
    return
  }
  
  // Precio genérico (si no detectó productos específicos)
  if (PRECIO_RE.test(lower)) {
    await humanDelay(); if (await waSend(chatId, OPCION_PRECIO_FALLBACK)) consume(); return
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

  // ── LEAD DESDE ANUNCIO (v5): mensaje genérico + contacto nuevo ──
  const esMensajeCorto = body.length <= 35
  const esContactoNuevo = !contact.objetivo && contact.etiqueta === 'nuevo'
  if (esMensajeCorto && esContactoNuevo && INTENT_ADS_RE.test(lower)) {
    await humanDelay()
    if (await waSend(chatId, MSG_CALIFICACION_ADS)) consume()
    return
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
  const linksHits = linksParaTexto(body)
  const infoHits = infoParaTexto(body)
  const contexto =
    (contact.objetivo ? `[Objetivo conocido del lead: ${contact.objetivo}] ` : '') +
    (contact.etapa && contact.etapa !== 'lead' ? `[Etapa en el embudo: ${contact.etapa}] ` : '') +
    (infoHits.length ? `[INFO OFICIAL FUXION de productos que menciona — ÚSALA en tu respuesta: ${infoHits.join(' || ')}] ` : '') +
    (linksHits.length ? `[Links directos de productos que menciona: ${linksHits.join(' | ')}] ` : '') +
    r`[REGLAS: 1) RESPONDE PRIMERO LO QUE EL CLIENTE PREGUNTÓ, sin rodeos. 2) Si pregunta por un producto (beneficios, para qué sirve, qué contiene, si le sirve para algo): responde con la INFO OFICIAL del contexto — para qué sirve en palabras simples + qué contiene (ingredientes clave, menciona la patente ®) + cómo se toma + precio/link de compra como cierre. 3) Si pregunta precio exacto, el sistema ya tiene catálogo; si no detectó productos, redirige a tienda. 4) Si está listo para comprar (dijo quiero comprar/dónde pago/precio final), cierra YA: link ${TIENDA} + formas de pago de la tienda (tarjeta, Yape, Plin u otras) + pregunta de confirmación. 5) Si no sabes algo, opción 2 con Kervin. 6) Si el lead es de la línea deportiva, recomienda el protocolo completo (Pre Sport + Xtra Mile + Biopro+ Sport + Post Sport) — sube el ticket. 7) Si hay video oficial en el contexto, ofrécelo como prueba.]`
  const reply = await geminiReply(contexto + body)
  await humanDelay()
  const final = reply || `Para ayudarte mejor, elige una opción:\n1️⃣ Productos y promoción\n2️⃣ Asesoría gratis con Kervin\n3️⃣ Negocio FuXion\n4️⃣ Proteína y deporte 💪`
  if (await waSend(chatId, final)) consume()
}

const DIA_MS = 24 * 60 * 60 * 1000
async function sweepSeguimiento() {
  if (!WAHA_URL || !WAHA_KEY || !db) return
  const now = Date.now()
  // v5: alertar a Kervin leads calientes/tibios sin compra hace 24-96h
  try {
    const leads = db.prepare(
      `SELECT chat_id, nombre, objetivo, etiqueta, last_in_at
       FROM wa_contacts WHERE compra_at = 0 AND etapa = 'lead'
         AND etiqueta IN ('caliente','tibio') AND last_in_at > 0
         AND alerta_seguimiento_at = 0`,
    ).all()
    for (const r of leads) {
      const horas = (now - Number(r.last_in_at || 0)) / (60 * 60 * 1000)
      if (horas >= 24 && horas <= 96) {
        db.prepare('UPDATE wa_contacts SET alerta_seguimiento_at = ? WHERE chat_id = ?').run(now, r.chat_id)
        await alertaKervin(
          '⏰ *LEAD sin cerrar (24h+)* — toca seguimiento manual',
          r.chat_id, r.nombre,
          `Lead ${r.etiqueta}${r.objetivo ? ' con objetivo "' + r.objetivo + '"' : ''}. Último mensaje hace ${Math.round(horas)}h y no ha comprado. Sugerencia (playbook Etapa 5): escríbele tú con un testimonio + oferta; el bot no puede escribir primero por seguridad del número.`,
          r.objetivo,
        )
      }
    }
  } catch (e) {
    console.error('sweep leads error', e?.message || e)
  }

  const rows = db.prepare(`
    SELECT chat_id, nombre, etapa, compra_at, alerta_2528_at, alerta_react_at
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

  // ── API OFICIAL DE WHATSAPP (Cloud API de Meta) — migración anti-baneo v5.1.9 ──
  // Meta exige verificar el webhook con un token; configurar en el panel de la app:
  //   URL de callback: https://www.emprendesalud.net/api/whatsapp/webhook
  //   Verify token:    (el valor de WA_CLOUD_VERIFY_TOKEN)
  app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    if (mode === 'subscribe' && token === CLOUD_VERIFY) {
      console.log('✅ Webhook oficial de WhatsApp verificado por Meta')
      return res.status(200).send(challenge)
    }
    return res.sendStatus(403)
  })

  app.post('/api/whatsapp/webhook', (req, res) => {
    res.sendStatus(200) // responder rápido a Meta; procesar async
    try {
      const entries = req.body?.entry || []
      for (const e of entries) {
        for (const ch of e.changes || []) {
          const v = ch.value || {}
          if (!Array.isArray(v.messages)) continue
          const nombre = v.contacts?.[0]?.profile?.name || ''
          for (const m of v.messages) {
            if (!m.from) continue
            const bodyText = m.type === 'text' ? String(m.text?.body || '') : ''
            handleMessage({
              from: `${m.from}@c.us`,
              body: bodyText,
              fromMe: false,
              _data: { notifyName: nombre },
            }).catch((err) => console.error('Cloud bot error:', err?.message || err))
          }
        }
      }
    } catch (e) {
      console.error('Cloud webhook error:', e?.message || e)
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
      db.prepare(`UPDATE wa_contacts SET etapa = 'cliente', etiqueta = 'cliente', compra_at = ?,
        alerta_2528_at = 0, alerta_react_at = 0 WHERE chat_id = ?`)
        .run(Date.now(), chatId)
      // Post-venta inmediata (v5.1.5): gracias + cómo tomarlo + siguiente pedido
      const c = db.prepare('SELECT nombre, last_product FROM wa_contacts WHERE chat_id = ?').get(chatId)
      const prod = c?.last_product ? (buscarProductos(c.last_product)[0] || null) : null
      const info = prod ? (PRODUCT_INFO[prod.nombre + '|' + prod.presentacion] || PRODUCT_INFO[prod.nombre]) : null
      const nombreC = c?.nombre ? c.nombre.split(' ')[0] : ''
      ;(async () => {
        await humanDelay()
        const msg = `¡Gracias${nombreC ? ' ' + nombreC : ''}! 🎉 Tu pedido va en camino.
${info ? `
*Cómo tomar tu ${prod.nombre}:* ${info.u}` : ''}
💡 Tu compra sumó puntos QV. En unos 25 días te escribo para tu siguiente pedido — así acumulas el producto de regalo 🎁

Cualquier duda me escribes. ¡Éxitos con tu nueva etapa! 💚`
        if (await waSend(chatId, msg)) {
          db.prepare(`INSERT INTO wa_logs (chat_id, direction, text) VALUES (?, 'out', ?)`).run(chatId, '[postventa] ' + msg.slice(0, 120))
        }
      })()
    }
    res.json({ ok: true, contact: db.prepare('SELECT chat_id, nombre, etapa, compra_at FROM wa_contacts WHERE chat_id = ?').get(chatId) })
  })

  // ── REACTIVACIÓN (v5.1.4): retomar conversación con leads de hoy sin respuesta ──
  // Solo contactos que: escribieron HOY, no han comprado, el bot respondió y ellos no
  // contestaron después, y aún no se les envió reactivación. Máx 20 por corrida.
  const NUMEROS_KERVIN = ['51970848043@c.us', '51970848043@lid']
  app.post('/api/waha/reactivar', async (req, res) => {
    const key = req.body?.key || req.headers['x-admin-key']
    if (key !== (process.env.ADMIN_KEY || 'emprende2026')) {
      return res.status(401).json({ ok: false, error: 'Clave incorrecta' })
    }
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
    const inicioHoy = hoy.getTime()
    const candidatos = db.prepare(`
      SELECT c.chat_id, c.nombre, c.objetivo, c.etapa
      FROM wa_contacts c
      WHERE c.last_in_at >= ? AND c.compra_at = 0 AND c.reactivacion_at = 0
        AND c.chat_id NOT IN ('51970848043@c.us', '51970848043@lid')
      ORDER BY CASE WHEN c.etiqueta = 'caliente' THEN 0 ELSE 1 END, c.last_in_at ASC LIMIT ${REACTIVAR_MAX}`).all(inicioHoy)

    const elegidos = []
    for (const c of candidatos) {
      // el bot respondió y el cliente NO contestó después
      const ultIn = db.prepare(`SELECT created_at, text FROM wa_logs WHERE chat_id = ? AND direction = 'in' ORDER BY id DESC LIMIT 1`).get(c.chat_id)
      const ultOut = db.prepare(`SELECT created_at FROM wa_logs WHERE chat_id = ? AND direction = 'out' ORDER BY id DESC LIMIT 1`).get(c.chat_id)
      if (!ultIn || !ultOut) continue
      const tIn = new Date(ultIn.created_at.replace(' ', 'T')).getTime()
      const tOut = new Date(ultOut.created_at.replace(' ', 'T')).getTime()
      if (isNaN(tIn) || isNaN(tOut) || tIn >= tOut) continue // aún está conversando
      elegidos.push({ ...c, ultimoMsg: ultIn.text || '' })
    }

    res.json({ ok: true, total: elegidos.length, contactos: elegidos.map((e) => ({ chat_id: e.chat_id, nombre: e.nombre })) })

    ;(async () => {
      for (const c of elegidos) {
        // Modo anti-baneo: solo reactivar dentro del horario de atención
        if (!horarioAtencion()) { console.log('[horario] Reactivación pausada — fuera de atención'); break }
        const prods = buscarProductos(c.ultimoMsg)
        let personal = ''
        if (prods.length > 0) {
          const pat = PRODUCT_PATENTES[prods[0].nombre]
          const vid = videoDe(prods[0].nombre)
          personal = `Veo que hoy me preguntaste por *${prods[0].nombre}*. ${pat ? 'Tiene ' + pat.split('—')[0].trim() + ' — vale totalmente la pena. ' : ''}${vid ? `Te dejo el video oficial para que lo veas: ${vid} ` : ''}`
        } else if (c.objetivo) {
          personal = `Veo que hoy hablamos sobre tu objetivo de *${c.objetivo}*. `
        }
        const saludo = c.nombre ? `Hola ${c.nombre.split(' ')[0]} 💚` : 'Hola 💚'
        // Variantes anti-baneo: mensajes no calcados entre contactos
        const variantes = [
          `${saludo} Soy Valeria de Emprende Salud. ${personal}Te cuento algo importante: esta semana sigue activa la promoción de puntos QV — con tu compra acumulas puntos para llevarte un producto de regalo 🎁\n\n¿Quieres que te pase el link de compra directo o tienes alguna duda? Estoy aquí para lo que necesites 😊`,
          `${saludo} ¿Cómo estás? Soy Valeria de Emprende Salud 😊 ${personal}Recordarte que la promoción de puntos QV sigue vigente esta semana: tus compras suman puntos y puedes ganar un producto de regalo 🎁\n\nSi te quedó alguna duda o quieres el link de compra, aquí estoy 💚`,
        ]
        const msg = variantes[Math.floor(Math.random() * variantes.length)]
        await humanDelay()
        const okSend = await waSend(c.chat_id, msg)
        if (okSend) {
          db.prepare('UPDATE wa_contacts SET reactivacion_at = ? WHERE chat_id = ?').run(Date.now(), c.chat_id)
          db.prepare(`INSERT INTO wa_logs (chat_id, direction, text) VALUES (?, 'out', ?)`).run(c.chat_id, '[reactivación] ' + msg.slice(0, 120))
        }
        await new Promise((r) => setTimeout(r, REACTIVAR_MIN_MS + Math.random() * (REACTIVAR_MAX_MS - REACTIVAR_MIN_MS)))
      }
      console.log(`✅ Reactivación completada: ${elegidos.length} contactos`)
    })()
  })

  sweepSeguimiento()
  setInterval(sweepSeguimiento, 60 * 60 * 1000)

  app.get('/api/waha/ping', (_req, res) => res.json({ ok: true, v: '5.1.9', ts: Date.now(), transport: TRANSPORT, cloud: cloudReady() }))
  console.log(`✅ Valeria v5.1.9 registrada (MODO ANTI-BANEO + API oficial lista | transporte: ${TRANSPORT})`)
}
