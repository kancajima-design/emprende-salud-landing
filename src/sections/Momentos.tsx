import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, MessageCircle, Clock } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Historia con scroll: el producto queda fijo y el fondo cambia de color en cada momento.
// Uso e ingredientes de src/data/catalogo.ts; precios de la tienda oficial (verificados 31-10-2026).
const MOMENTOS = [
  {
    n: '01',
    etiqueta: 'Antes',
    cuando: 'Antes de entrenar',
    nombre: 'PRE SPORT',
    frase: 'Llega con todo a tu entrenamiento.',
    img: '/productos/pre-sport.webp',
    color: '#FF2E9A',
    fondo: '#3A0A24',
    ingredientes: ['Citrulina de sandía', 'Betarraga', 'Hierba mate', 'Electrolitos'],
    vaso: '5,11',
    caja: 'S/ 143 · caja de 28 sobres',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2085997',
  },
  {
    n: '02',
    etiqueta: 'Durante',
    cuando: 'Desde el minuto 30–45 · 1 a 3 sobres',
    nombre: 'XTRA MILE',
    frase: 'Hidratación y energía para la milla extra.',
    img: '/productos/xtra-mile.webp',
    color: '#FF8A1F',
    fondo: '#3A1A05',
    ingredientes: ['Palatinose®', 'Agua de coco', 'Sal de Maras', 'Electrolitos'],
    vaso: '4,63',
    caja: 'S/ 129,50 · caja de 28 sobres',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2086024',
  },
  {
    n: '03',
    etiqueta: 'Después',
    cuando: 'Al terminar tu entrenamiento',
    nombre: 'POST SPORT',
    frase: 'Recupérate y vuelve mañana.',
    img: '/productos/post-sport.webp',
    color: '#FF3B4E',
    fondo: '#3A0910',
    ingredientes: ['BCAA', 'Glutamina', 'Acerola', 'Granada'],
    vaso: '5,11',
    caja: 'S/ 143 · caja de 28 sobres',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2085996',
  },
]
type M = (typeof MOMENTOS)[number]

