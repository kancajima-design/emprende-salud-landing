import { Crown, Gift, Truck, Percent, Play, Star, ShoppingCart, RefreshCw, Package } from 'lucide-react'
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
    titulo: 'Productos de regalo',
    texto: 'Por cada 60 puntos en autoenvío o 80 puntos en compra directa, FuXion te regala un producto.',
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

        {/* Promoción: mecánica clara en 2 tarjetas */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Autoenvío */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00498E] to-[#0094DE] p-7 text-white shadow-xl">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#B5D70F]/25" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B5D70F]">
                <RefreshCw className="h-6 w-6 text-[#0B2033]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#B5D70F]">La opción con más beneficio</p>
                <h3 className="text-lg font-extrabold md:text-xl">Autoenvío mensual</h3>
              </div>
            </div>
            <p className="mt-4 text-2xl font-extrabold leading-snug md:text-3xl">
              Por cada <span className="text-[#B5D70F]">60 puntos</span> en autoenvío
              recibes <span className="text-[#FF7A1A]">1 producto de regalo</span> 🎁
            </p>
            <p className="mt-3 text-sm text-white/85">
              Tu pedido llega solo a tu casa cada mes, sin que tengas que recordarlo. Acumulas puntos más rápido
              y el regalo te sale con menos puntos.
            </p>
          </div>

          {/* Compra directa */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#00498E]/15 bg-white p-7 shadow-lg">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#FF7A1A]/10" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF7A1A]">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#FF7A1A]">Compra cuando quieras</p>
                <h3 className="text-lg font-extrabold text-[#0B2033] md:text-xl">Compra directa</h3>
              </div>
            </div>
            <p className="mt-4 text-2xl font-extrabold leading-snug text-[#0B2033] md:text-3xl">
              Por cada <span className="text-[#00498E]">80 puntos</span> en compra directa
              recibes <span className="text-[#FF7A1A]">1 producto de regalo</span> 🎁
            </p>
            <p className="mt-3 text-sm text-[#758E9B]">
              Compra una sola vez, cuando tú decidas, sin compromiso de permanencia. Tus puntos también acumulan
              y te premian.
            </p>
          </div>
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
              ⏱️ El registro es gratis y toma 3 minutos. Cada compra sin registrarte es puntos que
              no acumulas y un regalo que dejas pasar.
            </p>
            <p className="mt-2 text-xs text-[#758E9B]">
              Al registrarte, asegúrate de que <strong className="text-[#0B2033]">Emprende Salud</strong> aparezca como
              tu patrocinador para recibir mi acompañamiento personalizado.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
