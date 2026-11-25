import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getCurrentUser } from '@/lib/auth/session'
import { query } from '@/lib/db'
import { DEFAULT_CV_DATA, DEFAULT_THEME_SETTINGS } from '@/lib/types/cv'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const result = await query(
      `SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC`,
      [user.id],
    )
    return NextResponse.json({ cvs: result.rows })
  } catch (error) {
    console.error('Error fetching CVs:', error)
    return NextResponse.json({ error: 'فشل في جلب السير الذاتية' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await request.json()
    const language = body.language === 'en' ? 'en' : 'ar'
    const template = body.template === 'minimal' ? 'minimal' : 'modern'
    const id = randomUUID()
    await query(
      `INSERT INTO cvs
        (id, user_id, title, language, template, data, theme_settings, photo_url, background_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.id,
        typeof body.title === 'string' && body.title.trim() ? body.title.trim() : language === 'en' ? 'My Resume' : 'سيرتي الذاتية',
        language,
        template,
        JSON.stringify(body.data ?? DEFAULT_CV_DATA),
        JSON.stringify(body.theme_settings ?? DEFAULT_THEME_SETTINGS),
        body.photo_url ?? null,
        body.background_url ?? null,
      ],
    )

    const result = await query('SELECT * FROM cvs WHERE id = ? AND user_id = ? LIMIT 1', [id, user.id])

    return NextResponse.json({ cv: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating CV:', error)
    return NextResponse.json({ error: 'فشل في إنشاء السيرة الذاتية' }, { status: 500 })
  }
}
