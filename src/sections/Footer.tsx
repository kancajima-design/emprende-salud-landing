import { MessageCircle, Instagram, Mail } from 'lucide-react'
import { waLink } from '@/config'

const NAVEGA = [
  { href: '#momentos', texto: 'Cómo funciona' },
  { href: '#encuentra', texto: 'Arma tu plan' },
  { href: '#planes', texto: 'Planes' },
  { href: '#catalogo', texto: 'Catálogo' },
  { href: '#preguntas', texto: 'Preguntas frecuentes' },
  { href: '/blog', texto: 'Blog' },
]
const LEGAL = [
  { href: '/empresa', texto: 'Información del negocio y términos' },
  { href: '/empresa#privacidad', texto: 'Política de privacidad' },
  { href: '/empresa#devoluciones', texto: 'Devoluciones' },
  { href: '/empresa#atencion', texto: 'Atención al cliente' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#062B57] pt-20 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-5 w-auto" />
              <span className="h-4 w-px bg-white/30" />
              <span className="text-sm font-bold">Emprende <span className="text-[#B5D70F]">Salud</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Nutrición deportiva FuXion con asesoría personal y envío a todo el Perú. Tienda 100 % virtual.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={waLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/emprendesalud" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-[#FF2E9A]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:kancajima@gmail.com" aria-label="Correo" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-[#0094DE]">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <nav>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Navega</p>
            <ul className="mt-4 space-y-2.5">
              {NAVEGA.map((n) => (
                <li key={n.href}><a href={n.href} className="text-sm text-white/75 transition hover:text-[#B5D70F]">{n.texto}</a></li>
              ))}
            </ul>
          </nav>
          <nav>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Legal</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((n) => (
                <li key={n.href}><a href={n.href} className="text-sm text-white/75 transition hover:text-[#B5D70F]">{n.texto}</a></li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Datos del negocio (requeridos por Meta y para la confianza del cliente) */}
        <div className="mt-12 grid gap-x-8 gap-y-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 text-xs leading-relaxed text-white/55 sm:grid-cols-2">
          <p><span className="font-semibold text-white/80">Nombre comercial:</span> EmprendeSalud (Emprende Salud)</p>
          <p><span className="font-semibold text-white/80">Titular:</span> Kervin Ancajima</p>
          <p><span className="font-semibold text-white/80">Domicilio fiscal:</span> Ca. Real 479, Catacaos, Piura, Perú · Tienda 100 % virtual, sin atención presencial</p>
          <p><span className="font-semibold text-white/80">Representado por:</span> Ancajima Taboada Kervin Andershon | RUC: 10466510454</p>
          <p><span className="font-semibold text-white/80">Actividad:</span> venta de nutrición funcional FuXion (alimentos y bebidas funcionales) y asesoría de bienestar</p>
          <p>
            <span className="font-semibold text-white/80">Contacto:</span>{' '}
            <a href="https://instagram.com/emprendesalud" className="underline hover:text-white" target="_blank" rel="noreferrer">Instagram @emprendesalud</a>
            {' · '}
            <a href="mailto:kancajima@gmail.com" className="underline hover:text-white">kancajima@gmail.com</a>
          </p>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/40">
          Emprende Salud es distribuidor independiente de FuXion Biotech. Este sitio pertenece a un distribuidor
          independiente y no es el sitio oficial de FuXion. Los productos FuXion no son medicamentos: son alimentos y
          bebidas funcionales que complementan un estilo de vida saludable; no están destinados a diagnosticar, tratar,
          curar ni prevenir enfermedades.
        </p>
      </div>

      {/* Marca gigante */}
      <p className="font-display pointer-events-none mt-12 select-none whitespace-nowrap text-center text-[13vw] leading-[0.8] text-white/[0.05]" aria-hidden="true">
        Emprende Salud
      </p>
      <p className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Emprende Salud · Catacaos, Piura, Perú · Hecho con 💚 en Perú
      </p>
    </footer>
  )
}
