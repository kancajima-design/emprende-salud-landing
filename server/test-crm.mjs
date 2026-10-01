// Smoke test v6.0.0 — valeria-crm.js contra base en memoria (node:sqlite)
import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync(':memory:')
db.exec(`
  CREATE TABLE wa_contacts (
    chat_id TEXT PRIMARY KEY, nombre TEXT DEFAULT '', menu_at INTEGER DEFAULT 0,
    handoff_until INTEGER DEFAULT 0, replies_day TEXT DEFAULT '', replies_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    objetivo TEXT DEFAULT '', etiqueta TEXT DEFAULT 'nuevo', etapa TEXT DEFAULT 'lead',
    compra_at INTEGER DEFAULT 0, alerta_2528_at INTEGER DEFAULT 0, alerta_react_at INTEGER DEFAULT 0,
    last_in_at INTEGER DEFAULT 0, alerta_seguimiento_at INTEGER DEFAULT 0,
    reactivacion_at INTEGER DEFAULT 0, last_product TEXT DEFAULT ''
  );
  CREATE TABLE wa_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id TEXT NOT NULL,
    direction TEXT NOT NULL, text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));
`)

const crm = await import('./valeria-crm.js')
crm.initCrm(db)

const H = 60 * 60 * 1000
const insert = db.prepare(`INSERT INTO wa_contacts (chat_id, nombre, objetivo, etiqueta, etapa, last_in_at, compra_at)
  VALUES (?, ?, ?, ?, ?, ?, 0)`)

// Escenario 1: lead tibio hace 50h → debe generar S1_t1
insert.run('51987654321@c.us', 'María Paredes', 'peso', 'tibio', 'lead', Date.now() - 50 * H)
// Escenario 2: lead con objeción de precio hace 4 días → S4_t1
insert.run('51911112222@c.us', 'Carlos Ruiz', 'energia', 'tibio', 'lead', Date.now() - 96 * H)
// Escenario 3: cliente con compra hace 26 días → S7_t1
insert.run('51933334444@c.us', 'Lucía Torres', 'deporte', 'cliente', 'cliente', Date.now() - 2 * H)
db.prepare('UPDATE wa_contacts SET compra_at = ? WHERE chat_id = ?').run(Date.now() - 26 * 24 * H, '51933334444@c.us')

// Inferencia: mensaje con objeción de precio
crm.crmMessageHook({ chatId: '51911112222@c.us', body: 'está muy caro para mi presupuesto', contact: { etiqueta: 'tibio' }, buscarProductos: () => [] })
crm.crmMessageHook({ chatId: '51987654321@c.us', body: 'me interesa el Biopro Sport, cuánto cuesta?', contact: { etiqueta: 'tibio' }, buscarProductos: () => [{ nombre: 'Biopro+ Sport' }] })

// Sweep con send capturado
const enviados = []
const n = crm.crmSweep({ send: async (to, msg) => { enviados.push({ to, msg }) }, notify: '51907793042', TIENDA: 'http://ifuxion.com/emprendesalud' })
console.log('Sugerencias nuevas:', n)
console.log('Mensajes a Kervin:', enviados.length)
if (enviados[0]) console.log('--- digest ---\n' + enviados[0].msg.slice(0, 600))

// Comandos
console.log('\n--- v pipeline ---')
console.log(crm.crmCommand({ chatId: '51907793042@c.us', body: 'v pipeline' })?.[0]?.slice(0, 500))
console.log('\n--- v ficha ---')
console.log(crm.crmCommand({ chatId: '51907793042@c.us', body: 'v ficha maria' })?.[0])
console.log('\n--- v panel (data) ---')
console.log(JSON.stringify(crm.crmPanelData(), null, 1))
console.log('\n--- v etapa + v nota ---')
console.log(crm.crmCommand({ chatId: '51907793042@c.us', body: 'v etapa cierre 51987654321' })?.[0])
console.log(crm.crmCommand({ chatId: '51907793042@c.us', body: 'v nota 51987654321 comparó con Herbalife, le cayó bien lo Clean Label' })?.[0])

// Compra: puntos
crm.crmOnCompra('51987654321@c.us')
console.log('\n--- después de compra ---')
console.log(crm.crmCommand({ chatId: '51907793042@c.us', body: 'v top' })?.[0])

// Opt-out
crm.crmMessageHook({ chatId: '51911112222@c.us', body: 'por favor olvídame, no me escribas más', contact: { etiqueta: 'tibio' }, buscarProductos: () => [] })
const fichaCarlos = db.prepare('SELECT crm FROM wa_contacts WHERE chat_id = ?').get('51911112222@c.us')
console.log('\nOpt-out Carlos:', JSON.parse(fichaCarlos.crm).consentimiento === 0 ? 'OK (consentimiento=0)' : 'FALLÓ')

// daily (sin send)
crm.crmDaily({ send: null, notify: '51907793042' })
console.log('\nSmoke test completado ✅')
