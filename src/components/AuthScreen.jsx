import { useState } from 'react'
import { appendActivity, focusOptions, hashPassword, money, passwordChecks, readData, validPassword, writeData } from '../data/appData'
import { Brand } from './Brand'
import { GrowthSimulation } from './GrowthSimulation'
import { Icon } from './Icon'
import { PasswordRule } from './PasswordRule'

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [registerStep, setRegisterStep] = useState(1)
  const [form, setForm] = useState({ name: '', age: '', available: '', income: '', fixed: '', goal: '', focuses: [], email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  const update = event => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async event => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email || !email.includes('@')) return setMessage('Escribe un correo válido.')
    if (mode === 'recovery') {
      if (!validPassword(form.password)) return setMessage('Completa todos los requisitos de seguridad.')
      const current = readData()
      if (current.profile.email && current.profile.email !== email) return setMessage('No encontramos una cuenta con ese correo en este navegador.')
      const profile = { ...current.profile, email, password: '', passwordHash: await hashPassword(form.password) }
      writeData(appendActivity({ ...current, profile }, { type: 'security', title: 'Actualizaste tu contraseña', detail: 'Tu contraseña local fue reemplazada.' })); onAuthenticated(profile); return
    }
    if (mode === 'register') return
    const current = readData()
    if (!current.profile.email) return setMessage('No hay una cuenta en esta sesión. Restaura tu JSON o regístrate nuevamente.')
    const passwordHash = await hashPassword(form.password)
    if (current.profile.email !== email || (current.profile.passwordHash ? current.profile.passwordHash !== passwordHash : current.profile.password !== form.password)) return setMessage('Correo o contraseña incorrectos.')
    writeData(appendActivity(current, { type: 'session', title: 'Iniciaste sesión', detail: 'Entraste a tu espacio financiero.' })); onAuthenticated(current.profile)
  }

  const completeRegistration = async values => { const registrationEmail = values.email.trim().toLowerCase(); const current = readData(); const profile = { ...current.profile, id: crypto.randomUUID(), createdAt: new Date().toISOString(), name: values.name.trim(), age: Number(values.age) || 0, email: registrationEmail, password: '', passwordHash: await hashPassword(values.password), available: Number(values.available) || 0, income: Number(values.income) || 0, fixed: Number(values.fixed) || 0, goal: Number(values.goal) || 0, saved: 0, focuses: values.focuses, focus: values.focuses[0], onboardingComplete: true }; let next = appendActivity({ ...current, profile }, { type: 'account', title: 'Creaste tu cuenta', detail: `Registro local con ${registrationEmail}.` }); next = appendActivity(next, { type: 'onboarding', title: 'Configuraste tu punto de partida', detail: `Disponible ${money(profile.available)} · Ingreso mensual ${money(profile.income)}.` }); writeData(next); onAuthenticated(profile, false) }
  const setAuthMode = nextMode => { setMode(nextMode); setRegisterStep(1); setMessage(''); setForm({ name: '', age: '', available: '', income: '', fixed: '', goal: '', focuses: [], email: '', password: '', confirm: '' }) }
  const title = mode === 'login' ? 'Bienvenido de nuevo' : mode === 'register' ? 'Crea tu espacio financiero' : 'Recupera tu acceso'
  const subtitle = mode === 'login' ? 'Organiza tu dinero con claridad, sin complicarte.' : mode === 'register' ? 'Configura tu punto de partida antes de entrar.' : 'Te ayudamos a volver a entrar en tu cuenta local.'

  return <div className="auth-shell">
    <div className="auth-visual">
      <div className="auth-visual-top"><Brand light /></div>
      <div className="auth-visual-content">
        <p className="eyebrow">Controla. Ahorra. Crece.</p>
        <h1>Haz que tu dinero <em>crezca contigo.</em></h1>
        <p className="auth-copy">Cada decisión cuenta: conoce tus gastos, protege lo que ganas y convierte tus hábitos en progreso real.</p>
        <GrowthSimulation /><p className="visual-card-note">A veces ahorras. A veces gastas. Lo importante es saber qué pasó.</p>
      </div>
      <p className="auth-visual-footer">Responsabilidad hoy. Tranquilidad mañana.</p>
    </div>
    <main className="auth-panel">
      <div className="auth-mobile-brand"><Brand /></div>
      <div className="auth-form-wrap">
        <div className="auth-heading"><span className="auth-kicker">{mode === 'login' ? 'Panel personal' : mode === 'register' ? `Paso ${registerStep} de 5` : 'Recuperación'}</span><h2>{title}</h2><p>{subtitle}</p></div>
        <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Iniciar sesión</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Crear cuenta</button></div>
        {mode === 'register' ? <RegisterWizard step={registerStep} setStep={setRegisterStep} form={form} setForm={setForm} onComplete={completeRegistration} setMessage={setMessage} /> : <form className="auth-form" onSubmit={submit} autoComplete="off">
          <Field label="Correo electrónico" name="email" value={form.email} onChange={update} placeholder="tu@correo.com" icon="mail" type="email" autoComplete="email" />
          {mode !== 'recovery' && <PasswordField label="Contraseña" name="password" value={form.password} onChange={update} show={showPassword} toggle={() => setShowPassword(!showPassword)} />}
          {mode === 'recovery' && <PasswordField label="Nueva contraseña" name="password" value={form.password} onChange={update} show={showPassword} toggle={() => setShowPassword(!showPassword)} showRequirements />}
          {mode === 'login' && <div className="auth-row"><label className="check-label"><input type="checkbox" /> <span>Recordarme</span></label><button type="button" className="text-button" onClick={() => setAuthMode('recovery')}>¿Olvidaste tu contraseña?</button></div>}
          {mode === 'login' && <QrPreview />}
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="auth-submit" type="submit">{mode === 'login' ? 'Entrar a mi cuenta' : mode === 'register' ? 'Crear mi cuenta' : 'Guardar nueva contraseña'} <Icon name="arrow" size={17} /></button>
        </form>}
        {mode === 'recovery' && <button className="back-link icon-nav-button" onClick={() => setAuthMode('login')} aria-label="Volver a iniciar sesión" title="Volver a iniciar sesión"><Icon name="arrowLeft" size={18} /></button>}
        <p className="auth-terms">Al continuar aceptas el uso local de VYRA para organizar tu presupuesto.</p>
      </div>
    </main>
  </div>
}

