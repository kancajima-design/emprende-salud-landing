import { Zap, Leaf, Flame, HeartPulse, ArrowRight } from 'lucide-react'

const items = [
  {
    icon: Zap,
    titulo: 'Energía para tu ritmo',
    texto: 'Bebidas con maca, guaraná, guayusa y otros ingredientes para acompañar tu día.',
  },
  {
    icon: Leaf,
    titulo: 'Fibra y probióticos',
    texto: 'Bebidas con inulina de achicoria, probióticos y frutas como la granadilla y el aguaymanto.',
  },
  {
    icon: Flame,
    titulo: 'Tu rutina Fit',
    texto: 'Cafés, tés y batidos con proteína para acompañar tu ejercicio y tu alimentación balanceada.',
  },
  {
    icon: HeartPulse,
    titulo: 'Vitaminas y minerales',
    texto: 'Bebidas con vitaminas, minerales y extractos de frutas para tu rutina de cada día.',
  },
]

export default function Benefits() {
  return (
    <section className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          Una bebida para cada <span className="text-[#0094DE]">momento</span> de tu día
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

        <div className="mt-10 text-center">
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-[#00498E] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110"
          >
            Ver productos para mi objetivo <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
