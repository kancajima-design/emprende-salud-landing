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
import { sendCapiEvent } from './capi.js'
import { requireAdmin, adminActivo } from './admin-auth.js'

// Carga .env local si existe (desarrollo). En producción Railway
// inyecta las variables directamente.
try {
  process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env'))
} catch {
  // sin .env local, no pasa nada
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// ── Configuración ────────────────────────────────────────────
// La clave de administración viene solo de la variable de entorno ADMIN_KEY
// (ver admin-auth.js). Sin ella, el admin queda desactivado.

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
  CREATE TABLE IF NOT EXISTS visits (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    path        TEXT    NOT NULL DEFAULT '/',
    utm         TEXT    NOT NULL DEFAULT '',
    referrer    TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at);
  CREATE TABLE IF NOT EXISTS articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    titulo      TEXT    NOT NULL,
    resumen     TEXT    NOT NULL,
    contenido   TEXT    NOT NULL,
    categoria   TEXT    NOT NULL DEFAULT 'Nutrición',
    keywords    TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at);
`)
// Fecha de actualización de cada artículo (11-11-2026): la usan la ficha BlogPosting y el sitemap
try { db.exec('ALTER TABLE articles ADD COLUMN updated_at TEXT') } catch { /* ya existe */ }
// Colon y moringa se corrigieron y republicaron el 9-11-2026
db.prepare("UPDATE articles SET updated_at = '2026-11-09 12:30:00' WHERE updated_at IS NULL AND slug IN ('como-limpiar-el-colon-naturalmente', 'moringa-que-es-beneficios-y-como-incluirla')").run()
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
const insertVisit = db.prepare(
  'INSERT INTO visits (path, utm, referrer) VALUES (?, ?, ?)'
)
const countVisits = db.prepare('SELECT COUNT(*) AS total FROM visits')
const visitsByDay = db.prepare(
  `SELECT date(created_at) AS dia, COUNT(*) AS total
   FROM visits GROUP BY dia ORDER BY dia DESC LIMIT 14`
)
const visitsByUtm = db.prepare(
  `SELECT CASE WHEN utm = '' THEN '(directo / sin etiqueta)' ELSE utm END AS origen,
          COUNT(*) AS total
   FROM visits GROUP BY origen ORDER BY total DESC LIMIT 12`
)
const leadsByUtm = db.prepare(
  `SELECT CASE WHEN utm = '' THEN '(directo / sin etiqueta)' ELSE utm END AS origen,
          COUNT(*) AS total
   FROM leads GROUP BY origen ORDER BY total DESC LIMIT 12`
)
const listArticles = db.prepare(
  'SELECT id, slug, titulo, resumen, categoria, keywords, created_at, updated_at FROM articles ORDER BY id DESC LIMIT 30'
)
const getArticleBySlug = db.prepare('SELECT * FROM articles WHERE slug = ?')
const insertArticle = db.prepare(
  `INSERT INTO articles (slug, titulo, resumen, contenido, categoria, keywords)
   VALUES (?, ?, ?, ?, ?, ?)
   ON CONFLICT(slug) DO UPDATE SET
     titulo = excluded.titulo,
     resumen = excluded.resumen,
     contenido = excluded.contenido,
     categoria = excluded.categoria,
     keywords = excluded.keywords,
     updated_at = datetime('now', 'localtime')`
)
const deleteArticle = db.prepare('DELETE FROM articles WHERE id = ?')
const listArticleSlugs = db.prepare('SELECT slug, created_at, updated_at FROM articles ORDER BY id DESC LIMIT 200')

// ── App ──────────────────────────────────────────────────────
const app = express()
// Railway pone un proxy delante: así req.ip es la IP real del visitante (límites por IP)
app.set('trust proxy', 1)
app.disable('x-powered-by')
// Cabeceras de seguridad
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://www.facebook.com")
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store')
  next()
})
// rawBody: el webhook de WhatsApp firma el cuerpo exacto (X-Hub-Signature-256)
app.use(express.json({ limit: '50kb', verify: (req, _res, buf) => { req.rawBody = buf } }))

// Captura errores de body-parser (JSON malformado de WAHA) — responde 200 para evitar reintentos
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[body-parser] JSON malformado ignorado:', req.path, err.message)
    return res.status(200).json({ ok: true, ignored: true })
  }
  next(err)
})

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
  if (correo && !EMAIL_RE.test(correo)) errors.correo = 'Ingresa un correo válido'
  if (!producto) errors.producto = 'Elige un producto de interés'
  if (req.body?.acepto !== true) errors.acepto = 'Marca la casilla para continuar'
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
    visitasTotal: countVisits.get().total,
    visitasPorDia: visitsByDay.all(),
    visitasPorUtm: visitsByUtm.all(),
    leadsPorUtm: leadsByUtm.all(),
  })
})

// ── Conversions API: espejo server-side del pixel (deduplicado por event_id) ──
app.post('/api/capi', (req, res) => {
  const b = req.body || {}
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || ''
  // Responder al navegador de inmediato; el envío a Meta ocurre en segundo plano
  res.json({ ok: true })
  sendCapiEvent({
    event_name: clean(b.event_name, 40),
    event_id: clean(b.event_id, 80),
    user_data: b.user_data && typeof b.user_data === 'object' ? b.user_data : undefined,
    custom_data: b.custom_data && typeof b.custom_data === 'object' ? b.custom_data : undefined,
    fbp: clean(b.fbp, 120),
    fbc: clean(b.fbc, 300),
    event_source_url: clean(b.url, 300),
    client_ip: clientIp,
    user_agent: clean(req.headers['user-agent'], 400),
  }).catch(() => {})
})

// ── Contador de visitas (público, lo llama el frontend) ──────
app.post('/api/track', (req, res) => {
  const p = clean(req.body?.path, 120) || '/'
  if (p.startsWith('/admin') || p.startsWith('/api')) return res.json({ ok: true, skip: true })
  const utm = clean(req.body?.utm, 200)
  const referrer = clean(req.body?.referrer, 300)
  insertVisit.run(p, utm, referrer)
  res.json({ ok: true })
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

// ── Blog SEO (artículos publicados por la tarea programada) ──
// Listar artículos (público)
app.get('/api/articles', (req, res) => {
  res.json({ ok: true, articles: listArticles.all() })
})

// Leer un artículo por slug (público)
app.get('/api/articles/:slug', (req, res) => {
  const art = getArticleBySlug.get(clean(req.params.slug, 120))
  if (!art) return res.status(404).json({ ok: false, error: 'Artículo no encontrado' })
  res.json({ ok: true, article: art })
})

// Publicar/actualizar artículo (requiere clave de admin; la usa la tarea programada)
app.post('/api/articles', requireAdmin, (req, res) => {
  const titulo = clean(req.body?.titulo, 160)
  const resumen = clean(req.body?.resumen, 400)
  const contenido = String(req.body?.contenido ?? '').slice(0, 20000)
  const categoria = clean(req.body?.categoria, 40) || 'Nutrición'
  const keywords = clean(req.body?.keywords, 200)
  let slug = clean(req.body?.slug, 120).toLowerCase()
  slug = slug
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) return res.status(400).json({ ok: false, error: 'Slug inválido' })
  if (titulo.length < 8) return res.status(400).json({ ok: false, error: 'Título muy corto' })
  if (resumen.length < 20) return res.status(400).json({ ok: false, error: 'Resumen muy corto' })
  if (contenido.length < 200) return res.status(400).json({ ok: false, error: 'Contenido muy corto' })

  insertArticle.run(slug, titulo, resumen, contenido, categoria, keywords)
  res.json({ ok: true, slug })
})

// Borrar artículo (admin)
app.delete('/api/articles/:id', requireAdmin, (req, res) => {
  deleteArticle.run(Number(req.params.id))
  res.json({ ok: true })
})

// /vsl desactivada (31-10-2026): su video hablaba de control de peso (políticas de Meta)
app.get('/vsl', (req, res) => res.redirect(301, '/'))

// ── Enlaces cortos a la tienda oficial de FuXion (7-11-2026) ──
// emprendesalud.net/tienda[/producto]?o=canal → tienda de Kervin en site.fuxion.com,
// con UTM para que WooCommerce registre de qué canal vino cada pedido.
const TIENDA_FUXION = 'https://kervin-andershon.site.fuxion.com'
// Landings propias de Emprende Salud (8-11-2026), una por producto: /<producto>-emprende-salud/
const LANDINGS_PROPIAS = [
  'prunex1', 'rexet', 'liquid-fiber', 'flora-liv', 'alpha-balance', 'berry-balance', 'nutraday', 'probix',
  'biopro-tect', 'biopro-sport', 'biopro-fit', 'protein-active', 'protein-active-fit', 'protein-active-sport',
  'protein-xoup', 'vita-xtra-t', 'vitaenergia', 'xpeed', 'on', 'no-stress', 'pre-sport', 'xtra-mile', 'post-sport',
  'cafe-ganomax', 'gano-cappuccino', 'gano-t', 'cafe-fit', 'chocolate-fit', 'thermo-t3', 'nocarb-t', 'vera',
  'golden-flx', 'probal', 'beauty-in', 'youth-elixir', 'passion', 'matcha-pep-t',
]
const LANDINGS_TIENDA = {
  catalogo: '/tienda/',
  off: '/off/',
  ...Object.fromEntries(LANDINGS_PROPIAS.map((s) => [s, `/${s}-emprende-salud/`])),
}
const ORIGENES_TIENDA = {
  instagram: ['instagram', 'bio'],
  facebook: ['facebook', 'perfil'],
  estado: ['whatsapp', 'estado'],
  agente: ['whatsapp', 'agente'],
  anuncio: ['facebook', 'anuncio'],
  tiktok: ['tiktok', 'perfil'],
  qr: ['qr', 'impreso'],
  catalogo: ['whatsapp', 'catalogo'],
  blog: ['emprendesalud.net', 'blog'],
}
app.get(['/tienda', '/tienda/:producto'], (req, res) => {
  const slug = String(req.params.producto || '').toLowerCase()
  const ruta = slug ? LANDINGS_TIENDA[slug] : '/'
  if (!ruta) return res.redirect(302, '/tienda')
  const [source, medium] = ORIGENES_TIENDA[String(req.query.o || '').toLowerCase()] || ['emprendesalud.net', 'enlace']
  const url = new URL(TIENDA_FUXION + ruta)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', medium)
  url.searchParams.set('utm_campaign', slug || 'tienda')
  res.set('Cache-Control', 'no-store')
  res.redirect(302, url.toString())
})

// ── Sitemap dinámico (incluye artículos del blog y páginas de producto) ────────────
const { productosConPagina } = await import('./productos-web.js')
app.get('/sitemap.xml', (req, res) => {
  const base = 'https://www.emprendesalud.net'
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/blog', priority: '0.8' },
    { loc: '/empresa', priority: '0.3' },
    ...productosConPagina.map((p) => ({ loc: `/productos/${p.slug}`, priority: '0.8' })),
    ...listArticleSlugs.all().map((a) => ({
      loc: `/blog/${a.slug}`,
      lastmod: (a.updated_at || a.created_at).slice(0, 10),
      priority: '0.7',
    })),
  ]
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${base}${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<priority>${u.priority}</priority></url>`
      )
      .join('\n') +
    '\n</urlset>\n'
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.send(xml)
})

