// ─────────────────────────────────────────────────────────────
// Valeria CRM v6.0.0 — Memoria de prospecto + Secuencias + Tablero/Gamificación
// Implementa plan-maestro-valeria.md (P0, P1, P2) sobre el cerebro existente.
//
// REGLAS ANTI-BANEO (innegociables, heredadas del cerebro v5):
//  - Valeria NUNCA escribe primero a un lead. Las secuencias S1–S8 se
//    entregan a Kervin como SUGERENCIAS listas para copiar y enviar él.
//  - Los comandos "v" solo funcionan desde los números de Kervin.
//  - Opt-out del prospecto ("olvídame") corta toda secuencia para siempre.
//
// Tablas nuevas: wa_eventos (bitácora), crm_sugerencias (secuencias).
// wa_contacts gana columna JSON "crm" con la ficha extendida (P0).
// ─────────────────────────────────────────────────────────────

const DIA_MS = 24 * 60 * 60 * 1000
const HORA_MS = 60 * 60 * 1000

export const KERVIN_IDS = ['51907793042@c.us', '51907793042@lid']
export const esKervin = (chatId) => KERVIN_IDS.includes(String(chatId))

let db = null

// ── INIT ─────────────────────────────────────────────────────
export function initCrm(database) {
  db = database
  db.exec(`
    CREATE TABLE IF NOT EXISTS wa_eventos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      ts      INTEGER NOT NULL,
      tipo    TEXT NOT NULL,
      detalle TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS crm_sugerencias (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      tipo    TEXT NOT NULL,
      texto   TEXT NOT NULL,
      estado  TEXT NOT NULL DEFAULT 'pendiente',
      ts      INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS crm_juego (
      id        TEXT PRIMARY KEY,
      semana    TEXT NOT NULL,
      puntos    INTEGER DEFAULT 0,
      racha     INTEGER DEFAULT 0,
      racha_fecha TEXT DEFAULT '',
      insignias TEXT DEFAULT '[]',
      contadores TEXT DEFAULT '{}',
      flags     TEXT DEFAULT '{}'
    );
  `)
  const cols = db.prepare('PRAGMA table_info(wa_contacts)').all().map((c) => c.name)
  if (!cols.includes('crm')) db.exec("ALTER TABLE wa_contacts ADD COLUMN crm TEXT DEFAULT '{}'")
}

// ── FICHA (columna JSON "crm" en wa_contacts) ────────────────
const getCrm = (chatId) => {
  const row = db.prepare('SELECT crm FROM wa_contacts WHERE chat_id = ?').get(chatId)
  try { return { ...(JSON.parse(row?.crm || '{}')) } } catch { return {} }
}
const saveCrm = (chatId, crm) => {
  db.prepare('UPDATE wa_contacts SET crm = ? WHERE chat_id = ?').run(JSON.stringify(crm), chatId)
}
const evento = (chatId, tipo, detalle = '') => {
  try { db.prepare('INSERT INTO wa_eventos (chat_id, ts, tipo, detalle) VALUES (?, ?, ?, ?)').run(chatId, Date.now(), tipo, String(detalle).slice(0, 300)) } catch { /* no crítico */ }
}

// ── INFERENCIA (P0): cada mensaje entrante enriquece la ficha ──
const OBJ_RE = [
  [/caro|precio|cu[aá]nto cuesta|cu[aá]nto sale|no tengo plata|est[aá] caro|no alcanza/i, 'precio'],
  [/lo pienso|lo pensar[eé]|d[eé]jame pensar|despu[eé]s te aviso|reci[eé]n|m[aá]s adelante/i, 'lo_piensa'],
  [/pir[aá]mide|estafa|multinivel dudoso|no conf[ií]o|mlm/i, 'es_piramide'],
  [/no tengo tiempo|ocupado|trabajo mucho/i, 'sin_tiempo'],
  [/no me convence|dudoso|funcionar[aá]\?|y si no funciona/i, 'sin_confianza'],
]
const OPTOUT_RE = /olv[ií]dame|no me escribas m[aá]s|d[eé]jame en paz|no insistas|dame de baja|ret[ií]rate/i

// Temperatura derivada de la etiqueta comercial existente
const tempDeEtiqueta = (etiqueta) => ({ nuevo: 1, tibio: 2, caliente: 4, cliente: 5 }[etiqueta] || 2)

