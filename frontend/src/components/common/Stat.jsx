export default function Stat({ label, value, sub, badge, icon, progress }) {
  return (
    <div className="card p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${badge.cls}`}>
            {badge.text}
          </span>
        )}
        {icon && !badge && (
          <span className="text-slate-400 text-sm">{icon}</span>
        )}
      </div>

      <div className="my-3">
        <p className="text-3xl font-extrabold text-white tracking-tight font-mono">{value}</p>
      </div>

      {(sub || progress !== undefined) && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{sub}</span>
          {progress !== undefined && (
            <span className="font-semibold text-slate-200">{progress}%</span>
          )}
        </div>
      )}

      {progress !== undefined && (
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#FF2A3A] shadow-[0_0_8px_rgba(255,42,58,0.6)] h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
