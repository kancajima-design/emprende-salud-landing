import { useEffect, useState } from 'react'
import { Newspaper, ExternalLink, CalendarDays, Sparkles } from 'lucide-react'

type Noticia = {
  id: number
  titulo: string
  resumen: string
  categoria: string
  fuente: string | null
  url: string | null
  created_at: string
}

const CATEGORIA_COLOR: Record<string, string> = {
  'Nutrición': 'bg-[#B5D70F]/15 text-[#6B8A00]',
  'Salud': 'bg-[#0094DE]/15 text-[#0074AE]',
  'Bienestar': 'bg-[#FF7A1A]/15 text-[#D25E08]',
  'FuXion': 'bg-[#00498E]/10 text-[#00498E]',
}

export default function News() {
  const [news, setNews] = useState<Noticia[]>([])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setNews(d.news) })
      .catch(() => {})
  }, [])

  if (!news.length) return null

  const fmtFecha = (iso: string) => {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <section id="noticias" className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#00498E]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00498E]">
            <Sparkles className="h-3.5 w-3.5" />
            Actualizado por IA
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-[#00498E] md:text-3xl">
            Noticias de nutrición y bienestar
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Nuestro asistente de inteligencia artificial investiga a diario los avances más
            relevantes en nutrición funcional, salud y bienestar para mantenerte informado.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <article
              key={n.id}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    CATEGORIA_COLOR[n.categoria] || 'bg-[#00498E]/10 text-[#00498E]'
                  }`}
                >
                  {n.categoria}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#758E9B]">
                  <CalendarDays className="h-3 w-3" />
                  {fmtFecha(n.created_at)}
                </span>
              </div>
              <h3 className="mt-3 text-base font-extrabold leading-snug text-[#0B2033]">
                {n.titulo}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#758E9B]">{n.resumen}</p>
              {(n.fuente || n.url) && (
                <div className="mt-4 border-t border-[#E6EDF3] pt-3">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0094DE] hover:underline"
                    >
                      <Newspaper className="h-3.5 w-3.5" />
                      {n.fuente || 'Ver fuente'}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#758E9B]">
                      <Newspaper className="h-3.5 w-3.5" />
                      {n.fuente}
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
