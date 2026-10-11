// Tactical decision matrix for counter-UAS evaluation
export const correctAction = (drone) => (drone.hostile ? (drone.type === 'Swarm' ? 'Engage' : 'Jam') : 'Monitor')

export function scoreDecision(drone, decision) {
  if (!decision) return { points: 0, note: 'Missed' }
  const right = decision.action === correctAction(drone)
  const fast = decision.reactionSec <= 5
  if (right && fast) return { points: 100, note: 'Correct and fast' }
  if (right) return { points: 70, note: 'Correct but slow' }
  if (drone.hostile && decision.action === 'Monitor') return { points: 0, note: 'Ignored a hostile drone' }
  if (!drone.hostile && decision.action === 'Engage') return { points: 0, note: 'Engaged a harmless drone' }
  return { points: 30, note: 'Partly correct' }
}
