import { MessageCircle, ArrowRight, Truck, ShieldCheck, Headphones, BadgeCheck } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Patrón de las marcas top (Precision, Skratch, OX): resultado + momento de uso,
// deportista real en movimiento, 1 botón principal y WhatsApp como segundo.
const MOMENTOS = [
  { etiqueta: 'Antes', nombre: 'PRE SPORT', img: '/productos/pre-sport.webp', color: '#E6007E' },
  { etiqueta: 'Durante', nombre: 'XTRA MILE', img: '/productos/xtra-mile.webp', color: '#F58220' },
  { etiqueta: 'Después', nombre: 'POST SPORT', img: '/productos/post-sport.webp', color: '#D7263D' },
]

const CONFIANZA = [
  { icon: ShieldCheck, texto: 'Tienda oficial FuXion' },
  { icon: Truck, texto: 'Envío a todo el Perú' },
  { icon: Headphones, texto: 'Asesoría por WhatsApp' },
  { icon: BadgeCheck, texto: 'Productos originales' },
]

export default function Hero() {
  return (
    <section className="relative bg-white pt-[100px]">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-6 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pb-16 md:pt-14">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0094DE]">
            Para correr · pedalear · entrenar
          </p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.02] tracking-tight text-[#0B2033] md:text-[64px]">
            Rinde antes, durante <span className="text-[#00498E]">y después.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#4A6070] md:text-lg">
            Bebidas en polvo FuXion para cada momento de tu entrenamiento. Te ayudo a armar tu plan
            y te llega a todo el Perú.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#encuentra"
              onClick={() => trackEvent('ViewContent', { content_name: 'hero-arma-tu-plan' })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00498E] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#003d7a]"
            >
              Arma tu plan <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={waLink('Hola, vi tu página Emprende Salud y quiero armar mi plan para entrenar 🏃')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'hero' })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-6 py-3 text-sm font-bold text-[#128C4A] transition hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <p className="mt-3 text-xs text-[#758E9B]">
            ¿Primera vez? Empieza con el <a href="#kit-prueba" className="font-bold text-[#00498E] underline underline-offset-2">Kit Prueba Sport a S/ 76</a>.
          </p>
        </div>

        {/* Deportista en movimiento + los 3 momentos */}
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0B2033]">
            <video
              className="aspect-[4/5] h-full w-full object-cover md:aspect-[5/6]"
              src="/videos/hero-malecon.mp4"
              poster="/videos/hero-malecon.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Deportista trotando en el malecón"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06182B]/85 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#0B2033] backdrop-blur">
              Tu rutina en 3 vasos
            </span>
          </div>
          {/* Tarjeta con los 3 momentos, sobre el video */}
          <div className="relative z-10 -mt-24 mx-3 grid grid-cols-3 gap-2 rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-black/5 md:mx-6">
            {MOMENTOS.map((m) => (
              <a key={m.nombre} href="#momentos" className="group rounded-2xl p-2 text-center transition hover:bg-[#F3F6FB]">
                <img src={m.img} alt={m.nombre} width={760} height={460} className="mx-auto h-14 w-full object-contain transition group-hover:-translate-y-1 md:h-16" />
                <span
                  className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white"
                  style={{ background: m.color }}
                >
                  {m.etiqueta}
                </span>
                <p className="mt-1 text-[11px] font-extrabold text-[#0B2033]">{m.nombre}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Franja de confianza */}
      <div className="border-y border-[#00498E]/10 bg-[#F3F6FB]">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-4">
          {CONFIANZA.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-center gap-2 text-xs font-bold text-[#0B2033] md:justify-center md:text-sm">
              <Icon className="h-5 w-5 shrink-0 text-[#00498E]" /> {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
