import { useCallback, useEffect, useState } from 'react'
import {
  Lock,
  Users,
  CalendarDays,
  Trophy,
  Download,
  RefreshCw,
  LogOut,
  Trash2,
  MessageCircle,
  Loader2,
} from 'lucide-react'

type Lead = {
  id: number
  nombre: string
  whatsapp: string
  correo: string
  producto: string
  origen: string
  created_at: string
}

type Stats = {
  total: number
  porProducto: { producto: string; total: number }[]
  porDia: { dia: string; total: number }[]
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('es_admin_key') || '')
  const [input, setInput] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    async (k: string) => {
      setLoading(true)
      setError('')
      try {
        const [r1, r2] = await Promise.all([
          fetch(`/api/leads?key=${encodeURIComponent(k)}`),
          fetch(`/api/stats?key=${encodeURIComponent(k)}`),
        ])
        if (r1.status === 401 || r2.status === 401) {
          setError('Clave incorrecta')
          sessionStorage.removeItem('es_admin_key')
          setKey('')
          return
        }
        const d1 = await r1.json()
        const d2 = await r2.json()
        setLeads(d1.leads || [])
        setStats(d2)
        setKey(k)
        sessionStorage.setItem('es_admin_key', k)
      } catch {
        setError('No se pudo conectar con el servidor')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (key) load(key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function remove(id: number) {
    await fetch(`/api/leads/${id}?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
    load(key)
  }

  function logout() {
    sessionStorage.removeItem('es_admin_key')
    setKey('')
    setLeads([])
    setStats(null)
  }

  // ── Pantalla de acceso ──
  if (!key) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6FB] px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00498E]">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-center text-xl font-extrabold text-[#00498E]">
            Panel de prospectos
          </h1>
          <p className="mt-1 text-center text-sm text-[#758E9B]">
            Emprende Salud · acceso privado
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              load(input)
            }}
            className="mt-6 space-y-3"
          >
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Clave de administrador"
              className="w-full rounded-xl border border-[#00498E]/15 px-4 py-3 text-sm outline-none focus:border-[#0094DE] focus:ring-2 focus:ring-[#0094DE]/20"
            />
            {error && <p className="text-center text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !input}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00498E] py-3 text-sm font-bold text-white transition hover:bg-[#0094DE] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
            </button>
          </form>
          <a href="/" className="mt-4 block text-center text-xs text-[#758E9B] hover:underline">
            ← Volver a la landing
          </a>
        </div>
      </div>
    )
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const leadsHoy = stats?.porDia.find((d) => d.dia === hoy)?.total ?? 0
  const top = stats?.porProducto[0]

  // ── Panel ──
  return (
    <div className="min-h-screen bg-[#F3F6FB]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/brand/fuxion_x_icon_navy.svg" alt="" className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-extrabold text-[#00498E]">Panel de prospectos</h1>
              <p className="text-xs text-[#758E9B]">Emprende Salud · captura de leads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(key)}
              className="flex items-center gap-1.5 rounded-full border border-[#00498E]/20 px-3.5 py-2 text-xs font-semibold text-[#00498E] transition hover:bg-[#F3F6FB]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </button>
            <a
              href={`/api/leads/export?key=${encodeURIComponent(key)}`}
              className="flex items-center gap-1.5 rounded-full bg-[#B5D70F] px-3.5 py-2 text-xs font-bold text-[#0B2033] transition hover:brightness-105"
            >
              <Download className="h-3.5 w-3.5" /> Exportar a Excel (CSV)
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-[#758E9B] transition hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#00498E]/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0094DE]/10">
                <Users className="h-5 w-5 text-[#0094DE]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0B2033]">{stats?.total ?? '—'}</p>
                <p className="text-xs text-[#758E9B]">Prospectos totales</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#00498E]/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5D70F]/15">
                <CalendarDays className="h-5 w-5 text-[#5f7a08]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0B2033]">{leadsHoy}</p>
                <p className="text-xs text-[#758E9B]">Captados hoy</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#00498E]/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7A1A]/10">
                <Trophy className="h-5 w-5 text-[#FF7A1A]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#0B2033]">
                  {top ? top.producto : '—'}
                </p>
                <p className="text-xs text-[#758E9B]">
                  Producto más pedido{top ? ` (${top.total})` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#00498E]/5">
          {loading && leads.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#758E9B]">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : leads.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#758E9B]">
              Aún no hay prospectos. Comparte tu landing y empieza a captar 🚀
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-[#F3F6FB] text-xs uppercase tracking-wide text-[#758E9B]">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Producto de interés</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-[#F3F6FB]/60">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#758E9B]">
                        {l.created_at}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0B2033]">{l.nombre}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#25D366] hover:underline"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> {l.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-[#0B2033]">{l.correo}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#0094DE]/10 px-2.5 py-1 text-xs font-medium text-[#00498E]">
                          {l.producto}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => remove(l.id)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-[#758E9B] transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