export function crmMessageHook({ chatId, body, contact, buscarProductos }) {
  if (!db || esKervin(chatId)) return null
  const crm = getCrm(chatId)
  let cambio = false

  // 1) Opt-out: corta todo (consentimiento = 0)
  if (OPTOUT_RE.test(body)) {
    crm.consentimiento = 0
    saveCrm(chatId, crm)
    evento(chatId, 'optout', body.slice(0, 120))
    return { optout: true }
  }

  // 2) Producto de interés (desde el catálogo que ya conoce el cerebro)
  try {
    const prods = buscarProductos(body)
    if (prods.length > 0) {
      const nom = prods[0].nombre
      if (!crm.producto_interes) crm.producto_interes = []
      if (!crm.producto_interes.includes(nom)) { crm.producto_interes.push(nom); cambio = true; evento(chatId, 'producto_interes', nom) }
    }
  } catch { /* catálogo no disponible */ }

  // 3) Objeciones detectadas (persisten, no se pisan)
  for (const [re, obj] of OBJ_RE) {
    if (re.test(body)) {
      if (!crm.objeciones) crm.objeciones = []
      if (!crm.objeciones.includes(obj)) {
        crm.objeciones.push(obj)
        crm['obj_' + obj + '_at'] = Date.now()
        cambio = true
        evento(chatId, 'objecion_detectada', obj)
      }
    }
  }

  // 4) Temperatura + confianza
  crm.temperatura = tempDeEtiqueta(contact?.etiqueta)
  if (!crm.creado_at) { crm.creado_at = Date.now(); evento(chatId, 'ficha_creada') }
  crm.ultimo_contacto = Date.now()

  // 5) Si tenía secuencia sugerida activa y vuelve a escribir → se cierra sola
  if (crm.seq && crm.seq.estado === 'activa') {
    crm.seq.estado = 'cerrada'
    crm.seq.motivo = 'respondio'
    evento(chatId, 'secuencia_cerrada', 'respondio')
    cambio = true
  }
  saveCrm(chatId, crm)
  return cambio ? { actualizado: true } : null
}

// ── COMANDOS "v" (solo Kervin) ───────────────────────────────
const ETAPAS_OK = ['nuevo', 'contactado', 'presentacion', 'cierre', 'cliente', 'recompra', 'perdido', 'reingreso', 'lead', 'autoenvio', 'ef']

const primerNombre = (n) => (n || '').trim().split(' ')[0] || 'crack'
const waLink = (chatId) => {
  const limpio = String(chatId).replace('@c.us', '').replace('@lid', '')
  return limpio.startsWith('ig:') ? '(lead de IG: respóndele por IG DM)' : `https://wa.me/${limpio}`
}

function fichaTexto(c, crm) {
  const objeciones = (crm.objeciones || []).join(', ') || 'ninguna registrada'
  const productos = (crm.producto_interes || []).join(', ') || 'sin detectar'
  const dias = crm.ultimo_contacto ? Math.round((Date.now() - crm.ultimo_contacto) / DIA_MS * 10) / 10 : '—'
  return `📋 *Ficha del prospecto*
👤 ${c.nombre || 'sin nombre'} · ${c.chat_id}
🎯 Objetivo: ${c.objetivo || 'sin definir'} · Etapa: ${c.etapa}${c.etiqueta ? ' (' + c.etiqueta + ')' : ''}
🌡️ Temperatura: ${crm.temperatura ?? tempDeEtiqueta(c.etiqueta)}/5
🛍️ Interés: ${productos}
🧱 Objeciones: ${objeciones}
🕐 Último contacto: hace ${dias} días
📝 Notas: ${crm.notas_clave || '—'}
${crm.seq && crm.seq.estado === 'activa' ? `🔁 Secuencia ${crm.seq.tipo} toque ${crm.seq.toque}/3` : ''}
⚠️ Confianza: campos inferidos por palabras clave — verifica antes de asumir.`
}

