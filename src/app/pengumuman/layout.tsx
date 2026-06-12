import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pengumuman | LPPM Kampus',
  description: 'Pengumuman resmi LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
