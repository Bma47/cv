import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'

const uploadRoot = process.env.CV_UPLOAD_DIR ?? path.join(process.cwd(), 'storage', 'uploads')
const fileTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'لم يتم تقديم ملف' }, { status: 400 })
    }

    const extension = fileTypes[file.type]
    if (!extension) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' }, { status: 400 })
    }

    const userDirectory = path.join(uploadRoot, user.id)
    const filename = `${randomUUID()}.${extension}`
    await mkdir(userDirectory, { recursive: true })
    await writeFile(path.join(userDirectory, filename), Buffer.from(await file.arrayBuffer()), { flag: 'wx' })

    return NextResponse.json({ pathname: `${user.id}/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'فشل في رفع الملف' }, { status: 500 })
  }
}
