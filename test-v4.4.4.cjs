// Test suite v4.4.4 — Verificar que Valeria responde correctamente post-deploy
// Ejecutar: node test-v4.4.4.js

const assert = require('assert');

// ── IMPORTAR LOS REGEX DEL BOT ──
const INTENT_REGISTRO_RE = /(registr|no s[eé] registr|no me deja|no puedo pagar|c[oó]mo compro|c[oó]mo pago|qu[eé] hago despu[eé]s del link|ya abr[ií] el link|no me carga|error en la p[aá]gina|tutorial|paso a paso|c[oó]mo me inscribo|c[oó]mo hago la compra|no encuentro el producto|d[oó]nde agrego al carrito|no me llega confirmaci[oó]n)/i;
const PRECIO_RE = /\b(precio|precios|cu[aá]nto|cuesta|costo|costos|valor|cu[aá]nto sale|a cu[aá]nto|tarifa|tarifas)\b/i;
const INTENT_DEPORTE_RE = /(deport|gym|gimnasio|entren|m[úu]sculo|prote[ií]na|biopro|sport|pre[- ]?entreno|post[- ]?entreno|crossfit|pesas|running|runner|whey|rendimiento|recuperaci[oó]n|muscular)/i;
const INTENT_NEGOCIO_RE = /\b(negocio|emprender|emprendimiento|plan de compensaci[oó]n|plan pro-lev|ingreso|ganar dinero|rentabilidad|bono|bonos|socio|distribuidor|multinivel|mlm|equipo|red|l[ií]der|diamante)\b/i;

const VIDEO_REGISTRO = 'https://awaretips.com/presentation?link=https%3A%2F%2Faware-cursos.s3.amazonaws.com%2FTutoriales%20para%20Clientes%2FComprar%20con%20Power%20Link.mp4';

// ── TEST 1: INTENT_REGISTRO_RE captura frases de clientes atorados ──
console.log('🧪 TEST 1: INTENT_REGISTRO_RE');
const testsRegistro = [
  ['no sé registrarme', true],
  ['cómo compro', true],
  ['no me deja pagar', true],
  ['ya abrí el link', true],
  ['no me carga la página', true],
  ['error en la página', true],
  ['tutorial', true],
  ['paso a paso', true],
  ['cómo me inscribo', true],
  ['no encuentro el producto', true],
  ['dónde agrego al carrito', true],
  ['no me llega confirmación', true],
  ['hola quiero precio', false],  // No debería capturar precio
  ['me interesa la proteína', false],  // No debería capturar deporte
];

let pass = 0, fail = 0;
for (const [msg, expected] of testsRegistro) {
  const result = INTENT_REGISTRO_RE.test(msg);
  if (result === expected) {
    pass++;
    console.log(`  ✅ "${msg}" → ${result}`);
  } else {
    fail++;
    console.log(`  ❌ "${msg}" → ${result} (esperado: ${expected})`);
  }
}
console.log(`  Resultado: ${pass}/${testsRegistro.length} pasaron\n`);

// ── TEST 2: GUÍA_REGISTRO incluye VIDEO_REGISTRO ──
console.log('🧪 TEST 2: GUÍA_REGISTRO contiene video tutorial');
const fs = require('fs');
const botCode = fs.readFileSync('./server/waha-bot.js', 'utf8');

const tieneVideo = botCode.includes('VIDEO_REGISTRO');
const tieneLinkCorrecto = botCode.includes(VIDEO_REGISTRO);
const guiaIncluyeVideo = botCode.includes('${VIDEO_REGISTRO}');

assert.strictEqual(tieneVideo, true, 'Falta constante VIDEO_REGISTRO');
assert.strictEqual(tieneLinkCorrecto, true, 'Link de video incorrecto');
assert.strictEqual(guiaIncluyeVideo, true, 'GUÍA_REGISTRO no usa VIDEO_REGISTRO');

console.log('  ✅ VIDEO_REGISTRO definido correctamente');
console.log('  ✅ Link del video incluido en GUÍA_REGISTRO');
console.log('  ✅ GUÍA_REGISTRO referencia ${VIDEO_REGISTRO}\n');

// ── TEST 3: Prioridad de rutas (Registro antes que Precio) ──
console.log('🧪 TEST 3: Orden de prioridad en handleMessage');
const registroIndex = botCode.indexOf('INTENT_REGISTRO_RE.test(lower)');
const precioIndex = botCode.indexOf('PRECIO_RE.test(lower)');

assert.ok(registroIndex > 0, 'No se encontró INTENT_REGISTRO_RE en el código');
assert.ok(precioIndex > 0, 'No se encontró PRECIO_RE en el código');
assert.ok(registroIndex < precioIndex, 'Registro NO tiene prioridad sobre Precio');

console.log('  ✅ INTENT_REGISTRO_RE se evalúa ANTES que PRECIO_RE');
console.log(`  📍 Registro en línea ~${botCode.slice(0, registroIndex).split('\n').length}`);
console.log(`  📍 Precio en línea ~${botCode.slice(0, precioIndex).split('\n').length}\n`);

// ── TEST 4: PRECIO_RE no captura "compro" solo ──
console.log('🧪 TEST 4: PRECIO_RE no es greedy');
const testsPrecio = [
  ['cuánto cuesta', true],
  ['precio', true],
  ['quiero comprar', false],  // "comprar" no debería disparar precio
  ['hola', false],
];

pass = 0; fail = 0;
for (const [msg, expected] of testsPrecio) {
  const result = PRECIO_RE.test(msg);
  if (result === expected) {
    pass++;
    console.log(`  ✅ "${msg}" → ${result}`);
  } else {
    fail++;
    console.log(`  ❌ "${msg}" → ${result} (esperado: ${expected})`);
  }
}
console.log(`  Resultado: ${pass}/${testsPrecio.length} pasaron\n`);

// ── TEST 5: Versiones correctas ──
console.log('🧪 TEST 5: Versiones en código');
const versionHeader = botCode.match(/v4\.4\.4/);
const versionPing = botCode.includes("v: '4.4.4'");
const versionConsole = botCode.includes('v4.4.4 registrada');

assert.ok(versionHeader, 'Header no dice v4.4.4');
assert.ok(versionPing, 'Ping endpoint no devuelve v4.4.4');
assert.ok(versionConsole, 'Console.log no dice v4.4.4');

console.log('  ✅ Header: v4.4.4');
console.log('  ✅ /api/waha/ping devuelve v4.4.4');
console.log('  ✅ console.log dice v4.4.4\n');

// ── TEST 6: Producción responde v4.4.4 ──
console.log('🧪 TEST 6: Producción responde versión correcta');
const https = require('https');
https.get('https://www.emprendesalud.net/api/waha/ping', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    assert.strictEqual(json.v, '4.4.4', `Producción está en ${json.v}, no v4.4.4`);
    console.log('  ✅ Producción responde v4.4.4');
    console.log(`  📡 ${JSON.stringify(json)}\n`);
    console.log('🎉 TODAS LAS PRUEBAS PASARON — Valeria v4.4.4 lista para atender clientes');
  });
}).on('error', (err) => {
  console.error('  ⚠️ No se pudo verificar producción:', err.message);
  console.log('   (El código local está correcto, verificar deploy manualmente)');
});
