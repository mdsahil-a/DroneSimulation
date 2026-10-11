import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

const Select = ({ label, value, options, onChange }) => (
  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
    {label}
    <select
      className="input mt-1.5 font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} className="bg-[#10131B] text-white">{o}</option>
      ))}
    </select>
  </label>
)

export default function ScenarioSetup() {
  const [cfg, setCfg] = useState({
    difficulty: 'Medium',
    timeOfDay: 'Day',
    terrain: 'Urban',
    droneCount: 6,
    degradedSensors: false,
  })
  const { setScenario, setSession, setAnalysis } = useSim()
  const nav = useNavigate()
  const set = (k) => (v) => setCfg({ ...cfg, [k]: v })

  const start = async () => {
    setSession(null)
    setAnalysis(null)
    setScenario(await api.saveScenario(cfg))
    nav('/simulation')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-sans">
          Scenario Configuration & Mission Setup
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Customize aerial threat parameters, radar environment, and target density
        </p>
      </div>

      <Card
        title="Tactical Airspace Parameters"
        subtitle="Define environmental condition factors and hostile engagement rules"
        icon="⚙"
      >
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Threat Difficulty"
              value={cfg.difficulty}
              options={['Easy', 'Medium', 'Hard']}
              onChange={set('difficulty')}
            />
            <Select
              label="Operational Time of Day"
              value={cfg.timeOfDay}
              options={['Day', 'Night']}
              onChange={set('timeOfDay')}
            />
            <Select
              label="Terrain Geography"
              value={cfg.terrain}
              options={['Urban', 'Rural', 'Border Perimeter']}
              onChange={set('terrain')}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Target Drone Swarm Size</span>
                <span className="font-mono text-[#FF4D5A] bg-white/[0.08] px-2 py-0.5 rounded border border-white/[0.08]">
                  {cfg.droneCount} Units
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                className="w-full accent-[#FF2A3A] cursor-pointer mt-2"
                value={cfg.droneCount}
                onChange={(e) => set('droneCount')(+e.target.value)}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 (Single)</span>
                <span>8 (Squadron)</span>
                <span>15 (Full Swarm)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08]">
            <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#FF2A3A] accent-[#FF2A3A] cursor-pointer"
                checked={cfg.degradedSensors}
                onChange={(e) => set('degradedSensors')(e.target.checked)}
              />
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-xs">Degraded Electronic Countermeasures (ECM)</p>
                <p className="text-[11px] text-slate-400">
                  Simulates radar ground clutter, multipath RF reflections, and decoy transponder signatures.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => nav('/dashboard')}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              onClick={start}
            >
              Deploy & Begin Simulation →
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