export function crmCommand({ chatId, body }) {
  if (!esKervin(chatId)) return null
  const args = body.trim().split(/\s+/)
  const cmd = (args[1] || '').toLowerCase()
  const resto = args.slice(2).join(' ')

  // Localizar contacto por número, nombre (sin importar tildes) o "último"
  const findContact = (q) => {
    if (!q) return null
    const limpio = q.replace(/\D/g, '')
    let row = null
    if (limpio.length >= 8) row = db.prepare('SELECT * FROM wa_contacts WHERE chat_id LIKE ?').get(`%${limpio}%`)
    if (!row) {
      // búsqueda por nombre insensible a tildes ("maria" encuentra "María")
      const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const qn = norm(q)
      row = db.prepare('SELECT * FROM wa_contacts WHERE nombre != ? ORDER BY last_in_at DESC LIMIT 300').all('')
        .find((r) => norm(r.nombre).includes(qn)) || null
    }
    return row
  }

  if (cmd === 'ayuda') {
    return [`🧠 *Comandos Valeria CRM*
• \`v ficha <número o nombre>\` → ver la ficha del prospecto
• \`v pipeline\` → embudo completo por etapas
• \`v etapa <etapa> <número>\` → mover etapa (nuevo/contactado/presentacion/cierre/cliente/recompra/perdido)
• \`v nota <número> <texto>\` → agregar nota a la ficha
• \`v proximo <número> <texto>\` → definir próxima acción
• \`v sugerencias\` → seguimientos pendientes listos para copiar
• \`v panel\` → tablero de la semana
• \`v top\` → puntos, racha e insignias`]
  }

  if (cmd === 'ficha') {
    const c = findContact(resto)
    if (!c) return ['No encontré ese contacto. Usa `v ficha 51987654321` o `v ficha maria`.']
    return [fichaTexto(c, getCrm(c.chat_id))]
  }

  if (cmd === 'pipeline') {
    const rows = db.prepare(`SELECT chat_id, nombre, objetivo, etiqueta, etapa, last_in_at, crm
      FROM wa_contacts WHERE chat_id NOT IN ('${KERVIN_IDS.join("','")}') AND (last_in_at > 0 OR compra_at > 0)
      ORDER BY last_in_at DESC LIMIT 60`).all()
    if (!rows.length) return ['Pipeline vacío todavía.']
    const temp = (r) => { try { return JSON.parse(r.crm || '{}').temperatura ?? tempDeEtiqueta(r.etiqueta) } catch { return tempDeEtiqueta(r.etiqueta) } }
    const linea = (r) => {
      const dias = r.last_in_at ? Math.round((Date.now() - r.last_in_at) / DIA_MS) : '—'
      return `• ${primerNombre(r.nombre)} — ${r.etapa}${r.etiqueta ? '/' + r.etiqueta : ''} · 🌡️${temp(r)} · hace ${dias}d · ${waLink(r.chat_id)}`
    }
    const orden = { caliente: 0, tibio: 1, nuevo: 2, cliente: 3 }
    const sorted = rows.sort((a, b) => (orden[a.etiqueta] ?? 9) - (orden[b.etiqueta] ?? 9))
    const out = ['🗂️ *Pipeline Emprende Salud* (caliente → frío)', ...sorted.slice(0, 25).map(linea)]
    if (sorted.length > 25) out.push(`…y ${sorted.length - 25} más. Pide \`v ficha <nombre>\` por el detalle.`)
    return out
  }

  if (cmd === 'etapa' && resto) {
    const partes = resto.split(/\s+/)
    const etapa = partes[0].toLowerCase()
    const c = findContact(partes.slice(1).join(' '))
    if (!ETAPAS_OK.includes(etapa)) return ['Etapas válidas: ' + ETAPAS_OK.join(', ')]
    if (!c) return ['No encontré el contacto. Usa `v etapa cierre 51987654321`.']
    db.prepare('UPDATE wa_contacts SET etapa = ? WHERE chat_id = ?').run(etapa === 'perdido' ? 'lead' : (etapa === 'nuevo' || etapa === 'contactado' || etapa === 'presentacion' || etapa === 'reingreso' ? 'lead' : etapa), c.chat_id)
    const crm = getCrm(c.chat_id)
    crm.etapa_manual = etapa
    if (etapa === 'perdido') crm.perdido = true
    saveCrm(c.chat_id, crm)
    evento(c.chat_id, 'etapa_manual', etapa)
    if (etapa === 'cliente' || etapa === 'cierre') addPuntos('cierre', c.chat_id)
    return [`✅ ${primerNombre(c.nombre)} movido a *${etapa}*.`]
  }

  if (cmd === 'nota' && resto) {
    const partes = resto.split(/\s+/)
    const c = findContact(partes[0])
    if (!c) return ['Uso: `v nota 51987654321 comparó con Herbalife`.']
    const crm = getCrm(c.chat_id)
    crm.notas_clave = ((crm.notas_clave ? crm.notas_clave + ' | ' : '') + partes.slice(1).join(' ')).slice(0, 400)
    saveCrm(c.chat_id, crm)
    evento(c.chat_id, 'nota_manual', partes.slice(1).join(' ').slice(0, 120))
    return [`📝 Nota guardada en la ficha de ${primerNombre(c.nombre)}.`]
  }

  if (cmd === 'proximo' && resto) {
    const partes = resto.split(/\s+/)
    const c = findContact(partes[0])
    if (!c) return ['Uso: `v proximo 51987654321 enviar testimonio mañana 10am`.']
    const crm = getCrm(c.chat_id)
    crm.proxima_accion = partes.slice(1).join(' ')
    crm.proxima_accion_at = Date.now()
    saveCrm(c.chat_id, crm)
    return [`⏭️ Próxima acción para ${primerNombre(c.nombre)}: ${crm.proxima_accion}`]
  }

  if (cmd === 'sugerencias') {
    const pend = db.prepare("SELECT * FROM crm_sugerencias WHERE estado = 'pendiente' ORDER BY ts DESC LIMIT 10").all()
    if (!pend.length) return ['✅ No hay seguimientos pendientes. La red está al día 💚']
    const out = [`📨 *Seguimientos listos para copiar (${pend.length})* — envía con tu WhatsApp (mantén el toque humano):`]
    for (const s of pend) {
      const c = db.prepare('SELECT nombre FROM wa_contacts WHERE chat_id = ?').get(s.chat_id)
      out.push(`\n▶️ *${s.tipo}* — ${primerNombre(c?.nombre)} ${waLink(s.chat_id)}\n${s.texto}`)
    }
    return out
  }

  if (cmd === 'panel') {
    return [panelTexto()]
  }

  if (cmd === 'top') {
    return [juegoTexto()]
  }

  return ['Comando no reconocido. Escribe `v ayuda` para ver la lista.']
}

