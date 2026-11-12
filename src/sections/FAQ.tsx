import { MessageCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'
import preguntasData from '@/data/preguntas.json'

// Respuestas a las dudas que más frenan la compra (sacadas de los chats reales de WhatsApp).
// Viven en src/data/preguntas.json: el servidor las usa también para los datos de Google (FAQPage).
const preguntas: { q: string; a: string }[] = preguntasData

export default function FAQ() {
  return (
    <section id="preguntas" className="scroll-mt-24 bg-[#F3F6FB] py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="revela lg:sticky lg:top-32 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Preguntas frecuentes</p>
          <h2 className="mt-3 text-[38px] text-[#062B57] md:text-[60px]">
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
              <AccordionTrigger className="py-5 text-left text-base font-extrabold text-[#062B57] hover:no-underline md:text-lg">
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
