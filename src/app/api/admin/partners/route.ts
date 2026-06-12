import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { partnerSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)))
    )
    const search = searchParams.get('search') || ''
    const partnerType = searchParams.get('partnerType') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { cooperationType: { contains: search } },
      ]
    }
    if (partnerType) {
      where.partnerType = partnerType
    }
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      db.partner.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.partner.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[PARTNERS_GET]', error)
    return NextResponse.json({ error: 'Gagal memuat data mitra' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = partnerSchema.safeParse(body)

    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const data = validation.data

    // Generate unique slug
    let slug = generateSlug(data.name)
    const existing = await db.partner.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const partner = await db.partner.create({
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

    return NextResponse.json({ data: partner }, { status: 201 })
  } catch (error) {
    console.error('[PARTNERS_POST]', error)
    return NextResponse.json({ error: 'Gagal membuat mitra' }, { status: 500 })
  }
}