// ── SECUENCIAS (P1): sugerencias listas para copiar ──────────
// Guiones S1–S8 del módulo de secuencias, con tokens rellenados desde la ficha.
const T = (nombre, crm, contact) => ({
  nombre: primerNombre(nombre),
  producto: (crm.producto_interes || [])[0] || contact?.last_product || 'tu producto',
  objetivo: contact?.objetivo || 'tu objetivo',
  link: process.env.TIENDA_LINK || 'http://ifuxion.com/emprendesalud',
})

const SCRIPTS = {
  S1_t1: (t) => `Hola ${t.nombre} 😊 Te escribo porque quedamos en que te pasaba info de ${t.producto}. ¿Te ayudo con alguna duda para decidir? Aquí ando.`,
  S1_t2: (t) => `${t.nombre}, no quiero insistirte 😅 Solo decirte que sale menos que un cafecito al día — y esto sí trabaja para tu ${t.objetivo}. Si te animas: ${t.link}`,
  S2_t1: (t) => `Hola ${t.nombre} 👋 Hace días me preguntaste por ${t.producto} y se me quedó darte un dato clave: es Clean Label — sin azúcar añadida ni edulcorantes artificiales, con patentes de absorción. ¿Te cuento cómo tomarlo según tu caso?`,
  S3_t1: (t) => `${t.nombre}, último mensaje, prometido 😊 Guardé tu consulta de ${t.producto} por si retomas el tema. Cuando quieras me escribes y seguimos donde quedamos. ¡Que estés muy bien!`,
  S4_t1: (t) => `${t.nombre}, entiendo lo del presupuesto 💛 Te hago la cuenta real: ${t.producto} al día sale menos que un cafecito con leche — y esto sí aporta a tu ${t.objetivo}. ¿Te parece si lo ves así?`,
  S4_t2: (t) => `Otro ángulo que ayuda: revisa la etiqueta de lo que usas hoy. Si ves azúcar, sucralosa o colorantes, estás pagando por relleno. Nosotros endulzamos con stevia y todo es 100% natural. ¿Te armo la comparativa con lo que tomas actualmente?`,
  S6_t1: (t) => `Hola ${t.nombre} 😊 Veo que te quedaste con la info de ${t.producto}. ¿Te ayudo con algo para decidir — dudas de sabor, forma de toma o cómo llega el pedido?`,
  S7_t1: (t) => `Hola ${t.nombre} 😊 ¿Cómo te fue con ${t.producto}? Por cierto, te debe estar quedando poquito: ¿quieres el link para que no se te corte tu rutina? ${t.link}`,
  S8_t1: (t) => `${t.nombre}, me acordé de ti 😊 ¿Se te acabó el ${t.producto} o pausaste? Si fue lo primero, te paso el link enseguida; si lo segundo, sin pena — cuéntame qué te faltó y lo resolvemos.`,
}

