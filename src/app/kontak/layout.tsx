import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontak | LPPM Kampus',
  description: 'Hubungi LPPM untuk informasi lebih lanjut',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
