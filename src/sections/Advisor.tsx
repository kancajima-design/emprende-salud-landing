import { TrendingUp, Users, Sparkles, MessageCircle } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

const pilares = [
  {
    icon: Sparkles,
    titulo: 'Desarrollo personal',
    texto:
      'Crecimiento constante en mentalidad, liderazgo y hábitos. Aquí no solo compartes productos: te conviertes en tu mejor versión.',
  },
  {
    icon: Users,
    titulo: 'Sistema con respaldo internacional',
    texto:
      'El respaldo de una marca internacional con años en el mercado: productos, capacitación y tienda en línea ya funcionando.',
  },
  {
    icon: TrendingUp,
    titulo: 'Emprendimiento con respaldo',
    texto:
      'Puedes emprender a tu ritmo: compras con precio preferente y decides si vendes a personas de tu círculo, con la empresa enviando directo a tus clientes.',
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
                alt="Emprende Salud · Bienestar y emprendimiento"
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
              Emprende Salud nació cuando descubrí que podía unir dos cosas que me apasionan:{' '}
              <strong className="text-[#0B2033]">el bienestar y el crecimiento personal</strong>. En
              FuXion vi mucho más que productos de nutrición funcional: vi un{' '}
              <strong className="text-[#0B2033]">sistema con respaldo internacional</strong> que me
              permite crecer como persona y construir mi propio{' '}
              <strong className="text-[#0B2033]">emprendimiento de bienestar</strong> mientras ayudo
              a otros a sentirse mejor cada día.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#0B2033]/80 md:text-base">
              Hoy mi misión es simple: que más personas en Perú cuiden su salud con productos
              respaldados por la ciencia… y que quienes busquen emprender encuentren en este
              sistema el mismo camino que yo encontré.
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
              <a
                href={waLink('Hola, me interesa información sobre el programa de distribuidor independiente FuXion')}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('Contact', { content_name: 'programa distribuidor' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#FF7A1A] px-6 py-3.5 text-sm font-bold text-[#FF7A1A] transition hover:bg-[#FF7A1A] hover:text-white"
              >
                <TrendingUp className="h-4 w-4" /> Quiero emprender contigo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
