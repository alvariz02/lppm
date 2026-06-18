'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Menu,
  Search,
  ChevronDown,
  LogIn,
  X,
  Home,
  BookOpen,
  Newspaper,
  CalendarDays,
  ImageIcon,
  Phone,
  Handshake,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavLink {
  label: string
  href: string
}

interface DropdownLink {
  label: string
  items: NavLink[]
}

type NavItem = NavLink | DropdownLink

function isDropdown(item: NavItem): item is DropdownLink {
  return 'items' in item
}

const navItems: NavItem[] = [
  { label: 'Beranda', href: '/' },
  { label: 'Profil', href: '/profil' },
  {
    label: 'Akademik',
    items: [
      { label: 'Penelitian', href: '/penelitian' },
      { label: 'Pengabdian', href: '/pengabdian' },
      { label: 'Publikasi', href: '/publikasi' },
      { label: 'Hibah', href: '/hibah' },
    ],
  },
  {
    label: 'Info',
    items: [
      { label: 'Berita', href: '/berita' },
      { label: 'Pengumuman', href: '/pengumuman' },
      { label: 'Dokumen', href: '/dokumen' },
    ],
  },
  { label: 'Kerja Sama', href: '/kerjasama' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Kontak', href: '/kontak' },
]

const allLinks: NavLink[] = navItems.flatMap((item) =>
  isDropdown(item) ? item.items : [item]
)

function getMobileIcon(label: string) {
  const iconClass = 'size-4'

  switch (label) {
    case 'Beranda':
      return <Home className={iconClass} />
    case 'Penelitian':
    case 'Pengabdian':
    case 'Publikasi':
    case 'Hibah':
      return <BookOpen className={iconClass} />
    case 'Berita':
    case 'Pengumuman':
    case 'Dokumen':
      return <Newspaper className={iconClass} />
    case 'Kerja Sama':
      return <Handshake className={iconClass} />
    case 'Agenda':
      return <CalendarDays className={iconClass} />
    case 'Galeri':
      return <ImageIcon className={iconClass} />
    case 'Kontak':
      return <Phone className={iconClass} />
    default:
      return <BookOpen className={iconClass} />
  }
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isDropdownActive = (items: NavLink[]) =>
    items.some((item) => isActive(item.href))

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'border-slate-200/70 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur-xl'
          : 'border-transparent bg-white/95'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent ring-1 ring-primary/15 transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/30">
            <img
              src="/lppm-logo.png"
              alt="Logo LPPM"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold tracking-wide text-slate-900">
              LPPM UNIPAS
            </p>
            <p className="text-xs font-medium text-slate-500">
              Penelitian & Pengabdian
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center rounded-full border border-slate-200 bg-slate-50/80 px-2 py-1.5 shadow-sm lg:flex">
          {navItems.map((item) =>
            isDropdown(item) ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isDropdownActive(item.items)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-slate-700 hover:bg-white hover:text-primary hover:shadow-sm'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  sideOffset={12}
                  className="w-56 rounded-2xl border-slate-200 bg-white/95 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
                >
                  {item.items.map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link
                        href={subItem.href}
                        className={`flex cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive(subItem.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-700 hover:bg-white hover:text-primary hover:shadow-sm'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-600 hover:bg-primary/10 hover:text-primary"
            aria-label="Cari"
          >
            <Search className="size-5" />
          </Button>

          <Button
            size="sm"
            asChild
            className="hidden rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:inline-flex"
          >
            <Link href="/login">
              <LogIn className="mr-1 size-4" />
              Admin
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-600 hover:bg-primary/10 hover:text-primary lg:hidden"
                aria-label="Menu navigasi"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[310px] border-l border-slate-200 bg-white p-0 sm:w-[370px]"
            >
              <div className="flex h-full flex-col">
                {/* Mobile Header */}
                <div className="flex items-center justify-between border-b bg-slate-50/80 p-5">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                      <img
                        src="/lppm-logo.png"
                        alt="Logo LPPM"
                        className="h-9 w-9 object-contain"
                      />
                    </div>

                    <div className="text-left leading-tight">
                      <p className="text-sm font-bold text-slate-900">
                        LPPM UNIPAS
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Menu Navigasi
                      </p>
                    </div>
                  </SheetTitle>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                    aria-label="Tutup menu"
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                {/* Mobile Links */}
                <div className="flex-1 overflow-y-auto px-4 py-5">
                  <nav className="flex flex-col gap-2">
                    {allLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                          isActive(link.href)
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-slate-50 text-slate-700 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {getMobileIcon(link.label)}
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Mobile Footer */}
                <div className="border-t bg-slate-50/80 p-4">
                  <Button
                    asChild
                    className="h-11 w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/login">
                      <LogIn className="mr-2 size-4" />
                      Login Admin
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}