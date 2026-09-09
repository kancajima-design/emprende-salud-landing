import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Sparkles, ArrowLeft, BookOpen } from 'lucide-react'

type Articulo = {
  id: number
  slug: string
  titulo: string
  resumen: string
  categoria: string
  keywords: string
  created_at: string
}

const CATEGORIA_COLOR: Record<string, string> = {
  'Nutrición': 'bg-[#B5D70F]/15 text-[#6B8A00]',
  'Salud': 'bg-[#0094DE]/15 text-[#0074AE]',
  'Bienestar': 'bg-[#FF7A1A]/15 text-[#D25E08]',
  'FuXion': 'bg-[#00498E]/10 text-[#00498E]',
  'Emprendimiento': 'bg-purple-100 text-purple-700',
}

export default function Blog() {
  const [articles, setArticles] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Blog · Emprende Salud — Nutrición funcional y bienestar'
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setArticles(d.articles) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-[#00498E] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Emprende Salud
          </Link>
          <a
            href="/#form"
            className="rounded-full bg-[#B5D70F] px-4 py-2 text-xs font-bold text-[#0B2033] transition hover:brightness-105"
          >
            Guía gratis
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#00498E]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00498E]">
            <Sparkles className="h-3.5 w-3.5" />
            Blog Emprende Salud
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-[#00498E] md:text-4xl">
            Nutrición funcional, bienestar y emprendimiento
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Artículos prácticos para cuidar tu salud y hacer crecer tu negocio,
            investigados y redactados por nuestra asistente de inteligencia artificial.
          </p>
        </div>

        {loading ? (
          <p className="py-20 text-center text-sm text-[#758E9B]">Cargando artículos…</p>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-[#00498E]/30" />
            <p className="mt-4 text-sm text-[#758E9B]">
              Muy pronto publicaremos aquí. Vuelve en unos días 🌱
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.id}
                to={`/blog/${a.slug}`}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      CATEGORIA_COLOR[a.categoria] || 'bg-[#00498E]/10 text-[#00498E]'
                    }`}
                  >
                    {a.categoria}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#758E9B]">
                    <CalendarDays className="h-3 w-3" />
                    {fmtFecha(a.created_at)}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-extrabold leading-snug text-[#0B2033]">
                  {a.titulo}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#758E9B]">{a.resumen}</p>
                <span className="mt-4 text-xs font-bold text-[#0094DE]">Leer artículo →</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
