'use client'

import Link from 'next/link'
import {
  GraduationCap,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const quickLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Profil', href: '/profil' },
  { label: 'Kerja Sama', href: '/kerjasama' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Kontak', href: '/kontak' },
]

const serviceLinks = [
  { label: 'Penelitian', href: '/penelitian' },
  { label: 'Pengabdian', href: '/pengabdian' },
  { label: 'Publikasi', href: '/publikasi' },
  { label: 'Hibah', href: '/hibah' },
  { label: 'Dokumen', href: '/dokumen' },
]

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/lppm_unipasmorotai/', icon: Instagram },
  { label: 'Youtube', href: 'https://youtube.com', icon: Youtube },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <GraduationCap className="size-8 text-accent transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold tracking-tight">LPPM</span>
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/80 leading-relaxed max-w-xs">
              Lembaga Penelitian dan Pengabdian kepada Masyarakat. Mendorong
              inovasi riset dan dampak positif bagi masyarakat melalui
              penelitian berkualitas dan pengabdian yang bermakna.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center justify-center size-9 rounded-full bg-primary-foreground/10 text-primary-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Tautan Cepat */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Tautan Cepat
            </h3>
            <Separator className="my-3 bg-primary-foreground/20" />
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Layanan */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Layanan
            </h3>
            <Separator className="my-3 bg-primary-foreground/20" />
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Kontak */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Kontak
            </h3>
            <Separator className="my-3 bg-primary-foreground/20" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 shrink-0 text-accent" />
                <span className="text-sm text-primary-foreground/80 leading-relaxed">
                  Jln. Sudirman, Kompleks Lemonade, Daruba Morotai Selatan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-accent" />
                <a
                  href="mailto:lppm@kampus.ac.id"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  lppm@kampus.ac.id
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-accent" />
                <a
                  href="tel:+6221123456"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  (021) 123-456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-accent" />
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  +62 812-3456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <Separator className="bg-primary-foreground/20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-xs text-primary-foreground/60">
          &copy; 2024 LPPM Kampus. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
