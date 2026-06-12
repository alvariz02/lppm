'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  FlaskConical, Plus, Pencil, Trash2, Search, Loader2, Eye, ChevronDown, ChevronUp, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { researchSchema } from '@/lib/validations'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from '@/lib/constants'
import { getStatusColor, formatCurrency, truncateText } from '@/lib/helpers'

// ============ TYPES ============

interface FacultyOption { id: string; name: string }
interface StudyProgramOption { id: string; name: string; facultyId: string }
interface ResearcherOption { id: string; name: string }
interface FundingSchemeOption { id: string; name: string; year: number }

interface ResearchItem {
  id: string
  title: string
  slug: string
  abstract: string | null
  year: number
  fundingSchemeId: string | null
  leaderId: string | null
  facultyId: string | null
  studyProgramId: string | null
  fundingSource: string | null
  budget: number | null
  startDate: string | null
  endDate: string | null
  status: string
  outputs: string | null
  mainImageUrl: string | null
  documentUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  leader: ResearcherOption | null
  faculty: FacultyOption | null
  studyProgram: StudyProgramOption | null
  fundingScheme: FundingSchemeOption | null
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

type ResearchFormValues = {
  title: string
  abstract: string | null
  year: number
  fundingSchemeId: string | null
  leaderId: string | null
  facultyId: string | null
  studyProgramId: string | null
  fundingSource: string | null
  budget: number | null
  startDate: string | null
  endDate: string | null
  status: string
  outputs: string | null
  mainImageUrl: string | null
  documentUrl: string | null
  isFeatured: boolean
  isPublished: boolean
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

export default function AdminResearchPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterYear, setFilterYear] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFacultyId, setFilterFacultyId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResearchItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ResearchItem | null>(null)
  const [viewingItem, setViewingItem] = useState<ResearchItem | null>(null)
  const [showMoreFields, setShowMoreFields] = useState(false)

