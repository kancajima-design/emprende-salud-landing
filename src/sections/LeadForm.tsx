import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { Download, Loader2, MessageCircle, CheckCircle2, Gift } from 'lucide-react'
import { BRAND, PRODUCTOS, OPCIONES_EXTRA, waLink } from '@/config'
import { trackEvent } from '@/lib/analytics'
import { getUtmString } from '@/lib/utm'

type Errors = Partial<Record<'nombre' | 'whatsapp' | 'correo' | 'producto', string>>

export default function LeadForm() {
  const [form, setForm] = useState({ nombre: '', whatsapp: '', correo: '', producto: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  // Precargar producto cuando el usuario viene desde la ficha de un producto
  useEffect(() => {
    const handler = (e: Event) => {
      const nombre = (e as CustomEvent<string>).detail
      if (nombre) setForm((f) => ({ ...f, producto: nombre }))
    }
    window.addEventListener('es:elegir-producto', handler)
    return () => window.removeEventListener('es:elegir-producto', handler)
  }, [])

  const set =
    (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setServerError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, origen: 'landing', utm: getUtmString() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors)
        else setServerError(data.error || 'Algo salió mal. Inténtalo de nuevo.')
        return
      }
      trackEvent('Lead', { content_name: form.producto })
      sessionStorage.setItem('es_lead_done', '1')
      setDone(true)
    } catch {
      setServerError('No se pudo conectar. Revisa tu internet e inténtalo otra vez.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (hasError?: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0B2033] outline-none transition placeholder:text-[#758E9B]/70 focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:ring-red-200'
        : 'border-[#00498E]/15 focus:border-[#0094DE] focus:ring-[#0094DE]/20'
    }`

  return (
    <section id="form" className="scroll-mt-28 bg-gradient-to-br from-[#00498E] to-[#0094DE] py-16 md:py-20">
      <div className="mx-auto max-w-xl px-4">
        <div className="rounded-3xl bg-white p-7 shadow-2xl md:p-9">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#B5D70F]" />
              <h2 className="mt-4 text-2xl font-extrabold text-[#00498E]">
                ¡Listo, {form.nombre.split(' ')[0]}! 🎉
              </h2>
              <p className="mt-2 text-sm text-[#758E9B]">
                Tu guía está lista. Descárgala y, si quieres, escríbeme por WhatsApp para asesorarte
                sobre <strong className="text-[#0B2033]">{form.producto}</strong>.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={BRAND.regalo.path}
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF7A1A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[#e66a10]"
                >
                  <Download className="h-4 w-4" /> Descargar mi guía (PDF)
                </a>
                <a
                  href={waLink(
                    `Hola, soy ${form.nombre}. Acabo de descargar la guía y me interesa: ${form.producto}`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('Contact', { content_name: form.producto })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:brightness-105"
                >
                  <MessageCircle className="h-4 w-4" /> Coordinar por WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#B5D70F]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7a08]">
                  <Gift className="h-3.5 w-3.5" /> Regalo gratis
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-[#00498E]">
                  Descarga tu {BRAND.regalo.titulo}
                </h2>
                <p className="mt-1.5 text-sm text-[#758E9B]">
                  Déjame tus datos y te la envío al instante. Te contacto por WhatsApp para
                  asesorarte sin compromiso.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0B2033]">
                    Nombre *
                  </label>
                  <input
                    className={inputCls(errors.nombre)}
                    placeholder="¿Cómo te llamas?"
                    value={form.nombre}
                    onChange={set('nombre')}
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0B2033]">
                    WhatsApp *
                  </label>
                  <input
                    className={inputCls(errors.whatsapp)}
                    placeholder="Ej: 987 654 321"
                    inputMode="tel"
                    value={form.whatsapp}
                    onChange={set('whatsapp')}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0B2033]">
                    Correo electrónico *
                  </label>
                  <input
                    className={inputCls(errors.correo)}
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={form.correo}
                    onChange={set('correo')}
                  />
                  {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0B2033]">
                    ¿Qué te interesa? *
                  </label>
                  <select
                    className={inputCls(errors.producto)}
                    value={form.producto}
                    onChange={set('producto')}
                  >
                    <option value="">Elige una opción…</option>
                    {OPCIONES_EXTRA.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                    {PRODUCTOS.map((p) => (
                      <option key={p.nombre} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.producto && (
                    <p className="mt-1 text-xs text-red-500">{errors.producto}</p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B5D70F] px-6 py-4 text-sm font-bold text-[#0B2033] shadow-lg shadow-lime-500/30 transition hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Quiero mi guía gratis
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] leading-relaxed text-[#758E9B]">
                  Al enviar aceptas ser contactado/a por WhatsApp o correo sobre productos FuXion.
                  Nunca comparto tus datos.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
