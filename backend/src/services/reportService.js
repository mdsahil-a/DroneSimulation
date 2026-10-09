// ──────────────────────────────────────────────────────────────────────────────
// Report Service
// Generates an after-action report from raw session + analysis data.
// Numbers are derived directly from the recorded events — no fabricated values.
// ──────────────────────────────────────────────────────────────────────────────

import { evaluateSession } from './recommendationService.js'

/** Scoring logic mirrored from frontend utils/scoring.js */
function correctAction(drone) {
  return drone.hostile ? (drone.type === 'Swarm' ? 'Engage' : 'Jam') : 'Monitor'
}

function scoreDecision(drone, decision) {
  if (!decision) return { points: 0, note: 'Missed' }
  const right = decision.action === correctAction(drone)
  const fast  = decision.reactionSec <= 5
  if (right && fast) return { points: 100, note: 'Correct and fast' }
  if (right)         return { points: 70,  note: 'Correct but slow' }
  if (drone.hostile && decision.action === 'Monitor') return { points: 0, note: 'Ignored a hostile drone' }
  if (!drone.hostile && decision.action === 'Engage') return { points: 0, note: 'Engaged a harmless drone' }
  return { points: 30, note: 'Partly correct' }
}

export function generateReport(result) {
  // result shape from frontend saveResult call:
  // { id, date, scenario, totalScore, threatsHandled, totalThreats,
  //   decisionAccuracy, totalDrones, avgReaction }
  // We pass it through + enrich with evaluation.

  // Build fake row entries for evaluateSession if not already present
  const rows = []
  if (result.session) {
    const { drones = [], decisions = [] } = result.session
    drones.forEach((d) => {
      const dec = decisions.find((x) => x.droneId === d.id)
      rows.push(scoreDecision(d, dec))
    })
  }

  const evaluation = evaluateSession(rows, result.scenario || {})

  return {
    ...result,
    evaluation,
    generatedAt: new Date().toISOString(),
    disclaimer:
      'This report is generated from a synthetic training simulation. ' +
      'All data is fabricated for educational purposes only.',
  }
}
