import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Stat from '../../components/common/Stat.jsx'
import BarChart from '../../components/charts/BarChart.jsx'
import { api } from '../../services/api.js'

const rate = (s) =>
  s >= 80 ? { label: 'Optimal',   cls: 'badge-low' }
  : s >= 60 ? { label: 'Elevated', cls: 'badge-medium' }
  : s >= 40 ? { label: 'Warning',  cls: 'badge-medium' }
  : { label: 'Critical', cls: 'badge-high' }

const fmtDate = (str) => {
  try { return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return str || '—' }
}

export default function History() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    api.getHistory().then(setRows).catch(() => setRows([]))
  }, [])

  if (rows === null) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-slate-400 font-mono">
        <svg className="w-5 h-5 animate-spin mr-2 text-[#FF2A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Loading mission telemetry archives…
      </div>
    )
  }

  const n = rows.length
  const avg = n ? Math.round(rows.reduce((s, r) => s + (r.totalScore || 0), 0) / n) : 0
  const best = n ? Math.max(...rows.map((r) => r.totalScore || 0)) : 0
  const change = n > 1 ? (rows[0].totalScore || 0) - (rows[n - 1].totalScore || 0) : 0
  const trend = rows.slice(0, 10).reverse().map((r, i) => ({ label: `#${i + 1}`, value: r.totalScore || 0 }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-sans">Mission Reports & Telemetry</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Audit log of all completed drone threat interception runs</p>
        </div>
        <Link to="/setup" className="btn-primary text-xs">
          + Start New Scenario
        </Link>
      </div>

      {n === 0 ? (
        <Card>
          <div className="py-12 text-center space-y-3 font-mono">
            <span className="text-3xl">📋</span>
            <p className="text-sm font-semibold text-slate-300">No session telemetry recorded yet.</p>
            <p className="text-xs text-slate-500">Run a scenario or load sample telemetry from the dashboard.</p>
            <Link to="/dashboard" className="btn-secondary text-xs inline-flex mt-2">
              Go to Dashboard
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Missions Completed"
              value={n}
              sub="Total tracked drills"
              badge={{ text: 'ARCHIVED', cls: 'badge-dim' }}
            />
            <Stat
              label="Average Readiness Score"
              value={avg}
              sub="Across all scenarios"
              badge={{ text: 'AVG', cls: 'badge-medium' }}
            />
            <Stat
              label="Peak Tactical Score"
              value={best}
              sub="Personal record"
              badge={{ text: 'BEST', cls: 'badge-low' }}
            />
            <Stat
              label="Performance Progression"
              value={`${change >= 0 ? '+' : ''}${change}`}
              sub="Since first evaluation"
              badge={{
                text: change >= 0 ? 'IMPROVING' : 'ATTENTION',
                cls: change >= 0 ? 'badge-low' : 'badge-high',
              }}
            />
          </div>

          {/* Score trend */}
          <Card
            title="Readiness Progression Curve"
            subtitle="Historical performance timeline (oldest to newest)"
            icon="📈"
          >
            <BarChart data={trend} max={100} />
          </Card>

          {/* Sessions table */}
          <Card title="Mission Telemetry Archive" subtitle={`${n} evaluated training sessions`} icon="📂" noPad>
            <div className="overflow-x-auto">
              <table className="data-table font-mono">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Timestamp</th>
                    <th>Operational Context</th>
                    <th>Tactical Score</th>
                    <th>Defense Rating</th>
                    <th>Decision Accuracy</th>
                    <th>Threats Handled</th>
                    <th>Reaction Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const t = rate(r.totalScore || 0)
                    return (
                      <tr key={i}>
                        <td className="text-slate-500 font-semibold">{n - i}</td>
                        <td className="text-xs">
                          <span className="font-medium text-white">{fmtDate(r.date)}</span>
                          {r.demo && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/[0.08] text-slate-400 border border-white/[0.1]">
                              BENCHMARK
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="font-semibold text-white">{r.scenario?.difficulty ?? 'Standard'}</span>
                          <span className="text-slate-400 text-xs">
                            {' '}· {r.scenario?.terrain ?? 'Urban'} · {r.scenario?.timeOfDay ?? 'Day'}
                          </span>
                        </td>
                        <td className="font-bold text-white text-sm">{r.totalScore ?? '—'}</td>
                        <td>
                          <span className={t.cls}>{t.label}</span>
                        </td>
                        <td className="text-slate-300 font-medium">
                          {r.decisionAccuracy != null ? `${r.decisionAccuracy}%` : '—'}
                        </td>
                        <td className="text-slate-300 font-medium">
                          {r.threatsHandled ?? '—'}{r.totalThreats != null ? `/${r.totalThreats}` : ''}
                        </td>
                        <td className="text-slate-400 text-xs">
                          {r.avgReaction != null ? `${r.avgReaction}s` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}