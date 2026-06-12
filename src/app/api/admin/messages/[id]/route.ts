import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

function mapContactMessage(m: Record<string, unknown>) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone ?? null,
    subject: m.subject ?? null,
    message: m.message,
    isRead: m.is_read ?? false,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: message, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: mapContactMessage(message) })
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

    const { data: existing } = await supabase
      .from('contact_messages')
      .select('id, is_read')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    const { data: message, error } = await supabase
      .from('contact_messages')
      .update({
        is_read: body.isRead ?? existing.is_read,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API_ADMIN_MESSAGES_PUT]', error)
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: mapContactMessage(message) })
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

    const { data: existing } = await supabase
      .from('contact_messages')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase.from('contact_messages').delete().eq('id', id)

    if (error) {
      console.error('[API_ADMIN_MESSAGES_DELETE]', error)
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Message deleted' })
  } catch (error) {
    console.error('[API_ADMIN_MESSAGES_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
