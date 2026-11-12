import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, Leaf, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react'
import { PRODUCTOS, waLink } from '@/config'
import { LINEAS } from '@/data/lineas'
import { precioDesde, precioPorVaso, preguntasDe, productoPorSlug, rutaDe, tienePagina } from '@/lib/producto'
import { trackEvent } from '@/lib/analytics'
import NoEncontrada from './NoEncontrada'

// Página propia de cada producto: /productos/<slug> (12-11-2026).
// Informa (ingredientes, uso, presentaciones, precio) y manda a comprar a la tienda oficial.
// Todo el contenido sale de src/data/catalogo.ts; el servidor entrega la misma información ya escrita (server/seo.js).
const imgUrl = (img: string) => `/productos/${img.replace(/\.png$/, '.webp')}`

export default function ProductoView() {
  const { slug = '' } = useParams<{ slug: string }>()
  const p = productoPorSlug(slug)

  useEffect(() => {
    if (!p) return
    document.title = `${p.nombre} FuXion: precio en Perú, ingredientes y cómo se toma · Emprende Salud`
    window.scrollTo(0, 0)
    trackEvent('ViewContent', { content_name: `${p.nombre} · página` })
  }, [p])

  if (!p) return <NoEncontrada />

  const linea = LINEAS.find((l) => l.linea === (p.linea ?? 'Sistema Base'))
  const color = linea?.color ?? '#0094DE'
  const vaso = precioPorVaso(p)
  const desde = precioDesde(p)
  const preguntas = preguntasDe(p)
  const otros = PRODUCTOS.filter((o) => o.nombre !== p.nombre && tienePagina(o) && (o.linea ?? 'Sistema Base') === (p.linea ?? 'Sistema Base')).slice(0, 4)
  const enlaces = p.variantes && p.variantes.length > 1 ? p.variantes : [{ nombre: 'Comprar en la tienda oficial', url: p.url }]

  return (
    <div className="min-h-screen bg-white text-[#041A36]">
      {/* Menú */}
      <div className="fixed inset-x-0 top-3 z-40 px-3 md:top-5 md:px-6">
        <header className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/15 bg-[#041A36]/75 pl-5 pr-2 shadow-[0_10px_40px_rgba(2,12,27,0.35)] backdrop-blur-xl md:h-16 md:pl-7 md:pr-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-4 w-auto md:h-[18px]" />
            <span className="h-4 w-px bg-white/25" />
            <span className="whitespace-nowrap text-[13px] font-semibold tracking-wide text-white md:text-sm">
              Emprende <span className="text-[#B5D70F]">Salud</span>
            </span>
          </Link>
          <a href="/#catalogo" className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 text-[13px] font-bold text-[#041A36] transition hover:bg-[#B5D70F] md:h-11 md:px-5">
            <ArrowLeft className="h-4 w-4" /> Catálogo
          </a>
        </header>
      </div>

      {/* Portada del producto */}
      <section className="bg-white p-2 md:p-3">
        <div className="grano relative isolate overflow-hidden rounded-[28px] bg-[#041A36] text-white md:rounded-[40px]">
          <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-[420px] w-[420px] rounded-full opacity-30 blur-[130px]" style={{ background: color }} />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-28 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:pb-20 md:pt-40">
            <div>
              <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                <Link to="/" className="hover:text-white">Inicio</Link>
                <span>/</span>
                <a href="/#catalogo" className="hover:text-white">Catálogo</a>
                {linea && (
                  <>
                    <span>/</span>
                    <span className="text-white/80">{linea.titulo}</span>
                  </>
                )}
              </nav>
              <h1 className="mt-6 text-[44px] sm:text-[60px] md:text-[72px]">
                {p.nombre} <span className="text-[#C9E63F]">de FuXion</span>
              </h1>
              {p.tagline && <p className="mt-4 text-lg text-white/85 md:text-xl">{p.tagline}</p>}
              {p.descripcion && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 md:text-base">{p.descripcion}</p>}

              <div className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-3">
                {vaso && (
                  <p className="leading-none">
                    <span className="font-display text-[44px]">{vaso}</span> <span className="text-sm text-white/60">por vaso</span>
                  </p>
                )}
                {desde && <p className="text-sm text-white/70">Presentaciones {desde}</p>}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {enlaces.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('ViewContent', { content_name: `${v.nombre} · comprar` })}
                    className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#041A36] transition hover:bg-[#C9E63F]"
                  >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    {enlaces.length > 1 ? `Comprar ${v.nombre.replace(`${p.nombre} - `, '').replace(`${p.nombre} `, '')}` : v.nombre}
                  </a>
                ))}
                <a
                  href={waLink(`Hola, vi la página de ${p.nombre} en Emprende Salud y quiero más información 😊`)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('Contact', { content_name: `${p.nombre} · página` })}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> Preguntar por WhatsApp
                </a>
              </div>
            </div>

            {p.img && (
              <div className="mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-[32px] bg-white p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <img src={imgUrl(p.img)} alt={`${p.nombre} de FuXion`} width={520} height={520} className="h-full w-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ficha */}
      <section className="mx-auto grid max-w-6xl gap-px overflow-hidden px-5 py-16 md:grid-cols-2 md:px-12 md:py-24">
        {p.beneficios && p.beneficios.length > 0 && (
          <div className="border-t border-[#041A36]/10 py-8 md:pr-12">
            <h2 className="text-[28px] md:text-[34px]">Para qué es</h2>
            <ul className="mt-5 space-y-3">
              {p.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#4A6070]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" style={{ color }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="border-t border-[#041A36]/10 py-8 md:pl-12">
          <h2 className="flex items-center gap-3 text-[28px] md:text-[34px]">
            <Clock className="h-6 w-6" style={{ color }} /> Cómo se toma
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4A6070]">{p.uso}</p>
        </div>
        <div className="border-t border-[#041A36]/10 py-8 md:pr-12">
          <h2 className="flex items-center gap-3 text-[28px] md:text-[34px]">
            <Leaf className="h-6 w-6" style={{ color }} /> Qué lleva
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4A6070]">{p.ingredientes}</p>
          {p.dato && (
            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#F5F7FA] p-4 text-sm leading-relaxed text-[#041A36]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} /> {p.dato}
            </p>
          )}
        </div>
        {p.precios && p.precios.length > 0 && (
          <div className="border-t border-[#041A36]/10 py-8 md:pl-12">
            <h2 className="text-[28px] md:text-[34px]">Presentaciones y precios</h2>
            <div className="mt-5 divide-y divide-[#041A36]/10 rounded-2xl ring-1 ring-[#041A36]/10">
              {p.precios.map((pr) => (
                <div key={pr.presentacion} className="flex items-center justify-between gap-4 px-5 py-4 text-[15px]">
                  <span className="text-[#4A6070]">{pr.presentacion}</span>
                  <span className="font-display whitespace-nowrap text-xl">{pr.precio}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#758E9B]">
              Precios de referencia en soles, válidos para el Perú. El precio vigente se confirma en la tienda oficial al comprar.
            </p>
          </div>
        )}
      </section>

      {/* Preguntas */}
      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#0094DE]">Preguntas frecuentes</p>
          <h2 className="mt-4 text-[34px] md:text-[48px]">
            Sobre <span className="text-[#00498E]">{p.nombre}</span>
          </h2>
          <div className="mt-8 divide-y divide-[#041A36]/10 rounded-[24px] bg-white ring-1 ring-[#041A36]/10">
            {preguntas.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold">
                  {f.q}
                  <span className="text-xl font-light text-[#758E9B] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#4A6070]">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[#758E9B]">
            Este producto no es un medicamento. Complementa un estilo de vida saludable.
          </p>
        </div>
      </section>

      {/* Otros productos de la línea */}
      {otros.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-24">
          <h2 className="text-[30px] md:text-[40px]">
            Más de <span className="text-[#00498E]">{linea?.titulo ?? 'la línea'}</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otros.map((o) => (
              <Link key={o.nombre} to={rutaDe(o)} className="group flex flex-col rounded-[24px] bg-white p-5 ring-1 ring-[#041A36]/10 transition hover:shadow-[0_24px_50px_-24px_rgba(4,26,54,0.35)]">
                {o.img && <img src={imgUrl(o.img)} alt={`${o.nombre} de FuXion`} loading="lazy" className="mx-auto h-32 w-full object-contain" />}
                <span className="font-display mt-4 text-xl">{o.nombre}</span>
                {o.tagline && <span className="mt-1 line-clamp-2 text-xs leading-snug text-[#4A6070]">{o.tagline}</span>}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00498E]">
                  Ver producto <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-[#041A36]/10 px-5 py-8 text-center text-xs text-[#758E9B]">
        <p>
          Emprende Salud · Kervin Ancajima, distribuidor independiente FuXion en Piura, Perú ·{' '}
          <a href="/#catalogo" className="font-semibold text-[#00498E] hover:underline">Catálogo</a> ·{' '}
          <Link to="/blog" className="font-semibold text-[#00498E] hover:underline">Blog</Link> ·{' '}
          <Link to="/empresa" className="font-semibold text-[#00498E] hover:underline">Información del negocio</Link>
        </p>
      </footer>
    </div>
  )
}
