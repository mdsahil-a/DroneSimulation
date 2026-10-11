import { NavLink, useNavigate } from 'react-router-dom'
import { useSim } from '../../store/SimContext.jsx'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/setup',     label: 'New Scenario' },
  { to: '/history',   label: 'History' },
]

export default function Navbar() {
  const { user, logout } = useSim()
  const nav = useNavigate()
  if (!user) return null

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D14]/95 backdrop-blur-md px-6 h-16 shrink-0 shadow-lg">
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2A3A] to-[#B91C1C] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_16px_rgba(255,42,58,0.4)] shrink-0">
          D
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide text-sm font-sans uppercase">
            Drone Threat Trainer
          </span>
          <span className="hidden md:inline-block text-slate-400 text-xs border-l border-white/[0.12] pl-2.5 font-mono">
            AI Decision Support Platform
          </span>
        </div>
      </div>

      {/* ── Navigation Links ───────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm" role="navigation" aria-label="Main navigation">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                isActive
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(255,42,58,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Status & User Menu ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Operational Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>System Active</span>
        </div>

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-xs font-bold text-white tracking-wide">{user.name}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-red-400/80">
            {user.role}
          </span>
        </div>

        <div className="h-8 w-8 rounded-full bg-[#141824] border border-white/[0.12] text-red-400 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <button
          className="btn-secondary btn-sm text-xs font-semibold"
          onClick={() => { logout(); nav('/login') }}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
