import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { fundingSchemeSchema } from '@/lib/validations'
import { generateSlug } from '@/lib/helpers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const funding = await db.fundingScheme.findUnique({ where: { id } })

    if (!funding) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: funding })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding scheme' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = fundingSchemeSchema.parse(body)

    const existing = await db.fundingScheme.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    const slug = generateSlug(validated.name)
    const slugConflict = await db.fundingScheme.findUnique({ where: { slug } })
    const finalSlug = slugConflict && slugConflict.id !== id ? `${slug}-${Date.now()}` : slug

    const funding = await db.fundingScheme.update({
      where: { id },
      data: {
        name: validated.name,
        slug: finalSlug,
        source: validated.source ?? null,
        year: validated.year,
        description: validated.description ?? null,
        requirements: validated.requirements ?? null,
        minBudget: validated.minBudget ?? null,
        maxBudget: validated.maxBudget ?? null,
        openDate: validated.openDate ? new Date(validated.openDate) : null,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        status: validated.status,
        guideFileUrl: validated.guideFileUrl ?? null,
        registrationUrl: validated.registrationUrl ?? null,
      },
    })

    return NextResponse.json({ success: true, data: funding })
  } catch (error: unknown) {
    console.error('[API_ADMIN_FUNDING_PUT]', error)
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { issues: unknown }).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update funding scheme' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.fundingScheme.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Funding scheme not found' },
        { status: 404 }
      )
    }

    await db.fundingScheme.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Funding scheme deleted' })
  } catch (error) {
    console.error('[API_ADMIN_FUNDING_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete funding scheme' },
      { status: 500 }
    )
  }
}
