// Helper de Meta Pixel + Conversions API (mirror server-side con deduplicación).
// fbq se carga desde index.html. Cada evento genera un event_id que se envía
// tanto al pixel del navegador como a /api/capi; Meta los deduplica por ese id.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export type UserData = { email?: string; phone?: string; name?: string }

function readCookie(name: string): string {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : ''
  } catch {
    return ''
  }
}

// id único y corto por evento (deduplicación browser + server)
function newEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Envío en segundo plano al servidor (CAPI). Nunca rompe la UX.
function mirrorToCapi(
  eventName: string,
  eventId: string,
  params: Record<string, unknown>,
  userData?: UserData
) {
  try {
    const [first_name = '', ...rest] = (userData?.name || '').trim().split(/\s+/)
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        url: window.location.href.slice(0, 300),
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        user_data: userData
          ? {
              email: userData.email,
              phone: userData.phone,
              first_name,
              last_name: rest.join(' '),
            }
          : undefined,
        custom_data: params,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignorar
  }
}

export function trackEvent(
  event: 'Lead' | 'Contact' | 'ViewContent',
  params?: Record<string, unknown>,
  userData?: UserData
) {
  try {
    const eventId = newEventId()
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params || {}, { eventID: eventId })
    }
    mirrorToCapi(event, eventId, params || {}, userData)
  } catch {
    // nunca romper la UX por analítica
  }
}

// Evento estándar PageView (para navegación SPA entre rutas)
export function trackPageView() {
  try {
    const eventId = newEventId()
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView', {}, { eventID: eventId })
    }
    mirrorToCapi('PageView', eventId, {})
  } catch {
    // nunca romper la UX por analítica
  }
}

// Eventos personalizados (progreso de video, reproducción, etc.)
// Sirven para crear públicos de remarketing por % del VSL visto.
export function trackCustom(event: string, params?: Record<string, unknown>) {
  try {
    const eventId = newEventId()
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, params || {}, { eventID: eventId })
    }
    mirrorToCapi(event, eventId, params || {})
  } catch {
    // nunca romper la UX por analítica
  }
}
