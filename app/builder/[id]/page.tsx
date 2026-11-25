import { CVBuilder } from '@/components/cv-builder/client'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function EditCVPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const language = query.lang === 'en' ? 'en' : 'ar'

  if (!(await getCurrentUser())) {
    redirect(`/auth/login?lang=${language}`)
  }

  return <CVBuilder cvId={id} language={language} />
}