function crearSugerencia(contact, tipo, texto, crm) {
  // una sugerencia pendiente por contacto+tipo
  const dup = db.prepare("SELECT id FROM crm_sugerencias WHERE chat_id = ? AND tipo = ? AND estado = 'pendiente'").get(contact.chat_id, tipo)
  if (dup) return false
  db.prepare('INSERT INTO crm_sugerencias (chat_id, tipo, texto, ts) VALUES (?, ?, ?, ?)').run(contact.chat_id, tipo, texto, Date.now())
  crm.seq = { tipo, toque: 1, estado: 'activa', next_at: Date.now() + 2 * DIA_MS }
  saveCrm(contact.chat_id, crm)
  evento(contact.chat_id, 'secuencia_sugerida', tipo)
  return true
}

export function crmSweep({ send, notify, TIENDA }) {
  if (!db) return
  const now = Date.now()
  const nuevas = []

  // Leads activos sin compra (excluye opt-outs y a Kervin)
  const leads = db.prepare(`SELECT c.* FROM wa_contacts c
    WHERE c.compra_at = 0 AND c.etapa = 'lead' AND c.last_in_at > 0
      AND c.chat_id NOT IN ('${KERVIN_IDS.join("','")}')`).all()
  for (const c of leads) {
    try {
      const crm = getCrm(c.chat_id)
      if (crm.consentimiento === 0) continue
      const horas = (now - Number(c.last_in_at)) / HORA_MS
      const t = T(c.nombre, crm, c)
      const seq = crm.seq && crm.seq.estado === 'activa' ? crm.seq : null

      if (seq) {
        // siguiente toque programado (máx 3 toques)
        if (now >= Number(seq.next_at || 0) && seq.toque < 3) {
          const sigTipo = { S1: 'S1_t2', S2: 'S3_t1', S4: 'S4_t2' }[seq.tipo.split('_')[0]]
          if (sigTipo && SCRIPTS[sigTipo]) {
            if (crearSugerencia(c, sigTipo, SCRIPTS[sigTipo](t), crm)) {
              crm.seq.toque = seq.toque + 1
              crm.seq.next_at = now + 2 * DIA_MS
              saveCrm(c.chat_id, crm)
              nuevas.push({ c, tipo: sigTipo })
            }
          } else {
            crm.seq.estado = 'cerrada'; crm.seq.motivo = 'toques_agotados'
            saveCrm(c.chat_id, crm)
          }
        } else if (now - Number(seq.next_at || 0) > 14 * DIA_MS) {
          crm.seq.estado = 'cerrada'; crm.seq.motivo = 'archivado'
          saveCrm(c.chat_id, crm)
        }
        continue
      }

      if (horas >= 48 && horas <= 96) {
        if (crearSugerencia(c, 'S1_t1', SCRIPTS.S1_t1(t), crm)) nuevas.push({ c, tipo: 'S1_t1' })
      } else if (horas > 7 * 24 && horas <= 10 * 24) {
        if (crearSugerencia(c, 'S2_t1', SCRIPTS.S2_t1(t), crm)) nuevas.push({ c, tipo: 'S2_t1' })
      } else if (horas > 14 * 24 && horas <= 20 * 24) {
        if (crearSugerencia(c, 'S3_t1', SCRIPTS.S3_t1(t), crm)) nuevas.push({ c, tipo: 'S3_t1' })
      } else if ((crm.objeciones || []).includes('precio') && now - Number(crm.obj_precio_at || 0) >= 72 * HORA_MS && horas > 24) {
        if (crearSugerencia(c, 'S4_t1', SCRIPTS.S4_t1(t), crm)) nuevas.push({ c, tipo: 'S4_t1' })
      } else if (c.etiqueta === 'caliente' && horas >= 48 && horas <= 96) {
        if (crearSugerencia(c, 'S6_t1', SCRIPTS.S6_t1(t), crm)) nuevas.push({ c, tipo: 'S6_t1' })
      }
    } catch (e) { console.error('crmSweep lead error', c.chat_id, e?.message || e) }
  }

  // Clientes: recompra (día 25–28) y win-back (35+)
  const clientes = db.prepare(`SELECT c.* FROM wa_contacts c
    WHERE c.compra_at > 0 AND c.etapa != 'ef' AND c.chat_id NOT IN ('${KERVIN_IDS.join("','")}')`).all()
  for (const c of clientes) {
    try {
      const crm = getCrm(c.chat_id)
      if (crm.consentimiento === 0) continue
      const dias = (now - Number(c.compra_at)) / DIA_MS
      const t = T(c.nombre, crm, c)
      if (dias >= 25 && dias <= 32 && !Number(c.alerta_2528_at)) {
        if (crearSugerencia(c, 'S7_t1', SCRIPTS.S7_t1(t), crm)) nuevas.push({ c, tipo: 'S7_t1' })
      } else if (dias > 35 && !Number(c.alerta_react_at)) {
        if (crearSugerencia(c, 'S8_t1', SCRIPTS.S8_t1(t), crm)) nuevas.push({ c, tipo: 'S8_t1' })
      }
    } catch (e) { console.error('crmSweep cliente error', c.chat_id, e?.message || e) }
  }

  // Digest a Kervin con las nuevas sugerencias (listas para copiar)
  if (nuevas.length && send && notify) {
    const lineas = nuevas.map(({ c, tipo }) => {
      const s = db.prepare("SELECT texto FROM crm_sugerencias WHERE chat_id = ? AND tipo = ? AND estado = 'pendiente' ORDER BY id DESC LIMIT 1").get(c.chat_id, tipo)
      return `▶️ *${tipo}* — ${primerNombre(c.nombre)} ${waLink(c.chat_id)}\n${s?.texto || ''}`
    })
    send(`${notify}@c.us`, `📨 *Valeria CRM — seguimientos listos (${nuevas.length})*\nCopia, personaliza si quieres y envía tú (toque humano convierte más):\n\n${lineas.join('\n\n')}\n\nVer todos: escribe \`v sugerencias\``)
      .catch(() => { /* número aún restringido: las sugerencias quedan en crm_sugerencias */ })
  }
  return nuevas.length
}

