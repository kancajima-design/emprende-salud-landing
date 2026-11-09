import { Link } from 'react-router'
import { waLink } from '@/config'

// Página para direcciones que no existen. El servidor la entrega con código 404
// para que Google no la confunda con la portada.
export default function NoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6FB] px-4">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0094DE]">Error 404</p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#062B57]">Esta página no existe</h1>
        <p className="mt-3 text-sm text-[#4A6070] md:text-base">
          Puede que el enlace esté incompleto o que la página haya cambiado de dirección.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/#catalogo"
            className="inline-flex min-h-12 items-center rounded-full bg-[#062B57] px-6 text-sm font-extrabold text-white transition hover:brightness-110"
          >
            Ver productos
          </Link>
          <a
            href={waLink('Hola, entré a un enlace de la página que no abre 😊')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-white transition hover:scale-[1.03]"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