  // ============ FORM ============

  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      title: '',
      abstract: '',
      year: new Date().getFullYear(),
      fundingSchemeId: null,
      leaderId: null,
      facultyId: null,
      studyProgramId: null,
      fundingSource: '',
      budget: null,
      startDate: '',
      endDate: '',
      status: 'draft',
      outputs: '',
      mainImageUrl: '',
      documentUrl: '',
      isFeatured: false,
      isPublished: true,
    },
  })

  const watchFacultyId = form.watch('facultyId')

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-research', search, page, pageSize, filterYear, filterStatus, filterFacultyId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterYear) params.set('year', filterYear)
      if (filterStatus) params.set('status', filterStatus)
      if (filterFacultyId) params.set('facultyId', filterFacultyId)
      const res = await fetch(`/api/admin/research?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<ResearchItem>>
    },
  })

  const { data: facultiesData } = useQuery({
    queryKey: ['admin-faculties-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/faculties?pageSize=100')
      if (!res.ok) throw new Error('Gagal memuat fakultas')
      return res.json() as Promise<PaginatedResponse<FacultyOption>>
    },
  })

  const { data: studyProgramsData } = useQuery({
    queryKey: ['admin-study-programs-all', watchFacultyId],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: '100' })
      if (watchFacultyId) params.set('facultyId', watchFacultyId)
      const res = await fetch(`/api/admin/study-programs?${params}`)
      if (!res.ok) throw new Error('Gagal memuat prodi')
      return res.json() as Promise<PaginatedResponse<StudyProgramOption>>
    },
  })

  const { data: researchersData } = useQuery({
    queryKey: ['admin-researchers-all'],
    queryFn: async () => {
      const res = await fetch('/api/admin/researchers?pageSize=500&isActive=true')
      if (!res.ok) throw new Error('Gagal memuat peneliti')
      return res.json() as Promise<PaginatedResponse<ResearcherOption>>
    },
  })

  const faculties = facultiesData?.data || []
  const studyPrograms = studyProgramsData?.data || []
  const researchers = researchersData?.data || []

  // Reset studyProgramId when facultyId changes
  useEffect(() => {
    form.setValue('studyProgramId', null)
  }, [watchFacultyId, form])

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: ResearchFormValues) => {
      const res = await fetch('/api/admin/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat penelitian')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Penelitian berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-research'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ResearchFormValues }) => {
      const res = await fetch(`/api/admin/research/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui penelitian')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Penelitian berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-research'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/research/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus penelitian')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Penelitian berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-research'] })
      setDeleteOpen(false)
      setDeletingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // ============ HANDLERS ============

  const openAddForm = useCallback(() => {
    setEditingItem(null)
    setShowMoreFields(false)
    form.reset({
      title: '', abstract: '', year: new Date().getFullYear(),
      fundingSchemeId: null, leaderId: null, facultyId: null, studyProgramId: null,
      fundingSource: '', budget: null, startDate: '', endDate: '',
      status: 'draft', outputs: '', mainImageUrl: '', documentUrl: '',
      isFeatured: false, isPublished: true,
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: ResearchItem) => {
      setEditingItem(item)
      setShowMoreFields(false)
      form.reset({
        title: item.title,
        abstract: item.abstract || '',
        year: item.year,
        fundingSchemeId: item.fundingSchemeId || null,
        leaderId: item.leaderId || null,
        facultyId: item.facultyId || null,
        studyProgramId: item.studyProgramId || null,
        fundingSource: item.fundingSource || '',
        budget: item.budget || null,
        startDate: item.startDate ? item.startDate.split('T')[0] : '',
        endDate: item.endDate ? item.endDate.split('T')[0] : '',
        status: item.status,
        outputs: item.outputs || '',
        mainImageUrl: item.mainImageUrl || '',
        documentUrl: item.documentUrl || '',
        isFeatured: item.isFeatured,
        isPublished: item.isPublished,
      })
      setFormOpen(true)
    },
    [form]
  )

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingItem(null)
    setShowMoreFields(false)
  }, [])

  const onSubmit = useCallback(
    (values: ResearchFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: ResearchItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) deleteMutation.mutate(deletingItem.id)
  }, [deletingItem, deleteMutation])

  const openViewDialog = useCallback(async (item: ResearchItem) => {
    const res = await fetch(`/api/admin/research/${item.id}`)
    if (res.ok) {
      const result = await res.json()
      setViewingItem(result.data)
    } else {
      setViewingItem(item)
    }
    setViewOpen(true)
  }, [])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear - i)

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FlaskConical className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Penelitian</h2>
            <p className="text-sm text-muted-foreground">Kelola data penelitian</p>
          </div>
        </div>
        <Button onClick={openAddForm} size="sm">
          <Plus className="size-4 mr-1" />
          Tambah Penelitian
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul penelitian..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select value={filterYear} onValueChange={(val) => { setFilterYear(val === '__all__' ? '' : val); setPage(1) }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Semua Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Tahun</SelectItem>
            {yearOptions.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val === '__all__' ? '' : val); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Status</SelectItem>
            {PROJECT_STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterFacultyId} onValueChange={(val) => { setFilterFacultyId(val === '__all__' ? '' : val); setPage(1) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Fakultas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Fakultas</SelectItem>
            {faculties.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
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
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data penelitian</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Penelitian&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Tahun</TableHead>
                        <TableHead>Ketua</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Unggulan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium max-w-[300px]">
                            {truncateText(r.title, 60)}
                          </TableCell>
                          <TableCell>{r.year}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.leader?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(r.status)}>
                              {PROJECT_STATUS_LABELS[r.status as keyof typeof PROJECT_STATUS_LABELS] || r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {r.isFeatured ? (
                              <Star className="size-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="size-8" onClick={() => openViewDialog(r)}>
                                <Eye className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditForm(r)}>
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(r)}>
                                <Trash2 className="size-3.5" />
                              </Button>
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Penelitian' : 'Tambah Penelitian'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data penelitian.' : 'Masukkan data penelitian baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="research-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Judul penelitian" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={String(field.value)}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {yearOptions.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PROJECT_STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="leaderId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ketua Peneliti</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih ketua" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {researchers.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="facultyId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fakultas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih fakultas" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {faculties.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="studyProgramId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Studi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih prodi" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {studyPrograms.map((sp) => (<SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="abstract" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abstrak</FormLabel>
                    <FormControl><Textarea placeholder="Abstrak penelitian" rows={3} {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fundingSource" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sumber Dana</FormLabel>
                      <FormControl><Input placeholder="Sumber pendanaan" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Toggle more fields */}
                <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setShowMoreFields(!showMoreFields)}>
                  {showMoreFields ? <ChevronUp className="size-4 mr-1" /> : <ChevronDown className="size-4 mr-1" />}
                  {showMoreFields ? 'Sembunyikan field lainnya' : 'Tampilkan field lainnya'}
                </Button>

                {showMoreFields && (
                  <div className="space-y-4">
                    <FormField control={form.control} name="fundingSchemeId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skema Pendanaan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih skema" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Tidak ada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="outputs" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output</FormLabel>
                        <FormControl><Textarea placeholder="Output penelitian" rows={2} {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mainImageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Gambar Utama</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="documentUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Dokumen</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel>Unggulan</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isPublished" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel>Dipublikasi</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>Batal</Button>
            <Button type="submit" form="research-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}
              {editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Penelitian</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 pr-2">
                <div>
                  <h3 className="font-semibold text-lg">{viewingItem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(viewingItem.status)}>
                      {PROJECT_STATUS_LABELS[viewingItem.status as keyof typeof PROJECT_STATUS_LABELS] || viewingItem.status}
                    </Badge>
                    {viewingItem.isFeatured && (
                      <Badge className="bg-amber-100 text-amber-800">
                        <Star className="size-3 mr-1" /> Unggulan
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Tahun:</span> <span className="font-medium ml-1">{viewingItem.year}</span></div>
                  <div><span className="text-muted-foreground">Ketua:</span> <span className="ml-1">{viewingItem.leader?.name || '-'}</span></div>
                  <div><span className="text-muted-foreground">Fakultas:</span> <span className="ml-1">{viewingItem.faculty?.name || '-'}</span></div>
                  <div><span className="text-muted-foreground">Prodi:</span> <span className="ml-1">{viewingItem.studyProgram?.name || '-'}</span></div>
                  <div><span className="text-muted-foreground">Sumber Dana:</span> <span className="ml-1">{viewingItem.fundingSource || '-'}</span></div>
                  <div><span className="text-muted-foreground">Anggaran:</span> <span className="ml-1">{viewingItem.budget ? formatCurrency(viewingItem.budget) : '-'}</span></div>
                </div>
                {viewingItem.abstract && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Abstrak:</span>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">{viewingItem.abstract}</p>
                  </div>
                )}
                {viewingItem.outputs && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Output:</span>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">{viewingItem.outputs}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penelitian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penelitian &ldquo;{deletingItem?.title ? truncateText(deletingItem.title, 50) : ''}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
