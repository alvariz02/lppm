import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dokumen Unduhan | LPPM Kampus',
  description: 'Dokumen dan panduan LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
