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
// v5.1.0 (10-sep): 43 links de productos + explicación QV + multi-compra + países + tono humano.
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
const INTENT_CIERRE_RE = /(quiero comprar|lo quiero|lo compro|lo llevo|me lo llevo|d[oó]nde pago|precio final|precio total|p[aá]same el link|p[aá]samelo|hag[aá]moslo|te lo compro|cerramos|cierro|lo reservo|reservado|cu[aá]l es tu yape|tienes yape)/i

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
  // 'Biopro+ Sport|Pote x 2lb': 'https://...',
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


// v5: envío de imagen por URL pública (WAHA sendImage)
async function waSendImage(chatId, url, caption = '') {
  try {
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

// v5: envío de nota de voz por URL pública (WAHA sendVoice)
async function waSendVoice(chatId, url) {
  try {
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
  try { db.prepare('UPDATE wa_contacts SET last_in_at = ? WHERE chat_id = ?').run(Date.now(), chatId) } catch { /* no crítico */ }

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
        if (await waSendImage(chatId, imgUrl, `${p.nombre} (${p.presentacion}) — S/ ${p.precio.toFixed(2)}. Más info: ${p.link || TIENDA}`)) consume()
      } else {
        if (await waSend(chatId, `📸 Te paso el link directo de *${p.nombre}* (${p.presentacion}) — ahí ves la foto oficial y toda la ficha del producto:
${p.link || TIENDA}

¿Te ayudo con algo más? 💚`)) consume()
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
  const contexto =
    (contact.objetivo ? `[Objetivo conocido del lead: ${contact.objetivo}] ` : '') +
    (contact.etapa && contact.etapa !== 'lead' ? `[Etapa en el embudo: ${contact.etapa}] ` : '') +
    (linksHits.length ? `[Links directos de productos que menciona: ${linksHits.join(' | ')}] ` : '') +
    r`[REGLAS: 1) Si pregunta precio exacto, el sistema ya tiene catálogo; si no detectó productos, redirige a tienda. 2) Si está listo para comprar (dijo quiero comprar/dónde pago/precio final), cierra YA: link ${TIENDA} + formas de pago de la tienda (tarjeta, Yape, Plin u otras) + pregunta de confirmación. 3) Si no sabes algo, opción 2 con Kervin.]`
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

  app.get('/api/waha/ping', (_req, res) => res.json({ ok: true, v: '5.0.0', ts: Date.now() }))
  console.log('✅ Valeria v5.1.0 registrada (cerebro comercial + 43 links de productos + QV explicados + países)')
}
