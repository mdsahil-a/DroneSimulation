import { Router } from 'express'
import { resultsStore } from '../data/store.js'

const router = Router()

// Demo sessions matching the frontend's demoData.js format
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toLocaleString()
const make = (days, difficulty, terrain, timeOfDay, totalScore, threatsHandled, totalThreats, avgReaction) => ({
  demo:           true,
  id:             `demo-${days}-${difficulty}`,
  date:           daysAgo(days),
  scenario:       { difficulty, terrain, timeOfDay, droneCount: 6, degradedSensors: difficulty === 'Hard' },
  totalScore,
  threatsHandled,
  totalThreats,
  decisionAccuracy: Math.round((threatsHandled / Math.max(totalThreats, 1)) * 100),
  totalDrones:    6,
  avgReaction,
})

const DEMO_SESSIONS = [
  make(0, 'Hard',   'Urban', 'Night', 84, 5, 6, 3.1),
  make(1, 'Hard',   'Rural', 'Day',   79, 5, 6, 3.6),
  make(2, 'Medium', 'Urban', 'Night', 72, 4, 4, 4.2),
  make(3, 'Medium', 'Rural', 'Day',   64, 4, 4, 5.0),
  make(4, 'Easy',   'Urban', 'Day',   55, 3, 3, 6.1),
  make(5, 'Easy',   'Rural', 'Day',   46, 2, 3, 7.4),
]

// POST /api/demo/load — seed demo sessions into the in-memory store
router.post('/load', (req, res) => {
  // Remove any existing demos, then re-add
  const nonDemo = resultsStore.filter((r) => !r.demo)
  resultsStore.length = 0
  resultsStore.push(...DEMO_SESSIONS, ...nonDemo)
  res.json({ success: true, count: DEMO_SESSIONS.length })
})

// DELETE /api/demo  — clear all results (reset)
router.delete('/', (req, res) => {
  resultsStore.length = 0
  res.json({ success: true })
})

export default router
