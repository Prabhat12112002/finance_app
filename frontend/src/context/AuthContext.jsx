import React, { createContext, useContext, useEffect, useState } from 'react'
import { getMe, login as apiLogin } from '../api/finance'
import { setCurrentUser } from '../api/mockData'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Extract user ID from mock token (format: mock_token_{userId}_{timestamp})
      const parts = token.split('_')
      if (parts.length >= 3) {
        const userId = parseInt(parts[2])
        if (!isNaN(userId)) {
          setCurrentUser(userId)
        }
      }
      
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token')
          setCurrentUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const { access_token } = await apiLogin(username, password)
    localStorage.setItem('token', access_token)
    const me = await getMe()
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
