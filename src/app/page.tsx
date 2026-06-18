'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FlaskConical,
  HeartHandshake,
  BookOpen,
  Users,
  Handshake,
  Award,
  ArrowRight,
  Megaphone,
  MapPin,
  FileText,
  Building2,
  Download,
  Phone,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PROJECT_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  PARTNER_TYPE_LABELS,
} from '@/lib/constants'

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ============ TYPE DEFINITIONS ============

interface StatsData {
  totalResearch: number
  totalCommunityService: number
  totalPublication: number
  totalResearcher: number
  totalPartner: number
  totalFundingScheme: number
  ongoingResearch: number
  completedResearch: number
  ongoingService: number
  completedService: number
  totalActiveHibah: number
}

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: string | null
  category: { id: string; name: string; slug: string } | null
}

interface AnnouncementItem {
  id: string
  title: string
  slug: string
  type: string
  publishedAt: string | null
}

interface ResearchItem {
  id: string
  title: string
  slug: string
  abstract: string | null
  year: number
  status: string
  fundingSource: string | null
  leader: { id: string; name: string; nidn: string | null; photoUrl: string | null; expertise: string | null } | null
}

interface CommunityServiceItem {
  id: string
  title: string
  slug: string
  summary: string | null
  location: string | null
  year: number
  status: string
  leader: { id: string; name: string; nidn: string | null; photoUrl: string | null; expertise: string | null } | null
}

interface PublicationItem {
  id: string
  title: string
  slug: string
  publicationType: string
  authors: string | null
  journalName: string | null
  year: number
  publicationAuthors: { researcher: { id: string; name: string } }[]
}

interface PartnerItem {
  id: string
  name: string
  slug: string
  partnerType: string
  cooperationType: string | null
}

// ============ DATA FETCHING HOOKS ============

function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json() as Promise<StatsData>
    },
  })
}

function useNews() {
  return useQuery({
    queryKey: ['news', 'featured'],
    queryFn: async () => {
      const res = await fetch('/api/news?featured=true&pageSize=3')
      if (!res.ok) throw new Error('Failed to fetch news')
      const json = await res.json()
      return (json.data ?? []) as NewsItem[]
    },
  })
}

function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await fetch('/api/announcement')
      if (!res.ok) throw new Error('Failed to fetch announcements')
      const json = await res.json()
      return (json.data ?? []) as AnnouncementItem[]
    },
  })
}

function useResearch() {
  return useQuery({
    queryKey: ['research', 'featured'],
    queryFn: async () => {
      const res = await fetch('/api/research?featured=true&pageSize=3')
      if (!res.ok) throw new Error('Failed to fetch research')
      const json = await res.json()
      return (json.data ?? []) as ResearchItem[]
    },
  })
}

function useCommunityService() {
  return useQuery({
    queryKey: ['community-service', 'featured'],
    queryFn: async () => {
      const res = await fetch('/api/community-service?featured=true&pageSize=3')
      if (!res.ok) throw new Error('Failed to fetch community service')
      const json = await res.json()
      return (json.data ?? []) as CommunityServiceItem[]
    },
  })
}

function usePublications() {
  return useQuery({
    queryKey: ['publications'],
    queryFn: async () => {
      const res = await fetch('/api/publication?pageSize=5')
      if (!res.ok) throw new Error('Failed to fetch publications')
      const json = await res.json()
      return (json.data ?? []) as PublicationItem[]
    },
  })
}

function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await fetch('/api/partner')
      if (!res.ok) throw new Error('Failed to fetch partners')
      const json = await res.json()
      return (json.data ?? []) as PartnerItem[]
    },
  })
}

