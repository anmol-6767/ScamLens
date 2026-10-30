import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authApi.me().then(({ user: current }) => {
      if (active) setUser(current)
    }).catch(() => {
      if (active) setUser(null)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const value = {
    user,
    loading,
    login: async credentials => {
      const { user: current } = await authApi.login(credentials)
      setUser(current)
      return current
    },
    logout: async () => {
      try { await authApi.logout() } finally { setUser(null) }
    },
    updateUser: current => setUser(current),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}