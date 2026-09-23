// LabNav.tsx — Shared top navigation for all lab pages
import { Link, NavLink } from 'react-router-dom'

const LABS = [3, 4, 5, 6, 7, 8, 9, 10]

export default function LabNav() {
  return (
    <nav className="min-h-14 bg-stone-900 px-6 flex items-center justify-between gap-4">
      <Link to="/" className="text-white text-lg font-bold no-underline">☕ Kape Ko</Link>
      <div className="flex flex-wrap justify-end gap-x-[18px] gap-y-1">
        {LABS.map(n => (
          <NavLink
            key={n}
            to={`/lab${n}`}
            className={({ isActive }) => `text-[13px] no-underline hover:text-amber-500 ${isActive ? 'text-amber-500' : 'text-stone-400'}`}
          >
            Lab {n}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
