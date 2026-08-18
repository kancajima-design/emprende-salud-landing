import { ShieldCheck, MessageCircle, BadgeCheck, Truck } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

const razones = [
  {
    icon: ShieldCheck,
    titulo: 'Compra 100% oficial',
    texto: 'Pagas directamente en la tienda oficial FuXion, con comprobante y garantía de la marca.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Distribuidor autorizado',
    texto: 'Soy socio independiente FuXion en Perú. Todos los productos son originales, directos de la empresa.',
  },
  {
    icon: MessageCircle,
    titulo: 'Asesoría personalizada',
    texto: 'No estás solo: te acompaño por WhatsApp para elegir bien y sacarle el máximo provecho a tu producto.',
  },
  {
    icon: Truck,
    titulo: 'Envío a todo el Perú',
    texto: 'Pides desde la comodidad de tu casa y recibes tu pedido en la puerta. Simple y seguro.',
  },
]

export default function Trust() {
  return (
    <section className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-[#00498E] md:text-3xl">
            ¿Por qué comprar con Emprende Salud?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Detrás de esta página hay una persona real que usa los productos y te asesora de verdad.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {razones.map((r) => (
            <div
              key={r.titulo}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#00498E]/5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00498E] to-[#0094DE] text-white">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-[#0B2033] md:text-base">{r.titulo}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#758E9B] md:text-sm">{r.texto}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-gradient-to-br from-[#00498E] to-[#0094DE] p-8 text-center text-white shadow-xl">
          <p className="text-sm leading-relaxed text-white/90 md:text-base">
            <strong className="text-[#B5D70F]">Emprende Salud</strong> nació para ayudar a más
            personas en Perú a sentirse mejor con la nutrición funcional. Si tienes dudas sobre qué
            producto va contigo, escríbeme: te respondo yo, no un bot.
          </p>
          <a
            href={waLink('Hola, quiero saber qué producto FuXion va con mi objetivo 😊')}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'sección confianza' })}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:brightness-105"
          >
            <MessageCircle className="h-4 w-4" /> Hablar conmigo por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
