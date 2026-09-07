import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/players', label: 'Players' },
  { to: '/matches', label: 'Matches' },
  { to: '/meta', label: 'Meta' },
]

function NavBar() {
  return (
    <nav className="flex gap-6 border-b border-zinc-800 px-6 py-4">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive
              ? 'text-sm font-medium text-violet-400'
              : 'text-sm font-medium text-zinc-400 hover:text-zinc-100'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default NavBar
