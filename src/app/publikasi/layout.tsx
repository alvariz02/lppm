import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publikasi | LPPM Kampus',
  description: 'Karya ilmiah dan publikasi peneliti LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
