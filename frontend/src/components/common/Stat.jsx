export default function Stat({ label, value, tone = 'text-sand' }) {
  return (
    <div>
      <p className={`font-mono text-3xl ${tone}`}>{value}</p>
      <p className="text-sm text-sand/60">{label}</p>
    </div>
  )
}
