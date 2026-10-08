export default function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-line bg-panel p-5 ${className}`}>
      {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  )
}
