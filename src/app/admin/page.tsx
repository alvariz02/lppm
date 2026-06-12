'use client'

import { lazy, Suspense, memo, ComponentType, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FlaskConical,
  HeartHandshake,
  FileText,
  Users,
  Banknote,
  Handshake,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  Newspaper,
  Bell,
  Download,
  Mail,
  ClipboardCheck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  PUBLICATION_TYPE_LABELS,
  FUNDING_SCHEME_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  NEWS_STATUS_LABELS,
} from '@/lib/constants'

// ============ TYPES ============

interface StatsData {
  totalResearch: number
  totalCommunityService: number
  totalPublication: number
  totalResearcher: number
  totalPartner: number
  totalActiveHibah: number
  totalNews: number
  totalAnnouncement: number
  totalDocument: number
  unreadMessages: number
  pendingReviews: number
  researchPerYear: { year: number; count: number }[]
  servicePerYear: { year: number; count: number }[]
  publicationsByType: { type: string; count: number }[]
  fundingByStatus: { status: string; count: number }[]
  recentResearch: { id: string; title: string; status: string; year: number; createdAt: string }[]
  recentServices: { id: string; title: string; status: string; year: number; createdAt: string }[]
  recentNews: { id: string; title: string; status: string; createdAt: string }[]
}

// ============ CHART CONFIGS ============

const researchChartConfig: ChartConfig = {
  count: { label: 'Jumlah Penelitian', color: 'oklch(0.35 0.1 250)' },
}

const serviceChartConfig: ChartConfig = {
  count: { label: 'Jumlah Pengabdian', color: 'oklch(0.62 0.21 255)' },
}

const publicationChartConfig: ChartConfig = {
  journal_national: { label: 'Jurnal Nasional', color: 'oklch(0.35 0.1 250)' },
  journal_international: { label: 'Jurnal Internasional', color: 'oklch(0.62 0.21 255)' },
  proceeding: { label: 'Prosiding', color: 'oklch(0.78 0.17 75)' },
  book: { label: 'Buku', color: 'oklch(0.65 0.13 195)' },
  book_chapter: { label: 'Bab Buku', color: 'oklch(0.48 0.18 275)' },
  hki: { label: 'HKI', color: 'oklch(0.55 0.15 160)' },
  patent: { label: 'Paten', color: 'oklch(0.45 0.2 300)' },
  popular_article: { label: 'Artikel Populer', color: 'oklch(0.6 0.12 30)' },
}

const fundingChartConfig: ChartConfig = {
  draft: { label: 'Draft', color: 'oklch(0.65 0.02 250)' },
  active: { label: 'Aktif', color: 'oklch(0.65 0.17 145)' },
  closed: { label: 'Ditutup', color: 'oklch(0.577 0.245 27.325)' },
}

const PIE_COLORS = [
  'oklch(0.35 0.1 250)',
  'oklch(0.62 0.21 255)',
  'oklch(0.78 0.17 75)',
  'oklch(0.65 0.13 195)',
  'oklch(0.48 0.18 275)',
  'oklch(0.55 0.15 160)',
  'oklch(0.45 0.2 300)',
  'oklch(0.6 0.12 30)',
]

// ============ DATA HOOK ============

function useStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json() as Promise<StatsData>
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })
}

// ============ HELPERS ============

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ============ MEMOIZED STAT CARD ============

interface StatCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}

const StatCard = memo(function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
        >
          <Icon className="size-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// ============ SKELETON COMPONENTS ============

function StatCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <Skeleton className="size-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

// ============ ERROR BOUNDARY FOR CHART SECTIONS ============

function ChartErrorBoundary({ children, title }: { children: React.ReactNode; title: string }) {
  const [hasError, setHasError] = useState(false)
  const [errorKey, setErrorKey] = useState(0)

  if (hasError) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertCircle className="size-8 text-destructive/50" />
            <p className="text-sm">Gagal memuat chart</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHasError(false)
                setErrorKey((k) => k + 1)
              }}
            >
              <RefreshCw className="size-3.5 mr-1" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundaryWrapper
      key={errorKey}
      onError={() => setHasError(true)}
    >
      {children}
    </ErrorBoundaryWrapper>
  )
}

// Simple class-based error boundary wrapper
import { Component } from 'react'

interface EBProps {
  children: React.ReactNode
  onError: () => void
}

interface EBState {
  hasError: boolean
}

class ErrorBoundaryWrapper extends Component<EBProps, EBState> {
  state: EBState = { hasError: false }

  static getDerivedStateFromError(): EBState {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

// ============ LAZY-LOADED CHART COMPONENTS ============

// We lazy-load the Recharts components which are the heaviest parts
const LazyResearchChart = lazy(() =>
  import('recharts').then((mod) => ({
    default: function ResearchYearChart({ data }: { data: { year: string; count: number }[] }) {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Penelitian per Tahun</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={researchChartConfig} className="h-64 w-full">
              <mod.BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <mod.CartesianGrid strokeDasharray="3 3" vertical={false} />
                <mod.XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
                <mod.YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <mod.Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </mod.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )
    },
  }))
)

const LazyServiceChart = lazy(() =>
  import('recharts').then((mod) => ({
    default: function ServiceYearChart({ data }: { data: { year: string; count: number }[] }) {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pengabdian per Tahun</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={serviceChartConfig} className="h-64 w-full">
              <mod.BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <mod.CartesianGrid strokeDasharray="3 3" vertical={false} />
                <mod.XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
                <mod.YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <mod.Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </mod.BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )
    },
  }))
)