function Onboarding({ profile, onComplete, onSignOut }) {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState({ available: profile.available ?? '', income: profile.income ?? '', fixed: profile.fixed ?? '', focuses: profile.focuses?.length ? profile.focuses : (profile.focus ? [profile.focus] : []), goal: profile.goal || '' })
  const canContinue = draft.available !== '' && draft.income !== '' && Number(draft.available) >= 0 && Number(draft.income) > 0
  const finish = () => {
    if (!draft.focuses.length) return
    onComplete({ ...profile, available: Number(draft.available) || 0, income: Number(draft.income) || 0, fixed: Number(draft.fixed) || 0, focuses: draft.focuses, focus: draft.focuses[0], goal: Number(draft.goal) || 0 })
  }
  const toggleFocus = id => setDraft(current => ({ ...current, focuses: current.focuses.includes(id) ? current.focuses.filter(item => item !== id) : current.focuses.length < 2 ? [...current.focuses, id] : current.focuses }))

  const progress = ['01', '02', '03', '04']
  return <div className="onboarding-shell"><header className="onboarding-top"><Brand /><button className="onboarding-exit" onClick={onSignOut}>Salir <Icon name="logout" size={15} /></button></header><main className="onboarding-main"><div className="onboarding-progress">{progress.map((item, index) => <span key={item} className={index <= step ? 'active' : ''}>{item}</span>).reduce((items, item, index) => index < progress.length - 1 ? [...items, item, <i key={`line-${item.key}`} />] : [...items, item], [])}</div>{step === 1 ? <section className="onboarding-card"><span className="eyebrow">Paso 2 de 4 · Tu realidad</span><h1>¿Cuál es tu punto de partida?</h1><p className="onboarding-lead">Así podremos mostrarte un presupuesto mensual que se parezca a tu realidad. No necesitas tener todo calculado.</p><div className="onboarding-fields"><label className="form-label">¿Cuánto tienes disponible ahora?<div className="money-input"><span>S/</span><input type="number" min="0" step="0.01" value={draft.available} onChange={event => setDraft({ ...draft, available: event.target.value })} placeholder="0.00" /></div></label><label className="form-label">¿Cuánto recibes al mes?<div className="money-input"><span>S/</span><input type="number" min="0" step="0.01" value={draft.income} onChange={event => setDraft({ ...draft, income: event.target.value })} placeholder="0.00" /></div></label></div><div className="onboarding-note"><Icon name="wallet" size={17} /><span>VYRA organiza tus números por ciclos mensuales. Al cambiar el mes, tus gastos empiezan de nuevo sin borrar tu historial.</span></div><button className="primary-button onboarding-button icon-only" aria-label="Continuar" title="Continuar" disabled={!canContinue} onClick={() => setStep(2)}><Icon name="arrow" size={18} /></button></section> : step === 2 ? <section className="onboarding-card"><span className="eyebrow">Paso 3 de 4 · Tus compromisos</span><h1>¿Qué parte del mes ya está comprometida?</h1><p className="onboarding-lead">Separar tus pagos fijos ayuda a que el dinero disponible sea más realista.</p><div className="onboarding-fields"><label className="form-label">Pagos fijos mensuales<div className="money-input"><span>S/</span><input type="number" min="0" step="0.01" value={draft.fixed} onChange={event => setDraft({ ...draft, fixed: event.target.value })} placeholder="0.00" /></div></label><label className="form-label">¿Cuánto quieres ahorrar?<span className="optional">Opcional</span><div className="money-input"><span>S/</span><input type="number" min="0" step="0.01" value={draft.goal} onChange={event => setDraft({ ...draft, goal: event.target.value })} placeholder="0.00" /></div></label></div><div className="onboarding-note"><Icon name="trend" size={17} /><span>No pasa nada si hoy tu meta es S/ 0. Saberlo también es una decisión financiera válida.</span></div><div className="onboarding-actions"><button className="back-link icon-nav-button" aria-label="Volver" title="Volver" onClick={() => setStep(1)}><Icon name="arrowLeft" size={18} /></button><button className="primary-button onboarding-button icon-only" aria-label="Continuar" title="Continuar" onClick={() => setStep(3)}><Icon name="arrow" size={18} /></button></div></section> : <section className="onboarding-card"><span className="eyebrow">Paso 4 de 4 · Tu enfoque</span><h1>¿Qué quieres priorizar?</h1><p className="onboarding-lead">Elige hasta 2 prioridades. La primera será tu enfoque principal y la segunda quedará como apoyo.</p><div className="focus-options">{focusOptions.map(option => <button key={option.id} className={draft.focuses.includes(option.id) ? 'selected' : ''} onClick={() => toggleFocus(option.id)}><span className="focus-icon"><Icon name={option.icon} size={18} /></span><span><b>{option.title}</b><small>{option.detail}</small></span>{draft.focuses.includes(option.id) && <Icon name="check" size={16} />}</button>)}</div><p className="focus-selection">{draft.focuses.length}/2 prioridades seleccionadas</p><div className="onboarding-actions"><button className="back-link icon-nav-button" aria-label="Volver" title="Volver" onClick={() => setStep(2)}><Icon name="arrowLeft" size={18} /></button><button className="primary-button onboarding-button" disabled={!draft.focuses.length} onClick={finish}>Crear mi plan <Icon name="arrow" size={17} /></button></div></section>}</main></div>
}

