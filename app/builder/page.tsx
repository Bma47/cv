import { CVBuilder } from '@/components/cv-builder/client'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const params = await searchParams

  const language = params.lang === 'en' ? 'en' : 'ar'

  if (!(await getCurrentUser())) {
    redirect(`/auth/login?lang=${language}`)
  }

  return <CVBuilder language={language} />
}
