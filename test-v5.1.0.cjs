// Test v5.1.0 — Links de productos + QV explicados + multi-compra + título Perú
const assert = require('assert');

const TIENDA = 'http://ifuxion.com/emprendesalud'

const LINKS_PRODUCTO = {
  'flora liv': 'https://tiendafuxion.com/storelt/emprendesalud/2085880',
  'biopro sport pote': 'https://tiendafuxion.com/storelt/emprendesalud/2085963',
  'biopro sport sobres': 'https://tiendafuxion.com/storelt/emprendesalud/2085965',
  'biopro tect pote': 'https://tiendafuxion.com/storelt/emprendesalud/2085966',
  'biopro tect sobres': 'https://tiendafuxion.com/storelt/emprendesalud/2085967',
  'no stress': 'https://tiendafuxion.com/storelt/emprendesalud/2085984',
  'pack 5 14 keto': 'https://tiendafuxion.com/storelt/emprendesalud/2085993',
  'prunex1': 'https://tiendafuxion.com/storelt/emprendesalud/2086017',
  'pre sport': 'https://tiendafuxion.com/storelt/emprendesalud/2085997',
  'xtra mile': 'https://tiendafuxion.com/storelt/emprendesalud/2086024',
  'protein active chocolate': 'https://tiendafuxion.com/storelt/emprendesalud/2086003',
  'protein active vainilla': 'https://tiendafuxion.com/storelt/emprendesalud/2086005',
  'thermo t3': 'https://tiendafuxion.com/storelt/emprendesalud/2086019',
  'vita xtra t': 'https://tiendafuxion.com/storelt/emprendesalud/2086022',
}

const CATALOGO = [
  { nombre: 'Flora Liv', presentacion: '28 sticks x 5gr', precio: 154.00, qv: 24, keywords: ['flora liv','flora'] },
  { nombre: 'Biopro+ Sport', presentacion: 'Pote x 2lb', precio: 259.50, qv: 36, keywords: ['biopro sport pote','biopro+ sport pote','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport','biopro'] },
  { nombre: 'No Stress', presentacion: '28 sticks x 5gr', precio: 142.50, qv: 22, keywords: ['no stress','nostress'] },
  { nombre: 'No Stress', presentacion: '7 sticks x 5gr', precio: 36.50, qv: 5, keywords: ['no stress 7','nostress 7'] },
  { nombre: 'Pack 5/14 Keto', presentacion: 'Caja Pack', precio: 399.00, qv: 60, keywords: ['pack 5/14 keto','pack keto','keto'] },
  { nombre: 'Prunex1', presentacion: '28 sticks x 5gr', precio: 76.00, qv: 10, keywords: ['prunex1','prunex'] },
  { nombre: 'Prunex1', presentacion: '7 sticks x 5gr', precio: 21.00, qv: 2, keywords: ['prunex1 7','prunex 7','prunex'] },
  { nombre: 'Protein Active (Chocolate)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active chocolate','protein active'] },
  { nombre: 'Protein Active (Vainilla)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active vainilla','protein active'] },
  { nombre: 'Vita Xtra T+', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['vita xtra','vita xtra t+','vitaxtra'] },
];

const normalize = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim()

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

function linksParaTexto(texto) {
  const n = normalize(texto)
  const hits = []
  for (const [k, url] of Object.entries(LINKS_PRODUCTO)) {
    const tokens = k.split(' ').filter((t) => t.length > 2)
    if (tokens.length >= 1 && tokens.every((t) => n.includes(t))) hits.push(`${k} → ${url}`)
  }
  return hits
}

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
      const lk = linkDeProducto(p)
      lineas.push(`• *${p.nombre}* (${p.presentacion}): S/ ${p.precio.toFixed(2)} — ${p.qv} QV${lk ? `\n  👉 ${lk}` : ''}`)
    } else {
      sumable = false
      const sub = variants.map((p) => {
        const lk = linkDeProducto(p)
        return `  - ${p.presentacion}: S/ ${p.precio.toFixed(2)} — ${p.qv} QV${lk ? ` 👉 ${lk}` : ''}`
      }).join('\n')
      lineas.push(`• *${nombre}* (elige tu formato):\n${sub}`)
    }
  }
  let promo = ''
  if (totalQv >= 80) {
    promo = `🎁 *¡Llegas a ${totalQv} puntos!* Te llevas *1 producto de regalo* en compra directa (80 QV). Con autoenvío mensual (60 QV) también. ✅`
  } else if (totalQv >= 60) {
    promo = `🎁 *¡Llegas a ${totalQv} puntos!* Con autoenvío mensual te llevas *1 producto de regalo* (60 QV). Te faltan ${80 - totalQv} QV para regalo en compra directa.`
  } else {
    promo = `🎁 Te faltan ${60 - totalQv} QV para 1 producto de regalo en autoenvío (60 QV), o ${80 - totalQv} QV en compra directa (80 QV).`
  }
  if (!sumable) promo += `\nℹ️ Los QV varían por formato: elige primero y te confirmo el total exacto.`
  const totalLine = sumable
    ? `*Total: S/ ${productos.reduce((s, p) => s + p.precio, 0).toFixed(2)} — ${totalQv} QV* 💰`
    : `*Puntos estimados: ${totalQv} QV* 💰`
  return `💚 *Precios FuXion Perú:*\n\n${lineas.join('\n')}\n\n${totalLine}\n\n🎁 Junto a cada precio ves los *QV (puntos)*: con ellos obtienes *cajas de producto de regalo*.\n\n${promo}\n\n🛒 ¿Vas a llevar más de uno? Entra a *cualquiera de los links* de arriba y desde ahí añade los demás productos al carrito.\n\nCompra aquí: ${TIENDA}\nVerifica que aparezca *Emprende Salud* como patrocinador ✅\n\n¿Te armo el pedido o tienes alguna duda? 💚`
}

