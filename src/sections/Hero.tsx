import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, MessageCircle, Truck, ShieldCheck } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Los 3 momentos Sport: precio por vaso = caja de 28 sobres / 28 (tienda oficial, 31-10-2026)
const MOMENTOS = [
  {
    id: 'antes',
    etiqueta: 'Antes',
    nombre: 'PRE SPORT',
    img: '/productos/pre-sport.webp',
    color: '#E6007E',
    vaso: '5,11',
    nota: 'Citrulina de sandía, betarraga y hierba mate',
  },
  {
    id: 'durante',
    etiqueta: 'Durante',
    nombre: 'XTRA MILE',
    img: '/productos/xtra-mile.webp',
    color: '#F58220',
    vaso: '4,63',
    nota: 'Palatinose®, agua de coco y sal de Maras',
  },
  {
    id: 'despues',
    etiqueta: 'Después',
    nombre: 'POST SPORT',
    img: '/productos/post-sport.webp',
    color: '#D7263D',
    vaso: '5,11',
    nota: 'Aminoácidos, acerola, granada y agua de coco',
  },
]

const KIT_PRUEBA = 'https://tiendafuxion.com/storelt/emprendesalud/3200778'

// Posición de cada producto en el carrusel 3D según su distancia al activo
function pose(offset: number) {
  if (offset === 0) return 'translate3d(0,0,80px) rotateY(0deg) scale(1)'
  const lado = offset > 0 ? 1 : -1
  return `translate3d(${lado * 58}%, -8%, -160px) rotateY(${lado * -34}deg) scale(0.7)`
}

export default function Hero() {
  const [activo, setActivo] = useState(0)
  const [pausa, setPausa] = useState(false)
  const escena = useRef<HTMLDivElement>(null)

  // Rota sola cada 3,5 s; se detiene cuando la persona elige un momento
  useEffect(() => {
    if (pausa || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setActivo((a) => (a + 1) % MOMENTOS.length), 3500)
    return () => window.clearInterval(t)
  }, [pausa])

  // Inclinación 3D con el mouse (máx. 12°)
  function mover(e: React.PointerEvent) {
    const el = escena.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
  }
  function soltar() {
    escena.current?.style.setProperty('--rx', '0deg')
    escena.current?.style.setProperty('--ry', '0deg')
  }

  function elegir(i: number) {
    setActivo(i)
    setPausa(true)
  }

  const m = MOMENTOS[activo]

  return (
    <section className="relative overflow-hidden bg-[#06182B] pt-[100px] text-white">
      {/* Brillo del color del producto activo */}
      <div
        className="pointer-events-none absolute right-[-30%] top-[6%] h-[520px] w-[520px] rounded-full opacity-40 blur-[120px] transition-colors duration-700 md:right-[2%] md:h-[620px] md:w-[620px]"
        style={{ background: m.color }}
      />
      <div className="pointer-events-none absolute -left-32 bottom-[-20%] h-[420px] w-[420px] rounded-full bg-[#0D3D6E] opacity-70 blur-[100px]" />
      {/* Rejilla tenue */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-4 px-4 pb-16 pt-6 md:grid-cols-[1fr_1.1fr] md:gap-10 md:pb-24 md:pt-16">
        <div className="order-2 md:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B5D70F] ring-1 ring-white/15">
            Distribuidor oficial FuXion · Perú
          </span>
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Tu entrenamiento <span className="text-[#B5D70F]">en 3 vasos</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
            Antes, durante y después. Bebidas en polvo para correr, pedalear o entrenar en el gym,
            con envío a todo el Perú.
          </p>

          {/* Selector de momento */}
          <div className="mt-6 inline-flex rounded-full bg-white/5 p-1 ring-1 ring-white/10" role="tablist">
            {MOMENTOS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={i === activo}
                onClick={() => elegir(i)}
                className={`min-h-10 cursor-pointer rounded-full px-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors md:px-5 ${
                  i === activo ? 'text-white' : 'text-white/65 hover:text-white'
                }`}
                style={i === activo ? { background: x.color } : undefined}
              >
                {x.etiqueta}
              </button>
            ))}
          </div>
          <p key={m.id} className="hero-fade mt-3 min-h-[3rem] max-w-md text-sm leading-relaxed text-white/70">
            <strong className="text-white">{m.nombre}</strong> · {m.nota} ·{' '}
            <span className="font-extrabold text-white">S/ {m.vaso}</span> por vaso
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="#planes"
              onClick={() => trackEvent('ViewContent', { content_name: 'hero-planes' })}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#B5D70F] px-6 py-3.5 text-sm font-extrabold text-[#0B2033] shadow-xl shadow-lime-500/25 transition hover:brightness-105"
            >
              <ShoppingCart className="h-4 w-4" /> Ver planes y precios
            </a>
            <a
              href={waLink('Hola, vi tu página Emprende Salud y quiero armar mi plan Sport 🏃')}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'hero' })}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" /> Escríbeme por WhatsApp
            </a>
          </div>
          <a
            href={KIT_PRUEBA}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('ViewContent', { content_name: 'hero-kit-prueba' })}
            className="mt-4 inline-block text-sm font-semibold text-[#B5D70F] underline-offset-4 hover:underline"
          >
            ¿Primera vez? Prueba con el Kit Prueba Sport · S/ 76 →
          </a>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4" /> Envío a todo el Perú</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Tienda oficial FuXion</span>
          </div>
        </div>

        {/* Escena 3D */}
        <div
          ref={escena}
          onPointerMove={mover}
          onPointerLeave={soltar}
          className="hero-escena relative order-1 mx-auto aspect-[5/4] w-full max-w-xl md:order-2"
        >
          <div className="hero-giro absolute inset-0">
            {MOMENTOS.map((x, i) => {
              let off = i - activo
              if (off > 1) off -= MOMENTOS.length
              if (off < -1) off += MOMENTOS.length
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-label={`Ver ${x.nombre}`}
                  onClick={() => elegir(i)}
                  className="hero-tarjeta absolute inset-x-[6%] top-[14%] cursor-pointer"
                  style={{
                    transform: pose(off),
                    zIndex: off === 0 ? 3 : 1,
                    opacity: off === 0 ? 1 : 0.5,
                    filter: off === 0 ? `drop-shadow(0 30px 40px ${x.color}66)` : 'blur(1.5px) saturate(0.7)',
                  }}
                >
                  <img
                    src={x.img}
                    alt={x.nombre}
                    width={760}
                    height={460}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    className={`h-auto w-full ${off === 0 ? 'hero-flota' : ''}`}
                  />
                </button>
              )
            })}
          </div>
          {/* Sombra en el piso */}
          <div className="pointer-events-none absolute bottom-[10%] left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-xl" />
          {/* Chip del momento */}
          <div
            key={m.id}
            className="hero-fade absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-lg"
            style={{ background: m.color }}
          >
            {m.etiqueta} · {m.nombre}
          </div>
        </div>
      </div>
    </section>
  )
}
