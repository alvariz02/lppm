'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

const EXCLUDED_PATHS = ['/admin', '/login']

function isExcludedPath(pathname: string) {
  return EXCLUDED_PATHS.some((p) => pathname.startsWith(p))
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const excluded = isExcludedPath(pathname)

  if (excluded) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
