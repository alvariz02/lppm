'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  Users, Plus, Pencil, Trash2, Search, Loader2, Eye, ChevronDown, ChevronUp,
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
import { researcherSchema } from '@/lib/validations'
import { getStatusColor } from '@/lib/helpers'

// ============ TYPES ============

interface FacultyOption { id: string; name: string }
interface StudyProgramOption { id: string; name: string; facultyId: string }

interface ResearcherItem {
  id: string
  nidn: string | null
  nip: string | null
  name: string
  degree: string | null
  functionalPosition: string | null
  facultyId: string | null
  studyProgramId: string | null
  expertise: string | null
  email: string | null
  phone: string | null
  googleScholarUrl: string | null
  sintaId: string | null
  scopusId: string | null
  orcidId: string | null
  photoUrl: string | null
  isActive: boolean
  faculty: FacultyOption | null
  studyProgram: StudyProgramOption | null
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

type ResearcherFormValues = {
  name: string
  nidn: string | null
  nip: string | null
  degree: string | null
  functionalPosition: string | null
  facultyId: string | null
  studyProgramId: string | null
  expertise: string | null
  email: string | null
  phone: string | null
  googleScholarUrl: string | null
  sintaId: string | null
  scopusId: string | null
  orcidId: string | null
  photoUrl: string | null
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

export default function AdminResearchersPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterFacultyId, setFilterFacultyId] = useState('')
  const [filterIsActive, setFilterIsActive] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResearcherItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ResearcherItem | null>(null)
  const [viewingItem, setViewingItem] = useState<ResearcherItem | null>(null)
  const [showMoreFields, setShowMoreFields] = useState(false)

  // ============ FORM ============

