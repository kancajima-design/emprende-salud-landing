import { useEffect, useState } from 'react'
import { Gift, X } from 'lucide-react'

// Popup de salida: se muestra UNA vez por sesión cuando el visitante
// intenta irse (desktop) o lleva 25s y bajó 60% de la página (móvil).
// No se muestra a quien ya se registró.
export default function ExitIntent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const yaVisto = sessionStorage.getItem('es_exit_shown')
    const yaRegistro = sessionStorage.getItem('es_lead_done')
    if (yaVisto || yaRegistro) return

    const disparar = () => {
      if (sessionStorage.getItem('es_exit_shown') || sessionStorage.getItem('es_lead_done')) return
      sessionStorage.setItem('es_exit_shown', '1')
      setShow(true)
    }

    // Desktop: el mouse sale por arriba de la ventana
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) disparar()
    }
    document.addEventListener('mouseout', onMouseOut)

    // Móvil: 25s + 60% de scroll
    let scrollOk = false
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= 0.6) scrollOk = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const timer = setTimeout(() => { if (scrollOk) disparar() }, 25000)

    return () => {
      document.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  const irAlForm = () => {
    setShow(false)
    document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B2033]/70 p-4 backdrop-blur-sm"
      onClick={() => setShow(false)}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#758E9B] transition hover:bg-[#F3F6FB]"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#B5D70F]/20">
          <Gift className="h-8 w-8 text-[#5f7a08]" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-[#00498E]">¡Espera! Antes de irte…</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#758E9B]">
          Llévate <strong className="text-[#0B2033]">gratis</strong> la Guía de Nutrición Funcional
          y descubre qué producto FuXion va con tu objetivo. Solo toma 30 segundos.
        </p>
        <button
          onClick={irAlForm}
          className="mt-6 w-full rounded-full bg-[#B5D70F] px-6 py-3.5 text-sm font-bold text-[#0B2033] shadow-lg shadow-lime-500/30 transition hover:brightness-105"
        >
          Sí, quiero mi guía gratis
        </button>
        <button
          onClick={() => setShow(false)}
          className="mt-3 text-xs text-[#758E9B] underline-offset-2 hover:underline"
        >
          No gracias, tal vez luego
        </button>
      </div>
    </div>
  )
}
