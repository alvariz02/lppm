'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  FileIcon,
  FileSpreadsheet,
  FileImage,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, truncateText } from '@/lib/helpers'
import { toast } from 'sonner'
import type { DocumentWithRelations } from '@/types'

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

// ============ FILE TYPE HELPERS ============

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileIcon
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return FileText
  if (type.includes('sheet') || type.includes('excel') || type.includes('xls') || type.includes('csv'))
    return FileSpreadsheet
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg'))
    return FileImage
  if (type.includes('word') || type.includes('doc')) return FileText
  return FileIcon
}

function getFileTypeColor(fileType: string | null): string {
  if (!fileType) return 'bg-gray-100 text-gray-600'
  const type = fileType.toLowerCase()
  if (type.includes('pdf')) return 'bg-red-100 text-red-600'
  if (type.includes('sheet') || type.includes('excel') || type.includes('xls'))
    return 'bg-emerald-100 text-emerald-600'
  if (type.includes('word') || type.includes('doc'))
    return 'bg-sky-100 text-sky-600'
  if (type.includes('image') || type.includes('png') || type.includes('jpg'))
    return 'bg-purple-100 text-purple-600'
  return 'bg-gray-100 text-gray-600'
}

// ============ DATA FETCHING ============

interface DocumentCategory {
  id: string
  name: string
  slug: string
}

function useDocuments(categoryId: string | null) {
  return useQuery({
    queryKey: ['documents', categoryId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoryId) params.set('categoryId', categoryId)
      const res = await fetch(`/api/document?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch documents')
      const json = await res.json()
      return json.data as DocumentWithRelations[]
    },
  })
}

function useDocumentCategories() {
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      // Fetch all documents and extract unique categories
      const res = await fetch('/api/document')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      const docs = json.data as DocumentWithRelations[]
      const categoryMap = new Map<string, DocumentCategory>()
      docs.forEach((doc: DocumentWithRelations) => {
        if (doc.category && !categoryMap.has(doc.category.id)) {
          categoryMap.set(doc.category.id, doc.category)
        }
      })
      return Array.from(categoryMap.values())
    },
  })
}

// ============ SKELETON ============

function DocumentSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Unduhan</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="size-9 rounded-lg" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============ PAGE COMPONENT ============

export default function DokumenPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: categories } = useDocumentCategories()
  const { data: documents, isLoading, error } = useDocuments(
    selectedCategory === 'all' ? null : selectedCategory
  )

  const handleDownload = async (doc: DocumentWithRelations) => {
    if (doc.fileUrl) {
      // Open the file URL in a new tab
      window.open(doc.fileUrl, '_blank')
      // Increment download count via API
      try {
        await fetch('/api/document', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: doc.id }),
        })
      } catch {
        // Silently fail - download still worked
      }
      toast.success(`Mengunduh "${truncateText(doc.title, 40)}"`)
    } else {
      toast.error('File tidak tersedia untuk diunduh')
    }
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
                <Download className="size-3.5 mr-1" />
                Unduhan
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Dokumen Unduhan
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-3 text-lg text-white/80 max-w-2xl"
            >
              Akses dokumen, panduan, dan formulir resmi LPPM
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {isLoading ? (
            <DocumentSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="size-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive font-medium">Gagal memuat dokumen</p>
              <p className="text-sm text-muted-foreground mt-1">
                Silakan coba lagi nanti
              </p>
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="size-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Dokumen
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Saat ini belum ada dokumen yang tersedia untuk diunduh.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Dokumen</TableHead>
                        <TableHead className="hidden md:table-cell">Kategori</TableHead>
                        <TableHead className="hidden sm:table-cell text-right">Unduhan</TableHead>
                        <TableHead className="w-24 text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => {
                        const FileIconComponent = getFileIcon(doc.fileType)
                        return (
                          <TableRow key={doc.id} className="group">
                            <TableCell>
                              <div
                                className={`size-9 rounded-lg flex items-center justify-center ${getFileTypeColor(doc.fileType)}`}
                              >
                                <FileIconComponent className="size-4" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <h4 className="font-medium text-foreground text-sm leading-snug">
                                  {doc.title}
                                </h4>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {truncateText(doc.description, 80)}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 sm:hidden">
                                  {doc.category && (
                                    <Badge variant="outline" className="text-[10px] py-0">
                                      {doc.category.name}
                                    </Badge>
                                  )}
                                  {doc.fileType && (
                                    <span className="text-[10px] text-muted-foreground uppercase">
                                      {doc.fileType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {doc.category ? (
                                <Badge variant="outline" className="text-xs">
                                  {doc.category.name}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-right">
                              <span className="text-sm text-muted-foreground tabular-nums">
                                {doc.downloadCount}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                disabled={!doc.fileUrl}
                              >
                                <Download className="size-4 mr-1" />
                                <span className="hidden sm:inline">Unduh</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
