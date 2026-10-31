import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const ENLACES = [
  { href: '#momentos', texto: 'Cómo funciona' },
  { href: '#planes', texto: 'Planes' },
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '/blog', texto: 'Blog' },
]

export default function Navbar() {
  // Transparente sobre la portada; vidrio oscuro al bajar
  const [abajo, setAbajo] = useState(false)
  useEffect(() => {
    const f = () => setAbajo(window.scrollY > 40)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <div className="fixed top-0 z-40 w-full">
      <div className="bg-[#B5D70F] px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#07111F] sm:text-[11px]">
        Envío a todo el Perú · Tienda oficial FuXion<span className="hidden sm:inline"> · 1 producto de regalo con tus puntos</span>
      </div>
      <header
        className={`w-full transition-colors duration-300 ${
          abajo ? 'bg-[#07111F]/85 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-5 w-auto" />
            <span className="h-4 w-px bg-white/30" />
            <span className="text-sm font-bold tracking-wide text-white">
              Emprende <span className="text-[#B5D70F]">Salud</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {ENLACES.map((e) => (
              <a key={e.href} href={e.href} className="text-sm font-semibold text-white/75 transition hover:text-white">
                {e.texto}
              </a>
            ))}
          </nav>
          <a
            href="#encuentra"
            onClick={() => trackEvent('ViewContent', { content_name: 'navbar-plan' })}
            className="group hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#07111F] transition hover:bg-[#B5D70F] sm:flex"
          >
            Arma tu plan <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </header>
    </div>
  )
}
