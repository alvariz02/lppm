import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hibah & Pendanaan | LPPM Kampus',
  description: 'Informasi skema hibah dan pendanaan penelitian LPPM',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
