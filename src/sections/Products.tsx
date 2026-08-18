import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Leaf, ShoppingCart, MessageCircle, Info, Clock, Sparkles, Gift } from 'lucide-react'
import { PRODUCTOS, waLink, type Producto } from '@/config'

function ProductoImagen({ p, className }: { p: Producto; className?: string }) {
  if (p.img) {
    return (
      <img
        src={`/productos/${p.img}`}
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
    <section className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          Todo el catálogo FuXion
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#758E9B]">
          Toca cualquier producto para ver <strong className="text-[#0B2033]">para qué sirve</strong>,
          sus <strong className="text-[#0B2033]">ingredientes</strong> y comprarlo directo en mi
          tienda oficial.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PRODUCTOS.map((p) => (
            <button
              key={p.nombre}
              onClick={() => {
                setSel(p)
                trackEvent('ViewContent', { content_name: p.nombre })
              }}
              className="group flex flex-col rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-[#00498E]/5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <ProductoImagen
                p={p}
                className="mx-auto h-28 w-full object-contain transition group-hover:scale-105"
              />
              <p className="mt-2 text-xs font-bold leading-snug text-[#0B2033] sm:text-sm">
                {p.nombre}
              </p>
              {p.tag && <p className="mt-0.5 text-xs text-[#0094DE]">{p.tag}</p>}
              <span className="mx-auto mt-2 inline-flex items-center gap-1 rounded-full bg-[#00498E]/5 px-2.5 py-1 text-[10px] font-semibold text-[#00498E] opacity-0 transition group-hover:opacity-100">
                <Info className="h-3 w-3" /> Ver detalles
              </span>
            </button>
          ))}
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
                    src={`/productos/${sel.img}`}
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
