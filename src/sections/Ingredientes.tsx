import { useEffect, useRef } from 'react'

// Bento de ingredientes en video. Los nombres salen de los ingredientes del catálogo oficial.
const TILES = [
  { video: 'd1-salineras-maras', nombre: 'Sal de Maras', en: 'XTRA MILE', clase: 'md:col-span-2 md:row-span-2', color: '#FF8A1F' },
  { video: 'd2-coco-amazonico', nombre: 'Agua de coco amazónico', en: 'XTRA MILE · POST SPORT', clase: '', color: '#FF8A1F' },
  { video: 'd3-betarraga-sandia', nombre: 'Betarraga y sandía', en: 'PRE SPORT', clase: '', color: '#FF2E9A' },
  { video: 'd4-maiz-morado', nombre: 'Maíz morado', en: 'VITA XTRA T+', clase: 'md:col-span-2', color: '#B98CFF' },
]

function Tile({ t }: { t: (typeof TILES)[number] }) {
  const v = useRef<HTMLVideoElement>(null)
  // Solo reproduce cuando está en pantalla (ahorra datos en celular)
  useEffect(() => {
    const el = v.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <figure className={`revela group relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#0D1B2E] ${t.clase}`}>
      <video
        ref={v}
        src={`/videos/${t.video}.mp4`}
        poster={`/videos/${t.video}.jpg`}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: t.color }}>Va en {t.en}</p>
        <p className="font-display mt-1 text-3xl text-white md:text-4xl">{t.nombre}</p>
      </figcaption>
    </figure>
  )
}

export default function Ingredientes() {
  return (
    <section className="bg-[#07111F] pb-20 text-white md:pb-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="revela flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="text-[56px] md:text-[96px]">
            Ingredientes <span className="text-[#B5D70F]">que conoces</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/60 md:text-base">
            Nada raro: sal de Maras, agua de coco, betarraga, sandía y maíz morado, en un sobre que preparas en un minuto.
          </p>
        </div>
        <div className="mt-10 grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[240px]">
          {TILES.map((t) => (
            <Tile key={t.video} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
