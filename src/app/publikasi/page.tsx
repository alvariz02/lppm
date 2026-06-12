'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Calendar,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
  PUBLICATION_TYPE_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'

// ============ TYPE DEFINITIONS ============

interface PublicationItem {
  id: string
  title: string
  slug: string
  publicationType: string
  authors: string | null
  publisherName: string | null
  journalName: string | null
  year: number
  volume: string | null
  number: string | null
  pages: string | null
  issn: string | null
  isbn: string | null
  doi: string | null
  url: string | null
  indexing: string | null
  accreditation: string | null
  publicationAuthors: {
    researcher: { id: string; name: string; nidn: string | null }
  }[]
}

interface PaginatedData {
  data: PublicationItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ PUBLICATION TYPE COLORS ============

const pubTypeColorMap: Record<string, string> = {
  journal_national: 'bg-primary/10 text-primary',
  journal_international: 'bg-sky-100 text-sky-800',
  proceeding: 'bg-amber-100 text-amber-800',
  book: 'bg-emerald-100 text-emerald-800',
  book_chapter: 'bg-teal-100 text-teal-800',
  hki: 'bg-purple-100 text-purple-800',
  patent: 'bg-rose-100 text-rose-800',
  popular_article: 'bg-orange-100 text-orange-800',
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
            <BookOpen className="size-3.5 mr-1" />
            Akademik
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Publikasi Ilmiah
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Karya ilmiah dan publikasi dari peneliti LPPM
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
  publicationType: string
  onPublicationTypeChange: (value: string) => void
  year: string
  onYearChange: (value: string) => void
}

function FilterBar({
  search,
  onSearchChange,
  publicationType,
  onPublicationTypeChange,
  year,
  onYearChange,
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul publikasi..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={publicationType} onValueChange={onPublicationTypeChange}>
              <SelectTrigger className="w-full">
                <BookOpen className="size-4 mr-1" />
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis Publikasi</SelectItem>
                {Object.entries(PUBLICATION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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

// ============ PUBLICATION ITEM ============

function PublicationListItem({ item, index }: { item: PublicationItem; index: number }) {
  const typeLabel =
    PUBLICATION_TYPE_LABELS[item.publicationType as keyof typeof PUBLICATION_TYPE_LABELS] ||
    item.publicationType
  const typeColor = pubTypeColorMap[item.publicationType] || 'bg-gray-100 text-gray-700'

  const authorNames =
    item.authors ||
    item.publicationAuthors?.map((pa) => pa.researcher.name).join(', ') ||
    ''

  const doiUrl = item.doi
    ? item.doi.startsWith('http')
      ? item.doi
      : `https://doi.org/${item.doi}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
    >
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
        <CardContent className="p-4 lg:p-5">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <Badge className={`text-[10px] border-0 ${typeColor}`}>
                  {typeLabel}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {item.year}
                </Badge>
                {item.accreditation && (
                  <Badge variant="secondary" className="text-[10px]">
                    {item.accreditation}
                  </Badge>
                )}
                {item.indexing && (
                  <Badge variant="secondary" className="text-[10px]">
                    {item.indexing}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-foreground text-sm lg:text-base line-clamp-2 leading-snug mb-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                {authorNames && (
                  <span className="truncate max-w-[60%]">{authorNames}</span>
                )}
                {item.journalName && (
                  <>
                    {authorNames && <span className="hidden sm:inline">&middot;</span>}
                    <span className="italic truncate">{item.journalName}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {(item.volume || item.number || item.pages) && (
                  <span className="text-[11px] text-muted-foreground">
                    {[item.volume && `Vol. ${item.volume}`, item.number && `No. ${item.number}`, item.pages && `hlm. ${item.pages}`]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
                {doiUrl && (
                  <a
                    href={doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <ExternalLink className="size-3" />
                    DOI
                  </a>
                )}
                {item.url && !doiUrl && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <ExternalLink className="size-3" />
                    Link
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ SKELETON ============

function PublicationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
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
        {' '}dari <span className="font-medium">{total}</span> publikasi
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

export default function PublikasiPage() {
  const [search, setSearch] = useState('')
  const [publicationType, setPublicationType] = useState('all')
  const [year, setYear] = useState('all')
  const [page, setPage] = useState(1)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(DEFAULT_PAGE_SIZE))
    if (search) params.set('search', search)
    if (publicationType !== 'all') params.set('publicationType', publicationType)
    if (year !== 'all') params.set('year', year)
    return params.toString()
  }, [search, publicationType, year, page])

  const { data, isLoading, error } = useQuery({
    queryKey: ['publication', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/publication?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch publications')
      return res.json() as Promise<PaginatedData>
    },
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const handlePublicationTypeChange = (value: string) => {
    setPublicationType(value)
    setPage(1)
  }
  const handleYearChange = (value: string) => {
    setYear(value)
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
            publicationType={publicationType}
            onPublicationTypeChange={handlePublicationTypeChange}
            year={year}
            onYearChange={handleYearChange}
          />

          {isLoading ? (
            <PublicationSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Gagal memuat data publikasi. Silakan coba lagi nanti.
            </div>
          ) : !data || data.data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <BookOpen className="size-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Tidak ada publikasi ditemukan</p>
              <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                {data.data.map((item, index) => (
                  <PublicationListItem key={item.id} item={item} index={index} />
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
