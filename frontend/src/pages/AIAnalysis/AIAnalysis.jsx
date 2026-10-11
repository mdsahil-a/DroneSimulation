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
    if (session && !analysis) {
      api.analyze(session).then(setAnalysis).catch((e) => setError(e.message))
    }
  }, [session])

  if (!session) return <Navigate to="/setup" replace />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-sans">
            AI Threat Intelligence & Decision Support
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Machine learning inference audit: Random Forest classifier + threat score regression
          </p>
        </div>
        {analysis && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-mono">
            Model Accuracy: {Math.round((analysis.modelAccuracy || 0.92) * 100)}%
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-mono">
          {error}
        </div>
      )}

      {!analysis && !error && (
        <Card>
          <div className="py-16 text-center space-y-3 font-mono">
            <div className="w-10 h-10 border-3 border-[#FF2A3A] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_12px_rgba(255,42,58,0.5)]" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              Running neural inference pipeline on intercepted telemetry...
            </p>
            <p className="text-xs text-slate-400">
              Evaluating kinematic trajectory vectors, radar cross-sections & RF telemetry
            </p>
          </div>
        </Card>
      )}

      {analysis && (
        <Card
          title="Telemetry Classification & Countermeasure Recommendations"
          subtitle="Comparison of actual drone signatures vs ML predicted vectors"
          icon="🧠"
          noPad
        >
          <div className="overflow-x-auto">
            <table className="data-table font-mono">
              <thead>
                <tr>
                  <th>Target ID</th>
                  <th>Ground Truth Signature</th>
                  <th>AI Predicted Type</th>
                  <th>Threat Score</th>
                  <th>Recommended Countermeasure</th>
                  <th>Operator Action</th>
                </tr>
              </thead>
              <tbody>
                {analysis.rows.map((r) => {
                  const match = r.predictedType === r.actualType
                  return (
                    <tr key={r.droneId}>
                      <td className="font-bold text-white">{r.droneId}</td>
                      <td className="text-slate-200 font-medium">{r.actualType}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            match
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          <span>{match ? '✓' : '⚠'}</span>
                          <span>{r.predictedType}</span>
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            r.threatScore >= 70
                              ? 'bg-red-500/20 text-[#FF4D5A] border border-red-500/40'
                              : r.threatScore >= 40
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {r.threatScore}
                        </span>
                      </td>
                      <td className="font-bold text-white">{r.recommended}</td>
                      <td className="font-medium text-slate-300">{r.operatorAction}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-white/[0.08] flex justify-end">
            <button
              className="btn-primary text-xs"
              onClick={() => nav('/results')}
            >
              Generate After-Action Mission Debrief →
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