// ── GAMIFICACIÓN (P2): puntos, racha, insignias ──────────────
const PUNTOS = { cierre: 10, recompra: 8, winback: 6, objecion_educada: 2 }
const SEMANA = () => {
  const d = new Date()
  const onejan = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}
const getJuego = () => {
  const id = 'lider'
  let j = db.prepare('SELECT * FROM crm_juego WHERE id = ?').get(id)
  if (!j) { db.prepare('INSERT INTO crm_juego (id, semana) VALUES (?, ?)').run(id, SEMANA()); j = db.prepare('SELECT * FROM crm_juego WHERE id = ?').get(id) }
  return j
}
const addPuntos = (tipo, chatId) => {
  if (!PUNTOS[tipo]) return
  const j = getJuego()
  const contadores = JSON.parse(j.contadores || '{}')
  contadores[tipo] = (contadores[tipo] || 0) + 1
  // Cierre: no doble puntaje si ya hubo evento de cierre para este chat esta semana
  if (tipo === 'cierre') {
    const semStart = Date.now() - 7 * DIA_MS
    const dup = db.prepare("SELECT id FROM wa_eventos WHERE chat_id = ? AND tipo = 'puntos_cierre' AND ts > ?").get(chatId || '', semStart)
    if (dup) return
    evento(chatId || 'lider', 'puntos_cierre', '10 pts')
  }
  db.prepare('UPDATE crm_juego SET puntos = puntos + ?, contadores = ? WHERE id = ?').run(PUNTOS[tipo], JSON.stringify(contadores), 'lider')
  evento('lider', 'puntos', `+${PUNTOS[tipo]} ${tipo}`)
  checkInsignias(contadores)
}
export { addPuntos }

const INSIGNIAS = [
  ['primer_despegue', '🚀 Primer despegue', (c) => (c.cierre || 0) >= 1],
  ['racha_7', '🔥 Racha 7 días', (c, j) => j.racha >= 7],
  ['racha_15', '🔥 Racha 15 días', (c, j) => j.racha >= 15],
  ['educador', '🎓 Educador Clean Label', (c) => (c.objecion_educada || 0) >= 10],
  ['rescatador', '🏥 Rescatador', (c) => (c.winback || 0) >= 3],
  ['fidelizador', '🔄 Fidelizador', (c) => (c.recompra || 0) >= 5],
  ['relampago', '⚡ Relámpago', (c) => (c.rapido || 0) >= 10],
  ['leyenda', '👑 Leyenda del mes', (c) => (c.cierre || 0) >= 20],
]
function checkInsignias(contadores) {
  const j = getJuego()
  const tiene = JSON.parse(j.insignias || '[]')
  const nuevas = []
  for (const [id, nombre, fn] of INSIGNIAS) {
    if (!tiene.includes(id) && fn(contadores, j)) { tiene.push(id); nuevas.push(nombre) }
  }
  if (nuevas.length) db.prepare('UPDATE crm_juego SET insignias = ? WHERE id = ?').run(JSON.stringify(tiene), 'lider')
  return nuevas
}

