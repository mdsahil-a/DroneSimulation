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
    const rows = session.drones.map((d) => ({
      drone: d,
      ...scoreDecision(d, session.decisions.find((x) => x.droneId === d.id)),
    }))
    const totalScore = Math.round(
      rows.reduce((s, r) => s + r.points, 0) / Math.max(rows.length, 1)
    )
    const hostile = session.drones.filter((d) => d.hostile)
    const handled = hostile.filter((d) =>
      session.decisions.some((x) => x.droneId === d.id && x.action !== 'Monitor')
    ).length
    const correct = rows.filter((r) => r.points >= 70).length
    const avgReaction = session.decisions.length
      ? +(
          session.decisions.reduce((s, d) => s + d.reactionSec, 0) /
          session.decisions.length
        ).toFixed(1)
      : 0
    return {
      rows,
      totalScore,
      handled,
      hostile: hostile.length,
      avgReaction,
      correct,
      total: rows.length,
    }
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
        decisionAccuracy: Math.round(
          (report.correct / Math.max(report.total, 1)) * 100
        ),
        totalDrones: report.total,
        avgReaction: report.avgReaction,
      })
    }
  }, [report])

  if (!session) return <Navigate to="/setup" replace />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-sans">
            After-Action Evaluation & Mission Debrief
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Quantitative operator scoring, tactical reaction metrics & countermeasure validation
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link to="/setup" className="btn-primary text-xs">
            + Run Another Drill
          </Link>
          <Link to="/history" className="btn-secondary text-xs">
            View All Reports
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Overall Tactical Score"
          value={report.totalScore}
          sub="Evaluation index out of 100"
          badge={{
            text: report.totalScore >= 75 ? 'OPTIMAL' : 'NEEDS REVIEW',
            cls:
              report.totalScore >= 75
                ? 'badge-low'
                : 'badge-medium',
          }}
        />
        <Stat
          label="Threats Neutralized"
          value={`${report.handled} / ${report.hostile}`}
          sub="Hostile targets resolved"
          badge={{ text: 'DEFENSE', cls: 'badge-high' }}
        />
        <Stat
          label="Avg Reaction Latency"
          value={`${report.avgReaction}s`}
          sub="Seconds from detection to action"
          badge={{
            text: report.avgReaction < 4 ? 'FAST' : 'STANDARD',
            cls: 'badge-purple',
          }}
        />
        <Stat
          label="AI Model Precision"
          value={analysis ? `${Math.round(analysis.modelAccuracy * 100)}%` : '92%'}
          sub="Decision alignment confidence"
          badge={{ text: 'VALIDATED', cls: 'badge-low' }}
        />
      </div>

      {/* Decision Review Breakdown */}
      <Card
        title="Engagement Breakdown & Tactical Decisions"
        subtitle="Individual drone interception outcomes scored against doctrine"
        icon="🎯"
        noPad
      >
        <div className="overflow-x-auto">
          <table className="data-table font-mono">
            <thead>
              <tr>
                <th>Drone ID & Type</th>
                <th>Classification</th>
                <th>Operator Action & Evaluation Note</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map(({ drone, points, note }) => (
                <tr key={drone.id}>
                  <td>
                    <span className="font-bold text-white">{drone.id}</span>
                    <span className="text-xs text-slate-400 ml-2">({drone.type})</span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        drone.hostile
                          ? 'bg-red-500/20 text-[#FF4D5A] border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {drone.hostile ? 'Hostile Target' : 'Permitted Civilian'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-200">
                    {note}
                  </td>
                  <td className="text-right">
                    <span
                      className={`font-bold text-sm ${
                        points >= 70 ? 'text-emerald-400' : 'text-[#FF4D5A]'
                      }`}
                    >
                      {points} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}