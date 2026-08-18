import { BookOpen, CheckCircle2 } from 'lucide-react'
import { BRAND } from '@/config'

const incluye = [
  'Qué es la nutrición funcional y por qué funciona distinto',
  'Mapa de productos FuXion según tu objetivo (energía, peso, digestión, defensas)',
  'Rutina diaria de 5 minutos con el ritual del stick',
  'Errores comunes al empezar y cómo evitarlos',
]

export default function Gift() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="rounded-3xl bg-gradient-to-br from-[#00498E] to-[#0094DE] p-8 text-white shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B5D70F]">
              <BookOpen className="h-7 w-7 text-[#0B2033]" />
            </div>
            <h3 className="mt-5 text-xl font-extrabold md:text-2xl">{BRAND.regalo.titulo}</h3>
            <p className="mt-2 text-sm text-white/85">{BRAND.regalo.descripcion}</p>
            <span className="mt-5 inline-block rounded-full bg-[#FF7A1A] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              100% gratis · PDF descargable
            </span>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-2xl font-extrabold text-[#00498E] md:text-3xl">
            Lo que recibes al dejar tus datos
          </h2>
          <ul className="mt-6 space-y-3.5">
            {incluye.map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#0B2033] md:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#B5D70F]" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-[#F3F6FB] p-4 text-sm text-[#758E9B]">
            Además, te contacto personalmente por WhatsApp para resolver tus dudas y recomendarte el
            producto ideal para ti. Sin compromiso.
          </p>
        </div>
      </div>
    </section>
  )
}
