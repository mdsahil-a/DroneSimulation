import { useState } from 'react'

const ZONES = [
  { id: 'z1', name: 'Bhopal HQ Zone', risk: 88, tier: 'High', x: '58%', y: '62%', drones: 2, status: 'Critical Anomaly', action: 'Air Defense Jamming' },
  { id: 'z2', name: 'Indore Zone', risk: 76, tier: 'High', x: '42%', y: '74%', drones: 2, status: 'High Risk Cluster', action: 'Deploy Interceptors' },
  { id: 'z3', name: 'Rewa Zone', risk: 86, tier: 'High', x: '82%', y: '42%', drones: 1, status: 'Perimeter Breach', action: 'Kinetic Neutralization' },
  { id: 'z4', name: 'Sagar Zone', risk: 42, tier: 'Medium', x: '68%', y: '54%', drones: 1, status: 'Watchlist Trajectory', action: 'Radar Tracking' },
  { id: 'z5', name: 'Ujjain Zone', risk: 32, tier: 'Low', x: '46%', y: '65%', drones: 0, status: 'Routine Airspace', action: 'Monitoring' },
  { id: 'z6', name: 'Jabalpur Zone', risk: 12, tier: 'Low', x: '75%', y: '65%', drones: 0, status: 'Secure Sector', action: 'Standard Patrol' },
]

export default function ZoneRadarMap() {
  const [selectedZone, setSelectedZone] = useState(ZONES[0])
  const [zoom, setZoom] = useState(1)

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#E2EBE5] border border-slate-200">
      {/* Map Graphic Layer (Map texture with topographical feel) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-300"
        style={{
          backgroundImage: `radial-gradient(#93C5FD 1px, transparent 1px), radial-gradient(#86EFAC 1px, #EEF4F0 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          transform: `scale(${zoom})`,
        }}
      />

      {/* Top Map Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Zone Risk Radar</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          OpenStreetMap GIS
        </span>
      </div>

      {/* Zoom Controls (+ / -) */}
      <div className="absolute top-3 left-3 mt-10 flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden z-10">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.15, 1.4))}
          className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 text-sm font-bold border-b border-slate-200"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.15, 0.9))}
          className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 text-sm font-bold"
        >
          -
        </button>
      </div>

      {/* Vector Line Connectors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <path
          d="M 42% 74% Q 50% 68% 58% 62% T 68% 54% T 82% 42%"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="opacity-70"
        />
        <path
          d="M 46% 65% L 58% 62% L 75% 65%"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="opacity-60"
        />
      </svg>

      {/* Zone Interactive Pins */}
      {ZONES.map((zone) => {
        const isSelected = selectedZone.id === zone.id
        const badgeColor =
          zone.tier === 'High'
            ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
            : zone.tier === 'Medium'
            ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
            : 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'

        return (
          <div
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            style={{ left: zone.x, top: zone.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
          >
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold shadow-xs transition-all ${badgeColor} ${
                isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-105' : 'hover:scale-105'
              }`}
            >
              <span>{zone.name}</span>
              <span className="text-[10px]">({zone.risk})</span>
            </div>
          </div>
        )
      })}

      {/* Floating Zone Detail Card */}
      {selectedZone && (
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 shadow-dropdown z-30 max-w-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="text-xs font-bold text-slate-900">{selectedZone.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">23.2599° N, 77.4126° E</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedZone.tier === 'High'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : selectedZone.tier === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {selectedZone.risk} · {selectedZone.tier}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] py-1.5 border-t border-slate-100">
            <div>
              <p className="text-slate-400 text-[10px]">Threat Level</p>
              <p className="font-semibold text-slate-800">{selectedZone.status}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Tracked Drones</p>
              <p className="font-semibold text-slate-800">{selectedZone.drones} Active Target{selectedZone.drones === 1 ? '' : 's'}</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Inspect Zone Targets</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
