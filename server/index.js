// ─────────────────────────────────────────────────────────────
// Emprende Salud · Landing de captura de leads
// Servidor Express + SQLite (node:sqlite, sin dependencias nativas)
// Dev: sirve Vite en modo middleware (HMR) + API en un solo puerto
// Prod: `npm run build` y luego `npm start` (sirve dist/ + API)
// ─────────────────────────────────────────────────────────────
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// ── Configuración ────────────────────────────────────────────
// ⚠️ Cambia esta clave antes de publicar. También puedes usar
//    la variable de entorno ADMIN_KEY.
const ADMIN_KEY = process.env.ADMIN_KEY || 'emprende2026'

const isProd = process.argv.includes('--prod') || process.env.NODE_ENV === 'production'
const argValue = (flag) => {
  const i = process.argv.indexOf(flag)
  return i > -1 ? process.argv[i + 1] : undefined
}
const port = Number(argValue('--port') || process.env.PORT || 3000)
const host = argValue('--host') || process.env.HOST || '0.0.0.0'

// ── Base de datos SQLite ─────────────────────────────────────
const dataDir = path.join(__dirname, 'data')
fs.mkdirSync(dataDir, { recursive: true })
const db = new DatabaseSync(path.join(dataDir, 'leads.db'))
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL,
    whatsapp    TEXT    NOT NULL,
    correo      TEXT    NOT NULL,
    producto    TEXT    NOT NULL,
    origen      TEXT    DEFAULT 'landing',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
  CREATE TABLE IF NOT EXISTS news (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo      TEXT    NOT NULL,
    resumen     TEXT    NOT NULL,
    categoria   TEXT    NOT NULL DEFAULT 'Nutrición',
    fuente      TEXT,
    url         TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at);
