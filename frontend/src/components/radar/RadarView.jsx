// SVG radar. drones = visible drones with x,y in 0..1. onSelect(id) when a blip is clicked.
// Colours are fixed here so the radar looks right on both light and dark page themes.
const BG = '#0F1B20'
const GRID = '#3A5A66'
const TEXT = '#F3F6F9'

export default function RadarView({ drones, selectedId, onSelect, sensorNoise }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="aspect-square w-full rounded-lg border border-line"
      style={{ backgroundColor: BG }}
      role="img"
      aria-label="Radar view"
    >
      {[15, 30, 45].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={GRID} strokeWidth="0.3" />)}
      <line x1="50" y1="2" x2="50" y2="98" stroke={GRID} strokeWidth="0.3" />
      <line x1="2" y1="50" x2="98" y2="50" stroke={GRID} strokeWidth="0.3" />
      <circle cx="50" cy="50" r="1.5" fill="#5BBF8A" />

      {sensorNoise && Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={(i * 37) % 100} cy={(i * 53) % 100} r="0.6" fill={TEXT} opacity="0.3" />
      ))}

      {drones.map((d) => {
        const cx = d.x * 100
        const cy = d.y * 100
        const selected = d.id === selectedId
        return (
          <g key={d.id} onClick={() => onSelect(d.id)} className="cursor-pointer">
            {selected && <circle cx={cx} cy={cy} r="4.5" fill="none" stroke={TEXT} strokeWidth="0.4" />}
            <circle cx={cx} cy={cy} r={selected ? 3 : 2.2} fill={d.handled ? '#5BBF8A' : '#F2A93B'} />
            <text
              x={cx + 3.5}
              y={cy - 2.5}
              fontSize="3.6"
              fontWeight="600"
              fill={TEXT}
              stroke={BG}
              strokeWidth="0.6"
              paintOrder="stroke"
            >
              {d.id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}