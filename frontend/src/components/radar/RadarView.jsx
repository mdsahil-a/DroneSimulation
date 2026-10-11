import { useState, useMemo } from 'react'

export default function RadarView({
  drones = [],
  selectedId,
  onSelect,
  sensorNoise = false,
  isPaused = false,
  zoom = 1,
  onZoomChange,
  showTrails = true,
}) {
  const [hoveredId, setHoveredId] = useState(null)

  // Radar Center & Dimensions in 1000x1000 coordinate space
  const CX = 500
  const CY = 500
  const R_MAX = 430 // 20 KM perimeter ring
  const R_ZONE = 110 // 5 KM restricted exclusion zone

  // Range rings (5km, 10km, 15km, 20km)
  const rangeRings = [
    { r: R_ZONE, label: '5 KM' },
    { r: 220, label: '10 KM' },
    { r: 325, label: '15 KM' },
    { r: R_MAX, label: '20 KM / PERIMETER' },
  ]

  // Radial azimuth lines (0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330)
  const azimuths = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

  // Compass degree markings around the perimeter
  const compassDegreeMarks = [
    { deg: 0, label: '0' },
    { deg: 30, label: '30' },
    { deg: 60, label: '60' },
    { deg: 90, label: '90' },
    { deg: 120, label: '120' },
    { deg: 180, label: '180' },
    { deg: 240, label: '240' },
    { deg: 270, label: '270' },
    { deg: 300, label: '300' },
    { deg: 330, label: '330' },
  ]

  // Ambient RF telemetry particles
  const particles = useMemo(() => {
    const pts = []
    const seed = [
      [0.25, 0.35, 1.4], [0.72, 0.28, 1.8], [0.38, 0.62, 1.2], [0.82, 0.74, 1.6],
      [0.18, 0.52, 1.5], [0.65, 0.45, 1.3], [0.48, 0.22, 1.7], [0.55, 0.78, 1.4],
      [0.32, 0.82, 1.6], [0.78, 0.38, 1.2], [0.22, 0.68, 1.5], [0.85, 0.58, 1.7],
      [0.42, 0.38, 1.3], [0.60, 0.65, 1.8], [0.28, 0.25, 1.5], [0.70, 0.82, 1.4],
      [0.15, 0.42, 1.2], [0.88, 0.48, 1.6], [0.52, 0.15, 1.4], [0.45, 0.85, 1.8],
    ]
    for (let i = 0; i < seed.length; i++) {
      const [u, v, r] = seed[i]
      const px = CX + (u - 0.5) * 2 * (R_MAX * 0.9)
      const py = CY + (v - 0.5) * 2 * (R_MAX * 0.9)
      const dist = Math.sqrt((px - CX) ** 2 + (py - CY) ** 2)
      if (dist < R_MAX) {
        pts.push({ x: px, y: py, r, op: 0.25 + (i % 4) * 0.12 })
      }
    }
    return pts
  }, [])

  // Process drone positions & tactical metrics
  const contactMetrics = useMemo(() => {
    return drones.map((d) => {
      // Map normalized 0..1 to radar relative space
      const relX = (d.x - 0.5) * 2 * (R_MAX * 0.94)
      const relY = (d.y - 0.5) * 2 * (R_MAX * 0.94)

      // Apply zoom with center origin
      const zx = CX + relX * zoom
      const zy = CY + relY * zoom

      // Check if within radar circular scope
      const distFromCenter = Math.sqrt((zx - CX) ** 2 + (zy - CY) ** 2)
      const isClamped = distFromCenter > R_MAX
      const scale = isClamped ? R_MAX / distFromCenter : 1
      const cx = isClamped ? CX + (zx - CX) * scale : zx
      const cy = isClamped ? CY + (zy - CY) * scale : zy

      // Tactical range & bearing
      const rangeKm = ((distFromCenter / R_MAX) * 20).toFixed(1)
      const angleRad = Math.atan2(cy - CY, cx - CX)
      const bearingDeg = Math.round(((angleRad * 180) / Math.PI + 90 + 360) % 360)

      // Inbound heading vector angle (pointing toward center)
      const headingRad = Math.atan2(CY - cy, CX - cx)
      const speedKnots = Math.round(d.speed * 45000 + 40)
      const altitudeFt = 1200 + ((d.id.charCodeAt(d.id.length - 1) * 170) % 3200)

      // Tactical classification tag
      let tacticalTag = 'MONITOR'
      let threatLevel = 'LOW'
      let color = '#10B981' // Green

      if (d.handled) {
        threatLevel = 'RESOLVED'
        color = '#64748B' // Slate
        tacticalTag = 'NEUTRALIZED'
      } else if (d.hostile) {
        threatLevel = 'CRITICAL'
        color = '#FF2A3A' // Vivid Crimson Red
        tacticalTag = d.type === 'Swarm' ? 'SWARM THREAT' : d.type === 'Armed' ? 'JAMMING' : 'SPOOFING'
      } else if (d.type === 'Surveillance') {
        threatLevel = 'ELEVATED'
        color = '#FF9500' // Amber
        tacticalTag = 'SIGNAL INTRUDER'
      } else {
        tacticalTag = 'PERMITTED'
      }

      // Inside exclusion zone?
      const inExclusionZone = distFromCenter <= R_ZONE

      return {
        ...d,
        cx,
        cy,
        headingRad,
        rangeKm,
        bearingDeg,
        speedKnots,
        altitudeFt,
        threatLevel,
        color,
        tacticalTag,
        inExclusionZone,
      }
    })
  }, [drones, zoom])

  const hoveredContact = contactMetrics.find((c) => c.id === hoveredId)
  const selectedContact = contactMetrics.find((c) => c.id === selectedId)
  const activeFocus = hoveredContact || selectedContact

  const hostileCount = drones.filter((d) => d.hostile && !d.handled).length
  const breachCount = contactMetrics.filter((c) => c.inExclusionZone && c.hostile && !c.handled).length

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden bg-[#07080B]">
      {/* ── Main Radar SVG Console ─────────────────────────────────────── */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full max-h-[calc(100vh-170px)] aspect-square"
        role="img"
        aria-label="Aerospace Surveillance Radar Console"
      >
        <defs>
          {/* Deep Black/Dark Crimson Radar Scope Background */}
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14090D" />
            <stop offset="45%" stopColor="#0D0609" />
            <stop offset="85%" stopColor="#070406" />
            <stop offset="100%" stopColor="#040203" />
          </radialGradient>

          {/* Crimson sweep beam sector gradient */}
          <linearGradient id="sweepGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2A3A" stopOpacity="0.65" />
            <stop offset="35%" stopColor="#E61E30" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#B31424" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF2A3A" stopOpacity="0" />
          </linearGradient>

          {/* Center Hazard Alert Glow */}
          <radialGradient id="centerAlertGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FF9500" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF3B30" stopOpacity="0" />
          </radialGradient>

          {/* Circular Clip Path for Scope */}
          <clipPath id="scopeClip">
            <circle cx={CX} cy={CY} r={R_MAX} />
          </clipPath>

          {/* Glow filter for red lines and alert icons */}
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Subtle Grid Pattern in faint red */}
          <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FF2A3A" strokeWidth="0.5" strokeOpacity="0.04" />
          </pattern>
        </defs>

        {/* ── Scope Background ────────────────────────────────────────── */}
        <circle cx={CX} cy={CY} r={R_MAX} fill="url(#radarBg)" />
        <circle cx={CX} cy={CY} r={R_MAX} fill="url(#radarGrid)" />

        {/* Outer Perimeter Scope Ring (Red border with subtle glow) */}
        <circle
          cx={CX}
          cy={CY}
          r={R_MAX}
          fill="none"
          stroke="#FF2A3A"
          strokeWidth="2.2"
          strokeOpacity="0.75"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_MAX + 10}
          fill="none"
          stroke="#FF2A3A"
          strokeWidth="0.8"
          strokeOpacity="0.25"
        />

        {/* ── Micro-Particles (Ambient Radar RF Noise) ─────────────────── */}
        <g pointerEvents="none">
          {particles.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="#FF3B30"
              opacity={p.op}
            />
          ))}
        </g>

        {/* ── Concentric Range Rings (Vibrant Red) ─────────────────────── */}
        {rangeRings.map((ring) => (
          <g key={ring.r}>
            <circle
              cx={CX}
              cy={CY}
              r={ring.r}
              fill="none"
              stroke="#FF2A3A"
              strokeWidth={ring.r === R_ZONE ? '1.8' : '1'}
              strokeOpacity={ring.r === R_ZONE ? '0.65' : '0.35'}
              strokeDasharray={ring.r === R_ZONE ? '4 4' : ring.r === R_MAX ? 'none' : '2 3'}
            />
            {/* Range Ring Labels (Crisp Red Text) */}
            <text
              x={CX + 8}
              y={CY - ring.r + 17}
              fontSize="14"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#FF4D5A"
              fillOpacity="0.9"
              stroke="#080406"
              strokeWidth="1.2"
              paintOrder="stroke fill"
            >
              {ring.label}
            </text>
          </g>
        ))}

        {/* ── Radial Azimuth Lines ─────────────────────────────────────── */}
        {azimuths.map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180
          const x2 = CX + Math.cos(rad) * R_MAX
          const y2 = CY + Math.sin(rad) * R_MAX
          const isCrosshair = deg % 90 === 0
          return (
            <line
              key={deg}
              x1={CX}
              y1={CY}
              x2={x2}
              y2={y2}
              stroke="#FF2A3A"
              strokeWidth={isCrosshair ? '1.2' : '0.6'}
              strokeOpacity={isCrosshair ? '0.4' : '0.18'}
            />
          )
        })}

        {/* ── Azimuth Degree Marks ───────────────────────────────────── */}
        {compassDegreeMarks.map(({ deg, label }) => {
          const rad = ((deg - 90) * Math.PI) / 180
          const lx = CX + Math.cos(rad) * (R_MAX - 20)
          const ly = CY + Math.sin(rad) * (R_MAX - 20) + 4
          return (
            <text
              key={deg}
              x={lx}
              y={ly}
              textAnchor="middle"
              fontSize="13"
              fontFamily="'Rajdhani', monospace"
              fontWeight="bold"
              fill="#FF4D5A"
              fillOpacity="0.85"
              stroke="#080406"
              strokeWidth="0.8"
              paintOrder="stroke fill"
            >
              {label}
            </text>
          )
        })}

        {/* ── Inner Perimeter Ring (Inner 30 Degree Marks) ─────────────── */}
        <circle
          cx={CX}
          cy={CY}
          r={160}
          fill="none"
          stroke="#FF2A3A"
          strokeWidth="0.8"
          strokeOpacity="0.3"
          strokeDasharray="2 3"
        />

        {/* ── Rotating Crimson Radar Sweep Line & Glowing Wedge Sector ─── */}
        <g clipPath="url(#scopeClip)" className={isPaused ? 'radar-paused' : ''}>
          <g className="animate-radar-sweep">
            {/* Trailing wedge sector fading counter-clockwise */}
            <path
              d={`M ${CX} ${CY} L ${CX} ${CY - R_MAX} A ${R_MAX} ${R_MAX} 0 0 0 ${CX - R_MAX * 0.7} ${CY - R_MAX * 0.7} Z`}
              fill="url(#sweepGradientRed)"
            />
            {/* Bright crimson leading blade line */}
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - R_MAX}
              stroke="#FF3B30"
              strokeWidth="2.4"
              strokeOpacity="0.95"
              filter="url(#glowRed)"
            />
            {/* Inner sweep light reflection */}
            <line
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY - R_MAX}
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeOpacity="0.75"
            />
          </g>
        </g>

        {/* ── Central Base Defense Core & Warning Reticle ────────────── */}
        <g>
          {/* Radial alert glow */}
          <circle cx={CX} cy={CY} r="65" fill="url(#centerAlertGlow)" />
          
          {/* Concentric red central reticle rings */}
          <circle cx={CX} cy={CY} r="45" fill="#140608" stroke="#FF2A3A" strokeWidth="1.5" strokeOpacity="0.85" />
          <circle cx={CX} cy={CY} r="38" fill="none" stroke="#FF2A3A" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.6" />
          
          {/* Warning triangle in defense center */}
          <g transform={`translate(${CX - 16}, ${CY - 16})`}>
            <polygon
              points="16,4 30,28 2,28"
              fill="#FF8C00"
              stroke="#FF2A3A"
              strokeWidth="2"
              filter="url(#glowRed)"
            />
            {/* Exclamation point inside triangle */}
            <rect x="15" y="11" width="2" height="9" fill="#FFFFFF" rx="1" />
            <circle cx="16" cy="24" r="1.3" fill="#FFFFFF" />
          </g>

          {/* Central label */}
          <text
            x={CX}
            y={CY + 60}
            textAnchor="middle"
            fontSize="10"
            fontFamily="'Rajdhani', monospace"
            fontWeight="bold"
            letterSpacing="1"
            fill="#FF4D5A"
            fillOpacity="0.8"
          >
            SPOOFING
          </text>
        </g>

        {/* ── Inbound Drone Contacts ─────────────────────────────────── */}
        {contactMetrics.map((c) => {
          const isSelected = c.id === selectedId
          const isHovered = c.id === hoveredId
          const vectorLen = 24

          // Motion vector endpoint
          const vx = c.cx + Math.cos(c.headingRad) * vectorLen
          const vy = c.cy + Math.sin(c.headingRad) * vectorLen

          return (
            <g
              key={c.id}
              onClick={() => onSelect(c.id)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer group"
            >
              {/* Motion History Trail Points */}
              {showTrails && (
                <g opacity="0.45">
                  <circle cx={c.cx - Math.cos(c.headingRad) * 12} cy={c.cy - Math.sin(c.headingRad) * 12} r="1.8" fill={c.color} />
                  <circle cx={c.cx - Math.cos(c.headingRad) * 22} cy={c.cy - Math.sin(c.headingRad) * 22} r="1.2" fill={c.color} opacity="0.6" />
                  <circle cx={c.cx - Math.cos(c.headingRad) * 32} cy={c.cy - Math.sin(c.headingRad) * 32} r="0.8" fill={c.color} opacity="0.3" />
                </g>
              )}

              {/* Heading / Velocity Vector Line */}
              <line
                x1={c.cx}
                y1={c.cy}
                x2={vx}
                y2={vy}
                stroke={c.color}
                strokeWidth="1.8"
                strokeOpacity="0.9"
                strokeDasharray={c.handled ? '2 2' : 'none'}
              />
              <circle cx={vx} cy={vy} r="1.4" fill={c.color} />

              {/* Pulsating Contact Blip Circle */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r="10"
                fill="none"
                stroke={c.color}
                strokeWidth="1.2"
                strokeOpacity="0.75"
                className="animate-ping"
                style={{ transformOrigin: `${c.cx}px ${c.cy}px`, animationDuration: '2.5s' }}
              />
              <circle
                cx={c.cx}
                cy={c.cy}
                r="6"
                fill={c.color}
                fillOpacity="0.25"
                stroke={c.color}
                strokeWidth="1.6"
              />
              <circle cx={c.cx} cy={c.cy} r="2.8" fill={c.color} filter="url(#glowRed)" />

              {/* Selection Bracket Reticle [ ] */}
              {(isSelected || isHovered) && (
                <g>
                  {/* Outer pulsating tactical ring */}
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r="18"
                    fill="none"
                    stroke={c.color}
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ transformOrigin: `${c.cx}px ${c.cy}px`, animationDuration: '6s' }}
                  />
                  {/* Bracket corner marks */}
                  <path
                    d={`M ${c.cx - 16} ${c.cy - 8} L ${c.cx - 16} ${c.cy - 16} L ${c.cx - 8} ${c.cy - 16}`}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${c.cx + 16} ${c.cy - 8} L ${c.cx + 16} ${c.cy - 16} L ${c.cx + 8} ${c.cy - 16}`}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${c.cx - 16} ${c.cy + 8} L ${c.cx - 16} ${c.cy + 16} L ${c.cx - 8} ${c.cy + 16}`}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${c.cx + 16} ${c.cy + 8} L ${c.cx + 16} ${c.cy + 16} L ${c.cx + 8} ${c.cy + 16}`}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Contact Telemetry Tag */}
              <g pointerEvents="none">
                <rect
                  x={c.cx + 12}
                  y={c.cy - 22}
                  width="88"
                  height="32"
                  rx="5"
                  fill="#12070A"
                  fillOpacity="0.94"
                  stroke={c.color}
                  strokeWidth="1.4"
                  filter="url(#glowRed)"
                />
                <text
                  x={c.cx + 18}
                  y={c.cy - 9}
                  fontSize="12.5"
                  fontFamily="'Rajdhani', monospace"
                  fontWeight="bold"
                  letterSpacing="0.8"
                  fill="#FFFFFF"
                >
                  {c.hostile ? c.tacticalTag : c.id}
                </text>
                <text
                  x={c.cx + 18}
                  y={c.cy + 5}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={c.color}
                >
                  {c.rangeKm}KM · {c.speedKnots}KT
                </text>
              </g>
            </g>
          )
        })}

        {/* ── Empty State Indicator ────────────────────────────────────── */}
        {contactMetrics.length === 0 && (
          <g>
            <text
              x={CX}
              y={CY + 85}
              textAnchor="middle"
              fontSize="16"
              fontFamily="'Rajdhani', monospace"
              fontWeight="bold"
              letterSpacing="2"
              fill="#FF4D5A"
              fillOpacity="0.9"
            >
              [ AIRSPACE CLEAR · CONTINUOUS RADAR SWEEP ]
            </text>
            <text
              x={CX}
              y={CY + 108}
              textAnchor="middle"
              fontSize="12"
              fontFamily="monospace"
              fill="#FF4D5A"
              fillOpacity="0.6"
            >
              Tactical RF spectrum monitored · Defense perimeter active
            </text>
          </g>
        )}

        {/* ── Perimeter Warning Banner (if breach) ────────────────────── */}
        {breachCount > 0 && (
          <g>
            <rect x="220" y="26" width="560" height="36" rx="6" fill="#FF2A3A" fillOpacity="0.25" stroke="#FF2A3A" strokeWidth="1.6" filter="url(#glowRed)" />
            <text x={CX} y="49" textAnchor="middle" fontSize="13.5" fontFamily="'Rajdhani', monospace" fontWeight="bold" letterSpacing="1" fill="#FF4D5A">
              ⚠ ALERT: {breachCount} INTRUDER{breachCount > 1 ? 'S' : ''} BREACHED 5.0 KM EXCLUSION PERIMETER
            </text>
          </g>
        )}
      </svg>

      {/* ── Tactical Corner HUD Overlays (HTML Layer) ───────────────── */}
      {/* Top Left Status */}
      <div className="absolute top-2.5 left-3 text-xs font-mono bg-[#0B0E15]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-red-950/70 shadow-lg pointer-events-none space-y-0.5">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs sm:text-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF2A3A] animate-pulse shadow-[0_0_8px_rgba(255,42,58,0.8)]" />
          <span className="font-sans uppercase tracking-wider">RADAR: {isPaused ? 'STANDBY' : 'ACTIVE SCAN'}</span>
        </div>
        <p className="text-slate-300 font-semibold">FREQ: 9.4 GHz · X-BAND</p>
        <p className="text-slate-400">MODE: TWS · 360° CONT</p>
      </div>

      {/* Top Right Status */}
      <div className="absolute top-2.5 right-3 text-xs font-mono bg-[#0B0E15]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-red-950/70 shadow-lg pointer-events-none text-right space-y-0.5">
        <p className="font-bold text-[#FF4D5A] text-xs sm:text-sm uppercase tracking-wider font-sans">RANGE: 20 KM SCOPE</p>
        <p className="text-slate-200 font-semibold">ZOOM: {zoom.toFixed(1)}x</p>
        <p className="text-slate-400">AZIMUTH: 000°–360°</p>
      </div>

      {/* Bottom Left Status */}
      <div className="absolute bottom-2.5 left-3 text-xs font-mono bg-[#0B0E15]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-red-950/70 shadow-lg pointer-events-none space-y-0.5">
        <p className="font-bold text-white text-xs sm:text-sm font-sans uppercase tracking-wider">
          TARGETS: <span className="text-[#FF4D5A]">{drones.length} TRACKED</span>
        </p>
        <p className="font-semibold text-slate-300">
          HOSTILE: <span className={hostileCount > 0 ? 'text-[#FF2A3A] font-bold' : 'text-slate-400'}>{hostileCount} DETECTED</span>
        </p>
      </div>

      {/* Bottom Right Legend Bar */}
      <div className="absolute bottom-2.5 right-3 text-xs font-mono bg-[#0B0E15]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-red-950/70 shadow-lg pointer-events-none flex items-center gap-3 font-bold">
        <div className="flex items-center gap-1.5 text-[#FF2A3A]">
          <span>●</span> Jamming/Hostile
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span>◆</span> Unidentified
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span>⬡</span> Permitted
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>✓</span> Resolved
        </div>
      </div>

      {/* ── Floating Zoom & Scope Controls Toolbar ─────────────────────── */}
      <div className="absolute top-14 right-3 flex flex-col gap-1 bg-[#10141E]/90 backdrop-blur-md rounded-lg border border-red-950/60 p-1 shadow-lg z-20">
        <button
          type="button"
          title="Zoom In"
          onClick={() => onZoomChange && onZoomChange(Math.min(zoom + 0.25, 2.0))}
          className="w-7 h-7 flex items-center justify-center text-slate-200 hover:text-white hover:bg-red-500/20 rounded text-xs font-bold font-mono transition-colors"
        >
          +
        </button>
        <button
          type="button"
          title="Zoom Out"
          onClick={() => onZoomChange && onZoomChange(Math.max(zoom - 0.25, 0.75))}
          className="w-7 h-7 flex items-center justify-center text-slate-200 hover:text-white hover:bg-red-500/20 rounded text-xs font-bold font-mono transition-colors"
        >
          −
        </button>
        <button
          type="button"
          title="Reset Zoom"
          onClick={() => onZoomChange && onZoomChange(1.0)}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 rounded text-[10px] font-mono transition-colors"
        >
          1x
        </button>
      </div>

      {/* ── Active Target Hover Telemetry Tooltip ──────────────────────── */}
      {activeFocus && (
        <div className="absolute top-16 left-3 bg-[#0B0E15]/95 backdrop-blur-md rounded-xl p-3.5 border border-red-950/80 shadow-2xl font-mono z-30 max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: activeFocus.color, color: activeFocus.color }} />
              <span className="font-bold text-white text-sm tracking-wide">{activeFocus.id}</span>
              <span className="text-xs text-slate-400 font-sans">({activeFocus.type})</span>
            </div>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor: `${activeFocus.color}22`,
                color: activeFocus.color,
                border: `1px solid ${activeFocus.color}44`,
              }}
            >
              {activeFocus.threatLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 text-xs text-slate-200">
            <div>
              <span className="text-slate-400 text-xs">Range: </span>
              <span className="font-bold text-[#FF4D5A]">{activeFocus.rangeKm} km</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Bearing: </span>
              <span className="font-bold text-[#FF4D5A]">{activeFocus.bearingDeg}°</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Speed: </span>
              <span className="font-bold text-white">{activeFocus.speedKnots} kts</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Altitude: </span>
              <span className="font-bold text-white">{activeFocus.altitudeFt} ft</span>
            </div>
          </div>

          {activeFocus.inExclusionZone && !activeFocus.handled && (
            <div className="mt-2.5 pt-2 border-t border-red-950 text-xs text-[#FF2A3A] font-bold flex items-center gap-1.5">
              <span>⚠</span> IN 5 KM DEFENSE PERIMETER
            </div>
          )}
        </div>
      )}
    </div>
  )
}