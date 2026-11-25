import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { query } from '@/lib/db'
import {
  createSession,
  hashPassword,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (password.length < 6 || password.length > 1024) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const id = randomUUID()
    try {
      await query(
        `INSERT INTO app_users (id, email, password_hash)
         VALUES (?, ?, ?)`,
        [id, email, passwordHash],
      )
    } catch (error) {
      const databaseCode = (error as { code?: string }).code
      if (databaseCode === 'ER_DUP_ENTRY' || databaseCode === '23505') {
        return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
      }
      throw error
    }

    const user = { id, email }

    const session = await createSession(user.id)
    const response = NextResponse.json({ user })
    response.cookies.set(SESSION_COOKIE, session.token, {
      ...sessionCookieOptions,
      expires: session.expiresAt,
    })
    return response
  } catch (error) {
    console.error('Sign-up error:', error)
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 })
  }
}
