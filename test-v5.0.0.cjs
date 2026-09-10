// Test v5.0.0 — Cerebro comercial + variantes + links + ads + cierre
const assert = require('assert');

const TIENDA = 'http://ifuxion.com/emprendesalud'
const LINK_BIOPRO_POTE = 'https://tiendafuxion.com/storelt/emprendesalud/3171015'

const CATALOGO = [
  { nombre: 'Flora Liv', presentacion: '28 sticks x 5gr', precio: 154.00, qv: 24, keywords: ['flora liv','flora'] },
  { nombre: 'Biopro+ Sport', presentacion: 'Pote x 2lb', precio: 259.50, qv: 36, link: LINK_BIOPRO_POTE, keywords: ['biopro sport pote','biopro+ sport pote','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport','biopro'] },
  { nombre: 'No Stress', presentacion: '28 sticks x 5gr', precio: 142.50, qv: 22, keywords: ['no stress','nostress'] },
  { nombre: 'No Stress', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['no stress 7','nostress 7'] },
  { nombre: 'Pack 5/14 Keto', presentacion: 'Caja Pack', precio: 399.00, qv: 60, keywords: ['pack 5/14 keto','pack keto','keto'] },
  { nombre: 'Prunex1', presentacion: '28 sticks x 5gr', precio: 76.00, qv: 10, keywords: ['prunex1','prunex'] },
  { nombre: 'Prunex1', presentacion: '7 sticks x 5gr', precio: 21.00, qv: 2, keywords: ['prunex1 7','prunex 7','prunex'] },
  { nombre: 'Vita Xtra T+', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['vita xtra','vita xtra t+','vitaxtra'] },
];

const normalize = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim()

