import { ArrowRight, MessageCircle, Store, Truck, Gift } from 'lucide-react'
import { waLink, PRODUCTOS } from '@/config'
import { trackEvent } from '@/lib/analytics'
import { LINEAS, EVENTO_LINEA } from '@/data/lineas'

// Portada general (11-11-2026): todo el catálogo FuXion, sin la parte deportiva.
// Arriba qué vendes y dónde llega; abajo las líneas para ir directo a lo que buscas.
const VITRINA = ['prunex1', 'flora-liv', 'nutraday', 'beauty-in', 'biopro-fit', 'cafe-ganomax']
const NOMBRES: Record<string, string> = {
  prunex1: 'PRUNEX1',
  'flora-liv': 'FLORA LIV',
  nutraday: 'NUTRADAY',
  'beauty-in': 'BEAUTY-IN',
  'biopro-fit': 'BIOPRO+ FIT',
  'cafe-ganomax': 'CAFÉ GANOMAX',
}

const cuantos = (linea: string) => PRODUCTOS.filter((p) => (p.linea ?? 'Sistema Base') === linea).length

function abrirLinea(id: string, titulo: string) {
  window.dispatchEvent(new CustomEvent(EVENTO_LINEA, { detail: id }))
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  trackEvent('ViewContent', { content_name: `portada-linea-${titulo}` })
}

export default function Hero() {
  return (
    <>
      <section className="grano relative isolate overflow-hidden bg-[#062B57] text-white">
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-[#0094DE] opacity-25 blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[#B5D70F] opacity-15 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-32 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-24 md:pt-40">
          <div>
            <p className="sube text-[11px] font-bold uppercase tracking-[0.3em] text-[#B5D70F]" style={{ animationDelay: '0.05s' }}>
              Distribuidor independiente FuXion · Piura, Perú
            </p>
            <h1 className="sube mt-4 text-[52px] leading-[0.95] sm:text-[68px] md:text-[84px]" style={{ animationDelay: '0.15s' }}>
              Productos FuXion <span className="text-[#B5D70F]">con envío a todo el Perú</span>
            </h1>
            <p className="sube mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg" style={{ animationDelay: '0.3s' }}>
              Conoce cada producto antes de comprar: ingredientes, cómo se toma, presentaciones y precio en soles.
              Compras en la tienda oficial de FuXion y te asesoro por WhatsApp.
            </p>
            <div className="sube mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.45s' }}>
              <a
                href="#catalogo"
                onClick={() => trackEvent('ViewContent', { content_name: 'hero-ver-catalogo' })}
                className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-[#B5D70F] px-8 text-base font-extrabold text-[#062B57] shadow-[0_0_40px_rgba(181,215,15,0.35)] transition hover:scale-[1.03]"
              >
                Ver catálogo <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>
              <a
                href={waLink('Hola, vi tu página Emprende Salud y quiero asesoría para elegir mis productos 😊')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('Contact', { content_name: 'hero' })}
                className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp
              </a>
            </div>
            <ul className="sube mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75" style={{ animationDelay: '0.6s' }}>
              <li className="flex items-center gap-2"><Store className="h-4 w-4 text-[#B5D70F]" /> {PRODUCTOS.length} productos en 6 líneas</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#B5D70F]" /> Pedido en la tienda oficial, llega a tu casa</li>
              <li className="flex items-center gap-2"><Gift className="h-4 w-4 text-[#B5D70F]" /> 1 producto de regalo con tus puntos</li>
            </ul>
          </div>

          {/* Vitrina: productos de varias líneas */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {VITRINA.map((p, i) => (
              <div
                key={p}
                className="sube flex aspect-square items-center justify-center rounded-3xl bg-white/[0.06] p-3 ring-1 ring-white/10"
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              >
                <img
                  src={`/productos/${p}.webp`}
                  alt={`${NOMBRES[p]} de FuXion`}
                  width={240}
                  height={240}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  className="h-full w-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Líneas: atajo al catálogo */}
      <section aria-labelledby="lineas-titulo" className="bg-[#F3F6FB] py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Busca por lo que necesitas</p>
          <h2 id="lineas-titulo" className="mt-3 text-[44px] text-[#062B57] md:text-[64px]">¿Qué estás buscando?</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LINEAS.map(({ id, icon: Icon, titulo, desc, color, linea }) => (
              <button
                key={id}
                type="button"
                onClick={() => abrirLinea(id, titulo)}
                className="group flex cursor-pointer items-start gap-4 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-[#00498E]/5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: color }}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-[#0B2033]">{titulo}</span>
                    <span className="text-xs font-semibold text-[#758E9B]">{cuantos(linea)} productos</span>
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-[#4A6070]">{desc}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-2" style={{ color }}>
                    Ver productos <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
