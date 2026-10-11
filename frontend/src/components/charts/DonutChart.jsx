// Pure SVG Donut Chart with modern dark tactical legend
export default function DonutChart({
  high = 5,
  medium = 2,
  low = 5,
  title = 'Risk Distribution Breakdown',
  subtitle = 'Breakdown of real-time aerial threat classifications',
}) {
  const total = high + medium + low || 1
  const pctHigh = (high / total) * 100
  const pctMed = (medium / total) * 100
  const pctLow = (low / total) * 100

  // SVG circle circumference for r = 38 is 2 * PI * 38 = 238.76
  const C = 238.76

  const strokeHigh = (pctHigh / 100) * C
  const strokeMed = (pctMed / 100) * C
  const strokeLow = (pctLow / 100) * C

  const offsetHigh = 0
  const offsetMed = -strokeHigh
  const offsetLow = -(strokeHigh + strokeMed)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
      {/* Donut graphic */}
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            className="stroke-white/[0.08]"
            strokeWidth="14"
            fill="transparent"
          />

          {/* High threat arc - Red */}
          {high > 0 && (
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#FF2A3A"
              strokeWidth="14"
              strokeDasharray={`${strokeHigh} ${C - strokeHigh}`}
              strokeDashoffset={offsetHigh}
              strokeLinecap="round"
              className="transition-all duration-700 hover:opacity-85 shadow-[0_0_10px_rgba(255,42,58,0.5)]"
            />
          )}

          {/* Med threat arc - Amber */}
          {medium > 0 && (
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#FF9500"
              strokeWidth="14"
              strokeDasharray={`${strokeMed} ${C - strokeMed}`}
              strokeDashoffset={offsetMed}
              strokeLinecap="round"
              className="transition-all duration-700 hover:opacity-85"
            />
          )}

          {/* Low threat arc - Emerald */}
          {low > 0 && (
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#10B981"
              strokeWidth="14"
              strokeDasharray={`${strokeLow} ${C - strokeLow}`}
              strokeDashoffset={offsetLow}
              strokeLinecap="round"
              className="transition-all duration-700 hover:opacity-85"
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-white font-mono leading-none">{total}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Drones</span>
        </div>
      </div>

      {/* Category breakdown legend */}
      <div className="flex-1 w-full space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A3A] shadow-[0_0_6px_rgba(255,42,58,0.8)] shrink-0" />
            <span className="font-semibold text-slate-200">Critical (Hostile)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">{high} targets</span>
            <span className="text-slate-400 font-mono text-[11px]">{Math.round(pctHigh)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] shrink-0" />
            <span className="font-semibold text-slate-200">Elevated (Unidentified)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">{medium} targets</span>
            <span className="text-slate-400 font-mono text-[11px]">{Math.round(pctMed)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <span className="font-semibold text-slate-200">Permitted / Clear</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">{low} targets</span>
            <span className="text-slate-400 font-mono text-[11px]">{Math.round(pctLow)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