// Llamada horaria desde sweepSeguimiento: racha diaria, aviso 8pm, resumen lunes
export function crmDaily({ send, notify }) {
  if (!db) return
  const j = getJuego()
  const flags = JSON.parse(j.flags || '{}')
  const hoy = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const horaLima = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Lima' }).format(now))
  const diaSemana = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Lima' }).format(now)

  // Reinicio semanal de puntos (el lunes)
  if (diaSemana === 'Mon' && j.semana !== SEMANA()) {
    db.prepare('UPDATE crm_juego SET semana = ?, puntos = 0 WHERE id = ?').run(SEMANA(), 'lider')
  }

  // Racha: día válido si hoy hubo salida a 3+ prospectos distintos (actividad de seguimiento real)
  const hoyLocal = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(now)
  const actividad = db.prepare(`SELECT COUNT(DISTINCT chat_id) n FROM wa_logs WHERE direction = 'out' AND chat_id NOT IN ('${KERVIN_IDS.join("','")}') AND created_at >= ?`).get(`${hoyLocal} 00:00:00`)
  const contadores = JSON.parse(j.contadores || '{}')
  if (j.racha_fecha !== hoyLocal) {
    if ((actividad?.n || 0) >= 3) {
      const nuevaRacha = (j.racha || 0) + 1
      db.prepare('UPDATE crm_juego SET racha = ?, racha_fecha = ? WHERE id = ?').run(nuevaRacha, hoyLocal, 'lider')
      if ([7, 15, 30].includes(nuevaRacha)) {
        const n = checkInsignias({ ...contadores, racha: nuevaRacha })
        if (n.length) send?.(`${notify}@c.us`, `🏅 *¡Nueva insignia!* ${n.join(', ')}`)?.catch?.(() => {})
      }
    } else if (horaLima >= 21 && (j.racha || 0) > 0) {
      // se rompió hoy (pasó el horario sin mínimo)
      db.prepare('UPDATE crm_juego SET racha = 0, racha_fecha = ? WHERE id = ?').run(hoyLocal, 'lider')
      send?.(`${notify}@c.us`, `🔥 Racha de ${j.racha} días cerrada hoy. Mañana empiezas una nueva con 3 contactos 💪`)?.catch?.(() => {})
    }
  }

  // Aviso 20h: faltan contactos para la racha
  if (horaLima === 20 && flags.aviso !== hoyLocal && (j.racha || 0) >= 3 && (actividad?.n || 0) < 3) {
    flags.aviso = hoyLocal
    db.prepare('UPDATE crm_juego SET flags = ? WHERE id = ?').run(JSON.stringify(flags), 'lider')
    send?.(`${notify}@c.us`, `🔥 Llevas ${j.racha} días de racha. Te faltan ${3 - (actividad?.n || 0)} contacto(s) hoy para llegar a ${j.racha + 1}. ¿Te sugiero a quién escribir? Pide \`v sugerencias\``)?.catch?.(() => {})
  }

  // Resumen semanal lunes 8am
  if (diaSemana === 'Mon' && horaLima === 8 && flags.resumen !== hoyLocal) {
    flags.resumen = hoyLocal
    db.prepare('UPDATE crm_juego SET flags = ? WHERE id = ?').run(JSON.stringify(flags), 'lider')
    const pend = db.prepare("SELECT COUNT(*) n FROM crm_sugerencias WHERE estado = 'pendiente'").get()
    send?.(`${notify}@c.us`, `📊 *Tu semana — Emprende Salud*\n🏆 Puntos: ${j.puntos} · 🔥 Racha: ${j.racha} días\n🎖️ Insignias: ${JSON.parse(j.insignias || '[]').length}\n📨 Seguimientos pendientes: ${pend?.n || 0} (escribe \`v sugerencias\`)\n${panelTexto(true)}`)?.catch?.(() => {})
  }
}