// ============ HELPER FUNCTIONS ============

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function truncate(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

const statusColorMap: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  ongoing: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const pubTypeColorMap: Record<string, string> = {
  journal_national: 'bg-primary/10 text-primary',
  journal_international: 'bg-sky-100 text-sky-800',
  proceeding: 'bg-amber-100 text-amber-800',
  book: 'bg-emerald-100 text-emerald-800',
  book_chapter: 'bg-teal-100 text-teal-800',
  hki: 'bg-purple-100 text-purple-800',
  patent: 'bg-indigo-100 text-indigo-800',
  popular_article: 'bg-rose-100 text-rose-800',
}

const partnerTypeColorMap: Record<string, string> = {
  government: 'bg-primary/10 text-primary',
  industry: 'bg-sky-100 text-sky-800',
  ngo: 'bg-emerald-100 text-emerald-800',
  university: 'bg-amber-100 text-amber-800',
  community: 'bg-rose-100 text-rose-800',
  other: 'bg-gray-100 text-gray-700',
}

const partnerTypeIconMap: Record<string, string> = {
  government: '🏛️',
  industry: '🏭',
  ngo: '🤝',
  university: '🎓',
  community: '👥',
  other: '🏢',
}

const newsGradients = [
  'from-primary/80 via-primary/60 to-secondary/80',
  'from-secondary/80 via-sky-400/60 to-primary/70',
  'from-primary/70 via-primary/50 to-accent/60',
]

// ============ SKELETON COMPONENTS ============

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-md">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <Skeleton className="size-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ SECTION COMPONENTS ============

function HeroSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch hero data')
      const json = await res.json()
      return json
    },
  })

  const activeResearch = data?.ongoingResearch ?? 0
  const totalResearch = data?.totalResearch ?? 0
  const totalService = data?.totalCommunityService ?? 0
  const totalPublications = data?.totalPublication ?? 0

  const progressResearch = data?.ongoingResearch
    ? Math.round((data.ongoingResearch / Math.max(1, data.totalResearch)) * 100)
    : 0


  return (
    <section className="relative flex min-h-[380px] items-center overflow-hidden bg-sky-950 lg:min-h-[430px]">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.38),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_35%)]" />

      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/35 via-sky-950/75 to-sky-950" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Decorative blur */}
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [-12, 12, -12], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[12%] top-24 hidden h-20 w-20 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md lg:block"
      />

      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-28 left-[7%] hidden h-14 w-14 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-md lg:block"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        {/* Left Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          <motion.div variants={staggerItem}>
            <Badge className="mb-6 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md hover:bg-white/15">
              🏛️ LPPM Universitas Pasifik Morotai
            </Badge>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Pusat Inovasi{' '}
            <span className="bg-gradient-to-r from-accent to-yellow-200 bg-clip-text text-transparent">
              Penelitian
            </span>{' '}
            dan Pengabdian Masyarakat
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg lg:text-xl"
          >
            Mendorong riset, publikasi ilmiah, kolaborasi, dan pengabdian
            kepada masyarakat untuk membangun kampus yang unggul, inovatif,
            dan berdampak bagi daerah.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-accent px-6 font-bold text-accent-foreground shadow-xl shadow-accent/20 hover:bg-accent/90"
            >
              <Link href="/penelitian">
                <FlaskConical className="mr-2 size-5" />
                Lihat Penelitian
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/10 px-6 font-bold text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/pengabdian">
                <HeartHandshake className="mr-2 size-5" />
                Pengabdian
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-white/10 px-6 font-bold text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/dokumen">
                <Download className="mr-2 size-5" />
                Panduan
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Visual Card */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/30 via-white/10 to-blue-500/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/60">
                  Dashboard LPPM
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  Riset & Pengabdian
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                <FlaskConical className="size-6" />
              </div>
            </div>

            <div className="space-y-4">
            {error ? (
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-white">
                    Penelitian, Pengabdian, dan Publikasi
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    Gagal memuat data hero.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        Total Penelitian
                      </p>
                      <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-bold text-green-200">
                        {activeResearch} Berjalan
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, progressResearch))}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <HeartHandshake className="mb-3 size-6 text-accent" />
                      <p className="text-2xl font-extrabold text-white">
                        {totalService}
                      </p>
                      <p className="text-xs font-medium text-white/60">
                        Total Pengabdian
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <BookOpen className="mb-3 size-6 text-accent" />
                      <p className="text-2xl font-extrabold text-white">
                        {totalPublications}
                      </p>
                      <p className="text-xs font-medium text-white/60">
                        Publikasi
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
                    <p className="text-sm font-bold">Fokus LPPM</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Meningkatkan kualitas penelitian, pengabdian kepada masyarakat, dan publikasi ilmiah.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StatisticsSection() {
  const { data, isLoading, error } = useStats()

  const statCards = [
    {
      icon: FlaskConical,
      label: 'Total Penelitian',
      key: 'totalResearch' as const,
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: HeartHandshake,
      label: 'Total Pengabdian',
      key: 'totalCommunityService' as const,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      icon: BookOpen,
      label: 'Total Publikasi',
      key: 'totalPublication' as const,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Users,
      label: 'Total Dosen/Peneliti',
      key: 'totalResearcher' as const,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: Handshake,
      label: 'Total Mitra Kerja Sama',
      key: 'totalPartner' as const,
      color: 'bg-rose-100 text-rose-700',
    },
    {
      icon: Award,
      label: 'Total Hibah Aktif',
      key: 'totalActiveHibah' as const,
      color: 'bg-purple-100 text-purple-700',
    },
  ]

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            LPPM dalam Angka
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Capaian dan kontribusi LPPM dalam bidang penelitian, pengabdian, dan publikasi
          </p>
        </motion.div>

        {isLoading ? (
          <StatsSkeleton />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat statistik
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
          >
            {statCards.map((stat) => (
              <motion.div key={stat.key} variants={staggerItem}>
                <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`size-14 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
                    >
                      <stat.icon className="size-7" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground tabular-nums">
                        {data?.[stat.key] ?? 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

function NewsSection() {
  const { data, isLoading, error } = useNews()

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Berita Terbaru
            </h2>
            <p className="mt-1 text-muted-foreground">
              Informasi terkini seputar LPPM
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/berita">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <NewsSkeleton />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat berita
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada berita</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {data.map((news, index) => (
              <motion.div key={news.id} variants={staggerItem}>
                <Link href={`/berita/${news.slug}`} className="block h-full">
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
                  {/* Image / Gradient placeholder */}
                  <div
                    className={`h-48 bg-gradient-to-br ${
                      newsGradients[index % newsGradients.length]
                    } relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="size-16 text-white/30" />
                    </div>
                    {news.category && (
                      <Badge className="absolute top-3 left-3 bg-white/90 text-primary backdrop-blur-sm text-xs font-medium">
                        {news.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 leading-snug">
                      {news.title}
                    </h3>
                    {news.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                        {news.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(news.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-primary text-sm font-medium">
                        Baca
                        <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/berita">
              Lihat Semua Berita
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function AnnouncementSection() {
  const { data, isLoading, error } = useAnnouncements()

  const displayData = data?.slice(0, 5) ?? []

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Pengumuman Terbaru
            </h2>
            <p className="mt-1 text-muted-foreground">
              Informasi penting dari LPPM
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/pengumuman">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat pengumuman
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada pengumuman</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                {displayData.map((ann, index) => (
                  <Link
                    key={ann.id}
                    href={`/pengumuman/${ann.slug}`}
                    className={`flex items-center gap-4 p-4 lg:p-5 hover:bg-muted/50 transition-colors ${
                      index < displayData.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Megaphone className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-foreground truncate text-sm lg:text-base">
                          {ann.title}
                        </h4>
                        {ann.type === 'important' && (
                          <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0 border-0 shrink-0">
                            <AlertCircle className="size-2.5 mr-0.5" />
                            Penting
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(ann.publishedAt)}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/pengumuman">
              Lihat Semua Pengumuman
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function ResearchSection() {
  const { data, isLoading, error } = useResearch()

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Penelitian Unggulan
            </h2>
            <p className="mt-1 text-muted-foreground">
              Riset terbaik dari LPPM
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/penelitian">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat penelitian
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FlaskConical className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada penelitian unggulan</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {data.map((research) => (
              <motion.div key={research.id} variants={staggerItem}>
                <Link href={`/penelitian/${research.slug}`} className="block h-full">
                <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`text-[10px] border-0 ${
                          statusColorMap[research.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {PROJECT_STATUS_LABELS[research.status as keyof typeof PROJECT_STATUS_LABELS] || research.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {research.year}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-2 mt-2">
                      {research.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {truncate(research.abstract, 150) || 'Tidak ada abstrak'}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      {research.leader && (
                        <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                          👤 {research.leader.name}
                        </span>
                      )}
                      {research.fundingSource && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {research.fundingSource}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/penelitian">
              Lihat Semua Penelitian
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function CommunityServiceSection() {
  const { data, isLoading, error } = useCommunityService()

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Pengabdian Unggulan
            </h2>
            <p className="mt-1 text-muted-foreground">
              Dampak nyata untuk masyarakat
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/pengabdian">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat pengabdian
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <HeartHandshake className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada pengabdian unggulan</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {data.map((service) => (
              <motion.div key={service.id} variants={staggerItem}>
                <Link href={`/pengabdian/${service.slug}`} className="block h-full">
                <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`text-[10px] border-0 ${
                          statusColorMap[service.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {PROJECT_STATUS_LABELS[service.status as keyof typeof PROJECT_STATUS_LABELS] || service.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {service.year}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-2 mt-2">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {truncate(service.summary, 150) || 'Tidak ada ringkasan'}
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t text-xs text-muted-foreground">
                      {service.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="size-3 shrink-0" />
                          {service.location}
                        </span>
                      )}
                      {service.leader && (
                        <span className="flex items-center gap-1 truncate">
                          👤 {service.leader.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/pengabdian">
              Lihat Semua Pengabdian
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function PublicationSection() {
  const { data, isLoading, error } = usePublications()

  const displayData = data?.slice(0, 5) ?? []

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Publikasi Terbaru
            </h2>
            <p className="mt-1 text-muted-foreground">
              Karya ilmiah terbaru dari peneliti kami
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/publikasi">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat publikasi
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada publikasi</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                {displayData.map((pub, index) => {
                  const authorNames = pub.authors || pub.publicationAuthors?.map(pa => pa.researcher.name).join(', ') || ''
                  return (
                    <Link
                      key={pub.id}
                      href={`/publikasi/${pub.slug}`}
                      className={`flex items-start gap-4 p-4 lg:p-5 hover:bg-muted/50 transition-colors ${
                        index < displayData.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge
                            className={`text-[10px] border-0 ${
                              pubTypeColorMap[pub.publicationType] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {PUBLICATION_TYPE_LABELS[pub.publicationType as keyof typeof PUBLICATION_TYPE_LABELS] || pub.publicationType}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {pub.year}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground text-sm lg:text-base line-clamp-2 leading-snug">
                          {pub.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          {authorNames && (
                            <span className="truncate max-w-[60%]">{authorNames}</span>
                          )}
                          {pub.journalName && (
                            <>
                              <span className="hidden sm:inline">·</span>
                              <span className="italic truncate">{pub.journalName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0 hidden sm:block mt-2" />
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/publikasi">
              Lihat Semua Publikasi
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function PartnerSection() {
  const { data, isLoading, error } = usePartners()

  const displayData = data?.slice(0, 6) ?? []

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Mitra Kerja Sama
            </h2>
            <p className="mt-1 text-muted-foreground">
              Kolaborasi strategis untuk kemajuan bersama
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/kerjasama">
              Lihat Semua
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <Skeleton className="size-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Gagal memuat mitra
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="size-12 mx-auto mb-3 opacity-40" />
            <p>Belum ada mitra kerja sama</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
          >
            {displayData.map((partner) => (
              <motion.div key={partner.id} variants={staggerItem}>
                <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {partnerTypeIconMap[partner.partnerType] || '🏢'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-sm lg:text-base truncate">
                        {partner.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          className={`text-[10px] border-0 ${
                            partnerTypeColorMap[partner.partnerType] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {PARTNER_TYPE_LABELS[partner.partnerType as keyof typeof PARTNER_TYPE_LABELS] || partner.partnerType}
                        </Badge>
                        {partner.cooperationType && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {partner.cooperationType}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/kerjasama">
              Lihat Semua Mitra
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80 py-16 lg:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-0 -left-20 size-64 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-white">
          Hubungi LPPM
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          Butuh informasi lebih lanjut tentang penelitian, pengabdian, atau hibah?
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 font-semibold"
          >
            <Link href="/kontak">
              <Phone className="size-4" />
              Hubungi Kami
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold"
          >
            <Link href="/dokumen">
              <Download className="size-4" />
              Download Panduan
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

// ============ MAIN HOMEPAGE ============

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <NewsSection />
      <AnnouncementSection />
      <ResearchSection />
      <CommunityServiceSection />
      <PublicationSection />
      <PartnerSection />
      <CTASection />
    </>
  )
}
