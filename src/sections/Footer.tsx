export default function Footer() {
  return (
    <footer className="bg-[#0B2033] py-10 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-5 w-auto opacity-80" />
          <p className="text-sm font-semibold">
            Emprende <span className="text-[#B5D70F]">Salud</span>
          </p>
          <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-white/5 p-5 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#B5D70F]">
              Información del negocio
            </p>
            <div className="grid gap-2 text-xs leading-relaxed text-white/70 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-white/90">Nombre comercial:</span> EmprendeSalud (Emprende Salud)
              </p>
              <p>
                <span className="font-semibold text-white/90">Titular:</span> Kervin Ancajima
              </p>
              <p>
                <span className="font-semibold text-white/90">Dirección:</span> Jr. Real 479, Piura 20006, Perú
              </p>
              <p>
                <span className="font-semibold text-white/90">Actividad:</span> venta de nutrición
                funcional FuXion (alimentos y bebidas funcionales) y asesoría de bienestar
              </p>
              <p>
                <span className="font-semibold text-white/90">Tienda oficial:</span>{' '}
                <a href="http://ifuxion.com/emprendesalud" className="underline hover:text-white" target="_blank" rel="noreferrer">
                  ifuxion.com/emprendesalud
                </a>
              </p>
              <p>
                <span className="font-semibold text-white/90">Contacto:</span>{' '}
                <a href="https://instagram.com/emprendesalud" className="underline hover:text-white" target="_blank" rel="noreferrer">
                  Instagram @emprendesalud
                </a>
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-white/50">
            Emprende Salud es distribuidor independiente de FuXion Biotech. Este sitio pertenece a
            un distribuidor independiente y no es el sitio oficial de FuXion. Los productos FuXion
            no son medicamentos: son alimentos y bebidas funcionales que complementan un estilo de
            vida saludable; no están destinados a diagnosticar, tratar, curar ni prevenir
            enfermedades.
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Emprende Salud · Hecho con 💚 en Perú
          </p>
        </div>
      </div>
    </footer>
  )
}
