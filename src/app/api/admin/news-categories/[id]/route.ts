import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.newsCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { news: true } },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('[NEWS_CATEGORY_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data kategori berita' }, { status: 500 })
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

    const existing = await db.newsCategory.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    const slug = generateSlug(name.trim())

    // Check slug uniqueness (exclude self)
    const slugConflict = await db.newsCategory.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugConflict) {
      return NextResponse.json(
        { error: 'Kategori berita dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const category = await db.newsCategory.update({
      where: { id },
      data: { name: name.trim(), slug },
      include: { _count: { select: { news: true } } },
    })

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('[NEWS_CATEGORY_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui kategori berita' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.newsCategory.findUnique({
      where: { id },
      include: { _count: { select: { news: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Kategori berita tidak ditemukan' }, { status: 404 })
    }

    // Check if any news uses this category
    if (existing._count.news > 0) {
      return NextResponse.json(
        { error: `Kategori ini masih digunakan oleh ${existing._count.news} berita. Hapus atau pindahkan berita terlebih dahulu.` },
        { status: 400 }
      )
    }

    await db.newsCategory.delete({ where: { id } })

    return NextResponse.json({ message: 'Kategori berita berhasil dihapus' })
  } catch (error) {
    console.error('[NEWS_CATEGORY_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus kategori berita' }, { status: 500 })
  }
}
