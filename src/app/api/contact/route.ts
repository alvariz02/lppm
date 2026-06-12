import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { contactMessageSchema } from '@/lib/validations'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = contactMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = validation.data

    const { data: contactMessage, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone ?? null,
        subject: subject ?? null,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('[API_CONTACT_POST]', error)
      return NextResponse.json(
        { error: 'Failed to submit contact message' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: mapContactMessage(contactMessage), message: 'Pesan berhasil dikirim' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API_CONTACT_POST]', error)
    return NextResponse.json(
      { error: 'Failed to submit contact message' },
      { status: 500 }
    )
  }
}
