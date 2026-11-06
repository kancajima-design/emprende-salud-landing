import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, CheckCircle2, Leaf, ShoppingCart, MessageCircle, Info, Clock, Sparkles, Gift, Droplets, Scale, ShieldCheck, Brain, Dumbbell } from 'lucide-react'
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
    desc: 'Tu rutina diaria: vitaminas, fibra, probióticos y energía de base.',
  },
  {
    id: 'cat-fit',
    linea: 'Línea Fit',
    color: '#16A34A',
    icon: Scale,
    titulo: 'Fit',
    desc: 'Proteínas, cafés y bebidas para acompañar tu ejercicio y tu alimentación.',
  },
  {
    id: 'cat-defensas',
    linea: 'Bebidas de bienestar',
    color: '#F59E0B',
    icon: ShieldCheck,
    titulo: 'Bienestar',
    desc: 'Tés, cafés y bebidas con ganoderma, aloe y betaglucanos.',
  },
  {
    id: 'cat-belleza',
    linea: 'Línea Belleza',
    color: '#E11D74',
    icon: Sparkles,
    titulo: 'Belleza',
    desc: 'Colágeno, antioxidantes y bebidas para tu rutina de cuidado.',
  },
  {
    id: 'cat-mental',
    linea: 'Línea Vigor Mental',
    color: '#7C3AED',
    icon: Brain,
    titulo: 'Enfoque Mental',
    desc: 'Bebidas con aminoácidos para tus días intensos.',
  },
]

