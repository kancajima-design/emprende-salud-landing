import { MessageCircle } from 'lucide-react'
import { waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'

export default function WhatsAppFloat() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbeme por WhatsApp"
      onClick={() => trackEvent('Contact', { content_name: 'botón flotante' })}
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-green-600/40 transition hover:scale-110"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative h-7 w-7 text-white" />
    </a>
  )
}
