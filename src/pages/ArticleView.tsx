import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Sparkles, UserRound } from 'lucide-react'
import productosBlog from '@/data/productos-blog.json'

type Articulo = {
  id: number
  slug: string
  titulo: string
  resumen: string
  contenido: string
  categoria: string
  keywords: string
  created_at: string
  updated_at?: string | null
}

type Resumen = { slug: string; titulo: string }

// Productos que nombra el artículo (misma regla que server/seo.js)
function productosDelArticulo(contenido: string) {
  const texto = ` ${contenido.toUpperCase()} `
  return productosBlog
    .filter((p) => {
      const n = p.nombre.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`(^|[^A-ZÁÉÍÓÚÑ0-9])${n}($|[^A-ZÁÉÍÓÚÑ0-9])`).test(texto)
    })
    .slice(0, 3)
}

// ── Mini-renderizador de Markdown (suficiente para los artículos) ──
// Soporta: ## / ### títulos, **negrita**, listas con -, y párrafos.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="font-bold text-[#0B2033]">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

function Markdown({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.split('\n')
    const out: React.ReactNode[] = []
    let list: string[] = []
    let key = 0

    const flushList = () => {
      if (!list.length) return
      out.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-6 text-[#3A4A57]">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      list = []
    }

    for (const raw of lines) {
      const line = raw.trimEnd()
      if (line.startsWith('### ')) {
        flushList()
        out.push(
          <h3 key={key++} className="mt-8 text-lg font-extrabold text-[#00498E]">
            {renderInline(line.slice(4))}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        flushList()
        out.push(
          <h2 key={key++} className="mt-10 text-xl font-extrabold text-[#00498E]">
            {renderInline(line.slice(3))}
          </h2>
        )
      } else if (line.startsWith('- ')) {
        list.push(line.slice(2))
      } else if (line.trim() === '') {
        flushList()
      } else {
        flushList()
        out.push(
          <p key={key++} className="my-4 leading-relaxed text-[#3A4A57]">
            {renderInline(line)}
          </p>
        )
      }
    }
    flushList()
    return out
  }, [content])

  return <div>{blocks}</div>
}

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Articulo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [otros, setOtros] = useState<Resumen[]>([])

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setOtros((d.articles as Resumen[]).filter((a) => a.slug !== slug).slice(0, 3)) })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((d) => { if (d?.ok) setArticle(d.article) })
      .catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => {
    if (!article) return
    document.title = `${article.titulo} · Emprende Salud`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', article.resumen)
    return () => {
      document.title = 'Emprende Salud · Productos FuXion Perú'
    }
  }, [article])

  const fmtFecha = (iso: string) => {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <div className="min-h-screen bg-[#F3F6FB]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/blog" className="flex items-center gap-2 text-sm font-bold text-[#00498E] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Blog
          </Link>
          <a
            href="/#form"
            className="rounded-full bg-[#B5D70F] px-4 py-2 text-xs font-bold text-[#0B2033] transition hover:brightness-105"
          >
            Guía gratis
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {notFound ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#758E9B]">Artículo no encontrado.</p>
            <Link to="/blog" className="mt-3 inline-block text-sm font-bold text-[#0094DE] hover:underline">
              ← Volver al blog
            </Link>
          </div>
        ) : !article ? (
          <p className="py-20 text-center text-sm text-[#758E9B]">Cargando…</p>
        ) : (
          <article className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#00498E]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#00498E]">
                {article.categoria}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#758E9B]">
                <CalendarDays className="h-3.5 w-3.5" />
                {fmtFecha(article.created_at)}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#758E9B]">
                <Sparkles className="h-3.5 w-3.5" />
                Redactado con IA · Emprende Salud
              </span>
              <span className="flex items-center gap-1 text-xs text-[#758E9B]">
                <UserRound className="h-3.5 w-3.5" />
                Revisado por Kervin Ancajima, distribuidor independiente FuXion
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight text-[#0B2033] md:text-3xl">
              {article.titulo}
            </h1>
            <p className="mt-3 border-l-4 border-[#B5D70F] pl-4 text-sm italic leading-relaxed text-[#758E9B] md:text-base">
              {article.resumen}
            </p>

            <div className="mt-6">
              <Markdown content={article.contenido} />
            </div>

            {/* Te puede interesar: otros artículos y los productos que nombra el artículo */}
            {(otros.length > 0 || productosDelArticulo(article.contenido).length > 0) && (
              <aside className="mt-10 rounded-2xl border border-[#00498E]/15 bg-[#F3F6FB] p-6">
                <h2 className="text-lg font-extrabold text-[#0B2033]">Te puede interesar</h2>
                <ul className="mt-3 space-y-2">
                  {otros.map((o) => (
                    <li key={o.slug}>
                      <Link to={`/blog/${o.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00498E] hover:underline">
                        <ArrowRight className="h-4 w-4 shrink-0" /> {o.titulo}
                      </Link>
                    </li>
                  ))}
                  {productosDelArticulo(article.contenido).map((p) => (
                    <li key={p.slug}>
                      <a href={`/tienda/${p.slug}?o=blog`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00498E] hover:underline">
                        <ArrowRight className="h-4 w-4 shrink-0" /> Ver {p.nombre} en la tienda
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="/#catalogo" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00498E] hover:underline">
                      <ArrowRight className="h-4 w-4 shrink-0" /> Ver todos los productos
                    </a>
                  </li>
                </ul>
              </aside>
            )}

            {/* CTA final */}
            <div className="mt-10 rounded-2xl bg-[#00498E] p-6 text-center">
              <p className="text-lg font-extrabold text-white">
                ¿Quieres llevar tu nutrición al siguiente nivel?
              </p>
              <p className="mt-1 text-sm text-white/80">
                Descarga gratis la Guía Sport: tu nutrición antes, durante y después de entrenar.
              </p>
              <a
                href="/#form"
                className="mt-4 inline-block rounded-full bg-[#B5D70F] px-6 py-3 text-sm font-bold text-[#0B2033] transition hover:brightness-105"
              >
                Descargar guía gratis
              </a>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
