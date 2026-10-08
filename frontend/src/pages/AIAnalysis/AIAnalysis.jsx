import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

export default function AIAnalysis() {
  const { session, analysis, setAnalysis } = useSim()
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    if (session && !analysis) api.analyze(session).then(setAnalysis).catch((e) => setError(e.message))
  }, [session])

  if (!session) return <Navigate to="/setup" replace />

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">AI threat analysis</h1>
      {error && <p className="text-alert" role="alert">{error}</p>}
      {!analysis && !error && <p className="text-sand/60">The AI service is analysing your session...</p>}
      {analysis && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-sand/60"><tr>{['Drone', 'Actual type', 'AI classification', 'Threat score', 'AI recommends', 'You chose'].map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr></thead>
              <tbody className="font-mono">
                {analysis.rows.map((r) => (
                  <tr key={r.droneId} className="border-t border-line">
                    <td className="py-2 pr-4">{r.droneId}</td><td className="pr-4">{r.actualType}</td>
                    <td className={`pr-4 ${r.predictedType === r.actualType ? 'text-ok' : 'text-alert'}`}>{r.predictedType}</td>
                    <td className="pr-4">{r.threatScore}</td><td className="pr-4">{r.recommended}</td><td>{r.operatorAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-primary mt-5" onClick={() => nav('/results')}>View after-action report</button>
        </Card>
      )}
    </main>
  )
}
