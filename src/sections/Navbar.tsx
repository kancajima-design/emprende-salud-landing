import { ShoppingCart, MessageCircle, Flame } from 'lucide-react'
import { BRAND, waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

export default function Navbar() {
  return (
    <div className="fixed top-0 z-40 w-full">
      {/* Barra de oferta */}
      <div className="bg-[#B5D70F] px-4 py-1.5 text-center">
        <a
          href="#form"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B2033] sm:text-xs"
        >
          <Flame className="h-3.5 w-3.5" />
          Esta semana: guía gratis + oferta especial en tu primera compra
          <span className="font-extrabold">Aprovechar →</span>
        </a>
      </div>
      <header className="w-full border-b border-white/10 bg-[#00498E]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-5 w-auto" />
          <span className="hidden h-4 w-px bg-white/30 sm:block" />
          <span className="text-sm font-bold tracking-wide text-white">
            Emprende <span className="text-[#B5D70F]">Salud</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'navbar' })}
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 sm:flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={BRAND.compraUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#FF7A1A] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[#e66a10]"
          >
            <ShoppingCart className="h-4 w-4" /> Comprar
          </a>
        </div>
      </div>
      </header>
    </div>
  )
}
