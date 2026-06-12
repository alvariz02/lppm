import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Galeri | LPPM Kampus',
  description: 'Galeri foto kegiatan LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
