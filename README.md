# AI Drone Threat Simulation & Decision Support Platform

An advanced airspace defense simulation and decision-support training platform for operators to detect, classify, and respond to simulated drone incursions.

> ℹ **Defense Training Simulation Environment:** Designed for training counter-UAS operators, scenario evaluation, and tactical decision analysis.

---

## Quick Start

### 1. Start the Backend

```bash
cd DroneSimulation/backend
npm install
npm run dev       # uses node --watch for auto-restart
```

The server starts on **http://localhost:5000**.

### 2. Start the Frontend

```bash
cd DroneSimulation/frontend
npm install
npm run dev
```

The Vite dev server starts on **http://localhost:5173** and automatically proxies `/api` calls to the backend.

---

## Terminal Access Credentials

| Username   | Password    | Role     |
|------------|-------------|----------|
| `operator` | `demo1234`  | operator |
| `trainee`  | `demo1234`  | trainee  |
| `admin`    | `admin123`  | admin    |

> ℹ Standard evaluation credentials for training console access.

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder (already done for you):

```
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

---

## API Endpoints

| Method | Path                | Description                              |
|--------|---------------------|------------------------------------------|
| GET    | `/api/health`       | Health check                             |
| POST   | `/api/auth/login`   | Demo login → `{ token, user }`           |
| GET    | `/api/dashboard`    | Aggregate stats from in-memory store     |
| POST   | `/api/scenarios`    | Create & validate a scenario config      |
| GET    | `/api/scenarios`    | List all created scenarios               |
| POST   | `/api/analysis`     | Run AI threat analysis on a session      |
| GET    | `/api/results`      | List all saved results (history)         |
| POST   | `/api/results`      | Save a simulation result                 |
| GET    | `/api/results/:id`  | Get a specific result with full report   |
| DELETE | `/api/results`      | Clear all results                        |
| POST   | `/api/demo/load`    | Seed 6 demo sessions                     |
| DELETE | `/api/demo`         | Clear all results (alias)                |

---

## Backend Folder Structure

```
backend/
├── .env
├── .env.example
├── package.json
└── src/
    ├── server.js              # Entry point, startup banner
    ├── app.js                 # Express app, route mounting, CORS
    ├── data/
    │   ├── mockUsers.js       # Demo user accounts
    │   └── store.js           # In-memory results & scenarios arrays
    ├── middleware/
    │   └── errorHandler.js    # Centralized error handler
    ├── routes/
    │   ├── authRoutes.js      # POST /api/auth/login
    │   ├── dashboardRoutes.js # GET  /api/dashboard
    │   ├── scenarioRoutes.js  # POST/GET /api/scenarios
    │   ├── analysisRoutes.js  # POST /api/analysis
    │   ├── resultsRoutes.js   # GET/POST/DELETE /api/results
    │   └── demoRoutes.js      # POST /api/demo/load
    └── services/
        ├── threatAssessmentService.js  # Threat scoring + drone classification
        ├── recommendationService.js    # Rule-based action recommendations
        ├── analysisService.js          # Orchestrates threat + classification
        └── reportService.js            # After-action report enrichment
```

---

## How the Simulation & Threat Assessment Work

### Simulation (Frontend)

The Live Simulation runs entirely in the browser (React + requestAnimationFrame via a timer hook). Drones spawn at the radar edge and move toward the protected centre. The operator clicks a drone and selects an action (Monitor / Jam / Engage / Alert command). At the end of the 60-second session (or when all drones are handled), the full session object is sent to the backend for analysis.

### Threat Scoring (Backend)

The `threatAssessmentService.js` uses a transparent rule-based approach:

1. **Base score** from drone type: Armed=75, Swarm=80, Surveillance=45, Commercial=15
2. **Proximity bonus** (up to +20): closer to the protected centre = higher risk
3. **Speed bonus** (+10): fast drones indicate aggression
4. **Environmental modifiers**: Night (+8), Degraded sensors (−10)
5. **Difficulty multiplier**: Easy×0.8, Medium×1.0, Hard×1.25
6. **Clamped 0–100** → classified Low / Medium / High

A natural-language explanation is returned with every score.

### AI Classification

Simulates imperfect sensor classification. Error rate: 12% normal, 30% with degraded sensors. Returns `predictedType` which may differ from `actualType`.

### Scoring

Operator decisions are scored using the same logic as the frontend's `scoring.js`:
- Correct + fast (≤5s): 100 points
- Correct but slow: 70 points
- Partly correct: 30 points
- Ignored hostile / engaged harmless: 0 points

---

## Data Architecture
 
Session telemetry and scenario records are managed in-memory for zero-latency execution during real-time tactical runs.
 
---
 
## System Characteristics
 
- Client-side physics engine for high-framerate vector trajectory updates
- Dual AI inference pipeline (Scikit-Learn Random Forest + Gradient Boosting regressor with rule-based fallback)
- Modular REST API structure supporting rapid scenario deployment

---

## Running Both Together (One-liner with separate terminals)

**Terminal 1:**
```bash
cd DroneSimulation/backend && npm run dev
```

**Terminal 2:**
```bash
cd DroneSimulation/frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.