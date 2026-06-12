'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Newspaper,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Star,
  Calendar,
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
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { formatDate, truncateText } from '@/lib/helpers'

// ============ TYPE DEFINITIONS ============

interface NewsCategory {
  id: string
  name: string
  slug: string
}

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  status: string
  isFeatured: boolean
  publishedAt: string | null
  category: NewsCategory | null
}

interface PaginatedData {
  data: NewsItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ NEWS GRADIENTS ============

const newsGradients = [
  'from-primary/80 via-primary/60 to-secondary/80',
  'from-secondary/80 via-sky-400/60 to-primary/70',
  'from-primary/70 via-primary/50 to-accent/60',
  'from-sky-500/70 via-primary/50 to-primary/80',
  'from-primary/60 via-secondary/60 to-sky-500/70',
]

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
            <Newspaper className="size-3.5 mr-1" />
            Informasi
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Berita LPPM
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Informasi terkini seputar kegiatan dan program LPPM
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============ CATEGORY FILTER ============

function useNewsCategories() {
  return useQuery({
    queryKey: ['news-categories'],
    queryFn: async () => {
      // Reuse news API with different approach - get categories from first page
      const res = await fetch('/api/news?pageSize=1')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return [] as NewsCategory[]
    },
  })
}

// ============ FILTER BAR ============

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  categoryId: string
  onCategoryIdChange: (value: string) => void
}

function FilterBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryIdChange,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari berita..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryId} onValueChange={onCategoryIdChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============ FEATURED NEWS ============

function FeaturedNews({ item }: { item: NewsItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image / Gradient */}
          <div
            className={`h-56 lg:h-auto bg-gradient-to-br ${
              newsGradients[0]
            } relative min-h-[240px]`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="size-20 text-white/20" />
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-accent text-accent-foreground text-xs font-semibold shadow-md">
                <Star className="size-3 mr-0.5" />
                Berita Utama
              </Badge>
            </div>
          </div>
          {/* Content */}
          <CardContent className="p-6 lg:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {item.category && (
                <Badge className="bg-primary/10 text-primary text-[10px] border-0">
                  {item.category.name}
                </Badge>
              )}
              {item.publishedAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(item.publishedAt)}
                </span>
              )}
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-3">
              {item.title}
            </h2>
            {item.excerpt && (
              <p className="text-muted-foreground text-sm lg:text-base line-clamp-4 mb-4 leading-relaxed">
                {item.excerpt}
              </p>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

// ============ NEWS CARD ============

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/berita/${item.slug}`} className="block h-full">
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
            {item.category && (
              <Badge className="absolute top-3 left-3 bg-white/90 text-primary backdrop-blur-sm text-xs font-medium">
                {item.category.name}
              </Badge>
            )}
            {item.isFeatured && (
              <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px]">
                <Star className="size-3 mr-0.5" />
                Utama
              </Badge>
            )}
          </div>
          <CardContent className="p-5 flex flex-col flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2 leading-snug">
              {item.title}
            </h3>
            {item.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                {truncateText(item.excerpt, 120)}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-xs text-muted-foreground">
                {formatDate(item.publishedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

// ============ SKELETON ============

function NewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Featured skeleton */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-56 lg:h-72 rounded-none" />
          <CardContent className="p-6 lg:p-8 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </div>
      </Card>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md">
            <Skeleton className="h-48 w-full rounded-none" />
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
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
        {' '}dari <span className="font-medium">{total}</span> berita
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

export default function BeritaPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [page, setPage] = useState(1)

  // Fetch featured news separately
  const { data: featuredData } = useQuery({
    queryKey: ['news', 'featured-page'],
    queryFn: async () => {
      const res = await fetch('/api/news?featured=true&pageSize=1')
      if (!res.ok) throw new Error('Failed to fetch featured news')
      const json = await res.json()
      return (json.data ?? []) as NewsItem[]
    },
  })

  // Fetch paginated news
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(DEFAULT_PAGE_SIZE))
    if (search) params.set('search', search)
    if (categoryId !== 'all') params.set('categoryId', categoryId)
    return params.toString()
  }, [search, categoryId, page])

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/news?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch news')
      return res.json() as Promise<PaginatedData>
    },
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const handleCategoryIdChange = (value: string) => {
    setCategoryId(value)
    setPage(1)
  }

  const featuredNews = featuredData?.[0] ?? null

  return (
    <div>
      <HeroSection />

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FilterBar
            search={search}
            onSearchChange={handleSearchChange}
            categoryId={categoryId}
            onCategoryIdChange={handleCategoryIdChange}
          />

          {isLoading ? (
            <NewsSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Gagal memuat berita. Silakan coba lagi nanti.
            </div>
          ) : !data || data.data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Newspaper className="size-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Tidak ada berita ditemukan</p>
              <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
            </motion.div>
          ) : (
            <>
              {/* Featured news at top */}
              {featuredNews && page === 1 && !search && categoryId === 'all' && (
                <FeaturedNews item={featuredNews} />
              )}

              {/* News grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data
                  .filter(
                    (item) =>
                      !(page === 1 && !search && categoryId === 'all' && item.id === featuredNews?.id)
                  )
                  .map((item, index) => (
                    <NewsCard key={item.id} item={item} index={index} />
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
