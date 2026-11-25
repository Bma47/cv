import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { query } from '@/lib/db'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const { id } = await params
  await query('DELETE FROM cvs WHERE id = ? AND user_id = ?', [id, user.id])
  redirect('/dashboard')
}
