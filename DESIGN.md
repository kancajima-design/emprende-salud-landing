# DESIGN.md · Emprende Salud

Reglas de diseño de emprendesalud.net. Cualquier sección nueva (o cambio hecho con Claude)
sigue este archivo. Referencia de estilo: marcas de bebidas deportivas (fondo oscuro, producto
grande e iluminado, color fuerte por sabor, letras gruesas, mucho aire).

## 1. Colores

| Token | Hex | Uso |
| --- | --- | --- |
| `navy-900` | `#06182B` | Fondo de secciones "escenario" (inicio, Sport) |
| `navy-700` | `#0D3D6E` | Brillo radial detrás del producto |
| `azul` | `#00498E` | Títulos sobre fondo claro, botones secundarios |
| `celeste` | `#0094DE` | Detalles, enlaces |
| `lima` | `#B5D70F` | Acento principal: palabra clave del título, botón principal, chips |
| `tinta` | `#0B2033` | Texto sobre fondo claro y sobre lima |
| `gris` | `#758E9B` | Texto secundario |
| `hielo` | `#F3F6FB` | Fondo de secciones claras |
| `naranja` | `#FF7A1A` | Solo botón "Comprar" |
| `whatsapp` | `#25D366` | Solo botones de WhatsApp |

Color por producto Sport (sale de su caja): PRE SPORT `#E6007E` · XTRA MILE `#F58220` ·
POST SPORT `#D7263D` · BIOPRO+ SPORT `#7A3FD0`.
Color por línea en tarjetas: Sistema Base `#0094DE` · Peso `#16A34A` · Defensas `#F59E0B` ·
Anti-edad `#E11D74` · Mental `#7C3AED` · Sport `#F58220`.

Regla: una sola palabra o frase en lima por título. Nunca texto lima sobre blanco.

## 2. Letras

- Familia: la del sitio (sans del sistema / Poppins si está cargada). Nada de letras decorativas.
- Títulos de escenario: 800 (extrabold), `tracking-tight`, 44–64 px en escritorio, 34–40 px en celular.
- Títulos de sección: 800, 28–36 px.
- Etiquetas (chips, "ANTES"): 700, mayúsculas, `tracking-[0.14em]`, 11–12 px.
- Cuerpo: 400–500, 15–17 px, interlineado 1.6, máximo 60 caracteres por línea.
- Precios: 800, número grande y la unidad chica ("S/ 4,63 por vaso").

## 3. Espacios

- Escala de 4 px. Secciones: 96 px arriba/abajo en escritorio, 64 px en celular.
- Margen lateral mínimo 16 px en celular. Ancho máximo de contenido 1152 px (`max-w-6xl`).
- Tarjetas: radio 24 px (`rounded-3xl`), relleno 20–24 px, separación 16–20 px.
- Botones: píldora (`rounded-full`), alto mínimo 48 px para el dedo.

## 4. Producto y profundidad ("3D")

- El producto siempre se muestra **grande**, recortado (PNG/WebP con transparencia), sobre fondo
  oscuro con un brillo radial del color del producto detrás.
- Profundidad con CSS 3D (`perspective` + `rotateY/rotateX` + `translateZ`), sin librerías pesadas.
  El elemento del frente reacciona al mouse (máx. 12°) y en celular flota solo.
- Sombras suaves de color, no grises: `drop-shadow` con el color del producto al 35–45 %.
- Movimiento: entradas de 400–700 ms con `cubic-bezier(.2,.8,.2,1)`. Nada que parpadee.
- Con `prefers-reduced-motion` todo queda quieto.

## 5. Contenido (reglas que no se rompen)

- Hablamos a quien entrena: correr, pedalear, gym, fútbol. Momento de uso: antes, durante, después.
- **Sin promesas de salud ni de peso.** Nada de "cura", "previene", "quema", "adelgaza".
- **Sin "negocio", "emprender", "oportunidad" ni "ganancias"** en contenido de venta.
- Precios y enlaces salen de `src/data/catalogo.ts` y `src/sections/Planes.tsx`; no se inventan.
- Cada pantalla tiene un solo botón principal (lima) y como máximo uno secundario.
