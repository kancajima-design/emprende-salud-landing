import { ArrowRight, MessageCircle, Play } from 'lucide-react'
import { waLink } from '@/config'

const pasos = [
  { titulo: 'Elige', texto: 'Toca "Comprar" en un producto: se abre la tienda oficial FuXion con todo en el carrito.' },
  { titulo: 'Verifica', texto: 'Confirma que aparezca Emprende Salud como tu patrocinador para recibir mi asesoría.' },
  { titulo: 'Recibe', texto: 'Regístrate gratis como cliente, paga seguro y recibe tu pedido en tu casa.' },
]

export default function HowToBuy() {
  return (
    <section id="como-comprar" className="scroll-mt-24 bg-[#F3F6FB] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="revela flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Cómo comprar</p>
            <h2 className="mt-3 text-[56px] text-[#062B57] md:text-[96px]">
              3 pasos, <span className="text-[#0094DE]">2 minutos</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-[#4A6070] md:text-base">
            Compras directo en la tienda oficial. Si algo se traba, te ayudo por WhatsApp en el momento.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="revela overflow-hidden rounded-[28px] bg-[#062B57] p-2 shadow-2xl">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70">
              <Play className="h-3.5 w-3.5 text-[#B5D70F]" /> Video tutorial · comprar con mi enlace
            </div>
            <video src="/videos/comprar-con-powerlink.mp4" controls preload="metadata" className="aspect-video w-full rounded-[20px] bg-black">
              Tu navegador no puede reproducir el video.
            </video>
          </div>

          <ol className="space-y-4">
            {pasos.map((p, i) => (
              <li key={p.titulo} className="revela flex items-start gap-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                <span className="font-display text-7xl leading-none text-[#0094DE]/25">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-3xl text-[#062B57]">{p.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#4A6070]">{p.texto}</p>
                </div>
              </li>
            ))}
            <li className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#catalogo" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#062B57] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]">
                Ver productos <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href={waLink('Hola, estoy comprando en la tienda FuXion y necesito ayuda con un paso 😅')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#25D366] px-6 text-sm font-bold text-[#128C4A] transition hover:bg-[#25D366] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" /> Ayuda por WhatsApp
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
