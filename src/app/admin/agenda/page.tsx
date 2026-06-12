'use client'

import { useAdminPage } from '@/hooks/useAdminPage'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  CalendarDays, Plus, Pencil, Trash2, Search, Loader2,
  Eye } from 'lucide-react'
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
import { agendaSchema } from '@/lib/validations'
import {
  AGENDA_EVENT_TYPE_LABELS,
  AGENDA_EVENT_TYPE_OPTIONS,
  AGENDA_STATUS_LABELS,
  AGENDA_STATUS_OPTIONS,
  AGENDA_STATUS_COLORS,
} from '@/lib/constants'
import { formatDateTime, formatDate } from '@/lib/helpers'

// ============ TYPES ============

interface AgendaItem {
  id: string
  title: string
  slug: string
  description: string | null
  eventType: string | null
  startDate: string
  endDate: string | null
  location: string | null
  organizer: string | null
  posterUrl: string | null
  status: string
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

type AgendaFormValues = {
  title: string
  description: string | null
  eventType: string | null
  startDate: string
  endDate: string | null
  location: string | null
  organizer: string | null
  posterUrl: string | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
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

export default function AdminAgendaPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterEventType, setFilterEventType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<AgendaItem | null>(null)

  // ============ FORM ============

  const form = useForm<AgendaFormValues>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: null,
      startDate: '',
      endDate: '',
      location: '',
      organizer: '',
      posterUrl: '',
      status: 'upcoming',
    },
  })

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-agenda', search, page, pageSize, filterEventType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterEventType) params.set('eventType', filterEventType)
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/agenda?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<AgendaItem>>
    },
  })

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: AgendaFormValues) => {
      const res = await fetch('/api/admin/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat agenda')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Agenda berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-agenda'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: AgendaFormValues }) => {
      const res = await fetch(`/api/admin/agenda/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui agenda')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Agenda berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-agenda'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/agenda/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus agenda')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Agenda berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-agenda'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    form.reset({
      title: '', description: '', eventType: null, startDate: '',
      endDate: '', location: '', organizer: '', posterUrl: '', status: 'upcoming',
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: AgendaItem) => {
      setEditingItem(item)
      form.reset({
        title: item.title,
        description: item.description || '',
        eventType: item.eventType || null,
        startDate: new Date(item.startDate).toISOString().slice(0, 16),
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : '',
        location: item.location || '',
        organizer: item.organizer || '',
        posterUrl: item.posterUrl || '',
        status: item.status as AgendaFormValues['status'],
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
    (values: AgendaFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: AgendaItem) => {
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
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">Kelola agenda kegiatan LPPM</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Agenda
          </Button>
        )}
      </motion.div>

      {isViewOnly && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <Eye className="size-4 shrink-0" />
              <span>Anda memiliki akses lihat saja untuk halaman ini</span>
            </div>
          )}
      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul, lokasi, penyelenggara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterEventType}
          onValueChange={(val) => { setFilterEventType(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Tipe</SelectItem>
            {AGENDA_EVENT_TYPE_OPTIONS.map((opt) => (
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
            {AGENDA_STATUS_OPTIONS.map((opt) => (
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
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data agenda</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Agenda&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Tanggal Mulai</TableHead>
                        <TableHead>Tanggal Selesai</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                          <TableCell>
                            {a.eventType ? (
                              <Badge variant="outline">
                                {AGENDA_EVENT_TYPE_LABELS[a.eventType as keyof typeof AGENDA_EVENT_TYPE_LABELS] || a.eventType}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(a.startDate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.endDate ? formatDateTime(a.endDate) : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[150px] truncate">
                            {a.location || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={AGENDA_STATUS_COLORS[a.status as keyof typeof AGENDA_STATUS_COLORS] || ''}>
                              {AGENDA_STATUS_LABELS[a.status as keyof typeof AGENDA_STATUS_LABELS] || a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canWrite && (
                              <>
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditForm(a)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(a)}>
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
            <DialogTitle>{editingItem ? 'Edit Agenda' : 'Tambah Agenda'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data agenda.' : 'Masukkan data agenda baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="agenda-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Judul <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Judul agenda" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="eventType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Kegiatan</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val === '__none__' ? null : val)}
                        value={field.value || '__none__'}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Tidak ada</SelectItem>
                          {AGENDA_EVENT_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {AGENDA_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi</FormLabel>
                      <FormControl><Input placeholder="Lokasi kegiatan" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="organizer" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penyelenggara</FormLabel>
                      <FormControl><Input placeholder="Penyelenggara" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="posterUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poster URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi agenda..."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="agenda-form" disabled={isSubmitting}>
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
            <AlertDialogTitle>Hapus Agenda</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus agenda &ldquo;{deletingItem?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
