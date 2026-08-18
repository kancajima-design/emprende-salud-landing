// Captura de UTM para saber qué anuncio trajo cada lead.
// Se leen de la URL al cargar y se guardan en sessionStorage.

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
const STORE_KEY = 'es_utm'

export function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const k of KEYS) {
      const v = params.get(k)
      if (v) found[k] = v.slice(0, 80)
    }
    if (Object.keys(found).length) {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(found))
    }
  } catch {
    // ignorar
  }
}

// Devuelve string compacto "fb / cpc / campaña-x / anuncio-3" o '' si no hay UTM
export function getUtmString(): string {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return ''
    const data = JSON.parse(raw) as Record<string, string>
    return KEYS.map((k) => data[k]).filter(Boolean).join(' / ').slice(0, 200)
  } catch {
    return ''
  }
}
