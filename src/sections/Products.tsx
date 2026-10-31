import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Leaf, ShoppingCart, MessageCircle, Info, Clock, Sparkles, Gift, Droplets, Scale, ShieldCheck, Brain, Dumbbell } from 'lucide-react'
import { PRODUCTOS, waLink, type Producto } from '@/config'

// Categorías del catálogo: Sport primero (es el público de los anuncios).
// color = acento de la línea en las tarjetas (ver DESIGN.md)
const CATEGORIAS = [
  {
    id: 'cat-sport',
    linea: 'Línea Sport',
    color: '#F58220',
    icon: Dumbbell,
    titulo: 'Sport',
    desc: 'Rendimiento, resistencia y recuperación para tu entrenamiento.',
  },
  {
    id: 'cat-base',
    linea: 'Sistema Base',
    color: '#0094DE',
    icon: Droplets,
    titulo: 'Sistema Base',
    desc: 'La rutina diaria que lo cambia todo: limpieza, nutrición y energía de base.',
  },
  {
    id: 'cat-peso',
    linea: 'Línea Control de Peso y Medidas',
    color: '#16A34A',
    icon: Scale,
    titulo: 'Control de Peso',
    desc: 'Complementa tus hábitos con nutrición funcional para cuidar tus medidas.',
  },
  {
    id: 'cat-defensas',
    linea: 'Línea Inmunológica',
    color: '#F59E0B',
    icon: ShieldCheck,
    titulo: 'Defensas',
    desc: 'Apoyo natural para tus defensas y las de tu familia, todo el año.',
  },
  {
    id: 'cat-antiedad',
    linea: 'Línea Anti-edad',
    color: '#E11D74',
    icon: Sparkles,
    titulo: 'Anti-edad',
    desc: 'Belleza, piel y energía que se notan desde adentro hacia afuera.',
  },
  {
    id: 'cat-mental',
    linea: 'Línea Vigor Mental',
    color: '#7C3AED',
    icon: Brain,
    titulo: 'Enfoque Mental',
    desc: 'Claridad, memoria y calma para rendir mejor todos los días.',
  },
]

const porCategoria = (linea: string) =>
  PRODUCTOS.filter((p) => (p.linea ?? 'Sistema Base') === linea)

// Precio más bajo del producto para mostrar en la tarjeta
function precioDesde(p: Producto): string | null {
  if (!p.precios?.length) return null
  const valores = p.precios
    .map((x) => parseFloat(x.precio.replace(/[^\d.]/g, '')))
    .filter((n) => !isNaN(n))
  if (!valores.length) return null
  return `desde S/ ${Math.min(...valores).toFixed(2)}`
}

// Precio por vaso cuando la presentación dice cuántos sobres/sticks trae (ej. "Caja 28 sticks")
function precioPorVaso(p: Producto): string | null {
  for (const pr of p.precios ?? []) {
    const n = pr.presentacion.match(/(\d+)\s*(sticks|sobres)/i)
    const v = parseFloat(pr.precio.replace(/[^\d.]/g, ''))
    if (n && !isNaN(v) && Number(n[1]) >= 7) return `S/ ${(v / Number(n[1])).toFixed(2).replace('.', ',')}`
  }
  return null
}