// ── Frontend ─────────────────────────────────────────────────
// Asistente IA del sitio (Valeria) — chat público con Gemini
const { registerChat } = await import('./chat.js')
registerChat(app, db)

// WhatsApp oficial (API de la nube, coexistencia con la app) — Valeria responde, Kervin puede tomar el chat
const { registerWhatsappCloud } = await import('./whatsapp-cloud.js')
registerWhatsappCloud(app, db)


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
  // index: false → la portada también pasa por el armado de etiquetas SEO
  // Los archivos de /assets llevan una huella en el nombre (index-BiikZhVH.js): si cambian, cambia el nombre.
  // Por eso el navegador puede guardarlos un año sin volver a pedirlos.
  app.use(express.static(dist, {
    index: false,
    setHeaders: (res, archivo) => {
      if (archivo.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    },
  }))
  const { registerSeo } = await import('./seo.js')
  registerSeo(app, { dist, getArticleBySlug, listArticles })
}

app.listen(port, host, () => {
  console.log(`\n  ✅ Emprende Salud · Captura de Leads`)
  console.log(`  ➜ Landing:  http://localhost:${port}/`)
  console.log(`  ➜ Admin:    http://localhost:${port}/admin  (${adminActivo() ? 'activo' : 'desactivado: falta ADMIN_KEY'})`)
  console.log(`  ➜ Modo:     ${isProd ? 'producción (dist/)' : 'desarrollo (Vite HMR)'}\n`)
})
