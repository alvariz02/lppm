import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil LPPM | LPPM Kampus',
  description: 'Profil Lembaga Penelitian dan Pengabdian kepada Masyarakat - Visi, Misi, dan Struktur Organisasi',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
