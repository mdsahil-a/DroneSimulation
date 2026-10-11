export default function Card({ title, subtitle, icon, children, className = '', action, noPad = false }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-base">{icon}</span>}
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'card-body'}>{children}</div>
    </section>
  )
}
