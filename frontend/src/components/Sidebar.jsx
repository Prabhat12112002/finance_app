import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, ArrowLeftRight, Users, LogOut, DollarSign } from 'lucide-react'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <aside className="w-56 min-h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <div className="bg-indigo-600 rounded-lg p-1.5">
          <DollarSign size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-800 text-sm">Finance App</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClass}>
          <ArrowLeftRight size={18} /> Transactions
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" className={linkClass}>
            <Users size={18} /> Users
          </NavLink>
        )}
      </nav>

      {/* User info */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full px-2 py-1 rounded hover:bg-red-50"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
