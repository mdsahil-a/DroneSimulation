import { config } from 'dotenv'
config()   // load .env before anything else reads process.env

import app from './app.js'

// Read PORT from .env (dotenv already loaded above). Never inherit shell PORT.
const PORT     = Number(process.env.PORT)    || 5000
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  AI Drone Threat Simulation — Backend                ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log(`║  Server   → http://localhost:${PORT}                    ║`)
  console.log(`║  Frontend → ${FRONTEND}                  ║`)
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log('║  Endpoints:                                          ║')
  console.log('║    GET  /api/health                                  ║')
  console.log('║    POST /api/auth/login                              ║')
  console.log('║    GET  /api/dashboard                               ║')
  console.log('║    POST /api/scenarios                               ║')
  console.log('║    POST /api/analysis                                ║')
  console.log('║    GET  /api/results                                 ║')
  console.log('║    POST /api/results                                 ║')
  console.log('║    POST /api/demo/load                               ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('⚠  In-memory only — data resets on server restart.')
})
