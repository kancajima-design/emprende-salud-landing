import { ShoppingCart, Sparkles } from 'lucide-react'
import { BRAND } from '@/config'

export default function FinalCTA() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00498E] to-[#0094DE] px-8 py-12 text-center shadow-xl md:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#B5D70F]/20 blur-2xl" />
          <h2 className="relative text-2xl font-extrabold text-white md:text-3xl">
            ¿Ya sabes qué necesitas? Tu pedido llega a la puerta de tu casa
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80">
            Tienda oficial con envío a todo el Perú y garantía FuXion. Comprando desde mi enlace
            me apoyas como distribuidor independiente y te acompaño en todo el proceso.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={BRAND.compraUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF7A1A] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a10]"
            >
              <ShoppingCart className="h-5 w-5" /> Ir a la tienda oficial
            </a>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('abrir-chat-valeria', {
                    detail: {
                      saludo:
                        '¡Hola! Soy Valeria 💚 Antes de comprar, ¿tienes alguna duda? Pregúntame lo que necesites: precios, cómo pedir, envíos o qué producto va contigo.',
                    },
                  }),
                )
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#B5D70F] px-8 py-4 text-sm font-bold text-[#B5D70F] transition hover:bg-[#B5D70F] hover:text-[#0B2033]"
            >
              <Sparkles className="h-5 w-5" /> Prefiero que me asesoren primero
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
