// Procedural generation: random drones each session so trainees cannot memorise.
const TYPES = ['Commercial', 'Surveillance', 'Armed', 'Swarm']
let uid = 0
export function generateDrones({ droneCount, difficulty }) {
  const hostileChance = { Easy: 0.4, Medium: 0.6, Hard: 0.8 }[difficulty] ?? 0.6
  return Array.from({ length: droneCount }, () => {
    const hostile = Math.random() < hostileChance
    const type = hostile ? TYPES[2 + Math.round(Math.random())] : TYPES[Math.round(Math.random())]
    const angle = Math.random() * Math.PI * 2
    return {
      id: `D${++uid}`, type, hostile,
      x: 0.5 + Math.cos(angle) * 0.48, y: 0.5 + Math.sin(angle) * 0.48,   // start at radar edge
      speed: 0.0008 + Math.random() * 0.0012 * (difficulty === 'Hard' ? 2 : 1),
      spawnAt: Math.random() * 15,                                          // seconds into session
    }
  })
}
