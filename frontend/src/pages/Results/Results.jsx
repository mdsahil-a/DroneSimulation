import { useEffect, useMemo, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Stat from '../../components/common/Stat.jsx'
import { api } from '../../services/api.js'
import { scoreDecision } from '../../utils/scoring.js'
import { useSim } from '../../store/SimContext.jsx'

export default function Results() {
  const { session, analysis, scenario } = useSim()
  const saved = useRef(false)

  const report = useMemo(() => {
    if (!session) return null
    const rows = session.drones.map((d) => ({ drone: d, ...scoreDecision(d, session.decisions.find((x) => x.droneId === d.id)) }))
    const totalScore = Math.round(rows.reduce((s, r) => s + r.points, 0) / Math.max(rows.length, 1))
    const hostile = session.drones.filter((d) => d.hostile)
    const handled = hostile.filter((d) => session.decisions.some((x) => x.droneId === d.id && x.action !== 'Monitor')).length
    const correct = rows.filter((r) => r.points >= 70).length
    const avgReaction = session.decisions.length ? +(session.decisions.reduce((s, d) => s + d.reactionSec, 0) / session.decisions.length).toFixed(1) : 0
    return { rows, totalScore, handled, hostile: hostile.length, avgReaction, correct, total: rows.length }
  }, [session])

  useEffect(() => {
    if (report && !saved.current) {
      saved.current = true
      api.saveResult({
        id: scenario?.id,
        date: new Date().toLocaleString(),
        scenario,
        totalScore: report.totalScore,
        threatsHandled: report.handled,
        totalThreats: report.hostile,
        decisionAccuracy: Math.round((report.correct / Math.max(report.total, 1)) * 100),
        totalDrones: report.total,
        avgReaction: report.avgReaction,
      })
    }
  }, [report])

  if (!session) return <Navigate to="/setup" replace />

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">After-action report</h1>
      <Card className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Overall score" value={report.totalScore} tone="text-amber" />
        <Stat label="Threats handled" value={`${report.handled}/${report.hostile}`} />
        <Stat label="Avg reaction (s)" value={report.avgReaction} />
        <Stat label="AI model accuracy" value={analysis ? `${Math.round(analysis.modelAccuracy * 100)}%` : '-'} />
      </Card>
      <Card title="Decision review">
        <ul className="divide-y divide-line text-sm">
          {report.rows.map(({ drone, points, note }) => (
            <li key={drone.id} className="flex justify-between py-2">
              <span className="font-mono">{drone.id} ({drone.type})</span>
              <span className="text-sand/70">{note}</span>
              <span className={`font-mono ${points >= 70 ? 'text-ok' : 'text-alert'}`}>{points}</span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex gap-3">
        <Link to="/setup" className="btn-primary">Run another scenario</Link>
        <Link to="/history" className="btn-ghost">View history</Link>
      </div>
    </main>
  )
}