function RegisterWizard({ step, setStep, form, setForm, onComplete }) {
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const update = event => { setMessage(''); setForm({ ...form, [event.target.name]: event.target.value }) }
  const toggleFocus = id => setForm(current => ({ ...current, focuses: current.focuses.includes(id) ? current.focuses.filter(item => item !== id) : current.focuses.length < 2 ? [...current.focuses, id] : current.focuses }))
  const next = () => {
    if (step === 1 && (!form.name.trim() || Number(form.age) < 13 || Number(form.age) > 120)) return setMessage('Escribe tu nombre y una edad válida.')
    if (step === 2 && (form.available === '' || form.income === '' || Number(form.available) < 0 || Number(form.income) <= 0)) return setMessage('Completa tu disponible actual y tu ingreso mensual.')
    if (step === 3 && (form.fixed === '' || Number(form.fixed) < 0)) return setMessage('Indica tus pagos fijos mensuales, aunque sean S/ 0.')
    if (step === 4 && !form.focuses.length) return setMessage('Elige al menos una prioridad.')
    setStep(step + 1)
  }
  const submit = event => { event.preventDefault(); if (!form.email.trim() || !form.email.includes('@')) return setMessage('Escribe un correo válido.'); if (!validPassword(form.password)) return setMessage('Completa todos los requisitos de seguridad.'); if (form.password !== form.confirm) return setMessage('Las contraseñas no coinciden.'); onComplete(form) }
  return <form className="auth-form register-wizard" onSubmit={submit} autoComplete="off">
    {step === 1 && <><Field label="¿Cómo te llamas?" name="name" value={form.name} onChange={update} placeholder="Tu nombre" icon="user" autoComplete="off" /><Field label="¿Qué edad tienes?" name="age" value={form.age} onChange={update} placeholder="Tu edad" icon="user" type="number" autoComplete="off" /><WizardActions step={step} onBack={() => setStep(1)} onNext={next} label="Continuar" /></>}
    {step === 2 && <><span className="wizard-question">Conozcamos tu punto de partida</span><p className="wizard-help">Estos datos nos ayudan a mostrar un saldo mensual realista.</p><div className="onboarding-fields"><label className="form-label">Disponible ahora<div className="money-input"><span>S/</span><input name="available" type="number" min="0" step="0.01" value={form.available} onChange={update} placeholder="0.00" /></div></label><label className="form-label">Ingreso mensual<div className="money-input"><span>S/</span><input name="income" type="number" min="0" step="0.01" value={form.income} onChange={update} placeholder="0.00" /></div></label></div><WizardActions step={step} onBack={() => setStep(1)} onNext={next} label="Continuar" /></>}
    {step === 3 && <><span className="wizard-question">Ordenemos tus compromisos</span><p className="wizard-help">Separar tus pagos fijos evita confundir dinero disponible con dinero comprometido.</p><label className="form-label">Pagos fijos mensuales<div className="money-input"><span>S/</span><input name="fixed" type="number" min="0" step="0.01" value={form.fixed} onChange={update} placeholder="0.00" /></div></label><label className="form-label">Meta de ahorro mensual <span className="optional">Opcional</span><div className="money-input"><span>S/</span><input name="goal" type="number" min="0" step="0.01" value={form.goal} onChange={update} placeholder="0.00" /></div></label><WizardActions step={step} onBack={() => setStep(2)} onNext={next} label="Continuar" /></>}
    {step === 4 && <><span className="wizard-question">Elige tus prioridades</span><p className="wizard-help">Puedes elegir hasta dos: una principal y otra de apoyo.</p><div className="focus-options">{focusOptions.map(option => <button type="button" key={option.id} className={form.focuses.includes(option.id) ? 'selected' : ''} onClick={() => toggleFocus(option.id)}><span className="focus-icon"><Icon name={option.icon} size={18} /></span><span><b>{option.title}</b><small>{option.detail}</small></span>{form.focuses.includes(option.id) && <Icon name="check" size={16} />}</button>)}</div><p className="focus-selection">{form.focuses.length}/2 prioridades seleccionadas</p><WizardActions step={step} onBack={() => setStep(3)} onNext={next} label="Continuar" /></>}
    {step === 5 && <><span className="wizard-question">Protege tu cuenta</span><p className="wizard-help">Terminemos con tus datos de acceso.</p><Field label="Correo electrónico" name="email" value={form.email} onChange={update} placeholder="tu@correo.com" icon="mail" type="email" autoComplete="off" /><PasswordField label="Contraseña" name="password" value={form.password} onChange={update} show={showPassword} toggle={() => setShowPassword(!showPassword)} showRequirements /><PasswordField label="Repite tu contraseña" name="confirm" value={form.confirm} onChange={update} show={showPassword} toggle={() => setShowPassword(!showPassword)} /><div className="wizard-actions"><button type="button" className="back-link icon-nav-button" onClick={() => setStep(4)} aria-label="Volver" title="Volver"><Icon name="arrowLeft" size={18} /></button><button className="auth-submit" type="submit">Crear mi cuenta <Icon name="arrow" size={17} /></button></div></>}
    {message && <p className="form-message" role="alert">{message}</p>}
  </form>
}