`)
// Migración suave: columna utm (para saber qué anuncio trajo cada lead)
try {
  db.exec("ALTER TABLE leads ADD COLUMN utm TEXT NOT NULL DEFAULT ''")
} catch {
  // la columna ya existe
}

const insertLead = db.prepare(
  'INSERT INTO leads (nombre, whatsapp, correo, producto, origen, utm) VALUES (?, ?, ?, ?, ?, ?)'
)
const listLeads = db.prepare('SELECT * FROM leads ORDER BY id DESC')
const deleteLead = db.prepare('DELETE FROM leads WHERE id = ?')
const countLeads = db.prepare('SELECT COUNT(*) AS total FROM leads')
const leadsByProduct = db.prepare(
  'SELECT producto, COUNT(*) AS total FROM leads GROUP BY producto ORDER BY total DESC'
)
const leadsByDay = db.prepare(
  `SELECT date(created_at) AS dia, COUNT(*) AS total
   FROM leads GROUP BY dia ORDER BY dia DESC LIMIT 14`
)
const listNews = db.prepare('SELECT * FROM news ORDER BY id DESC LIMIT 12')
const insertNews = db.prepare(
  'INSERT INTO news (titulo, resumen, categoria, fuente, url) VALUES (?, ?, ?, ?, ?)'
)
const findNewsByTitle = db.prepare('SELECT id FROM news WHERE titulo = ?')
const deleteNews = db.prepare('DELETE FROM news WHERE id = ?')

// ── App ──────────────────────────────────────────────────────
const app = express()
app.use(express.json({ limit: '50kb' }))

// Rate limit simple en memoria para el formulario (10 envíos / 10 min / IP)
const hits = new Map()
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const entry = hits.get(ip) || { count: 0, reset: now + windowMs }
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs }
  entry.count += 1
  hits.set(ip, entry)
  if (entry.count > 10) {
    return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera unos minutos.' })
  }
  next()
}

function requireAdmin(req, res, next) {
  const key = req.query.key || req.headers['x-admin-key']
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Clave de administrador incorrecta' })
  }
  next()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const clean = (v, max = 120) => String(v ?? '').trim().slice(0, max)

// Crear lead (público)
app.post('/api/leads', rateLimit, (req, res) => {
  const nombre = clean(req.body?.nombre, 80)
  const whatsapp = clean(req.body?.whatsapp, 20).replace(/[^\d+]/g, '')
  const correo = clean(req.body?.correo, 120).toLowerCase()
  const producto = clean(req.body?.producto, 80)
  const origen = clean(req.body?.origen, 40) || 'landing'
  const utm = clean(req.body?.utm, 200)

  const errors = {}
  if (nombre.length < 2) errors.nombre = 'Ingresa tu nombre'
  if (whatsapp.replace(/\D/g, '').length < 7) errors.whatsapp = 'Ingresa un WhatsApp válido'
  if (!EMAIL_RE.test(correo)) errors.correo = 'Ingresa un correo válido'
  if (!producto) errors.producto = 'Elige un producto de interés'
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

  const info = insertLead.run(nombre, whatsapp, correo, producto, origen, utm)
  res.json({ ok: true, id: Number(info.lastInsertRowid), giftUrl: '/regalo.pdf' })
})

// Listar leads (admin)
app.get('/api/leads', requireAdmin, (req, res) => {
  res.json({ ok: true, leads: listLeads.all(), total: countLeads.get().total })
})

// Estadísticas (admin)
app.get('/api/stats', requireAdmin, (req, res) => {
  res.json({
    ok: true,
    total: countLeads.get().total,
    porProducto: leadsByProduct.all(),
    porDia: leadsByDay.all(),
  })
})

// Exportar CSV compatible con Excel (admin)
app.get('/api/leads/export', requireAdmin, (req, res) => {
  const rows = listLeads.all()
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = 'ID,Nombre,WhatsApp,Correo,Producto de interés,Origen,UTM,Fecha'
  const body = rows
    .map((r) => [r.id, r.nombre, r.whatsapp, r.correo, r.producto, r.origen, r.utm ?? '', r.created_at].map(esc).join(','))
    .join('\r\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="leads-emprende-salud-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send('﻿' + header + '\r\n' + body)
})

// Borrar lead (admin)
app.delete('/api/leads/:id', requireAdmin, (req, res) => {
  deleteLead.run(Number(req.params.id))
  res.json({ ok: true })
})

// ── Noticias (investigadas por la tarea programada de Kimi) ──
// Listar noticias (público)
app.get('/api/news', (req, res) => {
  res.json({ ok: true, news: listNews.all() })
})

// Publicar noticia (requiere clave de admin; la usa la tarea programada)
app.post('/api/news', requireAdmin, (req, res) => {
  const titulo = clean(req.body?.titulo, 160)
  const resumen = clean(req.body?.resumen, 600)
  const categoria = clean(req.body?.categoria, 40) || 'Nutrición'
  const fuente = clean(req.body?.fuente, 120)
  const url = clean(req.body?.url, 400)

  if (titulo.length < 8) return res.status(400).json({ ok: false, error: 'Título muy corto' })
  if (resumen.length < 20) return res.status(400).json({ ok: false, error: 'Resumen muy corto' })
  if (url && !/^https?:\/\//i.test(url)) return res.status(400).json({ ok: false, error: 'URL inválida' })
  if (findNewsByTitle.get(titulo)) return res.json({ ok: true, duplicado: true })

  const info = insertNews.run(titulo, resumen, categoria, fuente || null, url || null)
  res.json({ ok: true, id: Number(info.lastInsertRowid) })
})

// Borrar noticia (admin)
app.delete('/api/news/:id', requireAdmin, (req, res) => {
  deleteNews.run(Number(req.params.id))
  res.json({ ok: true })
})

// ── Frontend ─────────────────────────────────────────────────
if (!isProd) {
  const { createServer } = await import('vite')
  const vite = await createServer({
    root,
    appType: 'spa',
    server: { middlewareMode: true },
  })
  app.use(vite.middlewares)
} else {
  const dist = path.join(root, 'dist')
  app.use(express.static(dist))
  app.use((req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(port, host, () => {
  console.log(`\n  ✅ Emprende Salud · Captura de Leads`)
  console.log(`  ➜ Landing:  http://localhost:${port}/`)
  console.log(`  ➜ Admin:    http://localhost:${port}/admin  (clave: ${ADMIN_KEY})`)
  console.log(`  ➜ Modo:     ${isProd ? 'producción (dist/)' : 'desarrollo (Vite HMR)'}\n`)
})
