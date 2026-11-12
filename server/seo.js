// ─────────────────────────────────────────────────────────────
// SEO del lado del servidor (solo producción)
// Cada página sale con su propio título, descripción y canónica,
// los artículos del blog salen ya escritos en el HTML (Google y los
// buscadores con IA los leen sin ejecutar JavaScript) y las rutas
// que no existen responden 404 en vez de la portada.
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { productosConPagina, productoPorSlug, preguntasDe, preciosNum } from './productos-web.js'

const BASE = 'https://www.emprendesalud.net'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// JSON dentro de <script>: evita que un "</script>" del contenido cierre la etiqueta
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

// Markdown simple de los artículos (## títulos, - listas, **negrita**) → HTML
function markdownAHtml(md) {
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  const out = []
  let lista = null
  let parrafo = []
  const cerrarParrafo = () => {
    if (parrafo.length) out.push(`<p>${inline(parrafo.join(' '))}</p>`)
    parrafo = []
  }
  const cerrarLista = () => {
    if (lista) out.push(`<ul>${lista.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`)
    lista = null
  }
  for (const linea of String(md ?? '').split(/\r?\n/)) {
    const l = linea.trim()
    const h = l.match(/^(#{2,4})\s+(.*)$/)
    if (!l) { cerrarParrafo(); cerrarLista(); continue }
    if (h) { cerrarParrafo(); cerrarLista(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue }
    const li = l.match(/^[-*]\s+(.*)$/) || l.match(/^\d+[.)]\s+(.*)$/)
    if (li) { cerrarParrafo(); (lista ||= []).push(li[1]); continue }
    cerrarLista()
    parrafo.push(l)
  }
  cerrarParrafo(); cerrarLista()
  return out.join('\n')
}

// "2026-09-03 10:20:00" (hora de Lima) → ISO con zona horaria
// Autor de los artículos: Kervin los revisa contra el empaque, el catálogo y OffiX antes de publicarlos
const AUTOR = {
  '@type': 'Person',
  name: 'Kervin Ancajima',
  jobTitle: 'Distribuidor independiente FuXion',
  url: BASE + '/empresa',
}

// Productos que nombra el artículo (según la lista de productos-blog.json) y otros artículos del blog
export function relacionados(art, productosBlog, todos) {
  const texto = ` ${String(art.contenido || '').toUpperCase()} `
  const productos = productosBlog.filter((p) => {
    const n = p.nombre.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^A-ZÁÉÍÓÚÑ0-9])${n}($|[^A-ZÁÉÍÓÚÑ0-9])`).test(texto)
  }).slice(0, 3)
  const otros = todos.filter((o) => o.slug !== art.slug).slice(0, 3)
  return { productos, otros }
}

const fechaIso = (s) => (s ? `${String(s).replace(' ', 'T')}-05:00` : undefined)

export function registerSeo(app, { dist, getArticleBySlug, listArticles }) {
  const plantilla = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

  let preguntas = []
  let productosBlog = []
  try {
    productosBlog = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'productos-blog.json'), 'utf8'))
  } catch {
    // sin la lista, los artículos salen sin enlaces a productos
  }
  try {
    preguntas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'preguntas.json'), 'utf8'))
  } catch {
    // sin preguntas no se agrega el bloque FAQPage
  }

  // Cambia el contenido de una etiqueta <meta> (acepta saltos de línea dentro de la etiqueta)
  const ponerMeta = (html, atributo, nombre, valor) =>
    html.replace(
      new RegExp(`(<meta\\s+${atributo}="${nombre}"\\s+content=")[^"]*(")`),
      (_, a, b) => a + esc(valor) + b,
    )

  function armar({ titulo, descripcion, ruta, tipo = 'website', datos = [], cuerpo = '', noindex = false }) {
    const url = BASE + ruta
    let html = plantilla
    if (titulo) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(titulo)}</title>`)
      html = ponerMeta(html, 'property', 'og:title', titulo)
    }
    if (descripcion) {
      html = ponerMeta(html, 'name', 'description', descripcion)
      html = ponerMeta(html, 'property', 'og:description', descripcion)
    }
    html = ponerMeta(html, 'property', 'og:url', url)
    html = ponerMeta(html, 'property', 'og:type', tipo)
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, (_, a, b) => a + url + b)
    let extra = datos.map(jsonLd).join('\n')
    if (noindex) {
      extra += '\n<meta name="robots" content="noindex" />'
      html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/, '')
    }
    if (extra) html = html.replace('</head>', () => `${extra}\n</head>`)
    // La imagen del video de portada solo se precarga en la portada
    if (ruta !== '/') html = html.replace(/\s*<link\s+rel="preload"\s+as="image"\s+href="\/videos\/hero-malecon\.jpg"[^>]*>/, '')
    if (cuerpo) html = html.replace('<div id="root"></div>', () => `<div id="root">${cuerpo}</div>`)
    return html
  }

  const enviar = (res, html, status = 200) => {
    res.status(status).set('Content-Type', 'text/html; charset=utf-8').set('Cache-Control', 'public, max-age=0').send(html)
  }

  // ── Portada ──
  const faq = preguntas.length
    ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: preguntas.map((p) => ({
          '@type': 'Question',
          name: p.q,
          acceptedAnswer: { '@type': 'Answer', text: p.a },
        })),
      }]
    : []
  const portada = armar({ ruta: '/', datos: faq })

  // Quita la barra final (/blog/ → /blog) para no duplicar páginas
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.length > 1 && req.path.endsWith('/')) {
      const q = req.originalUrl.slice(req.path.length)
      return res.redirect(301, req.path.replace(/\/+$/, '') + q)
    }
    next()
  })

  app.get('/', (req, res) => enviar(res, portada))

  // ── Blog ──
  app.get('/blog', (req, res) => {
    const arts = listArticles.all()
    const cuerpo =
      `<main><h1>Blog de Emprende Salud: nutrición funcional y bienestar</h1><ul>` +
      arts.map((a) => `<li><a href="/blog/${esc(a.slug)}">${esc(a.titulo)}</a><p>${esc(a.resumen)}</p></li>`).join('') +
      `</ul></main>`
    enviar(res, armar({
      titulo: 'Blog · Emprende Salud — Nutrición funcional y bienestar',
      descripcion: 'Artículos de Emprende Salud sobre nutrición funcional, hábitos y bienestar, con productos FuXion en el Perú.',
      ruta: '/blog',
      cuerpo,
    }))
  })

  app.get('/blog/:slug', (req, res, next) => {
    const art = getArticleBySlug.get(String(req.params.slug).slice(0, 120))
    if (!art) return next() // cae en el 404
    const ruta = `/blog/${art.slug}`
    const datos = [{
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: art.titulo,
          description: art.resumen,
          datePublished: fechaIso(art.created_at),
          dateModified: fechaIso(art.updated_at || art.created_at),
          image: { '@type': 'ImageObject', url: BASE + '/og-image.png', width: 1200, height: 630 },
          inLanguage: 'es-PE',
          mainEntityOfPage: BASE + ruta,
          keywords: art.keywords || undefined,
          author: AUTOR,
          publisher: { '@type': 'Organization', name: 'Emprende Salud', url: BASE + '/' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE + '/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: BASE + '/blog' },
            { '@type': 'ListItem', position: 3, name: art.titulo, item: BASE + ruta },
          ],
        },
      ],
    }]
    const { productos, otros } = relacionados(art, productosBlog, listArticles.all())
    const bloque = productos.length || otros.length
      ? `<aside><h2>Te puede interesar</h2><ul>` +
        otros.map((o) => `<li><a href="/blog/${esc(o.slug)}">${esc(o.titulo)}</a></li>`).join('') +
        productos.map((p) => `<li><a href="/productos/${esc(p.slug)}">Ver ${esc(p.nombre)}: ingredientes y precio</a></li>`).join('') +
        `<li><a href="/#catalogo">Ver todos los productos</a></li></ul></aside>`
      : ''
    const cuerpo =
      `<article><p><a href="/blog">Blog</a></p><h1>${esc(art.titulo)}</h1>` +
      `<p>Por Kervin Ancajima, distribuidor independiente FuXion en Piura</p>` +
      `<p>${esc(art.resumen)}</p>${markdownAHtml(art.contenido)}${bloque}</article>`
    enviar(res, armar({
      titulo: `${art.titulo} · Emprende Salud`,
      descripcion: art.resumen,
      ruta,
      tipo: 'article',
      datos,
      cuerpo,
    }))
  })

  // ── Páginas de producto ──
  app.get('/productos/:slug', (req, res, next) => {
    const p = productoPorSlug(String(req.params.slug).slice(0, 80).toLowerCase())
    if (!p) return next() // cae en el 404
    const ruta = `/productos/${p.slug}`
    const img = p.img ? `${BASE}/productos/${p.img.replace(/\.png$/, '.webp')}` : `${BASE}/og-image.png`
    const nums = preciosNum(p)
    const preguntas = preguntasDe(p)
    const descripcion = `${p.nombre} de FuXion en el Perú: ${p.descripcion || p.tagline || ''} Ingredientes, cómo se toma, presentaciones y precio en soles.`.replace(/\s+/g, ' ').slice(0, 300)
    const datos = [{
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: `${p.nombre} FuXion`,
          description: p.descripcion || p.tagline,
          image: img,
          brand: { '@type': 'Brand', name: 'FuXion' },
          category: p.linea || 'Sistema Base',
          url: BASE + ruta,
          offers: nums.length
            ? {
                '@type': 'AggregateOffer',
                priceCurrency: 'PEN',
                lowPrice: Math.min(...nums).toFixed(2),
                highPrice: Math.max(...nums).toFixed(2),
                offerCount: nums.length,
                availability: 'https://schema.org/InStock',
                url: BASE + ruta,
              }
            : undefined,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE + '/' },
            { '@type': 'ListItem', position: 2, name: 'Catálogo', item: BASE + '/#catalogo' },
            { '@type': 'ListItem', position: 3, name: p.nombre, item: BASE + ruta },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: preguntas.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    }]
    const otros = productosConPagina.filter((o) => o.slug !== p.slug && (o.linea || 'Sistema Base') === (p.linea || 'Sistema Base')).slice(0, 4)
    const enlaces = p.variantes && p.variantes.length > 1 ? p.variantes : [{ nombre: `Comprar ${p.nombre} en la tienda oficial`, url: p.url }]
    const cuerpo =
      `<main><p><a href="/">Inicio</a> / <a href="/#catalogo">Catálogo</a></p>` +
      `<h1>${esc(p.nombre)} de FuXion</h1>` +
      (p.tagline ? `<p>${esc(p.tagline)}</p>` : '') +
      (p.descripcion ? `<p>${esc(p.descripcion)}</p>` : '') +
      (p.beneficios?.length ? `<h2>Para qué es</h2><ul>${p.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '') +
      `<h2>Cómo se toma</h2><p>${esc(p.uso)}</p>` +
      `<h2>Qué lleva</h2><p>${esc(p.ingredientes)}</p>` +
      (p.dato ? `<p>${esc(p.dato)}</p>` : '') +
      (p.precios?.length
        ? `<h2>Presentaciones y precios</h2><ul>${p.precios.map((x) => `<li>${esc(x.presentacion)}: ${esc(x.precio)}</li>`).join('')}</ul>` +
          `<p>Precios de referencia en soles, válidos para el Perú.</p>`
        : '') +
      `<p>${enlaces.map((v) => `<a href="${esc(v.url)}">${esc(v.nombre)}</a>`).join(' · ')} · <a href="https://wa.me/51907793042">Preguntar por WhatsApp</a></p>` +
      `<h2>Preguntas frecuentes sobre ${esc(p.nombre)}</h2>` +
      preguntas.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('') +
      (otros.length ? `<h2>Más de ${esc(p.linea || 'Sistema Base')}</h2><ul>${otros.map((o) => `<li><a href="/productos/${o.slug}">${esc(o.nombre)}</a></li>`).join('')}</ul>` : '') +
      `<p>Este producto no es un medicamento. Complementa un estilo de vida saludable.</p></main>`
    enviar(res, armar({
      titulo: `${p.nombre} FuXion: precio en Perú, ingredientes y cómo se toma · Emprende Salud`,
      descripcion,
      ruta,
      tipo: 'product',
      datos,
      cuerpo,
    }))
  })

  app.get('/empresa', (req, res) =>
    enviar(res, armar({
      titulo: 'Información del negocio · Emprende Salud',
      descripcion: 'Datos de Emprende Salud, distribuidor independiente de FuXion en Piura: RUC, contacto, privacidad, devoluciones y atención.',
      ruta: '/empresa',
    })),
  )

  app.get('/admin', (req, res) =>
    enviar(res, armar({ titulo: 'Panel · Emprende Salud', ruta: '/admin', noindex: true })),
  )

  // ── Todo lo demás: 404 real ──
  const noEncontrada = armar({ titulo: 'Página no encontrada · Emprende Salud', ruta: '/404', noindex: true })
  app.use((req, res) => {
    // Archivos o API inexistentes: 404 corto, sin HTML de la web
    if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'No encontrado' })
    if (path.extname(req.path)) return res.status(404).type('text/plain').send('No encontrado')
    enviar(res, noEncontrada, 404)
  })
}
