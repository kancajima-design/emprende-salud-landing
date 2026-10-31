import { ShoppingCart, MessageCircle, Clock } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// "Cuándo se toma" como columna vertebral (Skratch / Precision / OX).
// Uso e ingredientes copiados de src/data/catalogo.ts; precios de la tienda oficial (31-10-2026).
const MOMENTOS = [
  {
    etiqueta: 'Antes',
    cuando: 'Antes de entrenar',
    nombre: 'PRE SPORT',
    img: '/productos/pre-sport.webp',
    color: '#E6007E',
    fondo: '#FDE6F2',
    ingredientes: ['Citrulina de sandía', 'Betarraga', 'Hierba mate', 'Electrolitos'],
    vaso: '5,11',
    caja: 'S/ 143 · caja de 28',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2085997',
  },
  {
    etiqueta: 'Durante',
    cuando: 'Desde el minuto 30–45 · 1 a 3 sobres',
    nombre: 'XTRA MILE',
    img: '/productos/xtra-mile.webp',
    color: '#F58220',
    fondo: '#FEF0E3',
    ingredientes: ['Palatinose®', 'Agua de coco', 'Sal de Maras', 'Electrolitos'],
    vaso: '4,63',
    caja: 'S/ 129,50 · caja de 28',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2086024',
  },
  {
    etiqueta: 'Después',
    cuando: 'Al terminar tu entrenamiento',
    nombre: 'POST SPORT',
    img: '/productos/post-sport.webp',
    color: '#D7263D',
    fondo: '#FBE7EA',
    ingredientes: ['BCAA', 'Glutamina', 'Acerola', 'Granada'],
    vaso: '5,11',
    caja: 'S/ 143 · caja de 28',
    url: 'https://tiendafuxion.com/storelt/emprendesalud/2085996',
  },
]

export default function Momentos() {
  return (
    <section id="momentos" className="scroll-mt-28 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0094DE]">Tu rutina en 3 vasos</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[#0B2033] md:text-[44px]">
          Un sobre para cada momento de tu entrenamiento
        </h2>

        {/* Línea de tiempo */}
        <div className="mt-8 hidden items-center gap-3 md:flex">
          {MOMENTOS.map((m, i) => (
            <div key={m.nombre} className="flex flex-1 items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: m.color }} />
              <span className="text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: m.color }}>{m.etiqueta}</span>
              {i < MOMENTOS.length - 1 && <span className="h-px flex-1 bg-[#0B2033]/15" />}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {MOMENTOS.map((m) => (
            <article key={m.nombre} className="flex flex-col overflow-hidden rounded-3xl ring-1 ring-black/5" style={{ background: m.fondo }}>
              <div className="relative px-5 pt-5">
                <span className="inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white" style={{ background: m.color }}>
                  {m.etiqueta}
                </span>
                <img
                  src={m.img}
                  alt={m.nombre}
                  width={760}
                  height={460}
                  loading="lazy"
                  className="mx-auto mt-3 h-40 w-full object-contain transition duration-500 hover:-translate-y-2 hover:scale-105"
                  style={{ filter: `drop-shadow(0 18px 24px ${m.color}40)` }}
                />
              </div>
              <div className="flex flex-1 flex-col rounded-t-3xl bg-white p-5">
                <h3 className="text-xl font-extrabold text-[#0B2033]">{m.nombre}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold" style={{ color: m.color }}>
                  <Clock className="h-4 w-4" /> {m.cuando}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {m.ingredientes.map((x) => (
                    <li key={x} className="rounded-full bg-[#F3F6FB] px-2.5 py-1 text-[11px] font-semibold text-[#4A6070]">{x}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <p className="leading-none">
                    <span className="text-3xl font-extrabold text-[#0B2033]">S/ {m.vaso}</span>{' '}
                    <span className="text-sm font-semibold text-[#758E9B]">por vaso</span>
                  </p>
                  <p className="mt-1 text-xs text-[#758E9B]">{m.caja}</p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('ViewContent', { content_name: m.nombre })}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0B2033] px-4 text-sm font-bold text-white transition hover:bg-[#00498E]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Comprar
                    </a>
                    <a
                      href={waLink(`Hola, quiero ${m.nombre} 😊`)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Pedir ${m.nombre} por WhatsApp`}
                      onClick={() => trackEvent('Contact', { content_name: m.nombre })}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-105"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Complemento: proteína */}
        <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl bg-[#F3F6FB] p-5 sm:flex-row">
          <img src="/productos/biopro-sport.webp" alt="BIOPRO+ SPORT" className="h-20 w-32 object-contain" loading="lazy" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A3FD0]">Complemento · proteína</p>
            <p className="text-lg font-extrabold text-[#0B2033]">BIOPRO+ SPORT</p>
            <p className="text-sm text-[#758E9B]">Más de 20 g de proteína por ración · caja de 14 S/ 132,50 · pote 2 lb S/ 259,50</p>
          </div>
          <a
            href="https://tiendafuxion.com/storelt/emprendesalud/2085965"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('ViewContent', { content_name: 'BIOPRO+ SPORT' })}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B2033] px-5 text-sm font-bold text-white transition hover:bg-[#00498E]"
          >
            <ShoppingCart className="h-4 w-4" /> Comprar caja
          </a>
        </div>
      </div>
    </section>
  )
}