const LazyPublicationChart = lazy(() =>
  import('recharts').then((mod) => ({
    default: function PublicationTypeChart({
      data,
    }: {
      data: { type: string; value: number; fill: string }[]
    }) {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Publikasi berdasarkan Jenis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data publikasi
              </div>
            ) : (
              <ChartContainer config={publicationChartConfig} className="h-64 w-full">
                <mod.PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="type" />} />
                  <mod.Pie
                    data={data}
                    dataKey="value"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {data.map((_, index) => (
                      <mod.Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </mod.Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="type" />} />
                </mod.PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )
    },
  }))
)

const LazyFundingChart = lazy(() =>
  import('recharts').then((mod) => ({
    default: function FundingStatusChart({
      data,
    }: {
      data: { status: string; count: number; fill: string }[]
    }) {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Hibah berdasarkan Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data hibah
              </div>
            ) : (
              <ChartContainer config={fundingChartConfig} className="h-64 w-full">
                <mod.BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <mod.CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <mod.XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                  <mod.YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <mod.Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </mod.BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )
    },
  }))
)

// ============ ANIMATION ============

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

// ============ STAT CARDS CONFIG ============

const STAT_CARDS = [
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
    icon: FileText,
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
    icon: Banknote,
    label: 'Hibah Aktif',
    key: 'totalActiveHibah' as const,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Handshake,
    label: 'Total Mitra',
    key: 'totalPartner' as const,
    color: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Newspaper,
    label: 'Berita',
    key: 'totalNews' as const,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Bell,
    label: 'Pengumuman',
    key: 'totalAnnouncement' as const,
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: Download,
    label: 'Dokumen',
    key: 'totalDocument' as const,
    color: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Mail,
    label: 'Pesan Belum Dibaca',
    key: 'unreadMessages' as const,
    color: 'bg-red-100 text-red-700',
  },
  {
    icon: ClipboardCheck,
    label: 'Review Menunggu',
    key: 'pendingReviews' as const,
    color: 'bg-yellow-100 text-yellow-700',
  },
]

// ============ MAIN PAGE ============

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useStats()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-destructive">
        <AlertCircle className="size-10" />
        <p className="text-sm font-medium">Gagal memuat data dashboard</p>
        <p className="text-xs text-muted-foreground">Coba muat ulang halaman</p>
      </div>
    )
  }

  // Prepare chart data
  const researchYearData = data?.researchPerYear.map((d) => ({
    year: String(d.year),
    count: d.count,
  })) ?? []

  const serviceYearData = data?.servicePerYear.map((d) => ({
    year: String(d.year),
    count: d.count,
  })) ?? []

  const publicationTypeData = data?.publicationsByType.map((d) => ({
    type: PUBLICATION_TYPE_LABELS[d.type as keyof typeof PUBLICATION_TYPE_LABELS] || d.type,
    value: d.count,
    fill: d.type,
  })) ?? []

  const fundingStatusData = data?.fundingByStatus.map((d) => ({
    status: FUNDING_SCHEME_STATUS_LABELS[d.status as keyof typeof FUNDING_SCHEME_STATUS_LABELS] || d.status,
    count: d.count,
    fill: d.status,
  })) ?? []

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="space-y-6"
    >
      {/* Page heading */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
            <p className="text-sm text-muted-foreground">
              Ringkasan data LPPM dalam satu tampilan
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={item}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {STAT_CARDS.map((stat) => (
              <StatCard
                key={stat.key}
                icon={stat.icon}
                label={stat.label}
                value={data?.[stat.key] ?? 0}
                color={stat.color}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Charts Row 1: Research & Community Service per Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <ChartErrorBoundary title="Penelitian per Tahun">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyResearchChart data={researchYearData} />
            </Suspense>
          </ChartErrorBoundary>
        </motion.div>

        <motion.div variants={item}>
          <ChartErrorBoundary title="Pengabdian per Tahun">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyServiceChart data={serviceYearData} />
            </Suspense>
          </ChartErrorBoundary>
        </motion.div>
      </div>

      {/* Charts Row 2: Publications by Type & Funding by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item}>
          <ChartErrorBoundary title="Publikasi berdasarkan Jenis">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyPublicationChart data={publicationTypeData} />
            </Suspense>
          </ChartErrorBoundary>
        </motion.div>

        <motion.div variants={item}>
          <ChartErrorBoundary title="Hibah berdasarkan Status">
            <Suspense fallback={<ChartSkeleton />}>
              <LazyFundingChart data={fundingStatusData} />
            </Suspense>
          </ChartErrorBoundary>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {/* Recent Research */}
                {data?.recentResearch.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FlaskConical className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {PROJECT_STATUS_LABELS[r.status as keyof typeof PROJECT_STATUS_LABELS] || r.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Community Services */}
                {data?.recentServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <HeartHandshake className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {PROJECT_STATUS_LABELS[s.status as keyof typeof PROJECT_STATUS_LABELS] || s.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent News */}
                {data?.recentNews.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {NEWS_STATUS_LABELS[n.status as keyof typeof NEWS_STATUS_LABELS] || n.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!data?.recentResearch.length && !data?.recentServices.length && !data?.recentNews.length) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Belum ada aktivitas terbaru
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
