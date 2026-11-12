// ─────────────────────────────────────────────────────────────
// Páginas de producto (/productos/<slug>) del lado del servidor.
// Lee el mismo catálogo que la web (src/data/catalogo.ts; Node 24 lo
// importa directo quitando los tipos) para que Google reciba la ficha
// ya escrita, y para listar las páginas en el sitemap.
// Las reglas de slug y de preguntas son las mismas de src/lib/producto.ts:
// si cambias una, cambia la otra.
// ─────────────────────────────────────────────────────────────
let PRODUCTOS = []
try {
  ;({ PRODUCTOS } = await import('../src/data/catalogo.ts'))
} catch (e) {
  console.warn('⚠️  No se pudo leer el catálogo para las páginas de producto:', e.message)
}

export const slugDe = (nombre) =>
  String(nombre)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Solo tienen página los productos con ficha completa
export const productosConPagina = PRODUCTOS.filter((p) => p.ingredientes && p.uso).map((p) => ({ ...p, slug: slugDe(p.nombre) }))

export const productoPorSlug = (slug) => productosConPagina.find((p) => p.slug === slug)

export function preguntasDe(p) {
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

// Precios como números (para los datos estructurados)
export const preciosNum = (p) =>
  (p.precios ?? []).map((x) => parseFloat(String(x.precio).replace(/[^\d.]/g, ''))).filter((n) => !isNaN(n))
