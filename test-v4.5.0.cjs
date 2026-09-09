// Test v4.5.0 — Matching de precios y QV
const assert = require('assert');

// Simular las funciones del bot
const normalize = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim()

const CATALOGO = [
  { nombre: 'Flora Liv', presentacion: '28 sticks x 5gr', precio: 154.00, qv: 24, keywords: ['flora liv','flora'] },
  { nombre: 'Biopro+ Sport', presentacion: 'Pote x 2lb', precio: 259.50, qv: 36, keywords: ['biopro sport pote','biopro+ sport pote','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport','biopro'] },
  { nombre: 'Biopro+ Tect', presentacion: '14 sticks x 25gr', precio: 119.50, qv: 18, keywords: ['biopro tect','biopro+ tect','biopro'] },
  { nombre: 'Biopro+ Sport', presentacion: '14 sticks x 25gr', precio: 132.50, qv: 20, keywords: ['biopro sport','biopro+ sport'] },
  { nombre: 'Biopro+ Tect', presentacion: '14 sticks x 25gr', precio: 119.50, qv: 18, keywords: ['biopro tect','biopro+ tect'] },
  { nombre: 'Thermo T3', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['thermo t3','thermo','t3'] },
  { nombre: 'Pack 5/14 Keto', presentacion: 'Caja Pack', precio: 399.00, qv: 60, keywords: ['pack 5/14 keto','pack keto','keto'] },
  { nombre: 'Vita Xtra T+', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['vita xtra','vita xtra t+','vitaxtra'] },
  { nombre: 'Protein Active (Chocolate)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active chocolate'] },
  { nombre: 'Protein Active (Vainilla)', presentacion: '14 sticks x 25gr', precio: 141.50, qv: 20, keywords: ['protein active vainilla'] },
  { nombre: 'Prunex1', presentacion: '28 sticks x 5gr', precio: 76.00, qv: 10, keywords: ['prunex1','prunex'] },
  { nombre: 'Prunex1', presentacion: '7 sticks x 5gr', precio: 21.00, qv: 2, keywords: ['prunex1 7','prunex 7'] },
  { nombre: 'NoCarb-T', presentacion: '28 sticks x 5gr', precio: 129.50, qv: 20, keywords: ['nocarb','nocarb-t','nocarb t','no carb'] },
];

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
  return encontrados
}

function mensajePrecios(productos) {
  if (!productos.length) return null
  let total = 0, totalQv = 0
  let lineas = productos.map(p => {
    total += p.precio
    totalQv += p.qv
    return `• *${p.nombre}* (${p.presentacion}): S/ ${p.precio.toFixed(2)} — ${p.qv} QV`
  })
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
  return `💚 *Precios actualizados* FuXion Perú:\n\n${lineas.join('\n')}\n\n*Total: S/ ${total.toFixed(2)} — ${totalQv} QV* 💰\n\n${promo}\n\nCompra aquí: http://ifuxion.com/emprendesalud\nVerifica que aparezca *Emprende Salud* como patrocinador ✅\n\n¿Te armo el pedido o tienes alguna duda? 💚`
}

console.log('🧪 TEST v4.5.0 — Matching de precios y QV\n')

// TEST 1: Un solo producto
console.log('TEST 1: "cuánto cuesta la Flora Liv"')
let r = buscarProductos('cuánto cuesta la Flora Liv')
assert.strictEqual(r.length, 1, 'Debe encontrar 1 producto')
assert.strictEqual(r[0].nombre, 'Flora Liv')
console.log('  ✅ Flora Liv encontrada: S/', r[0].precio, '-', r[0].qv, 'QV')

// TEST 2: Múltiples productos
console.log('\nTEST 2: "quiero precio de Biopro Sport, Thermo T3 y Vita Xtra"')
r = buscarProductos('quiero precio de Biopro Sport, Thermo T3 y Vita Xtra')
assert.ok(r.length >= 3, `Debe encontrar al menos 3 productos, encontró ${r.length}`)
console.log('  ✅ Encontrados:', r.length, 'productos')
let msg = mensajePrecios(r)
assert.ok(msg.includes('Total:'), 'Debe incluir total')
console.log('  ✅ Mensaje generado con total')

// TEST 3: Pack Keto (llega a 60 QV)
console.log('\nTEST 3: "cuánto está el Pack Keto"')
r = buscarProductos('cuánto está el Pack Keto')
assert.strictEqual(r[0].nombre, 'Pack 5/14 Keto')
msg = mensajePrecios(r)
assert.ok(msg.includes('60 QV'), 'Debe mostrar 60 QV')
assert.ok(msg.includes('Llegas a 60'), 'Debe mencionar promoción 60 QV')
console.log('  ✅ Pack Keto: S/', r[0].precio, '- 60 QV — Promoción autoenvío detectada')

// TEST 4: Productos que suman más de 80 QV
console.log('\nTEST 4: "precio de Biopro Sport pote, Flora Liv y Vita Xtra"')
r = buscarProductos('precio de Biopro Sport pote, Flora Liv y Vita Xtra')
let totalQv = r.reduce((s, p) => s + p.qv, 0)
assert.ok(totalQv >= 80, `QV total ${totalQv} debe ser >= 80`)
msg = mensajePrecios(r)
assert.ok(msg.includes('80 QV'), 'Debe mostrar promoción 80 QV')
console.log('  ✅ Suma QV:', totalQv, '— Promoción compra directa detectada')

// TEST 5: Ambigüedad "biopro" sin especificar
console.log('\nTEST 5: "precio del biopro" (ambiguo)')
r = buscarProductos('precio del biopro')
assert.ok(r.length >= 2, `Debe mostrar múltiples opciones, encontró ${r.length}`)
console.log('  ✅ Mostrando', r.length, 'variantes de Biopro para que elija')

// TEST 6: No debe encontrar productos genéricos
console.log('\nTEST 6: "hola quiero información" (sin producto)')
r = buscarProductos('hola quiero información')
assert.strictEqual(r.length, 0, 'No debe encontrar productos')
console.log('  ✅ No detectó productos — usará fallback')

console.log('\n🎉 TODAS LAS PRUEBAS PASARON — v4.5.0 lista para deploy')
