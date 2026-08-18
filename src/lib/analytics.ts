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
