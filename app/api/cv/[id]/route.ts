import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { query } from '@/lib/db'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { id } = await params
    const result = await query(
      'SELECT * FROM cvs WHERE id = ? AND user_id = ? LIMIT 1',
      [id, user.id],
    )
    if (!result.rows[0]) {
      return NextResponse.json({ error: 'السيرة الذاتية غير موجودة' }, { status: 404 })
    }
    return NextResponse.json({ cv: result.rows[0] })
  } catch (error) {
    console.error('Error fetching CV:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const fields: Array<[string, unknown]> = []
    if (typeof body.title === 'string') fields.push(['title', body.title.trim()])
    if (body.language !== undefined) fields.push(['language', body.language === 'en' ? 'en' : 'ar'])
    if (body.template !== undefined) fields.push(['template', body.template === 'minimal' ? 'minimal' : 'modern'])
    if (body.data !== undefined) fields.push(['data', JSON.stringify(body.data)])
    if (body.theme_settings !== undefined) fields.push(['theme_settings', JSON.stringify(body.theme_settings)])
    if (body.photo_url !== undefined) fields.push(['photo_url', body.photo_url])
    if (body.background_url !== undefined) fields.push(['background_url', body.background_url])

    const columns: Record<string, string> = {
      title: 'title',
      language: 'language',
      template: 'template',
      data: 'data',
      theme_settings: 'theme_settings',
      photo_url: 'photo_url',
      background_url: 'background_url',
    }
    const values: unknown[] = []
    const assignments = fields.map(([key, value]) => {
      values.push(value)
      const placeholder = '?'
      const column = columns[key]
      return `${column} = ${placeholder}`
    })
    assignments.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id, user.id)

    await query(
      `UPDATE cvs SET ${assignments.join(', ')}
       WHERE id = ? AND user_id = ?`,
      values,
    )
    const result = await query('SELECT * FROM cvs WHERE id = ? AND user_id = ? LIMIT 1', [id, user.id])
    if (!result.rows[0]) {
      return NextResponse.json({ error: 'السيرة الذاتية غير موجودة' }, { status: 404 })
    }
    return NextResponse.json({ cv: result.rows[0] })
  } catch (error) {
    console.error('Error updating CV:', error)
    return NextResponse.json({ error: 'فشل في تحديث السيرة الذاتية' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { id } = await params
    const result = await query(
      'DELETE FROM cvs WHERE id = ? AND user_id = ?',
      [id, user.id],
    )
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'السيرة الذاتية غير موجودة' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting CV:', error)
    return NextResponse.json({ error: 'فشل في حذف السيرة الذاتية' }, { status: 500 })
  }
}
