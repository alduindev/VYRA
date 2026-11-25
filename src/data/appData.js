let runtimeData
const DATA_VERSION = 1
const SESSION_DATA_KEY = 'vyra-session-v1'

const seed = {
  profile: { id: '', createdAt: '', name: 'Alduin', email: '', income: 4874.65, available: 4874.65, fixed: 0, goal: 0, saved: 0, focus: 'Controlar mis gastos', focuses: ['Controlar mis gastos'], password: '', passwordHash: '', onboardingComplete: false },
  categories: [
    { id: 'food', name: 'Comida y cocina', budget: 550, flow: 'Elige si fue comida preparada, delivery o un ingrediente.', types: ['Menú', 'Delivery', 'Mostrito', 'Pollo', 'Carne', 'Arroz', 'Lentejas', 'Frejol', 'Azúcar', 'Fruta', 'Agua'] },
    { id: 'transport', name: 'Transporte', budget: 260, flow: 'Registra el medio de transporte y su costo real.', types: ['Bus', 'Taxi compartido', 'Taxi', 'Recarga de tarjeta'] },
    { id: 'home', name: 'Casa', budget: 300, flow: 'Registra compras o servicios necesarios para el hogar.', types: ['Lavandería', 'Papel higiénico', 'Limpieza', 'Víveres', 'Gas', 'Agua'] },
    { id: 'mingo', name: 'Mingo', budget: 220, flow: 'Registra alimento, arena, Churu o veterinario.', types: ['Alimento', 'Arena', 'Churu', 'Veterinario', 'Juguete'] },
    { id: 'social', name: 'Salidas y compañía', budget: 380, flow: 'Registra el gasto social y la movilidad asociada.', types: ['Mall', 'Restaurante', 'Cumpleaños', 'Regalo', 'Taxi', 'Cine'] },
    { id: 'personal', name: 'Gasto personal', budget: 900, flow: 'Registra el monto sin necesidad de detallar productos privados.', types: ['Compra personal', 'Cuidado personal', 'Otro'] },
    { id: 'fixed', name: 'Pagos obligatorios', budget: 1710, flow: 'Registra cada pago cuando se realice.', types: ['Alquiler', 'Internet', 'Celular', 'Banco', 'Netflix'] }
  ],
  expenses: [],
  activity: [],
  incomeSources: [],
  recurringPayments: [],
  monthlyClosures: [],
  session: { active: false, lastActivity: 0 }
}


const demoEvents = [
  { id: 'deposit', kind: 'deposit', title: 'Depósito recibido', detail: 'Disponible para ti', delta: 600, amount: '+S/ 600' },
  { id: 'chicken', kind: 'purchase', title: 'Compraste pollo', detail: 'Comida y cocina', delta: -18.5, amount: '−S/ 18.50' },
  { id: 'rice', kind: 'purchase', title: 'Compraste arroz', detail: 'Comida y cocina', delta: -12, amount: '−S/ 12.00' },
  { id: 'extra', kind: 'deposit', title: 'Ingreso por venta', detail: 'Ingreso extra', delta: 150, amount: '+S/ 150' },
  { id: 'taxi', kind: 'purchase', title: 'Pagaste un taxi', detail: 'Transporte', delta: -45, amount: '−S/ 45.00' },
  { id: 'coffee', kind: 'purchase', title: 'Compraste un café', detail: 'Salidas y compañía', delta: -8.5, amount: '−S/ 8.50' },
  { id: 'sand', kind: 'purchase', title: 'Compraste arena', detail: 'Mascota', delta: -22, amount: '−S/ 22.00' },
  { id: 'internet', kind: 'purchase', title: 'Pagaste internet', detail: 'Pagos obligatorios', delta: -65, amount: '−S/ 65.00' },
  { id: 'transfer', kind: 'deposit', title: 'Transferencia recibida', detail: 'Ingreso extra', delta: 250, amount: '+S/ 250' },
  { id: 'groceries', kind: 'purchase', title: 'Compraste víveres', detail: 'Casa', delta: -37.9, amount: '−S/ 37.90' },
  { id: 'movie', kind: 'purchase', title: 'Fuiste al cine', detail: 'Salidas y compañía', delta: -28.5, amount: '−S/ 28.50' },
  { id: 'phone', kind: 'purchase', title: 'Recargaste tu celular', detail: 'Pagos obligatorios', delta: -90, amount: '−S/ 90.00' },
  { id: 'refund', kind: 'deposit', title: 'Devolución recibida', detail: 'Disponible para ti', delta: 80, amount: '+S/ 80' },
  { id: 'fruit', kind: 'purchase', title: 'Compraste fruta', detail: 'Comida y cocina', delta: -15.5, amount: '−S/ 15.50' },
  { id: 'rent', kind: 'purchase', title: 'Pagaste alquiler', detail: 'Pagos obligatorios', delta: -120, amount: '−S/ 120' }
]


