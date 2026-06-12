'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { announcementSchema, type AnnouncementInput } from '@/lib/validations'
import {
  ANNOUNCEMENT_TYPE_OPTIONS,
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_STATUS_OPTIONS,
  ANNOUNCEMENT_STATUS_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { getStatusColor, formatDate } from '@/lib/helpers'
import type { PaginatedResponse, Announcement } from '@/types'

// ============ API HELPERS ============

async function fetchAnnouncements(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/announcements?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data pengumuman')
  return res.json() as Promise<PaginatedResponse<Announcement>>
}

async function saveAnnouncement(data: AnnouncementInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/announcements/${data.id}` : '/api/admin/announcements'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as AnnouncementInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan pengumuman')
  }
  return res.json()
}

async function deleteAnnouncement(id: string) {
  const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus pengumuman')
  return res.json()
}

// ============ MAIN PAGE ============

export default function AnnouncementsAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements', page, pageSize, search],
    queryFn: () => fetchAnnouncements(page, pageSize, search),
  })

  const saveMutation = useMutation({
    mutationFn: saveAnnouncement,
    onSuccess: () => {
      toast.success(editingItem ? 'Pengumuman berhasil diperbarui' : 'Pengumuman berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success('Pengumuman berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      attachmentUrl: '',
      type: 'normal',
      status: 'draft',
      publishedAt: '',
      expiredAt: '',
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({
      title: '',
      content: '',
      attachmentUrl: '',
      type: 'normal',
      status: 'draft',
      publishedAt: '',
      expiredAt: '',
    })
    setDialogOpen(true)
  }

  function openEditDialog(item: Announcement) {
    setEditingItem(item)
    form.reset({
      title: item.title,
      content: item.content ?? '',
      attachmentUrl: item.attachmentUrl ?? '',
      type: item.type as AnnouncementInput['type'],
      status: item.status as AnnouncementInput['status'],
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '',
      expiredAt: item.expiredAt ? new Date(item.expiredAt).toISOString().split('T')[0] : '',
    })
    setDialogOpen(true)
  }

  function onSubmit(values: AnnouncementInput) {
    saveMutation.mutate({ ...values, id: editingItem?.id })
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Bell className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pengumuman</h2>
            <p className="text-sm text-muted-foreground">Kelola pengumuman</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreateDialog} className="shrink-0">
            <Plus className="size-4 mr-1" /> Tambah Pengumuman
          </Button>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari pengumuman..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Judul</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal Publikasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Belum ada data pengumuman
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[260px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${item.type === 'important' ? 'border-red-300 text-red-700' : ''}`}>
                            {ANNOUNCEMENT_TYPE_LABELS[item.type as keyof typeof ANNOUNCEMENT_TYPE_LABELS] || item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${getStatusColor(item.status)}`}>
                            {ANNOUNCEMENT_STATUS_LABELS[item.status as keyof typeof ANNOUNCEMENT_STATUS_LABELS] || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.publishedAt ? formatDate(item.publishedAt) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isViewOnly && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                  <Pencil className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(item.id)}>
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total {data?.total ?? 0} data</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingItem(null) } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Judul *</Label>
                <Input {...form.register('title')} placeholder="Judul pengumuman" />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Konten</Label>
                <Textarea {...form.register('content')} placeholder="Isi pengumuman" rows={5} />
              </div>

              <div className="space-y-1.5">
                <Label>Jenis *</Label>
                <Select value={form.watch('type')} onValueChange={(val) => form.setValue('type', val as AnnouncementInput['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANNOUNCEMENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={form.watch('status')} onValueChange={(val) => form.setValue('status', val as AnnouncementInput['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANNOUNCEMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>URL Lampiran</Label>
                <Input {...form.register('attachmentUrl')} placeholder="https://..." />
              </div>

              <div className="space-y-1.5">
                <Label>Tanggal Publikasi</Label>
                <Input type="date" {...form.register('publishedAt')} />
              </div>

              <div className="space-y-1.5">
                <Label>Tanggal Kadaluarsa</Label>
                <Input type="date" {...form.register('expiredAt')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingItem(null) }}>
                Batal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Menyimpan...' : editingItem ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
