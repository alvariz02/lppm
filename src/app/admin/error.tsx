'use client'

import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || 'Halaman admin tidak dapat dimuat. Silakan coba lagi.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Button
          variant="outline"
          onClick={reset}
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/admin">
            <ArrowLeft className="size-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
