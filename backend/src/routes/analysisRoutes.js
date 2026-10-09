import { Router } from 'express'
import { analyzeSession } from '../services/analysisService.js'

const router = Router()

// POST /api/analysis
// Body: { drones, decisions, scenario, duration }
// Returns: { rows, modelAccuracy }
//
// This is the primary endpoint consumed by the frontend's AIAnalysis page.
// The frontend sends the full session object from SimContext.
router.post('/', async (req, res) => {
  const session = req.body || {}
  if (!session.drones || !Array.isArray(session.drones)) {
    return res.status(400).json({ success: false, message: 'Session must include a drones array.' })
  }

  const result = await analyzeSession(session)
  return res.json(result)
})

export default router
