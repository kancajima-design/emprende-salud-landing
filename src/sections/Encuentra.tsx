import { useState } from 'react'
import { ShoppingCart, MessageCircle, RotateCcw } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Mini-buscador de 2 preguntas (patrón Huel / Nuun / Precision) que termina en carrito o WhatsApp.
type Deporte = 'correr' | 'bici' | 'gym' | 'futbol'
type Nivel = 'empiezo' | 'regular' | 'fuerte'

const DEPORTES: { id: Deporte; texto: string; emoji: string }[] = [
  { id: 'correr', texto: 'Correr', emoji: '🏃' },
  { id: 'bici', texto: 'Ciclismo', emoji: '🚴' },
  { id: 'gym', texto: 'Gym', emoji: '🏋️' },
  { id: 'futbol', texto: 'Fútbol / otro', emoji: '⚽' },
]
const NIVELES: { id: Nivel; texto: string }[] = [
  { id: 'empiezo', texto: 'Recién empiezo' },
  { id: 'regular', texto: '2 a 4 veces por semana' },
  { id: 'fuerte', texto: '5 o más / competencias' },
]

const RECOMENDACION = {
  kit: { nombre: 'Kit Prueba Sport', precio: 'S/ 76', detalle: '4 XPEED + VITA XTRA T+ caja de 7, para probar primero.', url: 'https://tiendafuxion.com/storelt/emprendesalud/3200778', imgs: ['xpeed', 'vita-xtra-t'] },
  arranque: { nombre: 'Plan Arranque', precio: 'S/ 286', detalle: 'PRE SPORT antes + POST SPORT después.', url: 'https://tiendafuxion.com/storelt/emprendesalud/3193469', imgs: ['pre-sport', 'post-sport'] },
  fondista: { nombre: 'Plan Fondista', precio: 'S/ 415,50', detalle: 'PRE SPORT + XTRA MILE + POST SPORT. Regalo con autoenvío.', url: 'https://tiendafuxion.com/storelt/emprendesalud/3193466', imgs: ['pre-sport', 'xtra-mile', 'post-sport'] },
  gym: { nombre: 'Plan Gym', precio: 'S/ 418,50', detalle: 'PRE SPORT + POST SPORT + BIOPRO+ SPORT. Regalo con autoenvío.', url: 'https://tiendafuxion.com/storelt/emprendesalud/3193467', imgs: ['pre-sport', 'post-sport', 'biopro-sport'] },
  full: { nombre: 'Plan Full Sport', precio: 'S/ 548', detalle: 'Los 4 productos. Regalo en esta misma compra.', url: 'https://tiendafuxion.com/storelt/emprendesalud/3193468', imgs: ['pre-sport', 'xtra-mile', 'post-sport', 'biopro-sport'] },
}

function recomendar(d: Deporte, n: Nivel) {
  if (n === 'empiezo') return RECOMENDACION.kit
  if (d === 'gym') return n === 'fuerte' ? RECOMENDACION.full : RECOMENDACION.gym
  if (d === 'futbol') return n === 'fuerte' ? RECOMENDACION.fondista : RECOMENDACION.arranque
  return n === 'fuerte' ? RECOMENDACION.full : RECOMENDACION.fondista
}

export default function Encuentra() {
  const [deporte, setDeporte] = useState<Deporte | null>(null)
  const [nivel, setNivel] = useState<Nivel | null>(null)
  const r = deporte && nivel ? recomendar(deporte, nivel) : null
  const opcion = (activo: boolean) =>
    `min-h-14 cursor-pointer rounded-2xl px-4 py-3 text-sm font-bold transition ${
      activo ? 'bg-[#B5D70F] text-[#07111F] shadow-[0_0_30px_rgba(181,215,15,0.35)]' : 'bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10'
    }`

  return (
    <section id="encuentra" className="grano relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-[#07111F] to-[#0B2A4A] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#0094DE] opacity-20 blur-[140px]" />
      <div className="relative mx-auto max-w-3xl px-4">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-[#B5D70F]">Arma tu plan en 30 segundos</p>
        <h2 className="mt-3 text-center text-[64px] md:text-[96px]">¿Qué entrenas?</h2>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {DEPORTES.map((d) => (
            <button key={d.id} type="button" onClick={() => setDeporte(d.id)} className={opcion(deporte === d.id)}>
              <span className="mr-1.5 text-lg">{d.emoji}</span>
              {d.texto}
            </button>
          ))}
        </div>

        {deporte && (
          <>
            <h3 className="font-display mt-10 text-center text-4xl">¿Cuánto entrenas?</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {NIVELES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setNivel(n.id)
                    trackEvent('ViewContent', { content_name: `buscador-${deporte}-${n.id}` })
                  }}
                  className={opcion(nivel === n.id)}
                >
                  {n.texto}
                </button>
              ))}
            </div>
          </>
        )}

        {r && (
          <div style={{ ["--relleno" as string]: "#fff" }} className="hero-fade borde-vivo mt-10 rounded-[28px] p-5 text-[#0B2033] shadow-2xl md:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0094DE]">Te recomiendo</p>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex shrink-0 justify-center gap-1">
                {r.imgs.map((i) => (
                  <img key={i} src={`/productos/${i}.webp`} alt="" className="h-16 w-20 object-contain" loading="lazy" />
                ))}
              </div>
              <div className="flex-1">
                <p className="font-display text-4xl text-[#0B2033]">
                  {r.nombre} · <span className="text-[#00498E]">{r.precio}</span>
                </p>
                <p className="mt-1 text-sm text-[#758E9B]">{r.detalle}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('ViewContent', { content_name: r.nombre, content_type: 'plan' })}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#00498E] px-5 text-sm font-extrabold text-white transition hover:bg-[#003d7a]"
              >
                <ShoppingCart className="h-4 w-4" /> Comprar {r.nombre}
              </a>
              <a
                href={waLink(`Hola, el buscador de tu página me recomendó el ${r.nombre}. ¿Me ayudas? 😊`)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('Contact', { content_name: `buscador ${r.nombre}` })}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-bold text-white transition hover:brightness-105"
              >
                <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeporte(null)
                setNivel(null)
              }}
              className="mx-auto mt-3 flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#758E9B] hover:text-[#00498E]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Empezar de nuevo
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
