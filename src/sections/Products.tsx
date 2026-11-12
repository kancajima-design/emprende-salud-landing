import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, CheckCircle2, Leaf, ShoppingCart, MessageCircle, Info, Clock, Sparkles, Gift, Search } from 'lucide-react'
import { LINEAS, EVENTO_LINEA } from '@/data/lineas'
import { PRODUCTOS, waLink, type Producto } from '@/config'
import { precioDesde, precioPorVaso, rutaDe, tienePagina } from '@/lib/producto'

// Líneas del catálogo (orden y colores en src/data/lineas.ts)
const CATEGORIAS = LINEAS

// Color de la ficha: el de su caja para los Sport, si no el de su línea
const COLOR_PRODUCTO: Record<string, string> = { 'PRE SPORT': '#FF2E9A', 'XTRA MILE': '#FF8A1F', 'POST SPORT': '#FF3B4E', 'BIOPRO+ SPORT': '#7A3FD0' }
const colorDe = (p: Producto) =>
  COLOR_PRODUCTO[p.nombre] ?? CATEGORIAS.find((c) => c.linea === (p.linea ?? 'Sistema Base'))?.color ?? '#0094DE'

const porCategoria = (linea: string) =>
  PRODUCTOS.filter((p) => (p.linea ?? 'Sistema Base') === linea)

