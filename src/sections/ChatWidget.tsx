import { useEffect, useRef, useState } from 'react'
import { MessageCircleMore, Sparkles, X, Send, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

type Msg = { role: 'user' | 'model'; text: string }

type Props = {
  saludoInicial?: string
  /** Clases de posición del botón/panel (default: esquina inferior izquierda) */
  clasePosicion?: string
}

const SUGERENCIAS = [
  '¿Qué producto me conviene para más energía?',
  '¿Cómo funciona lo de los puntos y el regalo?',
  '¿Cómo compro con precio de Cliente Preferente?',
]

const SALUDO: Msg = {
  role: 'model',
  text: '¡Hola! Soy Valeria, tu asesora de bienestar en Emprende Salud 💚 Cuéntame qué buscas (más energía, mejor digestión, control de peso) y te digo qué producto va contigo.',
}

// Convierte URLs del texto en enlaces clicables
function TextoConLinks({ text }: { text: string }) {
  const partes = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {partes.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline decoration-2 underline-offset-2"
          >
            {p.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function ChatWidget({
  saludoInicial,
  clasePosicion = 'bottom-5 left-5',
}: Props) {
  const saludo: Msg = { role: 'model', text: saludoInicial ?? SALUDO.text }
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Msg[]>([saludo])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const sessionId = useRef<string>(
    sessionStorage.getItem('chat-session') || crypto.randomUUID(),
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sessionStorage.setItem('chat-session', sessionId.current)
  }, [])

  /* Escuchar evento externo para abrir el chat (ej: botones CTA) */
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ saludo?: string }>
      if (custom.detail?.saludo) {
        setMensajes([{ role: 'model', text: custom.detail.saludo }])
      }
      setAbierto(true)
      trackEvent('Contact', { content_name: 'chat asistente Valeria' })
    }
    window.addEventListener('abrir-chat-valeria', handler)
    return () => window.removeEventListener('abrir-chat-valeria', handler)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, abierto])

  async function enviar(texto: string) {
    const textoLimpio = texto.trim()
    if (!textoLimpio || cargando) return

    const nuevos: Msg[] = [...mensajes, { role: 'user', text: textoLimpio }]
    setMensajes(nuevos)
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          messages: nuevos.slice(-12),
        }),
      })
      const data = await res.json()
      if (data?.reply) {
        setMensajes([...nuevos, { role: 'model', text: data.reply }])
      } else {
        setMensajes([
          ...nuevos,
          { role: 'model', text: data?.error || 'Ups, algo falló. Escríbeme por WhatsApp: +51 970 848 043' },
        ])
      }
    } catch {
      setMensajes([
        ...nuevos,
        { role: 'model', text: 'No pude conectar en este momento. Escríbeme por WhatsApp: +51 970 848 043 💚' },
      ])
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      {/* Botón flotante (izquierda; WhatsApp va a la derecha) */}
      {!abierto && (
        <button
          onClick={() => {
            setAbierto(true)
            trackEvent('Contact', { content_name: 'chat asistente Valeria' })
          }}
          aria-label="Abrir chat con la asistente Valeria"
          className={`fixed ${clasePosicion} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00498E] to-[#0094DE] shadow-2xl shadow-blue-900/40 transition hover:scale-110`}
        >
          <MessageCircleMore className="h-7 w-7 text-white" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A1A] text-[10px] font-bold text-white">
            IA
          </span>
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-[#25D366] ring-2 ring-white" />
        </button>
      )}

      {/* Panel del chat */}
      {abierto && (
        <div className={`fixed ${clasePosicion} z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-[#00498E]/15`}>
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#00498E] to-[#0094DE] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B5D70F]">
                <Sparkles className="h-5 w-5 text-[#0B2033]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Valeria · Asistente Emprende Salud</p>
                <p className="text-[11px] text-white/80">En línea · responde al toque</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-white/90 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F3F6FB] px-4 py-4">
            {mensajes.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-[#00498E] px-3.5 py-2.5 text-sm text-white'
                      : 'max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-[#0B2033] shadow-sm ring-1 ring-[#00498E]/10'
                  }
                >
                  <TextoConLinks text={m.text} />
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-[#758E9B] shadow-sm ring-1 ring-[#00498E]/10">
                  <Loader2 className="h-4 w-4 animate-spin" /> Escribiendo…
                </div>
              </div>
            )}
          </div>

          {/* Sugerencias (solo al inicio) */}
          {mensajes.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-[#00498E]/10 bg-white px-3 pt-3">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full bg-[#F3F6FB] px-3 py-1.5 text-xs font-semibold text-[#00498E] ring-1 ring-[#00498E]/15 transition hover:bg-[#B5D70F]/25"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              enviar(input)
            }}
            className="flex items-center gap-2 border-t border-[#00498E]/10 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              maxLength={500}
              className="flex-1 rounded-full bg-[#F3F6FB] px-4 py-2.5 text-sm text-[#0B2033] outline-none ring-1 ring-transparent transition focus:ring-[#0094DE]"
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              aria-label="Enviar mensaje"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF7A1A] text-white shadow-md transition hover:bg-[#e66a10] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
