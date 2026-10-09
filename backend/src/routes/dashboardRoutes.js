import { Router } from 'express'
import { resultsStore } from '../data/store.js'

const router = Router()

// GET /api/dashboard
// Returns aggregate stats derived from the in-memory results store
router.get('/', (req, res) => {
  const total = resultsStore.length
  const avgScore = total
    ? Math.round(resultsStore.reduce((s, r) => s + (r.totalScore || 0), 0) / total)
    : 0
  const bestScore = total ? Math.max(...resultsStore.map((r) => r.totalScore || 0)) : 0

  // Threat distribution aggregated from all sessions
  let high = 0, medium = 0, low = 0
  resultsStore.forEach((r) => {
    if (r.analysisRows) {
      r.analysisRows.forEach((row) => {
        if (row.threatLevel === 'High')   high++
        else if (row.threatLevel === 'Medium') medium++
        else low++
      })
    }
  })

  const recent = resultsStore.slice(0, 6).map((r) => ({
    id:         r.id,
    date:       r.date,
    scenario:   r.scenario,
    totalScore: r.totalScore,
  }))

  res.json({
    totalSimulations:     total,
    completedSimulations: total,
    activeSimulations:    0,
    avgScore,
    bestScore,
    threatDistribution:   { high, medium, low },
    recentActivity:       recent,
  })
})

export default router
