const TIENDA = 'http://ifuxion.com/emprendesalud'
const INSTAGRAM = 'https://instagram.com/emprendesalud'

const datos = [
  ['Nombre comercial', 'EmprendeSalud (Emprende Salud)'],
  ['Titular del negocio', 'Kervin Ancajima'],
  ['Identificación fiscal', '46651045'],
  ['Dirección fiscal', 'Jr. Real 479, Piura 20006, Perú'],
  ['Sitio web', 'https://www.emprendesalud.net'],
  ['Instagram (atención al cliente)', '@emprendesalud'],
  ['Tienda oficial de venta', 'ifuxion.com/emprendesalud'],
  ['Actividad comercial', 'Venta al por menor de alimentos y bebidas funcionales (nutrición funcional) de la marca FuXion, realizada 100% en línea a través de la tienda oficial.'],
]

const pasosCompra = [
  'Ingresa a la tienda oficial con nuestro enlace: aparece "Emprende Salud" como tu patrocinador.',
  'Elige tus productos y agréguelos al carrito.',
  'Regístrate como Cliente Preferente (gratis) para acumular puntos y obtener productos de regalo.',
  'Paga con tarjeta de crédito o débito, Yape, Plin u otras opciones que muestra la tienda al finalizar.',
  'Recibe tu pedido en la dirección que indiques — el envío lo gestiona la tienda oficial de FuXion.',
]

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-[#E2E8F0] py-10">
      <h2 className="mb-4 text-xl font-extrabold text-[#00498E]">{titulo}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#1E2A38]">{children}</div>
    </section>
  )
}

