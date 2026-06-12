'use client'

import { Eye } from 'lucide-react'

/**
 * Banner shown on admin pages where the user has view-only access.
 */
export function ViewOnlyBanner() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
      <Eye className="size-4 shrink-0" />
      <span>Anda memiliki akses lihat saja untuk halaman ini</span>
    </div>
  )
}
