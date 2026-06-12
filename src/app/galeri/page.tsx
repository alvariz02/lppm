'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ImageIcon,
  AlertCircle,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_OPTIONS,
} from '@/lib/constants'
import { formatDate } from '@/lib/helpers'
import type { GalleryAlbumWithRelations, GalleryPhoto } from '@/types'

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ============ DATA FETCHING ============

function useGallery(category: string | null) {
  return useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const res = await fetch(`/api/gallery?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch gallery')
      const json = await res.json()
      return (json.data ?? []) as GalleryAlbumWithRelations[]
    },
  })
}

// ============ SKELETON ============

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-md overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PAGE COMPONENT ============

export default function GaleriPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbumWithRelations | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const { data, isLoading, error } = useGallery(
    selectedCategory === 'all' ? null : selectedCategory
  )

  const categoryColorMap: Record<string, string> = {
    research: 'bg-primary/10 text-primary',
    community_service: 'bg-sky-100 text-sky-700',
    seminar: 'bg-amber-100 text-amber-700',
    workshop: 'bg-emerald-100 text-emerald-700',
  }

  const albumGradients = [
    'from-primary/80 via-primary/60 to-secondary/80',
    'from-secondary/80 via-sky-400/60 to-primary/70',
    'from-primary/70 via-primary/50 to-accent/60',
    'from-accent/70 via-amber-400/60 to-primary/70',
  ]

  const handleOpenAlbum = (album: GalleryAlbumWithRelations) => {
    setSelectedAlbum(album)
    setCurrentPhotoIndex(0)
  }

  const handleCloseAlbum = () => {
    setSelectedAlbum(null)
    setCurrentPhotoIndex(0)
  }

  const handlePrevPhoto = () => {
    if (!selectedAlbum) return
    setCurrentPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : (selectedAlbum.photos?.length ?? 1) - 1
    )
  }

  const handleNextPhoto = () => {
    if (!selectedAlbum) return
    setCurrentPhotoIndex((prev) =>
      prev < (selectedAlbum.photos?.length ?? 1) - 1 ? prev + 1 : 0
    )
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary min-h-[260px] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 size-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute top-1/2 -left-32 size-80 rounded-full bg-accent/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 text-sm px-4 py-1.5 font-medium backdrop-blur-sm">
                <ImageIcon className="size-3.5 mr-1" />
                Dokumentasi
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Galeri Kegiatan
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Dokumentasi kegiatan dan acara LPPM dalam gambar
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span className="font-medium">Kategori:</span>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data && (
              <span className="text-sm text-muted-foreground ml-auto">
                {data.length} album
              </span>
            )}
          </motion.div>

          {isLoading ? (
            <GallerySkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat galeri</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Album
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedCategory !== 'all'
                  ? 'Tidak ada album dalam kategori yang dipilih.'
                  : 'Saat ini belum ada album galeri yang tersedia.'}
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {data.map((album, index) => (
                <motion.div key={album.id} variants={staggerItem}>
                  <Card
                    className="border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden cursor-pointer group"
                    onClick={() => handleOpenAlbum(album)}
                  >
                    {/* Cover image */}
                    <div
                      className={`h-48 bg-gradient-to-br ${
                        albumGradients[index % albumGradients.length]
                      } relative overflow-hidden`}
                    >
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="size-16 text-white/30" />
                        </div>
                      )}
                      {/* Photo count overlay */}
                      {album.photos && album.photos.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                          {album.photos.length} foto
                        </div>
                      )}
                      {album.category && (
                        <Badge
                          className={`absolute top-3 left-3 text-[10px] border-0 ${
                            categoryColorMap[album.category] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {GALLERY_CATEGORY_LABELS[album.category as keyof typeof GALLERY_CATEGORY_LABELS] || album.category}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug line-clamp-2">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {album.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {formatDate(album.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Photo Dialog */}
      <Dialog open={!!selectedAlbum} onOpenChange={(open) => !open && handleCloseAlbum()}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black/95 border-white/10">
          <DialogTitle className="sr-only">
            {selectedAlbum?.title ?? 'Galeri Foto'}
          </DialogTitle>
          {selectedAlbum && (
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="font-semibold text-white text-sm lg:text-base">
                    {selectedAlbum.title}
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    {currentPhotoIndex + 1} / {selectedAlbum.photos?.length ?? 0}
                    {selectedAlbum.photos?.[currentPhotoIndex]?.caption && (
                      <span className="ml-2">
                        — {selectedAlbum.photos[currentPhotoIndex].caption}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Photo display */}
              <div className="relative flex items-center justify-center min-h-[300px] max-h-[70vh] bg-black">
                {selectedAlbum.photos && selectedAlbum.photos.length > 0 ? (
                  <>
                    {selectedAlbum.photos[currentPhotoIndex]?.imageUrl ? (
                      <img
                        src={selectedAlbum.photos[currentPhotoIndex].imageUrl}
                        alt={selectedAlbum.photos[currentPhotoIndex].caption || `Foto ${currentPhotoIndex + 1}`}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <ImageIcon className="size-20 text-white/20" />
                      </div>
                    )}

                    {/* Navigation arrows */}
                    {selectedAlbum.photos.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full size-10"
                          onClick={handlePrevPhoto}
                        >
                          <ChevronLeft className="size-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full size-10"
                          onClick={handleNextPhoto}
                        >
                          <ChevronRight className="size-6" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <ImageIcon className="size-20 mb-2" />
                    <p className="text-sm">Belum ada foto dalam album ini</p>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {selectedAlbum.photos && selectedAlbum.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto border-t border-white/10">
                  {selectedAlbum.photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`shrink-0 size-14 rounded-md overflow-hidden border-2 transition-all ${
                        idx === currentPhotoIndex
                          ? 'border-white/80 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      {photo.imageUrl ? (
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || `Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <ImageIcon className="size-4 text-white/40" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
