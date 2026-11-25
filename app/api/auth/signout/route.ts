import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await query('DELETE FROM app_sessions WHERE token_hash = ?', [hashSessionToken(token)])
  }

  const response = NextResponse.redirect(new URL('/auth/login', request.url), 303)
  response.cookies.delete(SESSION_COOKIE)
  return response
}
