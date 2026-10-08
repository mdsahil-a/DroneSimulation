import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

const Select = ({ label, value, options, onChange }) => (
  <label className="block text-sm">{label}
    <select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>
)

export default function ScenarioSetup() {
  const [cfg, setCfg] = useState({ difficulty: 'Medium', timeOfDay: 'Day', terrain: 'Urban', droneCount: 5, degradedSensors: false })
  const { setScenario, setSession, setAnalysis } = useSim()
  const nav = useNavigate()
  const set = (k) => (v) => setCfg({ ...cfg, [k]: v })

  const start = async () => {
    setSession(null); setAnalysis(null)          // clear the previous run
    setScenario(await api.saveScenario(cfg))
    nav('/simulation')
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Card title="Set up your scenario">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Difficulty" value={cfg.difficulty} options={['Easy', 'Medium', 'Hard']} onChange={set('difficulty')} />
          <Select label="Time of day" value={cfg.timeOfDay} options={['Day', 'Night']} onChange={set('timeOfDay')} />
          <Select label="Terrain" value={cfg.terrain} options={['Urban', 'Rural']} onChange={set('terrain')} />
          <label className="block text-sm">Number of drones: {cfg.droneCount}
            <input type="range" min="1" max="20" className="mt-3 w-full accent-amber" value={cfg.droneCount} onChange={(e) => set('droneCount')(+e.target.value)} />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-amber" checked={cfg.degradedSensors} onChange={(e) => set('degradedSensors')(e.target.checked)} />
          Degraded sensors (radar noise and false targets)
        </label>
        <button className="btn-primary mt-6" onClick={start}>Begin simulation</button>
      </Card>
    </main>
  )
}
