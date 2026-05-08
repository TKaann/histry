import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore user from localStorage on page refresh — no network call needed
    const token    = localStorage.getItem('histry_token')
    const userJson = localStorage.getItem('histry_user')
    if (token && userJson) {
      try {
        setUser(JSON.parse(userJson))
      } catch {
        localStorage.removeItem('histry_token')
        localStorage.removeItem('histry_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('histry_token', res.data.token)
    localStorage.setItem('histry_user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await authApi.register(username, email, password)
    localStorage.setItem('histry_token', res.data.token)
    localStorage.setItem('histry_user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('histry_token')
    localStorage.removeItem('histry_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
