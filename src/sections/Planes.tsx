import { Gift, ShoppingCart, MessageCircle, RefreshCw, CheckCircle2, Star, Package } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { waLink } from '@/config'

// Combos Sport armados como PowerLinks en la oficina FuXion (26-10-2026).
// Puntos y precios de la tienda oficial; FuXion Rewards: 60 pts en autoenvío
// o 80 pts en compra normal = 1 producto de regalo de hasta 20 pts.
type Plan = {
  nombre: string
  para: string
  productos: { nombre: string; img: string; momento: string }[]
  puntos: number
  precio: string
  url: string
  regalo: 'compra' | 'autoenvio' | null
  destacado?: boolean
}

const PRE = { nombre: 'PRE SPORT', img: 'pre-sport.webp', momento: 'antes' }
const XTRA = { nombre: 'XTRA MILE', img: 'xtra-mile.webp', momento: 'durante' }
const POST = { nombre: 'POST SPORT', img: 'post-sport.webp', momento: 'después' }
const BIOPRO = { nombre: 'BIOPRO+ SPORT', img: 'biopro-sport.webp', momento: 'proteína, caja 14' }

const PLANES: Plan[] = [
  {
    nombre: 'Plan Full Sport',
    para: 'Para quien entrena en serio: hidratación, energía, recuperación y proteína.',
    productos: [PRE, XTRA, POST, BIOPRO],
    puntos: 84,
    precio: 'S/ 548.00',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/3193468',
    regalo: 'compra',
    destacado: true,
  },
  {
    nombre: 'Plan Fondista',
    para: 'Para correr o pedalear: antes, durante y después del entrenamiento.',
    productos: [PRE, XTRA, POST],
    puntos: 64,
    precio: 'S/ 415.50',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/3193466',
    regalo: 'autoenvio',
  },
  {
    nombre: 'Plan Gym',
    para: 'Para el gym: energía antes, recuperación después y proteína.',
    productos: [PRE, POST, BIOPRO],
    puntos: 64,
    precio: 'S/ 418.50',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/3193467',
    regalo: 'autoenvio',
  },
  {
    nombre: 'Plan Arranque',
    para: 'Para empezar: lo básico de antes y después de entrenar.',
    productos: [PRE, POST],
    puntos: 44,
    precio: 'S/ 286.00',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/3193469',
    regalo: null,
  },
]

const PASOS_AUTOENVIO = [
  'Compra tu plan con el botón: al pagar te registras gratis como Cliente Preferente.',
  'Entra a tu cuenta FuXion, a la sección Autoenvío.',
  'Elige otra vez los productos de tu plan, la fecha y cada cuánto te llega (cada 4 semanas = mensual).',
  'Registra tu tarjeta. Cada envío de 60 puntos o más incluye 1 producto de regalo.',
]

function RegaloEtiqueta({ plan }: { plan: Plan }) {
  if (plan.regalo === 'compra')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B5D70F] px-3 py-1 text-[11px] font-extrabold text-[#0B2033]">
        <Gift className="h-3.5 w-3.5" /> Regalo en esta misma compra
      </span>
    )
  if (plan.regalo === 'autoenvio')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00498E]/10 px-3 py-1 text-[11px] font-extrabold text-[#00498E]">
        <RefreshCw className="h-3.5 w-3.5" /> Regalo con autoenvío
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F6FB] px-3 py-1 text-[11px] font-bold text-[#758E9B]">
      <Package className="h-3.5 w-3.5" /> Sin regalo · para probar
    </span>
  )
}

