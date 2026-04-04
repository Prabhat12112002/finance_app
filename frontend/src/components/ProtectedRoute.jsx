import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default ProtectedRoute
