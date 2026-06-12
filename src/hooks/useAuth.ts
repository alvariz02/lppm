'use client'

import { useState, useCallback, useEffect } from 'react'
import type { UserRole } from '@/types'
import type { Permission } from '@/lib/permissions'
import { hasPermission as hasRolePermission, canAccessRoute } from '@/lib/permissions'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: UserRole
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

  // Read from localStorage after mount
  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
    }
    setLoading(false)
  }, [])

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handler = () => {
      const stored = getStoredUser()
      setUser(stored)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    document.cookie = 'lppm_auth=; path=/; max-age=0'
    document.cookie = 'lppm_role=; path=/; max-age=0'
    setUser(null)
  }, [])

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false
      return hasRolePermission(user.role, permission)
    },
    [user]
  )

  const canAccess = useCallback(
    (route: string) => {
      if (!user) return false
      return canAccessRoute(user.role, route)
    },
    [user]
  )

  return { user, loading, login, logout, isAuthenticated: !!user, hasPermission, canAccess }
}
