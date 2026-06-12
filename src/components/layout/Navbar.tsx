'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Menu,
  Search,
  GraduationCap,
  ChevronDown,
  LogIn,
  X,
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

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md'
          : 'bg-white shadow-sm'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <GraduationCap className="size-8 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-primary tracking-tight">
            LPPM
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            isDropdown(item) ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isDropdownActive(item.items)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {item.items.map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link
                        href={subItem.href}
                        className={`cursor-pointer ${
                          isActive(subItem.href)
                            ? 'text-primary font-medium bg-primary/5'
                            : ''
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
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/70 hover:text-primary"
            aria-label="Cari"
          >
            <Search className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/login">
              <LogIn className="size-4" />
              Admin
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground/70 hover:text-primary"
                aria-label="Menu navigasi"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                {/* Mobile header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <GraduationCap className="size-6 text-primary" />
                    <span className="text-lg font-bold text-primary">LPPM</span>
                  </SheetTitle>
                </div>

                {/* Mobile links */}
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="flex flex-col gap-1 px-3">
                    {allLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                          isActive(link.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Mobile footer */}
                <div className="p-4 border-t">
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/login">
                      <LogIn className="size-4" />
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
