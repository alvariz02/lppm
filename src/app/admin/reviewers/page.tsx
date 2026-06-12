'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  UserCheck, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { reviewerSchema } from '@/lib/validations'
import { REVIEWER_TYPE_LABELS, REVIEWER_TYPE_OPTIONS } from '@/lib/constants'
import { getStatusColor } from '@/lib/helpers'

// ============ TYPES ============

interface ReviewerItem {
  id: string
  researcherId: string | null
  name: string
  nidn: string | null
  nip: string | null
  email: string | null
  phone: string | null
  institution: string | null
  expertise: string | null
  reviewerType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { proposalReviews: number }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type ReviewerFormValues = {
  researcherId: string | null
  name: string
  nidn: string | null
  nip: string | null
  email: string | null
  phone: string | null
  institution: string | null
  expertise: string | null
  reviewerType: 'internal' | 'external'
  isActive: boolean
}

// ============ ANIMATION ============

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const animItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

// ============ MAIN COMPONENT ============

export default function AdminReviewersPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterType, setFilterType] = useState('')
  const [filterIsActive, setFilterIsActive] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ReviewerItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ReviewerItem | null>(null)

  // ============ FORM ============

  const form = useForm<ReviewerFormValues>({
    resolver: zodResolver(reviewerSchema),
    defaultValues: {
      researcherId: null,
      name: '',
      nidn: '',
      nip: '',
      email: '',
      phone: '',
      institution: '',
      expertise: '',
      reviewerType: 'internal',
      isActive: true,
    },
  })

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviewers', search, page, pageSize, filterType, filterIsActive],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterType) params.set('reviewerType', filterType)
      if (filterIsActive) params.set('isActive', filterIsActive)
      const res = await fetch(`/api/admin/reviewers?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<ReviewerItem>>
    },
  })

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: ReviewerFormValues) => {
      const res = await fetch('/api/admin/reviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat reviewer')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Reviewer berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-reviewers'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ReviewerFormValues }) => {
      const res = await fetch(`/api/admin/reviewers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui reviewer')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Reviewer berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-reviewers'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviewers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus reviewer')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Reviewer berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-reviewers'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    form.reset({
      researcherId: null, name: '', nidn: '', nip: '', email: '',
      phone: '', institution: '', expertise: '', reviewerType: 'internal', isActive: true,
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: ReviewerItem) => {
      setEditingItem(item)
      form.reset({
        researcherId: item.researcherId || null,
        name: item.name,
        nidn: item.nidn || '',
        nip: item.nip || '',
        email: item.email || '',
        phone: item.phone || '',
        institution: item.institution || '',
        expertise: item.expertise || '',
        reviewerType: item.reviewerType as 'internal' | 'external',
        isActive: item.isActive,
      })
      setFormOpen(true)
    },
    [form]
  )

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingItem(null)
  }, [])

  const onSubmit = useCallback(
    (values: ReviewerFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: ReviewerItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) deleteMutation.mutate(deletingItem.id)
  }, [deletingItem, deleteMutation])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // ============ RENDER ============

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCheck className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Reviewer</h2>
            <p className="text-sm text-muted-foreground">Kelola data reviewer proposal</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Reviewer
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIDN, institusi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(val) => { setFilterType(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Tipe</SelectItem>
            {REVIEWER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterIsActive}
          onValueChange={(val) => { setFilterIsActive(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Status</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div variants={animItem}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data reviewer</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Reviewer&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIDN</TableHead>
                        <TableHead>Institusi</TableHead>
                        <TableHead>Keahlian</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-muted-foreground">{r.nidn || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{r.institution || '-'}</TableCell>
                          <TableCell className="max-w-[150px] truncate text-muted-foreground">
                            {r.expertise || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                r.reviewerType === 'internal'
                                  ? 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950'
                                  : 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950'
                              }
                            >
                              {REVIEWER_TYPE_LABELS[r.reviewerType as keyof typeof REVIEWER_TYPE_LABELS] || r.reviewerType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(r.isActive ? 'active' : 'inactive')}>
                              {r.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canWrite && (
                              <>
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditForm(r)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(r)}>
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
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {data.data.length} dari {data.total} data
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {data.totalPages || 1}</span>
                    <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Reviewer' : 'Tambah Reviewer'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data reviewer.' : 'Masukkan data reviewer baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="reviewer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Nama lengkap" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nidn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIDN</FormLabel>
                      <FormControl><Input placeholder="NIDN" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nip" render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP</FormLabel>
                      <FormControl><Input placeholder="NIP" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="email@domain.com" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telepon</FormLabel>
                      <FormControl><Input placeholder="No. telepon" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="institution" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institusi</FormLabel>
                      <FormControl><Input placeholder="Nama institusi" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="expertise" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keahlian</FormLabel>
                      <FormControl><Input placeholder="Bidang keahlian" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="reviewerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Reviewer <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {REVIEWER_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status Aktif</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="reviewer-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}
              {editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Reviewer</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus reviewer &ldquo;{deletingItem?.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="size-4 mr-1 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
