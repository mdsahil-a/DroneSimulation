import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes      from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import scenarioRoutes  from './routes/scenarioRoutes.js'
import analysisRoutes  from './routes/analysisRoutes.js'
import resultsRoutes   from './routes/resultsRoutes.js'
import demoRoutes      from './routes/demoRoutes.js'

const app = express()

// ── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/scenarios', scenarioRoutes)
app.use('/api/analysis',  analysisRoutes)
app.use('/api/results',   resultsRoutes)
app.use('/api/demo',      demoRoutes)

// 404 for unknown /api routes
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' })
})

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler)

export default app
