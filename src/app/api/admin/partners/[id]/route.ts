import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { partnerSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const partner = await db.partner.findUnique({ where: { id } })

    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: partner })
  } catch (error) {
    console.error('[PARTNER_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data mitra' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validation = partnerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const existing = await db.partner.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    const data = validation.data

    // Regenerate slug if name changed
    const slug = generateSlug(data.name)
    const slugConflict = await db.partner.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugConflict) {
      return NextResponse.json(
        { error: 'Mitra dengan nama tersebut sudah ada' },
        { status: 409 }
      )
    }

    const partner = await db.partner.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        partnerType: data.partnerType,
        address: data.address || null,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        cooperationType: data.cooperationType || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        logoUrl: data.logoUrl || null,
        documentUrl: data.documentUrl || null,
      },
    })

    return NextResponse.json({ data: partner })
  } catch (error) {
    console.error('[PARTNER_PUT]', error)
    return NextResponse.json({ error: 'Gagal memperbarui mitra' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.partner.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 })
    }

    await db.partner.delete({ where: { id } })

    return NextResponse.json({ message: 'Mitra berhasil dihapus' })
  } catch (error) {
    console.error('[PARTNER_DELETE]', error)
    return NextResponse.json({ error: 'Gagal menghapus mitra' }, { status: 500 })
  }
}