export default function Empresa() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#0B2033] py-12 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B5D70F]">
            Transparencia comercial
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Información del negocio</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Esta página describe claramente quiénes somos, qué vendemos, cómo comprar y cómo
            ejercer tus derechos como cliente, conforme a las políticas comerciales de Meta y
            la normativa de protección al consumidor de Perú.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2 text-xs">
            {[
              ['#identidad', 'Identidad'],
              ['#productos', 'Productos'],
              ['#comprar', 'Cómo comprar'],
              ['#envios', 'Envíos'],
              ['#devoluciones', 'Devoluciones'],
              ['#atencion', 'Atención al cliente'],
              ['#privacidad', 'Privacidad'],
              ['#aviso', 'Aviso legal'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:border-[#B5D70F] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <Seccion id="identidad" titulo="1. Identificación del negocio">
          <dl>
            {datos.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-[#F1F5F9] py-2 sm:grid-cols-3">
                <dt className="font-semibold text-[#00498E]">{k}</dt>
                <dd className="sm:col-span-2">{v}</dd>
              </div>
            ))}
          </dl>
          <p>
            EmprendeSalud es un <strong>distribuidor independiente de FuXion Biotech</strong>.
            Este sitio pertenece al distribuidor y no es el sitio corporativo de FuXion. Todas
            las compras se procesan en la tienda oficial de FuXion.
          </p>
        </Seccion>

        <Seccion id="productos" titulo="2. Qué vendemos">
          <p>
            Vendemos <strong>alimentos y bebidas funcionales</strong> de la marca FuXion:
            tés funcionales, bebidas a base de proteína láctea y vegetal, cafés funcionales,
            chocolates de alimentación funcional, fibras alimentarias y productos de apoyo
            para la cocina saludable.
          </p>
          <p className="rounded-lg bg-[#F3F6FB] p-4 font-semibold text-[#00498E]">
            Nuestros productos son alimentos y bebidas funcionales. NO son medicamentos ni
            productos sanitarios: no están destinados a diagnosticar, tratar, curar ni prevenir
            ninguna enfermedad. Si tienes una condición médica, consulta a tu médico antes de
            consumir cualquier producto.
          </p>
        </Seccion>

        <Seccion id="comprar" titulo="3. Cómo comprar">
          <ol className="list-decimal space-y-2 pl-5">
            {pasosCompra.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <p>
            <a href={TIENDA} className="font-semibold text-[#00498E] underline" target="_blank" rel="noreferrer">
              Ir a la tienda oficial →
            </a>
          </p>
        </Seccion>

        <Seccion id="envios" titulo="4. Envíos y entregas">
          <p>
            Los envíos los procesa y gestiona <strong>la tienda oficial de FuXion</strong> (no
            EmprendeSalud), con cobertura a nivel nacional en Perú. El costo y el tiempo de
            entrega se calculan al finalizar la compra según tu dirección. Recibirás la
            confirmación y el seguimiento de tu pedido por correo electrónico y/o WhatsApp
            desde la tienda oficial.
          </p>
        </Seccion>

        <Seccion id="devoluciones" titulo="5. Devoluciones, cambios y reclamos">
          <p>
            Las devoluciones y cambios se rigen por la política de la tienda oficial de FuXion,
            disponible en el proceso de compra. Si tu pedido llega con algún inconveniente
            (producto dañado, incompleto o distinto al pedido), contáctanos por Instagram
            (<a href={INSTAGRAM} className="font-semibold text-[#00498E] underline" target="_blank" rel="noreferrer">@emprendesalud</a>) dentro
            de las 48 horas posteriores a la recepción y te ayudamos a gestionar el cambio
            directamente con la tienda oficial.
          </p>
          <p>
            Como consumidor peruano también puedes acudir al{' '}
            <strong>Libro de Reclamaciones</strong> virtual de Indecopi:{' '}
            <a href="https://www.indecopi.gob.pe" className="underline" target="_blank" rel="noreferrer">
              www.indecopi.gob.pe
            </a>.
          </p>
        </Seccion>

        <Seccion id="atencion" titulo="6. Atención al cliente (siempre hay una persona real)">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Instagram:</strong>{' '}
              <a href={INSTAGRAM} className="underline" target="_blank" rel="noreferrer">@emprendesalud</a> — te responde
              Kervin, titular del negocio.
            </li>
            <li>
              <strong>WhatsApp:</strong> canal oficial de atención, activo en horario de 8:00 a
              21:00 (hora de Perú).
            </li>
            <li>
              <strong>Asistente virtual (Valeria):</strong> responde preguntas frecuentes al
              instante y, cuando lo necesitas, te deriva con una persona.
            </li>
            <li>
              <strong>Horario de atención humana:</strong> lunes a sábado, 8:00 – 21:00 (Perú).
            </li>
          </ul>
        </Seccion>

        <Seccion id="privacidad" titulo="7. Política de privacidad">
          <p><strong>Qué datos recopilamos:</strong> los que tú mismo nos das al escribirnos o
          completar formularios en este sitio (nombre, número de WhatsApp y, si lo indicas,
          correo electrónico).</p>
          <p><strong>Para qué los usamos:</strong> exclusivamente para atender tu consulta,
          procesar tu pedido, darte seguimiento de compra y enviarte información que hayas
          solicitado sobre nuestros productos.</p>
          <p><strong>Qué NO hacemos:</strong> no vendemos ni compartimos tus datos con terceros
          ajenos a la atención de tu pedido (la tienda oficial de FuXion procesa la compra con
          sus propios términos).</p>
          <p><strong>Tus derechos:</strong> puedes solicitar en cualquier momento la
          actualización o eliminación de tus datos escribiéndonos a Instagram
          (@emprendesalud) y lo atenderemos en un plazo máximo de 7 días hábiles.</p>
          <p><strong>Cookies y medición:</strong> este sitio usa herramientas de medición
          (como el píxel de Meta) para mejorar la experiencia de navegación y mostrar
          contenido relevante. Puedes desactivarlas desde la configuración de tu navegador.</p>
        </Seccion>

        <Seccion id="aviso" titulo="8. Aviso legal">
          <p className="text-xs text-[#5A6B7C]">
            EmprendeSalud © {new Date().getFullYear()} · Jr. Real 479, Piura 20006, Perú ·
            Distribuidor independiente de FuXion Biotech. Los productos mencionados son
            alimentos y bebidas funcionales y no sustituyen una alimentación variada y
            equilibrada ni la orientación de un profesional de la salud. Las promociones de
            puntos (QV) y regalos son gestionadas por FuXion según sus términos vigentes.
          </p>
        </Seccion>
      </main>
    </div>
  )
}