function Botones({ m }: { m: M }) {
  return (
    <div className="flex gap-2">
      <a
        href={m.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('ViewContent', { content_name: m.nombre })}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[#062B57] transition hover:scale-[1.03]"
      >
        <ShoppingCart className="h-4 w-4" /> Comprar {m.nombre}
      </a>
      <a
        href={waLink(`Hola, quiero ${m.nombre} 😊`)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Pedir ${m.nombre} por WhatsApp`}
        onClick={() => trackEvent('Contact', { content_name: m.nombre })}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  )
}

function Detalle({ m }: { m: M }) {
  return (
    <>
      <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <Clock className="h-4 w-4" style={{ color: m.color }} /> {m.cuando}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {m.ingredientes.map((x) => (
          <li key={x} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
            {x}
          </li>
        ))}
      </ul>
      <p className="mt-6 leading-none">
        <span className="font-display text-6xl text-white">S/ {m.vaso}</span>{' '}
        <span className="text-sm font-semibold text-white/60">por vaso</span>
      </p>
      <p className="mt-2 text-xs text-white/50">{m.caja}</p>
    </>
  )
}

export default function Momentos() {
  const [activo, setActivo] = useState(0)
  const pasos = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (en) => en.forEach((e) => e.isIntersecting && setActivo(Number((e.target as HTMLElement).dataset.i))),
      { threshold: 0.5 },
    )
    pasos.current.forEach((p) => p && io.observe(p))
    return () => io.disconnect()
  }, [])

  const m = MOMENTOS[activo]

  return (
    <section id="momentos" className="scroll-mt-24 bg-[#062B57] text-white">
      {/* Escritorio: escena fija */}
      <div className="relative hidden md:block" style={{ height: `${MOMENTOS.length * 100}vh` }}>
        <div
          className="grano sticky top-0 h-screen overflow-hidden transition-colors duration-700"
          style={{ background: `radial-gradient(ellipse at 70% 50%, ${m.fondo} 0%, #062B57 70%)` }}
        >
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_1.1fr] items-center gap-10 px-8 pt-16">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Tu rutina en 3 vasos</p>
              <div key={m.n} className="hero-fade">
                <p className="font-display mt-6 text-[160px] leading-none text-white/[0.06]">{m.n}</p>
                <h2 className="-mt-20 text-[120px]" style={{ color: m.color }}>{m.etiqueta}</h2>
                <p className="mt-3 text-2xl font-extrabold">{m.nombre} <span className="font-semibold text-white/60">· {m.frase}</span></p>
                <div className="mt-5"><Detalle m={m} /></div>
                <div className="mt-7"><Botones m={m} /></div>
              </div>
            </div>
            <div className="relative h-[70vh]">
              <div className="absolute inset-[10%] rounded-full opacity-50 blur-[100px] transition-colors duration-700" style={{ background: m.color }} />
              {MOMENTOS.map((x, i) => (
                <img
                  key={x.nombre}
                  src={x.img}
                  alt={x.nombre}
                  loading="lazy"
                  className="absolute inset-0 m-auto w-full max-w-[640px] object-contain transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{
                    opacity: i === activo ? 1 : 0,
                    transform: `translateY(${(i - activo) * 30}%) scale(${i === activo ? 1 : 0.85}) rotate(${(i - activo) * -6}deg)`,
                    filter: 'drop-shadow(0 40px 50px rgba(0,0,0,0.6))',
                  }}
                />
              ))}
            </div>
          </div>
          {/* Progreso */}
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3">
            {MOMENTOS.map((x, i) => (
              <span key={x.n} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === activo ? 48 : 16, background: i === activo ? x.color : 'rgba(255,255,255,.25)' }} />
            ))}
          </div>
        </div>
        {/* Marcadores invisibles que deciden el momento activo */}
        <div className="absolute inset-0">
          {MOMENTOS.map((x, i) => (
            <div key={x.n} ref={(el) => { pasos.current[i] = el }} data-i={i} className="h-screen" />
          ))}
        </div>
      </div>

      {/* Celular: paneles de color a pantalla completa */}
      <div className="md:hidden">
        <div className="px-4 pt-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Tu rutina en 3 vasos</p>
          <h2 className="mt-3 text-[56px]">Un sobre para cada momento</h2>
        </div>
        {MOMENTOS.map((x) => (
          <div key={x.n} className="grano relative overflow-hidden px-4 pb-12 pt-10" style={{ background: `radial-gradient(ellipse at 50% 30%, ${x.fondo} 0%, #062B57 75%)` }}>
            <div className="revela">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-[72px] leading-none" style={{ color: x.color }}>{x.etiqueta}</h3>
                <span className="font-display text-5xl text-white/10">{x.n}</span>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-[15%] rounded-full opacity-50 blur-[60px]" style={{ background: x.color }} />
                <img src={x.img} alt={x.nombre} loading="lazy" className="relative w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
              </div>
              <p className="text-xl font-extrabold">{x.nombre}</p>
              <p className="mb-3 text-sm text-white/60">{x.frase}</p>
              <Detalle m={x} />
              <div className="mt-6"><Botones m={x} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Complemento: proteína */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="revela flex flex-col items-center gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:flex-row md:p-8">
          <img src="/productos/biopro-sport.webp" alt="BIOPRO+ SPORT" className="h-28 w-44 object-contain" loading="lazy" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#B98CFF]">+ Proteína</p>
            <p className="font-display mt-1 text-4xl">BIOPRO+ SPORT</p>
            <p className="mt-1 text-sm text-white/60">Más de 20 g de proteína por ración · caja de 14 S/ 132,50 · pote 2 lb S/ 259,50</p>
          </div>
          <a
            href="https://tiendafuxion.com/storelt/emprendesalud/2085965"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('ViewContent', { content_name: 'BIOPRO+ SPORT' })}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[#062B57] transition hover:scale-[1.03]"
          >
            <ShoppingCart className="h-4 w-4" /> Comprar caja
          </a>
        </div>
      </div>
    </section>
  )
}