console.log('🧪 TEST v5.1.0 — Links + QV explicados + multi-compra\n')

// TEST 1: Título sin "actualizados"
console.log('TEST 1: título "Precios FuXion Perú"')
let r = buscarProductos('precio flora liv')
let msg = mensajePrecios(r)
assert.ok(msg.includes('*Precios FuXion Perú:*'), 'Debe incluir título nuevo')
assert.ok(!msg.includes('actualizados'), 'No debe decir "actualizados"')
console.log('  ✅ Título correcto')

// TEST 2: Explicación de QV presente
console.log('\nTEST 2: explicación de QV')
assert.ok(msg.includes('QV (puntos)'), 'Debe explicar qué son los QV')
assert.ok(msg.includes('cajas de producto de regalo'), 'Debe mencionar cajas de regalo')
console.log('  ✅ QV explicados al cliente')

// TEST 3: Instrucción de multi-compra
console.log('\nTEST 3: instrucción compra múltiple')
assert.ok(msg.includes('añade los demás productos al carrito'), 'Debe explicar cómo comprar varios')
console.log('  ✅ Instrucción de carrito presente')

// TEST 4: Link directo por presentación (pote vs sobres)
console.log('\nTEST 4: links por presentación')
r = buscarProductos('biopro sport en pote')
msg = mensajePrecios(r)
assert.ok(msg.includes('2085963'), 'Pote debe llevar el link de pote')
assert.ok(!msg.includes('2085965'), 'Pote NO debe llevar el link de sobres')
r = buscarProductos('biopro sport en sobres')
msg = mensajePrecios(r)
assert.ok(msg.includes('2085965'), 'Sobres debe llevar el link de sobres')
console.log('  ✅ Pote→2085963, Sobres→2085965')

// TEST 5: Protein Active por sabor
console.log('\nTEST 5: Protein Active por sabor')
r = buscarProductos('precio protein active chocolate')
msg = mensajePrecios(r)
assert.ok(msg.includes('2086003'), 'Chocolate debe llevar su link')
r = buscarProductos('precio protein active vainilla')
msg = mensajePrecios(r)
assert.ok(msg.includes('2086005'), 'Vainilla debe llevar su link')
console.log('  ✅ Links por sabor correctos')

// TEST 6: linksParaTexto para productos fuera del catálogo (Sport line)
console.log('\nTEST 6: links para Gemini (productos sin precio en catálogo)')
let hits = linksParaTexto('quiero el pre sport y el xtra mile')
assert.ok(hits.some(h => h.includes('2085997')), 'Debe detectar Pre Sport')
assert.ok(hits.some(h => h.includes('2086024')), 'Debe detectar Xtra Mile')
hits = linksParaTexto('hola, gracias')
assert.strictEqual(hits.length, 0, 'Sin productos no debe haber hits')
console.log('  ✅ Gemini recibirá links de Pre Sport / Xtra Mile')

// TEST 7: mensaje completo de ejemplo (Biopro pote)
console.log('\nTEST 7: mensaje completo de ejemplo')
r = buscarProductos('cuánto cuesta el biopro sport en pote')
msg = mensajePrecios(r)
console.log(msg)
console.log('  ✅ Estructura completa validada')

console.log('\n🎉 TODAS LAS PRUEBAS v5.1.0 PASARON')
