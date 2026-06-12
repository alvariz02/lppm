'use client'

import { useState, useCallback, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: string
}

const STORAGE_KEY = 'lppm_admin'

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AuthUser
      if (parsed.id && parsed.email) {
        return parsed
      }
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
    }
    setLoading(false)
  }, [])

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    // Also clear the auth cookie for middleware
    document.cookie = 'lppm_auth=; path=/; max-age=0'
    setUser(null)
  }, [])

  return { user, loading, login, logout, isAuthenticated: !!user }
}
