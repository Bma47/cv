import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'

const uploadRoot = process.env.CV_UPLOAD_DIR ?? path.join(process.cwd(), 'storage', 'uploads')
const fileTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const pathname = request.nextUrl.searchParams.get('pathname')
    const parts = pathname?.split('/') ?? []
    if (parts.length !== 2 || parts[0] !== user.id || !/^[0-9a-f-]+\.(jpg|png|webp)$/.test(parts[1])) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const filePath = path.resolve(uploadRoot, parts[0], parts[1])
    const userPath = `${path.resolve(uploadRoot, parts[0])}${path.sep}`
    if (!filePath.startsWith(userPath)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const file = await readFile(filePath)
    const etag = `"${createHash('sha256').update(file).digest('hex')}"`
    const headers = {
      'Content-Type': fileTypes[parts[1].split('.').pop() ?? ''] ?? 'application/octet-stream',
      ETag: etag,
      'Cache-Control': 'private, no-cache',
    }

    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers })
    }
    return new NextResponse(file, { headers })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error serving file:', error)
    }
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }
}
