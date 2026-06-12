'use client'

import { useAdminPage } from '@/hooks/useAdminPage'
import { ViewOnlyBanner } from '@/components/admin/ViewOnlyBanner'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Search, Mail, Trash2, Eye, MailOpen, MailX, Filter } from 'lucide-react'
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
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { formatDateTime } from '@/lib/helpers'
import type { PaginatedResponse, ContactMessage } from '@/types'

// ============ API HELPERS ============

async function fetchMessages(page: number, pageSize: number, search: string, isReadFilter: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  if (isReadFilter && isReadFilter !== 'all') params.set('isRead', isReadFilter)
  const res = await fetch(`/api/admin/messages?${params}`)
  if (!res.ok) throw new Error('Gagal memuat pesan')
  return res.json() as Promise<PaginatedResponse<ContactMessage> & { unreadCount: number }>
}

async function markAsRead(id: string) {
  const res = await fetch(`/api/admin/messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead: true }),
  })
  if (!res.ok) throw new Error('Gagal menandai pesan')
  return res.json()
}

async function deleteMessage(id: string) {
  const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Gagal menghapus pesan')
  return res.json()
}

// ============ MAIN PAGE ============

export default function MessagesAdminPage() {
  const { isViewOnly, canWrite } = useAdminPage()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isReadFilter, setIsReadFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', page, pageSize, search, isReadFilter],
    queryFn: () => fetchMessages(page, pageSize, search, isReadFilter),
  })

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      toast.success('Pesan ditandai sudah dibaca')
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, isRead: true })
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      toast.success('Pesan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
      setDeleteId(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  function openMessage(msg: ContactMessage) {
    setSelectedMessage(msg)
    if (!msg.isRead) {
      markReadMutation.mutate(msg.id)
    }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pesan Kontak</h2>
            <p className="text-sm text-muted-foreground">
              {data?.unreadCount != null && data.unreadCount > 0
                ? `${data.unreadCount} pesan belum dibaca`
                : 'Semua pesan sudah dibaca'}
            </p>
          </div>
        </div>
        {data?.unreadCount != null && data.unreadCount > 0 && (
          <Badge variant="destructive" className="shrink-0 w-fit">
            {data.unreadCount} belum dibaca
          </Badge>
        )}
      </div>

      {isViewOnly && <ViewOnlyBanner />}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari pesan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select value={isReadFilter} onValueChange={(val) => { setIsReadFilter(val); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="false">Belum Dibaca</SelectItem>
            <SelectItem value="true">Sudah Dibaca</SelectItem>
          </SelectContent>
        </Select>
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
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="min-w-[150px]">Subjek</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada pesan
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((item) => (
                      <TableRow key={item.id} className={!item.isRead ? 'bg-muted/40' : ''}>
                        <TableCell className={`font-medium ${!item.isRead ? 'font-bold' : ''}`}>
                          {item.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {item.email}
                        </TableCell>
                        <TableCell className={`max-w-[200px] truncate ${!item.isRead ? 'font-semibold' : ''}`}>
                          {item.subject ?? '-'}
                        </TableCell>
                        <TableCell>
                          {item.isRead ? (
                            <Badge variant="outline" className="text-[10px]">
                              <MailOpen className="size-3 mr-1" /> Dibaca
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100">
                              <MailX className="size-3 mr-1" /> Baru
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Lihat Pesan" onClick={() => openMessage(item)}>
                              <Eye className="size-4" />
                            </Button>
                            {canWrite && !item.isRead && (
                              <Button variant="ghost" size="icon" title="Tandai Dibaca" onClick={() => markReadMutation.mutate(item.id)}>
                                <MailOpen className="size-4" />
                              </Button>
                            )}
                            {canWrite && (
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(item.id)}>
                                <Trash2 className="size-4" />
                              </Button>
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => { if (!open) setSelectedMessage(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                  <p className="font-medium">{selectedMessage.phone ?? '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{formatDateTime(selectedMessage.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjek</p>
                <p className="font-medium">{selectedMessage.subject ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pesan</p>
                <div className="mt-1 p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {canWrite && !selectedMessage.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markReadMutation.mutate(selectedMessage.id)}
                    disabled={markReadMutation.isPending}
                  >
                    <MailOpen className="size-4 mr-1" />
                    Tandai Dibaca
                  </Button>
                )}
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => { setDeleteId(selectedMessage.id); setSelectedMessage(null) }}
                  >
                    <Trash2 className="size-4 mr-1" /> Hapus
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.
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
