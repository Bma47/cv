import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    const result = await query<{ id: string; email: string; password_hash: string }>(
      `SELECT id, email, password_hash
       FROM app_users
       WHERE lower(email) = ?
       LIMIT 1`,
      [email],
    )
    const user = result.rows[0]

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const session = await createSession(user.id)
    const response = NextResponse.json({ user: { id: user.id, email: user.email } })
    response.cookies.set(SESSION_COOKIE, session.token, {
      ...sessionCookieOptions,
      expires: session.expiresAt,
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Could not log in' }, { status: 500 })
  }
}
