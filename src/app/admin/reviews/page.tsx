'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { z } from 'zod'
import {
  ClipboardCheck, Plus, Pencil, Trash2, Search, Loader2
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
import {
  PROPOSAL_TYPE_LABELS,
  PROPOSAL_TYPE_OPTIONS,
  PROPOSAL_REVIEW_STATUS_LABELS,
  PROPOSAL_REVIEW_STATUS_OPTIONS,
  PROPOSAL_REVIEW_STATUS_COLORS,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/helpers'

// ============ TYPES ============

interface ProposalOption { id: string; title: string }
interface ReviewerOption { id: string; name: string }

interface ReviewItem {
  id: string
  proposalType: string
  researchId: string | null
  serviceId: string | null
  reviewerId: string
  score: number | null
  notes: string | null
  status: string
  reviewFileUrl: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  research: { id: string; title: string } | null
  service: { id: string; title: string } | null
  reviewer: { id: string; name: string }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ SCHEMA ============

const reviewFormSchema = z.object({
  proposalType: z.enum(['research', 'community_service']),
  researchId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  reviewerId: z.string().min(1, 'Reviewer wajib dipilih'),
  score: z.coerce.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['waiting', 'reviewing', 'revision', 'accepted', 'rejected']),
  reviewFileUrl: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

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

export default function AdminReviewsPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProposalType, setFilterProposalType] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ReviewItem | null>(null)

  // ============ FORM ============

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      proposalType: 'research',
      researchId: null,
      serviceId: null,
      reviewerId: '',
      score: null,
      notes: '',
      status: 'waiting',
      reviewFileUrl: '',
      reviewedAt: null,
    },
  })

  const watchProposalType = form.watch('proposalType')

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', search, page, pageSize, filterStatus, filterProposalType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterStatus) params.set('status', filterStatus)
      if (filterProposalType) params.set('proposalType', filterProposalType)
      const res = await fetch(`/api/admin/reviews?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<ReviewItem>>
    },
  })

  const { data: researchesData } = useQuery({
    queryKey: ['admin-researches-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/researches?pageSize=100')
      if (!res.ok) throw new Error('Gagal memuat penelitian')
      return res.json() as Promise<PaginatedResponse<ProposalOption>>
    },
  })

  const { data: servicesData } = useQuery({
    queryKey: ['admin-services-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/community-services?pageSize=100')
      if (!res.ok) throw new Error('Gagal memuat pengabdian')
      return res.json() as Promise<PaginatedResponse<ProposalOption>>
    },
  })

  const { data: reviewersData } = useQuery({
    queryKey: ['admin-reviewers-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviewers?pageSize=100')
      if (!res.ok) throw new Error('Gagal memuat reviewer')
      return res.json() as Promise<PaginatedResponse<ReviewerOption>>
    },
  })

  const researches = researchesData?.data || []
  const services = servicesData?.data || []
  const reviewers = reviewersData?.data || []

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat review')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Review berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ReviewFormValues }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui review')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Review berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus review')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Review berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    form.reset({
      proposalType: 'research', researchId: null, serviceId: null,
      reviewerId: '', score: null, notes: '', status: 'waiting',
      reviewFileUrl: '', reviewedAt: null,
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: ReviewItem) => {
      setEditingItem(item)
      form.reset({
        proposalType: item.proposalType as 'research' | 'community_service',
        researchId: item.researchId || null,
        serviceId: item.serviceId || null,
        reviewerId: item.reviewerId,
        score: item.score ?? null,
        notes: item.notes || '',
        status: item.status as 'waiting' | 'reviewing' | 'revision' | 'accepted' | 'rejected',
        reviewFileUrl: item.reviewFileUrl || '',
        reviewedAt: item.reviewedAt ? new Date(item.reviewedAt).toISOString().slice(0, 16) : null,
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
    (values: ReviewFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: ReviewItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) deleteMutation.mutate(deletingItem.id)
  }, [deletingItem, deleteMutation])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const getProposalTitle = (item: ReviewItem) => {
    if (item.proposalType === 'research' && item.research) return item.research.title
    if (item.proposalType === 'community_service' && item.service) return item.service.title
    return '-'
  }

  // ============ RENDER ============

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Review Proposal</h2>
            <p className="text-sm text-muted-foreground">Kelola review proposal penelitian & pengabdian</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Review
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul proposal, reviewer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterProposalType}
          onValueChange={(val) => { setFilterProposalType(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Tipe Proposal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Tipe Proposal</SelectItem>
            {PROPOSAL_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(val) => { setFilterStatus(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Status</SelectItem>
            {PROPOSAL_REVIEW_STATUS_OPTIONS.map((opt) => (
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
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data review</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Review&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipe Proposal</TableHead>
                        <TableHead>Judul Proposal</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Direview</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {PROPOSAL_TYPE_LABELS[r.proposalType as keyof typeof PROPOSAL_TYPE_LABELS] || r.proposalType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {getProposalTitle(r)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.reviewer?.name || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.score !== null ? r.score : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={PROPOSAL_REVIEW_STATUS_COLORS[r.status as keyof typeof PROPOSAL_REVIEW_STATUS_COLORS] || ''}>
                              {PROPOSAL_REVIEW_STATUS_LABELS[r.status as keyof typeof PROPOSAL_REVIEW_STATUS_LABELS] || r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {r.reviewedAt ? formatDateTime(r.reviewedAt) : '-'}
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
            <DialogTitle>{editingItem ? 'Edit Review' : 'Tambah Review'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data review proposal.' : 'Masukkan data review proposal baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="review-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="proposalType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Proposal <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); form.setValue('researchId', null); form.setValue('serviceId', null) }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PROPOSAL_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {watchProposalType === 'research' ? (
                    <FormField control={form.control} name="researchId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penelitian</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih penelitian" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {researches.map((r) => (
                              <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ) : (
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pengabdian Masyarakat</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih pengabdian" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="reviewerId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviewer <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih reviewer" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {reviewers.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="score" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai (0-100)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0-100"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val === '' ? null : Number(val))
                          }}
                        />
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
                          {PROPOSAL_REVIEW_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="reviewedAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Review</FormLabel>
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
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan review..."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="reviewFileUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Review URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="review-form" disabled={isSubmitting}>
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
            <AlertDialogTitle>Hapus Review</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan.
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
