import { describe, expect, it } from 'vitest'
import { calculateIncomeForMonth, calculateIncomeForRange, calculateLiveBudget, calculateRecurringRemaining, normalizeImportedData, passwordChecks, summarizeMonth } from './appData'

describe('financial calculations', () => {
  it('calculates safe daily spending after commitments and savings', () => {
    expect(calculateLiveBudget({ available: 1800, spent: 200, goal: 300, recurringRemaining: 400, daysRemaining: 10 })).toBe(90)
  })

  it('never returns a negative daily budget', () => {
    expect(calculateLiveBudget({ available: 100, spent: 250, goal: 300, recurringRemaining: 200, daysRemaining: 10 })).toBe(0)
  })

  it('summarizes monthly income, expenses, savings and remaining money', () => {
    expect(summarizeMonth({ income: 4500, spent: 3100, saved: 400 })).toEqual({ income: 4500, spent: 3100, saved: 400, remaining: 1400 })
  })

  it('validates the password policy rules', () => {
    expect(passwordChecks('QaPassword1')).toEqual({ length: true, uppercase: true, lowercase: true, number: true })
    expect(passwordChecks('weak')).toEqual({ length: false, uppercase: false, lowercase: true, number: false })
  })

  it('normalizes legacy JSON collections and preserves the current password', () => {
    const imported = normalizeImportedData({ categories: [], expenses: [] }, { profile: { password: 'QaPassword1' } })
    expect(imported.activity).toEqual([])
    expect(imported.incomeSources).toEqual([])
    expect(imported.recurringPayments).toEqual([])
    expect(imported.profile.password).toBe('QaPassword1')
  })

  it('keeps a portable user profile contract when importing older data', () => {
    const imported = normalizeImportedData({ version: 0, categories: [], expenses: [], profile: { id: 'user-1' } }, { profile: { password: 'QaPassword1' } })
    expect(imported.version).toBe(1)
    expect(imported.profile.id).toBe('user-1')
    expect(imported.monthlyClosures).toEqual([])
  })

  it('counts active recurring payments until they are paid', () => {
    expect(calculateRecurringRemaining([{ amount: 900, dueDay: 25, active: true }, { amount: 300, dueDay: 5, active: true }, { amount: 100, dueDay: 28, active: false }], 20)).toBe(1200)
  })

  it('does not count a recurring payment already marked as paid', () => {
    expect(calculateRecurringRemaining([{ id: 'internet', amount: 90, dueDay: 28, active: true }], 20, [{ recurringId: 'internet', createdAt: new Date().toISOString() }])).toBe(0)
  })

  it('counts real income entries only in their selected month', () => {
    expect(calculateIncomeForMonth([
      { amount: 2500, receivedDate: '2026-11-01' },
      { amount: 300, receivedDate: '2026-11-18' },
      { amount: 900, receivedDate: '2026-10-01' },
      { amount: 100, receivedDate: '2026-11-20', active: false }
    ], '2026-11')).toBe(2800)
  })

  it('limits income analysis to the selected date range', () => {
    expect(calculateIncomeForRange([
      { amount: 2500, receivedDate: '2026-11-01' },
      { amount: 300, receivedDate: '2026-11-18' },
      { amount: 900, receivedDate: '2026-10-01' }
    ], '2026-11-10', '2026-11-30')).toBe(300)
  })
})
