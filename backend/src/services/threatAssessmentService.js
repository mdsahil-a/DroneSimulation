// Threat Assessment Service
// Heuristic engine producing threat scores (0–100), classifications, and telemetry rationale.

const TYPE_BASE_SCORE = {
  Armed:      75,
  Swarm:      80,
  Surveillance: 45,
  Commercial: 15,
}

const DIFFICULTY_MULTIPLIER = { Easy: 0.8, Medium: 1.0, Hard: 1.25 }

/**
 * Score a single drone object from a simulation session.
 *
 * @param {object} drone  - { id, type, hostile, x, y, speed, spawnAt }
 * @param {object} opts   - { difficulty, degradedSensors, timeOfDay }
 * @returns {{ droneId, threatScore, threatLevel, confidence, explanation, recommended }}
 */
export function assessThreat(drone, opts = {}) {
  const { difficulty = 'Medium', degradedSensors = false, timeOfDay = 'Day' } = opts

  let score = TYPE_BASE_SCORE[drone.type] ?? 30

  // Distance from protected centre (0.5, 0.5) in normalised coords
  const dx = drone.x - 0.5
  const dy = drone.y - 0.5
  const distFromCentre = Math.sqrt(dx * dx + dy * dy)
  const proximityBonus = Math.round((1 - distFromCentre / 0.5) * 20)
  score += proximityBonus

  // Speed factor: fast drone increases threat
  if (drone.speed > 0.001) score += 10

  // Environmental factors
  if (timeOfDay === 'Night') score += 8
  if (degradedSensors) score -= 10

  // Difficulty multiplier
  score = Math.round(score * (DIFFICULTY_MULTIPLIER[difficulty] ?? 1.0))

  // Clamp 0–100
  score = Math.min(100, Math.max(0, score))

  const confidence = degradedSensors
    ? Math.round(55 + Math.random() * 30)
    : Math.round(70 + Math.random() * 28)

  // Classification
  const threatLevel = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low'

  // Recommended action
  const recommended =
    drone.type === 'Swarm'        ? 'Engage' :
    score >= 65                   ? 'Jam' :
    score >= 35                   ? 'Monitor' :
                                    'Monitor'

  // Build explanation
  const parts = []
  parts.push(`Drone airframe "${drone.type}" has a base threat weight of ${TYPE_BASE_SCORE[drone.type] ?? 30}.`)
  if (proximityBonus > 10) parts.push('Target is approaching the protected defense zone.')
  if (drone.speed > 0.001) parts.push('Elevated approach velocity detected.')
  if (timeOfDay === 'Night') parts.push('Night conditions affect visual confirmation.')
  if (degradedSensors)       parts.push('Sensor noise affects observation confidence.')
  parts.push(`Computed threat score: ${score}/100 (${threatLevel}).`)

  return {
    droneId:     drone.id,
    threatScore: score,
    threatLevel,
    confidence,
    explanation: parts.join(' '),
    recommended,
  }
}

/**
 * Classify drone type based on observed telemetry vector patterns.
 */
export function classifyDrone(drone, degradedSensors = false) {
  const errorRate = degradedSensors ? 0.30 : 0.12
  if (Math.random() < errorRate) {
    const others = ['Commercial', 'Surveillance', 'Armed', 'Swarm'].filter((t) => t !== drone.type)
    return others[Math.floor(Math.random() * others.length)]
  }
  return drone.type
}
