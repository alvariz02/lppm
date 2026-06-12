import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const message = await db.contactMessage.findUnique({ where: { id } })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: message })
  } catch (error) {
    console.error('[API_ADMIN_MESSAGES_GET_ID]', error)
    return NextResponse.json(
      { error: 'Failed to fetch message' },
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

    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    const message = await db.contactMessage.update({
      where: { id },
      data: {
        isRead: body.isRead ?? existing.isRead,
      },
    })

    return NextResponse.json({ success: true, data: message })
  } catch (error) {
    console.error('[API_ADMIN_MESSAGES_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
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

    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    await db.contactMessage.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Message deleted' })
  } catch (error) {
    console.error('[API_ADMIN_MESSAGES_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
