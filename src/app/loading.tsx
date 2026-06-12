import { GraduationCap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="size-9 text-primary-foreground" />
          </div>
          <div className="absolute -inset-2 rounded-2xl border-2 border-primary/20 animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">LPPM</p>
          <p className="text-xs text-muted-foreground">Memuat halaman...</p>
        </div>
        <div className="flex gap-1 mt-2">
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  )
}
