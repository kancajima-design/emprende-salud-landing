import { ArrowDown, CheckCircle2, ShoppingCart, MessageCircle } from 'lucide-react'
import { BRAND, waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

const bullets = ['Más energía sin bajones', 'Digestión liviana', 'Rutina simple de 5 minutos']

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#00498E] via-[#003d7a] to-[#0094DE] pt-[100px]">
      {/* Decoración */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#B5D70F]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#0094DE]/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#B5D70F] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0B2033] shadow-lg shadow-lime-500/30">
            Guía gratis + asesoría personalizada
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Energía real, digestión liviana y{' '}
            <span className="text-[#B5D70F]">bienestar todos los días</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/80 md:text-lg">
            Descarga gratis la <strong className="text-white">Guía de Nutrición Funcional</strong> y
            descubre qué producto FuXion va con tu objetivo. Te asesoro personalmente por WhatsApp.
          </p>
          <ul className="mt-5 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B5D70F]" /> {b}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#form"
              className="inline-flex items-center gap-2 rounded-full bg-[#B5D70F] px-6 py-3.5 text-sm font-bold text-[#0B2033] shadow-xl shadow-lime-500/30 transition hover:brightness-105"
            >
              Quiero mi guía gratis <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href={BRAND.compraUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ShoppingCart className="h-4 w-4" /> Ver productos
            </a>
          </div>
          <p className="mt-4 text-xs text-white/60">
            Sin spam. Tus datos solo los uso para enviarte la guía y asesorarte.
          </p>
          <a
            href={waLink('Hola, vi tu página Emprende Salud y quiero información sobre los productos FuXion 😊')}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'hero' })}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5D70F] underline-offset-2 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            ¿Prefieres no dejar tus datos? Escríbeme directo por WhatsApp
          </a>
        </div>

        {/* Collage de producto */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
            <img
              src="/productos/pack-5-14-keto.png"
              alt="Pack 5/14 Keto FuXion"
              className="mx-auto w-full max-w-xs drop-shadow-2xl"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 w-28 rounded-2xl bg-white p-2 shadow-2xl md:-left-10 md:w-36">
            <img src="/productos/on.png" alt="ON FuXion" className="w-full" />
          </div>
          <div className="absolute -right-3 -top-6 w-24 rounded-2xl bg-white p-2 shadow-2xl md:-right-8 md:w-32">
            <img src="/productos/no-stress.png" alt="No Stress FuXion" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
