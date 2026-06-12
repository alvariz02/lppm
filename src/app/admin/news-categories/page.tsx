'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Tag, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// ============ SCHEMA ============

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

// ============ TYPES ============

interface NewsCategoryItem {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  _count: { news: number }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ ANIMATION ============

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

// ============ MAIN COMPONENT ============

export default function AdminNewsCategoriesPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsCategoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<NewsCategoryItem | null>(null)

  // ============ FORM ============

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '' },
  })

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news-categories', search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      const res = await fetch(`/api/admin/news-categories?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<NewsCategoryItem>>
    },
  })

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const res = await fetch('/api/admin/news-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat kategori berita')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Kategori berita berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-news-categories'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CategoryFormValues }) => {
      const res = await fetch(`/api/admin/news-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui kategori berita')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Kategori berita berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-news-categories'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/news-categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus kategori berita')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Kategori berita berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-news-categories'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    form.reset({ name: '' })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (cat: NewsCategoryItem) => {
      setEditingItem(cat)
      form.reset({ name: cat.name })
      setFormOpen(true)
    },
    [form]
  )

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingItem(null)
    form.reset({ name: '' })
  }, [form])

  const onSubmit = useCallback(
    (values: CategoryFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((cat: NewsCategoryItem) => {
    setDeletingItem(cat)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id)
    }
  }, [deletingItem, deleteMutation])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // ============ RENDER ============

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Kategori Berita</h2>
            <p className="text-sm text-muted-foreground">Kelola kategori berita</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Kategori
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      <motion.div variants={item}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori berita..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data kategori berita</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Kategori&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-center">Jumlah Berita</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{category._count.news}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => openEditForm(category)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:text-destructive"
                                  onClick={() => openDeleteDialog(category)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {data.data.length} dari {data.total} data
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {page} / {data.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Kategori Berita' : 'Tambah Kategori Berita'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Perbarui nama kategori berita. Slug akan otomatis diperbarui.'
                : 'Masukkan nama kategori berita. Slug akan otomatis dibuat.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama kategori" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}
                  {editingItem ? 'Simpan' : 'Tambah'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori Berita</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori &ldquo;{deletingItem?.name}&rdquo;? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
