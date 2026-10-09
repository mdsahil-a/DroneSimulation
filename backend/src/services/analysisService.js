// ──────────────────────────────────────────────────────────────────────────────
// Analysis Service
// Tries the real Python ML service first (port 5001).
// Falls back to the rule-based engine if ML service is unavailable.
//
// Frontend expects:
//   { rows: [{droneId, actualType, predictedType, threatScore, recommended,
//             operatorAction, reactionSec, threatLevel, confidence}],
//     modelAccuracy, usingML }
// ──────────────────────────────────────────────────────────────────────────────

import { assessThreat, classifyDrone } from './threatAssessmentService.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

/**
 * Call the Python ML service for real model inference.
 * Returns null if the service is unavailable.
 */
async function callMLService(session) {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
      signal: AbortSignal.timeout(5000),   // 5 s timeout
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null  // service offline → fall back to rule-based
  }
}

/**
 * Rule-based fallback (same logic as before, used when ML service is down)
 */
function ruleBasedAnalysis(session) {
  const { drones = [], decisions = [], scenario = {} } = session
  const { difficulty, degradedSensors, timeOfDay } = scenario
  let correct = 0

  const rows = drones.map((drone) => {
    const decision = decisions.find((x) => x.droneId === drone.id)
    const predictedType = classifyDrone(drone, degradedSensors)
    if (predictedType === drone.type) correct++
    const assessment = assessThreat(drone, { difficulty, degradedSensors, timeOfDay })
    return {
      droneId:        drone.id,
      actualType:     drone.type,
      predictedType,
      threatScore:    assessment.threatScore,
      threatLevel:    assessment.threatLevel,
      confidence:     assessment.confidence / 100,
      explanation:    assessment.explanation,
      recommended:    assessment.recommended,
      operatorAction: decision?.action || 'None',
      reactionSec:    decision?.reactionSec ?? null,
    }
  })

  return {
    rows,
    modelAccuracy: drones.length > 0 ? +(correct / drones.length).toFixed(2) : 0.9,
    usingML: false,
    engine: 'rule-based fallback',
  }
}

/**
 * Main entry point: try ML first, fall back to rules.
 */
export async function analyzeSession(session) {
  // Try real ML service
  const mlResult = await callMLService(session)

  if (mlResult && mlResult.rows && mlResult.rows.length > 0) {
    console.log(`[ML] Real model used — accuracy: ${mlResult.modelAccuracy}`)
    return {
      rows:          mlResult.rows,
      modelAccuracy: mlResult.modelAccuracy,
      usingML:       true,
      engine:        'scikit-learn (RandomForest + GradientBoosting)',
    }
  }

  // Fallback
  console.warn('[ML] Service unavailable — using rule-based engine')
  return ruleBasedAnalysis(session)
}
