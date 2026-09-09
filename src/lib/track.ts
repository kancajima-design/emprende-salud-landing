// Contador de visitas propio: registra cada página vista en el servidor
// (independiente del pixel de Meta). Nunca rompe la UX si falla.
import { getUtmString } from './utm'

export function trackVisit(path: string) {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        utm: getUtmString(),
        referrer: document.referrer.slice(0, 300),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignorar
  }
}
