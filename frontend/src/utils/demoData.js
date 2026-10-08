
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toLocaleString()

const make = (days, difficulty, terrain, timeOfDay, totalScore, threatsHandled, avgReaction) => ({
  demo: true,
  date: daysAgo(days),
  scenario: { difficulty, terrain, timeOfDay, droneCount: 6, degradedSensors: difficulty === 'Hard' },
  totalScore, threatsHandled, avgReaction,
})

export const DEMO_SESSIONS = [
  make(0, 'Hard',   'Urban', 'Night', 84, 5, 3.1),
  make(1, 'Hard',   'Rural', 'Day',   79, 5, 3.6),
  make(2, 'Medium', 'Urban', 'Night', 72, 4, 4.2),
  make(3, 'Medium', 'Rural', 'Day',   64, 4, 5.0),
  make(4, 'Easy',   'Urban', 'Day',   55, 3, 6.1),
  make(5, 'Easy',   'Rural', 'Day',   46, 2, 7.4),
]