// Tarjeta con inclinación 3D al pasar el mouse y la foto "saliendo" de la tarjeta
function TarjetaProducto({ p, color, onClick }: { p: Producto; color: string; onClick: () => void }) {
  function mover(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
  }
  function soltar(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  const vaso = precioPorVaso(p)
  const desde = precioDesde(p)
  return (
    <div className="prod-card">
      <button
        onClick={onClick}
        onPointerMove={mover}
        onPointerLeave={soltar}
        className="prod-card-in group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-[#00498E]/5 hover:shadow-xl"
      >
        <div
          className="relative flex h-36 items-center justify-center px-3 pt-3 sm:h-40"
          style={{ background: `radial-gradient(circle at 50% 60%, ${color}33 0%, ${color}10 55%, transparent 75%)` }}
        >
          <ProductoImagen p={p} className="prod-card-img h-full w-full object-contain" />
          {p.tag && (
            <span
              className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ background: color }}
            >
              {p.tag}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
          <p className="text-[13px] font-extrabold leading-snug text-[#0B2033] sm:text-sm">{p.nombre}</p>
          {p.tagline && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#758E9B]">{p.tagline}</p>
          )}
          <div className="mt-auto pt-3">
            {vaso ? (
              <p className="leading-none">
                <span className="text-lg font-extrabold text-[#0B2033]">{vaso}</span>{' '}
                <span className="text-[11px] font-semibold text-[#758E9B]">por vaso</span>
              </p>
            ) : (
              desde && <p className="text-sm font-extrabold text-[#0B2033]">{desde}</p>
            )}
            <span
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold transition-all group-hover:gap-2"
              style={{ color }}
            >
              <Info className="h-3 w-3" /> Ver detalles →
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}

function abrirChatValeria() {
  window.dispatchEvent(
    new CustomEvent('abrir-chat-valeria', {
      detail: {
        saludo:
          '¡Hola! Soy Valeria 💚 Veo que viste el catálogo. Cuéntame qué quieres mejorar y te digo exactamente qué producto te conviene y cómo comprarlo.',
      },
    }),
  )
}

// Las fotos se sirven en WebP (≈8 veces más livianas que el PNG original)
const imgUrl = (img: string) => `/productos/${img.replace(/\.png$/, '.webp')}`

function ProductoImagen({ p, className }: { p: Producto; className?: string }) {
  if (p.img) {
    return (
      <img
        src={imgUrl(p.img)}
        alt={p.nombre}
        className={className}
        loading="lazy"
      />
    )
  }
  return (
    <div className={`flex items-center justify-center rounded-xl bg-[#F3F6FB] ${className}`}>
      <img src="/brand/fuxion_x_icon_navy.svg" alt="" className="h-1/3 w-1/3 opacity-30" loading="lazy" />
    </div>
  )
}

export default function Products() {
  const [sel, setSel] = useState<Producto | null>(null)

  return (
    <section id="catalogo" className="scroll-mt-28 bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          Todo el catálogo, con su precio por vaso
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#758E9B]">
          Elige una línea, toca la tarjeta y ve{' '}
          <strong className="text-[#0B2033]">para qué sirve</strong>, sus{' '}
          <strong className="text-[#0B2033]">ingredientes</strong>, su precio y cómo comprarlo en mi
          tienda oficial.
        </p>

        {/* Navegación rápida por categoría */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIAS.map(({ id, icon: Icon, titulo }) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#00498E] shadow-sm ring-1 ring-[#00498E]/10 transition hover:bg-[#00498E] hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" /> {titulo}
            </a>
          ))}
        </div>

        {/* Catálogo por categorías */}
        {CATEGORIAS.map(({ id, icon: Icon, titulo, desc, linea, color }) => {
          const productos = porCategoria(linea)
          if (!productos.length) return null
          return (
            <div key={id} id={id} className="scroll-mt-32 pt-12">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#00498E] md:text-xl">
                    {titulo}{' '}
                    <span className="ml-1 align-middle text-xs font-bold text-[#758E9B]">
                      ({productos.length} {productos.length === 1 ? 'producto' : 'productos'})
                    </span>
                  </h3>
                  <p className="mt-0.5 text-xs text-[#758E9B] md:text-sm">{desc}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {productos.map((p) => (
                  <TarjetaProducto
                    key={p.nombre}
                    p={p}
                    color={color}
                    onClick={() => {
                      setSel(p)
                      trackEvent('ViewContent', { content_name: p.nombre })
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* CTA asesoría con Valeria */}
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-[#00498E]/10">
          <p className="text-sm font-extrabold text-[#0B2033] md:text-base">
            ¿No sabes cuál elegir?
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#758E9B] md:text-sm">
            Valeria te arma tu combinación ideal en 2 minutos, según tu objetivo y tu presupuesto.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={abrirChatValeria}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#00498E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" /> Hablar con Valeria ahora
            </button>
            <a
              href={waLink('Hola, vi el catálogo de productos y quiero que me recomiendes cuál me conviene 😊')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'catálogo' })}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#25D366] px-6 py-3 text-sm font-bold text-[#1da851] transition hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp directo
            </a>
          </div>
        </div>
      </div>

      {/* ── Ficha detallada del producto ── */}
      <Dialog open={!!sel} onOpenChange={(open) => !open && setSel(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-0">
          {sel && (
            <div>
              {/* Cabecera */}
              <div className="bg-gradient-to-br from-[#00498E] to-[#0094DE] px-6 pb-6 pt-8 text-center">
                {sel.img ? (
                  <img
                    src={imgUrl(sel.img)}
                    alt={sel.nombre}
                    className="mx-auto h-36 object-contain drop-shadow-xl"
                  />
                ) : (
                  <div className="mx-auto flex h-36 items-center justify-center">
                    <img src="/brand/fuxion_x_icon.svg" alt="" className="h-16 w-16 opacity-70" />
                  </div>
                )}
                <DialogHeader className="mt-3">
                  {sel.linea && (
                    <span className="mx-auto mb-2 inline-block rounded-full bg-[#B5D70F] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0B2033]">
                      {sel.linea}
                    </span>
                  )}
                  <DialogTitle className="text-center text-xl font-extrabold text-white">
                    {sel.nombre}
                  </DialogTitle>
                  {sel.tagline && (
                    <p className="text-sm font-medium text-white/85">{sel.tagline}</p>
                  )}
                </DialogHeader>
              </div>

              <div className="space-y-5 px-6 py-6">
                {sel.descripcion && (
                  <p className="text-sm leading-relaxed text-[#0B2033]">{sel.descripcion}</p>
                )}

                {sel.beneficios && sel.beneficios.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-[#00498E]">
                      ¿Para qué sirve?
                    </h4>
                    <ul className="mt-2.5 space-y-2">
                      {sel.beneficios.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm text-[#0B2033]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B5D70F]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sel.uso && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-[#00498E]">
                      <Clock className="h-4 w-4 text-[#0094DE]" /> ¿Cómo y cuándo tomarlo?
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-[#0B2033]">{sel.uso}</p>
                  </div>
                )}

                {sel.dato && (
                  <div className="rounded-xl border-l-4 border-[#B5D70F] bg-[#B5D70F]/10 px-4 py-3">
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-[#0B2033]">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#5f7a08]" />
                      <span>
                        <strong>Dato clave:</strong> {sel.dato}
                      </span>
                    </p>
                  </div>
                )}

                {sel.ingredientes && (
                  <div className="rounded-xl bg-[#F3F6FB] p-4">
                    <h4 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-[#00498E]">
                      <Leaf className="h-4 w-4 text-[#5f7a08]" /> Ingredientes
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-[#758E9B]">{sel.ingredientes}</p>
                  </div>
                )}

                {sel.precios && sel.precios.length > 0 && (
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wide text-[#00498E]">
                      Presentaciones
                    </h4>
                    <div className="mt-2.5 space-y-1.5">
                      {sel.precios.map((pr) => (
                        <div
                          key={pr.presentacion}
                          className="flex items-center justify-between rounded-lg border border-[#00498E]/10 px-3.5 py-2 text-sm"
                        >
                          <span className="text-[#0B2033]">{pr.presentacion}</span>
                          <span className="font-bold text-[#0094DE]">{pr.precio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-2.5 pt-1">
                  {sel.variantes && sel.variantes.length > 1 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#758E9B]">
                        Elige tu presentación favorita:
                      </p>
                      {sel.variantes.map((v) => (
                        <a
                          key={v.url}
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 rounded-full bg-[#FF7A1A] px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-500/25 transition hover:bg-[#e66a10]"
                        >
                          <ShoppingCart className="h-4 w-4" /> {v.nombre}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={sel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full bg-[#FF7A1A] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#e66a10]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Comprar en tienda oficial
                    </a>
                  )}
                  <a
                    href={waLink(`Hola, vi tu página y quiero más información sobre ${sel.nombre} 😊`)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('Contact', { content_name: sel.nombre })}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/25 transition hover:brightness-105"
                  >
                    <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('es:elegir-producto', { detail: sel.nombre }))
                      setSel(null)
                      document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#B5D70F] bg-[#B5D70F]/10 px-5 py-3 text-sm font-bold text-[#5f7a08] transition hover:bg-[#B5D70F]/25"
                  >
                    <Gift className="h-4 w-4" /> Quiero la guía gratis + asesoría de {sel.nombre}
                  </button>
                  <p className="pt-1 text-center text-[10px] leading-relaxed text-[#758E9B]">
                    Este producto no es un medicamento. Complementa un estilo de vida saludable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
