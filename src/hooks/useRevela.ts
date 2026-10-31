import { useEffect } from 'react'

// Agrega la clase "visible" a cada .revela cuando entra en pantalla (una sola vez)
export function useRevela() {
  useEffect(() => {
    const els = document.querySelectorAll('.revela:not(.visible)')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('visible'))
      return
    }
    const io = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('visible')
            io.unobserve(en.target)
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  })
}
