// Tiny dependency-free bar chart. data = [{ label, value }]
export default function BarChart({ data, max = 100 }) {
  if (!data.length) return <p className="text-sand/60">No data yet. Complete a simulation first.</p>
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="font-mono text-xs">{d.value}</span>
          <div className="w-full rounded-t bg-amber" style={{ height: `${(d.value / max) * 80}%` }} />
          <span className="text-xs text-sand/60">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
