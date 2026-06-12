import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactMessageSchema } from '@/lib/validations'

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

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        subject: subject ?? null,
        message,
      },
    })

    return NextResponse.json(
      { data: contactMessage, message: 'Pesan berhasil dikirim' },
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
