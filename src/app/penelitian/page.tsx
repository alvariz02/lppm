'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FlaskConical,
  Search,
  Calendar,
  Filter,
  User,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { truncateText } from '@/lib/helpers'

// ============ TYPE DEFINITIONS ============

interface ResearchItem {
  id: string
  title: string
  slug: string
  abstract: string | null
  year: number
  status: string
  fundingSource: string | null
  leader: {
    id: string
    name: string
    nidn: string | null
    photoUrl: string | null
    expertise: string | null
  } | null
  fundingScheme: {
    id: string
    name: string
    slug: string
    source: string | null
    year: number
  } | null
  members: {
    researcher: { id: string; name: string; nidn: string | null; photoUrl: string | null }
  }[]
}

interface PaginatedData {
  data: ResearchItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ YEAR OPTIONS ============

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

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
            <FlaskConical className="size-3.5 mr-1" />
            Akademik
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Penelitian
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Eksplorasi berbagai kegiatan penelitian yang dilakukan oleh dosen dan peneliti
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============ FILTER BAR ============

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  year: string
  onYearChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  fundingScheme: string
  onFundingSchemeChange: (value: string) => void
}

function FilterBar({
  search,
  onSearchChange,
  year,
  onYearChange,
  status,
  onStatusChange,
  fundingScheme,
  onFundingSchemeChange,
}: FilterBarProps) {
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
            Filter &amp; Pencarian
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul penelitian..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fundingScheme} onValueChange={onFundingSchemeChange}>
              <SelectTrigger className="w-full">
                <Banknote className="size-4 mr-1" />
                <SelectValue placeholder="Semua Skema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Skema Pendanaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ RESEARCH CARD ============

function ResearchCard({ item, index }: { item: ResearchItem; index: number }) {
  const statusLabel =
    PROJECT_STATUS_LABELS[item.status as keyof typeof PROJECT_STATUS_LABELS] || item.status
  const statusColor =
    PROJECT_STATUS_COLORS[item.status as keyof typeof PROJECT_STATUS_COLORS] || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/penelitian/${item.slug}`} className="block h-full">
        <Card className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white h-full flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-[10px] border-0 ${statusColor}`}>
                {statusLabel}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {item.year}
              </Badge>
            </div>
            <CardTitle className="text-base leading-snug line-clamp-2 mt-2">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
              {truncateText(item.abstract, 150) || 'Tidak ada abstrak'}
            </p>
            <div className="flex items-center justify-between pt-3 border-t gap-2 flex-wrap">
              {item.leader && (
                <span className="text-xs text-muted-foreground truncate max-w-[50%] flex items-center gap-1">
                  <User className="size-3 shrink-0" />
                  {item.leader.name}
                </span>
              )}
              {item.fundingSource && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {item.fundingSource}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

// ============ SKELETON ============

function ResearchSkeleton() {
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
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="border-t pt-3 flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PAGINATION ============

function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)

      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium">{(page - 1) * DEFAULT_PAGE_SIZE + 1}</span>
        {' '}&ndash;{' '}
        <span className="font-medium">{Math.min(page * DEFAULT_PAGE_SIZE, total)}</span>
        {' '}dari <span className="font-medium">{total}</span> penelitian
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {getPageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p)}
              className="min-w-9"
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ============ MAIN PAGE ============

export default function PenelitianPage() {
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('all')
  const [status, setStatus] = useState('all')
  const [fundingScheme, setFundingScheme] = useState('all')
  const [page, setPage] = useState(1)

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(DEFAULT_PAGE_SIZE))
    if (search) params.set('search', search)
    if (year !== 'all') params.set('year', year)
    if (status !== 'all') params.set('status', status)
    if (fundingScheme !== 'all') params.set('fundingSchemeId', fundingScheme)
    return params.toString()
  }, [search, year, status, fundingScheme, page])

  const { data, isLoading, error } = useQuery({
    queryKey: ['research', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/research?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch research')
      return res.json() as Promise<PaginatedData>
    },
  })

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const handleYearChange = (value: string) => {
    setYear(value)
    setPage(1)
  }
  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }
  const handleFundingSchemeChange = (value: string) => {
    setFundingScheme(value)
    setPage(1)
  }

  return (
    <div>
      <HeroSection />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FilterBar
            search={search}
            onSearchChange={handleSearchChange}
            year={year}
            onYearChange={handleYearChange}
            status={status}
            onStatusChange={handleStatusChange}
            fundingScheme={fundingScheme}
            onFundingSchemeChange={handleFundingSchemeChange}
          />

          {isLoading ? (
            <ResearchSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Gagal memuat data penelitian. Silakan coba lagi nanti.
            </div>
          ) : !data || data.data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <FlaskConical className="size-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Tidak ada penelitian ditemukan</p>
              <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((item, index) => (
                  <ResearchCard key={item.id} item={item} index={index} />
                ))}
              </div>
              <PaginationControls
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
