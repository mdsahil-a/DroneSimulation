// Telemetry performance bar chart
export default function BarChart({ data, max = 100, horizontal = false }) {
  if (!data || !data.length) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center font-mono">
        No simulation telemetry recorded yet.
      </p>
    )
  }

  const peak = Math.max(max, ...data.map((d) => d.value))

  if (horizontal) {
    return (
      <div className="space-y-3 py-2">
        {data.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{d.label}</span>
              <span className="font-bold text-white font-mono">{d.value}%</span>
            </div>
            <div className="h-3 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF2A3A] to-[#FF5E6D] shadow-[0_0_8px_rgba(255,42,58,0.4)] transition-all duration-500"
                style={{ width: `${Math.min(100, (d.value / peak) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-40 items-end gap-2 pt-4">
      {data.map((d, i) => {
        const h = Math.max(8, (d.value / peak) * 100)
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 min-w-0 group">
            <span className="font-mono text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
              {d.value}
            </span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-[#B91C1C] to-[#FF2A3A] group-hover:from-[#DC2626] group-hover:to-[#FF5E6D] shadow-[0_0_10px_rgba(255,42,58,0.3)] transition-all duration-300"
              style={{ height: `${h}%` }}
            />
            <span className="text-[11px] text-slate-400 font-mono truncate w-full text-center">
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