function TarjetaPlan({ plan }: { plan: Plan }) {
  const d = plan.destacado
  return (
    <div
      className={
        d
          ? 'relative flex flex-col rounded-3xl bg-gradient-to-br from-[#00498E] to-[#0094DE] p-6 text-white shadow-2xl ring-4 ring-[#B5D70F]'
          : 'relative flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#00498E]/10'
      }
    >
      {d && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#FF7A1A] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
          <Star className="h-3.5 w-3.5" /> El más completo
        </span>
      )}
      <h3 className={`text-xl font-extrabold ${d ? 'text-white' : 'text-[#00498E]'}`}>{plan.nombre}</h3>
      <p className={`mt-1 text-xs ${d ? 'text-white/85' : 'text-[#758E9B]'}`}>{plan.para}</p>

      <div
        className="mt-4 grid gap-1 rounded-2xl bg-white/95 p-2"
        style={{ gridTemplateColumns: `repeat(${plan.productos.length}, minmax(0, 1fr))` }}
      >
        {plan.productos.map((p) => (
          <img
            key={p.nombre}
            src={`/productos/${p.img}`}
            alt={p.nombre}
            className="h-16 w-full object-contain"
            loading="lazy"
          />
        ))}
      </div>

      <ul className="mt-4 space-y-1.5">
        {plan.productos.map((p) => (
          <li key={p.nombre} className={`flex items-center gap-2 text-sm ${d ? 'text-white' : 'text-[#0B2033]'}`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${d ? 'text-[#B5D70F]' : 'text-[#0094DE]'}`} />
            <span>
              <strong>{p.nombre}</strong>{' '}
              <span className={d ? 'text-white/70' : 'text-[#758E9B]'}>· {p.momento}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <RegaloEtiqueta plan={plan} />
        <div className="mt-3 flex items-baseline justify-between">
          <p className={`text-2xl font-extrabold ${d ? 'text-white' : 'text-[#0B2033]'}`}>{plan.precio}</p>
          <p className={`text-xs font-bold ${d ? 'text-[#B5D70F]' : 'text-[#00498E]'}`}>{plan.puntos} puntos</p>
        </div>
        <a
          href={plan.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Comprar ${plan.nombre}`}
          onClick={() => trackEvent('ViewContent', { content_name: plan.nombre, content_type: 'plan' })}
          className={
            d
              ? 'mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#B5D70F] px-5 py-3 text-sm font-extrabold text-[#0B2033] shadow-lg transition hover:brightness-105'
              : 'mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#00498E] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110'
          }
        >
          <ShoppingCart className="h-4 w-4" /> Comprar este plan
        </a>
      </div>
    </div>
  )
}

export default function Planes() {
  return (
    <section id="planes" className="scroll-mt-28 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#B5D70F]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7a08]">
            <Gift className="h-3.5 w-3.5" /> Planes Sport con regalo
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-[#00498E] md:text-3xl">
            Tu entrenamiento completo en <span className="text-[#FF7A1A]">un solo carrito</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#758E9B] md:text-base">
            Elige tu plan, toca el botón y se abre el carrito de la tienda oficial FuXion con todo listo. Con{' '}
            <strong className="text-[#0B2033]">80 puntos en una compra</strong> o{' '}
            <strong className="text-[#0B2033]">60 puntos en autoenvío</strong>, FuXion te regala 1 producto de hasta
            20 puntos.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANES.map((p) => (
            <TarjetaPlan key={p.nombre} plan={p} />
          ))}
        </div>

        {/* Cómo funciona el regalo con autoenvío */}
        <div className="mt-10 grid gap-6 rounded-3xl bg-[#F3F6FB] p-6 md:grid-cols-[1fr_1.4fr] md:p-8">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00498E] to-[#0094DE] text-white shadow-md">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-[#00498E] md:text-xl">
              ¿Cómo activo el regalo con autoenvío?
            </h3>
            <p className="mt-2 text-sm text-[#758E9B]">
              El autoenvío es tu pedido automático: te llega a casa cada semana, cada 2 semanas o cada 4 semanas,
              como tú elijas, y se cobra solo a tu tarjeta. Se activa después de tu primera compra.
            </p>
            <a
              href={waLink('Hola, compré un Plan Sport y quiero ayuda para activar mi autoenvío 😊')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'ayuda autoenvío' })}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
            >
              <MessageCircle className="h-4 w-4" /> Te ayudo a activarlo por WhatsApp
            </a>
          </div>
          <ol className="space-y-3">
            {PASOS_AUTOENVIO.map((paso, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#00498E]/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B5D70F] text-sm font-extrabold text-[#0B2033]">
                  {i + 1}
                </span>
                <p className="text-sm text-[#0B2033]">{paso}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#758E9B]">
          Precios de referencia de la tienda oficial FuXion Perú; el precio final y el envío se confirman al pagar.
          El producto de regalo lo eliges de la lista que muestra la tienda.
        </p>
      </div>
    </section>
  )
}
