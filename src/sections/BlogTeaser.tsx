import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Sparkles, BookOpen } from 'lucide-react'

type Articulo = {
  id: number
  slug: string
  titulo: string
  resumen: string
  categoria: string
  created_at: string
}

const CATEGORIA_COLOR: Record<string, string> = {
  'Nutrición': 'bg-[#B5D70F]/15 text-[#6B8A00]',
  'Salud': 'bg-[#0094DE]/15 text-[#0074AE]',
  'Bienestar': 'bg-[#FF7A1A]/15 text-[#D25E08]',
  'FuXion': 'bg-[#00498E]/10 text-[#00498E]',
  'Emprendimiento': 'bg-purple-100 text-purple-700',
}

// Adelanto del blog en la landing: últimos 3 artículos SEO
export default function BlogTeaser() {
  const [articles, setArticles] = useState<Articulo[]>([])

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setArticles((d.articles || []).slice(0, 3)) })
      .catch(() => {})
  }, [])

  if (!articles.length) return null

  const fmtFecha = (iso: string) => {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <section id="blog" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="revela">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">
            <Sparkles className="h-3.5 w-3.5" /> Blog Emprende Salud
          </p>
          <h2 className="mt-3 text-[38px] text-[#062B57] md:text-[60px]">
            Aprende sobre <span className="text-[#0094DE]">nutrición funcional</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[#4A6070] md:text-base">
            Artículos prácticos investigados a diario por nuestra asistente de inteligencia
            artificial para ayudarte a cuidar tu salud y tu alimentación.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/blog/${a.slug}`}
              className="revela group flex flex-col rounded-[28px] bg-[#F3F6FB] p-7 transition hover:-translate-y-1 hover:bg-[#062B57] hover:text-white"
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
              <h3 className="mt-4 text-lg font-extrabold leading-snug">
                {a.titulo}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4A6070] group-hover:text-white/70">{a.resumen}</p>
              <span className="mt-5 text-sm font-extrabold text-[#0094DE] group-hover:text-[#B5D70F]">Leer artículo →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/blog"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#062B57] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]"
          >
            <BookOpen className="h-4 w-4" />
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </section>
  )
}
