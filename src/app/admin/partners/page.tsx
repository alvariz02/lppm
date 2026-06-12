'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  Handshake, Plus, Pencil, Trash2, Search, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { partnerSchema } from '@/lib/validations'
import {
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_OPTIONS,
  PARTNER_STATUS_LABELS,
  PARTNER_STATUS_OPTIONS,
  PARTNER_STATUS_COLORS,
} from '@/lib/constants'
import { formatDate } from '@/lib/helpers'

// ============ TYPES ============

interface PartnerItem {
  id: string
  name: string
  slug: string
  partnerType: string
  address: string | null
  contactPerson: string | null
  email: string | null
  phone: string | null
  cooperationType: string | null
  startDate: string | null
  endDate: string | null
  status: string
  logoUrl: string | null
  documentUrl: string | null
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type PartnerFormValues = {
  name: string
  partnerType: 'government' | 'industry' | 'ngo' | 'university' | 'community' | 'other'
  address: string | null
  contactPerson: string | null
  email: string | null
  phone: string | null
  cooperationType: string | null
  startDate: string | null
  endDate: string | null
  status: 'active' | 'inactive' | 'expired'
  logoUrl: string | null
  documentUrl: string | null
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

export default function AdminPartnersPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PartnerItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<PartnerItem | null>(null)

  // ============ FORM ============

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      partnerType: 'other',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
      cooperationType: '',
      startDate: '',
      endDate: '',
      status: 'active',
      logoUrl: '',
      documentUrl: '',
    },
  })

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partners', search, page, pageSize, filterType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterType) params.set('partnerType', filterType)
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/partners?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<PartnerItem>>
    },
  })

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: PartnerFormValues) => {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat mitra')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Mitra berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PartnerFormValues }) => {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui mitra')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Mitra berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus mitra')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Mitra berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    form.reset({
      name: '', partnerType: 'other', address: '', contactPerson: '',
      email: '', phone: '', cooperationType: '', startDate: '', endDate: '',
      status: 'active', logoUrl: '', documentUrl: '',
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: PartnerItem) => {
      setEditingItem(item)
      form.reset({
        name: item.name,
        partnerType: item.partnerType as PartnerFormValues['partnerType'],
        address: item.address || '',
        contactPerson: item.contactPerson || '',
        email: item.email || '',
        phone: item.phone || '',
        cooperationType: item.cooperationType || '',
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
        status: item.status as PartnerFormValues['status'],
        logoUrl: item.logoUrl || '',
        documentUrl: item.documentUrl || '',
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
    (values: PartnerFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: PartnerItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) deleteMutation.mutate(deletingItem.id)
  }, [deletingItem, deleteMutation])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const getPeriod = (item: PartnerItem) => {
    const start = item.startDate ? formatDate(item.startDate) : '-'
    const end = item.endDate ? formatDate(item.endDate) : '-'
    if (start === '-' && end === '-') return '-'
    return `${start} — ${end}`
  }

  // ============ RENDER ============

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Handshake className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Kerja Sama</h2>
            <p className="text-sm text-muted-foreground">Kelola data mitra kerja sama</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Mitra
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, kontak, email..."
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
            {PARTNER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(val) => { setFilterStatus(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Status</SelectItem>
            {PARTNER_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
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
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Handshake className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data mitra</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Mitra&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Jenis Kerja Sama</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PARTNER_TYPE_LABELS[p.partnerType as keyof typeof PARTNER_TYPE_LABELS] || p.partnerType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.cooperationType || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={PARTNER_STATUS_COLORS[p.status as keyof typeof PARTNER_STATUS_COLORS] || ''}>
                              {PARTNER_STATUS_LABELS[p.status as keyof typeof PARTNER_STATUS_LABELS] || p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getPeriod(p)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canWrite && (
                              <>
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditForm(p)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(p)}>
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
            <DialogTitle>{editingItem ? 'Edit Mitra' : 'Tambah Mitra'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data mitra kerja sama.' : 'Masukkan data mitra kerja sama baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="partner-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Nama mitra/instansi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="partnerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Mitra <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PARTNER_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cooperationType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kerja Sama</FormLabel>
                      <FormControl><Input placeholder="Jenis kerja sama" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactPerson" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontak Person</FormLabel>
                      <FormControl><Input placeholder="Nama kontak person" {...field} value={field.value || ''} /></FormControl>
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
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PARTNER_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Alamat lengkap" rows={2} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="documentUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dokumen Kerja Sama URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="partner-form" disabled={isSubmitting}>
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
            <AlertDialogTitle>Hapus Mitra</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mitra &ldquo;{deletingItem?.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
