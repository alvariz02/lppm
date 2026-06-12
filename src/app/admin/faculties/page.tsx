'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { GraduationCap, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const facultyFormSchema = z.object({
  name: z.string().min(1, 'Nama fakultas wajib diisi'),
})

type FacultyFormValues = z.infer<typeof facultyFormSchema>

// ============ TYPES ============

interface FacultyItem {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  _count: { studyPrograms: number }
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

export default function AdminFacultiesPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FacultyItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<FacultyItem | null>(null)

  // ============ FORM ============

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: { name: '' },
  })

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-faculties', search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      const res = await fetch(`/api/admin/faculties?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<FacultyItem>>
    },
  })

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: FacultyFormValues) => {
      const res = await fetch('/api/admin/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat fakultas')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Fakultas berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-faculties'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FacultyFormValues }) => {
      const res = await fetch(`/api/admin/faculties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui fakultas')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Fakultas berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-faculties'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/faculties/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus fakultas')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Fakultas berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-faculties'] })
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
    (item: FacultyItem) => {
      setEditingItem(item)
      form.reset({ name: item.name })
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
    (values: FacultyFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: FacultyItem) => {
    setDeletingItem(item)
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
            <GraduationCap className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Fakultas</h2>
            <p className="text-sm text-muted-foreground">Kelola data fakultas</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Fakultas
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      <motion.div variants={item}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari fakultas..."
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
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data fakultas</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Fakultas&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-center">Program Studi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((faculty) => (
                      <TableRow key={faculty.id}>
                        <TableCell className="font-medium">{faculty.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {faculty.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{faculty._count.studyPrograms}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => openEditForm(faculty)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:text-destructive"
                                  onClick={() => openDeleteDialog(faculty)}
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
            <DialogTitle>{editingItem ? 'Edit Fakultas' : 'Tambah Fakultas'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Perbarui nama fakultas. Slug akan otomatis diperbarui.'
                : 'Masukkan nama fakultas. Slug akan otomatis dibuat.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Fakultas</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama fakultas" {...field} />
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
            <AlertDialogTitle>Hapus Fakultas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus fakultas &ldquo;{deletingItem?.name}&rdquo;? Tindakan
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
