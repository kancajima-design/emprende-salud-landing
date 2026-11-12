import { PRODUCTOS, type Producto } from '@/data/catalogo'

// Dirección de la página de un producto: /productos/<slug>
// "VITA XTRA T+" → "vita-xtra-t" · "CAFÉ & CAFÉ FIT" → "cafe-cafe-fit"
// (misma regla en server/seo.js: si cambias una, cambia la otra)
export const slugDe = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Solo tienen página propia los productos con ficha completa (ingredientes y modo de uso)
export const tienePagina = (p: Producto) => Boolean(p.ingredientes && p.uso)

export const productoPorSlug = (slug: string) => PRODUCTOS.find((p) => tienePagina(p) && slugDe(p.nombre) === slug)

export const rutaDe = (p: Producto) => `/productos/${slugDe(p.nombre)}`

// Precio más bajo del producto
export function precioDesde(p: Producto): string | null {
  if (!p.precios?.length) return null
  const valores = p.precios.map((x) => parseFloat(x.precio.replace(/[^\d.]/g, ''))).filter((n) => !isNaN(n))
  if (!valores.length) return null
  return `desde S/ ${Math.min(...valores).toFixed(2)}`
}

// Precio por vaso cuando la presentación dice cuántos sobres o sticks trae (ej. "Caja 28 sticks")
export function precioPorVaso(p: Producto): string | null {
  for (const pr of p.precios ?? []) {
    const n = pr.presentacion.match(/(\d+)\s*(sticks|sobres)/i)
    const v = parseFloat(pr.precio.replace(/[^\d.]/g, ''))
    if (n && !isNaN(v) && Number(n[1]) >= 7) return `S/ ${(v / Number(n[1])).toFixed(2).replace('.', ',')}`
  }
  return null
}

// Preguntas frecuentes de la página de producto. Salen solo de los datos del catálogo
// y de las reglas de compra de la web: no agregan promesas (misma lista en server/seo.js).
export function preguntasDe(p: Producto): { q: string; a: string }[] {
  const precios = (p.precios ?? []).map((x) => `${x.presentacion}: ${x.precio}`).join(' · ')
  return [
    { q: `¿Cómo se toma ${p.nombre}?`, a: p.uso ?? '' },
    { q: `¿Qué ingredientes tiene ${p.nombre}?`, a: p.ingredientes ?? '' },
    {
      q: `¿Cuánto cuesta ${p.nombre} en el Perú?`,
      a: `${precios}. Son precios de referencia en soles para el Perú; el precio vigente se confirma en la tienda oficial de FuXion al momento de comprar.`,
    },
    {
      q: `¿Cómo compro ${p.nombre} y cómo me llega?`,
      a: 'Con el botón «Comprar» se abre el carrito de la tienda oficial de FuXion, con Emprende Salud como patrocinador. Ahí te registras gratis como cliente, pagas y el pedido llega a tu domicilio en cualquier ciudad del Perú. El costo exacto del envío se ve antes de pagar.',
    },
    {
      q: `¿${p.nombre} es un medicamento?`,
      a: 'No. Es un producto de la línea de alimentos y bebidas de FuXion, que complementa una alimentación balanceada. Si estás embarazada, tomas medicación o tienes alguna condición de salud, consulta con tu médico antes de tomarlo.',
    },
  ].filter((x) => x.a)
}
