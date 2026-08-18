import { Zap, Leaf, Flame, HeartPulse } from 'lucide-react'

const items = [
  {
    icon: Zap,
    titulo: 'Energía sin bajones',
    texto: 'Olvida el cansancio de media tarde con bebidas funcionales que acompañan tu ritmo.',
  },
  {
    icon: Leaf,
    titulo: 'Digestión liviana',
    texto: 'Apoya tu tránsito y desinflama con ingredientes ancestrales como la maca y el camu-camu.',
  },
  {
    icon: Flame,
    titulo: 'Control de peso',
    texto: 'Programas detox y keto que complementan tus hábitos saludables, sin promesas mágicas.',
  },
  {
    icon: HeartPulse,
    titulo: 'Vitalidad y defensas',
    texto: 'Nutrición celular de alta biodisponibilidad para verte y sentirte mejor cada día.',
  },
]

export default function Benefits() {
  return (
    <section className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          Nutrición funcional que <span className="text-[#0094DE]">se siente</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#758E9B] md:text-base">
          FuXion fusiona ingredientes de los Andes y el Amazonas con biotecnología moderna, en
          sticks que se disuelven en agua. Sin pastillas, sin complicaciones.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#00498E]/5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0094DE]/10">
                <Icon className="h-6 w-6 text-[#0094DE]" />
              </div>
              <h3 className="mt-4 font-bold text-[#0B2033]">{titulo}</h3>
              <p className="mt-1.5 text-sm text-[#758E9B]">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
