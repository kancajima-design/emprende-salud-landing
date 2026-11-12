import { Truck, ShieldCheck, BadgeCheck, MessageCircle } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Quién te asesora + por qué comprar aquí (une las antiguas secciones Asesor y Confianza)
const razones = [
  { icon: ShieldCheck, titulo: 'Compra 100 % oficial', texto: 'Pagas en la tienda oficial FuXion, con comprobante y garantía de la marca.', color: '#0094DE' },
  { icon: BadgeCheck, titulo: 'Distribuidor independiente', texto: 'Productos originales, directos de FuXion. Sin intermediarios ni reventa.', color: '#B5D70F' },
  { icon: MessageCircle, titulo: 'Asesoría por WhatsApp', texto: 'Te ayudo a elegir según tu rutina y lo que buscas, sin que compres de más.', color: '#25D366' },
  { icon: Truck, titulo: 'Envío a todo el Perú', texto: 'Pides desde tu celular y lo recibes en la puerta de tu casa.', color: '#FF8A1F' },
]

export default function Advisor() {
  return (
    <section className="grano relative overflow-hidden bg-[#062B57] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#0094DE] opacity-20 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="revela relative mx-auto w-full max-w-[260px] lg:max-w-sm">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#B5D70F]/40 via-[#0094DE]/30 to-[#FF2E9A]/30 blur-2xl" />
            <img
              src="/brand/emprende-salud-logo.png"
              alt="Emprende Salud · Distribuidor independiente FuXion"
              className="relative w-full rounded-[32px] ring-1 ring-white/10"
              loading="lazy"
            />
          </div>

          <div className="revela">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#B5D70F]">Quién te asesora</p>
            <h2 className="mt-3 text-[56px] md:text-[88px]">
              Detrás hay <span className="text-[#B5D70F]">una persona real</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              Soy Kervin, desde Piura. Emprende Salud nació de algo que me apasiona: el bienestar. Uso los
              productos FuXion y te recomiendo solo lo que va con tu rutina y tu presupuesto.
            </p>
            <a
              href={waLink('Hola Kervin, quiero que me asesores para elegir mis productos 😊')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'sección asesor' })}
              className="mt-7 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-extrabold text-white shadow-[0_0_40px_rgba(37,211,102,0.3)] transition hover:scale-[1.03]"
            >
              <MessageCircle className="h-5 w-5" /> Conversemos por WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {razones.map((r) => (
            <div key={r.titulo} className="revela rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${r.color}22`, color: r.color }}>
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display mt-5 text-2xl">{r.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{r.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
