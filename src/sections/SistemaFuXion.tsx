import { Droplets, Apple, BatteryCharging, ArrowRight } from 'lucide-react'

const pasos = [
  {
    n: '1',
    icon: Droplets,
    titulo: 'Limpieza y equilibrio',
    texto:
      'Todo empieza depurando: una digestión liviana y un cuerpo en equilibrio absorben mejor cada nutriente.',
    color: '#0094DE',
  },
  {
    n: '2',
    icon: Apple,
    titulo: 'Nutrir y regenerar',
    texto:
      'Cada día millones de células se renuevan: las proteínas de alto valor biológico son su materia prima.',
    color: '#B5D70F',
  },
  {
    n: '3',
    icon: BatteryCharging,
    titulo: 'Revitalización',
    texto:
      'Vitaminas, minerales y energizantes naturales para que tu energía y defensas se mantengan todos los días.',
    color: '#FF7A1A',
  },
]

export default function SistemaFuXion() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <span className="mx-auto block w-fit rounded-full bg-[#00498E]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00498E]">
          La metodología detrás de los productos
        </span>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          El Sistema FuXion: primero la base, luego tu objetivo
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#758E9B]">
          Basado en la metodología del <strong className="text-[#0B2033]">Dr. Iván Columbus</strong>,
          divulgador científico de FuXion: los productos no se toman al azar, siguen un orden
          inteligente.
        </p>

        {/* Los 3 pasos */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pasos.map(({ n, icon: Icon, titulo, texto, color }) => (
            <div
              key={n}
              className="relative rounded-2xl bg-[#F3F6FB] p-6 ring-1 ring-[#00498E]/5"
            >
              <span
                className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white"
                style={{ backgroundColor: color }}
              >
                {n}
              </span>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}1a` }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <h3 className="mt-4 font-bold text-[#0B2033]">{titulo}</h3>
              <p className="mt-1.5 text-sm text-[#758E9B]">{texto}</p>
            </div>
          ))}
        </div>

        {/* Base vs potenciadores */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-[#00498E] to-[#0094DE] p-7 text-white">
            <h3 className="text-lg font-extrabold">🧱 Sistema base — tu rutina diaria</h3>
            <p className="mt-2 text-sm text-white/85">
              Proteínas + vitaminas y minerales + fibra. Son los productos "no negociables": lo
              mínimo elemental para una vida saludable, todos los días.
            </p>
            <p className="mt-3 text-xs text-white/60">
              Ejemplos: batidos Biopro+/Protein Active · Vita Xtra T+ / Vitaenergía · Flora Liv /
              Liquid Fiber
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-[#F3F6FB] p-7 ring-1 ring-[#00498E]/5">
            <h3 className="text-lg font-extrabold text-[#0B2033]">
              🎯 Potenciadores — según tu objetivo
            </h3>
            <p className="mt-2 text-sm text-[#758E9B]">
              Una vez cubierta la base, eliges potenciadores de la línea que necesitas: control de
              peso, defensas, anti-edad, enfoque mental o sport.
            </p>
            <a
              href="#form"
              className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#B5D70F] px-5 py-2.5 text-xs font-bold text-[#0B2033] transition hover:brightness-105"
            >
              Descubre tu combinación ideal <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
