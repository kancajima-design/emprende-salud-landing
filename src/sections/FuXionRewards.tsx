import { Gift, Truck, Play, ShoppingCart, RefreshCw, Package, Crown } from 'lucide-react'
import { BRAND } from '@/config'

const beneficios = [
  { icon: Gift, titulo: 'Productos de regalo', texto: '60 puntos en autoenvío u 80 en compra directa = 1 producto gratis.' },
  { icon: Truck, titulo: 'Envío a tu casa', texto: 'Seguro y con seguimiento, a cualquier parte del Perú.' },
  { icon: Crown, titulo: 'Sin compromiso', texto: 'Compras cuando quieres, sin montos mínimos ni penalidades.' },
]

export default function FuXionRewards() {
  return (
    <section id="cliente-preferente" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="revela max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FF8A1F]">FuXion Rewards</p>
          <h2 className="mt-3 text-[56px] text-[#07111F] md:text-[96px]">
            Compra y <span className="text-[#FF8A1F]">gana regalos</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-[#4A6070] md:text-base">
            Regístrate <strong className="text-[#07111F]">gratis</strong> como Cliente Preferente: acumulas puntos en cada
            compra y FuXion te regala productos.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="revela grano relative overflow-hidden rounded-[32px] bg-[#07111F] p-8 text-white md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#B5D70F] opacity-25 blur-[90px]" />
            <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B5D70F]">
              <RefreshCw className="h-4 w-4" /> Autoenvío · la mejor opción
            </div>
            <p className="font-display relative mt-6 text-[140px] leading-[0.8] text-[#B5D70F] md:text-[180px]">60</p>
            <p className="font-display relative mt-2 text-3xl md:text-4xl">puntos = 1 producto de regalo</p>
            <p className="relative mt-4 max-w-sm text-sm text-white/65">
              Tu pedido llega solo cada mes, sin que tengas que recordarlo, y el regalo te sale con menos puntos.
            </p>
          </div>
          <div className="revela relative overflow-hidden rounded-[32px] bg-[#F3F6FB] p-8 md:p-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#FF8A1F]">
              <Package className="h-4 w-4" /> Compra directa
            </div>
            <p className="font-display mt-6 text-[140px] leading-[0.8] text-[#07111F] md:text-[180px]">80</p>
            <p className="font-display mt-2 text-3xl text-[#07111F] md:text-4xl">puntos = 1 producto de regalo</p>
            <p className="mt-4 max-w-sm text-sm text-[#4A6070]">
              Compras una sola vez, cuando decidas, sin permanencia. Tus puntos también te premian.
            </p>
          </div>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="revela overflow-hidden rounded-[28px] bg-[#07111F] p-2 shadow-2xl">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70">
              <Play className="h-3.5 w-3.5 text-[#B5D70F]" /> Crea tu cuenta de Cliente Preferente en 3 minutos
            </div>
            <video
              src="https://aware-cursos.s3.amazonaws.com/Tutoriales+para+Clientes/FuXion_Rewards.mp4"
              controls
              preload="metadata"
              poster="/brand/emprende-salud-logo.png"
              className="aspect-video w-full rounded-[20px] bg-black object-cover"
            >
              Tu navegador no puede reproducir el video.
            </video>
          </div>
          <div className="revela">
            <ul className="space-y-5">
              {beneficios.map((b) => (
                <li key={b.titulo} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF8A1F]/15 text-[#FF8A1F]">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-[#07111F]">{b.titulo}</p>
                    <p className="mt-0.5 text-sm text-[#4A6070]">{b.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href={BRAND.compraUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#07111F] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]"
            >
              <ShoppingCart className="h-4 w-4" /> Registrarme gratis
            </a>
            <p className="mt-3 text-xs text-[#758E9B]">
              Al registrarte, verifica que <strong className="text-[#07111F]">Emprende Salud</strong> aparezca como tu
              patrocinador para recibir mi acompañamiento.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
