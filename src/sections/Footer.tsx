export default function Footer() {
  return (
    <footer className="bg-[#0B2033] py-10 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src="/brand/fuxion_wordmark_white.svg" alt="FuXion" className="h-5 w-auto opacity-80" />
          <p className="text-sm font-semibold">
            Emprende <span className="text-[#B5D70F]">Salud</span>
          </p>
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
