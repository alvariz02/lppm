'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
            <FileQuestion className="size-12 text-primary" />
          </div>
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl font-extrabold text-primary/20 mb-2 select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan,
          dihapus, atau URL yang Anda masukkan salah.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="min-w-[180px]"
          >
            <Link href="/">
              <Home className="size-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[180px]"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="size-4 mr-2" />
              Halaman Sebelumnya
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
