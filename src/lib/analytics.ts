// Helper de Meta Pixel — fbq se carga desde index.html
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function trackEvent(event: 'Lead' | 'Contact' | 'ViewContent', params?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params || {})
    }
  } catch {
    // nunca romper la UX por analítica
  }
}

// Evento estándar PageView (para navegación SPA entre rutas)
export function trackPageView() {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  } catch {
    // nunca romper la UX por analítica
  }
}

// Eventos personalizados (progreso de video, reproducción, etc.)
// Sirven para crear públicos de remarketing por % del VSL visto.
export function trackCustom(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, params || {})
    }
  } catch {
    // nunca romper la UX por analítica
  }
}
