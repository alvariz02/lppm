'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  FileText,
  Banknote,
  Newspaper,
  Bell,
  Download,
  UserCheck,
  ClipboardCheck,
  Handshake,
  Calendar,
  Image,
  Mail,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { USER_ROLE_LABELS } from '@/lib/constants'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Profil LPPM', icon: Building2, href: '/admin/profil' },
  { label: 'Dosen/Peneliti', icon: Users, href: '/admin/researchers' },
  { label: 'Fakultas', icon: GraduationCap, href: '/admin/faculties' },
  { label: 'Program Studi', icon: BookOpen, href: '/admin/study-programs' },
  { label: 'Penelitian', icon: FlaskConical, href: '/admin/research' },
  { label: 'Pengabdian', icon: HeartHandshake, href: '/admin/community-service' },
  { label: 'Publikasi', icon: FileText, href: '/admin/publications' },
  { label: 'Hibah/Pendanaan', icon: Banknote, href: '/admin/funding' },
  { label: 'Berita', icon: Newspaper, href: '/admin/news' },
  { label: 'Pengumuman', icon: Bell, href: '/admin/announcements' },
  { label: 'Dokumen Unduhan', icon: Download, href: '/admin/documents' },
  { label: 'Reviewer', icon: UserCheck, href: '/admin/reviewers' },
  { label: 'Review Proposal', icon: ClipboardCheck, href: '/admin/reviews' },
  { label: 'Kerja Sama', icon: Handshake, href: '/admin/partners' },
  { label: 'Agenda', icon: Calendar, href: '/admin/agenda' },
  { label: 'Galeri', icon: Image, href: '/admin/gallery' },
  { label: 'Pesan Kontak', icon: Mail, href: '/admin/messages' },
  { label: 'User Admin', icon: Shield, href: '/admin/users' },
  { label: 'Pengaturan', icon: Settings, href: '/admin/settings' },
]

function SidebarContent({
  pathname,
  onNavigate,
  collapsed,
}: {
  pathname: string
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const router = useRouter()
  const { logout } = useAuth()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore error, still proceed with local logout
    }
    logout()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      {/* Logo section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
        <div className="size-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <GraduationCap className="size-6 text-accent-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-lg leading-tight">LPPM</h2>
            <p className="text-xs text-primary-foreground/70 leading-tight">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-foreground/75 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={`size-5 shrink-0 ${
                    active ? 'text-accent' : 'text-primary-foreground/60 group-hover:text-primary-foreground/90'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout button */}
      <div className="px-2 py-3 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-foreground/75 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Close mobile sidebar on route change
  // Using the onNavigate callback on sidebar links handles this
  // when user clicks a link. Browser navigation (back/forward) is
  // acceptable to keep the sidebar open.

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <GraduationCap className="size-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-white/10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      >
        <div className="relative h-full">
          <SidebarContent pathname={pathname} collapsed={sidebarCollapsed} />
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-[72px] -right-3 size-6 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-muted transition-colors z-10"
          >
            <ChevronLeft
              className={`size-3.5 text-foreground transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden shadow-xl"
            >
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm shrink-0">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {NAV_ITEMS.find((item) => {
                    if (item.href === '/admin') return pathname === '/admin'
                    return pathname.startsWith(item.href)
                  })?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.fullName || user?.email}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5"
                >
                  {user?.role
                    ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS] || user.role
                    : 'Admin'}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                  } catch {
                    // Ignore error, still proceed with local logout
                  }
                  logout()
                  router.push('/login')
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
