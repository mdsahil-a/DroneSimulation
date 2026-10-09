// ──────────────────────────────────────────────────────────────────────────────
// Recommendation Service
// Transparent rule-based engine — NOT a trained ML model.
// Generates a recommended action + confidence + explanation based on:
//   threat score, sensor confidence, scenario config, operator history
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Generate a recommendation for a single drone row from AI analysis.
 *
 * @param {object} row - { droneId, actualType, threatScore, threatLevel, confidence, recommended, operatorAction }
 * @param {object} scenario - { difficulty, degradedSensors, timeOfDay }
 * @returns {{ action, confidence, explanation, factors }}
 */
export function recommend(row, scenario = {}) {
  const factors = []
  let action = row.recommended || 'Monitor'
  let confidence = row.confidence || 75

  // Adjust confidence based on environmental conditions
  if (scenario.degradedSensors) {
    confidence = Math.max(40, confidence - 15)
    factors.push('Degraded sensor reliability reduces recommendation confidence.')
  }
  if (scenario.timeOfDay === 'Night') {
    confidence = Math.max(40, confidence - 8)
    factors.push('Night conditions limit visual confirmation.')
  }

  // Score-based reasoning
  if (row.threatScore >= 70) {
    factors.push(`High threat score (${row.threatScore}/100) indicates immediate risk.`)
    action = row.actualType === 'Swarm' ? 'Engage' : 'Jam'
  } else if (row.threatScore >= 40) {
    factors.push(`Moderate threat score (${row.threatScore}/100) warrants active monitoring.`)
    action = 'Monitor'
  } else {
    factors.push(`Low threat score (${row.threatScore}/100) — likely non-hostile.`)
    action = 'Monitor'
  }

  // Operator action alignment
  if (row.operatorAction && row.operatorAction !== 'None') {
    if (row.operatorAction === action) {
      factors.push('Operator decision aligns with AI recommendation.')
      confidence = Math.min(95, confidence + 5)
    } else {
      factors.push(`Operator chose "${row.operatorAction}" — AI suggested "${action}".`)
    }
  }

  const explanation = `Rule-based recommendation: ${action}. ${factors.join(' ')}`

  return { action, confidence: Math.round(confidence), explanation, factors }
}

/**
 * Evaluate the overall session decisions and produce improvement suggestions.
 *
 * @param {object[]} rows - scored drone rows from scoring utility
 * @param {object} scenario
 * @returns {{ rating, suggestions }}
 */
export function evaluateSession(rows, scenario = {}) {
  const avgScore = rows.reduce((s, r) => s + (r.points || 0), 0) / Math.max(rows.length, 1)
  const missed = rows.filter((r) => !r.points || r.points === 0).length
  const suggestions = []

  if (avgScore < 50) suggestions.push('Focus on correctly identifying drone types before acting.')
  if (missed > 0)   suggestions.push(`${missed} drone(s) were missed or ignored — prioritise scanning the full radar.`)
  if (scenario.difficulty === 'Hard' && avgScore < 70) {
    suggestions.push('Hard scenarios require faster reactions. Aim under 5 s per decision.')
  }
  if (scenario.degradedSensors) {
    suggestions.push('With degraded sensors, use flight path and behaviour to infer type when sensor data is uncertain.')
  }
  if (suggestions.length === 0) suggestions.push('Strong performance — try a harder difficulty or degraded sensor mode.')

  const rating =
    avgScore >= 80 ? 'Excellent' :
    avgScore >= 60 ? 'Good' :
    avgScore >= 40 ? 'Needs practice' :
                     'Poor'

  return { rating, avgScore: Math.round(avgScore), suggestions }
}
