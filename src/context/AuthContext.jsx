import { createContext, useContext, useEffect, useState } from 'react'
import { appendActivity, load, money, writeData } from '../data/appData'

const AuthContext = createContext(null)
const SESSION_TIMEOUT_MS = 8 * 60 * 1000

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null)
  const [data, setData] = useState(load)
  const [notice, setNotice] = useState('')
  const [databaseReady, setDatabaseReady] = useState(!import.meta.env.DEV)
  const syncDatabase = next => { if (!import.meta.env.DEV) return; fetch('/api/db', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then(response => { if (!response.ok) throw new Error('db.json no pudo guardarse') }).catch(() => setNotice('No se pudo guardar db.json; se mantiene la sesión en memoria.')) }
  const save = (next, event) => { const persisted = event ? appendActivity(next, event) : next; writeData(persisted); setData(persisted); syncDatabase(persisted) }
  const flash = text => { setNotice(text); window.setTimeout(() => setNotice(''), 2400) }
  const signIn = (profile, isNew = false) => { const current = { ...load(), session: { active: true, lastActivity: Date.now() } }; writeData(current); setAuth({ email: profile.email, name: profile.name, onboarding: isNew }); setData(current); syncDatabase(current) }
  const completeOnboarding = profile => { const next = appendActivity({ ...data, profile: { ...data.profile, ...profile, onboardingComplete: true } }, { type: 'onboarding', title: 'Configuraste tu punto de partida', detail: `Disponible ${money(profile.available)} · Plan mensual ${money(profile.income)}` }); writeData(next); setData(next); syncDatabase(next); setAuth(current => ({ ...current, name: profile.name || current.name, onboarding: false })) }
  const signOut = () => { const next = appendActivity({ ...data, session: { active: false, lastActivity: Date.now() } }, { type: 'session', title: 'Cerraste sesión', detail: 'Tu sesión temporal terminó.' }); writeData(next); setData(next); syncDatabase(next); setAuth(null) }
  useEffect(() => { if (!import.meta.env.DEV) { const current = load(); if (current.session.active && Date.now() - current.session.lastActivity < SESSION_TIMEOUT_MS && current.profile.email) setAuth({ email: current.profile.email, name: current.profile.name, onboarding: false }); else if (current.session.active) { const expired = { ...current, session: { active: false, lastActivity: current.session.lastActivity } }; writeData(expired); setData(expired) } return } fetch('/api/db').then(response => { if (!response.ok) throw new Error('db.json no pudo leerse'); return response.json() }).then(remote => { writeData(remote); const current = load(); setData(current); if (current.session.active && Date.now() - current.session.lastActivity < SESSION_TIMEOUT_MS && current.profile.email) setAuth({ email: current.profile.email, name: current.profile.name, onboarding: false }); else if (current.session.active) { const expired = { ...current, session: { active: false, lastActivity: current.session.lastActivity } }; writeData(expired); setData(expired); syncDatabase(expired) } }).catch(() => setNotice('No se pudo leer db.json; se usará una sesión temporal.')).finally(() => setDatabaseReady(true)) }, [])
  useEffect(() => { if (!auth) return undefined; let lastWrite = 0; const touch = () => { const now = Date.now(); if (now - lastWrite < 30000) return; lastWrite = now; const current = { ...load(), session: { active: true, lastActivity: now } }; writeData(current); setData(current); syncDatabase(current) }; const check = window.setInterval(() => { const current = load(); if (current.session.active && Date.now() - current.session.lastActivity >= SESSION_TIMEOUT_MS) { const expired = appendActivity({ ...current, session: { active: false, lastActivity: current.session.lastActivity } }, { type: 'session', title: 'Sesión cerrada por inactividad', detail: 'Pasaron 8 minutos sin interacción.' }); writeData(expired); setData(expired); syncDatabase(expired); setAuth(null) } }, 30000); window.addEventListener('pointerdown', touch); window.addEventListener('keydown', touch); return () => { window.clearInterval(check); window.removeEventListener('pointerdown', touch); window.removeEventListener('keydown', touch) } }, [auth])
  if (!databaseReady) return <div className="app-loading">Cargando tu espacio financiero…</div>
  return <AuthContext.Provider value={{ auth, data, save, flash, notice, signIn, completeOnboarding, signOut }}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export { AuthProvider, useAuth }
