'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { publicationSchema, type PublicationInput } from '@/lib/validations'
import {
  PUBLICATION_TYPE_OPTIONS,
  PUBLICATION_TYPE_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { getStatusColor, formatDate } from '@/lib/helpers'
import type { PaginatedResponse, Publication } from '@/types'

// ============ TYPES ============

interface PublicationRow extends Publication {
  research?: { id: string; title: string } | null
  service?: { id: string; title: string } | null
}

// ============ API HELPERS ============

async function fetchPublications(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/publications?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data publikasi')
  return res.json() as Promise<PaginatedResponse<PublicationRow>>
}

async function fetchResearches() {
  const res = await fetch('/api/research?pageSize=100')
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []) as { id: string; title: string }[]
}

async function fetchCommunityServices() {
  const res = await fetch('/api/community-service?pageSize=100')
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []) as { id: string; title: string }[]
}

async function savePublication(data: PublicationInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/publications/${data.id}` : '/api/admin/publications'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as PublicationInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan publikasi')
  }
  return res.json()
}

async function deletePublication(id: string) {
  const res = await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus publikasi')
  return res.json()
}

// ============ MAIN PAGE ============

export default function PublicationsAdminPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<PublicationRow | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-publications', page, pageSize, search],
    queryFn: () => fetchPublications(page, pageSize, search),
  })

  const { data: researches = [] } = useQuery({
    queryKey: ['researches-select'],
    queryFn: fetchResearches,
    enabled: dialogOpen,
  })

  const { data: communityServices = [] } = useQuery({
    queryKey: ['community-services-select'],
    queryFn: fetchCommunityServices,
    enabled: dialogOpen,
  })

  const saveMutation = useMutation({
    mutationFn: savePublication,
    onSuccess: () => {
      toast.success(editingItem ? 'Publikasi berhasil diperbarui' : 'Publikasi berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      toast.success('Publikasi berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<PublicationInput>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: '',
      publicationType: 'journal_national',
      authors: '',
      publisherName: '',
      journalName: '',
      year: new Date().getFullYear(),
      volume: '',
      number: '',
      pages: '',
      issn: '',
      isbn: '',
      doi: '',
      url: '',
      indexing: '',
      accreditation: '',
      researchId: null,
      serviceId: null,
      isPublished: true,
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({
      title: '',
      publicationType: 'journal_national',
      authors: '',
      publisherName: '',
      journalName: '',
      year: new Date().getFullYear(),
      volume: '',
      number: '',
      pages: '',
      issn: '',
      isbn: '',
      doi: '',
      url: '',
      indexing: '',
      accreditation: '',
      researchId: null,
      serviceId: null,
      isPublished: true,
    })
    setDialogOpen(true)
  }

  function openEditDialog(item: PublicationRow) {
    setEditingItem(item)
    form.reset({
      title: item.title,
      publicationType: item.publicationType as PublicationInput['publicationType'],
      authors: item.authors ?? '',
      publisherName: item.publisherName ?? '',
      journalName: item.journalName ?? '',
      year: item.year,
      volume: item.volume ?? '',
      number: item.number ?? '',
      pages: item.pages ?? '',
      issn: item.issn ?? '',
      isbn: item.isbn ?? '',
      doi: item.doi ?? '',
      url: item.url ?? '',
      indexing: item.indexing ?? '',
      accreditation: item.accreditation ?? '',
      researchId: item.researchId ?? null,
      serviceId: item.serviceId ?? null,
      isPublished: item.isPublished,
    })
    setDialogOpen(true)
  }

  function onSubmit(values: PublicationInput) {
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
          <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Publikasi</h2>
            <p className="text-sm text-muted-foreground">Kelola data publikasi</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="size-4 mr-1" /> Tambah Publikasi
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari publikasi..."
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
                    <TableHead>Tahun</TableHead>
                    <TableHead className="hidden md:table-cell">Penulis</TableHead>
                    <TableHead className="hidden lg:table-cell">Jurnal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Belum ada data publikasi
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[240px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] px-1.5">
                            {PUBLICATION_TYPE_LABELS[item.publicationType as keyof typeof PUBLICATION_TYPE_LABELS] || item.publicationType}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.year}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[160px] truncate">
                          {item.authors || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[160px] truncate">
                          {item.journalName || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${item.isPublished ? getStatusColor('published') : getStatusColor('draft')}`}>
                            {item.isPublished ? 'Dipublikasi' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(item.id)}>
                              <Trash2 className="size-4" />
                            </Button>
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
          <p className="text-sm text-muted-foreground">
            Total {data?.total ?? 0} data
          </p>
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
            <DialogTitle>{editingItem ? 'Edit Publikasi' : 'Tambah Publikasi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Judul *</Label>
                <Input {...form.register('title')} placeholder="Judul publikasi" />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Jenis Publikasi *</Label>
                <Select value={form.watch('publicationType')} onValueChange={(val) => form.setValue('publicationType', val as PublicationInput['publicationType'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PUBLICATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tahun *</Label>
                <Input type="number" {...form.register('year', { valueAsNumber: true })} />
                {form.formState.errors.year && (
                  <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Penulis</Label>
                <Input {...form.register('authors')} placeholder="Nama penulis" />
              </div>

              <div className="space-y-1.5">
                <Label>Penerbit</Label>
                <Input {...form.register('publisherName')} placeholder="Nama penerbit" />
              </div>

              <div className="space-y-1.5">
                <Label>Nama Jurnal</Label>
                <Input {...form.register('journalName')} placeholder="Nama jurnal" />
              </div>

              <div className="space-y-1.5">
                <Label>Volume</Label>
                <Input {...form.register('volume')} placeholder="Volume" />
              </div>

              <div className="space-y-1.5">
                <Label>Nomor</Label>
                <Input {...form.register('number')} placeholder="Nomor" />
              </div>

              <div className="space-y-1.5">
                <Label>Halaman</Label>
                <Input {...form.register('pages')} placeholder="Contoh: 1-15" />
              </div>

              <div className="space-y-1.5">
                <Label>ISSN</Label>
                <Input {...form.register('issn')} placeholder="ISSN" />
              </div>

              <div className="space-y-1.5">
                <Label>ISBN</Label>
                <Input {...form.register('isbn')} placeholder="ISBN" />
              </div>

              <div className="space-y-1.5">
                <Label>DOI</Label>
                <Input {...form.register('doi')} placeholder="DOI" />
              </div>

              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input {...form.register('url')} placeholder="https://..." />
              </div>

              <div className="space-y-1.5">
                <Label>Indexing</Label>
                <Input {...form.register('indexing')} placeholder="Scopus, SINTA, dll" />
              </div>

              <div className="space-y-1.5">
                <Label>Akreditasi</Label>
                <Input {...form.register('accreditation')} placeholder="SINTA 2, Q1, dll" />
              </div>

              <div className="space-y-1.5">
                <Label>Penelitian Terkait</Label>
                <Select value={form.watch('researchId') ?? '_none'} onValueChange={(val) => form.setValue('researchId', val === '_none' ? null : val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih penelitian" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Tidak ada</SelectItem>
                    {researches.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Pengabdian Terkait</Label>
                <Select value={form.watch('serviceId') ?? '_none'} onValueChange={(val) => form.setValue('serviceId', val === '_none' ? null : val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih pengabdian" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Tidak ada</SelectItem>
                    {communityServices.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="isPublished"
                  checked={form.watch('isPublished')}
                  onCheckedChange={(checked) => form.setValue('isPublished', checked === true)}
                />
                <Label htmlFor="isPublished">Dipublikasikan</Label>
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
            <AlertDialogTitle>Hapus Publikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus publikasi ini? Tindakan ini tidak dapat dibatalkan.
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
