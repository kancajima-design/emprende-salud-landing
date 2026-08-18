import { ShoppingCart } from 'lucide-react'
import { BRAND } from '@/config'

export default function FinalCTA() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00498E] to-[#0094DE] px-8 py-12 text-center shadow-xl md:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#B5D70F]/20 blur-2xl" />
          <h2 className="relative text-2xl font-extrabold text-white md:text-3xl">
            ¿Ya sabes qué necesitas? Compra directa aquí
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80">
            Tienda oficial con envío y garantía FuXion. Comprando desde mi enlace me apoyas como
            distribuidor independiente y te acompaño en todo el proceso.
          </p>
          <a
            href={BRAND.compraUrl}
            target="_blank"
            rel="noreferrer"
            className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-[#FF7A1A] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a10]"
          >
            <ShoppingCart className="h-5 w-5" /> Ir a la tienda oficial
          </a>
        </div>
      </div>
    </section>
  )
}