// Color de la ficha: el de su caja para los Sport, si no el de su línea
const COLOR_PRODUCTO: Record<string, string> = { 'PRE SPORT': '#FF2E9A', 'XTRA MILE': '#FF8A1F', 'POST SPORT': '#FF3B4E', 'BIOPRO+ SPORT': '#7A3FD0' }
const colorDe = (p: Producto) =>
  COLOR_PRODUCTO[p.nombre] ?? CATEGORIAS.find((c) => c.linea === (p.linea ?? 'Sistema Base'))?.color ?? '#0094DE'

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
  const [cat, setCat] = useState(CATEGORIAS[0].id)

  return (
    <section id="catalogo" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Catálogo completo · {PRODUCTOS.length} productos</p>
        <h2 className="mt-3 text-[56px] text-[#062B57] md:text-[96px]">
          Todo FuXion, por línea
        </h2>
        <p className="mt-3 max-w-xl text-sm text-[#758E9B] md:text-base">
          Elige una línea y toca un producto para ver sus ingredientes, cómo se toma, sus presentaciones y el
          enlace directo al carrito de la tienda oficial.
        </p>

        {/* Pestañas por línea (patrón Liquid I.V.) */}
        <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-1" role="tablist">
          <div className="flex w-max gap-2">
            {CATEGORIAS.map(({ id, icon: Icon, titulo, linea, color }) => {
              const activa = id === cat
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setCat(id)}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-bold transition ${
                    activa ? 'text-white shadow-md' : 'bg-white text-[#0B2033] ring-1 ring-[#00498E]/10 hover:ring-[#00498E]/30'
                  }`}
                  style={activa ? { background: color } : undefined}
                >
                  <Icon className="h-4 w-4" /> {titulo}
                  <span className={`text-xs ${activa ? 'text-white/80' : 'text-[#758E9B]'}`}>{porCategoria(linea).length}</span>
                </button>
              )
            })}
          </div>
        </div>

        {(() => {
          const c = CATEGORIAS.find((x) => x.id === cat) ?? CATEGORIAS[0]
          const productos = porCategoria(c.linea)
          return (
            <div key={c.id} className="hero-fade pt-6">
              <p className="text-sm text-[#758E9B]">{c.desc}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {productos.map((p) => (
                  <TarjetaProducto
                    key={p.nombre}
                    p={p}
                    color={c.color}
                    onClick={() => {
                      setSel(p)
                      trackEvent('ViewContent', { content_name: p.nombre })
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })()}

        {/* CTA asesoría con Valeria */}
        <div className="revela grano relative mx-auto mt-14 max-w-3xl overflow-hidden rounded-[32px] bg-[#062B57] p-8 text-center text-white md:p-10">
          <p className="font-display text-4xl md:text-5xl">¿No sabes cuál elegir?</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
            Valeria te arma tu combinación ideal en 2 minutos, según tu objetivo y tu presupuesto.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={abrirChatValeria}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-[#B5D70F] px-6 text-sm font-extrabold text-[#062B57] transition hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" /> Hablar con Valeria ahora
            </button>
            <a
              href={waLink('Hola, vi el catálogo de productos y quiero que me recomiendes cuál me conviene 😊')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'catálogo' })}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp directo
            </a>
          </div>
        </div>
      </div>

      {/* ── Ficha detallada del producto (mismo estilo oscuro de la portada) ── */}
      <Dialog open={!!sel} onOpenChange={(open) => !open && setSel(null)}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-[32px] border-0 bg-white p-0 sm:max-w-4xl"
        >
          {sel && (() => {
            const color = colorDe(sel)
            const vaso = precioPorVaso(sel)
            return (
              <>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:h-[min(92vh,720px)] md:flex-none md:grid-cols-[0.9fr_1.1fr] md:overflow-hidden">
                {/* Escenario del producto */}
                <div className="grano relative shrink-0 overflow-hidden bg-[#062B57] px-6 pb-8 pt-10 text-white md:flex md:flex-col md:justify-between md:p-8">
                  <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-50 blur-[90px]" style={{ background: color }} />
                  <div className="relative">
                    {sel.linea && (
                      <span className="inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white" style={{ background: color }}>
                        {sel.linea.replace('Línea ', '')}
                      </span>
                    )}
                    <DialogHeader className="mt-4 text-left">
                      <DialogTitle className="font-display text-5xl font-normal leading-[0.95] text-white md:text-6xl">{sel.nombre}</DialogTitle>
                    </DialogHeader>
                    {sel.tagline && <p className="mt-2 text-sm text-white/70">{sel.tagline}</p>}
                  </div>
                  <div className="relative my-6 flex h-48 items-center justify-center md:h-64">
                    {sel.img ? (
                      <img src={imgUrl(sel.img)} alt={sel.nombre} className="max-h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
                    ) : (
                      <img src="/brand/fuxion_x_icon.svg" alt="" className="h-20 w-20 opacity-70" />
                    )}
                  </div>
                  <div className="relative">
                    {vaso ? (
                      <p className="leading-none"><span className="font-display text-6xl">{vaso}</span> <span className="text-sm text-white/60">por vaso</span></p>
                    ) : (
                      precioDesde(sel) && <p className="font-display text-5xl">{precioDesde(sel)}</p>
                    )}
                  </div>
                </div>

                {/* Detalle */}
                <div className="relative flex shrink-0 flex-col md:h-full md:min-h-0">
                  <button
                    type="button"
                    onClick={() => setSel(null)}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F3F6FB] text-[#062B57] transition hover:bg-[#062B57] hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="min-h-0 flex-1 space-y-6 px-6 pb-4 pt-8 md:overflow-y-auto md:px-8 md:pt-10">
                    {sel.descripcion && <p className="pr-8 text-sm leading-relaxed text-[#062B57] md:text-base">{sel.descripcion}</p>}

                    {sel.beneficios && sel.beneficios.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color }}>Para qué sirve</h4>
                        <ul className="mt-3 space-y-2">
                          {sel.beneficios.map((b) => (
                            <li key={b} className="flex items-start gap-2.5 text-sm text-[#062B57]">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sel.uso && (
                      <div className="rounded-[20px] bg-[#F3F6FB] p-4">
                        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#062B57]">
                          <Clock className="h-4 w-4" style={{ color }} /> Cómo y cuándo
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-[#4A6070]">{sel.uso}</p>
                      </div>
                    )}

                    {sel.ingredientes && (
                      <div>
                        <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#062B57]">
                          <Leaf className="h-4 w-4" style={{ color }} /> Ingredientes
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed text-[#4A6070]">{sel.ingredientes}</p>
                      </div>
                    )}

                    {sel.dato && (
                      <p className="flex items-start gap-2 rounded-[20px] border-l-4 bg-[#F3F6FB] px-4 py-3 text-xs leading-relaxed text-[#062B57]" style={{ borderColor: color }}>
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                        <span><strong>Dato clave:</strong> {sel.dato}</span>
                      </p>
                    )}

                    {sel.precios && sel.precios.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#062B57]">Presentaciones</h4>
                        <div className="mt-2 divide-y divide-black/5 rounded-[20px] ring-1 ring-black/5">
                          {sel.precios.map((pr) => (
                            <div key={pr.presentacion} className="flex items-center justify-between px-4 py-3 text-sm">
                              <span className="text-[#4A6070]">{pr.presentacion}</span>
                              <span className="font-extrabold text-[#062B57]">{pr.precio}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] leading-relaxed text-[#758E9B]">
                      Este producto no es un medicamento. Complementa un estilo de vida saludable.
                    </p>
                  </div>

                  {/* Botones (escritorio) */}
                  <div className="hidden space-y-2 border-t border-black/5 bg-white px-8 py-4 md:block">
                    {sel.variantes && sel.variantes.length > 1 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sel.variantes.map((v) => (
                          <a
                            key={v.url}
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => trackEvent('ViewContent', { content_name: v.nombre })}
                            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#062B57] px-4 text-center text-xs font-extrabold text-white transition hover:scale-[1.02]"
                          >
                            <ShoppingCart className="h-4 w-4 shrink-0" /> Comprar {v.nombre.replace(`${sel.nombre} - `, '').replace(`${sel.nombre} `, '').toLowerCase()}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a
                        href={sel.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEvent('ViewContent', { content_name: sel.nombre })}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#062B57] px-5 text-sm font-extrabold text-white transition hover:scale-[1.02]"
                      >
                        <ShoppingCart className="h-4 w-4" /> Comprar en tienda oficial
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={waLink(`Hola, vi tu página y quiero más información sobre ${sel.nombre} 😊`)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEvent('Contact', { content_name: sel.nombre })}
                        className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-extrabold text-white transition hover:brightness-105"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('es:elegir-producto', { detail: sel.nombre }))
                          setSel(null)
                          document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#B5D70F] px-3 text-xs font-extrabold text-[#062B57] transition hover:brightness-105"
                      >
                        <Gift className="h-4 w-4" /> Guía gratis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Botones (celular): siempre visibles abajo */}
              <div className="space-y-2 border-t border-black/5 bg-white px-4 py-3 md:hidden">
                    {sel.variantes && sel.variantes.length > 1 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sel.variantes.map((v) => (
                          <a
                            key={v.url}
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => trackEvent('ViewContent', { content_name: v.nombre })}
                            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#062B57] px-4 text-center text-xs font-extrabold text-white transition hover:scale-[1.02]"
                          >
                            <ShoppingCart className="h-4 w-4 shrink-0" /> Comprar {v.nombre.replace(`${sel.nombre} - `, '').replace(`${sel.nombre} `, '').toLowerCase()}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a
                        href={sel.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEvent('ViewContent', { content_name: sel.nombre })}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#062B57] px-5 text-sm font-extrabold text-white transition hover:scale-[1.02]"
                      >
                        <ShoppingCart className="h-4 w-4" /> Comprar en tienda oficial
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={waLink(`Hola, vi tu página y quiero más información sobre ${sel.nombre} 😊`)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEvent('Contact', { content_name: sel.nombre })}
                        className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-extrabold text-white transition hover:brightness-105"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('es:elegir-producto', { detail: sel.nombre }))
                          setSel(null)
                          document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#B5D70F] px-3 text-xs font-extrabold text-[#062B57] transition hover:brightness-105"
                      >
                        <Gift className="h-4 w-4" /> Guía gratis
                      </button>
                    </div>
                  </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </section>
  )
}
