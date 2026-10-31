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
    a: 'Depende de tu deporte y de cuánto entrenas. Usa el buscador «¿Qué entrenas?» de esta página, escríbeme o pregúntale a Valeria, la asistente de la página: te recomiendo solo lo que necesitas.',
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
    <section id="preguntas" className="scroll-mt-24 bg-[#F3F6FB] py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="revela lg:sticky lg:top-32 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Preguntas frecuentes</p>
          <h2 className="mt-3 text-[56px] text-[#07111F] md:text-[88px]">
            Antes de tu <span className="text-[#0094DE]">primer pedido</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-[#4A6070] md:text-base">Lo que más me preguntan por WhatsApp.</p>
          <a
            href={waLink('Hola, tengo una duda antes de comprar 😊')}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'preguntas frecuentes' })}
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]"
          >
            <MessageCircle className="h-4 w-4" /> ¿Otra duda? Escríbeme
          </a>
        </div>
        <Accordion type="single" collapsible className="revela space-y-3">
          {preguntas.map((p, i) => (
            <AccordionItem
              key={p.q}
              value={`p${i}`}
              className="rounded-[22px] border-0 bg-white px-6 shadow-sm ring-1 ring-black/5 transition data-[state=open]:shadow-lg data-[state=open]:ring-[#0094DE]/30"
            >
              <AccordionTrigger className="py-5 text-left text-base font-extrabold text-[#07111F] hover:no-underline md:text-lg">
                {p.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-[#4A6070] md:text-base">{p.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
