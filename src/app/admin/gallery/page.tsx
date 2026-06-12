'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Eye, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { galleryAlbumSchema, galleryPhotoSchema, type GalleryAlbumInput, type GalleryPhotoInput } from '@/lib/validations'
import {
  GALLERY_CATEGORY_OPTIONS,
  GALLERY_CATEGORY_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import type { PaginatedResponse, GalleryAlbum, GalleryPhoto } from '@/types'

// ============ API HELPERS ============

async function fetchAlbums(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/gallery?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data album')
  return res.json() as Promise<PaginatedResponse<GalleryAlbum & { photoCount: number }>>
}

async function fetchAlbumPhotos(albumId: string) {
  const res = await fetch(`/api/admin/gallery/${albumId}/photos`)
  if (!res.ok) throw new Error('Gagal memuat foto')
  return res.json() as Promise<{ data: GalleryPhoto[] }>
}

async function saveAlbum(data: GalleryAlbumInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/gallery/${data.id}` : '/api/admin/gallery'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as GalleryAlbumInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan album')
  }
  return res.json()
}

async function deleteAlbum(id: string) {
  const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus album')
  return res.json()
}

async function addPhoto(albumId: string, data: GalleryPhotoInput) {
  const res = await fetch(`/api/admin/gallery/${albumId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menambah foto')
  }
  return res.json()
}

async function deletePhoto(albumId: string, photoId: string) {
  const res = await fetch(`/api/admin/gallery/${albumId}/photos/${photoId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus foto')
  return res.json()
}

// ============ MAIN PAGE ============

export default function GalleryAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<GalleryAlbum | null>(null)

  // Photo dialog
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery', page, pageSize, search],
    queryFn: () => fetchAlbums(page, pageSize, search),
  })

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ['admin-gallery-photos', selectedAlbum?.id],
    queryFn: () => fetchAlbumPhotos(selectedAlbum!.id),
    enabled: !!selectedAlbum,
  })

  const saveMutation = useMutation({
    mutationFn: saveAlbum,
    onSuccess: () => {
      toast.success(editingItem ? 'Album berhasil diperbarui' : 'Album berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      toast.success('Album berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const addPhotoMutation = useMutation({
    mutationFn: ({ albumId, data }: { albumId: string; data: GalleryPhotoInput }) => addPhoto(albumId, data),
    onSuccess: () => {
      toast.success('Foto berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos', selectedAlbum?.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      photoForm.reset({ imageUrl: '', caption: '' })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deletePhotoMutation = useMutation({
    mutationFn: ({ albumId, photoId }: { albumId: string; photoId: string }) => deletePhoto(albumId, photoId),
    onSuccess: () => {
      toast.success('Foto berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos', selectedAlbum?.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      setDeletePhotoId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<GalleryAlbumInput>({
    resolver: zodResolver(galleryAlbumSchema),
    defaultValues: {
      title: '',
      description: '',
      coverUrl: '',
      category: null,
    },
  })

  const photoForm = useForm<GalleryPhotoInput>({
    resolver: zodResolver(galleryPhotoSchema),
    defaultValues: {
      imageUrl: '',
      caption: '',
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({ title: '', description: '', coverUrl: '', category: null })
    setDialogOpen(true)
  }

  function openEditDialog(item: GalleryAlbum) {
    setEditingItem(item)
    form.reset({
      title: item.title,
      description: item.description ?? '',
      coverUrl: item.coverUrl ?? '',
      category: item.category as GalleryAlbumInput['category'],
    })
    setDialogOpen(true)
  }

  function openPhotoDialog(album: GalleryAlbum) {
    setSelectedAlbum(album)
    photoForm.reset({ imageUrl: '', caption: '' })
    setPhotoDialogOpen(true)
  }

  function onSubmit(values: GalleryAlbumInput) {
    saveMutation.mutate({ ...values, id: editingItem?.id })
  }

  function onAddPhoto(values: GalleryPhotoInput) {
    if (!selectedAlbum) return
    addPhotoMutation.mutate({ albumId: selectedAlbum.id, data: values })
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Galeri</h2>
            <p className="text-sm text-muted-foreground">Kelola album dan foto</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreateDialog} className="shrink-0">
            <Plus className="size-4 mr-1" /> Tambah Album
          </Button>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari album..."
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
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Jumlah Foto</TableHead>
                    <TableHead className="hidden md:table-cell">Cover</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Belum ada data album
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[260px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          {item.category ? (
                            <Badge variant="outline" className="text-[10px]">
                              {GALLERY_CATEGORY_LABELS[item.category as keyof typeof GALLERY_CATEGORY_LABELS] || item.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.photoCount} foto
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="size-10 rounded object-cover" />
                          ) : (
                            <div className="size-10 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Lihat Foto" onClick={() => openPhotoDialog(item)}>
                              <Eye className="size-4" />
                            </Button>
                            {canWrite && (
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
              &lt;
            </Button>
            <span className="text-sm font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              &gt;
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Album Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingItem(null) } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Album' : 'Tambah Album'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Judul Album *</Label>
                <Input {...form.register('title')} placeholder="Judul album" />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea {...form.register('description')} placeholder="Deskripsi album" rows={3} />
              </div>

              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.watch('category') ?? '__none__'}
                  onValueChange={(val) => form.setValue('category', val === '__none__' ? null : val as GalleryAlbumInput['category'])}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Tanpa kategori</SelectItem>
                    {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>URL Cover</Label>
                <Input {...form.register('coverUrl')} placeholder="https://..." />
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

      {/* Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={(open) => { if (!open) { setPhotoDialogOpen(false); setSelectedAlbum(null) } }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Foto Album: {selectedAlbum?.title}</DialogTitle>
          </DialogHeader>

          {/* Add Photo Form */}
          {canWrite && (
          <form onSubmit={photoForm.handleSubmit(onAddPhoto)} className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>URL Gambar *</Label>
                <Input {...photoForm.register('imageUrl')} placeholder="https://..." />
                {photoForm.formState.errors.imageUrl && (
                  <p className="text-xs text-destructive">{photoForm.formState.errors.imageUrl.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Caption</Label>
                <Input {...photoForm.register('caption')} placeholder="Caption foto" />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={addPhotoMutation.isPending}>
              <Plus className="size-4 mr-1" />
              {addPhotoMutation.isPending ? 'Menambah...' : 'Tambah Foto'}
            </Button>
          </form>
          )}

          {/* Photo Grid */}
          {photosLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : photosData?.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada foto dalam album ini
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photosData?.data.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                  <img src={photo.imageUrl} alt={photo.caption ?? ''} className="w-full h-full object-cover" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">
                      {photo.caption}
                    </div>
                  )}
                  {canWrite && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeletePhotoId(photo.id)}
                  >
                    <X className="size-3" />
                  </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Album Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Album</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus album ini? Semua foto di dalamnya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

      {/* Delete Photo Confirmation */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={(open) => { if (!open) setDeletePhotoId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletePhotoId && selectedAlbum && deletePhotoMutation.mutate({ albumId: selectedAlbum.id, photoId: deletePhotoId })}
              disabled={deletePhotoMutation.isPending}
            >
              {deletePhotoMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
