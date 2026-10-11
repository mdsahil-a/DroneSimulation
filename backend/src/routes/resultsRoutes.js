import { Router } from 'express'
import { resultsStore } from '../data/store.js'
import { generateReport } from '../services/reportService.js'

const router = Router()

// POST /api/results  — save a simulation result (called from Results page)
// Body: { id, date, scenario, totalScore, threatsHandled, totalThreats,
//         decisionAccuracy, totalDrones, avgReaction }
// Returns: the saved result
router.post('/', (req, res) => {
  const result = req.body || {}

  if (result.totalScore === undefined) {
    return res.status(400).json({ success: false, message: 'Result must include totalScore.' })
  }

  // Avoid duplicate saves for the same run
  if (result.id && resultsStore.some((r) => r.id === result.id)) {
    return res.json(result)
  }

  const saved = {
    ...result,
    id:          result.id || Date.now(),
    savedAt:     new Date().toISOString(),
  }

  resultsStore.unshift(saved)   // newest first
  return res.status(201).json(saved)
})

// GET /api/results  — list all stored results (history)
// Returns array sorted newest-first (matches localStorage history format)
router.get('/', (req, res) => {
  res.json(resultsStore)
})

// GET /api/results/:id  — retrieve a specific result with report
router.get('/:id', (req, res) => {
  const result = resultsStore.find((r) => String(r.id) === req.params.id)
  if (!result) return res.status(404).json({ success: false, message: 'Result not found.' })
  res.json(generateReport(result))
})

// DELETE /api/results  — clear all stored session results
router.delete('/', (req, res) => {
  resultsStore.length = 0
  res.json({ success: true, message: 'All results cleared.' })
})

export default router
