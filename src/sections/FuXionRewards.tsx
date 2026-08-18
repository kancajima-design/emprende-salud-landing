import { Crown, Gift, Truck, Percent, Play, Star, ShoppingCart } from 'lucide-react'
import { BRAND } from '@/config'

const beneficios = [
  {
    icon: Percent,
    titulo: 'Precio especial preferente',
    texto: 'Accede a precios exclusivos que no están disponibles para el público general. Ahorra en cada compra.',
  },
  {
    icon: Truck,
    titulo: 'Envío directo a tu casa',
    texto: 'Recibe tus productos FuXion en la puerta de tu hogar con envío seguro y rastreable.',
  },
  {
    icon: Gift,
    titulo: 'Promociones y recompensas',
    texto: 'Participa en el programa FuXion Rewards y acumula beneficios con cada compra que realices.',
  },
  {
    icon: Crown,
    titulo: 'Sin compromiso de compra',
    texto: 'Compra cuando quieras, sin montos mínimos obligatorios ni penalidades. Tú decides.',
  },
]

export default function FuXionRewards() {
  return (
    <section id="cliente-preferente" className="bg-gradient-to-b from-[#F3F6FB] to-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#B5D70F]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7a08]">
            <Star className="h-3.5 w-3.5" />
            Programa exclusivo
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-[#00498E] md:text-3xl">
            Conviértete en <span className="text-[#FF7A1A]">Cliente Preferente</span> FuXion
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Regístrate <strong className="text-[#0B2033]">gratis</strong> como cliente preferente y empieza a disfrutar
            precios especiales, envío a domicilio y el programa de recompensas{' '}
            <strong className="text-[#00498E]">FuXion Rewards</strong>.
          </p>
        </div>

        {/* Video + Beneficios */}
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          {/* Video tutorial */}
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-[#00498E]/10">
            <div className="relative aspect-video w-full bg-black">
              <video
                src="https://aware-cursos.s3.amazonaws.com/Tutoriales+para+Clientes/FuXion_Rewards.mp4"
                controls
                preload="metadata"
                poster="/brand/emprende-salud-logo.png"
                className="h-full w-full"
              >
                Tu navegador no puede reproducir el video.
              </video>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="flex items-center gap-2 text-xs font-bold text-[#00498E]">
                <Play className="h-3.5 w-3.5" />
                Tutorial paso a paso
              </p>
              <p className="mt-1 text-xs text-[#758E9B]">
                Aprende a crear tu cuenta de cliente preferente en menos de 3 minutos.
              </p>
            </div>
          </div>

          {/* Lista de beneficios */}
          <div>
            <h3 className="text-lg font-extrabold text-[#0B2033] md:text-xl">
              ¿Por qué ser cliente preferente?
            </h3>
            <ul className="mt-5 space-y-4">
              {beneficios.map((b) => (
                <li key={b.titulo} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00498E] to-[#0094DE] text-white shadow-lg">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#0B2033] md:text-base">{b.titulo}</p>
                    <p className="mt-0.5 text-sm text-[#758E9B]">{b.texto}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={BRAND.compraUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF7A1A] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[#e66a10]"
              >
                <ShoppingCart className="h-4 w-4" /> Quiero ser cliente preferente
              </a>
            </div>
            <p className="mt-3 text-xs text-[#758E9B]">
              Al registrarte, asegúrate de que <strong className="text-[#0B2033]">Emprende Salud</strong> aparezca como
              tu patrocinador para recibir mi acompañamiento personalizado.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
