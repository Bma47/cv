import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'

const scrypt = promisify(scryptCallback)
export const SESSION_COOKIE = 'cv_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export interface AppUser {
  id: string
  email: string
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltText, hashText] = encoded.split('$')
  if (algorithm !== 'scrypt' || !saltText || !hashText) return false

  try {
    const salt = Buffer.from(saltText, 'base64url')
    const expected = Buffer.from(hashText, 'base64url')
    const actual = (await scrypt(password, salt, expected.length)) as Buffer
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await query(
    `INSERT INTO app_sessions (token_hash, user_id, expires_at)
     VALUES (?, ?, ?)`,
    [hashSessionToken(token), userId, expiresAt],
  )

  return { token, expiresAt }
}

export async function getUserForSessionToken(token?: string | null): Promise<AppUser | null> {
  if (!token) return null

  const result = await query<AppUser>(
    `SELECT app_users.id, app_users.email
     FROM app_sessions
     JOIN app_users ON app_users.id = app_sessions.user_id
     WHERE app_sessions.token_hash = ?
       AND app_sessions.expires_at > now()
     LIMIT 1`,
    [hashSessionToken(token)],
  )

  return result.rows[0] ?? null
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  return getUserForSessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
}
