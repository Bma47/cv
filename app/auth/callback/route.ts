import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const lang = requestUrl.searchParams.get('lang') === 'en' ? 'en' : 'ar'
  return NextResponse.redirect(new URL(`/auth/login?lang=${lang}`, requestUrl.origin))
}
