import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Stat from '../../components/common/Stat.jsx'
import BarChart from '../../components/charts/BarChart.jsx'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

export default function Dashboard() {
  const { user } = useSim()
  const [history, setHistory] = useState([])
  const refresh = () => api.getHistory().then(setHistory)
  useEffect(() => { refresh() }, [])

  const hasDemo = history.some((h) => h.demo)
  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.totalScore, 0) / history.length) : 0
  const best = history.length ? Math.max(...history.map((h) => h.totalScore)) : 0

  const loadDemo = async () => { await api.loadDemoData(); refresh() }
  const reset = async () => { await api.resetHistory(); refresh() }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={loadDemo}>Load demo data</button>
          <button className="btn-ghost" onClick={reset}>Reset data</button>
          <Link to="/setup" className="btn-primary">Start new scenario</Link>
        </div>
      </div>

      {hasDemo && (
        <p className="rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber" role="status">
          Demo data: sample sessions are included. Sessions you run now are added on top.
        </p>
      )}

      <Card className="grid grid-cols-3 gap-6">
        <Stat label="Sessions completed" value={history.length} />
        <Stat label="Average score" value={avg} tone="text-amber" />
        <Stat label="Best score" value={best} tone="text-ok" />
      </Card>
      <Card title="Last 6 sessions (oldest to newest)">
        <BarChart data={history.slice(0, 6).reverse().map((h, i) => ({ label: `#${i + 1}`, value: h.totalScore }))} />
      </Card>
    </main>
  )
}