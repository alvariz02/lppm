import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Berita | LPPM Kampus',
  description: 'Berita terkini seputar LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
