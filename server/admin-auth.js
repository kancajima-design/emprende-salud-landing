// Clave de administración: solo por la cabecera x-admin-key, comparada en tiempo constante,
// sin clave por defecto (si falta ADMIN_KEY, el admin queda desactivado) y con límite de
// intentos fallidos por IP (10 cada 15 min).
import { timingSafeEqual, createHash } from 'node:crypto'

const ADMIN_KEY = process.env.ADMIN_KEY || ''
const fallos = new Map()
const VENTANA = 15 * 60 * 1000
const MAX_FALLOS = 10

const digest = (s) => createHash('sha256').update(String(s)).digest()

export function adminActivo() {
  return ADMIN_KEY.length > 0
}

/** Devuelve 'ok', 'bloqueado' o 'no'. */
export function revisarAdmin(req) {
  const ip = req.ip || 'unknown'
  const ahora = Date.now()
  const f = fallos.get(ip)
  if (f && ahora < f.reset && f.count >= MAX_FALLOS) return 'bloqueado'
  const key = req.headers['x-admin-key']
  const ok = adminActivo() && typeof key === 'string' && key.length > 0 && timingSafeEqual(digest(key), digest(ADMIN_KEY))
  if (ok) {
    fallos.delete(ip)
    return 'ok'
  }
  const e = f && ahora < f.reset ? f : { count: 0, reset: ahora + VENTANA }
  e.count += 1
  fallos.set(ip, e)
  return 'no'
}

export function requireAdmin(req, res, next) {
  const r = revisarAdmin(req)
  if (r === 'ok') return next()
  if (r === 'bloqueado') return res.status(429).json({ ok: false, error: 'Demasiados intentos. Espera unos minutos.' })
  return res.status(401).json({ ok: false, error: 'Clave de administrador incorrecta' })
}
