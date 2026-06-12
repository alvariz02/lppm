'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[APP_ERROR]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="size-12 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Terjadi Kesalahan
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Maaf, telah terjadi kesalahan saat memuat halaman ini. Silakan coba lagi
          atau kembali ke halaman utama.
        </p>

        {/* Error digest if available */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            size="lg"
            variant="default"
            className="min-w-[180px]"
          >
            <RotateCcw className="size-4 mr-2" />
            Coba Lagi
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[180px]"
          >
            <Link href="/">
              <Home className="size-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>

        {/* Footer text */}
        <p className="mt-10 text-xs text-muted-foreground/60">
          LPPM — Lembaga Penelitian dan Pengabdian kepada Masyarakat
        </p>
      </div>
    </div>
  )
}
