import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react'
import { waLink, PRODUCTOS } from '@/config'
import { trackEvent } from '@/lib/analytics'
import { LINEAS, EVENTO_LINEA } from '@/data/lineas'

// Portada v4 alta gama (12-11-2026): bodegón de frutos peruanos a pantalla completa dentro de un
// marco redondeado, titular con serifa y datos clave en una franja de vidrio. Sin productos montados:
// la foto es decorativa (ingredientes), los productos reales se ven en el catálogo.
const DATOS = [
  { n: `${PRODUCTOS.length}`, t: 'productos en 6 líneas' },
  { n: 'Oficial', t: 'compras en la tienda FuXion' },
  { n: 'Todo el Perú', t: 'envío a domicilio' },
  { n: '1 regalo', t: 'con tus puntos de compra' },
]

const cuantos = (linea: string) => PRODUCTOS.filter((p) => (p.linea ?? 'Sistema Base') === linea).length

function abrirLinea(id: string, titulo: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_LINEA, { detail: id }))
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  trackEvent('ViewContent', { content_name: `portada-linea-${titulo}` })
}

export default function Hero() {
  return (
    <>
      <section className="bg-[#041A36] p-2 text-white md:p-3">
        <div className="grano relative isolate flex min-h-[calc(100svh-16px)] flex-col overflow-hidden rounded-[28px] md:min-h-[calc(100svh-24px)] md:rounded-[40px]">
          <picture>
            <source media="(max-width: 767px)" srcSet="/portada/bodegon-alto.webp" />
            <img
              src="/portada/bodegon-ancho.webp"
              alt="Aguaymanto, camu camu, maíz morado y granadilla sobre piedra oscura"
              width={1920}
              height={1072}
              fetchPriority="high"
              className="absolute inset-0 -z-20 h-full w-full object-cover object-top md:object-right"
            />
          </picture>
          {/* Velo azul de marca: de abajo hacia arriba en celular, de izquierda a derecha en escritorio */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#041A36] via-[#041A36]/85 to-[#041A36]/10 md:bg-gradient-to-r md:from-[#041A36] md:via-[#041A36]/75 md:to-[#041A36]/5" />
          <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/3 bg-gradient-to-t from-[#041A36]/90 to-transparent md:block" />

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-8 pt-[46svh] md:justify-center md:px-12 md:pb-36 md:pt-36">
            <p className="sube text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70" style={{ animationDelay: '0.05s' }}>
              Distribuidor independiente FuXion · Piura, Perú
            </p>
            <h1 className="sube mt-5 max-w-3xl text-[44px] sm:text-[60px] md:text-[76px] lg:text-[88px]" style={{ animationDelay: '0.15s' }}>
              Productos FuXion <span className="text-[#C9E63F]">con envío a todo el Perú</span>
            </h1>
            <p className="sube mt-6 max-w-lg text-[15px] leading-relaxed text-white/75 md:text-[17px]" style={{ animationDelay: '0.3s' }}>
              Conoce cada producto antes de comprar: ingredientes, cómo se toma, presentaciones y precio en soles.
              Compras en la tienda oficial de FuXion y te asesoro por WhatsApp.
            </p>
            <div className="sube mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.45s' }}>
              <a
                href="#catalogo"
                onClick={() => trackEvent('ViewContent', { content_name: 'hero-ver-catalogo' })}
                className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white pl-7 pr-2 text-[15px] font-bold text-[#041A36] transition hover:bg-[#C9E63F]"
              >
                Ver catálogo
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#041A36] text-white transition group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
              <a
                href={waLink('Hola, vi tu página Emprende Salud y quiero asesoría para elegir mis productos 😊')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('Contact', { content_name: 'hero' })}
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Franja de datos */}
          <dl className="mx-3 mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 backdrop-blur-xl md:absolute md:inset-x-8 md:bottom-8 md:mx-0 md:mb-0 md:grid-cols-4 md:rounded-[28px]">
            {DATOS.map((d) => (
              <div key={d.t} className="bg-[#041A36]/55 px-4 py-4 md:px-7 md:py-5">
                <dt className="font-display text-[22px] text-white md:text-[28px]">{d.n}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/60 md:text-xs">{d.t}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Líneas: atajo al catálogo */}
      <section aria-labelledby="lineas-titulo" className="bg-[#F5F7FA] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#0094DE]">Las 6 líneas</p>
              <h2 id="lineas-titulo" className="mt-4 text-[38px] text-[#041A36] md:text-[60px]">
                ¿Qué estás <span className="text-[#00498E]">buscando?</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#4A6070] md:text-base">
              Elige una línea y verás sus productos con ingredientes, modo de uso y precio.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-[#041A36]/10 bg-[#041A36]/10 sm:grid-cols-2 lg:grid-cols-3">
            {LINEAS.map(({ id, icon: Icon, titulo, desc, color, linea }) => (
              <button
                key={id}
                type="button"
                onClick={() => abrirLinea(id, titulo)}
                className="group flex cursor-pointer flex-col bg-white p-7 text-left transition-colors duration-300 hover:bg-[#041A36] md:p-9"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border" style={{ borderColor: `${color}66`, color }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#758E9B] transition-colors group-hover:text-white/55">
                    {cuantos(linea)} productos
                  </span>
                </span>
                <span className="font-display mt-8 text-[30px] text-[#041A36] transition-colors group-hover:text-white md:text-[34px]">{titulo}</span>
                <span className="mt-2 block text-sm leading-relaxed text-[#4A6070] transition-colors group-hover:text-white/70">{desc}</span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#041A36] transition-colors group-hover:text-[#C9E63F]">
                  Ver productos <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
