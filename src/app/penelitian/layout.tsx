import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Penelitian | LPPM Kampus',
  description: 'Daftar kegiatan penelitian dosen dan peneliti LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
