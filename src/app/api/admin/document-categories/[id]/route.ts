import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.documentCategory.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat kategori dokumen' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const existing = await db.documentCategory.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const slugConflict = await db.documentCategory.findUnique({ where: { slug } })
    if (slugConflict && slugConflict.id !== id) {
      return NextResponse.json(
        { error: 'Kategori dokumen dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const category = await db.documentCategory.update({
      where: { id },
      data: { name: name.trim(), slug },
      include: { _count: { select: { documents: true } } },
    })

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui kategori dokumen' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.documentCategory.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Kategori dokumen tidak ditemukan' }, { status: 404 })
    }

    if (existing._count.documents > 0) {
      return NextResponse.json(
        { error: 'Kategori dokumen masih memiliki dokumen terkait. Hapus atau pindahkan dokumen terlebih dahulu.' },
        { status: 400 }
      )
    }

    await db.documentCategory.delete({ where: { id } })

    return NextResponse.json({ data: { id } })
  } catch (error) {
    console.error('[DOCUMENT_CATEGORY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus kategori dokumen' }, { status: 500 })
  }
}
