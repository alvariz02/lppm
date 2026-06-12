'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ADMIN_ERROR]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
      </p>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RotateCcw className="size-4" />
        Coba Lagi
      </Button>
    </div>
  )
}
