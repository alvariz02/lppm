'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Award,
  Calendar,
  Filter,
  Banknote,
  Clock,
  ExternalLink,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FUNDING_SCHEME_STATUS_LABELS,
  FUNDING_SCHEME_STATUS_COLORS,
} from '@/lib/constants'
import { formatCurrency, formatDate, truncateText } from '@/lib/helpers'

// ============ TYPE DEFINITIONS ============

interface FundingSchemeItem {
  id: string
  name: string
  slug: string
  source: string | null
  year: number
  description: string | null
  requirements: string | null
  minBudget: number | null
  maxBudget: number | null
  openDate: string | null
  deadline: string | null
  status: string
  guideFileUrl: string | null
  registrationUrl: string | null
}

// ============ YEAR OPTIONS ============

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

// ============ HERO SECTION ============

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 lg:py-24">
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
            <Award className="size-3.5 mr-1" />
            Pendanaan
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Hibah dan Pendanaan
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Informasi skema pendanaan dan hibah penelitian yang tersedia
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============ FILTER BAR ============

interface FilterBarProps {
  status: string
  onStatusChange: (value: string) => void
  year: string
  onYearChange: (value: string) => void
}

function FilterBar({ status, onStatusChange, year, onYearChange }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
            <Filter className="size-4" />
            Filter
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="closed">Ditutup</SelectItem>
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger className="w-full">
                <Calendar className="size-4 mr-1" />
                <SelectValue placeholder="Semua Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ FUNDING SCHEME CARD ============

function FundingSchemeCard({ item, index }: { item: FundingSchemeItem; index: number }) {
  const statusLabel =
    FUNDING_SCHEME_STATUS_LABELS[item.status as keyof typeof FUNDING_SCHEME_STATUS_LABELS] ||
    item.status
  const statusColor =
    FUNDING_SCHEME_STATUS_COLORS[item.status as keyof typeof FUNDING_SCHEME_STATUS_COLORS] || ''

  const budgetRange =
    item.minBudget != null && item.maxBudget != null
      ? `${formatCurrency(item.minBudget)} - ${formatCurrency(item.maxBudget)}`
      : item.minBudget != null
        ? `Mulai ${formatCurrency(item.minBudget)}`
        : item.maxBudget != null
          ? `Maks. ${formatCurrency(item.maxBudget)}`
          : null

  const isDeadlineSoon = (() => {
    if (!item.deadline || item.status !== 'active') return false
    const deadline = new Date(item.deadline)
    const now = new Date()
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 14
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/hibah/${item.slug}`} className="block h-full">
      <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] border-0 ${statusColor}`}>
              {statusLabel}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {item.year}
            </Badge>
            {isDeadlineSoon && (
              <Badge className="bg-orange-100 text-orange-800 text-[10px] border-0">
                <Clock className="size-3 mr-0.5" />
                Segera Tutup
              </Badge>
            )}
          </div>
          <CardTitle className="text-base leading-snug line-clamp-2 mt-2">
            {item.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {truncateText(item.description, 180)}
            </p>
          )}

          <div className="space-y-2 mt-auto">
            {item.source && (
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="size-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Sumber:</span>
                <span className="font-medium text-foreground">{item.source}</span>
              </div>
            )}
            {budgetRange && (
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="size-4 text-emerald-600 shrink-0" />
                <span className="text-muted-foreground">Dana:</span>
                <span className="font-medium text-emerald-700">{budgetRange}</span>
              </div>
            )}
            {item.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium text-foreground">{formatDate(item.deadline)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2 flex-wrap">
          {item.status === 'active' && item.registrationUrl && (
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={item.registrationUrl} target="_blank" rel="noopener noreferrer">
                Daftar
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          {item.status === 'active' && !item.registrationUrl && (
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Daftar
            </Button>
          )}
          {item.guideFileUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={item.guideFileUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="size-3.5" />
                Panduan
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
      </Link>
    </motion.div>
  )
}

// ============ SKELETON ============

function FundingSchemeSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// ============ MAIN PAGE ============

export default function HibahPage() {
  const [status, setStatus] = useState('all')
  const [year, setYear] = useState('all')

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (year !== 'all') params.set('year', year)
    return params.toString()
  }, [status, year])

  const { data, isLoading, error } = useQuery({
    queryKey: ['funding-scheme', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/funding-scheme?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch funding schemes')
      const json = await res.json()
      return (json.data ?? []) as FundingSchemeItem[]
    },
  })

  const handleStatusChange = (value: string) => {
    setStatus(value)
  }
  const handleYearChange = (value: string) => {
    setYear(value)
  }

  return (
    <div>
      <HeroSection />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FilterBar
            status={status}
            onStatusChange={handleStatusChange}
            year={year}
            onYearChange={handleYearChange}
          />

          {isLoading ? (
            <FundingSchemeSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Gagal memuat data hibah. Silakan coba lagi nanti.
            </div>
          ) : !data || data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Award className="size-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Tidak ada hibah ditemukan</p>
              <p className="text-sm">Coba ubah filter Anda</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item, index) => (
                <FundingSchemeCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
