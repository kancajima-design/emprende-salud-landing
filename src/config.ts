// ─────────────────────────────────────────────────────────────
// Configuración de marca · Emprende Salud (distribuidor FuXion)
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  nombre: 'Emprende Salud',

  // Tu número: código de país + número, solo dígitos
  whatsapp: '51925828656',

  whatsappMsg:
    'Hola, vi tu página de Emprende Salud y quiero mi Guía de Nutrición Funcional 😊',

  // Enlace genérico de tu tienda (navbar, CTA final y productos sin enlace propio)
  compraUrl: 'http://ifuxion.com/emprendesalud',

  regalo: {
    titulo: 'Guía de Nutrición Funcional',
    descripcion:
      'Aprende cómo funcionan las bebidas funcionales FuXion, qué producto va con tu objetivo y cómo armar tu rutina de bienestar en 5 minutos al día.',
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
  'Oportunidad de negocio FuXion',
]
