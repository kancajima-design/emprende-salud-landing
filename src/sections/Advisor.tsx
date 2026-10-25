import { Truck, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

const pilares = [
  {
    icon: Sparkles,
    titulo: 'Asesoría personalizada',
    texto:
      'Te ayudo a elegir el producto que va con tu objetivo y tu rutina, sin que compres de más.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Productos originales',
    texto:
      'Compras en la tienda en línea oficial de FuXion, una marca internacional con años en el mercado.',
  },
  {
    icon: Truck,
    titulo: 'Envío a todo el Perú',
    texto:
      'Somos una tienda 100 % virtual: haces tu pedido en línea y te llega a tu casa.',
  },
]

export default function Advisor() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-5">
          {/* Logo / marca personal */}
          <div className="lg:col-span-2">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#B5D70F]/30 via-[#0094DE]/20 to-[#FF7A1A]/20 blur-xl" />
              <img
                src="/brand/emprende-salud-logo.png"
                alt="Emprende Salud · Nutrición funcional FuXion"
                className="relative w-full rounded-[2rem] shadow-2xl ring-1 ring-[#00498E]/10"
                loading="lazy"
              />
            </div>
          </div>

          {/* Historia */}
          <div className="lg:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00498E]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00498E]">
              Marca personal
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#00498E] md:text-3xl">
              La historia detrás de <span className="text-[#0094DE]">Emprende Salud</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#0B2033]/80 md:text-base">
              Emprende Salud nació de algo que me apasiona:{' '}
              <strong className="text-[#0B2033]">el bienestar</strong>. Con la nutrición funcional
              de FuXion encontré una forma práctica de complementar mi alimentación, y hoy{' '}
              <strong className="text-[#0B2033]">asesoro a otras personas</strong> para que elijan
              el producto que va con su objetivo.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#0B2033]/80 md:text-base">
              Mi misión es simple: que más personas en Perú cuiden su bienestar con productos
              originales, una recomendación honesta y envío directo a su casa.
            </p>

            <div className="mt-8 space-y-4">
              {pilares.map((p) => (
                <div key={p.titulo} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00498E] to-[#0094DE] text-white">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B2033]">{p.titulo}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#758E9B] md:text-sm">
                      {p.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink('Hola, quiero conocer más sobre Emprende Salud y los productos FuXion 😊')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('Contact', { content_name: 'sección historia' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" /> Conversemos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
