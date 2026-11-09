import { ArrowRight, MessageCircle } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Portada cinematográfica: titular gigante con el color de cada momento,
// deportista en video a sangre y los 3 productos asomando por el borde inferior.
const PALABRAS = [
  { texto: 'Antes.', color: '#FF2E9A' },
  { texto: 'Durante.', color: '#FF8A1F' },
  { texto: 'Después.', color: '#FF3B4E' },
]
const CINTA = ['Corre', 'Pedalea', 'Entrena', 'Envío a todo el Perú', 'Tienda oficial FuXion', 'Desde S/ 4,63 por vaso']

export default function Hero() {
  return (
    <>
      <section className="grano relative isolate overflow-hidden bg-[#062B57] text-white">
        {/* Video: a sangre en celular, panel derecho en escritorio */}
        <div className="absolute inset-0 md:left-auto md:w-[52%] md:[mask-image:linear-gradient(to_right,transparent,black_40%)]">
          <video
            className="h-full w-full object-cover"
            src="/videos/hero-malecon.mp4"
            poster="/videos/hero-malecon.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Deportista trotando en el malecón al amanecer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#062B57] via-[#062B57]/50 to-[#062B57]/20 md:bg-gradient-to-r md:from-[#062B57] md:via-[#062B57]/25 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-[#062B57] to-transparent md:block" />
        </div>
        {/* Brillos de color */}
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#FF2E9A] opacity-25 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[#FF8A1F] opacity-20 blur-[120px]" />
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-[#0094DE] opacity-25 blur-[150px]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-12 pt-36 md:min-h-[860px] md:justify-start md:px-8 md:pb-[300px] md:pt-44">
          <p className="sube text-[11px] font-bold uppercase tracking-[0.3em] text-[#B5D70F]" style={{ animationDelay: '0.05s' }}>
            Nutrición deportiva FuXion · Perú
          </p>
          <h1 className="mt-4 text-[72px] sm:text-[96px] md:text-[124px] lg:text-[148px]">
            {PALABRAS.map((p, i) => (
              <span key={p.texto} className="sube block" style={{ color: p.color, animationDelay: `${0.15 + i * 0.12}s` }}>
                {p.texto}
              </span>
            ))}
          </h1>
          <p className="sube mt-5 max-w-md text-base leading-relaxed text-white/80 md:text-lg" style={{ animationDelay: '0.55s' }}>
            Tres bebidas en polvo para tu entrenamiento: energía antes, hidratación durante y recuperación después.
          </p>
          <div className="sube mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.7s' }}>
            <a
              href="#encuentra"
              onClick={() => trackEvent('ViewContent', { content_name: 'hero-arma-tu-plan' })}
              className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-[#B5D70F] px-8 text-base font-extrabold text-[#062B57] shadow-[0_0_40px_rgba(181,215,15,0.35)] transition hover:scale-[1.03]"
            >
              Arma tu plan <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href={waLink('Hola, vi tu página Emprende Salud y quiero armar mi plan para entrenar 🏃')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'hero' })}
              className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp
            </a>
          </div>
          <a href="#kit-prueba" className="sube mt-4 self-start text-sm text-white/60 underline-offset-4 hover:text-white hover:underline" style={{ animationDelay: '0.8s' }}>
            ¿Primera vez? Kit Prueba Sport a S/ 76 →
          </a>
        </div>

        {/* Productos asomando por el borde inferior (escritorio) */}
        <div className="pointer-events-none absolute bottom-[-40px] left-1/2 hidden w-[min(1080px,88vw)] -translate-x-1/2 grid-cols-3 items-end gap-6 md:grid">
          {['pre-sport', 'xtra-mile', 'post-sport'].map((p, i) => (
            <div key={p} style={{ transform: `translateY(${i === 1 ? -36 : 0}px)` }}>
              <img
                src={`/productos/${p}.webp`}
                alt={`${p.replace('-', ' ').toUpperCase()} de FuXion`}
                width={760}
                height={460}
                className="sube w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.65)]"
                style={{ animationDelay: `${0.9 + i * 0.12}s` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Cinta animada */}
      <div className="relative z-10 overflow-hidden bg-[#B5D70F] py-3 text-[#062B57]">
        <div className="cinta">
          {[...CINTA, ...CINTA, ...CINTA, ...CINTA].map((t, i) => (
            <span key={i} className="font-display flex items-center whitespace-nowrap px-5 text-2xl md:text-3xl">
              {t}
              <span className="ml-10 text-lg">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