function buscarProductos(texto) {
  const n = normalize(texto)
  const encontrados = []
  const usados = new Set()
  const catalogoOrdenado = [...CATALOGO].sort((a, b) => {
    const maxA = Math.max(...a.keywords.map(k => k.length))
    const maxB = Math.max(...b.keywords.map(k => k.length))
    return maxB - maxA
  })
  for (const prod of catalogoOrdenado) {
    for (const kw of prod.keywords) {
      const nk = normalize(kw)
      if (nk.length <= 2 && !n.split(' ').includes(nk)) continue
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

// v5: mensajePrecios agrupado por producto con variantes
function mensajePrecios(productos) {
  if (!productos.length) return null

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
      lineas.push(`• *${p.nombre}* (${p.presentacion}): S/ ${p.precio.toFixed(2)} — ${p.qv} QV${p.link ? `\n  👉 Link directo: ${p.link}` : ''}`)
    } else {
      sumable = false
      const sub = variants.map(p => `  - ${p.presentacion}: S/ ${p.precio.toFixed(2)} — ${p.qv} QV${p.link ? ` 👉 ${p.link}` : ''}`).join('\n')
      lineas.push(`• *${nombre}* (elige tu formato):\n${sub}`)
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
  if (!sumable) promo += `\nℹ️ Los QV varían por formato: elige primero y te confirmo el total exacto.`

  const totalLine = sumable
    ? `*Total: S/ ${productos.reduce((s, p) => s + p.precio, 0).toFixed(2)} — ${totalQv} QV* 💰`
    : `*Puntos estimados: ${totalQv} QV* 💰`

  return `💚 *Precios actualizados* FuXion Perú:\n\n${lineas.join('\n')}\n\n${totalLine}\n\n${promo}\n\nCompra aquí: ${TIENDA}\nVerifica que aparezca *Emprende Salud* como patrocinador ✅\n\n¿Te armo el pedido o tienes alguna duda? 💚`
}

// v5 regex
const INTENT_ADS_RE = /(info|informaci|precio|cu[aá]nto|valor|me interesa|quiero|dato|link|oferta|promo|descuento|anuncio|publicaci|fb|facebook|instagram)/i
const INTENT_FOTO_RE = /(foto|imagen|picture|m[aá]ndame|mandame|muestrame|mu[eé]strame|ver el producto|c[oó]mo se ve)/i
const INTENT_CIERRE_RE = /(quiero comprar|lo quiero|lo compro|lo llevo|me lo llevo|d[oó]nde pago|precio final|precio total|p[aá]same el link|p[aá]samelo|hag[aá]moslo|te lo compro|cerramos|cierro|lo reservo|reservado|cu[aá]l es tu yape|tienes yape)/i

console.log('🧪 TEST v5.0.0 — Cerebro comercial + variantes + links\n')

// TEST 1: Link directo Biopro Sport pote
console.log('TEST 1: link directo Biopro Sport pote')
let r = buscarProductos('precio del Biopro Sport en pote')
assert.ok(r.length >= 1, `Debe encontrar al menos 1 producto, encontró ${r.length}`)
const pote = r.find(p => p.presentacion.includes('Pote'))
assert.ok(pote, 'La presentación pote debe estar entre los resultados')
assert.strictEqual(pote.link, LINK_BIOPRO_POTE, 'El pote debe tener el link directo')
let msg = mensajePrecios(r)
assert.ok(msg.includes(LINK_BIOPRO_POTE), 'El mensaje debe incluir el link directo del pote')
console.log('  ✅ Link directo del pote incluido (', r.length, 'variante(s) mostrada(s))')

// TEST 2: Producto con versiones duales (Prunex1 28 y 7 sticks)
console.log('\nTEST 2: Prunex1 con 2 versiones')
r = buscarProductos('precio del Prunex1')
assert.ok(r.length >= 2, `Debe encontrar 2 versiones, encontró ${r.length}`)
msg = mensajePrecios(r)
assert.ok(msg.includes('elige tu formato'), 'Debe pedir elegir formato')
assert.ok(!msg.includes('Total: S/'), 'No debe sumar total con variantes')
assert.ok(msg.includes('Puntos estimados'), 'Debe mostrar puntos estimados')
console.log('  ✅ Versiones agrupadas, sin total (elige formato)')

// TEST 3: No Stress — genérico muestra la principal; "7 sticks" muestra ambas
console.log('\nTEST 3: No Stress genérico vs. con especificación')
r = buscarProductos('cuánto está el No Stress')
assert.strictEqual(r.length, 1, `Genérico debe traer 1 (la principal), encontró ${r.length}`)
assert.ok(r[0].presentacion.includes('28'), 'La versión genérica debe ser la de 28 sticks')
r = buscarProductos('No Stress de 7 sticks')
assert.strictEqual(r.length, 1, 'Específico de 7 debe traer solo la de 7')
assert.ok(r[0].presentacion.includes('7 sticks'), 'Debe ser la presentación de 7')
console.log('  ✅ Genérico → principal (28); específico "7 sticks" → la de 7')

// TEST 4: Productos distintos sí suman total
console.log('\nTEST 4: Flora Liv + Vita Xtra (productos únicos suman)')
r = buscarProductos('precio de Flora Liv y Vita Xtra')
assert.strictEqual(r.length, 2, `Debe encontrar 2 productos, encontró ${r.length}`)
msg = mensajePrecios(r)
assert.ok(msg.includes('Total: S/'), 'Debe incluir total sumado')
const totalEsperado = 154.00 + 129.50
assert.ok(msg.includes(totalEsperado.toFixed(2)), `Total debe ser ${totalEsperado.toFixed(2)}`)
console.log('  ✅ Total sumado correctamente: S/', totalEsperado.toFixed(2))

// TEST 5: Detección de lead desde anuncio
console.log('\nTEST 5: detección mensajes de anuncio')
assert.ok(INTENT_ADS_RE.test('info'), '"info" debe detectarse')
assert.ok(INTENT_ADS_RE.test('me interesa'), '"me interesa" debe detectarse')
assert.ok(INTENT_ADS_RE.test('precio porfa'), '"precio" debe detectarse')
assert.ok(INTENT_ADS_RE.test('vi el anuncio en fb'), '"anuncio/fb" debe detectarse')
console.log('  ✅ Ads regex detecta mensajes típicos de campaña')

// TEST 6: Cierre inminente
console.log('\nTEST 6: detección cierre inminente')
assert.ok(INTENT_CIERRE_RE.test('quiero comprar'), '"quiero comprar" debe detectarse')
assert.ok(INTENT_CIERRE_RE.test('dónde pago'), '"dónde pago" debe detectarse')
assert.ok(INTENT_CIERRE_RE.test('pásame el link'), '"pásame el link" debe detectarse')
assert.ok(INTENT_CIERRE_RE.test('precio final'), '"precio final" debe detectarse')
assert.ok(!INTENT_CIERRE_RE.test('cuánto cuesta'), '"cuánto cuesta" NO es cierre inminente')
console.log('  ✅ Cierre inminente detectado (y no confunde con pregunta de precio)')

// TEST 7: Pedido de foto
console.log('\nTEST 7: detección pedido de foto')
assert.ok(INTENT_FOTO_RE.test('mándame foto'), '"mándame foto" debe detectarse')
assert.ok(INTENT_FOTO_RE.test('quiero ver el producto'), '"ver el producto" debe detectarse')
assert.ok(!INTENT_FOTO_RE.test('cuánto cuesta'), 'precio NO es foto')
console.log('  ✅ Foto detectada correctamente')

// TEST 8: Biopro genérico agrupa variantes + link pote visible
console.log('\nTEST 8: "biopro" genérico muestra variantes')
r = buscarProductos('precio del biopro')
assert.ok(r.length >= 2, `Debe encontrar variantes Biopro, encontró ${r.length}`)
msg = mensajePrecios(r)
assert.ok(msg.includes('elige tu formato'), 'Debe pedir elegir formato')
console.log('  ✅ Biopro genérico agrupa variantes')

console.log('\n🎉 TODAS LAS PRUEBAS v5.0.0 PASARON')