  const form = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
    defaultValues: {
      name: '',
      nidn: '',
      nip: '',
      degree: '',
      functionalPosition: '',
      facultyId: null,
      studyProgramId: null,
      expertise: '',
      email: '',
      phone: '',
      googleScholarUrl: '',
      sintaId: '',
      scopusId: '',
      orcidId: '',
      photoUrl: '',
      isActive: true,
    },
  })

  const watchFacultyId = form.watch('facultyId')

  // ============ QUERIES ============

  const { data, isLoading } = useQuery({
    queryKey: ['admin-researchers', search, page, pageSize, filterFacultyId, filterIsActive],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      })
      if (filterFacultyId) params.set('facultyId', filterFacultyId)
      if (filterIsActive) params.set('isActive', filterIsActive)
      const res = await fetch(`/api/admin/researchers?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json() as Promise<PaginatedResponse<ResearcherItem>>
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

  const faculties = facultiesData?.data || []
  const studyPrograms = studyProgramsData?.data || []

  // Reset studyProgramId when facultyId changes
  useEffect(() => {
    form.setValue('studyProgramId', null)
  }, [watchFacultyId, form])

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (values: ResearcherFormValues) => {
      const res = await fetch('/api/admin/researchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal membuat peneliti')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Peneliti berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ResearcherFormValues }) => {
      const res = await fetch(`/api/admin/researchers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal memperbarui peneliti')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Peneliti berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] })
      closeForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/researchers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus peneliti')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Peneliti berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] })
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
      name: '', nidn: '', nip: '', degree: '', functionalPosition: '',
      facultyId: null, studyProgramId: null, expertise: '', email: '',
      phone: '', googleScholarUrl: '', sintaId: '', scopusId: '',
      orcidId: '', photoUrl: '', isActive: true,
    })
    setFormOpen(true)
  }, [form])

  const openEditForm = useCallback(
    (item: ResearcherItem) => {
      setEditingItem(item)
      setShowMoreFields(false)
      form.reset({
        name: item.name,
        nidn: item.nidn || '',
        nip: item.nip || '',
        degree: item.degree || '',
        functionalPosition: item.functionalPosition || '',
        facultyId: item.facultyId || null,
        studyProgramId: item.studyProgramId || null,
        expertise: item.expertise || '',
        email: item.email || '',
        phone: item.phone || '',
        googleScholarUrl: item.googleScholarUrl || '',
        sintaId: item.sintaId || '',
        scopusId: item.scopusId || '',
        orcidId: item.orcidId || '',
        photoUrl: item.photoUrl || '',
        isActive: item.isActive,
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
    (values: ResearcherFormValues) => {
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values })
      } else {
        createMutation.mutate(values)
      }
    },
    [editingItem, createMutation, updateMutation]
  )

  const openDeleteDialog = useCallback((item: ResearcherItem) => {
    setDeletingItem(item)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingItem) deleteMutation.mutate(deletingItem.id)
  }, [deletingItem, deleteMutation])

  const openViewDialog = useCallback(async (item: ResearcherItem) => {
    const res = await fetch(`/api/admin/researchers/${item.id}`)
    if (res.ok) {
      const result = await res.json()
      setViewingItem(result.data)
    } else {
      setViewingItem(item)
    }
    setViewOpen(true)
  }, [])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // ============ RENDER ============

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
      {/* Header */}
      <motion.div variants={animItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Dosen / Peneliti</h2>
            <p className="text-sm text-muted-foreground">Kelola data dosen dan peneliti</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openAddForm} size="sm">
            <Plus className="size-4 mr-1" />
            Tambah Peneliti
          </Button>
        )}
      </motion.div>

      {isViewOnly && <ViewOnlyBanner />}
      {/* Search & Filters */}
      <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIDN, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterFacultyId}
          onValueChange={(val) => { setFilterFacultyId(val === '__all__' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Fakultas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Fakultas</SelectItem>
            {faculties.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
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
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : !data?.data.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="size-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data peneliti</p>
                <p className="text-sm mt-1">Klik tombol &ldquo;Tambah Peneliti&rdquo; untuk menambahkan</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIDN</TableHead>
                        <TableHead>Fakultas</TableHead>
                        <TableHead>Program Studi</TableHead>
                        <TableHead>Keahlian</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-muted-foreground">{r.nidn || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.faculty?.name || '-'}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.studyProgram?.name || '-'}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-muted-foreground">
                            {r.expertise || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(r.isActive ? 'active' : 'inactive')}>
                              {r.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="size-8" onClick={() => openViewDialog(r)}>
                                <Eye className="size-3.5" />
                              </Button>
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
            <DialogTitle>{editingItem ? 'Edit Peneliti' : 'Tambah Peneliti'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui data peneliti.' : 'Masukkan data peneliti baru.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-1">
            <Form {...form}>
              <form id="researcher-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
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
                  <FormField control={form.control} name="degree" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gelar</FormLabel>
                      <FormControl><Input placeholder="S.Kom, M.T., dll" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
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
                  <FormField control={form.control} name="functionalPosition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan Fungsional</FormLabel>
                      <FormControl><Input placeholder="Lektor, Lektor Kepala, dll" {...field} value={field.value || ''} /></FormControl>
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
                </div>

                {/* Toggle more fields */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowMoreFields(!showMoreFields)}
                >
                  {showMoreFields ? <ChevronUp className="size-4 mr-1" /> : <ChevronDown className="size-4 mr-1" />}
                  {showMoreFields ? 'Sembunyikan field lainnya' : 'Tampilkan field lainnya'}
                </Button>

                {showMoreFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="googleScholarUrl" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Google Scholar URL</FormLabel>
                        <FormControl><Input placeholder="https://scholar.google.com/..." {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sintaId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>SINTA ID</FormLabel>
                        <FormControl><Input placeholder="SINTA ID" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="scopusId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scopus ID</FormLabel>
                        <FormControl><Input placeholder="Scopus ID" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="orcidId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ORCID ID</FormLabel>
                        <FormControl><Input placeholder="ORCID ID" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="photoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto URL</FormLabel>
                        <FormControl><Input placeholder="URL foto" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

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
            <Button type="submit" form="researcher-form" disabled={isSubmitting}>
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
            <DialogTitle>Detail Peneliti</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nama:</span> <span className="font-medium ml-1">{viewingItem.name}</span></div>
                <div><span className="text-muted-foreground">NIDN:</span> <span className="ml-1">{viewingItem.nidn || '-'}</span></div>
                <div><span className="text-muted-foreground">NIP:</span> <span className="ml-1">{viewingItem.nip || '-'}</span></div>
                <div><span className="text-muted-foreground">Gelar:</span> <span className="ml-1">{viewingItem.degree || '-'}</span></div>
                <div><span className="text-muted-foreground">Fakultas:</span> <span className="ml-1">{viewingItem.faculty?.name || '-'}</span></div>
                <div><span className="text-muted-foreground">Prodi:</span> <span className="ml-1">{viewingItem.studyProgram?.name || '-'}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="ml-1">{viewingItem.email || '-'}</span></div>
                <div><span className="text-muted-foreground">Telepon:</span> <span className="ml-1">{viewingItem.phone || '-'}</span></div>
                <div><span className="text-muted-foreground">Keahlian:</span> <span className="ml-1">{viewingItem.expertise || '-'}</span></div>
                <div><span className="text-muted-foreground">Jabatan:</span> <span className="ml-1">{(viewingItem as ResearcherItem).functionalPosition || '-'}</span></div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge className={getStatusColor(viewingItem.isActive ? 'active' : 'inactive')}>
                    {viewingItem.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                {viewingItem.googleScholarUrl && (
                  <div className="col-span-2"><span className="text-muted-foreground">Google Scholar:</span> <a href={viewingItem.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary underline text-xs">{viewingItem.googleScholarUrl}</a></div>
                )}
                {viewingItem.sintaId && <div><span className="text-muted-foreground">SINTA:</span> <span className="ml-1">{viewingItem.sintaId}</span></div>}
                {viewingItem.scopusId && <div><span className="text-muted-foreground">Scopus:</span> <span className="ml-1">{viewingItem.scopusId}</span></div>}
                {viewingItem.orcidId && <div><span className="text-muted-foreground">ORCID:</span> <span className="ml-1">{viewingItem.orcidId}</span></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Peneliti</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus peneliti &ldquo;{deletingItem?.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
