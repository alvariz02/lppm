import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kerja Sama | LPPM Kampus',
  description: 'Mitra kerja sama LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
