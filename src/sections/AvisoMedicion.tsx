import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

// Aviso de medición: el pixel de Meta y Microsoft Clarity solo se cargan si la persona acepta.
// La elección se guarda en localStorage («es_consent» = si / no). Se puede volver a abrir
// desde la política de privacidad con el evento «es:preferencias-medicion».
declare global {
  interface Window {
    __esCargarMedicion?: () => void
  }
}

function leer(): string | null {
  try {
    return localStorage.getItem('es_consent')
  } catch {
    return null
  }
}

function guardar(v: 'si' | 'no') {
  try {
    localStorage.setItem('es_consent', v)
  } catch {
    // sin almacenamiento: la elección vale solo para esta visita
  }
}

export default function AvisoMedicion() {
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (leer() === null) setAbierto(true)
    const abrir = () => setAbierto(true)
    window.addEventListener('es:preferencias-medicion', abrir)
    return () => window.removeEventListener('es:preferencias-medicion', abrir)
  }, [])

  if (!abierto || pathname.startsWith('/admin')) return null

  const aceptar = () => {
    guardar('si')
    window.__esCargarMedicion?.()
    setAbierto(false)
  }
  const rechazar = () => {
    const antes = leer()
    guardar('no')
    setAbierto(false)
    // si antes había aceptado, se recarga para que el pixel deje de funcionar en esta visita
    if (antes === 'si') window.location.reload()
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de medición"
      className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-md rounded-2xl border border-[#00498E]/15 bg-white p-4 text-left shadow-2xl sm:bottom-5 sm:left-5 sm:right-auto sm:mx-0"
    >
      <p className="text-sm leading-relaxed text-[#0B2033]">
        Uso el píxel de Meta y Microsoft Clarity para medir las visitas y mostrar anuncios más
        útiles. Solo los activo si aceptas.{' '}
        <a href="/empresa#privacidad" className="font-semibold text-[#00498E] underline">
          Más información
        </a>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={aceptar}
          className="flex-1 rounded-full bg-[#062B57] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
        >
          Aceptar
        </button>
        <button
          onClick={rechazar}
          className="flex-1 rounded-full border border-[#062B57]/25 px-4 py-2.5 text-sm font-bold text-[#062B57] transition hover:bg-[#F3F6FB]"
        >
          No, gracias
        </button>
      </div>
    </div>
  )
}