function WizardActions({ step, onBack, onNext, label }) {
  return <div className="wizard-actions"><button type="button" className="back-link icon-nav-button" onClick={onBack} aria-label={step === 1 ? 'Volver' : 'Atrás'} title={step === 1 ? 'Volver' : 'Atrás'}><Icon name="arrowLeft" size={18} /></button><button type="button" className="auth-submit icon-nav-submit" onClick={onNext} aria-label={label} title={label}><Icon name="arrow" size={18} /></button></div>
}

function QrPreview() {
  const cells = Array.from({ length: 21 * 21 }, (_, index) => { const x = index % 21; const y = Math.floor(index / 21); const finder = (originX, originY) => x >= originX && x < originX + 7 && y >= originY && y < originY + 7 && (x === originX || x === originX + 6 || y === originY || y === originY + 6 || (x >= originX + 2 && x <= originX + 4 && y >= originY + 2 && y <= originY + 4)); const active = finder(0, 0) || finder(14, 0) || finder(0, 14) || (!(x < 8 && y < 8) && !(x >= 13 && y < 8) && !(x < 8 && y >= 13) && (x * 3 + y * 5 + x * y) % 7 < 3); return active ? <rect key={index} x={x} y={y} width="1" height="1" /> : null })
  return <div className="qr-preview"><svg aria-hidden="true" viewBox="0 0 21 21">{cells}</svg><span><b>Acceso rápido</b><small>Escanea desde la app · Próximamente</small></span></div>
}

function Field({ label, name, value, onChange, placeholder, icon, type = 'text', autoComplete }) {
  return <label className="auth-field"><span>{label}</span><div className="auth-input"><Icon name={icon} size={18} /><input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} autoComplete="off" /></div></label>
}

function PasswordField({ label, name, value, onChange, show, toggle, showRequirements = false }) {
  const checks = passwordChecks(value)
  return <label className="auth-field"><span>{label}</span><div className="auth-input"><Icon name="lock" size={18} /><input name={name} value={value} onChange={onChange} placeholder="8–16 caracteres" minLength={8} maxLength={16} type={show ? 'text' : 'password'} autoComplete="off" /><button type="button" className="show-password" onClick={toggle} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}><Icon name="eye" size={17} /></button></div>{showRequirements && <div className="password-requirements" aria-live="polite"><PasswordRule valid={checks.length} text="8–16 caracteres" /><PasswordRule valid={checks.uppercase} text="Una mayúscula" /><PasswordRule valid={checks.lowercase} text="Una minúscula" /><PasswordRule valid={checks.number} text="Un número" /></div>}</label>
}

export { AuthScreen, Onboarding }
