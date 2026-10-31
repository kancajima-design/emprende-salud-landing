import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

// Cierre a pantalla completa con video del deportista
export default function FinalCTA() {
  const v = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = v.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="grano relative isolate overflow-hidden bg-[#062B57] text-white">
      <video
        ref={v}
        src="/videos/b3-carrera-sudor.mp4"
        poster="/videos/b3-carrera-sudor.jpg"
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#062B57] via-[#062B57]/60 to-[#062B57]/80" />
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:px-8">
        <p className="revela text-[11px] font-bold uppercase tracking-[0.3em] text-[#B5D70F]">Tu próximo entrenamiento</p>
        <h2 className="revela mt-4 text-[64px] md:text-[140px]">
          ¿Listo para <span className="text-[#FF8A1F]">rendir más?</span>
        </h2>
        <p className="revela mt-5 max-w-lg text-base text-white/70 md:text-lg">
          Arma tu plan en 30 segundos o déjame asesorarte. Te llega a la puerta de tu casa, en todo el Perú.
        </p>
        <div className="revela mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#encuentra"
            className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-[#B5D70F] px-8 text-base font-extrabold text-[#062B57] shadow-[0_0_40px_rgba(181,215,15,0.35)] transition hover:scale-[1.03]"
          >
            Arma tu plan <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
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
            className="inline-flex min-h-14 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
          >
            <Sparkles className="h-5 w-5 text-[#B5D70F]" /> Prefiero que me asesoren
          </button>
        </div>
      </div>
    </section>
  )
}