// Tarjeta de catálogo (v4): foto, qué lleva, cómo se toma, precio y botones de ficha y compra.
// En celular va en horizontal (foto a la izquierda) para que quepa la información.
function TarjetaProducto({ p, color, onClick }: { p: Producto; color: string; onClick: () => void }) {
  const vaso = precioPorVaso(p)
  const desde = precioDesde(p)
  const variosEnlaces = (p.variantes?.length ?? 0) > 1
  return (
    <article className="prod-card group flex overflow-hidden rounded-[26px] bg-white ring-1 ring-[#041A36]/10 transition duration-300 hover:shadow-[0_28px_60px_-24px_rgba(4,26,54,0.35)] hover:ring-[#041A36]/20 sm:flex-col">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Ver la ficha de ${p.nombre}`}
        className="relative flex w-[36%] shrink-0 cursor-pointer items-center justify-center p-3 sm:h-56 sm:w-full sm:px-8 sm:pb-4 sm:pt-12"
      >
        <ProductoImagen p={p} className="prod-card-img max-h-36 w-full object-contain sm:h-full sm:max-h-none" />
        {p.tag && (
          <span className="absolute left-5 top-5 hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4A6070] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {p.tag}
          </span>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col border-l border-[#041A36]/[0.07] p-4 sm:border-l-0 sm:border-t sm:p-6">
        {p.tag && (
          <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4A6070] sm:hidden">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {p.tag}
          </span>
        )}
        <h3 className="font-display text-[21px] text-[#041A36] sm:text-[25px]">
          {tienePagina(p) ? <a href={rutaDe(p)} className="hover:text-[#00498E]">{p.nombre}</a> : p.nombre}
        </h3>
        {(p.tagline || p.descripcion) && (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-[#4A6070] sm:text-[13px]">{p.tagline || p.descripcion}</p>
        )}

        {(p.ingredientes || p.uso) && (
          <dl className="mt-4 space-y-3 border-t border-[#041A36]/[0.07] pt-4 text-[12px] leading-snug">
            {p.ingredientes && (
              <div className="flex gap-2.5">
                <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#758E9B]">Qué lleva</dt>
                  <dd className="mt-0.5 line-clamp-2 text-[#041A36]">{p.ingredientes}</dd>
                </div>
              </div>
            )}
            {p.uso && (
              <div className="hidden gap-2.5 sm:flex">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#758E9B]">Cómo se toma</dt>
                  <dd className="mt-0.5 line-clamp-2 text-[#041A36]">{p.uso}</dd>
                </div>
              </div>
            )}
          </dl>
        )}

        <div className="mt-auto pt-5">
          {vaso ? (
            <>
              <p className="whitespace-nowrap leading-none">
                <span className="font-display text-[26px] text-[#041A36]">{vaso}</span>{' '}
                <span className="text-[11px] font-medium text-[#758E9B]">por vaso</span>
              </p>
              {desde && <p className="mt-1.5 text-[11px] font-medium text-[#758E9B]">Presentaciones {desde}</p>}
            </>
          ) : (
            desde && <p className="font-display text-[22px] leading-none text-[#041A36]">{desde}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClick}
              className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-[#041A36] ring-1 ring-[#041A36]/20 transition hover:bg-[#041A36] hover:text-white"
            >
              <Info className="h-3.5 w-3.5" /> Ver ficha
            </button>
            {!variosEnlaces && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('ViewContent', { content_name: `${p.nombre} · comprar` })}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#041A36] px-3 text-[12.5px] font-semibold text-white transition hover:bg-[#00498E]"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Comprar
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
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
  const [busca, setBusca] = useState('')

  // La portada abre una línea con el evento «elegir-linea»
  useEffect(() => {
    const f = (e: Event) => {
      setBusca('')
      setCat(String((e as CustomEvent).detail))
    }
    window.addEventListener(EVENTO_LINEA, f)
    return () => window.removeEventListener(EVENTO_LINEA, f)
  }, [])

  // Búsqueda en todo el catálogo por nombre, descripción o ingredientes (sin tildes)
  const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const encontrados = useMemo(() => {
    const q = sinTildes(busca.trim())
    if (q.length < 2) return null
    return PRODUCTOS.filter((p) =>
      sinTildes([p.nombre, p.tagline, p.descripcion, p.ingredientes, p.linea].filter(Boolean).join(' ')).includes(q),
    )
  }, [busca])

  // Qué se muestra: resultados de búsqueda, todo el catálogo o una línea
  const linea = CATEGORIAS.find((x) => x.id === cat)
  const vista = encontrados ?? (linea ? porCategoria(linea.linea) : PRODUCTOS)
  const tituloVista = encontrados ? `Resultados para «${busca.trim()}»` : linea ? linea.titulo : 'Todos los productos'
  const descVista = encontrados
    ? encontrados.length
      ? 'Coincidencias por nombre, descripción o ingredientes.'
      : 'No encontré productos con esa palabra. Prueba con otra o pregúntame por WhatsApp.'
    : linea
      ? linea.desc
      : 'Las 6 líneas juntas, una tarjeta por producto.'
  const abrir = (p: Producto) => {
    setSel(p)
    trackEvent('ViewContent', { content_name: p.nombre })
  }
  const PESTANAS = [{ id: 'todos', titulo: 'Todos', color: '#041A36', total: PRODUCTOS.length }, ...CATEGORIAS.map((c) => ({ id: c.id, titulo: c.titulo, color: c.color, total: porCategoria(c.linea).length }))]

  return (
    <section id="catalogo" className="scroll-mt-24 bg-white py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#0094DE]">Catálogo completo · {PRODUCTOS.length} productos</p>
            <h2 className="mt-4 text-[38px] text-[#041A36] md:text-[60px]">
              Todo FuXion, <span className="text-[#00498E]">por línea</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#4A6070] md:text-base">
            Cada tarjeta muestra qué lleva el producto, cómo se toma y cuánto cuesta. En la ficha están todas
            las presentaciones y el enlace directo al carrito de la tienda oficial.
          </p>
        </div>

        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[250px_1fr] lg:gap-14">
          {/* Buscador y líneas: columna fija en escritorio, fila deslizable en celular */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <label className="relative block">
              <span className="sr-only">Buscar producto o ingrediente</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#758E9B]" />
              <input
                id="buscar-producto"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Producto o ingrediente"
                className="min-h-12 w-full rounded-full bg-[#F5F7FA] pl-11 pr-4 text-sm text-[#041A36] outline-none ring-1 ring-[#041A36]/10 placeholder:text-[#758E9B] focus:ring-2 focus:ring-[#0094DE]"
              />
            </label>
            <p className="mt-2 hidden px-1 text-[11px] text-[#758E9B] lg:block">Prueba con «colágeno», «fibra» o «café».</p>

            <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-7 lg:overflow-visible lg:px-0 lg:pb-0" role="tablist" aria-label="Líneas del catálogo">
              <div className="flex w-max gap-2 lg:w-full lg:flex-col lg:gap-0 lg:border-t lg:border-[#041A36]/10">
                {PESTANAS.map((t) => {
                  const activa = !encontrados && t.id === cat
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={activa}
                      onClick={() => { setCat(t.id); setBusca('') }}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm transition lg:flex lg:w-full lg:justify-between lg:rounded-none lg:border-b lg:border-[#041A36]/10 lg:bg-transparent lg:px-1 lg:py-4 lg:ring-0 ${
                        activa
                          ? 'bg-[#041A36] font-semibold text-white lg:text-[#041A36]'
                          : 'bg-white font-medium text-[#4A6070] ring-1 ring-[#041A36]/10 hover:text-[#041A36]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full transition ${activa ? 'scale-125' : 'opacity-60'}`} style={{ background: activa && t.id === 'todos' ? '#C9E63F' : t.color }} />
                        <span className={activa ? 'lg:font-display lg:text-[22px]' : ''}>{t.titulo}</span>
                      </span>
                      <span className={`text-xs tabular-nums ${activa ? 'text-white/70 lg:text-[#041A36]' : 'text-[#758E9B]'}`}>{t.total}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Productos */}
          <div key={encontrados ? 'busca' : cat} className="hero-fade mt-8 min-w-0 lg:mt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#041A36]/10 pb-5">
              <h3 className="font-display text-[28px] text-[#041A36] md:text-[34px]">{tituloVista}</h3>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#758E9B]">
                {vista.length} {vista.length === 1 ? 'producto' : 'productos'}
              </p>
              <p className="w-full text-sm text-[#4A6070]">{descVista}</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {vista.map((p) => (
                <TarjetaProducto key={p.nombre} p={p} color={colorDe(p)} onClick={() => abrir(p)} />
              ))}
            </div>
          </div>
        </div>

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
                      <DialogTitle className="font-display text-4xl font-normal text-white md:text-[44px]">{sel.nombre}</DialogTitle>
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
                    {tienePagina(sel) && (
                      <a href={rutaDe(sel)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00498E] hover:underline">
                        Abrir la página completa de {sel.nombre} →
                      </a>
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
