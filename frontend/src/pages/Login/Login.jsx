import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useSim } from '../../store/SimContext.jsx'

const OPERATOR_PROFILES = [
  { username: 'operator', password: 'demo1234', label: 'Tactical Operator', role: 'Operator' },
  { username: 'trainee',  password: 'demo1234', label: 'Defense Trainee',  role: 'Trainee'  },
]

export default function Login() {
  const [form, setForm] = useState({ username: 'operator', password: 'demo1234' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useSim()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.login(form.username, form.password)
      localStorage.setItem('token', token)
      setUser(user)
      nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify username and password.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u, p) => {
    setError('')
    setForm({ username: u, password: p })
  }

  return (
    <div className="min-h-screen bg-[#07080B] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-4xl bg-[#0E1118] rounded-2xl sm:rounded-3xl shadow-2xl border border-white/[0.08] overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[92vh]">
        {/* Left Panel: Platform Overview */}
        <div className="lg:col-span-5 bg-[#090C12] p-6 sm:p-8 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2A3A] to-[#B91C1C] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_14px_rgba(255,42,58,0.4)] shrink-0">
                  D
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-wider uppercase font-sans leading-tight">
                    Drone Threat Trainer
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    DEFENSE TRAINING ENVIRONMENT
                  </span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-tight font-sans tracking-wide text-white pt-1">
                Drone Threat Simulation & Decision Support
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                A simulation-based training platform for practising drone-threat assessment, operator decisions, and post-exercise performance evaluation.
              </p>
            </div>

            {/* Radar Scope Visual */}
            <div className="p-3 rounded-xl bg-[#0D1017]/90 border border-white/[0.06] flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="miniSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF2A3A" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FF2A3A" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <circle cx="50" cy="50" r="48" fill="#06080C" stroke="#FF2A3A" strokeWidth="0.8" strokeOpacity="0.4" />
                  <circle cx="50" cy="50" r="16" fill="none" stroke="#FF2A3A" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="32" fill="none" stroke="#FF2A3A" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#FF2A3A" strokeWidth="0.8" strokeOpacity="0.5" />

                  <line x1="50" y1="4" x2="50" y2="96" stroke="#FF2A3A" strokeWidth="0.4" strokeOpacity="0.25" />
                  <line x1="4" y1="50" x2="96" y2="50" stroke="#FF2A3A" strokeWidth="0.4" strokeOpacity="0.25" />

                  <g className="animate-radar-sweep" style={{ transformOrigin: '50px 50px' }}>
                    <path d="M 50 50 L 50 4 A 46 46 0 0 0 18 18 Z" fill="url(#miniSweep)" />
                    <line x1="50" y1="50" x2="50" y2="4" stroke="#FF3B30" strokeWidth="1.2" strokeOpacity="0.9" />
                  </g>

                  <circle cx="50" cy="50" r="3" fill="#FF8C00" stroke="#FF2A3A" strokeWidth="0.8" />
                  <circle cx="68" cy="28" r="2" fill="#FF2A3A" className="animate-ping" style={{ transformOrigin: '68px 28px', animationDuration: '3s' }} />
                  <circle cx="68" cy="28" r="2" fill="#FF2A3A" />
                  <circle cx="32" cy="65" r="1.8" fill="#FF9500" />
                  <circle cx="72" cy="70" r="1.8" fill="#10B981" />
                </svg>
              </div>

              <div className="font-mono text-[10px] space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[#FF4D5A] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A3A] animate-pulse" />
                  <span>AIRSPACE TELEMETRY GRID</span>
                </div>
                <p className="text-slate-400">SCOPE: 20 KM RANGE</p>
                <p className="text-slate-500">BEARING: 000°–360° CONTINUOUS</p>
              </div>
            </div>

            {/* Core Training Features */}
            <div className="space-y-2.5 font-mono pt-1">
              {[
                {
                  title: 'Simulated Radar & Target Tracking',
                  desc: 'Airspace scope rendering kinematic flight vectors, bearing, and proximity alerts.',
                },
                {
                  title: 'Machine-Learning-Assisted Threat Analysis',
                  desc: 'Dual-model telemetry classification and threat scoring for decision support.',
                },
                {
                  title: 'Operator Performance & After-Action Reports',
                  desc: 'Quantitative debriefs evaluating decision accuracy, reaction latency, and tactics.',
                },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A3A] mt-1.5 shrink-0 shadow-[0_0_6px_rgba(255,42,58,0.7)]" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white tracking-wide text-[11px] leading-tight">
                      {f.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 text-[10px] text-slate-500 font-mono border-t border-white/[0.06] mt-4 flex items-center justify-between">
            <span>Tactical Command Terminal</span>
            <span className="text-slate-400">Airspace Defense Matrix</span>
          </div>
        </div>

        {/* Right Panel: Authentication Console */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#0E1118]">
          <div className="max-w-sm w-full mx-auto space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wider uppercase font-sans">
                  Operator Authentication
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/[0.08] text-slate-300 border border-white/[0.08]">
                  SECURE ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Enter authorized training credentials to access the console
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 text-xs font-mono flex items-start gap-2 animate-in fade-in duration-150">
                <span className="text-sm shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Operator Identifier / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. operator"
                    className="input font-mono pl-3 pr-8 text-sm focus:border-[#FF2A3A] focus:ring-1 focus:ring-[#FF2A3A]/40"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-mono pointer-events-none">
                    ID
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Security Passkey / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="input font-mono pl-3 pr-10 text-sm focus:border-[#FF2A3A] focus:ring-1 focus:ring-[#FF2A3A]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white transition-colors rounded focus:outline-none focus:ring-1 focus:ring-red-500/30"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF2A3A] hover:bg-[#E02433] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider font-mono transition-all shadow-[0_2px_12px_rgba(255,42,58,0.25)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Authenticating Operator...</span>
                  </>
                ) : (
                  <span>Sign In to Surveillance Terminal →</span>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-slate-300 uppercase tracking-wider">QUICK ACCESS PROFILES</span>
                <span className="text-slate-500 text-[10px]">One-click profile fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {OPERATOR_PROFILES.map((c) => {
                  const isCurrent = form.username === c.username
                  return (
                    <button
                      key={c.username}
                      type="button"
                      onClick={() => fillDemo(c.username, c.password)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all text-left flex flex-col gap-0.5 ${
                        isCurrent
                          ? 'border-[#FF2A3A]/60 bg-[#161B26] text-white shadow-[0_0_8px_rgba(255,42,58,0.15)]'
                          : 'border-white/[0.08] bg-[#121620] text-slate-300 hover:bg-[#1A202E] hover:text-white hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{c.label}</span>
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A3A]" />}
                      </div>
                      <span className="text-[10px] text-slate-400">user: {c.username}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
