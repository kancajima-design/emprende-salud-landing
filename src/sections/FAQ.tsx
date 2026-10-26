import { MessageCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Respuestas a las dudas que más frenan la compra (sacadas de los chats reales de WhatsApp)
const preguntas = [
  {
    q: '¿Tienen tienda física o dónde los encuentro?',
    a: 'Somos una tienda 100 % virtual. Haces tu pedido en la tienda oficial de FuXion desde tu celular y te llega a tu casa, a cualquier parte del Perú.',
  },
  {
    q: '¿Cómo compro?',
    a: 'Tocas «Comprar» en el producto que te interesa y se abre la tienda oficial con tu producto listo. Te registras gratis como cliente, pagas de forma segura y esperas tu pedido. Si algo se traba, te ayudo por WhatsApp en el momento.',
  },
  {
    q: '¿Tengo que pagar algo por registrarme?',
    a: 'No. El registro como cliente preferente es gratis, toma unos 3 minutos y no te obliga a comprar todos los meses.',
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'Depende de tu ciudad. La tienda oficial te muestra el plazo y el costo de envío antes de pagar, y yo te ayudo a hacer el seguimiento.',
  },
  {
    q: '¿Cuál producto me conviene?',
    a: 'Depende de tu objetivo: energía, deporte, digestión, peso o defensas. Escríbeme o pregúntale a Valeria, la asistente de la página, y te recomiendo solo lo que necesitas, sin que compres de más.',
  },
  {
    q: '¿Son medicamentos? ¿Los puedo tomar si tengo una condición de salud?',
    a: 'No son medicamentos: son alimentos y bebidas funcionales que complementan una alimentación saludable. Si estás embarazada, tomas medicación o tienes alguna condición de salud, consúltalo antes con tu médico.',
  },
  {
    q: '¿Cómo recibo productos de regalo?',
    a: 'Como cliente preferente acumulas puntos: por cada 60 puntos en autoenvío mensual o cada 80 puntos en una compra directa, FuXion te regala un producto.',
  },
  {
    q: 'Vivo fuera del Perú, ¿puedo comprar?',
    a: 'Sí. La tienda oficial de FuXion atiende en varios países de Latinoamérica, Estados Unidos y España. Escríbeme y te paso el enlace para tu país; los precios cambian según el mercado.',
  },
]

export default function FAQ() {
  return (
    <section id="preguntas" className="bg-[#F3F6FB] py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-extrabold text-[#00498E] md:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#758E9B] md:text-base">
          Lo que más me preguntan antes de hacer su primer pedido.
        </p>
        <Accordion type="single" collapsible className="mt-8 rounded-2xl bg-white px-6 shadow-sm ring-1 ring-[#00498E]/5">
          {preguntas.map((p, i) => (
            <AccordionItem key={p.q} value={`p${i}`} className="border-[#00498E]/10">
              <AccordionTrigger className="text-sm font-bold text-[#0B2033] md:text-base">
                {p.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-[#758E9B]">
                {p.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 text-center">
          <a
            href={waLink('Hola, tengo una duda antes de comprar 😊')}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'preguntas frecuentes' })}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:brightness-105"
          >
            <MessageCircle className="h-4 w-4" /> ¿Otra duda? Escríbeme
          </a>
        </div>
      </div>
    </section>
  )
}
