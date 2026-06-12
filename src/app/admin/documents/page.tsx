'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { documentSchema, type DocumentInput } from '@/lib/validations'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { getStatusColor } from '@/lib/helpers'
import type { PaginatedResponse, Document, DocumentCategory } from '@/types'

// ============ TYPES ============

interface DocumentRow extends Document {
  category?: { id: string; name: string } | null
}

// ============ API HELPERS ============

async function fetchDocuments(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/documents?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data dokumen')
  return res.json() as Promise<PaginatedResponse<DocumentRow>>
}

async function fetchDocumentCategories() {
  try {
    const res = await fetch('/api/document/categories')
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as DocumentCategory[]
  } catch {
    return [] as DocumentCategory[]
  }
}

async function saveDocument(data: DocumentInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/documents/${data.id}` : '/api/admin/documents'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as DocumentInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan dokumen')
  }
  return res.json()
}

async function deleteDocument(id: string) {
  const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus dokumen')
  return res.json()
}

// ============ MAIN PAGE ============

export default function DocumentsAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<DocumentRow | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-documents', page, pageSize, search],
    queryFn: () => fetchDocuments(page, pageSize, search),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: fetchDocumentCategories,
    enabled: dialogOpen,
  })

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      toast.success(editingItem ? 'Dokumen berhasil diperbarui' : 'Dokumen berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('Dokumen berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<DocumentInput>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      categoryId: null,
      description: '',
      fileUrl: '',
      fileType: '',
      fileSize: '',
      isActive: true,
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({
      title: '',
      categoryId: null,
      description: '',
      fileUrl: '',
      fileType: '',
      fileSize: '',
      isActive: true,
    })
    setDialogOpen(true)
  }

  function openEditDialog(item: DocumentRow) {
    setEditingItem(item)
    form.reset({
      title: item.title,
      categoryId: item.categoryId ?? null,
      description: item.description ?? '',
      fileUrl: item.fileUrl ?? '',
      fileType: item.fileType ?? '',
      fileSize: item.fileSize ?? '',
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  function onSubmit(values: DocumentInput) {
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
          <div className="size-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Download className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Dokumen Unduhan</h2>
            <p className="text-sm text-muted-foreground">Kelola dokumen untuk diunduh</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreateDialog} className="shrink-0">
            <Plus className="size-4 mr-1" /> Tambah Dokumen
          </Button>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari dokumen..."
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
                    <TableHead className="min-w-[180px]">Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="hidden md:table-cell">Tipe File</TableHead>
                    <TableHead className="hidden md:table-cell">Unduhan</TableHead>
                    <TableHead>Aktif</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data dokumen
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
                            {item.category?.name || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.fileType ? (
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {item.fileType}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell tabular-nums">
                          {item.downloadCount}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${item.isActive ? getStatusColor('active') : getStatusColor('draft')}`}>
                            {item.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
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
            <DialogTitle>{editingItem ? 'Edit Dokumen' : 'Tambah Dokumen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Judul *</Label>
                <Input {...form.register('title')} placeholder="Judul dokumen" />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select value={form.watch('categoryId') ?? '_none'} onValueChange={(val) => form.setValue('categoryId', val === '_none' ? null : val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Tanpa kategori</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Tipe File</Label>
                <Input {...form.register('fileType')} placeholder="PDF, DOCX, dll." />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea {...form.register('description')} placeholder="Deskripsi dokumen" rows={3} />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>URL File</Label>
                <Input {...form.register('fileUrl')} placeholder="https://..." />
              </div>

              <div className="space-y-1.5">
                <Label>Ukuran File</Label>
                <Input {...form.register('fileSize')} placeholder="Contoh: 2.5 MB" />
              </div>

              {editingItem && (
                <div className="space-y-1.5">
                  <Label>Jumlah Unduhan (read-only)</Label>
                  <Input value={editingItem.downloadCount} disabled className="bg-muted" />
                </div>
              )}

              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked === true)}
                />
                <Label htmlFor="isActive">Dokumen Aktif</Label>
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
            <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
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
