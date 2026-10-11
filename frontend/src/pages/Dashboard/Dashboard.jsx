import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Stat from '../../components/common/Stat.jsx'
import BarChart from '../../components/charts/BarChart.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

const rate = (s) =>
  s >= 80 ? { label: 'Optimal',   cls: 'badge-low' }
  : s >= 60 ? { label: 'Elevated', cls: 'badge-medium' }
  : s >= 40 ? { label: 'Warning',  cls: 'badge-medium' }
  : { label: 'Critical', cls: 'badge-high' }

const fmtDate = (str) => {
  try {
    return new Date(str).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return str || '—'
  }
}

export default function Dashboard() {
  const { user } = useSim()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const h = await api.getHistory()
      setHistory(h)
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const hasDemo = history.some((h) => h.demo)

  // Derived statistics
  const n = history.length
  const avg = n ? Math.round(history.reduce((s, h) => s + (h.totalScore || 0), 0) / n) : 0
  const best = n ? Math.max(...history.map((h) => h.totalScore || 0)) : 0
  const totalDrones = history.reduce((s, h) => s + (h.totalDrones || 0), 0)
  const totalThreats = history.reduce((s, h) => s + (h.totalThreats || 0), 0)
  const threatsHandled = history.reduce((s, h) => s + (h.threatsHandled || 0), 0)
  const handleRate = totalThreats > 0 ? Math.round((threatsHandled / totalThreats) * 100) : 0

  // Threat severity breakdown
  const highCount = history.filter((h) => (h.totalScore || 0) < 50).length
  const medCount = history.filter((h) => (h.totalScore || 0) >= 50 && (h.totalScore || 0) < 75).length
  const lowCount = history.filter((h) => (h.totalScore || 0) >= 75).length

  // Chart data
  const chartData = history.slice(0, 8).reverse().map((h, i) => ({
    label: `#${n - (history.length - i - 1)}`,
    value: h.totalScore || 0,
  }))

  // Recent sessions
  const recent = history.slice(0, 6)

  // Demo helpers
  const handleLoadDemo = async () => {
    try {
      await api.loadDemoData()
      await refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Reset all session history and demo data?')) {
      await api.resetHistory()
      await refresh()
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* ── Welcome Heading & Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-sans">
              Welcome back, {user?.name || 'Operator'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>DEFENSE MATRIX ACTIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            AI Drone Threat Simulation & Decision Support Command Platform
          </p>
        </div>

        {/* Existing Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!hasDemo && (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="btn-secondary text-xs"
            >
              Load Sample Telemetry
            </button>
          )}

          {n > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary text-xs text-red-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40"
            >
              Reset Data
            </button>
          )}

          <Link
            to="/setup"
            className="btn-primary text-xs"
          >
            + Start New Scenario
          </Link>
        </div>
      </div>

      {/* ── Statistics Cards Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Missions Completed"
          value={n}
          sub="Total simulation runs"
          badge={{ text: 'ARCHIVED', cls: 'badge-dim' }}
        />
        <Stat
          label="Readiness Rating"
          value={`${avg}/100`}
          sub="Overall defense score"
          badge={{ text: 'AVG', cls: 'badge-medium' }}
        />
        <Stat
          label="Peak Tactical Score"
          value={best}
          sub="Personal record"
          badge={{ text: 'BEST', cls: 'badge-low' }}
        />
        <Stat
          label="Neutralization Ratio"
          value={totalThreats > 0 ? `${handleRate}%` : `${threatsHandled}`}
          sub={`${threatsHandled} neutralized of ${totalThreats || 0}`}
          progress={totalThreats > 0 ? handleRate : undefined}
          badge={{ text: 'DEFENSE', cls: 'badge-high' }}
        />
      </div>

      {/* ── Middle Section: Visual Charts & Analytics ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Distribution Card */}
        <div className="lg:col-span-5">
          <Card
            title="Threat Category Distribution"
            subtitle="Breakdown of simulated airframe threat intensity"
            icon="⚡"
          >
            <DonutChart
              high={highCount || 2}
              medium={medCount || 3}
              low={lowCount || 4}
            />

            {/* Active Network Assets */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#11141E] border border-white/[0.04]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Sensors
                </span>
                <span className="font-bold text-white">128</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#11141E] border border-white/[0.04]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Gateways
                </span>
                <span className="font-bold text-white">64</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#11141E] border border-white/[0.04]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Links
                </span>
                <span className="font-bold text-white">32</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#11141E] border border-white/[0.04]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Interceptors
                </span>
                <span className="font-bold text-white">256</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Score Trend Bar Chart */}
        <div className="lg:col-span-7">
          <Card
            title="Readiness Progression Curve"
            subtitle="Historical drill performance timeline (oldest to newest)"
            icon="📈"
            action={
              <Link to="/history" className="text-xs font-semibold text-[#FF4D5A] hover:text-white uppercase tracking-wider font-mono">
                Full Archive →
              </Link>
            }
          >
            <BarChart data={chartData} max={100} />

            {/* RF Signal Telemetry */}
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 uppercase tracking-wider">RF SPECTRUM & SIGNAL INTENSITY</span>
                <span className="text-[#FF4D5A] font-bold">NOMINAL</span>
              </div>
              <div className="w-full h-8 relative overflow-hidden">
                <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="w-full h-full animate-signal-glow">
                  <polyline
                    points="0,15 15,12 30,22 45,5 60,18 75,10 90,25 105,6 120,20 135,12 150,22 165,8 180,20 195,12 210,24 225,6 240,16 255,10 270,22 285,12 300,16"
                    fill="none"
                    stroke="#FF2A3A"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Recent Sessions Table ───────────────────────────────────────── */}
      <Card
        title="Recent Tactical Drills"
        subtitle={n > 0 ? `Displaying last ${recent.length} recorded training missions` : 'No sessions recorded yet'}
        icon="📋"
        noPad
      >
        {n === 0 ? (
          <div className="py-12 text-center space-y-3">
            <span className="text-3xl">🎯</span>
            <p className="text-sm font-semibold text-slate-300">No session telemetry recorded yet.</p>
            <p className="text-xs text-slate-500 font-mono">
              Click &quot;Load Sample Telemetry&quot; above or &quot;Start New Scenario&quot; to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table font-mono">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Scenario</th>
                  <th>Score</th>
                  <th>Defense Rating</th>
                  <th>Neutralized</th>
                  <th>Avg Reaction</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((h, i) => {
                  const rating = rate(h.totalScore || 0)
                  return (
                    <tr key={i}>
                      <td className="text-slate-500 font-semibold">{n - i}</td>
                      <td className="text-xs">
                        <span className="font-medium text-white">{fmtDate(h.date)}</span>
                        {h.demo && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/[0.08] text-slate-400 border border-white/[0.1]">
                            BENCHMARK
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-semibold text-white">{h.scenario?.difficulty ?? 'Standard'}</span>
                        <span className="text-slate-400 text-xs">
                          {' '}· {h.scenario?.terrain ?? 'Urban'} · {h.scenario?.timeOfDay ?? 'Day'}
                        </span>
                      </td>
                      <td className="font-bold text-white text-sm">
                        {h.totalScore ?? '—'}
                      </td>
                      <td>
                        <span className={rating.cls}>{rating.label}</span>
                      </td>
                      <td className="text-slate-300 font-medium">
                        {h.threatsHandled ?? '—'}{h.totalThreats != null ? `/${h.totalThreats}` : ''}
                      </td>
                      <td className="text-slate-400 text-xs">
                        {h.avgReaction != null ? `${h.avgReaction}s` : '—'}
                      </td>
                      <td className="text-right">
                        <Link
                          to="/history"
                          className="text-xs font-bold text-[#FF4D5A] hover:text-white uppercase tracking-wider"
                        >
                          Details ›
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  )
}