import { MessageCircle, ShoppingCart } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

// Barra fija inferior solo en celular: nuestro "Añadir al carrito" (patrón de las tiendas top).
export default function BarraMovil() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="flex gap-2">
        <a
          href="#encuentra"
          onClick={() => trackEvent('ViewContent', { content_name: 'barra-movil-plan' })}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#00498E] text-sm font-extrabold text-white"
        >
          <ShoppingCart className="h-4 w-4" /> Arma tu plan
        </a>
        <a
          href={waLink()}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent('Contact', { content_name: 'barra-movil' })}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-extrabold text-white"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  )
}
