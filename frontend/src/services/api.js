import { DEMO_SESSIONS } from '../utils/demoData.js'

// API client configuration
// USE_MOCK = false: Direct REST integration with surveillance backend
// USE_MOCK = true:  Offline client storage fallback for standalone mode
const USE_MOCK = false

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    ...options,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed')
  return res.json()
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export const api = {
  // ── Authentication ─────────────────────────────────────────────────────────
  async login(username, password) {
    if (USE_MOCK) { await wait(300); return { token: 'mock', user: { name: username, role: 'trainee' } } }
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  },

  // ── Scenario setup ─────────────────────────────────────────────────────────
  async saveScenario(config) {
    if (USE_MOCK) return { id: Date.now(), ...config }
    return request('/scenarios', { method: 'POST', body: JSON.stringify(config) })
  },

  // ── AI analysis (threat scoring + classification) ──────────────────────────
  async analyze(session) {
    if (USE_MOCK) {
      await wait(900)
      const rows = session.drones.map((d) => {
        const decision = session.decisions.find((x) => x.droneId === d.id)
        const predicted = d.hostile ? (Math.random() > 0.15 ? d.type : 'Commercial') : d.type
        const score = Math.round((d.hostile ? 60 : 15) + Math.random() * 35)
        const best = score > 70 ? 'Engage' : score > 40 ? 'Jam' : 'Monitor'
        return { droneId: d.id, actualType: d.type, predictedType: predicted, threatScore: score, recommended: best, operatorAction: decision?.action || 'None', reactionSec: decision?.reactionSec ?? null }
      })
      return { rows, modelAccuracy: 0.9 }
    }
    return request('/analysis', { method: 'POST', body: JSON.stringify(session) })
  },

  // ── Results / History ──────────────────────────────────────────────────────
  async saveResult(result) {
    if (USE_MOCK) {
      const h = JSON.parse(localStorage.getItem('history') || '[]')
      if (result.id && h.some((x) => x.id === result.id)) return result
      h.unshift(result)
      localStorage.setItem('history', JSON.stringify(h))
      return result
    }
    return request('/results', { method: 'POST', body: JSON.stringify(result) })
  },

  async getHistory() {
    if (USE_MOCK) return JSON.parse(localStorage.getItem('history') || '[]')
    return request('/results')
  },

  // ── Demo helpers ───────────────────────────────────────────────────────────
  async loadDemoData() {
    if (USE_MOCK) {
      const h = JSON.parse(localStorage.getItem('history') || '[]').filter((x) => !x.demo)
      localStorage.setItem('history', JSON.stringify([...h, ...DEMO_SESSIONS]))
      return
    }
    return request('/demo/load', { method: 'POST' })
  },

  async resetHistory() {
    if (USE_MOCK) {
      localStorage.removeItem('history')
      return
    }
    return request('/results', { method: 'DELETE' })
  },
}