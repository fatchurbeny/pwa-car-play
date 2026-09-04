import { NavLink, Outlet } from 'react-router-dom'
import { StatusBar } from '../components/StatusBar'

const links = [
  { to: '/maps', label: 'Peta', icon: '⌖' },
  { to: '/music', label: 'Musik', icon: '♫' },
  { to: '/radio', label: 'Radio', icon: '◉' },
]

export function AppShell() {
  return <main className="app-shell">
    <nav aria-label="Navigasi utama" className="left-nav">
      <span className="brand">CAP</span>
      {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span aria-hidden="true">{link.icon}</span><span>{link.label}</span></NavLink>)}
    </nav>
    <div className="main-panel"><StatusBar /><Outlet /></div>
  </main>
}
