'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Banknote, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { fundingSchemeSchema, type FundingSchemeInput } from '@/lib/validations'
import {
  FUNDING_SCHEME_STATUS_OPTIONS,
  FUNDING_SCHEME_STATUS_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { getStatusColor, formatDate, formatCurrency } from '@/lib/helpers'
import type { PaginatedResponse, FundingScheme } from '@/types'

// ============ API HELPERS ============

async function fetchFundingSchemes(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/funding?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data hibah')
  return res.json() as Promise<PaginatedResponse<FundingScheme>>
}

async function saveFundingScheme(data: FundingSchemeInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/funding/${data.id}` : '/api/admin/funding'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as FundingSchemeInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan hibah')
  }
  return res.json()
}

async function deleteFundingScheme(id: string) {
  const res = await fetch(`/api/admin/funding/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus hibah')
  return res.json()
}

// ============ MAIN PAGE ============

export default function FundingAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<FundingScheme | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-funding', page, pageSize, search],
    queryFn: () => fetchFundingSchemes(page, pageSize, search),
  })

  const saveMutation = useMutation({
    mutationFn: saveFundingScheme,
    onSuccess: () => {
      toast.success(editingItem ? 'Hibah berhasil diperbarui' : 'Hibah berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-funding'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFundingScheme,
    onSuccess: () => {
      toast.success('Hibah berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-funding'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<FundingSchemeInput>({
    resolver: zodResolver(fundingSchemeSchema),
    defaultValues: {
      name: '',
      source: '',
      year: new Date().getFullYear(),
      description: '',
      requirements: '',
      minBudget: null,
      maxBudget: null,
      openDate: '',
      deadline: '',
      status: 'draft',
      guideFileUrl: '',
      registrationUrl: '',
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({
      name: '',
      source: '',
      year: new Date().getFullYear(),
      description: '',
      requirements: '',
      minBudget: null,
      maxBudget: null,
      openDate: '',
      deadline: '',
      status: 'draft',
      guideFileUrl: '',
      registrationUrl: '',
    })
    setDialogOpen(true)
  }

  function openEditDialog(item: FundingScheme) {
    setEditingItem(item)
    form.reset({
      name: item.name,
      source: item.source ?? '',
      year: item.year,
      description: item.description ?? '',
      requirements: item.requirements ?? '',
      minBudget: item.minBudget,
      maxBudget: item.maxBudget,
      openDate: item.openDate ? new Date(item.openDate).toISOString().split('T')[0] : '',
      deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
      status: item.status as FundingSchemeInput['status'],
      guideFileUrl: item.guideFileUrl ?? '',
      registrationUrl: item.registrationUrl ?? '',
    })
    setDialogOpen(true)
  }

  function onSubmit(values: FundingSchemeInput) {
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
          <div className="size-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Banknote className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Hibah / Pendanaan</h2>
            <p className="text-sm text-muted-foreground">Kelola skema pendanaan</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreateDialog} className="shrink-0">
            <Plus className="size-4 mr-1" /> Tambah Hibah
          </Button>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari hibah..."
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
                    <TableHead className="min-w-[180px]">Nama</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead className="hidden md:table-cell">Anggaran</TableHead>
                    <TableHead className="hidden lg:table-cell">Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Belum ada data hibah
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.source || '-'}</TableCell>
                        <TableCell>{item.year}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.minBudget != null && item.maxBudget != null
                            ? `${formatCurrency(item.minBudget)} - ${formatCurrency(item.maxBudget)}`
                            : '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.deadline ? formatDate(item.deadline) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${getStatusColor(item.status)}`}>
                            {FUNDING_SCHEME_STATUS_LABELS[item.status as keyof typeof FUNDING_SCHEME_STATUS_LABELS] || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
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
            <DialogTitle>{editingItem ? 'Edit Hibah' : 'Tambah Hibah'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Nama Skema *</Label>
                <Input {...form.register('name')} placeholder="Nama skema pendanaan" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Sumber</Label>
                <Input {...form.register('source')} placeholder="Sumber pendanaan" />
              </div>

              <div className="space-y-1.5">
                <Label>Tahun *</Label>
                <Input type="number" {...form.register('year', { valueAsNumber: true })} />
                {form.formState.errors.year && (
                  <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea {...form.register('description')} placeholder="Deskripsi skema" rows={3} />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Persyaratan</Label>
                <Textarea {...form.register('requirements')} placeholder="Persyaratan pengajuan" rows={3} />
              </div>

              <div className="space-y-1.5">
                <Label>Anggaran Minimal</Label>
                <Input
                  type="number"
                  {...form.register('minBudget', { setValueAs: (v: string) => v === '' ? null : parseFloat(v) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Anggaran Maksimal</Label>
                <Input
                  type="number"
                  {...form.register('maxBudget', { setValueAs: (v: string) => v === '' ? null : parseFloat(v) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tanggal Buka</Label>
                <Input type="date" {...form.register('openDate')} />
              </div>

              <div className="space-y-1.5">
                <Label>Tanggal Tutup (Deadline)</Label>
                <Input type="date" {...form.register('deadline')} />
                {form.formState.errors.deadline && (
                  <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={form.watch('status')} onValueChange={(val) => form.setValue('status', val as FundingSchemeInput['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUNDING_SCHEME_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>URL Panduan</Label>
                <Input {...form.register('guideFileUrl')} placeholder="URL file panduan" />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>URL Pendaftaran</Label>
                <Input {...form.register('registrationUrl')} placeholder="https://..." />
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
            <AlertDialogTitle>Hapus Hibah</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus skema hibah ini? Tindakan ini tidak dapat dibatalkan.
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
