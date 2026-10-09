import { Router } from 'express'
import { scenariosStore } from '../data/store.js'

const router = Router()

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const VALID_TIMES        = ['Day', 'Night']
const VALID_TERRAINS     = ['Urban', 'Rural']

// POST /api/scenarios
// Body: { difficulty, timeOfDay, terrain, droneCount, degradedSensors }
// Returns: { id, ...config }
router.post('/', (req, res) => {
  const { difficulty, timeOfDay, terrain, droneCount, degradedSensors } = req.body || {}

  // Validation
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ success: false, message: `Invalid difficulty. Choose from: ${VALID_DIFFICULTIES.join(', ')}` })
  }
  if (timeOfDay && !VALID_TIMES.includes(timeOfDay)) {
    return res.status(400).json({ success: false, message: `Invalid timeOfDay. Choose from: ${VALID_TIMES.join(', ')}` })
  }
  if (terrain && !VALID_TERRAINS.includes(terrain)) {
    return res.status(400).json({ success: false, message: `Invalid terrain. Choose from: ${VALID_TERRAINS.join(', ')}` })
  }
  const count = Number(droneCount)
  if (!isNaN(count) && (count < 1 || count > 20)) {
    return res.status(400).json({ success: false, message: 'droneCount must be between 1 and 20.' })
  }

  const scenario = {
    id:              Date.now(),
    difficulty:      difficulty      || 'Medium',
    timeOfDay:       timeOfDay       || 'Day',
    terrain:         terrain         || 'Urban',
    droneCount:      isNaN(count) ? 5 : count,
    degradedSensors: Boolean(degradedSensors),
    createdAt:       new Date().toISOString(),
  }

  scenariosStore.push(scenario)
  return res.status(201).json(scenario)
})

// GET /api/scenarios — list all created scenarios (optional, useful for debugging)
router.get('/', (req, res) => res.json(scenariosStore))

export default router
