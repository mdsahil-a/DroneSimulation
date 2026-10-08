import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import RadarView from '../../components/radar/RadarView.jsx'
import { useTimer } from '../../hooks/useTimer.js'
import { generateDrones } from '../../utils/generateDrones.js'
import { useSim } from '../../store/SimContext.jsx'

const ACTIONS = ['Monitor', 'Jam', 'Engage', 'Alert command']
const DURATION = 60 // seconds

export default function LiveSimulation() {
  const { scenario, setSession } = useSim()
  const nav = useNavigate()
  const allDrones = useMemo(() => (scenario ? generateDrones(scenario) : []), [scenario])
  const [drones, setDrones] = useState(() => allDrones.map((d) => ({ ...d, handled: false })))
  const [selected, setSelected] = useState(null)
  const [decisions, setDecisions] = useState([])
  const [log, setLog] = useState([])
  const time = useTimer(true)
  const finished = useRef(false)

  // Move spawned drones towards the centre
  useEffect(() => {
    setDrones((ds) => ds.map((d) => (d.spawnAt > time || d.handled ? d : { ...d, x: d.x + (0.5 - d.x) * d.speed * 10, y: d.y + (0.5 - d.y) * d.speed * 10 })))
  }, [time])

  const finish = () => {
    if (finished.current) return
    finished.current = true
    setSession({ scenario, drones: allDrones, decisions, duration: time })
    nav('/analysis')
  }

  useEffect(() => {
    if (time >= DURATION || (drones.length && drones.every((d) => d.handled))) finish()
  })

  if (!scenario) return <Navigate to="/setup" replace />

  const visible = drones.filter((d) => d.spawnAt <= time)
  const current = drones.find((d) => d.id === selected)

  const act = (action) => {
    if (!current || current.handled) return
    const reactionSec = +(time - current.spawnAt).toFixed(1)
    setDecisions((d) => [...d, { droneId: current.id, action, reactionSec }])
    setDrones((ds) => ds.map((d) => (d.id === current.id ? { ...d, handled: true } : d)))
    setLog((l) => [`${time.toFixed(1)}s  ${current.id}: ${action}`, ...l])
    setSelected(null)
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-2xl">{time.toFixed(1)}s / {DURATION}s</p>
          <p className="text-sm text-sand/60">{scenario.terrain}, {scenario.timeOfDay}, {scenario.difficulty}</p>
        </div>
        <RadarView drones={visible} selectedId={selected} onSelect={setSelected} sensorNoise={scenario.degradedSensors} />
      </div>
      <div className="space-y-4">
        <Card title="Threat status">
          {current ? (
            <>
              <p className="font-mono text-lg">{current.id}</p>
              <p className="mb-3 text-sm text-sand/60">Judge it from its behaviour, then choose a response.</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map((a) => <button key={a} className="btn-ghost" onClick={() => act(a)}>{a}</button>)}
              </div>
            </>
          ) : <p className="text-sm text-sand/60">Select a drone on the radar to respond.</p>}
        </Card>
        <Card title="Operator log">
          <ul className="max-h-48 space-y-1 overflow-auto font-mono text-xs">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </Card>
        <button className="btn-ghost w-full" onClick={finish}>End session</button>
      </div>
    </main>
  )
}
