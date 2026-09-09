import { useEffect, useRef, useState } from 'react'
import { BRAND, waLink } from '@/config'
import { trackCustom, trackEvent } from '@/lib/analytics'
import ChatWidget from '@/sections/ChatWidget'

const SALUDO_VSL =
  '¿Te quedó alguna duda del video? Pregúntame acá nomás 💚 Precios, la promo del regalo, cómo empezar… lo que sea.'

const MSG_VSL =
  'Hola, vi tu video de Emprende Salud y quiero empezar mi rutina de control de peso 💪'

// Segundo del video en el que aparece el CTA (el pitch/promo entra ~a partir de aquí)
const CTA_REVEAL_SECOND = 58

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2m0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.24-8.23 8.24m4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.24-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29" />
    </svg>
  )
}

export default function Vsl() {
  const [ctaVisible, setCtaVisible] = useState(false)
  const quartilesRef = useRef<Set<number>>(new Set())

  // ViewContent al entrar a la página del VSL
  useEffect(() => {
    trackEvent('ViewContent', { content_name: 'vsl-control-peso', content_type: 'video' })
  }, [])

  const handlePlay = () => {
    trackCustom('VslVideoPlay', { content_name: 'vsl-control-peso' })
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (!ctaVisible && video.currentTime >= CTA_REVEAL_SECOND) {
      setCtaVisible(true)
    }
    // Cuartiles del video (25/50/75/100%) → públicos de remarketing por avance
    if (video.duration > 0) {
      const pct = Math.floor((video.currentTime / video.duration) * 100)
      for (const q of [25, 50, 75, 95]) {
        if (pct >= q && !quartilesRef.current.has(q)) {
          quartilesRef.current.add(q)
          trackCustom('VslVideoProgress', { content_name: 'vsl-control-peso', percent: q })
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#044379] via-[#00498E] to-[#032F55] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-8 pb-28">
        {/* Logo */}
        <img
          src="/brand/emprende-salud-logo.png"
          alt="Emprende Salud"
          className="h-12 w-auto"
        />

        {/* Headline */}
        <h1 className="mt-6 text-center text-2xl font-extrabold leading-tight">
          El problema no eres tú.{' '}
          <span className="text-[#C0D72D]">Es el enfoque.</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/80">
          Mira este video de 90 segundos antes de intentar otra dieta.
        </p>

        {/* Video */}
        <div className="mt-6 w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
          <video
            className="aspect-[9/16] w-full bg-black"
            src="/videos/vsl-control-peso.mp4"
            poster="/videos/vsl-poster.jpg"
            controls
            playsInline
            preload="metadata"
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setCtaVisible(true)}
          />
        </div>

        {/* CTA: aparece al llegar al pitch del video */}
        {ctaVisible ? (
          <a
            href={waLink(MSG_VSL)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'vsl cta principal' })}
            className="mt-8 flex w-full animate-[fadeInUp_.5s_ease-out] items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            <WhatsAppIcon className="h-6 w-6 fill-current" />
            Quiero empezar · Escríbeme
          </a>
        ) : (
          <p className="mt-8 w-full rounded-2xl border border-dashed border-white/25 px-4 py-4 text-center text-sm text-white/60">
            👀 Al final del video te muestro cómo empezar…
          </p>
        )}

        {/* Promo cliente preferente */}
        <div className="mt-6 w-full rounded-2xl bg-white/10 p-4 text-center backdrop-blur">
          <p className="text-sm font-semibold text-[#C0D72D]">
            🎁 Promo cliente preferente
          </p>
          <p className="mt-1 text-sm text-white/85">
            Por cada <strong>60 puntos en autoenvío</strong> o{' '}
            <strong>80 puntos en compra directa</strong>, recibe un producto de
            regalo. Registro gratis.
          </p>
        </div>

        <p className="mt-8 text-xs text-white/50">
          © {new Date().getFullYear()} {BRAND.nombre} · Distribuidor independiente FuXion
        </p>
      </div>

      {/* Barra sticky móvil: aparece junto con el CTA */}
      {ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#032F55]/95 p-3 backdrop-blur">
          <a
            href={waLink(MSG_VSL)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'vsl barra sticky' })}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-lg active:scale-95"
          >
            <WhatsAppIcon className="h-5 w-5 fill-current" />
            Quiero empezar · Escríbeme
          </a>
        </div>
      )}

      {/* Asistente IA: aparece junto con el CTA para resolver objeciones */}
      {ctaVisible && (
        <ChatWidget saludoInicial={SALUDO_VSL} clasePosicion="bottom-24 left-5" />
      )}
    </div>
  )
}
