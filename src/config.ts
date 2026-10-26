// ─────────────────────────────────────────────────────────────
// Configuración de marca · Emprende Salud (distribuidor FuXion)
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  nombre: 'Emprende Salud',

  // Tu número: código de país + número, solo dígitos
  // NÚMERO FIJO del negocio (línea Entel nueva, 24-ago-2026).
  // El 51925828656 sigue en revisión por suspensión; si se reactiva, evaluar migración.
  whatsapp: '51907793042',

  whatsappMsg:
    'Hola, vi tu página de Emprende Salud y quiero mi Guía Sport gratis 😊',

  // Enlace genérico de tu tienda (navbar, CTA final y productos sin enlace propio)
  compraUrl: 'http://ifuxion.com/emprendesalud',

  regalo: {
    titulo: 'Guía Sport: rinde más y recupérate mejor',
    descripcion:
      'Tu nutrición antes, durante y después de entrenar, para corredores, gym y ciclistas. 10 páginas pensadas para leer en el celular, en 10 minutos.',
    path: '/regalo.pdf',
  },
}

export function waLink(texto = BRAND.whatsappMsg) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(texto)}`
}

// Catálogo completo (44 productos) con beneficios, ingredientes,
// precios y enlaces de compra individuales — ver src/data/catalogo.ts
export { PRODUCTOS } from './data/catalogo'
export type { Producto } from './data/catalogo'

// Opciones extra para el formulario (no son productos de catálogo)
export const OPCIONES_EXTRA = [
  'Aún no sé, quiero asesoría',
]
