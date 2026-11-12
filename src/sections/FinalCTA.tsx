import { ArrowRight, Sparkles } from 'lucide-react'

// Cierre: asesoría antes de comprar (sin video desde el 11-11-2026)
export default function FinalCTA() {
  return (
    <section className="bg-white p-2 md:p-3">
    <div className="grano relative isolate overflow-hidden rounded-[28px] bg-[#041A36] text-white md:rounded-[40px]">
      <img src="/portada/bodegon-ancho.webp" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-right opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#041A36] via-[#041A36]/85 to-[#041A36]/40" />
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:px-8">
        <p className="revela text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">Asesoría personalizada</p>
        <h2 className="revela mt-4 text-[42px] md:text-[76px]">
          ¿Tienes dudas sobre <span className="text-[#C9E63F]">un producto?</span>
        </h2>
        <p className="revela mt-5 max-w-lg text-base text-white/70 md:text-lg">
          Te cuento qué lleva cada producto, cómo se toma y cuánto cuesta. Tu pedido llega a tu casa, en todo el Perú.
        </p>
        <div className="revela mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#catalogo"
            className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-[#B5D70F] px-8 text-base font-extrabold text-[#062B57] shadow-[0_0_40px_rgba(181,215,15,0.35)] transition hover:scale-[1.03]"
          >
            Ver productos <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
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
    </div>
    </section>
  )
}
