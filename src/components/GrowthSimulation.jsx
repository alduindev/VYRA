import { useEffect, useRef, useState } from 'react'
import { demoEvents, money } from '../data/appData'
import { Icon } from './Icon'

function GrowthSimulation() {
  const [simulationStep, setSimulationStep] = useState(-1)
  const [initialBalance] = useState(() => Math.round((1000 + Math.random() * 3000) * 100) / 100)
  const [events] = useState(() => { const first = demoEvents[0]; const shuffled = demoEvents.slice(1); for (let index = shuffled.length - 1; index > 0; index -= 1) { const randomIndex = Math.floor(Math.random() * (index + 1)); [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]] } return [first, ...shuffled] })
  const [displayedBalance, setDisplayedBalance] = useState(initialBalance)
  const previousBalance = useRef(initialBalance)
  const eventIndex = simulationStep < 0 ? 0 : simulationStep % events.length
  const rawBalance = simulationStep < 0 ? initialBalance : initialBalance + events.slice(0, eventIndex + 1).reduce((total, event) => total + event.delta, 0)
  const balance = Math.max(1000, rawBalance)
  const progress = Math.max(12, Math.min(92, (balance / (initialBalance + 1500)) * 100))
  const barHeights = [0.35, 0.55, 0.48, 0.75, 1].map(scale => `${progress * scale}%`)

  useEffect(() => {
    let nextEvent
    let stopped = false
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 2001)
      nextEvent = window.setTimeout(() => { if (stopped) return; setSimulationStep(current => current + 1); scheduleNext() }, delay)
    }
    scheduleNext()
    return () => { stopped = true; window.clearTimeout(nextEvent) }
  }, [])

  useEffect(() => {
    const from = previousBalance.current; const start = performance.now(); const duration = 1800; let frame
    const animate = now => { const progress = Math.min(1, (now - start) / duration); const eased = 1 - Math.pow(1 - progress, 3); setDisplayedBalance(from + (balance - from) * eased); if (progress < 1) frame = requestAnimationFrame(animate) }
    previousBalance.current = balance
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [balance])

  const firstVisibleStep = Math.max(0, simulationStep - 1)
  const visibleEvents = simulationStep < 0 ? [] : Array.from({ length: Math.min(2, simulationStep + 1) }, (_, offset) => { const sequence = firstVisibleStep + offset; return { ...events[sequence % events.length], sequence } })
  return <div className="hero-preview"><div className="visual-card"><div className="visual-card-head"><span>Movimiento de saldo</span><Icon name="trend" size={16} /></div><div className="growth-chart" aria-hidden="true"><span className="growth-bar bar-one" style={{ height: barHeights[0] }} /><span className="growth-bar bar-two" style={{ height: barHeights[1] }} /><span className="growth-bar bar-three" style={{ height: barHeights[2] }} /><span className="growth-bar bar-four" style={{ height: barHeights[3] }} /><span className="growth-bar bar-five" style={{ height: barHeights[4] }} /><span className="growth-coin coin-one">S/</span><span className="growth-coin coin-two">+</span></div><strong aria-label="Saldo simulado">{money(displayedBalance)}</strong><div className="visual-progress"><span style={{ width: `${progress}%` }} /></div><div className="visual-card-foot"><span>Saldo actual</span><b>{money(balance)}</b></div></div><div className="hero-notifications">{visibleEvents.map(event => <div className={`hero-notification ${event.kind}`} key={`${event.id}-${event.sequence}`}><span className="hero-notification-icon">{event.kind === 'deposit' ? '+' : '−'}</span><span><b>{event.title}</b><small>{event.detail}</small></span><strong>{event.amount}</strong></div>)}</div></div>
}


export { GrowthSimulation }
