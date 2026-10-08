import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Stat from '../../components/common/Stat.jsx'
import BarChart from '../../components/charts/BarChart.jsx'
import { api } from '../../services/api.js'

const rate = (s) =>
  s >= 80 ? { label: 'Excellent', cls: 'bg-ok/15 text-ok' }
  : s >= 60 ? { label: 'Good', cls: 'bg-amber/15 text-amber' }
  : s >= 40 ? { label: 'Needs practice', cls: 'bg-amber/15 text-amber' }
  : { label: 'Poor', cls: 'bg-alert/15 text-alert' }

export default function History() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.getHistory().then(setRows) }, [])

  if (rows === null) return <main className="p-6">Loading...</main>

  const n = rows.length
  const avg = n ? Math.round(rows.reduce((s, r) => s + r.totalScore, 0) / n) : 0
  const best = n ? Math.max(...rows.map((r) => r.totalScore)) : 0
  const change = n > 1 ? rows[0].totalScore - rows[n - 1].totalScore : 0   // newest minus oldest
  const trend = rows.slice(0, 10).reverse().map((r, i) => ({ label: `#${i + 1}`, value: r.totalScore }))

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Performance history</h1>
        <Link to="/setup" className="btn-primary">Start new scenario</Link>
      </div>

      {n === 0 ? (
        <Card><p className="text-sand/60">No sessions yet. Run a scenario, or load demo data on the dashboard.</p></Card>
      ) : (
        <>
          <Card className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Sessions completed" value={n} />
            <Stat label="Average score" value={avg} tone="text-amber" />
            <Stat label="Best score" value={best} tone="text-ok" />
            <Stat label="Change since first session" value={`${change >= 0 ? '+' : ''}${change}`} tone={change >= 0 ? 'text-ok' : 'text-alert'} />
          </Card>

          <Card title="Score trend (oldest to newest)">
            <BarChart data={trend} />
          </Card>

          <Card title="All sessions">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-sand/60">
                  <tr>{['#', 'Date', 'Scenario', 'Score', 'Rating', 'Decision accuracy', 'Threats handled', 'Avg reaction'].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="font-mono">
                  {rows.map((r, i) => {
                    const t = rate(r.totalScore)
                    return (
                      <tr key={i} className="border-t border-line">
                        <td className="py-2 pr-4">{n - i}</td>
                        <td className="pr-4">{r.date}{r.demo && <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-xs">demo</span>}</td>
                        <td className="pr-4">{r.scenario.difficulty}, {r.scenario.terrain}, {r.scenario.timeOfDay}</td>
                        <td className="pr-4 text-amber">{r.totalScore}</td>
                        <td className="pr-4"><span className={`rounded px-2 py-0.5 font-sans text-xs ${t.cls}`}>{t.label}</span></td>
                        <td className="pr-4">{r.decisionAccuracy != null ? `${r.decisionAccuracy}%` : '-'}</td>
                        <td className="pr-4">{r.threatsHandled}{r.totalThreats != null ? `/${r.totalThreats}` : ''}</td>
                        <td>{r.avgReaction}s</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </main>
  )
}