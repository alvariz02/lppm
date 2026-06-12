import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agenda | LPPM Kampus',
  description: 'Agenda kegiatan dan acara LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
