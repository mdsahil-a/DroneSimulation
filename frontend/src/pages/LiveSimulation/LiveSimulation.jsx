import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import RadarView from '../../components/radar/RadarView.jsx'
import { useTimer } from '../../hooks/useTimer.js'
import { generateDrones } from '../../utils/generateDrones.js'
import { useSim } from '../../store/SimContext.jsx'

const ACTIONS = [
  { key: 'Jam', label: 'EW RF Jam', desc: 'Disrupt GNSS & command radio link', tone: 'danger' },
  { key: 'Engage', label: 'Kinetic Engage', desc: 'Deploy counter-UAS interceptor', tone: 'danger' },
  { key: 'Monitor', label: 'Monitor Only', desc: 'Observe & record flight telemetry', tone: 'secondary' },
  { key: 'Alert command', label: 'Alert Command', desc: 'Escalate to theater air defense', tone: 'amber' },
]

const DURATION = 60 // seconds

export default function LiveSimulation() {
  const { scenario, setSession } = useSim()
  const nav = useNavigate()
  const allDrones = useMemo(() => (scenario ? generateDrones(scenario) : []), [scenario])
  const [drones, setDrones] = useState(() => allDrones.map((d) => ({ ...d, handled: false })))
  const [selected, setSelected] = useState(null)
  const [decisions, setDecisions] = useState([])
  const [log, setLog] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const time = useTimer(!isPaused)
  const finished = useRef(false)

  // Move spawned drones progressively toward the central defense perimeter
  useEffect(() => {
    if (isPaused) return
    setDrones((ds) =>
      ds.map((d) => {
        if (d.spawnAt > time || d.handled) return d
        // Inbound step toward center (0.5, 0.5)
        const dx = 0.5 - d.x
        const dy = 0.5 - d.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.04) return { ...d, x: 0.5, y: 0.5 } // Reached base center

        const step = d.speed * 8
        return {
          ...d,
          x: Math.max(0.04, Math.min(0.96, d.x + (dx / dist) * step)),
          y: Math.max(0.04, Math.min(0.96, d.y + (dy / dist) * step)),
        }
      })
    )
  }, [time, isPaused])

  const finish = () => {
    if (finished.current) return
    finished.current = true
    setSession({ scenario, drones: allDrones, decisions, duration: time })
    nav('/analysis')
  }

  useEffect(() => {
    if (time >= DURATION || (drones.length && drones.every((d) => d.handled))) {
      finish()
    }
  })

  if (!scenario) return <Navigate to="/setup" replace />

  const visible = drones.filter((d) => d.spawnAt <= time)
  const current = drones.find((d) => d.id === selected)
  const hostileVisible = visible.filter((d) => d.hostile && !d.handled)
  const handledCount = drones.filter((d) => d.handled).length

  const act = (actionKey) => {
    if (!current || current.handled) return
    const reactionSec = +(time - current.spawnAt).toFixed(1)
    setDecisions((d) => [...d, { droneId: current.id, action: actionKey, reactionSec }])
    setDrones((ds) => ds.map((d) => (d.id === current.id ? { ...d, handled: true } : d)))
    setLog((l) => [`${time.toFixed(1)}s [${current.id}] -> ${actionKey}`, ...l])
    setSelected(null)
  }

  // Pre-calculate telemetry for currently selected contact
  const currentTelemetry = useMemo(() => {
    if (!current) return null
    const distCenter = Math.sqrt((current.x - 0.5) ** 2 + (current.y - 0.5) ** 2)
    const rangeKm = ((distCenter / 0.48) * 20).toFixed(1)
    const angleRad = Math.atan2(current.y - 0.5, current.x - 0.5)
    const bearingDeg = Math.round(((angleRad * 180) / Math.PI + 90 + 360) % 360)
    const speedKnots = Math.round(current.speed * 45000 + 40)
    const altitudeFt = 1200 + ((current.id.charCodeAt(current.id.length - 1) * 170) % 3200)
    const riskScore = current.hostile ? (current.type === 'Swarm' ? 92 : 87) : current.type === 'Surveillance' ? 52 : 22
    const threatLevel = current.hostile ? 'CRITICAL' : current.type === 'Surveillance' ? 'ELEVATED' : 'LOW'
    return {
      rangeKm,
      bearingDeg,
      speedKnots,
      altitudeFt,
      riskScore,
      threatLevel,
    }
  }, [current])

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col p-3.5 sm:p-4 gap-3 select-none bg-[#07080B] text-slate-100">
      {/* ── Compact Tactical Simulation Header ─────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1118]/95 px-4 py-2.5 rounded-xl border border-white/[0.08] shadow-lg shrink-0">
        {/* Scenario Details */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A3A] animate-ping shadow-[0_0_8px_rgba(255,42,58,0.8)]" />
            <h1 className="text-sm font-bold text-white tracking-wider uppercase font-sans">
              Tactical Airspace Simulation
            </h1>
          </div>
          <span className="text-white/[0.15]">|</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span className="px-2 py-0.5 rounded bg-[#161B26] text-slate-300 border border-white/[0.06]">{scenario.terrain}</span>
            <span className="px-2 py-0.5 rounded bg-[#161B26] text-slate-300 border border-white/[0.06]">{scenario.timeOfDay}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase ${
                scenario.difficulty === 'Hard'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {scenario.difficulty}
            </span>
          </div>
        </div>

        {/* Tactical Controls & Digital Clock */}
        <div className="flex items-center gap-3">
          {/* Active Contacts Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141822] text-xs font-mono font-medium text-slate-300 border border-white/[0.08]">
            <span>CONTACTS:</span>
            <span className="font-bold text-[#FF4D5A]">{visible.length}/{drones.length}</span>
            <span className="text-slate-400">({handledCount} Neutralized)</span>
          </div>

          {/* Digital Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#121620] text-white rounded-lg font-mono text-xs border border-white/[0.1] shadow-inner">
            <span className="text-slate-400">T-CLOCK:</span>
            <span className="font-bold text-sm tracking-wider text-[#FF4D5A]">
              {time.toFixed(1)}s
            </span>
            <span className="text-slate-500">/ {DURATION}s</span>
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`btn-sm rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isPaused
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-[#1C2230] text-amber-300 hover:bg-[#252D40] border border-amber-500/30'
            }`}
          >
            <span>{isPaused ? '▶' : '⏸'}</span>
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* End Drill Button */}
          <button
            type="button"
            onClick={finish}
            className="btn-secondary btn-sm text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40"
          >
            End Drill Early
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Viewport (Radar on Left, Panels on Right) ───── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: High-Tech Radar Console (lg:col-span-7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 h-full rounded-2xl bg-[#07080B] border border-white/[0.08] shadow-2xl p-2 overflow-hidden relative">
          <RadarView
            drones={visible}
            selectedId={selected}
            onSelect={setSelected}
            sensorNoise={scenario.degradedSensors}
            isPaused={isPaused}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </div>

        {/* Right Column: Tactical Decision & Contact Intelligence (lg:col-span-5 or 4) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 h-full gap-3 overflow-hidden">
          {/* 1. Selected Contact Telemetry & Authorization Panel (shrink-0) */}
          <div className="bg-[#0E1118]/95 rounded-2xl border border-white/[0.08] shadow-xl p-4 shrink-0">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase font-sans">
                  THREAT ASSESSMENT
                </span>
                {current && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      current.handled
                        ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        : current.hostile
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(255,42,58,0.3)]'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {current.handled ? 'NEUTRALIZED' : current.hostile ? 'CRITICAL THREAT' : 'PERMITTED'}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500">DEFENSE PROTOCOL</span>
            </div>

            {current && currentTelemetry ? (
              <div className="pt-3 space-y-3">
                {/* Threat Level & Telemetry Waveform */}
                <div className="p-3 rounded-xl bg-[#11141E] border border-red-950/60 font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">THREAT LEVEL</p>
                      <p className={`text-xl font-extrabold tracking-tight ${current.hostile ? 'text-[#FF2A3A]' : 'text-amber-400'}`}>
                        {currentTelemetry.threatLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Risk Score</p>
                      <p className="font-extrabold text-lg text-white">
                        <span className="text-[#FF2A3A]">{currentTelemetry.riskScore}</span> <span className="text-slate-500 text-xs">/ 100</span>
                      </p>
                    </div>
                  </div>

                  {/* Signal Analysis Waveform */}
                  <div className="w-full h-10 mt-2 relative overflow-hidden">
                    <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="w-full h-full animate-signal-glow">
                      <defs>
                        <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF2A3A" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FF2A3A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="0,40 0,22 15,16 30,28 45,8 60,25 75,12 90,30 105,6 120,24 135,14 150,28 165,10 180,26 195,14 210,32 225,8 240,20 240,40"
                        fill="url(#waveFill)"
                      />
                      <polyline
                        points="0,22 15,16 30,28 45,8 60,25 75,12 90,30 105,6 120,24 135,14 150,28 165,10 180,26 195,14 210,32 225,8 240,20"
                        fill="none"
                        stroke="#FF2A3A"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>

                  {/* Telemetry 4-Column Grid */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2 pt-2 border-t border-white/[0.08] text-[10px] text-center">
                    <div>
                      <p className="text-slate-400">Range</p>
                      <p className="font-bold text-[#FF4D5A]">{currentTelemetry.rangeKm} km</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Bearing</p>
                      <p className="font-bold text-[#FF4D5A]">{currentTelemetry.bearingDeg}°</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Speed</p>
                      <p className="font-bold text-white">{currentTelemetry.speedKnots} kts</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Alt</p>
                      <p className="font-bold text-white">{currentTelemetry.altitudeFt} ft</p>
                    </div>
                  </div>
                </div>

                {/* Countermeasure Action Buttons */}
                {!current.handled ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Authorize Mitigation Response:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => act(a.key)}
                          className={`btn-sm rounded-lg text-xs font-bold transition-all ${
                            a.tone === 'danger'
                              ? 'bg-[#FF2A3A] text-white hover:bg-[#E02433] shadow-[0_0_12px_rgba(255,42,58,0.35)]'
                              : a.tone === 'amber'
                              ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : 'bg-[#181D2A] text-slate-200 hover:bg-[#22293A] border border-white/[0.12]'
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <span>✓</span> Countermeasure executed. Target neutralized.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <span className="text-2xl">🎯</span>
                <p className="font-bold text-slate-300 tracking-wide uppercase">No Radar Contact Selected</p>
                <p className="text-[11px] text-slate-500">Click any blip on the radar scope or contact list below.</p>
              </div>
            )}
          </div>

          {/* 2. Visible Targets List Panel (flex-1 min-h-0 with independent scroll) */}
          <div className="bg-[#0E1118]/95 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                Active Airspace Contacts ({visible.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">AUTO-TRACK TWS</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {visible.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  Awaiting radar contact acquisition...
                </div>
              ) : (
                visible.map((d) => {
                  const isSel = d.id === selected
                  const distCenter = Math.sqrt((d.x - 0.5) ** 2 + (d.y - 0.5) ** 2)
                  const rangeKm = ((distCenter / 0.48) * 20).toFixed(1)

                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelected(d.id)}
                      className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                        isSel
                          ? 'bg-[#1C2232] text-white border-red-500/50 shadow-[0_0_12px_rgba(255,42,58,0.2)]'
                          : 'bg-[#11141E] hover:bg-[#161B28] border-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            d.handled
                              ? 'bg-slate-500'
                              : d.hostile
                              ? 'bg-[#FF2A3A] animate-pulse shadow-[0_0_6px_rgba(255,42,58,0.8)]'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <div className="truncate">
                          <span className="font-bold text-white">{d.id}</span>
                          <span className={`text-[10px] ml-1.5 ${isSel ? 'text-red-300' : 'text-slate-400'}`}>
                            ({d.type})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] ${isSel ? 'text-slate-200' : 'text-slate-400'}`}>
                          {rangeKm} km
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            d.handled
                              ? 'bg-slate-500/20 text-slate-400'
                              : d.hostile
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {d.handled ? 'NEUT' : d.hostile ? 'JAMMING' : 'CIV'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 3. Operator Combat Log Stream (shrink-0 max-h-32) */}
          <div className="bg-[#0E1118]/95 rounded-2xl border border-white/[0.08] shadow-xl p-3 shrink-0 flex flex-col max-h-32 overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alert Feed & Audit Log</span>
              <span className="text-[9px] font-mono text-slate-500">TELEMETRY STREAM</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pt-1.5 font-mono text-[10px] text-slate-300">
              {log.length === 0 ? (
                <p className="text-slate-500 text-center py-2">No operator actions logged yet.</p>
              ) : (
                log.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A3A] shrink-0 shadow-[0_0_6px_rgba(255,42,58,0.8)]" />
                    <span className="truncate">{entry}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
