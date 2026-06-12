'use client'

import { useAuth } from './useAuth'
import { isRouteViewOnly, canWriteRoute } from '@/lib/permissions'
import { usePathname } from 'next/navigation'

/**
 * Hook for admin pages to check RBAC permissions.
 * Returns view-only and write access status based on the current route and user role.
 */
export function useAdminPage() {
  const { user, hasPermission, canAccess } = useAuth()
  const pathname = usePathname()

  const viewOnly = user ? isRouteViewOnly(user.role, pathname) : false
  const canWrite = user ? canWriteRoute(user.role, pathname) : false

  return {
    user,
    isViewOnly: viewOnly,
    canWrite,
    hasPermission,
    canAccess,
    role: user?.role ?? null,
  }
}