const focusOptions = [
  { id: 'Controlar mis gastos', title: 'Controlar mis gastos', detail: 'Entender a dónde se va mi dinero.', icon: 'list' },
  { id: 'Ahorrar cada mes', title: 'Ahorrar cada mes', detail: 'Separar dinero antes de gastarlo.', icon: 'wallet' },
  { id: 'Aumentar mis ingresos', title: 'Aumentar mis ingresos', detail: 'Crear espacio para ganar más.', icon: 'trend' },
  { id: 'Pagar mis deudas', title: 'Pagar mis deudas', detail: 'Ordenar mis compromisos pendientes.', icon: 'check' }
]

const paymentMethods = ['Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta']



const money = value => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0)
const dateTime = value => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const monthName = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date())
const localDateKey = value => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
const currentDateKey = localDateKey(new Date())
const passwordChecks = password => ({
  length: password.length >= 8 && password.length <= 16,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password)
})
const validPassword = password => Object.values(passwordChecks(password)).every(Boolean)
const hashPassword = async password => { const bytes = new TextEncoder().encode(password); const digest = await crypto.subtle.digest('SHA-256', bytes); return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('') }
const calculateLiveBudget = ({ available, spent, goal = 0, recurringRemaining = 0, daysRemaining = 1 }) => Math.max(0, (Number(available || 0) - Number(spent || 0) - Number(goal || 0) - Number(recurringRemaining || 0)) / Math.max(1, Number(daysRemaining || 1)))
const calculateRecurringRemaining = (payments, dayOfMonth) => (payments || []).filter(item => item.active !== false && Number(item.dueDay || 1) >= Number(dayOfMonth)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
const summarizeMonth = ({ income = 0, spent = 0, saved = 0 }) => ({ income: Number(income || 0), spent: Number(spent || 0), saved: Number(saved || 0), remaining: Number(income || 0) - Number(spent || 0) })
const appendActivity = (data, event) => ({ ...data, activity: [...(data.activity || []), { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...event }] })
const normalizeData = data => ({ ...seed, ...data, version: DATA_VERSION, profile: { ...seed.profile, ...data.profile }, session: { ...seed.session, ...data.session }, categories: Array.isArray(data.categories) && data.categories.length ? data.categories : seed.categories, activity: Array.isArray(data.activity) ? data.activity : [], incomeSources: Array.isArray(data.incomeSources) ? data.incomeSources : [], recurringPayments: Array.isArray(data.recurringPayments) ? data.recurringPayments : [], monthlyClosures: Array.isArray(data.monthlyClosures) ? data.monthlyClosures : [] })
const load = () => { if (!runtimeData) { let saved = null; if (!import.meta.env.DEV && typeof sessionStorage !== 'undefined') { try { saved = JSON.parse(sessionStorage.getItem(SESSION_DATA_KEY) || 'null') } catch { saved = null } } runtimeData = normalizeData(saved || JSON.parse(JSON.stringify(seed))) } return runtimeData }
const readData = () => load()
const writeData = next => { runtimeData = normalizeData(next); if (!import.meta.env.DEV && typeof sessionStorage !== 'undefined') sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(runtimeData)) }
function exportJson(data) {
  const payload = { schema: 'vyra.user.v1', version: DATA_VERSION, exportedAt: new Date().toISOString(), userId: data.profile.id || null, profile: { ...data.profile, password: undefined, passwordHash: undefined }, categories: data.categories, expenses: data.expenses, activity: data.activity || [], incomeSources: data.incomeSources || [], recurringPayments: data.recurringPayments || [], monthlyClosures: data.monthlyClosures || [] }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `vyra-respaldo-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
}
function normalizeImportedData(raw, current) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.categories) || !Array.isArray(raw.expenses)) throw new Error('Formato JSON inválido')
  return normalizeData({ ...raw, profile: { ...seed.profile, ...raw.profile, password: current.profile.password, passwordHash: current.profile.passwordHash } })
}
export { appendActivity, calculateLiveBudget, calculateRecurringRemaining, currentDateKey, dateTime, demoEvents, exportJson, focusOptions, hashPassword, localDateKey, load, money, monthName, normalizeImportedData, passwordChecks, paymentMethods, readData, seed, summarizeMonth, validPassword, writeData }
