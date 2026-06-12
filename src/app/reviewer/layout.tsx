import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reviewer | LPPM Kampus',
  description: 'Daftar reviewer internal dan eksternal LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
