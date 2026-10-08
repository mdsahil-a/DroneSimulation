import { NavLink, useNavigate } from 'react-router-dom'
import { useSim } from '../../store/SimContext.jsx'

const links = [['/dashboard', 'Dashboard'], ['/setup', 'New scenario'], ['/history', 'History']]

export default function Navbar() {
  const { user, logout } = useSim()
  const nav = useNavigate()
  if (!user) return null
  return (
    <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-3">
      <span className="font-semibold">Drone Threat Trainer</span>
      <nav className="flex items-center gap-5 text-sm">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'text-amber' : 'text-sand/70 hover:text-sand')}>{label}</NavLink>
        ))}
        <button className="btn-ghost py-1" onClick={() => { logout(); nav('/login') }}>Sign out ({user.name})</button>
      </nav>
    </header>
  )
}
