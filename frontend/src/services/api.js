import { DEMO_SESSIONS } from '../utils/demoData.js'

// Single place where the frontend talks to the backend.
// While the backend is not ready, keep USE_MOCK = true and everything still works.
const USE_MOCK = true
const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    ...options,
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed')
  return res.json()
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export const api = {
  async login(username, password) {
    if (USE_MOCK) { await wait(300); return { token: 'mock', user: { name: username, role: 'trainee' } } }
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  },
  async saveScenario(config) {            // -> Scenario Engine
    if (USE_MOCK) return { id: Date.now(), ...config }
    return request('/scenarios', { method: 'POST', body: JSON.stringify(config) })
  },
  async analyze(session) {                // -> AI service (classification, threat score, recommendation)
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
    async saveResult(result) {
    if (USE_MOCK) {
      const h = JSON.parse(localStorage.getItem('history') || '[]')
      if (result.id && h.some((x) => x.id === result.id)) return result   // already saved
      h.unshift(result)
      localStorage.setItem('history', JSON.stringify(h))
      return result
    }
    return request('/results', { method: 'POST', body: JSON.stringify(result) })
  },
  async loadDemoData() {                  // mock-only: adds sample sessions
    const h = JSON.parse(localStorage.getItem('history') || '[]').filter((x) => !x.demo)
    localStorage.setItem('history', JSON.stringify([...h, ...DEMO_SESSIONS]))
  },
  async resetHistory() {                  // mock-only: clears everything
    localStorage.removeItem('history')
  },
  async getHistory() {
    if (USE_MOCK) return JSON.parse(localStorage.getItem('history') || '[]')
    return request('/results')
  },
}