// ── PANEL (P2) ───────────────────────────────────────────────
export function crmPanelData() {
  const by = (sql) => db.prepare(sql).all()
  const leads = by(`SELECT COUNT(*) n FROM wa_contacts WHERE etapa = 'lead' AND compra_at = 0 AND chat_id NOT IN ('${KERVIN_IDS.join("','")}')`)[0]?.n || 0
  const calientes = by(`SELECT COUNT(*) n FROM wa_contacts WHERE etiqueta = 'caliente' AND compra_at = 0 AND chat_id NOT IN ('${KERVIN_IDS.join("','")}')`)[0]?.n || 0
  const clientes = by(`SELECT COUNT(*) n FROM wa_contacts WHERE compra_at > 0 AND etapa != 'ef'`)[0]?.n || 0
  const nuevos7 = by(`SELECT COUNT(*) n FROM wa_contacts WHERE created_at >= datetime('now', '-7 days') AND chat_id NOT IN ('${KERVIN_IDS.join("','")}')`)[0]?.n || 0
  const sugerencias = db.prepare("SELECT COUNT(*) n FROM crm_sugerencias WHERE estado = 'pendiente'").get()?.n || 0
  const optouts = by(`SELECT COUNT(*) n FROM wa_contacts WHERE crm LIKE '%"consentimiento":0%'`)[0]?.n || 0
  const j = getJuego()
  return { leads_activos: leads, calientes, clientes, nuevos_7dias: nuevos7, sugerencias_pendientes: sugerencias, optouts, puntos: j.puntos, racha: j.racha, insignias: JSON.parse(j.insignias || '[]').length, contadores: JSON.parse(j.contadores || '{}') }
}

function panelTexto(compacto = false) {
  const p = crmPanelData()
  const base = `📊 *Panel Emprende Salud*
👥 Leads activos: ${p.leads_activos} (🔥 ${p.calientes} calientes)
🛒 Clientes: ${p.clientes} · 🆕 Nuevos 7 días: ${p.nuevos_7dias}
📨 Seguimientos pendientes: ${p.sugerencias_pendientes}
🔥 Racha: ${p.racha} días · 🏆 Puntos semana: ${p.puntos}
🚫 Opt-outs: ${p.optouts}`
  if (compacto) return base
  return `${base}
Cierres: ${p.contadores.cierre || 0} · Recompras: ${p.contadores.recompra || 0} · Win-backs: ${p.contadores.winback || 0}
Detalle por prospecto: \`v pipeline\` · Ficha: \`v ficha <nombre>\``
}

function juegoTexto() {
  const j = getJuego()
  const ins = JSON.parse(j.insignias || '[]').map((id) => INSIGNIAS.find((i) => i[0] === id)?.[1]).filter(Boolean)
  const cont = JSON.parse(j.contadores || '{}')
  return `🏆 *Tu juego — semana ${j.semana}*
⭐ Puntos: ${j.puntos} · 🔥 Racha: ${j.racha} días
🎖️ Insignias (${ins.length}): ${ins.join(', ') || 'aún ninguna — ¡la primera venta te da la 🚀!'}
📈 Cierres: ${cont.cierre || 0} · Recompras: ${cont.recompra || 0} · Win-backs: ${cont.winback || 0} · Objeciones educadas: ${cont.objecion_educada || 0}`
}

// ── COMPRA / RECOMPRA (puntos + eventos) ─────────────────────
export function crmOnCompra(chatId, esRecompra = false) {
  if (!db || esKervin(chatId)) return
  const c = db.prepare('SELECT compra_at, etapa FROM wa_contacts WHERE chat_id = ?').get(chatId)
  const esNueva = !c || c.etapa !== 'cliente'
  evento(chatId, esRecompra || !esNueva ? 'recompra' : 'cierre')
  addPuntos(esRecompra || !esNueva ? 'recompra' : 'cierre', chatId)
  // Win-back: recompra tras 35+ días
  if (c?.compra_at && (Date.now() - Number(c.compra_at)) / DIA_MS > 35) {
    addPuntos('winback', chatId)
    evento(chatId, 'winback')
  }
  const crm = getCrm(chatId)
  if (crm.seq && crm.seq.estado === 'activa') { crm.seq.estado = 'cerrada'; crm.seq.motivo = 'compro'; saveCrm(chatId, crm) }
}
