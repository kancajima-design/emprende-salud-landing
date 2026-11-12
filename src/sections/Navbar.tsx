import { ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const ENLACES = [
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '#como-comprar', texto: 'Cómo comprar' },
  { href: '#preguntas', texto: 'Preguntas' },
  { href: '/blog', texto: 'Blog' },
]

// Menú flotante en cápsula de vidrio (v4 alta gama, 12-11-2026)
export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-3 z-40 px-3 md:top-5 md:px-6">
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/15 bg-[#041A36]/70 pl-5 pr-2 shadow-[0_10px_40px_rgba(2,12,27,0.35)] backdrop-blur-xl md:h-16 md:pl-7 md:pr-2.5">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-4 w-auto md:h-[18px]" />
          <span className="h-4 w-px bg-white/25" />
          <span className="whitespace-nowrap text-[13px] font-semibold tracking-wide text-white md:text-sm">
            Emprende <span className="text-[#B5D70F]">Salud</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} className="whitespace-nowrap text-[13px] font-medium tracking-wide text-white/70 transition hover:text-white">
              {e.texto}
            </a>
          ))}
        </nav>
        <a
          href="#catalogo"
          onClick={() => trackEvent('ViewContent', { content_name: 'navbar-productos' })}
          className="group flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-bold text-[#041A36] transition hover:bg-[#B5D70F] md:h-11 md:px-5"
        >
          <span className="whitespace-nowrap sm:hidden">Catálogo</span>
          <span className="hidden whitespace-nowrap sm:inline">Ver productos</span> <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </a>
      </header>
    </div>
  )
}
