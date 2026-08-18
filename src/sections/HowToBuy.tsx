import { MousePointerClick, UserCheck, CreditCard, Play } from 'lucide-react'
import { BRAND } from '@/config'

const pasos = [
  {
    icon: MousePointerClick,
    titulo: 'Elige tu producto',
    texto: 'Toca "Comprar" en cualquier producto del catálogo y se abrirá la tienda oficial FuXion.',
  },
  {
    icon: UserCheck,
    titulo: 'Verifica tu patrocinador',
    texto: 'Confirma que aparezca Emprende Salud como tu patrocinador para recibir mi asesoría personalizada.',
  },
  {
    icon: CreditCard,
    titulo: 'Completa tu compra',
    texto: 'Regístrate como cliente, paga de forma segura y recibe tu pedido en la puerta de tu casa.',
  },
]

export default function HowToBuy() {
  return (
    <section id="como-comprar" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FF7A1A]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D25E08]">
            <Play className="h-3.5 w-3.5" />
            Video tutorial
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-[#00498E] md:text-3xl">
            ¿Cómo comprar paso a paso?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Mira este corto tutorial y aprende a completar tu compra en la tienda oficial FuXion
            con <strong className="text-[#0B2033]">Emprende Salud</strong> como tu patrocinador.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-[#00498E]/10">
            <video
              src="/videos/comprar-con-powerlink.mp4"
              controls
              preload="metadata"
              className="aspect-video w-full bg-black"
            >
              Tu navegador no puede reproducir el video.
            </video>
          </div>

          <ol className="space-y-5">
            {pasos.map((p, i) => (
              <li key={p.titulo} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00498E] to-[#0094DE] text-white shadow-lg">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#0B2033] md:text-base">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#B5D70F] text-[11px] font-black text-[#0B2033]">
                      {i + 1}
                    </span>
                    {p.titulo}
                  </p>
                  <p className="mt-1 pl-7 text-sm text-[#758E9B]">{p.texto}</p>
                </div>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={BRAND.compraUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF7A1A] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[#e66a10]"
              >
                Ir a la tienda oficial
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
