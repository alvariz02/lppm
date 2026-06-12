import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pengabdian Masyarakat | LPPM Kampus',
  description: 'Daftar kegiatan pengabdian kepada masyarakat LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
