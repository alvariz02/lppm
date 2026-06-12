'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Users, ShieldCheck, KeyRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
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
import { Switch } from '@/components/ui/switch'
import { profileSchema, type ProfileInput } from '@/lib/validations'
import {
  USER_ROLE_OPTIONS,
  USER_ROLE_LABELS,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { formatDate } from '@/lib/helpers'
import type { PaginatedResponse, Profile } from '@/types'

// ============ ROLE BADGE COLORS ============

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  admin_lppm: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  editor: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  reviewer: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

// ============ API HELPERS ============

async function fetchUsers(page: number, pageSize: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  const res = await fetch(`/api/admin/users?${params}`)
  if (!res.ok) throw new Error('Gagal memuat data pengguna')
  return res.json() as Promise<PaginatedResponse<Profile>>
}

async function saveUser(data: ProfileInput & { id?: string }) {
  const isEdit = !!data.id
  const url = isEdit ? `/api/admin/users/${data.id}` : '/api/admin/users'
  const method = isEdit ? 'PUT' : 'POST'
  const { id: _id, ...payload } = data as ProfileInput & { id?: string }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menyimpan pengguna')
  }
  return res.json()
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menghapus pengguna')
  }
  return res.json()
}

// ============ MAIN PAGE ============

export default function UsersAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Profile | null>(null)

  // Simulate "current user" - in production this would come from auth
  const currentUserId = 'current-user-id'

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, pageSize, search],
    queryFn: () => fetchUsers(page, pageSize, search),
  })

  const saveMutation = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      toast.success(editingItem ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Pengguna berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      avatarUrl: '',
      role: 'editor',
      isActive: true,
    },
  })

  function openCreateDialog() {
    setEditingItem(null)
    form.reset({ email: '', password: 'admin123', fullName: '', avatarUrl: '', role: 'editor', isActive: true })
    setDialogOpen(true)
  }

  function openEditDialog(item: Profile) {
    setEditingItem(item)
    form.reset({
      email: item.email,
      password: '',
      fullName: item.fullName ?? '',
      avatarUrl: item.avatarUrl ?? '',
      role: item.role as ProfileInput['role'],
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  function onSubmit(values: ProfileInput) {
    saveMutation.mutate({ ...values, id: editingItem?.id })
  }

  function isSelf(userId: string) {
    return userId === currentUserId
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pengguna</h2>
            <p className="text-sm text-muted-foreground">Kelola akun pengguna</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={openCreateDialog} className="shrink-0">
            <Plus className="size-4 mr-1" /> Tambah Pengguna
          </Button>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Cari pengguna..."
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
                    <TableHead className="min-w-[150px]">Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Aktif</TableHead>
                    <TableHead className="hidden md:table-cell">Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data pengguna
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.fullName ?? ''} className="size-8 rounded-full object-cover" />
                            ) : (
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {item.fullName?.charAt(0)?.toUpperCase() ?? item.email.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate max-w-[120px]">{item.fullName ?? '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${ROLE_COLORS[item.role] ?? ''}`}>
                            {USER_ROLE_LABELS[item.role as keyof typeof USER_ROLE_LABELS] || item.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.isActive ? (
                            <Badge variant="outline" className="text-[10px] text-green-700 border-green-300">Aktif</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-gray-500">Nonaktif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                  <Pencil className="size-4" />
                                </Button>
                                {!isSelf(item.id) && (
                                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(item.id)}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                )}
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

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingItem(null) } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nama Lengkap</Label>
                <Input {...form.register('fullName')} placeholder="Nama lengkap" />
              </div>

              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input {...form.register('email')} type="email" placeholder="email@example.com" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{editingItem ? 'Reset Password' : 'Password'}</Label>
                <div className="relative">
                  <Input
                    {...form.register('password')}
                    type="text"
                    placeholder={editingItem ? 'Kosongkan jika tidak ingin mengubah' : 'Password default: admin123'}
                  />
                  {editingItem && (
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  )}
                </div>
                {editingItem && (
                  <p className="text-[11px] text-muted-foreground">Kosongkan jika tidak ingin mengubah password</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select value={form.watch('role')} onValueChange={(val) => form.setValue('role', val as ProfileInput['role'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USER_ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>URL Avatar</Label>
                <Input {...form.register('avatarUrl')} placeholder="https://..." />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.watch('isActive')}
                  onCheckedChange={(val) => form.setValue('isActive', val)}
                />
                <Label>Aktif</Label>
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
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
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
