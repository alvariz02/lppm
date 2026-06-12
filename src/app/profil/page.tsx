'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building2,
  Eye,
  Target,
  ClipboardList,
  MessageSquareQuote,
  Network,
  MapPin,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { formatDate } from '@/lib/helpers'
import type { LppmProfile } from '@/types'

// ============ TYPE DEFINITIONS ============

interface SiteSettings {
  email: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  googleMapsUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
}

// ============ DATA FETCHING ============

function useLppmProfile() {
  return useQuery({
    queryKey: ['lppm-profile'],
    queryFn: async () => {
      const res = await fetch('/api/lppm-profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const json = await res.json()
      return json.data as LppmProfile
    },
  })
}

function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const json = await res.json()
      return json.data as SiteSettings
    },
  })
}

// ============ SKELETON ============

function ProfileSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-3/4 max-w-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

// ============ HERO SECTION ============

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 lg:py-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30 text-sm px-4 py-1.5 font-medium backdrop-blur-sm">
            Tentang Kami
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Profil LPPM
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Mengenal lebih dekat Lembaga Penelitian dan Pengabdian kepada Masyarakat
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============ ABOUT SECTION ============

function AboutSection({ about }: { about: string | null }) {
  if (!about) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Tentang LPPM
            </h2>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
            {about}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ CHAIRMAN GREETING ============

function ChairmanSection({
  chairmanName,
  chairmanPhotoUrl,
  chairmanMessage,
}: {
  chairmanName: string | null
  chairmanPhotoUrl: string | null
  chairmanMessage: string | null
}) {
  if (!chairmanName && !chairmanMessage) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-lg bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
              <MessageSquareQuote className="size-5" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Sambutan Ketua LPPM
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0 flex flex-col items-center">
              <div className="size-28 lg:size-32 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                {chairmanPhotoUrl ? (
                  <img
                    src={chairmanPhotoUrl}
                    alt={chairmanName || 'Ketua LPPM'}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-12 text-primary/40" />
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground text-center">
                {chairmanName}
              </p>
              <p className="text-xs text-muted-foreground">Ketua LPPM</p>
            </div>
            <div className="flex-1">
              {chairmanMessage && (
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm lg:text-base italic border-l-4 border-accent/40 pl-4 lg:pl-6">
                  &ldquo;{chairmanMessage}&rdquo;
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ ACCORDION SECTIONS ============

function VisionMissionGoalsDuties({
  vision,
  mission,
  goals,
  duties,
}: {
  vision: string | null
  mission: string | null
  goals: string | null
  duties: string | null
}) {
  const sections = [
    {
      id: 'vision',
      icon: Eye,
      title: 'Visi',
      content: vision,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 'mission',
      icon: Target,
      title: 'Misi',
      content: mission,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'goals',
      icon: ClipboardList,
      title: 'Tujuan',
      content: goals,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'duties',
      icon: ClipboardList,
      title: 'Tugas & Fungsi',
      content: duties,
      color: 'bg-amber-100 text-amber-700',
    },
  ].filter((s) => s.content)

  if (sections.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 lg:p-8">
          <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${section.color}`}
                    >
                      <section.icon className="size-4" />
                    </div>
                    <span className="text-base font-semibold text-foreground">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 text-muted-foreground leading-relaxed whitespace-pre-line text-sm lg:text-base">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ ORGANIZATION STRUCTURE ============

function StructureSection({ structureImageUrl }: { structureImageUrl: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
              <Network className="size-5" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Struktur Organisasi
            </h2>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted overflow-hidden border border-border/50">
            {structureImageUrl ? (
              <img
                src={structureImageUrl}
                alt="Struktur Organisasi LPPM"
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-muted-foreground">
                <Network className="size-16 mb-4 opacity-30" />
                <p className="text-sm">Bagan struktur organisasi akan ditampilkan di sini</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ CONTACT SECTION ============

function ContactSection({ settings }: { settings: SiteSettings | null }) {
  const contactItems = [
    {
      icon: MapPin,
      label: 'Alamat',
      value: settings?.address,
      href: settings?.googleMapsUrl,
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings?.email,
      href: settings?.email ? `mailto:${settings.email}` : null,
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: settings?.phone,
      href: settings?.phone ? `tel:${settings.phone}` : null,
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: settings?.whatsapp,
      href: settings?.whatsapp
        ? `https://wa.me/${settings.whatsapp.replace(/^0/, '62').replace(/\D/g, '')}`
        : null,
    },
  ].filter((item) => item.value)

  if (contactItems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Kontak LPPM
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ MAIN PAGE ============

export default function ProfilPage() {
  const { data: profile, isLoading: profileLoading, error: profileError } = useLppmProfile()
  const { data: settings } = useSiteSettings()

  return (
    <div>
      <HeroSection />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {profileLoading ? (
            <ProfileSkeleton />
          ) : profileError ? (
            <div className="text-center py-12 text-destructive">
              Gagal memuat profil LPPM. Silakan coba lagi nanti.
            </div>
          ) : !profile ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="size-12 mx-auto mb-3 opacity-40" />
              <p>Profil LPPM belum tersedia</p>
            </div>
          ) : (
            <>
              <AboutSection about={profile.about} />
              <ChairmanSection
                chairmanName={profile.chairmanName}
                chairmanPhotoUrl={profile.chairmanPhotoUrl}
                chairmanMessage={profile.chairmanMessage}
              />
              <VisionMissionGoalsDuties
                vision={profile.vision}
                mission={profile.mission}
                goals={profile.goals}
                duties={profile.duties}
              />
              <StructureSection structureImageUrl={profile.structureImageUrl} />
              <ContactSection settings={settings ?? null} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
